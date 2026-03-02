import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ShoutoutCardProps {
  message: string;
  from: { name: string | null; image: string | null };
  to: { name: string | null; image: string | null };
  createdAt: string;
}

export function ShoutoutCard({ message, from, to, createdAt }: ShoutoutCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Heart className="mt-1 h-5 w-5 shrink-0 text-pink-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <Avatar src={from.image} name={from.name} size="sm" />
              <span className="font-medium text-gray-900">{from.name}</span>
              <span className="text-gray-400">shouted out</span>
              <Avatar src={to.image} name={to.name} size="sm" />
              <span className="font-medium text-gray-900">{to.name}</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{message}</p>
            <p className="mt-1 text-xs text-gray-400">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
