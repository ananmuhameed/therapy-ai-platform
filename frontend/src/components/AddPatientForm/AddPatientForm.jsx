//import api from "../../api/axiosInstance";
import { useAppFormik } from "../../Forms/useAppFormik";
import {
  patientCreateSchema,
  mapPatientFieldErrors,
  toPatientCreatePayload,
} from "../../Forms/schemas";
import "./AddPatientForm.css";
import { useCreatePatient } from "../../queries/patients";

export default function AddPatientForm({ onClose }) {
  const createPatient = useCreatePatient();
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
      await createPatient.mutateAsync(payload);
      onClose?.();
    },
  });

  return (
    <div className="ap-container">
      <h1 className="ap-title">New Patient</h1>

      {/* Non-field/server error */}
      {apiError ? (
        <p style={{ color: "red", marginBottom: 12 }}>{apiError}</p>
      ) : null}

      <form className="ap-form" onSubmit={formik.handleSubmit}>
        {/* Full Name */}
        <label>
          Full Name
          <input
            type="text"
            name="fullName"
            placeholder="First and last name"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.fullName && formik.errors.fullName ? (
            <small style={{ color: "red" }}>{formik.errors.fullName}</small>
          ) : null}
        </label>

        {/* Email */}
        <label>
          E-mail
          <input
            type="email"
            name="email"
            placeholder="example@examole.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email ? (
            <small style={{ color: "red" }}>{formik.errors.email}</small>
          ) : null}
        </label>

        {/* Phone */}
        <label>
          Phone Number
          <div className="ap-phone">
            <select
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
              type="tel"
              name="phone"
              placeholder="1234567890"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.phone && formik.errors.phone ? (
            <small style={{ color: "red" }}>{formik.errors.phone}</small>
          ) : null}
        </label>

        {/* Gender & DOB */}
        <div className="ap-row">
          <label>
            Gender
            <select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Option</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            {formik.touched.gender && formik.errors.gender ? (
              <small style={{ color: "red" }}>{formik.errors.gender}</small>
            ) : null}
          </label>

          <label>
            Date Of Birth
            <div className="ap-date">
              <input
                type="date"
                name="dob"
                value={formik.values.dob}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.dob && formik.errors.dob ? (
              <small style={{ color: "red" }}>{formik.errors.dob}</small>
            ) : null}
          </label>
        </div>

        {/* Notes */}
        <label>
          Notes
          <textarea
            name="notes"
            placeholder="additional notes"
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.notes && formik.errors.notes ? (
            <small style={{ color: "red" }}>{formik.errors.notes}</small>
          ) : null}
        </label>

        {/* Optional */}
        <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Saving..." : "Save Patient"}
        </button>
      </form>
    </div>
  );
}
