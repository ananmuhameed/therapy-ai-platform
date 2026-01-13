import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import SessionDetailsContent from "./SessionDetailsContent";
import { useRef, useState, useEffect } from "react";
import {
  useSession,
  useGenerateReport,
  useReplaceAudio,
  useDeleteSession,
} from "../../queries/sessions";
import api from "../../api/axiosInstance";
import SessionDetailsHeader from "./SessionDetailsHeader";

const DONE = ["completed", "failed"];

export default function SessionDetailsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // polling control
  const [forcePoll, setForcePoll] = useState(false);
  const [waitingForReport, setWaitingForReport] = useState(false);

  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useSession(sessionId, {
    refetchInterval: forcePoll ? 1500 : false,
    refetchIntervalInBackground: true,
  });

  const generateReport = useGenerateReport(sessionId);
  const replaceAudio = useReplaceAudio(sessionId);
  const deleteSession = useDeleteSession(); // confirmation inside hook

  const generatingReport = generateReport.isPending;
  const uploadingAudio = replaceAudio.isPending;

  const transcriptStatus = session?.transcript?.status;
  const reportStatus = session?.report?.status;

  const transcriptDone = DONE.includes(transcriptStatus);
  const reportDone = DONE.includes(reportStatus);

  const transcriptPending = !!session && (!session.transcript || !transcriptDone);

  // backend auto-generates report after transcription
  const reportPendingAuto = !!session && (!session.report || !reportDone);

  // user clicked "Generate report"
  const reportPendingManual =
    !!session && waitingForReport && (!session.report || !reportDone);

  const showReportPending = reportPendingManual || reportPendingAuto;

  // Start/stop polling based on status
  useEffect(() => {
    if (!session) return;

    const needsPolling = transcriptPending || showReportPending;
    setForcePoll(needsPolling);
  }, [session?.id, session?.updated_at, transcriptPending, showReportPending]);

  // Stop polling when finished
  useEffect(() => {
    if (!forcePoll || !session) return;

    if (waitingForReport) {
      if (session.report && reportDone) {
        setForcePoll(false);
        setWaitingForReport(false);
      }
      return;
    }

    if (transcriptDone && session.report && reportDone) {
      setForcePoll(false);
    }
  }, [forcePoll, waitingForReport, session, transcriptDone, reportDone]);

  const handleGenerateReport = () => {
    setWaitingForReport(true);
    setForcePoll(true);

    generateReport.mutate(undefined, {
      onSettled: () => refetch(),
    });
  };

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

    setWaitingForReport(false);
    setForcePoll(true);

    replaceAudio.mutate(file, {
      onSettled: () => refetch(),
    });

    event.target.value = "";
  };

  const handleDeleteSession = () => {
    deleteSession.mutate(sessionId, {
      onSuccess: () => navigate("/sessions"),
    });
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

  const audioUrl = session.audio_url || session.audio?.audio_url || null;
  const hasAudio = !!audioUrl;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] p-8 mt-6 text-[rgb(var(--text))]">
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

      <SessionDetailsContent
        sessionId={sessionId}
        session={session}
        audioUrl={audioUrl}
        hasAudio={hasAudio}
        uploadError={null}
        isUploadingAudio={uploadingAudio}
        onPickAudio={() => fileInputRef.current?.click()}
        onAudioSelected={handleReplaceAudio}
        fileInputRef={fileInputRef}
        transcriptPending={transcriptPending}
        showReportPending={showReportPending}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
