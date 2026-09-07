---
title: "Expenses Deluxe Datenschutzerklärung"
description: "Welche personenbezogenen Daten die Android-App Expenses Deluxe verarbeitet, wozu, und welche Rechte du dabei hast."
url: "/apps/expenses/policy"
---

## Datenschutzerklärung

Diese Erklärung beschreibt, welche personenbezogenen Daten die Android-App **Expenses Deluxe** verarbeitet, zu welchem Zweck das geschieht und welche Rechte du dabei hast.

### Verantwortlicher

Tobias Schürg\
Bodenseestraße 103\
88048 Friedrichshafen\
Deutschland

E-Mail: {{< mail >}}

Ein Datenschutzbeauftragter ist nicht bestellt; dazu besteht keine gesetzliche Verpflichtung.

### Die App braucht ein Konto

Anders als manche andere App lässt sich Expenses Deluxe nicht ohne Anmeldung nutzen. Die App teilt Ausgaben zwischen mehreren Personen auf, und dafür müssen die Daten an einer Stelle liegen, auf die alle Beteiligten zugreifen können.

Deine Daten liegen deshalb nicht nur auf deinem Gerät, sondern in **Google Cloud Firestore**. Das ist kein Nebeneffekt, sondern die Funktionsweise der App.

### Anmeldung

Du meldest dich entweder mit deinem Google-Konto oder mit E-Mail-Adresse und Passwort an. Die Anmeldung läuft über **Firebase Authentication**. Verarbeitet werden dabei deine Konto-Kennung und die hinterlegte E-Mail-Adresse; bei der Anmeldung mit Google zusätzlich die Angaben, die Google für diesen Vorgang bereitstellt.

**Zweck** ist es, deine Daten deinem Konto zuzuordnen und die Zusammenarbeit in Gruppen zu ermöglichen.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. b DSGVO — die Verarbeitung ist zur Erfüllung des Nutzungsverhältnisses erforderlich, das mit deiner Anmeldung zustande kommt.

### Ausgaben und Gruppen

In Cloud Firestore werden gespeichert:

*   die Ausgaben, die du erfasst — Betrag, Währung, Bezeichnung, Datum und Kategorie,
*   die Gruppen, in denen du bist, samt Name und Mitgliedern,
*   die Aufteilung der Ausgaben zwischen den Mitgliedern und der daraus errechnete Ausgleich,
*   dein in der App hinterlegter Anzeigename.

Diese Daten sind für die anderen Mitglieder der jeweiligen Gruppe sichtbar. Das ist der Zweck einer geteilten Abrechnung — überlege dir also, was du in einer Gruppe erfasst.

**Zweck** ist die Bereitstellung genau der Funktionen, für die du die App verwendest.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. b DSGVO.

**Speicherdauer:** Die Daten bleiben gespeichert, solange dein Konto besteht. Du kannst die Löschung jederzeit veranlassen, siehe [Konto löschen](/apps/delete). Nach Eingang der Anfrage lösche ich das Konto und die zugehörigen Daten. Ausgaben, die andere Gruppenmitglieder betreffen, können in deren Abrechnung erhalten bleiben, soweit das für die Nachvollziehbarkeit der gemeinsamen Buchhaltung nötig ist.

### Gruppen-Einladungen und Kamera

Einladungen zu einer Gruppe lassen sich als QR-Code weitergeben. Wenn du einen solchen Code scannst, greift die App auf die Kamera zu. Die Auswertung findet **ausschließlich auf deinem Gerät** statt; es werden dabei weder Bilder gespeichert noch an mich oder Dritte übertragen. Die Kameraberechtigung wird nur für diesen Zweck angefragt und lässt sich jederzeit entziehen.

### Benachrichtigungen

Damit du mitbekommst, wenn in einer Gruppe etwas passiert, verwendet die App **Firebase Cloud Messaging**. Dafür erzeugt Google eine Geräte-Kennung (Push-Token), die deinem Konto zugeordnet wird. Der Token sagt nichts über dich aus und dient allein der Zustellung.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Benachrichtigung zur Nutzung in Gruppen gehört. Du kannst die Benachrichtigungsberechtigung jederzeit entziehen.

### Fehlerberichte

Stürzt die App ab oder tritt ein schwerer Fehler auf, wird ein Fehlerbericht über **Firebase Crashlytics** übermittelt. Ein solcher Bericht enthält technische Angaben zum Zeitpunkt des Fehlers: Gerätemodell, Android-Version, App-Version, Zustand der App, Fehlermeldung samt Aufrufliste sowie eine zufällig erzeugte Installations-Kennung. Crashlytics verarbeitet dabei kurzzeitig deine IP-Adresse; sie wird von Google nicht dauerhaft gespeichert.

Fehlerberichte enthalten keine Ausgaben und keine Gruppeninhalte.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse an der Stabilität der App.

**Speicherdauer:** Crashlytics löscht Fehlerberichte automatisch nach 90 Tagen.

### Leistungsmessung

Über **Firebase Performance Monitoring** erhebt die App technische Messwerte zur Ausführungsgeschwindigkeit, etwa Startzeiten und die Dauer von Netzwerkanfragen. Auch hier fallen Gerätetyp, Android- und App-Version sowie eine Installations-Kennung an. Inhalte deiner Abrechnungen sind davon nicht betroffen.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse an einer funktionierenden App.

### Nutzungsanalyse

Die App verwendet **Firebase Analytics**. Erhoben werden dabei die von Google standardmäßig erfassten Angaben — etwa Gerätetyp, Sprache, ungefähre Region, Sitzungsdauer und eine Installations-Kennung — sowie ein Ereignis beim Start der App.

**Inhalte deiner Abrechnungen werden nicht übermittelt:** weder Beträge noch Bezeichnungen von Ausgaben und auch keine Namen von Gruppen.

Übergeben wird an Analytics allerdings die Push-Kennung deines Geräts (siehe Abschnitt Benachrichtigungen) als sogenannte Nutzereigenschaft. Sie verknüpft die Analysedaten mit deinem Gerät, sagt für sich genommen aber nichts über dich oder deine Ausgaben aus.

Es findet keine Werbung und kein Weiterverkauf dieser Daten statt.

**Zweck** ist zu verstehen, welche Funktionen tatsächlich genutzt werden.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. f DSGVO. Du kannst der Verarbeitung nach Art. 21 DSGVO widersprechen; eine formlose Nachricht an die oben genannte Adresse genügt.

### Wechselkurse

Für Ausgaben in fremder Währung ruft die App aktuelle Wechselkurse bei **Open Exchange Rates** (`openexchangerates.org`) ab. Dabei wird technisch bedingt deine IP-Adresse an diesen Anbieter übermittelt; anders lässt sich ein Abruf im Internet nicht durchführen. Es werden dabei keine Beträge, Bezeichnungen oder Kontodaten übertragen — die Anfrage betrifft nur die Kurse selbst.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. b DSGVO, da die Umrechnung Teil der Funktion ist.

### Empfänger und Übermittlung in die USA

Die genannten Firebase-Dienste — Authentication, Cloud Firestore, Cloud Functions, Cloud Messaging, Crashlytics, Performance Monitoring und Analytics — werden von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, bereitgestellt. Google ist für mich als Auftragsverarbeiter nach Art. 28 DSGVO tätig.

Dabei kann es zu einer Übermittlung von Daten an Google LLC in die USA kommen. Google LLC ist unter dem EU-US Data Privacy Framework zertifiziert, sodass ein Angemessenheitsbeschluss der Europäischen Kommission nach Art. 45 DSGVO als Grundlage der Übermittlung besteht. Ergänzend gelten die Standardvertragsklauseln der Kommission nach Art. 46 Abs. 2 lit. c DSGVO.

Darüber hinaus gebe ich deine Daten nicht weiter, verkaufe sie nicht und nutze sie nicht für Werbung.

### Deine Rechte

Du hast das Recht,

*   Auskunft über die zu dir gespeicherten Daten zu verlangen (Art. 15 DSGVO),
*   unrichtige Daten berichtigen zu lassen (Art. 16 DSGVO),
*   die Löschung deiner Daten zu verlangen (Art. 17 DSGVO),
*   die Verarbeitung einschränken zu lassen (Art. 18 DSGVO),
*   deine Daten in einem gängigen Format zu erhalten oder übertragen zu lassen (Art. 20 DSGVO),
*   der Verarbeitung auf Grundlage berechtigter Interessen zu widersprechen (Art. 21 DSGVO).

Für all das genügt eine formlose Nachricht an die oben genannte E-Mail-Adresse. Die Löschung deines Kontos kannst du außerdem direkt über das Formular unter [Konto löschen](/apps/delete) anstoßen.

Unabhängig davon steht dir ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO), etwa bei der für meinen Wohnsitz zuständigen Behörde.

### Kinder und Jugendliche

Die App richtet sich nicht gezielt an Kinder. Für die Anmeldung solltest du mindestens 16 Jahre alt sein; jüngere Nutzerinnen und Nutzer benötigen dafür die Zustimmung der Erziehungsberechtigten (Art. 8 DSGVO).

### Änderungen

Ändert sich die App, passe ich diese Erklärung an. Es gilt jeweils die hier veröffentlichte Fassung; das Datum oben zeigt den letzten Stand.
