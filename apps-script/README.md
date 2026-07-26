# Apps Script performance upgrade

This folder contains the Google Apps Script source used by Heidi Quiz.

## Apply the upgrade

1. Open the current Heidi Quiz Apps Script project.
2. Replace the complete contents of `Code.gs` with the optimized `Code.gs` package supplied with this release, or copy the `.gs` modules from this folder into the same Apps Script project.
3. Remove the old duplicated source before saving.
4. Run `migratePerformanceUpgrade()` once from the Apps Script editor.
5. Authorize the execution if Google requests it.
6. Create a **new Web App deployment version** using the same access settings:
   - Execute as: the deployment owner
   - Who has access: Anyone
7. Keep the same `/exec` URL when updating the existing deployment. If Google creates a new URL, update `APPS_SCRIPT_URL` in Render.

The migration appends `questionOrderSeed` to the `Participantes` sheet without moving or deleting existing data. Existing participants receive a stable seed based on their participant ID.

## Concurrency changes

- Every participant receives a stable randomized question order.
- Guest joins no longer hold a global script lock.
- Guest answers no longer hold a global script lock.
- Answer counters update incrementally instead of rescanning all answers.
- Tokens, participants, sessions, session questions, and active answer maps use CacheService with Sheets fallback.
- Guest answer auditing is disabled by default to avoid one extra Sheets write per answer.

The Node backend serializes only submissions from the same participant and limits concurrent Apps Script calls to 20.
