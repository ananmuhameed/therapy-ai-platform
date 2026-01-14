import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiMentalHealthLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { ChevronDown, User, Moon, Sun, Languages } from "lucide-react";



const HomeNav = () => {
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

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  return (
    <nav className="w-full bg-white dark:bg-slate-900 px-10 py-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center">
        <RiMentalHealthLine className="text-[#3078E2]" size={36} />
      </div>

      {/* Links */}
      <div className="flex items-center gap-12 ml-20">
        <NavLink to="/home" className={linkClasses}>
          Home
        </NavLink>

        <NavLink to="/features" className={linkClasses}>
          Features
        </NavLink>

        <NavLink to="/plans" className={linkClasses}>
          Pricing
        </NavLink>
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-[#3078E2] text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
        >
          
          <span>Register</span>
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
                  navigate("/signup");
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <User
                  size={18}
                  className="text-slate-500 dark:text-slate-300"
                />
                <span>Register / login</span>
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
             
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNav;