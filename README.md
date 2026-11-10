# Avatar Legends RPG

A FoundryVTT system for [Avatar Legends RPG](https://magpiegames.com/pages/avatarrpg) characters.

## Origin and continuation

This is my community continuation of **[Paul Cosgrove / demondownload's original Legends system](https://gitlab.com/pacosgrove1/legends)**, based on upstream **v2.1.0** (commit `173611c933b06033520e99b1d196724afbf81e90`). The upstream Git history is preserved in this repository.

Paul announced v2.0.0 as his final major update; see his [archive notice](https://gitlab.com/pacosgrove1/legends/-/wikis/Archive-Notice). Thank you to Paul and everyone who contributed to the original project. I maintain this fork independently; it is not an official release by Paul, Magpie Games, or the Avatar rights holders. Report problems through [this repository's issue tracker](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues), not to the retired upstream project.

The code remains under the **MIT license**. [LICENSE](LICENSE) retains Paul Cosgrove's original copyright and permission notice, with an additional copyright notice for my changes. Fonts, icons and franchise content retain their respective notices and terms listed below; the code license does not relicense those assets.

## Current status

The current release of this continuation is **2.1.1-rhapsody.2** for Foundry VTT 14. It includes upstream's ApplicationV2 sheets and optional Exchange tracker, restores the separate DialogV2 button icons, and adds a compatibility migration for character descriptions from my earlier V14 port.

Existing non-empty `look` text is never overwritten. Legacy `description` text is retained and copied into an empty `look` field once; a saved migration marker prevents a deliberately cleared field from being repopulated. Migration from my earlier 1.4.0 port was tested on a world copy with Foundry 14.367; see the [test results and limits](docs/test-report-2026-11-10.md). Back up your world before upgrading.

<img src="https://i.imgur.com/VA1c6cD.png" alt="Player character sheet" width="60%" />

Additional screenshots: https://imgur.com/a/wWJLdor

## Features

- Player character and NPC character sheets
- Campaign Worksheet
- Supports Dice So Nice! for custom 3D dice
- Compendia of publicly-available Playbooks and reference material
- ApplicationV2 sheets and optional Exchange tracker from upstream v2.1.0

## Installation

**Coming from the original system?** Follow the [switching guide](docs/switching.md) / [Umstiegsanleitung auf Deutsch](docs/umstieg.md). It covers backups, existing worlds, update protection and recovery without recreating your campaign.

Requires **Foundry VTT 14**. Do not install the original directory entry expecting to receive this fork.

Install using this manifest:

`https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases/latest/download/system.json`

For manual installation, use the `legends-v<version>.zip` release asset, not the GitHub source archive. Its contents belong directly in `Data/systems/legends`, not a repository-named folder.

### Existing worlds and update safety

The system ID remains `legends` to preserve world associations, settings and compendium UUIDs. Consequently this fork and upstream cannot be installed side-by-side in the same Foundry data directory. Back up the complete world and installed system before switching.

Foundry can follow its official package index even when a different manifest URL is configured. Keep the system **locked** in Setup while using this fork; the native lock file is `Data/systems/legends/legends.lock`. A separate manifest alone does not guarantee isolation. Apply only reviewed fork releases deliberately, then restore the lock. A future separate-ID migration requires explicit handling of existing references and is not part of this release.

Never downgrade a world already saved under a newer system without a matching backup.

## Development

Node.js 22+ and Python 3.11+ are sufficient for the dependency-free checks and package builder:

```sh
npm test
python scripts/package.py
```

The build writes a release ZIP, `system.json` and SHA256 checksums to `dist/`. CI runs checks and retains build artifacts; it does not publish a release or deploy to a server automatically. Upstream GitLab CI is retained only as history/reference and does not run on GitHub.

## Usage

See [the Wiki](https://gitlab.com/pacosgrove1/legends/-/wikis/home) for specific usage examples.

## Credits

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/B0B11L4PE)

This system exists thanks to the excellent YouTube tutorial series by [Cédric Hauteville](https://www.youtube.com/user/LieutenantRazak).

- French translation by [ZUBER Lionel](https://gitlab.com/armaklan)
- Spanish translation by [Ruy Leon](https://gitlab.com/Amharem)
- German translation by [Jenni Kuhnert](https://gitlab.com/yennsarah)
- Brazilian Portuguese translation by [ChemistryPolar](https://gitlab.com/ChemistryPolar)

### Fonts

- [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) by Google Fonts
- [Covered By Your Grace](https://fonts.google.com/specimen/Covered+By+Your+Grace?preview.text_type=alphabet&preview.size=37#standard-styles) by Kimberly Geswein
- [Hey August](https://www.behance.net/gallery/84310469/Free-Hey-August-Handwritten-Font) by Khurasan Studio
- [Komikazoom](https://www.1001fonts.com/komikazoom-font.html) by Apostrophic Labs
- [New Tegomin](https://fonts.google.com/specimen/New+Tegomin?preview.text_type=alphabet&preview.size=37&query=new+tegomin) by Kousuke Nagain
- [Village](https://www.dafont.com/prisoner.font) by Mark F. Heiman

_Licence details are included in the font folders._

### Images

- Icons from [Font Awesome](https://fontawesome.com/)
- Icons from [Game-icons.net](https://game-icons.net/) under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)
  - [Acrobatic](https://game-icons.net/1x1/darkzaitzev/acrobatic.html) and [Big gear](https://game-icons.net/1x1/darkzaitzev/big-gear.html) by [DarkZaitzey](http://darkzaitzev.deviantart.com/)
  - [Boomerang](https://game-icons.net/1x1/delapouite/boomerang.html), [Love mystery](https://game-icons.net/1x1/delapouite/love-mystery.html), [Person](https://game-icons.net/1x1/delapouite/person.html), [Summits](https://game-icons.net/1x1/delapouite/summits.html) and [Yin yang](https://game-icons.net/1x1/delapouite/yin-yang.html) by [Delapouite](https://delapouite.com/)
  - [Backup](https://game-icons.net/1x1/lorc/backup.html), [Compass](https://game-icons.net/1x1/lorc/compass.html), [Ink swirl](https://game-icons.net/1x1/lorc/ink-swirl.html), [Tied scroll](https://game-icons.net/1x1/lorc/tied-scroll.html), [Waves](https://game-icons.net/1x1/lorc/waves.html), [Wind hole](https://game-icons.net/1x1/lorc/wind-hole.html) and [World](https://game-icons.net/1x1/lorc/world.html) by [Lorc](https://lorcblog.blogspot.com/)
  - [Expander](https://game-icons.net/1x1/sbed/expander.html), [Flamer](https://game-icons.net/1x1/sbed/flamer.html) and [Poison cloud](https://game-icons.net/1x1/sbed/poison-cloud.html) by [sbed](http://opengameart.org/content/95-game-icons)

### Disclaimer

This digital tool has been created in keeping with the guidelines for fan-created digital tools provided by Magpie Games at [www.magpiegames.com/avatarrpg](https://magpiegames.com/pages/avatarrpg)

Viacom is the owner of the original content and any derivatives created with such content associated with these tools, including rules for game play, are ©2023 Viacom International Inc. All Rights Reserved. Nickelodeon, Avatar Legends and all related titles, logos and characters are trademarks of Viacom International Inc.
