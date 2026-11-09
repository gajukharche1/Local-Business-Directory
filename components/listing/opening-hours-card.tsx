import { Clock, CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import { getOpeningStatus, WeekSchedule } from "@/lib/utils/opening-hours";

interface OpeningHoursCardProps {
  openingHours: unknown;
}

const DAYS_DISPLAY: Array<{ key: keyof WeekSchedule; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr || "0", 10);
  const m = mStr || "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

export function OpeningHoursCard({ openingHours }: OpeningHoursCardProps) {
  const status = getOpeningStatus(openingHours);
  const schedule = openingHours as Partial<WeekSchedule> | null;

  // Determine current day of week in India Standard Time
  const now = new Date();
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(now).toLowerCase();

  return (
    <div id="timings" className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Operational Hours</h3>
            <p className="text-[11px] text-muted-foreground">Standard weekly timetable</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            status.isOpen
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {status.isOpen ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          <span>{status.statusText}</span>
        </span>
      </div>

      {schedule ? (
        <div className="space-y-1.5 text-xs">
          {DAYS_DISPLAY.map(({ key, label }) => {
            const day = schedule[key];
            const isClosed = !day || day.closed;
            const isToday = key === dayName;

            return (
              <div
                key={key}
                className={`flex items-center justify-between py-2 px-3 rounded-xl transition ${
                  isToday
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-700/50 font-bold"
                    : "hover:bg-muted/40 font-medium border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isToday ? "text-emerald-800 dark:text-emerald-300 font-extrabold" : "text-foreground"}>
                    {label}
                  </span>
                  {isToday && (
                    <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.2 rounded-md bg-emerald-600 text-white shadow-2xs">
                      Today
                    </span>
                  )}
                </div>

                <span
                  className={
                    isClosed
                      ? "text-destructive font-bold"
                      : isToday
                      ? "text-emerald-800 dark:text-emerald-300 font-extrabold font-mono"
                      : "text-muted-foreground font-mono"
                  }
                >
                  {isClosed
                    ? "Closed"
                    : `${formatTime12h(day.open)} – ${formatTime12h(day.close)}`}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-muted-foreground">
          <CalendarDays className="h-6 w-6 mx-auto mb-1 opacity-40" />
          <p>Regular operating schedule not provided by business.</p>
        </div>
      )}
    </div>
  );
}
