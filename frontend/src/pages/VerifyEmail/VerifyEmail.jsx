import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { raw } from "../../api/axiosInstance";
import { setAuth } from "../../auth/storage";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const hash = window.location.hash;
    const query = hash.split("?")[1];

    if (!query) {
      toast.error("Invalid verification link");
      navigate("/login", { replace: true });
      return;
    }

    const token = new URLSearchParams(query).get("token");

    if (!token) {
      toast.error("Invalid verification token");
      navigate("/login", { replace: true });
      return;
    }

    raw
      .post("/verify-email/", { token })
      .then((res) => {
        setAuth({
          accessToken: res.data.access,
          user: res.data.user,
        });

        toast.success("Email verified successfully!");
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.detail ||
          "Verification link expired or invalid";

        toast.error(msg);
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-gray-600">Verifying your email…</p>
    </div>
  );
}
