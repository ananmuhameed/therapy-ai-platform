import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  // Helper: set duration safely
  const updateDuration = (audio) => {
    const d = audio?.duration;
    setDuration(Number.isFinite(d) ? d : 0);
  };

  /* ---------- AUDIO EVENTS ---------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset UI for new audio source
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);

    const fixInfinityDuration = async () => {
      // WebM/Opus sometimes gives Infinity until you force a seek
      if (audio.duration === Infinity) {
        try {
          audio.currentTime = 1e101; // jump far to force duration calculation
          await new Promise((r) => setTimeout(r, 60));
          audio.currentTime = 0;
        } catch {}
      }
    };

    const onLoadedMetadata = async () => {
      await fixInfinityDuration();
      updateDuration(audio);
    };

    const onDurationChange = () => updateDuration(audio);

    const onEnded = () => {
      setCurrentTime(audio.duration || currentTime);
      setIsPlaying(false);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // Also apply persisted controls
    audio.volume = volume;
    audio.playbackRate = speed;

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
    // IMPORTANT: re-run when audioUrl changes
  }, [audioUrl]); // ✅ not []

  /* ---------- CONTROLS ---------- */
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (e) {
      // autoplay restrictions / decode errors
      console.error("Audio play failed:", e);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const value = Number(e.target.value);
    audio.volume = value;
    setVolume(value);
  };

  const handleSpeed = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const value = Number(e.target.value);
    audio.playbackRate = value;
    setSpeed(value);
  };

  const max = duration > 0 ? duration : 0;

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
          max={max}
          step="0.1"
          value={Math.min(currentTime, max)}
          onChange={handleSeek}
          className="flex-1"
        />

        <span className="text-xs text-gray-400 w-20 text-right">
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
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
