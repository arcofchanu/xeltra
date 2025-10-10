import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserStats, recordActivity, isSameDay, UserStats } from '../utils/stats';

const StreakIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> );
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const StreakPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        const checkStreakStatus = () => {
            const dismissed = sessionStorage.getItem('streakPopupDismissed');
            if (dismissed === 'true') {
                return;
            }

            const currentStats = getUserStats();
            setStats(currentStats);

            if (currentStats.currentStreak === 0) {
                return;
            }

            const today = new Date();
            const lastCompletion = currentStats.lastCompletionDate ? new Date(currentStats.lastCompletionDate) : null;

            if (!lastCompletion || !isSameDay(lastCompletion, today)) {
                setTimeout(() => setIsVisible(true), 1500);
            }
        };

        checkStreakStatus();
    }, []);

    const handleCheckIn = () => {
        const newStats = recordActivity(false);
        setStats(newStats);
        setIsVisible(false);
        sessionStorage.setItem('streakPopupDismissed', 'true');
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('streakPopupDismissed', 'true');
    };
    
    if (!isVisible || !stats || stats.currentStreak === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="streak-backdrop"
                    className="fixed inset-0 bg-black/60 flex items-end justify-center sm:items-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                >
                    <motion.div
                        key="streak-modal"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-white p-8 border-4 border-black shadow-brutal flex flex-col text-center"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="streak-heading"
                    >
                        <div className="flex justify-center text-primary mb-4">
                            <StreakIcon />
                        </div>
                        <h2 id="streak-heading" className="text-3xl font-bold mb-2 text-black">Keep your streak alive!</h2>
                        <p className="text-black/80 mb-6">You're on a <span className="font-bold text-primary">{stats.currentStreak}-day streak</span>. Complete a challenge or check-in now to maintain it.</p>

                        <motion.button
                            onClick={handleCheckIn}
                            className="w-full px-4 py-3 border-2 border-black font-bold bg-primary text-white hover:bg-black hover:shadow-brutal"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Check-in for Today
                        </motion.button>

                        <motion.button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 bg-white p-2 border-2 border-black rounded-full hover:bg-red-400 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Close streak reminder"
                        >
                            <CloseIcon />
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StreakPopup;