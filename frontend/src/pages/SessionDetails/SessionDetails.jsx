import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Download, Sparkles, UploadCloud } from "lucide-react";
import api from "../../api/axiosInstance";
import { formatDate } from "../../utils/helpers";

// Components
import TranscriptionBlock from "../../components/SessionDetails/TranscriptionBlock";
import AudioPlayer from "../../components/SessionDetails/AudioPlayer";
import ReportSummary from "../../components/Reports/ReportSummary";

export default function SessionDetails() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  // upload state
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  const fetchSession = async () => {
    try {
      const { data } = await api.get(`/sessions/${sessionId}/`);
      setSession(data);
    } catch (e) {
      console.error("Error fetching session:", e);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ✅ Poll while async jobs run (transcribe/analyze)
  useEffect(() => {
    if (!sessionId || !session) return;

    const shouldPoll = ["transcribing", "analyzing"].includes(session.status);
    if (!shouldPoll) return;

    const t = setInterval(() => fetchSession(), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, session?.status]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await api.post(`/sessions/${sessionId}/generate_report/`);
      // no alert spam; let polling refresh status
      fetchSession();
    } catch (error) {
      alert("Failed to start report generation.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // ✅ Get audio url from BOTH shapes:
  // - list serializer: session.audio_url
  // - detail serializer: session.audio.audio_url
  const audioUrl = useMemo(() => {
    return session?.audio_url || session?.audio?.audio_url || null;
  }, [session]);

  const hasAudio = Boolean(audioUrl);

  // ✅ One handler for BOTH:
  // - if session has audio => POST /replace-audio/
  // - if no audio => POST /upload-audio/
  const handleAudioSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow reselect same file
    if (!file) return;

    setUploadError("");

    if (hasAudio) {
      const ok = window.confirm("Replace current audio? This will restart transcription.");
      if (!ok) return;
    }

    setIsUploadingAudio(true);

    try {
      const formData = new FormData();
      formData.append("audio_file", file);

      const endpoint = hasAudio
        ? `/sessions/${sessionId}/replace-audio/`
        : `/sessions/${sessionId}/upload-audio/`;

      await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // refresh + let polling handle updates
      setLoading(true);
      await fetchSession();
    } catch (error) {
      console.error("Upload failed", error);

      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.audio_file?.[0] ||
        "Upload failed.";
      setUploadError(msg);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const openFilePicker = () => {
    setUploadError("");
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  // ✅ Transcript mapping (avoid passing wrong shape / causing fallback UI)
  const transcriptItems = useMemo(() => {
    const text = session?.transcript?.cleaned_transcript || "";
    if (!text.trim()) return null;
    return [{ text }];
  }, [session]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  if (!session) return <div className="text-center mt-10">Session not found</div>;

  return (
    <div className="min-h-screen bg-white p-8 mt-6">
      {/* HEADER */}
      <header className="flex justify-between items-start mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {session.patient_name || session.patient?.name || `Patient #${session.patient}`}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 uppercase font-medium bg-gray-100 px-2 py-0.5 rounded">
                Session #{session.id}
              </span>
              <span className="text-xs text-gray-500 uppercase font-medium">
                {formatDate(session.session_date || session.created_at)}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                  session.status === "completed"
                    ? "text-green-600 bg-green-50"
                    : "text-blue-600 bg-blue-50"
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
            type="button"
            onClick={() =>
              window.open(`http://localhost:8000/api/sessions/${sessionId}/download_pdf/`, "_blank")
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
          >
            <Download size={16} /> Download Report
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={generatingReport || session.status === "analyzing"}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
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
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-3">Audio Recording</h2>

          {hasAudio ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <AudioPlayer audioUrl={audioUrl} />

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : <span />}

                <button
                  type="button"
                  onClick={openFilePicker}
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
              <p className="text-gray-500 mb-4 font-medium">No audio recorded for this session yet.</p>

              {uploadError && <p className="text-xs text-red-600 mb-3">{uploadError}</p>}

              <button
                type="button"
                onClick={openFilePicker}
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
            onChange={handleAudioSelected}
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
      </main>
    </div>
  );
}
