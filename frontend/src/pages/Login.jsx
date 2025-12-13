import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { setAuth } from "../auth/storage";
// import api from "../api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      // ✅ real backend later:
      // const { data } = await api.post("/login/", { email, password: formData.password });
      // setAuth({ accessToken: data.access, user: data.user });
      // navigate("/dashboard", { replace: true });

      // Dummy auth (DEV ONLY)
      setAuth({
        accessToken: "DUMMY_TOKEN",
        user: {
          email,
          full_name: "Demo User",
        },
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0]">
      <div className="w-full max-w-6xl">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          style={{ backgroundColor: "#17181F" }}
        >
          {/* Left Side - Branding */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0]">
            <div className="max-w-md mx-auto lg:mx-0">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-[#F0F3FA]">
                Welcome Back
              </h1>
              <p className="text-base lg:text-lg mb-8 leading-relaxed text-[#D4CDCB]">
                Sign in to access your dashboard and manage your patients with
                ease. We're glad to have you back!
              </p>

              {/* Features */}
              <div className="space-y-4">
                {[
                  {
                    title: "Secure & Private",
                    desc: "Your data is encrypted and protected with industry-standard security",
                    iconPath: "M5 13l4 4L19 7",
                  },
                  {
                    title: "Lightning Fast",
                    desc: "Experience seamless performance with our optimized platform",
                    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
                  },
                  {
                    title: "24/7 Support",
                    desc: "Our dedicated team is always here to help you succeed",
                    iconPath:
                      "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                  },
                ].map((f, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#5B687C" }}
                    >
                      <svg
                        className="w-6 h-6"
                        style={{ color: "#D4CDCB" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={f.iconPath}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-[#D4CDCB]">
                        {f.title}
                      </h3>
                      <p className="text-sm text-[#ded8d7]">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-gradient-to-r from-[#8AAEE0] via-[#B1C9EF] to-[#B1C9EF]">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-[#F0F3FA]">
                  Sign In
                </h2>
                <p className="text-base text-[#8D8F8E]">
                  Enter your credentials to continue
                </p>
              </div>

              {error && (
                <p className="mb-4 text-red-500 font-medium">{error}</p>
              )}

              <div className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#dae2de]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#dae2de]" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-[#dae2de] focus:outline-none focus:border-[#5B687C]"
                      style={{ backgroundColor: "#5B687C", borderColor: "#8C9AB8" }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#dae2de]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#dae2de]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 text-[#D4CDCB] focus:outline-none focus:border-[#5B687C]"
                      style={{ backgroundColor: "#5B687C", borderColor: "#8C9AB8" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-[#D4CDCB]" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#D4CDCB]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot (UI only for now) */}
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

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: "#5B687C", color: "#D4CDCB" }}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
              </div>

              {/* Social login */}
              <div className="flex items-center my-8">
                <div className="flex-grow border-t border-[#5B687C]"></div>
                <span className="mx-4 text-[#8D8F8E] text-sm">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-[#5B687C]"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
                >
                  Cloud
                </button>
                <button
                  type="button"
                  className="py-3 rounded-xl border-2 flex items-center justify-center gap-2 border-[#8d949f] text-[#f6fafb]"
                >
                  Email
                </button>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
