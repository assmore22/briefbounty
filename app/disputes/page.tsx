"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGavel, faScaleBalanced, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { StatusChip, Banner, Empty, TearSheetSkeleton, Hex, ExtLink } from "@/components/ui";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getOpenChallenges, getOpenAppeals, hasContract } from "@/lib/briefbounty";
import { hostOf } from "@/lib/format";

export default function DisputesPage() {
  const { run, busy } = useTx();
  const challenges = useLoader(() => getOpenChallenges(50), []);
  const appeals = useLoader(() => getOpenAppeals(50), []);
  const reload = () => { challenges.reload(); appeals.reload(); };
  if (!hasContract()) return <div className="p-6"><Banner tone="warn" title="No contract configured" /></div>;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="kicker">Disputes desk</div>
          <h1 className="mt-1 headline text-3xl">Challenges & appeals</h1>
          <p className="mt-1 text-sm text-muted">Open disputes are resolved by GenLayer’s AI validators reviewing the original concept and submitted evidence.</p>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={reload}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${challenges.loading || appeals.loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="kicker mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faGavel} className="h-3 w-3 text-primary" /> Open challenges ({challenges.data?.length ?? 0})</div>
          {challenges.loading && !challenges.data ? <TearSheetSkeleton lines={3} /> :
            (challenges.data ?? []).length === 0 ? <div className="sheet"><Empty icon={faGavel} title="No open challenges" /></div> :
            <div className="space-y-3">{(challenges.data ?? []).map((c) => (
              <article key={c.challengeId} className="sheet p-4">
                <div className="flex items-center justify-between"><span className="kicker">Challenge #{c.challengeId} · brief #{c.briefId} · concept #{c.conceptId}</span><StatusChip status={c.status} kind="decision" /></div>
                <p className="mt-1 font-serif text-sm text-ink/90">{c.reason}</p>
                {c.evidenceUrls.length > 0 && <div className="mt-1 flex flex-wrap gap-2 text-xs">{c.evidenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>}
                <div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-muted">by <Hex value={c.challenger} lead={5} tail={4} /></span>
                  <button className="btn btn-accent btn-xs" disabled={busy} onClick={() => run("Resolve challenge", "resolve_challenge", [c.challengeId]).then((h) => h && reload())}>Resolve with AI</button></div>
              </article>
            ))}</div>}
        </section>

        <section>
          <div className="kicker mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3 text-gold" /> Open appeals ({appeals.data?.length ?? 0})</div>
          {appeals.loading && !appeals.data ? <TearSheetSkeleton lines={3} /> :
            (appeals.data ?? []).length === 0 ? <div className="sheet"><Empty icon={faScaleBalanced} title="No open appeals" /></div> :
            <div className="space-y-3">{(appeals.data ?? []).map((a) => (
              <article key={a.appealId} className="sheet p-4">
                <div className="flex items-center justify-between"><span className="kicker">Appeal #{a.appealId} · brief #{a.briefId} · concept #{a.conceptId}</span><StatusChip status={a.status} kind="decision" /></div>
                <p className="mt-1 font-serif text-sm text-ink/90">{a.reason}</p>
                {a.evidenceUrls.length > 0 && <div className="mt-1 flex flex-wrap gap-2 text-xs">{a.evidenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>}
                <div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-muted">by <Hex value={a.appellant} lead={5} tail={4} /></span>
                  <button className="btn btn-accent btn-xs" disabled={busy} onClick={() => run("Resolve appeal", "resolve_appeal", [a.appealId]).then((h) => h && reload())}>Resolve with AI</button></div>
              </article>
            ))}</div>}
        </section>
      </div>
    </div>
  );
}
