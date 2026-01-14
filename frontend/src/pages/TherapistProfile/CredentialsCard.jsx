import React from "react";
import { Award, ShieldCheck, Briefcase } from "lucide-react";

export default function CredentialsCard({
  data,
  isEditing,
  errors,
  onChange,
  getInputClass
}) {
  return (
    <div className="bg-[rgb(var(--card))] p-6 rounded-2xl border border-[rgb(var(--border))] relative mb-6 transition-colors">
      {isEditing && (
        <span className="absolute top-4 right-4 text-xs font-bold text-[rgb(var(--primary))] bg-[rgb(var(--bg-secondary))] px-2 py-1 rounded">
          EDITING MODE
        </span>
      )}

      {/* Credentials */}
      <div className="flex items-center gap-2 mb-6 text-[rgb(var(--text))] font-semibold text-lg">
        <Award className="text-[rgb(var(--primary))]" /> Professional Credentials
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider block mb-1">
            Specialization <span className="text-red-500">*</span>
          </label>
          <input
            name="specialization"
            value={data.specialization}
            onChange={onChange}
            readOnly={!isEditing}
            placeholder="e.g. Clinical Psychologist"
            className={`${getInputClass(errors.specialization)} text-lg font-medium text-[rgb(var(--text))] bg-transparent`}
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider block mb-1">
            License Number <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              name="licenseNumber"
              value={data.licenseNumber}
              onChange={onChange}
              readOnly={!isEditing}
              placeholder="e.g. PSY-123456"
              className={`${getInputClass(errors.licenseNumber)} font-mono text-[rgb(var(--primary))] max-w-xs bg-transparent`}
            />
            <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 select-none">
              <ShieldCheck size={12} /> VERIFIED
            </span>
          </div>
        </div>
      </div>
      
      {/* Current Practice */}
      <div className="mt-8 pt-8 border-t border-[rgb(var(--border))]">
         <div className="flex items-center gap-2 mb-2 text-[rgb(var(--text))] font-semibold text-lg">
            <Briefcase className="text-orange-400" /> Current Practice
         </div>
         <div>
            <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider block mb-1">
               Clinic Name <span className="text-red-500">*</span>
            </label>
            <input
               name="clinicName"
               value={data.clinicName}
               onChange={onChange}
               readOnly={!isEditing}
               placeholder="e.g. Mindful Horizons"
               className={`${getInputClass(errors.clinicName)} text-lg font-medium text-[rgb(var(--text))] bg-transparent`}
            />
         </div>
      </div>
    </div>
  );
}
