import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { defaultStats, getUserStats, recordActivity, isSameDay } from '../utils/stats';
import { useAuth } from '../contexts/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
};
  
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

// Icons
const PromptsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M2 15h10"/><path d="m5 12-3 3 3 3"/></svg> );
const StreakIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> );
const TrophyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> );
const ChevronIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6" /></svg> );


const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <motion.div
        variants={itemVariants}
        className="bg-white p-6 border-4 border-black shadow-brutal flex items-start gap-4"
    >
        <div className={`p-3 border-2 border-black ${color}`}>{icon}</div>
        <div>
            <p className="text-black/70 font-bold uppercase tracking-widest text-sm">{title}</p>
            <p className="text-5xl font-extrabold text-black">{value}</p>
        </div>
    </motion.div>
);

const ActivityCalendar = ({ activityLog }: { activityLog: Set<string> }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { month, year, daysInMonth, firstDayOfMonth } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return {
            month,
            year,
            daysInMonth: new Date(year, month + 1, 0).getDate(),
            firstDayOfMonth: new Date(year, month, 1).getDay(),
        };
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };
    
    const today = new Date();

    return (
        <motion.div variants={itemVariants} className="bg-white p-4 border-4 border-black shadow-brutal">
            <div className="flex justify-between items-center mb-2">
                <button onClick={() => changeMonth(-1)} className="p-2 border-2 border-black hover:bg-primary hover:text-white" aria-label="Previous month"><ChevronIcon className="transform rotate-180" /></button>
                <h3 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long' })} {year}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 border-2 border-black hover:bg-primary hover:text-white" aria-label="Next month"><ChevronIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-black/60 text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const date = new Date(year, month, day + 1);
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = date.toDateString() === today.toDateString();
                    const isActive = activityLog.has(dateStr);

                    let classes = "w-full aspect-square flex items-center justify-center text-sm border-2 ";
                    if (isActive) {
                        classes += "bg-primary text-white border-black font-bold";
                    } else if (isToday) {
                        classes += "bg-gray-200 border-black font-bold";
                    } else {
                        classes += "bg-white border-gray-200";
                    }
                    return <div key={dateStr} className={classes}>{day + 1}</div>
                })}
            </div>
        </motion.div>
    )
}

const TimeCard = ({ value, label }: { value: string, label: string }) => (
    <div className="bg-gray-100 border-2 border-black p-3 text-center">
        <p className="text-3xl lg:text-4xl font-extrabold text-primary">{value}</p>
        <p className="text-xs font-bold uppercase tracking-wider text-black/60">{label}</p>
    </div>
);


const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(defaultStats);
    const [timeRemaining, setTimeRemaining] = useState<{ status: 'active' | 'reset' | 'idle', hours: number, minutes: number, seconds: number }>({ status: 'idle', hours: 0, minutes: 0, seconds: 0 });
    const [canCheckIn, setCanCheckIn] = useState(false);

    useEffect(() => {
        setStats(getUserStats());
    }, []);
    
    useEffect(() => {
        const today = new Date();
        const lastCompletion = stats.lastCompletionDate ? new Date(stats.lastCompletionDate) : null;
        // User can check in if they haven't completed anything today.
        setCanCheckIn(!lastCompletion || !isSameDay(lastCompletion, today));
    }, [stats.lastCompletionDate]);

    useEffect(() => {
        const timerId = setInterval(() => {
            if (stats.currentStreak > 0 && stats.lastCompletionDate) {
                const lastCompletionTime = new Date(stats.lastCompletionDate).getTime();
                const gracePeriod = 1.4 * 24 * 60 * 60 * 1000; // 1.4 days in milliseconds
                const deadline = lastCompletionTime + gracePeriod;
                const now = Date.now();
                const remaining = deadline - now;

                if (remaining <= 0) {
                    const newStats = { ...stats, currentStreak: 0 };
                    setStats(newStats);
                    localStorage.setItem('userStats', JSON.stringify(newStats));
                    setTimeRemaining({ status: 'reset', hours: 0, minutes: 0, seconds: 0 });
                } else {
                    const hours = Math.floor(remaining / (1000 * 60 * 60));
                    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                    setTimeRemaining({ status: 'active', hours, minutes, seconds });
                }
            } else {
                setTimeRemaining({ status: 'idle', hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [stats]);


    const activitySet = useMemo(() => new Set(stats.activityLog), [stats.activityLog]);

    const handleStreakCheckIn = () => {
        const newStats = recordActivity(false);
        setStats(newStats);
    };

    if (!user) {
        // This should not be reached due to ProtectedRoute, but it's a good safeguard.
        return null;
    }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-4xl font-bold text-black mb-6 border-b-2 border-primary pb-2">Profile</h1>
      
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="bg-white p-6 border-4 border-black shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <img src={user.photoUrl} alt="User profile" className="w-24 h-24 rounded-full border-4 border-primary" />
            <div>
                <h2 className="text-3xl font-bold text-black">{user.name}</h2>
                <p className="text-lg text-black/70">{user.email}</p>
            </div>
          </div>
          <motion.button
            onClick={logout}
            className="px-6 py-3 border-2 border-black font-bold bg-white text-black hover:bg-red-500 hover:text-white hover:shadow-brutal transition-colors w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard title="Zone Prompts Completed" value={stats.promptsCompleted} icon={<PromptsIcon />} color="bg-blue-300" />
          <StatCard title="Current Streak" value={stats.currentStreak} icon={<StreakIcon />} color="bg-red-300" />
          <StatCard title="Longest Streak" value={stats.longestStreak} icon={<TrophyIcon />} color="bg-yellow-300" />
        </motion.div>

        <motion.div 
          variants={containerVariants} 
          className="grid grid-cols-1 gap-8 mt-8"
        >
            <motion.div variants={itemVariants} className="bg-white p-4 border-4 border-black shadow-brutal flex flex-col justify-between">
              <div className='flex-grow'>
                  <h3 className="text-xl font-bold mb-4">Your Activity Streak</h3>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center text-center gap-6 my-4">
                      <div>
                          <p className="text-7xl lg:text-8xl font-extrabold text-black">{stats.currentStreak}</p>
                          <p className="font-bold uppercase tracking-widest text-black/70">{stats.currentStreak === 1 ? "Day" : "Days"}</p>
                      </div>
                  </div>

                  {timeRemaining.status === 'active' && (
                      <div className="mb-4">
                          <p className="text-center font-bold text-black/80 mb-3">Time until streak resets:</p>
                          <div className="grid grid-cols-3 gap-2 md:gap-4">
                              <TimeCard value={String(timeRemaining.hours).padStart(2, '0')} label="Hours" />
                              <TimeCard value={String(timeRemaining.minutes).padStart(2, '0')} label="Minutes" />
                              <TimeCard value={String(timeRemaining.seconds).padStart(2, '0')} label="Seconds" />
                          </div>
                      </div>
                  )}
                  {timeRemaining.status === 'reset' && (
                        <p className="text-center font-bold text-red-500 mb-4">Your streak has been reset. Start a new one!</p>
                  )}
                  {timeRemaining.status === 'idle' && (
                        <p className="text-center text-black/80 mb-4">Start a streak by completing a challenge in the Zone or checking in below.</p>
                  )}
              </div>
              <div className='mt-auto'>
                  <motion.button
                    onClick={handleStreakCheckIn}
                    className="w-full mt-2 px-4 py-3 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: canCheckIn ? 1.02 : 1 }}
                    whileTap={{ scale: canCheckIn ? 0.98 : 1 }}
                    disabled={!canCheckIn}
                  >
                    {canCheckIn ? "Maintain Streak (Check-in for today)" : "Already Checked In Today"}
                  </motion.button>
                  <p className="text-xs text-center text-black/60 mt-2">
                      Check-in daily or complete a Zone challenge to keep your streak alive.
                  </p>
              </div>
            </motion.div>
            
            <ActivityCalendar activityLog={activitySet} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;