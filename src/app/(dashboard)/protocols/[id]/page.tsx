"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  protocols,
  getWeeklyComplianceGrid,
  protocolTypeLabels,
  protocolTypeColors,
  dimensionIcons,
} from "@/lib/data/energy";
import { ArrowLeft, Flame, CheckCircle2, Circle } from "lucide-react";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProtocolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const protocol = protocols.find((p) => p.id === id);

  if (!protocol) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Protocol Not Found</h1>
        <Link href="/protocols">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Protocols
          </Button>
        </Link>
      </div>
    );
  }

  const grid = getWeeklyComplianceGrid(protocol.id);
  const completedToday = protocol.habits.filter((h) => h.completedToday).length;
  const totalHabits = protocol.habits.length;
  const bestStreak = Math.max(...protocol.habits.map((h) => h.streak), 0);
  const currentStreakHabits = protocol.habits.filter((h) => h.streak > 0);
  const avgCurrentStreak =
    currentStreakHabits.length > 0
      ? Math.round(
          currentStreakHabits.reduce((sum, h) => sum + h.streak, 0) /
            currentStreakHabits.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/protocols">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{protocol.name}</h1>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary" className={protocolTypeColors[protocol.type]}>
              {protocolTypeLabels[protocol.type]}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {protocol.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{protocol.complianceRate}%</p>
            <p className="text-sm text-muted-foreground">Overall Compliance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" /> {bestStreak}
            </p>
            <p className="text-sm text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{avgCurrentStreak}</p>
            <p className="text-sm text-muted-foreground">Avg Current Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Today&apos;s Habits ({completedToday}/{totalHabits})
          </CardTitle>
          <CardDescription>
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-1 max-w-xs">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${(completedToday / totalHabits) * 100}%` }}
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {protocol.habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 group"
              >
                {habit.completedToday ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                )}
                <span className="text-sm mr-1">
                  {dimensionIcons[habit.category]}
                </span>
                <span
                  className={`text-sm flex-1 ${
                    habit.completedToday ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {habit.name}
                </span>
                {habit.streak > 0 && (
                  <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                    <Flame className="h-3 w-3" /> {habit.streak}d
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Compliance Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Compliance</CardTitle>
          <CardDescription>This week&apos;s habit completion grid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-medium text-muted-foreground pb-2 pr-4 min-w-[140px]">
                    Habit
                  </th>
                  {dayLabels.map((d) => (
                    <th
                      key={d}
                      className="text-center font-medium text-muted-foreground pb-2 px-1 w-10"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {protocol.habits.map((habit) => (
                  <tr key={habit.id} className="border-t border-border/50">
                    <td className="py-2 pr-4 text-sm">{habit.name}</td>
                    {(grid[habit.id] || []).map((status, i) => (
                      <td key={i} className="py-2 text-center">
                        <div
                          className={`h-6 w-6 rounded-full mx-auto ${
                            status === "done"
                              ? "bg-green-500"
                              : status === "missed"
                              ? "bg-red-400"
                              : "bg-muted"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500" /> Done
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-red-400" /> Missed
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-muted" /> Upcoming
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
