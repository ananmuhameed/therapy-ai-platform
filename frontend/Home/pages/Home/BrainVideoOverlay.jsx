export default function MedicalBrain() {
  return (
    <div className="relative w-[420px] h-[420px]">
      <style>{`
        .brain-pulse {
          animation: brainPulse 4s ease-in-out infinite;
          transform-origin: center;
        }

        .brain-breathe {
          animation: breathe 6s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes brainPulse {
          0% { filter: drop-shadow(0 0 12px rgba(37, 99, 235, 0.5)); }
          50% { filter: drop-shadow(0 0 28px rgba(37, 99, 235, 0.95)); }
          100% { filter: drop-shadow(0 0 12px rgba(37, 99, 235, 0.5)); }
        }

        @keyframes breathe {
          0% { transform: scale(1); }
          50% { transform: scale(1.025); }
          100% { transform: scale(1); }
        }
      `}</style>

      <svg viewBox="0 0 1080 1080" className="w-full h-full brain-breathe">
        <defs>
          <radialGradient id="brainShade" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>

          <filter id="brainGlow">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* LEFT HEMISPHERE */}
        <path
          d="
            M 520 120
            C 400 90, 300 170, 250 280
            C 210 360, 220 470, 270 540
            C 230 640, 270 760, 380 820
            C 460 865, 500 840, 520 800
            Z
          "
          fill="url(#brainShade)"
          filter="url(#brainGlow)"
          className="brain-pulse"
        />

        {/* RIGHT HEMISPHERE */}
        <path
          d="
            M 560 120
            C 680 90, 780 170, 830 280
            C 870 360, 860 470, 810 540
            C 850 640, 810 760, 700 820
            C 620 865, 580 840, 560 800
            Z
          "
          fill="url(#brainShade)"
          filter="url(#brainGlow)"
          className="brain-pulse"
        />

        {/* ANATOMICAL CENTER FISSURE */}
        <path
          d="
            M 540 140
            C 552 200, 530 260, 548 320
            C 560 380, 528 440, 545 500
            C 558 560, 530 620, 542 680
            C 552 730, 535 780, 540 820
          "
          stroke="white-alpha(0.8)"
          strokeWidth="26"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />

        {/* Depth shadow for fissure */}
        <path
          d="
            M 548 140
            C 560 200, 540 260, 558 320
            C 570 380, 538 440, 555 500
            C 568 560, 540 620, 552 680
            C 562 730, 545 780, 548 820
          "
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="10"
          fill="none"
        />

      </svg>
    </div>
  );
}
