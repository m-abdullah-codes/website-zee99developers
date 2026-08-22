"use client";

/**
 * The copy-led tabs of the brochure editor — the sections that exist only in
 * the brochure and are edited out of `settings.brochure`.
 *
 * Two neighbours: the shops get `./shops` because they are a drawing and a
 * ledger rather than paragraphs, and the sections shared with the project page
 * get `./project`, because those are written back into a different row.
 */

import { AdminButton, Field, Select, TextInput } from "../../ui";
import { AddRow, ChipList, EmField, Line, MediaField, Panel, Para, RowCard } from "./parts";
import type { BrochureDoc, PathOption } from "@/data/brochureDefaults";

type Patch<T> = (fn: (b: T) => T) => void;

/** Move an item in a list, guarding both ends. */
export function moved<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/* ------------------------------------------------------------- the choice */

/**
 * The fork, folio 02 — the one section on the page that decides what the rest
 * of the page is.
 *
 * The two cards are edited side by side rather than one under the other, on
 * purpose: they are read side by side, and the failure mode here is not a typo,
 * it is one card arguing harder than the other. Seeing them in the same shape
 * at the same width is what catches that before it is published.
 */
export function PathsTab({
  value,
  patch,
}: {
  value: BrochureDoc["paths"];
  patch: Patch<BrochureDoc["paths"]>;
}) {
  const setSide = (side: "residential" | "commercial") => (fn: (o: PathOption) => PathOption) =>
    patch((p) => ({ ...p, [side]: fn({ ...p[side] }) }));

  return (
    <div className="grid gap-6">
      <Panel
        title="Section head"
        hint="Folio 02, and the point the document stops at: nothing below this section is on the page until one of the two cards is open. Keep the lede to a line — a reader is being asked a question, not read a paragraph."
      >
        <div className="grid gap-4">
          <EmField label="Title" value={value.title} onChange={(v) => patch((p) => ({ ...p, title: v }))} />
          <Para
            label="Lede"
            rows={2}
            value={value.lede}
            onChange={(v) => patch((p) => ({ ...p, lede: v }))}
          />
          <Line
            label="Line under the cards"
            hint="Shown between two gold rules while neither card is open, and gone the moment one is. It is what stops the end of the page reading as a page that failed to load, so say what has to happen next — a few words."
            value={value.note}
            onChange={(v) => patch((p) => ({ ...p, note: v }))}
          />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <PathCard
          title="Left card · Apartments"
          hint="Opens the typical floor, the three plans and the specification."
          value={value.residential}
          patch={setSide("residential")}
        />
        <PathCard
          title="Right card · Shops"
          hint="Opens both retail plans and the shop-by-shop price list."
          value={value.commercial}
          patch={setSide("commercial")}
        />
      </div>
    </div>
  );
}

function PathCard({
  title,
  hint,
  value,
  patch,
}: {
  title: string;
  hint: string;
  value: PathOption;
  patch: Patch<PathOption>;
}) {
  return (
    <Panel title={title} hint={hint}>
      <div className="grid gap-4">
        <Line
          label="Label"
          hint="The small gold line over the name. One word."
          value={value.label}
          onChange={(v) => patch((o) => ({ ...o, label: v }))}
        />
        <Line
          label="Name"
          hint="Set large. One or two words — the two cards sit side by side on a phone, where each is about 160px wide."
          value={value.title}
          onChange={(v) => patch((o) => ({ ...o, title: v }))}
        />
        <ChipList
          label="Facts"
          hint="Two or three short ones, printed one to a line under the name. Counts and ranges, not claims — the card is a signpost, not an argument."
          values={value.meta}
          onChange={(v) => patch((o) => ({ ...o, meta: v }))}
        />
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------- the residences */

/**
 * Two lines, and deliberately only two. The three plans, their areas and every
 * figure on them belong to the project and are edited under Payment — this is
 * the section's own copy, which is about the document rather than the building.
 */
export function ResidencesTab({
  value,
  patch,
  nav,
}: {
  value: BrochureDoc["residences"];
  patch: Patch<BrochureDoc["residences"]>;
  nav: (hash: string) => void;
}) {
  return (
    <div className="grid gap-6">
      <Panel
        title="Section head"
        hint="Folio R2 — the three plans, inside the apartments half."
        aside={
          <AdminButton variant="outline" onClick={() => nav("#/payment")}>
            Prices and plans →
          </AdminButton>
        }
      >
        <div className="grid gap-4">
          <Para
            label="Lede"
            value={value.lede}
            onChange={(v) => patch((r) => ({ ...r, lede: v }))}
          />
          <Line
            label="Cue"
            hint="Printed after “Tap” on a phone and “Click” on a desktop, in the gold chip under the head. It is the only thing on this page that says the cards are buttons, so finish the sentence: “Tap …”."
            value={value.cue}
            onChange={(v) => patch((r) => ({ ...r, cue: v }))}
          />
        </div>
      </Panel>

      <Panel
        title="The three plans themselves"
        hint="Not here. The studio, the one-bed and the two-bed — their areas, prices, down payments, instalments, floor plans and renders — are the project's own, and are the same on the site as they are in the brochure."
      >
        <div className="flex flex-wrap gap-2">
          <AdminButton variant="outline" onClick={() => nav("#/payment")}>
            Open the payment editor
          </AdminButton>
          <AdminButton variant="ghost" onClick={() => nav("#/media")}>
            Media library
          </AdminButton>
        </div>
      </Panel>
    </div>
  );
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
      <Panel
        title="Section head"
        hint="Folio R1 — the plate, ahead of the three plans that come out of it."
      >
        <div className="grid gap-4">
          <EmField label="Title" value={value.title} onChange={(v) => patch((f) => ({ ...f, title: v }))} />
          <Para
            label="Lede"
            hint="One line, and it is the only prose in the section. The drawing letters every apartment with its own area, its caption names the levels, and the two counts beside it say the rest — a paragraph here is a paragraph in front of the prices."
            value={value.lede}
            onChange={(v) => patch((f) => ({ ...f, lede: v }))}
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
      <Panel title="Section head" hint="Folio R3 — the last of the apartments half, and it arrives folded shut. This is what shows on the lid.">
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
      <Panel title="Section head" hint="Folio 09 — “Experience every evening”, the last section of the document. It closes the brochure on the roof, after the questions are answered and the record is on the table.">
        <div className="grid gap-4">
          {/* Not `dark`: the section is set on paper, and the preview was
              showing the italic in the wrong gold. */}
          <EmField label="Title" value={value.title} onChange={(v) => patch((b) => ({ ...b, title: v }))} />
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
      <Panel title="Section head" hint="Folio 07, and folded shut like the specification.">
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
      <Panel title="Section head" hint="Folio 03 — the tour, where the project page runs its rental projection. It is the first section below the choice, so both readers see it.">
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
