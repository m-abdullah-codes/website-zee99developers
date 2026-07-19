"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { PricePoint } from "@/data/projects";
import { crFmt, lacFmt } from "@/lib/format";

export type PriceChartHandle = { setProgress: (p: number) => void };

const W = 760;
const H = 470;
const M = { l: 58, r: 26, t: 120, b: 48 };
const Y_MIN = 6_000_000;
const Y_MAX = 17_500_000;
const GRID = [8_000_000, 10_000_000, 12_000_000, 14_000_000, 16_000_000];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Props = {
  data: PricePoint[];
  onProgress?: (p: number) => void;
  className?: string;
};

const PriceChart = forwardRef<PriceChartHandle, Props>(function PriceChart(
  { data, onProgress },
  ref,
) {
  const n = data.length;
  const xAt = (i: number) => M.l + ((W - M.l - M.r) * i) / (n - 1);
  const yAt = (v: number) =>
    M.t + (H - M.t - M.b) * (1 - (v - Y_MIN) / (Y_MAX - Y_MIN));

  const pts2 = data.map((d, i) => [xAt(i), yAt(d.twoBed)] as const);
  const pts1 = data.map((d, i) => [xAt(i), yAt(d.oneBed)] as const);
  const line = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const area2 = `${line(pts2)} L${pts2[n - 1][0]} ${H - M.b} L${pts2[0][0]} ${H - M.b} Z`;

  const root = useRef<HTMLDivElement>(null);
  const path2 = useRef<SVGPathElement>(null);
  const path1 = useRef<SVGPathElement>(null);
  const clipRect = useRef<SVGRectElement>(null);
  const ticker2 = useRef<HTMLParagraphElement>(null);
  const ticker1 = useRef<HTMLSpanElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const lens = useRef({ l2: 0, l1: 0 });
  const prog = useRef(0);

  const setProgress = (raw: number) => {
    const p = Math.max(0, Math.min(1, raw));
    prog.current = p;
    const el = root.current;
    if (!el) return;
    const { l2, l1 } = lens.current;
    if (path2.current && l2) {
      path2.current.style.strokeDashoffset = String(l2 * (1 - p));
    }
    const p1 = Math.max(0, Math.min(1, (p - 0.1) / 0.9));
    if (path1.current && l1) {
      path1.current.style.strokeDashoffset = String(l1 * (1 - p1));
    }
    clipRect.current?.setAttribute(
      "width",
      String(Math.max(0, (W - M.l - M.r + 16) * p)),
    );
    el.querySelectorAll<SVGGElement>("[data-pt]").forEach((g, i) => {
      const t = i / (n - 1);
      if (p >= t - 0.015) g.setAttribute("data-on", "");
      else g.removeAttribute("data-on");
    });
    el.querySelectorAll<SVGTextElement>("[data-xlabel]").forEach((t, i) => {
      const th = i / (n - 1);
      if (p >= th - 0.015) t.setAttribute("data-on", "");
      else t.removeAttribute("data-on");
    });
    const f = p * (n - 1);
    const i = Math.min(n - 2, Math.floor(f));
    const t = f - i;
    if (ticker2.current) {
      ticker2.current.textContent = crFmt(
        lerp(data[i].twoBed, data[i + 1].twoBed, t),
      );
    }
    if (ticker1.current) {
      ticker1.current.textContent = lacFmt(
        lerp(data[i].oneBed, data[i + 1].oneBed, t),
      );
    }
    if (stamp.current) {
      if (p > 0.965) stamp.current.setAttribute("data-on", "");
      else stamp.current.removeAttribute("data-on");
    }
    onProgress?.(p);
  };

  useImperativeHandle(ref, () => ({ setProgress }));

  useEffect(() => {
    const l2 = path2.current?.getTotalLength() ?? 0;
    const l1 = path1.current?.getTotalLength() ?? 0;
    lens.current = { l2, l1 };
    if (path2.current) {
      path2.current.style.strokeDasharray = String(l2);
      path2.current.style.strokeDashoffset = String(l2);
    }
    if (path1.current) {
      path1.current.style.strokeDasharray = String(l1);
      path1.current.style.strokeDashoffset = String(l1);
    }
    setProgress(prog.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (prog.current < 0.98 || !tooltip.current || !root.current) return;
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let idx = 0;
    let best = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(xAt(i) - x);
      if (d < best) {
        best = d;
        idx = i;
      }
    }
    const tt = tooltip.current;
    tt.style.opacity = "1";
    tt.style.left = `${(xAt(idx) / W) * 100}%`;
    tt.style.top = `${(pts2[idx][1] / H) * 100}%`;
    tt.innerHTML = `<span>${data[idx].label}</span>2 Bed — ${crFmt(
      data[idx].twoBed,
    )}<br/>1 Bed — ${lacFmt(data[idx].oneBed)}`;
  };
  const onLeave = () => {
    if (tooltip.current) tooltip.current.style.opacity = "0";
  };

  const first = data[0];
  const last = data[n - 1];
  const deltaPct = Math.round(((last.twoBed - first.twoBed) / first.twoBed) * 100);

  return (
    <div ref={root} className="relative select-none">
      {/* live ticker */}
      <div className="pointer-events-none absolute left-[7.5%] top-0 z-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-paper/45">
          2 Bed — live value
        </p>
        <p
          ref={ticker2}
          className="mt-2 font-display text-[clamp(2.4rem,4vw,3.4rem)] font-[380] leading-none text-gold-3"
        >
          {crFmt(first.twoBed)}
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
          1 Bed — <span ref={ticker1}>{lacFmt(first.oneBed)}</span>
        </p>
      </div>

      {/* stamp */}
      <div
        ref={stamp}
        className="absolute right-[4%] top-[6%] z-10 rotate-[-7deg] border border-gold-2 px-5 py-3 font-mono text-[11px] tracking-[0.28em] text-gold-3 opacity-0 outline outline-1 outline-offset-4 outline-gold-2/40 transition-all duration-500 ease-[var(--ease-out-expo)] [transform:scale(1.6)_rotate(-7deg)] data-[on]:opacity-100 data-[on]:[transform:scale(1)_rotate(-7deg)]"
      >
        +{deltaPct}% IN 18 MO
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        role="img"
        aria-label={`Zee99 Arcade price history: two-bed from ${crFmt(first.twoBed)} in ${first.label} to ${crFmt(last.twoBed)} now`}
      >
        <defs>
          <linearGradient id="z99-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#b08c42" />
            <stop offset="1" stopColor="#e6cc8b" />
          </linearGradient>
          <linearGradient id="z99-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c29d55" stopOpacity="0.2" />
            <stop offset="1" stopColor="#c29d55" stopOpacity="0" />
          </linearGradient>
          <clipPath id="z99-clip">
            <rect ref={clipRect} x={M.l} y="0" width="0" height={H} />
          </clipPath>
        </defs>

        {GRID.map((v) => (
          <g key={v}>
            <line
              x1={M.l}
              x2={W - M.r}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="rgba(246,242,233,0.09)"
              strokeDasharray="1 7"
            />
            <text
              x={M.l - 12}
              y={yAt(v) + 3}
              textAnchor="end"
              className="fill-paper/35 font-mono text-[10px]"
            >
              {v / 1e7} Cr
            </text>
          </g>
        ))}

        <path d={area2} fill="url(#z99-area)" clipPath="url(#z99-clip)" />
        <path
          ref={path1}
          d={line(pts1)}
          fill="none"
          stroke="rgba(246,242,233,0.4)"
          strokeWidth="1.5"
        />
        <path
          ref={path2}
          d={line(pts2)}
          fill="none"
          stroke="url(#z99-line)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {pts2.map(([x, y], i) => (
          <g
            key={i}
            data-pt
            className="opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] data-[on]:opacity-100 [&[data-on]_.pt-core]:scale-100"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle cx={x} cy={y} r="11" fill="none" stroke="rgba(194,157,85,0.3)" />
            <circle
              className="pt-core scale-0 transition-transform duration-500 ease-[var(--ease-out-expo)]"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              cx={x}
              cy={y}
              r="4.5"
              fill="#12100b"
              stroke="#e6cc8b"
              strokeWidth="2"
            />
          </g>
        ))}
        {pts1.map(([x, y], i) => (
          <circle
            key={i}
            data-pt
            cx={x}
            cy={y}
            r="2.6"
            fill="rgba(246,242,233,0.55)"
            className="opacity-0 transition-opacity duration-500 data-[on]:opacity-100"
          />
        ))}

        {data.map((d, i) => (
          <text
            key={d.label}
            data-xlabel
            x={xAt(i)}
            y={H - 16}
            textAnchor="middle"
            className="fill-paper/35 font-mono text-[10.5px] tracking-[0.14em] transition-[fill] duration-500 data-[on]:fill-gold-3"
          >
            {d.label.toUpperCase()}
          </text>
        ))}
      </svg>

      {/* tooltip */}
      <div
        ref={tooltip}
        className="pointer-events-none absolute z-20 hidden -translate-x-1/2 -translate-y-[130%] whitespace-nowrap border border-paper/20 bg-night px-4 py-3 font-mono text-[10px] leading-[1.9] tracking-[0.12em] text-paper/85 opacity-0 transition-opacity duration-200 md:block [&_span]:mb-1 [&_span]:block [&_span]:text-[9px] [&_span]:uppercase [&_span]:tracking-[0.24em] [&_span]:text-gold-3"
      />
    </div>
  );
});

export default PriceChart;
