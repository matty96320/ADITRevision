import type { Difficulty, Question } from './types';

const API_URL = import.meta.env.PROD ? '/api/generate' : 'http://localhost:3000/api/generate';

const chapters = [
    "Chapter I: The Arm's Length Principle",
    "Chapter II: Transfer Pricing Methods",
    "Chapter III: Comparability Analysis",
    "Chapter IV: Administrative Approaches",
    "Chapter V: Documentation",
    "Chapter VI: Intangibles",
    "Chapter VII: Intra-group Services",
    "Chapter VIII: Cost Contribution Arrangements",
    "Chapter IX: Business Restructurings",
    "Chapter X: Financial Transactions"
];

const getRandomChapter = () => chapters[Math.floor(Math.random() * chapters.length)];

export const fetchQuestion = async (difficulty: Difficulty): Promise<Question> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chapterTitle: getRandomChapter(),
            difficulty,
            difficultyDescription: `Generate a ${difficulty} question.`,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch question');
    }

    return response.json();
};
