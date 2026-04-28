import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { ArrowRight, Zap, Activity, TrendingUp, BarChart3, Heart, Battery, Brain, Flame, Shield, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white text-sm font-bold">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">{appConfig.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 mb-8">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">Energy Intelligence Platform</span>
          </div>
          <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1]">
            Super fuel
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Your energy is your edge. Measure it. Optimize it. Protect it.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-12 text-base">
                Start your diagnostic
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Energy Score Visual */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-orange-500 tracking-widest uppercase mb-3">Your energy score</p>
            <h2 className="text-3xl font-bold">One number. Complete clarity.</h2>
          </div>
          <div className="flex flex-col items-center">
            {/* SVG Energy Ring */}
            <div className="relative w-56 h-56 mb-8">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 85 * 0.74} ${2 * Math.PI * 85 * 0.26}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold text-foreground">74</span>
                <span className="text-sm text-muted-foreground font-medium">out of 100</span>
              </div>
            </div>
            {/* Quadrant dimensions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
              {[
                { label: "Physical", score: 82, icon: Activity, color: "text-orange-500 bg-orange-50 border-orange-200" },
                { label: "Mental", score: 68, icon: Brain, color: "text-green-500 bg-green-50 border-green-200" },
                { label: "Emotional", score: 71, icon: Heart, color: "text-rose-500 bg-rose-50 border-rose-200" },
                { label: "Recovery", score: 76, icon: Battery, color: "text-blue-500 bg-blue-50 border-blue-200" },
              ].map((dim) => (
                <div key={dim.label} className={`rounded-xl border p-4 text-center ${dim.color}`}>
                  <dim.icon className="h-5 w-5 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{dim.score}</p>
                  <p className="text-xs font-medium opacity-70">{dim.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-gradient-to-b from-green-50/50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-medium text-orange-500 tracking-widest uppercase mb-3">Capabilities</p>
          <h2 className="text-3xl font-bold">Your performance toolkit</h2>
          <p className="mt-2 text-muted-foreground max-w-xl">Five instruments to understand, protect, and amplify your energy.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3 sm:grid-cols-2">
            {[
              {
                icon: Activity,
                title: "Energy Diagnostic",
                desc: "Comprehensive baseline assessment across physical, mental, emotional, and recovery dimensions.",
              },
              {
                icon: Zap,
                title: "Performance Protocols",
                desc: "Personalized daily protocols calibrated to your energy profile and goals.",
              },
              {
                icon: BarChart3,
                title: "Daily Tracking",
                desc: "Quick daily check-ins that build a longitudinal picture of your energy patterns.",
              },
              {
                icon: TrendingUp,
                title: "Trend Intelligence",
                desc: "AI-powered pattern detection that surfaces what drives your best and worst days.",
              },
              {
                icon: Shield,
                title: "SMILE Framework",
                desc: "The five-pillar methodology behind every protocol, score, and recommendation.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-background p-6 hover:shadow-md hover:border-orange-200 transition-all">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100">
                  <feature.icon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SMILE Framework */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-green-600" />
              <span className="text-sm font-medium text-green-700">The Methodology</span>
            </div>
            <h2 className="text-3xl font-bold">Powered by the SMILE Framework</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Five pillars that form the foundation of sustainable high performance.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5 sm:grid-cols-3">
            {[
              { letter: "S", name: "Energy Resilience", desc: "Build systems that sustain output under pressure", color: "border-orange-300 bg-orange-50" },
              { letter: "M", name: "Resource Efficiency", desc: "Do more with less energy drain", color: "border-green-300 bg-green-50" },
              { letter: "I", name: "Emotional OS", desc: "Regulate the operating system beneath performance", color: "border-blue-300 bg-blue-50" },
              { letter: "L", name: "Adaptation", desc: "Evolve protocols as your body and context change", color: "border-purple-300 bg-purple-50" },
              { letter: "E", name: "Capacity Building", desc: "Expand the container, not just the contents", color: "border-rose-300 bg-rose-50" },
            ].map((pillar) => (
              <div key={pillar.letter} className={`rounded-xl border-2 p-5 text-center ${pillar.color}`}>
                <span className="text-3xl font-extrabold">{pillar.letter}</span>
                <h3 className="mt-2 text-sm font-semibold">{pillar.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t bg-gradient-to-b from-orange-50/50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-2xl border bg-background p-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-extrabold text-orange-500">74</p>
                <p className="text-sm text-muted-foreground mt-1">30-day avg energy</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-green-500">12</p>
                <p className="text-sm text-muted-foreground mt-1">Day streak</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-blue-500">87%</p>
                <p className="text-sm text-muted-foreground mt-1">Protocol compliance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold">Your energy is your edge</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop guessing. Start measuring. Join the waitlist for early access.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-12 text-base">
              Get early access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} {appConfig.name}. All rights reserved.</span>
          <span>A 12 Cities venture</span>
        </div>
      </footer>
    </div>
  );
}
