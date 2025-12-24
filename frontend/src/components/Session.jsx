
import React, { useMemo, useState, useRef } from "react";
import { FiMic, FiUploadCloud, FiChevronDown } from "react-icons/fi";
import { BsStopFill, BsPauseFill, BsPlayFill } from "react-icons/bs";
import Waveform from "./Waveform";


const Session = ({ patients = [], onStartRecording, onUploadAudio, onRecordingFinished }) => {
    const [selectedPatientId, setSelectedPatientId] = useState("");

    // recording UI state
    const [isRecorderVisible, setIsRecorderVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = React.useRef(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const patientOptions = useMemo(() => {
        return (patients || []).map((p) => ({
            id: String(p.id),
            label: p.name || p.full_name || p.fullName || `Patient #${p.id}`,
        }));
    }, [patients]);

    // to disable and enable buttons for testing
    const canProceed = Boolean(selectedPatientId);
    // const canProceed = true;

    const startRecording = async () => {
        if (!canProceed) return;

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
                // stop mic
                stream.getTracks().forEach((t) => t.stop());

                // build blob -> file
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const filename = `recording_${Date.now()}.webm`;
                const file = new File([blob], filename, { type: "audio/webm" });

                // UI reset
                setIsRecording(false);
                setIsPaused(false);
                setIsRecorderVisible(false);

                // delegate to page: create session + upload
                try {
                    await onRecordingFinished?.(selectedPatientId, file);
                } catch (err) {
                    setUploadError(err?.message || err?.response?.data?.detail || "Failed to upload recording.");
                }
            };

            // UI state
            setIsRecorderVisible(true);
            setIsRecording(true);
            setIsPaused(false);

            recorder.start();
            onStartRecording?.(selectedPatientId); // optional hook
        } catch (err) {
            setUploadError("Microphone permission denied or not available.");
        }
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) return;

        if (recorder.state !== "inactive") recorder.stop();
    };

    const pauseRecording = () => {
        const r = mediaRecorderRef.current;
        if (!r || r.state !== "recording") return;
        r.pause();
        setIsPaused(true);
    };

    const resumeRecording = () => {
        const r = mediaRecorderRef.current;
        if (!r || r.state !== "paused") return;
        r.resume();
        setIsPaused(false);
    };

    const uploadAudio = () => {
        if (!canProceed || isUploading) return;
        setUploadError("");
        fileInputRef.current?.click();
    };

    const onAudioSelected = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadError("");

            // delegate to the page
            await onUploadAudio?.(selectedPatientId, file);
        } catch (err) {
            // page should throw a friendly error message string or object
            const msg =
                err?.message ||
                err?.response?.data?.detail ||
                "Upload failed.";
            setUploadError(msg);
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div style={styles.page}>
            {/* Spacer where navbar will be mounted later */}
            {/* <div style={{ height: 56 }} /> */}

            <main style={styles.main}>
                <h1 style={styles.title}>
                    <span style={styles.titleGradient}>Start New Session</span>
                </h1>

                <div style={styles.cardStack}>
                    {/* Select patient */}
                    <div style={styles.selectWrap}>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            style={styles.select}
                        >
                            <option value="" disabled>
                                Select patient
                            </option>
                            {patientOptions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.label}
                                </option>
                            ))}
                        </select>

                        <span style={styles.selectChevron} aria-hidden="true">
                            <FiChevronDown size={18} />
                        </span>
                    </div>

                    {/* Actions */}
                    <div style={styles.actionsRow}>

                        <button
                            type="button"
                            onClick={startRecording}
                            disabled={!canProceed}
                            style={{
                                ...styles.actionBtn,
                                ...(canProceed ? {} : styles.disabledBtn),
                            }}
                        >
                            <FiMic size={22} style={styles.actionIcon} />
                            <span style={styles.actionText}>Start Recording</span>
                        </button>

                        <button
                            type="button"
                            onClick={uploadAudio}
                            disabled={!canProceed || isUploading}
                            style={{
                                ...styles.actionBtn,
                                ...(canProceed && !isUploading ? {} : styles.disabledBtn),
                            }}
                        >
                            <FiUploadCloud size={22} style={styles.actionIcon} />
                            <span style={styles.actionText}>{isUploading ? "Uploading..." : "Upload Audio"}</span>
                        </button>
                    </div>
                    {uploadError && <p style={{ color: "crimson", marginTop: 10 }}>{uploadError}</p>}

                    {/* Recorder / Playback bar */}
                    {isRecorderVisible && (
                        <div style={styles.playbackWrap}>
                            <div style={styles.playbackControls}>
                                <button onClick={stopRecording} style={styles.ctrlBtn}>
                                    <BsStopFill size={20} style={styles.ctrlIconBlue} />
                                </button>

                                {!isPaused ? (
                                    <button onClick={pauseRecording} style={styles.ctrlBtn}>
                                        <BsPauseFill size={22} style={styles.ctrlIconBlue} />
                                    </button>
                                ) : (
                                    <button onClick={resumeRecording} style={styles.ctrlBtn}>
                                        <BsPlayFill size={22} style={styles.ctrlIconBlue} />
                                    </button>
                                )}
                            </div>

                            <Waveform active={isRecording} paused={isPaused} />
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={onAudioSelected}
                />
            </main>

            {/* Spacer where footer will be mounted later */}
            <div style={{ height: 56 }} />
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
    },
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
    },
    title: {
        margin: 0,
        marginBottom: 28,
        fontSize: 40,
        fontWeight: 700,
        letterSpacing: 0.2,
        textAlign: "center",
    },
    titleGradient: {
        background: "linear-gradient(90deg, #3078E2 0%, #5D93E1 50%, #8AAEE0 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        textShadow: "0px 3px 10px rgba(48,120,226,0.18)",
    },
    cardStack: {
        width: "100%",
        maxWidth: 760,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
    },
    selectWrap: {
        position: "relative",
        width: "100%",
        maxWidth: 520,
    },
    select: {
        width: "100%",
        height: 58,
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.04)",
        backgroundColor: "#F5F5F5",
        padding: "0 52px 0 22px",
        fontSize: 16,
        fontWeight: 300,
        color: "#727473",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
    },
    selectChevron: {
        position: "absolute",
        right: 18,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#000000",
        opacity: 0.7,
        pointerEvents: "none",
    },
    actionsRow: {
        width: "100%",
        maxWidth: 620,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        flexWrap: "wrap",
    },
    actionBtn: {
        minWidth: 260,
        height: 74,
        padding: "0 24px",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.04)",
        backgroundColor: "#F5F5F5",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
    },
    disabledBtn: {
        opacity: 0.55,
        cursor: "not-allowed",
    },
    actionIcon: { color: "#000000", opacity: 0.85 },
    actionText: { fontSize: 16, fontWeight: 600, color: "#000000" },

    playbackWrap: {
        width: "100%",
        maxWidth: 640,
        height: 86,
        borderRadius: 18,
        backgroundColor: "#F5F5F5",
        border: "1px solid rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 16,
        marginTop: 34,
    },
    playbackControls: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    ctrlBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
    },
    ctrlIconBlue: {
        color: "#3078E2",
    },
};

export default Session;