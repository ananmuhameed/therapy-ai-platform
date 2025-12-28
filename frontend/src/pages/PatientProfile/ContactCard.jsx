import { FiPhone, FiMail } from "react-icons/fi";
import { classNames } from "../../utils/helpers";
export default function ContactCard({ patient, isEditing, onChange }) {
  const inputBase = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500 cursor-text";
  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";

  return (
    <div className={classNames(cardBase, "p-6 mb-6")}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Contact</h2>
        <span className="text-xs text-gray-500">Phone & Email</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
          <FiPhone className="text-[#3078E2]" />
          {isEditing ? (
            <input
              name="contact_phone"
              value={patient.contact_phone}
              onChange={onChange}
              placeholder="Phone"
              className={classNames(inputBase, "bg-white")}
            />
          ) : patient.contact_phone ? (
            <a
              className="text-sm text-gray-700 hover:text-[#3078E2] cursor-pointer"
              href={`tel:${patient.contact_phone}`}
            >
              {patient.contact_phone}
            </a>
          ) : (
            <span className="text-sm text-gray-500">No phone</span>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
          <FiMail className="text-[#3078E2]" />
          {isEditing ? (
            <input
              name="contact_email"
              value={patient.contact_email}
              onChange={onChange}
              placeholder="Email"
              className={classNames(inputBase, "bg-white")}
            />
          ) : patient.contact_email ? (
            <a
              className="text-sm text-gray-700 hover:text-[#3078E2] cursor-pointer"
              href={`mailto:${patient.contact_email}`}
            >
              {patient.contact_email}
            </a>
          ) : (
            <span className="text-sm text-gray-500">No email</span>
          )}
        </div>
      </div>
    </div>
  );
}