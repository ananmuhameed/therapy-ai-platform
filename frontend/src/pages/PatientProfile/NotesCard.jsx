import { classNames } from "../../utils/helpers";

export default function NotesCard({ notes, isEditing, onChange }) {
  const cardBase =
    "rounded-2xl bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]";

  const inputBase =
    "w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] shadow-sm outline-none transition focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/20 disabled:opacity-60 cursor-text";

  return (
    <div className={classNames(cardBase, "p-6")}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Notes</h2>
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {isEditing ? "Editable" : "Read only"}
        </span>
      </div>

      {isEditing ? (
        <textarea
          name="notes"
          value={notes}
          onChange={onChange}
          placeholder="Write notes about the patient..."
          className={classNames(
            inputBase,
            "min-h-[160px] resize-none"
          )}
        />
      ) : (
        <p className="text-sm text-[rgb(var(--text-muted))] whitespace-pre-wrap">
          {notes || "No notes."}
        </p>
      )}
    </div>
  );
}
