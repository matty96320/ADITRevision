import React, { useState, useEffect } from 'react';
import type { Difficulty, Question } from '../types';
import { fetchQuestion } from '../api';
import { DifficultySelector } from './DifficultySelector';
import { StreakCounter } from './StreakCounter';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const Quiz: React.FC = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [streak, setStreak] = useState(0);
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadQuestion = async () => {
        setLoading(true);
        setError(null);
        setQuestion(null);
        setSelectedOption(null);
        setIsCorrect(null);
        try {
            const q = await fetchQuestion(difficulty);
            setQuestion(q);
        } catch (err) {
            setError('Failed to load question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuestion();
    }, [difficulty]);

    const handleOptionClick = (index: number) => {
        if (selectedOption !== null) return; // Prevent changing answer

        setSelectedOption(index);
        const correct = index === question?.correctOptionIndex;
        setIsCorrect(correct);

        if (correct) {
            setStreak((s) => s + 1);
        } else {
            setStreak(0);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <DifficultySelector
                    currentDifficulty={difficulty}
                    onSelect={setDifficulty}
                    disabled={loading || (selectedOption !== null && !isCorrect)} // Disable while loading or if answered incorrectly (force next)
                />
                <StreakCounter streak={streak} />
            </div>

            {/* Content */}
            <div className="min-h-[400px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center space-y-4 text-slate-400"
                        >
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p>Generating question...</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center space-y-4"
                        >
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={loadQuestion}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Retry
                            </button>
                        </motion.div>
                    ) : question ? (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-6"
                        >
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">
                                    {question.questionText}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {question.options.map((option, index) => {
                                    const isSelected = selectedOption === index;
                                    const isCorrectOption = index === question.correctOptionIndex;
                                    const showResult = selectedOption !== null;

                                    let stateStyles = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50";
                                    if (showResult) {
                                        if (isCorrectOption) {
                                            stateStyles = "border-green-500 bg-green-50 text-green-900";
                                        } else if (isSelected) {
                                            stateStyles = "border-red-500 bg-red-50 text-red-900";
                                        } else {
                                            stateStyles = "border-slate-100 opacity-50";
                                        }
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleOptionClick(index)}
                                            disabled={showResult}
                                            className={clsx(
                                                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
                                                stateStyles
                                            )}
                                        >
                                            <span>{option}</span>
                                            {showResult && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-600" />}
                                            {showResult && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-600" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation & Next Button */}
                            <AnimatePresence>
                                {selectedOption !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-6 overflow-hidden"
                                    >
                                        <div className={clsx(
                                            "p-4 rounded-lg text-sm leading-relaxed",
                                            isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        )}>
                                            <p className="font-semibold mb-1">Explanation:</p>
                                            {question.explanation}
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={loadQuestion}
                                                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
                                            >
                                                <span>Next Question</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};
