"use client";

import { useState } from "react";
import { Clock, Check, X, Sparkles, Copy } from "lucide-react";
import { WeekSchedule } from "@/lib/utils/opening-hours";
import { DEFAULT_WEEK_SCHEDULE } from "@/lib/utils/opening-hours-parser";

interface OpeningHoursSchedulerProps {
  name?: string;
  initialHours?: unknown;
}

const DAYS: Array<{ key: keyof WeekSchedule; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function OpeningHoursScheduler({
  name = "openingHours",
  initialHours,
}: OpeningHoursSchedulerProps) {
  const [schedule, setSchedule] = useState<WeekSchedule>(() => {
    if (initialHours && typeof initialHours === "object") {
      return { ...DEFAULT_WEEK_SCHEDULE, ...(initialHours as Partial<WeekSchedule>) };
    }
    return { ...DEFAULT_WEEK_SCHEDULE };
  });

  const handleToggleDay = (day: keyof WeekSchedule) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
      },
    }));
  };

  const handleTimeChange = (
    day: keyof WeekSchedule,
    field: "open" | "close",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const applyPreset = (presetType: "standard" | "daily" | "corporate" | "247") => {
    if (presetType === "standard") {
      setSchedule({
        monday: { open: "09:00", close: "21:00", closed: false },
        tuesday: { open: "09:00", close: "21:00", closed: false },
        wednesday: { open: "09:00", close: "21:00", closed: false },
        thursday: { open: "09:00", close: "21:00", closed: false },
        friday: { open: "09:00", close: "21:00", closed: false },
        saturday: { open: "09:00", close: "21:00", closed: false },
        sunday: { open: "10:00", close: "20:00", closed: true },
      });
    } else if (presetType === "daily") {
      const daily: any = {};
      DAYS.forEach((d) => {
        daily[d.key] = { open: "09:00", close: "21:00", closed: false };
      });
      setSchedule(daily as WeekSchedule);
    } else if (presetType === "corporate") {
      setSchedule({
        monday: { open: "09:00", close: "18:00", closed: false },
        tuesday: { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday: { open: "09:00", close: "18:00", closed: false },
        friday: { open: "09:00", close: "18:00", closed: false },
        saturday: { open: "10:00", close: "14:00", closed: true },
        sunday: { open: "10:00", close: "14:00", closed: true },
      });
    } else if (presetType === "247") {
      const allDay: any = {};
      DAYS.forEach((d) => {
        allDay[d.key] = { open: "00:00", close: "23:59", closed: false };
      });
      setSchedule(allDay as WeekSchedule);
    }
  };

  const copyMondayToWeekdays = () => {
    const mondayConfig = schedule.monday;
    setSchedule((prev) => ({
      ...prev,
      tuesday: { ...mondayConfig },
      wednesday: { ...mondayConfig },
      thursday: { ...mondayConfig },
      friday: { ...mondayConfig },
      saturday: { ...mondayConfig },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Hidden serialization input for FormData submission */}
      <input type="hidden" name={name} value={JSON.stringify(schedule)} />

      {/* Preset Action Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          Quick Presets:
        </span>
        <button
          type="button"
          onClick={() => applyPreset("standard")}
          className="rounded-lg border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition"
        >
          Mon–Sat 9AM–9PM (Sun Closed)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("daily")}
          className="rounded-lg border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition"
        >
          Everyday 9AM–9PM
        </button>
        <button
          type="button"
          onClick={() => applyPreset("corporate")}
          className="rounded-lg border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition"
        >
          Office Mon–Fri 9AM–6PM
        </button>
        <button
          type="button"
          onClick={() => applyPreset("247")}
          className="rounded-lg border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition"
        >
          24/7 Always Open
        </button>
      </div>

      {/* 7-Day Matrix Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
        <div className="divide-y divide-border/60">
          {DAYS.map(({ key, label }) => {
            const dayConfig = schedule[key] || { open: "09:00", close: "21:00", closed: false };
            const isClosed = dayConfig.closed;

            return (
              <div
                key={key}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 transition-colors ${
                  isClosed ? "bg-muted/15" : "hover:bg-muted/30"
                }`}
              >
                {/* Day Header + Status Toggle */}
                <div className="flex items-center gap-3 min-w-[160px]">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(key)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                      isClosed
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {isClosed ? (
                      <>
                        <X className="h-3 w-3" />
                        <span>Closed</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Open</span>
                      </>
                    )}
                  </button>

                  <span className={`text-xs font-bold ${isClosed ? "text-muted-foreground" : "text-foreground"}`}>
                    {label}
                  </span>

                  {key === "monday" && !isClosed && (
                    <button
                      type="button"
                      onClick={copyMondayToWeekdays}
                      title="Copy Monday hours to Tuesday through Saturday"
                      className="hidden md:inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy to Mon–Sat</span>
                    </button>
                  )}
                </div>

                {/* Time Selection Inputs */}
                {!isClosed ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground font-medium">Opens:</span>
                      <input
                        type="time"
                        value={dayConfig.open}
                        onChange={(e) => handleTimeChange(key, "open", e.target.value)}
                        className="rounded-lg border bg-background px-2.5 py-1 text-xs font-mono font-medium text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <span className="text-muted-foreground text-xs font-bold">–</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground font-medium">Closes:</span>
                      <input
                        type="time"
                        value={dayConfig.close}
                        onChange={(e) => handleTimeChange(key, "close", e.target.value)}
                        className="rounded-lg border bg-background px-2.5 py-1 text-xs font-mono font-medium text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground italic">
                    Closed all day
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

