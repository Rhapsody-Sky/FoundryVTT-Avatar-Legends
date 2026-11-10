# Switch from the original Legends system to this fork

[Deutsch](umstieg.md) · [README](../README.md) · [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases)

> **Not ready for production migration yet.** The repository currently contains a development candidate. Wait for a tested release whose notes explicitly support your starting version. A source commit or a green CI check is not a tested Foundry upgrade. These instructions describe the planned, controlled switch once such a release exists.

## What changes — and what does not?

You replace the installed **game system**, not the world. This fork retains the system ID `legends`; you do not need to create a new campaign, rename a world, edit `world.json`, or change compendium UUIDs just to select this fork. Keeping the ID preserves these associations, but does not guarantee that every old document or module is compatible.

The original and this fork cannot coexist in the same data directory. Switching the system affects **every world using `legends` in that directory**, not just the next world you open. The ApplicationV2 character sheets look and behave differently from 1.x.

## 1. Check your starting point

Record your Foundry version/build and installed Legends version from Setup before making changes.

| Starting point | What to check before proceeding |
| --- | --- |
| Original Legends 1.x | The target release must explicitly support your version. Test the sheet/data transition on a copy; do not assume every historical version is covered. |
| My earlier 1.4.0 V14 port | Check description text, notes and saved sheet selections in particular. This port used `system.description`; upstream V2 uses `system.look`. |
| Original Legends 2.0.x / 2.1.0 | These already use ApplicationV2. Still back up and check data, modules and the exact target release notes. |
| Foundry older or newer than 14 | Stop: this candidate targets Foundry 14 only. Plan and test a core-version change separately; do not downgrade a world to fit this fork. |
| A newer or otherwise unlisted system version | Ask before switching. A lower version number is not a safe rollback route. |

## 2. Make a recoverable backup

- Tell players about the maintenance window and return to Setup. Do not launch worlds while changing the system.
- Record the actual User Data directory; a hosting provider may use a non-default location.
- Use Foundry's backup tools, or stop the Foundry application/service completely before manually copying data. Keep a separate copy of the affected worlds, the entire installed `Data/systems/legends` directory, and all referenced uploads/assets. A full User Data backup is the simplest way to include configuration and module dependencies too.
- Verify that the backup is readable and contains the expected files. Store it **outside the active data directory**, with the original Foundry/system versions and date recorded. A renamed folder beside the live files is not an independent backup.
- If you edited the system's bundled compendia or code, preserve those changes separately. Installing a new package will not merge them automatically. Export custom content to your own world/module before switching.

See [Foundry's official backup guidance](https://foundryvtt.com/article/user-data-backup/). Do not use live cloud-folder synchronization as a database backup.

## 3. Rehearse in a separate test installation

Use a copy of the backup in a **separate User Data directory**, not merely a second world in the live installation. A second world would still share the same system package. Never point two running Foundry instances at the same data directory.

Perform the replacement below in the test installation first, then complete the acceptance checklist. If anything fails, stop; do not repeat the migration on the live worlds.

## 4. Replace only the system package

This explicit file-based route avoids relying on Foundry to change an already-installed package's update source. If your host does not allow file access, ask the provider to perform these steps. Do not uninstall or delete a world.

1. Select a tested release from **this repository's Releases page**. Download its `legends-v<version>.zip`, `system.json` and `SHA256SUMS.txt`; do not use GitHub's “Source code” ZIP. Check the ZIP's SHA256 against the published checksum.
2. Ensure automatic world startup is disabled, then stop the relevant Foundry application/service completely.
3. Move the existing `Data/systems/legends` directory to the recorded backup location **outside `Data/systems`**. Keep it; do not delete it or extract the new package over it.
4. Create a new `Data/systems/legends` directory and extract the release ZIP directly into it. The manifest must be at `Data/systems/legends/system.json`, not inside another nested folder. Do not touch `Data/worlds`.
5. Check that the manifest says `id: legends`, the expected release version, a Rhapsody title, and GitHub URLs pointing to `Rhapsody-Sky/FoundryVTT-Avatar-Legends`. Preserve the host's service-user and file-transfer permissions.
6. Create an empty file named **`legends.lock`** inside the new system directory. On Windows, make sure it is not secretly named `legends.lock.txt`.
7. Start Foundry into Setup, without launching a world. Confirm the Rhapsody system title/version and that the system is locked. If the package is invalid or the old title remains, stop and check the path, manifest and logs; do not try to fix it by editing world metadata.

Once a supported stable release exists, the fork's manifest endpoint will be:

`https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases/latest/download/system.json`

**This endpoint is not live until the first eligible release is published.** Editing a URL in your old manifest alone does not install the new code or perform a safe migration.

## 5. Verify the copied world before going live

Launch only the **test copy** first and sign in as GM. A world launch can already trigger migration; checking the data is not a read-only operation.

- [ ] Actors, items, scenes, journals and compendium links are present.
- [ ] Player, NPC, campaign and item sheets open; any old custom sheet assignments are checked.
- [ ] Look/description and notes retain the expected text. If both old `description` and `look` had content, compare both before deciding what to keep; the candidate does not merge them automatically.
- [ ] Edit text, save, close/reopen, and reload the browser. Check that an intentionally cleared field stays empty and the paragraph menu does not repeatedly open.
- [ ] Test imported characters and unlinked token actors as well as ordinary actors.
- [ ] Rolls work from sheets and chat. Test enabled integrations/modules and the optional Exchange tracker if used.
- [ ] Browser/server logs show no migration or validation errors.

If all checks pass for every affected world, schedule the live switch, take a **fresh** backup and repeat the same package replacement on production. Keep the old backup after the first successful session.

## 6. Stay on the fork

Keep the native update lock in place. Foundry may follow the official package index for the shared ID `legends`, even with a different manifest URL. Do not rely on “Update All” to stay on this fork. For future reviewed fork releases, repeat the backup/replacement/check process and restore the lock. Fully separate IDs would require a separate migration of references; this guide does not do that.

## If something goes wrong

Stop the affected instance and preserve its current files and logs before attempting recovery.

- **No world has been launched since replacement:** restore the saved system directory while Foundry is stopped. Retain the attempted new package for diagnosis.
- **A world has been launched or saved with the new version:** putting the old code back is not enough to undo a data migration. Restore the matching pre-switch world backup and system together, using the matching Foundry version. Preserve newer files first; restoration otherwise loses changes made since the backup. Ask for help if unsure.

Use [migration help](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml) with versions, the failed step and redacted error text. **Do not upload entire worlds, passwords, license keys, access links or private player information.**
