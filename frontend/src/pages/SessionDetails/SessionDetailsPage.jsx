import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { formatDate } from "../../utils/helpers";

import SessionDetailsHeader from "./SessionDetailsHeader";
import SessionDetailsContent from "./SessionDetailsContent";

import { Loader2 } from "lucide-react";

export default function SessionDetailsPage() {
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
      fetchSession(); // polling will keep updating
    } catch (error) {
      alert("Failed to start report generation.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // ✅ Get audio url from BOTH shapes
  const audioUrl = useMemo(() => {
    return session?.audio_url || session?.audio?.audio_url || null;
  }, [session]);

  const hasAudio = Boolean(audioUrl);

  const openFilePicker = () => {
    setUploadError("");
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  // ✅ Upload/replace audio
  const handleAudioSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
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

  // ✅ Transcript mapping
  const transcriptItems = useMemo(() => {
    const text = session?.transcript?.cleaned_transcript || "";
    if (!text.trim()) return null;
    return [{ text }];
  }, [session]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (!session) return <div className="text-center mt-10">Session not found</div>;

  const headerMeta = {
    patientLabel:
      session.patient_name ||
      session.patient?.name ||
      `Patient #${session.patient}`,
    sessionLabel: `Session #${session.id}`,
    dateLabel: formatDate(session.session_date || session.created_at),
    status: session.status,
    reportStatus: session.report?.status,
  };

  return (
    <div className="min-h-screen bg-white p-8 mt-6">
      <SessionDetailsHeader
        sessionId={sessionId}
        meta={headerMeta}
        generatingReport={generatingReport}
        onBack={() => navigate(-1)}
        onGenerateReport={handleGenerateReport}
      />

      <SessionDetailsContent
        sessionId={sessionId}
        session={session}
        audioUrl={audioUrl}
        hasAudio={hasAudio}
        uploadError={uploadError}
        isUploadingAudio={isUploadingAudio}
        onPickAudio={openFilePicker}
        onAudioSelected={handleAudioSelected}
        fileInputRef={fileInputRef}
        transcriptItems={transcriptItems}
      />
    </div>
  );
}
