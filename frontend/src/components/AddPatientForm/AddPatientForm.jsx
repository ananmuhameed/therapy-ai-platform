import React from "react";
import { FiX } from "react-icons/fi";
import { useCreatePatient } from "../../queries/patients";
import { useAppFormik } from "../../Forms/useAppFormik";
import {
  patientCreateSchema,
  mapPatientFieldErrors,
  toPatientCreatePayload,
} from "../../Forms/schemas";

export default function AddPatientForm({ onClose }) {
  const createPatient = useCreatePatient();
  const { formik, apiError } = useAppFormik({
    initialValues: {
      patientId: "",
      countryCode: "+20",
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      notes: "",
    },
    validationSchema: patientCreateSchema,
    mapFieldErrors: mapPatientFieldErrors,
    onSubmit: async (values) => {
      console.log("SUBMIT", values);
      const payload = toPatientCreatePayload(values);
      console.log("PAYLOAD", payload);

      try {
        await createPatient.mutateAsync(payload);
        onClose?.(true);
      } catch (err) {
        console.log("API ERROR:", err?.response?.data);
        throw err;
      }
    },
  });

  const inputBase =
    "w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--text-muted))] outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/20";

  const labelBase = "text-sm font-semibold text-[rgb(var(--text))]";

  const fieldError = (name) =>
    (formik.touched[name] || formik.submitCount > 0) && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-400">{formik.errors[name]}</p>
    ) : null;

  return (
    <div className="w-full max-w-[520px] rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-xl px-4 sm:px-6 pt-6 sm:pt-8 pb-0 text-[rgb(var(--text))]">
      {/* Header */}
      <div className="relative flex items-center justify-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#2F76E2] to-[#7FB0F2] bg-clip-text text-transparent">
          New Patient
        </h1>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.(false);
          }}
          className="absolute right-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-[rgb(var(--text-muted))] hover:bg-white/5"
          aria-label="Close"
          title="Close"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className="px-1 sm:px-5 pb-6">
        {apiError && (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {apiError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-5 space-y-5">
          {/* Full Name */}
          <div>
            <label className={labelBase}>Full Name</label>
            <input
              className={`${inputBase} mt-2`}
              name="fullName"
              placeholder="First and last name"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {fieldError("fullName")}
          </div>

          {/* National ID */}
          <div>
            <label className={labelBase}>National ID</label>
            <input
              className={`${inputBase} mt-2`}
              name="patientId"
              placeholder="14-digit National ID"
              value={formik.values.patientId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                formik.setFieldValue("patientId", value);
              }}
              onBlur={formik.handleBlur}
              maxLength={14}
              inputMode="numeric"
            />
            {fieldError("patientId")}
          </div>

          {/* Email */}
          <div>
            <label className={labelBase}>E-mail</label>
            <input
              className={`${inputBase} mt-2`}
              type="email"
              name="email"
              placeholder="example@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {fieldError("email")}
          </div>

          {/* Phone */}
          <div>
            <label className={labelBase}>Phone Number</label>

            <div className="mt-2 grid grid-cols-[80px_1fr] gap-3">
              <div className="flex items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] text-sm font-semibold text-[rgb(var(--text))]">
                +20
              </div>

              <input
                className={inputBase}
                type="tel"
                name="phone"
                placeholder="01XXXXXXXXX"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            {fieldError("phone")}
          </div>

          {/* Gender + DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Gender</label>
              <select
                className={`${inputBase} mt-2`}
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Option</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              {fieldError("gender")}
            </div>

            <div>
              <label className={labelBase}>Date Of Birth</label>
              <input
                className={`${inputBase} mt-2`}
                type="date"
                name="dob"
                value={formik.values.dob}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {fieldError("dob")}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelBase}>Notes</label>
            <textarea
              className={`${inputBase} mt-2 h-24 resize-none`}
              name="notes"
              placeholder="Additional notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {fieldError("notes")}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#2F76E2] to-[#7FB0F2] py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-md hover:brightness-95 disabled:opacity-60"
          >
            {formik.isSubmitting ? "Saving..." : "Save Patient"}
          </button>
        </form>
      </div>
    </div>
  );
}
