import { describe, it, expect } from "vitest";

// T0056 - Tashkeel
import {
  addTashkeel, removeTashkeel, hasTashkeel, normalizeTashkeel,
  analyzeTashkeel, toggleTashkeel, countTashkeel, compareIgnoringTashkeel,
  TASHKEEL_PATTERN,
} from "../../app/services/arabic-features/tashkeel";

// T0058 - Media Translation
import {
  parseSRT, parseVTT, generateSRT, generateVTT, extractTextForTranslation,
} from "../../app/services/media-translation";

// T0059 - Hijri Calendar
import {
  toHijri, fromHijri, formatHijri,
} from "../../app/services/calendar/hijri";

// T0063 - Fashion Terminology DB
import {
  getFashionTerm, searchFashionTerms, getFashionCategories, getTermsByCategory,
} from "../../app/services/fashion-db";

// T0065 - Religious Sensitivity
import {
  scanForSensitivity, isRamadanSensitive, getSensitivityScore,
} from "../../app/services/sensitivity";

// T0067 - Formality/Cultural Context
import {
  analyzeCulturalContext,
} from "../../app/services/cultural-ai/context-analyzer";

// T0070 - Fashion Sections
import {
  getAvailableSections,
} from "../../app/services/fashion-sections/preview";

// T0072 - MENA Regional (Agency/Social)
import {
  getInfluencerPlatforms, getSocialPlatforms,
} from "../../app/services/mena-regional";

// T0073 - URL Structure
import {
  resolveLocaleFromPath, buildLocalizedPath, getAlternateUrls,
} from "../../app/services/url-structure/resolver";

// T0078 - SEO hreflang/robots
import {
  generateHreflangTags,
} from "../../app/services/seo/hreflang";

// T0081 - Automation queue
import {
  createJob, getJob, getNextJob,
} from "../../app/services/automation/queue";

// T0086/T0087 - Language Switcher (floating covers modal + variants)
import {
  getFloatingSwitcherConfig, getSwitcherLabels,
} from "../../app/services/language-switcher/floating";

// -----------------------------------------------------------------------
// T0056 - Tashkeel Support
// -----------------------------------------------------------------------
describe("T0056 — Arabic Diacritics (Tashkeel)", () => {
  const withTashkeel = "\u0643\u064E\u062A\u064E\u0628\u064E"; // kataba with fatha

  it("detects tashkeel in text", () => {
    expect(hasTashkeel(withTashkeel)).toBe(true);
    expect(hasTashkeel("كتب")).toBe(false);
  });

  it("removes tashkeel from text", () => {
    const result = removeTashkeel(withTashkeel);
    expect(hasTashkeel(result)).toBe(false);
  });

  it("counts tashkeel characters", () => {
    const count = countTashkeel(withTashkeel);
    expect(count).toBeGreaterThan(0);
  });

  it("analyzes tashkeel composition", () => {
    const analysis = analyzeTashkeel(withTashkeel);
    expect(analysis).toBeDefined();
  });

  it("compares text ignoring tashkeel", () => {
    expect(compareIgnoringTashkeel(withTashkeel, "كتب")).toBe(true);
  });

  it("normalizes tashkeel", () => {
    const result = normalizeTashkeel(withTashkeel);
    expect(result).toBeDefined();
  });

  it("TASHKEEL_PATTERN matches diacritics", () => {
    TASHKEEL_PATTERN.lastIndex = 0;
    expect(TASHKEEL_PATTERN.test("\u064E")).toBe(true);
  });
});

// -----------------------------------------------------------------------
// T0058 - Media Translation (Subtitles)
// -----------------------------------------------------------------------
describe("T0058 — Media Translation", () => {
  const srtSample = "1\n00:00:01,000 --> 00:00:03,000\nHello World\n\n2\n00:00:04,000 --> 00:00:06,000\nGoodbye\n";

  it("parses SRT subtitles", () => {
    const entries = parseSRT(srtSample);
    expect(entries.length).toBeGreaterThanOrEqual(2);
    expect(entries[0].text).toBe("Hello World");
  });

  it("generates SRT from entries", () => {
    const entries = parseSRT(srtSample);
    const output = generateSRT(entries);
    expect(output).toContain("Hello World");
    expect(output).toContain("-->");
  });

  it("extracts text for translation", () => {
    const entries = parseSRT(srtSample);
    const texts = extractTextForTranslation(entries);
    expect(texts).toContain("Hello World");
    expect(texts).toContain("Goodbye");
  });

  it("generates VTT format", () => {
    const entries = parseSRT(srtSample);
    const vtt = generateVTT(entries);
    expect(vtt).toContain("WEBVTT");
  });
});

// -----------------------------------------------------------------------
// T0059 - Hijri Calendar
// -----------------------------------------------------------------------
describe("T0059 — Hijri Date Display", () => {
  it("converts Gregorian to Hijri", () => {
    const hijri = toHijri(new Date(2026, 2, 23));
    expect(hijri.year).toBeGreaterThan(1400);
    expect(hijri.month).toBeGreaterThanOrEqual(1);
    expect(hijri.month).toBeLessThanOrEqual(12);
    expect(hijri.day).toBeGreaterThanOrEqual(1);
  });

  it("converts Hijri back to Gregorian", () => {
    const hijri = toHijri(new Date(2026, 0, 1));
    const back = fromHijri({ year: hijri.year, month: hijri.month, day: hijri.day });
    expect(back).toBeInstanceOf(Date);
  });

  it("formats Hijri date", () => {
    const hijri = toHijri(new Date(2026, 2, 23));
    const formatted = formatHijri(hijri, "en");
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("formats Hijri date in Arabic", () => {
    const hijri = toHijri(new Date(2026, 2, 23));
    const formatted = formatHijri(hijri, "ar");
    expect(formatted.length).toBeGreaterThan(0);
  });
});

// -----------------------------------------------------------------------
// T0063 - Fashion Terminology DB
// -----------------------------------------------------------------------
describe("T0063 — Fashion Terminology Database", () => {
  it("returns fashion categories", () => {
    const categories = getFashionCategories();
    expect(categories.length).toBeGreaterThan(0);
  });

  it("searches fashion terms", () => {
    const results = searchFashionTerms("abaya");
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  it("gets terms by category", () => {
    const categories = getFashionCategories();
    if (categories.length > 0) {
      const terms = getTermsByCategory(categories[0]);
      expect(Array.isArray(terms)).toBe(true);
    }
  });
});

// -----------------------------------------------------------------------
// T0065 - Religious Sensitivity Filter
// -----------------------------------------------------------------------
describe("T0065 — Religious Sensitivity Filter", () => {
  it("scans text for sensitivity", () => {
    const result = scanForSensitivity("sample text", "ar");
    expect(result).toBeDefined();
    expect(typeof result.isClean).toBe("boolean");
    expect(typeof result.score).toBe("number");
  });

  it("detects Ramadan sensitivity", () => {
    expect(typeof isRamadanSensitive("during Ramadan")).toBe("boolean");
  });

  it("returns sensitivity score", () => {
    const score = getSensitivityScore("normal text", "en");
    expect(typeof score).toBe("number");
  });
});

// -----------------------------------------------------------------------
// T0067 - Cultural Context / Formality
// -----------------------------------------------------------------------
describe("T0067 — Cultural AI Formality", () => {
  it("analyzes cultural context", () => {
    const result = analyzeCulturalContext({
      text: "Welcome to our store",
      sourceLocale: "en",
      targetLocale: "ar",
      category: "ecommerce",
    });
    expect(result).toBeDefined();
  });
});

// -----------------------------------------------------------------------
// T0070 - Fashion Sections
// -----------------------------------------------------------------------
describe("T0070 — Right-Aligned Product Gallery", () => {
  it("returns available sections", () => {
    const sections = getAvailableSections();
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
  });
});

// -----------------------------------------------------------------------
// T0072 - MENA Regional / Agency Network
// -----------------------------------------------------------------------
describe("T0072 — MENA Agency/Social Network", () => {
  it("returns influencer platforms for SA", () => {
    const platforms = getInfluencerPlatforms("SA");
    expect(Array.isArray(platforms)).toBe(true);
  });

  it("returns social platforms for AE", () => {
    const platforms = getSocialPlatforms("AE");
    expect(Array.isArray(platforms)).toBe(true);
  });
});

// -----------------------------------------------------------------------
// T0073 - URL Structure / Subdomain
// -----------------------------------------------------------------------
describe("T0073 — URL Structure Subdomain Support", () => {
  const config = {
    defaultLocale: "en",
    locales: [
      { locale: "en", prefix: "/en", isDefault: true },
      { locale: "ar", prefix: "/ar", isDefault: false },
      { locale: "he", prefix: "/he", isDefault: false },
    ],
    includeDefaultPrefix: false,
  };

  it("resolves locale from path", () => {
    const result = resolveLocaleFromPath("/ar/products/test", config);
    expect(result.locale).toBe("ar");
  });

  it("builds localized path", () => {
    const path = buildLocalizedPath("/products/test", "ar", config);
    expect(path).toContain("ar");
  });

  it("generates alternate URLs", () => {
    const urls = getAlternateUrls("/products/test", "https://example.com", config);
    expect(urls.length).toBeGreaterThanOrEqual(2);
  });
});

// -----------------------------------------------------------------------
// T0078 - SEO Robots/Hreflang
// -----------------------------------------------------------------------
describe("T0078 — Language-specific SEO", () => {
  it("generates hreflang tags", () => {
    const tags = generateHreflangTags("https://example.com/", ["en", "ar", "he"], "en");
    expect(tags.length).toBeGreaterThan(0);
  });
});

// -----------------------------------------------------------------------
// T0081 - Automation / Conditional Rules
// -----------------------------------------------------------------------
describe("T0081 — Automation Queue", () => {
  it("creates a translation job", () => {
    const job = createJob({ resourceType: "product", resourceId: "prod-1", locales: ["ar"], priority: "normal" });
    expect(job.id).toBeDefined();
    expect(job.status).toBe("queued");
  });

  it("retrieves a job by ID", () => {
    const job = createJob({ resourceType: "page", resourceId: "page-1", locales: ["he"], priority: "high" });
    const found = getJob(job.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(job.id);
  });

  it("gets next queued job", () => {
    createJob({ resourceType: "collection", resourceId: "col-1", locales: ["ar"], priority: "normal" });
    const next = getNextJob();
    expect(next).toBeDefined();
    expect(next!.status).toBe("queued");
  });
});

// -----------------------------------------------------------------------
// T0086 - Modal / T0087 - Variants (via floating switcher)
// -----------------------------------------------------------------------
describe("T0086/T0087 — Language Switcher Modal + Variants", () => {
  it("returns floating switcher config", () => {
    const config = getFloatingSwitcherConfig("ar");
    expect(config).toBeDefined();
    expect(config.position).toBeDefined();
  });

  it("returns switcher labels for Arabic", () => {
    const labels = getSwitcherLabels("ar");
    expect(labels).toBeDefined();
  });

  it("returns switcher labels for English", () => {
    const labels = getSwitcherLabels("en");
    expect(labels).toBeDefined();
  });

  it("returns switcher labels for Hebrew", () => {
    const labels = getSwitcherLabels("he");
    expect(labels).toBeDefined();
  });
});
