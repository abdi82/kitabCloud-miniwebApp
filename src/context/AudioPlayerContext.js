import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};

export const AudioPlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playlist, setPlaylist] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [originalPlaylist, setOriginalPlaylist] = useState([]); // For shuffle
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeated, setIsRepeated] = useState(false);
    
    const audioRef = useRef(new Audio());
    const audio = audioRef.current;

    // Define event handlers with useCallback
    const handleLoadedMetadata = useCallback(() => {
        setDuration(audio.duration);
    }, [audio]);

    const handleTimeUpdate = useCallback(() => {
        setCurrentTime(audio.currentTime);
    }, [audio]);

    const handleEnded = useCallback(() => {
        if (isRepeated) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Ignore play errors
            });
        } else if (playlist.length > 0 && currentIndex < playlist.length - 1) {
            // Will be handled by playNext if available
        } else if (isShuffled && playlist.length > 1) {
            // Will be handled by playTrack if available
        } else {
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [isRepeated, playlist.length, currentIndex, isShuffled, audio]);

    const handleError = useCallback((error) => {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
    }, []);

    // Initialize audio with better mobile settings
    useEffect(() => {
        audio.preload = 'metadata';
        audio.volume = volume;
        
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('canplaythrough', () => {
            // Mobile optimization - autoplay will be prevented, user interaction required
            audio.play().catch(() => {
                // Ignore autoplay prevention errors
            });
        });

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('play', () => setIsPlaying(true));
            audio.removeEventListener('pause', () => setIsPlaying(false));
            audio.removeEventListener('canplaythrough', () => {});
        };
    }, [volume, handleLoadedMetadata, handleTimeUpdate, handleEnded, handleError, audio]);

    // One stream at a time (like Spotify): playing here takes over from the account's other
    // device; if another device takes over, this one pauses with a message.
    useEffect(() => {
        let beat = null;
        const send = (action) => {
            const token = localStorage.getItem('token');
            if (!token) return Promise.resolve(null);
            return fetch('https://admin.kitabcloud.se/api/playback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action }),
            }).then((r) => r.json()).catch(() => null);
        };
        const onPlay = () => {
            send('start');
            clearInterval(beat);
            beat = setInterval(async () => {
                const res = await send('beat');
                if (res && res.playing_elsewhere) {
                    audio.pause();
                    window.alert(res.message || 'KitabCloud is playing on another device. An account can play on one device at a time.');
                }
            }, 30000);
        };
        const onStop = () => {
            clearInterval(beat);
            send('stop');
        };
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onStop);
        audio.addEventListener('ended', onStop);
        return () => {
            clearInterval(beat);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onStop);
            audio.removeEventListener('ended', onStop);
        };
    }, [audio]);

    // Shuffle playlist utility - unused
    // const shuffleArray = (array) => {
    //     const shuffled = [...array];
    //     for (let i = shuffled.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));
    //         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    //     }
    //     return shuffled;
    // };

    const playTrack = async (track, index = 0, contextTracks = []) => {
        try {
            console.log('playTrack called:', {
                trackTitle: track.title,
                index,
                contextTracksLength: contextTracks.length,
                currentPlaylistLength: playlist.length
            });
            
            // If this is the same track, just toggle play/pause
            if (currentTrack?.id === track.id) {
                if (isPlaying) {
                    audio.pause();
                } else {
                    await audio.play().catch(err => console.log('Play error:', err));
                }
                return;
            }

            // If context tracks provided and no playlist exists, create one
            let newPlaylist = playlist.length > 0 ? playlist : [];
            let newIndex = index;
            
            if (contextTracks.length > 0 && playlist.length === 0) {
                // Auto-populate playlist from context
                newPlaylist = contextTracks;
                newIndex = contextTracks.findIndex(t => t.id === track.id);
                if (newIndex === -1) newIndex = 0;
                console.log('Creating playlist from context:', newPlaylist.length, 'tracks');
                console.log('Track found at index:', newIndex);
                setPlaylist(newPlaylist);
                setOriginalPlaylist(newPlaylist);
            }

            setCurrentTrack(track);
            setCurrentIndex(newIndex);
            
            // Set audio source
            const audioUrl = track.audio_url || track.bookaudio;
            if (audioUrl) {
                console.log('Playing audio from:', audioUrl);
                audio.src = audioUrl;
                audio.currentTime = 0;
                await audio.play().catch(err => {
                    console.log('Play error:', err);
                    // Some mobile browsers require user interaction
                });
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing track:', error);
            setIsPlaying(false);
        }
    };

    const playPlaylist = async (tracks, startIndex = 0) => {
        if (tracks.length === 0) return;
        
        setPlaylist(tracks);
        setOriginalPlaylist(tracks);
        setCurrentIndex(startIndex);
        
        if (tracks[startIndex]) {
            await playTrack(tracks[startIndex], startIndex);
        }
    };

    const pause = useCallback(() => {
        audio.pause();
        setIsPlaying(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resume = useCallback(async () => {
        try {
            await audio.play().catch(err => console.log('Resume error:', err));
            setIsPlaying(true);
        } catch (error) {
            console.error('Error resuming:', error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stop = () => {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const seekTo = (time) => {
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const seekByPercentage = (percentage) => {
        const time = (percentage / 100) * duration;
        seekTo(time);
    };

    const playNext = useCallback(async () => {
        if (playlist.length === 0) return;
        
        let nextIndex = currentIndex;
        
        if (isShuffled) {
            // Shuffle mode: play random track (excluding current)
            do {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } while (nextIndex === currentIndex && playlist.length > 1);
        } else {
            // Normal mode: play next track
            nextIndex = (currentIndex + 1) % playlist.length;
        }
        
        await playTrack(playlist[nextIndex], nextIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlist, currentIndex, isShuffled]);

    const playPrevious = useCallback(async () => {
        if (playlist.length === 0) return;
        
        let prevIndex = currentIndex;
        
        if (isShuffled) {
            // Shuffle mode: play random track (excluding current)
            do {
                prevIndex = Math.floor(Math.random() * playlist.length);
            } while (prevIndex === currentIndex && playlist.length > 1);
        } else {
            // Normal mode: play previous track
            prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
        }
        
        await playTrack(playlist[prevIndex], prevIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlist, currentIndex, isShuffled]);

    const setVolumeLevel = (newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        audio.volume = clampedVolume;
        setVolume(clampedVolume);
    };

    const toggleShuffle = () => {
        setIsShuffled(!isShuffled);
    };

    const toggleRepeat = () => {
        setIsRepeated(!isRepeated);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const value = {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        playlist,
        currentIndex,
        isShuffled,
        isRepeated,
        playTrack,
        playPlaylist,
        pause,
        resume,
        stop,
        seekTo,
        seekByPercentage,
        playNext,
        playPrevious,
        setVolumeLevel,
        toggleShuffle,
        toggleRepeat,
        formatTime
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
}; 