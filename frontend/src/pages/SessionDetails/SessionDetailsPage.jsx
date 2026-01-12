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
import { useDeleteSession } from "../../hooks/useDeleteSession";
import SessionDetailsContent from "./SessionDetailsContent"; 
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
  const { deleteSession } = useDeleteSession();

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

  const handleDeleteSessionFromSessionDetails = (sessionId) => {
    deleteSession(sessionId); // use the hook
  };

  const handleDownloadPdf = async () => {
    const res = await api.get(`/sessions/${sessionId}/report/pdf/`, {
      responseType: "blob",
    });

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

      {/* REPLACE EVERYTHING FROM HERE DOWN WITH SessionDetailsContent */}
      <SessionDetailsContent
        sessionId={sessionId}
        session={session}
        audioUrl={session.audio_url}
        hasAudio={!!session.audio_url}
        uploadError={null}
        isUploadingAudio={uploadingAudio}
        onPickAudio={() => fileInputRef.current?.click()}
        onAudioSelected={handleReplaceAudio}
        fileInputRef={fileInputRef}
        transcriptItems={
          session.transcript?.cleaned_transcript
            ? [{ text: session.transcript.cleaned_transcript }]
            : []
        }
        onDeleteSession={handleDeleteSessionFromSessionDetails}
      />
      {/* END REPLACEMENT */}
    </div>
  );
}
