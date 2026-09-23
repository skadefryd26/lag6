import { useState } from 'react';
import confetti from 'canvas-confetti';

function fireConfetti() {
  confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 150);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 150);
}

type FormState = { claimDescription: string; coverage: string; deductible: string; proposedAmount: string; coffeeOffer: string };

const initial: FormState = {
  claimDescription: 'Kaffemaskinen eksploderte etter at skadebehandleren ignorerte tre varsellamper.',
  coverage: 'Inventar og løsøre', deductible: '2 000', proposedAmount: '18 500', coffeeOffer: '0',
};

export function App() {
  const [form, setForm] = useState(initial);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setReview(''); setError('');
    try {
      const response = await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, deductible: Number(form.deductible), proposedAmount: Number(form.proposedAmount), coffeeOffer: Number(form.coffeeOffer) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.');
      setReview(data.review);
      fireConfetti();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Noe gikk galt.'); }
    finally { setLoading(false); }
  }

  return <main>
    <div className="topline"><span className="dot" /> SKADEFRYD / INTERN KONTROLL</div>
    <section className="hero"><div><p className="eyebrow">Bjarne vurderer ditt forslag</p><h1>Før du trykker<br /><em>godkjenn.</em></h1><p className="intro">En fiktiv, overkvalifisert kontrollør som stopper erstatningsforslaget ditt før det gjør skade.</p></div><div className="badge">NORD<br /><strong>NO</strong></div></section>
    <div className="notice">⚠ FIKTIV DEMO <span>Dette påvirker ingen ekte skade, kunde eller lønn.</span></div>
    <div className="joke"><strong>Dagens vits fra Bjarne:</strong><br />Finn var en tur i skogen med en annen Finn og Bjarne. Plutselig ble den ene Finn borte. Da sa Bjarne til den gjenværende Finn:<br />– Finn, finn Finn!<br />Så svarte Finn:<br />– Bjarne, Bjarne, Bjarne!</div>
    <div className="layout"><form className="card form-card" onSubmit={submit}><div className="card-title"><span>01</span><h2>Skadebehandlerens forslag</h2></div><label>Hva skjedde?<textarea value={form.claimDescription} onChange={(e) => update('claimDescription', e.target.value)} /></label><label>Dekning<input value={form.coverage} onChange={(e) => update('coverage', e.target.value)} /></label><div className="two"><label>Egenandel (kr)<input type="number" value={form.deductible} onChange={(e) => update('deductible', e.target.value)} /></label><label>Foreslått beløp (kr)<input type="number" value={form.proposedAmount} onChange={(e) => update('proposedAmount', e.target.value)} /></label></div><label>Kaffetilbud til Bjarne (kr)<input type="number" value={form.coffeeOffer} onChange={(e) => update('coffeeOffer', e.target.value)} /></label><button disabled={loading}>{loading ? 'BJARNE SUKKER ...' : 'SEND TIL KONTROLL →'}</button></form>
      <section className={`card result-card ${review ? 'has-result' : ''}`}><div className="card-title"><span>02</span><h2>Bjarnes avgjørelse</h2></div>{!review && !loading && <div className="empty"><div className="stamp">?</div><p>Ingen beslutning er trygg før Bjarne har fått sagt sitt.</p><small>Fyll inn saken og send den til kontroll.</small></div>}{loading && <div className="empty thinking"><div className="stamp">…</div><p>«La meg se på dette. Det burde du egentlig ha gjort selv.»</p><small>Bjarne regner på kaffe, inflasjon og din karriere.</small></div>}{review && <><div className="stopped">STOPPET <span>●</span></div><pre>{review}</pre></>}</section></div>
    {error && <div className="error">{error}</div>}<footer>Bjarne har ikke myndighet til å godkjenne eller avslå noe som helst. Han har bare veldig sterke meninger.</footer>
  </main>;
}
