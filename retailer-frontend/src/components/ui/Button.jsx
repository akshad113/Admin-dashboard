// Render a reusable button with a small set of style variants.
function Button({ children, type = "button", variant = "primary", className = "", ...props }) {
  const baseClass =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none";

  const variantClassMap = {
    primary: "bg-blue-600 text-white shadow hover:bg-blue-700",
    secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  };

  const variantClass = variantClassMap[variant] || variantClassMap.primary;

  return (
    <button type={type} className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
