import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { Mail, Calendar, LogOut, Save, Edit2, Trash2 } from "lucide-react";

export default function ProfileHeader({
  user,
  isEditing,
  onLogout,
  onToggleEdit,
  onDelete
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div className="flex gap-2 items-center">
        <div className="text-[#3078E2] p-1 rounded-xl self-start -mt-1 ml-4">
          <FaUserCircle size={42} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dr. {user.firstName} {user.lastName}
          </h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500 items-center">
            <div className="flex items-center gap-1 bg-white border border-white px-3 py-1 rounded-full shadow-sm">
              <Mail size={14} className="text-blue-500" />
              <span className="text-slate-600">{user.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 p-2">
            <Calendar size={12} /> Joined Today
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4 md:mt-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors cursor-pointer"
        >
          <LogOut size={16} /> Logout
        </button>

        <button
          onClick={onToggleEdit}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-colors font-bold cursor-pointer ${
            isEditing
              ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isEditing ? (
            <>
              <Save size={16} /> Save Changes
            </>
          ) : (
            <>
              <Edit2 size={16} /> Edit Profile
            </>
          )}
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 text-red-600 rounded-2xl hover:bg-red-100 transition-colors cursor-pointer"
          title="Delete Profile"
        >
          <Trash2 size={22} />
        </button>
      </div>
    </div>
  );
}