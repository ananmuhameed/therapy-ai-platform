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
  onDeleteSession,
}) {
  if (!session) {
    // Optionally, render a loading state if session is not yet loaded
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-col items-center max-w-4xl mx-auto gap-8 pb-20">
      {/* AUDIO */}
      <div className="w-full">
        <h2 className="text-gray-500 text-sm font-medium uppercase mb-3">
          Audio Recording
        </h2>

        {hasAudio ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <AudioPlayer audioUrl={audioUrl} />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : <span />}

              <button
                type="button"
                onClick={onPickAudio}
                disabled={isUploadingAudio}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50 hover:bg-gray-50 transition">
            <p className="text-gray-500 mb-4 font-medium">
              No audio recorded for this session yet.
            </p>

            {uploadError && <p className="text-xs text-red-600 mb-3">{uploadError}</p>}

            <button
              type="button"
              onClick={onPickAudio}
              disabled={isUploadingAudio}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-white hover:border-blue-400 hover:text-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
          <p className="text-xs text-gray-400 mt-2">
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

      {/* DELETE */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => onDeleteSession(sessionId)}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-md transition font-medium text-sm hover:bg-red-700"
        >
          Delete Session
        </button>
      </div>
    </main>
  );
}
