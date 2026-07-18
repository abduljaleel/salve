"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  protocolTypeLabels,
  protocolTypeColors,
  dimensionIcons,
  type Dimension,
} from "@/lib/data/energy";
import {
  addHabit,
  deleteProtocol,
  getProtocol,
  toDateStr,
  toggleHabitCompletion,
  updateProtocolStatus,
  type ApiProtocol,
} from "@/lib/data/api";
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  Pause,
  Play,
  Trash2,
} from "lucide-react";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Builds this week's (Mon–Sun) compliance grid from the persisted completion history. */
function buildWeeklyGrid(
  protocol: ApiProtocol
): Record<string, ("done" | "missed" | "future")[]> {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

  const grid: Record<string, ("done" | "missed" | "future")[]> = {};
  for (const habit of protocol.habits) {
    const completed = new Set(protocol.meta.completions[habit.id] ?? []);
    grid[habit.id] = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayStr = toDateStr(day);
      if (dayStr > toDateStr(today)) return "future";
      return completed.has(dayStr) ? "done" : "missed";
    });
  }
  return grid;
}

export default function ProtocolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [protocol, setProtocol] = useState<ApiProtocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habitName, setHabitName] = useState("");
  const [habitCategory, setHabitCategory] = useState<Dimension>("physical");
  const [addingHabit, setAddingHabit] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const fetched = await getProtocol(id);
        if (!cancelled) setProtocol(fetched);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load protocol");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleToggle(habitId: string) {
    if (!protocol) return;
    try {
      const updated = await toggleHabitCompletion(protocol, habitId);
      setProtocol(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update habit");
    }
  }

  async function handleAddHabit() {
    if (!protocol || !habitName.trim()) return;
    setAddingHabit(true);
    setError(null);
    try {
      await addHabit({ protocolId: protocol.id, name: habitName.trim(), category: habitCategory });
      const fetched = await getProtocol(protocol.id);
      setProtocol(fetched);
      setHabitName("");
      setHabitCategory("physical");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add habit");
    } finally {
      setAddingHabit(false);
    }
  }

  async function handleStatusChange(next: ApiProtocol["status"]) {
    if (!protocol) return;
    setStatusUpdating(true);
    setError(null);
    try {
      await updateProtocolStatus(protocol.id, next);
      setProtocol({ ...protocol, status: next });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleDelete() {
    if (!protocol) return;
    if (
      !window.confirm(
        `Delete "${protocol.name}"? This permanently removes the protocol and all its habits.`
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteProtocol(protocol.id);
      router.push("/protocols");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete protocol");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Loading protocol…</span>
        </div>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Protocol Not Found</h1>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <Link href="/protocols">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Protocols
          </Button>
        </Link>
      </div>
    );
  }

  const grid = buildWeeklyGrid(protocol);
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
      <div className="flex flex-wrap items-center gap-4">
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
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {protocol.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleStatusChange("paused")}
              disabled={statusUpdating}
            >
              <Pause className="h-3.5 w-3.5 mr-1.5" /> Pause
            </Button>
          )}
          {protocol.status === "paused" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleStatusChange("active")}
              disabled={statusUpdating}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" /> Resume
            </Button>
          )}
          {protocol.status !== "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleStatusChange("completed")}
              disabled={statusUpdating}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark completed
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
                style={{
                  width: `${totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0}%`,
                }}
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {protocol.habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No habits in this protocol yet.</p>
          ) : (
            <div className="space-y-3">
              {protocol.habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 group cursor-pointer"
                  onClick={() => void handleToggle(habit.id)}
                >
                  {habit.completedToday ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground" />
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
          )}

          {/* Add a new habit to this protocol */}
          <div className="border-t pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="habit-name" className="text-xs text-muted-foreground">
                  New habit
                </Label>
                <Input
                  id="habit-name"
                  placeholder="e.g. 10 min meditation"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleAddHabit();
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="habit-category" className="text-xs text-muted-foreground">
                  Category
                </Label>
                <select
                  id="habit-category"
                  className="flex h-8 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-40"
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value as Dimension)}
                >
                  <option value="physical">Physical</option>
                  <option value="mental">Mental</option>
                  <option value="emotional">Emotional</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <Button
                onClick={() => void handleAddHabit()}
                disabled={addingHabit || !habitName.trim()}
              >
                {addingHabit ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Add habit
                  </>
                )}
              </Button>
            </div>
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
