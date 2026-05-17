export const GrayTitle = ({ children }) => (
  <span className="bg-linear-to-br from-stone-100 via-stone-300 to-stone-500 bg-clip-text text-transparent">
    {children}
  </span>
);
export const GoldTitle = ({ children }) => (
  <span className="bg-linear-to-br from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
    {children}
  </span>
);
export const SectionLabel = ({ children }) => (
  <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-[0.14em] uppercase mb-4">
    <span className="w-4 h-px bg-amber-400" />
    {children}
  </p>
);

export const SectionHeading = ({ gray, gold }) => (
  <h2
    className={`font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.025em]`}
  >
    <GrayTitle>{gray}</GrayTitle>
    <br />
    <GoldTitle>{gold}</GoldTitle>
  </h2>
);

export default function PageHeader({ label, gray, gold, description, right }) {
  return (
    <div className="border-b border-white/8 px-6 sm:px-8 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="min-w-0">
          {label && <SectionLabel>{label}</SectionLabel>}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight mt-1 leading-[1.1] sm:leading-none">
            {gray && <GrayTitle>{gray} </GrayTitle>}
            {gold && <GoldTitle>{gold}</GoldTitle>}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-stone-500 font-light mt-2 truncate">
              {description}
            </p>
          )}
        </div>
        {right && (
          <div className="shrink-0 w-full sm:w-auto text-left sm:text-right">
            {right}
          </div>
        )}
      </div>
    </div>
  );
}