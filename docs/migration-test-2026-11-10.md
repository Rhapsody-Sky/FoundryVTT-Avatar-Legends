# Independent system ID and migration module — test report

Test date: 10 November 2026. Runtime: Foundry VTT **14.367**, Chrome with software rendering.
Candidates: system `avatar-legends` **2.2.0**, module `avatar-legends-migration` **1.0.0**.
Neither candidate has been published or installed in production.

## Installation and updates

- Installed the module through Foundry's **Install Module** dialog using an isolated localhost manifest.
- Foundry offered **Install Dependency Automatically** and installed the new system alongside the old system.
- The new ID was absent from the 584-system package index returned during the test.
- After migration, used the normal system **Update** control to install a local metadata-only 2.2.1 fixture. It updated `avatar-legends`, left `legends` unchanged, and retained the expected manifest source. This fixture is not a real release.
- Started the migrated world with the migration module disabled and the old system directory moved outside the installation.

## Existing world copy

The source was a separate backup of a world using the earlier 1.4.0 port: **56 actors, 331 world items, 19 scenes and 5 journals**, plus 189 system-compendium documents. Additional QA actors, scenes and a roll table exercised edge cases.

- The GM dialog appeared automatically after enabling the module. Cancelling left the migration state empty.
- Missing backup confirmation and a simulated missing target system were rejected without starting migration.
- Preserved all original world documents and all 189 old system-compendium documents, including an intentionally edited description.
- Copied four old system compendiums into world compendiums with stable document IDs. Existing links resolve to those copies. The new system's four standard compendiums remain separate.
- An additional run also preserved and rewrote an existing world compendium.
- Copied and byte-verified ten referenced system assets into the world.
- Verified world settings, browser preferences, flags, macros, roll-table references and unlinked-token description overrides.
- Compared original actor, item, scene, journal and compendium fields against their expected migrated values. Excluding modification metadata and the old derived fatigue attribute, the only difference was one trailing whitespace character normalized by the new data model.
- Rendered all three actor sheet types and all nine item sheet types. Tested a stat roll, rich-text save/reload and applying a playbook with three growth questions and four attached items.
- Checked the stylesheet under the new body class and inspected a rendered character sheet.

## Original upstream and interrupted runs

- Tested a separate fixture world with the **unmodified upstream 2.1.0 system**. Its existing look text and flags survived the transition.
- Simulated an interruption during document updates. The old system remained assigned; reloading and resuming completed without duplicate packs.
- Simulated a second interruption immediately before changing the world's system, after settings and pack locks had been saved. Resuming completed successfully, including previously locked destination compendiums.
- Confirmed that migrated worlds return to Setup and launch with `avatar-legends`; the module records completion only after the inherited packs are available on the new world start.

## Automated and packaging checks

- 22 regression tests covering previous fixes, namespace rewriting, conflicts, token descriptions, asset-path extraction and client preferences.
- JavaScript syntax, JSON, manifest URLs, system/module relationship and namespace validation.
- Repeated package builds produced identical system ZIP hashes before final documentation changes. Pack conversion reads temporary copies and leaves the upstream database files unchanged.
- System and module are separate ZIPs; both manifests and checksums are generated. Public packages contain canonical GitHub URLs, not localhost fixtures or private world data.

## Limits

This is not a complete multiplayer play session. Third-party module behavior, hosted-provider restrictions and every older upstream version are not covered. Modules explicitly restricted to the old system are blocked by the assistant until disabled. Module-provided compendiums are not modified.

Custom scripts that dynamically construct IDs or paths need manual review; explicit UUIDs, paths, common settings/flag calls and literal collection IDs are handled. Non-system artwork was not copied from the production server, so existing external image availability was not established by this test.

The assistant requires an administrator-made backup; it does not claim to create a complete backup itself. Cancelling before migration changes nothing. Once work has started, resume it or restore the matching backup rather than playing in the partially migrated world.
