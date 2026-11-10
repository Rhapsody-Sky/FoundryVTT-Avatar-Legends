# Mit dem Migrationsmodul umsteigen

[English](switching.md)

> Für das kommende Release 2.2.0. System und Migrationsmodul sind noch nicht veröffentlicht.

Du brauchst Foundry VTT 14, Zugriff auf das Setup und einen Spielleiter-Zugang zur bestehenden Legends-Welt. Das neue System heißt weiterhin **Avatar Legends RPG**, verwendet aber die eigene ID `avatar-legends`.

## 1. Sichern und installieren

1. Beende Foundry und sichere deine Welt sowie `Data/systems/legends`, einschließlich eigener Kompendien. Starte Foundry danach wieder im Setup.
2. Öffne **Zusatzmodule / Add-on Modules → Modul installieren / Install Module**. Füge diese Adresse bei **Manifest URL** ein und klicke **Installieren**:

   ```text
   https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases/latest/download/module.json
   ```

3. Wenn Foundry nach der benötigten Abhängigkeit fragt, wähle **Automatisch installieren / Install Dependency Automatically**. Damit wird das neue System zusätzlich installiert. Lass das alte System vorerst installiert.

## 2. Die bestehende Welt umstellen

1. Starte deine bisherige Welt mit dem alten System und melde dich als Spielleiter an.
2. Öffne **Einstellungen → Module verwalten / Manage Modules**, aktiviere **Avatar Legends Migration** und speichere. Nach dem Neuladen erscheint der Assistent automatisch.
3. Alle anderen Nutzer müssen sich abmelden. Bestätige im Assistenten die vorhandene Sicherung und klicke **Welt umstellen**. Lass den Browser geöffnet, bis Foundry zum Setup zurückkehrt.
4. Starte dieselbe Welt erneut. Nach der Erfolgsmeldung kannst du das Migrationsmodul deaktivieren.

Der Assistent übernimmt Einstellungen und Verweise. Alte System-Kompendien werden als Welt-Kompendien mit dem Zusatz **(Legacy)** erhalten, damit eigene Änderungen nicht verloren gehen. Verwendete Bilder aus dem alten System werden in die Welt kopiert. Das neue System bringt zusätzlich seine aktuellen Standard-Kompendien mit.

**Später** schließt den Dialog ohne Migration. Nach einem Fehler lässt sich der Assistent über die Moduleinstellungen erneut öffnen; eine unterbrochene Umstellung wird fortgesetzt. Spiele nicht in einer teilweise umgestellten Welt. Falls du stattdessen zurückwechseln möchtest, stelle die passende Welt- und Systemsicherung wieder her; spätere Änderungen gehen dabei verloren.

## Danach

- Prüfe Charaktertexte, Tokens, Kompendium-Links und einen Würfelwurf.
- Künftige Updates: **Setup → Spielsysteme / Game Systems → Avatar Legends RPG → Update**. Das neue System nicht sperren.
- Stelle weitere alte Legends-Welten einzeln um. Entferne das alte System erst, wenn keine Welt es mehr benötigt.
- Module, die ausdrücklich nur das alte System unterstützen, müssen vor dem Umstieg deaktiviert werden. Für sie kann eine Anpassung durch ihre Entwickler nötig sein.

[Hilfe beim Umstieg](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml)
