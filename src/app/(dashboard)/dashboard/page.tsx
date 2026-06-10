"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEnergyColor, type DailyLog, type Dimension, type DimensionScore } from "@/lib/data/energy";
import {
  deriveDimensionScores,
  listDailyLogs,
  listEnergyProfiles,
  listProtocols,
  seedDemoData,
  toDateStr,
  toggleHabitCompletion,
  type ApiProtocol,
  type EnergyProfile,
} from "@/lib/data/api";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
} from "lucide-react";

function EnergyCircle({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getEnergyColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/40"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 100 100)"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-sm text-muted-foreground font-medium">Energy Score</span>
      </div>
    </div>
  );
}

function TrendArrow({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function Sparkline({ data }: { data: { date: string; score: number }[] }) {
  const max = Math.max(...data.map((d) => d.score));
  const min = Math.min(...data.map((d) => d.score));
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((d, i) => {
        const height = ((d.score - min) / range) * 100;
        const color = getEnergyColor(d.score);
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm min-w-[4px] transition-all"
            style={{
              height: `${Math.max(8, height)}%`,
              backgroundColor: color,
              opacity: i === data.length - 1 ? 1 : 0.6,
            }}
            title={`${d.date}: ${d.score}`}
          />
        );
      })}
    </div>
  );
}

const DIMENSION_META: Record<Dimension, { label: string; color: string; bgColor: string }> = {
  physical: { label: "Physical", color: "#22c55e", bgColor: "#f0fdf4" },
  mental: { label: "Mental", color: "#3b82f6", bgColor: "#eff6ff" },
  emotional: { label: "Emotional", color: "#f59e0b", bgColor: "#fffbeb" },
  social: { label: "Social", color: "#a855f7", bgColor: "#faf5ff" },
};
const DIMENSIONS: Dimension[] = ["physical", "mental", "emotional", "social"];

function averageDimensions(logs: DailyLog[]): Record<Dimension, number> {
  const totals: Record<Dimension, number> = { physical: 0, mental: 0, emotional: 0, social: 0 };
  if (logs.length === 0) return totals;
  for (const log of logs) {
    const derived = deriveDimensionScores(log);
    for (const dim of DIMENSIONS) totals[dim] += derived[dim];
  }
  for (const dim of DIMENSIONS) totals[dim] = Math.round(totals[dim] / logs.length);
  return totals;
}

function buildDimensionScores(
  profiles: EnergyProfile[],
  logs: DailyLog[]
): DimensionScore[] {
  const recent = averageDimensions(logs.slice(-7));
  const prior = averageDimensions(logs.slice(-14, -7));
  const hasLogs = logs.length > 0;
  const base = profiles[0]?.baselineScores ?? (hasLogs ? recent : null);

  return DIMENSIONS.map((dim) => {
    const score = base ? base[dim] : 0;
    let trend: DimensionScore["trend"] = "stable";
    if (profiles.length >= 2) {
      const prev = profiles[1].baselineScores[dim];
      trend = score > prev ? "up" : score < prev ? "down" : "stable";
    } else if (logs.length >= 8) {
      trend = recent[dim] > prior[dim] ? "up" : recent[dim] < prior[dim] ? "down" : "stable";
    }
    return { dimension: dim, score, trend, ...DIMENSION_META[dim] };
  });
}

function computeStreak(logs: DailyLog[]): number {
  const dates = new Set(logs.map((l) => l.date));
  const cursor = new Date();
  // A streak can end today or yesterday (today may not be logged yet).
  if (!dates.has(toDateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [protocolList, setProtocolList] = useState<ApiProtocol[]>([]);
  const [profiles, setProfiles] = useState<EnergyProfile[]>([]);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [fetchedLogs, fetchedProtocols, fetchedProfiles] = await Promise.all([
        listDailyLogs(30),
        listProtocols(),
        listEnergyProfiles(2),
      ]);
      setLogs(fetchedLogs);
      setProtocolList(fetchedProtocols);
      setProfiles(fetchedProfiles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSeed() {
    setSeeding(true);
    setError(null);
    try {
      await seedDemoData();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load demo data");
    } finally {
      setSeeding(false);
    }
  }

  async function handleToggleHabit(habitId: string) {
    const protocol = protocolList.find((p) =>
      p.status === "active" && p.habits.some((h) => h.id === habitId)
    );
    if (!protocol) return;
    try {
      const updated = await toggleHabitCompletion(protocol, habitId);
      setProtocolList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update habit");
    }
  }

  const latestLog = logs[logs.length - 1];
  const overallScore = latestLog?.energyScore ?? 0;
  const streak = computeStreak(logs);
  const dimensionScores = buildDimensionScores(profiles, logs);
  const sparklineData = logs.map((log) => ({ date: log.date, score: log.energyScore }));
  const activeProtocol = protocolList.find((p) => p.status === "active");
  const todayHabits = activeProtocol?.habits || [];
  const isEmpty =
    !loading && logs.length === 0 && protocolList.length === 0 && profiles.length === 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your daily energy overview</p>
        </div>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Loading your energy data…</span>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your daily energy overview</p>
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold">No energy data yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Take an assessment, log your first day, or load demo data to see Salve in action.
            </p>
            <Button className="mt-6" onClick={handleSeed} disabled={seeding}>
              {seeding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading demo data…
                </>
              ) : (
                "Load demo data"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your daily energy overview</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Energy Circle */}
        <Card className="flex flex-col items-center justify-center py-8">
          <EnergyCircle score={overallScore} />
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-foreground">{streak}</span> day streak
          </div>
        </Card>

        {/* 4 Quadrant Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {dimensionScores.map((dim) => (
            <Card key={dim.dimension}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{dim.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold" style={{ color: dim.color }}>
                        {dim.score}
                      </span>
                      <TrendArrow trend={dim.trend} />
                    </div>
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: dim.bgColor }}
                  >
                    {dim.dimension === "physical" && "\u{1F4AA}"}
                    {dim.dimension === "mental" && "\u{1F9E0}"}
                    {dim.dimension === "emotional" && "\u{2764}\u{FE0F}"}
                    {dim.dimension === "social" && "\u{1F465}"}
                  </div>
                </div>
                {/* Mini bar */}
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Protocol Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Protocol</CardTitle>
          </CardHeader>
          <CardContent>
            {todayHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active protocol habits</p>
            ) : (
              <div className="space-y-3">
                {todayHabits.map((habit) => (
                  <label
                    key={habit.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => void handleToggleHabit(habit.id)}
                  >
                    {habit.completedToday ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground" />
                    )}
                    <span
                      className={`text-sm flex-1 ${
                        habit.completedToday ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {habit.name}
                    </span>
                    {habit.streak > 0 && (
                      <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <Flame className="h-3 w-3" /> {habit.streak}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 30-Day Sparkline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">30-Day Energy</CardTitle>
          </CardHeader>
          <CardContent>
            {sparklineData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No logs yet — record your first daily log to see your trend.
              </p>
            ) : (
              <>
                <Sparkline data={sparklineData} />
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{sparklineData[0]?.date.slice(5)}</span>
                  <span>Today</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
