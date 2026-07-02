"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faPenNib, faRankingStar, faGavel, faScaleBalanced, faMagnifyingGlassChart,
  faRotateRight, faXmark, faArrowRight, faThumbtack, faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { ScoreRosette } from "@/components/Charts";
import { StatusChip, VerdictBadge, Banner, Empty, TearSheetSkeleton, Hex, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import {
  getPublicStats, getRecentBriefs, getBriefConcepts, getOpenChallenges, getOpenAppeals, hasContract,
} from "@/lib/briefbounty";
import { isHttpUrl, hostOf, truncateHex } from "@/lib/format";
import { toneOf, type Brief, type Concept } from "@/lib/types";

type Mode = null | "create" | "submit" | "assess" | "ranking" | "challenge" | "appeal";

function avg3(c: Concept) { return Math.round((c.originalityScore + c.brandFitScore + c.feasibilityScore) / 3); }

export default function WallPage() {
  const [selBrief, setSelBrief] = useState<string | null>(null);
  const [selConcept, setSelConcept] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);

  const stats = useLoader(() => getPublicStats(), []);
  const briefs = useLoader<Brief[]>(() => getRecentBriefs(40), []);
  const list = briefs.data ?? [];
  const brief = useMemo(() => list.find((b) => b.briefId === selBrief) ?? list[0], [list, selBrief]);
  const bid = brief?.briefId;

  const concepts = useLoader(() => (bid ? getBriefConcepts(bid) : Promise.resolve([])), [bid]);
  const ranked = useMemo(() => [...(concepts.data ?? [])].sort((a, b) => avg3(b) - avg3(a)), [concepts.data]);
  const concept = ranked.find((c) => c.conceptId === selConcept) ?? ranked[0];
  const challenges = useLoader(() => getOpenChallenges(20), []);
  const appeals = useLoader(() => getOpenAppeals(20), []);

  const reloadAll = () => { stats.reload(); briefs.reload(); concepts.reload(); challenges.reload(); appeals.reload(); };

  if (!hasContract()) {
    return <div className="p-4 lg:p-6"><Banner tone="warn" title="No contract configured">Set <span className="mono">NEXT_PUBLIC_CONTRACT_ADDRESS</span> in <span className="mono">.env.local</span> to load the review wall.</Banner></div>;
  }

  return (
    <div className="pb-16">
      {/* edition line */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-2 lg:px-6">
        <div className="headline text-xl">The Creative Review · Brief Wall</div>
        <div className="font-mono text-[11px] text-muted">
          {stats.data ? `${stats.data.briefs} briefs · ${stats.data.concepts} concepts · ${stats.data.rankedBriefs} ranked · ${stats.data.lowEffortConcepts} low-effort · ${stats.data.auditRecords} records` : "loading edition…"}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1440px] gap-0 px-4 py-4 lg:grid-cols-[22%_56%_22%] lg:gap-6 lg:px-6">
        {/* left: pinned brief rail */}
        <aside className="mb-4 lg:mb-0">
          <div className="mb-2 flex items-center gap-2 kicker"><FontAwesomeIcon icon={faThumbtack} className="h-3 w-3" /> Pinned briefs</div>
          {briefs.loading && !briefs.data ? <div className="space-y-2"><TearSheetSkeleton lines={2} /><TearSheetSkeleton lines={2} /></div> :
            briefs.error ? <Banner tone="danger" title="Failed to load" action={<button className="btn btn-ghost btn-xs" onClick={briefs.reload}>Retry</button>}>{briefs.error}</Banner> :
            list.length === 0 ? <Empty icon={faPenNib} title="No briefs" hint="Post the first brief." /> :
            <ul className="divide-y divide-line border-y border-line">
              {list.map((b) => (
                <li key={b.briefId}>
                  <button type="button" onClick={() => { setSelBrief(b.briefId); setSelConcept(null); }}
                    className={`w-full py-2.5 pl-3 pr-2 text-left transition-colors ${brief?.briefId === b.briefId ? "border-l-2 border-primary bg-paper" : "border-l-2 border-transparent hover:bg-paper/60"}`}>
                    <div className="flex items-center justify-between gap-2"><span className="kicker">{b.brandName}</span><StatusChip status={b.status} kind="brief" /></div>
                    <div className="mt-0.5 line-clamp-2 font-serif text-sm font-semibold text-ink">{b.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{b.conceptIds.length} concept(s)</div>
                  </button>
                </li>
              ))}
            </ul>}
        </aside>

        {/* center: feature tear-sheet + ranked strips */}
        <section className="min-w-0">
          {!brief ? (
            <div className="sheet"><Empty icon={faPenNib} title="No brief selected" hint="Post or pick a brief to open the review wall." /></div>
          ) : (
            <>
              <article className="sheet p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="kicker">{brief.brandName} · {brief.status}</span>
                  <StatusChip status={brief.status} kind="brief" />
                </div>
                <h1 className="mt-1 headline text-3xl leading-tight">{brief.title}</h1>
                <div className="rule my-3" />
                <p className="font-serif text-[15px] leading-relaxed text-ink/90"><span className="float-left mr-2 font-serif text-5xl font-bold leading-[0.8] text-primary">{brief.campaignGoal.slice(0, 1)}</span>{brief.campaignGoal.slice(1)}</p>
                <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  <div><div className="label">Audience</div><p className="mt-0.5 text-muted">{brief.audience || "-"}</p></div>
                  <div><div className="label">Brand constraints</div><ul className="mt-0.5 list-disc pl-4 text-muted">{brief.constraints.slice(0, 4).map((c, i) => <li key={i}>{c}</li>)}</ul></div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>Owner <Hex value={brief.owner} /></span>
                  {brief.referenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}
                  <Link href={`/brief/${brief.briefId}`} className="ml-auto inline-flex items-center gap-1 text-primary hover:underline">Full brief #{brief.briefId} <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" /></Link>
                </div>
              </article>

              <div className="mt-4 flex items-center justify-between">
                <div className="kicker flex items-center gap-2"><FontAwesomeIcon icon={faRankingStar} className="h-3 w-3 text-gold" /> Ranked concepts</div>
                <button type="button" className="btn btn-ghost btn-xs" onClick={reloadAll}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${concepts.loading ? "animate-spin" : ""}`} /> Refresh</button>
              </div>
              {concepts.loading && !concepts.data ? <div className="mt-2 space-y-2"><TearSheetSkeleton lines={2} /><TearSheetSkeleton lines={2} /></div> :
                ranked.length === 0 ? <div className="mt-2 sheet"><Empty icon={faPenNib} title="No concepts yet" hint="Submit a concept for this brief." /></div> :
                <ol className="mt-2 divide-y divide-line border-y border-line">
                  {ranked.map((c, i) => (
                    <li key={c.conceptId}>
                      <button type="button" onClick={() => setSelConcept(c.conceptId)}
                        className={`flex w-full items-start gap-4 py-3 pl-1 pr-2 text-left transition-colors ${concept?.conceptId === c.conceptId ? "bg-paper" : "hover:bg-paper/60"}`}>
                        <span className="headline w-10 shrink-0 text-3xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2"><span className="font-serif text-base font-semibold text-ink">{c.conceptTitle}</span><StatusChip status={c.status} kind="concept" /><VerdictBadge verdict={c.verdict} /></span>
                          <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{c.conceptSummary}</span>
                          <span className="mt-1 block text-[11px] text-muted">by {truncateHex(c.creator, 6, 4)}</span>
                        </span>
                        <span className="shrink-0 text-right"><span className="headline text-2xl text-ink">{c.verdict ? avg3(c) : "-"}</span><span className="block text-[10px] text-muted">avg score</span></span>
                      </button>
                    </li>
                  ))}
                </ol>}
            </>
          )}
        </section>

        {/* right: score rosette + ticker */}
        <aside className="mt-4 lg:mt-0">
          <div className="sheet p-3">
            <div className="kicker mb-1">Score rosette{concept ? ` · concept #${concept.conceptId}` : ""}</div>
            <ScoreRosette concept={concept} size={236} />
          </div>
          <div className="sheet mt-4 p-3">
            <div className="kicker mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faBolt} className="h-3 w-3 text-primary" /> Dispute ticker</div>
            <div className="space-y-1.5 font-mono text-[11px]">
              {(challenges.data ?? []).slice(0, 4).map((c) => <div key={`c${c.challengeId}`} className="flex items-center gap-1.5 text-muted animate-tickerpulse"><span className="text-primary">▸ challenge#{c.challengeId}</span> brief#{c.briefId}</div>)}
              {(appeals.data ?? []).slice(0, 4).map((a) => <div key={`a${a.appealId}`} className="flex items-center gap-1.5 text-muted"><span className="text-gold">▸ appeal#{a.appealId}</span> brief#{a.briefId}</div>)}
              {(challenges.data?.length ?? 0) === 0 && (appeals.data?.length ?? 0) === 0 && <div className="text-muted">no open disputes · wire clear</div>}
            </div>
          </div>
        </aside>
      </div>

      {/* sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-double border-ink bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-2 lg:px-6">
          <button type="button" className="btn btn-primary btn-xs shrink-0" onClick={() => setMode("create")}><FontAwesomeIcon icon={faPlus} className="h-3 w-3" /> New Brief</button>
          <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("submit")}><FontAwesomeIcon icon={faPenNib} className="h-3 w-3" /> Submit Concept</button>
          <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("assess")}><FontAwesomeIcon icon={faMagnifyingGlassChart} className="h-3 w-3" /> Assess</button>
          <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("ranking")}><FontAwesomeIcon icon={faRankingStar} className="h-3 w-3" /> Publish Ranking</button>
          <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("challenge")}><FontAwesomeIcon icon={faGavel} className="h-3 w-3" /> Challenge</button>
          <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("appeal")}><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3" /> Appeal</button>
        </div>
      </div>

      <TearSheet mode={mode} onClose={() => setMode(null)} brief={brief} concepts={ranked} onDone={() => { setMode(null); reloadAll(); }} />
    </div>
  );
}

/* ── tear-sheet overlay forms ── */
function TearSheet({ mode, onClose, brief, concepts, onDone }: { mode: Mode; onClose: () => void; brief?: Brief; concepts: Concept[]; onDone: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { run, busy, connected, wrongNetwork } = useTx();

  useEffect(() => {
    if (mode) setMounted(true);
    else if (mounted) {
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      if (panel.current) tl.to(panel.current, { y: 12, opacity: 0, duration: 0.18, ease: "power2.in" }, 0);
      if (overlay.current) tl.to(overlay.current, { opacity: 0, duration: 0.18 }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  useEffect(() => {
    if (mounted && mode) {
      if (overlay.current) gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.18 });
      if (panel.current) gsap.fromTo(panel.current, { y: 14, opacity: 0, rotate: -0.4 }, { y: 0, opacity: 1, rotate: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [mounted, mode]);
  if (!mounted || !mode) return null;

  const title = { create: "POST A NEW BRIEF", submit: "SUBMIT A CONCEPT", assess: "ASSESS A CONCEPT", ranking: "PUBLISH RANKING", challenge: "FILE A CHALLENGE", appeal: "FILE AN APPEAL" }[mode];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div ref={overlay} className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div ref={panel} className="sheet relative z-10 flex max-h-[88vh] w-[min(96vw,620px)] flex-col overflow-hidden shadow-pop">
        <div className="flex items-center justify-between border-b-2 border-double border-ink px-4 py-3">
          <h2 className="kicker text-sm">{title}</h2>
          <button type="button" className="text-muted hover:text-ink" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!connected && <Banner tone="warn" title="Connect a wallet">Use Connect to sign the transaction.</Banner>}
          {connected && wrongNetwork && <Banner tone="warn" title="Wrong network">Switch to GenLayer Studionet; we’ll prompt on submit.</Banner>}
          {mode === "create" && <CreateForm run={run} busy={busy} onDone={onDone} />}
          {mode !== "create" && !brief && <Banner tone="info" title="No brief selected">Pick a brief on the wall first.</Banner>}
          {mode === "submit" && brief && <SubmitForm run={run} busy={busy} brief={brief} onDone={onDone} />}
          {mode === "assess" && brief && <PickConceptForm run={run} busy={busy} brief={brief} concepts={concepts.filter((c) => ["submitted", "revision_requested"].includes(c.status))} label="Assess concept" fn="assess_concept" onDone={onDone} />}
          {mode === "ranking" && brief && <RankingForm run={run} busy={busy} brief={brief} concepts={concepts} onDone={onDone} />}
          {mode === "challenge" && brief && <DisputeForm run={run} busy={busy} brief={brief} concepts={concepts} label="File challenge" fn="challenge_concept" onDone={onDone} />}
          {mode === "appeal" && brief && <DisputeForm run={run} busy={busy} brief={brief} concepts={concepts} label="File appeal" fn="file_appeal" onDone={onDone} />}
        </div>
      </div>
    </div>
  );
}

function CreateForm({ run, busy, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [refs, setRefs] = useState<string[]>([]);
  const [rubric, setRubric] = useState<string[]>([]);
  const [maxSubs, setMaxSubs] = useState(50);
  const [minScore, setMinScore] = useState(60);
  const valid = title.trim() && brand.trim() && goal.trim() && rubric.length > 0;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2"><span className="label">Title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Launch campaign concept for a developer tool" /></label>
        <label className="block"><span className="label">Brand name</span><input className="field mt-1.5" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="GenLayer Demo Studio" /></label>
        <label className="block"><span className="label">Audience</span><input className="field mt-1.5" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Developers and builders" /></label>
      </div>
      <label className="block"><span className="label">Campaign goal</span><textarea className="field mt-1.5 min-h-[70px] font-serif" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Explain a developer-facing product credibly…" /></label>
      <ListInput label="Brand constraints" items={constraints} onChange={setConstraints} placeholder="avoid vague AI hype" max={12} />
      <ListInput label="Scoring rubric (required)" items={rubric} onChange={setRubric} placeholder="brand fit" max={12} />
      <ListInput label="Reference URLs" items={refs} onChange={setRefs} placeholder="https://docs.example" max={5} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
      <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Max submissions</span><input type="number" min={1} max={200} className="field mt-1.5 mono" value={maxSubs} onChange={(e) => setMaxSubs(Number(e.target.value))} /></label><label className="block"><span className="label">Min score to shortlist</span><input type="number" min={0} max={100} className="field mt-1.5 mono" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} /></label></div>
      <button className="btn btn-primary w-full justify-center" disabled={!valid || busy} onClick={async () => { const h = await run("Create brief", "create_brief", [title.trim(), brand.trim(), goal.trim(), audience.trim(), constraints, refs, rubric, maxSubs, minScore]); if (h) onDone(); }}>{busy ? "Submitting…" : "Post brief"}</button>
    </div>
  );
}

function SubmitForm({ run, busy, brief, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; brief: Brief; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [plan, setPlan] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const valid = title.trim() && summary.trim();
  return (
    <div className="space-y-3">
      <div className="kicker">for: {brief.brandName} · #{brief.briefId} {brief.title}</div>
      <label className="block"><span className="label">Concept title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Build with judgment-aware apps" /></label>
      <label className="block"><span className="label">Concept summary</span><textarea className="field mt-1.5 min-h-[80px] font-serif" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A developer campaign that frames…" /></label>
      <label className="block"><span className="label">Execution plan</span><textarea className="field mt-1.5 min-h-[60px]" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Compact launch page, code-path examples…" /></label>
      <ListInput label="Proof URLs" items={urls} onChange={setUrls} placeholder="https://github.com/org/repo" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
      <button className="btn btn-primary w-full justify-center" disabled={!valid || busy} onClick={async () => { const h = await run("Submit concept", "submit_concept", [brief.briefId, title.trim(), summary.trim(), plan.trim(), urls]); if (h) onDone(); }}>{busy ? "Submitting…" : "Submit concept"}</button>
    </div>
  );
}

function PickConceptForm({ run, busy, brief, concepts, label, fn, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; brief: Brief; concepts: Concept[]; label: string; fn: string; onDone: () => void }) {
  const [cid, setCid] = useState("");
  return (
    <div className="space-y-3">
      <div className="kicker">brief #{brief.briefId} · {brief.title}</div>
      {concepts.length === 0 ? <Empty title="No eligible concepts" hint="Submit a concept first." /> :
        <>
          <label className="block"><span className="label">Concept</span>
            <select className="field mt-1.5" value={cid} onChange={(e) => setCid(e.target.value)}>
              <option value="">Select…</option>
              {concepts.map((c) => <option key={c.conceptId} value={c.conceptId}>#{c.conceptId} - {c.conceptTitle}</option>)}
            </select>
          </label>
          <button className="btn btn-primary w-full justify-center" disabled={!cid || busy} onClick={async () => { const h = await run(label, fn, [brief.briefId, cid]); if (h) onDone(); }}>{busy ? "Submitting…" : label}</button>
        </>}
    </div>
  );
}

function RankingForm({ run, busy, brief, concepts, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; brief: Brief; concepts: Concept[]; onDone: () => void }) {
  const shortlisted = concepts.filter((c) => ["shortlisted", "finalist"].includes(c.status));
  return (
    <div className="space-y-3">
      <div className="kicker">brief #{brief.briefId} · {brief.title}</div>
      <p className="text-sm text-muted">Publishes a public ranking of shortlisted/finalist concepts ordered by average score. {shortlisted.length} concept(s) currently eligible.</p>
      <ol className="divide-y divide-line border-y border-line text-sm">
        {shortlisted.map((c, i) => <li key={c.conceptId} className="flex items-center gap-3 py-2"><span className="headline text-gold">{i + 1}</span><span className="flex-1 truncate">{c.conceptTitle}</span><span className="mono text-muted">{Math.round((c.originalityScore + c.brandFitScore + c.feasibilityScore) / 3)}</span></li>)}
        {shortlisted.length === 0 && <li className="py-2 text-muted">No shortlisted concepts yet - assess first.</li>}
      </ol>
      <button className="btn btn-primary w-full justify-center" disabled={busy} onClick={async () => { const h = await run("Publish ranking", "publish_ranking", [brief.briefId]); if (h) onDone(); }}>{busy ? "Submitting…" : "Publish ranking"}</button>
    </div>
  );
}

function DisputeForm({ run, busy, brief, concepts, label, fn, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; brief: Brief; concepts: Concept[]; label: string; fn: string; onDone: () => void }) {
  const [cid, setCid] = useState("");
  const [reason, setReason] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const valid = cid && reason.trim();
  return (
    <div className="space-y-3">
      <div className="kicker">brief #{brief.briefId} · {brief.title}</div>
      <label className="block"><span className="label">Concept</span>
        <select className="field mt-1.5" value={cid} onChange={(e) => setCid(e.target.value)}>
          <option value="">Select…</option>
          {concepts.map((c) => <option key={c.conceptId} value={c.conceptId}>#{c.conceptId} - {c.conceptTitle} ({c.status})</option>)}
        </select>
      </label>
      <label className="block"><span className="label">Reason</span><textarea className="field mt-1.5 min-h-[70px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={fn === "challenge_concept" ? "Why is this assessment wrong?" : "Why should this be reconsidered?"} /></label>
      <ListInput label="Evidence URLs" items={urls} onChange={setUrls} placeholder="https://source.example" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
      <button className="btn btn-primary w-full justify-center" disabled={!valid || busy} onClick={async () => { const h = await run(label, fn, [brief.briefId, cid, reason.trim(), urls]); if (h) onDone(); }}>{busy ? "Submitting…" : label}</button>
    </div>
  );
}
