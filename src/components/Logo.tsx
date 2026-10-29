type LogoProps = {
  className?: string;
  /** Colour of "studio."; the script "egu" stays white as in the brand mark. */
  tone?: "ink" | "paper";
  /** The script is white in the brand mark; "ink" is the one-colour variant for light glass. */
  script?: "white" | "ink";
  scriptClassName?: string;
  wordClassName?: string;
};

/** Typographic rebuild of the Egu Studio mark: white script "egu" over bold "studio.". */
export function Logo({ className = "", tone = "ink", script = "white", scriptClassName = "", wordClassName = "" }: LogoProps) {
  return (
    <span role="img" aria-label="Egu Studio" className={`relative inline-block leading-none select-none ${className}`}>
      <span
        aria-hidden
        data-logo-script
        className={`font-script absolute -top-[0.62em] left-[0.02em] text-[1.45em] font-normal transition-colors duration-500 ${
          script === "ink" ? "text-ink" : "text-white [text-shadow:0_1px_0_rgb(0_0_0/0.08)]"
        } ${scriptClassName}`}
        style={{ transform: "rotate(-8deg)" }}
      >
        egu
      </span>
      <span
        aria-hidden
        data-logo-word
        className={`font-logo relative font-extrabold italic tracking-[-0.04em] transition-colors duration-500 ${tone === "ink" ? "text-ink" : "text-paper"} ${wordClassName}`}
      >
        studio.
      </span>
    </span>
  );
}
