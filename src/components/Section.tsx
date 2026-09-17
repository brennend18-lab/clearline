import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "cream",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  tone?: "cream" | "white" | "softblue" | "navy";
}) {
  const tones: Record<string, string> = {
    cream: "bg-cream",
    white: "bg-white",
    softblue: "bg-softblue/35",
    navy: "bg-navy text-cream",
  };
  return (
    <section id={id} className={`scroll-mt-20 py-16 sm:py-24 ${tones[tone]}`}>
      <div className="container-page">
        <div className="max-w-2xl">
          {eyebrow && <p className={`eyebrow ${tone === "navy" ? "text-softgreen" : ""}`}>{eyebrow}</p>}
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {title}
          </h2>
          {intro && (
            <p className={`mt-4 text-base leading-relaxed sm:text-lg ${tone === "navy" ? "text-cream/75" : "text-navy/70"}`}>
              {intro}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
