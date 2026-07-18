import Link from "next/link";
import { appConfig } from "@/lib/config";

/**
 * SALVE — THE VITAL MONITOR
 * Archetype: clinical patient monitor. Clean clinical white, soft slate text,
 * a rose ECG trace as the signature element, mint/teal for "healthy".
 * Infra health framed as patient vitals; the OPPOSITE of a dark hacker dashboard.
 */

// Clinical palette
const paper = "#f8fafb"; // clinical near-white
const card = "#ffffff";
const ink = "#243038"; // soft slate
const inkSoft = "#5d6f79"; // body copy (≥4.5:1 on white)
const inkFaint = "#6e7f89"; // faint labels, darkened for legibility
const line = "#e3eaee";
const rose = "#e06080"; // the pulse / brand
const mint = "#34b896"; // healthy
const amber = "#e0a23a"; // watch
// Ink-grade variants for text-on-tint pills (dots/fills keep the bright hue).
const roseInk = "#b8385f";
const mintInk = "#1b7a60";
const amberInk = "#996712";

// --- Build a deterministic ECG polyline (classic PQRST + one fever spike) ---
// Baseline runs left→right; we stamp heartbeat complexes at regular intervals.
const W = 1000;
const H = 220;
const mid = 128;
// A single normalized PQRST complex sampled as [dx, y] offsets from baseline.
const beat: Array<[number, number]> = [
  [0, 0],
  [10, 0],
  [16, -10], // P wave
  [22, 0],
  [30, 0],
  [34, 12], // Q dip
  [38, -78], // R spike
  [42, 26], // S
  [48, 0],
  [58, -22], // T wave
  [66, -4],
  [74, 0],
  [96, 0], // baseline rest
];
// Stamp beats across the width; beat index 5 is the abnormal "fever" complex (taller R).
const pts: Array<[number, number]> = [];
let cursor = 0;
let beatNo = 0;
pts.push([0, mid]);
while (cursor < W - 60) {
  const feverish = beatNo === 5;
  const amp = feverish ? 1.5 : 1;
  for (const [dx, dy] of beat) {
    pts.push([cursor + dx, mid + dy * amp]);
  }
  cursor += 96;
  beatNo += 1;
}
pts.push([W, mid]);
const ecgPath = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/**
 * The signature ECG monitor. Drawn once in the 0..W × 0..H coordinate space and
 * windowed by whatever viewBox is passed, so the mobile crop and the desktop
 * full-width trace share the exact same geometry and animation.
 * `idp` namespaces the gradient/pattern ids so two instances never collide.
 */
function EcgTrace({ view, idp, className }: { view: string; idp: string; className?: string }) {
  return (
    <svg
      viewBox={view}
      className={className}
      role="img"
      aria-labelledby={`${idp}-title`}
      style={{ width: "100%" }}
    >
      <title id={`${idp}-title`}>
        Electrocardiogram of production-cluster-01: a fever spike at 10:14:02, then a return to a
        healthy rhythm.
      </title>
      <defs>
        <pattern id={`${idp}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eef3f5" strokeWidth="1" />
        </pattern>
        <pattern id={`${idp}-gridBig`} width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e6edf0" strokeWidth="1.4" />
        </pattern>
        <linearGradient id={`${idp}-fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={rose} stopOpacity="0.25" />
          <stop offset="14%" stopColor={rose} stopOpacity="1" />
          <stop offset="100%" stopColor={rose} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`${idp}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill={`url(#${idp}-grid)`} />
      <rect x="0" y="0" width={W} height={H} fill={`url(#${idp}-gridBig)`} />

      {/* the rose ECG trace (draws left→right on load) */}
      <polyline
        className="ecg-trace"
        pathLength={1}
        points={ecgPath}
        fill="none"
        stroke={`url(#${idp}-fade)`}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* bedside-monitor refresh sweep */}
      <g className="ecg-sweep" aria-hidden="true">
        <rect x="0" y="0" width="150" height={H} fill={`url(#${idp}-sweep)`} />
      </g>

      {/* marker on the fever beat (fades in as the sweep passes) */}
      <g className="ecg-fever" aria-hidden="true">
        <line
          x1="518"
          y1="6"
          x2="518"
          y2={H - 12}
          stroke={rose}
          strokeWidth="1.2"
          strokeDasharray="3 4"
          opacity="0.5"
        />
        <rect x="530" y="6" width="152" height="24" rx="5" fill="#fdeef2" stroke={rose} strokeWidth="1" />
        <text
          x="606"
          y="23"
          textAnchor="middle"
          fontFamily="ui-monospace, monospace"
          fontSize="14"
          fill={roseInk}
        >
          ▲ fever 10:14:02
        </text>
      </g>

      <text
        x="14"
        y="34"
        fontFamily="ui-monospace, monospace"
        fontSize="13"
        fill={inkFaint}
        letterSpacing="2"
      >
        TRACE
      </text>
    </svg>
  );
}

export default function LandingPage() {
  // Vital-sign readouts (one momentarily abnormal → recovering)
  const vitals = [
    { label: "LATENCY p95", value: "870", unit: "ms", state: "NORMAL", color: mint, fg: mintInk },
    { label: "ERROR RATE", value: "0.2", unit: "%", state: "NORMAL", color: mint, fg: mintInk },
    { label: "THROUGHPUT", value: "2.4", unit: "k rps", state: "RECOVERING", color: amber, fg: amberInk },
    { label: "MTTR", value: "30", unit: "s", state: "NORMAL", color: mint, fg: mintInk },
    { label: "UPTIME", value: "99.99", unit: "%", state: "NORMAL", color: mint, fg: mintInk },
  ];

  // Patient chart / triage log (fill hue `c`, text ink `fg`)
  const chart = [
    { t: "10:14:02", k: "FEVER", body: "p95 latency spike 880 → 2,400ms on production-cluster-01", c: rose, fg: roseInk, kind: "fever" },
    { t: "10:14:15", k: "TRACE", body: "isolated to commit a3f4e2 — alice@team", c: ink, fg: ink, kind: "plain" },
    { t: "10:14:18", k: "DX", body: "N+1 query in OrderService.fetchItems", c: ink, fg: ink, kind: "plain" },
    { t: "10:14:21", k: "RX", body: "rollback initiated on canary cluster", c: amber, fg: amberInk, kind: "plain" },
    { t: "10:14:32", k: "WELL", body: "vitals restored · p95 870ms · PR #4823 filed", c: mint, fg: mintInk, kind: "well" },
  ];

  const tiles = [
    { v: "13s", l: "Mean time to detect" },
    { v: "30s", l: "Mean time to recover" },
    { v: "47", l: "Outages prevented this quarter" },
    { v: "0", l: "False rollbacks" },
  ];

  return (
    <div
      className="salve-landing min-h-screen w-full"
      style={{
        backgroundColor: paper,
        color: ink,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* ───────── Clinical chart header ───────── */}
      <header style={{ borderBottom: `1px solid ${line}`, backgroundColor: card }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* heartbeat-cross glyph */}
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: "#fdeef2", border: `1px solid ${line}` }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={rose} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12h4l2-5 3 10 2.5-7 1.5 2H22" />
              </svg>
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-[0.18em]" style={{ color: ink }}>
                  {appConfig.name.toUpperCase()}
                </span>
                <span className="text-xs" style={{ color: inkFaint }}>
                  Copenhagen
                </span>
              </div>
              <div className="font-mono text-[11px] tracking-wide" style={{ color: inkSoft }}>
                Patient: production-cluster-01
                <span className="mx-2" style={{ color: line }}>
                  |
                </span>
                <span className="whitespace-nowrap">
                  Status:{" "}
                  <span style={{ color: mintInk, fontWeight: 600 }}>
                    <span style={{ color: mint }}>●</span> STABLE
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="salve-signin inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium"
              style={{ color: inkSoft, border: `1px solid ${line}`, backgroundColor: card }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="salve-cta inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ───────── HERO ───────── */}
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:pt-12">
        {/* headline band — the claim leads, the monitor proves */}
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.24em]" style={{ color: inkFaint }}>
            ADMISSION · PRODUCTION-CLUSTER-01
          </p>
          <h1
            className="mt-3 text-[2.5rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.25rem]"
            style={{ color: ink }}
          >
            When production spikes a <span style={{ color: rose }}>fever</span>,{" "}
            <span style={{ fontWeight: 700 }}>Salve</span> finds the cause and{" "}
            <span style={{ color: mint }}>heals</span> it.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: inkSoft }}>
            {appConfig.description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="salve-cta inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
            >
              Connect a repository <span className="salve-arrow" aria-hidden="true">→</span>
            </Link>
            <a
              href="#chart"
              className="salve-ghost inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
              style={{ color: inkSoft, border: `1px solid ${line}`, backgroundColor: card }}
            >
              Watch an episode
            </a>
          </div>
        </div>

        {/* ───────── vital-signs monitor (the evidence) ───────── */}
        <div
          className="mt-10 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: card,
            border: `1px solid ${line}`,
            boxShadow: "0 1px 2px rgba(36,48,56,0.04), 0 8px 30px rgba(36,48,56,0.05)",
          }}
        >
          {/* monitor bezel header */}
          <div
            className="flex items-center justify-between gap-3 px-5 py-2.5"
            style={{ borderBottom: `1px solid ${line}`, backgroundColor: "#fcfdfe" }}
          >
            <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: inkFaint }}>
              VITAL SIGNS · LEAD II · production-cluster-01
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px]" style={{ color: mintInk }}>
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span
                  className="salve-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: mint }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: mint }} />
              </span>
              MONITORING
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.6fr_1fr]">
            {/* ECG trace panel */}
            <div className="relative px-5 py-4" style={{ borderRight: `1px solid ${line}` }}>
              <EcgTrace view={`0 0 ${W} ${H}`} idp="ecgd" className="hidden sm:block" />
              <EcgTrace view="360 5 420 210" idp="ecgm" className="block sm:hidden" />
            </div>

            {/* vital readouts */}
            <div className="divide-y" style={{ borderColor: line }}>
              {vitals.map((v) => (
                <div
                  key={v.label}
                  className="flex items-center justify-between px-5 py-[14px]"
                  style={{ borderColor: line }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: v.color }} />
                    <span className="font-mono text-[11px] tracking-[0.12em]" style={{ color: inkSoft }}>
                      {v.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-mono text-2xl tabular-nums"
                      style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
                    >
                      {v.value}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: inkFaint }}>
                      {v.unit}
                    </span>
                    <span
                      className="ml-2 rounded px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-wider"
                      style={{ color: v.fg, backgroundColor: `${v.color}1f` }}
                    >
                      {v.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ───────── Diagnosis → Treatment patient chart ───────── */}
        <section id="chart" className="mt-16 scroll-mt-8 sm:mt-24">
          <p className="mb-2 font-mono text-[11px] tracking-[0.24em]" style={{ color: inkFaint }}>
            CHART · EPISODE #4823
          </p>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: ink }}>
                Patient chart — episode #4823
              </h2>
              <p className="text-sm" style={{ color: inkSoft }}>
                Diagnosis to treatment, recorded to the second.
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 font-mono text-[11px]"
              style={{ color: mintInk, backgroundColor: `${mint}14`, border: `1px solid ${mint}33` }}
            >
              triage resolved · 30s
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: card, border: `1px solid ${line}` }}>
            {/* chart column header (desktop only) */}
            <div
              className="hidden grid-cols-[88px_72px_1fr] gap-3 px-5 py-2 font-mono text-[11px] tracking-[0.16em] sm:grid"
              style={{ color: inkFaint, borderBottom: `1px solid ${line}`, backgroundColor: "#fcfdfe" }}
            >
              <span>TIME</span>
              <span>CODE</span>
              <span>OBSERVATION</span>
            </div>
            {chart.map((row, i) => (
              <div
                key={row.t}
                className={`salve-row salve-row--${row.kind} px-4 py-3 sm:px-5`}
                style={{ borderTop: i === 0 ? "none" : `1px solid ${line}` }}
              >
                <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-[88px_72px_1fr] sm:items-center sm:gap-3">
                  {/* mobile: code + time on one line */}
                  <div className="flex items-center gap-3 sm:hidden">
                    <span
                      className="inline-flex w-fit items-center rounded px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider"
                      style={{ color: row.fg, backgroundColor: `${row.c}1f` }}
                    >
                      {row.k}
                    </span>
                    <span className="font-mono text-[12px] tabular-nums" style={{ color: inkSoft }}>
                      {row.t}
                    </span>
                  </div>
                  {/* desktop cells */}
                  <span className="hidden font-mono text-[12px] tabular-nums sm:block" style={{ color: inkSoft }}>
                    {row.t}
                  </span>
                  <span
                    className="hidden w-fit items-center rounded px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider sm:inline-flex"
                    style={{ color: row.fg, backgroundColor: `${row.c}1f` }}
                  >
                    {row.k}
                  </span>
                  {/* observation (wraps on every size) */}
                  <span className="text-sm break-words [overflow-wrap:anywhere]" style={{ color: ink }}>
                    {row.body}
                  </span>
                </div>
              </div>
            ))}
            {/* heal flatline → restored beat footer (true PQRST proportions) */}
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${line}`, backgroundColor: "#fcfdfe" }}>
              <svg viewBox="0 0 600 40" className="mx-auto block h-8 w-full max-w-[600px]" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <polyline
                  points="0,20 200,20 215,20 222,8 230,32 238,20 420,20 435,20 442,6 450,34 458,20 600,20"
                  fill="none"
                  stroke={mint}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* ───────── Vital tiles ───────── */}
        <section className="mt-16 sm:mt-24">
          <p className="mb-4 font-mono text-[11px] tracking-[0.24em]" style={{ color: inkFaint }}>
            OUTCOMES · LAST QUARTER
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((t) => (
              <div
                key={t.l}
                className="salve-tile rounded-2xl px-5 py-6"
                style={{ backgroundColor: card, border: `1px solid ${line}` }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-4xl tabular-nums" style={{ color: rose, fontVariantNumeric: "tabular-nums" }}>
                    {t.v}
                  </span>
                  {/* mini flatline→beat, so "13s" never reads as "13s." */}
                  <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true" style={{ overflow: "visible" }}>
                    <polyline
                      points="0,6 9,6 11,2 13,10 15,6 26,6"
                      fill="none"
                      stroke={mint}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-[13px]" style={{ color: inkSoft }}>
                  {t.l}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── prescription strip / CTA ───────── */}
        <section
          className="mt-16 flex flex-col items-start justify-between gap-5 rounded-2xl px-7 py-7 sm:mt-24 sm:flex-row sm:items-center"
          style={{
            backgroundColor: card,
            border: `1px solid ${line}`,
            backgroundImage: "linear-gradient(to right, rgba(224,96,128,0.05), rgba(52,184,150,0.05))",
          }}
        >
          <div>
            <h2 className="text-xl font-semibold" style={{ color: ink }}>
              Give your infrastructure an immune system.
            </h2>
            <p className="mt-1 text-sm" style={{ color: inkSoft }}>
              Salve installs in fifteen minutes. The first regression it catches usually pays for the year.
            </p>
          </div>
          <Link
            href="/signup"
            className="salve-cta inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-full px-6 text-sm font-semibold"
          >
            Connect a repository <span className="salve-arrow" aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer style={{ borderTop: `1px solid ${line}`, backgroundColor: card }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <span className="flex items-center gap-2 font-mono text-[11px]" style={{ color: inkSoft }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={rose} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12h4l2-4 3 8 2-4h6" />
            </svg>
            {appConfig.name} · Copenhagen
          </span>
          <a
            href="https://abduljaleel.xyz/aletheia/"
            target="_blank"
            rel="noreferrer"
            className="salve-aletheia rounded-full px-3 py-1.5 font-mono text-[11px]"
            style={{ color: inkSoft, border: `1px solid ${line}` }}
          >
            Part of the Aletheia stack ↗
          </a>
        </div>
      </footer>

      {/* keyframes + interaction states (inline, no extra files; template-literal child) */}
      <style>{`
        .salve-landing a:focus-visible,
        .salve-landing button:focus-visible {
          outline: 2px solid ${rose};
          outline-offset: 2px;
          border-radius: 10px;
        }
        .salve-landing .salve-cta {
          background-color: ${rose};
          color: ${card};
          transition: background-color .2s ease, transform .2s ease, box-shadow .2s ease;
        }
        .salve-landing .salve-arrow { display: inline-block; transition: transform .2s ease; }
        .salve-landing .salve-signin { transition: color .2s ease, border-color .2s ease, background-color .2s ease; }
        .salve-landing .salve-ghost { transition: color .2s ease, border-color .2s ease, background-color .2s ease; }
        .salve-landing .salve-aletheia { transition: color .2s ease, border-color .2s ease; }
        .salve-landing .salve-row { transition: background-color .15s ease; }
        .salve-landing .salve-row--plain { background-color: ${card}; }
        .salve-landing .salve-row--fever { background-color: #fef6f8; }
        .salve-landing .salve-row--well { background-color: #f1fbf7; }
        .salve-landing .salve-tile { transition: transform .2s ease, box-shadow .2s ease; }
        .salve-landing .ecg-sweep { opacity: 0; }
        @media (hover: hover) {
          .salve-landing .salve-cta:hover { background-color: #c84a6c; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(200,74,108,0.28); }
          .salve-landing .salve-cta:hover .salve-arrow { transform: translateX(3px); }
          .salve-landing .salve-signin:hover { color: ${ink}; border-color: #c6d2d8; background-color: ${card}; }
          .salve-landing .salve-ghost:hover { color: ${ink}; border-color: #c6d2d8; background-color: ${paper}; }
          .salve-landing .salve-aletheia:hover { color: ${ink}; border-color: #c6d2d8; }
          .salve-landing .salve-row--plain:hover { background-color: #f6f9fa; }
          .salve-landing .salve-row--fever:hover { background-color: #fdeef2; }
          .salve-landing .salve-row--well:hover { background-color: #e9f7f1; }
          .salve-landing .salve-tile:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(36,48,56,0.07); }
        }
        @keyframes salveDraw { to { stroke-dashoffset: 0; } }
        @keyframes salveSweep { from { transform: translateX(-180px); } to { transform: translateX(1180px); } }
        @keyframes salveFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes salvePing { 75%, 100% { transform: scale(2.2); opacity: 0; } }
        @media (prefers-reduced-motion: no-preference) {
          html { scroll-behavior: smooth; }
          .salve-landing .ecg-trace {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            animation: salveDraw 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .salve-landing .ecg-sweep { opacity: 1; animation: salveSweep 3.6s linear infinite; }
          .salve-landing .ecg-fever { opacity: 0; animation: salveFadeIn 0.5s ease-out 1.9s forwards; }
          .salve-landing .salve-ping { animation: salvePing 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; }
        }
      `}</style>
    </div>
  );
}
