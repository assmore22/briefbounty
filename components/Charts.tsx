"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { TONE_HEX, toneOf, type Concept } from "@/lib/types";

const AXES = [
  { key: "originalityScore", label: "Originality" },
  { key: "brandFitScore", label: "Brand fit" },
  { key: "feasibilityScore", label: "Feasibility" },
  { key: "integrity", label: "Integrity" }, // 100 - lowEffortRisk
] as const;

/** D3 radar "score rosette" for a single concept's four scores. */
export function ScoreRosette({ concept, size = 260 }: { concept?: Concept | null; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const svg = d3.select(el).attr("viewBox", `0 0 ${size} ${size}`).attr("width", "100%").attr("height", size);
    svg.selectAll("*").remove();
    const cx = size / 2, cy = size / 2, R = size / 2 - 38;
    const n = AXES.length;
    const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const pt = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;

    // rings
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", R * f).attr("fill", "none").attr("stroke", "#D8CBB8").attr("stroke-width", 1).attr("opacity", f === 1 ? 1 : 0.6);
    });
    // axes + labels
    AXES.forEach((ax, i) => {
      const [x, y] = pt(i, R);
      svg.append("line").attr("x1", cx).attr("y1", cy).attr("x2", x).attr("y2", y).attr("stroke", "#D8CBB8").attr("stroke-width", 1);
      const [lx, ly] = pt(i, R + 18);
      svg.append("text").attr("x", lx).attr("y", ly + 3).attr("text-anchor", "middle").attr("fill", "#756B5E").attr("font-size", 10).attr("font-family", "Georgia, serif").text(ax.label);
    });

    if (!concept || !concept.verdict) {
      svg.append("text").attr("x", cx).attr("y", cy).attr("text-anchor", "middle").attr("fill", "#756B5E").attr("font-size", 11).attr("font-family", "Georgia, serif").text("awaiting assessment");
      return;
    }

    const vals = [
      concept.originalityScore || 0,
      concept.brandFitScore || 0,
      concept.feasibilityScore || 0,
      Math.max(0, 100 - (concept.lowEffortRiskScore || 0)),
    ];
    const color = TONE_HEX[toneOf(concept.verdict, concept.status)];
    const poly = vals.map((v, i) => pt(i, R * (v / 100)));
    const path = poly.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";
    svg.append("path").attr("d", path).attr("fill", color).attr("fill-opacity", 0.18).attr("stroke", color).attr("stroke-width", 2)
      .attr("transform", `scale(0.01)`).attr("transform-origin", `${cx}px ${cy}px`)
      .transition().duration(550).attr("transform", "scale(1)");
    poly.forEach((p, i) => {
      svg.append("circle").attr("cx", p[0]).attr("cy", p[1]).attr("r", 3.5).attr("fill", "#FFFDF6").attr("stroke", color).attr("stroke-width", 2);
      svg.append("text").attr("x", p[0]).attr("y", p[1] - 7).attr("text-anchor", "middle").attr("fill", "#14110F").attr("font-size", 9).attr("font-family", "ui-monospace, monospace").text(vals[i]);
    });
  }, [concept, size]);
  return <svg ref={ref} role="img" aria-label="Concept score rosette" />;
}

/** Small D3 bars of a creator's concept-outcome history. */
export function ScoreHistory({ concepts }: { concepts: Concept[] }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = [...concepts].filter((c) => c.verdict).slice(0, 12).reverse();
    const W = 520, H = 150, M = { top: 12, right: 10, bottom: 24, left: 28 };
    const svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);
    svg.selectAll("*").remove();
    const y = d3.scaleLinear().domain([0, 100]).range([H - M.bottom, M.top]);
    [0, 50, 100].forEach((t) => {
      svg.append("line").attr("x1", M.left).attr("x2", W - M.right).attr("y1", y(t)).attr("y2", y(t)).attr("stroke", "#D8CBB8").attr("stroke-width", 1);
      svg.append("text").attr("x", 4).attr("y", y(t) + 3).attr("fill", "#756B5E").attr("font-size", 9).text(t);
    });
    if (data.length === 0) {
      svg.append("text").attr("x", W / 2).attr("y", H / 2).attr("text-anchor", "middle").attr("fill", "#756B5E").attr("font-size", 11).attr("font-family", "Georgia, serif").text("no scored concepts yet");
      return;
    }
    const x = d3.scaleBand<number>().domain(data.map((_d, i) => i)).range([M.left, W - M.right]).padding(0.28);
    svg.append("g").selectAll("rect").data(data).join("rect")
      .attr("x", (_d, i) => x(i) ?? 0).attr("width", x.bandwidth())
      .attr("y", (d) => y((d.originalityScore + d.brandFitScore + d.feasibilityScore) / 3)).attr("rx", 2)
      .attr("height", (d) => y(0) - y((d.originalityScore + d.brandFitScore + d.feasibilityScore) / 3))
      .attr("fill", (d) => TONE_HEX[toneOf(d.verdict, d.status)]).attr("opacity", 0.9);
  }, [concepts]);
  return <svg ref={ref} role="img" aria-label="Score history" />;
}
