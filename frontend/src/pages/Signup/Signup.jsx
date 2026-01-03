import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import api from "../../api/axiosInstance";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { FaGoogle } from "react-icons/fa";

// Components
import AuthSplitLayout from "../../layouts/AuthSplitLayout";
import AuthInput from "../../components/ui/AuthInput"; // Reusing the one created earlier
import SocialButtons from "./SocialButtons";

const isStrongPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
};


export default function Signup() {
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

  const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      console.log("Google User:", userInfo.data);

      // TODO: send userInfo.data to your backend
      // await api.post("/auth/google/", userInfo.data);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Google login failed", err);
      setError("Google login failed. Please try again.");
    }
  },
  onError: () => {
    setError("Google login failed.");
  },
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
      return setError("Please fill all fields.");
    }

    if (!isStrongPassword(formData.password)) {
      return setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    setIsSubmitting(true);
    try {
      const parts = fullName.split(/\s+/).filter(Boolean);
      const first_name = parts[0] || "";
      const last_name = parts.slice(1).join(" ") || "";

      if (!first_name || !last_name) {
        setIsSubmitting(false);
        return setError("Please enter your full name (first and last).");
      }

      await api.post("/auth/register/", {
        first_name,
        last_name,
        email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
      });

      setMessage("Registration done. You can now log in.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      let msg = "Signup failed. Please try again.";
      if (data) {
        if (typeof data === "string") msg = data;
        else if (data.email) msg = Array.isArray(data.email) ? data.email[0] : String(data.email);
        else if (data.password) msg = Array.isArray(data.password) ? data.password[0] : String(data.password);
        else msg = JSON.stringify(data);
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Content Blocks ---
  const LeftSide = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-[#F0F3FA]">
        Join Our Platform
      </h1>
      <p className="text-base lg:text-lg text-[#ded8d7] leading-relaxed">
        Join thousands of therapists who trust our platform. Create your
        account in seconds and unlock all features.
      </p>
    </>
  );

  const RightSide = (
    <>
      <h2 className="text-3xl lg:text-4xl font-bold mb-2 text-[#F0F3FA]">
        Create Account
      </h2>
      <p className="text-base mb-6 text-[#8D8F8E]">
        Fill in your details to get started
      </p>

      {error && <p className="mb-4 text-red-500 font-medium">{error}</p>}
      {message && <p className="mb-4 text-green-600 font-medium">{message}</p>}

      <div className="space-y-5">
        <AuthInput
          id="fullName"
          name="fullName"
          label="Full Name"
          icon={User}
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Your full name"
          autoComplete="name"
        />
        <AuthInput
          id="email"
          name="email"
          label="Email Address"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
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
          autoComplete="new-password"
        />
        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          icon={Lock}
          type="password"
          isPassword={true}
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold bg-[#5B687C] text-[#D4CDCB] hover:bg-[#6e7b8c] transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </div>
 

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
        <Link to="/login" className="font-semibold text-[#ebf2f5] hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );

  return <AuthSplitLayout leftContent={LeftSide} rightContent={RightSide} />;
}