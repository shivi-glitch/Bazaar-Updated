import { LANDING_COPY, EVENT_DETAILS } from "@/lib/landing-content";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function FinalCta() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h2 className="text-chapter text-tx-primary">{LANDING_COPY.final.h2}</h2>
      <p className="text-body text-tx-dim mt-6 mb-12">{LANDING_COPY.final.body}</p>

      <Link
        href="/login"
        className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl px-9 py-4 text-base font-bold bg-tx-primary text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
        style={{ color: "var(--bg-base)" }}
      >
        {LANDING_COPY.final.button}
        <ChevronRight size={20} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>

      <div className="mt-16 font-mono text-sm text-tx-dim flex items-center justify-center">
        <span>{EVENT_DETAILS.date}</span>
        {EVENT_DETAILS.venue && (
          <>
            <span className="mx-2 text-bd-strong">•</span>
            <span>{EVENT_DETAILS.venue}</span>
          </>
        )}
      </div>

      <div className="mt-24 pt-8 w-full text-center flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wider text-tx-dim uppercase">
          {LANDING_COPY.footer.text}
        </span>
        <span className="text-[10px] text-tx-dim/60 font-mono">
          developer name - shivam, made with love for finance
        </span>
      </div>
    </div>
  )
}
