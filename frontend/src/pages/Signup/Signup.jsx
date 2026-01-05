import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import api from "../../api/axiosInstance";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import { setAuth } from "../../auth/storage";

// Components
import AuthSplitLayout from "../../layouts/AuthSplitLayout";
import AuthInput from "../../components/ui/AuthInput";
import { signupSchema, toSignupPayload, mapAuthFieldErrors } from "../../Forms/schemas";
import { useAppFormik } from "../../Forms/useAppFormik";

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  const { formik, apiError } = useAppFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
    mapFieldErrors: mapAuthFieldErrors,
    onSubmit: async (values) => {
      setMessage("");
      await api.post("/auth/register/", toSignupPayload(values));
      navigate("/login", { replace: true });
    },
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await api.post("/auth/google/login/", {
          access_token: tokenResponse.access_token,
        });

        setAuth({
          accessToken: data.access,
          user: data.user,
        });

        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error(err);
        setMessage("Google login failed. Please try again.");
      }
    },
    onError: () => {
      setMessage("Google login failed.");
    },
  });

  const LeftSide = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-[#F0F3FA]">
        Join Our Platform
      </h1>
      <p className="text-base lg:text-lg text-[#ded8d7] leading-relaxed">
        Join thousands of therapists who trust our platform. Create your account
        in seconds and unlock all features.
      </p>
    </>
  );

  const RightSide = (
    <>
      <h2 className="text-3xl lg:text-4xl font-bold mb-2 text-[#F0F3FA]">
        Create Account
      </h2>
      <p className="text-base mb-6 text-[#8D8F8E]">Fill in your details to get started</p>

      {/* Server (non-field) error */}
      {apiError && <p className="mb-4 text-red-500 font-medium">{apiError}</p>}
      {message && <p className="mb-4 text-green-600 font-medium">{message}</p>}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <AuthInput
            id="fullName"
            name="fullName"
            label="Full Name"
            icon={User}
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Your full name"
            autoComplete="name"
          />
          {formik.touched.fullName && formik.errors.fullName ? (
            <p className="mt-1 text-sm text-red-500">{formik.errors.fullName}</p>
          ) : null}
        </div>

        {/* Email */}
        <div>
          <AuthInput
            id="email"
            name="email"
            label="Email Address"
            icon={Mail}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
          ) : null}
        </div>

        {/* Password */}
        <div>
          <AuthInput
            id="password"
            name="password"
            label="Password"
            icon={Lock}
            type="password"
            isPassword={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="mt-1 text-sm text-red-500">{formik.errors.password}</p>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div>
          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            icon={Lock}
            type="password"
            isPassword={true}
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-500">{formik.errors.confirmPassword}</p>
          ) : null}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold bg-[#5B687C] text-[#D4CDCB] hover:bg-[#6e7b8c] transition-colors disabled:opacity-60 cursor-pointer"
        >
          {formik.isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="flex items-center my-8">
        <div className="flex-grow border-t border-[#5B687C]"></div>
        <span className="mx-4 text-[#8D8F8E] text-sm">Or continue with</span>
        <div className="flex-grow border-t border-[#5B687C]"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
        <button
          onClick={() => googleLogin()}
          className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
        >
          <FaGoogle />
          Continue with Google
        </button>
      </div>

      <p className="mt-8 text-center text-[#8D8F8E]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#ebf2f5] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );

  return <AuthSplitLayout leftContent={LeftSide} rightContent={RightSide} />;
}