import { FaUserCircle } from "react-icons/fa";
import { Mail, Calendar, ArrowRight, Save, Edit2, X } from "lucide-react";

// Utility: capitalize first letter safely
const capitalize = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

export default function ProfileHeader({
  user,
  isEditing,
  isSaving,
  onGoDashboard,
  onStartEdit,
  onSave,
  onCancel,
}) {
  const firstName = capitalize(user?.firstName);
  const lastName = capitalize(user?.lastName);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      {/* Left: identity */}
      <div className="flex gap-2 items-center">
        <div className="text-[#3078E2] p-1 rounded-xl self-start -mt-1 ml-4">
          <FaUserCircle size={42} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dr. {firstName} {lastName}
          </h1>

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500 items-center">
            <div className="flex items-center gap-2 bg-white border border-white px-3 py-1 rounded-full shadow-sm">
              <Mail size={14} className="text-blue-500" />
              <span className="text-slate-600">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 p-2">
            <Calendar size={12} /> Joined Today
          </div>
        </div>
      </div>

      {/* Right: page actions (Dashboard + Edit/Save/Cancel) */}
      <div className="flex flex-wrap gap-3 md:gap-2 md:justify-end w-full md:w-auto">
        {/* Dashboard on the LEFT of edit/save/cancel */}
        <button
          type="button"
          onClick={onGoDashboard}
          disabled={isSaving}
          className="
             flex items-center gap-2 px-4 py-2 rounded-2xl
            bg-[#3078E2] text-white hover:bg-blue-700 transition-all
            shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          <span>Dashboard</span>
          <ArrowRight size={18} />
        </button>

        {!isEditing ? (
          <button
            type="button"
            onClick={onStartEdit}
            disabled={isSaving}
            className="
              flex items-center gap-2 px-4 py-2 rounded-2xl
              bg-blue-500 text-white hover:bg-blue-600 transition-all
              shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <Edit2 size={16} />
            <span>Edit</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="
                flex items-center gap-2 px-4 py-2 rounded-2xl
                bg-green-600 text-white hover:bg-green-700 transition-all
                shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              <Save size={16} />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="
                flex items-center gap-2 px-4 py-2 rounded-2xl
                bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
