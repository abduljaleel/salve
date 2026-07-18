"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enterprisePrograms } from "@/lib/data/energy";
import { createProgram, listPrograms, type Program } from "@/lib/data/api";
import { Plus, X, Loader2, Users, Boxes } from "lucide-react";

function statusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formWeeks, setFormWeeks] = useState("8");
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const fetched = await listPrograms();
      setPrograms(fetched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load programs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    if (!formName.trim()) {
      setError("Program name is required");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createProgram({
        name: formName.trim(),
        description: formDescription.trim(),
        durationWeeks: Math.max(1, Number(formWeeks) || 8),
      });
      await load();
      setShowForm(false);
      setFormName("");
      setFormDescription("");
      setFormWeeks("8");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create program");
    } finally {
      setCreating(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setError(null);
    try {
      for (const p of enterprisePrograms) {
        await createProgram({
          name: p.name,
          description: p.description,
          durationWeeks: p.durationWeeks,
          participantCount: p.participantCount,
          status: p.status,
        });
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sample programs");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">
            Organization-wide energy programs and cohorts
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> New Program
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Program</CardTitle>
            <CardDescription>Define an organization-wide energy program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="prog-name">Name</Label>
              <Input
                id="prog-name"
                placeholder="e.g. Executive Energy Reset"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prog-desc">Description</Label>
              <Textarea
                id="prog-desc"
                placeholder="What this program covers"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2 max-w-[200px]">
              <Label htmlFor="prog-weeks">Duration (weeks)</Label>
              <Input
                id="prog-weeks"
                type="number"
                min={1}
                max={52}
                value={formWeeks}
                onChange={(e) => setFormWeeks(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…
                </>
              ) : (
                <>Create Program</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Loading programs…</span>
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Boxes className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold">No programs yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create your first organization program, or load sample programs to explore.
            </p>
            <Button className="mt-6" variant="outline" onClick={handleSeed} disabled={seeding}>
              {seeding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading samples…
                </>
              ) : (
                "Load sample programs"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <Badge variant="secondary" className={statusColor(p.status)}>
                    <span className="capitalize">{p.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {p.description && (
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{p.participantCount}</span>
                    <span className="text-muted-foreground">participants</span>
                  </div>
                  <div>
                    <span className="font-semibold">{p.durationWeeks}</span>
                    <span className="text-muted-foreground"> weeks</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
