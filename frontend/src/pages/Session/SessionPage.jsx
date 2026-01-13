import React, { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePatients } from "../../queries/patients";
import { qk } from "../../queries/queryKeys";

import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

import PatientSelector from "./PatientSelector";
import SessionActionButtons from "./SessionActionButtons";
import RecordingInterface from "./RecordingInterface";

import { uploadFileAudio } from "../../services/uploadFileAudio";
import { createSessionFormData } from "../../api/sessions";
import { createRecordingChunkSource, uploadRecordingAudio } from "../../services/uploadRecordingAudio";

export default function SessionPage() {
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const queryClient = useQueryClient();
  const streamRef = useRef(null);
  const [micStream, setMicStream] = useState(null);

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [lastSessionId, setLastSessionId] = useState(null);

  const [isRecorderVisible, setIsRecorderVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const [recordingMs, setRecordingMs] = useState(0);

  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const accumulatedMsRef = useRef(0);

  const stopMicStream = () => {
    try {
      const s = streamRef.current;
      if (!s) return;
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    } catch {}
    setMicStream(null);
  };

  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  const handleUploadFile = async (patientId, file) => {
    setIsUploading(true);
    setUploadError("");

    try {
      const { data: session } = await createSessionFormData({ patientId });

      await uploadFileAudio({
        sessionId: session.id,
        file,
        languageCode: "en",
      });

      navigate(`/sessions/${session.id}`);
    } catch (err) {
      console.error(err);
      setUploadError(err?.response?.data?.detail || err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    if (!selectedPatientId) return;
    setUploadError("");
    setIsRecorderVisible(true);
    setIsRecording(true);
    setIsPaused(false);

    try {
      const { data: session } = await createSessionFormData({ patientId: selectedPatientId });

      const source = createRecordingChunkSource();

      const uploadPromise = uploadRecordingAudio({
        sessionId: session.id,
        filename: `recording_${Date.now()}.webm`,
        languageCode: "en",
        getNextChunk: source.getNextChunk,
      });

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
        stopMicStream();
        source.markDone();

        try {
          await uploadPromise;
          navigate(`/sessions/${session.id}`);
          resetTimer();
        } catch (err) {
          console.error(err);
          setUploadError(err.message || "Failed to upload recording.");
          setIsRecorderVisible(true);
        } finally {
          setIsRecording(false);
          setIsPaused(false);
          setIsFinalizing(false);
        }
      };

      recorder.start(5000);
    } catch (err) {
      console.error(err);
      setUploadError("Microphone access denied or session init failed.");
      setIsRecording(false);
      setIsPaused(false);
      setIsRecorderVisible(false);
      stopMicStream();
    }
  };

  const stopRecording = () => {
    const r = mediaRecorderRef.current;
    if (!r || r.state === "inactive") {
      stopMicStream();
      return;
    }

    stopMicStream();
    setMicStream(null);

    setIsFinalizing(true);
    setIsRecorderVisible(false);
    setIsPaused(false);
    pauseTimer();

    try {
      if (r.state === "recording") r.requestData();
    } catch {}

    try {
      r.stop();
    } catch {}
  };

  useEffect(() => {
    return () => {
      try {
        const r = mediaRecorderRef.current;
        if (r && r.state !== "inactive") r.stop();
      } catch {}
      stopMicStream();
    };
  }, []);

  const pauseRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") {
      try {
        r.pause();
        setIsPaused(true);
        pauseTimer();
      } catch {}
    }
  };

  const resumeRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "paused") {
      try {
        r.resume();
        setIsPaused(false);
        startTimer();
      } catch {}
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
    clearInterval(timerRef.current);
    timerRef.current = null;
    startedAtRef.current = null;
    accumulatedMsRef.current = 0;
    setRecordingMs(0);
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
                  Please wait...
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
