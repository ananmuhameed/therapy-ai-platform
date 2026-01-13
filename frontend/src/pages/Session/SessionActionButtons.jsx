import React from "react";
import { FiMic, FiUploadCloud } from "react-icons/fi";

export default function SessionActionButtons({ 
  onStart, 
  onCancel,
  onUpload, 
  canProceed, 
  isUploading,
  isRecording
}) {
  const btnBase =
    "min-w-[260px] h-[74px] px-6 rounded-[18px] border border-black/5 flex items-center justify-center gap-3.5 transition-all";
  const btnGray = "bg-[#F5F5F5]";
  const btnActive = "cursor-pointer hover:bg-gray-200 active:scale-[0.98]";
  const btnDisabled = "opacity-55 cursor-not-allowed";

  return (
    <div className="w-full max-w-[620px] flex flex-wrap items-center justify-center gap-6">
      {/* START ↔️ CANCEL */}
      {!isRecording ? (
        <button
          type="button"
          onClick={onStart}
          disabled={!canProceed}
          className={`${btnBase} ${btnGray} ${
            canProceed ? btnActive : btnDisabled
          }`}
        >
          <FiMic size={22} className="text-black/85" />
          <span className="text-base font-semibold text-black">
            Start Recording
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onCancel}
          disabled={isUploading}
          className={`${btnBase} bg-red-600 hover:bg-red-700 text-white shadow-lg font-semibold ${
            isUploading ? btnDisabled : btnActive
          }`}
        >
          Cancel Recording
        </button>
      )}

      {/* Upload */}
      <button
        type="button"
        onClick={onUpload}
        disabled={!canProceed || isUploading || isRecording}
        className={`${btnBase} ${btnGray} ${
          canProceed && !isUploading && !isRecording
            ? btnActive
            : btnDisabled
        }`}
      >
        <FiUploadCloud size={22} className="text-black/85" />
        <span className="text-base font-semibold text-black">
          {isUploading ? "Uploading..." : "Upload Audio"}
        </span>
      </button>
    </div>
  );
}