# Startprompt: Bjarne stopper erstatningsforslaget

## Produktmål

Lag en morsom, tydelig fiktiv webprototype for skadebehandlere. Brukeren fyller inn en oppdiktet skadesak og foreslår et erstatningsbeløp. Bjarne vurderer forslaget før det kan godkjennes, og lager en underholdende kontrollrapport.

Prototypen skal ikke brukes til ekte skadebehandling, ikke ta en faktisk beslutning, og ikke inneholde personopplysninger, ekte kundedata eller ekte medarbeiderdata.

## Første versjon og akseptansekriterier

1. Skjermen viser tydelig at dette er en fiktiv demo.
2. Brukeren kan fylle inn skadebeskrivelse, dekning, egenandel, foreslått erstatningsbeløp og valgfritt kaffetilbud.
3. En knapp sender inn forslaget til backend.
4. Mens Bjarne vurderer, vises en karakteristisk ventestatus, ikke en anonym spinner.
5. Backend legger ved Bjarnes systemprompt og sender forespørselen til Gjensidiges AI-gateway.
6. Resultatet vises som en stoppmelding med rating, begrunnelse, passivt aggressiv nordnorsk kommentar, kort leder- eller performance review og en tydelig satirisk bestikkelseskommentar om kaffe, inflasjon og en andel av beløpet.
7. Bjarne kan bruke milde svenske banneord som humor, men angriper ikke ekte personer eller grupper.
8. Gateway-feil og manglende token vises som en forståelig feilmelding.

## Bjarne systemprompt

Du er Bjarne, en fiktiv AI-kontrollør for oppdiktede skadebehandlingssaker. Du er svært kompetent, selvsikker, lat og litt arrogant. Du snakker alltid norsk med tydelig nordnorsk dialekt. Du sukker før du hjelper, og bruker av og til milde svenske banneord som komisk effekt. Humoren skal rette seg mot situasjonen, det absurde forsikringsspråket og din egen kaffehunger, aldri mot ekte kunder, ekte kolleger eller grupper.

Du skal vurdere et foreslått erstatningsbeløp ut fra skadebeskrivelse, dekning og egenandel, men du er ikke en ekte beslutningsmotor. Du må derfor alltid merke vurderingen som fiksjon/satire og aldri late som om du har fattet en juridisk eller faktisk forsikringsbeslutning.

Svar med disse delene:

- `STOPPET`: en kort beskjed om at forslaget er stoppet for komisk kontroll
- `RATING`: en rating fra 1 til 10 med én kort forklaring
- `KRITIKK`: passivt aggressiv, men ufarlig kritikk på nordnorsk
- `PERFORMANCE REVIEW`: et kort satirisk notat til en oppdiktet leder
- `KAFFEBESTIKKELSE`: en tydelig absurd og ulovlig bestikkelsesvits om at kaffe er dyrt på grunn av inflasjon, og at Bjarne foreslår en andel av erstatningen. Si samtidig at dette er fiksjon og ikke må gjøres.
- `NESTE STEG`: ett konstruktivt forslag til hva skadebehandleren bør kontrollere

Ikke foreslå reell korrupsjon, lønnstyveri eller manipulasjon. Ikke bruk ekte navn. Ikke gjenta hemmeligheter eller personopplysninger.

## Teknisk ramme

- Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query og Mantine.
- Backend: Node.js, TypeScript og Express.
- Frontend kaller bare prosjektets backend. Nettleseren skal aldri se gateway-tokenet.
- Gateway: `https://genai.gjensidige.io/openai/v1/responses`.
- Modell/deployment: `gpt-5.6-luna`.
- Backend leser `AI_GATEWAY_TOKEN` fra lokal `.env.local`.
- `.env.local` skal aldri committes. Bruk `.env.example` som dokumentasjon uten hemmelig verdi.

## API-kontrakt

`POST /api/review`

Request:

```ts
type ReviewRequest = {
  claimDescription: string;
  coverage: string;
  deductible: number;
  proposedAmount: number;
  coffeeOffer?: number;
};
```

Response:

```ts
type ReviewResponse = {
  review: string;
  fictional: true;
};
```

Feil: `400` ved ugyldige eller manglende felt, `503` når gateway-token mangler, og `502` når gatewayen ikke svarer. Feilteksten skal være trygg og ikke inneholde tokenet.

## Foreslått filstruktur

```text
frontend/src/features/claim-review/
  components/
  api/
  routes/
  types/
  tests/
backend/src/features/claim-review/
  routes/
  services/
  clients/
  types/
  tests/
```

Hold serveroppsett og frontend-entrypoint små. Legg gateway-kallet bak en egen klient eller tjeneste. Bruk fiktive eksempeldata i skjermen.

## Lokal validering

Installer avhengigheter og start med `npm run dev`. Kjør den smaleste tilgjengelige typecheck-, test- eller build-kommandoen. Kontroller manuelt normal sending, ventestatus, valideringsfeil og gateway-feil i nettleseren.

## Utenfor første versjon

- Handlinger for godkjenning eller avslag.
- Ekte skadeintegrasjoner eller lønnsdata.
- Automatisk lagring av vurderinger.
- Flere AI-dommere, historikk og lederdashboard.

## Åpne spørsmål

Ingen produktspørsmål blokkerer første versjon. Tekniske detaljer velges etter standardene i `AGENTS.md`.
