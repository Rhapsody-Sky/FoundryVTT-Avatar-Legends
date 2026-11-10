# Releasing

1. Set the version and download URL in `system.json`. Update `migration-module/module.json` with the matching release tag and the module version.
2. Run `npm ci`, `npm test` and `python scripts/package.py` from the committed checkout.
3. Test the built packages in Foundry VTT 14 with a fresh world and an isolated copy of an existing world. Check the functions changed in the release and the migration path when applicable.
4. Tag the commit `v<system version>` and publish a GitHub release with both ZIPs, `system.json`, `module.json` and `SHA256SUMS.txt` from `dist/`.
5. Verify both public manifests under `releases/latest/download/` and check that their ZIPs match the checksums. Include the [switching guide](switching.md) and [Umstiegsanleitung](umstieg.md) in the release notes.

Foundry installs and updates the system and module through the public manifests. Include the module ZIP and manifest on each latest release, even if the module version stays the same.
