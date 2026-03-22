/**
 * Media Translation Service
 *
 * T0057 - Video Subtitle Translation
 * T0058 - 3D/AR Model Annotation Translation
 */

// ===========================================================================
// T0057 - Video Subtitles
// ===========================================================================

export interface SubtitleEntry {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

export interface SubtitleFile {
  format: "srt" | "vtt";
  locale: string;
  entries: SubtitleEntry[];
}

/**
 * Parse an SRT subtitle string into structured entries.
 *
 * SRT format:
 * 1
 * 00:00:01,000 --> 00:00:04,000
 * Hello world
 */
export function parseSRT(srt: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = srt.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const index = parseInt(lines[0].trim(), 10);
    if (isNaN(index)) continue;

    const timeParts = lines[1].trim().split(/\s*-->\s*/);
    if (timeParts.length !== 2) continue;

    const text = lines.slice(2).join("\n").trim();

    entries.push({
      index,
      startTime: timeParts[0].trim(),
      endTime: timeParts[1].trim(),
      text,
    });
  }

  return entries;
}

/**
 * Parse a WebVTT subtitle string into structured entries.
 *
 * VTT format:
 * WEBVTT
 *
 * 00:00:01.000 --> 00:00:04.000
 * Hello world
 */
export function parseVTT(vtt: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const content = vtt.replace(/^WEBVTT[^\n]*\n/, "").trim();
  const blocks = content.split(/\n\s*\n/);

  let index = 1;
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    // Find the timing line (contains "-->")
    let timingLineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timingLineIndex = i;
        break;
      }
    }

    const timeParts = lines[timingLineIndex].trim().split(/\s*-->\s*/);
    if (timeParts.length !== 2) continue;

    // Strip any position/alignment settings from end time
    const endTime = timeParts[1].split(/\s/)[0];
    const text = lines.slice(timingLineIndex + 1).join("\n").trim();

    if (!text) continue;

    entries.push({
      index,
      startTime: timeParts[0].trim(),
      endTime,
      text,
    });

    index++;
  }

  return entries;
}

/**
 * Generate SRT subtitle content from entries.
 */
export function generateSRT(entries: SubtitleEntry[]): string {
  return entries
    .map(
      (entry) =>
        `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}`,
    )
    .join("\n\n");
}

/**
 * Generate WebVTT subtitle content from entries.
 */
export function generateVTT(entries: SubtitleEntry[]): string {
  const cues = entries
    .map(
      (entry) =>
        `${entry.startTime} --> ${entry.endTime}\n${entry.text}`,
    )
    .join("\n\n");

  return `WEBVTT\n\n${cues}`;
}

/**
 * Extract just the text lines from subtitle entries for translation.
 */
export function extractTextForTranslation(entries: SubtitleEntry[]): string[] {
  return entries.map((entry) => entry.text);
}

/**
 * Apply translated text back to subtitle entries, preserving timing.
 * The translations array must match the entries array in length.
 */
export function applyTranslations(
  entries: SubtitleEntry[],
  translations: string[],
): SubtitleEntry[] {
  if (translations.length !== entries.length) {
    throw new Error(
      `Translation count mismatch: expected ${entries.length}, got ${translations.length}`,
    );
  }

  return entries.map((entry, i) => ({
    ...entry,
    text: translations[i],
  }));
}

// ===========================================================================
// T0058 - 3D/AR Annotations
// ===========================================================================

export interface ARAnnotation {
  id: string;
  position: { x: number; y: number; z: number };
  label: string;
  description?: string;
  locale: string;
}

export interface ARModel {
  id: string;
  productId: string;
  modelUrl: string;
  annotations: ARAnnotation[];
}

/**
 * Extract translatable text from an AR model's annotations.
 */
export function extractAnnotationTexts(
  model: ARModel,
): Array<{ id: string; label: string; description?: string }> {
  return model.annotations.map((annotation) => ({
    id: annotation.id,
    label: annotation.label,
    description: annotation.description,
  }));
}

/**
 * Apply translated labels and descriptions to an AR model's annotations.
 * Returns a new ARModel with translated annotations; positions are preserved.
 */
export function applyAnnotationTranslations(
  model: ARModel,
  translations: Record<string, { label: string; description?: string }>,
): ARModel {
  const updatedAnnotations = model.annotations.map((annotation) => {
    const translation = translations[annotation.id];
    if (!translation) return annotation;

    return {
      ...annotation,
      label: translation.label,
      description: translation.description ?? annotation.description,
    };
  });

  return {
    ...model,
    annotations: updatedAnnotations,
  };
}
