/**
 * Seasonal Banner Component
 * T0005: Regional Calendar - Seasonal UI Components
 */

import { useMemo } from 'react';
import { Banner, Text } from '@shopify/polaris';
import { getActiveCampaigns, getTemplateByType, toHijri, formatHijri, getEventForDate, getWeekendDays, type SeasonalTemplate } from '~/services/calendar';

export interface SeasonalBannerProps {
  country: string;
  locale?: 'ar' | 'en';
}

export function SeasonalBanner({ country, locale = 'en' }: SeasonalBannerProps) {
  const activeCampaign = useMemo(() => {
    const campaigns = getActiveCampaigns();
    return campaigns.find((c) => c.countries.includes(country));
  }, [country]);

  const template = useMemo(() => {
    if (!activeCampaign) return null;
    return getTemplateByType(activeCampaign.type);
  }, [activeCampaign]);

  if (!activeCampaign || !template) return null;

  const isRTL = locale === 'ar';
  const text = isRTL ? template.bannerTextAr : template.bannerText;

  const bannerStyle = {
    backgroundColor: template.theme.primaryColor,
    color: template.theme.secondaryColor,
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: 'start' as const,
  };

  return (
    <div style={bannerStyle}>
      <Banner tone="info">
        <Text variant="headingMd" as="h2">
          {text}
        </Text>
        {activeCampaign.discount && (
          <Text variant="bodyMd" as="p">
            {isRTL
              ? `خصم يصل إلى ${activeCampaign.discount}%`
              : `Up to ${activeCampaign.discount}% off`}
          </Text>
        )}
      </Banner>
    </div>
  );
}

// Hijri Date Display Component
export function HijriDateBanner({ locale = 'en' }: { locale?: 'ar' | 'en' }) {
  
  const today = new Date();
  const hijriDate = toHijri(today);
  const event = getEventForDate(today);

  return (
    <Banner tone="success">
      <Text variant="bodyMd" as="p">
        {formatHijri(hijriDate, locale)}
      </Text>
      {event && (
        <Text variant="headingSm" as="p">
          {locale === 'ar' ? event.nameAr : event.nameEn}
        </Text>
      )}
    </Banner>
  );
}

// Weekend Notice Component
export function WeekendNotice({ 
  country, 
  locale = 'en' 
}: { 
  country: string; 
  locale?: 'ar' | 'en';
}) {
  const weekendDays = getWeekendDays(country);
  const dayNames = locale === 'ar' 
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const weekendNames = weekendDays.map((d) => dayNames[d]).join(' & ');

  return (
    <Banner tone="warning">
      <Text variant="bodyMd" as="p">
        {locale === 'ar'
          ? `عطلة نهاية الأسبوع: ${weekendNames}`
          : `Weekend: ${weekendNames}`}
      </Text>
    </Banner>
  );
}
