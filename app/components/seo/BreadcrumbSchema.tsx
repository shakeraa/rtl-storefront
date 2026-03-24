/**
 * Breadcrumb Schema Component
 * T0075: Breadcrumb Schema
 */

import { useMemo } from 'react';
import { Link } from '@remix-run/react';
import { generateBreadcrumbSchema, type BreadcrumbItem } from '~/services/seo';

export interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  locale?: string;
}

export function BreadcrumbSchema({ items, locale = 'en' }: BreadcrumbSchemaProps) {
  const schema = useMemo(
    () => generateBreadcrumbSchema(items, locale),
    [items, locale]
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Navigation Component
export function BreadcrumbNav({
  items,
  locale = 'en',
  separator = '/',
}: BreadcrumbSchemaProps & { separator?: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        style={{
          display: 'flex',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          gap: '8px',
          flexDirection: locale === 'ar' ? 'row-reverse' : 'row',
        }}
      >
        {items.map((item, index) => (
          <li key={item.item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {index > 0 && <span>{separator}</span>}
            <Link
              to={item.item}
              style={{
                color: index === items.length - 1 ? '#000' : '#666',
                textDecoration: 'none',
              }}
            >
              {locale === 'ar' && item.nameAr ? item.nameAr : item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
