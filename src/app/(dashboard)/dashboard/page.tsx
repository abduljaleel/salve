"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  overallEnergyScore,
  currentDimensionScores,
  protocols,
  sparklineData,
  currentStreak,
  getEnergyColor,
} from "@/lib/data/energy";
import { TrendingUp, TrendingDown, Minus, Flame, CheckCircle2, Circle } from "lucide-react";

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

export default function DashboardPage() {
  const activeProtocol = protocols.find((p) => p.status === "active");
  const todayHabits = activeProtocol?.habits || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your daily energy overview</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Energy Circle */}
        <Card className="flex flex-col items-center justify-center py-8">
          <EnergyCircle score={overallEnergyScore} />
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-foreground">{currentStreak}</span> day streak
          </div>
        </Card>

        {/* 4 Quadrant Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {currentDimensionScores.map((dim) => (
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
            <Sparkline data={sparklineData} />
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{sparklineData[0]?.date.slice(5)}</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
