import React, { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePatients } from "../../queries/patients";
import { qk } from "../../queries/queryKeys";

import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import {
  sessionAudioUploadSchema,
  toSessionAudioFormData,
  mapSessionAudioUploadErrors,
} from "../../Forms/schemas";
import { parseServerErrors } from "../../Forms/serverErrors";

// Sub-components
import PatientSelector from "./PatientSelector";
import SessionActionButtons from "./SessionActionButtons";
import RecordingInterface from "./RecordingInterface";

export default function SessionPage() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const queryClient = useQueryClient();
  const streamRef = useRef(null);

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

  // Fetch patients using React Query
  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  // Handle file upload logic
  const handleUploadFile = async (patientId, file) => {
    setUploadError("");
    setUploadSuccess("");
    setLastSessionId(null);
    setIsUploading(true);

    try {
      // Validate input using Yup schema
      await sessionAudioUploadSchema.validate(
        { patientId: Number(patientId), file },
        { abortEarly: true }
      );

      // Step 1: Create session with JSON (required by DRF perform_create)
      const createRes = await api.post("/sessions/", { patient: Number(patientId) });
      const sessionId = createRes?.data?.id;
      if (!sessionId) throw new Error("Session created but no ID returned.");

      // Step 2: Upload audio file to upload-audio action endpoint
      const formData = new FormData();
      formData.append("audio_file", file);

      await api.post(`/sessions/${sessionId}/upload-audio/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Step 3: Verify if audio was uploaded
      const verify = await api.get(`/sessions/${sessionId}/`);
      const hasAudio =
        !!verify?.data?.audio_url || !!verify?.data?.audio?.audio_file || !!verify?.data?.audio;

      if (!hasAudio) {
        throw new Error("Upload succeeded but session does not show audio. Check serializer fields/storage settings.");
      }

      setLastSessionId(sessionId);
      setUploadSuccess("Audio uploaded. Transcription started.");
    } catch (err) {
      console.error(err);

      // Handle errors from validation or API
      if (err?.name === "ValidationError") {
        setUploadError(err.message || "Invalid input.");
      } else {
        const parsed = parseServerErrors?.(err);
        const nonField = parsed?.nonFieldError;
        const fieldErrors = parsed?.fieldErrors || {};

        const fallback =
          err?.response?.data?.detail ||
          err?.response?.data?.audio_file?.[0] ||
          err?.response?.data?.patient?.[0] ||
          err?.message ||
          "Failed to upload.";

        const msg =
          nonField || fieldErrors.audio_file?.[0] || fieldErrors.patient?.[0] || fallback;

        setUploadError(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!selectedPatientId) {
      setUploadError("Select a patient first.");
      return;
    }
    if (isUploading || isRecording) return;

    setUploadError("");
    setUploadSuccess("");
    setLastSessionId(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Don't force mimeType (Safari breaks)
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = () => {
        setUploadError("Recording failed. Please try again.");
        setIsRecording(false);
        setIsPaused(false);
        setIsRecorderVisible(false);
      };

      recorder.onstop = async () => {
        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        } catch {}

        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });

        if (!blob || blob.size === 0) {
          setUploadError("Recording was empty. Try again.");
          setIsRecording(false);
          setIsPaused(false);
          setIsRecorderVisible(false);
          return;
        }

        const ext = mime.includes("webm")
          ? "webm"
          : mime.includes("ogg")
          ? "ogg"
          : "wav";

        const file = new File([blob], `recording_${Date.now()}.${ext}`, { type: mime });

        setIsRecording(false);
        setIsPaused(false);
        setIsRecorderVisible(false);

        await handleUploadFile(selectedPatientId, file);
      };

      setIsRecorderVisible(true);
      setIsRecording(true);
      setIsPaused(false);
      recorder.start();
    } catch (err) {
      console.error(err);
      setUploadError("Microphone access denied. Please allow permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    const r = mediaRecorderRef.current;
    if (!r || r.state === "inactive") return;
    try {
      r.stop(); // triggers onstop → upload
    } catch {}
  };

  // Pause recording
  const pauseRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") {
      try {
        r.pause();
        setIsPaused(true);
      } catch {}
    }
  };

  // Resume recording
  const resumeRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "paused") {
      try {
        r.resume();
        setIsPaused(false);
      } catch {}
    }
  };

  // Handle file selection for upload
  const onAudioSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset input

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

  // Open file picker
  const openFilePicker = () => {
    if (!selectedPatientId) {
      setUploadError("Select a patient first.");
      return;
    }
    setUploadError("");
    setUploadSuccess("");
    setLastSessionId(null);

    if (!fileInputRef.current) return;
    fileInputRef.current.value = ""; // allow same file selection again
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-[760px] flex flex-col items-center gap-6">
        {/* Title */}
        <h1 className="text-[40px] font-bold text-center mb-7 tracking-wide">
          <span className="bg-gradient-to-r from-[#3078E2] via-[#5D93E1] to-[#8AAEE0] bg-clip-text text-transparent drop-shadow-sm">
            Start New Session
          </span>
        </h1>

        {/* Patient Selector */}
        <PatientSelector
          patients={patients}
          selectedId={selectedPatientId}
          onChange={setSelectedPatientId}
        />

        {/* Action Buttons */}
        <SessionActionButtons
          onStart={startRecording}
          onUpload={openFilePicker}
          canProceed={!!selectedPatientId}
          isUploading={isUploading}
          isRecording={isRecording || isPaused}
        />

        {/* Messages */}
        {uploadError && (
          <p className="text-red-600 font-medium text-sm mt-2">{uploadError}</p>
        )}

        {uploadSuccess && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <p className="text-green-600 font-medium text-sm">{uploadSuccess}</p>
            {lastSessionId && (
              <button
                type="button"
                onClick={() => navigate(`/sessions/${lastSessionId}`)}
                className="text-xs font-medium text-[#3078E2] hover:underline"
              >
                Open saved session
              </button>
            )}
          </div>
        )}

        {/* Recorder UI */}
        {isRecorderVisible && (
          <RecordingInterface
            isRecording={isRecording}
            isPaused={isPaused}
            onStop={stopRecording}
            onPause={pauseRecording}
            onResume={resumeRecording}
            isUploading={isUploading}
          />
        )}
      </main>

      {/* Hidden File Input */}
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
