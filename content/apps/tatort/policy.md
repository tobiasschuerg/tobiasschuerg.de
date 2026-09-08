---
title: "Tatort Logbuch Datenschutzerklärung"
description: "Welche personenbezogenen Daten die Android-App Tatort Logbuch verarbeitet, wozu, und welche Rechte du dabei hast."
url: "/apps/tatort/policy"
---

## Datenschutzerklärung

Diese Erklärung beschreibt, welche personenbezogenen Daten die Android-App **Tatort Logbuch** verarbeitet, zu welchem Zweck das geschieht und welche Rechte du dabei hast.

### Verantwortlicher

Tobias Schürg\
Bodenseestraße 103\
88048 Friedrichshafen\
Deutschland

E-Mail: {{< mail >}}

Ein Datenschutzbeauftragter ist nicht bestellt; dazu besteht keine gesetzliche Verpflichtung.

### Die App funktioniert ohne Konto

Tatort Logbuch lässt sich vollständig ohne Anmeldung nutzen. In diesem Fall bleiben alle deine Eingaben — gesehene Folgen, Favoriten und Bewertungen — ausschließlich in einer Datenbank auf deinem Gerät. Sie werden nicht an mich übertragen.

Erst wenn du dich freiwillig anmeldest, verlassen Daten dein Gerät. Was dann passiert, steht im nächsten Abschnitt.

### Anmeldung und Synchronisation

Meldest du dich mit deinem Google-Konto an, kannst du deine Daten zwischen mehreren Geräten synchronisieren. Dabei werden verarbeitet:

*   deine Google-Konto-Kennung, der dort hinterlegte Anzeigename und die E-Mail-Adresse (über Firebase Authentication),
*   die Folgen, die du als gesehen markiert hast, jeweils mit Datum,
*   die Folgen, die du als Favorit gespeichert hast,
*   die Bewertungen, die du vergeben hast.

Diese Daten werden bei Google Cloud Firestore gespeichert und sind dort deinem Konto zugeordnet.

**Zweck** ist die Bereitstellung der Synchronisation, also genau die Funktion, für die du dich angemeldet hast.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. b DSGVO — die Verarbeitung ist zur Erfüllung des Nutzungsverhältnisses erforderlich, das mit deiner Anmeldung zustande kommt.

**Speicherdauer:** Die Daten bleiben gespeichert, solange dein Konto besteht. Du kannst dein Konto jederzeit direkt in der App löschen (Einstellungen → Konto löschen); dabei werden das Konto und alle zugehörigen Daten sofort entfernt. Alternativ kannst du die Löschung über [Konto löschen](/apps/delete) anstoßen; nach Eingang der Anfrage lösche ich das Konto und alle zugehörigen Daten.

### Fehlerberichte

Stürzt die App ab oder tritt ein schwerer Fehler auf, wird ein Fehlerbericht über **Firebase Crashlytics** übermittelt. Ein solcher Bericht enthält technische Angaben zum Zeitpunkt des Fehlers: Gerätemodell, Android-Version, App-Version, Zustand der App, Fehlermeldung samt Aufrufliste sowie eine zufällig erzeugte Installations-Kennung. Crashlytics verarbeitet dabei kurzzeitig deine IP-Adresse; sie wird von Google nicht dauerhaft gespeichert.

**Zweck** ist das Erkennen und Beheben von Fehlern.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse liegt darin, die Stabilität der App sicherzustellen.

**Speicherdauer:** Crashlytics löscht Fehlerberichte automatisch nach 90 Tagen.

Eine Analyse deines Nutzungsverhaltens findet nicht statt. Die App enthält weder Werbung noch Tracking- oder Analyse-Dienste.

### Missbrauchsschutz

Um zu verhindern, dass die von mir betriebenen Dienste von manipulierten App-Kopien oder automatisiert missbraucht werden, kommt **Firebase App Check** mit dem Play-Integrity-Verfahren zum Einsatz. Dabei bestätigt Google, dass eine Anfrage von einer unveränderten Installation aus dem Play Store stammt. Übermittelt werden ein Integritätsnachweis von Google Play und deine IP-Adresse; Inhalte deines Logbuchs werden dabei nicht verarbeitet.

**Rechtsgrundlage** ist Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse am Schutz vor Missbrauch.

### Erinnerungen

Auf Wunsch erinnert dich die App am Tag der Ausstrahlung an eine neue Folge. Diese Erinnerung wird ausschließlich auf deinem Gerät berechnet und ausgelöst; es werden dafür keine Daten an mich übermittelt. Du kannst die Funktion in den Einstellungen jederzeit abschalten oder die Benachrichtigungsberechtigung entziehen.

### Abruf von Inhalten

Die App lädt Folgendaten und Bilder von externen Servern. Dabei wird technisch bedingt deine IP-Adresse an den jeweiligen Anbieter übermittelt; anders lässt sich ein Abruf im Internet nicht durchführen. Betroffen sind Cloud Storage for Firebase, von wo die App die Folgendaten lädt, sowie die ARD Mediathek (`api.ardmediathek.de`), sofern Bildmaterial zu einer Folge angezeigt wird.

Öffnest du aus der App heraus einen Link — etwa zur ARD Mediathek, zur Wikipedia oder zu IMDb — verlässt du den Bereich dieser Erklärung. Für die Datenverarbeitung auf den verlinkten Seiten sind deren Betreiber verantwortlich.

### Bewertung im Play Store

Die App kann dich gelegentlich fragen, ob du sie im Play Store bewerten möchtest. Diese Abfrage wird von Google Play selbst dargestellt und abgewickelt; ich erfahre nicht, ob oder wie du bewertest.

### Empfänger und Übermittlung in die USA

Die genannten Dienste — Firebase Authentication, Cloud Firestore, Cloud Storage for Firebase, Firebase Crashlytics, Firebase App Check und Google Play — werden von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, bereitgestellt. Google ist für mich als Auftragsverarbeiter nach Art. 28 DSGVO tätig.

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

Für all das genügt eine formlose Nachricht an die oben genannte E-Mail-Adresse. Dein Konto kannst du außerdem direkt in der App löschen (Einstellungen → Konto löschen) oder die Löschung über das Formular unter [Konto löschen](/apps/delete) anstoßen.

Unabhängig davon steht dir ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO), etwa bei der für meinen Wohnsitz zuständigen Behörde.

### Kinder und Jugendliche

Die App richtet sich nicht gezielt an Kinder. Für eine Anmeldung mit einem Google-Konto solltest du mindestens 16 Jahre alt sein; jüngere Nutzerinnen und Nutzer benötigen dafür die Zustimmung der Erziehungsberechtigten (Art. 8 DSGVO). Ohne Anmeldung ist die App uneingeschränkt und ohne Übermittlung persönlicher Daten nutzbar.

### Änderungen

Ändert sich die App, passe ich diese Erklärung an. Es gilt jeweils die hier veröffentlichte Fassung; das Datum oben zeigt den letzten Stand.

### Hinweis

Tatort Logbuch ist eine inoffizielle Fan-App. Sie steht in keiner Verbindung zur ARD, zum Ersten oder zur Tatort-Produktion.
