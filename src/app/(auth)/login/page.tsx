"use client";

import { signIn } from "next-auth/react";
import { Zap, Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Branding */}
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/25">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">SuperLog</h1>
            <p className="mt-2 text-lg text-slate-400">
              Track your proof-of-work. Build your portfolio.
            </p>
          </div>
        </div>

        {/* Sign in card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-8 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Welcome</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with your GitHub account to start tracking your contributions
          </p>

          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-gray-100"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>

          <p className="mt-4 text-xs text-slate-500">
            By signing in, you agree to track your open-source contributions
            and build-in-public activities with SuperLog.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600">
          A proof-of-work operating system for Superteam Nigeria
        </p>
      </div>
    </div>
  );
}
