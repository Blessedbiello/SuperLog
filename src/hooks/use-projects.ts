"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async (withLoading: boolean = true) => {
    if (withLoading) setLoading(true);
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchProjects(false);
  }, []);

  return { projects, loading, refresh: () => fetchProjects(true) };
}
