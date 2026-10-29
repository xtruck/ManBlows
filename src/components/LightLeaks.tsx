/** Warm film-style light leaks for dark sections; the parent needs `relative isolate`. */
export function LightLeaks({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <span className="leak leak-yellow -top-[25%] -right-[12%] size-[62vmax]" />
      <span className="leak leak-coral -bottom-[30%] -left-[18%] size-[58vmax]" />
      <span className="leak leak-amber top-[35%] left-[38%] size-[34vmax] opacity-35" />
    </div>
  );
}
