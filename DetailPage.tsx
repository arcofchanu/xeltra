import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cardData } from './HomePage';
import { useAuth } from '../contexts/AuthContext';

// Icons
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ResourceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
);
const QuizIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.879 7.519c.355-.207.74-.325 1.145-.395.405-.07.82-.098 1.242-.083a6.14 6.14 0 0 1 4.222 1.838c.96.96 1.503 2.25 1.503 3.592 0 1.342-.543 2.632-1.503 3.592s-2.25 1.503-3.592 1.503c-1.226 0-2.373-.44-3.26-1.226" /><path d="M12 22V2" /><path d="m15 5-3-3-3 3" /></svg>
);

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
};
  
// Fix: Added `as const` to ensure correct type inference for framer-motion transition properties, resolving the type error.
const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
} as const;

const DetailPage = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'xone' | ''>('');
    const card = cardData.find(c => c.name === name);

    if (!card) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16">
                <h1 className="text-4xl font-bold mb-4">Topic Not Found</h1>
                <p className="text-lg text-black/80 mb-8">The topic you're looking for doesn't exist.</p>
                <motion.button 
                    onClick={() => navigate('/home')}
                    className="px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal transition-colors duration-200"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    Back to Home
                </motion.button>
            </div>
        );
    }
    
    const handleResourceClick = () => {
        if (!card) return;
        navigate(`/resource/${card.name}`);
    }

    const handleStartQuiz = () => {
        if (selectedDifficulty && card) {
            if (user) {
                navigate(`/quiz/${card.name}/${selectedDifficulty}`);
            } else {
                const targetPath = `/quiz/${card.name}/${selectedDifficulty}`;
                navigate('/auth', { state: { from: { pathname: targetPath } }, replace: true });
            }
        }
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.button 
                onClick={() => navigate('/home')}
                className="px-4 py-2 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal mb-8 flex items-center gap-2"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
                <BackIcon /> Back to Home
            </motion.button>
            
            <div className="bg-white p-8 border-4 border-black shadow-brutal mb-12">
                <div className="flex items-center gap-6 mb-6">
                    <div className={`w-16 h-16 ${card.color} border-2 border-black`}></div>
                    <h1 className="text-5xl font-extrabold text-black">{card.name}</h1>
                </div>
                <p className="text-black/80 text-lg leading-relaxed">{card.description}</p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                <motion.div
                    variants={itemVariants}
                    onClick={handleResourceClick}
                    className="min-h-80 p-8 bg-white border-4 border-black shadow-brutal cursor-pointer flex flex-col justify-between"
                    whileHover={{ scale: 1.03, boxShadow: '10px 10px 0px #000000' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <div>
                        <div className="text-primary mb-4"><ResourceIcon /></div>
                        <h2 className="text-3xl font-bold mb-2">Resource</h2>
                        <p className="text-black/80">Dive deeper into the official documentation, community tutorials, and practical examples.</p>
                    </div>
                    <p className="font-bold text-right">Explore Resources &rarr;</p>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="min-h-80 p-8 bg-white border-4 border-black shadow-brutal flex flex-col justify-between"
                    whileHover={{ scale: 1.03, boxShadow: '10px 10px 0px #000000' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <div>
                        <div className="text-primary mb-4"><QuizIcon /></div>
                        <h2 className="text-3xl font-bold mb-2">Quiz</h2>
                        <p className="text-black/80 mb-4">Challenge your knowledge. Select a difficulty below to begin.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'xone' | '')}
                                className="w-full appearance-none px-4 py-3 border-2 border-black font-bold bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label="Select quiz difficulty"
                            >
                                <option value="" disabled>Select Difficulty...</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="xone">X-Zone</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                        <motion.button
                            onClick={handleStartQuiz}
                            disabled={!selectedDifficulty}
                            className="w-full px-4 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                            whileHover={{ scale: selectedDifficulty ? 1.05 : 1 }}
                            whileTap={{ scale: selectedDifficulty ? 0.95 : 1 }}
                        >
                            Start Quiz
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default DetailPage;