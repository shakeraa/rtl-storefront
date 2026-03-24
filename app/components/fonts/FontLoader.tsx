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
    const linkElements: HTMLLinkElement[] = [];
    const links = generateFontLinks(config);
    links.forEach((linkData) => {
      const link = document.createElement('link');
      link.rel = linkData.rel as 'preconnect' | 'stylesheet';
      link.href = linkData.href;
      if (linkData.as) {
        link.setAttribute('as', linkData.as);
      }
      document.head.appendChild(link);
      linkElements.push(link);
    });

    // Add CSS variables
    const style = document.createElement('style');
    style.textContent = generateFontCSSVariables(config);
    document.head.appendChild(style);

    return () => {
      // Clean up ALL elements
      linkElements.forEach((link) => link.remove());
      style.remove();
    };
  }, [config]);

  return null;
}
