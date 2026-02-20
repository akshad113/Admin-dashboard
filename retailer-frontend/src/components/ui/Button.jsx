function Button({ children, type = "button", variant = "primary", className = "", ...props }) {
  const baseClass =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none";

  const primaryClass = "bg-blue-600 text-white shadow hover:bg-blue-700";
  const secondaryClass = "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50";
  const ghostClass = "bg-slate-100 text-slate-700 hover:bg-slate-200";

  let variantClass = primaryClass;

  if (variant === "secondary") {
    variantClass = secondaryClass;
  }

  if (variant === "ghost") {
    variantClass = ghostClass;
  }

  return (
    <button type={type} className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
