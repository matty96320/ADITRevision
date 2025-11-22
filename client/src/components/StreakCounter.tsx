import React from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakCounterProps {
    streak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
    return (
        <div className="flex items-center space-x-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'fill-orange-500 text-orange-500' : 'text-orange-300'}`} />
            <div className="font-bold text-lg relative min-w-[1ch]">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={streak}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="block"
                    >
                        {streak}
                    </motion.span>
                </AnimatePresence>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-orange-400">Streak</span>
        </div>
    );
};
