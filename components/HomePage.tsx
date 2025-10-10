import React, { useState } from 'react';
// Fix: Removed import of Variants type as it is not exported by framer-motion in the current version.
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
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

export const cardData = [
  {
    name: "XML",
    description: "Extensible Markup Language. A structured, tag-based format for representing data. Often used in configuration files and for data exchange between different systems.",
    color: "bg-blue-400"
  },
  {
    name: "JSON",
    description: "JavaScript Object Notation. A lightweight, human-readable format for data interchange. It's easy for humans to read and write and easy for machines to parse and generate.",
    color: "bg-yellow-400"
  },
  {
    name: "YAML",
    description: "YAML Ain't Markup Language. A human-friendly data serialization standard for all programming languages. It is often used for configuration files and in applications where data is being stored or transmitted.",
    color: "bg-red-400"
  }
];

const carouselVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };
  
// SVG for Chevron
const ChevronIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
);

// Fix: Removed React.FC to allow for correct type inference of framer-motion props.
const HomePage = () => {
    const [[page, direction], setPage] = useState([0, 0]);
    const navigate = useNavigate();

    const cardIndex = (page % cardData.length + cardData.length) % cardData.length;
  
    const paginate = (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    };

    const goToSlide = (slideIndex: number) => {
        const currentCardIndex = (page % cardData.length + cardData.length) % cardData.length;
        const newDirection = slideIndex > currentCardIndex ? 1 : -1;
        setPage([slideIndex, newDirection]);
    }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center text-center py-16"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center w-full">
        {/* Carousel Section */}
        <motion.div
            variants={itemVariants}
            className="w-full max-w-2xl h-[280px] relative flex items-center justify-center overflow-hidden"
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={carouselVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    onClick={() => navigate(`/detail/${cardData[cardIndex].name}`)}
                    className="absolute w-[calc(100%-80px)] h-full bg-white p-8 border-4 border-black shadow-brutal flex flex-col items-start text-left cursor-pointer"
                >
                    <div className={`w-12 h-12 ${cardData[cardIndex].color} border-2 border-black mb-4`}></div>
                    <h2 className="text-3xl font-bold mb-2 text-black">{cardData[cardIndex].name}</h2>
                    <p className="text-black/80">{cardData[cardIndex].description.substring(0, 100)}...</p>
                </motion.div>
            </AnimatePresence>
            
            <motion.button
                onClick={() => paginate(-1)}
                className="absolute left-0 z-10 bg-white p-2 border-2 border-black hover:bg-primary hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous slide"
            >
                <ChevronIcon className="transform rotate-180" />
            </motion.button>
            
            <motion.button
                onClick={() => paginate(1)}
                className="absolute right-0 z-10 bg-white p-2 border-2 border-black hover:bg-primary hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next slide"
            >
                <ChevronIcon />
            </motion.button>

        </motion.div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center space-x-3 mt-4">
          {cardData.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 border-2 border-black rounded-full transition-colors ${index === cardIndex ? 'bg-black' : 'bg-white'}`}
              aria-label={`Go to slide ${index + 1}`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavLink
              to="/playground"
              className="block px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal transition-colors duration-200"
            >
              Go to Playground
            </NavLink>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavLink
              to="/dungeon"
              className="block px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal transition-colors duration-200"
            >
              Enter the Dungeon
            </NavLink>
          </motion.div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default HomePage;