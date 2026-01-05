import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import api from "../../api/axiosInstance";
import { setAuth } from "../../auth/storage";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import { useAppFormik } from "../../Forms/useAppFormik";
import {
  loginSchema,
  toLoginPayload,
  mapAuthFieldErrors,
} from "../../Forms/schemas";

// Components
import AuthSplitLayout from "../../layouts/AuthSplitLayout";
import LoginBranding from "./LoginBranding";
import AuthInput from "../../components/ui/AuthInput";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formik, apiError } = useAppFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    mapFieldErrors: mapAuthFieldErrors,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const { data } = await api.post("/auth/login/", toLoginPayload(values));
        setAuth({ accessToken: data.access, user: data.user });
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError("Login failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
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
        setError("Google login failed.");
      }
    },
    onError: () => setError("Google login failed."),
  });

  const LeftSide = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-[#F0F3FA]">
        Welcome Back
      </h1>
      <p className="text-base lg:text-lg text-[#ded8d7] leading-relaxed">
        Please sign in to continue to your dashboard
      </p>
    </>
  );

  const RightSide = (
    <>
      <h2 className="text-3xl lg:text-4xl font-bold mb-2 text-[#F0F3FA]">
        Sign In
      </h2>
      <p className="text-base mb-6 text-[#8D8F8E]">Enter your credentials</p>

      {/* Server (non-field) error */}
      {apiError && <p className="mb-4 text-red-500 font-medium">{apiError}</p>}
      {error && <p className="mb-4 text-red-500 font-medium">{error}</p>}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
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
            autoComplete="current-password"
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="mt-1 text-sm text-red-500">{formik.errors.password}</p>
          ) : null}
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer text-[#8D8F8E]">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              style={{ accentColor: "#5B687C" }}
            />
            <span className="ml-2 text-sm">Remember me</span>
          </label>

          <button
            type="button"
            className="text-sm font-medium hover:underline text-[#5B687C]"
            onClick={() => alert("Forgot password flow not implemented yet")}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#5B687C", color: "#D4CDCB" }}
        >
          {formik.isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Social login */}
      <div className="flex items-center my-8">
        <div className="flex-grow border-t border-[#5B687C]"></div>
        <span className="mx-4 text-[#8D8F8E] text-sm">Or continue with</span>
        <div className="flex-grow border-t border-[#5B687C]"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => googleLogin()}
          className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
        >
          <FaGoogle />
          Continue with Google
        </button>
      </div>

      <div className="mt-8 text-center text-[#8D8F8E]">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold hover:underline text-[#ebf2f5]"
        >
          Sign up
        </Link>
      </div>
    </>
  );

  return <AuthSplitLayout leftContent={<LoginBranding />} rightContent={RightSide} />;
}
