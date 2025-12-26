import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Rewind, FastForward, Volume2, X } from 'lucide-react';

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase">Audio</h3>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

        {/* Progress Bar */}
        <div className="relative w-full h-1 bg-gray-200 rounded-full mb-4 cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-blue-500 rounded-full shadow"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-blue-500">
              <Rewind size={20} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-gray-400 hover:text-blue-500">
              <FastForward size={20} />
            </button>
            
            <span className="text-xs text-gray-500 font-medium ml-2">
              {formatTime(currentTime)} <span className="mx-1 text-gray-300">/</span> {formatTime(duration || 45 * 60)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center px-3 py-1 bg-gray-50 rounded-full border border-gray-200 text-xs text-gray-600">
              <span>{speed}</span>
              <X size={10} className="mx-1" />
              <span>Speed</span>
            </div>
            <Volume2 size={20} className="text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;