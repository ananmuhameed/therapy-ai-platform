import { FiPhone, FiMail } from "react-icons/fi";
import { classNames } from "../../utils/helpers";

export default function ContactCard({ patient, isEditing, onChange }) {
  const inputBase =
    "w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] shadow-sm outline-none transition focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/20 disabled:opacity-60 cursor-text";

  const cardBase =
    "rounded-2xl bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]";

  return (
    <div className={classNames(cardBase, "p-6 mb-6")}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Contact</h2>
        <span className="text-xs text-[rgb(var(--text-muted))]">Phone & Email</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-3">
          <FiPhone className="text-[rgb(var(--primary))]" />
          {isEditing ? (
            <input
              name="contact_phone"
              value={patient.contact_phone}
              onChange={onChange}
              placeholder="Phone"
              className={classNames(inputBase)}
            />
          ) : patient.contact_phone ? (
            <a
              className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] cursor-pointer"
              href={`tel:${patient.contact_phone}`}
            >
              {patient.contact_phone}
            </a>
          ) : (
            <span className="text-sm text-[rgb(var(--text-muted))]">No phone</span>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-3">
          <FiMail className="text-[rgb(var(--primary))]" />
          {isEditing ? (
            <input
              name="contact_email"
              value={patient.contact_email}
              onChange={onChange}
              placeholder="Email"
              className={classNames(inputBase)}
            />
          ) : patient.contact_email ? (
            <a
              className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] cursor-pointer"
              href={`mailto:${patient.contact_email}`}
            >
              {patient.contact_email}
            </a>
          ) : (
            <span className="text-sm text-[rgb(var(--text-muted))]">No email</span>
          )}
        </div>
      </div>
    </div>
  );
}
