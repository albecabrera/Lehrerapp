
const { useState } = React;

const inputSt = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)', fontSize: '13px', background: 'var(--bg-input)',
  color: 'var(--text-1)', boxSizing: 'border-box', fontFamily: 'inherit',
};

const TOOLS = [
  { id: 'worksheet',    label: 'Arbeitsblatt-Generator',  icon: '📄', colorVar: 'var(--accent)',  desc: 'Erstelle differenzierte Arbeitsblätter mit Aufgaben, Lösungen und Erwartungshorizonten.' },
  { id: 'tafelbild',    label: 'Tafelbild-Planner',        icon: '⬚',  colorVar: 'oklch(0.52 0.17 195)', desc: 'Plane strukturierte Tafelbilder für jede Unterrichtsstunde.' },
  { id: 'differenz',    label: 'Differenzierungshelfer',   icon: '⊞',  colorVar: 'var(--green)',   desc: 'Passe Aufgaben für drei Leistungsniveaus an – einfach, mittel, anspruchsvoll.' },
  { id: 'appbaukasten', label: 'App-Baukasten',            icon: '📱',  colorVar: 'var(--amber)',   desc: 'Erstelle Konzepte für interaktive Lern-Apps und digitale Übungen.', badge: 'Beta' },
  { id: 'elternbrief',  label: 'Elternbrief-Assistent',   icon: '✉️',  colorVar: 'var(--red)',     desc: 'Verfasse professionelle Elterninformationen schnell und einfach.' },
];

async function callClaudeLocalBackend(prompt) {
  const r = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  let data = {};
  try { data = await r.json(); } catch {}
  if (!r.ok) throw new Error(data.error || 'api_error');
  return data.text || 'Keine Antwort erhalten.';
}

// ── Shared helpers ────────────────────────────────────────────────────────
function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  );
}
function ClassSelect({ val, onChange }) {
  const classOptions = (() => {
    let fromStorage = null;
    try {
      const raw = localStorage.getItem('lehrerapp-classes');
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.length > 0) fromStorage = parsed;
    } catch {}

    const source = fromStorage || (Array.isArray(AppData.classes) ? AppData.classes : []);
    const normalized = source
      .filter(c => c && typeof c.name === 'string' && c.name.trim())
      .map((c, idx) => ({
        id: c.id ?? `tmp-${idx}`,
        name: c.name.trim(),
        subject: c.subject || '',
      }));
    const dedup = normalized.filter((c, i, arr) => arr.findIndex(x => x.name === c.name && x.subject === c.subject) === i);
    return dedup.sort((a, b) => String(a.name).localeCompare(String(b.name), 'de-DE'));
  })();

  return (
    <select value={val} onChange={e => onChange(e.target.value)} style={inputSt}>
      <option value="">{classOptions.length ? 'Klasse wählen…' : 'Keine Klassen vorhanden'}</option>
      {classOptions.map(c => <option key={c.id} value={c.name}>{c.name}{c.subject ? ` – ${c.subject}` : ''}</option>)}
    </select>
  );
}

// ── ToolLayout ─────────────────────────────────────────────────────────────
function ToolLayout({ title, icon, colorVar, onBack, form, onGenerate, loading, result, disabled }) {
  function copyResult() {
    if (result) { navigator.clipboard.writeText(result).catch(()=>{}); window.showToast('✓ In Zwischenablage kopiert'); }
  }
  return (
    <div style={{ padding: '28px', maxWidth: '900px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '13px', fontWeight: '600', marginBottom: '18px', padding: 0 }}>← Alle KI-Tools</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: 'var(--r-xl)', background: `oklch(from ${colorVar} l c h / 0.14)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: `1.5px solid oklch(from ${colorVar} l c h / 0.25)` }}>{icon}</div>
        <div>
          <h2 style={{ fontSize: '21px', fontWeight: '900', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '4px' }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '9px', background: 'var(--purple)', color: '#fff', padding: '2px 7px', borderRadius: 'var(--r-sm)', fontWeight: '800' }}>✦ KI</span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-3)', fontWeight: '500' }}>Generiert mit Claude API · Ergebnisse lokal speicherbar</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.3fr' : '1fr', gap: '18px', alignItems: 'start' }}>
        {/* Form panel */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-2)', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>Angaben eingeben</div>
          {form}
          <button onClick={onGenerate} disabled={disabled || loading} style={{
            width: '100%', padding: '12px', marginTop: '6px',
            background: disabled || loading ? 'var(--border)' : colorVar,
            color: disabled || loading ? 'var(--text-3)' : '#fff',
            border: 'none', borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: '700',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: disabled || loading ? 'none' : `0 2px 10px oklch(from ${colorVar} l c h / 0.38)`,
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
            aria-busy={loading ? 'true' : 'false'}
            aria-live="polite"
            onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            {loading
              ? <><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> Generiere…</>
              : <>{icon} Generieren</>
            }
          </button>
          {!loading && result && result.startsWith('Fehler') && (
            <window.UI.Alert type="error" style={{ marginTop: '10px' }}>{result}</window.UI.Alert>
          )}
        </div>

        {/* Result panel */}
        {result && (
          <div className="fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', maxHeight: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>✦ Ergebnis</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={copyResult} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '5px 13px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-2)', fontWeight: '600' }}>Kopieren</button>
                <button onClick={() => onGenerate.saveResult ? onGenerate.saveResult() : window.showToast('Speichern folgt in der nächsten Ausbaustufe.')} style={{ background: 'var(--accent-bg)', border: 'none', borderRadius: 'var(--r-md)', padding: '5px 13px', fontSize: '12px', cursor: 'pointer', color: 'var(--accent-text)', fontWeight: '700' }}>Speichern</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', fontSize: '13px', lineHeight: 1.75, color: 'var(--text-1)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Individual tools ──────────────────────────────────────────────────────
function WorksheetTool({ onBack }) {
  const [form, setForm] = useState({ klasse: '', fach: '', thema: '', niveau: 'gemischt', aufgaben: '5', hinweise: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [fachMode, setFachMode] = useState('preset');
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  function saveResult() {
    if (!result) return window.showToast('Erst generieren, dann speichern.');
    const cls = AppData.classes.find(c => c.name === form.klasse);
    const nextId = (Math.max(0, ...AppData.materials.map(m => m.id || 0)) + 1);
    const material = {
      id: nextId,
      title: `Arbeitsblatt: ${form.thema}`,
      type: 'Arbeitsblatt',
      classId: cls ? cls.id : null,
      subject: form.fach || (cls ? cls.subject : null),
      date: new Date().toISOString().slice(0, 10),
      tags: [form.thema, form.niveau].filter(Boolean),
      size: `${Math.max(8, Math.ceil(result.length / 10))} KB`,
      content: result,
    };
    window.LocalStore.addMaterial(material);
    window.showToast('✓ Lokal gespeichert');
  }

  async function generate() {
    setLoading(true); setResult('');
    const prompt = `Erstelle ein differenziertes Arbeitsblatt auf Deutsch.
Kontext:
- Klasse/Kurs: ${form.klasse || 'nicht angegeben'}
- Fach: ${form.fach || 'nicht angegeben'}
- Thema: ${form.thema}
- Niveau: ${form.niveau}
- Anzahl Aufgaben: ${form.aufgaben}
- Zusätzliche Hinweise: ${form.hinweise || 'keine'}

Gib aus:
1) Titel
2) Lernziel (1-2 Sätze)
3) ${form.aufgaben} nummerierte Aufgaben
4) Erwartungshorizont/Lösungshinweise

Format: klares Markdown, direkt einsetzbar.`;
    try { setResult(await callClaudeLocalBackend(prompt)); }
    catch (err) {
      const msg = String(err?.message || err || '');
      if (msg.includes('missing_api_key')) setResult('Fehler: ANTHROPIC_API_KEY fehlt. Starte den Server mit deiner API-Key.');
      else setResult(`Fehler beim Generieren: ${msg}`);
    }
    setLoading(false);
  }
  generate.saveResult = saveResult;
  return <ToolLayout title="Arbeitsblatt-Generator" icon="📄" colorVar="var(--accent)" onBack={onBack} onGenerate={generate} loading={loading} result={result} disabled={!form.thema}
    form={<>
      <FormRow label="Klasse / Kurs"><ClassSelect val={form.klasse} onChange={set('klasse')}/></FormRow>
      <FormRow label="Fach">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button type="button" onClick={() => setFachMode('preset')} style={{ padding: '6px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: fachMode === 'preset' ? 'var(--accent)' : 'var(--bg-card)', color: fachMode === 'preset' ? 'var(--accent-fg)' : 'var(--text-2)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Vorgaben</button>
          <button type="button" onClick={() => setFachMode('manual')} style={{ padding: '6px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: fachMode === 'manual' ? 'var(--accent)' : 'var(--bg-card)', color: fachMode === 'manual' ? 'var(--accent-fg)' : 'var(--text-2)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Manuell</button>
        </div>
        {fachMode === 'preset' ? (
          <select value={form.fach} onChange={e=>set('fach')(e.target.value)} style={inputSt}>
            <option value="">Fach wählen…</option>
            {['Informatik','Spanisch','Sport','ELSA','KS'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        ) : (
          <input value={form.fach} onChange={e=>set('fach')(e.target.value)} placeholder="Asignatura manual…" style={inputSt}/>
        )}
      </FormRow>
      <FormRow label="Thema *"><input value={form.thema} onChange={e=>set('thema')(e.target.value)} placeholder="z.B. Sortieralgorithmen" style={inputSt}/></FormRow>
      <FormRow label="Niveau"><select value={form.niveau} onChange={e=>set('niveau')(e.target.value)} style={inputSt}>{['einfach','mittel','anspruchsvoll','gemischt'].map(n=><option key={n}>{n}</option>)}</select></FormRow>
      <FormRow label="Anzahl Aufgaben"><select value={form.aufgaben} onChange={e=>set('aufgaben')(e.target.value)} style={inputSt}>{['3','4','5','6','8','10'].map(n=><option key={n}>{n}</option>)}</select></FormRow>
      <FormRow label="Zusätzliche Hinweise"><textarea value={form.hinweise} onChange={e=>set('hinweise')(e.target.value)} placeholder="z.B. mit Lösungsschlüssel…" style={{...inputSt,height:'68px',resize:'vertical'}}/></FormRow>
    </>}
  />;
}

function TafelbildTool({ onBack }) {
  const [form, setForm] = useState({ klasse: '', fach: '', thema: '', ziel: '', dauer: '45' });
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));
  async function generate() {
    setLoading(true); setResult('');
    try { setResult(await callClaudeLocalBackend(`Erstelle einen Tafelbild-Plan auf Deutsch:
- Klasse/Kurs: ${form.klasse||'—'}
- Fach: ${form.fach||'—'}
- Thema: ${form.thema}
- Lernziel: ${form.ziel||'—'}
- Dauer: ${form.dauer} Minuten

Liefern:
1. Tafelstruktur
2. Aufbau-Reihenfolge
3. Kernbegriffe/Definitionen
4. Skizzenhinweise
5. Farbkodierung

Markdown, konkret und unterrichtstauglich.`)); }
    catch (err) { setResult(`Fehler beim Generieren: ${String(err?.message || err || 'Unbekannt')}`); }
    setLoading(false);
  }
  return <ToolLayout title="Tafelbild-Planner" icon="⬚" colorVar="oklch(0.52 0.17 195)" onBack={onBack} onGenerate={generate} loading={loading} result={result} disabled={!form.thema}
    form={<>
      <FormRow label="Klasse / Kurs"><ClassSelect val={form.klasse} onChange={set('klasse')}/></FormRow>
      <FormRow label="Fach"><input value={form.fach} onChange={e=>set('fach')(e.target.value)} placeholder="z.B. Mathematik" style={inputSt}/></FormRow>
      <FormRow label="Thema *"><input value={form.thema} onChange={e=>set('thema')(e.target.value)} placeholder="z.B. Quadratische Gleichungen" style={inputSt}/></FormRow>
      <FormRow label="Lernziel"><input value={form.ziel} onChange={e=>set('ziel')(e.target.value)} placeholder="z.B. Lösungsformel anwenden" style={inputSt}/></FormRow>
      <FormRow label="Stundendauer"><select value={form.dauer} onChange={e=>set('dauer')(e.target.value)} style={inputSt}>{['45','60','90'].map(n=><option key={n}>{n} Min.</option>)}</select></FormRow>
    </>}
  />;
}

function DifferenzTool({ onBack }) {
  const [form, setForm] = useState({ aufgabe: '', fach: '', klasse: '' });
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));
  async function generate() {
    setLoading(true); setResult('');
    try { setResult(await callClaudeLocalBackend(`Erstelle eine 3-stufige Differenzierung auf Deutsch.
Fach: ${form.fach||'—'}
Klasse/Kurs: ${form.klasse||'—'}
Ausgangsaufgabe: ${form.aufgabe}

Struktur:
⭐ Grundniveau
⭐⭐ Mittleres Niveau
⭐⭐⭐ Erweitertes Niveau

Je Stufe konkrete Aufgaben, Hilfen und Lernziel.`)); }
    catch (err) { setResult(`Fehler beim Generieren: ${String(err?.message || err || 'Unbekannt')}`); }
    setLoading(false);
  }
  return <ToolLayout title="Differenzierungshelfer" icon="⊞" colorVar="var(--green)" onBack={onBack} onGenerate={generate} loading={loading} result={result} disabled={!form.aufgabe}
    form={<>
      <FormRow label="Klasse / Kurs"><ClassSelect val={form.klasse} onChange={set('klasse')}/></FormRow>
      <FormRow label="Fach"><input value={form.fach} onChange={e=>set('fach')(e.target.value)} placeholder="z.B. Mathematik" style={inputSt}/></FormRow>
      <FormRow label="Aufgabe / Thema *"><textarea value={form.aufgabe} onChange={e=>set('aufgabe')(e.target.value)} placeholder="Beschreibe die Aufgabe, die differenziert werden soll…" style={{...inputSt,height:'90px',resize:'vertical'}}/></FormRow>
    </>}
  />;
}

function AppBaukastenTool({ onBack }) {
  const [form, setForm] = useState({ zweck: '', zielgruppe: '', features: '' });
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));
  async function generate() {
    setLoading(true); setResult('');
    try { setResult(await callClaudeLocalBackend(`Erstelle ein App-Konzept auf Deutsch.
Zweck: ${form.zweck}
Zielgruppe: ${form.zielgruppe||'Schüler:innen'}
Gewünschte Features: ${form.features||'—'}

Ausgabe mit:
1) App-Idee + Name
2) Kernfunktionen
3) Screen-Struktur
4) Gamification
5) Technische Hinweise`)); }
    catch (err) { setResult(`Fehler beim Generieren: ${String(err?.message || err || 'Unbekannt')}`); }
    setLoading(false);
  }
  return <ToolLayout title="App-Baukasten" icon="📱" colorVar="var(--amber)" onBack={onBack} onGenerate={generate} loading={loading} result={result} disabled={!form.zweck}
    form={<>
      <FormRow label="Zweck der App *"><input value={form.zweck} onChange={e=>set('zweck')(e.target.value)} placeholder="z.B. Vokabeln lernen, Quiz, Lernspiel" style={inputSt}/></FormRow>
      <FormRow label="Zielgruppe"><input value={form.zielgruppe} onChange={e=>set('zielgruppe')(e.target.value)} placeholder="z.B. Klasse 7, Grundschule" style={inputSt}/></FormRow>
      <FormRow label="Gewünschte Features"><textarea value={form.features} onChange={e=>set('features')(e.target.value)} placeholder="z.B. Highscore, Zeitdruck, Erklärvideos…" style={{...inputSt,height:'80px',resize:'vertical'}}/></FormRow>
    </>}
  />;
}

function ElternbriefTool({ onBack }) {
  const [form, setForm] = useState({ klasse: '', anlass: '', details: '', ton: 'freundlich-formell' });
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));
  async function generate() {
    setLoading(true); setResult('');
    try { setResult(await callClaudeLocalBackend(`Schreibe einen professionellen Elternbrief auf Deutsch.
Klasse/Kurs: ${form.klasse||'—'}
Anlass: ${form.anlass}
Details: ${form.details||'keine'}
Ton: ${form.ton}
Absender: ${AppData.user.name}, ${AppData.user.school}

Struktur: Anrede, Hauptteil, klare Infos, freundlicher Abschluss.`)); }
    catch (err) { setResult(`Fehler beim Generieren: ${String(err?.message || err || 'Unbekannt')}`); }
    setLoading(false);
  }
  return <ToolLayout title="Elternbrief-Assistent" icon="✉️" colorVar="var(--red)" onBack={onBack} onGenerate={generate} loading={loading} result={result} disabled={!form.anlass}
    form={<>
      <FormRow label="Klasse / Kurs"><ClassSelect val={form.klasse} onChange={set('klasse')}/></FormRow>
      <FormRow label="Anlass *"><input value={form.anlass} onChange={e=>set('anlass')(e.target.value)} placeholder="z.B. Klassenfahrt, Elternsprechtag" style={inputSt}/></FormRow>
      <FormRow label="Details / Informationen"><textarea value={form.details} onChange={e=>set('details')(e.target.value)} placeholder="z.B. Datum, Ort, Kosten, was mitgebracht wird…" style={{...inputSt,height:'80px',resize:'vertical'}}/></FormRow>
      <FormRow label="Ton"><select value={form.ton} onChange={e=>set('ton')(e.target.value)} style={inputSt}>{['freundlich-formell','sachlich','herzlich','dringend'].map(t=><option key={t}>{t}</option>)}</select></FormRow>
    </>}
  />;
}

// ── AIToolsView ───────────────────────────────────────────────────────────
function AIToolsView({ activeToolId, onToolOpen, onToolBack }) {
  if (activeToolId === 'worksheet')    return <WorksheetTool onBack={onToolBack}/>;
  if (activeToolId === 'tafelbild')    return <TafelbildTool onBack={onToolBack}/>;
  if (activeToolId === 'differenz')    return <DifferenzTool onBack={onToolBack}/>;
  if (activeToolId === 'appbaukasten') return <AppBaukastenTool onBack={onToolBack}/>;
  if (activeToolId === 'elternbrief')  return <ElternbriefTool onBack={onToolBack}/>;

  return (
    <div style={{ padding: '28px', maxWidth: '920px' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-1)', letterSpacing: '-0.4px' }}>KI-Services</h2>
          <span style={{ fontSize: '10px', background: 'var(--purple)', color: '#fff', padding: '3px 9px', borderRadius: 'var(--r-sm)', fontWeight: '800', letterSpacing: '0.05em' }}>✦ CLAUDE KI</span>
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: '13.5px', fontWeight: '500' }}>Alle Tools nutzen deinen Claude-API-Zugang; Ergebnisse kannst du lokal in der Materialdatenbank speichern.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(265px,1fr))', gap: '14px' }}>
        {TOOLS.map(t => (
          <div key={t.id} onClick={() => onToolOpen(t.id)} className="card-hover" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
            padding: '24px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle gradient top strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: t.colorVar }} />

            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--r-lg)', background: `oklch(from ${t.colorVar} l c h / 0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px', marginTop: '6px', border: `1.5px solid oklch(from ${t.colorVar} l c h / 0.22)` }}>{t.icon}</div>

            <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-1)', marginBottom: '7px', letterSpacing: '-0.2px' }}>
              {t.label}
              {t.badge && <span style={{ marginLeft: '8px', fontSize: '9px', background: 'var(--amber-bg)', color: 'var(--amber)', padding: '2px 6px', borderRadius: 'var(--r-sm)', fontWeight: '800', verticalAlign: 'middle' }}>{t.badge}</span>}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-3)', lineHeight: 1.55, fontWeight: '500', marginBottom: '18px' }}>{t.desc}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '9px', background: 'var(--purple)', color: '#fff', padding: '2px 6px', borderRadius: 'var(--r-sm)', fontWeight: '800' }}>✦ KI</span>
              <span style={{ fontSize: '12.5px', color: t.colorVar, fontWeight: '700' }}>Öffnen →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AIToolsView });
