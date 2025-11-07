import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Fix: Removed import of Variants type as it is not exported by framer-motion in the current version.
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useClickSound } from '../utils/useClickSound';

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// Fix: Added `as const` to ensure correct type inference for framer-motion transition properties, resolving the type error.
const sideMenuVariants = {
    closed: { x: "100%" },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
} as const;

const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
};

const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const playClick = useClickSound();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setMenuOpen(false);
        }
    };
    if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const baseClasses = "px-4 py-2 border-2 border-black font-bold";
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `${baseClasses} block text-left ${isActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal'}`;

  const MobileNavLinks = () => (
    <ul className="flex flex-col space-y-4">
        <li onClick={() => { playClick(); setMenuOpen(false); }}><NavLink to="/home" end className={navLinkClasses}>Home</NavLink></li>
        <li onClick={() => { playClick(); setMenuOpen(false); }}><NavLink to="/playground" className={navLinkClasses}>Playground</NavLink></li>
        <li onClick={() => { playClick(); setMenuOpen(false); }}><NavLink to="/dungeon" className={navLinkClasses}>Dungeon</NavLink></li>
        <li onClick={() => { playClick(); setMenuOpen(false); }}><NavLink to="/profile" className={navLinkClasses}>Profile</NavLink></li>
        <li onClick={() => { playClick(); setMenuOpen(false); }}><NavLink to="/about" className={navLinkClasses}>About Us</NavLink></li>
        {user ? (
            <li className="pt-4 mt-4 border-t-2 border-gray-200">
                <div className="mb-4 p-3 bg-gray-50 border-2 border-black">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button onClick={() => { playClick(); logout(); setMenuOpen(false); }} className={`${navLinkClasses({isActive: false})} w-full text-left bg-red-500 text-white hover:bg-red-600`}>
                    Logout
                </button>
            </li>
        ) : (
            <li className="pt-4 mt-4 border-t-2 border-gray-200">
                <button onClick={() => { playClick(); navigate('/auth'); setMenuOpen(false); }} className={`${navLinkClasses({isActive: false})} w-full text-left`}>Login</button>
            </li>
        )}
    </ul>
  );

  return (
    <header className="border-b-4 border-primary bg-white sticky top-0 z-30">
      <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-2xl font-extrabold tracking-wider text-black"
        >
          <NavLink to="/home">
            Xeltra
          </NavLink>
        </motion.div>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-2 md:space-x-4 text-sm md:text-base">
          <li><NavLink to="/home" end className={navLinkClasses}>Home</NavLink></li>
          <li><NavLink to="/playground" className={navLinkClasses}>Playground</NavLink></li>
          <li><NavLink to="/dungeon" className={navLinkClasses}>Dungeon</NavLink></li>
          <li><NavLink to="/profile" className={navLinkClasses}>Profile</NavLink></li>
          <li><NavLink to="/about" className={navLinkClasses}>About Us</NavLink></li>
          {user ? (
            <>
              <li className="relative group">
                <button className={`${navLinkClasses({ isActive: false })} flex items-center gap-2`}>
                  <img 
                    src={user.photoUrl.includes('pravatar.cc') ? '/assets/USER.png' : user.photoUrl} 
                    alt={user.name} 
                    className="w-6 h-6 rounded-full border-2 border-black" 
                  />
                  {user.name}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-black shadow-brutal p-4 hidden group-hover:block">
                  <p className="font-bold mb-1">{user.name}</p>
                  <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playClick(); logout(); }}
                    className="w-full px-4 py-2 border-2 border-black font-bold bg-red-500 text-white hover:bg-red-600"
                  >
                    Logout
                  </motion.button>
                </div>
              </li>
            </>
          ) : (
            <li>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { playClick(); navigate('/auth'); }} className={navLinkClasses({ isActive: false })}>
                    Login
                </motion.button>
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <motion.button
              onClick={() => { playClick(); setMenuOpen(true); }}
              className="p-2 border-2 border-transparent"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Open navigation menu"
            >
                <MenuIcon />
            </motion.button>
        </div>
      </nav>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
            <>
                <motion.div
                    variants={backdropVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    onClick={() => { playClick(); setMenuOpen(false); }}
                    className="fixed inset-0 bg-black/50 z-40"
                    aria-hidden="true"
                />
                <motion.div
                    variants={sideMenuVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="fixed top-0 right-0 h-full w-72 bg-white border-l-4 border-primary shadow-lg p-8 z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="menu-heading"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 id="menu-heading" className="text-2xl font-bold">Menu</h2>
                        <motion.button
                            onClick={() => { playClick(); setMenuOpen(false); }}
                            className="p-2 border-2 border-transparent"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Close navigation menu"
                        >
                            <CloseIcon />
                        </motion.button>
                    </div>
                    <MobileNavLinks />
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;