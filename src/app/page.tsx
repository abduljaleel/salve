import Link from "next/link";
import { appConfig } from "@/lib/config";

export default function LandingPage() {
  const accent = "#e06080";
  const dark = "#0a0608";
  const surface = "#13090d";
  const border = "#2a151c";
  const muted = "#8a6b74";
  const text = "#e8d5db";

  const loopStages = [
    { key: "01", label: "DETECT", detail: "Regression in production traces" },
    { key: "02", label: "IDENTIFY", detail: "Commit a3f4e2 → +12% latency" },
    { key: "03", label: "RESPOND", detail: "Auto-rollback, isolate change" },
    { key: "04", label: "REMEMBER", detail: "Add regression test for pattern" },
  ];

  const timeline = [
    { time: "10:14:02", msg: "Latency spike detected on /api/checkout (p95 880ms → 2,400ms)", tone: "alert" },
    { time: "10:14:15", msg: "Tracing dip to commit a3f4e2 by alice@team", tone: "info" },
    { time: "10:14:18", msg: "Diagnostic: N+1 query introduced in OrderService.fetchItems", tone: "info" },
    { time: "10:14:21", msg: "Rolling back commit on canary cluster", tone: "act" },
    { time: "10:14:32", msg: "p95 restored: 870ms. Filing PR #4823 with fix.", tone: "ok" },
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: dark, color: text }}>
      {/* Nav */}
      <header style={{ borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
            />
            <span className="font-semibold tracking-wide" style={{ color: text }}>
              {appConfig.name}
            </span>
            <span className="text-xs font-mono hidden sm:inline" style={{ color: muted }}>
              salve.dk &middot; Copenhagen
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm transition-colors" style={{ color: muted }}>
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{ border: `1px solid ${accent}`, color: accent }}
            >
              Get access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl w-full px-6 pt-24 pb-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase mb-6" style={{ color: accent }}>
              Infrastructure / Self-healing systems
            </p>
            <h1
              className="text-7xl sm:text-8xl font-normal tracking-tight leading-[0.95]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: text }}
            >
              Salve
            </h1>
            <p className="mt-4 text-sm italic" style={{ color: muted, fontFamily: 'Georgia, serif' }}>
              <em>n.</em> Latin, &ldquo;be well&rdquo; &mdash; also, a healing balm.
            </p>
            <p className="mt-8 text-2xl font-light leading-relaxed" style={{ color: text }}>
              Self-healing infrastructure via commit-level regression tracing.
            </p>
            <p className="mt-5 text-base leading-relaxed" style={{ color: muted }}>
              A bad commit broke prod. Which commit? Nobody knows.
              Salve listens to your traces, isolates the regression at the line of code,
              rolls back the change, and writes the test so it never returns.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full px-7 py-3 text-base font-medium"
                style={{ backgroundColor: accent, color: dark }}
              >
                Connect a repository &rarr;
              </Link>
              <span className="text-xs font-mono" style={{ color: muted }}>
                From Copenhagen &mdash; biotech capital, where biology informs systems.
              </span>
            </div>
          </div>

          {/* Immune system loop SVG */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 420 420" className="w-full max-w-md">
              <defs>
                <marker id="salve-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={accent} />
                </marker>
                <radialGradient id="salve-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="210" cy="210" r="200" fill="url(#salve-glow)" />
              <circle cx="210" cy="210" r="150" fill="none" stroke={border} strokeWidth="1" strokeDasharray="2 4" />

              {/* Arc arrows between nodes */}
              {[0, 1, 2, 3].map((i) => {
                const a1 = (i * 90 - 90) * (Math.PI / 180);
                const a2 = ((i + 1) * 90 - 90) * (Math.PI / 180);
                const x1 = 210 + Math.cos(a1 + 0.35) * 150;
                const y1 = 210 + Math.sin(a1 + 0.35) * 150;
                const x2 = 210 + Math.cos(a2 - 0.35) * 150;
                const y2 = 210 + Math.sin(a2 - 0.35) * 150;
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={accent}
                    strokeWidth="1.2"
                    opacity="0.7"
                    markerEnd="url(#salve-arrow)"
                  />
                );
              })}

              {/* Stage nodes */}
              {loopStages.map((stage, i) => {
                const angle = (i * 90 - 90) * (Math.PI / 180);
                const cx = 210 + Math.cos(angle) * 150;
                const cy = 210 + Math.sin(angle) * 150;
                return (
                  <g key={stage.key}>
                    <circle cx={cx} cy={cy} r="32" fill={surface} stroke={accent} strokeWidth="1.5" />
                    <text
                      x={cx}
                      y={cy - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="ui-monospace, monospace"
                      fill={muted}
                    >
                      {stage.key}
                    </text>
                    <text
                      x={cx}
                      y={cy + 9}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="ui-monospace, monospace"
                      fill={accent}
                    >
                      {stage.label}
                    </text>
                  </g>
                );
              })}

              {/* Centre label */}
              <text
                x="210"
                y="200"
                textAnchor="middle"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                fill={muted}
              >
                IMMUNE LOOP
              </text>
              <text
                x="210"
                y="220"
                textAnchor="middle"
                fontSize="22"
                fontFamily="Georgia, serif"
                fill={text}
              >
                Salve
              </text>
            </svg>
          </div>
        </div>

        {/* Stage descriptions */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loopStages.map((s) => (
            <div
              key={s.key}
              className="rounded-lg p-4"
              style={{ border: `1px solid ${border}`, backgroundColor: surface }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono" style={{ color: muted }}>{s.key}</span>
                <span className="text-sm font-mono font-bold tracking-wider" style={{ color: accent }}>{s.label}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: text }}>{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Incident timeline */}
      <section className="mx-auto max-w-6xl w-full px-6 pb-20">
        <div className="flex items-baseline justify-between mb-5">
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: accent }}>
            Live incident &mdash; Oct 14, 10:14 UTC
          </p>
          <span className="text-xs font-mono" style={{ color: muted }}>
            resolved in 30s
          </span>
        </div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${border}`, backgroundColor: surface }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 text-xs font-mono"
            style={{ borderBottom: `1px solid ${border}`, color: muted, backgroundColor: dark }}
          >
            <span>$ salve watch --service checkout</span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
              streaming
            </span>
          </div>
          <div className="p-5 space-y-2 font-mono text-sm leading-relaxed">
            {timeline.map((line, i) => {
              const colorMap: Record<string, string> = {
                alert: "#ef6b85",
                info: text,
                act: "#f0b070",
                ok: "#7adfa0",
              };
              return (
                <div key={i} className="flex gap-4">
                  <span style={{ color: muted, minWidth: "84px" }}>{line.time}</span>
                  <span style={{ color: colorMap[line.tone] }}>{line.msg}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Mean time to detect", value: "13s" },
            { label: "Mean time to recover", value: "30s" },
            { label: "Outages prevented this quarter", value: "47" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg px-5 py-6"
              style={{ border: `1px solid ${border}`, backgroundColor: surface }}
            >
              <p
                className="text-4xl font-normal"
                style={{ fontFamily: 'Georgia, serif', color: accent }}
              >
                {s.value}
              </p>
              <p className="mt-2 text-xs font-mono tracking-wider uppercase" style={{ color: muted }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl w-full px-6 pb-24 text-center">
        <h2
          className="text-4xl sm:text-5xl font-normal leading-tight"
          style={{ fontFamily: "Georgia, serif", color: text }}
        >
          Give your infrastructure an immune system.
        </h2>
        <p className="mt-5 text-base" style={{ color: muted }}>
          Salve installs in fifteen minutes. The first regression it catches usually pays for the year.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center rounded-full px-8 py-3 text-base font-medium"
            style={{ backgroundColor: accent, color: dark }}
          >
            Connect a repository &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}` }}>
        <div className="mx-auto flex flex-col sm:flex-row gap-3 max-w-6xl items-center justify-between px-6 py-6 text-xs font-mono">
          <span style={{ color: muted }}>
            {appConfig.name} &middot; Copenhagen &middot; &copy; {new Date().getFullYear()}
          </span>
          <a
            href="https://abduljaleel.xyz/aletheia/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors"
            style={{ border: `1px solid ${border}`, color: accent }}
          >
            PART OF THE ALETHEIA STACK &#8599;
          </a>
        </div>
      </footer>
    </div>
  );
}
