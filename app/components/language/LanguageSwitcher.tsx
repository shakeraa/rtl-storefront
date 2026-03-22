/**
 * Language Switcher Component
 * T0010: Language Switcher
 */

import { useState, useCallback } from 'react';
import {
  ActionList,
  Popover,
  Button,
  Icon,
} from '@shopify/polaris';
import { LanguageTranslateIcon } from '@shopify/polaris-icons';
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  storeLanguagePreference,
} from '~/services/language';

export interface LanguageSwitcherProps {
  currentLocale: string;
  onChange?: (locale: string) => void;
  display?: 'dropdown' | 'buttons';
}

export function LanguageSwitcher({
  currentLocale,
  onChange,
  display = 'dropdown',
}: LanguageSwitcherProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  
  const currentLanguage = getLanguageByCode(currentLocale);
  
  const handleSelect = useCallback(
    (locale: string) => {
      storeLanguagePreference(locale);
      onChange?.(locale);
      setPopoverActive(false);
    },
    [onChange]
  );

  if (display === 'buttons') {
    return (
      <ButtonGroup segmented>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Button
            key={lang.code}
            pressed={currentLocale === lang.code}
            onClick={() => handleSelect(lang.code)}
          >
            {lang.flag} {lang.nativeName}
          </Button>
        ))}
      </ButtonGroup>
    );
  }

  const activator = (
    <Button
      onClick={() => setPopoverActive(!popoverActive)}
      icon={LanguageTranslateIcon}
    >
      {currentLanguage?.flag} {currentLanguage?.nativeName}
    </Button>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={() => setPopoverActive(false)}
    >
      <ActionList
        items={SUPPORTED_LANGUAGES.map((lang) => ({
          id: lang.code,
          content: `${lang.flag} ${lang.nativeName}`,
          active: currentLocale === lang.code,
          onAction: () => handleSelect(lang.code),
        }))}
      />
    </Popover>
  );
}

// ButtonGroup component for segmented buttons
function ButtonGroup({
  children,
  segmented,
}: {
  children: React.ReactNode;
  segmented?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: segmented ? 0 : '8px',
      }}
    >
      {children}
    </div>
  );
}
