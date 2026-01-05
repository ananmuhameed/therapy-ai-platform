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

  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  // --- State ---
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Recording State
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- Logic ---
  const handleUploadFile = async (patientId, file) => {
    setUploadError("");
    setIsUploading(true);
    try {
      await sessionAudioUploadSchema.validate(
        { patientId: Number(patientId), file },
        { abortEarly: true }
      );
    } catch (validationErr) {
      setIsUploading(false);
      setUploadError(validationErr.message || "Invalid input.");
      return;
    }
    const formData = toSessionAudioFormData({
      patientId: Number(patientId),
      file,
    });
    try {
      const { data } = await api.post("/sessions/", formData);
      await queryClient.invalidateQueries({ queryKey: qk.sessions });
      navigate(`/sessions/${data.id}`);
    } catch (err) {
      const { fieldErrors, nonFieldError } = parseServerErrors(err);
      const mapped = mapSessionAudioUploadErrors(fieldErrors);
      const msg =
        mapped.patientId ||
        mapped.file ||
        nonFieldError ||
        "Failed to upload session.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    if (!selectedPatientId) return;
    setUploadError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // cleanup
        stream.getTracks().forEach((t) => t.stop());

        // create file
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording_${Date.now()}.webm`, {
          type: "audio/webm",
        });

        // reset UI
        setIsRecording(false);
        setIsPaused(false);
        setIsRecorderVisible(false);

        // trigger upload
        await handleUploadFile(selectedPatientId, file);
      };

      // start
      setIsRecorderVisible(true);
      setIsRecording(true);
      setIsPaused(false);
      recorder.start();
    } catch (err) {
      console.error(err);
      setUploadError("Microphone access denied. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state !== "inactive") r.stop();
  };

  const pauseRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") {
      r.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "paused") {
      r.resume();
      setIsPaused(false);
    }
  };

  const onAudioSelected = (e) => {
    const file = e.target.files?.[0];
    if (file && selectedPatientId) {
      handleUploadFile(selectedPatientId, file);
    }
    e.target.value = ""; // reset input
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

        {/* 1. Patient Selector */}
        <PatientSelector
          patients={patients}
          selectedId={selectedPatientId}
          onChange={setSelectedPatientId}
        />

        {/* 2. Action Buttons */}
        <SessionActionButtons
          onStart={startRecording}
          onUpload={() => fileInputRef.current?.click()}
          canProceed={!!selectedPatientId && !patientsLoading}
          isUploading={isUploading || patientsLoading}
        />

        {/* Error Message */}
        {uploadError && (
          <p className="text-red-600 font-medium text-sm mt-2">{uploadError}</p>
        )}

        {/* 3. Recorder UI */}
        {isRecorderVisible && (
          <RecordingInterface
            isRecording={isRecording}
            isPaused={isPaused}
            onStop={stopRecording}
            onPause={pauseRecording}
            onResume={resumeRecording}
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
