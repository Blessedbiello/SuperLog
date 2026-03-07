"use client";

import { useState, useEffect } from "react";

interface BlogPost {
  id: string;
  title: string;
  url: string;
  platform: string | null;
  summary: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  verification?: { status: string } | null;
}

export function useBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async (withLoading: boolean = true) => {
    if (withLoading) setLoading(true);
    const res = await fetch("/api/blogs");
    if (res.ok) {
      const data = await res.json();
      setBlogs(data.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchBlogs(false);
  }, []);

  return { blogs, loading, refresh: () => fetchBlogs(true) };
}
