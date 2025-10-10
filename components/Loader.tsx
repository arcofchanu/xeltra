import React from 'react';
// Fix: Removed import of Transition type as it is not correctly exported by framer-motion in the current version.
import { motion } from 'framer-motion';

const containerVariants = {
  start: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const dotVariants = {
  start: {
    y: '0%',
  },
  end: {
    y: '-100%',
  },
};

// Fix: Added `as const` to ensure correct type inference for framer-motion transition properties, resolving the type error.
const dotTransition = {
  duration: 0.4,
  repeat: Infinity,
  repeatType: 'reverse',
  ease: 'easeInOut',
} as const;

const Loader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
        <motion.div
            className="flex justify-center items-end gap-2 h-8"
            variants={containerVariants}
            initial="start"
            animate="end"
            aria-label="Loading animation"
        >
            <motion.span
                className="block w-4 h-4 bg-primary border-2 border-black"
                variants={dotVariants}
                transition={{...dotTransition, delay: 0}}
            />
            <motion.span
                className="block w-4 h-4 bg-primary border-2 border-black"
                variants={dotVariants}
                transition={{...dotTransition, delay: 0.2}}
            />
            <motion.span
                className="block w-4 h-4 bg-primary border-2 border-black"
                variants={dotVariants}
                transition={{...dotTransition, delay: 0.4}}
            />
        </motion.div>
        <div
            className="text-2xl font-bold text-black"
            aria-live="polite"
            aria-busy="true"
        >
            {text}
        </div>
    </div>
  );
};

export default Loader;