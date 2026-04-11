"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  dailyLogs,
  moodEmojis,
  getEnergyCalendarClass,
  type DailyLog,
} from "@/lib/data/energy";
import { CalendarDays, PenLine } from "lucide-react";

const moodOptions: DailyLog["mood"][] = ["great", "good", "okay", "low", "bad"];

function CalendarGrid({ logs }: { logs: DailyLog[] }) {
  // Build a 5-week calendar for the last 35 days
  const today = new Date(2026, 3, 11);
  const cells: { date: Date; log?: DailyLog }[] = [];

  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    cells.push({ date: d, log: logs.find((l) => l.date === dateStr) });
  }

  // Pad start to align with Monday
  const firstDay = cells[0].date.getDay();
  const padStart = firstDay === 0 ? 6 : firstDay - 1;
  const paddedCells = [
    ...Array.from({ length: padStart }, () => null),
    ...cells,
  ];

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-xs text-center text-muted-foreground font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {paddedCells.map((cell, i) => {
          if (!cell) {
            return <div key={`pad-${i}`} className="h-8 w-full" />;
          }
          const isToday =
            cell.date.toISOString().split("T")[0] ===
            today.toISOString().split("T")[0];
          return (
            <div
              key={i}
              className={`h-8 w-full rounded-md flex items-center justify-center text-xs font-medium transition-all ${
                cell.log
                  ? `${getEnergyCalendarClass(cell.log.energyScore)} text-white`
                  : "bg-muted/50 text-muted-foreground"
              } ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}`}
              title={
                cell.log
                  ? `${cell.date.toLocaleDateString()}: ${cell.log.energyScore} energy`
                  : cell.date.toLocaleDateString()
              }
            >
              {cell.date.getDate()}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-green-400" /> 80+
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-amber-400" /> 60-79
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-orange-400" /> 40-59
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-red-400" /> &lt;40
        </div>
      </div>
    </div>
  );
}

export default function LogPage() {
  const [energy, setEnergy] = useState(70);
  const [mood, setMood] = useState<DailyLog["mood"]>("good");
  const [sleepHours, setSleepHours] = useState("7.5");
  const [sleepQuality, setSleepQuality] = useState(4);
  const [exerciseMin, setExerciseMin] = useState("30");
  const [focusHours, setFocusHours] = useState("4");
  const [stressLevel, setStressLevel] = useState(2);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Log</h1>
        <p className="text-muted-foreground">Track your energy, mood, and habits</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Log Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PenLine className="h-4 w-4" /> Log Today
            </CardTitle>
            <CardDescription>
              {new Date(2026, 3, 11).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {saved && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                Log saved successfully!
              </div>
            )}

            {/* Energy Slider */}
            <div className="space-y-2">
              <Label>Energy Score: {energy}</Label>
              <input
                type="range"
                min={0}
                max={100}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Depleted</span>
                <span>Supercharged</span>
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <Label>Mood</Label>
              <div className="flex gap-2">
                {moodOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`flex-1 flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
                      mood === m
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-xl">{moodEmojis[m]}</span>
                    <span className="text-xs capitalize">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sleep">Sleep Hours</Label>
                <Input
                  id="sleep"
                  type="number"
                  step="0.5"
                  min={0}
                  max={14}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sleep Quality</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSleepQuality(v)}
                      className={`h-8 w-8 rounded-md text-sm font-medium border transition-all ${
                        sleepQuality === v
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exercise">Exercise (min)</Label>
                <Input
                  id="exercise"
                  type="number"
                  min={0}
                  max={300}
                  value={exerciseMin}
                  onChange={(e) => setExerciseMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="focus">Focus Hours</Label>
                <Input
                  id="focus"
                  type="number"
                  step="0.5"
                  min={0}
                  max={16}
                  value={focusHours}
                  onChange={(e) => setFocusHours(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stress Level</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStressLevel(v)}
                    className={`h-8 w-8 rounded-md text-sm font-medium border transition-all ${
                      stressLevel === v
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-border"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Calm</span>
                <span>Overwhelmed</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="How are you feeling? Any observations?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Today&apos;s Log
            </Button>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarGrid logs={dailyLogs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
