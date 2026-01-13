import React from "react";
import { Loader2, UploadCloud } from "lucide-react";

import AudioPlayer from "../../components/SessionDetails/AudioPlayer";
import TranscriptionBlock from "../../components/SessionDetails/TranscriptionBlock";
import ReportSummary from "../../components/Reports/ReportSummary";

export default function SessionDetailsContent({
  sessionId,
  session,
  audioUrl,
  hasAudio,

  uploadError,
  isUploadingAudio,
  onPickAudio,
  onAudioSelected,
  fileInputRef,

  transcriptItems,
}) {
  return (
    <main className="flex flex-col items-center max-w-4xl mx-auto gap-8 pb-20 text-[rgb(var(--text))]">
      {/* AUDIO */}
      <div className="w-full">
        <h2 className="text-[rgb(var(--text-muted))] text-sm font-medium uppercase mb-3">
          Audio Recording
        </h2>

        {hasAudio ? (
          <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
            <AudioPlayer audioUrl={audioUrl} />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgb(var(--border))]">
              {uploadError ? (
                <p className="text-xs text-red-400">{uploadError}</p>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={onPickAudio}
                disabled={isUploadingAudio}
                className="flex items-center gap-2 text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploadingAudio ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} /> Replace Audio File
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 border-2 border-dashed border-[rgb(var(--border))] rounded-2xl text-center bg-black/5 dark:bg-white/5 transition">
            <p className="text-[rgb(var(--text-muted))] mb-4 font-medium">
              No audio recorded for this session yet.
            </p>

            {uploadError && (
              <p className="text-xs text-red-400 mb-3">{uploadError}</p>
            )}

            <button
              type="button"
              onClick={onPickAudio}
              disabled={isUploadingAudio}
              className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--text))] px-4 py-2 rounded-lg text-sm shadow-sm hover:border-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploadingAudio ? "Uploading..." : "Upload Audio Recording"}
            </button>
          </div>
        )}

        {/* Hidden Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
          onChange={onAudioSelected}
        />
      </div>

      {/* TRANSCRIPT */}
      <div className="w-full">
        <TranscriptionBlock transcript={transcriptItems || []} />
        {!transcriptItems && (
          <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
            {["transcribing"].includes(session.status)
              ? "Transcription is in progress…"
              : "No transcript yet."}
          </p>
        )}
      </div>

      {/* REPORT */}
      {session.report && (
        <div className="w-full">
          <ReportSummary report={session.report} />
        </div>
      )}
    </main>
  );
}
