// ── Types ──────────────────────────────────────────────────────────────────

export type Dimension = "physical" | "mental" | "emotional" | "social";

export interface DimensionScore {
  dimension: Dimension;
  score: number; // 0-100
  trend: "up" | "down" | "stable";
  label: string;
  color: string;
  bgColor: string;
}

export interface Habit {
  id: string;
  name: string;
  category: Dimension;
  completedToday: boolean;
  streak: number;
}

export interface Protocol {
  id: string;
  name: string;
  type: "morning" | "evening" | "recovery" | "focus";
  status: "active" | "paused" | "completed";
  habits: Habit[];
  durationWeeks: number;
  complianceRate: number;
  startedAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  energyScore: number;
  mood: "great" | "good" | "okay" | "low" | "bad";
  sleepHours: number;
  sleepQuality: number; // 1-5
  exerciseMinutes: number;
  focusHours: number;
  stressLevel: number; // 1-5
  notes: string;
}

export interface AssessmentQuestion {
  id: string;
  dimension: Dimension;
  text: string;
  shortLabel: string;
}

export interface Insight {
  text: string;
  type: "positive" | "neutral" | "warning";
}

// ── Assessment Questions ───────────────────────────────────────────────────

export const assessmentQuestions: AssessmentQuestion[] = [
  // Physical
  { id: "p1", dimension: "physical", text: "How well did you sleep last night?", shortLabel: "Sleep Quality" },
  { id: "p2", dimension: "physical", text: "How energized does your body feel right now?", shortLabel: "Physical Energy" },
  { id: "p3", dimension: "physical", text: "How well are you eating and hydrating?", shortLabel: "Nutrition" },
  { id: "p4", dimension: "physical", text: "How much physical movement have you had recently?", shortLabel: "Exercise" },
  { id: "p5", dimension: "physical", text: "How well are you recovering from physical exertion?", shortLabel: "Recovery" },
  // Mental
  { id: "m1", dimension: "mental", text: "How clear and focused is your thinking?", shortLabel: "Focus" },
  { id: "m2", dimension: "mental", text: "How well can you sustain deep work?", shortLabel: "Deep Work" },
  { id: "m3", dimension: "mental", text: "How creative and sharp do you feel?", shortLabel: "Creativity" },
  { id: "m4", dimension: "mental", text: "How well are you managing information overload?", shortLabel: "Info Management" },
  { id: "m5", dimension: "mental", text: "How confident are you in your decision-making?", shortLabel: "Decisions" },
  // Emotional
  { id: "e1", dimension: "emotional", text: "How positive is your overall mood?", shortLabel: "Mood" },
  { id: "e2", dimension: "emotional", text: "How well are you managing stress?", shortLabel: "Stress Management" },
  { id: "e3", dimension: "emotional", text: "How motivated and driven do you feel?", shortLabel: "Motivation" },
  { id: "e4", dimension: "emotional", text: "How resilient do you feel against setbacks?", shortLabel: "Resilience" },
  { id: "e5", dimension: "emotional", text: "How strong is your sense of purpose?", shortLabel: "Purpose" },
  // Social
  { id: "s1", dimension: "social", text: "How connected do you feel to people who matter?", shortLabel: "Connection" },
  { id: "s2", dimension: "social", text: "How supportive are your key relationships?", shortLabel: "Relationships" },
  { id: "s3", dimension: "social", text: "How well are you communicating with others?", shortLabel: "Communication" },
  { id: "s4", dimension: "social", text: "How much positive social interaction have you had?", shortLabel: "Interaction" },
  { id: "s5", dimension: "social", text: "How well are you setting boundaries?", shortLabel: "Boundaries" },
];

// ── Dimension Scores (Current) ─────────────────────────────────────────────

export const currentDimensionScores: DimensionScore[] = [
  { dimension: "physical", score: 78, trend: "up", label: "Physical", color: "#22c55e", bgColor: "#f0fdf4" },
  { dimension: "mental", score: 65, trend: "down", label: "Mental", color: "#3b82f6", bgColor: "#eff6ff" },
  { dimension: "emotional", score: 82, trend: "up", label: "Emotional", color: "#f59e0b", bgColor: "#fffbeb" },
  { dimension: "social", score: 71, trend: "stable", label: "Social", color: "#a855f7", bgColor: "#faf5ff" },
];

export const overallEnergyScore = 74;
export const currentStreak = 12;

// ── Protocols ──────────────────────────────────────────────────────────────

export const protocols: Protocol[] = [
  {
    id: "proto-1",
    name: "Morning Power Routine",
    type: "morning",
    status: "active",
    durationWeeks: 8,
    complianceRate: 87,
    startedAt: "2026-03-01",
    habits: [
      { id: "h1", name: "Wake by 6:30 AM", category: "physical", completedToday: true, streak: 12 },
      { id: "h2", name: "10 min meditation", category: "mental", completedToday: true, streak: 8 },
      { id: "h3", name: "Cold shower", category: "physical", completedToday: false, streak: 0 },
      { id: "h4", name: "Journal 3 gratitudes", category: "emotional", completedToday: true, streak: 15 },
      { id: "h5", name: "30 min exercise", category: "physical", completedToday: false, streak: 0 },
      { id: "h6", name: "Healthy breakfast", category: "physical", completedToday: true, streak: 10 },
    ],
  },
  {
    id: "proto-2",
    name: "Evening Wind Down",
    type: "evening",
    status: "active",
    durationWeeks: 8,
    complianceRate: 72,
    startedAt: "2026-03-01",
    habits: [
      { id: "h7", name: "No screens after 9 PM", category: "physical", completedToday: false, streak: 0 },
      { id: "h8", name: "Read 20 minutes", category: "mental", completedToday: false, streak: 0 },
      { id: "h9", name: "Reflect on the day", category: "emotional", completedToday: false, streak: 0 },
      { id: "h10", name: "Lights out by 10:30 PM", category: "physical", completedToday: false, streak: 0 },
    ],
  },
  {
    id: "proto-3",
    name: "Deep Focus Protocol",
    type: "focus",
    status: "active",
    durationWeeks: 4,
    complianceRate: 65,
    startedAt: "2026-03-15",
    habits: [
      { id: "h11", name: "2-hour deep work block", category: "mental", completedToday: true, streak: 5 },
      { id: "h12", name: "Phone on airplane mode", category: "mental", completedToday: true, streak: 3 },
      { id: "h13", name: "Single-task (no multitasking)", category: "mental", completedToday: false, streak: 0 },
    ],
  },
  {
    id: "proto-4",
    name: "Weekend Recovery",
    type: "recovery",
    status: "paused",
    durationWeeks: 12,
    complianceRate: 54,
    startedAt: "2026-01-10",
    habits: [
      { id: "h14", name: "Nature walk 45 min", category: "physical", completedToday: false, streak: 0 },
      { id: "h15", name: "Social meal with friends", category: "social", completedToday: false, streak: 0 },
      { id: "h16", name: "No work email", category: "emotional", completedToday: false, streak: 0 },
      { id: "h17", name: "Creative hobby time", category: "emotional", completedToday: false, streak: 0 },
    ],
  },
];

// ── Daily Logs (last 30 days) ──────────────────────────────────────────────

function generateDailyLogs(): DailyLog[] {
  const logs: DailyLog[] = [];
  const moods: DailyLog["mood"][] = ["great", "good", "okay", "low", "bad"];
  const today = new Date(2026, 3, 11); // April 11, 2026

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Generate somewhat realistic patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseEnergy = isWeekend ? 72 : 68;
    const variance = Math.sin(i * 0.5) * 15 + (Math.random() * 10 - 5);
    const energyScore = Math.max(30, Math.min(95, Math.round(baseEnergy + variance)));

    const moodIndex = energyScore > 80 ? 0 : energyScore > 70 ? 1 : energyScore > 55 ? 2 : energyScore > 40 ? 3 : 4;
    const sleepHours = +(5.5 + Math.random() * 3).toFixed(1);
    const sleepQuality = Math.min(5, Math.max(1, Math.round(sleepHours / 2)));

    logs.push({
      date: dateStr,
      energyScore,
      mood: moods[moodIndex],
      sleepHours,
      sleepQuality,
      exerciseMinutes: isWeekend ? Math.round(30 + Math.random() * 60) : Math.round(Math.random() * 45),
      focusHours: isWeekend ? +(1 + Math.random() * 2).toFixed(1) : +(2 + Math.random() * 4).toFixed(1),
      stressLevel: Math.min(5, Math.max(1, 6 - Math.round(energyScore / 20))),
      notes: i === 0 ? "" : i === 1 ? "Felt strong after morning run" : i === 3 ? "Poor sleep, stressed about deadline" : "",
    });
  }
  return logs;
}

export const dailyLogs: DailyLog[] = generateDailyLogs();
export const todayLog: DailyLog | undefined = dailyLogs[dailyLogs.length - 1];

// ── SMILE Framework (from Smil E Advisory / Notion) ──────────────────────
// Inspired by Václav Smil's interdisciplinary approach and the SuperMe EOS
// The SMILE Framework = Sustainable Management, Innovation, Leadership, Efficiency

export interface SmilePillar {
  id: string;
  name: string;
  description: string;
  icon: string;
  metrics: string[];
}

export const smileFramework: SmilePillar[] = [
  {
    id: "energy-resilience",
    name: "Energy Resilience & Efficiency",
    description: "Strategies for personal energy systems — sleep architecture, nutrition timing, recovery protocols, and sustainable output without burnout.",
    icon: "bolt",
    metrics: ["Sleep Quality Index", "Recovery Score", "Sustained Output Hours", "Burnout Risk"],
  },
  {
    id: "material-efficiency",
    name: "Resource Efficiency & Circularity",
    description: "Optimize how you allocate attention, time, and cognitive resources. Reduce waste in your daily operating model.",
    icon: "zap",
    metrics: ["Focus-to-Distraction Ratio", "Context Switch Count", "Deep Work Blocks", "Energy ROI"],
  },
  {
    id: "emotional-systems",
    name: "Emotional Operating System",
    description: "Adaptive emotional wellness — mood regulation, stress management, resilience building, and crisis prediction. Inspired by SuperMe EOS.",
    icon: "heart",
    metrics: ["Mood Stability Index", "Stress Recovery Time", "Emotional Resilience Score", "Crisis Risk"],
  },
  {
    id: "adaptation",
    name: "Adaptation & Growth",
    description: "Build adaptive capacity — respond to change, learn from setbacks, design resilient personal systems that improve under pressure.",
    icon: "activity",
    metrics: ["Adaptation Speed", "Learning Velocity", "Setback Recovery", "Growth Trajectory"],
  },
  {
    id: "capacity-building",
    name: "Knowledge & Capacity Building",
    description: "Tools and training to enhance your personal operating system — habits, routines, decision frameworks, and sustainable performance patterns.",
    icon: "book",
    metrics: ["Habit Compliance", "Protocol Adherence", "Self-Assessment Accuracy", "Improvement Rate"],
  },
];

// ── Enterprise Programs (SMILE-powered) ──────────────────────────────────

export interface EnterpriseProgram {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  participantCount: number;
  avgEnergyLift: number;
  status: "active" | "completed" | "draft";
  pillars: string[];
}

export const enterprisePrograms: EnterpriseProgram[] = [
  {
    id: "prog-1",
    name: "Executive Energy Reset",
    description: "8-week program for leadership teams combining the SMILE Framework with individual energy diagnostics and team-level interventions.",
    durationWeeks: 8,
    participantCount: 12,
    avgEnergyLift: 18,
    status: "active",
    pillars: ["energy-resilience", "emotional-systems", "adaptation"],
  },
  {
    id: "prog-2",
    name: "Engineering Team Sustainability",
    description: "Focus-intensive program for engineering teams — deep work protocols, burnout prevention, and cognitive resource optimization.",
    durationWeeks: 6,
    participantCount: 24,
    avgEnergyLift: 14,
    status: "active",
    pillars: ["material-efficiency", "energy-resilience", "capacity-building"],
  },
  {
    id: "prog-3",
    name: "Founder Resilience Protocol",
    description: "High-intensity protocol for founders — emotional operating system setup, stress inoculation, and adaptive capacity building.",
    durationWeeks: 12,
    participantCount: 6,
    avgEnergyLift: 22,
    status: "completed",
    pillars: ["emotional-systems", "adaptation", "energy-resilience"],
  },
];

// ── 30-Day Sparkline Data ──────────────────────────────────────────────────

export const sparklineData = dailyLogs.map((log) => ({
  date: log.date,
  score: log.energyScore,
}));

// ── Weekly Compliance Grid (for protocol detail) ───────────────────────────

export function getWeeklyComplianceGrid(protocolId: string): Record<string, ("done" | "missed" | "future")[]> {
  const protocol = protocols.find((p) => p.id === protocolId);
  if (!protocol) return {};

  const grid: Record<string, ("done" | "missed" | "future")[]> = {};
  for (const habit of protocol.habits) {
    grid[habit.id] = Array.from({ length: 7 }, (_, i) => {
      if (i >= 5) return "future";
      return Math.random() > 0.3 ? "done" : "missed";
    });
  }
  return grid;
}

// ── Trend Data ─────────────────────────────────────────────────────────────

export interface DimensionTrend {
  date: string;
  physical: number;
  mental: number;
  emotional: number;
  social: number;
}

export function getDimensionTrends(): DimensionTrend[] {
  return dailyLogs.map((log) => {
    const base = log.energyScore;
    return {
      date: log.date,
      physical: Math.max(20, Math.min(100, base + Math.round(Math.random() * 20 - 10))),
      mental: Math.max(20, Math.min(100, base + Math.round(Math.random() * 20 - 15))),
      emotional: Math.max(20, Math.min(100, base + Math.round(Math.random() * 20 - 5))),
      social: Math.max(20, Math.min(100, base + Math.round(Math.random() * 20 - 12))),
    };
  });
}

// ── Insights ───────────────────────────────────────────────────────────────

export const mockInsights: Insight[] = [
  { text: "Your energy is 18% higher on days with 7+ hours of sleep", type: "positive" },
  { text: "Tuesday is consistently your lowest energy day", type: "warning" },
  { text: "Exercise in the morning correlates with +12 energy points", type: "positive" },
  { text: "Your social energy dips mid-week — consider scheduling a check-in", type: "neutral" },
  { text: "Your meditation streak boosted mental scores by 15% over 2 weeks", type: "positive" },
  { text: "Stress levels peak when focus hours exceed 5 per day", type: "warning" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export const moodEmojis: Record<DailyLog["mood"], string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  low: "😔",
  bad: "😞",
};

export const protocolTypeLabels: Record<Protocol["type"], string> = {
  morning: "Morning",
  evening: "Evening",
  recovery: "Recovery",
  focus: "Focus",
};

export const protocolTypeColors: Record<Protocol["type"], string> = {
  morning: "bg-amber-100 text-amber-700",
  evening: "bg-indigo-100 text-indigo-700",
  recovery: "bg-emerald-100 text-emerald-700",
  focus: "bg-sky-100 text-sky-700",
};

export const dimensionIcons: Record<Dimension, string> = {
  physical: "💪",
  mental: "🧠",
  emotional: "❤️",
  social: "👥",
};

export function getEnergyColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function getEnergyBgClass(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function getEnergyCalendarClass(score: number): string {
  if (score >= 80) return "bg-green-400";
  if (score >= 60) return "bg-amber-400";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-400";
}
