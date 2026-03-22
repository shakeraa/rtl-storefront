# T0401 — Fix Integration Translation Stubs

## Status: queue
## Priority: significant

## Problem
`services/integrations/index.ts:103-207` — all translate functions (`translatePageFlyContent`, `translateJudgeMeReview`, `translateKlaviyoTemplate`, `translateBundleAppContent`) prepend `[locale]` instead of real translation. `checkIntegrationHealth` always returns healthy.

## Fix
Wire to the real TranslationEngine.
