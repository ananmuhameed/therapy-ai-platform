import React from "react";
import { BsStopFill, BsPauseFill, BsPlayFill } from "react-icons/bs";
import Waveform from "../../components/Waveform"; // Assuming Waveform is in global components

export default function RecordingInterface({ 
  isRecording, 
  isPaused, 
  onStop, 
  onPause, 
  onResume 
}) {
  const ctrlBtn = "w-[34px] h-[34px] rounded-[10px] bg-transparent hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer text-[#3078E2]";

  return (
    <div className="w-full max-w-[640px] h-[86px] rounded-[18px] bg-[#F5F5F5] border border-black/5 flex items-center px-[18px] gap-4 mt-8">
      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <button onClick={onStop} className={ctrlBtn} title="Stop">
          <BsStopFill size={20} />
        </button>

        {!isPaused ? (
          <button onClick={onPause} className={ctrlBtn} title="Pause">
            <BsPauseFill size={22} />
          </button>
        ) : (
          <button onClick={onResume} className={ctrlBtn} title="Resume">
            <BsPlayFill size={22} />
          </button>
        )}
      </div>

      {/* Visualizer */}
      <div className="flex-1 h-full flex items-center overflow-hidden">
        <Waveform active={isRecording} paused={isPaused} />
      </div>
    </div>
  );
}