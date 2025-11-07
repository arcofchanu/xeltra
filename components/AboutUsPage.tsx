import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
);

const AboutUsPage = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-4xl font-bold text-black mb-6 border-b-2 border-primary pb-2">About Us</h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white p-8 border-4 border-black shadow-brutal"
      >
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Connect With Us</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.a 
              href="https://www.linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LinkedInIcon />
              LinkedIn
            </motion.a>
            <motion.a 
              href="https://www.x.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XIcon />
              X (Twitter)
            </motion.a>
          </div>
        </div>

        <div className="space-y-4 text-black/80 text-lg leading-relaxed">
            <p>
                Welcome to Xeltra, a cutting-edge platform designed to help you master the art of prompt engineering. Whether you're a seasoned developer, a curious creator, or a student of AI, Xeltra provides the ultimate sandbox to craft, test, and perfect your prompts.
            </p>
            <p>
                Our application is built around a few core experiences:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    <strong>The Playground:</strong> A pressure-free zone to experiment with XML, JSON, and YAML, complete with an AI-powered analyzer to score and improve your work.
                </li>
                <li>
                    <strong>The Zone:</strong> A high-stakes, timed challenge mode where you can sharpen your skills against the clock and track your progress.
                </li>
                <li>
                    <strong>Quizzes & Resources:</strong> Deepen your knowledge with detailed guides and test your skills with multi-level quizzes on syntax and prompt strategies.
                </li>
            </ul>
            <p>
                Our mission is to demystify prompt engineering and empower you to communicate with AI more effectively, unlocking new creative and technical possibilities.
            </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutUsPage;