# Switch with the migration module

[Deutsch](umstieg.md)

> For the upcoming 2.2.0 release. The new system and migration module have not been published yet.

You need Foundry VTT 14, access to Setup and a GM account in your existing Legends world. The new system is still called **Avatar Legends RPG**, but has its own ID: `avatar-legends`.

## 1. Back up and install

1. Stop Foundry and back up your world and `Data/systems/legends`, including custom compendiums. Start Foundry again in Setup.
2. Open **Add-on Modules → Install Module**. Paste this address into **Manifest URL** and click **Install**:

   ```text
   https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases/latest/download/module.json
   ```

3. When Foundry asks about the required dependency, choose **Install Dependency Automatically**. This installs the new system alongside the old one. Keep the old system installed for now.

## 2. Migrate the existing world

1. Launch your existing world with the old system and log in as a GM.
2. Open **Settings → Manage Modules**, enable **Avatar Legends Migration**, and save. The assistant appears automatically after the reload.
3. Ask every other user to disconnect. Confirm that you have a backup, then click **Migrate world**. Keep the browser open until Foundry returns to Setup.
4. Launch the same world again. After the success message, you can disable the migration module.

The assistant transfers settings and references. Old system compendiums are preserved as world compendiums labelled **(Legacy)** so custom edits are retained. Referenced images from the old system are copied into the world. The new system also includes its current standard compendiums.

**Later** closes the dialog without migrating. After an error, reopen the assistant through Module Settings to resume an unfinished migration. Do not play in a partially migrated world. To abandon the migration instead, restore the matching world and system backups; this discards later changes.

## Afterwards

- Check character text, tokens, compendium links and a dice roll.
- Future updates: **Setup → Game Systems → Avatar Legends RPG → Update**. Leave the new system unlocked.
- Migrate additional old Legends worlds individually. Remove the old system only when no worlds still need it.
- Modules explicitly restricted to the old system must be disabled before migrating. Their developers may need to adapt them for the new system.

[Get migration help](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml)
