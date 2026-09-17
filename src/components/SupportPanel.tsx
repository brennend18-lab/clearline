import { useEffect, useRef, useState } from "react";
import { HeartHandshake, MessageCircle, Phone, X } from "lucide-react";
import { supportResources } from "../config/brand";

/**
 * The persistent "Need support now?" control. Calm by default; the panel
 * itself presents resources clearly once opened.
 */
export function SupportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-quiet text-sm"
        aria-haspopup="dialog"
      >
        <HeartHandshake className="h-4 w-4" aria-hidden="true" />
        Need support now?
      </button>
      {open && <SupportDialog onClose={() => setOpen(false)} />}
    </>
  );
}

export function SupportDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const g = supportResources.gambling;
  const c = supportResources.crisis;
  const e = supportResources.emergency;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center"
      role="presentation"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-title"
        className="card w-full max-w-lg p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="support-title" className="font-serif text-2xl font-semibold">
            Support options
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-navy/60 hover:bg-navy/5 hover:text-navy"
            aria-label="Close support panel"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-sm text-navy/70">
          Free, confidential help is available whenever you want it. You do not
          need a plan, an account, or a reason.
        </p>

        <ul className="mt-6 space-y-4">
          <li className="rounded-lg border border-line bg-softblue/40 p-4">
            <p className="text-sm font-semibold">{g.label}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
              <MessageCircle className="h-4 w-4 text-teal" aria-hidden="true" />
              <span>
                {g.methods} with the {g.name} at{" "}
                <a className="font-semibold underline decoration-blue/40 underline-offset-2" href="tel:18006973738">
                  {g.phraseNumber} ({g.digitsNumber})
                </a>
              </span>
            </p>
            <p className="mt-1.5 text-xs text-navy/60">{g.note}</p>
          </li>
          <li className="rounded-lg border border-line bg-softgreen/50 p-4">
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-teal" aria-hidden="true" />
              <span>
                {c.methods}{" "}
                <a className="font-semibold underline decoration-blue/40 underline-offset-2" href="tel:988">
                  {c.number}
                </a>
              </span>
            </p>
            <p className="mt-1.5 text-xs text-navy/60">{c.note}</p>
          </li>
          <li className="rounded-lg border border-line p-4">
            <p className="text-sm font-semibold">{e.label}</p>
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-caution" aria-hidden="true" />
              <span>
                {e.methods}{" "}
                <a className="font-semibold underline decoration-blue/40 underline-offset-2" href="tel:911">
                  {e.number}
                </a>
              </span>
            </p>
            <p className="mt-1.5 text-xs text-navy/60">{e.note}</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
