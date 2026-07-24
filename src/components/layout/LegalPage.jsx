export default function LegalPage({ title, updated, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
      {updated && <p className="text-sm text-ink-soft/60 mt-2">Last updated: {updated}</p>}

      <div className="card-elevated rounded-3xl p-6 sm:p-8 mt-8 flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-ink mb-2">{heading}</h2>
      <div className="text-sm text-ink-soft leading-relaxed flex flex-col gap-2">
        {children}
      </div>
    </section>
  );
}
