/**
 * Wayback date and time parsing utility.
 */

export interface ParsedWaybackTime {
  targetDate: Date;
  isoString: string;
  displayDateString?: string;
  hasExplicitTime: boolean;
}

/**
 * Parses a 12-hour or 24-hour time string into [hours, minutes, seconds].
 * Examples: "14:30", "14:30:45", "2:30 PM", "02:30:15 am"
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number; seconds: number } | null {
  const trimmed = timeStr.trim();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const seconds = match12[3] ? parseInt(match12[3], 10) : 0;
    const modifier = match12[4].toUpperCase();

    if (hours === 12) {
      hours = modifier === 'AM' ? 0 : 12;
    } else if (modifier === 'PM') {
      hours += 12;
    }
    return { hours, minutes, seconds };
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    const seconds = match24[3] ? parseInt(match24[3], 10) : 0;
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
      return { hours, minutes, seconds };
    }
  }

  return null;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function parseWaybackDateTime(rawTimestamp?: string | null, queryTime?: string | null): ParsedWaybackTime {
  const now = new Date();
  if (!rawTimestamp) {
    return {
      targetDate: now,
      isoString: now.toISOString(),
      displayDateString: now.toISOString(),
      hasExplicitTime: false,
    };
  }

  let decoded = decodeURIComponent(rawTimestamp).trim();

  // 1. Numeric epoch timestamp (seconds or milliseconds)
  if (/^\d{10,13}$/.test(decoded)) {
    const num = parseInt(decoded, 10);
    const ms = decoded.length === 10 ? num * 1000 : num;
    const date = new Date(ms);
    if (!isNaN(date.getTime())) {
      return {
        targetDate: date,
        isoString: date.toISOString(),
        displayDateString: date.toISOString(),
        hasExplicitTime: true,
      };
    }
  }

  // 2. Query parameter time provided (e.g. ?time=14:30 or ?time=02:30PM)
  if (queryTime) {
    const parsedTime = parseTimeString(decodeURIComponent(queryTime));
    if (parsedTime) {
      const dateOnly = decoded.split(/[T\s_]/)[0];
      const dateParts = dateOnly.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (dateParts) {
        const year = parseInt(dateParts[1], 10);
        const month = parseInt(dateParts[2], 10) - 1;
        const day = parseInt(dateParts[3], 10);
        const targetDate = new Date(year, month, day, parsedTime.hours, parsedTime.minutes, parsedTime.seconds, 0);
        const displayString = `${year}-${pad2(month + 1)}-${pad2(day)}T${pad2(parsedTime.hours)}:${pad2(parsedTime.minutes)}:${pad2(parsedTime.seconds)}`;
        return {
          targetDate,
          isoString: targetDate.toISOString(),
          displayDateString: displayString,
          hasExplicitTime: true,
        };
      }
    }
  }

  // 3. Check for underscore time format: e.g. 2024-10-24_14-30 or 2024-10-24_14:30
  if (decoded.includes('_')) {
    const [dPart, tPart] = decoded.split('_');
    const normalizedTime = tPart.replace(/-/g, ':');
    const parsedTime = parseTimeString(normalizedTime);
    const dateParts = dPart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (parsedTime && dateParts) {
      const year = parseInt(dateParts[1], 10);
      const month = parseInt(dateParts[2], 10) - 1;
      const day = parseInt(dateParts[3], 10);
      const targetDate = new Date(year, month, day, parsedTime.hours, parsedTime.minutes, parsedTime.seconds, 0);
      const displayString = `${year}-${pad2(month + 1)}-${pad2(day)}T${pad2(parsedTime.hours)}:${pad2(parsedTime.minutes)}:${pad2(parsedTime.seconds)}`;
      return {
        targetDate,
        isoString: targetDate.toISOString(),
        displayDateString: displayString,
        hasExplicitTime: true,
      };
    }
  }

  // 4. Check if decoded has time component (e.g. has 'T' or space with time, or timezone)
  const hasTimeIndicator = decoded.includes('T') || /\s\d{1,2}:/.test(decoded) || /:\d{2}/.test(decoded);
  if (hasTimeIndicator) {
    const match = decoded.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const hours = parseInt(match[4], 10);
      const minutes = parseInt(match[5], 10);
      const seconds = match[6] ? parseInt(match[6], 10) : 0;
      const targetDate = new Date(year, month, day, hours, minutes, seconds, 0);
      const displayString = `${year}-${pad2(month + 1)}-${pad2(day)}T${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
      return {
        targetDate,
        isoString: targetDate.toISOString(),
        displayDateString: displayString,
        hasExplicitTime: true,
      };
    }

    const directDate = new Date(decoded);
    if (!isNaN(directDate.getTime())) {
      return {
        targetDate: directDate,
        isoString: directDate.toISOString(),
        displayDateString: directDate.toISOString(),
        hasExplicitTime: true,
      };
    }
  }

  // 5. Date-only provided (e.g. "2024-10-24")
  // Requirement: If no time specified, apply current time-of-day (now's HH:mm:ss) to the target date.
  const dateOnlyMatch = decoded.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dateOnlyMatch) {
    const year = parseInt(dateOnlyMatch[1], 10);
    const month = parseInt(dateOnlyMatch[2], 10) - 1;
    const day = parseInt(dateOnlyMatch[3], 10);

    const targetDate = new Date(
      year,
      month,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    const displayString = `${year}-${pad2(month + 1)}-${pad2(day)}T${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

    return {
      targetDate,
      isoString: targetDate.toISOString(),
      displayDateString: displayString,
      hasExplicitTime: false,
    };
  }

  // 6. Generic date fallback
  const fallbackDate = new Date(decoded);
  if (!isNaN(fallbackDate.getTime())) {
    return {
      targetDate: fallbackDate,
      isoString: fallbackDate.toISOString(),
      displayDateString: fallbackDate.toISOString(),
      hasExplicitTime: false,
    };
  }

  // Ultimate fallback to now
  return {
    targetDate: now,
    isoString: now.toISOString(),
    displayDateString: now.toISOString(),
    hasExplicitTime: false,
  };
}
