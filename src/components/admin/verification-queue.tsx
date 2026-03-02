"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface QueueItem {
  id: string;
  type: string;
  title: string;
  url: string | null;
  userName: string | null;
  createdAt: string;
}

export function VerificationQueue({ items }: { items: QueueItem[] }) {
  const router = useRouter();

  const handleAction = async (id: string, action: "VERIFIED" | "REJECTED", notes?: string) => {
    await fetch("/api/admin/verification", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: action, notes }),
    });
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">All caught up!</h3>
          <p className="text-sm text-gray-500">No pending verifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={item.type === "github" ? "info" : item.type === "tweet" ? "warning" : "success"}>
                    {item.type}
                  </Badge>
                  <span className="text-xs text-gray-400">{item.userName}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900 truncate">{item.title}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700">
                    <ExternalLink className="h-3 w-3" /> View source
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => handleAction(item.id, "REJECTED")}>
                  <XCircle className="mr-1 h-4 w-4 text-red-500" /> Reject
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleAction(item.id, "VERIFIED")}>
                  <CheckCircle className="mr-1 h-4 w-4" /> Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
