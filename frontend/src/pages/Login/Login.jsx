import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import api from "../../api/axiosInstance";
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

  const { formik, apiError } = useAppFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    mapFieldErrors: mapAuthFieldErrors,
    onSubmit: async (values) => {
      const { data } = await api.post("/auth/login/", toLoginPayload(values));

      setAuth({ accessToken: data.access, user: data.user });
      navigate("/dashboard", { replace: true });
    },
  });

  const FormSide = (
    <>
      <div className="mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-[#F0F3FA]">
          Sign In
        </h2>
        <p className="text-base text-[#8D8F8E]">
          Enter your credentials to continue
        </p>
      </div>

      {/* Server (non-field) error */}
      {apiError && <p className="mb-4 text-red-500 font-medium">{apiError}</p>}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
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
            style={{ backgroundColor: "#5B687C", borderColor: "#8C9AB8" }}
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
          ) : null}
        </div>

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
            style={{ backgroundColor: "#5B687C", borderColor: "#8C9AB8" }}
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.password}
            </p>
          ) : null}
        </div>

        {/* Remember & Forgot (unchanged) */}
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

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#5B687C", color: "#D4CDCB" }}
        >
          {formik.isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Rest unchanged */}
      <div className="flex items-center my-8">
        <div className="flex-grow border-t border-[#5B687C]"></div>
        <span className="mx-4 text-[#8D8F8E] text-sm">Or continue with</span>
        <div className="flex-grow border-t border-[#5B687C]"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {["Google", "Cloud", "Email"].map((provider) => (
          <button
            key={provider}
            type="button"
            className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb] hover:bg-white/5 transition-colors"
          >
            {provider}
          </button>
        ))}
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

  return (
    <AuthSplitLayout leftContent={<LoginBranding />} rightContent={FormSide} />
  );
}
