---
id: "T0021"
title: "Email Notifications & Alerts"
priority: low
assigned: claude-sec
branch: feature/email-notifications
status: done
created: 2026-03-22
depends_on: []
locks: ["app/services/notifications/"]
test_command: "npm run test:run -- notifications"
---

## Description
Implement email notification system for translation events, quota alerts, and team collaboration.

Notification types:
- Translation complete
- Quota threshold alerts (80%, 100%)
- Untranslated content alerts
- Team member invites
- Webhook failures

## Files to create/modify
- `app/services/notifications/email.ts` - Email service
- `app/services/notifications/templates/` - Email templates
- `app/services/notifications/scheduler.ts` - Notification scheduler
- `app/routes/app.notifications.tsx` - Notification settings UI
- `prisma/schema.prisma` - NotificationSettings model

## Acceptance criteria
- [ ] Email service integration (SendGrid/AWS SES)
- [ ] Translation complete notification
- [ ] Quota 80% warning email
- [ ] Quota 100% limit email
- [ ] Untranslated content weekly digest
- [ ] Team invite emails
- [ ] Webhook failure alerts
- [ ] Notification preferences UI
- [ ] Email template customization
- [ ] Unsubscribe functionality
