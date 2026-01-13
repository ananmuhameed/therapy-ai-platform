import React from "react";

export default function StatBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] transition-colors">
      <div className="text-[rgb(var(--primary))]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[rgb(var(--text-muted))]">{label}</p>
        <p className="text-xl font-semibold text-[rgb(var(--text))]">
          {value}
        </p>
      </div>
    </div>
  );
}
