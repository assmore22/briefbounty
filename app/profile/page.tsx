"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPen, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ScoreHistory } from "@/components/Charts";
import { StatusChip, VerdictBadge, Banner, Empty, TearSheetSkeleton, Hex } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getProfile, getCreatorConcepts, getOwnerBriefs, hasContract } from "@/lib/briefbounty";
import { truncateHex } from "@/lib/format";
import type { Concept } from "@/lib/types";

const avg3 = (c: Concept) => Math.round((c.originalityScore + c.brandFitScore + c.feasibilityScore) / 3);

function Figure({ label, value, tone = "ink" }: { label: string; value: number | string; tone?: "ink" | "accent" | "danger" | "gold" }) {
  const c = { ink: "text-ink", accent: "text-accent", danger: "text-danger", gold: "text-gold" }[tone];
  return <div className="border-l-2 border-line pl-3"><div className={`headline text-2xl ${c}`}>{value}</div><div className="label">{label}</div></div>;
}

export default function ProfilePage() {
  const { address } = useAccount();
  const [query, setQuery] = useState("");
  const target = (query.trim() || address || "").toLowerCase();
  const valid = /^0x[0-9a-fA-F]{40}$/.test(target);

  const profile = useLoader(() => (valid ? getProfile(target) : Promise.resolve(null)), [target]);
  const concepts = useLoader(() => (valid ? getCreatorConcepts(target) : Promise.resolve([])), [target]);
  const briefs = useLoader(() => (valid ? getOwnerBriefs(target) : Promise.resolve([])), [target]);

  if (!hasContract()) return <div className="p-6"><Banner tone="warn" title="No contract configured" /></div>;

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6 lg:px-6">
      <div className="kicker flex items-center gap-2"><FontAwesomeIcon icon={faUserPen} className="h-3 w-3" /> Creator dossier</div>
      <h1 className="mt-1 headline text-3xl">Reputation & track record</h1>
      <div className="mt-3 flex gap-2">
        <input className="field mono" placeholder={address ? "Defaults to your connected wallet" : "0x… creator address"} value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-ghost" onClick={() => setQuery(query.trim())}><FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5" /></button>
      </div>

      {!valid ? <div className="mt-5"><Banner tone="info" title="No address">Connect a wallet or paste a creator address.</Banner></div> :
        <>
          <div className="mt-5 flex items-center justify-between"><span className="text-sm text-muted">Dossier for <Hex value={target} /></span></div>
          {profile.loading && !profile.data ? <div className="mt-3"><TearSheetSkeleton lines={3} /></div> :
            <div className="sheet mt-3 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-6">
              <Figure label="Reputation" value={profile.data?.reputationScore ?? 0} tone="accent" />
              <Figure label="Briefs" value={profile.data?.briefsCreated ?? 0} />
              <Figure label="Concepts" value={profile.data?.conceptsSubmitted ?? 0} />
              <Figure label="Shortlisted" value={profile.data?.conceptsShortlisted ?? 0} tone="gold" />
              <Figure label="Rejected" value={profile.data?.conceptsRejected ?? 0} tone="danger" />
              <Figure label="Low-effort" value={profile.data?.lowEffortFlags ?? 0} tone="danger" />
              <Figure label="Rankings won" value={profile.data?.rankingsWon ?? 0} tone="gold" />
              <Figure label="Challenges W/L" value={`${profile.data?.challengesWon ?? 0}/${profile.data?.challengesLost ?? 0}`} />
              <Figure label="Appeals W/L" value={`${profile.data?.appealsWon ?? 0}/${profile.data?.appealsLost ?? 0}`} />
            </div>}

          <div className="mt-5 sheet p-4">
            <div className="kicker mb-1">Concept score history (avg of 3 scores)</div>
            <ScoreHistory concepts={concepts.data ?? []} />
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <section>
              <div className="kicker mb-2">Concepts submitted ({concepts.data?.length ?? 0})</div>
              {(concepts.data ?? []).length === 0 ? <div className="sheet"><Empty title="No concepts" /></div> :
                <ol className="divide-y divide-line border-y border-line">{(concepts.data ?? []).map((c) => (
                  <li key={c.conceptId} className="flex items-center gap-3 py-2">
                    <span className="min-w-0 flex-1"><span className="block truncate font-serif text-sm font-semibold">{c.conceptTitle}</span><span className="flex items-center gap-2"><StatusChip status={c.status} kind="concept" /><VerdictBadge verdict={c.verdict} /></span></span>
                    <span className="headline text-lg">{c.verdict ? avg3(c) : "-"}</span>
                  </li>
                ))}</ol>}
            </section>
            <section>
              <div className="kicker mb-2">Briefs created ({briefs.data?.length ?? 0})</div>
              {(briefs.data ?? []).length === 0 ? <div className="sheet"><Empty title="No briefs" /></div> :
                <ol className="divide-y divide-line border-y border-line">{(briefs.data ?? []).map((b) => (
                  <li key={b.briefId} className="flex items-center gap-3 py-2">
                    <Link href={`/brief/${b.briefId}`} className="min-w-0 flex-1 hover:underline"><span className="block truncate font-serif text-sm font-semibold">{b.title}</span><span className="text-xs text-muted">{b.brandName} · {b.conceptIds.length} concept(s)</span></Link>
                    <StatusChip status={b.status} kind="brief" />
                  </li>
                ))}</ol>}
            </section>
          </div>
        </>}
    </div>
  );
}
