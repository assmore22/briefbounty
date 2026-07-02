"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib } from "@fortawesome/free-solid-svg-icons";
import { Banner, Empty, TearSheetSkeleton, StatusChip } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getOpenBriefs, getRecentBriefs, hasContract } from "@/lib/briefbounty";
import { isHttpUrl } from "@/lib/format";
import type { Brief } from "@/lib/types";

export default function SubmitPage() {
  const { run, busy, connected } = useTx();
  const open = useLoader<Brief[]>(() => getOpenBriefs(50).then((o) => (o.length ? o : getRecentBriefs(50))), []);
  const [briefId, setBriefId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [plan, setPlan] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const valid = briefId && title.trim() && summary.trim();

  if (!hasContract()) return <div className="p-6"><Banner tone="warn" title="No contract configured" /></div>;

  return (
    <div className="mx-auto w-full max-w-[820px] px-4 py-6 lg:px-6">
      <div className="kicker flex items-center gap-2"><FontAwesomeIcon icon={faPenNib} className="h-3 w-3" /> Submit a concept</div>
      <h1 className="mt-1 headline text-3xl">Pitch your concept for an open brief</h1>
      <p className="mt-1 text-sm text-muted">Your concept is assessed by GenLayer’s AI validators against the brief’s rubric - originality, brand fit, feasibility, and low-effort risk.</p>

      <div className="sheet mt-5 space-y-3 p-5">
        {!connected && <Banner tone="warn" title="Connect a wallet">Connect to sign your submission.</Banner>}
        {open.loading && !open.data ? <TearSheetSkeleton lines={2} /> :
          (open.data ?? []).length === 0 ? <Empty title="No briefs available" hint="Post a brief from the wall first." /> :
          <label className="block"><span className="label">Brief</span>
            <select className="field mt-1.5" value={briefId} onChange={(e) => setBriefId(e.target.value)}>
              <option value="">Select an open brief…</option>
              {(open.data ?? []).map((b) => <option key={b.briefId} value={b.briefId}>#{b.briefId} - {b.brandName}: {b.title} ({b.status})</option>)}
            </select>
          </label>}
        {briefId && (() => { const b = (open.data ?? []).find((x) => x.briefId === briefId); return b ? <div className="flex items-center gap-2 rounded border border-line bg-bg p-2 text-xs text-muted"><StatusChip status={b.status} kind="brief" /> rubric: {b.scoringRubric.join(", ") || "-"} | min score {b.minScoreToShortlist}</div> : null; })()}
        <label className="block"><span className="label">Concept title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Build with judgment-aware apps" /></label>
        <label className="block"><span className="label">Concept summary</span><textarea className="field mt-1.5 min-h-[100px] font-serif" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A developer-facing campaign that frames the product around verifiable AI decisions…" /></label>
        <label className="block"><span className="label">Execution plan</span><textarea className="field mt-1.5 min-h-[70px]" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Launch page, code examples, a short explainer…" /></label>
        <ListInput label="Proof URLs" items={urls} onChange={setUrls} placeholder="https://github.com/org/repo" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
        <button className="btn btn-primary w-full justify-center" disabled={!valid || busy} onClick={async () => { const h = await run("Submit concept", "submit_concept", [briefId, title.trim(), summary.trim(), plan.trim(), urls]); if (h) { setTitle(""); setSummary(""); setPlan(""); setUrls([]); } }}>{busy ? "Submitting…" : "Submit concept"}</button>
      </div>
    </div>
  );
}
