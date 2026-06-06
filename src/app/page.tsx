import Link from "next/link";
import { appConfig } from "@/lib/config";

/**
 * SALVE — THE VITAL MONITOR
 * Archetype: clinical patient monitor. Clean clinical white, soft slate text,
 * a rose ECG trace as the signature element, mint/teal for "healthy".
 * Infra health framed as patient vitals; the OPPOSITE of a dark hacker dashboard.
 */
export default function LandingPage() {
  // Clinical palette
  const paper = "#f8fafb"; // clinical near-white
  const card = "#ffffff";
  const ink = "#243038"; // soft slate
  const inkSoft = "#5d6f79";
  const inkFaint = "#93a4ac";
  const line = "#e3eaee";
  const rose = "#e06080"; // the pulse
  const mint = "#34b896"; // healthy
  const amber = "#e0a23a"; // watch

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

  // Vital-sign readouts (one momentarily abnormal → recovering)
  const vitals = [
    { label: "LATENCY p95", value: "870", unit: "ms", state: "NORMAL", color: mint },
    { label: "ERROR RATE", value: "0.2", unit: "%", state: "NORMAL", color: mint },
    { label: "THROUGHPUT", value: "2.4", unit: "k rps", state: "RECOVERING", color: amber },
    { label: "MTTR", value: "30", unit: "s", state: "NORMAL", color: mint },
    { label: "UPTIME", value: "99.99", unit: "%", state: "NORMAL", color: mint },
  ];

  // Patient chart / triage log
  const chart = [
    { t: "10:14:02", k: "FEVER", body: "p95 latency spike 880 → 2,400ms on production-cluster-01", c: rose },
    { t: "10:14:15", k: "TRACE", body: "isolated to commit a3f4e2 — alice@team", c: ink },
    { t: "10:14:18", k: "DX", body: "N+1 query in OrderService.fetchItems", c: ink },
    { t: "10:14:21", k: "RX", body: "rollback initiated on canary cluster", c: amber },
    { t: "10:14:32", k: "WELL", body: "vitals restored · p95 870ms · PR #4823 filed", c: mint },
  ];

  const tiles = [
    { v: "13s", l: "Mean time to detect" },
    { v: "30s", l: "Mean time to recover" },
    { v: "47", l: "Outages prevented this quarter" },
    { v: "0", l: "False rollbacks" },
  ];

  return (
    <div
      className="min-h-screen w-full"
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={rose} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              <div
                className="font-mono text-[11px] tracking-wide"
                style={{ color: inkSoft }}
              >
                Patient: production-cluster-01
                <span className="mx-2" style={{ color: line }}>
                  |
                </span>
                Status:{" "}
                <span style={{ color: mint, fontWeight: 600 }}>● STABLE</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              style={{ color: inkSoft, border: `1px solid ${line}`, backgroundColor: card }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: rose, color: card }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ───────── HERO: vital-signs monitor ───────── */}
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            backgroundColor: card,
            border: `1px solid ${line}`,
            boxShadow: "0 1px 2px rgba(36,48,56,0.04), 0 8px 30px rgba(36,48,56,0.05)",
          }}
        >
          {/* monitor bezel header */}
          <div
            className="flex items-center justify-between px-5 py-2.5"
            style={{ borderBottom: `1px solid ${line}`, backgroundColor: "#fcfdfe" }}
          >
            <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: inkFaint }}>
              VITAL SIGNS · LEAD II · production-cluster-01
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px]" style={{ color: mint }}>
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: mint, animation: "salvePing 1.6s cubic-bezier(0,0,0.2,1) infinite" }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: mint }} />
              </span>
              MONITORING
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.6fr_1fr]">
            {/* ECG trace panel */}
            <div
              className="relative px-2 py-4 sm:px-5"
              style={{ borderRight: `1px solid ${line}` }}
            >
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: "block" }}>
                <defs>
                  {/* faint clinical grid */}
                  <pattern id="ecgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eef3f5" strokeWidth="1" />
                  </pattern>
                  <pattern id="ecgGridBig" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e6edf0" strokeWidth="1.4" />
                  </pattern>
                  <linearGradient id="ecgFade" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={rose} stopOpacity="0.25" />
                    <stop offset="14%" stopColor={rose} stopOpacity="1" />
                    <stop offset="100%" stopColor={rose} stopOpacity="1" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width={W} height={H} fill="url(#ecgGrid)" />
                <rect x="0" y="0" width={W} height={H} fill="url(#ecgGridBig)" />

                {/* the rose ECG trace */}
                <polyline
                  points={ecgPath}
                  fill="none"
                  stroke="url(#ecgFade)"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* marker on the fever beat */}
                <g>
                  <line x1="560" y1="14" x2="560" y2={H - 14} stroke={rose} strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
                  <rect x="500" y="16" width="118" height="18" rx="4" fill="#fdeef2" stroke={rose} strokeWidth="0.8" />
                  <text x="559" y="29" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill={rose}>
                    ▲ fever 10:14:02
                  </text>
                </g>
                {/* current BPM-style readout, sized in HR ~ requests/s feel */}
                <text x="14" y="34" fontFamily="ui-monospace, monospace" fontSize="13" fill={inkFaint} letterSpacing="2">
                  TRACE
                </text>
              </svg>

              <p className="mt-1 px-3 text-sm leading-relaxed sm:px-2" style={{ color: inkSoft }}>
                When production spikes a fever, <span style={{ color: ink, fontWeight: 600 }}>Salve</span> finds the
                cause and heals it.
              </p>
              <p className="mt-1 px-3 text-[13px] sm:px-2" style={{ color: inkFaint }}>
                {appConfig.description}
              </p>
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
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-[3px]"
                      style={{ backgroundColor: v.color }}
                    />
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
                      className="ml-2 rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wider"
                      style={{ color: v.color, backgroundColor: `${v.color}14` }}
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
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
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
              style={{ color: mint, backgroundColor: `${mint}14`, border: `1px solid ${mint}33` }}
            >
              triage resolved · 30s
            </span>
          </div>

          <div
            className="overflow-hidden rounded-2xl"
            style={{ backgroundColor: card, border: `1px solid ${line}` }}
          >
            {/* chart column header */}
            <div
              className="grid grid-cols-[88px_70px_1fr] gap-3 px-5 py-2 font-mono text-[10px] tracking-[0.16em]"
              style={{ color: inkFaint, borderBottom: `1px solid ${line}`, backgroundColor: "#fcfdfe" }}
            >
              <span>TIME</span>
              <span>CODE</span>
              <span>OBSERVATION</span>
            </div>
            {chart.map((row, i) => (
              <div
                key={row.t}
                className="grid grid-cols-[88px_70px_1fr] items-center gap-3 px-5 py-3"
                style={{
                  borderTop: i === 0 ? "none" : `1px solid ${line}`,
                  backgroundColor: row.k === "FEVER" ? "#fef6f8" : row.k === "WELL" ? "#f1fbf7" : card,
                }}
              >
                <span className="font-mono text-[12px] tabular-nums" style={{ color: inkSoft }}>
                  {row.t}
                </span>
                <span
                  className="inline-flex w-fit items-center rounded px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider"
                  style={{ color: row.c, backgroundColor: `${row.c}14` }}
                >
                  {row.k}
                </span>
                <span className="text-sm" style={{ color: ink }}>
                  {row.body}
                </span>
              </div>
            ))}
            {/* heal flatline → restored beat footer */}
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${line}`, backgroundColor: "#fcfdfe" }}>
              <svg viewBox="0 0 600 40" className="h-8 w-full" preserveAspectRatio="none">
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
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div
              key={t.l}
              className="rounded-2xl px-5 py-6"
              style={{ backgroundColor: card, border: `1px solid ${line}` }}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="font-mono text-4xl tabular-nums"
                  style={{ color: rose, fontVariantNumeric: "tabular-nums" }}
                >
                  {t.v}
                </span>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mint }} />
              </div>
              <p className="mt-2 text-[13px]" style={{ color: inkSoft }}>
                {t.l}
              </p>
            </div>
          ))}
        </section>

        {/* prescription strip / CTA */}
        <section
          className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl px-7 py-7 sm:flex-row sm:items-center"
          style={{
            backgroundColor: card,
            border: `1px solid ${line}`,
            backgroundImage:
              "linear-gradient(to right, rgba(224,96,128,0.05), rgba(52,184,150,0.05))",
          }}
        >
          <div>
            <p className="text-xl font-semibold" style={{ color: ink }}>
              Give your infrastructure an immune system.
            </p>
            <p className="mt-1 text-sm" style={{ color: inkSoft }}>
              Salve installs in fifteen minutes. The first regression it catches usually pays for the year.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            style={{ backgroundColor: rose, color: card }}
          >
            Connect a repository →
          </Link>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer style={{ borderTop: `1px solid ${line}`, backgroundColor: card }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <span className="flex items-center gap-2 font-mono text-[11px]" style={{ color: inkSoft }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={rose} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l2-4 3 8 2-4h6" />
            </svg>
            {appConfig.name} · Copenhagen
          </span>
          <a
            href="https://abduljaleel.xyz/aletheia/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors"
            style={{ color: inkSoft, border: `1px solid ${line}` }}
          >
            Part of the Aletheia stack ↗
          </a>
        </div>
      </footer>

      {/* keyframes (inline, no extra files) */}
      <style>{`
        @keyframes salvePing {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
