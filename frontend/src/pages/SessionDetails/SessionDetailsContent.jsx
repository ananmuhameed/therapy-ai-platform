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
  transcriptPending,
  showReportPending,
  onDeleteSession,
}) {
  if (!session) return <div>Loading...</div>;

  return (
    <main className="flex flex-col items-center max-w-4xl mx-auto gap-8 pb-20">
      {/* AUDIO */}
      <div className="w-full">
        <h2 className="text-gray-500 text-sm font-medium uppercase mb-3">
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
        {transcriptPending ? (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} />
            Transcribing...
          </div>
        ) : (
          <TranscriptionBlock
            transcript={
              session.transcript?.cleaned_transcript
                ? [{ text: session.transcript.cleaned_transcript }]
                : []
            }
          />
        )}
      </div>

      {/* REPORT */}
      <div className="w-full">
        {showReportPending ? (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} />
            Generating report...
          </div>
        ) : session.report ? (
          <ReportSummary report={session.report} />
        ) : null}
      </div>

      {/* DELETE */}
      <div className="flex justify-start mt-6 w-full">
        <button
          type="button"
          onClick={onDeleteSession}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-md transition font-medium text-sm hover:bg-red-700 disabled:opacity-60"
        >
          Delete Session
        </button>
      </div>
    </main>
  );
}
