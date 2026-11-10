# Vom ursprünglichen Legends-System zu Rhapsody wechseln

[English](switching.md) · [README](../README.md) · [Releases](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases)

> **Noch nicht für den produktiven Umstieg freigegeben.** Aktuell liegt ein Entwicklungskandidat vor. Warte auf ein getestetes Release, dessen Hinweise deine Ausgangsversion ausdrücklich unterstützen. Ein Commit oder grüne CI-Tests ersetzen keinen Test in Foundry. Diese Anleitung beschreibt den späteren kontrollierten Wechsel.

## Was wird ausgetauscht?

Du ersetzt das **Spielsystem**, nicht die Welt. Die System-ID bleibt `legends`: Keine neue Kampagne anlegen, keine Welt umbenennen, keine `world.json` oder Kompendium-UUIDs von Hand ändern. Dadurch bleiben die Zuordnungen erhalten; die vollständige Daten- und Modulkompatibilität muss trotzdem geprüft werden.

Original und Fork können nicht im selben Datenverzeichnis nebeneinander installiert sein. Der Wechsel betrifft **alle Welten mit dem System `legends` in dieser Installation**. Gegenüber 1.x ändern sich außerdem die Charakterbögen durch ApplicationV2.

## 1. Ausgangsversion klären

Notiere im Setup die Foundry-Version inklusive Build und die installierte Legends-Version.

| Ausgangspunkt | Vor dem Wechsel prüfen |
| --- | --- |
| Original Legends 1.x | Unterstützt das Zielrelease diese Version ausdrücklich? Bogen- und Datenumstellung erst an einer Kopie testen. Nicht jede historische Version ist automatisch abgedeckt. |
| Unser früherer V14-Port 1.4.0 | Besonders Beschreibung, Notizen und gespeicherte Bogenauswahl prüfen: Der Port verwendet `system.description`, Upstream V2 dagegen `system.look`. |
| Original Legends 2.0.x / 2.1.0 | ApplicationV2 ist bereits vorhanden. Trotzdem sichern und Daten, Module sowie Releasehinweise prüfen. |
| Foundry älter oder neuer als 14 | Anhalten: Dieser Kandidat ist nur für Foundry 14 vorgesehen. Einen Foundry-Versionswechsel separat planen und testen; keine Welt einfach herunterstufen. |
| Neueres oder anderes System | Vorher nachfragen. Eine kleinere Versionsnummer ist kein sicherer Rückweg. |

## 2. Wiederherstellbare Sicherung anlegen

- Wartung ankündigen und zum Setup zurückkehren. Während des Austauschs keine Welten starten.
- Das tatsächliche Benutzerdatenverzeichnis ermitteln; beim Hoster kann der Pfad abweichen.
- Foundrys Sicherungsfunktionen verwenden oder Foundry vor einer manuellen Dateikopie **vollständig beenden**. Betroffene Welten, das gesamte Verzeichnis `Data/systems/legends` und referenzierte Bilder/Uploads sichern. Eine vollständige Sicherung der Benutzerdaten erfasst zusätzlich Konfiguration und Modulabhängigkeiten.
- Lesbarkeit und Inhalt kontrollieren. Sicherung mit Datum und bisherigen Versionsnummern **außerhalb des aktiven Datenverzeichnisses** aufbewahren. Ein umbenannter Ordner daneben ist keine unabhängige Sicherung.
- Eigene Änderungen an mitgelieferten Kompendien oder Systemdateien gesondert sichern. Ein Paketwechsel führt sie nicht automatisch zusammen. Eigene Inhalte vorab in eine eigene Welt/ein eigenes Modul exportieren.

[Offizielle Backup-Anleitung von Foundry](https://foundryvtt.com/article/user-data-backup/). Eine laufende Cloud-Ordnersynchronisierung ist kein geeigneter Datenbank-Backupweg.

## 3. Zuerst separat testen

Die Sicherung in einer Testinstallation mit **eigenem Benutzerdatenverzeichnis** verwenden. Eine zweite Welt innerhalb der Live-Installation reicht nicht: Sie teilt dasselbe Systempaket. Niemals zwei laufende Foundry-Instanzen auf dasselbe Datenverzeichnis zugreifen lassen.

Den folgenden Austausch zuerst dort durchführen und die Prüfliste abarbeiten. Bei Fehlern nicht mit der produktiven Welt weitermachen.

## 4. Nur das Systempaket ersetzen

Dieser Weg tauscht das Paket direkt aus und verlässt sich nicht darauf, dass Foundry die Updatequelle eines bereits installierten Systems umstellt. Ohne Dateizugriff übernimmt das dein Hoster. **Keine Welt deinstallieren oder löschen.**

1. Ein getestetes Release aus **unserem Repository** auswählen. Dessen `legends-v<version>.zip`, `system.json` und `SHA256SUMS.txt` herunterladen — nicht das GitHub-Archiv „Source code“. SHA256 des ZIPs mit der veröffentlichten Prüfsumme vergleichen.
2. Automatischen Weltstart deaktivieren und die betroffene Foundry-Anwendung bzw. den Dienst vollständig stoppen.
3. Das bisherige `Data/systems/legends` an den dokumentierten Sicherungsort **außerhalb von `Data/systems`** verschieben. Behalten, nicht löschen und nicht einfach mit neuen Dateien überlagern.
4. Ein neues `Data/systems/legends` anlegen und das Release-ZIP direkt dort entpacken. Das Manifest muss unter `Data/systems/legends/system.json` liegen, ohne zusätzlichen Unterordner. `Data/worlds` bleibt unangetastet.
5. Manifest prüfen: ID `legends`, erwartete Version, Rhapsody im Titel und GitHub-Adressen von `Rhapsody-Sky/FoundryVTT-Avatar-Legends`. Vorhandene Dienstkonto-/SFTP-Berechtigungen erhalten.
6. Im neuen Systemordner eine leere Datei **`legends.lock`** anlegen. Unter Windows auf versteckte Endungen achten: nicht `legends.lock.txt`.
7. Foundry ins Setup starten, noch keine Welt öffnen. Rhapsody-Titel, Version und Sperre prüfen. Bei ungültigem Paket oder altem Titel erst Pfad, Manifest und Logs klären — nicht die Weltdateien bearbeiten.

Nach Veröffentlichung des ersten geeigneten Releases lautet unsere Manifest-Adresse:

`https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases/latest/download/system.json`

**Bis dahin ist diese Adresse noch nicht verfügbar.** Nur die URL im alten Manifest zu ändern installiert weder den neuen Code noch führt es eine sichere Migration durch.

## 5. Weltkopie abnehmen

Zuerst nur die **Testkopie** als GM öffnen. Schon der Weltstart kann Datenmigrationen auslösen; das ist keine rein lesende Prüfung.

- [ ] Charaktere, Gegenstände, Szenen, Journale und Kompendium-Verweise vorhanden.
- [ ] Spieler-, NSC-, Kampagnen- und Gegenstandsbögen öffnen; alte Bogenzuweisungen geprüft.
- [ ] Aussehen/Beschreibung und Notizen vollständig. Falls `description` und `look` beide Text enthielten, vor einer manuellen Zusammenführung vergleichen; der Kandidat verbindet die Inhalte nicht automatisch.
- [ ] Text bearbeiten, speichern, Bogen schließen/öffnen und Browser neu laden. Absichtlich geleerte Felder bleiben leer; kein ständig aufspringendes Absatzmenü.
- [ ] Importierte Charaktere und nicht verknüpfte Token-Akteure ebenfalls geprüft.
- [ ] Würfe aus Bogen und Chat funktionieren; verwendete Module und gegebenenfalls Exchange-Tracker geprüft.
- [ ] Keine Migrations-/Validierungsfehler in Browser- oder Serverkonsole.

Erst wenn alle betroffenen Weltkopien funktionieren: Live-Termin festlegen, **frisch sichern** und denselben Austausch produktiv wiederholen. Die Sicherung auch nach der ersten erfolgreichen Sitzung behalten.

## 6. Beim Fork bleiben

Updatesperre beibehalten. Foundry kann wegen der gemeinsamen ID `legends` trotz eigener Manifest-URL zum offiziellen Paketindex wechseln. Nicht darauf vertrauen, dass „Alle aktualisieren“ bei unserem Fork bleibt. Künftige geprüfte Releases bewusst mit Sicherung, Austausch und Prüfung installieren und die Sperre wieder setzen. Eine eigene System-ID würde eine gesonderte Migration der Referenzen erfordern; diese Anleitung macht das nicht.

## Wenn etwas schiefgeht

Instanz stoppen und zunächst den aktuellen Stand samt Logs zusätzlich sichern.

- **Seit dem Austausch keine Welt gestartet:** Das gesicherte Systemverzeichnis bei gestopptem Foundry zurücksetzen; das neue Paket zur Diagnose behalten.
- **Welt bereits gestartet oder gespeichert:** Alter Code allein macht eine Datenmigration nicht rückgängig. Passende Welt- und Systemsicherung gemeinsam mit der dazugehörigen Foundry-Version wiederherstellen. Neuere Dateien vorher behalten, sonst gehen spätere Änderungen verloren. Bei Unsicherheit zuerst Hilfe holen.

[Umstiegshilfe anfragen](https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/issues/new?template=migration-help.yml): Versionen, fehlgeschlagenen Schritt und bereinigte Fehlermeldung nennen. **Keine vollständigen Welten, Passwörter, Lizenzschlüssel, Zugangslinks oder privaten Spielerdaten hochladen.**
