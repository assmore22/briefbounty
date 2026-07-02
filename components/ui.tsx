"use client";

import { useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy, faCheck, faArrowUpRightFromSquare, faCircleInfo, faTriangleExclamation,
  faCircleExclamation, faCircleCheck, faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { truncateHex, explorerTx, explorerAddr, explorerContract } from "@/lib/format";

const BRIEF: Record<string, string> = {
  draft: "border-line text-muted bg-bg",
  open: "border-accent/50 text-accent bg-accent/10",
  reviewing: "border-accent/50 text-accent bg-accent/10",
  ranked: "border-gold/60 text-gold bg-gold/10",
  challenged: "border-primary/50 text-primary bg-primary/10",
  appealed: "border-primary/50 text-primary bg-primary/10",
  awarded: "border-gold/70 text-gold bg-gold/15",
  archived: "border-line text-muted bg-bg",
};
const CONCEPT: Record<string, string> = {
  submitted: "border-line text-muted bg-bg",
  assessed: "border-accent/50 text-accent bg-accent/10",
  shortlisted: "border-accent/60 text-accent bg-accent/10",
  revision_requested: "border-gold/60 text-gold bg-gold/10",
  rejected: "border-danger/50 text-danger bg-danger/10",
  low_effort: "border-danger/50 text-danger bg-danger/10",
  challenged: "border-primary/50 text-primary bg-primary/10",
  appealed: "border-primary/50 text-primary bg-primary/10",
  finalist: "border-gold/70 text-gold bg-gold/15",
  awarded: "border-gold/70 text-gold bg-gold/15",
};
const DECISION: Record<string, string> = {
  open: "border-gold/60 text-gold bg-gold/10",
  upheld: "border-accent/60 text-accent bg-accent/10",
  dismissed: "border-muted/40 text-muted bg-bg",
  accepted: "border-accent/60 text-accent bg-accent/10",
  denied: "border-danger/50 text-danger bg-danger/10",
};
const VERDICT: Record<string, string> = {
  shortlisted: "border-accent/60 text-accent bg-accent/10",
  revision_requested: "border-gold/60 text-gold bg-gold/10",
  rejected: "border-danger/50 text-danger bg-danger/10",
  low_effort: "border-danger/50 text-danger bg-danger/10",
};

export function StatusChip({ status, kind }: { status: string; kind: "brief" | "concept" | "decision" }) {
  const map = kind === "brief" ? BRIEF : kind === "concept" ? CONCEPT : DECISION;
  const cls = map[status] ?? "border-line text-muted bg-bg";
  return <span className={`chip ${cls}`}>{(status || "-").replace(/_/g, " ")}</span>;
}

export function VerdictBadge({ verdict }: { verdict?: string }) {
  const cls = VERDICT[verdict ?? ""] ?? "border-line text-muted bg-bg";
  return <span className={`chip ${cls}`}>{(verdict || "unassessed").replace(/_/g, " ")}</span>;
}

export function Copy({ value, className = "" }: { value: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" aria-label="Copy"
      className={`inline-grid h-6 w-6 place-items-center rounded text-muted transition-colors hover:bg-bg hover:text-ink ${className}`}
      onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch {} }}>
      <FontAwesomeIcon icon={done ? faCheck : faCopy} className={`h-3 w-3 ${done ? "text-accent" : ""}`} />
    </button>
  );
}

export function Hex({ value, kind = "address", lead = 6, tail = 4 }: { value: string; kind?: "address" | "contract" | "tx"; lead?: number; tail?: number }) {
  if (!value) return <span className="text-muted">-</span>;
  const href = kind === "tx" ? explorerTx(value) : kind === "contract" ? explorerContract(value) : explorerAddr(value);
  return (
    <span className="inline-flex items-center gap-1">
      <a href={href} target="_blank" rel="noreferrer" className="mono text-xs text-ink/80 underline-offset-2 hover:text-primary hover:underline" title={value}>
        {truncateHex(value, lead, tail)}
      </a>
      <Copy value={value} />
    </span>
  );
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
      {children}<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" />
    </a>
  );
}

type Tone = "info" | "warn" | "danger" | "ok";
const TONE: Record<Tone, { c: string; i: typeof faCircleInfo; ic: string }> = {
  info: { c: "border-accent/30 bg-accent/5", i: faCircleInfo, ic: "text-accent" },
  warn: { c: "border-gold/40 bg-gold/5", i: faTriangleExclamation, ic: "text-gold" },
  danger: { c: "border-danger/30 bg-danger/5", i: faCircleExclamation, ic: "text-danger" },
  ok: { c: "border-accent/30 bg-accent/5", i: faCircleCheck, ic: "text-accent" },
};
export function Banner({ tone = "info", title, children, action }: { tone?: Tone; title?: string; children?: ReactNode; action?: ReactNode }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-3 rounded border p-3 text-sm ${t.c}`}>
      <FontAwesomeIcon icon={t.i} className={`mt-0.5 h-4 w-4 ${t.ic}`} />
      <div className="flex-1">{title && <div className="font-semibold text-ink">{title}</div>}{children && <div className="text-muted">{children}</div>}</div>
      {action}
    </div>
  );
}

export function Empty({ icon, title, hint }: { icon?: typeof faInbox; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-line bg-bg/50 px-6 py-10 text-center">
      <FontAwesomeIcon icon={icon ?? faInbox} className="h-6 w-6 text-muted/50" />
      <div className="headline text-base">{title}</div>
      {hint && <div className="max-w-sm text-xs text-muted">{hint}</div>}
    </div>
  );
}

/** Newspaper tear-sheet placeholder with ink-line shimmer (not grey dashboard rectangles). */
export function TearSheetSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="sheet space-y-3 p-4">
      <div className="inkshimmer h-5 w-2/3 rounded-sm" />
      <div className="rule" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="inkshimmer h-3 rounded-sm" style={{ width: `${92 - (i % 3) * 14}%` }} />
      ))}
    </div>
  );
}
