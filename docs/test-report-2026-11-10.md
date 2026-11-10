# World-copy test — 10 November 2026

Candidate: `2.1.1-rhapsody.1`, based on upstream `2.1.0`.
Runtime: Foundry VTT **14.367**, matching the production installation.
Tested locally on a separate copy of an existing 1.4.0 world. Production was not modified.

## Passed

- Migration loads all 56 original actors, 331 world items, 19 scenes and 5 journals without invalid documents.
- All six legacy player descriptions initially transfer in full to the new look field; the original field remains available.
- Editing, saving, intentionally clearing and reloading player text works. Persistence also checked after a server restart.
- Character-editor clicks no longer open the paragraph dropdown unexpectedly. Saving no longer throws the destroyed-editor focus error.
- Player, NPC, campaign and every existing item sheet type render, including embedded NPC principles.
- All 398 embedded items retain their previous system-field contents after the NPC-principle schema correction.
- Player and NPC remaining-fatigue bars return the correct values.
- A stat roll produces a `2d6 + modifier` chat roll; Roll/Cancel display actual icons.
- Four system compendiums load 189 documents without invalid entries.
- Optional Exchange tracker: create encounter, add combatant, start round and change phase.
- 16 automated regression tests, JavaScript syntax, JSON and manifest validation pass.

## Corrections made during testing

- Persist the legacy-description migration marker on actor updates.
- Restore derived remaining-fatigue attributes for token bars.
- Retain NPC-principle description HTML in the new schema.
- Let rich-text menu focus handling finish before saving destroys the editor.

## Limits before production rollout

This is a system migration and functional smoke test, not a complete play session.
External world images/maps and optional third-party modules were not installed in the local copy; their rendering and integration remain unverified.
Browser testing used software rendering. It does not establish production-client performance.
Foundry can normalize HTML when saving; one edited description changed markup length while preserving its text and element structure.

No release has been published and the production installation remains on its previous system version.
World data, character content, credentials and test profiles are excluded from this repository and release packages.
