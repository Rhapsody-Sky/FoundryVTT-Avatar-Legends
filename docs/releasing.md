# Release and migration checklist

## Release 2.2.0

System `avatar-legends` version 2.2.0 and module `avatar-legends-migration` version 1.0.0 passed the isolated migration tests and were approved for release. See [the migration test report](migration-test-2026-11-10.md). The earlier 2.1.1 releases use the old system ID and remain unchanged.

## Before publishing a release

1. Run `npm ci`, `npm test` and `python scripts/package.py` from a clean, committed checkout. Review all changes relative to upstream, including manifest URLs, credits and bundled asset notices.
2. In an isolated Foundry 14 installation, use a **copy** of a backed-up 1.4.0 world. Do not run two Foundry instances against the same data directory. Test fresh installation separately.
3. Check player, NPC, campaign and item sheets; rolls from sheets and chat; both dialog icons; Details and Growth editing without a paragraph-dropdown focus loop; and editor save/reopen behavior.
4. Verify the legacy `system.description` text is retained and copied into an empty `system.look`. Test existing non-empty `look`, both populated fields, save/reload, deliberate clearing after migration, actor imports and unlinked token actors. Confirm the marker and retained HTML survive actual Foundry schema cleaning/server sanitization. The Node tests use a minimal base-model stub and do not establish this runtime behavior.
5. Test existing actor sheet selections from 1.x, compendium links, notes, training, moves, Dice So Nice (if used), and the optional Exchange tracker. Compare world exports and check the browser/server console. Fix any regressions before approval.
6. Record the Foundry build and acceptance results. Only then update the development warnings in README/changelog and both switching guides (`docs/switching.md`, `docs/umstieg.md`), explicitly list tested source versions, and choose the final release version. Update `system.json` and its download URL together. Include links to both switching guides in the release notes.
7. Commit, tag exactly `v<system.json version>`, then publish a GitHub release with both generated ZIPs, `system.json`, `module.json` and `SHA256SUMS.txt`. Keep the migration module assets available on subsequent latest releases because its manifest uses the latest-release URL. Do not use the GitHub source ZIP as the Foundry package. `releases/latest` only resolves an eligible published, non-prerelease release; do not advertise that installation endpoint before verifying it publicly.

## Production deployment

Back up the full old system and world first. Install the new system and migration module alongside the old system, preserving permissions and SFTP access. Use the module's GM assistant for the world conversion; test and approve the world before removing its old system.

The new ID is `avatar-legends`, so the old `legends` package listing no longer controls updates. Leave the new system unlocked and use native Foundry updates. Existing worlds on `legends` require the one-time module migration; replacing their system.json by hand is not a migration.

A test-only localhost mirror is used to verify installation and updates before publication. Its manifests and simulated 2.2.1 update must never be included in public artifacts. The package builder uses the canonical GitHub URLs from source manifests.

Rolling back the code does not undo a data migration. After a world has been saved under a newer version, use its matching pre-upgrade backup for rollback only with explicit approval and awareness that newer edits would be lost.

## Upstream and license provenance

- Source: https://gitlab.com/pacosgrove1/legends
- Baseline: `173611c933b06033520e99b1d196724afbf81e90` (v2.1.0).
- Original code license: MIT, Copyright (c) 2022 Paul Cosgrove.
- Keep the LICENSE file, README contributor credits, font notices and third-party artwork attribution in all distributed packages.
- Upstream announced the end of major development; it did not authorize this fork to imply official endorsement.

Reference for the compatibility hook: https://foundryvtt.com/api/v14/classes/foundry.abstract.TypeDataModel.html#migratedata
