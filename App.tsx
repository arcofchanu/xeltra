import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import StartPage from './components/StartPage';
import HomePage from './components/HomePage';
import PlaygroundPage from './components/PlaygroundPage';
import DungeonPage from './components/DungeonPage';
import ProfilePage from './components/ProfilePage';
import AboutUsPage from './components/AboutUsPage';
import DetailPage from './components/DetailPage';
import QuizPage from './components/QuizPage';
import ResourcePage from './components/ResourcePage';
import StreakPopup from './components/StreakPopup';
import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

// Fix: Removed React.FC to allow for correct type inference of framer-motion props in child components.
const App = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-black">
      {location.pathname !== '/' && !isAuthPage && <Header />}
      <main className={(location.pathname === '/' || isAuthPage) ? '' : 'flex-grow container mx-auto p-4 md:p-8'}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<StartPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/resource/:topic" element={<ResourcePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/detail/:name" element={<DetailPage />} />

            {/* Protected Routes */}
            <Route path="/dungeon" element={<ProtectedRoute><DungeonPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/quiz/:topic/:difficulty" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
      {location.pathname !== '/' && !isAuthPage && <StreakPopup />}
    </div>
  );
};

// Fix: Swapped HashRouter and AuthProvider so that AuthProvider has access to routing context.
const AppWrapper = () => (
  <HashRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HashRouter>
);

export default AppWrapper;