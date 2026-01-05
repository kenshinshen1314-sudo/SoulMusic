import React from 'react';

interface VinylPlayerProps {
  isPlaying: boolean;
  themeColor: string; 
  onToggle: () => void;
  trackName: string;
  artworkUrl?: string;
}

const VinylPlayer: React.FC<VinylPlayerProps> = ({ isPlaying, onToggle, trackName, artworkUrl }) => {
  return (
    <div className="flex flex-col items-center justify-center relative w-64 sm:w-72">
      
      {/* Tone Arm (The Needle) */}
      <div 
        className={`absolute top-[-10px] left-[50%] ml-[-6px] z-20 w-24 h-36 origin-[16px_16px] transition-transform duration-500 ease-in-out pointer-events-none ${isPlaying ? 'rotate-[0deg]' : 'rotate-[-25deg]'}`}
        style={{ transformOrigin: '16px 16px' }}
      >
        {/* Arm Pivot and Structure */}
        <div className="relative w-full h-full">
            {/* Pivot Point */}
            <div className="absolute top-0 left-0 w-8 h-8 bg-neutral-200 rounded-full shadow-lg border-2 border-neutral-400 z-20">
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-neutral-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner"></div>
            </div>
            {/* Arm Bar */}
            <div className="absolute top-4 left-3 w-2 h-24 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-b-lg shadow-md origin-top transform rotate-3"></div>
            {/* Head/Needle */}
            <div className="absolute top-[6.5rem] left-[1.1rem] w-8 h-12 bg-neutral-200 rounded-md transform rotate-12 shadow-md">
                 <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-neutral-400 transform -translate-x-1/2"></div>
            </div>
        </div>
      </div>

      {/* Main Vinyl Record Area */}
      <button 
        onClick={onToggle}
        className="relative group focus:outline-none transition-transform duration-300 active:scale-95 mt-10"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {/* Glow/Shadow behind record */}
        <div className={`absolute inset-0 rounded-full blur-2xl bg-black opacity-40 transition-opacity duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}></div>
        
        {/* The Black Vinyl Disc */}
        <div className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#181818] shadow-2xl flex items-center justify-center overflow-hidden border-[8px] border-gray-900/50`}>
          
          {/* Rotating Container */}
          <div 
            className={`w-full h-full flex items-center justify-center rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`}
            style={{ 
                animationPlayState: isPlaying ? 'running' : 'paused',
                // Adding a subtle radial gradient to simulate vinyl texture grooves
                background: `repeating-radial-gradient(
                  #1a1a1a,
                  #1a1a1a 10px,
                  #111 11px
                )`
            }}
          >
             {/* Album Artwork (Inner Circle) */}
             <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl border-[4px] border-black/80">
                {artworkUrl ? (
                    <img 
                        src={artworkUrl} 
                        alt="Album Art" 
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                    />
                ) : (
                    // Fallback gradient if no artwork
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-800 flex items-center justify-center">
                         <div className="w-4 h-4 rounded-full bg-black/50"></div>
                    </div>
                )}
             </div>
          </div>

          {/* Glass/Shine Reflection Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-full"></div>
        </div>
      </button>

      {/* Status Text */}
      <div className="text-center space-y-1 mt-6 h-12">
        <p className="text-[10px] tracking-[0.2em] font-medium text-white/50 uppercase">
          {isPlaying ? 'Now Playing' : 'Paused'}
        </p>
        <div className="w-48 sm:w-56 truncate mx-auto">
             <p className={`text-sm tracking-wide font-medium text-white transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-70'}`}>
              {trackName}
            </p>
        </div>
      </div>
    </div>
  );
};

export default VinylPlayer;