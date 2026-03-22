/**
 * Hijri Date Display Component
 * T0005: Hijri Calendar Events
 */

import { useMemo } from 'react';
import { Text, Stack, Badge } from '@shopify/polaris';
import {
  toHijri,
  formatHijri,
  getEventForDate,
  getDaysUntilRamadan,
  getEidCountdown,
} from '~/services/hijri';

export interface HijriDateDisplayProps {
  date?: Date;
  locale?: 'ar' | 'en';
  showEvents?: boolean;
  showCountdowns?: boolean;
}

export function HijriDateDisplay({
  date = new Date(),
  locale = 'ar',
  showEvents = true,
  showCountdowns = false,
}: HijriDateDisplayProps) {
  const hijriDate = useMemo(() => toHijri(date), [date]);
  const event = useMemo(() => getEventForDate(date), [date]);
  const ramadanDays = useMemo(() => getDaysUntilRamadan(date), [date]);
  const eidCountdown = useMemo(() => getEidCountdown(date), [date]);

  return (
    <Stack vertical spacing="tight">
      <Text variant="headingMd" as="h3">
        {formatHijri(hijriDate, locale)}
      </Text>
      
      {showEvents && event && (
        <Badge tone="success">
          {locale === 'ar' ? event.name : event.nameEn}
        </Badge>
      )}
      
      {showCountdowns && (
        <Stack vertical spacing="extraTight">
          {ramadanDays > 0 && (
            <Text variant="bodySm" as="p" color="subdued">
              {locale === 'ar'
                ? `${ramadanDays} يوم حتى رمضان`
                : `${ramadanDays} days until Ramadan`}
            </Text>
          )}
          
          {eidCountdown.eidFitr > 0 && (
            <Text variant="bodySm" as="p" color="subdued">
              {locale === 'ar'
                ? `${eidCountdown.eidFitr} يوم حتى عيد الفطر`
                : `${eidCountdown.eidFitr} days until Eid al-Fitr`}
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}
