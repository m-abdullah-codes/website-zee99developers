"use client";

/**
 * The brochure sections that belong to the *project* rather than to the
 * brochure — edited here, saved back into the project row.
 *
 * Half of the e-brochure was never in this editor. The cover, the overview and
 * its facts, the amenity tiles, the location and its drive times, the
 * construction updates and the FAQs are all the project's, so the brochure
 * editor pointed at Projects and left it there — and Projects is a raw JSON
 * box. "Edit your brochure" that quietly means "except for six of its
 * sections, which are over there, in JSON" is not an editor, which is what the
 * client said in fewer words.
 *
 * So this file gives those six the same forms the brochure's own sections get,
 * writing into the booking project's `data` blob through the normal projects
 * API. It is the same arrangement `PaymentPlans` already uses for the units:
 * one row, one shape, several purpose-built ways in. The raw JSON editor under
 * Projects still works and still wins nothing — both are just writes.
 *
 * Every one of these is shared with the site's own project page. That is the
 * point of editing the project rather than copying it into the brochure, and
 * it is worth saying on the panels, so nobody edits the overview here expecting
 * /projects/zee99-lifestyle to keep the old one.
 */

import { AdminButton, Field, TextInput } from "../../ui";
import { AddRow, Line, MediaField, Panel, Para, RowCard } from "./parts";
import { moved } from "./sections";
import type { AmenityMedia, Project, Update } from "@/data/projects";

/** The project row's `data` blob, as much of it as these tabs touch. */
export type ProjectData = Partial<Project> & Record<string, unknown>;

export type ProjectPatch = (fn: (d: ProjectData) => ProjectData) => void;

type TabProps = {
  value: ProjectData;
  patch: ProjectPatch;
  onPickImage: (set: (url: string) => void) => void;
};

/** Said once per tab, because every one of these is two pages at a time. */
function Shared({ where }: { where: string }) {
  return (
    <p className="border border-gold-2/40 bg-gold/5 px-4 py-3 text-[12px] leading-relaxed text-ink-2">
      Shared with the site. This is the same {where} that the project page at
      <span className="font-mono text-[11.5px] text-ink"> /projects/zee99-lifestyle </span>
      shows — editing it here changes both.
    </p>
  );
}

/* ------------------------------------------------------------- the cover */

export function CoverTab({ value, patch, onPickImage }: TabProps) {
  return (
    <div className="grid gap-6">
      <Panel
        title="The cover"
        hint="The full-height opening frame, with the masthead over it. The brochure prints its edition from the newest construction update, so the date beside the logo is set on the Updates tab, not here."
      >
        <div className="grid gap-4">
          <Shared where="hero" />
          <MediaField
            label="Cover image"
            hint="Landscape, and it is cropped to the full height of a phone as well as a desktop — keep the building off the edges."
            value={value.heroImage ?? ""}
            onChange={(v) => patch((d) => ({ ...d, heroImage: v }))}
            onPick={() => onPickImage((url) => patch((d) => ({ ...d, heroImage: url })))}
          />
          <Para
            label="Cover line"
            rows={2}
            hint="The line set over the image."
            value={value.heroLine ?? ""}
            onChange={(v) => patch((d) => ({ ...d, heroLine: v }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Line
              label="Status"
              hint="The pill, e.g. “Now Booking”."
              value={value.statusLabel ?? ""}
              onChange={(v) => patch((d) => ({ ...d, statusLabel: v }))}
            />
            <Line
              label="Location"
              hint="Printed under the name."
              value={value.location ?? ""}
              onChange={(v) => patch((d) => ({ ...d, location: v }))}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------- 01 · overview */

export function OverviewTab({ value, patch, onPickImage }: TabProps) {
  const facts = value.facts ?? [];
  const setFacts = (fn: (f: { k: string; v: string }[]) => { k: string; v: string }[]) =>
    patch((d) => ({ ...d, facts: fn(d.facts ?? []) }));

  return (
    <div className="grid gap-6">
      <Panel
        title="Section head"
        hint="Folio 01 — the paragraph the whole document opens on, set large. It is the last thing every reader sees before the choice, so it has to be true of both halves of the building."
      >
        <div className="grid gap-4">
          <Shared where="overview" />
          <Para
            label="Overview"
            rows={5}
            value={value.overview ?? ""}
            onChange={(v) => patch((d) => ({ ...d, overview: v }))}
          />
        </div>
      </Panel>

      <Panel
        title={`Facts · ${facts.length}`}
        hint="The grid of short facts under the paragraph. Two columns on a phone, three on a desktop — so multiples of six sit even at both widths."
        aside={<AddRow label="Add a fact" onClick={() => setFacts((f) => [...f, { k: "", v: "" }])} />}
      >
        <div className="grid gap-2">
          {facts.map((f, i) => (
            <div
              key={i}
              className="grid items-end gap-3 border border-ink/12 bg-white/50 p-3 sm:grid-cols-[12rem_1fr_auto]"
            >
              <Line
                label="Label"
                value={f.k}
                onChange={(v) => setFacts((l) => l.map((x, j) => (j === i ? { ...x, k: v } : x)))}
              />
              <Line
                label="Value"
                value={f.v}
                onChange={(v) => setFacts((l) => l.map((x, j) => (j === i ? { ...x, v } : x)))}
              />
              <div className="flex items-center gap-1 pb-1">
                <AdminButton variant="ghost" disabled={i === 0} onClick={() => setFacts((l) => moved(l, i, -1))}>
                  ↑
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  disabled={i === facts.length - 1}
                  onClick={() => setFacts((l) => moved(l, i, 1))}
                >
                  ↓
                </AdminButton>
                <AdminButton variant="ghost" onClick={() => setFacts((l) => l.filter((_, j) => j !== i))}>
                  Remove
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="The plate" hint="The render beside the paragraph. It pins while the column beside it scrolls, so a landscape crop is what fits.">
        <MediaField
          label="Render"
          value={value.overviewImage ?? ""}
          onChange={(v) => patch((d) => ({ ...d, overviewImage: v }))}
          onPick={() => onPickImage((url) => patch((d) => ({ ...d, overviewImage: url })))}
        />
      </Panel>
    </div>
  );
}

/* --------------------------------------------------------- 04 · amenities */

/** The tiles the section draws an icon for. Anything else gets a plain circle,
 *  which is why the id is a menu rather than a text box. */
const AMENITY_ICONS = [
  "terrace",
  "pool",
  "gym",
  "parking",
  "security",
  "retail",
  "power",
  "lift",
  "lobby",
];

const EMPTY_MEDIA: AmenityMedia = { image: "", alt: "", captionLeft: "", captionRight: "" };

export function AmenitiesTab({ value, patch, onPickImage }: TabProps) {
  const items = value.amenities ?? [];
  const media = value.amenityMedia ?? [];
  const setItems = (fn: (a: { id: string; label: string }[]) => { id: string; label: string }[]) =>
    patch((d) => ({ ...d, amenities: fn(d.amenities ?? []) }));
  const setMedia = (i: number, fn: (m: AmenityMedia) => AmenityMedia) =>
    patch((d) => {
      const next = [...(d.amenityMedia ?? [])];
      while (next.length < 2) next.push({ ...EMPTY_MEDIA });
      next[i] = fn({ ...next[i] });
      return { ...d, amenityMedia: next };
    });

  return (
    <div className="grid gap-6">
      <Panel
        title={`Tiles · ${items.length}`}
        hint="Folio 04, and the section arrives folded shut. Each tile is an icon and a label; the icon is chosen by the id, and an id with no drawing behind it falls back to a plain circle."
        aside={<AddRow label="Add a tile" onClick={() => setItems((a) => [...a, { id: "", label: "" }])} />}
      >
        <div className="grid gap-4">
          <Shared where="amenity list" />
          <div className="grid gap-2">
            {items.map((a, i) => (
              <div
                key={i}
                className="grid items-end gap-3 border border-ink/12 bg-white/50 p-3 sm:grid-cols-[11rem_1fr_auto]"
              >
                <Field label="Icon" hint="Also the tile's key.">
                  <TextInput
                    list="amenity-icons"
                    value={a.id}
                    onChange={(e) =>
                      setItems((l) => l.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)))
                    }
                    className="font-mono text-[11.5px]"
                  />
                </Field>
                <Line
                  label="Label"
                  value={a.label}
                  onChange={(v) => setItems((l) => l.map((x, j) => (j === i ? { ...x, label: v } : x)))}
                />
                <div className="flex items-center gap-1 pb-1">
                  <AdminButton variant="ghost" disabled={i === 0} onClick={() => setItems((l) => moved(l, i, -1))}>
                    ↑
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    disabled={i === items.length - 1}
                    onClick={() => setItems((l) => moved(l, i, 1))}
                  >
                    ↓
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>
                    Remove
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
          <datalist id="amenity-icons">
            {AMENITY_ICONS.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
            Drawn icons: {AMENITY_ICONS.join(" · ")}
          </p>
        </div>
      </Panel>

      {[0, 1].map((i) => (
        <Panel
          key={i}
          title={i === 0 ? "Render · wide" : "Render · tall"}
          hint={
            i === 0
              ? "Set 16:9 beside the tiles."
              : "Set 3:4 under the first one, and narrower than it — a portrait crop is what fits."
          }
        >
          <div className="grid gap-4">
            <MediaField
              label="Image"
              value={media[i]?.image ?? ""}
              onChange={(v) => setMedia(i, (m) => ({ ...m, image: v }))}
              onPick={() => onPickImage((url) => setMedia(i, (m) => ({ ...m, image: url })))}
            />
            <Para
              label="Alt text"
              rows={2}
              hint="What is in the frame — this is what a screen reader gets."
              value={media[i]?.alt ?? ""}
              onChange={(v) => setMedia(i, (m) => ({ ...m, alt: v }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Line
                label="Caption, left"
                value={media[i]?.captionLeft ?? ""}
                onChange={(v) => setMedia(i, (m) => ({ ...m, captionLeft: v }))}
              />
              <Line
                label="Caption, right"
                value={media[i]?.captionRight ?? ""}
                onChange={(v) => setMedia(i, (m) => ({ ...m, captionRight: v }))}
              />
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- 05 · location */

export function LocationTab({ value, patch }: Omit<TabProps, "onPickImage">) {
  const sec = value.locationSec ?? { title: "", body: "", embed: "", distances: [] };
  const setSec = (fn: (s: NonNullable<Project["locationSec"]>) => NonNullable<Project["locationSec"]>) =>
    patch((d) => ({
      ...d,
      locationSec: fn(d.locationSec ?? { title: "", body: "", embed: "", distances: [] }),
    }));
  const distances = sec.distances ?? [];

  return (
    <div className="grid gap-6">
      <Panel title="Section head" hint="Folio 05. The heading here is plain type — no *asterisks*, unlike the rest of the brochure.">
        <div className="grid gap-4">
          <Shared where="location section" />
          <Para label="Title" rows={2} value={sec.title} onChange={(v) => setSec((s) => ({ ...s, title: v }))} />
          <Para label="Body" rows={4} value={sec.body} onChange={(v) => setSec((s) => ({ ...s, body: v }))} />
        </div>
      </Panel>

      <Panel
        title={`Drive times · ${distances.length}`}
        hint="Two columns, so an even count sits square. The figure is set large in gold and the place under it in mono — keep the figure short."
        aside={
          <AddRow label="Add a distance" onClick={() => setSec((s) => ({ ...s, distances: [...(s.distances ?? []), { t: "", d: "" }] }))} />
        }
      >
        <div className="grid gap-2">
          {distances.map((row, i) => (
            <div
              key={i}
              className="grid items-end gap-3 border border-ink/12 bg-white/50 p-3 sm:grid-cols-[9rem_1fr_auto]"
            >
              <Line
                label="Figure"
                hint="e.g. “2 min”."
                value={row.d}
                onChange={(v) =>
                  setSec((s) => ({ ...s, distances: (s.distances ?? []).map((x, j) => (j === i ? { ...x, d: v } : x)) }))
                }
              />
              <Line
                label="Place"
                value={row.t}
                onChange={(v) =>
                  setSec((s) => ({ ...s, distances: (s.distances ?? []).map((x, j) => (j === i ? { ...x, t: v } : x)) }))
                }
              />
              <div className="flex items-center gap-1 pb-1">
                <AdminButton
                  variant="ghost"
                  disabled={i === 0}
                  onClick={() => setSec((s) => ({ ...s, distances: moved(s.distances ?? [], i, -1) }))}
                >
                  ↑
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  disabled={i === distances.length - 1}
                  onClick={() => setSec((s) => ({ ...s, distances: moved(s.distances ?? [], i, 1) }))}
                >
                  ↓
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  onClick={() =>
                    setSec((s) => ({ ...s, distances: (s.distances ?? []).filter((_, j) => j !== i) }))
                  }
                >
                  Remove
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="The map"
        hint="A Google Maps embed URL — the src out of Share → Embed a map, not the address bar. On the brochure it is drawn but not clickable: nothing on that page navigates away from it."
      >
        <Line
          label="Embed URL"
          mono
          placeholder="https://www.google.com/maps/embed?pb=…"
          value={sec.embed ?? ""}
          onChange={(v) => setSec((s) => ({ ...s, embed: v }))}
        />
      </Panel>
    </div>
  );
}

/* ----------------------------------------------------------- 06 · updates */

export function UpdatesTab({ value, patch, onPickImage }: TabProps) {
  const updates = value.updates ?? [];
  const setUpdates = (fn: (u: Update[]) => Update[]) =>
    patch((d) => ({ ...d, updates: fn(d.updates ?? []) }));

  return (
    <div className="grid gap-6">
      <Panel
        title={`The timeline · ${updates.length}`}
        hint="Folio 06, newest first — and the newest one's date is also the edition printed beside the logo on the cover and on the last page. Adding an update re-dates the whole brochure."
        aside={
          <AddRow
            label="Add an update"
            onClick={() => setUpdates((u) => [{ date: "", title: "", body: "" }, ...u])}
          />
        }
      >
        <div className="grid gap-4">
          <Shared where="construction timeline" />
          <div className="grid gap-3">
            {updates.map((u, i) => (
              <RowCard
                key={i}
                index={i}
                count={updates.length}
                title={u.title}
                subtitle={u.date}
                onMove={(d) => setUpdates((l) => moved(l, i, d))}
                onRemove={() => setUpdates((l) => l.filter((_, j) => j !== i))}
                removeLabel={`Remove “${u.title || "this update"}” from the timeline?`}
              >
                <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
                  <Line
                    label="Date"
                    hint="Free text — it is printed as written."
                    value={u.date}
                    onChange={(v) => setUpdates((l) => l.map((x, j) => (j === i ? { ...x, date: v } : x)))}
                  />
                  <Line
                    label="Title"
                    value={u.title}
                    onChange={(v) => setUpdates((l) => l.map((x, j) => (j === i ? { ...x, title: v } : x)))}
                  />
                </div>
                <Para
                  label="Body"
                  value={u.body}
                  onChange={(v) => setUpdates((l) => l.map((x, j) => (j === i ? { ...x, body: v } : x)))}
                />
                <MediaField
                  label="Photograph"
                  hint="Optional."
                  value={u.img ?? ""}
                  onChange={(v) => setUpdates((l) => l.map((x, j) => (j === i ? { ...x, img: v } : x)))}
                  onPick={() =>
                    onPickImage((url) =>
                      setUpdates((l) => l.map((x, j) => (j === i ? { ...x, img: url } : x))),
                    )
                  }
                />
              </RowCard>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------- 08 · faqs */

export function FaqsTab({ value, patch }: Omit<TabProps, "onPickImage">) {
  const faqs = value.faqs ?? [];
  const setFaqs = (fn: (f: { q: string; a: string }[]) => { q: string; a: string }[]) =>
    patch((d) => ({ ...d, faqs: fn(d.faqs ?? []) }));

  return (
    <div className="grid gap-6">
      <Panel
        title={`Questions · ${faqs.length}`}
        hint="Folio 08, folded shut, and each question folded inside that. The count is printed on the lid, so an unanswered question is worse than a missing one."
        aside={<AddRow label="Add a question" onClick={() => setFaqs((f) => [...f, { q: "", a: "" }])} />}
      >
        <div className="grid gap-4">
          <Shared where="FAQ list" />
          <div className="grid gap-3">
            {faqs.map((f, i) => (
              <RowCard
                key={i}
                index={i}
                count={faqs.length}
                title={f.q}
                subtitle={f.a.slice(0, 80)}
                onMove={(d) => setFaqs((l) => moved(l, i, d))}
                onRemove={() => setFaqs((l) => l.filter((_, j) => j !== i))}
                removeLabel={`Remove “${f.q || "this question"}” from the FAQs?`}
              >
                <Para
                  label="Question"
                  rows={2}
                  value={f.q}
                  onChange={(v) => setFaqs((l) => l.map((x, j) => (j === i ? { ...x, q: v } : x)))}
                />
                <Para
                  label="Answer"
                  rows={4}
                  value={f.a}
                  onChange={(v) => setFaqs((l) => l.map((x, j) => (j === i ? { ...x, a: v } : x)))}
                />
              </RowCard>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
