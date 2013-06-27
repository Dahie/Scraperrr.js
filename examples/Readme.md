# Configuraton examples

These  examples show some of the configuration options possible with Scraperrr.js.
A full documentation of the config interface is provided on the wiki.

Each example is a fully working scraperrr for the motions of a Pirate Party Germany assembly event. 



# Konfigurationsbeispiele

Diese Beispiele zeigen die einige Konfigurationsoptionen, die mit Scraperrr.js möglich sind. Eine vollständige Dokumentation des Konfigurations-Interface ist im Wiki.

Jedes Beispiel ist ein vollständig funktionierender Scraper für ein Antragsportal verschiedener Versammlungen der Piratenpartei Deutschland.
Die meisten Antragsportale sind im Wiki eingerichtet, die Beispiele laden die Anträge und exportieren sie als JSON. Diese JSON kann auf [pirat.ly](http://pirat.ly/spicker) importiert werden und so in [Spickerrr](http://pirat.ly/spickerrr) genutzt werden.
Die Beispiele können kopiert und als Grundlage eigener Konfigurationen benutzt werden.

## Beispiele

### LPTTH131, LPTBB131

Die Antragsportale des LPT Thüringen und Brandenburg basieren auf dem Antragsportal des Bundesparteitags.

### GVTK131

Das Antragsportal der Gebietsversammlung Treptow-Köpenick (ebenso Friedrichshain-Kreuzberg und Neukölln) nutzen diese automatisierte Liste von Anträgen.

Diese Konfiguration liegt beispielhaft im JSON und im YAML-Format vor.

### GVLI121

Die Gebietsversammlung Lichtenberg stellt alle Anträge auf einer einzigen Wiki-Seite dar. Der Scraper ist so konfiguriert, nur diese eine Seite zu besuchen und keine Detail-Seiten zu besuchen. Mittels `regexMotion` wird definiert wo die einzelnen Anträge enden und beginnen.

### HELP131

Der Landesparteitag Hessen benutzte ein Antragsportal mit 4 Themenseiten, auf denen jeweils alle Anträge vollständig drauf waren. Hier werden 4 Kontexte definiert, da die Anträge jeder Themenseite unterschiedliche Scraper-Regeln erforderten.
