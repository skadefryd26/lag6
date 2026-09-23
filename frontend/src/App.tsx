import { useState } from 'react';
import confetti from 'canvas-confetti';

function fireConfetti() {
  confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 150);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 150);
}

type Action = 'approve-coverage' | 'deny-coverage' | 'send-payout' | 'bribe-offer';
type FormState = { proposedAmount: string; bribePercent: string };

const claim = {
  title: 'Kaffemaskin med storhetsvanvidd',
  description: 'Kaffemaskinen eksploderte etter at tre varsellamper ble tolket som «personlig motstand». Ingen mennesker ble skadet, men kaffeforsyningen fikk varige mén.',
  coverage: 'Inventar og løsøre',
  deductible: '2 000 kr',
  claimant: 'Fiktiv kunde: Kari Kaffekopp',
  claimNumber: 'SK-2026-0404',
  handler: 'Nora Nordlys',
};

export function App() {
  const [form, setForm] = useState<FormState>({ proposedAmount: '18 500', bribePercent: '0' });
  const [action, setAction] = useState<Action | null>(null);
  const [coverageDecision, setCoverageDecision] = useState<'approve' | 'deny' | null>(null);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'handler' | 'leader'>('handler');
  const [leaderUnlocked, setLeaderUnlocked] = useState(false);

  async function decide(nextAction: Action) {
    if (nextAction === 'approve-coverage') setCoverageDecision('approve');
    if (nextAction === 'deny-coverage') setCoverageDecision('deny');
    setAction(nextAction); setLoading(true); setReview(''); setError('');
    try {
      const response = await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, action: nextAction, coverageDecision, proposedAmount: Number(form.proposedAmount.replace(/\s/g, '')), bribePercent: Number(form.bribePercent.replace(/\s/g, '')), ...claim }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.');
      setReview(data.review);
      fireConfetti();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Noe gikk galt.'); }
    finally { setLoading(false); }
  }

  return <main>
    <div className="topline"><span className="dot" /> SKADEFRYD / INTERN KONTROLL <nav><button className={view === 'handler' ? 'nav-active' : ''} onClick={() => setView('handler')}>SKADEBEHANDLER</button><button className={view === 'leader' ? 'nav-active' : ''} onClick={() => setView('leader')}>LEDERFANE 🔒</button></nav></div>
    <section className="hero"><div><p className="eyebrow">Bjarne følger med</p><h1>Gjør jobben.<br /><em>Ta konsekvensen.</em></h1><p className="intro">En fiktiv kontrollør som venter til du har bestemt deg, før han mener svært mye om valget ditt.</p></div><div className="badge">NORD<br /><strong>NO</strong></div></section>
    <div className="notice">⚠ FIKTIV DEMO <span>Dette påvirker ingen ekte skade, kunde, lønn eller utbetaling.</span></div>
    {view === 'leader' ? <LeaderView unlocked={leaderUnlocked} unlock={() => setLeaderUnlocked(true)} /> : <div className="workflow"><section className="card claim-card"><div className="card-title"><span>01</span><h2>Skademelding <small className="claim-number">{claim.claimNumber}</small></h2></div><div className="claim-id">FIKTIV SAK · SKADEBEHANDLER: {claim.handler}</div><h3>{claim.title}</h3><p className="claim-copy">{claim.description}</p><div className="facts"><div><small>DEKNING</small><strong>{claim.coverage}</strong></div><div><small>EGENANDEL</small><strong>{claim.deductible}</strong></div></div><div className="claimant">{claim.claimant}</div></section>
      <section className="card action-card"><div className="card-title"><span>02</span><h2>Dekningsbeslutning</h2></div><p className="helper"><strong>Godkjenn dekning</strong> når skaden faller innenfor oppgitt dekning. <strong>Avslå dekning</strong> når vilkårene ikke gjelder.</p><div className="radio-actions"><label className="radio-option"><input type="radio" name="coverage" checked={coverageDecision === 'approve'} onChange={() => decide('approve-coverage')} disabled={loading} /><span>GODKJENN DEKNING<small>Registrer at saken kan gå videre.</small></span></label><label className="radio-option"><input type="radio" name="coverage" checked={coverageDecision === 'deny'} onChange={() => decide('deny-coverage')} disabled={loading} /><span>AVSLÅ DEKNING<small>Registrer at saken ikke dekkes.</small></span></label></div><div className="payout-step"><div className="step-label">03 · UTBETALING TIL KUNDE</div><label>Foreslått erstatningsbeløp (kr)<input inputMode="numeric" value={form.proposedAmount} onChange={(e) => setForm({ ...form, proposedAmount: e.target.value })} /></label><p className="hint">Beløpet sendes først til Bjarne når du trykker på utbetalingsknappen.</p><button className="primary" onClick={() => decide('send-payout')} disabled={loading || !form.proposedAmount || coverageDecision !== 'approve'}>SEND TIL UTBETALING →</button></div></section>
      {action && <section className={`card bjarne-card ${review ? 'has-result' : ''}`}><div className="card-title"><span>04</span><h2>Bjarne har fått saken</h2></div>{loading && <div className="empty thinking"><div className="stamp">…</div><p>«Vent litt. Æ skal først forstå ka du nettopp gjorde.»</p><small>Bjarne vurderer akkurat denne handlingen.</small></div>}{review && <Review review={review} form={form} setForm={setForm} onBribe={() => decide('bribe-offer')} loading={loading} />}</section>}</div>}
    {error && <div className="error">{error}</div>}<footer>Bjarne har ingen myndighet til å godkjenne, avslå eller utbetale noe. Han har bare veldig sterke meninger.</footer>
  </main>;
}

function Review({ review, form, setForm, onBribe, loading }: { review: string; form: FormState; setForm: (form: FormState) => void; onBribe: () => void; loading: boolean }) {
  const percent = Number(form.bribePercent) || 0;
  const rating = percent > 5 ? 10 : 3;
  return <><div className="stopped">BESLUTNING REGISTRERT <span>●</span></div><div className="rating" aria-label={`Bjarne-rating: ${rating} av ti`}><span>{'☹︎'.repeat(Math.min(3, rating))}</span><strong> {rating}/10</strong></div><pre>{review}</pre><div className="bribe-box"><strong>Bjarnes kaffekasse</strong><p>Bjarne ber om en prosentandel av skadeutbetalingen. Over 5 % gjør ham fornøyd; 5 % eller mindre gjør ham rasende. Dette er kun fiktiv satire.</p><label>Prosent av utbetalingen til Bjarne<input type="number" min="0" max="100" step="0.1" value={form.bribePercent} onChange={(e) => setForm({ ...form, bribePercent: e.target.value })} /></label><button className="bribe-button" onClick={onBribe} disabled={loading || !form.bribePercent}>UTBETAL PROSENT TIL BJARNE (FIKTIV DEMO)</button><small>Ingen penger flyttes. Bestikkelser skal ikke gjøres i virkeligheten.</small></div></>;
}

function LeaderView({ unlocked, unlock }: { unlocked: boolean; unlock: () => void }) {
  if (!unlocked) return <section className="card locked"><div className="lock-icon">🔒</div><h2>Lederinformasjon er tilgangsstyrt</h2><p>Denne fanen er for nærmeste leder. I denne prototypen kan du åpne demo-visningen for å se hva Bjarne sender videre.</p><button onClick={unlock}>ÅPNE LEDER-DEMO</button></section>;
  return <section className="card leader-view"><div className="card-title"><span>04</span><h2>Til nærmeste leder</h2></div><div className="leader-label">BJARNES PERFORMANCE REVIEW</div><h3>«Æ sender dette videre, så du kan vurdere om lønna bør få stå i fred.»</h3><p>Skadebehandleren har tatt en beslutning i en oppdiktet sak. Bjarne anbefaler en samtale om vurderingskvalitet, dokumentasjon og den mistenkelig lave respekten for egenandelen.</p><div className="leader-note">Denne informasjonen er kun synlig i lederrollen. Ingen ekte medarbeider- eller lønnsdata brukes.</div></section>;
}
