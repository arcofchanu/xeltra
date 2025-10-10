import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resourceData } from '../data/resourceData';
import { cardData } from './HomePage';

// Icons
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const ResourcePage = () => {
    const { topic } = useParams<{ topic: string }>();
    const navigate = useNavigate();
    const data = topic ? resourceData[topic] : null;
    const card = cardData.find(c => c.name === topic);
    const [copyStatus, setCopyStatus] = useState<{ [key: number]: string }>({});

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus({ ...copyStatus, [index]: 'Copied!' });
            setTimeout(() => {
                setCopyStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[index];
                    return newStatus;
                });
            }, 2000);
        }).catch(() => {
            setCopyStatus({ ...copyStatus, [index]: 'Failed!' });
        });
    };

    if (!data || !card) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16">
                <h1 className="text-4xl font-bold mb-4">Resource Not Found</h1>
                <p className="text-lg text-black/80 mb-8">The resource you're looking for doesn't exist.</p>
                <motion.button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal transition-colors duration-200"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    Back to Home
                </motion.button>
            </div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.button 
                onClick={() => navigate(`/detail/${topic}`)}
                className="px-4 py-2 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal mb-8 flex items-center gap-2"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
                <BackIcon /> Back to Topic
            </motion.button>

            <div className="bg-white p-8 md:p-12 border-4 border-black shadow-brutal">
                <div className="flex items-center gap-6 mb-8">
                    <div className={`w-16 h-16 ${card.color} border-2 border-black`}></div>
                    <h1 className="text-5xl font-extrabold text-black">{card.name} Resources</h1>
                </div>

                {data.map((item, index) => {
                    switch (item.type) {
                        case 'heading':
                            return <h2 key={index} className="text-3xl font-bold mt-8 mb-4 border-b-2 border-primary pb-2">{item.content}</h2>;
                        case 'paragraph':
                            return <p key={index} className="text-lg text-black/80 mb-4 leading-relaxed">{item.content}</p>;
                        case 'bullet':
                            return (
                                <li key={index} className="text-lg text-black/80 ml-6 mb-2 list-disc">{item.content}</li>
                            );
                        case 'code':
                            return (
                                <div key={index} className="bg-gray-900 my-6 border-2 border-black relative">
                                    <button 
                                        onClick={() => handleCopy(item.content, index)}
                                        className="absolute top-2 right-2 bg-gray-700 hover:bg-primary text-white font-bold py-1 px-3 text-xs flex items-center gap-2 transition-colors"
                                    >
                                        {copyStatus[index] === 'Copied!' ? <CheckIcon /> : <CopyIcon />}
                                        {copyStatus[index] || 'Copy'}
                                    </button>
                                    <pre className="text-white p-4 overflow-x-auto text-sm md:text-base whitespace-pre-wrap"><code className="language-markdown">{item.content}</code></pre>
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </div>
        </motion.div>
    );
};

export default ResourcePage;