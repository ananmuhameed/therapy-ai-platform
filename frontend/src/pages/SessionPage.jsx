import React, { useEffect, useState } from "react";
import Session from "./Session";
import { fetchMyPatients } from "../api/patients";

export default function SessionPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

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

    if (loading) return <div style={{ padding: 24 }}>Loading patients...</div>;
    if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;

    return <Session patients={patients} />;
}