const TOTAL_QUESTIONS = 15;
const GENERAL_QUESTIONS_COUNT = 8;
const CLEAR_MATCH_THRESHOLD = 5;
const SUITABLE_THRESHOLD = 0;

let userScores = {};
let questionsAsked = new Set();
let totalAnswered = 0;
let lastAnsweredOption = null;
let quizContainer, progressBar, progressText, resultsSection, resultsContent;

document.addEventListener('DOMContentLoaded', () => {
    quizContainer = document.getElementById('quiz-container');
    progressBar = document.getElementById('progress-bar');
    progressText = document.getElementById('progress-text');
    resultsSection = document.getElementById('results-section');
    resultsContent = document.getElementById('results-content');

    if (!quizContainer || !progressBar || !progressText || !resultsSection || !resultsContent) {
        console.error("Quiz initialization failed: One or more required HTML elements are missing.");
        return;
    }

    if (typeof questionBank === 'undefined' || typeof petProfiles === 'undefined') {
        console.error("Quiz data is missing. Make sure 'quiz-data.js' is loaded before 'quiz.js'.");
        return;
    }

    setupMobileMenu();

    resetQuiz();
});

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuBtn.innerHTML = mobileMenu.classList.contains('hidden') ? '☰' : '✕';
        });
    }
}

function resetQuiz() {
    userScores = { dog: 0, cat: 0, smallAnimal: 0, reptile: 0 };
    questionsAsked = new Set();
    totalAnswered = 0;
    lastAnsweredOption = null;

    resultsSection.classList.add('hidden');
    resultsContent.innerHTML = '';
    document.getElementById('retake-quiz-btn')?.remove();
    document.getElementById('quiz-container').parentElement.style.display = 'block';

    renderNextQuestion();

    const progressBarSection = document.getElementById('progress-bar').parentElement.parentElement;
    window.scrollTo({
        top: progressBarSection.offsetTop - 72,
        behavior: 'smooth'
    });
}

function renderNextQuestion() {
    const progress = (totalAnswered / TOTAL_QUESTIONS) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Question ${totalAnswered + 1} of ${TOTAL_QUESTIONS}`;

    const nextQuestionId = findNextQuestionId();

    if (nextQuestionId) {
        renderQuestionById(nextQuestionId);
    } else {
        console.warn("Ran out of questions or could not determine next question. Showing results early.");
        showResults();
    }
}

function findNextQuestionId() {
    if (lastAnsweredOption && lastAnsweredOption.nextQuestion) {
        const nextId = lastAnsweredOption.nextQuestion;
        if (questionBank[nextId] && !questionsAsked.has(nextId)) {
            lastAnsweredOption = null;
            return nextId;
        } else {
             if (!questionBank[nextId]) console.warn(`Branch target question "${nextId}" not found.`);
             lastAnsweredOption = null;
        }
    }

    lastAnsweredOption = null;

    const coreQuestions = Object.keys(questionBank).filter(id =>
        questionBank[id].tags.includes('core') &&
        !questionBank[id].tags.includes('follow-up') &&
        !questionsAsked.has(id)
    );
    if (coreQuestions.length > 0) {
        return coreQuestions[0];
    }

    const generalAnsweredCount = Array.from(questionsAsked).filter(id =>
        questionBank[id].tags.includes('general') &&
        !questionBank[id].tags.includes('follow-up')
    ).length;

    if (generalAnsweredCount < GENERAL_QUESTIONS_COUNT) {
        const generalQuestions = Object.keys(questionBank).filter(id =>
            questionBank[id].tags.includes('general') &&
            !questionBank[id].tags.includes('follow-up') &&
            !questionsAsked.has(id)
        );
        if (generalQuestions.length > 0) {
            return generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
        }
    }

    let highestScore = -Infinity;
    let leadingPet = 'dog';
    for (const pet in userScores) {
        if (userScores[pet] > highestScore) {
            highestScore = userScores[pet];
            leadingPet = pet;
        }
    }

    const adaptiveQuestions = Object.keys(questionBank).filter(id =>
        questionBank[id].tags.includes('adaptive') &&
        questionBank[id].tags.includes(leadingPet) &&
        !questionBank[id].tags.includes('follow-up') &&
        !questionsAsked.has(id)
    );

    if (adaptiveQuestions.length > 0) {
        return adaptiveQuestions[Math.floor(Math.random() * adaptiveQuestions.length)];
    }

    const fallbackQuestions = Object.keys(questionBank).filter(id =>
        !questionBank[id].tags.includes('follow-up') &&
        !questionsAsked.has(id)
    );
    if (fallbackQuestions.length > 0) {
         console.log("Using fallback question selection.");
        return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    }

    return null;
}


function renderQuestionById(id) {
    quizContainer.innerHTML = '';
    const question = questionBank[id];

    if (!question) {
        console.error(`Question with ID "${id}" not found in questionBank.`);
        renderNextQuestion();
        return;
    }

    const questionTitle = document.createElement('h2');
    questionTitle.className = "text-2xl md:text-3xl font-bold text-brand-dark mb-10 text-center";
    questionTitle.textContent = question.text;
    quizContainer.appendChild(questionTitle);

    const optionsContainer = document.createElement('div');

    switch (question.type) {
        case 'yesNo':
            optionsContainer.className = "flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto";
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = "w-full sm:w-48 py-4 px-6 rounded-full text-lg font-semibold border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-200 transform hover:-translate-y-0.5";
                button.textContent = option.text;
                button.onclick = () => handleAnswer(id, option);
                optionsContainer.appendChild(button);
            });
            break;

        case 'multipleChoice':
            optionsContainer.className = "flex flex-col justify-center items-center gap-3 max-w-lg mx-auto";
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = "w-full text-left py-4 px-6 rounded-lg text-lg font-medium bg-white border-2 border-gray-200 text-brand-dark hover:border-brand-dark hover:bg-brand-accent transition-all duration-200 transform hover:scale-103";
                button.textContent = option.text;
                button.onclick = () => handleAnswer(id, option);
                optionsContainer.appendChild(button);
            });
            break;

        case 'aptitude':
            optionsContainer.className = "flex justify-between items-center max-w-lg mx-auto p-4";

            const disagreeLabel = document.createElement('span');
            disagreeLabel.className = "text-sm font-semibold text-red-600 hidden sm:block";
            disagreeLabel.textContent = "Strongly Disagree";

            question.options.forEach(option => {
                const ball = document.createElement('button');
                ball.className = `w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 cursor-pointer transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50`;

                const colors = [
                    { border: 'border-red-500', ring: 'focus:ring-red-300' },
                    { border: 'border-orange-500', ring: 'focus:ring-orange-300' },
                    { border: 'border-yellow-500', ring: 'focus:ring-yellow-300' },
                    { border: 'border-gray-400', ring: 'focus:ring-gray-300' },
                    { border: 'border-teal-400', ring: 'focus:ring-teal-300' },
                    { border: 'border-green-500', ring: 'focus:ring-green-300' },
                    { border: 'border-green-600', ring: 'focus:ring-green-400' }
                ];
                const colorIndex = (option.value + 3);
                ball.classList.add(colors[colorIndex].border, colors[colorIndex].ring);

                ball.onclick = () => handleAnswer(id, option);
                optionsContainer.appendChild(ball);
            });

            const agreeLabel = document.createElement('span');
            agreeLabel.className = "text-sm font-semibold text-green-600 hidden sm:block";
            agreeLabel.textContent = "Strongly Agree";

            const labelContainer = document.createElement('div');
            labelContainer.className = "flex justify-between max-w-lg mx-auto px-4 -mt-2 mb-4";
            labelContainer.appendChild(disagreeLabel);
            labelContainer.appendChild(agreeLabel);
            quizContainer.insertBefore(labelContainer, questionTitle.nextSibling);
            quizContainer.insertBefore(optionsContainer, labelContainer.nextSibling);
            break;
    }

    if (question.type !== 'aptitude') {
        quizContainer.appendChild(optionsContainer);
    }
}


function handleAnswer(id, option) {
    const score = option.score || {};
    const isDealBreaker = option.isDealBreaker || false;

    if (isDealBreaker) {
        showResults('nonsuitable');
        return;
    }

    questionsAsked.add(id);
    totalAnswered++;

    for (const pet in score) {
        if (userScores.hasOwnProperty(pet)) {
            userScores[pet] += score[pet];
        }
    }

    lastAnsweredOption = option;

    if (totalAnswered >= TOTAL_QUESTIONS) {
        showResults();
    } else {
        renderNextQuestion();
    }
}


function showResults(forcedResultKey = null) {
    document.getElementById('quiz-container').parentElement.style.display = 'none';
    progressBar.style.width = '100%';
    progressText.textContent = 'Results Calculated!';

    let finalResultKey = '';

    if (forcedResultKey) {
        finalResultKey = forcedResultKey;
    } else {
        let bestMatchKey = 'dog';
        let maxScore = -Infinity;

        for (const pet in userScores) {
            if (userScores[pet] > maxScore) {
                maxScore = userScores[pet];
                bestMatchKey = pet;
            }
        }

        if (maxScore < SUITABLE_THRESHOLD) {
            finalResultKey = 'nonsuitable';
        } else if (maxScore < CLEAR_MATCH_THRESHOLD) {
            finalResultKey = 'nomatch';
        } else {
            finalResultKey = bestMatchKey;
        }
    }

    const profile = petProfiles[finalResultKey];

    resultsContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
            <div class="md:w-1/2">
                <img src="${profile.image}" alt="${profile.title}" class="w-full h-64 md:h-full object-cover">
            </div>
            <div class="md:w-1/2 p-8 md:p-12">
                <h3 class="text-3xl font-bold text-brand-dark mb-4">${profile.title}!</h3>
                <p class="text-lg text-brand-text leading-relaxed">
                    ${profile.description}
                </p>
                <p class="text-md text-brand-text-light mt-6">
                    This is just a recommendation! Click the button below to find local shelters and see all types of animals that fit your criteria.
                </p>
            </div>
        </div>
    `;

    const buttonContainer = resultsSection.querySelector('.text-center.mt-12');
    if (buttonContainer && !document.getElementById('retake-quiz-btn')) {
        const retakeButton = document.createElement('a');
        retakeButton.href = "#";
        retakeButton.id = "retake-quiz-btn";
        retakeButton.textContent = "Retake Quiz";
        retakeButton.className = "bg-transparent hover:bg-brand-dark hover:text-white text-brand-dark border-2 border-brand-dark rounded-full py-4 px-8 text-lg font-semibold no-underline inline-flex items-center justify-center transition-transform hover:-translate-y-0.5 mt-4 sm:mt-0 sm:ml-4";

        retakeButton.addEventListener('click', (e) => {
            e.preventDefault();
            resetQuiz();
        });

        buttonContainer.appendChild(retakeButton);
    }

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}