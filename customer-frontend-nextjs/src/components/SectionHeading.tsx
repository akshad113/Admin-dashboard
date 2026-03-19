import Link from "next/link";

// Render a simple section heading with an optional call to action.
export default function SectionHeading({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p> : null}
      </div>
      {actionLabel ? (
        actionHref ? (
          <Link href={actionHref} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            {actionLabel}
          </Link>
        ) : (
          <span className="text-sm font-semibold text-slate-500">{actionLabel}</span>
        )
      ) : null}
    </div>
  );
}
