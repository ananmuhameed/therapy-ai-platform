import { useState } from "react";
import { X } from "lucide-react";
import api from "../../api/axiosInstance";
import { classNames } from "../../utils/helpers";

export default function AddPatientForm({ onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    countryCode: "+20",
    phone: "",
    gender: "",
    dob: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // More comfortable inputs (taller)
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500";
  const labelClass = "text-xs font-medium text-gray-700";
  const hintClass = "mt-1 text-xs text-gray-500";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      full_name: form.fullName.trim(),
      contact_email: form.email.trim() || null,
      contact_phone: form.phone ? `${form.countryCode}${form.phone}` : null,
      gender: form.gender || null,
      date_of_birth: form.dob || null,
      notes: form.notes.trim() || "",
    };

    try {
      setSubmitting(true);
      await api.post("/patients/", payload);
      onClose?.();
    } catch (err) {
      console.error("Failed to create patient", err);
      setError(
        err?.response?.data?.detail ||
          "Failed to create patient. Please check inputs."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Narrower card (less width)
    <div className="w-[min(92vw,520px)]">
      {/* Header (more height) */}
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">New Patient</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add patient details to your workspace.
          </p>
        </div>

        <button
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          type="button"
          aria-label="Close"
          title="Close"
          disabled={submitting}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body (more vertical spacing) */}
      <form onSubmit={handleSubmit} className="px-6 py-6">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            {error}
          </div>
        )}

        {/* Taller layout: single column with larger gaps */}
        <div className="grid grid-cols-1 gap-5">
          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="First and last name"
              className={inputClass}
              required
              disabled={submitting}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={inputClass}
              disabled={submitting}
            />
            <div className={hintClass}>Optional</div>
          </div>

          {/* Phone 25/75 (still ok in narrow layout) */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="mt-1 grid grid-cols-[1fr_3fr] gap-3">
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                className={classNames(
                  inputClass,
                  "appearance-none cursor-pointer"
                )}
                disabled={submitting}
              >
                <option value="+20">+20</option>
                <option value="+966">+966</option>
                <option value="+971">+971</option>
              </select>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="1234567890"
                className={inputClass}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className={labelClass}>Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={classNames(inputClass, "appearance-none cursor-pointer")}
              disabled={submitting}
            >
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className={inputClass}
              disabled={submitting}
            />
          </div>

          {/* Notes (bigger = more height) */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes (optional)…"
              className={classNames(inputClass, "min-h-[160px] resize-y")}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Footer (spaced out) */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[#3078E2] px-4 py-3 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save Patient"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
