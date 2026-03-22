/**
 * RTL Direction Wrapper Component
 * Applies RTL direction based on locale
 */

import { useEffect } from 'react';
import { getLanguageByCode } from '~/services/language';

export interface RTLDirectionProps {
  locale: string;
  children: React.ReactNode;
}

export function RTLDirection({ locale, children }: RTLDirectionProps) {
  const language = getLanguageByCode(locale);
  const isRTL = language?.direction === 'rtl';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [isRTL, locale]);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        textAlign: isRTL ? 'right' : 'left',
      }}
    >
      {children}
    </div>
  );
}
