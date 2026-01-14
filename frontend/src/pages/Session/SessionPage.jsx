import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import { usePatients } from "../../queries/patients";

// Sub-components
import PatientSelector from "./PatientSelector";
import SessionActionButtons from "./SessionActionButtons";
import RecordingInterface from "./RecordingInterface";

import { uploadFileAudio } from "../../services/uploadFileAudio";
import { createSessionFormData } from "../../api/sessions";
import {
  createRecordingChunkSource,
  uploadRecordingAudio,
} from "../../services/uploadRecordingAudio";

export default function SessionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Refs ---
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const currentSessionIdRef = useRef(null);
  const cancelUploadRef = useRef(null); // optional cancel fn (if supported)
  const sourceRef = useRef(null); // chunk source instance

  // Timer refs
  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const accumulatedMsRef = useRef(0);

  // --- State ---
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [lastSessionId, setLastSessionId] = useState(null);

  // Recording State
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeMsg, setFinalizeMsg] = useState("");

  const [recordingMs, setRecordingMs] = useState(0);
  const [micStream, setMicStream] = useState(null);

  // Fetch patients using React Query
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get("patientId");
    if (!pid) return;

    if (patientsLoading) return;

    const exists = patients.some((p) => String(p.id) === String(pid));

    if (exists) {
      setSelectedPatientId(String(pid));

      params.delete("patientId");
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true }
      );
    } else {
      setUploadError("Selected patient not found or not accessible.");
    }
  }, [patientsLoading, patients, location.search]);


  const stopMicStream = () => {
    try {
      const s = streamRef.current;
      if (!s) return;
      s.getTracks().forEach((t) => t.stop());
    } catch { }
    streamRef.current = null;
    setMicStream(null);
  };

  const startTimer = () => {
    if (timerRef.current) return;
    startedAtRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const runMs = now - (startedAtRef.current ?? now);
      setRecordingMs(accumulatedMsRef.current + runMs);
    }, 250);
  };

  const pauseTimer = () => {
    if (!timerRef.current) return;

    const now = Date.now();
    const runMs = now - (startedAtRef.current ?? now);
    accumulatedMsRef.current += runMs;

    clearInterval(timerRef.current);
    timerRef.current = null;
    startedAtRef.current = null;

    setRecordingMs(accumulatedMsRef.current);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    startedAtRef.current = null;
    accumulatedMsRef.current = 0;
    setRecordingMs(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (timerRef.current) clearInterval(timerRef.current);
      } catch { }
      timerRef.current = null;

      try {
        const r = mediaRecorderRef.current;
        if (r && r.state !== "inactive") r.stop();
      } catch { }

      stopMicStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadFile = async (patientId, file) => {
    setIsUploading(true);
    setUploadError("");

    try {
      // 1) create session (FormData)
      const { data: session } = await createSessionFormData({ patientId });

      // 2) upload audio via multipart
      await uploadFileAudio({
        sessionId: session.id,
        file,
        languageCode: "en",
      });

      navigate(`/sessions/${session.id}`);
    } catch (err) {
      console.error(err);
      setUploadError(
        err?.response?.data?.detail || err?.message || "Upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    if (!selectedPatientId) return;

    setUploadError("");
    setUploadSuccess("");
    setLastSessionId(null);

    setIsRecorderVisible(true);
    setIsRecording(true);
    setIsPaused(false);

    try {
      const { data: session } = await createSessionFormData({
        patientId: selectedPatientId,
      });

      currentSessionIdRef.current = session.id;

      const source = createRecordingChunkSource();
      sourceRef.current = source;

      // uploadRecordingAudio might return a Promise OR { promise, cancel }
      const uploadTask = uploadRecordingAudio({
        sessionId: session.id,
        filename: `recording_${Date.now()}.webm`,
        languageCode: "en",
        getNextChunk: source.getNextChunk,
      });

      let uploadPromise = uploadTask;
      cancelUploadRef.current = null;

      if (
        uploadTask &&
        typeof uploadTask === "object" &&
        typeof uploadTask.promise?.then === "function"
      ) {
        uploadPromise = uploadTask.promise;
        if (typeof uploadTask.cancel === "function") {
          cancelUploadRef.current = uploadTask.cancel;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicStream(stream);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      resetTimer();
      startTimer();

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) source.pushBlob(e.data);
      };

      recorder.onstop = async () => {
        // IMPORTANT: stop stream here (after recorder stops)
        stopMicStream();
        source.markDone();

        try {
          await uploadPromise;
          navigate(`/sessions/${session.id}`);
          resetTimer();
        } catch (err) {
          console.error(err);
          setUploadError(err?.message || "Failed to upload recording.");
          setIsRecorderVisible(true);
        } finally {
          setIsRecording(false);
          setIsPaused(false);
          setIsFinalizing(false);
          setFinalizeMsg("");
        }
      };

      // collect chunks every 5s
      recorder.start(5000);
    } catch (err) {
      console.error(err);
      setUploadError("Microphone access denied or session init failed.");
      setIsRecording(false);
      setIsPaused(false);
      setIsRecorderVisible(false);
      setIsFinalizing(false);
      setFinalizeMsg("");
      resetTimer();
      stopMicStream();
    }
  };

  // Cancel recording (stop and delete session)
  const cancelRecording = async () => {
    // stop UI immediately
    setIsFinalizing(false);
    setFinalizeMsg("");
    setIsRecorderVisible(false);
    setIsRecording(false);
    setIsPaused(false);
    setUploadError("");
    resetTimer();

    // stop recorder safely
    const r = mediaRecorderRef.current;
    try {
      if (r && r.state !== "inactive") {
        r.ondataavailable = null;
        r.onstop = null; // prevent navigation/upload finalize
        r.stop();
      }
    } catch { }

    stopMicStream();

    // end chunk source + cancel upload if supported
    try {
      sourceRef.current?.markDone?.();
    } catch { }
    try {
      cancelUploadRef.current?.();
    } catch { }

    // cleanup refs
    const sid = currentSessionIdRef.current;
    mediaRecorderRef.current = null;
    sourceRef.current = null;
    cancelUploadRef.current = null;
    currentSessionIdRef.current = null;

    // cleanup backend session
    if (sid) {
      try {
        await api.delete(`/sessions/${sid}/`);
      } catch (e) {
        console.warn("Failed to delete canceled session", e);
      }
    }
  };

  // ✅ Stop recording (FIXED: only one function)
  const stopRecording = () => {
    const r = mediaRecorderRef.current;

    // If recorder already inactive, just cleanup mic
    if (!r || r.state === "inactive") {
      stopMicStream();
      return;
    }

    setIsFinalizing(true);
    setFinalizeMsg("Session recorded successfully. Please wait...");
    setIsRecorderVisible(false);
    setIsPaused(false);
    pauseTimer();

    // flush last chunk then stop
    try {
      if (r.state === "recording") r.requestData();
    } catch { }

    try {
      r.stop();
    } catch { }
  };

  // Pause recording
  const pauseRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") {
      try {
        r.pause();
        setIsPaused(true);
        pauseTimer();
      } catch { }
    }
  };

  // Resume recording
  const resumeRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "paused") {
      try {
        r.resume();
        setIsPaused(false);
        startTimer();
      } catch { }
    }
  };

  const onAudioSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!selectedPatientId) {
      setUploadError("Select a patient first.");
      return;
    }
    if (!file) return;

    setUploadError("");
    setUploadSuccess("");
    setLastSessionId(null);

    handleUploadFile(selectedPatientId, file);
  };

  const openFilePicker = () => {
    if (!selectedPatientId) {
      setUploadError("Select a patient first.");
      return;
    }
    if (!fileInputRef.current) return;

    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] flex flex-col items-center justify-center p-6 text-[rgb(var(--text))]">
      <main className="w-full max-w-[760px] flex flex-col items-center gap-6">
        <h1 className="text-[40px] font-bold text-center mb-7 tracking-wide">
          <span className="bg-gradient-to-r from-[#3078E2] via-[#5D93E1] to-[#8AAEE0] bg-clip-text text-transparent drop-shadow-sm">
            Start New Session
          </span>
        </h1>

        <PatientSelector
          patients={patients}
          selectedId={selectedPatientId}
          onChange={setSelectedPatientId}
        />

        <SessionActionButtons
          onStart={startRecording}
          onUpload={openFilePicker}
          onCancel={cancelRecording}
          canProceed={!!selectedPatientId}
          isUploading={isUploading}
          isRecording={isRecording || isPaused}
        />

        {uploadError && (
          <p className="text-red-500 font-medium text-sm mt-2">{uploadError}</p>
        )}

        {uploadSuccess && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <p className="text-green-500 font-medium text-sm">{uploadSuccess}</p>
            {lastSessionId && (
              <button
                type="button"
                onClick={() => navigate(`/sessions/${lastSessionId}`)}
                className="text-xs font-medium text-[rgb(var(--primary))] hover:underline"
              >
                Open saved session
              </button>
            )}
          </div>
        )}

        {isRecorderVisible && (
          <RecordingInterface
            isRecording={isRecording}
            isPaused={isPaused}
            onStop={stopRecording}
            onCancel={cancelRecording}
            onPause={pauseRecording}
            onResume={resumeRecording}
            isUploading={isUploading}
            recordingMs={recordingMs}
            micStream={micStream}
          />
        )}

        {isFinalizing && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex min-h-full items-center justify-center p-4">
              <div className="bg-[rgb(var(--card))] rounded-2xl shadow-2xl px-6 py-5 w-full max-w-md text-center border border-[rgb(var(--border))]">
                <div className="text-lg font-semibold text-[rgb(var(--text))]">
                  Session recorded successfully
                </div>
                <div className="text-sm text-[rgb(var(--text-muted))] mt-2">
                  {finalizeMsg || "Please wait..."}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        disabled={isUploading || patientsLoading}
        onChange={onAudioSelected}
      />
    </div>
  );
}