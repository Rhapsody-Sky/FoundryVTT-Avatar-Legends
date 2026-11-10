# Release and migration checklist

## Candidate status

`2.1.1-rhapsody.1` is based on upstream 2.1.0. No production-world migration or UI acceptance has been performed for this candidate. CI validates source and package structure, not the full Foundry runtime.

## Before publishing a release

1. Run `npm test` and `python scripts/package.py` from a clean, committed checkout. Review all changes relative to upstream, including manifest URLs, credits and bundled asset notices.
2. In an isolated Foundry 14 installation, use a **copy** of a backed-up 1.4.0 world. Do not run two Foundry instances against the same data directory. Test fresh installation separately.
3. Check player, NPC, campaign and item sheets; rolls from sheets and chat; both dialog icons; Details and Growth editing without a paragraph-dropdown focus loop; and editor save/reopen behavior.
4. Verify the legacy `system.description` text is retained and copied into an empty `system.look`. Test existing non-empty `look`, both populated fields, save/reload, deliberate clearing after migration, actor imports and unlinked token actors. Confirm the marker and retained HTML survive actual Foundry schema cleaning/server sanitization. The Node tests use a minimal base-model stub and do not establish this runtime behavior.
5. Test existing actor sheet selections from 1.x, compendium links, notes, training, moves, Dice So Nice (if used), and the optional Exchange tracker. Compare world exports and check the browser/server console. Fix any regressions before approval.
6. Record the Foundry build and acceptance results. Only then remove the development warning from README/changelog and choose the final release version. Update `system.json` and its download URL together.
7. Commit, tag exactly `v<system.json version>`, then publish a GitHub release with the generated ZIP, `system.json` and `SHA256SUMS.txt`. Do not use the GitHub source ZIP as the Foundry package. `releases/latest` only resolves an eligible published, non-prerelease release; do not advertise that installation endpoint before verifying it publicly.

## Production deployment

Back up the full system and world first. Confirm the correct instance and that no world will auto-launch. Stop only that instance during the system swap; preserve data, file permissions and SFTP ACLs. Validate every deployed file and the served manifest before launching a world. World launch/migration is a separate intentional step after the copied-world test has passed.

The fork deliberately retains ID `legends`. Foundry may follow the official index for this ID despite a different manifest URL, so keep the native `legends.lock` in place. It is deployment state, not part of the release ZIP. Manually install only reviewed releases and restore the lock. A fully separate ID needs a planned migration for worlds, settings, compendium UUIDs, assets and module integrations.

Rolling back the code does not undo a data migration. After a world has been saved under a newer version, use its matching pre-upgrade backup for rollback only with explicit approval and awareness that newer edits would be lost.

## Upstream and license provenance

- Source: https://gitlab.com/pacosgrove1/legends
- Baseline: `173611c933b06033520e99b1d196724afbf81e90` (v2.1.0).
- Original code license: MIT, Copyright (c) 2022 Paul Cosgrove.
- Keep the LICENSE file, README contributor credits, font notices and third-party artwork attribution in all distributed packages.
- Upstream announced the end of major development; it did not authorize this fork to imply official endorsement.

Reference for the compatibility hook: https://foundryvtt.com/api/v14/classes/foundry.abstract.TypeDataModel.html#migratedata
