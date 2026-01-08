import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Download, Sparkles, UploadCloud } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import {
  useSession,
  useGenerateReport,
  useReplaceAudio,
} from "../../queries/sessions";
import api from "../../api/axiosInstance";

// Components
import TranscriptionBlock from "../../components/SessionDetails/TranscriptionBlock";
import AudioPlayer from "../../components/SessionDetails/AudioPlayer";
import ReportSummary from "../../components/Reports/ReportSummary";
import SessionDetailsHeader from "./SessionDetailsHeader";

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

  const handleDownloadPdf = async () => {
    const res = await api.get(
      `/sessions/${sessionId}/report/pdf/`,
      { responseType: "blob" }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `therapy_report_session_${sessionId}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="text-center mt-10">
        Session not found
        <div className="mt-3">
          <button
            className="text-blue-600 underline"
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
    <div className="min-h-screen bg-white p-8 mt-6">
      <SessionDetailsHeader
        meta={{
          patientLabel: session.patient_name || `Patient #${session.patient}`,
          sessionLabel: `Session #${session.id}`,
          dateLabel: formatDate(session.session_date || session.created_at),
          status: session.status,
          reportStatus: session.report?.status,
        }}
        generatingReport={generatingReport}
        onBack={() => navigate(-1)}
        onGenerateReport={handleGenerateReport}
        onDownloadPdf={handleDownloadPdf}
      />

      <main className="flex flex-col items-center max-w-4xl mx-auto gap-8 pb-20">
        {/* AUDIO */}
        <div className="w-full">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-3">
            Audio Recording
          </h2>

          {session.audio_url ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <AudioPlayer audioUrl={session.audio_url} />
              <div className="flex justify-end mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAudio}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-blue-600 transition disabled:opacity-60"
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
            <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAudio}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
                type="button"
              >
                Upload Audio Recording
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
