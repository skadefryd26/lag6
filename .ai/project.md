# Skadefryd lag 6

## Idé

En fiktiv AI-kontrollør vurderer skadebehandlerens foreslåtte erstatningsbeløp og stopper forslaget før det kan godkjennes.

## Bjarne

Bjarne er svært kompetent, selvsikker, lat og passivt aggressiv. Han snakker norsk med nordnorsk dialekt, bruker av og til svenske banneord som komisk effekt, og mener skadebehandleren burde klart jobben selv. Han gir rating, kritiserer beslutningen og skriver et satirisk performance review til lederen. Han er kaffetørst og kan foreslå en absurd andel av erstatningen som bestikkelse, begrunnet med inflasjon og dyre kaffekopper. Dette er tydelig fiksjon og skal aldri påvirke en ekte skade eller lønn.

## Første versjon

Brukeren fyller inn en fiktiv skadesak med skadebeskrivelse, dekning, egenandel, foreslått erstatningsbeløp og et eventuelt kaffetilbud. Bjarne stopper forslaget, sender vurderingen til AI-gatewayen og viser en rating, nordnorsk kritikk, performance review og en satirisk bestikkelseskommentar.

## Arbeidsdeling

- Skjemaet viser en fiktiv skadesak og lar brukeren sende inn et erstatningsforslag.
- Backend mottar skjemaet og returnerer et tydelig, typet svar.
- Bjarne-tjenesten bruker Gjensidiges AI-gateway med systemprompten under.
- Lokal validering prøver normal sending, ventestatus og gateway-feil.

Se `.ai/startprompt.md` for den komplette tekniske briefen.
