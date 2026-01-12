import * as Yup from "yup";
const TEN_YEARS_MS = 10 * 365.25 * 24 * 60 * 60 * 1000;
/*frontend fields*/
export const patientCreateSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string().trim().email("Invalid email").nullable(),
  countryCode: Yup.string().required("Country code is required"),
  phone: Yup.string()
    .trim()
    .required("Phone is required")
    .when("countryCode", {
      is: "+20",
      then: (schema) =>
        schema.matches(
          /^(0\d{10}|\d{10})$/,
          "Egypt phone must be 10 digits or 11 digits starting with 0"
        ),
      otherwise: (schema) =>
        schema.matches(/^\d{7,15}$/, "Phone must be 7 to 15 digits"),
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
  let localPhone = (values.phone || "").trim();

  if (values.countryCode === "+20" && localPhone.startsWith("0")) {
    localPhone = localPhone.slice(1); // remove leading 0
  }

  return {
    full_name: values.fullName,
    contact_email: values.email || null,
    contact_phone: `${values.countryCode}${localPhone}`,
    gender: values.gender,
    date_of_birth: values.dob,
    notes: values.notes,
  };
}

