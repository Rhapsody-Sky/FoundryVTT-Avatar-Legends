# Auf diesen Fork umsteigen

[English](switching.md) · [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases)

Für **Foundry VTT 14**. Bestehende Legends-Welten bleiben erhalten. Du brauchst Zugriff auf das Foundry-Setup und auf die Dateien der Installation. Bei einem Server verwendest du dafür dessen Dateimanager oder SFTP-Zugang.

## 1. Foundry stoppen und sichern

Beende die laufende Welt und stoppe anschließend die Foundry-Anwendung beziehungsweise den Foundry-Dienst im Hosting-Panel. Nur den Browser zu schließen reicht nicht.

Öffne den **Benutzerdatenordner** deiner Foundry-Installation, nicht den Programmordner. Sichere daraus:

- `Data/worlds/<deine-welt>` für jede Legends-Welt;
- `Data/systems/legends`, einschließlich eigener Änderungen an System-Kompendien;
- eigene Bilder und andere Dateien, falls sie außerhalb dieser Ordner liegen.

Der Austausch betrifft alle Legends-Welten dieser Installation.

## 2. Das System austauschen

1. Öffne die [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases) und lade unter **Assets** die Datei `legends-v….zip` herunter. Nicht „Source code“ verwenden.
2. Verschiebe den bisherigen Ordner `Data/systems/legends` an einen Sicherungsort **außerhalb von `Data/systems`**.
3. Lege einen neuen Ordner `Data/systems/legends` an und entpacke den ZIP-Inhalt dort hinein. Die Datei muss direkt unter `Data/systems/legends/system.json` liegen, ohne zusätzlichen Unterordner.
4. Lass die Weltordner unverändert und starte Foundry wieder. Unter **Spielsysteme / Game Systems** muss „Avatar Legends RPG“ mit der Versionsnummer des heruntergeladenen Releases erscheinen.

## 3. Updatesperre einschalten

1. Öffne im Foundry-Setup den Reiter **Spielsysteme / Game Systems**. Falls eine Welt läuft, kehre zuerst über deren Einstellungen zum Setup zurück; gegebenenfalls ist das Administratorpasswort nötig.
2. Klicke mit der **rechten Maustaste auf den Eintrag „Avatar Legends RPG“** und wähle die Sperraktion (**Lock System** in der englischen Oberfläche).
3. Prüfe, ob am Eintrag ein **Schloss** angezeigt wird. Bietet das Kontextmenü bereits das Entsperren an, ist die Sperre aktiv.

Die Sperre verhindert Paketupdates und Deinstallation über das Setup. Sie ist nötig, weil Foundrys Paketkatalog sonst wieder das Original anbieten kann. Die Welt lässt sich weiterhin starten.

## 4. Die Welt prüfen

Öffne deine bestehende Welt und prüfe Charaktertexte, Bögen und einen Würfelwurf. Lege keine neue Welt an. Für einen Probelauf vor der Live-Umstellung verwende eine Weltkopie in einer separaten Foundry-Installation; eine zweite Welt im selben Datenordner nutzt ebenfalls das ausgetauschte System.

## Später aktualisieren

Lade das nächste ZIP aus **diesem Repository** und wiederhole die Schritte 1–3: stoppen, frisch sichern, Systemordner ersetzen, starten und sperren. Die Sperre muss für diesen Dateiaustausch nicht vorher aufgehoben werden; prüfe sie nach dem Austausch erneut. Verwende für diesen Fork nicht den normalen „Update“-Knopf des Systems.

**Zurückwechseln:** Foundry stoppen und die gesicherten Systemdateien wiederherstellen. Wurde die Welt bereits mit der neuen Version gestartet, auch die dazu passende Weltsicherung wiederherstellen. Dabei gehen spätere Änderungen verloren; bewahre den aktuellen Stand vorher zusätzlich auf.

[Hilfe beim Umstieg](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml)
