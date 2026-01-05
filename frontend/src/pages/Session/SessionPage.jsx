import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { sessionAudioUploadSchema } from "../../Forms/schemas";
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
  const streamRef = useRef(null);

  // --- State ---
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [lastSessionId, setLastSessionId] = useState(null);

  // Recording State
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get("/patients/");
        setPatients(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
        console.error("Failed to load patients", err);
      }
    };
    fetchPatients();
  }, []);

  // ✅ cleanup mic on unmount
  useEffect(() => {
    return () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      } catch {}
    };
  }, []);

  // --- Logic ---
  // ✅ Correct backend flow:
  // 1) POST /sessions/ (JSON) to create session
  // 2) POST /sessions/:id/upload-audio/ (multipart) to upload audio
  // ✅ No auto navigation; we show success + optional button
  const handleUploadFile = async (patientId, file) => {
    setUploadError("");
    setUploadSuccess("");
    setLastSessionId(null);
    setIsUploading(true);

    try {
      // 0) Validate (Yup)
      await sessionAudioUploadSchema.validate(
        { patientId: Number(patientId), file },
        { abortEarly: true }
      );

      // 1) Create session with JSON (required by your DRF perform_create)
      const createRes = await api.post("/sessions/", {
        patient: Number(patientId),
      });

      const sessionId = createRes?.data?.id;
      if (!sessionId) throw new Error("Session created but no id returned.");

      // 2) Upload audio file to upload-audio action endpoint
      const formData = new FormData();
      formData.append("audio_file", file);

      await api.post(`/sessions/${sessionId}/upload-audio/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3) Verify quickly (optional but prevents fake “success”)
      const verify = await api.get(`/sessions/${sessionId}/`);
      // Your SessionDetailSerializer may expose audio_url or audio object. We do a safe check:
      const hasAudio =
        !!verify?.data?.audio_url ||
        !!verify?.data?.audio?.audio_file ||
        !!verify?.data?.audio;

      if (!hasAudio) {
        throw new Error(
          "Upload succeeded but session does not show audio. Check serializer fields / storage settings."
        );
      }

      setLastSessionId(sessionId);
      setUploadSuccess("Audio uploaded. Transcription started.");
    } catch (err) {
      console.error(err);

      // Yup validation error
      if (err?.name === "ValidationError") {
        setUploadError(err.message || "Invalid input.");
      } else {
        // API errors
        const parsed = parseServerErrors?.(err);
        const nonField = parsed?.nonFieldError;
        const fieldErrors = parsed?.fieldErrors || {};

        // common DRF shapes
        const fallback =
          err?.response?.data?.detail ||
          err?.response?.data?.audio_file?.[0] ||
          err?.response?.data?.patient?.[0] ||
          err?.message ||
          "Failed to upload.";

        const msg =
          nonField ||
          fieldErrors.audio_file?.[0] ||
          fieldErrors.patient?.[0] ||
          fallback;

        setUploadError(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

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

      // ✅ don't force mimeType (Safari breaks)
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
        // cleanup stream
        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        } catch {}

        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });

        // guard: empty recording
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

        const file = new File([blob], `recording_${Date.now()}.${ext}`, {
          type: mime,
        });

        // reset UI
        setIsRecording(false);
        setIsPaused(false);
        setIsRecorderVisible(false);

        // ✅ save (2-step API)
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

  const stopRecording = () => {
    const r = mediaRecorderRef.current;
    if (!r || r.state === "inactive") return;
    try {
      r.stop(); // triggers onstop → upload
    } catch {}
  };

  const pauseRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") {
      try {
        r.pause();
        setIsPaused(true);
      } catch {}
    }
  };

  const resumeRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "paused") {
      try {
        r.resume();
        setIsPaused(false);
      } catch {}
    }
  };

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

        {/* 1. Patient Selector */}
        <PatientSelector
          patients={patients}
          selectedId={selectedPatientId}
          onChange={setSelectedPatientId}
        />

        {/* 2. Action Buttons */}
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

            {/* Optional: user-initiated navigation (NOT automatic) */}
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

        {/* 3. Recorder UI */}
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
        onChange={onAudioSelected}
      />
    </div>
  );
}
