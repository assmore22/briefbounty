"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDot } from "@fortawesome/free-solid-svg-icons";
import { BriefBountyLogo } from "./BriefBountyLogo";
import { WalletConnect } from "./WalletConnect";
import { hasContract, CONTRACT } from "@/lib/briefbounty";
import { CHAIN_ID } from "@/lib/studionet";
import { Hex } from "./ui";

const TABS = [
  { href: "/", label: "The Wall" },
  { href: "/submit", label: "Submit" },
  { href: "/rankings", label: "Rankings" },
  { href: "/disputes", label: "Disputes" },
  { href: "/profile", label: "Creators" },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col">
      {/* newspaper masthead */}
      <header className="sticky top-0 z-30 border-b-2 border-double border-ink bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 lg:px-6">
          <Link href="/"><BriefBountyLogo /></Link>
          <div className="hidden items-center gap-3 text-[11px] text-muted md:flex">
            <span className="font-serif italic">Concepts, judged in public.</span>
            <span className="text-line">|</span>
            <FontAwesomeIcon icon={faCircleDot} className="h-2.5 w-2.5 text-accent animate-tickerpulse" /> Studionet {CHAIN_ID}
            <span className="text-line">|</span>
            {hasContract() ? <Hex value={CONTRACT} kind="contract" lead={5} tail={4} /> : <span className="text-gold">no contract</span>}
          </div>
          <WalletConnect />
        </div>
        {/* issue tabs */}
        <nav className="mx-auto flex w-full max-w-[1440px] items-center gap-5 overflow-x-auto border-t border-line px-4 lg:px-6">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href}
              className={`shrink-0 border-b-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${active(t.href) ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
              {t.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="w-full flex-1">
        {children}
      </main>
    </div>
  );
}
