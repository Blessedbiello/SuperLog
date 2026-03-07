import { UserPlus, Activity, Award } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: 1,
    title: "Create Account",
    description: "Sign up with Google or email to get started.",
  },
  {
    icon: Activity,
    number: 2,
    title: "Track Everything",
    description: "Commits, tweets, blogs — all logged in one place.",
  },
  {
    icon: Award,
    number: 3,
    title: "Get Recognized",
    description: "Build your portfolio and earn rewards.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            How It Works
          </h2>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Dashed connecting line */}
          <div className="absolute top-12 left-1/6 right-1/6 hidden h-px border-t-2 border-dashed border-slate-700 md:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                {step.number}
              </div>
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center">
                <step.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
