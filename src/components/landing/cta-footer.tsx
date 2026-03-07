import Link from "next/link";
import { Zap } from "lucide-react";

export function CtaFooter() {
  return (
    <footer>
      {/* CTA Section */}
      <section className="bg-gradient-to-b from-emerald-900/20 to-slate-950 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to prove your work?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Join developers across Nigeria building their proof-of-work
            portfolio.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Get Started with GitHub
          </Link>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-white">SuperLog</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SuperLog. Built for Superteam
            Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
}
