"use client";

import { useMemo } from "react";
import AnchorNav, { type AnchorItem } from "@/components/project/AnchorNav";
import { usePath, type PathId } from "@/components/brochure/Paths";
import { cn } from "@/lib/utils";

/**
 * The e-brochure's anchor rail, which now has to describe a page that changes
 * shape.
 *
 * Two things follow the fork:
 *
 *   1. **The switch is pinned.** Two pills sit outside the scroller, on screen
 *      at every scroll position and every width. This is the answer to "which
 *      half am I in, and how do I get to the other one" at the point a reader
 *      is furthest from the cards — halfway down a shop ledger, say. Short
 *      labels on purpose: the rail is a scroller, and every pixel the switch
 *      takes is a pixel the section links do not have.
 *   2. **The section links follow it.** A branch's sections only enter the rail
 *      while that branch is open. A shut branch has no height, so an anchor to
 *      it would scroll to a seam in the page and light up nothing — and a rail
 *      offering "Specification" to someone reading shop plates is describing a
 *      page they are not on.
 */

const HOMES: AnchorItem[] = [
  { id: "floor", label: "Floor" },
  { id: "residences", label: "Plans" },
  { id: "specification", label: "Specification" },
];

const SHOPS: AnchorItem[] = [{ id: "commercial", label: "Shop plans" }];

/** Everything below the fork, which is the same document either way. */
const BELOW: AnchorItem[] = [
  { id: "film", label: "The film" },
  { id: "amenities", label: "Amenities" },
  { id: "location", label: "Location" },
  { id: "updates", label: "Updates" },
  { id: "builder", label: "The builder" },
  { id: "faqs", label: "FAQs" },
  { id: "building", label: "The building" },
];

export default function BrochureNav() {
  const { path } = usePath();

  const items = useMemo<AnchorItem[]>(
    () => [
      { id: "overview", label: "Overview" },
      { id: "paths", label: "Choose" },
      ...(path === "residential" ? HOMES : path === "commercial" ? SHOPS : []),
      // Nothing below the fork exists until the fork is answered, so until it
      // is, the rail is two entries long and says so.
      ...(path === null ? [] : BELOW),
    ],
    [path],
  );

  return <AnchorNav items={items} top="0px" lead={<PathSwitch />} />;
}

function PathSwitch() {
  const { path, go, choose } = usePath();

  return (
    <div className="mr-4 flex shrink-0 items-center gap-1 border-r border-ink/12 py-2.5 pr-4 sm:mr-6 sm:pr-6">
      <Pill id="residential" label="Homes" open={path === "residential"} go={go} choose={choose} />
      <Pill id="commercial" label="Shops" open={path === "commercial"} go={go} choose={choose} />
    </div>
  );
}

function Pill({
  id,
  label,
  open,
  go,
  choose,
}: {
  id: PathId;
  label: string;
  open: boolean;
  go: (id: PathId) => void;
  choose: (id: PathId) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={open}
      // Pressing the open one shuts it — the pill is the state, so it has to be
      // able to turn the state off. Pressing the other one opens it and goes.
      onClick={() => (open ? choose(id) : go(id))}
      className={cn(
        "whitespace-nowrap border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] transition-colors duration-300 sm:text-[9.5px] sm:tracking-[0.2em]",
        open
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 text-ink-2/80 hover:border-ink/50 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
