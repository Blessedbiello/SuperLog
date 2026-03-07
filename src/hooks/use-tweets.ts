"use client";

import { useState, useEffect } from "react";

interface Tweet {
  id: string;
  url: string;
  content: string | null;
  tweetId: string | null;
  tags: string[];
  postedAt: string | null;
  createdAt: string;
  verification?: { status: string } | null;
}

export function useTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTweets = async (withLoading: boolean = true) => {
    if (withLoading) setLoading(true);
    const res = await fetch("/api/tweets");
    if (res.ok) {
      const data = await res.json();
      setTweets(data.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchTweets(false);
  }, []);

  return { tweets, loading, refresh: () => fetchTweets(true) };
}
