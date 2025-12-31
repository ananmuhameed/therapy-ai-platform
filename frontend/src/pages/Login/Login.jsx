import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import api from "../../api/axiosInstance";
import { setAuth } from "../../auth/storage";

// Components
import AuthSplitLayout from "../../layouts/AuthSplitLayout";
import LoginBranding from "./LoginBranding";
import AuthInput from "../../components/ui/AuthInput";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");
    const email = formData.email.trim();

    if (!email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login/", {
        email,
        password: formData.password,
      });

      setAuth({ accessToken: data.access, user: data.user });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Form Content ---
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

      {error && <p className="mb-4 text-red-500 font-medium">{error}</p>}

      <div className="space-y-5">
        <AuthInput
          id="email"
          name="email"
          label="Email Address"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          // Pass specific styles to match the dark theme provided
          style={{ backgroundColor: "#5B687C", borderColor: "#8C9AB8" }}
        />

        <AuthInput
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          type="password"
          isPassword={true}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="current-password"
          style={{ backgroundColor: "#5B687C", borderColor: "#8C9AB8" }}
        />

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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#5B687C", color: "#D4CDCB" }}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </div>

      {/* Social Buttons (Inline as requested in design) */}
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

      {/* Switch to Signup */}
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
    <AuthSplitLayout
      leftContent={<LoginBranding />}
      rightContent={FormSide}
    />
  );
}