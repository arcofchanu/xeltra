import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import xeltraGif from '../assets/XELTRA.gif';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
};

const XeltraLogo = () => (
    <motion.img
        src={xeltraGif}
        alt="Xeltra Logo"
        width="120"
        height="120"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
    />
);

const BrutalistProgressBar = () => (
    <div className="w-64" aria-label="Loading progress bar">
        <div className="bg-white border-4 border-black shadow-brutal p-1">
            <motion.div
                className="bg-primary h-4"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.8, ease: 'linear', delay: 0.2 }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={100} 
            />
        </div>
    </div>
);

const StartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 bg-primary flex flex-col items-center justify-center text-white z-[100]"
    >
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-8">
            <XeltraLogo />
            <BrutalistProgressBar />
        </motion.div>
    </motion.div>
  );
};

export default StartPage;