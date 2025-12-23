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

    const createSessionForPatient = async (patientId) => {
        const payload = {
            patient: Number(patientId),
            session_date: new Date().toISOString(),
            duration_minutes: 0,
            notes_before: "",
            notes_after: "",
            status: "uploaded", // if backend allows it; otherwise remove this line
        };

        const res = await api.post("/sessions/", payload);
        return res.data; // expects { id: ... }
    };

    const handleUploadAudio = async (patientId, file) => {
        if (!patientId) throw new Error("Please select a patient first.");

        // 1) create new session
        const session = await createSessionForPatient(patientId);

        // 2) upload audio
        await uploadSessionAudio(session.id, file, "");

        // 3) navigate either to session details or patient's session list
        // navigate(`/sessions/${session.id}`);
    };

    if (loading) return <div style={{ padding: 24 }}>Loading patients...</div>;
    if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;

    return <Session patients={patients}
        onUploadAudio={handleUploadAudio} />;
}