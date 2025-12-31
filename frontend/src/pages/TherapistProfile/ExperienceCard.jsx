import React from "react";

export default function ExperienceCard({ years, isEditing, onChange }) {
  return (
    <div className="bg-gradient-to-br from-[#3078E2] via-[#638ECB] to-[#8AAEE0] p-8 rounded-3xl text-white shadow-lg relative flex flex-col justify-center items-center text-center">
      <div className="relative z-10 w-full">
        <p className="text-blue-100 text-sm font-medium mb-2">Total Experience</p>
        <div className="flex items-baseline gap-2 justify-center">
          {isEditing ? (
            <input
              type="number"
              name="yearsExperience"
              value={years}
              onChange={onChange}
              placeholder="0"
              className="bg-white/20 border-b-2 border-white/40 text-white text-6xl font-bold w-32 text-center focus:outline-none focus:bg-white/30 rounded px-2"
            />
          ) : (
            <span className="text-6xl font-bold tracking-tighter">
              {years || 0}
            </span>
          )}
          <span className="text-xl text-blue-200">Years</span>
        </div>
      </div>
    </div>
  );
}