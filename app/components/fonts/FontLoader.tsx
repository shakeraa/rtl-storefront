/**
 * RTL Font Loader Component
 * T0034, T0035: Arabic & Hebrew Font Libraries
 */

import { useEffect } from 'react';
import {
  generateFontLinks,
  generateFontCSSVariables,
  type FontConfig,
} from '~/services/fonts';

export interface FontLoaderProps {
  config: FontConfig;
}

export function FontLoader({ config }: FontLoaderProps) {
  useEffect(() => {
    // Add preconnect links
    const links = generateFontLinks(config);
    links.forEach((linkData) => {
      const link = document.createElement('link');
      link.rel = linkData.rel as 'preconnect' | 'stylesheet';
      link.href = linkData.href;
      if (linkData.as) {
        link.setAttribute('as', linkData.as);
      }
      document.head.appendChild(link);
    });

    // Add CSS variables
    const style = document.createElement('style');
    style.textContent = generateFontCSSVariables(config);
    document.head.appendChild(style);

    return () => {
      // Cleanup
      document.head.removeChild(style);
    };
  }, [config]);

  return null;
}
