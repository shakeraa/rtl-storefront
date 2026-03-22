/**
 * Mailchimp Integration Service
 * T0203: Integration - Mailchimp Templates
 * 
 * Handles translation of Mailchimp email templates while preserving merge tags.
 * Supports RTL layouts for Arabic, Hebrew, and other RTL languages.
 */

import { SUPPORTED_LOCALES, type Locale } from '../translation/types';

// Mailchimp merge tag pattern: *|TAG_NAME|*
export const MAILCHIMP_MERGE_TAG_REGEX = /\*\|[A-Z_][A-Z0-9_]*\|\*/g;

// Extended merge tag pattern with fallback support: *|TAG:default|*
export const MAILCHIMP_MERGE_TAG_WITH_FALLBACK_REGEX = /\*\|[A-Z_][A-Z0-9_]*(?::[^|]*)?\|\*/g;

// Mailchimp conditional blocks: *|IF:TAG|* ... *|END:IF|*
export const MAILCHIMP_CONDITIONAL_BLOCK_REGEX = /\*\|IF:[A-Z_][A-Z0-9_]*\|\*[\s\S]*?\*\|END:IF\|\*/g;

// Mailchimp conditional else blocks: *|ELSEIF:TAG|*, *|ELSE:|*
export const MAILCHIMP_CONDITIONAL_ELSE_REGEX = /\*\|ELSE(?:IF:[A-Z_][A-Z0-9_]*)?:\*\|/g;

// RTL locales
export const RTL_LOCALES = ['ar', 'he', 'ur', 'fa'];

// Mailchimp template types
export type MailchimpTemplateType = 'campaign' | 'automation' | 'transactional';

// Extracted merge tag with metadata
export interface ExtractedMergeTag {
  tag: string;
  name: string;
  fallback?: string;
  index: number;
  placeholder: string;
}

// Mailchimp template structure
export interface MailchimpTemplate {
  id: string;
  name: string;
  type: MailchimpTemplateType;
  content: string;
  subject: string;
  previewText?: string;
  fromName?: string;
  replyTo?: string;
  locale: Locale;
  rtl: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Template translation result
export interface TemplateTranslationResult {
  original: string;
  translated: string;
  locale: Locale;
  rtl: boolean;
  tagsExtracted: number;
  tagsRestored: number;
  mergeTags: ExtractedMergeTag[];
}

// Campaign template structure
export interface MailchimpCampaign {
  id: string;
  name: string;
  templateId: string;
  subjectLine: string;
  previewText: string;
  fromName: string;
  replyTo: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  recipients?: {
    listId: string;
    segmentText?: string;
  };
}

// Automation workflow structure
export interface MailchimpAutomation {
  id: string;
  name: string;
  status: 'paused' | 'sending' | 'archived';
  emails: MailchimpAutomationEmail[];
}

// Automation email within a workflow
export interface MailchimpAutomationEmail {
  id: string;
  name: string;
  subject: string;
  content: string;
  position: number;
  delay?: {
    amount: number;
    type: 'day' | 'hour' | 'week';
  };
}

/**
 * Check if a position is inside any of the given ranges
 */
function isInsideRanges(ranges: Array<{ start: number; end: number }>, position: number): boolean {
  return ranges.some(range => position >= range.start && position < range.end);
}

/**
 * Extract all Mailchimp merge tags from a template
 * Handles standard tags (*|FNAME|*), tags with fallbacks (*|FNAME:Guest|*),
 * Excludes merge tags that are inside conditional blocks (those are handled separately)
 */
export function extractMergeTags(template: string): ExtractedMergeTag[] {
  const tags: ExtractedMergeTag[] = [];
  const seen = new Set<string>();
  let index = 0;

  // First, identify conditional block ranges
  const conditionalRanges: Array<{ start: number; end: number }> = [];
  const condMatches = template.matchAll(/\*\|IF:[A-Z_][A-Z0-9_]*\|\*/g);
  
  for (const match of condMatches) {
    const startIndex = match.index ?? 0;
    const endMarker = '*|END:IF|*';
    const endIndex = template.indexOf(endMarker, startIndex);
    
    if (endIndex !== -1) {
      conditionalRanges.push({
        start: startIndex,
        end: endIndex + endMarker.length,
      });
    }
  }

  // Find all merge tags with fallback support
  const matches = template.matchAll(MAILCHIMP_MERGE_TAG_WITH_FALLBACK_REGEX);
  
  for (const match of matches) {
    const fullMatch = match[0];
    const matchIndex = match.index ?? 0;
    
    // Skip merge tags inside conditional blocks
    if (isInsideRanges(conditionalRanges, matchIndex)) {
      continue;
    }
    
    // Skip duplicates for extraction purposes (same tag may appear multiple times)
    const key = `${fullMatch}_${matchIndex}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Parse tag name and fallback
    const innerContent = fullMatch.slice(2, -2); // Remove *| and |*
    const colonIndex = innerContent.indexOf(':');
    
    let name: string;
    let fallback: string | undefined;
    
    if (colonIndex > 0) {
      name = innerContent.slice(0, colonIndex);
      fallback = innerContent.slice(colonIndex + 1);
    } else {
      name = innerContent;
    }

    tags.push({
      tag: fullMatch,
      name,
      fallback,
      index: matchIndex,
      placeholder: `__MC_TAG_${index++}__`,
    });
  }

  return tags;
}

/**
 * Extract conditional blocks separately
 * Returns the conditional blocks found in the template
 */
export function extractConditionalBlocks(template: string): Array<{
  block: string;
  index: number;
  condition: string;
}> {
  const blocks: Array<{ block: string; index: number; condition: string }> = [];
  const matches = template.matchAll(/\*\|IF:([A-Z_][A-Z0-9_]*)\|\*/g);

  for (const match of matches) {
    const condition = match[1];
    const startIndex = match.index ?? 0;
    
    // Find the corresponding END:IF
    const endMarker = '*|END:IF|*';
    const endIndex = template.indexOf(endMarker, startIndex);
    
    if (endIndex !== -1) {
      const block = template.slice(startIndex, endIndex + endMarker.length);
      blocks.push({
        block,
        index: startIndex,
        condition,
      });
    }
  }

  return blocks;
}

/**
 * Replace merge tags with placeholders for safe translation
 */
export function replaceMergeTagsWithPlaceholders(
  template: string,
  tags: ExtractedMergeTag[]
): string {
  let result = template;
  
  // Sort by index in reverse order to replace from end to start
  // This preserves indices for earlier matches
  const sortedTags = [...tags].sort((a, b) => b.index - a.index);
  
  for (const tag of sortedTags) {
    result = result.slice(0, tag.index) + tag.placeholder + result.slice(tag.index + tag.tag.length);
  }
  
  return result;
}

/**
 * Restore merge tags from placeholders after translation
 */
export function restoreMergeTags(
  translated: string,
  tags: ExtractedMergeTag[]
): string {
  let result = translated;
  
  for (const tag of tags) {
    const regex = new RegExp(tag.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, tag.tag);
  }
  
  return result;
}

/**
 * Check if a locale requires RTL layout
 */
export function isRTLLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * Add RTL support to HTML email template
 */
export function addRTLSupport(html: string, locale: Locale): string {
  if (!isRTLLocale(locale)) {
    return html;
  }

  // Add dir="rtl" and lang attributes to HTML tag if present
  let result = html;
  
  // Handle <html> tag
  if (result.includes('<html')) {
    result = result.replace(
      /<html([^>]*)>/i,
      `<html$1 dir="rtl" lang="${locale}">`
    );
  }
  
  // Handle <body> tag if no html tag
  if (!result.includes('<html') && result.includes('<body')) {
    result = result.replace(
      /<body([^>]*)>/i,
      `<body$1 dir="rtl">`
    );
  }
  
  // Add RTL CSS to style tag if present
  const rtlStyles = `
    <style type="text/css">
      /* RTL Styles for ${locale} */
      body, table, td, p, div { direction: rtl; text-align: right; }
      .ltr { direction: ltr; }
    </style>
  `;
  
  if (result.includes('</head>')) {
    result = result.replace('</head>', `${rtlStyles}</head>`);
  } else if (result.includes('<body')) {
    result = result.replace('<body', `${rtlStyles}<body`);
  }
  
  return result;
}

/**
 * Translate text content (placeholder for actual translation service)
 * In production, this would call a translation API
 */
async function translateContent(
  content: string,
  locale: Locale
): Promise<string> {
  // Placeholder: prefix with locale to indicate translation
  // In production, this would call a translation service
  if (content.trim().length === 0) {
    return content;
  }
  
  // Simple mock translation - in real implementation, this would use
  // the app's translation service
  return `[${locale}] ${content}`;
}

/**
 * Translate a Mailchimp template while preserving merge tags
 */
export async function translateMailchimpTemplate(
  template: string,
  locale: Locale,
  options: {
    preserveConditionals?: boolean;
    addRTL?: boolean;
  } = {}
): Promise<TemplateTranslationResult> {
  const { preserveConditionals = true, addRTL = true } = options;
  
  // Step 1: Extract merge tags
  const mergeTags = extractMergeTags(template);
  
  // Step 2: Extract conditional blocks if needed
  const conditionalBlocks = preserveConditionals ? extractConditionalBlocks(template) : [];
  
  // Step 3: Create a working copy with placeholders
  let workingTemplate = template;
  
  // Replace conditional blocks with placeholders first
  const conditionalPlaceholders: Array<{ placeholder: string; block: string; index: number }> = [];
  let condIndex = 0;
  
  // Sort blocks by index descending to replace from end to start
  const sortedBlocks = [...conditionalBlocks].sort((a, b) => b.index - a.index);
  
  for (const block of sortedBlocks) {
    const placeholder = `__MC_COND_${condIndex++}__`;
    conditionalPlaceholders.push({
      placeholder,
      block: block.block,
      index: block.index,
    });
    workingTemplate = workingTemplate.slice(0, block.index) + 
                     placeholder + 
                     workingTemplate.slice(block.index + block.block.length);
  }
  
  // Step 4: Replace merge tags with placeholders
  workingTemplate = replaceMergeTagsWithPlaceholders(workingTemplate, mergeTags);
  
  // Step 5: Translate the content
  let translatedContent = await translateContent(workingTemplate, locale);
  
  // Step 6: Restore conditional blocks
  for (const cond of conditionalPlaceholders) {
    const regex = new RegExp(cond.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    translatedContent = translatedContent.replace(regex, cond.block);
  }
  
  // Step 7: Restore merge tags
  translatedContent = restoreMergeTags(translatedContent, mergeTags);
  
  // Step 8: Add RTL support if needed
  if (addRTL) {
    translatedContent = addRTLSupport(translatedContent, locale);
  }
  
  return {
    original: template,
    translated: translatedContent,
    locale,
    rtl: isRTLLocale(locale),
    tagsExtracted: mergeTags.length,
    tagsRestored: mergeTags.length,
    mergeTags,
  };
}

/**
 * Translate Mailchimp campaign
 */
export async function translateMailchimpCampaign(
  campaign: MailchimpCampaign,
  locale: Locale,
  options?: { addRTL?: boolean }
): Promise<{
  campaign: MailchimpCampaign;
  translation: TemplateTranslationResult;
}> {
  const subjectResult = await translateMailchimpTemplate(
    campaign.subjectLine,
    locale,
    { ...options, preserveConditionals: false }
  );
  
  const previewResult = campaign.previewText 
    ? await translateMailchimpTemplate(campaign.previewText, locale, { ...options, preserveConditionals: false })
    : null;
  
  const contentResult = await translateMailchimpTemplate(campaign.content, locale, options);
  
  const translatedCampaign: MailchimpCampaign = {
    ...campaign,
    subjectLine: subjectResult.translated,
    previewText: previewResult?.translated ?? campaign.previewText,
    content: contentResult.translated,
  };
  
  return {
    campaign: translatedCampaign,
    translation: contentResult,
  };
}

/**
 * Translate Mailchimp automation email
 */
export async function translateMailchimpAutomationEmail(
  email: MailchimpAutomationEmail,
  locale: Locale,
  options?: { addRTL?: boolean }
): Promise<{
  email: MailchimpAutomationEmail;
  translation: TemplateTranslationResult;
}> {
  const subjectResult = await translateMailchimpTemplate(
    email.subject,
    locale,
    { ...options, preserveConditionals: false }
  );
  
  const contentResult = await translateMailchimpTemplate(email.content, locale, options);
  
  const translatedEmail: MailchimpAutomationEmail = {
    ...email,
    subject: subjectResult.translated,
    content: contentResult.translated,
  };
  
  return {
    email: translatedEmail,
    translation: contentResult,
  };
}

/**
 * Translate full Mailchimp automation workflow
 */
export async function translateMailchimpAutomation(
  automation: MailchimpAutomation,
  locale: Locale,
  options?: { addRTL?: boolean }
): Promise<{
  automation: MailchimpAutomation;
  translations: Array<{ emailId: string; translation: TemplateTranslationResult }>;
}> {
  const translatedEmails: MailchimpAutomationEmail[] = [];
  const translations: Array<{ emailId: string; translation: TemplateTranslationResult }> = [];
  
  for (const email of automation.emails) {
    const result = await translateMailchimpAutomationEmail(email, locale, options);
    translatedEmails.push(result.email);
    translations.push({
      emailId: email.id,
      translation: result.translation,
    });
  }
  
  return {
    automation: {
      ...automation,
      emails: translatedEmails,
    },
    translations,
  };
}

// In-memory store for templates (in production, this would be a database)
const templateStore: Map<string, MailchimpTemplate> = new Map();

/**
 * Save a Mailchimp template to the store
 */
export function saveMailchimpTemplate(template: Omit<MailchimpTemplate, 'createdAt' | 'updatedAt'>): MailchimpTemplate {
  const now = new Date();
  const fullTemplate: MailchimpTemplate = {
    ...template,
    createdAt: templateStore.has(template.id) ? templateStore.get(template.id)!.createdAt : now,
    updatedAt: now,
  };
  templateStore.set(template.id, fullTemplate);
  return fullTemplate;
}

/**
 * Get a Mailchimp template by ID
 */
export function getMailchimpTemplate(id: string): MailchimpTemplate | undefined {
  return templateStore.get(id);
}

/**
 * Get all Mailchimp templates
 */
export function getAllMailchimpTemplates(): MailchimpTemplate[] {
  return Array.from(templateStore.values());
}

/**
 * Get Mailchimp templates filtered by locale
 */
export function getMailchimpTemplates(locale: Locale): MailchimpTemplate[] {
  return getAllMailchimpTemplates().filter(t => t.locale === locale);
}

/**
 * Get Mailchimp templates by type
 */
export function getMailchimpTemplatesByType(type: MailchimpTemplateType): MailchimpTemplate[] {
  return getAllMailchimpTemplates().filter(t => t.type === type);
}

/**
 * Delete a Mailchimp template
 */
export function deleteMailchimpTemplate(id: string): boolean {
  return templateStore.delete(id);
}

/**
 * Clear all templates (mainly for testing)
 */
export function clearMailchimpTemplates(): void {
  templateStore.clear();
}

/**
 * Validate Mailchimp template for common issues
 */
export function validateMailchimpTemplate(template: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for unclosed merge tags
  const openTags = (template.match(/\*\|/g) || []).length;
  const closeTags = (template.match(/\|\*/g) || []).length;
  
  if (openTags !== closeTags) {
    errors.push(`Unclosed merge tags detected: ${openTags} opening, ${closeTags} closing`);
  }
  
  // Check for valid merge tag format
  const invalidTags = template.match(/\*\|[^A-Z_][^|]*\|\*/g);
  if (invalidTags) {
    errors.push(`Invalid merge tag format: ${invalidTags.join(', ')}`);
  }
  
  // Check for unclosed conditional blocks
  const ifCount = (template.match(/\*\|IF:/g) || []).length;
  const endIfCount = (template.match(/\*\|END:IF\|\*/g) || []).length;
  
  if (ifCount !== endIfCount) {
    errors.push(`Unclosed conditional blocks: ${ifCount} IF, ${endIfCount} END:IF`);
  }
  
  // Warnings
  if (!template.includes('*|UNSUB|*') && !template.includes('*|UNSUB:')) {
    warnings.push('Missing unsubscribe link (*|UNSUB|* or *|UNSUB:URL|*)');
  }
  
  if (!template.includes('*|UPDATE_PROFILE|*') && !template.includes('*|UPDATE_PROFILE:')) {
    warnings.push('Missing update profile link');
  }
  
  // Check for images without alt text
  const imgTags = template.match(/<img[^>]*>/gi) || [];
  for (const img of imgTags) {
    if (!img.includes('alt=')) {
      warnings.push('Image without alt text detected');
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get merge tag descriptions for common Mailchimp tags
 */
export function getMergeTagDescriptions(): Record<string, string> {
  return {
    FNAME: 'First name of the subscriber',
    LNAME: 'Last name of the subscriber',
    EMAIL: 'Email address of the subscriber',
    UNSUB: 'Unsubscribe link',
    'UNSUB:URL': 'Unsubscribe URL only',
    'UPDATE_PROFILE': 'Update profile link',
    'UPDATE_PROFILE:URL': 'Update profile URL only',
    'FORWARD': 'Forward to a friend link',
    'ARCHIVE': 'View in browser link',
    'TWITTER:FULLURL': 'Twitter share link',
    'FACEBOOK:FULLURL': 'Facebook share link',
    'MC:SUBJECT': 'Email subject line',
    'MC_LANGUAGE': 'Subscriber language',
    'MC_DATE': 'Current date',
    LIST: 'List name',
    'LIST:ADDRESS': 'List physical address',
    'LIST:COMPANY': 'List company name',
    'LIST:PHONE': 'List phone number',
  };
}

/**
 * Extract translatable text segments from HTML template
 * Returns segments that should be translated
 */
export function extractTranslatableSegments(html: string): Array<{
  text: string;
  type: 'text' | 'attribute' | 'style';
  context?: string;
}> {
  const segments: Array<{ text: string; type: 'text' | 'attribute' | 'style'; context?: string }> = [];
  
  // Extract text content from HTML tags
  const textContentRegex = />([^<]+)</g;
  let match;
  
  while ((match = textContentRegex.exec(html)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 1 && !text.match(/^\s*$/)) {
      segments.push({
        text,
        type: 'text',
        context: 'html_content',
      });
    }
  }
  
  // Extract alt attributes
  const altRegex = /alt=["']([^"']+)["']/gi;
  while ((match = altRegex.exec(html)) !== null) {
    segments.push({
      text: match[1],
      type: 'attribute',
      context: 'alt_text',
    });
  }
  
  // Extract title attributes
  const titleRegex = /title=["']([^"']+)["']/gi;
  while ((match = titleRegex.exec(html)) !== null) {
    segments.push({
      text: match[1],
      type: 'attribute',
      context: 'title_attribute',
    });
  }
  
  return segments;
}

/**
 * Batch translate multiple templates
 */
export async function batchTranslateTemplates(
  templates: Array<{ id: string; content: string }>,
  locale: Locale,
  options?: { addRTL?: boolean }
): Promise<Array<{ id: string; result: TemplateTranslationResult }>> {
  const results: Array<{ id: string; result: TemplateTranslationResult }> = [];
  
  for (const template of templates) {
    const result = await translateMailchimpTemplate(template.content, locale, options);
    results.push({
      id: template.id,
      result,
    });
  }
  
  return results;
}
