/**
 * Prayer Time Delivery Windows Service (T0389)
 *
 * Manages delivery scheduling around Islamic prayer times for MENA markets.
 * Blocks delivery windows during prayer periods and Friday Jummah.
 */

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'jummah';

export interface PrayerTime {
  name: PrayerName;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
}

export interface TimeWindow {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
}

export interface DeliverySlot {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
}

export interface DeliveryEstimate {
  slots: DeliverySlot[];
  note: string;
}

export const DEFAULT_PRAYER_DURATIONS: Record<PrayerName, number> = {
  fajr: 30,
  dhuhr: 30,
  asr: 30,
  maghrib: 30,
  isha: 30,
  jummah: 90,
};

/** Default prayer times (approximate, Saudi Arabia summer schedule). */
export const DEFAULT_PRAYER_TIMES: PrayerTime[] = [
  { name: 'fajr', startHour: 4, startMinute: 30, durationMinutes: 30 },
  { name: 'dhuhr', startHour: 12, startMinute: 0, durationMinutes: 30 },
  { name: 'asr', startHour: 15, startMinute: 30, durationMinutes: 30 },
  { name: 'maghrib', startHour: 18, startMinute: 30, durationMinutes: 30 },
  { name: 'isha', startHour: 20, startMinute: 0, durationMinutes: 30 },
];

export const MENA_CITIES: Record<string, string> = {
  'Riyadh': 'SA',
  'Jeddah': 'SA',
  'Dammam': 'SA',
  'Mecca': 'SA',
  'Medina': 'SA',
  'Dubai': 'AE',
  'Abu Dhabi': 'AE',
  'Sharjah': 'AE',
  'Doha': 'QA',
  'Kuwait City': 'KW',
  'Manama': 'BH',
  'Muscat': 'OM',
  'Amman': 'JO',
  'Cairo': 'EG',
  'Alexandria': 'EG',
  'Casablanca': 'MA',
  'Tunis': 'TN',
  'Algiers': 'DZ',
  'Baghdad': 'IQ',
  'Beirut': 'LB',
  'Istanbul': 'TR',
  'Tel Aviv': 'IL',
  'Jerusalem': 'IL',
};

function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

function fromMinutes(totalMinutes: number): { hour: number; minute: number } {
  return {
    hour: Math.floor(totalMinutes / 60) % 24,
    minute: totalMinutes % 60,
  };
}

/**
 * Calculate blocked delivery windows around prayer times.
 * Adds a buffer before and after each prayer.
 */
export function getBlockedWindows(prayers: PrayerTime[], bufferMinutes: number = 10): TimeWindow[] {
  return prayers.map((prayer) => {
    const startTotal = toMinutes(prayer.startHour, prayer.startMinute) - bufferMinutes;
    const endTotal = toMinutes(prayer.startHour, prayer.startMinute) + prayer.durationMinutes + bufferMinutes;
    return {
      start: fromMinutes(Math.max(0, startTotal)),
      end: fromMinutes(Math.min(24 * 60, endTotal)),
    };
  });
}

/**
 * Check if a specific time falls within any blocked window.
 */
export function isTimeBlocked(hour: number, minute: number, blockedWindows: TimeWindow[]): boolean {
  const time = toMinutes(hour, minute);
  return blockedWindows.some((w) => {
    const wStart = toMinutes(w.start.hour, w.start.minute);
    const wEnd = toMinutes(w.end.hour, w.end.minute);
    return time >= wStart && time < wEnd;
  });
}

/**
 * Get available delivery slots that don't overlap with prayer times.
 */
export function getAvailableSlots(
  startHour: number,
  endHour: number,
  prayers: PrayerTime[],
  slotDurationMinutes: number = 60,
  bufferMinutes: number = 10,
): DeliverySlot[] {
  const blockedWindows = getBlockedWindows(prayers, bufferMinutes);
  const slots: DeliverySlot[] = [];
  const dayStart = toMinutes(startHour, 0);
  const dayEnd = toMinutes(endHour, 0);

  let cursor = dayStart;

  while (cursor + slotDurationMinutes <= dayEnd) {
    const slotStart = cursor;
    const slotEnd = cursor + slotDurationMinutes;

    // Check if any part of this slot overlaps a blocked window
    const overlaps = blockedWindows.some((w) => {
      const wStart = toMinutes(w.start.hour, w.start.minute);
      const wEnd = toMinutes(w.end.hour, w.end.minute);
      return slotStart < wEnd && slotEnd > wStart;
    });

    if (!overlaps) {
      slots.push({
        start: fromMinutes(slotStart),
        end: fromMinutes(slotEnd),
      });
      cursor = slotEnd;
    } else {
      // Skip past the blocking window
      const blockingEnd = blockedWindows
        .filter((w) => {
          const wStart = toMinutes(w.start.hour, w.start.minute);
          const wEnd = toMinutes(w.end.hour, w.end.minute);
          return slotStart < wEnd && slotEnd > wStart;
        })
        .reduce((max, w) => Math.max(max, toMinutes(w.end.hour, w.end.minute)), 0);
      cursor = blockingEnd;
    }
  }

  return slots;
}

/**
 * Check if today is Friday (Jummah prayer extends delivery block).
 */
export function isFridayExtended(): boolean {
  return new Date().getDay() === 5;
}

/**
 * Get delivery estimate for a city, accounting for prayer times and day of week.
 */
export function getDeliveryEstimate(
  city: string,
  dayOfWeek: number,
  prayers: PrayerTime[],
): DeliveryEstimate {
  const country = MENA_CITIES[city];
  let note = '';
  let effectivePrayers = [...prayers];

  // Friday: add Jummah prayer block
  if (dayOfWeek === 5) {
    effectivePrayers = effectivePrayers.filter((p) => p.name !== 'dhuhr');
    effectivePrayers.push({
      name: 'jummah',
      startHour: 12,
      startMinute: 0,
      durationMinutes: DEFAULT_PRAYER_DURATIONS.jummah,
    });
    note = 'Friday schedule: extended Jummah prayer block (12:00-13:30)';
  }

  // Weekend handling for Gulf countries (Fri-Sat weekend)
  if (country && ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'].includes(country)) {
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      note += note ? '. ' : '';
      note += 'Weekend in Gulf region - limited delivery capacity';
    }
  }

  if (!country) {
    note += note ? '. ' : '';
    note += `City "${city}" not in MENA database - using default schedule`;
  }

  const slots = getAvailableSlots(8, 22, effectivePrayers, 60, 10);

  return { slots, note };
}
