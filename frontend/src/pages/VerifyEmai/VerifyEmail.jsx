import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { raw } from "../../api/axiosInstance";
import { setAuth } from "../../auth/storage";

export default function VerifyEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    // HashRouter: #/verify-email?token=UUID
    const hash = window.location.hash;
    const query = hash.split("?")[1];
    if (!query) return;

    const token = new URLSearchParams(query).get("token");
    if (!token) return;

    raw
      .post("/verify-email/", { token })
      .then(res => {
        setAuth({
          accessToken: res.data.access,
          user: res.data.user,
        });
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        toast.error("Verification link expired or invalid");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-gray-600">Verifying your email…</p>
    </div>
  );
}
