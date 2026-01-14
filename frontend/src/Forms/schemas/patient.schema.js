import * as Yup from "yup";
const TEN_YEARS_MS = 10 * 365.25 * 24 * 60 * 60 * 1000;
/*frontend fields*/
export const patientCreateSchema = Yup.object({
  patientId: Yup.string()
    .required("National ID is required")
    .matches(/^\d{14}$/, "National ID must be exactly 14 digits"),
  fullName: Yup.string()
    .trim()
    .required("Full name is required")
    .matches(/^[A-Za-z\u0600-\u06FF\s]+$/, "Name must contain letters only")
    .test("four-names", "Full name must contain exactly 4 names", (value) => {
      if (!value) return false;
      return value.trim().split(/\s+/).length === 4;
    }),

  email: Yup.string()
    .transform((value) => (value === "" ? null : value))
    .email("Invalid email")
    .nullable()
    .notRequired(),

  countryCode: Yup.string().required("Country code is required"),

  phone: Yup.string()
  .required("Phone number is required")
  .transform((v) => (v ? v.replace(/\D/g, "") : ""))
  .test("egyptian-mobile", function (v) {
    if (!v) return false;

    // Case 1: starts with 0 → must be 11 digits
    if (v.startsWith("0")) {
      if (v.length !== 11) {
        return this.createError({
          message: "Phone numbers must be exactly 11 digits",
        });
      }

      if (!/^(010|011|012|015)\d{8}$/.test(v)) {
        return this.createError({
          message:
            "Phone number must start with 010, 011, 012, or 015",
        });
      }

      return true;
    }

    // Case 2: does NOT start with 0 → must be 10 digits
    if (v.length !== 10) {
      return this.createError({
        message:
          "Enter 10 digits without the leading 0 (example: 1000777620)",
      });
    }

    if (!/^(10|11|12|15)\d{8}$/.test(v)) {
      return this.createError({
        message:
          "Phone number must start with 10, 11, 12, or 15",
      });
    }

    return true;
  }),


  gender: Yup.string()
    .oneOf(["female", "male"], "Select gender")
    .required("Gender is required"),

  dob: Yup.date()
    .typeError("Date of birth is required")
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future")
    .test("min-age", "Patient must be at least 10 years old", (value) => {
      if (!value) return false;
      return Date.now() - new Date(value).getTime() >= TEN_YEARS_MS;
    }),

  notes: Yup.string().nullable(),
});

/*Backend -> UI error mapping*/
export function mapPatientFieldErrors(fe = {}) {
  const map = {
    full_name: "fullName",
    patient_id: "patientId",
    contact_email: "email",
    contact_phone: "phone",
    gender: "gender",
    date_of_birth: "dob",
    notes: "notes",
  };

  const out = {};
  Object.entries(fe).forEach(([k, v]) => {
    out[map[k] || k] = v;
  });
  return out;
}


export function toPatientCreatePayload(values) {
  const raw = (values.phone || "").replace(/\D/g, "");
  const normalized = raw.startsWith("0") ? raw.slice(1) : raw;
  return {
    full_name: values.fullName,
    patient_id: values.patientId,
    contact_email: values.email?.trim() ? values.email.trim() : null,
    contact_phone: `${values.countryCode}${normalized}`,
    gender: values.gender,
    date_of_birth: values.dob,
    notes: values.notes,
  };
}
