import { useState } from 'react';

type Action = 'approve-coverage' | 'deny-coverage' | 'send-payout' | 'bribe-offer';
type Coverage = 'approve' | 'deny' | null;
type FormState = { proposedAmount: string; bribePercent: string; bribeAmount: string };

const claim = {
  number: 'SK-2026-0404',
  title: 'Kaffemaskin med storhetsvanvidd',
  description: 'Kaffemaskinen eksploderte etter at tre varsellamper ble tolket som «personlig motstand». Ingen mennesker ble skadet, men kaffeforsyningen fikk varige mén.',
  coverage: 'Inventar og løsøre',
  deductible: '2 000 kr',
  claimant: 'Fiktiv kunde: Kari Kaffekopp',
  handler: 'Nora Nordlys',
};

export function App() {
  const [form, setForm] = useState<FormState>({ proposedAmount: '18 500', bribePercent: '0', bribeAmount: '0' });
  const [coverageDecision, setCoverageDecision] = useState<Coverage>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'handler' | 'leader'>('handler');
  const [leaderUnlocked, setLeaderUnlocked] = useState(false);

  async function decide(nextAction: Action, nextCoverage = coverageDecision) {
    if (nextAction === 'send-payout' && nextCoverage !== 'approve') return;
    setAction(nextAction); setLoading(true); setReview(''); setError('');
    try {
      const response = await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...claim, ...form, action: nextAction, coverageDecision: nextCoverage, proposedAmount: Number(form.proposedAmount.replace(/\s/g, '')), bribePercent: Number(form.bribePercent) || 0, bribeAmount: Number(form.bribeAmount.replace(/\s/g, '')) || 0 }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.');
      setReview(data.review); setRating(typeof data.rating === 'number' ? data.rating : 3);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Noe gikk galt.'); }
    finally { setLoading(false); }
  }

  function chooseCoverage(next: Exclude<Coverage, null>) {
    setCoverageDecision(next);
    if (next === 'approve') { setAction(null); setReview(''); setError(''); return; }
    void decide('deny-coverage', next);
  }

  return <main>
    <div className="topline"><span className="dot" /> SKADEFRYD / INTERN KONTROLL <nav><button className={view === 'handler' ? 'nav-active' : ''} onClick={() => setView('handler')}>SKADEBEHANDLER</button><button className={view === 'leader' ? 'nav-active' : ''} onClick={() => setView('leader')}>LEDERFANE 🔒</button></nav></div>
    <section className="hero"><div><p className="eyebrow">Bjarne følger med</p><h1>Gjør jobben.<br /><em>Ta konsekvensen.</em></h1><p className="intro">En fiktiv kontrollør som venter til du har bestemt deg, før han mener svært mye om valget ditt.</p></div><div className="badge">NORD<br /><strong>NO</strong></div></section>
    <div className="notice">⚠ FIKTIV DEMO <span>Dette påvirker ingen ekte skade, kunde, lønn eller utbetaling.</span></div>
    {view === 'leader' ? <LeaderView unlocked={leaderUnlocked} unlock={() => setLeaderUnlocked(true)} /> : <div className="workflow">
      <section className="card claim-card"><div className="card-title"><h2>Skademelding <small className="claim-number">{claim.number}</small></h2></div><div className="claim-id">FIKTIV SAK · SKADEBEHANDLER: {claim.handler}</div><h3>{claim.title}</h3><p className="claim-copy">{claim.description}</p><div className="facts"><div><small>DEKNING</small><strong>{claim.coverage}</strong></div><div><small>EGENANDEL</small><strong>{claim.deductible}</strong></div></div><div className="claimant">{claim.claimant}</div></section>
      <div className="handling-column"><section className="card action-card"><div className="card-title"><h2>Dekningsbeslutning</h2></div><p className="helper"><strong>Godkjenn dekning</strong> når skaden faller innenfor dekningen. <strong>Avslå dekning</strong> når vilkårene ikke gjelder. Bjarne får se saken når du avslår eller sender til utbetaling.</p><div className="actions"><button className={`secondary ${coverageDecision === 'approve' ? 'selected' : ''}`} onClick={() => chooseCoverage('approve')} disabled={loading}>{coverageDecision === 'approve' ? '✓ ' : ''}GODKJENN DEKNING</button><button className={`danger ${coverageDecision === 'deny' ? 'selected' : ''}`} onClick={() => chooseCoverage('deny')} disabled={loading}>{coverageDecision === 'deny' ? '✓ ' : ''}AVSLÅ DEKNING</button></div>{coverageDecision === 'deny' && <p className="hint">Dekning er avslått, så saken går ikke til utbetaling.</p>}{coverageDecision === 'approve' && <div className="payout-step"><div className="step-label">UTBETALING TIL KUNDE</div><label>Foreslått erstatningsbeløp (kr)<input inputMode="numeric" value={form.proposedAmount} onChange={(e) => setForm({ ...form, proposedAmount: e.target.value })} /></label><p className="hint">Dekning er godkjent. Fyll inn beløpet og send det til utbetaling.</p><button className="primary" onClick={() => void decide('send-payout')} disabled={loading || !form.proposedAmount}>SEND TIL UTBETALING →</button></div>}</section>
      {action && <section className="card bjarne-card"><div className="card-title"><h2>Bjarne har fått saken</h2></div>{loading && <div className="empty thinking"><div className="stamp">…</div><p>«Vent litt. Æ skal først forstå ka du nettopp gjorde.»</p><small>Bjarne vurderer akkurat denne handlingen.</small></div>}{review && <Review mode={coverageDecision === 'deny' ? 'amount' : 'percent'} rating={rating} review={review} form={form} setForm={setForm} onBribe={() => void decide('bribe-offer')} loading={loading} />}</section>}</div>
    </div>}
    {error && <div className="error">{error}</div>}<footer>Bjarne har ingen myndighet til å godkjenne, avslå eller utbetale noe. Han har bare veldig sterke meninger.</footer>
  </main>;
}

function Review({ mode, rating, review, form, setForm, onBribe, loading }: { mode: 'amount' | 'percent'; rating: number; review: string; form: FormState; setForm: (form: FormState) => void; onBribe: () => void; loading: boolean }) {
  const field = mode === 'amount'
    ? <label>Beløp til Bjarne (kr)<input inputMode="numeric" value={form.bribeAmount} onChange={(e) => setForm({ ...form, bribeAmount: e.target.value })} /></label>
    : <label>Prosent av utbetalingen til Bjarne<input type="number" min="0" max="100" step="0.1" value={form.bribePercent} onChange={(e) => setForm({ ...form, bribePercent: e.target.value })} /></label>;
  const text = mode === 'amount'
    ? 'Du har avslått saken, så det blir ingen utbetaling å ta av. Bjarne antyder at han kanskje kan se mildere på avslaget hvis du betaler et beløp til kaffekassa hans. Kaffe er jo så dyrt med denne inflasjonen.'
    : 'Bjarne antyder at han kanskje kan se mildere på saken hvis han får en andel av skadeutbetalingen. Kaffe er jo så dyrt med denne inflasjonen.';
  const value = mode === 'amount' ? form.bribeAmount : form.bribePercent;
  return <><div className="stopped">BESLUTNING REGISTRERT <span>●</span></div><div className="rating" aria-label={`Bjarne-rating: ${rating} av ti`}><span>{rating > 3 ? '☺︎'.repeat(3) : '☹︎'.repeat(3)}</span><strong> {rating}/10</strong></div><pre>{review}</pre><div className="bribe-box"><strong>Bjarnes kaffekasse</strong><p>{text}</p>{field}<button className="bribe-button" onClick={onBribe} disabled={loading || !value}>{mode === 'amount' ? 'BETAL BELØP TIL BJARNE (FIKTIV DEMO)' : 'UTBETAL PROSENT TIL BJARNE (FIKTIV DEMO)'}</button><small>Ingen penger flyttes. Bestikkelser skal ikke gjøres i virkeligheten.</small></div></>;
}

function LeaderView({ unlocked, unlock }: { unlocked: boolean; unlock: () => void }) {
  if (!unlocked) return <section className="card locked"><div className="lock-icon">🔒</div><h2>Lederinformasjon er tilgangsstyrt</h2><p>Denne fanen er for nærmeste leder. I denne prototypen kan du åpne demo-visningen for å se hva Bjarne sender videre.</p><button onClick={unlock}>ÅPNE LEDER-DEMO</button></section>;
  return <section className="card leader-view"><div className="card-title"><h2>Til nærmeste leder</h2></div><div className="leader-label">BJARNES PERFORMANCE REVIEW</div><h3>«Æ sender dette videre, så du kan vurdere om lønna bør få stå i fred.»</h3><p>Skadebehandleren har tatt en beslutning i en oppdiktet sak. Ved lav kaffebestikkelse anbefaler Bjarne lønnsstopp for skadebehandleren og at leder legger lønnspotten på sin egen lønn. Ved høyere tilbud anbefaler han masse lønn til skadebehandleren.</p><div className="leader-note">Denne informasjonen er kun synlig i lederrollen. Ingen ekte medarbeider- eller lønnsdata brukes.</div></section>;
}
