"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  protocols,
  protocolTypeLabels,
  protocolTypeColors,
  type Protocol,
} from "@/lib/data/energy";
import { Plus, ArrowRight, Pause, Play, CheckCircle, X } from "lucide-react";

function StatusIcon({ status }: { status: Protocol["status"] }) {
  switch (status) {
    case "active":
      return <Play className="h-3 w-3" />;
    case "paused":
      return <Pause className="h-3 w-3" />;
    case "completed":
      return <CheckCircle className="h-3 w-3" />;
  }
}

function statusColor(status: Protocol["status"]) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "paused":
      return "bg-yellow-100 text-yellow-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
  }
}

export default function ProtocolsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<Protocol["type"]>("morning");
  const [formWeeks, setFormWeeks] = useState("4");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protocols</h1>
          <p className="text-muted-foreground">
            Your active performance protocols and habit stacks
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> Create Protocol
            </>
          )}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Protocol</CardTitle>
            <CardDescription>Define a new performance protocol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="proto-name">Name</Label>
                <Input
                  id="proto-name"
                  placeholder="e.g. Morning Power"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proto-type">Type</Label>
                <select
                  id="proto-type"
                  className="flex h-8 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as Protocol["type"])}
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="focus">Focus</option>
                  <option value="recovery">Recovery</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proto-weeks">Duration (weeks)</Label>
                <Input
                  id="proto-weeks"
                  type="number"
                  min={1}
                  max={52}
                  value={formWeeks}
                  onChange={(e) => setFormWeeks(e.target.value)}
                />
              </div>
            </div>
            <Button className="mt-4" onClick={() => setShowForm(false)}>
              Create Protocol
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Protocol Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {protocols.map((proto) => (
          <Link key={proto.id} href={`/protocols/${proto.id}`}>
            <Card className="hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{proto.name}</CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={protocolTypeColors[proto.type]}
                  >
                    {protocolTypeLabels[proto.type]}
                  </Badge>
                  <Badge variant="secondary" className={statusColor(proto.status)}>
                    <StatusIcon status={proto.status} />
                    <span className="ml-1 capitalize">{proto.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{proto.habits.length}</p>
                    <p className="text-xs text-muted-foreground">Habits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{proto.durationWeeks}w</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{proto.complianceRate}%</p>
                    <p className="text-xs text-muted-foreground">Compliance</p>
                  </div>
                </div>
                {/* Compliance bar */}
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${proto.complianceRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
