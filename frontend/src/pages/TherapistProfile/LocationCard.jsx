import React from "react";
import { MapPin } from "lucide-react";

export default function LocationCard({
  data,
  isEditing,
  errors,
  onChange,
  getInputClass,
}) {
  return (
    <div className="bg-[rgb(var(--card))] p-6 rounded-2xl border border-[rgb(var(--border))] transition-colors">
      <div className="flex items-center gap-2 mb-6 text-[rgb(var(--text))] font-semibold text-lg">
        <MapPin className="text-[rgb(var(--primary))]" /> Location
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider block mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            name="city"
            value={data.city}
            onChange={onChange}
            readOnly={!isEditing}
            className={`${getInputClass(errors.city)} bg-transparent text-[rgb(var(--text))]`}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider block mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            name="country"
            value={data.country}
            onChange={onChange}
            readOnly={!isEditing}
            className={`${getInputClass(errors.country)} bg-transparent text-[rgb(var(--text))]`}
          />
        </div>
      </div>
    </div>
  );
}
