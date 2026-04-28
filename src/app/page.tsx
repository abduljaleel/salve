import Link from "next/link";
import { appConfig } from "@/lib/config";

export default function LandingPage() {
  // 30-day trend data
  const trendData = [
    68, 72, 65, 74, 78, 71, 69, 80, 82, 76,
    73, 70, 85, 88, 79, 74, 71, 68, 72, 77,
    81, 84, 76, 73, 92, 78, 80, 83, 74, 79,
  ];

  const bestDay = Math.max(...trendData);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Minimal Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">{appConfig.name}</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — The Pulse */}
      <section className="flex flex-col items-center justify-center pt-32 pb-20 px-6">
        {/* Pulsing circle */}
        <div className="relative flex items-center justify-center" style={{ width: '60vw', height: '60vw', maxWidth: '520px', maxHeight: '520px' }}>
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full"
            style={{
              animation: 'pulse-breathe 3s ease-in-out infinite',
            }}
          >
            <circle cx="200" cy="200" r="195" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.3" />
            <circle cx="200" cy="200" r="185" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.15" />
            <circle cx="200" cy="200" r="198" fill="#fff7ed" fillOpacity="0.5" stroke="#f97316" strokeWidth="3" />
          </svg>
          <div className="relative flex flex-col items-center justify-center z-10">
            <span className="text-9xl font-extralight tracking-tighter text-gray-900" style={{ lineHeight: '1' }}>74</span>
            <span className="text-2xl font-light text-gray-400 mt-2">/100</span>
          </div>
        </div>

        <p className="mt-8 text-xl text-gray-600 font-light tracking-wide">Your energy score right now.</p>
        <p className="mt-3 text-base text-gray-400 tracking-wide">Measure it. Optimize it. Protect it.</p>
      </section>

      {/* Four Quadrant Display */}
      <section className="mx-auto max-w-2xl w-full px-6 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Physical", score: 82, color: "#22c55e", bgColor: "#f0fdf4" },
            { label: "Mental", score: 68, color: "#3b82f6", bgColor: "#eff6ff" },
            { label: "Emotional", score: 71, color: "#eab308", bgColor: "#fefce8" },
            { label: "Social", score: 76, color: "#a855f7", bgColor: "#faf5ff" },
          ].map((q) => (
            <div
              key={q.label}
              className="rounded-xl p-6 relative overflow-hidden"
              style={{
                backgroundColor: q.bgColor,
                borderLeft: `4px solid ${q.color}`,
              }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: q.color }}>{q.label}</p>
              <p className="text-4xl font-extralight text-gray-900 mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{q.score}</p>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-gray-200/60">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${q.score}%`,
                    backgroundColor: q.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Protocol */}
      <section className="mx-auto max-w-2xl w-full px-6 pb-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Today&apos;s Protocol</p>
        <div className="rounded-2xl bg-gray-50 p-6 space-y-0">
          {[
            { done: true, text: "Wake by 6:30 AM", streak: "streak: 12 days" },
            { done: true, text: "10 min meditation", streak: null },
            { done: false, text: "Cold shower", streak: null },
            { done: true, text: "Journal 3 gratitudes", streak: null },
            { done: false, text: "30 min exercise", streak: null },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3.5"
              style={{ borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}
            >
              <span className="text-lg" style={{ fontFamily: 'system-ui', width: '24px', textAlign: 'center' }}>
                {item.done ? (
                  <span className="text-green-500">&#9745;</span>
                ) : (
                  <span className="text-gray-300">&#9744;</span>
                )}
              </span>
              <span className={`text-base ${item.done ? 'text-gray-700' : 'text-gray-400'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {item.text}
              </span>
              {item.streak && (
                <span className="ml-auto text-xs text-orange-500 font-medium bg-orange-50 px-2.5 py-1 rounded-full">
                  {item.streak}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 30-Day Trend */}
      <section className="mx-auto max-w-2xl w-full px-6 pb-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">30-Day Trend</p>
        <div className="rounded-2xl bg-gray-50 p-6">
          <div className="flex items-end gap-1 h-24">
            {trendData.map((score, i) => {
              const height = (score / 100) * 100;
              let color = "#ef4444"; // red < 50
              if (score >= 70) color = "#22c55e"; // green
              else if (score >= 50) color = "#eab308"; // yellow
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: color,
                    opacity: 0.8,
                    minWidth: '4px',
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>Your best day: <span className="font-semibold text-gray-700">{bestDay}</span></span>
            <span>Your trend: <span className="font-semibold text-green-600">&#8593; improving</span></span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center pb-24 px-6">
        <Link
          href="/signup"
          className="inline-flex items-center rounded-full bg-orange-500 px-10 py-4 text-lg font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          Start your diagnostic &rarr;
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} {appConfig.name}</span>
          <span>A 12 Cities venture</span>
        </div>
      </footer>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
