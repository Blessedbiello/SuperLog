"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

interface SyncResult {
  newActivities: number;
  reposSynced: string[];
  message: string;
}

interface GitHubSyncButtonProps {
  /** Repo to restrict the sync to, in "owner/repo" format. Omit for all repos. */
  repo?: string;
  /** Disable the button (e.g. when no GitHub account is linked). */
  disabled?: boolean;
}

type SyncStatus = "idle" | "loading" | "success" | "error";

export function GitHubSyncButton({ repo, disabled = false }: GitHubSyncButtonProps) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSync() {
    setStatus("loading");
    setResult(null);
    setErrorMessage(null);

    try {
      const url = new URL("/api/github/sync", window.location.origin);
      if (repo) url.searchParams.set("repo", repo);

      const response = await fetch(url.toString(), { method: "POST" });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Sync failed. Please try again.");
      }

      setResult(json.data as SyncResult);
      setStatus("success");

      // Refresh the page after a short delay so the activity list updates
      setTimeout(() => {
        window.location.reload();
      }, 1800);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={handleSync}
        loading={isLoading}
        disabled={disabled || isLoading}
        aria-label={isLoading ? "Syncing GitHub activities…" : "Sync GitHub activities now"}
      >
        <RefreshCw
          className={clsx("h-3.5 w-3.5", isLoading && "animate-spin")}
          aria-hidden="true"
        />
        {isLoading ? "Syncing…" : "Sync Now"}
      </Button>

      {/* Inline result feedback */}
      {status === "success" && result && (
        <p className="flex items-center gap-1 text-xs text-emerald-700" role="status">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          {result.message}
        </p>
      )}

      {status === "error" && errorMessage && (
        <p className="flex items-center gap-1 text-xs text-red-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
