import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiMentalHealthLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { ChevronDown, LogOut, User, Moon, Sun, Languages } from "lucide-react";
import Swal from "sweetalert2";
import { logout } from "../../auth/storage";

const Navbar = () => {
  const navigate = useNavigate();

  // --- Nav link style ---
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 text-[16px] font-medium transition-colors ${
      isActive ? "text-[#3078E2]" : "text-[#727473]"
    }`;

  // --- Dropdown state ---
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // --- Theme state (persisted) ---
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  // --- Language state (persisted) ---
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  // Close dropdown on outside click / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Apply theme to <html> class (Tailwind dark mode expects `dark` on html)
  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // Apply language (simple approach: store + set dir)
  useEffect(() => {
    localStorage.setItem("lang", lang);
    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  const handleLogout = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    setOpen(false);

    const result = await Swal.fire({
      title: "Log Out?",
      text: "Are you sure you want to log out?",
      icon: "question",
      iconColor: "#3078E2",
      width: "400px",
      padding: "1.5rem",
      showCancelButton: true,
      confirmButtonColor: "#3078E2",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });

    if (!result.isConfirmed) return;

    await logout();
    navigate("/login");
  };

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  return (
    <nav className="w-full bg-white dark:bg-slate-900 px-8 py-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center">
        <RiMentalHealthLine className="text-[#3078E2]" size={36} />
      </div>

      {/* Links */}
      <div className="flex items-center gap-12">
        <NavLink to="/dashboard" className={linkClasses}>
          Dashboard
        </NavLink>

        <NavLink to="/patients" className={linkClasses}>
          Patients
        </NavLink>

        <NavLink to="/reports" className={linkClasses}>
          Reports
        </NavLink>
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-[#3078E2] text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
        >
          <FaUserCircle size={18} />
          <span>Profile</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white dark:bg-slate-950 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
            <div className="py-2">
              {/* Visit Profile */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/therapistprofile");
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <User
                  size={18}
                  className="text-slate-500 dark:text-slate-300"
                />
                <span>Visit profile</span>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full px-4 py-3 flex items-center justify-between text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon
                      size={18}
                      className="text-slate-500 dark:text-slate-300"
                    />
                  ) : (
                    <Sun
                      size={18}
                      className="text-slate-500 dark:text-slate-300"
                    />
                  )}
                  <span>Dark / Night mode</span>
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200">
                  {theme === "dark" ? "ON" : "OFF"}
                </span>
              </button>

              {/* EN/AR */}
              <button
                type="button"
                onClick={toggleLang}
                className="w-full px-4 py-3 flex items-center justify-between text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <Languages
                    size={18}
                    className="text-slate-500 dark:text-slate-300"
                  />
                  <span>Language</span>
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200">
                  {lang === "en" ? "EN" : "AR"}
                </span>
              </button>

              <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
