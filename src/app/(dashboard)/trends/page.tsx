"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getEnergyColor,
  type DailyLog,
  type DimensionTrend,
  type Insight,
} from "@/lib/data/energy";
import { deriveDimensionScores, listDailyLogs } from "@/lib/data/api";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Info,
  Loader2,
  LineChart,
} from "lucide-react";

function BarChart({
  data,
  height = 120,
}: {
  data: { date: string; score: number }[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.score));
  const min = Math.min(...data.map((d) => d.score));
  const range = max - min || 1;

  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d, i) => {
          const h = ((d.score - min + 10) / (range + 10)) * 100;
          const color = getEnergyColor(d.score);
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm min-w-[6px] transition-all hover:opacity-80"
              style={{
                height: `${Math.max(5, h)}%`,
                backgroundColor: color,
              }}
              title={`${d.date}: ${d.score}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function DimensionTrendChart({
  trends,
  dimension,
  color,
  label,
}: {
  trends: DimensionTrend[];
  dimension: keyof DimensionTrend;
  color: string;
  label: string;
}) {
  const data = trends.map((t) => ({
    date: t.date,
    score: t[dimension] as number,
  }));
  const avg = Math.round(
    data.reduce((sum, d) => sum + d.score, 0) / (data.length || 1)
  );
  const recent = data.slice(-7);
  const recentAvg = Math.round(
    recent.reduce((sum, d) => sum + d.score, 0) / (recent.length || 1)
  );
  const older = data.slice(0, 7);
  const olderAvg = Math.round(
    older.reduce((sum, d) => sum + d.score, 0) / (older.length || 1)
  );
  const trending = recentAvg > olderAvg ? "up" : recentAvg < olderAvg ? "down" : "stable";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium" style={{ color }}>
            {label}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold">{avg}</span>
            {trending === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trending === "down" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-[2px] h-12">
          {data.map((d, i) => {
            const h = ((d.score - 20) / 80) * 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm min-w-[3px]"
                style={{
                  height: `${Math.max(5, h)}%`,
                  backgroundColor: color,
                  opacity: 0.3 + (i / data.length) * 0.7,
                }}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightIcon({ type }: { type: "positive" | "neutral" | "warning" }) {
  if (type === "positive")
    return <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />;
  if (type === "warning")
    return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function avg(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

/** Computes real correlations and patterns from the logged data. */
function computeInsights(logs: DailyLog[]): Insight[] {
  const insights: Insight[] = [];

  // Sleep vs energy
  const goodSleep = logs.filter((l) => l.sleepHours >= 7).map((l) => l.energyScore);
  const poorSleep = logs.filter((l) => l.sleepHours < 7).map((l) => l.energyScore);
  if (goodSleep.length >= 3 && poorSleep.length >= 3) {
    const lift = Math.round(((avg(goodSleep) - avg(poorSleep)) / (avg(poorSleep) || 1)) * 100);
    if (lift >= 3) {
      insights.push({
        text: `Your energy is ${lift}% higher on days with 7+ hours of sleep`,
        type: "positive",
      });
    } else if (lift <= -3) {
      insights.push({
        text: `Your energy runs ${Math.abs(lift)}% lower even with 7+ hours of sleep — quality may matter more than quantity`,
        type: "warning",
      });
    }
  }

  // Weekday patterns
  const byWeekday = new Map<number, number[]>();
  for (const log of logs) {
    const day = new Date(`${log.date}T12:00:00`).getDay();
    byWeekday.set(day, [...(byWeekday.get(day) ?? []), log.energyScore]);
  }
  const weekdayAvgs = Array.from(byWeekday.entries())
    .filter(([, scores]) => scores.length >= 2)
    .map(([day, scores]) => ({ day, avg: avg(scores) }));
  if (weekdayAvgs.length >= 4) {
    const lowest = weekdayAvgs.reduce((a, b) => (a.avg < b.avg ? a : b));
    const highest = weekdayAvgs.reduce((a, b) => (a.avg > b.avg ? a : b));
    insights.push({
      text: `${WEEKDAY_NAMES[lowest.day]} is consistently your lowest energy day`,
      type: "warning",
    });
    insights.push({
      text: `${WEEKDAY_NAMES[highest.day]} is your strongest day, averaging ${Math.round(highest.avg)} energy`,
      type: "positive",
    });
  }

  // Exercise vs energy
  const activeDays = logs.filter((l) => l.exerciseMinutes >= 30).map((l) => l.energyScore);
  const restDays = logs.filter((l) => l.exerciseMinutes < 30).map((l) => l.energyScore);
  if (activeDays.length >= 3 && restDays.length >= 3) {
    const delta = Math.round(avg(activeDays) - avg(restDays));
    if (delta > 0) {
      insights.push({
        text: `Days with 30+ min of exercise correlate with +${delta} energy points`,
        type: "positive",
      });
    } else if (delta < 0) {
      insights.push({
        text: `Your energy dips ${Math.abs(delta)} points on heavy exercise days — watch your recovery`,
        type: "warning",
      });
    }
  }

  // Focus vs stress
  const heavyFocus = logs.filter((l) => l.focusHours > 5).map((l) => l.stressLevel);
  const lightFocus = logs.filter((l) => l.focusHours <= 5).map((l) => l.stressLevel);
  if (heavyFocus.length >= 3 && lightFocus.length >= 3 && avg(heavyFocus) - avg(lightFocus) >= 0.5) {
    insights.push({
      text: "Stress levels peak when focus hours exceed 5 per day",
      type: "warning",
    });
  }

  if (insights.length === 0) {
    insights.push({
      text: "Keep logging daily — insights unlock as your history grows",
      type: "neutral",
    });
  }
  return insights;
}

export default function TrendsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const fetched = await listDailyLogs(30);
        if (!cancelled) setLogs(fetched);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load trends");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const trends: DimensionTrend[] = useMemo(
    () =>
      logs.map((log) => ({
        date: log.date,
        ...deriveDimensionScores(log),
      })),
    [logs]
  );

  const energyData = logs.map((l) => ({
    date: l.date,
    score: l.energyScore,
  }));

  // Weekly averages
  const weeklyAvgs = useMemo(() => {
    const weeks: { label: string; avg: number }[] = [];
    for (let i = 0; i < logs.length; i += 7) {
      const chunk = logs.slice(i, i + 7);
      const weekAvg = Math.round(
        chunk.reduce((s, l) => s + l.energyScore, 0) / chunk.length
      );
      const start = chunk[0].date.slice(5);
      weeks.push({ label: `Week of ${start}`, avg: weekAvg });
    }
    return weeks;
  }, [logs]);

  const insights = useMemo(() => computeInsights(logs), [logs]);

  // Monthly average
  const monthlyAvg = logs.length
    ? Math.round(logs.reduce((s, l) => s + l.energyScore, 0) / logs.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
          <p className="text-muted-foreground">
            Your energy patterns and performance insights
          </p>
        </div>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Loading trends…</span>
        </div>
      </div>
    );
  }

  if (!error && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
          <p className="text-muted-foreground">
            Your energy patterns and performance insights
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <LineChart className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold">No data yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Log your days to see energy trends, dimension patterns, and personalized insights.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
        <p className="text-muted-foreground">
          Your energy patterns and performance insights
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 30-day Energy Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">30-Day Energy Trend</CardTitle>
          <CardDescription>
            Monthly average:{" "}
            <span className="font-bold text-foreground">{monthlyAvg}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={energyData} height={140} />
        </CardContent>
      </Card>

      {/* Dimension Trends */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Dimension Trends</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DimensionTrendChart
            trends={trends}
            dimension="physical"
            color="#22c55e"
            label="Physical"
          />
          <DimensionTrendChart
            trends={trends}
            dimension="mental"
            color="#3b82f6"
            label="Mental"
          />
          <DimensionTrendChart
            trends={trends}
            dimension="emotional"
            color="#f59e0b"
            label="Emotional"
          />
          <DimensionTrendChart
            trends={trends}
            dimension="social"
            color="#a855f7"
            label="Social"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Correlations &amp; Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <InsightIcon type={insight.type} />
                <span className="text-sm">{insight.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Averages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyAvgs.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[120px]">
                  {w.label}
                </span>
                <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${w.avg}%`,
                      backgroundColor: getEnergyColor(w.avg),
                    }}
                  />
                </div>
                <span className="text-sm font-bold min-w-[30px] text-right">
                  {w.avg}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
