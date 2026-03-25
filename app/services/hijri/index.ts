/**
 * Hijri Service
 * T0005: Hijri Calendar Events
 * Re-exports from calendar service for convenience.
 */

export {
  toHijri,
  formatHijri,
  getEventForDate,
  getDaysUntilRamadan,
  getEidCountdown,
  type HijriDate,
  type HijriEvent,
} from '../calendar/hijri';
