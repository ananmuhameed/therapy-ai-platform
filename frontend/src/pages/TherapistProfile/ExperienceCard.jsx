import React from "react";

export default function ExperienceCard({ years, isEditing, onChange }) {
  return (
    <div className="bg-gradient-to-br from-[#3078E2] via-[#638ECB] to-[#8AAEE0] p-8 rounded-3xl text-white shadow-lg relative flex flex-col justify-center items-center text-center">
      <div className="relative z-10 w-full">
        <p className="text-blue-100 text-sm font-medium mb-2">
          Total Experience
        </p>

        <div className="flex items-baseline gap-2 justify-center">
          {isEditing ? (
            <input
              type="number"
              name="yearsExperience"
              min={0}
              step={1}
              value={years ?? 0}
              onChange={(e) => {
                // Clamp to 0+ (handles typing/paste/scroll)
                const next = Math.max(0, Number(e.target.value) || 0);

                // Keep parent's handler if provided (Formik/setState/etc.)
                // Send back a normalized event shape.
                if (onChange) {
                  onChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: e.target.name,
                      value: next,
                    },
                  });
                }
              }}
              onKeyDown={(e) => {
                // Prevent negative sign & scientific notation
                if (e.key === "-" || e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              }}
              placeholder="0"
              className="bg-white/20 border-b-2 border-white/40 text-white text-6xl font-bold w-32 text-center focus:outline-none focus:bg-white/30 rounded px-2"
            />
          ) : (
            <span className="text-6xl font-bold tracking-tighter">
              {years ?? 0}
            </span>
          )}

          <span className="text-xl text-blue-200">Years</span>
        </div>
      </div>
    </div>
  );
}
