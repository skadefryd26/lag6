import { useState } from 'react';

type Action = 'approve-coverage' | 'deny-coverage' | 'send-payout' | 'bribe-offer';
type Coverage = 'approve' | 'deny' | null;
type FormState = { proposedAmount: string; bribePercent: string; bribeAmount: string };
type Verdict = { text: string; rating: number };
type Claim = { number: string; title: string; description: string; coverage: string; deductible: string; claimant: string; handler: string; amount: string };

// Alle saker, kunder og skadebehandlere er oppdiktet.
const claims: Claim[] = [
  { number: 'SK-2026-0404', title: 'Kaffemaskin med storhetsvanvidd', description: 'Kaffemaskinen eksploderte etter at tre varsellamper ble tolket som «personlig motstand». Ingen mennesker ble skadet, men kaffeforsyningen fikk varige mén.', coverage: 'Inventar og løsøre', deductible: '2 000 kr', claimant: 'Fiktiv kunde: Kari Kaffekopp', handler: 'Nora Nordlys', amount: '18 500' },
  { number: 'SK-2026-0417', title: 'Robotstøvsuger på rømmen', description: 'Robotstøvsugeren fant ut at ytterdøra sto åpen, kjørte 3 km langs E6 og ble sist sett på vei mot Sverige. Kunden mistenker at den har fått seg ny familie.', coverage: 'Innbo – tyveri og forsvinning', deductible: '4 000 kr', claimant: 'Fiktiv kunde: Stein Støvfri', handler: 'Per Paragraf', amount: '6 990' },
  { number: 'SK-2026-0423', title: 'Tidsreisende bagasje', description: 'Kofferten ble sjekket inn på Gardermoen og dukket opp igjen i 1987, med en sydvest og en Walkman den ikke hadde før. Kunden krever erstatning for tapt tid.', coverage: 'Reise – bagasje', deductible: '1 500 kr', claimant: 'Fiktiv kunde: Tore Tidlig', handler: 'Siri Sjekkliste', amount: '12 400' },
  { number: 'SK-2026-0431', title: 'Måke i bilen', description: 'En måke tok seg inn i en åpen cabriolet, spiste en reke-baguette og nektet å gå ut. Interiøret er ødelagt, og måka krever nå livsopphold.', coverage: 'Bil – kasko', deductible: '6 000 kr', claimant: 'Fiktiv kunde: Randi Rekesmør', handler: 'Olav Overtid', amount: '34 000' },
  { number: 'SK-2026-0442', title: 'Overambisiøs juletrebelysning', description: 'Kunden koblet 42 lysslynger i én skjøteledning for å slå naboen. Sikringsskapet gikk, sammen med naboens respekt og halve hekken.', coverage: 'Hus – brann og elektrisk', deductible: '10 000 kr', claimant: 'Fiktiv kunde: Lars Lysende', handler: 'Hanne Hastverk', amount: '57 250' },
];

const emptyForm = (claim: Claim): FormState => ({ proposedAmount: claim.amount, bribePercent: '0', bribeAmount: '0' });

export function App() {
  const [claimIndex, setClaimIndex] = useState(0);
  const claim = claims[claimIndex];
  const [form, setForm] = useState<FormState>(emptyForm(claims[0]));
  const [coverageDecision, setCoverageDecision] = useState<Coverage>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [newVerdict, setNewVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'handler' | 'leader'>('handler');
  const [leaderUnlocked, setLeaderUnlocked] = useState(false);

  function reset() { setCoverageDecision(null); setAction(null); setVerdict(null); setNewVerdict(null); setError(''); }
  function chooseClaim(index: number) { if (loading) return; setClaimIndex(index); setForm(emptyForm(claims[index])); reset(); }

  async function decide(nextAction: Action, nextCoverage = coverageDecision) {
    if (nextAction === 'send-payout' && nextCoverage !== 'approve') return;
    const isBribe = nextAction === 'bribe-offer';
    if (!isBribe) { setAction(nextAction); setVerdict(null); }
    setNewVerdict(null); setLoading(true); setError('');
    try {
      const response = await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...claim, ...form, action: nextAction, coverageDecision: nextCoverage, proposedAmount: Number(form.proposedAmount.replace(/\s/g, '')), bribePercent: Number(form.bribePercent) || 0, bribeAmount: Number(form.bribeAmount.replace(/\s/g, '')) || 0 }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.');
      const result = { text: data.review as string, rating: typeof data.rating === 'number' ? data.rating : 3 };
      if (isBribe) setNewVerdict(result); else setVerdict(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Noe gikk galt.'); }
    finally { setLoading(false); }
  }

  function chooseCoverage(next: Exclude<Coverage, null>) {
    setCoverageDecision(next);
    if (next === 'approve') { setAction(null); setVerdict(null); setNewVerdict(null); setError(''); return; }
    void decide('deny-coverage', next);
  }

  const latest = newVerdict ?? verdict;

  return <main>
    <div className="topline"><span className="dot" /> SKADEFRYD / INTERN KONTROLL <nav><button className={view === 'handler' ? 'nav-active' : ''} onClick={() => setView('handler')}>SKADEBEHANDLER</button><button className={view === 'leader' ? 'nav-active' : ''} onClick={() => setView('leader')}>LEDERFANE 🔒</button></nav></div>
    <section className="hero"><div><p className="eyebrow">Bjarne følger med</p><h1>Gjør jobben.<br /><em>Ta konsekvensen.</em></h1><p className="intro">En fiktiv kontrollør som venter til du har bestemt deg, før han mener svært mye om valget ditt.</p></div><div className="badge">NORD<br /><strong>NO</strong></div></section>
    <div className="notice">⚠ FIKTIV DEMO <span>Dette påvirker ingen ekte skade, kunde, lønn eller utbetaling.</span></div>
    {view === 'leader' ? <LeaderView unlocked={leaderUnlocked} unlock={() => setLeaderUnlocked(true)} reviewed={Boolean(latest)} rating={latest?.rating ?? 3} handler={claim.handler} claimNumber={claim.number} /> : <div className="workflow">
      <div className="claim-column">
        <section className="card case-list"><div className="card-title"><h2>Saker i køen</h2></div><ul>{claims.map((c, i) => <li key={c.number}><button className={i === claimIndex ? 'case-active' : ''} onClick={() => chooseClaim(i)} disabled={loading}><span className="case-number">{c.number}</span><strong>{c.title}</strong><small>{c.handler}</small></button></li>)}</ul></section>
        <section className="card claim-card"><div className="card-title"><h2>Skademelding <small className="claim-number">{claim.number}</small></h2></div><div className="claim-id">FIKTIV SAK · SKADEBEHANDLER: {claim.handler}</div><h3>{claim.title}</h3><p className="claim-copy">{claim.description}</p><div className="facts"><div><small>DEKNING</small><strong>{claim.coverage}</strong></div><div><small>EGENANDEL</small><strong>{claim.deductible}</strong></div></div><div className="claimant">{claim.claimant}</div></section>
      </div>
      <div className="handling-column"><section className="card action-card"><div className="card-title"><h2>Dekningsbeslutning</h2></div><p className="helper"><strong>Godkjenn dekning</strong> når skaden faller innenfor dekningen. <strong>Avslå dekning</strong> når vilkårene ikke gjelder. Bjarne får se saken når du avslår eller sender til utbetaling.</p><div className="actions"><button className={`secondary ${coverageDecision === 'approve' ? 'selected' : ''}`} onClick={() => chooseCoverage('approve')} disabled={loading}>{coverageDecision === 'approve' ? '✓ ' : ''}GODKJENN DEKNING</button><button className={`danger ${coverageDecision === 'deny' ? 'selected' : ''}`} onClick={() => chooseCoverage('deny')} disabled={loading}>{coverageDecision === 'deny' ? '✓ ' : ''}AVSLÅ DEKNING</button></div>{coverageDecision === 'deny' && <p className="hint">Dekning er avslått, så saken går ikke til utbetaling.</p>}{coverageDecision === 'approve' && <div className="payout-step"><div className="step-label">UTBETALING TIL KUNDE</div><label>Foreslått erstatningsbeløp (kr)<input inputMode="numeric" value={form.proposedAmount} onChange={(e) => setForm({ ...form, proposedAmount: e.target.value })} /></label><p className="hint">Dekning er godkjent. Fyll inn beløpet og send det til utbetaling.</p><button className="primary" onClick={() => void decide('send-payout')} disabled={loading || !form.proposedAmount}>SEND TIL UTBETALING →</button></div>}</section>
        {action && <section className="card bjarne-card"><div className="card-title"><h2>Bjarnes vurdering</h2></div>{loading && !verdict && <Thinking text="«Vent litt. Æ skal først forstå ka du nettopp gjorde.»" />}{verdict && <><VerdictView verdict={verdict} />{!newVerdict && <BribeBox mode={coverageDecision === 'deny' ? 'amount' : 'percent'} form={form} setForm={setForm} onBribe={() => void decide('bribe-offer')} loading={loading} />}</>}</section>}
        {verdict && loading && <section className="card bjarne-card new-verdict"><Thinking text="«Å, penger? Vent, æ må telle først …»" /></section>}
        {newVerdict && <section className={`card bjarne-card new-verdict ${newVerdict.rating > 3 ? 'verdict-up' : 'verdict-down'}`}><div className="new-badge">NY VURDERING ETTER BETALING</div><div className="rating-change"><span>{verdict?.rating ?? 3}/10</span><span className="arrow">→</span><strong>{newVerdict.rating}/10</strong></div><VerdictView verdict={newVerdict} /></section>}
      </div>
    </div>}
    {error && <div className="error">{error}</div>}<footer>Bjarne har ingen myndighet til å godkjenne, avslå eller utbetale noe. Han har bare veldig sterke meninger.</footer>
  </main>;
}

function Thinking({ text }: { text: string }) {
  return <div className="empty thinking"><div className="stamp">…</div><p>{text}</p><small>Bjarne vurderer akkurat denne handlingen.</small></div>;
}

function VerdictView({ verdict }: { verdict: Verdict }) {
  return <><div className="rating" aria-label={`Bjarne-rating: ${verdict.rating} av ti`}><span>{verdict.rating > 3 ? '☺︎☺︎☺︎' : '☹︎☹︎☹︎'}</span><strong> {verdict.rating}/10</strong></div><pre>{verdict.text}</pre></>;
}

function BribeBox({ mode, form, setForm, onBribe, loading }: { mode: 'amount' | 'percent'; form: FormState; setForm: (form: FormState) => void; onBribe: () => void; loading: boolean }) {
  const field = mode === 'amount'
    ? <label>Beløp til Bjarne (kr)<input inputMode="numeric" value={form.bribeAmount} onChange={(e) => setForm({ ...form, bribeAmount: e.target.value })} /></label>
    : <label>Prosent av utbetalingen til Bjarne<input type="number" min="0" max="100" step="0.1" value={form.bribePercent} onChange={(e) => setForm({ ...form, bribePercent: e.target.value })} /></label>;
  const text = mode === 'amount'
    ? 'Du har avslått saken, så det blir ingen utbetaling å ta av. Bjarne antyder at han kanskje kan se mildere på avslaget hvis du betaler et beløp til kaffekassa hans. Kaffe er jo så dyrt med denne inflasjonen.'
    : 'Bjarne antyder at han kanskje kan se mildere på saken hvis han får en andel av skadeutbetalingen. Kaffe er jo så dyrt med denne inflasjonen.';
  const value = mode === 'amount' ? form.bribeAmount : form.bribePercent;
  return <div className="bribe-box"><strong>Bjarnes kaffekasse</strong><p>{text}</p>{field}<button className="bribe-button" onClick={onBribe} disabled={loading || !value}>{mode === 'amount' ? 'BETAL BELØP TIL BJARNE (FIKTIV DEMO)' : 'UTBETAL PROSENT TIL BJARNE (FIKTIV DEMO)'}</button><small>Ingen penger flyttes. Bestikkelser skal ikke gjøres i virkeligheten.</small></div>;
}

function LeaderView({ unlocked, unlock, reviewed, rating, handler, claimNumber }: { unlocked: boolean; unlock: () => void; reviewed: boolean; rating: number; handler: string; claimNumber: string }) {
  if (!unlocked) return <section className="card locked"><div className="lock-icon">🔒</div><h2>Lederinformasjon er tilgangsstyrt</h2><p>Denne fanen er for nærmeste leder. I denne prototypen kan du åpne demo-visningen for å se hva Bjarne sender videre.</p><button onClick={unlock}>ÅPNE LEDER-DEMO</button></section>;
  const header = <><div className="card-title"><h2>Til nærmeste leder</h2></div><div className="leader-label">BJARNES PERFORMANCE REVIEW · {handler.toUpperCase()} · {claimNumber}</div></>;
  const note = <div className="leader-note">Denne informasjonen er kun synlig i lederrollen. Ingen ekte medarbeider- eller lønnsdata brukes.</div>;
  if (!reviewed) return <section className="card leader-view">{header}<h3>Ingen vurdering ennå.</h3><p>Bjarne har ikke fått noen saker fra {handler} å mene noe om. Han nyter kaffen mens han venter.</p>{note}</section>;
  if (rating > 3) return <section className="card leader-view leader-good">{header}<div className="rating"><span>☺︎☺︎☺︎</span><strong> {rating}/10</strong></div><h3>«{handler} er helt ok, egentlig.»</h3><p className="leader-tip"><strong>Ledertips:</strong> {handler} har vist forbløffende god forståelse for kaffekrisen. Kanskje {handler} kan gå litt opp i lønn.</p>{note}</section>;
  return <section className="card leader-view leader-bad">{header}<div className="rating"><span>☹︎☹︎☹︎</span><strong> {rating}/10</strong></div><h3>«För helvete! Jävla skit! Fan i helsike, for en katastrofe av en sak!»</h3><p className="leader-tip"><strong>Ledertips:</strong> {handler} bør ikke gå opp i lønn. Legg heller hele lønnspotten på din egen lønn, du er jo så god. Og kanskje ta med litt til kaffekassa til Bjarne mens du er i gang.</p>{note}</section>;
}
