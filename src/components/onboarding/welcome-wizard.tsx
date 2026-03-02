"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Zap, Github, User, FolderKanban, CheckCircle } from "lucide-react";

const STEPS = [
  { title: "Welcome to SuperLog", icon: Zap },
  { title: "Set Up Your Profile", icon: User },
  { title: "Create Your First Project", icon: FolderKanban },
  { title: "You're All Set!", icon: CheckCircle },
];

export function WelcomeWizard() {
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectCategory, setProjectCategory] = useState("SIDE");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleProfileSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, twitterHandle }),
    });
    setSaving(false);
    setStep(2);
  };

  const handleProjectCreate = async () => {
    if (!projectName.trim()) return;
    setSaving(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: projectName, category: projectCategory }),
    });
    setSaving(false);
    setStep(3);
  };

  const handleFinish = () => router.push("/dashboard");

  const Icon = STEPS[step].icon;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-2 w-12 rounded-full transition-colors ${i <= step ? "bg-emerald-500" : "bg-gray-200"}`} />
        ))}
      </div>

      <div className="rounded-xl border bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
          <Icon className="h-7 w-7 text-emerald-500" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">{STEPS[step].title}</h2>

        {step === 0 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              SuperLog helps you track your proof-of-work, set goals, and build your portfolio.
              Let&apos;s get you set up in under 2 minutes.
            </p>
            <Button variant="primary" onClick={() => setStep(1)}>Let&apos;s Go</Button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-4 text-left">
            <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What do you build?" />
            <Input label="Twitter Handle" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@yourhandle" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Skip</Button>
              <Button variant="primary" onClick={handleProfileSave} loading={saving}>Save & Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-4 text-left">
            <p className="text-sm text-gray-500 text-center">Add a project you&apos;re currently working on</p>
            <Input label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My awesome project" />
            <Select
              label="Category"
              options={[
                { value: "MAIN", label: "Main Project" },
                { value: "SIDE", label: "Side Project" },
                { value: "OPEN_SOURCE", label: "Open Source" },
                { value: "COMMUNITY", label: "Community" },
              ]}
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>Skip</Button>
              <Button variant="primary" onClick={handleProjectCreate} loading={saving}>Create & Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              You&apos;re ready to start tracking your proof-of-work. Log activities, set goals, and build your portfolio!
            </p>
            <Button variant="primary" onClick={handleFinish}>Go to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
