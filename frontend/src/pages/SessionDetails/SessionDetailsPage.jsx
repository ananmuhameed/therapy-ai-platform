import { useRef, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, UploadCloud } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import {
  useSession,
  useGenerateReport,
  useReplaceAudio,
} from "../../queries/sessions";
import api from "../../api/axiosInstance";

import TranscriptionBlock from "../../components/SessionDetails/TranscriptionBlock";
import AudioPlayer from "../../components/SessionDetails/AudioPlayer";
import ReportSummary from "../../components/Reports/ReportSummary";
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
    refetchInterval: forcePoll ? 1500 : false, // faster UX
    refetchIntervalInBackground: true,
  });

  const generateReport = useGenerateReport(sessionId);
  const replaceAudio = useReplaceAudio(sessionId);

  const generatingReport = generateReport.isPending;
  const uploadingAudio = replaceAudio.isPending;

  const transcriptStatus = session?.transcript?.status;
  const reportStatus = session?.report?.status;

  const transcriptDone = DONE.includes(transcriptStatus);
  const reportDone = DONE.includes(reportStatus);

  const transcriptPending = !!session && (!session.transcript || !transcriptDone);

  // If your backend always auto-generates report after transcription, treat missing report as pending
  const reportPendingAuto = !!session && (!session.report || !reportDone);

  // If user clicked Generate report manually
  const reportPendingManual =
    !!session && waitingForReport && (!session.report || !reportDone);

  const showReportPending = reportPendingManual || reportPendingAuto;

  // ✅ AUTO-START POLLING on mount/navigation:
  // When we arrive from "stop recording", transcript/report aren't ready yet.
  useEffect(() => {
    if (!session) return;

    const needsPolling = transcriptPending || showReportPending;

    if (needsPolling) setForcePoll(true);
    else setForcePoll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session?.id,
    session?.updated_at,
    transcriptPending,
    showReportPending,
  ]);

  // ✅ Stop polling correctly
  useEffect(() => {
    if (!forcePoll || !session) return;

    // If waitingForReport, stop only when report exists and done/failed
    if (waitingForReport) {
      if (session.report && reportDone) {
        setForcePoll(false);
        setWaitingForReport(false);
      }
      return;
    }

    // Auto flow: stop when both are done (or exist+done)
    if (transcriptDone && session.report && reportDone) {
      setForcePoll(false);
    }

    // If transcript is done but report isn't created yet, keep polling (important)
  }, [
    forcePoll,
    waitingForReport,
    session,
    transcriptDone,
    reportDone,
  ]);

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

    // after replacing audio, transcription + report will be regenerated
    setWaitingForReport(false);
    setForcePoll(true);

    replaceAudio.mutate(file, {
      onSettled: () => refetch(),
    });

    event.target.value = "";
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

  const audioUrl = session.audio_url || session.audio?.audio_url || null;

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

          {audioUrl ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <AudioPlayer audioUrl={audioUrl} />

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
            <ReportSummary report={session.report} onEdit={() => setEditOpen(true)} />
          ) : null}
        </div>
      </main>
    </div>
  );
}
