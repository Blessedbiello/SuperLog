import Link from "next/link";
import { Zap } from "lucide-react";

function ContributionGrid() {
  const cells = Array.from({ length: 35 }, (_, i) => {
    const opacities = [0.1, 0.2, 0.3, 0.5, 0.7, 0.9];
    const opacity = opacities[Math.floor(Math.random() * opacities.length)];
    return (
      <div
        key={i}
        className="h-3 w-3 rounded-sm"
        style={{
          backgroundColor: `rgba(16, 185, 129, ${opacity})`,
          animationDelay: `${i * 50}ms`,
        }}
      />
    );
  });

  return (
    <div className="grid grid-cols-7 gap-1.5 animate-fade-in-up">
      {cells}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #475569 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center lg:text-left">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {/* Logo */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300">
              <Zap className="h-4 w-4 text-emerald-400" />
              SuperLog
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Proof-of-Work
              </span>
              , Verified.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-400">
              Track contributions. Build your portfolio. Get recognized in
              Superteam Nigeria.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
              >
                Get Started
              </Link>
              <Link
                href="/p"
                className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
              >
                Explore Profiles
              </Link>
            </div>
          </div>

          {/* Contribution grid */}
          <div className="hidden lg:flex justify-center">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8">
              <p className="mb-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contribution Activity
              </p>
              <ContributionGrid />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
