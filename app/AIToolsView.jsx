
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
  return (
    <select value={val} onChange={e => onChange(e.target.value)} style={inputSt}>
      <option value="">Klasse wählen…</option>
      {AppData.classes.map(c => <option key={c.id} value={c.name}>{c.name} – {c.subject}</option>)}
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
            <span style={{ fontSize: '12.5px', color: 'var(--text-3)', fontWeight: '500' }}>Generiert von Claude KI · mit deinem Konto verbunden</span>
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
            onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            {loading
              ? <><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> Generiere…</>
              : <>{icon} Generieren</>
            }
          </button>
        </div>

        {/* Result panel */}
        {result && (
          <div className="fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', maxHeight: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>✦ Ergebnis</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={copyResult} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '5px 13px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-2)', fontWeight: '600' }}>Kopieren</button>
                <button onClick={() => window.showToast('✓ In Materialdatenbank gespeichert')} style={{ background: 'var(--accent-bg)', border: 'none', borderRadius: 'var(--r-md)', padding: '5px 13px', fontSize: '12px', cursor: 'pointer', color: 'var(--accent-text)', fontWeight: '700' }}>Speichern</button>
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
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  async function generate() {
    setLoading(true); setResult('');
    const prompt = `Erstelle ein Arbeitsblatt:
- Klasse: ${form.klasse||'nicht angegeben'} | Fach: ${form.fach||'nicht angegeben'}
- Thema: ${form.thema} | Niveau: ${form.niveau} | Aufgaben: ${form.aufgaben}
- Hinweise: ${form.hinweise||'keine'}

Erstelle ein strukturiertes Arbeitsblatt mit:
1. Titel und Klassenangabe
2. Lernziel (1–2 Sätze)
3. ${form.aufgaben} nummerierte Aufgaben mit klaren Anweisungen
4. Erwartungshorizont / Lösungshinweise

Formatiere übersichtlich mit Markdown.`;
    try { setResult(await window.claude.complete(prompt)); }
    catch { setResult('Fehler beim Generieren. Bitte erneut versuchen.'); }
    setLoading(false);
  }
  return <ToolLayout title="Arbeitsblatt-Generator" icon="📄" colorVar="var(--accent)" onBack={onBack} onGenerate={generate} loading={loading} result={result} disabled={!form.thema}
    form={<>
      <FormRow label="Klasse / Kurs"><ClassSelect val={form.klasse} onChange={set('klasse')}/></FormRow>
      <FormRow label="Fach"><input value={form.fach} onChange={e=>set('fach')(e.target.value)} placeholder="z.B. Informatik" style={inputSt}/></FormRow>
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
    try { setResult(await window.claude.complete(`Erstelle einen Tafelbild-Plan:\n- Klasse: ${form.klasse||'—'} | Fach: ${form.fach||'—'}\n- Thema: ${form.thema} | Lernziel: ${form.ziel||'—'} | Dauer: ${form.dauer} Min.\n\nErstelle:\n1. **Tafelstruktur** (Spalten/Bereiche)\n2. **Aufbau-Reihenfolge** (was wird wann angeschrieben)\n3. **Kernbegriffe und Definitionen**\n4. **Skizzen/Diagramme** (textlich beschrieben)\n5. **Farbkodierungs-Vorschlag**\n\nFormatiere klar mit Markdown.`)); }
    catch { setResult('Fehler beim Generieren.'); }
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
    try { setResult(await window.claude.complete(`Erstelle eine dreistufige Differenzierung:\n- Fach: ${form.fach||'—'} | Klasse: ${form.klasse||'—'}\n- Aufgabe/Thema: ${form.aufgabe}\n\n## ⭐ Grundniveau (mit Unterstützung)\nVereinfachte Version mit Scaffolding und Hilfestellungen.\n\n## ⭐⭐ Mittleres Niveau\nStandardaufgabe für alle SuS.\n\n## ⭐⭐⭐ Erweitertes Niveau\nAnspruchsvolle Transfer- oder Kreativaufgabe.\n\nFormatiere jede Stufe klar mit Markdown.`)); }
    catch { setResult('Fehler beim Generieren.'); }
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
    try { setResult(await window.claude.complete(`Erstelle ein Konzept für eine digitale Lern-App:\n- Zweck: ${form.zweck} | Zielgruppe: ${form.zielgruppe||'Schüler:innen'}\n- Features: ${form.features||'—'}\n\nErstelle:\n1. **App-Konzept** (Name, Beschreibung, Lernziel)\n2. **Hauptfunktionen** (5–7 konkrete Features)\n3. **Screen-Aufbau** (welche Ansichten gibt es)\n4. **Gamification-Elemente**\n5. **Technische Umsetzungshinweise**\n\nFormatiere strukturiert mit Markdown.`)); }
    catch { setResult('Fehler beim Generieren.'); }
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
    try { setResult(await window.claude.complete(`Verfasse einen Elternbrief:\n- Klasse: ${form.klasse||'—'} | Anlass: ${form.anlass}\n- Details: ${form.details||'keine weiteren'} | Ton: ${form.ton}\n- Absender: ${AppData.user.name}, ${AppData.user.school} | Datum: 28. April 2026\n\nSchreibe einen vollständigen, professionellen Elternbrief auf Deutsch mit Anrede, sachlichem Hauptteil, ggf. Rückmeldebogen-Hinweis und freundlicher Verabschiedung.\nFormatiere wie ein echtes Anschreiben.`)); }
    catch { setResult('Fehler beim Generieren.'); }
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
        <p style={{ color: 'var(--text-3)', fontSize: '13.5px', fontWeight: '500' }}>Alle Tools sind mit deinem Claude-Konto verbunden und generieren Inhalte direkt für deinen Unterricht.</p>
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
