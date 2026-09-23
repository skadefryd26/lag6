import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(express.json());
type Action = 'approve-coverage' | 'deny-coverage' | 'send-payout' | 'bribe-offer';
type ReviewRequest = { title: string; description: string; coverage: string; deductible: string; proposedAmount: number; bribePercent?: number; action: Action; coverageDecision?: 'approve' | 'deny' | null; claimNumber?: string; handler?: string };

const actionText: Record<Action, string> = { 'approve-coverage': 'GODKJENT DEKNING', 'deny-coverage': 'AVSLÅTT DEKNING', 'send-payout': 'SENDT TIL UTBETALING', 'bribe-offer': 'BESTIKKELSESKNAPP TRYKKET' };
const fallbackReview = (request: ReviewRequest) => {
  const amount = new Intl.NumberFormat('nb-NO').format(request.proposedAmount);
  const action = request.action === 'bribe-offer' ? 'BESTIKKELSESKNAPP TRYKKET' : actionText[request.action];
  const percent = request.bribePercent ?? 0;
  const reaction = percent > 5
    ? `Du har tilbudt ${percent}% av utbetalingen. Det var endelig et tall med litt respekt for kaffekrisen. Æ hever den fiktive ratingen til 10/10 og anbefaler at ${request.handler ?? 'skadebehandleren'} får masse lønn. Jösses, for en overraskelse.`
    : `Du har tilbudt ${percent}% av utbetalingen. Det er 5 % eller mindre, så æ blir rasende: för tusan, jävlar, helvete, skit også videre. Æ lar ratingen stå på maksimalt 3/10 og sender en svært kritisk melding til lederen. Lederen bør vurdere å holde igjen lønnsøkningen til ${request.handler ?? 'skadebehandleren'} og legge lønnspotten på sin egen lønn, siden lederen tydeligvis fortjener mer.`;
  return `Æ ser at ${request.handler ?? 'skadebehandleren'} har valgt «${action}» i saken «${request.title}». Ratingen blir maksimalt tre av ti, og det er egentlig rausere enn dokumentasjonen fortjener. Du har lest dekningen som om den var en meny på en bensinstasjon, jösses, og egenandelen står fortsatt der og venter på å bli oppdaget.\n\nNår det er sagt: Æ kan kanskje bli litt mer samarbeidsvillig dersom du bidrar til kaffekassa. Inflasjonen har gjort kaffe så dyrt at æ vurderer å drikke vilkårene tørre. ${reaction} Dette er en fiktiv bestikkelsesvits og skal ikke gjøres i virkeligheten.\n\nÆ sender feedbacken videre til nærmeste leder. Sjekk dekning, egenandel og dokumentasjon én gang til før du gjør dette på ekte.`;
};

app.post('/api/review', async (req, res) => {
  const body = req.body as Partial<ReviewRequest>;
  if (!body.title || !body.description || !body.coverage || typeof body.proposedAmount !== 'number' || !body.action) { res.status(400).json({ error: 'Skademeldingen eller beslutningen mangler informasjon.' }); return; }
  if (body.action === 'send-payout' && body.coverageDecision !== 'approve') { res.status(400).json({ error: 'Utbetaling krever bekreftet dekning.' }); return; }
  const request = body as ReviewRequest;
  const token = process.env.AI_GATEWAY_TOKEN;
  if (!token) { res.json({ review: fallbackReview(request), fictional: true, demo: true }); return; }
  const response = await fetch('https://genai.gjensidige.io/openai/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-5.6-luna', instructions: 'Du er Bjarne, en fiktiv kontrollør med nordnorsk dialekt. Svar direkte til skadebehandleren etter handlingen. Ratingen er maks 3/10 før en separat fiktiv kaffebestikkelse. Ved bribe-offer: over 5 prosent gir fornøyd tekst og rating 10/10; 5 prosent eller mindre gir svært sint tekst med svenske banneord, rating maks 3/10 og kritisk lederfeedback. Si at lederfeedback sendes til nærmeste leder. Dette er fiksjon: ikke gi reelle råd om korrupsjon, lønn eller forsikring.', input: JSON.stringify(request), stream: false }) });
  if (!response.ok) { res.status(502).json({ error: 'Bjarne fikk ikke kontakt med kontrollrommet. Prøv igjen.' }); return; }
  const data = await response.json() as { output?: Array<{ content?: Array<{ text?: string }> }> };
  const review = data.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? '').join('\n').trim();
  res.json({ review: review || fallbackReview(request), fictional: true });
});
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, '../../frontend')));
app.listen(3001, () => console.log('Bjarne-backend kjører på http://localhost:3001'));
