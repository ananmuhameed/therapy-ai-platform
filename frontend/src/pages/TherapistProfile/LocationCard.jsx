import React from "react";
import { MapPin } from "lucide-react";

export default function LocationCard({ data, isEditing, errors, onChange, getInputClass }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6 text-slate-900 font-semibold text-lg">
        <MapPin className="text-[#3078E2]" /> Location
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            name="city"
            value={data.city}
            onChange={onChange}
            readOnly={!isEditing}
            className={getInputClass(errors.city)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            name="country"
            value={data.country}
            onChange={onChange}
            readOnly={!isEditing}
            className={getInputClass(errors.country)}
          />
        </div>
      </div>
    </div>
  );
}