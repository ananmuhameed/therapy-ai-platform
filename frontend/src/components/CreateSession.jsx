
import React, { useMemo, useState } from "react";
import { FiMic, FiUploadCloud, FiChevronDown } from "react-icons/fi";
import { BsStopFill, BsPauseFill, BsPlayFill } from "react-icons/bs";
import Waveform from "./Waveform";
const CreateSession = ({ patients = [], onStartRecording, onUploadAudio }) => {
    const [selectedPatientId, setSelectedPatientId] = useState("");

    // recording UI state
    const [isRecorderVisible, setIsRecorderVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const patientOptions = useMemo(() => {
        return (patients || []).map((p) => ({
            id: String(p.id),
            label: p.name || p.full_name || p.fullName || `Patient #${p.id}`,
        }));
    }, [patients]);

    //const canProceed = Boolean(selectedPatientId);
    const canProceed = true;

    const startRecording = () => {
        if (!canProceed) return;
        setIsRecorderVisible(true);
        setIsRecording(true);
        setIsPaused(false);
        onStartRecording?.(selectedPatientId);
    };

    const stopRecording = () => {
        setIsRecording(false);
        setIsPaused(false);
        setIsRecorderVisible(false);
    };

    const pauseRecording = () => {
        if (!isRecording) return;
        setIsPaused(true);
    };

    const resumeRecording = () => {
        if (!isRecording) return;
        setIsPaused(false);
    };

    const uploadAudio = () => {
        if (!canProceed) return;
        onUploadAudio?.(selectedPatientId);
    };

    return (
        <div style={styles.page}>
            {/* Spacer where navbar will be mounted later */}
            <div style={{ height: 56 }} />

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
                            disabled={!canProceed}
                            style={{
                                ...styles.actionBtn,
                                ...(canProceed ? {} : styles.disabledBtn),
                            }}
                        >
                            <FiUploadCloud size={22} style={styles.actionIcon} />
                            <span style={styles.actionText}>Upload Audio</span>
                        </button>
                    </div>

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

export default CreateSession;