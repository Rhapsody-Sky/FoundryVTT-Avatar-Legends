# Auf diesen Fork umsteigen

[English](switching.md) · [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases)

Für **Foundry VTT 14**. Deine bestehenden Welten bleiben erhalten; du musst nichts neu anlegen. Der Wechsel betrifft alle Legends-Welten dieser Installation.

> Das erste Release ist noch im Test. Bitte bis zur Freigabe nicht produktiv umsteigen.

1. **Sichern:** Foundry beenden und deine Welten sowie `Data/systems/legends` sichern. Eigene Bilder und Änderungen an System-Kompendien ebenfalls behalten.
2. **Herunterladen:** Aus den Releases das Paket `legends-v….zip` laden, nicht „Source code“.
3. **Austauschen:** Den alten Ordner `Data/systems/legends` außerhalb von `Data/systems` aufbewahren. Das neue ZIP in einen frischen Ordner `Data/systems/legends` entpacken. Dort muss direkt die `system.json` liegen. Weltordner nicht verändern.
4. **Prüfen:** Foundry starten. Im Setup müssen der Rhapsody-Titel und die neue Version erscheinen. Vor dem ersten Einsatz mit einer Weltkopie in einer separaten Testinstallation Charaktertexte, Bögen und Würfe prüfen.
5. **Updates sperren:** Das System im Setup sperren, damit Foundry nicht wieder das Original installiert. Künftige Updates gezielt aus diesem Repository beziehen.

**Falls etwas schiefgeht:** Foundry stoppen. Nach einem Weltstart mit der neuen Version zum Zurückwechseln die passende Welt- **und** Systemsicherung verwenden — nur den alten Code einzuspielen reicht nicht. Spätere Änderungen vorher zusätzlich sichern.

[Hilfe beim Umstieg](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml)
