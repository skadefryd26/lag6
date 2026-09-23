import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(express.json());

type ReviewRequest = {
  claimDescription: string;
  coverage: string;
  deductible: number;
  proposedAmount: number;
  coffeeOffer?: number;
};

const fallbackReview = (request: ReviewRequest) => {
  const amount = new Intl.NumberFormat('nb-NO').format(request.proposedAmount);
  const coffee = request.coffeeOffer ? `${request.coffeeOffer} kr` : 'ingenting';
  return `STOPPET\n\nRATING: 6/10 – beløpet på ${amount} kr er modig, men dokumentasjonen virker litt som en kaffepause med skrivefeil.\n\nKRITIKK: Jasså, du tenkte at vi bare skulle trykke godkjenn og håpe på det beste? Herregud, altså.\n\nPERFORMANCE REVIEW: Viser kreativitet, men bør lese dekning og egenandel før neste forslag. Lønnsøkning anbefales ikke i denne fiktive vurderingen.\n\nKAFFEBESTIKKELSE TIL DEG: Kaffen er så dyr på grunn av inflasjonen at du kan vippse Bjarne en symbolsk andel av ${amount} kr. Tilbudt kaffe: ${coffee}. Dette er satire og skal selvfølgelig ikke gjøres.\n\nNESTE STEG: Kontroller dekning, egenandel og dokumentasjon én gang til.`;
};

app.post('/api/review', async (req, res) => {
  const body = req.body as Partial<ReviewRequest>;
  if (!body.claimDescription || !body.coverage || typeof body.deductible !== 'number' || typeof body.proposedAmount !== 'number') {
    res.status(400).json({ error: 'Fyll inn skadebeskrivelse, dekning, egenandel og erstatningsbeløp.' });
    return;
  }

  const token = process.env.AI_GATEWAY_TOKEN;
  if (!token) {
    res.json({ review: fallbackReview(body as ReviewRequest), fictional: true, demo: true });
    return;
  }

  const response = await fetch('https://genai.gjensidige.io/openai/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-5.6-luna',
      instructions: 'Du er Bjarne. Svar på norsk med nordnorsk dialekt. Følg systemprompten i prosjektets startprompt. Dette er fiksjon og satire. Rett bestikkelsesvitsen direkte til skadebehandleren.',
      input: JSON.stringify(body),
      stream: false,
    }),
  });

  if (!response.ok) {
    res.status(502).json({ error: 'Bjarne fikk ikke kontakt med kontrollrommet. Prøv igjen.' });
    return;
  }

  const data = await response.json() as { output?: Array<{ content?: Array<{ text?: string }> }> };
  const review = data.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? '').join('\n').trim();
  res.json({ review: review || fallbackReview(body as ReviewRequest), fictional: true });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, '../../frontend')));

app.listen(3001, () => console.log('Bjarne-backend kjører på http://localhost:3001'));
