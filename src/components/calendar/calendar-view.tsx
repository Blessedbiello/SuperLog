"use client";

import { useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DateSelectArg, EventChangeArg } from "@fullcalendar/core";
import { Plus, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventForm, type CalendarEventData } from "@/components/calendar/event-form";
import { getEventColor } from "@/lib/calendar/utils";
import type { CalendarEventType } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  startTime: string;
  endTime: string;
  status: string;
  goalId?: string | null;
  projectId?: string | null;
  goal?: { id: string; title: string } | null;
  project?: { id: string; name: string } | null;
}

interface GoalOption {
  id: string;
  title: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface CalendarViewProps {
  initialEvents: RawEvent[];
  goals?: GoalOption[];
  projects?: ProjectOption[];
}

// ─── Converter ────────────────────────────────────────────────────────────────

function toFcEvent(ev: RawEvent) {
  const colors = getEventColor(ev.type);
  return {
    id:              ev.id,
    title:           ev.title,
    start:           ev.startTime,
    end:             ev.endTime,
    backgroundColor: colors.bg,
    borderColor:     colors.border,
    textColor:       colors.text,
    extendedProps: {
      type:      ev.type,
      status:    ev.status,
      goalId:    ev.goalId,
      projectId: ev.projectId,
      goal:      ev.goal,
      project:   ev.project,
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalendarView({ initialEvents, goals = [], projects = [] }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<RawEvent[]>(initialEvents);
  const [view, setView]     = useState<"dayGridMonth" | "timeGridWeek">("dayGridMonth");

  const [formOpen, setFormOpen]     = useState(false);
  const [editData, setEditData]     = useState<Partial<CalendarEventData> | null>(null);

  // ── Switch view ────────────────────────────────────────────────────────────
  function switchView(newView: "dayGridMonth" | "timeGridWeek") {
    setView(newView);
    calendarRef.current?.getApi().changeView(newView);
  }

  // ── Open create form (optionally pre-filled with selected time range) ──────
  function openCreate(defaultStart?: string, defaultEnd?: string) {
    setEditData(
      defaultStart
        ? { startTime: defaultStart, endTime: defaultEnd ?? defaultStart }
        : null,
    );
    setFormOpen(true);
  }

  // ── Open edit form from event click ───────────────────────────────────────
  const handleEventClick = useCallback((info: EventClickArg) => {
    const ev = events.find((e) => e.id === info.event.id);
    if (!ev) return;
    setEditData({
      id:        ev.id,
      title:     ev.title,
      type:      ev.type,
      startTime: ev.startTime,
      endTime:   ev.endTime,
      status:    ev.status as CalendarEventData["status"],
      goalId:    ev.goalId,
      projectId: ev.projectId,
    });
    setFormOpen(true);
  }, [events]);

  // ── Drag-select time slot in week view to pre-fill create form ─────────────
  const handleDateSelect = useCallback((info: DateSelectArg) => {
    openCreate(info.startStr, info.endStr);
    calendarRef.current?.getApi().unselect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag-and-drop / resize to persist new times ────────────────────────────
  const handleEventChange = useCallback(async (info: EventChangeArg) => {
    const { id, startStr, endStr } = info.event;
    if (!startStr || !endStr) { info.revert(); return; }

    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startStr,
          endTime:   endStr,
        }),
      });
      if (!res.ok) { info.revert(); return; }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, startTime: startStr, endTime: endStr } : e,
        ),
      );
    } catch {
      info.revert();
    }
  }, []);

  // ── Save from form (create or update) ─────────────────────────────────────
  function handleSaved(saved: CalendarEventData) {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === saved.id);
      if (exists) {
        return prev.map((e) =>
          e.id === saved.id ? { ...e, ...saved } as RawEvent : e,
        );
      }
      return [...prev, saved as RawEvent];
    });
  }

  // ── Fetch events when calendar navigates to a new date range ──────────────
  async function handleDatesSet(info: { startStr: string; endStr: string }) {
    try {
      const res = await fetch(
        `/api/calendar?start=${encodeURIComponent(info.startStr)}&end=${encodeURIComponent(info.endStr)}`,
      );
      const json = await res.json();
      if (json.success) setEvents(json.data as RawEvent[]);
    } catch {
      // Silently ignore; keep existing events
    }
  }

  const fcEvents = events.map(toFcEvent);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => switchView("dayGridMonth")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors
              ${view === "dayGridMonth"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-50"
              }`}
          >
            <CalendarDays className="h-4 w-4" />
            Month
          </button>
          <button
            onClick={() => switchView("timeGridWeek")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l border-slate-200
              ${view === "timeGridWeek"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-50"
              }`}
          >
            <Clock className="h-4 w-4" />
            Week
          </button>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => openCreate()}
        >
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* FullCalendar */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden fc-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left:   "prev,next today",
            center: "title",
            right:  "",
          }}
          events={fcEvents}
          editable
          selectable
          selectMirror
          dayMaxEvents={3}
          nowIndicator
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventChange={handleEventChange}
          datesSet={handleDatesSet}
          height="auto"
          eventTimeFormat={{
            hour:   "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
        />
      </div>

      {/* Event color legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {(
          [
            ["FOCUS_BLOCK",     "#10b981"],
            ["COMMUNITY_EVENT", "#8b5cf6"],
            ["HACKATHON",       "#f59e0b"],
            ["CONTENT_PUBLISH", "#3b82f6"],
            ["LEARNING",        "#06b6d4"],
            ["COLLABORATION",   "#ec4899"],
            ["PERSONAL",        "#6b7280"],
          ] as const
        ).map(([type, color]) => (
          <span key={type} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="h-3 w-3 rounded-sm shrink-0"
              style={{ backgroundColor: color }}
            />
            {type
              .toLowerCase()
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        ))}
      </div>

      {/* Create / Edit modal */}
      <EventForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSaved={handleSaved}
        initialData={editData}
        goals={goals}
        projects={projects}
      />
    </div>
  );
}
