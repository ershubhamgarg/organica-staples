export default function LegalPageHeader({
  title,
  italicWord,
  lastUpdated,
}: {
  title: string;
  italicWord: string;
  lastUpdated: string;
}) {
  return (
    <header className="mb-12 text-center">
      <div className="inline-flex items-center gap-3 mb-4">
        <span className="h-px w-8 bg-brand-gold" />
        <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
          Legal
        </span>
        <span className="h-px w-8 bg-brand-gold" />
      </div>
      <h1 className="text-3xl md:text-5xl font-serif text-brand-brown tracking-tight leading-tight">
        {title} <span className="italic text-brand-terracotta">{italicWord}</span>
      </h1>
      <p className="mt-4 text-[10px] uppercase tracking-widest text-brand-brown/40 font-bold">
        Last updated: {lastUpdated}
      </p>
    </header>
  );
}
