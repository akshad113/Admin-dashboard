// Render a simple white card for dashboard content.
function Card({ title, subtitle, children, className = "" }) {
  const hasHeader = Boolean(title || subtitle);

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {hasHeader ? (
        <div className="mb-4">
          {title ? <h3 className="text-lg font-black text-slate-900">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export default Card;
