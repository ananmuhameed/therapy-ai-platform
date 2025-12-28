import React from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  label,
  id,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
  isPassword = false,
  showPassword,
  onTogglePassword,
  ...props
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2 text-[#dae2de]">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#dae2de]" />
        )}
        <input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 text-[#dae2de] focus:outline-none focus:border-[#5B687C] bg-[#5B687C] border-[#8C9AB8]"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4CDCB] hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}