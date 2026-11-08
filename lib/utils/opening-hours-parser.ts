import { DaySchedule, WeekSchedule } from "./opening-hours";

export const DEFAULT_WEEK_SCHEDULE: WeekSchedule = {
  monday: { open: "09:00", close: "21:00", closed: false },
  tuesday: { open: "09:00", close: "21:00", closed: false },
  wednesday: { open: "09:00", close: "21:00", closed: false },
  thursday: { open: "09:00", close: "21:00", closed: false },
  friday: { open: "09:00", close: "21:00", closed: false },
  saturday: { open: "09:00", close: "21:00", closed: false },
  sunday: { open: "10:00", close: "20:00", closed: true },
};

const DAYS_LIST: Array<keyof WeekSchedule> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** Convert 12-hour or arbitrary time string to "HH:mm" 24h format */
export function normalizeTimeString(timeStr: string): string {
  const clean = timeStr.trim().toLowerCase();
  if (!clean) return "09:00";

  // Check 12h format e.g. "9:00 am", "9pm", "10:30pm"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (match12) {
    let hours = parseInt(match12[1] || "0", 10);
    const minutes = match12[2] || "00";
    const period = match12[3];

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  // Check 24h format e.g. "9:00", "09:00", "21:30"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1] || "0", 10);
    const minutes = match24[2] || "00";
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  return clean.padStart(5, "0");
}

/**
 * Parses user input (string shorthand or raw JSON) into a normalized WeekSchedule.
 */
export function parseOpeningHoursInput(input?: string | null): WeekSchedule {
  if (!input || !input.trim()) {
    return { ...DEFAULT_WEEK_SCHEDULE };
  }

  const trimmed = input.trim();

  // 1. Try parsing direct JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const schedule: WeekSchedule = { ...DEFAULT_WEEK_SCHEDULE };
      for (const day of DAYS_LIST) {
        if (parsed[day]) {
          schedule[day] = {
            open: normalizeTimeString(parsed[day].open || "09:00"),
            close: normalizeTimeString(parsed[day].close || "21:00"),
            closed: Boolean(parsed[day].closed),
          };
        }
      }
      return schedule;
    } catch {
      // Fall through to text parsing
    }
  }

  // 2. Check "24/7" or "always open"
  const lower = trimmed.toLowerCase();
  if (lower.includes("24/7") || lower.includes("24 hours") || lower.includes("always open")) {
    const schedule: WeekSchedule = {} as WeekSchedule;
    for (const day of DAYS_LIST) {
      schedule[day] = { open: "00:00", close: "23:59", closed: false };
    }
    return schedule;
  }

  // 3. Simple time range e.g. "09:00-21:00" or "9am-9pm" or "9:00 AM - 9:00 PM"
  const simpleRangeMatch = trimmed.match(
    /^([0-9:apm\s]+)\s*[-–—to]\s*([0-9:apm\s]+)$/i
  );
  if (simpleRangeMatch) {
    const openTime = normalizeTimeString(simpleRangeMatch[1] || "09:00");
    const closeTime = normalizeTimeString(simpleRangeMatch[2] || "21:00");
    const schedule: WeekSchedule = {} as WeekSchedule;
    for (const day of DAYS_LIST) {
      // Sunday closed by convention if simple range
      const isSunday = day === "sunday";
      schedule[day] = {
        open: openTime,
        close: closeTime,
        closed: isSunday,
      };
    }
    return schedule;
  }

  // 4. Complex day segment strings e.g.:
  // "Mon-Sat: 09:00-21:00, Sun: Closed" or "Mon-Fri: 9am-6pm; Sat: 10am-4pm; Sun: Closed"
  const schedule: WeekSchedule = { ...DEFAULT_WEEK_SCHEDULE };
  const segments = trimmed.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);

  let hasMatchedSegment = false;
  for (const seg of segments) {
    const parts = seg.split(/[:=]\s*/);
    if (parts.length < 2) continue;

    const daysPart = parts[0]!.toLowerCase();
    const timePart = parts.slice(1).join(":").trim().toLowerCase();

    const isClosed = timePart.includes("closed") || timePart.includes("off");
    let openTime = "09:00";
    let closeTime = "21:00";

    if (!isClosed) {
      const times = timePart.split(/\s*[-–—to]\s*/);
      if (times.length === 2) {
        openTime = normalizeTimeString(times[0]!);
        closeTime = normalizeTimeString(times[1]!);
      }
    }

    // Determine affected days
    const targetDays: Array<keyof WeekSchedule> = [];
    if (daysPart.includes("mon-sat") || daysPart.includes("mon to sat")) {
      targetDays.push("monday", "tuesday", "wednesday", "thursday", "friday", "saturday");
    } else if (daysPart.includes("mon-fri") || daysPart.includes("mon to fri") || daysPart.includes("weekdays")) {
      targetDays.push("monday", "tuesday", "wednesday", "thursday", "friday");
    } else if (daysPart.includes("sat-sun") || daysPart.includes("weekends")) {
      targetDays.push("saturday", "sunday");
    } else if (daysPart.includes("daily") || daysPart.includes("everyday") || daysPart.includes("all days")) {
      targetDays.push(...DAYS_LIST);
    } else {
      for (const d of DAYS_LIST) {
        if (daysPart.includes(d.slice(0, 3))) {
          targetDays.push(d);
        }
      }
    }

    if (targetDays.length > 0) {
      hasMatchedSegment = true;
      for (const d of targetDays) {
        schedule[d] = {
          open: openTime,
          close: closeTime,
          closed: isClosed,
        };
      }
    }
  }

  if (hasMatchedSegment) {
    return schedule;
  }

  return { ...DEFAULT_WEEK_SCHEDULE };
}

/** Formats a WeekSchedule into a crisp, human-readable summary badge */
export function formatScheduleBrief(schedule: WeekSchedule | unknown): string {
  if (!schedule || typeof schedule !== "object") {
    return "Hours Not Specified";
  }

  const s = schedule as Partial<WeekSchedule>;
  const mon = s.monday;
  if (!mon || mon.closed) {
    return "Custom Schedule";
  }

  // Format 12h
  const [hStr1, mStr1] = mon.open.split(":");
  const h1 = parseInt(hStr1 || "9", 10);
  const p1 = h1 >= 12 ? "PM" : "AM";
  const h12_1 = h1 % 12 || 12;

  const [hStr2, mStr2] = mon.close.split(":");
  const h2 = parseInt(hStr2 || "21", 10);
  const p2 = h2 >= 12 ? "PM" : "AM";
  const h12_2 = h2 % 12 || 12;

  const timeRange = `${h12_1}${mStr1 !== "00" ? `:${mStr1}` : ""} ${p1} – ${h12_2}${mStr2 !== "00" ? `:${mStr2}` : ""} ${p2}`;

  const sun = s.sunday;
  if (sun && !sun.closed) {
    return `Daily: ${timeRange}`;
  }

  return `Mon–Sat: ${timeRange}`;
}

