import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Download,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import {
  useSession,
  useGenerateReport,
  useReplaceAudio,
} from "../../queries/sessions";

import TranscriptionBlock from "../../components/SessionDetails/TranscriptionBlock";
import AudioPlayer from "../../components/SessionDetails/AudioPlayer";
import ReportSummary from "../../components/Reports/ReportSummary";

export default function SessionDetailsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { data: session, isLoading, isError, refetch } = useSession(sessionId);

  const generateReport = useGenerateReport(sessionId);
  const replaceAudio = useReplaceAudio(sessionId);

  const generatingReport = generateReport.isPending;
  const uploadingAudio = replaceAudio.isPending;

  const handleGenerateReport = () => generateReport.mutate();

  const handleReplaceAudio = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      session?.audio_url &&
      !window.confirm("Replace current audio? This will restart transcription.")
    ) {
      event.target.value = "";
      return;
    }

    replaceAudio.mutate(file);
    event.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-[rgb(var(--text))]">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="text-center mt-10 text-[rgb(var(--text))]">
        Session not found
        <div className="mt-3">
          <button
            className="text-[rgb(var(--primary))] underline"
            onClick={() => refetch()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] p-8 mt-6 text-[rgb(var(--text))]">
      {/* HEADER */}
      <header className="flex justify-between items-start mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-[rgb(var(--primary))] hover:opacity-90 text-white p-2 rounded-full shadow-lg transition"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold">
              {session.patient_name || `Patient #${session.patient}`}
            </h1>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs uppercase font-medium bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-[rgb(var(--text-muted))]">
                Session #{session.id}
              </span>
              <span className="text-xs uppercase font-medium text-[rgb(var(--text-muted))]">
                {formatDate(session.session_date || session.created_at)}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                  session.status === "completed"
                    ? "text-green-400 bg-green-500/10"
                    : "text-blue-400 bg-blue-500/10"
                }`}
              >
                {session.status}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        {session.report?.status === "completed" ? (
          <button
            onClick={() =>
              window.open(
                `http://localhost:8000/api/sessions/${sessionId}/download_pdf/`,
                "_blank"
              )
            }
            className="flex items-center gap-2 bg-[rgb(var(--primary))] hover:opacity-90 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
            type="button"
          >
            <Download size={16} /> Download Report
          </button>
        ) : (
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport || session.status === "analyzing"}
            className="flex items-center gap-2 bg-[rgb(var(--primary))] hover:opacity-90 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
            type="button"
          >
            {generatingReport ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>Generate AI Report</span>
          </button>
        )}
      </header>

      <main className="flex flex-col items-center max-w-4xl mx-auto gap-8 pb-20">
        {/* AUDIO SECTION */}
        <div className="w-full">
          <h2 className="text-[rgb(var(--text-muted))] text-sm font-medium uppercase mb-3">
            Audio Recording
          </h2>

          {session.audio_url ? (
            <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
              <AudioPlayer audioUrl={session.audio_url} />

              <div className="flex justify-end mt-4 pt-4 border-t border-[rgb(var(--border))]">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAudio}
                  className="flex items-center gap-2 text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition disabled:opacity-60"
                  type="button"
                >
                  {uploadingAudio ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UploadCloud size={14} />
                  )}
                  Replace Audio File
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 border-2 border-dashed border-[rgb(var(--border))] rounded-2xl text-center bg-black/5 dark:bg-white/5 transition">
              <p className="text-[rgb(var(--text-muted))] mb-4 font-medium">
                No audio recorded for this session yet.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAudio}
                className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--text))] px-4 py-2 rounded-lg text-sm shadow-sm hover:border-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] transition disabled:opacity-60"
                type="button"
              >
                {uploadingAudio ? "Uploading..." : "Upload Audio Recording"}
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="audio/*"
            onChange={handleReplaceAudio}
          />
        </div>

        {/* TRANSCRIPT */}
        <div className="w-full">
          <TranscriptionBlock
            transcript={
              session.transcript?.cleaned_transcript
                ? [{ text: session.transcript.cleaned_transcript }]
                : []
            }
          />
        </div>

        {/* REPORT */}
        {session.report && (
          <div className="w-full">
            <ReportSummary report={session.report} />
          </div>
        )}
      </main>
    </div>
  );
}
