import { useEffect, useRef, useState } from 'react';
import { BackupCard, Chips, Empty, Shell, useNow } from '../../shared/ui.jsx';
import { uid, useStore } from '../../shared/store.js';
import { duration, fmtTime, isoDate } from '../../shared/util.js';

const P = 'brunstoy:';
const RATE = 22050;
const SECONDS = 30;
const COLORS = [
  { value: 'brown', label: 'Brun' }, { value: 'pink', label: 'Rosa' }, { value: 'white', label: 'Hvit' }, { value: 'rain', label: 'Regn' },
];

// Lager støy som WAV i minnet. <audio> (ikke Web Audio) fordi iOS da spiller selv med lydløs-bryteren på
// og fortsetter når skjermen låses.
function makeNoise(kind) {
  const n = RATE * SECONDS;
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0, env = 0.5;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    let v;
    if (kind === 'white') v = w * 0.35;
    else if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; v = last * 3.2; }
    else {
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      v = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      if (kind === 'rain') {
        if (i % 2205 === 0) env = 0.35 + Math.random() * 0.3;
        v = (v - last * 0.9) * env * 1.6; last = v; // grov høypass + sakte svingning
        if (Math.random() < 0.0004) v += (Math.random() * 2 - 1) * 0.6; // dråper
      }
    }
    out[i] = v;
  }
  // Krysstoning av endene så loopen ikke klikker.
  const fade = RATE / 2;
  for (let i = 0; i < fade; i++) { const t = i / fade; out[i] = out[i] * t + out[n - fade + i] * (1 - t); }
  return wav(out.subarray(0, n - fade));
}
function makeBell() {
  const n = RATE * 3, out = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / RATE; out[i] = Math.exp(-t * 2.2) * (Math.sin(2 * Math.PI * 660 * t) * 0.5 + Math.sin(2 * Math.PI * 990 * t) * 0.25 + Math.sin(2 * Math.PI * 1320 * t) * 0.12); }
  return wav(out);
}
function wav(samples) {
  const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
  const s = (o, str) => [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  s(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); s(8, 'WAVE'); s(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, RATE, true);
  v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

export default function App() {
  const [color, setColor] = useStore(P + 'color', 'brown');
  const [minutes, setMinutes] = useStore(P + 'minutes', 25);
  const [log, setLog] = useStore(P + 'log', []);
  const [task, setTask] = useState('');
  const [session, setSession] = useState(null); // { start, end, task }
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState('fokus');
  const audio = useRef(null), bell = useRef(null), urls = useRef({}), lock = useRef(null);
  const now = useNow(1000);

  const urlFor = (k) => (urls.current[k] ??= makeNoise(k));

  const play = (k = color) => {
    if (!audio.current) { audio.current = new Audio(); audio.current.loop = true; }
    audio.current.src = urlFor(k);
    setPlaying(true);
    audio.current.play().catch(() => setPlaying(false));
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: `${COLORS.find((c) => c.value === k).label} støy`, artist: 'Brunstøy' });
  };
  const stop = () => { audio.current?.pause(); setPlaying(false); };
  const pick = (k) => { setColor(k); if (playing) play(k); };

  const startSession = async () => {
    setSession({ id: uid(), start: Date.now(), end: minutes ? Date.now() + minutes * 60000 : null, task: task.trim() || 'Fokus' });
    if (!bell.current) { bell.current = new Audio(makeBell()); bell.current.load(); }
    if (!playing) play();
    try { lock.current = await navigator.wakeLock?.request('screen'); } catch { /* ikke støttet */ }
  };
  const endSession = (completed) => {
    if (session) setLog((l) => [{ ...session, stop: Date.now(), completed }, ...l].slice(0, 500));
    setSession(null); stop();
    lock.current?.release?.(); lock.current = null;
  };

  useEffect(() => {
    if (session?.end && now >= session.end) { bell.current?.play().catch(() => {}); navigator.vibrate?.(300); endSession(true); }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { audio.current?.pause(); Object.values(urls.current).forEach(URL.revokeObjectURL); }, []);

  const todayMs = log.filter((l) => isoDate(l.start) === isoDate(new Date())).reduce((a, l) => a + (l.stop - l.start), 0);

  if (session) {
    const elapsed = now - session.start;
    const left = session.end ? session.end - now : null;
    return (
      <Shell title="Brunstøy">
        <div style={{ minHeight: '72dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <p className="muted">Jeg jobber med</p>
          <div className="big" style={{ margin: '8px 0 32px', wordBreak: 'break-word' }}>{session.task}</div>
          <div className="huge mono accent" style={{ fontSize: 'clamp(3.5rem, 20vw, 6rem)' }}>{left != null ? duration(left) : duration(elapsed)}</div>
          <p className="muted" style={{ marginTop: 8 }}>{left != null ? 'igjen' : 'så langt'}</p>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', margin: '28px auto', animation: 'pulse 4s ease-in-out infinite' }} />
          <p className="muted small" style={{ marginBottom: 20 }}>Du er ikke alene. Andre sitter og jobber akkurat nå, de også.</p>
          <div className="grid2">
            <button className="btn" onClick={() => (playing ? stop() : play())}>{playing ? 'Stopp lyd' : 'Spill lyd'}</button>
            <button className="btn primary" onClick={() => endSession(left == null || left <= 0)}>Ferdig</button>
          </div>
        </div>
        <style>{'@keyframes pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(2.2);opacity:1}}'}</style>
      </Shell>
    );
  }

  return (
    <Shell title="Brunstøy" tabs={[{ id: 'fokus', icon: '●', label: 'Fokus' }, { id: 'logg', icon: '▤', label: 'Logg' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'fokus' && <>
        <div className="card">
          <h2>Lyd</h2>
          <Chips options={COLORS} value={color} onChange={pick} />
          <button className={'btn block ' + (playing ? '' : 'primary')} style={{ marginTop: 12, minHeight: 56 }} onClick={() => (playing ? stop() : play())}>
            {playing ? '■ Stopp' : '▶ Spill'}
          </button>
          <p className="muted small" style={{ marginTop: 8 }}>Volum med knappene på siden. Spiller selv med lydløs-bryteren på.</p>
        </div>
        <div className="card">
          <h2>Kroppsdobbel-økt</h2>
          <input className="input" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Hva skal du gjøre? Én ting." style={{ marginBottom: 10 }} />
          <Chips options={[{ value: 15, label: '15 min' }, { value: 25, label: '25 min' }, { value: 50, label: '50 min' }, { value: 90, label: '90 min' }, { value: 0, label: 'Åpen' }]} value={minutes} onChange={setMinutes} />
          <button className="btn primary block" style={{ marginTop: 12, minHeight: 56 }} onClick={startSession}>Start</button>
        </div>
        <p className="muted small">I dag: {duration(todayMs)} fokus.</p>
      </>}
      {tab === 'logg' && (
        <div className="card">
          {log.length === 0 ? <Empty title="Ingen økter ennå" /> : (
            <ul className="list">{log.slice(0, 50).map((l) => (
              <li key={l.id}><span className="dot" style={{ background: l.completed ? 'var(--accent)' : 'var(--line)' }} />
                <span className="grow">{l.task}<div className="muted small">{new Date(l.start).toLocaleDateString('nb-NO')} {fmtTime(l.start)}</div></span>
                <span className="mono small">{duration(l.stop - l.start)}</span></li>
            ))}</ul>
          )}
        </div>
      )}
      {tab === 'mer' && <>
        <div className="card small">
          <h2>Hvorfor brun støy?</h2>
          <p className="muted">Brun støy har mer bass enn hvit – mer som foss eller fly enn radiosus. Mange med ADHD sier den demper den indre støyen. Forskningen er tynn; det som virker for deg, virker.</p>
        </div>
        <BackupCard prefix={P} appName="Brunstøy" />
      </>}
    </Shell>
  );
}
