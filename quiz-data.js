const petProfiles = {
    dog: {
        title: "Dog",
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=2070&auto.format&fit=crop",
        description: "You are an active person who desires companionship. A dog would be your loyal partner, perfect for walks, play, and becoming a loving member of the family. They require time for training and exercise, which you seem happy to provide!"
    },
    cat: {
        title: "Cat",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto.format&fit=crop",
        description: "Your lifestyle is more independent, or you value a quiet, low-maintenance companion. A cat offers incredible love and companionship while also respecting your space and time. They are purr-fectly suited for apartment living."
    },
    smallAnimal: {
        title: "Small Animal (Rabbit/Hamster)",
        image: "https://images.unsplash.com/photo-1584553421349-3557471bed79?q=80&w=2046&q=80&w=2070&auto.format&fit=crop",
        description: "You seem to prefer a gentler, contained companion or have limited space. A small animal like a rabbit, guinea pig, or hamster is a wonderful choice! They teach responsibility, are adorable to watch, and require less space than larger pets."
    },
    reptile: {
        title: "Reptile or Fish",
        image: "https://images.unsplash.com/photo-1605047632156-a30df37facab?q=80&w=1974&auto.format&fit=crop",
        description: "You are a quiet observer, or perhaps you have allergies or a strict housing situation. A fish or reptile (like a gecko or bearded dragon) is your best match! They are fascinating, low-allergen, and noise-free companions that are rewarding to care for."
    },
    // [NEW] Added Bird Profile
    bird: {
        title: "Bird (Parrot/Budgie/Cockatiel)",
        image: "https://images.unsplash.com/photo-1552728089-57bdde30beb8?q=80&w=2000&auto.format&fit=crop",
        description: "You appreciate intelligence, personality, and a bit of song! Birds are incredibly social, smart, and can form deep bonds. Whether it's a cheerful budgie or a long-lived parrot, they bring life and music to a home—provided you can handle the noise, the mess, and the lifelong commitment!"
    }
};

const questionBank = {
    // --- CORE QUESTIONS ---
    'q_housing': {
        text: "What is your housing situation regarding pets?",
        type: "multipleChoice",
        tags: ['core', 'home'],
        options: [
            // Bird added: usually easier to hide/negotiate than dogs, similar to small animals
            { text: "No pets are allowed at all", score: { dog: -10, cat: -10, smallAnimal: 2, reptile: 5, bird: -5 } },
            {
                text: "Some pets are allowed (with restrictions)",
                score: { dog: -2, cat: 1, smallAnimal: 2, reptile: 2, bird: 2 },
                nextQuestion: 'q_housing_restrictions'
            },
            { text: "All pets are welcome!", score: { dog: 2, cat: 1, smallAnimal: 1, reptile: 1, bird: 1 } }
        ]
    },
    'q_housing_restrictions': {
        text: "What kind of pet restrictions does your housing have?",
        type: "multipleChoice",
        tags: ['follow-up', 'home'],
        options: [
            { text: "Weight limits only", score: { dog: -1, cat: 1, bird: 1 } },
            { text: "Breed restrictions", score: { dog: -1, cat: 1, bird: 1 } },
            // Birds usually fall under "caged pets" allowance
            { text: "Only cats/small animals allowed", score: { dog: -10, cat: 2, smallAnimal: 2, bird: 2, reptile: 2 } },
            { text: "Unsure, I need to check", score: {} }
        ],
        nextQuestion: null
    },
    'q_allergies': {
        text: "Does anyone in your home have animal dander allergies?",
        type: "yesNo",
        tags: ['core', 'home'],
        options: [
            { text: "No", score: { dog: 1, cat: 1, smallAnimal: 1, bird: 1 } },
            // Birds produce "dust" which is bad for some allergies, but different from fur. 
            // We penalize slightly less than cat/dog, but reptile is still king here.
            { text: "Yes", score: { dog: -8, cat: -8, smallAnimal: -3, reptile: 8, bird: -4 } }
        ]
    },
     'dq_allergy_hh': {
        text: "Do you or anyone in your household have a known *severe* allergy to animal fur, dander, or saliva?",
        type: "yesNo",
        tags: ['core', 'home'],
        options: [
            { text: "No", score: {} },
            // Severe allergies usually rule out birds (feather dust)
            { text: "Yes", score: { dog: -10, cat: -10, smallAnimal: -5, reptile: 10, bird: -8 } }
        ]
    },
     'dq_housing_prohibit': {
        text: "Does your current living situation *explicitly prohibit* dogs and cats?",
        type: "yesNo",
        tags: ['core', 'home'],
        options: [
            { text: "No", score: {} },
            // Pushes small animals, reptiles, and birds
            { text: "Yes", score: { dog: -10, cat: -10, smallAnimal: 3, reptile: 5, bird: 3 } }
        ]
    },
    'dq_commitment_time': {
        text: "Are you concerned about committing to a pet for 10-15+ years?",
        type: "yesNo",
        tags: ['core', 'lifestyle'],
        options: [
            // Birds (especially parrots) live VERY long. This is a huge plus for bird lovers.
            { text: "No, I am prepared for a long-term commitment", score: { dog: 2, cat: 2, bird: 5 } },
            // If they want short term, Birds are a terrible idea.
            { text: "Yes, I prefer a shorter commitment", score: { dog: -5, cat: -3, smallAnimal: 4, reptile: 0, bird: -10 } }
        ]
    },
    'dq_commitment_cost': {
        text: "Are you worried about high veterinary expenses?",
        type: "yesNo",
        tags: ['core', 'cost'],
        options: [
            { text: "No, I am financially prepared", score: { dog: 1, cat: 1, bird: 1 } },
            // Avian vets are expensive specialists.
            { text: "Yes, keeping costs low is priority", score: { dog: -5, cat: -2, smallAnimal: 3, reptile: 2, bird: -3 } }
        ]
    },
    'dq_time_away': {
        text: "Will the pet be left alone for more than 10 hours a day regularly?",
        type: "yesNo",
        tags: ['core', 'lifestyle'],
        options: [
            { text: "No", score: { dog: 1, cat: 1, bird: 2 } },
            // Birds are social flock animals. Being alone all day is bad for them.
            { text: "Yes", score: { dog: -8, cat: 0, smallAnimal: 1, reptile: 5, bird: -8 } }
        ]
    },
     'dq_cleanliness': {
        text: "How much do you dislike pet hair, scattered seeds, or mess?",
        type: "yesNo",
        tags: ['core', 'lifestyle'],
        options: [
            { text: "I can handle it", score: { dog: 1, cat: 1, smallAnimal: 1, bird: 1 } },
            // Birds throw seeds and feathers everywhere.
            { text: "I strictly cannot tolerate mess", score: { dog: -5, cat: -5, smallAnimal: -2, reptile: 5, bird: -8 } }
        ]
    },
     'dq_patience': {
        text: "Do you have patience for training and potential behavioral issues?",
        type: "yesNo",
        tags: ['core', 'experience'],
        options: [
            // Birds are smart but can be stubborn/noisy. Need patience.
            { text: "Yes, I have patience", score: { dog: 3, cat: 1, bird: 4 } },
            { text: "No, I prefer an easy-going pet", score: { dog: -5, cat: 1, smallAnimal: 2, reptile: 2, bird: -4 } }
        ]
    },
    'dq_move_soon': {
        text: "Are you planning to move frequently in the near future?",
        type: "yesNo",
        tags: ['core', 'lifestyle'],
        options: [
            { text: "No", score: { dog: 1, cat: 1, bird: 1 } },
            // Moving with birds is stressful (drafts, temperature), but easier than big dogs.
            { text: "Yes", score: { dog: -3, cat: -2, smallAnimal: 1, reptile: 2, bird: 0 } }
        ]
    },
    'dq_motivation': {
        text: "Have you done research on pet ownership?",
        type: "yesNo",
        tags: ['core', 'experience'],
        options: [
            { text: "Yes, I've done my research", score: { dog: 1, cat: 1, smallAnimal: 1, reptile: 1, bird: 1 } },
            { text: "No, I'm just exploring the idea", score: { dog: -2, cat: 0, smallAnimal: 2, reptile: 2, bird: -2 } }
        ]
    },
    'dq_daily_care': {
        text: "Can you spend time *every day* on interactive care (walking/playing)?",
        type: "yesNo",
        tags: ['core', 'lifestyle'],
        options: [
            // Birds need daily social interaction out of cage.
            { text: "Yes, I am willing", score: { dog: 3, cat: 1, bird: 4 } },
            { text: "No, I prefer low interaction", score: { dog: -8, cat: -3, smallAnimal: 1, reptile: 5, bird: -8 } }
        ]
    },

    // --- [NEW] SPECIFIC BIRD CORE QUESTIONS ---
    'dq_bird_safety': {
        text: "Are you willing to stop using non-stick cookware (Teflon), candles, and air fresheners?",
        type: "yesNo",
        tags: ['core', 'home', 'bird'],
        options: [
            // Bird respiratory systems are extremely sensitive to these fumes.
            { text: "Yes, I can make those changes", score: { bird: 5 } },
            { text: "No, that's too difficult/I love my candles", score: { bird: -20, dog: 1, cat: 1, reptile: 1 } }
        ]
    },

    // --- GENERAL QUESTIONS ---

    'dq_mt_home_hours': {
        text: "How many hours a day are you typically *away* from home?",
        type: "multipleChoice",
        tags: ['general', 'lifestyle'],
        options: [
            { text: "Less than 4 hours", score: { dog: 2, cat: 1, smallAnimal: 0, reptile: 0, bird: 3 } },
            { text: "4–8 hours", score: { dog: 0, cat: 1, smallAnimal: 1, reptile: 1, bird: 0 } },
            { text: "More than 8 hours", score: { dog: -4, cat: 0, smallAnimal: 0, reptile: 1, bird: -4 } }
        ]
    },
    'dq_mt_travel': {
        text: "How often do you travel overnight?",
        type: "multipleChoice",
        tags: ['general', 'lifestyle'],
        options: [
            { text: "Rarely (once or twice a year)", score: { dog: 1, cat: 1, smallAnimal: 1, reptile: 1, bird: 1 } },
            { text: "Occasionally (every few months)", score: { dog: 0, cat: 0, smallAnimal: 0, reptile: 0, bird: -1 } },
            { text: "Frequently (monthly or more)", score: { dog: -3, cat: -2, smallAnimal: -1, reptile: 0, bird: -3 } }
        ]
    },
     'dq_mt_noise': {
        text: "What’s your daily noise tolerance?",
        type: "multipleChoice",
        tags: ['general', 'lifestyle'],
        options: [
            // Birds are noisy.
            { text: "I prefer quiet and calm surroundings", score: { dog: -3, cat: 1, smallAnimal: 2, reptile: 3, bird: -10 } },
            { text: "I don’t mind some noise or playful sounds", score: { dog: 1, cat: 1, smallAnimal: 0, reptile: 0, bird: 1 } },
            { text: "I enjoy lively, active environments", score: { dog: 2, cat: 0, smallAnimal: -1, reptile: -1, bird: 5 } }
        ]
    },
    'shunt_perfect_day': {
        text: "When you imagine a perfect day with a pet, what is the most central part?",
        type: "multipleChoice",
        tags: ['general', 'preference'],
        options: [
            { text: "Actively playing, training, or cuddling with my pet.", score: { dog: 2, cat: 2, smallAnimal: -1, reptile: -2, bird: 3 } },
            { text: "Watching my pet explore its environment or go about its routine.", score: { dog: -1, cat: 0, smallAnimal: 2, reptile: 2, bird: 1 } },
            { text: "Just having them nearby while I do my own thing.", score: { dog: 0, cat: 1, smallAnimal: 1, reptile: 1, bird: 1 } }
        ]
    },
    'shunt_role': {
        text: "What role do you see a pet playing in your household?",
        type: "multipleChoice",
        tags: ['general', 'preference'],
        options: [
            { text: "A family member needing lots of interaction and care.", score: { dog: 3, cat: 2, smallAnimal: 0, reptile: -1, bird: 3 } },
            { text: "An independent being that adds life and beauty to the home.", score: { dog: -2, cat: 0, smallAnimal: 2, reptile: 3, bird: -1 } },
            { text: "Somewhere in between.", score: { dog: 0, cat: 1, smallAnimal: 1, reptile: 1, bird: 2 } }
        ]
    },
     'shunt_stress_relief': {
        text: "When stressed, how would you prefer a pet to interact?",
        type: "multipleChoice",
        tags: ['general', 'preference'],
        options: [
            { text: "Actively seek physical comfort (cuddling, leaning).", score: { dog: 2, cat: 1, smallAnimal: -1, reptile: -2, bird: 1 } },
            { text: "Find peace by quietly watching them.", score: { dog: -1, cat: 1, smallAnimal: 2, reptile: 2, bird: 0 } },
            { text: "It depends on my mood.", score: { dog: 0, cat: 0, smallAnimal: 0, reptile: 0, bird: 1 } }
        ]
    },
    'shunt_home_env': {
        text: "How much are you willing to adapt your home environment for a pet?",
        type: "multipleChoice",
        tags: ['general', 'home'],
        options: [
            { text: "Happy to accept toys everywhere and occasional messes.", score: { dog: 2, cat: 1, smallAnimal: 0, reptile: -1, bird: 1 } },
            { text: "Prefer a pet that fits into a neat space with minimal disruption.", score: { dog: -2, cat: 0, smallAnimal: 2, reptile: 2, bird: -3 } },
            { text: "Willing to make some adjustments but prefer to keep things tidy.", score: { dog: 0, cat: 1, smallAnimal: 1, reptile: 1, bird: 0 } }
        ]
    },
    'shunt_accomplishment': {
        text: "What brings you a greater sense of accomplishment?",
        type: "multipleChoice",
        tags: ['general', 'preference'],
        options: [
            // Birds are highly trainable.
            { text: "Teaching a complex command and getting a direct response.", score: { dog: 3, cat: 1, smallAnimal: -1, reptile: -2, bird: 5 } },
            { text: "Creating a perfect, natural habitat where the pet thrives independently.", score: { dog: -2, cat: -1, smallAnimal: 2, reptile: 3, bird: 1 } },
            { text: "Simply providing good daily care.", score: { dog: 0, cat: 1, smallAnimal: 1, reptile: 1, bird: 1 } }
        ]
    },
     'shunt_communication': {
        text: "How do you prefer to communicate with a pet?",
        type: "multipleChoice",
        tags: ['general', 'preference'],
        options: [
            // Birds can mimic speech or whistle!
            { text: "Two-way exchange through sounds, eye contact, and touch.", score: { dog: 2, cat: 2, smallAnimal: -1, reptile: -2, bird: 4 } },
            { text: "Understanding needs through careful observation of behavior.", score: { dog: -1, cat: 0, smallAnimal: 2, reptile: 2, bird: -1 } },
            { text: "A mix of both.", score: { dog: 1, cat: 1, smallAnimal: 1, reptile: 1, bird: 2 } }
        ]
    },
    'shunt_time_energy': {
        text: "Describe the time/energy you'd commit daily:",
        type: "multipleChoice",
        tags: ['general', 'lifestyle'],
        options: [
            { text: "Interactive activities: walks, playtime, training.", score: { dog: 3, cat: 1, smallAnimal: -1, reptile: -2, bird: 2 } },
            { text: "Primarily feeding, cleaning, and environment maintenance.", score: { dog: -3, cat: 0, smallAnimal: 2, reptile: 3, bird: -1 } },
            { text: "A balance of basic care and some interaction.", score: { dog: 1, cat: 1, smallAnimal: 1, reptile: 1, bird: 1 } }
        ]
    },

    'q_experience': {
        text: "Have you had experience owning a pet before?",
        type: "yesNo",
        tags: ['general', 'experience'],
        options: [
            { text: "No", score: { dog: -1, cat: 0, smallAnimal: 1, bird: -1 } },
            { text: "Yes", score: { dog: 1, cat: 0, smallAnimal: 0, bird: 1 } }
        ]
    },
    'q_kids': {
        text: "Are there children under 10 in your home?",
        type: "yesNo",
        tags: ['general', 'home'],
        options: [
            { text: "No", score: { reptile: 1, bird: 1 } },
            // Birds can bite hard and are fragile. Not always great for small kids.
            { text: "Yes", score: { dog: 1, cat: 1, smallAnimal: -1, reptile: -2, bird: -2 } }
        ]
    },
    'q_space': {
        text: "What is your living space like?",
        type: "multipleChoice",
        tags: ['general', 'home'],
        options: [
            { text: "Apartment (no yard)", score: { dog: -2, cat: 2, smallAnimal: 2, reptile: 2, bird: 2 } },
            { text: "Townhouse (small yard)", score: { dog: 1, cat: 1, smallAnimal: 1, bird: 2 } },
            { text: "House (with yard)", score: { dog: 3, cat: 1, bird: 2 } }
        ]
    },
    'q_activity': {
        text: "How active would you like your ideal pet to be?",
        type: "multipleChoice",
        tags: ['general', 'lifestyle'],
        options: [
            { text: "Couch Companion (Low)", score: { dog: -3, cat: 2, smallAnimal: 1, reptile: 1, bird: 0 } },
            { text: "Likes a Walk (Medium)", score: { dog: 2, cat: 1, bird: 1 } },
            { text: "Running/Hiking Buddy (High)", score: { dog: 5, cat: -2, bird: -3 } }
        ]
    },
     'q_alone': {
        text: "How long will the pet be alone on an average weekday?",
        type: "multipleChoice",
        tags: ['general', 'lifestyle'],
         options: [
            { text: "I'm home most of the day", score: { dog: 2, cat: 1, bird: 3 } },
            { text: "A few hours (4-6)", score: { dog: 0, cat: 2, smallAnimal: 1, bird: 1 } },
            { text: "A full workday (8+ hours)", score: { dog: -4, cat: 2, smallAnimal: 0, reptile: 2, bird: -3 } }
        ]
    },
    'q_budget': {
        text: "What is your pet budget (food, toys, vet bills)?",
        type: "multipleChoice",
        tags: ['general', 'cost'],
        options: [
            { text: "Low ($)", score: { smallAnimal: 2, reptile: 1, cat: 0, dog: -2, bird: -1 } },
            { text: "Medium ($$)", score: { cat: 2, dog: 1, smallAnimal: 1, bird: 2 } },
            { text: "High ($$$)", score: { dog: 2, bird: 2 } }
        ]
    },
    'q_grooming': {
        text: "How much time are you willing to spend on grooming?",
        type: "multipleChoice",
        tags: ['general', 'lifestyle'],
        options: [
            { text: "Little to none", score: { dog: -2, cat: -1, smallAnimal: 1, reptile: 1, bird: 1 } },
            { text: "A few times a week", score: { dog: 1, cat: 1, bird: 1 } },
            { text: "No problem, I enjoy it!", score: { dog: 2, cat: 1, bird: 0 } }
        ]
    },

    // --- DECISIVE / ADAPTIVE ---
    'decisive_space': {
        text: "When relaxing at home, what kind of companionship do you prefer?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog', 'cat', 'bird'],
        options: [
            { text: "A quiet companion nearby, but enjoying your own space.", score: { cat: 2, dog: -1, bird: -1 } },
            { text: "An enthusiastic partner wanting interaction (lap, toys).", score: { dog: 2, cat: -1, bird: 2 } }
        ]
    },
    'decisive_social': {
        text: "What does your ideal weekend look like?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog', 'cat'],
        options: [
            { text: "Quiet time at home, maybe a small gathering.", score: { cat: 2, dog: -1, bird: 1 } },
            { text: "Outdoors (park, hike) or social events, possibly with pet.", score: { dog: 2, cat: -1, bird: -1 } }
        ]
    },
     'decisive_effort': {
        text: "What level of daily 'must-do tasks' are you prepared for?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog', 'cat', 'bird'],
        options: [
            { text: "A few minutes (litter box) and casual play.", score: { cat: 2, dog: -2, bird: -1 } },
            { text: "Commitment to multiple walks or cage cleaning/training.", score: { dog: 3, cat: -1, bird: 2 } }
        ]
    },
    'decisive_cleanliness': {
        text: "How high is your tolerance for mess in your home?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog', 'cat', 'bird'],
        options: [
            { text: "Can tolerate scratches/climbed curtains, prefer clean floors.", score: { cat: 1, dog: -1, bird: -1 } },
            { text: "Can handle muddy paws/seeds/chewed items.", score: { dog: 1, cat: -1, bird: 2 } }
        ]
    },
     'decisive_responsibility': {
        text: "Which commitment style feels more natural?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog', 'cat', 'bird'],
        options: [
            { text: "Thoughtful guardian for an independent soul.", score: { cat: 2, dog: -1, bird: -1 } },
            { text: "Active leader/playmate for a reliant creature.", score: { dog: 2, cat: -1, bird: 2 } }
        ]
    },
     'decisive_communication': {
        text: "Which interaction style do you prefer?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog', 'cat', 'bird'],
        options: [
            { text: "Subtle cues (purr, head boop, slow blink).", score: { cat: 2, dog: -1, bird: -1 } },
            { text: "Clear, enthusiastic feedback (wagging tail, licks, vocalizing).", score: { dog: 2, cat: -1, bird: 2 } }
        ]
    },
    'decisive_costs': {
        text: "Regarding potential emergency costs, what worries you more?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog', 'cat'],
        options: [
            { text: "Swallowing items (string) or falling injuries.", score: { cat: 1, bird: 1 } },
            { text: "Outdoor injuries, altercations, separation anxiety damage.", score: { dog: 1 } }
        ]
    },

    'q_noise': {
        text: "I have a high tolerance for barking, chirping, or meowing.",
        type: "aptitude",
        tags: ['adaptive', 'dog', 'cat', 'bird'],
        options: [
            { value: -3, score: { dog: -5, cat: -3, smallAnimal: 2, reptile: 3, bird: -8 } },
            { value: -2, score: { dog: -3, cat: -2, smallAnimal: 1, reptile: 2, bird: -5 } },
            { value: -1, score: { dog: -1, cat: -1, bird: -2 } }, { value: 0, score: {} },
            { value: 1, score: { dog: 1, bird: 1 } }, { value: 2, score: { dog: 2, cat: 1, bird: 3 } },
            { value: 3, score: { dog: 3, cat: 2, bird: 5 } }
        ]
    },
    'q_independent': {
        text: "I prefer an independent pet that doesn't need constant attention.",
        type: "aptitude",
        tags: ['adaptive', 'dog', 'cat', 'reptile', 'bird'],
        options: [
            { value: -3, score: { dog: 3, cat: -1, bird: 3 } }, { value: -2, score: { dog: 2, bird: 2 } },
            { value: -1, score: { dog: 1, bird: 1 } }, { value: 0, score: {} },
            { value: 1, score: { cat: 1, dog: -1, bird: -1 } },
            { value: 2, score: { cat: 2, dog: -3, smallAnimal: 1, bird: -3 } },
            { value: 3, score: { cat: 3, dog: -5, reptile: 2, bird: -5 } }
        ]
    },
    'q_mess': {
        text: "I don't mind pet hair, scattered seeds, and a bit of mess in the house.",
        type: "aptitude",
        tags: ['adaptive', 'dog', 'cat', 'smallAnimal', 'bird'],
        options: [
            { value: -3, score: { dog: -5, cat: -5, smallAnimal: -3, reptile: 5, bird: -8 } },
            { value: -2, score: { dog: -3, cat: -3, smallAnimal: -1, reptile: 3, bird: -5 } },
            { value: -1, score: { dog: -1, cat: -1, bird: -2 } }, { value: 0, score: {} },
            { value: 1, score: { dog: 1, cat: 1, bird: 1 } },
            { value: 2, score: { dog: 2, cat: 2, smallAnimal: 1, bird: 3 } },
            { value: 3, score: { dog: 3, cat: 3, smallAnimal: 1, bird: 5 } }
        ]
    },
    'q_training': {
        text: "I am excited to spend time training my pet daily.",
        type: "aptitude",
        tags: ['adaptive', 'dog', 'bird'],
        options: [
            { value: -3, score: { dog: -5, cat: -1, smallAnimal: 0, reptile: 1, bird: -3 } },
            { value: -2, score: { dog: -3 } }, { value: -1, score: { dog: -1 } },
            { value: 0, score: { cat: 0, smallAnimal: 0 } }, { value: 1, score: { dog: 1, bird: 1 } },
            { value: 2, score: { dog: 3, cat: 1, smallAnimal: 1, bird: 3 } },
            { value: 3, score: { dog: 5, cat: 1, bird: 5 } }
        ]
    },
    'q_cuddle': {
        text: "It's important for me to have a pet that loves to cuddle and be close.",
        type: "aptitude",
        tags: ['adaptive', 'dog', 'cat', 'bird'],
        options: [
            { value: -3, score: { dog: -3, cat: -2, reptile: 1, bird: 0 } },
            { value: -2, score: { dog: -1, cat: -1 } }, { value: -1, score: {} },
            { value: 0, score: {} }, { value: 1, score: { dog: 1, cat: 1, bird: 1 } },
            { value: 2, score: { dog: 2, cat: 2, bird: 2 } }, { value: 3, score: { dog: 3, cat: 2, bird: 2 } }
        ]
    },
    'q_yard': {
        text: "Do you have a fenced yard?",
        type: "yesNo",
        tags: ['adaptive', 'dog'],
        options: [
            { text: "No", score: { dog: -1, cat: 1, bird: 1 } },
            { text: "Yes", score: { dog: 2, bird: 0 } }
        ]
    },
    'q_cat_scratch': {
        text: "How do you feel about furniture scratching?",
        type: "multipleChoice",
        tags: ['adaptive', 'cat'],
        options: [
            { text: "It's a deal-breaker for me", score: { cat: -5 } },
            { text: "I'm willing to provide scratching posts", score: { cat: 2 } },
            { text: "I don't have furniture I'm worried about", score: { cat: 1 } }
        ]
    },
    'q_dog_size': {
        text: "What size of dog do you prefer?",
        type: "multipleChoice",
        tags: ['adaptive', 'dog'],
        options: [
            { text: "Small (under 25 lbs)", score: { dog: 1 } },
            { text: "Medium (25-60 lbs)", score: { dog: 1 } },
            { text: "Large (60+ lbs)", score: { dog: 1 } }
        ]
    },
    'q_small_lifespan': {
        text: "Are you aware that some small animals, like rabbits, can live 8-12 years?",
        type: "yesNo",
        tags: ['adaptive', 'smallAnimal'],
        options: [
            { text: "No, I thought they were short-lived", score: { smallAnimal: -1 } },
            { text: "Yes, I'm prepared for that commitment", score: { smallAnimal: 2 } }
        ]
    },
    'q_reptile_food': {
        text: "Are you comfortable feeding live or frozen insects/rodents to a pet?",
        type: "yesNo",
        tags: ['adaptive', 'reptile'],
        options: [
            { text: "No, absolutely not", score: { reptile: -5 } },
            { text: "Yes, that's fine with me", score: { reptile: 3 } }
        ]
    },
    
    // --- [NEW] SPECIFIC BIRD ADAPTIVE QUESTIONS ---
    'q_bird_flight': {
        text: "Birds need time out of the cage daily to fly. Is your home safe (screened windows, no ceiling fans)?",
        type: "yesNo",
        tags: ['adaptive', 'bird'],
        options: [
            { text: "Yes, or I can make it safe", score: { bird: 3 } },
            { text: "No, that sounds dangerous/hard", score: { bird: -5 } }
        ]
    }
};
