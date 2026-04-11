"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { assessmentQuestions, type Dimension } from "@/lib/data/energy";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

const dimensions: Dimension[] = ["physical", "mental", "emotional", "social"];
const dimensionLabels: Record<Dimension, string> = {
  physical: "Physical Energy",
  mental: "Mental Clarity",
  emotional: "Emotional Balance",
  social: "Social Connection",
};
const dimensionColors: Record<Dimension, string> = {
  physical: "#22c55e",
  mental: "#3b82f6",
  emotional: "#f59e0b",
  social: "#a855f7",
};
const dimensionEmojis: Record<Dimension, string> = {
  physical: "💪",
  mental: "🧠",
  emotional: "❤️",
  social: "👥",
};

function RadarChart({ scores }: { scores: Record<Dimension, number> }) {
  const center = 120;
  const maxRadius = 90;
  const dims = dimensions;
  const angleStep = (2 * Math.PI) / dims.length;

  function getPoint(index: number, value: number): [number, number] {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  }

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[300px] mx-auto">
      {/* Grid */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={dims.map((_, i) => getPoint(i, level).join(",")).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
        />
      ))}
      {/* Axes */}
      {dims.map((_, i) => {
        const [x, y] = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-border"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={dims.map((d, i) => getPoint(i, scores[d]).join(",")).join(" ")}
        fill="oklch(0.65 0.2 250 / 0.2)"
        stroke="oklch(0.65 0.2 250)"
        strokeWidth="2"
      />
      {/* Data points */}
      {dims.map((d, i) => {
        const [x, y] = getPoint(i, scores[d]);
        return (
          <circle key={d} cx={x} cy={y} r="4" fill={dimensionColors[d]} />
        );
      })}
      {/* Labels */}
      {dims.map((d, i) => {
        const [x, y] = getPoint(i, 115);
        return (
          <text
            key={d}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-foreground font-medium"
          >
            {dimensionLabels[d].split(" ")[0]}
          </text>
        );
      })}
    </svg>
  );
}

function ScaleSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 justify-center mt-6">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`h-12 w-12 rounded-full text-lg font-bold transition-all border-2 ${
            value === v
              ? "border-primary bg-primary text-primary-foreground scale-110"
              : "border-border bg-background text-muted-foreground hover:border-primary/50"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

const recommendations: Record<Dimension, string[]> = {
  physical: [
    "Aim for 7-8 hours of sleep tonight",
    "Add a 20-minute walk after lunch",
    "Drink 8 glasses of water daily",
    "Schedule a recovery day this week",
  ],
  mental: [
    "Try a 2-hour deep work block tomorrow",
    "Reduce notifications during focus time",
    "Practice 5 minutes of mindful breathing",
    "Take breaks every 90 minutes",
  ],
  emotional: [
    "Write 3 things you are grateful for tonight",
    "Set clear boundaries on one commitment",
    "Spend 10 minutes on something creative",
    "Practice self-compassion during setbacks",
  ],
  social: [
    "Schedule a meaningful conversation this week",
    "Send a message of appreciation to someone",
    "Join a community event or group activity",
    "Set aside phone-free time with loved ones",
  ],
};

export default function AssessPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState(0); // 0-3 for dimensions, 4 for results
  const [showResults, setShowResults] = useState(false);

  const currentDimension = dimensions[currentStep];
  const currentQuestions = assessmentQuestions.filter(
    (q) => q.dimension === currentDimension
  );

  const allAnswered = currentQuestions.every((q) => answers[q.id] !== undefined);

  const totalQuestions = assessmentQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = showResults ? 100 : (answeredCount / totalQuestions) * 100;

  const dimensionScores = useMemo(() => {
    const scores: Record<Dimension, number> = {
      physical: 0,
      mental: 0,
      emotional: 0,
      social: 0,
    };
    for (const dim of dimensions) {
      const qs = assessmentQuestions.filter((q) => q.dimension === dim);
      const total = qs.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
      scores[dim] = Math.round((total / (qs.length * 5)) * 100);
    }
    return scores;
  }, [answers]);

  const overallScore = useMemo(() => {
    const vals = Object.values(dimensionScores);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [dimensionScores]);

  function handleNext() {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  }

  function handleBack() {
    if (showResults) {
      setShowResults(false);
      setCurrentStep(3);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleReset() {
    setAnswers({});
    setCurrentStep(0);
    setShowResults(false);
  }

  if (showResults) {
    const weakest = dimensions.reduce((a, b) =>
      dimensionScores[a] < dimensionScores[b] ? a : b
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Results</h1>
            <p className="text-muted-foreground">Your energy profile across all dimensions</p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Energy Profile</CardTitle>
              <CardDescription>Overall score: {overallScore}/100</CardDescription>
            </CardHeader>
            <CardContent>
              <RadarChart scores={dimensionScores} />
            </CardContent>
          </Card>

          {/* Dimension Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Dimension Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dimensions.map((dim) => (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span>{dimensionEmojis[dim]}</span>
                      {dimensionLabels[dim]}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: dimensionColors[dim] }}
                    >
                      {dimensionScores[dim]}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dimensionScores[dim]}%`,
                        backgroundColor: dimensionColors[dim],
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
            <CardDescription>
              Focus area: {dimensionLabels[weakest]} ({dimensionScores[weakest]}/100)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendations[weakest].map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <span className="mt-0.5 text-lg">{dimensionEmojis[weakest]}</span>
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Energy Assessment</h1>
        <p className="text-muted-foreground">
          Rate each statement on a scale of 1 (low) to 5 (high)
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of 4 &mdash;{" "}
            <span className="font-medium text-foreground">
              {dimensionEmojis[currentDimension]} {dimensionLabels[currentDimension]}
            </span>
          </span>
          <span>{answeredCount}/{totalQuestions} answered</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {currentQuestions.map((q) => (
          <Card key={q.id}>
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-center">{q.text}</p>
              <ScaleSelector
                value={answers[q.id] || 0}
                onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
                <span>Very low</span>
                <span>Very high</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!allAnswered}>
          {currentStep === 3 ? "See Results" : "Next"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
