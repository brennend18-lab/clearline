import { brand } from "../config/brand";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`logo-mark ${light ? "logo-mark--light" : ""}`} aria-hidden="true" />
      <span className={`font-serif text-xl font-semibold tracking-tight ${light ? "text-cream" : "text-navy"}`}>
        {brand.name}
      </span>
    </span>
  );
}
