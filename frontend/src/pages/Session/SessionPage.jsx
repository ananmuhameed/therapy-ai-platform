import React, { useState, useRef, useEffect } from "react";
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
  const chunksRef = useRef([]);
  const queryClient = useQueryClient();
  const streamRef = useRef(null);
  const [micStream, setMicStream] = useState(null);

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

  const timerRef = useRef(null);
  const startedAtRef = useRef(null);     // timestamp when current run started
  const accumulatedMsRef = useRef(0);    // total ms from previous runs (after pauses)

  const stopMicStream = () => {
    try {
      const s = streamRef.current;
      if (!s) return;
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    } catch { }
    streamRef.current = null;
    setMicStream(null);
  };

  // Fetch patients using React Query
  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  // --- Logic ---
  // ✅ Correct flow:
  // 1) Create session (JSON)
  // 2) Upload audio to /sessions/:id/upload-audio/ (multipart)
  // 3) navigate to session details

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
        // onProgress: (ratio) => setUploadProgress(Math.round(ratio * 100)),
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
      // 1) create session first (so we have sessionId)
      const { data: session } = await createSessionFormData({ patientId: selectedPatientId });

      // 2) prepare chunk source
      const source = createRecordingChunkSource();

      // 3) start upload runner (it will wait for chunks)
      const uploadPromise = uploadRecordingAudio({
        sessionId: session.id,
        filename: `recording_${Date.now()}.webm`,
        languageCode: "en",
        getNextChunk: source.getNextChunk,
        onProgressBytes: (bytes) => {
          // optional: show bytes uploaded
        },
      });

      // 4) start recorder
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
        // stop mic asap
        // try { stream.getTracks().forEach((t) => t.stop()); } catch { }
        stopMicStream();

        // tell uploader we're done so no more chunks are coming
        source.markDone();

        try {
          // keep overlay visible while uploading/completing multipart
          await uploadPromise;

          navigate(`/sessions/${session.id}`);
          resetTimer();

        } catch (err) {
          console.error(err);
          setUploadError(err.message || "Failed to upload recording.");

          // If upload fails, bring the UI back (optional)
          setIsRecorderVisible(true);
        } finally {
          setIsRecording(false);
          setIsPaused(false);
          setIsFinalizing(false); // hide overlay
        }
      };

      recorder.start(5000); // timeslice: emit blobs every 5s
    } catch (err) {
      console.error(err);
      setUploadError("Microphone access denied or session init failed.");
      setIsRecording(false);
      setIsPaused(false);
      setIsRecorderVisible(false);
      // try { stream?.getTracks()?.forEach((t) => t.stop()); } catch (_) { }
      stopMicStream();
    }
  };


  // const handleUploadFile = async (patientId, file) => {
  //   if (!patientId || !file) return;

  //   setIsUploading(true);
  //   setUploadError("");
  //   setUploadSuccess("");
  //   setLastSessionId(null);

  //   try {
  //     // 1) Create session (backend ModelViewSet expects JSON, not multipart)
  //     const createRes = await api.post("/sessions/", {
  //       patient: patientId,
  //       // If your backend requires session_date/duration, add them here.
  //       // session_date: new Date().toISOString(),
  //     });

  //     const newSessionId = createRes?.data?.id;
  //     if (!newSessionId) throw new Error("Session created but no id returned.");

  //     // 2) Upload audio to the correct endpoint (this is what your backend supports)
  //     const formData = new FormData();
  //     formData.append("audio_file", file);

  //     await api.post(`/sessions/${newSessionId}/upload-audio/`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     setLastSessionId(newSessionId);
  //     setUploadSuccess("Audio saved successfully.");
  //   } catch (err) {
  //     console.error(err);
  //     const msg =
  //       err?.response?.data?.detail ||
  //       err?.response?.data?.audio_file?.[0] ||
  //       err?.response?.data?.patient?.[0] ||
  //       err?.message ||
  //       "Failed to upload.";
  //     setUploadError(msg);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // const startRecording = async () => {
  //   if (!selectedPatientId) {
  //     setUploadError("Select a patient first.");
  //     return;
  //   }
  //   if (isUploading || isRecording) return;

  //   setUploadError("");
  //   setUploadSuccess("");
  //   setLastSessionId(null);

  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     streamRef.current = stream;

  //     // ✅ don't force mimeType (Safari breaks)
  //     const recorder = new MediaRecorder(stream);
  //     mediaRecorderRef.current = recorder;
  //     chunksRef.current = [];

  //     recorder.ondataavailable = (e) => {
  //       if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
  //     };

  //     recorder.onerror = () => {
  //       setUploadError("Recording failed. Please try again.");
  //       setIsRecording(false);
  //       setIsPaused(false);
  //       setIsRecorderVisible(false);
  //     };

  //     recorder.onstop = async () => {
  //       // cleanup stream
  //       try {
  //         if (streamRef.current) {
  //           streamRef.current.getTracks().forEach((t) => t.stop());
  //           streamRef.current = null;
  //         }
  //       } catch {}

  //       const mime = recorder.mimeType || "audio/webm";
  //       const blob = new Blob(chunksRef.current, { type: mime });

  //       // guard: empty recording
  //       if (!blob || blob.size === 0) {
  //         setUploadError("Recording was empty. Try again.");
  //         setIsRecording(false);
  //         setIsPaused(false);
  //         setIsRecorderVisible(false);
  //         return;
  //       }

  //       const ext = mime.includes("webm") ? "webm" : mime.includes("ogg") ? "ogg" : "wav";
  //       const file = new File([blob], `recording_${Date.now()}.${ext}`, { type: mime });

  //       // reset UI
  //       setIsRecording(false);
  //       setIsPaused(false);
  //       setIsRecorderVisible(false);

  //       // ✅ save only (no navigation)
  //       await handleUploadFile(selectedPatientId, file);
  //     };

  //     setIsRecorderVisible(true);
  //     setIsRecording(true);
  //     setIsPaused(false);
  //     recorder.start();
  //   } catch (err) {
  //     console.error(err);
  //     setUploadError("Microphone access denied. Please allow permissions.");
  //   }
  // };

  // Stop recording
  const stopRecording = () => {
    const r = mediaRecorderRef.current;
    if (!r || r.state === "inactive") {
      stopMicStream();
      return;
    }
    // Immediately hide recorder/playback UI and show loading overlay
    stopMicStream();
    setMicStream(null);

    setIsFinalizing(true);
    setFinalizeMsg("Session recorded successfully. Please wait...");
    setIsRecorderVisible(false);
    setIsPaused(false);
    pauseTimer();

    try {
      // Forces a final dataavailable chunk ASAP (helps reduce “waiting” feel)
      if (r.state === "recording") r.requestData();
    } catch { }

    try {
      r.stop(); // triggers onstop (upload + navigate)
    } catch { }
  };

  useEffect(() => {
    return () => {
      try {
        const r = mediaRecorderRef.current;
        if (r && r.state !== "inactive") r.stop();
      } catch { }
      stopMicStream();
    };
  }, []);

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

  const startTimer = () => {
    if (timerRef.current) return;
    startedAtRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const runMs = now - (startedAtRef.current ?? now);
      setRecordingMs(accumulatedMsRef.current + runMs);
    }, 250); // smooth enough, cheap
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
            recordingMs={recordingMs}
            micStream={micStream}
            
          />
        )}

        {isFinalizing && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 w-full max-w-md text-center">
                <div className="text-lg font-semibold">Session recorded successfully</div>
                <div className="text-sm text-gray-600 mt-2">Please wait...</div>
                <div className="mt-4">
                  {/* your spinner */}
                </div>
              </div>
            </div>
          </div>
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
