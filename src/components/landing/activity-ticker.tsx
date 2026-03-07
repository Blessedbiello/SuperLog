"use client";

import Image from "next/image";

interface Activity {
  type: string;
  title: string;
  userName: string;
  userImage: string | null;
}

export function ActivityTicker({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null;

  const items = [...activities, ...activities]; // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-y border-slate-800 bg-emerald-950/30">
      <div className="animate-marquee flex whitespace-nowrap py-3">
        {items.map((activity, i) => (
          <div
            key={i}
            className="mx-6 flex shrink-0 items-center gap-2 text-sm text-slate-400"
          >
            {activity.userImage ? (
              <Image
                src={activity.userImage}
                alt={activity.userName}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-slate-700" />
            )}
            <span className="text-slate-300 font-medium">
              {activity.userName}
            </span>
            <span>{activity.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
