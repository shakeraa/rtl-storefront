# T0395 — Fix Content Translator Stub

## Status: queue
## Priority: critical

## Problem
`services/content-translator/index.ts:168` — the central translation dispatcher — fakes all output:
```ts
const translated = `[${targetLocale}] ${sourceText}`;
```
Every service using `contentTranslator.translate()` produces fake output.

## Fix
Wire `ContentTranslator.translate()` to the real `TranslationEngine` at `services/translation/engine.ts` which already has working OpenAI/DeepL/Google providers.
