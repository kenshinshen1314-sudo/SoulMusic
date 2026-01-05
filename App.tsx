import React, { useState, useRef, useEffect, useCallback } from 'react';
import { THEMES } from './constants';
import { ThemeType, TimerDuration, Track } from './types';
import VinylPlayer from './components/VinylPlayer';

const App: React.FC = () => {
  // State
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(ThemeType.WAVES);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(null);
  
  // Playlist State
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Visitor Count State
  const [visitorCount, setVisitorCount] = useState<number>(1);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const themeConfig = THEMES[currentTheme];

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio();
    // We do NOT set loop=true because we want to play through the list of 5 tracks
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Initialize Visitor Count
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem('soul_station_visits');
      let count = 1;
      
      if (storedCount) {
        const parsed = parseInt(storedCount, 10);
        if (!isNaN(parsed)) {
          count = parsed + 1;
        }
      }
      
      localStorage.setItem('soul_station_visits', count.toString());
      setVisitorCount(count);
    } catch (e) {
      console.error("Failed to update visitor count", e);
    }
  }, []);

  // Handle Playlist Navigation (Next Track on End)
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      // Play next track automatically
      setCurrentTrackIndex((prev) => {
         if (playlist.length === 0) return 0;
         return (prev + 1) % playlist.length;
      });
    };

    audioRef.current.addEventListener('ended', handleEnded);
    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [playlist]);

  // Fetch Tracks from iTunes
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      setIsPlaying(false); // Stop playback while switching themes/loading
      if (audioRef.current) audioRef.current.pause();

      try {
        const term = themeConfig.searchTerm;
        // Fetch 15 to ensure we have enough good results, but we'll slice to 5
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=15`);
        const data = await response.json();
        
        // Map iTunes results to our Track interface
        // We filter for tracks that have a previewUrl
        const newTracks: Track[] = data.results
          .filter((item: any) => item.previewUrl)
          .map((item: any) => ({
            id: item.trackId.toString(),
            title: item.trackName,
            src: item.previewUrl,
            // Get high-res artwork by replacing 100x100 with 600x600 in the URL
            artworkUrl: item.artworkUrl100?.replace('100x100', '600x600')
          }))
          .slice(0, 5); // Take top 5

        setPlaylist(newTracks);
        setCurrentTrackIndex(0);
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        setPlaylist([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [currentTheme]);

  // Handle Track Source Update
  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      const track = playlist[currentTrackIndex];
      // Only update src if it's different
      if (audioRef.current.src !== track.src) {
        audioRef.current.src = track.src;
        // If we have a playlist and we are just changing tracks (not theme), we might want to auto play
        // But here we rely on isPlaying state or explicit toggle for start.
        // However, if we were already playing (isPlaying is true), we should resume.
        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Playback error on track change:", e);
                    setIsPlaying(false);
                });
            }
        }
      }
    }
  }, [playlist, currentTrackIndex]); // removed isPlaying from deps to avoid double triggers

  // Timer Logic
  const startTimer = useCallback((minutes: TimerDuration) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (minutes !== null) {
      console.log(`Timer set for ${minutes} minutes`);
      timerRef.current = window.setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setTimerDuration(null); // Reset UI
      }, minutes * 60 * 1000);
    }
  }, []);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current || playlist.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (timerDuration) startTimer(timerDuration);
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(true);
        if (timerDuration) startTimer(timerDuration);
      }
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (playlist.length ? (prev + 1) % playlist.length : 0));
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (playlist.length ? (prev - 1 + playlist.length) % playlist.length : 0));
  };

  const handleTimerChange = (minutes: TimerDuration) => {
    setTimerDuration(minutes);
    
    // Always start/reset timer logic when button is clicked
    startTimer(minutes);

    // Auto-play if not already playing
    if (!isPlaying && audioRef.current && playlist.length > 0) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Timer auto-play failed:", error);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    if (currentTheme !== newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  // Get current track details safely
  const currentTrack = playlist[currentTrackIndex];
  const currentTrackTitle = currentTrack ? currentTrack.title : "Loading...";
  const currentTrackArtwork = currentTrack?.artworkUrl;

  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 ease-in-out ${themeConfig.gradient} text-white flex flex-col items-center relative overflow-hidden`}>
      
      {/* Background Ambience Overlay (Noise/Texture) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center h-full min-h-screen justify-between">
        
        {/* Header */}
        <div className="flex flex-col items-center w-full space-y-4">
          <h1 className="font-serif-custom text-5xl md:text-6xl text-white tracking-wide drop-shadow-lg text-center">
            Soul Station
          </h1>
          <div className="w-16 h-[1px] bg-white/40"></div>
          <p className="text-xs md:text-sm tracking-[0.3em] font-light uppercase text-white/80">
            Find Your Sanctuary
          </p>
        </div>

        {/* Quote */}
        <div className="my-8 md:my-12 px-4">
          <p className="font-serif-custom text-2xl md:text-3xl text-center leading-relaxed italic text-white/90 drop-shadow-md transition-all duration-700 ease-in-out key={themeConfig.quote}">
            {themeConfig.quote}
          </p>
        </div>

        {/* Controls Container */}
        <div className="w-full flex flex-col items-center space-y-8">
          
          {/* Theme Selectors */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-sm mb-2">
             {(['RAIN', 'BIRDS', 'WAVES', 'FIRE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(ThemeType[t])}
                  disabled={isLoading && currentTheme === ThemeType[t]}
                  className={`
                    px-2 py-3 rounded-full text-[10px] md:text-xs font-medium tracking-widest uppercase transition-all duration-300 border border-white/20
                    ${currentTheme === ThemeType[t] 
                      ? 'bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' 
                      : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  {THEMES[ThemeType[t]].label}
                </button>
             ))}
          </div>
          {/* Center Bottom Theme (Forest) */}
          <div className="flex justify-center w-full -mt-2">
            <button
                  onClick={() => handleThemeChange(ThemeType.FOREST)}
                  disabled={isLoading && currentTheme === ThemeType.FOREST}
                  className={`
                    px-8 py-3 rounded-full text-[10px] md:text-xs font-medium tracking-widest uppercase transition-all duration-300 border border-white/20
                    ${currentTheme === ThemeType.FOREST
                      ? 'bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' 
                      : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  FOREST
            </button>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center space-x-6 md:space-x-8 pt-4">
            <TimerButton 
              label="15m" 
              isActive={timerDuration === 15} 
              onClick={() => handleTimerChange(15)} 
            />
            <TimerButton 
              label="30m" 
              isActive={timerDuration === 30} 
              onClick={() => handleTimerChange(30)} 
            />
            <TimerButton 
              label="1h" 
              isActive={timerDuration === 60} 
              onClick={() => handleTimerChange(60)} 
            />
             <TimerButton 
              label="∞" 
              isActive={timerDuration === null} 
              onClick={() => handleTimerChange(null)} 
            />
          </div>

          {/* Player & Controls */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 w-full mt-2">
            {/* Prev Button */}
            <button 
              onClick={prevTrack} 
              disabled={playlist.length <= 1}
              className="text-white/60 hover:text-white transition-colors p-2 focus:outline-none disabled:opacity-30 z-20"
              aria-label="Previous Track"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
               </svg>
            </button>

            <VinylPlayer 
              isPlaying={isPlaying} 
              themeColor={themeConfig.accentColor} 
              onToggle={togglePlay}
              trackName={isLoading ? "Loading..." : currentTrackTitle}
              artworkUrl={currentTrackArtwork}
            />

            {/* Next Button */}
            <button 
              onClick={nextTrack} 
              disabled={playlist.length <= 1}
              className="text-white/60 hover:text-white transition-colors p-2 focus:outline-none disabled:opacity-30 z-20"
              aria-label="Next Track"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
               </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full pt-8 flex flex-col items-center">
          <div className="w-full h-[1px] bg-white/10 mb-6"></div>
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            {visitorCount} Souls have paused here
          </p>
        </div>

      </div>
    </div>
  );
};

// Helper Component for Timer Buttons
const TimerButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      text-xs md:text-sm font-medium transition-all duration-300
      ${isActive ? 'text-white scale-110 drop-shadow-lg' : 'text-white/40 hover:text-white/70'}
    `}
  >
    {label}
  </button>
);

export default App;