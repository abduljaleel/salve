// ── Supabase data layer ──────────────────────────────────────────────────────
// All dashboard reads/writes go through this module. Maps DB snake_case rows
// onto the existing UI types from "@/lib/data/energy".

import { createClient } from "@/lib/supabase/client";
import {
  currentDimensionScores,
  dailyLogs as seedDailyLogs,
  protocols as seedProtocols,
  type DailyLog,
  type Dimension,
  type Protocol,
} from "@/lib/data/energy";

// ── Context ──────────────────────────────────────────────────────────────────

export async function getCtx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  return { supabase, userId: user.id, orgId: profile!.org_id as string };
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// ── Energy profiles ──────────────────────────────────────────────────────────

export interface EnergyProfile {
  id: string;
  baselineScores: Record<Dimension, number>;
  assessmentDate: string | null;
  chronotype: string | null;
  stressLevel: number | null;
  sleepQuality: number | null;
}

interface EnergyProfileRow {
  id: string;
  baseline_scores: Record<string, number> | null;
  assessment_date: string | null;
  chronotype: string | null;
  stress_level: number | null;
  sleep_quality: number | null;
}

function mapEnergyProfile(row: EnergyProfileRow): EnergyProfile {
  const scores = row.baseline_scores ?? {};
  return {
    id: row.id,
    baselineScores: {
      physical: Number(scores.physical ?? 0),
      mental: Number(scores.mental ?? 0),
      emotional: Number(scores.emotional ?? 0),
      social: Number(scores.social ?? 0),
    },
    assessmentDate: row.assessment_date,
    chronotype: row.chronotype,
    stressLevel: row.stress_level,
    sleepQuality: row.sleep_quality,
  };
}

export async function listEnergyProfiles(limit = 5): Promise<EnergyProfile[]> {
  const { supabase, userId } = await getCtx();
  const { data, error } = await supabase
    .from("energy_profiles")
    .select("id, baseline_scores, assessment_date, chronotype, stress_level, sleep_quality")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEnergyProfile);
}

export async function createEnergyProfile(input: {
  baselineScores: Record<Dimension, number>;
  chronotype: string | null;
  stressLevel: number;
  sleepQuality: number;
}): Promise<EnergyProfile> {
  const { supabase, userId } = await getCtx();
  const { data, error } = await supabase
    .from("energy_profiles")
    .insert({
      user_id: userId,
      baseline_scores: input.baselineScores,
      assessment_date: new Date().toISOString(),
      chronotype: input.chronotype,
      stress_level: input.stressLevel,
      sleep_quality: input.sleepQuality,
    })
    .select("id, baseline_scores, assessment_date, chronotype, stress_level, sleep_quality")
    .single();
  if (error) throw new Error(error.message);
  return mapEnergyProfile(data as EnergyProfileRow);
}

// ── Daily logs ───────────────────────────────────────────────────────────────

interface DailyLogRow {
  id: string;
  date: string;
  energy_score: number | null;
  mood: string | null;
  sleep_hours: number | string | null;
  sleep_quality: number | null;
  exercise_minutes: number | null;
  focus_hours: number | string | null;
  stress_level: number | null;
  notes: string | null;
}

const LOG_COLUMNS =
  "id, date, energy_score, mood, sleep_hours, sleep_quality, exercise_minutes, focus_hours, stress_level, notes";

function mapDailyLog(row: DailyLogRow): DailyLog {
  return {
    date: row.date,
    energyScore: row.energy_score ?? 0,
    mood: (row.mood as DailyLog["mood"]) ?? "okay",
    sleepHours: Number(row.sleep_hours ?? 0),
    sleepQuality: row.sleep_quality ?? 3,
    exerciseMinutes: row.exercise_minutes ?? 0,
    focusHours: Number(row.focus_hours ?? 0),
    stressLevel: row.stress_level ?? 3,
    notes: row.notes ?? "",
  };
}

export async function listDailyLogs(days = 35): Promise<DailyLog[]> {
  const { supabase, userId } = await getCtx();
  const since = toDateStr(addDays(new Date(), -(days - 1)));
  const { data, error } = await supabase
    .from("daily_logs")
    .select(LOG_COLUMNS)
    .eq("user_id", userId)
    .gte("date", since)
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapDailyLog);
}

/** One row per date: checks for an existing log on that date, then updates or inserts. */
export async function upsertDailyLog(log: DailyLog): Promise<DailyLog> {
  const { supabase, userId } = await getCtx();
  const values = {
    energy_score: log.energyScore,
    mood: log.mood,
    sleep_hours: log.sleepHours,
    sleep_quality: log.sleepQuality,
    exercise_minutes: log.exerciseMinutes,
    focus_hours: log.focusHours,
    stress_level: log.stressLevel,
    notes: log.notes,
  };
  const { data: existing, error: findError } = await supabase
    .from("daily_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("date", log.date)
    .limit(1)
    .maybeSingle();
  if (findError) throw new Error(findError.message);

  if (existing) {
    const { data, error } = await supabase
      .from("daily_logs")
      .update(values)
      .eq("id", existing.id)
      .select(LOG_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return mapDailyLog(data as DailyLogRow);
  }
  const { data, error } = await supabase
    .from("daily_logs")
    .insert({ user_id: userId, date: log.date, ...values })
    .select(LOG_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapDailyLog(data as DailyLogRow);
}

export async function deleteDailyLog(date: string): Promise<void> {
  const { supabase, userId } = await getCtx();
  const { error } = await supabase
    .from("daily_logs")
    .delete()
    .eq("user_id", userId)
    .eq("date", date);
  if (error) throw new Error(error.message);
}

// ── Protocols + habits ───────────────────────────────────────────────────────

/** Stored in the protocols.habits jsonb column. */
export interface ProtocolMeta {
  compliance_rate?: number;
  /** habit id → completed dates (YYYY-MM-DD) */
  completions: Record<string, string[]>;
}

export interface ApiProtocol extends Protocol {
  meta: ProtocolMeta;
}

interface ProtocolRow {
  id: string;
  name: string;
  status: string | null;
  protocol_type: string | null;
  habits: ProtocolMeta | null;
  duration_weeks: number | null;
  created_at: string | null;
}

interface HabitRow {
  id: string;
  protocol_id: string | null;
  name: string;
  category: string | null;
  current_streak: number | null;
  best_streak: number | null;
}

const PROTOCOL_COLUMNS = "id, name, status, protocol_type, habits, duration_weeks, created_at";
const HABIT_COLUMNS = "id, protocol_id, name, category, current_streak, best_streak";

function normalizeMeta(meta: ProtocolMeta | null): ProtocolMeta {
  return { compliance_rate: meta?.compliance_rate, completions: meta?.completions ?? {} };
}

/**
 * Derives a live compliance rate from the persisted completion history over the
 * trailing 7 days: (completions in window) / (habits × 7). The stored
 * `compliance_rate` is deliberately ignored so seeded protocols don't freeze at
 * their seed value and user-created protocols don't stay stuck at 0%. Falls back
 * to the stored value (or today's ratio) only when there is no completion history
 * yet, so a freshly created protocol still reads sensibly.
 */
function deriveComplianceRate(
  habits: { id: string; completedToday: boolean }[],
  meta: ProtocolMeta
): number {
  if (habits.length === 0) return 0;
  const hasHistory = Object.values(meta.completions).some((dates) => dates.length > 0);
  if (!hasHistory) {
    const completedToday = habits.filter((h) => h.completedToday).length;
    return meta.compliance_rate ?? Math.round((completedToday / habits.length) * 100);
  }
  const now = new Date();
  const window = new Set<string>();
  for (let d = 0; d < 7; d++) window.add(toDateStr(addDays(now, -d)));
  let completed = 0;
  for (const habit of habits) {
    const dates = meta.completions[habit.id] ?? [];
    completed += dates.filter((dt) => window.has(dt)).length;
  }
  return Math.round((completed / (habits.length * 7)) * 100);
}

function mapProtocol(row: ProtocolRow, habitRows: HabitRow[]): ApiProtocol {
  const meta = normalizeMeta(row.habits);
  const today = todayStr();
  const habits = habitRows.map((h) => ({
    id: h.id,
    name: h.name,
    category: (h.category as Dimension) ?? "physical",
    completedToday: (meta.completions[h.id] ?? []).includes(today),
    streak: h.current_streak ?? 0,
  }));
  return {
    id: row.id,
    name: row.name,
    type: (row.protocol_type as Protocol["type"]) ?? "morning",
    status: (row.status as Protocol["status"]) ?? "active",
    durationWeeks: row.duration_weeks ?? 0,
    complianceRate: deriveComplianceRate(habits, meta),
    startedAt: row.created_at ? row.created_at.slice(0, 10) : todayStr(),
    habits,
    meta,
  };
}

export async function listProtocols(): Promise<ApiProtocol[]> {
  const { supabase, userId } = await getCtx();
  const [protoRes, habitRes] = await Promise.all([
    supabase
      .from("protocols")
      .select(PROTOCOL_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase.from("habits").select(HABIT_COLUMNS).eq("user_id", userId).order("created_at", {
      ascending: true,
    }),
  ]);
  if (protoRes.error) throw new Error(protoRes.error.message);
  if (habitRes.error) throw new Error(habitRes.error.message);
  const habitRows = (habitRes.data ?? []) as HabitRow[];
  return ((protoRes.data ?? []) as ProtocolRow[]).map((row) =>
    mapProtocol(row, habitRows.filter((h) => h.protocol_id === row.id))
  );
}

export async function getProtocol(id: string): Promise<ApiProtocol | null> {
  const { supabase, userId } = await getCtx();
  const { data, error } = await supabase
    .from("protocols")
    .select(PROTOCOL_COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { data: habitRows, error: habitError } = await supabase
    .from("habits")
    .select(HABIT_COLUMNS)
    .eq("user_id", userId)
    .eq("protocol_id", id)
    .order("created_at", { ascending: true });
  if (habitError) throw new Error(habitError.message);
  return mapProtocol(data as ProtocolRow, (habitRows ?? []) as HabitRow[]);
}

export async function createProtocol(input: {
  name: string;
  type: Protocol["type"];
  durationWeeks: number;
}): Promise<ApiProtocol> {
  const { supabase, userId } = await getCtx();
  const meta: ProtocolMeta = { compliance_rate: 0, completions: {} };
  const { data, error } = await supabase
    .from("protocols")
    .insert({
      user_id: userId,
      name: input.name,
      protocol_type: input.type,
      status: "active",
      duration_weeks: input.durationWeeks,
      habits: meta,
    })
    .select(PROTOCOL_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapProtocol(data as ProtocolRow, []);
}

export async function updateProtocolStatus(
  id: string,
  status: Protocol["status"]
): Promise<void> {
  const { supabase, userId } = await getCtx();
  const { error } = await supabase
    .from("protocols")
    .update({ status })
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProtocol(id: string): Promise<void> {
  const { supabase, userId } = await getCtx();
  const { error: habitError } = await supabase
    .from("habits")
    .delete()
    .eq("user_id", userId)
    .eq("protocol_id", id);
  if (habitError) throw new Error(habitError.message);
  const { error } = await supabase.from("protocols").delete().eq("user_id", userId).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addHabit(input: {
  protocolId: string;
  name: string;
  category: Dimension;
}): Promise<void> {
  const { supabase, userId } = await getCtx();
  const { error } = await supabase.from("habits").insert({
    user_id: userId,
    protocol_id: input.protocolId,
    name: input.name,
    category: input.category,
    frequency: "daily",
    target_value: 1,
    current_streak: 0,
    best_streak: 0,
  });
  if (error) throw new Error(error.message);
}

/** Count of consecutive completed days ending at `endDate` (inclusive). */
function consecutiveStreak(dates: Set<string>, endDate: Date): number {
  let streak = 0;
  const cursor = new Date(endDate);
  while (dates.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Toggles today's completion for a habit. Persists the completion history on
 * the protocol's jsonb meta and the streak counters on the habits row.
 * Returns the updated protocol for local state.
 */
export async function toggleHabitCompletion(
  protocol: ApiProtocol,
  habitId: string
): Promise<ApiProtocol> {
  const { supabase, userId } = await getCtx();
  const today = todayStr();
  const completions = { ...protocol.meta.completions };
  const dates = new Set(completions[habitId] ?? []);
  const completing = !dates.has(today);
  if (completing) dates.add(today);
  else dates.delete(today);
  completions[habitId] = Array.from(dates).sort();

  const streakEnd = completing ? new Date() : addDays(new Date(), -1);
  const newStreak = consecutiveStreak(dates, streakEnd);

  const { data: habitRow, error: habitFetchError } = await supabase
    .from("habits")
    .select("best_streak")
    .eq("user_id", userId)
    .eq("id", habitId)
    .single();
  if (habitFetchError) throw new Error(habitFetchError.message);
  const bestStreak = Math.max(habitRow?.best_streak ?? 0, newStreak);

  const newMeta: ProtocolMeta = { ...protocol.meta, completions };
  const [habitRes, protoRes] = await Promise.all([
    supabase
      .from("habits")
      .update({ current_streak: newStreak, best_streak: bestStreak })
      .eq("user_id", userId)
      .eq("id", habitId),
    supabase
      .from("protocols")
      .update({ habits: newMeta })
      .eq("user_id", userId)
      .eq("id", protocol.id),
  ]);
  if (habitRes.error) throw new Error(habitRes.error.message);
  if (protoRes.error) throw new Error(protoRes.error.message);

  const updatedHabits = protocol.habits.map((h) =>
    h.id === habitId ? { ...h, completedToday: completing, streak: newStreak } : h
  );
  return {
    ...protocol,
    meta: newMeta,
    complianceRate: deriveComplianceRate(updatedHabits, newMeta),
    habits: updatedHabits,
  };
}

// ── Programs (org-scoped) ────────────────────────────────────────────────────

export interface Program {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  participantCount: number;
  status: string;
}

interface ProgramRow {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number | null;
  participant_count: number | null;
  status: string | null;
}

export async function listPrograms(): Promise<Program[]> {
  const { supabase, orgId } = await getCtx();
  const { data, error } = await supabase
    .from("programs")
    .select("id, name, description, duration_weeks, participant_count, status")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ProgramRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    durationWeeks: row.duration_weeks ?? 0,
    participantCount: row.participant_count ?? 0,
    status: row.status ?? "draft",
  }));
}

export async function createProgram(input: {
  name: string;
  description: string;
  durationWeeks: number;
  participantCount?: number;
  status?: string;
}): Promise<void> {
  const { supabase, orgId } = await getCtx();
  const { error } = await supabase.from("programs").insert({
    org_id: orgId,
    name: input.name,
    description: input.description,
    duration_weeks: input.durationWeeks,
    participant_count: input.participantCount ?? 0,
    protocol_template: {},
    status: input.status ?? "draft",
  });
  if (error) throw new Error(error.message);
}

// ── Derived dimension scores (shared by dashboard + trends) ──────────────────

const MOOD_DELTA: Record<DailyLog["mood"], number> = {
  great: 8,
  good: 4,
  okay: 0,
  low: -6,
  bad: -10,
};

function clampScore(v: number): number {
  return Math.max(20, Math.min(100, Math.round(v)));
}

/** Deterministically derives per-dimension scores from a daily log's fields. */
export function deriveDimensionScores(log: DailyLog): Record<Dimension, number> {
  return {
    physical: clampScore(
      log.energyScore + (log.sleepHours >= 7 ? 6 : -4) + (log.exerciseMinutes >= 30 ? 6 : -4)
    ),
    mental: clampScore(
      log.energyScore + (log.focusHours >= 4 ? 8 : log.focusHours >= 2 ? 0 : -6)
    ),
    emotional: clampScore(log.energyScore + (3 - log.stressLevel) * 5),
    social: clampScore(log.energyScore + MOOD_DELTA[log.mood]),
  };
}

// ── Demo seeding ─────────────────────────────────────────────────────────────

/**
 * Seeds the demo content from the existing seed arrays:
 * one energy profile, 30 days of daily logs ending today, and two protocols
 * with habits, streaks, and completion history. All rows are user-scoped.
 */
export async function seedDemoData(): Promise<void> {
  const { supabase, userId } = await getCtx();
  const today = new Date();
  const todayDate = todayStr();

  // 1. Energy profile from the current dimension scores.
  const baselineScores = Object.fromEntries(
    currentDimensionScores.map((d) => [d.dimension, d.score])
  );
  const { error: profileError } = await supabase.from("energy_profiles").insert({
    user_id: userId,
    baseline_scores: baselineScores,
    assessment_date: today.toISOString(),
    chronotype: "early_bird",
    stress_level: 2,
    sleep_quality: 4,
  });
  if (profileError) throw new Error(profileError.message);

  // 2. ~30 days of daily logs, re-dated to end today.
  const logRows = seedDailyLogs.map((log, i) => ({
    user_id: userId,
    date: toDateStr(addDays(today, i - (seedDailyLogs.length - 1))),
    energy_score: log.energyScore,
    mood: log.mood,
    sleep_hours: log.sleepHours,
    sleep_quality: log.sleepQuality,
    exercise_minutes: log.exerciseMinutes,
    focus_hours: log.focusHours,
    stress_level: log.stressLevel,
    notes: log.notes,
  }));
  const { error: logsError } = await supabase.from("daily_logs").insert(logRows);
  if (logsError) throw new Error(logsError.message);

  // 3. Two protocols with habits, streaks, and completion history.
  for (const proto of seedProtocols.slice(0, 2)) {
    const { data: protoRow, error: protoError } = await supabase
      .from("protocols")
      .insert({
        user_id: userId,
        name: proto.name,
        protocol_type: proto.type,
        status: proto.status,
        duration_weeks: proto.durationWeeks,
        habits: { compliance_rate: proto.complianceRate, completions: {} },
      })
      .select("id")
      .single();
    if (protoError) throw new Error(protoError.message);
    const protocolId = (protoRow as { id: string }).id;

    const habitRows = proto.habits.map((h) => ({
      user_id: userId,
      protocol_id: protocolId,
      name: h.name,
      category: h.category,
      frequency: "daily",
      target_value: 1,
      current_streak: h.streak,
      best_streak: Math.max(h.streak, Math.round(h.streak * 1.5)),
    }));
    const { data: insertedHabits, error: habitsError } = await supabase
      .from("habits")
      .insert(habitRows)
      .select("id");
    if (habitsError) throw new Error(habitsError.message);

    // Build a completion history: streak days ending today for completed
    // habits, plus a deterministic scattering of past days for grid realism.
    const completions: Record<string, string[]> = {};
    ((insertedHabits ?? []) as { id: string }[]).forEach((row, idx) => {
      const seedHabit = proto.habits[idx];
      const dates = new Set<string>();
      if (seedHabit.completedToday && seedHabit.streak > 0) {
        for (let d = 0; d < seedHabit.streak; d++) {
          dates.add(toDateStr(addDays(today, -d)));
        }
      }
      for (let d = 1; d <= 14; d++) {
        if ((idx + d) % 3 !== 0) dates.add(toDateStr(addDays(today, -d)));
      }
      if (!seedHabit.completedToday) dates.delete(todayDate);
      completions[row.id] = Array.from(dates).sort();
    });

    const { error: metaError } = await supabase
      .from("protocols")
      .update({ habits: { compliance_rate: proto.complianceRate, completions } })
      .eq("user_id", userId)
      .eq("id", protocolId);
    if (metaError) throw new Error(metaError.message);
  }
}
