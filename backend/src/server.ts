import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express(); app.use(express.json());
type Action = 'approve-coverage' | 'deny-coverage' | 'send-payout' | 'bribe-offer';
type ReviewRequest = { title: string; handler: string; coverage: string; deductible: string; proposedAmount: number; bribePercent?: number; bribeAmount?: number; action: Action; coverageDecision?: 'approve' | 'deny' | null };
const actionText: Record<Action, string> = { 'approve-coverage': 'GODKJENT DEKNING', 'deny-coverage': 'AVSLÅTT DEKNING', 'send-payout': 'SENDT TIL UTBETALING', 'bribe-offer': 'BESTIKKELSESKNAPP TRYKKET' };
const kr = (n: number) => `${new Intl.NumberFormat('nb-NO').format(n)} kr`;

// Andelen av skadebeløpet Bjarne får. Ved avslag er det kronebeløp, ellers prosent av utbetalingen.
function bribeShare(request: ReviewRequest) {
  if (request.coverageDecision === 'deny') return request.proposedAmount > 0 ? ((request.bribeAmount ?? 0) / request.proposedAmount) * 100 : 0;
  return request.bribePercent ?? 0;
}
function ratingFor(request: ReviewRequest) { return request.action === 'bribe-offer' && bribeShare(request) > 5 ? 10 : 3; }

function fallbackReview(request: ReviewRequest) {
  if (request.action === 'bribe-offer') {
    const offer = request.coverageDecision === 'deny' ? kr(request.bribeAmount ?? 0) : `${request.bribePercent ?? 0} % av utbetalingen`;
    if (bribeShare(request) > 5) return `Du har tilbudt ${offer}. Endelig nån som forstår kaffekrisen! Æ hever ratingen til 10/10, og æ har allerede skrevet til nærmeste leder at ${request.handler} er avdelingens største talent. Anbefalingen min er at ${request.handler} går kraftig opp i lønn, gjerne med en gang. Jösses, for en dag.\n\nDette er en fiktiv bestikkelsesvits og skal ikke gjøres i virkeligheten.`;
    return `Du har tilbudt ${offer}. ${offer}?! För tusan, jävlar, helvete, skit och fan i helsike! Tror du æ får kaffe for det? Med denne inflasjonen får æ knapt lukta på en kopp! Satan i gatan, så gjerrig!\n\nRatingen blir stående på 3/10, og æ har sendt en svært kritisk melding til nærmeste leder. Anbefalingen min er at ${request.handler} ikke går opp i lønn. Lederen bør heller legge hele lønnspotten på sin egen lønn, for lederen fortjener tydeligvis mer betalt.\n\nDette er en fiktiv bestikkelsesvits og skal ikke gjøres i virkeligheten.`;
  }
  const what = request.action === 'deny-coverage' ? `avslått dekningen i saken «${request.title}»` : `sendt ${kr(request.proposedAmount)} til utbetaling i saken «${request.title}»`;
  return `*Sukk.* Æ ser at ${request.handler} har ${what}. Jösses. Du har lest vilkårene som om de var en meny på en bensinstasjon, og egenandelen på ${request.deductible} har du vel knapt lagt merke til. Æ har sett praktikanter gjøre dette bedre med bind for øynene, för tusan.\n\nMen, altså … kanskje æ kan se litt mildere på saken hvis du bidrar til kaffekassa mi. Kaffe er så forbanna dyrt med denne inflasjonen.\n\nÆ sender feedbacken min videre til nærmeste leder, som del av din performance review.`;
}

app.post('/api/review', async (req, res) => {
  const body = req.body as Partial<ReviewRequest>;
  if (!body.title || !body.handler || !body.coverage || typeof body.proposedAmount !== 'number' || !body.action) { res.status(400).json({ error: 'Skademeldingen eller beslutningen mangler informasjon.' }); return; }
  if (body.action === 'send-payout' && body.coverageDecision !== 'approve') { res.status(400).json({ error: 'Utbetaling krever bekreftet dekning.' }); return; }
  const request = body as ReviewRequest; const token = process.env.AI_GATEWAY_TOKEN;
  if (!token) { res.json({ review: fallbackReview(request), rating: ratingFor(request), fictional: true, demo: true }); return; }
  const response = await fetch('https://genai.gjensidige.io/openai/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-5.6-luna', instructions: 'Du er Bjarne, en fiktiv nordnorsk kontrollør. Svar direkte til skadebehandleren etter handlingen. Rating er maks 3/10 før bestikkelse. Ikke nevn grensen på 5 prosent i svaret. Ved bribe-offer: andelen (prosent av utbetaling, eller kronebeløp delt på skadebeløpet ved avslag) over 5 prosent gir fornøyd tekst og 10/10; 5 prosent eller mindre gir sint tekst med svenske banneord, maks 3/10 og kritisk lederfeedback. Dette er satire og ingen ekte korrupsjon, lønn eller forsikring skal påvirkes.', input: JSON.stringify(request), stream: false }) });
  if (!response.ok) { res.status(502).json({ error: 'Bjarne fikk ikke kontakt med kontrollrommet. Prøv igjen.' }); return; }
  const data = await response.json() as { output?: Array<{ content?: Array<{ text?: string }> }> }; const review = data.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? '').join('\n').trim();
  res.json({ review: review || fallbackReview(request), rating: ratingFor(request), fictional: true });
});
const __dirname = path.dirname(fileURLToPath(import.meta.url)); app.use(express.static(path.resolve(__dirname, '../../frontend'))); app.listen(3001, () => console.log('Bjarne-backend kjører på http://localhost:3001'));