import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { quizData } from '../data/quizData';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Fix: Added `as const` to ensure correct type inference for framer-motion transition properties, resolving the type error.
const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' } },
} as const;

const QuizPage = () => {
    const { topic, difficulty } = useParams<{ topic: string; difficulty: string }>();
    const navigate = useNavigate();
    
    const difficultyKey = difficulty as 'easy' | 'medium' | 'xone' | undefined;
    const questions = topic && difficultyKey && quizData[topic] 
        ? quizData[topic][difficultyKey] 
        : [];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [showResults, setShowResults] = useState(false);

    if (!questions || questions.length === 0) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Quiz not found for topic: {topic} ({difficulty})</h1>
                <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 border-2 border-black font-bold bg-white">Back to Home</button>
            </div>
        );
    }

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;

        setSelectedAnswer(answer);
        setIsAnswered(true);
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };
    
    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setShowResults(false);
        setQuizStarted(true);
    }
    
    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return "bg-white text-black hover:bg-primary hover:text-white";
        }
        const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
        const isSelected = option === selectedAnswer;

        if (isCorrect) return "bg-green-500 text-white border-green-700";
        if (isSelected && !isCorrect) return "bg-red-500 text-white border-red-700";
        
        return "bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed";
    };

    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    const scorePercentage = (score / questions.length) * 100;
    
    const getResultMessage = () => {
        if (scorePercentage === 100) return "Perfect Score! You're a true expert!";
        if (scorePercentage >= 80) return "Excellent Job! You really know your stuff.";
        if (scorePercentage >= 60) return "Good work! A little more practice and you'll be a pro.";
        return "Nice try! Keep studying and try again.";
    }

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div className="bg-white p-6 md:p-8 border-4 border-black shadow-brutal max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                    {!quizStarted ? (
                        <motion.div key="start" variants={itemVariants} initial="hidden" animate="visible" exit="hidden" className="text-center">
                             <h1 className="text-4xl font-extrabold text-black mb-2">{topic} Quiz <span className="capitalize text-primary">({difficulty})</span></h1>
                             <p className="text-black/80 text-lg mb-8">Test your knowledge with {questions.length} questions.</p>
                             <motion.button
                                onClick={() => setQuizStarted(true)}
                                className="px-8 py-4 border-2 border-black font-bold bg-white text-black text-xl hover:bg-primary hover:text-white hover:shadow-brutal transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Quiz
                            </motion.button>
                        </motion.div>
                    ) : showResults ? (
                        <motion.div key="results" variants={itemVariants} initial="hidden" animate="visible" exit="hidden" className="text-center flex flex-col items-center">
                            <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
                            <p className="text-lg text-black/80 mb-6">{getResultMessage()}</p>
                            
                            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                                    <motion.circle
                                        className="text-primary"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="45"
                                        cx="50"
                                        cy="50"
                                        strokeDasharray={2 * Math.PI * 45}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                        animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - scorePercentage / 100) }}
                                        transition={{ duration: 1, ease: "circOut" }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-extrabold text-black">{score}<span className="text-2xl text-black/60">/{questions.length}</span></span>
                                </div>
                            </div>
                            
                            <p className="text-xl font-bold text-black mb-8">
                                You answered {score} out of {questions.length} correctly.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <motion.button
                                    onClick={handleRestart}
                                    className="px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                >
                                    Try Again
                                </motion.button>
                                <motion.button
                                    onClick={() => navigate(`/detail/${topic}`)}
                                    className="px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                >
                                    Back to Topic
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key={currentQuestionIndex} variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                            {/* Progress Bar and Question Count */}
                            <div className="mb-6">
                                <div className="flex justify-between items-baseline mb-2">
                                    <p className="font-bold text-lg">Question {currentQuestionIndex + 1} of {questions.length}</p>
                                    <p className="text-sm font-bold text-black/60">{score} / {questions.length} Correct</p>
                                </div>
                                <div className="w-full bg-gray-200 border-2 border-black h-4">
                                    <motion.div 
                                        className="bg-primary h-full"
                                        initial={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <h2 className="text-2xl md:text-3xl font-bold mb-8 min-h-[80px]">{questions[currentQuestionIndex].question}</h2>
                            
                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {questions[currentQuestionIndex].options.map((option, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={isAnswered}
                                        className={`w-full p-4 border-2 border-black font-bold text-left transition-colors duration-200 ${getButtonClass(option)}`}
                                        whileHover={!isAnswered ? { scale: 1.03 } : {}}
                                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                    >
                                        {option}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Next Button */}
                            <AnimatePresence>
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="text-right"
                                >
                                    <motion.button
                                        onClick={handleNextQuestion}
                                        className="px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal"
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                    </motion.button>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default QuizPage;
