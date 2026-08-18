"use client";

/**
 * The six copy-led tabs of the brochure editor. The shops get their own file:
 * they are a drawing and a ledger, not paragraphs.
 */

import { AdminButton, Field, Select, TextInput } from "../../ui";
import { AddRow, ChipList, EmField, Line, MediaField, Panel, Para, RowCard } from "./parts";
import type { BrochureDoc } from "@/data/brochureDefaults";

type Patch<T> = (fn: (b: T) => T) => void;

/** Move an item in a list, guarding both ends. */
export function moved<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/* ------------------------------------------------------ the typical floor */

export function TypicalFloorTab({
  value,
  patch,
  onPickImage,
}: {
  value: BrochureDoc["typicalFloor"];
  patch: Patch<BrochureDoc["typicalFloor"]>;
  onPickImage: (set: (url: string) => void) => void;
}) {
  const units = value.units;
  const setUnits = (fn: (u: typeof units) => typeof units) =>
    patch((f) => ({ ...f, units: fn(f.units) }));

  // The same count the page prints, so the editor can show the claim the copy
  // is making before anyone publishes it.
  const facings = [...new Set(units.map((u) => u.facing))];

  return (
    <div className="grid gap-6">
      <Panel title="Section head" hint="Folio 02 — the plate, ahead of the three plans that come out of it.">
        <div className="grid gap-4">
          <EmField label="Title" value={value.title} onChange={(v) => patch((f) => ({ ...f, title: v }))} />
          <Para label="Lede" value={value.lede} onChange={(v) => patch((f) => ({ ...f, lede: v }))} />
          <Para
            label="Second paragraph"
            rows={2}
            value={value.body}
            onChange={(v) => patch((f) => ({ ...f, body: v }))}
          />
          <Para
            label="Closing line"
            rows={2}
            hint="The italic aside under the list."
            value={value.note}
            onChange={(v) => patch((f) => ({ ...f, note: v }))}
          />
        </div>
      </Panel>

      <Panel title="The drawing" hint="Shown whole on white, so a square export of the plan is what fits.">
        <div className="grid gap-4">
          <MediaField
            label="Plan"
            value={value.image}
            onChange={(v) => patch((f) => ({ ...f, image: v }))}
            onPick={() => onPickImage((url) => patch((f) => ({ ...f, image: url })))}
          />
          <Para
            label="Alt text"
            hint="Read aloud instead of the drawing. Say what is on it — the apartments, their sizes, what they face."
            value={value.alt}
            onChange={(v) => patch((f) => ({ ...f, alt: v }))}
          />
          <Line
            label="Caption"
            value={value.caption}
            onChange={(v) => patch((f) => ({ ...f, caption: v }))}
          />
        </div>
      </Panel>

      <Panel
        title={`The plate · ${units.length} apartments`}
        hint="Not printed as a list — the drawing already letters every apartment with its area. This is only what the two facing counts on the page are counted from, so the copy beside the plan can never disagree with the plan."
        aside={
          <AddRow
            label="Add an apartment"
            onClick={() =>
              setUnits((u) => [...u, { id: "", facing: facings[0] ?? "Sports complex" }])
            }
          />
        }
      >
        <div className="grid gap-2">
          {units.map((u, i) => (
            <div
              key={i}
              className="grid items-end gap-3 border border-ink/12 bg-white/50 p-3 sm:grid-cols-[7rem_1fr_auto]"
            >
              <Line
                label="Number"
                hint="As lettered on the drawing."
                mono
                value={u.id}
                onChange={(v) => setUnits((l) => l.map((x, j) => (j === i ? { ...x, id: v } : x)))}
              />
              <Line
                label="Facing"
                hint="Apartments sharing a facing are counted together, in the order they first appear here."
                value={u.facing}
                onChange={(v) => setUnits((l) => l.map((x, j) => (j === i ? { ...x, facing: v } : x)))}
              />
              <div className="flex items-center gap-1 pb-1">
                <AdminButton
                  variant="ghost"
                  onClick={() => setUnits((l) => moved(l, i, -1))}
                  disabled={i === 0}
                >
                  ↑
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  onClick={() => setUnits((l) => moved(l, i, 1))}
                  disabled={i === units.length - 1}
                >
                  ↓
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  onClick={() => setUnits((l) => l.filter((_, j) => j !== i))}
                >
                  Remove
                </AdminButton>
              </div>
            </div>
          ))}
        </div>

        {/* What the page will print from the rows above. */}
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
          {facings.length
            ? facings
                .map((f) => `${f}: ${units.filter((u) => u.facing === f).length}`)
                .join("  ·  ")
            : "No apartments on the plate."}
        </p>
      </Panel>
    </div>
  );
}

/* --------------------------------------------------------- specification */

export function SpecTab({
  value,
  patch,
}: {
  value: BrochureDoc["spec"];
  patch: Patch<BrochureDoc["spec"]>;
}) {
  const rows = value.rows;
  const setRows = (fn: (r: typeof rows) => typeof rows) =>
    patch((s) => ({ ...s, rows: fn(s.rows) }));

  return (
    <div className="grid gap-6">
      <Panel title="Section head" hint="Folio 06 on the brochure. The section arrives folded shut; this is what shows on the lid.">
        <div className="grid gap-4">
          <EmField label="Title" value={value.title} onChange={(v) => patch((s) => ({ ...s, title: v }))} />
          <Para label="Lede" value={value.lede} onChange={(v) => patch((s) => ({ ...s, lede: v }))} />
          <Para
            label="Closing line"
            rows={2}
            hint="The italic aside beside the list."
            value={value.close}
            onChange={(v) => patch((s) => ({ ...s, close: v }))}
          />
        </div>
      </Panel>

      <Panel
        title={`Fittings · ${rows.length} lines`}
        hint="Each line is shut on the page until a reader opens it. Closed it shows the item and the one-line spec; open it adds the note and the brands."
        aside={
          <AddRow
            label="Add a line"
            onClick={() => setRows((r) => [...r, { item: "", detail: "", brands: [], note: "" }])}
          />
        }
      >
        <div className="grid gap-3">
          {rows.map((row, i) => (
            <RowCard
              key={i}
              index={i}
              count={rows.length}
              title={row.item}
              subtitle={row.detail}
              onMove={(d) => setRows((r) => moved(r, i, d))}
              onDuplicate={() => setRows((r) => [...r.slice(0, i + 1), { ...row, item: `${row.item} copy` }, ...r.slice(i + 1)])}
              onRemove={() => setRows((r) => r.filter((_, j) => j !== i))}
              removeLabel={`Remove “${row.item || "this line"}” from the specification?`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Line
                  label="Item"
                  value={row.item}
                  onChange={(v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, item: v } : x)))}
                />
                <Line
                  label="One-line spec"
                  value={row.detail}
                  onChange={(v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, detail: v } : x)))}
                />
              </div>
              <Para
                label="Note"
                hint="Shown only when the line is opened. Say something the one-liner did not."
                value={row.note}
                onChange={(v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, note: v } : x)))}
              />
              <ChipList
                label="Brands"
                values={row.brands}
                onChange={(v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, brands: v } : x)))}
              />
            </RowCard>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------ the building */

export function BuildingTab({
  value,
  patch,
  onPickImage,
}: {
  value: BrochureDoc["building"];
  patch: Patch<BrochureDoc["building"]>;
  onPickImage: (set: (url: string) => void) => void;
}) {
  const roof = value.roof;
  const groups = value.inBuilding.groups;
  const setRoof = (fn: (r: typeof roof) => typeof roof) => patch((b) => ({ ...b, roof: fn(b.roof) }));
  const setGroups = (fn: (g: typeof groups) => typeof groups) =>
    patch((b) => ({ ...b, inBuilding: { ...b.inBuilding, groups: fn(b.inBuilding.groups) } }));

  return (
    <div className="grid gap-6">
      <Panel title="Section head" hint="Folio 08. This section is dark — the italic reads gold on ink.">
        <div className="grid gap-4">
          <EmField
            label="Title"
            dark
            value={value.title}
            onChange={(v) => patch((b) => ({ ...b, title: v }))}
          />
          <Para label="Lede" rows={2} value={value.lede} onChange={(v) => patch((b) => ({ ...b, lede: v }))} />
        </div>
      </Panel>

      <Panel
        title={`Roof frames · ${roof.length}`}
        hint="The rail of rooftop renders. Portrait crops read best — they are shown side by side."
        aside={
          <AddRow label="Add a frame" onClick={() => setRoof((r) => [...r, { image: "", alt: "", caption: "" }])} />
        }
      >
        <div className="grid gap-3">
          {roof.map((f, i) => (
            <RowCard
              key={i}
              index={i}
              count={roof.length}
              title={f.caption}
              subtitle={f.image}
              onMove={(d) => setRoof((r) => moved(r, i, d))}
              onRemove={() => setRoof((r) => r.filter((_, j) => j !== i))}
              removeLabel={`Remove “${f.caption || "this frame"}” from the roof rail?`}
            >
              <MediaField
                label="Render"
                value={f.image}
                onChange={(v) => setRoof((r) => r.map((x, j) => (j === i ? { ...x, image: v } : x)))}
                onPick={() =>
                  onPickImage((url) => setRoof((r) => r.map((x, j) => (j === i ? { ...x, image: url } : x))))
                }
              />
              <Line
                label="Caption"
                value={f.caption}
                onChange={(v) => setRoof((r) => r.map((x, j) => (j === i ? { ...x, caption: v } : x)))}
              />
              <Para
                label="Alt text"
                rows={2}
                hint="Describe what is in the frame — this is what a screen reader and a search engine get."
                value={f.alt}
                onChange={(v) => setRoof((r) => r.map((x, j) => (j === i ? { ...x, alt: v } : x)))}
              />
            </RowCard>
          ))}
        </div>
      </Panel>

      <Panel
        title="In the building"
        hint="Everything Zee99 builds and hands over. Grouped exactly as the page prints them."
        aside={<AddRow label="Add a group" onClick={() => setGroups((g) => [...g, { g: "", items: [] }])} />}
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Line
              label="Heading"
              value={value.inBuilding.label}
              onChange={(v) => patch((b) => ({ ...b, inBuilding: { ...b.inBuilding, label: v } }))}
            />
            <Line
              label="Note"
              value={value.inBuilding.note}
              onChange={(v) => patch((b) => ({ ...b, inBuilding: { ...b.inBuilding, note: v } }))}
            />
          </div>
          {groups.map((g, i) => (
            <RowCard
              key={i}
              index={i}
              count={groups.length}
              title={g.g}
              subtitle={`${g.items.length} items`}
              onMove={(d) => setGroups((x) => moved(x, i, d))}
              onRemove={() => setGroups((x) => x.filter((_, j) => j !== i))}
              removeLabel={`Remove the “${g.g || "untitled"}” group and its ${g.items.length} items?`}
            >
              <Line
                label="Group name"
                value={g.g}
                onChange={(v) => setGroups((x) => x.map((y, j) => (j === i ? { ...y, g: v } : y)))}
              />
              <ChipList
                label="Items"
                values={g.items}
                onChange={(v) => setGroups((x) => x.map((y, j) => (j === i ? { ...y, items: v } : y)))}
              />
            </RowCard>
          ))}
        </div>
      </Panel>

      <Panel
        title="Across the road"
        hint="Deliberately kept apart from the list above: presenting a hospital across the road as a building feature is the move that costs trust."
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Line
              label="Heading"
              value={value.acrossRoad.label}
              onChange={(v) => patch((b) => ({ ...b, acrossRoad: { ...b.acrossRoad, label: v } }))}
            />
            <Line
              label="Note"
              value={value.acrossRoad.note}
              onChange={(v) => patch((b) => ({ ...b, acrossRoad: { ...b.acrossRoad, note: v } }))}
            />
          </div>
          <ChipList
            label="Places"
            values={value.acrossRoad.items}
            onChange={(v) => patch((b) => ({ ...b, acrossRoad: { ...b.acrossRoad, items: v } }))}
          />
        </div>
      </Panel>

      <Panel title="Serviced apartments" hint="The rental-programme note that closes the section.">
        <div className="grid gap-4">
          <Line
            label="Heading"
            value={value.serviced.head}
            onChange={(v) => patch((b) => ({ ...b, serviced: { ...b.serviced, head: v } }))}
          />
          <Para
            label="Body"
            value={value.serviced.body}
            onChange={(v) => patch((b) => ({ ...b, serviced: { ...b.serviced, body: v } }))}
          />
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------- the builder */

const BUILDER_STATUSES = ["Delivered", "Structure complete", "Under construction", "Current"];

export function BuilderTab({
  value,
  patch,
}: {
  value: BrochureDoc["builder"];
  patch: Patch<BrochureDoc["builder"]>;
}) {
  const { stats, projects } = value;
  const setStats = (fn: (s: typeof stats) => typeof stats) =>
    patch((b) => ({ ...b, stats: fn(b.stats) }));
  const setProjects = (fn: (p: typeof projects) => typeof projects) =>
    patch((b) => ({ ...b, projects: fn(b.projects) }));

  return (
    <div className="grid gap-6">
      <Panel title="Section head" hint="Folio 11, and folded shut like the specification.">
        <div className="grid gap-4">
          <EmField label="Title" value={value.title} onChange={(v) => patch((b) => ({ ...b, title: v }))} />
          <Para label="Lede" value={value.lede} onChange={(v) => patch((b) => ({ ...b, lede: v }))} />
          <Para
            label="Closing paragraph"
            value={value.close}
            onChange={(v) => patch((b) => ({ ...b, close: v }))}
          />
        </div>
      </Panel>

      <Panel
        title={`Figures · ${stats.length}`}
        hint="The big gold numbers. Keep the number a number and the unit a word — they are set in different faces."
        aside={<AddRow label="Add a figure" onClick={() => setStats((s) => [...s, { n: "", unit: "", label: "" }])} />}
      >
        <div className="grid gap-3">
          {stats.map((s, i) => (
            <div key={i} className="grid items-end gap-3 border border-ink/12 bg-white/50 p-3 sm:grid-cols-[6rem_7rem_1fr_auto]">
              <Field label="Number">
                <TextInput
                  value={s.n}
                  onChange={(e) => setStats((x) => x.map((y, j) => (j === i ? { ...y, n: e.target.value } : y)))}
                  className="font-display text-[1.1rem]"
                />
              </Field>
              <Field label="Unit">
                <TextInput
                  value={s.unit}
                  placeholder="optional"
                  onChange={(e) => setStats((x) => x.map((y, j) => (j === i ? { ...y, unit: e.target.value } : y)))}
                />
              </Field>
              <Field label="Label">
                <TextInput
                  value={s.label}
                  onChange={(e) => setStats((x) => x.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))}
                />
              </Field>
              <div className="flex gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => setStats((x) => moved(x, i, -1))}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center border border-ink/20 text-ink-2 hover:text-ink disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => setStats((x) => x.filter((_, j) => j !== i))}
                  aria-label="Remove"
                  className="flex h-8 w-8 items-center justify-center border border-red-800/25 text-red-900 hover:bg-red-900/5"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title={`The record · ${projects.length}`}
        hint="Marked “Current” lights the gold dot. Everything else reads as history."
        aside={
          <AddRow
            label="Add a project"
            onClick={() => setProjects((p) => [...p, { name: "", status: "Delivered", note: "" }])}
          />
        }
      >
        <div className="grid gap-3">
          {projects.map((p, i) => (
            <RowCard
              key={i}
              index={i}
              count={projects.length}
              title={p.name}
              subtitle={p.status}
              onMove={(d) => setProjects((x) => moved(x, i, d))}
              onRemove={() => setProjects((x) => x.filter((_, j) => j !== i))}
              removeLabel={`Remove “${p.name || "this project"}” from the record?`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Line
                  label="Name"
                  value={p.name}
                  onChange={(v) => setProjects((x) => x.map((y, j) => (j === i ? { ...y, name: v } : y)))}
                />
                <Field label="Status" hint="“Current” is the one that lights up.">
                  <Select
                    value={BUILDER_STATUSES.includes(p.status) ? p.status : "__custom"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__custom") return;
                      setProjects((x) => x.map((y, j) => (j === i ? { ...y, status: v } : y)));
                    }}
                  >
                    {BUILDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="__custom">Something else…</option>
                  </Select>
                  {!BUILDER_STATUSES.includes(p.status) && (
                    <TextInput
                      value={p.status}
                      className="mt-2"
                      onChange={(e) =>
                        setProjects((x) => x.map((y, j) => (j === i ? { ...y, status: e.target.value } : y)))
                      }
                    />
                  )}
                </Field>
              </div>
              <Line
                label="Note"
                hint="Optional second line under the status."
                value={p.note}
                onChange={(v) => setProjects((x) => x.map((y, j) => (j === i ? { ...y, note: v } : y)))}
              />
            </RowCard>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ----------------------------------------------------------------- the film */

export function FilmTab({
  value,
  patch,
  onPick,
}: {
  value: BrochureDoc["film"];
  patch: Patch<BrochureDoc["film"]>;
  onPick: (kind: "image" | "video", set: (url: string) => void) => void;
}) {
  return (
    <div className="grid gap-6">
      <Panel title="Section head" hint="Folio 05 — the tour, where the project page runs its rental projection.">
        <div className="grid gap-4">
          <EmField
            label="Title"
            dark
            value={value.title}
            onChange={(v) => patch((f) => ({ ...f, title: v }))}
          />
          <Para label="Lede" value={value.lede} onChange={(v) => patch((f) => ({ ...f, lede: v }))} />
        </div>
      </Panel>

      <Panel
        title="The file"
        hint="Keep the encode small — this page is opened on mobile data. The poster is what shows before anyone presses play, so it has to look like a still from the film."
      >
        <div className="grid gap-4">
          <MediaField
            label="Video"
            kind="video"
            value={value.src}
            onChange={(v) => patch((f) => ({ ...f, src: v }))}
            onPick={() => onPick("video", (url) => patch((f) => ({ ...f, src: url })))}
          />
          <MediaField
            label="Poster"
            value={value.poster}
            onChange={(v) => patch((f) => ({ ...f, poster: v }))}
            onPick={() => onPick("image", (url) => patch((f) => ({ ...f, poster: url })))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Line
              label="Caption, left"
              value={value.captionLeft}
              onChange={(v) => patch((f) => ({ ...f, captionLeft: v }))}
            />
            <Line
              label="Caption, right"
              hint="Runtime and what it is, e.g. “2:15 · Render”."
              value={value.captionRight}
              onChange={(v) => patch((f) => ({ ...f, captionRight: v }))}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------- the closing */

export function ClosingTab({
  value,
  patch,
}: {
  value: BrochureDoc["closing"];
  patch: Patch<BrochureDoc["closing"]>;
}) {
  return (
    <div className="grid gap-6">
      <Panel title="The last page" hint="Dark, and the only place the approvals are named.">
        <div className="grid gap-4">
          <EmField
            label="Title"
            dark
            value={value.title}
            onChange={(v) => patch((c) => ({ ...c, title: v }))}
          />
          <ChipList
            label="Lines"
            hint="One short line each, printed under the title."
            values={value.lines}
            onChange={(v) => patch((c) => ({ ...c, lines: v }))}
            placeholder="Add a line and press Enter"
          />
          <ChipList
            label="Approval marks"
            hint="Short codes only — they are set as separate stamps."
            values={value.marks}
            onChange={(v) => patch((c) => ({ ...c, marks: v }))}
          />
          <Para
            label="Colophon"
            hint="The small print about how current the figures are."
            value={value.colophon}
            onChange={(v) => patch((c) => ({ ...c, colophon: v }))}
          />
        </div>
      </Panel>
    </div>
  );
}
