import * as Yup from "yup";

export const therapistProfileSchema = Yup.object({
  specialization: Yup.string().trim().required("Specialization is required"),
  licenseNumber: Yup.string().trim().required("License number is required"),
  clinicName: Yup.string().trim().required("Clinic name is required"),
  city: Yup.string().trim().required("City is required"),
  country: Yup.string().trim().required("Country is required"),
  yearsExperience: Yup.number()
    .typeError("Years of experience must be a number")
    .integer("Must be a whole number")
    .min(0, "Must be >= 0")
    .max(80, "Too high")
    .required("Years of experience is required"),
});

export function toTherapistProfilePayload(values) {
  return {
    specialization: values.specialization,
    license_number: values.licenseNumber,
    clinic_name: values.clinicName,
    city: values.city,
    country: values.country,
    years_experience: Number(values.yearsExperience),
  };
}

export function mapTherapistProfileFieldErrors(fe = {}) {
  const map = {
    specialization: "specialization",
    license_number: "licenseNumber",
    clinic_name: "clinicName",
    city: "city",
    country: "country",
    years_experience: "yearsExperience",
  };

  const out = {};
  Object.entries(fe).forEach(([k, v]) => {
    out[map[k] || k] = v;
  });
  return out;
}
