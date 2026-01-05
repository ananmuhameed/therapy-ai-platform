import * as Yup from "yup";

/*frontend fields*/
export const patientCreateSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string().trim().email("Invalid email").nullable(),
  countryCode: Yup.string().required("Country code is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\d{7,15}$/, "Phone must be 7 to 15 digits")
    .required("Phone is required"),
  gender: Yup.string()
    .oneOf(["female", "male"], "Select gender")
    .required("Gender is required"),
  dob: Yup.string().required("Date of birth is required"),
  notes: Yup.string().nullable(),
});

/*Backend -> UI error mapping*/
export function mapPatientFieldErrors(fe = {}) {
  const map = {
    full_name: "fullName",
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

/* api payload*/
export function toPatientCreatePayload(values) {
  return {
    full_name: values.fullName,
    contact_email: values.email || null,
    contact_phone: `${values.countryCode}${values.phone}`,
    gender: values.gender,
    date_of_birth: values.dob,
    notes: values.notes,
  };
}
