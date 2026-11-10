# Switch to this fork

[Deutsch](umstieg.md) · [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases)

For **Foundry VTT 14**. Keep your existing worlds; there is no need to recreate them. Switching affects every Legends world in this installation.

1. **Back up:** Stop Foundry and back up your worlds and `Data/systems/legends`. Keep your custom assets and any edits to the system's compendia too.
2. **Download:** Get the `legends-v….zip` package from Releases, not “Source code”.
3. **Replace:** Keep the old `Data/systems/legends` folder outside `Data/systems`. Extract the new ZIP into a fresh `Data/systems/legends` folder, with `system.json` directly inside it. Leave your world folders alone.
4. **Check:** Start Foundry. Setup should show the Rhapsody title and new version. Before using it live, test character text, sheets and rolls with a world copy in a separate test installation.
5. **Lock updates:** Lock the system in Setup so Foundry does not replace it with the original again. Get future updates deliberately from this repository.

**If something goes wrong:** Stop Foundry. After launching a world with the new version, restore the matching world **and** system backups to roll back; replacing the code alone is not enough. Preserve any newer changes separately first.

[Get migration help](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml)
