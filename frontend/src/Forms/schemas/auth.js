import * as Yup from "yup";
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const loginSchema = Yup.object({
  email: Yup.string().trim().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const signupSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .required("Full name is required")
    .test("has-two-parts", "Please enter your full name (first and last).", (v) => {
      const parts = String(v || "").trim().split(/\s+/).filter(Boolean);
      return parts.length >= 2;
    }),

  email: Yup.string().trim().email("Invalid email").required("Email is required"),

  password: Yup.string()
    .required("Password is required")
    .matches(
      strongPasswordRegex,
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    ),

  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords do not match!"),
});

export function toSignupPayload(values) {
  const fullName = String(values.fullName || "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);

  const first_name = parts[0] || "";
  const last_name = parts.slice(1).join(" ") || "";

  return {
    first_name,
    last_name,
    email: String(values.email || "").trim(),
    password: values.password,
    password_confirm: values.confirmPassword, 
    remember_me: values.remember_me,
  };
}

export function toLoginPayload(values) {
  return {
    email: String(values.email || "").trim(),
    password: values.password,
      remember_me: values.remember_me,
  };
}

export function mapAuthFieldErrors(fe = {}) {
  const map = {
    first_name: "fullName", 
    last_name: "fullName",
    full_name: "fullName",
    email: "email",
    password: "password",
    password_confirm: "confirmPassword",
    confirm_password: "confirmPassword",
    non_field_errors: "_form",
    detail: "_form",
  };

  const out = {};
  Object.entries(fe).forEach(([k, v]) => {
    out[map[k] || k] = v;
  });
  return out;
}
