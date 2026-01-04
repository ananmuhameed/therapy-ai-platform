import { X } from "lucide-react";
import api from "../../api/axiosInstance";
import { useAppFormik } from "../../Forms/useAppFormik";
import {
  patientCreateSchema,
  mapPatientFieldErrors,
  toPatientCreatePayload,
} from "../../Forms/schemas";

export default function AddPatientForm({ onClose }) {
  const { formik, apiError } = useAppFormik({
    initialValues: {
      fullName: "",
      email: "",
      countryCode: "+20",
      phone: "",
      gender: "",
      dob: "",
      notes: "",
    },
    validationSchema: patientCreateSchema,
    mapFieldErrors: mapPatientFieldErrors,
    onSubmit: async (values) => {
      const payload = toPatientCreatePayload(values);
      await api.post("/patients/", payload);
      onClose?.();
    },
  });

  const inputBase =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

  const labelBase = "text-sm font-semibold text-slate-700";

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600">{formik.errors[name]}</p>
    ) : null;

  return (
    <div className="w-[min(92vw,520px)] rounded-2xl bg-white shadow-xl px-6 pt-8 pb-0">
      {/* Header */}
      <div className="relative flex items-center justify-center">
  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#2F76E2] to-[#7FB0F2] bg-clip-text text-transparent">
    New Patient
  </h1>

  <button
    onClick={onClose}
    className="absolute right-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
  >
    <X className="h-5 w-5" />
  </button>
</div>

      <div className="px-5 pb-6">
        {apiError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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

          {/* Email */}
          <div>
            <label className={labelBase}>E-mail</label>
            <input
              className={`${inputBase} mt-2`}
              type="email"
              name="email"
              placeholder="example@examole.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {fieldError("email")}
          </div>

          {/* Phone */}
          <div>
            <label className={labelBase}>Phone Number</label>
            <div className="mt-2 grid grid-cols-[110px_1fr] gap-3">
              <select
                className={inputBase}
                name="countryCode"
                value={formik.values.countryCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="+20">+20</option>
                <option value="+966">+966</option>
                <option value="+971">+971</option>
              </select>

              <input
                className={inputBase}
                type="tel"
                name="phone"
                placeholder="1234567890"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {fieldError("phone")}
          </div>

          {/* Gender + DOB */}
          <div className="grid grid-cols-2 gap-4">
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
              placeholder="additional notes"
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
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#2F76E2] to-[#7FB0F2] py-4 text-lg font-bold text-white shadow-md hover:brightness-95 disabled:opacity-60"
          >
            {formik.isSubmitting ? "Saving..." : "Save Patient"}
          </button>
        </form>
      </div>
    </div>
  );
}
