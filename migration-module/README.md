# Avatar Legends Migration

One-time migration from the original `legends` system to `avatar-legends` on Foundry VTT 14.

Install this module through Foundry and accept **Install Dependency Automatically** to install the new Avatar Legends RPG system too. Keep the old system installed. Open an existing Legends world, enable **Avatar Legends Migration** in Manage Modules, and reload. A dialog appears for the GM.

Before continuing, back up the world and old system and ask everyone else to disconnect. The assistant preserves old system compendiums as world compendiums, copies referenced system assets into the world, updates references and settings, and changes the world's system last. It then returns to Setup. Launch the same world again and disable this module after the completion message. The new system can receive normal Foundry updates.

Cancel makes no changes. An interrupted migration can be resumed by reopening the assistant in Module Settings. Do not play in a partially migrated world. Restore the matching world and system backup if you need to abandon it.

Client preferences are copied separately when each player first opens the new system in their browser. Modules explicitly restricted to the old system must be disabled before migration. Module-provided compendiums and third-party module code are not rewritten.

Review custom scripts which construct package IDs dynamically; the assistant rewrites explicit paths, UUIDs, common settings/flag calls and literal compendium IDs, not arbitrary JavaScript logic.

This candidate is under test and has not been released.
