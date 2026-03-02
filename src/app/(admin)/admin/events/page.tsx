import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default async function AdminEventsPage() {
  const events = await prisma.calendarEvent.findMany({
    where: { type: { in: ["COMMUNITY_EVENT", "HACKATHON"] } },
    orderBy: { startTime: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Events</h2>
          <p className="text-sm text-gray-500">Manage hackathons and community events</p>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No events</h3>
            <p className="text-sm text-gray-500">Create community events from the Calendar page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.type === "HACKATHON" ? "warning" : "info"}>
                        {event.type.replace("_", " ")}
                      </Badge>
                      <Badge variant={event.status === "COMPLETED" ? "success" : "default"}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(event.startTime, "MMM d, yyyy h:mm a")} - {format(event.endTime, "h:mm a")}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">by {event.user.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
