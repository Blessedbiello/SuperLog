"use client";

import { useState, useEffect } from "react";

interface Activity {
  id: string;
  type: string;
  title: string;
  url?: string | null;
  date: string;
}

export function useActivities(filters?: { type?: string; projectId?: string; limit?: number }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async (withLoading: boolean = true) => {
    if (withLoading) setLoading(true);
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.projectId) params.set("projectId", filters.projectId);
    if (filters?.limit) params.set("limit", String(filters.limit));

    const res = await fetch(`/api/activities?${params}`);
    if (res.ok) {
      const data = await res.json();
      setActivities(data.data?.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchActivities(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.type, filters?.projectId, filters?.limit]);

  return { activities, loading, refresh: () => fetchActivities(true) };
}
