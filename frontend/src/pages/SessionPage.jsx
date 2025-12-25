import React, { useEffect, useState } from "react";
import Session from "../components/Session";
import { fetchMyPatients } from "../api/patients";
import { uploadSessionAudio, replaceSessionAudio } from "../api/SessionAudio";
import api from "../api/axiosInstance"
import { useNavigate } from "react-router-dom";


export default function SessionPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const data = await fetchMyPatients();

                // DRF can return either array or paginated {results: []}
                const list = Array.isArray(data) ? data : (data?.results || []);
                if (alive) setPatients(list);
            } catch (e) {
                if (alive) setErr(e?.response?.data?.detail || "Failed to load patients.");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, []);

    const createSessionForPatient = async (patientId, initialStatus) => {
        const payload = {
            patient: Number(patientId),
            session_date: new Date().toISOString(),
            duration_minutes: 0,
            notes_before: "",
            notes_after: "",
            status: initialStatus, // "uploaded" or "recorded"
        };

        const res = await api.post("/sessions/", payload);
        return res.data; // { id: ... }
    };

    const handleAudioForNewSession = async (patientId, file, source) => {
        // 1) create session
        const initialStatus = source === "recorded" ? "recorded" : "uploaded";
        const session = await createSessionForPatient(patientId, initialStatus);

        // 2) upload audio -> backend saves to MEDIA_ROOT and flips session.status = transcribing
        await uploadSessionAudio(session.id, file, "");

        // 3) navigate away
        // navigate(`/patients/${patientId}`);
        // navigate(`/sessions/${session.id}`);
    };

    if (loading) return <div style={{ padding: 24 }}>Loading patients...</div>;
    if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;

    return (
        <Session
            patients={patients}
            onUploadAudio={(patientId, file) => handleAudioForNewSession(patientId, file, "uploaded")}
            onRecordingFinished={(patientId, file) => handleAudioForNewSession(patientId, file, "recorded")}
        />
    );
}