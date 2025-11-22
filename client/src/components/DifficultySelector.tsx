import React from 'react';
import type { Difficulty } from '../types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface DifficultySelectorProps {
    currentDifficulty: Difficulty;
    onSelect: (difficulty: Difficulty) => void;
    disabled?: boolean;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ currentDifficulty, onSelect, disabled }) => {
    return (
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
            {difficulties.map((diff) => (
                <button
                    key={diff}
                    onClick={() => onSelect(diff)}
                    disabled={disabled}
                    className={clsx(
                        "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative",
                        currentDifficulty === diff
                            ? "text-white"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {currentDifficulty === diff && (
                        <motion.div
                            layoutId="activeDifficulty"
                            className="absolute inset-0 bg-indigo-600 rounded-md shadow-sm"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{diff}</span>
                </button>
            ))}
        </div>
    );
};
