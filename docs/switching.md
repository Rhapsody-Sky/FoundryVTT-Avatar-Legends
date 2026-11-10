# Switch to this fork

[Deutsch](umstieg.md) · [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases)

For **Foundry VTT 14**. Keep your existing Legends worlds. You need access to Foundry Setup and the installation's files. On a server, use your hosting provider's file manager or SFTP access.

## 1. Stop Foundry and back up

Close the running world, then stop the Foundry application or the Foundry service in your hosting panel. Closing your browser is not enough.

Open your Foundry installation's **user data folder**, not its program folder. Back up:

- `Data/worlds/<your-world>` for each Legends world;
- `Data/systems/legends`, including any custom changes to system compendiums;
- custom images and other files stored outside those folders.

Replacing the system affects every Legends world in this installation.

## 2. Replace the system

1. Open [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases). Under **Assets**, download `legends-v….zip`, not “Source code”.
2. Move the existing `Data/systems/legends` folder to a backup location **outside `Data/systems`**.
3. Create a fresh `Data/systems/legends` folder and extract the ZIP contents into it. The manifest must be at `Data/systems/legends/system.json`, with no extra enclosing folder.
4. Leave your world folders unchanged and start Foundry again. Under **Game Systems**, check that “Avatar Legends RPG” shows the version number of the release you downloaded.

## 3. Lock system updates

1. In Foundry Setup, open **Game Systems**. If a world is running, return to Setup through its settings first; you may need the administrator password.
2. **Right-click the “Avatar Legends RPG” entry** and choose **Lock System**.
3. Check for a **padlock** on the entry. If the context menu already offers to unlock the system, it is locked.

Locking prevents package updates and uninstallation through Setup. This is needed because Foundry's package catalog can otherwise offer the original system again. You can still launch your world.

## 4. Check your world

Open your existing world and check character text, sheets and a dice roll. Do not create a new world. To try the switch before changing your live installation, use a world copy in a separate Foundry installation; another world in the same data folder also uses the replaced system.

## Future updates

Download the next ZIP from **this repository** and repeat steps 1–3: stop, take a fresh backup, replace the system folder, start and lock. You do not need to unlock the system before replacing its files; check the lock again afterwards. Do not use the system's normal “Update” button for this fork.

**To roll back:** Stop Foundry and restore the backed-up system files. If you already launched the world with the new version, also restore its matching world backup. This discards later changes, so preserve the current state separately first.

[Get migration help](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml)
