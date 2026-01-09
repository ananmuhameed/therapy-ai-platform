import React from "react";

export default function StatBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl" style={{ backgroundColor: "#F0F3FA" }}>
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}