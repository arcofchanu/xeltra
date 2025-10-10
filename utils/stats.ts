export type UserStats = {
    promptsCompleted: number;
    currentStreak: number;
    longestStreak: number;
    activityLog: string[];
    lastCompletionDate: string | null;
};

export const defaultStats: UserStats = {
    promptsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    activityLog: [],
    lastCompletionDate: null,
};

// Date utility functions
export const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
};
  
export const isYesterday = (d1: Date, d2: Date): boolean => {
    const yesterday = new Date(d2);
    yesterday.setDate(d2.getDate() - 1);
    return isSameDay(d1, yesterday);
};

export const getUserStats = (): UserStats => {
    try {
        const savedStats = localStorage.getItem('userStats');
        if (savedStats) {
            const parsed = JSON.parse(savedStats);
            return { ...defaultStats, ...parsed };
        }
    } catch (error) {
        console.error("Failed to parse user stats:", error);
    }
    return defaultStats;
};

export const saveUserStats = (stats: UserStats) => {
    try {
        localStorage.setItem('userStats', JSON.stringify(stats));
    } catch (error) {
        console.error("Failed to save user stats:", error);
    }
};

export const recordActivity = (isChallengeCompletion: boolean): UserStats => {
    const stats = getUserStats();
    const today = new Date();

    if (stats.lastCompletionDate && isSameDay(new Date(stats.lastCompletionDate), today)) {
        if (isChallengeCompletion) {
            stats.promptsCompleted += 1;
            saveUserStats(stats);
        }
        return stats;
    }

    if (isChallengeCompletion) {
        stats.promptsCompleted += 1;
    }

    const lastCompletion = stats.lastCompletionDate ? new Date(stats.lastCompletionDate) : null;
    
    if (lastCompletion) {
        if (isYesterday(lastCompletion, today)) {
            stats.currentStreak += 1;
        } else {
            stats.currentStreak = 1;
        }
    } else {
        stats.currentStreak = 1;
    }

    if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
    }

    stats.lastCompletionDate = today.toISOString();
    const todayStr = today.toISOString().split('T')[0];
    if (stats.activityLog && !stats.activityLog.includes(todayStr)) {
        stats.activityLog.push(todayStr);
    }

    saveUserStats(stats);
    return stats;
};