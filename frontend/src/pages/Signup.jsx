import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { FaCloud } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
// import api from "../api/axiosInstance";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    setError("");
    setMessage("");

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();

    if (!fullName || !email || !formData.password || !formData.confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Backend-ready payload (snake_case)
      // await api.post("/register/", { full_name: fullName, email, password: formData.password });

      console.log("REGISTER FORM DATA (no backend yet):", {
        full_name: fullName,
        email,
        password: formData.password,
      });

      setMessage("Registration done. You can now log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0]">
      <div className="w-full max-w-5xl bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0] rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side */}
        <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0]">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-[#F0F3FA]">
            Join Our Platform
          </h1>
          <p className="text-base lg:text-lg text-[#ded8d7] leading-relaxed">
            Join thousands of therapists who trust our platform. Create your
            account in seconds and unlock all features.
          </p>
        </div>

        {/* Right Side */}
        <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-gradient-to-r from-[#8AAEE0] via-[#B1C9EF] to-[#B1C9EF]">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2 text-[#F0F3FA]">
            Create Account
          </h2>
          <p className="text-base mb-6 text-[#8D8F8E]">
            Fill in your details to get started
          </p>

          {error && <p className="mb-4 text-red-500 font-medium">{error}</p>}
          {message && <p className="mb-4 text-green-600 font-medium">{message}</p>}

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#dae2de]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D8F8E]" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-[#5B687C] border-[#5B687C] text-[#dae2de] focus:outline-none focus:border-[#5B687C]"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#dae2de]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D8F8E]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-[#5B687C] border-[#5B687C] text-[#dae2de] focus:outline-none focus:border-[#5B687C]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#dae2de]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D8F8E]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-[#5B687C] border-[#5B687C] text-[#D4CDCB] focus:outline-none focus:border-[#5B687C]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#dae2de]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D8F8E]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-[#5B687C] border-[#5B687C] text-[#D4CDCB] focus:outline-none focus:border-[#5B687C]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-semibold bg-[#5B687C] text-[#D4CDCB] hover:bg-[#6e7b8c] transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>

          {/* Social & Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-[#5B687C]"></div>
            <span className="mx-4 text-[#8D8F8E] text-sm">Or continue with</span>
            <div className="flex-grow border-t border-[#5B687C]"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
            >
              {/* Google SVG from your UI-rich version */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>

            <button
              type="button"
              className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
            >
              <FaCloud />
              <span className="hidden sm:inline">Cloud</span>
            </button>

            <button
              type="button"
              className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
            >
              <Mail className="w-5 h-5" />
              <span className="hidden sm:inline">Email</span>
            </button>
          </div>

          {/* Switch to Login */}
          <p className="mt-8 text-center text-[#8D8F8E]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#ebf2f5] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
