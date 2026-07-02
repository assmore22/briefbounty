"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRankingStar, faArrowRight, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { StatusChip, Banner, Empty, TearSheetSkeleton, Hex } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getRankedBriefs, hasContract } from "@/lib/briefbounty";
import type { Brief } from "@/lib/types";

export default function RankingsPage() {
  const ranked = useLoader<Brief[]>(() => getRankedBriefs(50), []);
  if (!hasContract()) return <div className="p-6"><Banner tone="warn" title="No contract configured" /></div>;
  const list = ranked.data ?? [];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="kicker flex items-center gap-2"><FontAwesomeIcon icon={faRankingStar} className="h-3 w-3 text-gold" /> Rankings board</div>
          <h1 className="mt-1 headline text-3xl">Published & awarded briefs</h1>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={ranked.reload}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${ranked.loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      {ranked.loading && !ranked.data ? <div className="mt-5 space-y-3"><TearSheetSkeleton lines={3} /><TearSheetSkeleton lines={3} /></div> :
        ranked.error ? <div className="mt-5"><Banner tone="danger" title="Failed to load">{ranked.error}</Banner></div> :
        list.length === 0 ? <div className="mt-5 sheet"><Empty icon={faRankingStar} title="No rankings yet" hint="Briefs appear here once a ranking is published." /></div> :
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {list.map((b) => (
            <Link key={b.briefId} href={`/brief/${b.briefId}`} className="sheet group block p-4 transition-shadow hover:shadow-pop">
              <div className="flex items-center justify-between gap-2"><span className="kicker">{b.brandName}</span><StatusChip status={b.status} kind="brief" /></div>
              <h2 className="mt-1 headline text-xl leading-snug">{b.title}</h2>
              <p className="mt-1 line-clamp-2 font-serif text-sm text-muted">{b.campaignGoal}</p>
              <div className="rule my-2" />
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{b.conceptIds.length} concept(s) · {b.rankingIds.length} ranking(s)</span>
                <span className="inline-flex items-center gap-1 text-primary group-hover:underline">Open <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" /></span>
              </div>
              {b.selectedConceptId && <div className="mt-2 chip border-gold/70 bg-gold/10 text-gold">★ awarded concept #{b.selectedConceptId}</div>}
              <div className="mt-2 text-[11px] text-muted">owner <Hex value={b.owner} lead={5} tail={4} /></div>
            </Link>
          ))}
        </div>}
    </div>
  );
}
