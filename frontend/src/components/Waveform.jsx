// src/components/Waveform.jsx
import React, { useEffect, useRef } from "react";

const Waveform = ({ active, paused }) => {
    const canvasRef = useRef(null);

    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const streamRef = useRef(null);

    const rafRef = useRef(null);

    // ✅ cache ctx
    const ctxRef = useRef(null);

    // ✅ circular buffer for bars
    const barsRef = useRef(null); // Float32Array
    const barCountRef = useRef(0);
    const writeIndexRef = useRef(0);

    // keep a stable draw loop we can resume without re-init
    const loopRef = useRef(null);

    // ✅ ResizeObserver refs
    const resizeObserverRef = useRef(null);
    const resizeRafRef = useRef(null);

    const isPausedRef = useRef(false);
    useEffect(() => {
        isPausedRef.current = paused;
    }, [paused]);

    // ─── TUNING ─────────────────────────────────────────────
    const BAR_WIDTH = 3;
    const BAR_GAP = 2;

    const FPS = 60;
    const FRAME_INTERVAL = 1000 / FPS;

    const SMOOTHING = 0.85;
    const MAX_BAR_HEIGHT_RATIO = 1;

    const INPUT_GAIN = 4.0;
    const RESPONSE_CURVE = 0.75;
    // ────────────────────────────────────────────────────────

    const lastFrameRef = useRef(0);
    const lastAmpRef = useRef(0);

    // ✅ Setup ResizeObserver once (safe even before recording starts)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const target = canvas.parentElement || canvas;

        const onResize = () => {
            // throttle resize work to the next animation frame
            if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
            resizeRafRef.current = requestAnimationFrame(() => {
                resizeRafRef.current = null;
                handleResizePreserveHistory();
            });
        };

        const ro = new ResizeObserver(onResize);
        ro.observe(target);
        resizeObserverRef.current = ro;

        return () => {
            if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
            resizeRafRef.current = null;
            ro.disconnect();
            resizeObserverRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!active) {
            stopAll();
            return;
        }

        // first start
        if (!audioCtxRef.current) {
            startMic();
            return;
        }

        // active: handle pause/resume without resetting bars
        if (paused) pauseRAF();
        else resumeRAF();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, paused]);

    const startMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;

            setupCanvasAndBars(); // init once
            buildLoop();          // loop once

            if (!isPausedRef.current) resumeRAF();
        } catch (e) {
            console.error("Mic error:", e);
        }
    };

    const setupCanvasAndBars = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = ctxRef.current ?? canvas.getContext("2d");
        ctxRef.current = ctx;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // set once; no need every frame
        ctx.fillStyle = "#3078E2";

        const barCount = Math.max(
            1,
            Math.floor(canvas.clientWidth / (BAR_WIDTH + BAR_GAP))
        );

        // initialize only if empty
        if (!barsRef.current) {
            barCountRef.current = barCount;
            barsRef.current = new Float32Array(barCount).fill(0.05);
            writeIndexRef.current = 0;
        }
    };

    // ✅ helper: get bars in chronological order (oldest -> newest)
    const getBarsInOrder = () => {
        const bars = barsRef.current;
        if (!bars) return null;

        const n = bars.length;
        const start = writeIndexRef.current; // oldest index
        const ordered = new Float32Array(n);

        for (let i = 0; i < n; i++) {
            ordered[i] = bars[(start + i) % n];
        }
        return ordered;
    };

    // ✅ helper: resample ordered bars to a new size (keeps the "shape"/history)
    const resampleBars = (ordered, newCount) => {
        const oldCount = ordered.length;
        const out = new Float32Array(newCount);

        if (oldCount === 1) {
            out.fill(ordered[0]);
            return out;
        }

        // Map new indices onto old indices [0..oldCount-1]
        for (let i = 0; i < newCount; i++) {
            const t = (i / (newCount - 1)) * (oldCount - 1);
            const i0 = Math.floor(t);
            const i1 = Math.min(oldCount - 1, i0 + 1);
            const frac = t - i0;
            out[i] = ordered[i0] * (1 - frac) + ordered[i1] * frac; // linear interp
        }
        return out;
    };

    // ✅ ResizeObserver handler: resize canvas + recompute barCount while preserving history
    const handleResizePreserveHistory = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        const newCount = Math.max(
            1,
            Math.floor(canvas.clientWidth / (BAR_WIDTH + BAR_GAP))
        );

        // Always resize canvas for crispness
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#3078E2";

        // If bars not initialized yet, just set them up
        if (!barsRef.current) {
            barCountRef.current = newCount;
            barsRef.current = new Float32Array(newCount).fill(0.05);
            writeIndexRef.current = 0;
            return;
        }

        // If count unchanged, nothing to do
        if (barCountRef.current === newCount) return;

        // Preserve history by resampling
        const ordered = getBarsInOrder(); // oldest -> newest
        const resampled = resampleBars(ordered, newCount);

        barsRef.current = resampled;
        barCountRef.current = newCount;

        // After resample, we store in chronological order starting at index 0 (oldest)
        // So "oldest index" == 0, and next write overwrites oldest.
        writeIndexRef.current = 0;
    };

    const buildLoop = () => {
        const analyser = analyserRef.current;
        if (!analyser) return;

        const buffer = new Uint8Array(analyser.fftSize);

        loopRef.current = (ts) => {
            const canvas = canvasRef.current;
            const analyserNow = analyserRef.current;
            const ctx = ctxRef.current;

            if (!canvas || !analyserNow || !ctx || !barsRef.current) return;

            // throttle
            if (!lastFrameRef.current) lastFrameRef.current = ts;
            if (ts - lastFrameRef.current >= FRAME_INTERVAL) {
                lastFrameRef.current = ts;

                analyserNow.getByteTimeDomainData(buffer);

                // RMS amplitude
                let sum = 0;
                for (let i = 0; i < buffer.length; i++) {
                    const v = buffer[i] - 128;
                    sum += v * v;
                }
                let rms = Math.sqrt(sum / buffer.length) / 128;

                // gain + curve + smoothing
                rms = Math.min(1, rms * INPUT_GAIN);
                rms = Math.pow(rms, RESPONSE_CURVE);
                rms = lastAmpRef.current * SMOOTHING + rms * (1 - SMOOTHING);
                lastAmpRef.current = rms;

                // write into circular buffer
                if (!isPausedRef.current) {
                    const bars = barsRef.current;
                    bars[writeIndexRef.current] = Math.max(0.05, rms);
                    writeIndexRef.current = (writeIndexRef.current + 1) % bars.length;
                }

                // draw
                const w = canvas.clientWidth;
                const h = canvas.clientHeight;
                ctx.clearRect(0, 0, w, h);

                const bars = barsRef.current;
                const barCount = bars.length;
                const start = writeIndexRef.current; // oldest -> newest

                for (let i = 0; i < barCount; i++) {
                    const v = bars[(start + i) % barCount];
                    const barHeight = v * h * MAX_BAR_HEIGHT_RATIO;
                    const x = i * (BAR_WIDTH + BAR_GAP);
                    const y = (h - barHeight) / 2;
                    ctx.fillRect(x, y, BAR_WIDTH, barHeight);
                }
            }

            // schedule next frame unless paused
            if (!isPausedRef.current) {
                rafRef.current = requestAnimationFrame(loopRef.current);
            } else {
                rafRef.current = null;
            }
        };
    };

    const pauseRAF = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    const resumeRAF = () => {
        // ensure canvas & bars exist (no reset)
        setupCanvasAndBars();

        if (!loopRef.current) buildLoop();

        if (!rafRef.current && loopRef.current) {
            rafRef.current = requestAnimationFrame(loopRef.current);
        }
    };

    const stopAll = () => {
        pauseRAF();
        lastFrameRef.current = 0;
        lastAmpRef.current = 0;
        loopRef.current = null;

        sourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        audioCtxRef.current?.close().catch(() => { });

        sourceRef.current = null;
        analyserRef.current = null;
        streamRef.current = null;
        audioCtxRef.current = null;

        // clear refs
        barsRef.current = null;
        barCountRef.current = 0;
        writeIndexRef.current = 0;

        clearCanvas();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div style={{ flex: 1, height: 46 }}>
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
};

export default Waveform;