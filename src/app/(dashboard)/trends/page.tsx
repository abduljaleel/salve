"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  dailyLogs,
  getDimensionTrends,
  mockInsights,
  getEnergyColor,
  type DimensionTrend,
} from "@/lib/data/energy";
import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle, Info } from "lucide-react";

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
    data.reduce((sum, d) => sum + d.score, 0) / data.length
  );
  const recent = data.slice(-7);
  const recentAvg = Math.round(
    recent.reduce((sum, d) => sum + d.score, 0) / recent.length
  );
  const older = data.slice(0, 7);
  const olderAvg = Math.round(
    older.reduce((sum, d) => sum + d.score, 0) / older.length
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

export default function TrendsPage() {
  const trends = useMemo(() => getDimensionTrends(), []);

  const energyData = dailyLogs.map((l) => ({
    date: l.date,
    score: l.energyScore,
  }));

  // Weekly averages
  const weeklyAvgs = useMemo(() => {
    const weeks: { label: string; avg: number }[] = [];
    for (let i = 0; i < dailyLogs.length; i += 7) {
      const chunk = dailyLogs.slice(i, i + 7);
      const avg = Math.round(
        chunk.reduce((s, l) => s + l.energyScore, 0) / chunk.length
      );
      const start = chunk[0].date.slice(5);
      weeks.push({ label: `Week of ${start}`, avg });
    }
    return weeks;
  }, []);

  // Monthly average
  const monthlyAvg = Math.round(
    dailyLogs.reduce((s, l) => s + l.energyScore, 0) / dailyLogs.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
        <p className="text-muted-foreground">
          Your energy patterns and performance insights
        </p>
      </div>

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
            {mockInsights.map((insight, i) => (
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
