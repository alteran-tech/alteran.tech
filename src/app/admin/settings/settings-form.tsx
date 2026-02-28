"use client";

import { useState, useTransition } from "react";
import { GlassPanel, GlowButton, Input } from "@/components/ui";
import { saveContactSettings } from "@/lib/actions/settings";

interface SettingsFormProps {
  initialGithubUrl: string;
  initialEmail: string;
}

export function SettingsForm({ initialGithubUrl, initialEmail }: SettingsFormProps) {
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [email, setEmail] = useState(initialEmail);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await saveContactSettings({ githubUrl, email });
      setResult(res);
    });
  }

  return (
    <GlassPanel variant="default" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="GitHub URL"
            type="url"
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            disabled={isPending}
          />
          <Input
            label="Email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>

        {result && (
          <div
            className={`p-3 rounded-lg text-sm ${
              result.success
                ? "bg-ancient-teal/10 border border-ancient-teal/20 text-ancient-teal"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {result.success ? "Настройки сохранены" : result.error}
          </div>
        )}

        <div className="flex justify-end">
          <GlowButton type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? "Сохранение..." : "Сохранить"}
          </GlowButton>
        </div>
      </form>
    </GlassPanel>
  );
}
