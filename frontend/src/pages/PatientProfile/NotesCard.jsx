import { classNames } from "../../utils/helpers";

export default function NotesCard({ notes, isEditing, onChange }) {
  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";
  const inputBase = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500 cursor-text";

  return (
    <div className={classNames(cardBase, "p-6")}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
        <span className="text-xs text-gray-500">{isEditing ? "Editable" : "Read only"}</span>
      </div>

      {isEditing ? (
        <textarea
          name="notes"
          value={notes}
          onChange={onChange}
          placeholder="Write notes about the patient..."
          className={classNames(inputBase, "min-h-[160px] resize-none")}
        />
      ) : (
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {notes || "No notes."}
        </p>
      )}
    </div>
  );
}