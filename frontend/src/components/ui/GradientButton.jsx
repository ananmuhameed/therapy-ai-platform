import React from "react";

export default function GradientButton({ children, ariaLabel, onClick, className = "" }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-6 py-3
        rounded-full
        text-white font-medium
        shadow-md
        transition
        hover:scale-[1.03]
        active:scale-[0.97]
        ${className}
      `}
      style={{
        background: "linear-gradient(90deg, #3078E2 0%, #8AAEE0 50%, #C6D2EC 100%)",
      }}
    >
      {children}
    </button>
  );
}