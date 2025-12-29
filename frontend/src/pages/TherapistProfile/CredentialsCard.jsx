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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative mb-6">
      {isEditing && (
        <span className="absolute top-4 right-4 text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">
          EDITING MODE
        </span>
      )}

      {/* Credentials */}
      <div className="flex items-center gap-2 mb-6 text-slate-900 font-semibold text-lg">
        <Award className="text-blue-500" /> Professional Credentials
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Specialization <span className="text-red-500">*</span>
          </label>
          <input
            name="specialization"
            value={data.specialization}
            onChange={onChange}
            readOnly={!isEditing}
            placeholder="e.g. Clinical Psychologist"
            className={`${getInputClass(errors.specialization)} text-lg font-medium text-slate-900`}
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            License Number <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              name="licenseNumber"
              value={data.licenseNumber}
              onChange={onChange}
              readOnly={!isEditing}
              placeholder="e.g. PSY-123456"
              className={`${getInputClass(errors.licenseNumber)} font-mono text-blue-700 max-w-xs`}
            />
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 select-none">
              <ShieldCheck size={12} /> VERIFIED
            </span>
          </div>
        </div>
      </div>
      
      {/* Current Practice (Merged here as per layout flow, or can be separated) */}
      <div className="mt-8 pt-8 border-t border-gray-100">
         <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-lg">
            <Briefcase className="text-orange-500" /> Current Practice
         </div>
         <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
               Clinic Name <span className="text-red-500">*</span>
            </label>
            <input
               name="clinicName"
               value={data.clinicName}
               onChange={onChange}
               readOnly={!isEditing}
               placeholder="e.g. Mindful Horizons"
               className={`${getInputClass(errors.clinicName)} text-lg font-medium text-slate-900`}
            />
         </div>
      </div>
    </div>
  );
}