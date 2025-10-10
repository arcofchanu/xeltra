import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useClickSound } from '../utils/useClickSound';

const AuthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
        <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
        <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
        <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
    </svg>
);

const AuthPage = () => {
    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const playClick = useClickSound();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get the path the user was trying to access, if it exists in state
    const from = location.state?.from?.pathname || '/home';

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isSignUp) {
                result = await signUpWithEmail(email, password, name);
                if (!result.error) {
                    setError('Check your email to confirm your account!');
                    setLoading(false);
                    return;
                }
            } else {
                result = await signInWithEmail(email, password);
            }

            if (result.error) {
                setError(result.error.message);
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        playClick();
        setError('');
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
        }
        // Redirect will happen automatically via OAuth flow
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen bg-primary p-4"
        >
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md bg-white p-8 border-4 border-black shadow-brutal"
            >
                <div className="flex justify-center text-primary mb-6">
                    <AuthIcon />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-center">{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
                <p className="text-black/80 text-center mb-6">
                    {isSignUp ? 'Create an account to continue' : 'Welcome back! Please login to continue'}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
                    {isSignUp && (
                        <div>
                            <label htmlFor="name" className="block font-bold mb-2">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Your name"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block font-bold mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block font-bold mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full px-8 py-4 border-2 border-black font-bold bg-primary text-white text-xl hover:bg-black hover:shadow-brutal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: loading ? 1 : 1.05 }}
                        whileTap={{ scale: loading ? 1 : 0.95 }}
                    >
                        {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </motion.button>
                </form>

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-black"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white font-bold">OR</span>
                    </div>
                </div>

                <motion.button
                    onClick={handleGoogleLogin}
                    className="w-full px-8 py-4 border-2 border-black font-bold bg-white text-black hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 mb-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <GoogleIcon />
                    Continue with Google
                </motion.button>

                <div className="text-center mb-4">
                    <button
                        onClick={() => {
                            playClick();
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        className="text-primary font-bold hover:underline"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <motion.button
                    onClick={() => { playClick(); navigate('/home'); }}
                    className="w-full px-8 py-3 border-2 border-black font-bold bg-white text-black hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Go to Home
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default AuthPage;