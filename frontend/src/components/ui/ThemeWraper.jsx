export default function ThemeWrapper({ children, className = "" }) {
  return (
    <div
      className={`bg-[rgb(var(--bg))] text-[rgb(var(--text))] transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
