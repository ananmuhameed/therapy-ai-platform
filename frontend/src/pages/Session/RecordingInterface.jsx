import React, { useState } from "react";
import { BsStopFill, BsPauseFill, BsPlayFill } from "react-icons/bs";
import Waveform from "../../components/Waveform";
import stream from "./SessionPage.jsx";

export default function RecordingInterface({
  isRecording,
  isPaused,
  onStop,
  onPause,
  onResume,
  isUploading = false, // optional safety
  recordingMs,
  micStream,
}) {
  const ctrlBtn =
    "w-[34px] h-[34px] rounded-[10px] bg-transparent hover:bg-black/5 flex items-center justify-center transition-colors text-[#3078E2]";
  const disabled = "opacity-50 cursor-not-allowed hover:bg-transparent";

  const handleStop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRecording || isUploading) return;

    // 🔴 IMPORTANT:
    // onStop MUST ONLY stop recorder & save audio
    // NO navigate(), NO route changes
    onStop?.();
  };

  const handlePause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRecording || isPaused || isUploading) return;
    onPause?.();
  };

  const handleResume = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPaused || isUploading) return;
    onResume?.();
  };


  const formatMs = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-[640px] h-[86px] rounded-[18px] bg-[#F5F5F5] border border-black/5 flex items-center px-[18px] gap-4 mt-8">
      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleStop}
          disabled={!isRecording || isUploading}
          className={`${ctrlBtn} ${(!isRecording || isUploading) ? disabled : ""}`}
          title="Stop & save recording"
        >
          <BsStopFill size={20} />
        </button>

        {!isPaused ? (
          <button
            type="button"
            onClick={handlePause}
            disabled={!isRecording || isUploading}
            className={`${ctrlBtn} ${(!isRecording || isUploading) ? disabled : ""}`}
            title="Pause"
          >
            <BsPauseFill size={22} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResume}
            disabled={isUploading}
            className={`${ctrlBtn} ${isUploading ? disabled : ""}`}
            title="Resume"
          >
            <BsPlayFill size={22} />
          </button>
        )}
      </div>

      {/* Visualizer + counter */}
      <div className="flex-1 h-full flex items-center gap-3 overflow-hidden min-w-0">
        <div className="flex-1 min-w-0 h-full flex items-center overflow-hidden">
          <Waveform
            active={isRecording}
            paused={isPaused || isUploading}
            stream={micStream}
          />
        </div>

        <div className="shrink-0 font-mono text-sm text-[#3078E2] tabular-nums">
          {formatMs(recordingMs)}
        </div>
      </div>
    </div>
  );
}
