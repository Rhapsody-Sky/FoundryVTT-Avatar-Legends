# Changelog

## v1.1.0

- Remove Foundry v10 support
- Update Compendium Packs to v11 with folders

## v1.0.10

- FoundryVTT v11 support
- Improvements to Playbook drag-and-drop (#33)
- Option to start collapsible drawers closed (#22)
- Replace .png images with .webp
  - Update migration scripts to auto-update Actors, Items and Tokens using the system .png files

## v1.0.9

- Reimplement the one-click add for NPC Conditions and Principle
- Preliminary implementation of a "Playbook" Item type to simplify player character setup, as suggested in #12 (closed).

## v1.0.8

- Update license wording based on the guidelines for fan-created digital tools provided by Magpie Games
  - See https://magpiegames.com/pages/avatarrpg

## v1.0.7

- Adds a Notes tab/section to the Player character sheet
- Added an options flag (default false) to enable Notes on Player sheet

## v1.0.6

- Spanish translation file matches the updated file structure
- Clean up Handlebars helper code

## v1.0.5

- Fix rolls

## v1.0.4

- Adds missing items for The Elder in the WSTAG Playbooks Compendium
- Adds Playbook entries to the Reference Compendium with initial stats, demeanor etc.

## v1.0.3

- Update CI script to include compendia packs.

## v1.0.2

- Add stat display to roll dialog
- CSS tweaks
  - Update pause notice font
  - Grandients on balance tracks
  - Diamond on Technique separators

## v1.0.1

- Add compendia for Common Items, Playbooks and Reference Material
- Add dependencies for Compendium Folders and libWrapper modules

## v1.0.0

- Additional fixes to styling in chat
- Force async on roll.roll() call to avoid deprecation warning
- Various styling and layout tweaks for first full release

## v0.3.17

- Chat message styling
- Replace Foundry Anvil logo
- Drop-down for Move filtering

## v0.3.16

- Parse Foundry content links and inline rolls in rich text fields
- Update link colour for content links
- Adjust header tag font sizes
- Adjust chat message colour
- Improve consistency when switching between Default and Quickstart sheet colours

## v0.3.15

- Adds custom "pause" icon
- Fixes font size on roll dialog
- Consistent styling on focused input elements
- Approach roll chat output includes options based on the result

## v0.3.14

- Changes the font used on sheets to more closely match the one used in the final product.
- Adds Growth Question item type for adding to the Player sheet

## v0.3.13

- Adds category to Move items
- Adds field to Move Item sheet
- Option to change sheet colours to match final book blue
- Separate Techniques by Approach

## v0.3.12

- To bring the UI more in line, adds a partial for a checkbox using the same styling as the boxes for tracks, conditions and status toggles.
- Additionally adds a custom Journal Sheet to match style with other elements.

## v0.3.11

- Initial Spanish translation

## v0.3.10

- FoundryVTT v10 support
