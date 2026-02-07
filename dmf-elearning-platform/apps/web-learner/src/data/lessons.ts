export type SkillType = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing';

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // 0-indexed
    skill: SkillType;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    durationMinutes: number;
}

export const MOCK_LESSONS: Lesson[] = [
    {
        id: 'lesson-a1-01',
        title: 'Hello World (Language Edition)',
        description: 'Learn regular greetings and basic introductions.',
        difficulty: 'Beginner',
        durationMinutes: 5,
        questions: [
            {
                id: 'q1',
                text: 'Which phrase is a formal greeting?',
                options: ['What\'s up?', 'Good morning', 'Yo!', 'High five'],
                correctAnswer: 1,
                skill: 'vocabulary'
            },
            {
                id: 'q2',
                text: 'Complete the sentence: "I ____ a student."',
                options: ['is', 'be', 'am', 'are'],
                correctAnswer: 2,
                skill: 'grammar'
            },
            {
                id: 'q3',
                text: 'How do you respond to "How are you?" comprehensively?',
                options: ['I am fine, thank you.', 'Bread.', 'Yes.', 'Blue.'],
                correctAnswer: 0,
                skill: 'speaking' // Approximated
            }
        ]
    },
    {
        id: 'lesson-tech-01',
        title: 'Tech Talk for Devs',
        description: 'Essential vocabulary for software engineering dailies.',
        difficulty: 'Intermediate',
        durationMinutes: 10,
        questions: [
            {
                id: 'q1',
                text: 'What does "PR" stand for in GitHub?',
                options: ['Personal Record', 'Pull Request', 'Private Rep', 'Public Route'],
                correctAnswer: 1,
                skill: 'vocabulary'
            },
            {
                id: 'q2',
                text: 'Which sentence is grammatically correct?',
                options: [
                    'I pushed code to production yesterday.',
                    'I push code to production yesterday.',
                    'I will pushed code tomorrow.',
                    'I pushing code now.'
                ],
                correctAnswer: 0,
                skill: 'grammar'
            },
            {
                id: 'q3',
                text: 'Choose the best synonym for "Bug".',
                options: ['Feature', 'Defect', 'Insect', 'Tool'],
                correctAnswer: 1,
                skill: 'vocabulary'
            }
        ]
    },
    {
        id: 'lesson-slang-01',
        title: 'Gen Z Slang 101',
        description: 'Understand what the cool kids are saying on TikTok.',
        difficulty: 'Advanced',
        durationMinutes: 3,
        questions: [
            {
                id: 'q1',
                text: 'What does "No Cap" mean?',
                options: ['No Hat', 'No Lie / For Real', 'No Captain', 'Limit reached'],
                correctAnswer: 1,
                skill: 'vocabulary'
            },
            {
                id: 'q2',
                text: 'If something is "Cringe", it is...',
                options: ['Embarrassing', 'Delicious', 'Expensive', 'Fast'],
                correctAnswer: 0,
                skill: 'vocabulary'
            }
        ]
    }
];
