"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faRotateRight, faMagnifyingGlassChart, faGavel, faScaleBalanced, faRankingStar, faTrophy, faBoxArchive, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { useAccount } from "wagmi";
import { ScoreRosette } from "@/components/Charts";
import { StatusChip, VerdictBadge, Banner, Empty, TearSheetSkeleton, Hex, ExtLink } from "@/components/ui";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getBrief, getBriefConcepts, getBriefRankings, getAuditTrail, hasContract } from "@/lib/briefbounty";
import { hostOf, truncateHex } from "@/lib/format";
import { toneOf, type Concept } from "@/lib/types";

const avg3 = (c: Concept) => Math.round((c.originalityScore + c.brandFitScore + c.feasibilityScore) / 3);

export default function BriefDetail() {
  const id = String(useParams().id ?? "");
  const { address } = useAccount();
  const [tab, setTab] = useState<"concepts" | "rankings" | "audit">("concepts");
  const [sel, setSel] = useState<string | null>(null);
  const { run, busy } = useTx();

  const brief = useLoader(() => getBrief(id), [id]);
  const concepts = useLoader(() => getBriefConcepts(id), [id]);
  const rankings = useLoader(() => getBriefRankings(id), [id]);
  const audit = useLoader(() => getAuditTrail(id), [id]);
  const reload = () => { brief.reload(); concepts.reload(); rankings.reload(); audit.reload(); };

  const list = useMemo(() => [...(concepts.data ?? [])].sort((a, b) => avg3(b) - avg3(a)), [concepts.data]);
  const selected = list.find((c) => c.conceptId === sel) ?? list[0];
  const b = brief.data;
  const isOwner = !!address && !!b && address.toLowerCase() === b.owner.toLowerCase();

  if (!hasContract()) return <div className="p-6"><Banner tone="warn" title="No contract configured" /></div>;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-4 lg:px-6">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" /> Back to wall</Link>
      {brief.loading && !b ? <div className="mt-3"><TearSheetSkeleton lines={5} /></div> :
        brief.error || !b ? <div className="mt-3"><Banner tone="danger" title="Brief not found">{brief.error ?? `No brief #${id}.`}</Banner></div> :
        <>
          <article className="sheet mt-3 p-5">
            <div className="flex items-center justify-between gap-3"><span className="kicker">{b.brandName} | brief #{b.briefId}</span><StatusChip status={b.status} kind="brief" /></div>
            <h1 className="mt-1 headline text-3xl leading-tight">{b.title}</h1>
            <div className="rule my-3" />
            <p className="font-serif text-[15px] leading-relaxed text-ink/90">{b.campaignGoal}</p>
            <div className="mt-3 grid gap-4 text-xs sm:grid-cols-3">
              <div><div className="label">Audience</div><p className="mt-0.5 text-muted">{b.audience || "-"}</p></div>
              <div><div className="label">Constraints</div><ul className="mt-0.5 list-disc pl-4 text-muted">{b.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
              <div><div className="label">Scoring rubric</div><ul className="mt-0.5 list-disc pl-4 text-muted">{b.scoringRubric.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>Owner <Hex value={b.owner} /></span>
              <span>Min shortlist score <span className="mono text-ink">{b.minScoreToShortlist}</span></span>
              <span>Max subs <span className="mono text-ink">{b.maxSubmissions}</span></span>
              {b.referenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}
            </div>
            {isOwner && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                <span className="label self-center">Owner actions:</span>
                <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Open brief", "open_brief", [b.briefId]).then((h) => h && reload())}><FontAwesomeIcon icon={faLockOpen} className="h-3 w-3" /> Open</button>
                <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Publish ranking", "publish_ranking", [b.briefId]).then((h) => h && reload())}><FontAwesomeIcon icon={faRankingStar} className="h-3 w-3" /> Publish ranking</button>
                <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => selected && run("Award brief", "award_brief", [b.briefId, selected.conceptId]).then((h) => h && reload())}><FontAwesomeIcon icon={faTrophy} className="h-3 w-3 text-gold" /> Award selected</button>
                <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Archive brief", "archive_brief", [b.briefId]).then((h) => h && reload())}><FontAwesomeIcon icon={faBoxArchive} className="h-3 w-3" /> Archive</button>
              </div>
            )}
          </article>

          {/* tabs */}
          <div className="mt-4 flex items-center gap-4 border-b border-line">
            {(["concepts", "rankings", "audit"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
                {t} {t === "concepts" ? `(${list.length})` : t === "rankings" ? `(${rankings.data?.length ?? 0})` : `(${audit.data?.length ?? 0})`}
              </button>
            ))}
            <button className="btn btn-ghost btn-xs ml-auto" onClick={reload}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${concepts.loading ? "animate-spin" : ""}`} /> Refresh</button>
          </div>

          {tab === "concepts" && (
            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
              <div>
                {list.length === 0 ? <div className="sheet"><Empty title="No concepts" hint="Submit a concept from the wall." /></div> :
                  <ol className="divide-y divide-line border-y border-line">
                    {list.map((c, i) => (
                      <li key={c.conceptId}>
                        <div className={`py-3 pl-1 pr-2 ${selected?.conceptId === c.conceptId ? "bg-paper" : ""}`}>
                          <button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => setSel(c.conceptId)}>
                            <span className="headline w-9 shrink-0 text-2xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2"><span className="font-serif font-semibold">{c.conceptTitle}</span><StatusChip status={c.status} kind="concept" /><VerdictBadge verdict={c.verdict} /></span>
                              <span className="mt-0.5 block text-xs text-muted">{c.conceptSummary}</span>
                              <span className="mt-0.5 block text-[11px] text-muted">by {truncateHex(c.creator, 6, 4)}{c.verdict ? ` | O${c.originalityScore} B${c.brandFitScore} F${c.feasibilityScore} risk${c.lowEffortRiskScore}` : ""}</span>
                            </span>
                            <span className="shrink-0 text-right"><span className="headline text-xl">{c.verdict ? avg3(c) : "-"}</span></span>
                          </button>
                          {c.assessmentSummary && <p className="mt-2 border-l-2 border-line pl-3 font-serif text-xs italic text-muted">{c.assessmentSummary}</p>}
                          <div className="mt-2 flex flex-wrap gap-2 pl-12">
                            {["submitted", "revision_requested"].includes(c.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Assess concept", "assess_concept", [b.briefId, c.conceptId]).then((h) => h && reload())}><FontAwesomeIcon icon={faMagnifyingGlassChart} className="h-3 w-3" /> Assess</button>}
                            <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Challenge", "challenge_concept", [b.briefId, c.conceptId, "Assessment disputed via brief detail.", []]).then((h) => h && reload())}><FontAwesomeIcon icon={faGavel} className="h-3 w-3" /> Challenge</button>
                            <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Appeal", "file_appeal", [b.briefId, c.conceptId, "Appeal filed via brief detail.", []]).then((h) => h && reload())}><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3" /> Appeal</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>}
              </div>
              <aside className="sheet h-fit p-3">
                <div className="kicker mb-1">Rosette{selected ? ` | #${selected.conceptId}` : ""}</div>
                <ScoreRosette concept={selected} size={272} />
                {selected?.strengths?.length ? <div className="mt-2 text-xs"><div className="label">Strengths</div><ul className="mt-1 list-disc pl-4 text-muted">{selected.strengths.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}</ul></div> : null}
                {selected?.weaknesses?.length ? <div className="mt-2 text-xs"><div className="label">Weaknesses</div><ul className="mt-1 list-disc pl-4 text-muted">{selected.weaknesses.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}</ul></div> : null}
              </aside>
            </div>
          )}

          {tab === "rankings" && (
            <div className="mt-4 space-y-3">
              {(rankings.data ?? []).length === 0 ? <div className="sheet"><Empty icon={faRankingStar} title="No rankings published" hint="Owner can publish a ranking." /></div> :
                (rankings.data ?? []).map((r) => (
                  <article key={r.rankingId} className="sheet p-4">
                    <div className="flex items-center justify-between"><span className="kicker">Ranking #{r.rankingId}</span><span className="text-xs text-muted">by {truncateHex(r.publisher, 6, 4)}</span></div>
                    <p className="mt-1 font-serif text-sm text-ink/90">{r.summary}</p>
                    <ol className="mt-2 divide-y divide-line border-t border-line text-sm">{r.rankedConceptIds.map((cid, i) => <li key={cid} className="flex items-center gap-3 py-1.5"><span className="headline text-gold">{i + 1}</span><span>concept #{cid}</span></li>)}</ol>
                  </article>
                ))}
            </div>
          )}

          {tab === "audit" && (
            <div className="mt-4">
              {(audit.data ?? []).length === 0 ? <div className="sheet"><Empty title="No audit records" /></div> :
                <ol className="divide-y divide-line border-y border-line font-mono text-xs">
                  {(audit.data ?? []).map((a) => (
                    <li key={a.auditId} className="flex items-start gap-3 py-2">
                      <span className="w-16 shrink-0 text-muted">#{a.auditId}</span>
                      <span className="w-40 shrink-0 font-semibold text-primary">{a.action}</span>
                      <span className="flex-1 text-muted">{a.summary} {a.statusAfter && <span className="text-ink">→ {a.statusAfter}</span>}</span>
                      <span className="shrink-0 text-muted">{truncateHex(a.actor, 5, 3)}</span>
                    </li>
                  ))}
                </ol>}
            </div>
          )}
        </>}
    </div>
  );
}
