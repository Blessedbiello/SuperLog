"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    githubUsername: string | null;
    twitterHandle: string | null;
    level: number;
    xp: number;
    badges: { id: string; name: string; icon: string | null }[];
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [twitterHandle, setTwitterHandle] = useState(user.twitterHandle || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, twitterHandle }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const profileUrl = user.githubUsername ? `/p/${user.githubUsername}` : `/p/${user.id}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle>Public Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar src={user.image} name={user.name} size="lg" />
                <div>
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Avatar synced from GitHub</p>
                </div>
              </div>
              <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about yourself..." rows={3} />
              <Input label="Twitter Handle" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@handle" />
              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" loading={saving}>
                  {saved ? "Saved!" : "Save Profile"}
                </Button>
                <Link href={profileUrl} target="_blank" className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                  <ExternalLink className="h-4 w-4" /> View public profile
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Level & XP</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">{user.level}</p>
              <p className="text-sm text-gray-500">{user.xp} XP</p>
            </div>
          </CardContent>
        </Card>

        {user.badges.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((b) => (
                  <div key={b.id} className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-800">{b.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
