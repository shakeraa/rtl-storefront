import { describe, it, expect } from 'vitest';
import {
  // Core functions
  parseSubtitles,
  formatSubtitles,
  translateSubtitles,
  shiftTimestamps,
  
  // Format-specific parsing
  parseSRT,
  parseVTT,
  parseTTML,
  detectFormat,
  
  // Format-specific formatting
  formatSRT,
  formatVTT,
  formatTTML,
  
  // Time utilities
  timeToMilliseconds,
  millisecondsToTime,
  
  // RTL support
  isRtlLocale,
  applyRtlFormatting,
  wrapRtlMarkup,
  RTL_LOCALES,
  
  // Validation
  validateSubtitles,
  
  // Types
  type SubtitleEntry,
  type SubtitleFormat,
} from '../../app/services/media-translation/video-subtitles';

describe('Video Subtitles Service', () => {
  // ==========================================================================
  // Test Fixtures
  // ==========================================================================
  
  const sampleSRT = `1
00:00:01,000 --> 00:00:04,000
Hello world

2
00:00:05,000 --> 00:00:08,000
Welcome to our store`;

  const sampleVTT = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello world

00:00:05.000 --> 00:00:08.000
Welcome to our store`;

  const sampleTTML = `<?xml version="1.0" encoding="UTF-8"?>
<tt xmlns="http://www.w3.org/ns/ttml" xml:lang="en">
  <head>
    <metadata/>
    <styling/>
    <layout/>
  </head>
  <body>
    <div>
      <p begin="00:00:01.000" end="00:00:04.000">Hello world</p>
      <p begin="00:00:05.000" end="00:00:08.000">Welcome to our store</p>
    </div>
  </body>
</tt>`;

  const sampleEntries: SubtitleEntry[] = [
    { index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Hello world' },
    { index: 2, startTime: '00:00:05,000', endTime: '00:00:08,000', text: 'Welcome to our store' },
  ];

  // ==========================================================================
  // parseSubtitles - General
  // ==========================================================================
  
  describe('parseSubtitles', () => {
    it('parses SRT format when specified', () => {
      const result = parseSubtitles(sampleSRT, 'srt');
      expect(result.format).toBe('srt');
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].text).toBe('Hello world');
    });

    it('parses VTT format when specified', () => {
      const result = parseSubtitles(sampleVTT, 'vtt');
      expect(result.format).toBe('vtt');
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].text).toBe('Hello world');
    });

    it('parses TTML format when specified', () => {
      const result = parseSubtitles(sampleTTML, 'ttml');
      expect(result.format).toBe('ttml');
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].text).toBe('Hello world');
    });

    it('auto-detects SRT format', () => {
      const result = parseSubtitles(sampleSRT);
      expect(result.format).toBe('srt');
      expect(result.entries).toHaveLength(2);
    });

    it('auto-detects VTT format', () => {
      const result = parseSubtitles(sampleVTT);
      expect(result.format).toBe('vtt');
      expect(result.entries).toHaveLength(2);
    });

    it('auto-detects TTML format', () => {
      const result = parseSubtitles(sampleTTML);
      expect(result.format).toBe('ttml');
      expect(result.entries).toHaveLength(2);
    });

    it('returns empty entries for invalid content in specified format', () => {
      const result = parseSubtitles('invalid', 'ttml');
      expect(result.format).toBe('ttml');
      expect(result.entries).toHaveLength(0);
    });
  });

  // ==========================================================================
  // detectFormat
  // ==========================================================================
  
  describe('detectFormat', () => {
    it('detects VTT from WEBVTT header', () => {
      expect(detectFormat('WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nTest')).toBe('vtt');
    });

    it('detects TTML from XML declaration', () => {
      expect(detectFormat('<?xml version="1.0"?>\n<tt>')).toBe('ttml');
    });

    it('detects TTML from tt element', () => {
      expect(detectFormat('<tt xmlns="http://www.w3.org/ns/ttml">')).toBe('ttml');
    });

    it('detects SRT from pattern', () => {
      expect(detectFormat('1\n00:00:00,000 --> 00:00:01,000\nTest')).toBe('srt');
    });

    it('defaults to SRT for unrecognized content', () => {
      expect(detectFormat('some random content')).toBe('srt');
    });
  });

  // ==========================================================================
  // parseSRT
  // ==========================================================================
  
  describe('parseSRT', () => {
    it('parses basic SRT file', () => {
      const entries = parseSRT(sampleSRT);
      expect(entries).toHaveLength(2);
      expect(entries[0].index).toBe(1);
      expect(entries[0].startTime).toBe('00:00:01,000');
      expect(entries[0].endTime).toBe('00:00:04,000');
      expect(entries[0].text).toBe('Hello world');
    });

    it('parses multiline subtitle text', () => {
      const srt = `1
00:00:01,000 --> 00:00:04,000
Line 1
Line 2
Line 3`;
      const entries = parseSRT(srt);
      expect(entries[0].text).toBe('Line 1\nLine 2\nLine 3');
    });

    it('parses SRT with HTML tags in text', () => {
      const srt = `1
00:00:01,000 --> 00:00:04,000
<i>Italic</i> and <b>bold</b>`;
      const entries = parseSRT(srt);
      expect(entries[0].text).toBe('<i>Italic</i> and <b>bold</b>');
    });

    it('parses SRT with special characters', () => {
      const srt = `1
00:00:01,000 --> 00:00:04,000
Test &amp; more &lt;stuff&gt;`;
      const entries = parseSRT(srt);
      expect(entries[0].text).toBe('Test & more <stuff>');
    });

    it('skips empty blocks', () => {
      const srt = `1
00:00:01,000 --> 00:00:04,000
Hello



2
00:00:05,000 --> 00:00:08,000
World`;
      const entries = parseSRT(srt);
      expect(entries).toHaveLength(2);
    });

    it('handles extra whitespace', () => {
      const srt = `  1  
  00:00:01,000 --> 00:00:04,000  
  Hello world  `;
      const entries = parseSRT(srt);
      expect(entries[0].index).toBe(1);
      expect(entries[0].text).toBe('Hello world');
    });
  });

  // ==========================================================================
  // parseVTT
  // ==========================================================================
  
  describe('parseVTT', () => {
    it('parses basic VTT file', () => {
      const entries = parseVTT(sampleVTT);
      expect(entries).toHaveLength(2);
      expect(entries[0].startTime).toBe('00:00:01.000');
      expect(entries[0].endTime).toBe('00:00:04.000');
      expect(entries[0].text).toBe('Hello world');
    });

    it('skips WEBVTT header', () => {
      const entries = parseVTT('WEBVTT - Some comments\n\n00:00:01.000 --> 00:00:04.000\nTest');
      expect(entries).toHaveLength(1);
      expect(entries[0].text).toBe('Test');
    });

    it('skips NOTE blocks', () => {
      const vtt = `WEBVTT

NOTE This is a comment
and continues here

00:00:01.000 --> 00:00:04.000
Test`;
      const entries = parseVTT(vtt);
      expect(entries).toHaveLength(1);
    });

    it('skips REGION blocks', () => {
      const vtt = `WEBVTT

REGION
id:test

00:00:01.000 --> 00:00:04.000
Test`;
      const entries = parseVTT(vtt);
      expect(entries).toHaveLength(1);
    });

    it('parses VTT with cue identifiers', () => {
      const vtt = `WEBVTT

first-cue
00:00:01.000 --> 00:00:04.000
Test 1

00:00:05.000 --> 00:00:08.000
Test 2`;
      const entries = parseVTT(vtt);
      expect(entries).toHaveLength(2);
      expect(entries[0].text).toBe('Test 1');
      expect(entries[1].text).toBe('Test 2');
    });

    it('parses VTT with cue settings', () => {
      const vtt = `WEBVTT

00:00:01.000 --> 00:00:04.000 align:start position:10%
Test`;
      const entries = parseVTT(vtt);
      expect(entries).toHaveLength(1);
      expect(entries[0].endTime).toBe('00:00:04.000');
    });

    it('re-indexes entries sequentially', () => {
      const vtt = `WEBVTT

5
00:00:01.000 --> 00:00:04.000
First

10
00:00:05.000 --> 00:00:08.000
Second`;
      const entries = parseVTT(vtt);
      expect(entries[0].index).toBe(1);
      expect(entries[1].index).toBe(2);
    });
  });

  // ==========================================================================
  // parseTTML
  // ==========================================================================
  
  describe('parseTTML', () => {
    it('parses basic TTML file', () => {
      const result = parseTTML(sampleTTML);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].startTime).toBe('00:00:01.000');
      expect(result.entries[0].text).toBe('Hello world');
    });

    it('extracts body ID', () => {
      const ttml = sampleTTML.replace('<body>', '<body id="main">');
      const result = parseTTML(ttml);
      expect(result.bodyId).toBe('main');
    });

    it('converts TTML line breaks to newlines', () => {
      const ttml = `<?xml version="1.0"?>
<tt xmlns="http://www.w3.org/ns/ttml">
  <body>
    <div>
      <p begin="00:00:01.000" end="00:00:04.000">Line 1<br/>Line 2</p>
    </div>
  </body>
</tt>`;
      const result = parseTTML(ttml);
      expect(result.entries[0].text).toBe('Line 1\nLine 2');
    });

    it('handles TTML with comma decimal separator', () => {
      const ttml = sampleTTML.replace(/\./g, ',');
      const result = parseTTML(ttml);
      // TTML preserves the original separator format
      expect(result.entries[0].startTime).toBe('00:00:01,000');
    });

    it('extracts styles', () => {
      const ttml = `<?xml version="1.0"?>
<tt xmlns="http://www.w3.org/ns/ttml">
  <head>
    <styling>
      <style xml:id="s1" fontFamily="Arial"/>
    </styling>
  </head>
  <body>
    <div>
      <p begin="00:00:01.000" end="00:00:04.000">Test</p>
    </div>
  </body>
</tt>`;
      const result = parseTTML(ttml);
      expect(Object.keys(result.styles || {})).toContain('s1');
    });
  });

  // ==========================================================================
  // formatSubtitles
  // ==========================================================================
  
  describe('formatSubtitles', () => {
    it('formats to SRT', () => {
      const result = formatSubtitles(sampleEntries, 'srt');
      expect(result).toContain('1\n00:00:01,000 --> 00:00:04,000\nHello world');
      expect(result).toContain('2\n00:00:05,000 --> 00:00:08,000\nWelcome to our store');
    });

    it('formats to VTT', () => {
      const result = formatSubtitles(sampleEntries, 'vtt');
      expect(result.startsWith('WEBVTT')).toBe(true);
      expect(result).toContain('00:00:01.000 --> 00:00:04.000');
    });

    it('formats to TTML', () => {
      const result = formatSubtitles(sampleEntries, 'ttml');
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<tt xmlns="http://www.w3.org/ns/ttml"');
      expect(result).toContain('<p begin="00:00:01.000" end="00:00:04.000">');
    });

    it('throws error for unsupported format', () => {
      expect(() => formatSubtitles(sampleEntries, 'invalid' as SubtitleFormat)).toThrow();
    });
  });

  // ==========================================================================
  // formatSRT
  // ==========================================================================
  
  describe('formatSRT', () => {
    it('formats entries to valid SRT', () => {
      const result = formatSRT(sampleEntries);
      const lines = result.split('\n\n');
      expect(lines[0]).toBe('1\n00:00:01,000 --> 00:00:04,000\nHello world');
    });

    it('escapes special characters in text', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Test & more <stuff>' }];
      const result = formatSRT(entries);
      expect(result).toContain('Test &amp; more &lt;stuff&gt;');
    });

    it('handles multiline text', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Line 1\nLine 2' }];
      const result = formatSRT(entries);
      expect(result).toContain('Line 1\nLine 2');
    });
  });

  // ==========================================================================
  // formatVTT
  // ==========================================================================
  
  describe('formatVTT', () => {
    it('formats entries to valid VTT with header', () => {
      const result = formatVTT(sampleEntries);
      expect(result.startsWith('WEBVTT')).toBe(true);
    });

    it('converts SRT time format to VTT format', () => {
      const result = formatVTT(sampleEntries);
      expect(result).toContain('00:00:01.000 --> 00:00:04.000');
      expect(result).not.toContain('00:00:01,000');
    });

    it('adds RTL region when RTL option is true', () => {
      const result = formatVTT(sampleEntries, { rtl: true });
      expect(result).toContain('REGION');
      expect(result).toContain('writing-mode:rl');
    });
  });

  // ==========================================================================
  // formatTTML
  // ==========================================================================
  
  describe('formatTTML', () => {
    it('formats entries to valid TTML', () => {
      const result = formatTTML(sampleEntries);
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<tt xmlns="http://www.w3.org/ns/ttml"');
    });

    it('converts newlines to br tags', () => {
      const entries = [{ index: 1, startTime: '00:00:01.000', endTime: '00:00:04.000', text: 'Line 1\nLine 2' }];
      const result = formatTTML(entries);
      expect(result).toContain('Line 1<br/>Line 2');
    });

    it('adds RTL direction attribute for RTL locales', () => {
      const result = formatTTML(sampleEntries, { rtl: true, locale: 'ar' });
      expect(result).toContain('tts:direction="rtl"');
    });

    it('preserves body ID when provided', () => {
      const result = formatTTML(sampleEntries, { bodyId: 'main-content' });
      expect(result).toContain('<body id="main-content">');
    });

    it('escapes XML special characters', () => {
      const entries = [{ index: 1, startTime: '00:00:01.000', endTime: '00:00:04.000', text: 'Test & "more" <stuff>' }];
      const result = formatTTML(entries);
      expect(result).toContain('Test &amp; &quot;more&quot; &lt;stuff&gt;');
    });
  });

  // ==========================================================================
  // translateSubtitles
  // ==========================================================================
  
  describe('translateSubtitles', () => {
    it('translates subtitles to Arabic', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Hello world' }];
      const translated = translateSubtitles(entries, 'ar');
      expect(translated[0].text).toBe('مرحبا بالعالم');
      expect(translated[0].startTime).toBe('00:00:01,000');
      expect(translated[0].endTime).toBe('00:00:04,000');
    });

    it('translates subtitles to Hebrew', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Hello world' }];
      const translated = translateSubtitles(entries, 'he');
      expect(translated[0].text).toBe('שלום עולם');
    });

    it('preserves untranslated text when no translation available', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Unknown phrase' }];
      const translated = translateSubtitles(entries, 'ar');
      expect(translated[0].text).toBe('Unknown phrase');
    });

    it('preserves all timing information during translation', () => {
      const entries = [
        { index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Hello' },
        { index: 2, startTime: '00:00:05,000', endTime: '00:00:08,000', text: 'Thank you' },
      ];
      const translated = translateSubtitles(entries, 'he');
      expect(translated[0].startTime).toBe('00:00:01,000');
      expect(translated[0].index).toBe(1);
      expect(translated[1].endTime).toBe('00:00:08,000');
      expect(translated[1].index).toBe(2);
    });

    it('handles locale variants (e.g., ar-SA)', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Hello world' }];
      const translated = translateSubtitles(entries, 'ar-SA');
      expect(translated[0].text).toBe('مرحبا بالعالم');
    });
  });

  // ==========================================================================
  // shiftTimestamps
  // ==========================================================================
  
  describe('shiftTimestamps', () => {
    it('shifts timestamps forward with positive offset', () => {
      const shifted = shiftTimestamps(sampleEntries, 1000);
      expect(shifted[0].startTime).toBe('00:00:02,000');
      expect(shifted[0].endTime).toBe('00:00:05,000');
    });

    it('shifts timestamps backward with negative offset', () => {
      const shifted = shiftTimestamps(sampleEntries, -500);
      expect(shifted[0].startTime).toBe('00:00:00,500');
      expect(shifted[0].endTime).toBe('00:00:03,500');
    });

    it('clamps to zero when negative would result', () => {
      const entries = [{ index: 1, startTime: '00:00:00,200', endTime: '00:00:01,000', text: 'Test' }];
      const shifted = shiftTimestamps(entries, -500);
      expect(shifted[0].startTime).toBe('00:00:00,000');
    });

    it('preserves original entries (returns new array)', () => {
      const original = [...sampleEntries];
      const shifted = shiftTimestamps(sampleEntries, 1000);
      expect(shifted).not.toBe(sampleEntries);
      expect(sampleEntries[0].startTime).toBe('00:00:01,000');
    });

    it('handles large offsets correctly', () => {
      const shifted = shiftTimestamps(sampleEntries, 3600000); // 1 hour
      expect(shifted[0].startTime).toBe('01:00:01,000');
    });
  });

  // ==========================================================================
  // Time Utilities
  // ==========================================================================
  
  describe('timeToMilliseconds', () => {
    it('converts SRT time format to milliseconds', () => {
      expect(timeToMilliseconds('00:00:01,000')).toBe(1000);
      expect(timeToMilliseconds('00:01:00,000')).toBe(60000);
      expect(timeToMilliseconds('01:00:00,000')).toBe(3600000);
    });

    it('converts VTT time format to milliseconds', () => {
      expect(timeToMilliseconds('00:00:01.000')).toBe(1000);
      expect(timeToMilliseconds('00:01:00.500')).toBe(60500);
    });

    it('handles milliseconds correctly', () => {
      expect(timeToMilliseconds('00:00:00,123')).toBe(123);
      expect(timeToMilliseconds('00:00:00.456')).toBe(456);
    });

    it('throws error for invalid format', () => {
      expect(() => timeToMilliseconds('invalid')).toThrow();
      expect(() => timeToMilliseconds('00:00:00')).toThrow();
    });
  });

  describe('millisecondsToTime', () => {
    it('converts milliseconds to SRT format by default', () => {
      expect(millisecondsToTime(1000)).toBe('00:00:01,000');
      expect(millisecondsToTime(60000)).toBe('00:01:00,000');
      expect(millisecondsToTime(3600000)).toBe('01:00:00,000');
    });

    it('converts milliseconds to VTT format when specified', () => {
      expect(millisecondsToTime(1000, 'vtt')).toBe('00:00:01.000');
      expect(millisecondsToTime(60500, 'vtt')).toBe('00:01:00.500');
    });

    it('pads values correctly', () => {
      expect(millisecondsToTime(5)).toBe('00:00:00,005');
      expect(millisecondsToTime(50)).toBe('00:00:00,050');
      expect(millisecondsToTime(500)).toBe('00:00:00,500');
    });

    it('handles large values', () => {
      expect(millisecondsToTime(3661001)).toBe('01:01:01,001');
    });
  });

  // ==========================================================================
  // RTL Support
  // ==========================================================================
  
  describe('isRtlLocale', () => {
    it('returns true for Arabic locale', () => {
      expect(isRtlLocale('ar')).toBe(true);
      expect(isRtlLocale('ar-SA')).toBe(true);
      expect(isRtlLocale('AR')).toBe(true);
    });

    it('returns true for Hebrew locale', () => {
      expect(isRtlLocale('he')).toBe(true);
      expect(isRtlLocale('he-IL')).toBe(true);
      expect(isRtlLocale('iw')).toBe(true); // legacy code
    });

    it('returns true for Persian locale', () => {
      expect(isRtlLocale('fa')).toBe(true);
    });

    it('returns true for Urdu locale', () => {
      expect(isRtlLocale('ur')).toBe(true);
    });

    it('returns false for LTR locales', () => {
      expect(isRtlLocale('en')).toBe(false);
      expect(isRtlLocale('en-US')).toBe(false);
      expect(isRtlLocale('fr')).toBe(false);
      expect(isRtlLocale('de')).toBe(false);
    });

    it('returns false for undefined/null', () => {
      expect(isRtlLocale(undefined)).toBe(false);
      expect(isRtlLocale('')).toBe(false);
    });
  });

  describe('applyRtlFormatting', () => {
    it('adds RTL mark for Arabic locale', () => {
      const result = applyRtlFormatting('Hello', 'ar');
      expect(result.startsWith('\u200F')).toBe(true);
    });

    it('adds RTL mark for Hebrew locale', () => {
      const result = applyRtlFormatting('Hello', 'he');
      expect(result.startsWith('\u200F')).toBe(true);
    });

    it('returns unchanged for LTR locales', () => {
      expect(applyRtlFormatting('Hello', 'en')).toBe('Hello');
    });

    it('handles multiline text', () => {
      const result = applyRtlFormatting('Line 1\nLine 2', 'ar');
      expect(result).toBe('\u200FLine 1\n\u200FLine 2');
    });

    it('returns unchanged when no locale', () => {
      expect(applyRtlFormatting('Hello', undefined)).toBe('Hello');
    });
  });

  describe('wrapRtlMarkup', () => {
    it('wraps text in RTL span for Arabic', () => {
      const result = wrapRtlMarkup('Hello', 'ar');
      expect(result).toBe('<span dir="rtl">Hello</span>');
    });

    it('escapes HTML special characters', () => {
      const result = wrapRtlMarkup('Test & more', 'ar');
      expect(result).toBe('<span dir="rtl">Test &amp; more</span>');
    });

    it('returns unchanged for LTR locales', () => {
      expect(wrapRtlMarkup('Hello', 'en')).toBe('Hello');
    });
  });

  describe('RTL_LOCALES', () => {
    it('contains expected RTL locales', () => {
      expect(RTL_LOCALES.has('ar')).toBe(true);
      expect(RTL_LOCALES.has('he')).toBe(true);
      expect(RTL_LOCALES.has('iw')).toBe(true);
      expect(RTL_LOCALES.has('fa')).toBe(true);
      expect(RTL_LOCALES.has('ur')).toBe(true);
    });
  });

  // ==========================================================================
  // Validation
  // ==========================================================================
  
  describe('validateSubtitles', () => {
    it('returns empty array for valid subtitles', () => {
      const issues = validateSubtitles(sampleEntries);
      expect(issues).toHaveLength(0);
    });

    it('detects empty text', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: '' }];
      const issues = validateSubtitles(entries);
      expect(issues).toContainEqual({ index: 1, issue: 'Empty subtitle text', severity: 'error' });
    });

    it('detects negative duration', () => {
      const entries = [{ index: 1, startTime: '00:00:04,000', endTime: '00:00:01,000', text: 'Test' }];
      const issues = validateSubtitles(entries);
      expect(issues).toContainEqual({ index: 1, issue: 'End time must be after start time', severity: 'error' });
    });

    it('detects zero duration', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:01,000', text: 'Test' }];
      const issues = validateSubtitles(entries);
      expect(issues).toContainEqual({ index: 1, issue: 'End time must be after start time', severity: 'error' });
    });

    it('detects overlapping subtitles', () => {
      const entries = [
        { index: 1, startTime: '00:00:01,000', endTime: '00:00:05,000', text: 'First' },
        { index: 2, startTime: '00:00:03,000', endTime: '00:00:06,000', text: 'Second' },
      ];
      const issues = validateSubtitles(entries);
      expect(issues).toContainEqual({ index: 2, issue: 'Overlaps with previous subtitle', severity: 'warning' });
    });

    it('detects very short duration', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:01,200', text: 'Test' }];
      const issues = validateSubtitles(entries);
      expect(issues).toContainEqual({ index: 1, issue: 'Subtitle duration less than 500ms', severity: 'warning' });
    });

    it('detects very long duration', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:10,000', text: 'Test' }];
      const issues = validateSubtitles(entries);
      expect(issues).toContainEqual({ index: 1, issue: 'Subtitle duration more than 7 seconds', severity: 'warning' });
    });

    it('detects very long text', () => {
      const entries = [{ index: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'a'.repeat(101) }];
      const issues = validateSubtitles(entries);
      expect(issues).toContainEqual({ index: 1, issue: 'Subtitle text very long (>100 chars)', severity: 'warning' });
    });

    it('returns multiple issues when present', () => {
      const entries = [
        { index: 1, startTime: '00:00:01,000', endTime: '00:00:01,000', text: '' },
        { index: 2, startTime: '00:00:01,000', endTime: '00:00:10,000', text: 'a'.repeat(200) },
      ];
      const issues = validateSubtitles(entries);
      expect(issues.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==========================================================================
  // Integration Tests
  // ==========================================================================
  
  describe('Integration', () => {
    it('round-trips SRT parsing and formatting', () => {
      const entries = parseSRT(sampleSRT);
      const formatted = formatSRT(entries);
      const reparsed = parseSRT(formatted);
      
      expect(reparsed).toHaveLength(entries.length);
      expect(reparsed[0].text).toBe(entries[0].text);
      expect(reparsed[0].startTime).toBe(entries[0].startTime);
    });

    it('round-trips VTT parsing and formatting', () => {
      const entries = parseVTT(sampleVTT);
      const formatted = formatVTT(entries);
      const reparsed = parseVTT(formatted);
      
      expect(reparsed).toHaveLength(entries.length);
      expect(reparsed[0].text).toBe(entries[0].text);
    });

    it('converts SRT to VTT correctly', () => {
      const srtEntries = parseSRT(sampleSRT);
      const vttOutput = formatVTT(srtEntries);
      
      expect(vttOutput.startsWith('WEBVTT')).toBe(true);
      expect(vttOutput).toContain('00:00:01.000 --> 00:00:04.000');
    });

    it('converts VTT to SRT correctly', () => {
      const vttEntries = parseVTT(sampleVTT);
      const srtOutput = formatSRT(vttEntries);
      
      expect(srtOutput).toContain('1\n00:00:01,000 --> 00:00:04,000');
    });

    it('translates and formats to RTL format', () => {
      const entries = parseSRT(sampleSRT);
      const translated = translateSubtitles(entries, 'ar');
      const formatted = formatVTT(translated, { rtl: true, locale: 'ar' });
      
      expect(formatted).toContain('writing-mode:rl');
      expect(formatted).toContain('مرحبا بالعالم');
    });

    it('handles complex workflow: parse -> shift -> translate -> format', () => {
      const entries = parseSRT(sampleSRT);
      const shifted = shiftTimestamps(entries, 2000);
      const translated = translateSubtitles(shifted, 'he');
      const formatted = formatSRT(translated, { rtl: true, locale: 'he' });
      
      expect(formatted).toContain('00:00:03,000 --> 00:00:06,000');
      expect(formatted).toContain('שלום עולם');
    });
  });
});
