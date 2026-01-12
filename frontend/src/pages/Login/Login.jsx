import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import { toast } from "react-toastify";

import api, { raw } from "../../api/axiosInstance";
import { setAuth } from "../../auth/storage";
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
  const [showResend, setShowResend] = useState(false);
  const [lastEmail, setLastEmail] = useState("");

  const { formik, apiError } = useAppFormik({
    initialValues: {
      email: "",
      password: "",
      remember_me: false,
    },
    validationSchema: loginSchema,
    mapFieldErrors: mapAuthFieldErrors,

    onSubmit: async (values) => {
      setError("");
      setShowResend(false);

      // keep email even if Formik resets
      setLastEmail(values.email);

      try {
        const { data } = await raw.post(
          "/auth/login/",
          toLoginPayload(values)
        );

        setAuth({
          accessToken: data.access,
          user: data.user,
        });

        navigate("/dashboard", { replace: true });
      } catch (err) {
        const status = err.response?.status;

        if (status === 403) {
          setError("Please verify your email before logging in.");
          setShowResend(true);
        } else if (status === 401) {
          setError("Invalid email or password.");
        } else {
          setError("Login failed. Please try again.");
        }
      }
    },
  });

  // resend verification email (NO auth required)
  const resendVerification = async () => {
    if (!lastEmail) {
      toast.error("Please enter your email first");
      return;
    }

    try {
      await raw.post("/resend-verification/", {
        email: lastEmail,
      });
      toast.success("Verification email sent");
    } catch {
      toast.error("Unable to resend verification email");
    }
  };

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
      } catch {
        setError("Google login failed.");
      }
    },
    onError: () => setError("Google login failed."),
  });

  const RightSide = (
    <>
      <h2 className="text-3xl lg:text-4xl font-bold mb-2 text-[#F0F3FA]">
        Sign In
      </h2>
      <p className="text-base mb-6 text-[#8D8F8E]">
        Enter your credentials
      </p>

      {apiError && <p className="mb-4 text-red-500">{apiError}</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Email */}
        <AuthInput
          id="email"
          name="email"
          label="Email Address"
          icon={Mail}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="you@example.com"
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-sm text-red-500">{formik.errors.email}</p>
        )}

        {/* Password */}
        <AuthInput
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          type="password"
          isPassword
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="••••••••"
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-sm text-red-500">{formik.errors.password}</p>
        )}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold bg-[#5B687C] text-[#D4CDCB] disabled:opacity-60"
        >
          {formik.isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Resend verification — ONLY if email not verified */}
      {showResend && (
        <button
          type="button"
          onClick={resendVerification}
          className="mt-3 text-sm text-blue-600 underline"
        >
          Resend verification email
        </button>
      )}
      <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center cursor-pointer text-[#8D8F8E]">
  <input
    type="checkbox"
    name="remember_me"
    checked={formik.values.remember_me}
    onChange={formik.handleChange}
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

      {/* Social login */}
      <div className="flex items-center my-8">
        <div className="flex-grow border-t border-[#5B687C]" />
        <span className="mx-4 text-[#8D8F8E] text-sm">
          Or continue with
        </span>
        <div className="flex-grow border-t border-[#5B687C]" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => googleLogin()}
          className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
        >
          <FaGoogle />
          Continue with Google
        </button>
      </div>

      <p className="mt-8 text-center text-[#8D8F8E]">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#ebf2f5] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );

  return (
    <AuthSplitLayout
      leftContent={<LoginBranding />}
      rightContent={RightSide}
    />
  );
}
