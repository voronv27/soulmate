import sys
import re
import demjson3 
# Run `pip install demjson3` if not already installed
# Use python3.13

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QSplitter,
    QListWidget, QLineEdit, QTextEdit, QPushButton, QTableWidget, QTableWidgetItem,
    QComboBox, QCheckBox, QLabel, QFileDialog, QMessageBox, QInputDialog, QHeaderView
)
from PyQt6.QtCore import Qt, pyqtSignal

class ScoreEditorDelegate(QLineEdit):
    editingFinishedSignal = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)

    def focusOutEvent(self, event):
        self.editingFinishedSignal.emit()
        super().focusOutEvent(event)

class QuizEditor(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Soulmate Quiz Data Editor")
        self.setGeometry(100, 100, 1200, 700)

        self.quiz_data_path = None
        self.pet_profiles = {}
        self.question_bank = {}
        self.current_item_id = None
        self.current_item_type = None

        self.initUI()
        self.clear_editors()


    def initUI(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)

        top_bar_layout = QHBoxLayout()
        self.load_button = QPushButton("Load quiz-data.js")
        self.load_button.clicked.connect(self.load_file)
        self.save_button = QPushButton("Save quiz-data.js")
        self.save_button.clicked.connect(self.save_file)
        self.save_button.setEnabled(False)
        self.file_path_label = QLabel("No file loaded.")
        top_bar_layout.addWidget(self.load_button)
        top_bar_layout.addWidget(self.save_button)
        top_bar_layout.addWidget(self.file_path_label, 1)
        main_layout.addLayout(top_bar_layout)

        self.splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(self.splitter)

        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)

        left_layout.addWidget(QLabel("Pet Profiles"))
        self.profile_list = QListWidget()
        self.profile_list.currentItemChanged.connect(self.display_selected_profile)
        profile_buttons_layout = QHBoxLayout()
        add_profile_button = QPushButton("Add Profile")
        add_profile_button.clicked.connect(self.add_profile)
        del_profile_button = QPushButton("Delete Profile")
        del_profile_button.clicked.connect(self.delete_profile)
        profile_buttons_layout.addWidget(add_profile_button)
        profile_buttons_layout.addWidget(del_profile_button)
        left_layout.addWidget(self.profile_list)
        left_layout.addLayout(profile_buttons_layout)

        left_layout.addWidget(QLabel("Question Bank"))
        self.question_list = QListWidget()
        self.question_list.currentItemChanged.connect(self.display_selected_question)
        question_buttons_layout = QHBoxLayout()
        add_question_button = QPushButton("Add Question")
        add_question_button.clicked.connect(self.add_question)
        del_question_button = QPushButton("Delete Question")
        del_question_button.clicked.connect(self.delete_question)
        question_buttons_layout.addWidget(add_question_button)
        question_buttons_layout.addWidget(del_question_button)
        left_layout.addWidget(self.question_list)
        left_layout.addLayout(question_buttons_layout)

        self.splitter.addWidget(left_panel)

        right_panel = QWidget()
        self.editor_layout = QVBoxLayout(right_panel)
        self.splitter.addWidget(right_panel)

        self.placeholder_label = QLabel("Select an item from the left list to edit.")
        self.placeholder_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.editor_layout.addWidget(self.placeholder_label)

        self.profile_editor_widget = QWidget()
        profile_editor_layout = QVBoxLayout(self.profile_editor_widget)
        self.profile_id_label = QLabel("Profile ID: ")
        self.profile_title_input = QLineEdit()
        self.profile_image_input = QLineEdit()
        self.profile_desc_input = QTextEdit()
        self.profile_desc_input.setAcceptRichText(False)

        profile_editor_layout.addWidget(self.profile_id_label)
        profile_editor_layout.addWidget(QLabel("Title:"))
        profile_editor_layout.addWidget(self.profile_title_input)
        profile_editor_layout.addWidget(QLabel("Image URL:"))
        profile_editor_layout.addWidget(self.profile_image_input)
        profile_editor_layout.addWidget(QLabel("Description:"))
        profile_editor_layout.addWidget(self.profile_desc_input)
        self.profile_editor_widget.setVisible(False)
        self.editor_layout.addWidget(self.profile_editor_widget)

        self.profile_title_input.editingFinished.connect(self.save_current_item_from_editor)
        self.profile_image_input.editingFinished.connect(self.save_current_item_from_editor)
        self.profile_desc_input.textChanged.connect(self.save_current_item_from_editor)

        self.question_editor_widget = QWidget()
        question_editor_layout = QVBoxLayout(self.question_editor_widget)
        self.question_id_label = QLabel("Question ID: ")
        self.question_text_input = QTextEdit()
        self.question_text_input.setAcceptRichText(False)
        self.question_type_combo = QComboBox()
        self.question_type_combo.addItems(["yesNo", "multipleChoice", "aptitude"])
        self.question_tags_input = QLineEdit()
        self.options_table = QTableWidget()
        self.options_table.setColumnCount(5)
        self.options_table.setHorizontalHeaderLabels(["Text / Value", "Score (JSON)", "Next Question", "Deal Breaker", "Actions"])
        self.options_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        self.options_table.setColumnWidth(0, 150)
        self.options_table.setColumnWidth(2, 120)
        self.options_table.setColumnWidth(3, 100)
        self.options_table.setColumnWidth(4, 100)


        options_buttons_layout = QHBoxLayout()
        add_option_button = QPushButton("Add Option")
        add_option_button.clicked.connect(self.add_option)
        options_buttons_layout.addWidget(add_option_button)
        options_buttons_layout.addStretch()

        question_editor_layout.addWidget(self.question_id_label)
        question_editor_layout.addWidget(QLabel("Question Text:"))
        question_editor_layout.addWidget(self.question_text_input)
        question_editor_layout.addWidget(QLabel("Type:"))
        question_editor_layout.addWidget(self.question_type_combo)
        question_editor_layout.addWidget(QLabel("Tags (comma-separated):"))
        question_editor_layout.addWidget(self.question_tags_input)
        question_editor_layout.addWidget(QLabel("Options:"))
        question_editor_layout.addWidget(self.options_table)
        question_editor_layout.addLayout(options_buttons_layout)
        self.question_editor_widget.setVisible(False)
        self.editor_layout.addWidget(self.question_editor_widget)

        self.question_text_input.textChanged.connect(self.save_current_item_from_editor)
        self.question_type_combo.currentIndexChanged.connect(self.save_current_item_from_editor)
        self.question_tags_input.editingFinished.connect(self.save_current_item_from_editor)
        self.options_table.itemChanged.connect(self.handle_option_item_change)


        self.splitter.setSizes([300, 900])


    def load_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open quiz-data.js", "", "JavaScript Files (*.js)")
        if file_path:
            self.quiz_data_path = file_path
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.parse_js_data(content)
                self.populate_lists()
                self.save_button.setEnabled(True)
                self.file_path_label.setText(f"Editing: {self.quiz_data_path}")
                self.clear_editors()
                QMessageBox.information(self, "Success", "File loaded and parsed successfully.")
            except Exception as e:
                QMessageBox.critical(self, "Error Loading File", f"Could not load or parse file:\n{e}")
                self.quiz_data_path = None
                self.save_button.setEnabled(False)
                self.file_path_label.setText("Error loading file.")

    def save_file(self):
        if not self.quiz_data_path:
            QMessageBox.warning(self, "No File", "No file is loaded to save.")
            return

        self.save_current_item_from_editor()

        try:
            js_content = self.format_js_data()
            with open(self.quiz_data_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
            QMessageBox.information(self, "Success", "File saved successfully.")
        except Exception as e:
            QMessageBox.critical(self, "Error Saving File", f"Could not save file:\n{e}")

    def parse_js_data(self, content):
        profile_match = re.search(r'const\s+petProfiles\s*=\s*(\{.*?\});', content, re.DOTALL | re.MULTILINE)
        question_match = re.search(r'const\s+questionBank\s*=\s*(\{.*?\});', content, re.DOTALL | re.MULTILINE)

        if not profile_match or not question_match:
            raise ValueError("Could not find 'petProfiles' or 'questionBank' constants in the file.")

        try:
            self.pet_profiles = demjson3.decode(profile_match.group(1))
            self.question_bank = demjson3.decode(question_match.group(1))
        except demjson3.JSONDecodeError as e:
            raise ValueError(f"Error parsing JavaScript objects: {e}")

    def format_js_data(self):
        try:
            profiles_json = demjson3.encode(self.pet_profiles, indent=4)
            questions_json = demjson3.encode(self.question_bank, indent=4)

            profiles_json = re.sub(r'([{,]\s*)([a-zA-Z_]\w*)(\s*:)', r'\1"\2"\3', profiles_json)
            questions_json = re.sub(r'([{,]\s*)([a-zA-Z_]\w*)(\s*:)', r'\1"\2"\3', questions_json)

            output = f"const petProfiles = {profiles_json};\n\n"
            output += f"const questionBank = {questions_json};\n"
            return output
        except Exception as e:
            raise ValueError(f"Error formatting data back to JavaScript: {e}")


    def populate_lists(self):
        self.profile_list.clear()
        self.question_list.clear()
        self.profile_list.addItems(sorted(self.pet_profiles.keys()))
        self.question_list.addItems(sorted(self.question_bank.keys()))

    def display_selected_profile(self, current, previous):
        if previous:
             if self.current_item_id and self.current_item_type:
                 self.save_current_item_from_editor()

        if current:
            self.current_item_id = current.text()
            self.current_item_type = 'profile'
            self.question_list.setCurrentItem(None)
            self.load_profile_editor(self.current_item_id)
        else:
            if not self.question_list.currentItem():
                 self.clear_editors()
                 self.current_item_id = None
                 self.current_item_type = None

    def display_selected_question(self, current, previous):
        if previous:
             if self.current_item_id and self.current_item_type:
                self.save_current_item_from_editor()

        if current:
            self.current_item_id = current.text()
            self.current_item_type = 'question'
            self.profile_list.setCurrentItem(None)
            self.load_question_editor(self.current_item_id)
        else:
             if not self.profile_list.currentItem():
                 self.clear_editors()
                 self.current_item_id = None
                 self.current_item_type = None


    def clear_editors(self):
        self.placeholder_label.setVisible(True)
        self.profile_editor_widget.setVisible(False)
        self.question_editor_widget.setVisible(False)

    def show_profile_editor(self):
        self.placeholder_label.setVisible(False)
        self.profile_editor_widget.setVisible(True)
        self.question_editor_widget.setVisible(False)

    def show_question_editor(self):
        self.placeholder_label.setVisible(False)
        self.profile_editor_widget.setVisible(False)
        self.question_editor_widget.setVisible(True)

    def load_profile_editor(self, profile_id):
        if profile_id in self.pet_profiles:
            profile = self.pet_profiles[profile_id]
            self.profile_id_label.setText(f"Profile ID: {profile_id}")
            self.profile_title_input.blockSignals(True)
            self.profile_image_input.blockSignals(True)
            self.profile_desc_input.blockSignals(True)

            self.profile_title_input.setText(profile.get('title', ''))
            self.profile_image_input.setText(profile.get('image', ''))
            self.profile_desc_input.setPlainText(profile.get('description', ''))

            self.profile_title_input.blockSignals(False)
            self.profile_image_input.blockSignals(False)
            self.profile_desc_input.blockSignals(False)

            self.show_profile_editor()
        else:
            self.clear_editors()

    def load_question_editor(self, question_id):
        if question_id in self.question_bank:
            question = self.question_bank[question_id]
            self.question_id_label.setText(f"Question ID: {question_id}")

            self.question_text_input.blockSignals(True)
            self.question_type_combo.blockSignals(True)
            self.question_tags_input.blockSignals(True)
            self.options_table.blockSignals(True)

            self.question_text_input.setPlainText(question.get('text', ''))
            type_index = self.question_type_combo.findText(question.get('type', 'yesNo'))
            self.question_type_combo.setCurrentIndex(type_index if type_index >= 0 else 0)
            self.question_tags_input.setText(", ".join(question.get('tags', [])))

            self.options_table.setRowCount(0)
            options = question.get('options', [])
            self.options_table.setRowCount(len(options))
            for row, option in enumerate(options):
                text_or_val = str(option.get('text', option.get('value', '')))
                self.options_table.setItem(row, 0, QTableWidgetItem(text_or_val))

                score_str = demjson3.encode(option.get('score', {}))
                self.options_table.setItem(row, 1, QTableWidgetItem(score_str))

                self.options_table.setItem(row, 2, QTableWidgetItem(option.get('nextQuestion', '') or ''))

                checkbox_widget = QWidget()
                checkbox_layout = QHBoxLayout(checkbox_widget)
                checkbox = QCheckBox()
                checkbox.setChecked(option.get('isDealBreaker', False))
                checkbox_layout.addWidget(checkbox)
                checkbox_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
                checkbox_layout.setContentsMargins(0,0,0,0)
                checkbox_widget.setLayout(checkbox_layout)
                self.options_table.setCellWidget(row, 3, checkbox_widget)
                checkbox.stateChanged.connect(lambda state, r=row: self.handle_option_checkbox_change(r, state))


                delete_button = QPushButton("Delete")
                delete_button.clicked.connect(lambda checked=False, r=row: self.remove_option(r))
                self.options_table.setCellWidget(row, 4, delete_button)


            self.question_text_input.blockSignals(False)
            self.question_type_combo.blockSignals(False)
            self.question_tags_input.blockSignals(False)
            self.options_table.blockSignals(False)

            self.show_question_editor()
        else:
            self.clear_editors()

    def save_current_item_from_editor(self):
        if not self.current_item_id or not self.current_item_type:
            return

        try:
            if self.current_item_type == 'profile':
                if self.current_item_id in self.pet_profiles:
                    profile = self.pet_profiles[self.current_item_id]
                    profile['title'] = self.profile_title_input.text()
                    profile['image'] = self.profile_image_input.text()
                    profile['description'] = self.profile_desc_input.toPlainText()
            elif self.current_item_type == 'question':
                if self.current_item_id in self.question_bank:
                    question = self.question_bank[self.current_item_id]
                    question['text'] = self.question_text_input.toPlainText()
                    question['type'] = self.question_type_combo.currentText()
                    tags = [tag.strip() for tag in self.question_tags_input.text().split(',') if tag.strip()]
                    question['tags'] = tags
        except Exception as e:
            print(f"Error saving data for {self.current_item_id}: {e}")


    def add_profile(self):
        profile_id, ok = QInputDialog.getText(self, "Add Pet Profile", "Enter new profile ID (e.g., 'bird'):")
        if ok and profile_id:
            if profile_id in self.pet_profiles:
                QMessageBox.warning(self, "Duplicate ID", "A profile with this ID already exists.")
            else:
                self.pet_profiles[profile_id] = {"title": "New Profile", "image": "", "description": ""}
                self.populate_lists()
                items = self.profile_list.findItems(profile_id, Qt.MatchFlag.MatchExactly)
                if items:
                    self.profile_list.setCurrentItem(items[0])

    def delete_profile(self):
        current_item = self.profile_list.currentItem()
        if not current_item:
            QMessageBox.warning(self, "No Selection", "Please select a profile to delete.")
            return

        profile_id = current_item.text()
        reply = QMessageBox.question(self, "Confirm Delete", f"Are you sure you want to delete profile '{profile_id}'?",
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No, QMessageBox.StandardButton.No)

        if reply == QMessageBox.StandardButton.Yes:
            if profile_id in self.pet_profiles:
                del self.pet_profiles[profile_id]
                self.populate_lists()
                self.clear_editors()

    def add_question(self):
        question_id, ok = QInputDialog.getText(self, "Add Question", "Enter new question ID (e.g., 'q_new_question'):")
        if ok and question_id:
            if question_id in self.question_bank:
                QMessageBox.warning(self, "Duplicate ID", "A question with this ID already exists.")
            else:
                self.question_bank[question_id] = {
                    "text": "New question text...",
                    "type": "multipleChoice",
                    "tags": ["general"],
                    "options": []
                }
                self.populate_lists()
                items = self.question_list.findItems(question_id, Qt.MatchFlag.MatchExactly)
                if items:
                    self.question_list.setCurrentItem(items[0])


    def delete_question(self):
        current_item = self.question_list.currentItem()
        if not current_item:
            QMessageBox.warning(self, "No Selection", "Please select a question to delete.")
            return

        question_id = current_item.text()
        reply = QMessageBox.question(self, "Confirm Delete", f"Are you sure you want to delete question '{question_id}'?",
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No, QMessageBox.StandardButton.No)

        if reply == QMessageBox.StandardButton.Yes:
            references = []
            for qid, qdata in self.question_bank.items():
                for option in qdata.get('options', []):
                    if option.get('nextQuestion') == question_id:
                        references.append(f"'{qid}' option '{option.get('text', option.get('value', ''))}'")

            if references:
                ref_str = "\n - ".join(references)
                QMessageBox.warning(self, "Cannot Delete", f"Cannot delete '{question_id}' because it is referenced as 'nextQuestion' in:\n - {ref_str}\n\nPlease remove these references first.")
                return

            if question_id in self.question_bank:
                del self.question_bank[question_id]
                self.populate_lists()
                self.clear_editors()

    def add_option(self):
        if not self.current_item_id or self.current_item_type != 'question':
            return

        question = self.question_bank.get(self.current_item_id)
        if not question: return

        new_option = {"text": "New Option", "score": {}}
        if 'options' not in question:
            question['options'] = []
        question['options'].append(new_option)

        self.load_question_editor(self.current_item_id)
        self.options_table.scrollToBottom()


    def remove_option(self, row_index):
        if not self.current_item_id or self.current_item_type != 'question':
            return

        question = self.question_bank.get(self.current_item_id)
        if not question or 'options' not in question or row_index >= len(question['options']):
            return

        reply = QMessageBox.question(self, "Confirm Delete", f"Are you sure you want to delete option #{row_index + 1}?",
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No, QMessageBox.StandardButton.No)

        if reply == QMessageBox.StandardButton.Yes:
            del question['options'][row_index]
            self.load_question_editor(self.current_item_id)


    def handle_option_item_change(self, item):
        if not self.current_item_id or self.current_item_type != 'question':
            return

        question = self.question_bank.get(self.current_item_id)
        if not question or 'options' not in question:
            return

        row = item.row()
        col = item.column()

        if row >= len(question['options']): return

        option = question['options'][row]
        new_value = item.text()

        try:
            if col == 0:
                try:
                    num_val = int(new_value)
                    if 'text' in option: del option['text']
                    option['value'] = num_val
                except ValueError:
                    try:
                        num_val = float(new_value)
                        if 'text' in option: del option['text']
                        option['value'] = num_val
                    except ValueError:
                        if 'value' in option: del option['value']
                        option['text'] = new_value

            elif col == 1:
                try:
                    parsed_score = demjson3.decode(new_value)
                    if isinstance(parsed_score, dict):
                        option['score'] = parsed_score
                    else:
                        raise ValueError("Score must be a JSON object (e.g., {\"dog\": 1})")
                except Exception as e:
                    QMessageBox.warning(self, "Invalid Score Format", f"Error parsing score JSON for option #{row+1}:\n{e}\n\nPlease use valid JSON like {{ \"dog\": 1, \"cat\": -1 }}.")
                    item.setText(demjson3.encode(option.get('score', {})))


            elif col == 2:
                if new_value.strip():
                     option['nextQuestion'] = new_value.strip()
                elif 'nextQuestion' in option:
                    del option['nextQuestion']


        except Exception as e:
            print(f"Error updating option data: {e}")

    def handle_option_checkbox_change(self, row, state):
         if not self.current_item_id or self.current_item_type != 'question':
            return

         question = self.question_bank.get(self.current_item_id)
         if not question or 'options' not in question or row >= len(question['options']):
            return

         option = question['options'][row]
         is_checked = (state == Qt.CheckState.Checked.value)

         if is_checked:
             option['isDealBreaker'] = True
         elif 'isDealBreaker' in option:
             del option['isDealBreaker']


if __name__ == '__main__':
    app = QApplication(sys.argv)
    editor = QuizEditor()
    editor.show()
    sys.exit(app.exec())