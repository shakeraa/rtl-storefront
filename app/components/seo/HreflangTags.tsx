/**
 * Hreflang Tags Component
 * T0007: SEO Multilingual
 */

import { useMemo } from 'react';
import { generateHreflangTags } from '~/services/seo';

export interface HreflangTagsProps {
  path: string;
  locales: string[];
  defaultLocale: string;
  siteUrl: string;
}

export function HreflangTags({
  path,
  locales,
  defaultLocale,
  siteUrl,
}: HreflangTagsProps) {
  const tags = useMemo(
    () => generateHreflangTags(path, locales, defaultLocale),
    [path, locales, defaultLocale]
  );

  return (
    <>
      {tags.map((tag) => (
        <link
          key={tag.hreflang}
          rel="alternate"
          hrefLang={tag.hreflang}
          href={`${siteUrl}${tag.href}`}
        />
      ))}
    </>
  );
}
