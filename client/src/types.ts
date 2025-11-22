export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
}

export interface QuizState {
    currentQuestion: Question | null;
    loading: boolean;
    selectedOption: number | null;
    isCorrect: boolean | null;
    streak: number;
    difficulty: Difficulty;
}
