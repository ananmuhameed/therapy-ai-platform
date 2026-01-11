import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
} from "lucide-react";

export default function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  /* ---------- AUDIO EVENTS ---------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setCurrentTime(audio.duration);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  /* ---------- CONTROLS ---------- */
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const value = Number(e.target.value);
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (e) => {
    const value = Number(e.target.value);
    audioRef.current.volume = value;
    setVolume(value);
  };

  const handleSpeed = (e) => {
    const value = Number(e.target.value);
    audioRef.current.playbackRate = value;
    setSpeed(value);
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play + Progress */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-100"
          type="button"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="flex-1"
        />

        <span className="text-xs text-gray-400 w-14 text-right">
          {Math.floor(currentTime)}s
        </span>
      </div>

      {/* Volume + Speed */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
          />
        </div>

        <select
          value={speed}
          onChange={handleSpeed}
          className="border border-gray-200 rounded px-2 py-1 text-xs"
        >
          <option value="0.75">0.75×</option>
          <option value="1">1×</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2×</option>
        </select>
      </div>
    </div>
  );
}
