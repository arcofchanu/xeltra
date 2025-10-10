import { useCallback, useRef } from 'react';
import clickSound from '../assets/sfx/click.mp3';

export const useClickSound = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio on first use
    if (!audioRef.current) {
        audioRef.current = new Audio(clickSound);
        audioRef.current.volume = 0.3; // Set volume to 30% to avoid being too loud
    }

    const playClick = useCallback(() => {
        if (audioRef.current) {
            // Reset to start if already playing
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
                // Ignore errors (e.g., user hasn't interacted with page yet)
                console.debug('Click sound play failed:', error);
            });
        }
    }, []);

    return playClick;
};
