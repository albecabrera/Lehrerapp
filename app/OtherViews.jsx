
const { useState } = React;

const iSt = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)', fontSize: '13px', background: 'var(--bg-input)',
  color: 'var(--text-1)', boxSizing: 'border-box', fontFamily: 'inherit',
};

const Btn = ({ onClick, children, variant = 'primary', style = {} }) => (
  <button onClick={onClick} style={{
    padding: '9px 20px', borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', border: 'none',
    background: variant === 'primary' ? 'var(--accent)' : 'var(--bg-card)',
    color:      variant === 'primary' ? 'var(--accent-fg)' : 'var(--text-2)',
    border:     variant === 'secondary' ? '1px solid var(--border)' : 'none',
    boxShadow:  variant === 'primary' ? '0 2px 8px oklch(from var(--accent) l c h / 0.35)' : 'var(--shadow-xs)',
    transition: 'transform 0.12s, box-shadow 0.12s',
    ...style,
  }}
    onMouseEnter={e => { if (variant === 'primary') { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px oklch(from var(--accent) l c h / 0.40)'; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = variant === 'primary' ? '0 2px 8px oklch(from var(--accent) l c h / 0.35)' : 'var(--shadow-xs)'; }}
  >{children}</button>
);

// ── ClassesView ───────────────────────────────────────────────────────────
function ClassesView({ onNavigate }) {
  const [showNew, setShowNew] = useState(false);
  const { classes, classColors } = AppData;

  return (
    <div style={{ padding: '28px', maxWidth: '980px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '4px' }}>Alle Klassen & Kurse</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '13.5px', fontWeight: '500' }}>{classes.length} Klassen · {classes.reduce((s, c) => s + c.students, 0)} Schüler:innen gesamt</p>
        </div>
        <Btn onClick={() => setShowNew(true)}>+ Klasse anlegen</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(268px,1fr))', gap: '14px' }}>
        {classes.map(cls => {
          const color = classColors[cls.colorIdx];
          const events = Object.values(AppData.events).flat().filter(e => e.classId === cls.id);
          const mats   = AppData.materials.filter(m => m.classId === cls.id);
          return (
            <div key={cls.id} onClick={() => onNavigate('class-' + cls.id)} className="card-hover" style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
              padding: '22px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', marginTop: '6px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: 'var(--r-lg)', background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 3px 10px ${color}44`,
                }}>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: '900' }}>{cls.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <span style={{ fontSize: '11px', background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontWeight: '700' }}>
                  {cls.year ? `Jg. ${cls.year}` : 'Kurs'}
                </span>
              </div>
              <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-1)', marginBottom: '3px', letterSpacing: '-0.2px' }}>{cls.name}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '16px', fontWeight: '500' }}>{cls.subject} · {cls.room}</div>
              <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                {[['👥', cls.students, 'SuS'], ['📅', events.length, 'Stunden'], ['📄', mats.length, 'Materialien']].map(([icon, val, label], i) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-1)' }}>{val}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-3)', fontWeight: '500' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: 'fixed', inset: 0, background: 'var(--bg-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} className="modal-enter" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', padding: '28px', width: '400px', boxShadow: 'var(--shadow-modal)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.3px', marginBottom: '20px' }}>Neue Klasse anlegen</div>
            {[['Klassenname', 'z.B. 9a KS'], ['Fach / Kurs', 'z.B. Informatik'], ['Raum', 'z.B. R 204'], ['Anzahl SuS', '28']].map(([label, ph]) => (
              <div key={label} style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                <input placeholder={ph} style={iSt} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
              <Btn variant="secondary" onClick={() => setShowNew(false)}>Abbrechen</Btn>
              <Btn onClick={() => { window.showToast('✓ Klasse angelegt'); setShowNew(false); }}>Anlegen</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ClassDetailView ───────────────────────────────────────────────────────
function ClassDetailView({ classId, onNavigate }) {
  const [tab, setTab] = useState('overview');
  const cls = AppData.classes.find(c => c.id === classId);
  if (!cls) return <div style={{ padding: '28px', color: 'var(--text-2)' }}>Klasse nicht gefunden.</div>;
  const color = AppData.classColors[cls.colorIdx];
  const materials = AppData.materials.filter(m => m.classId === cls.id);
  const allEvents = Object.entries(AppData.events).flatMap(([date, evs]) =>
    evs.filter(e => e.classId === cls.id).map(e => ({ ...e, date }))
  ).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ padding: '28px', maxWidth: '880px' }}>
      <button onClick={() => onNavigate('classes')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '13px', fontWeight: '600', marginBottom: '18px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>← Alle Klassen</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '28px' }}>
        <div style={{ width: '58px', height: '58px', borderRadius: 'var(--r-xl)', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${color}44`, flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: '21px', fontWeight: '900' }}>{cls.name.slice(0,2).toUpperCase()}</span>
        </div>
        <div>
          <h2 style={{ fontSize: '25px', fontWeight: '900', color: 'var(--text-1)', letterSpacing: '-0.5px', marginBottom: '4px' }}>{cls.name}</h2>
          <div style={{ fontSize: '13.5px', color: 'var(--text-3)', fontWeight: '500' }}>{cls.subject} · {cls.room} · {cls.students} SuS{cls.year ? ` · Jg. ${cls.year}` : ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {[['overview','Übersicht'],['schedule','Stundenplan'],['materials','Materialien']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '9px 22px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13.5px', fontWeight: tab === id ? '700' : '400',
            color: tab === id ? color : 'var(--text-3)',
            borderBottom: `2.5px solid ${tab === id ? color : 'transparent'}`,
            marginBottom: '-1px', transition: 'color 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {[['👥 Schüler:innen', cls.students], ['📅 Stunden geplant', allEvents.length], ['📄 Materialien', materials.length], ['🏫 Raum', cls.room]].map(([label, val]) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '7px', fontWeight: '600' }}>{label}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-1)', letterSpacing: '-0.3px' }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allEvents.length === 0 && <div style={{ color: 'var(--text-3)', padding: '32px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>Keine Stunden geplant.</div>}
          {allEvents.map(ev => (
            <div key={ev.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '3px', height: '40px', background: color, borderRadius: 'var(--r-full)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-1)' }}>{ev.topic || ev.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px', fontWeight: '500' }}>{new Date(ev.date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })} · {ev.start}–{ev.end}</div>
              </div>
              {ev.room && <div style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: '500' }}>📍 {ev.room}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'materials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {materials.length === 0 && <div style={{ color: 'var(--text-3)', padding: '32px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>Noch keine Materialien.</div>}
          {materials.map(m => (
            <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: '22px' }}>{m.type==='Arbeitsblatt'?'📄':m.type==='Tafelbild'?'⬚':m.type==='Elternbrief'?'✉️':m.type==='App'?'📱':'📋'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-1)' }}>{m.title}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px', fontWeight: '500' }}>{m.type} · {m.size}</div>
              </div>
              <Btn variant="secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>Öffnen</Btn>
            </div>
          ))}
          <button onClick={() => onNavigate('materials')} style={{ alignSelf: 'flex-start', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '13px', fontWeight: '600' }}>Zur Materialdatenbank →</button>
        </div>
      )}
    </div>
  );
}

// ── MaterialsView ─────────────────────────────────────────────────────────
function MaterialsView() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Alle');
  const { materials, classes, classColors } = AppData;
  const types = ['Alle', 'Arbeitsblatt', 'Tafelbild', 'Differenzierung', 'Elternbrief', 'App'];
  const typeIcons = { Arbeitsblatt:'📄', Tafelbild:'⬚', Differenzierung:'📋', Elternbrief:'✉️', App:'📱' };

  const filtered = materials.filter(m => {
    const q = search.toLowerCase();
    return (m.title.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)))
        && (filter === 'Alle' || m.type === filter);
  });

  return (
    <div style={{ padding: '28px', maxWidth: '920px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '4px' }}>Materialdatenbank</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '13.5px', fontWeight: '500' }}>{materials.length} gespeicherte Materialien</p>
        </div>
        <Btn onClick={() => window.showToast('Upload-Dialog öffnet sich…')}>+ Material hochladen</Btn>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Materialien durchsuchen…"
          style={{ ...iSt, flex: '1 1 240px', width: 'auto' }} />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '7px 14px', borderRadius: 'var(--r-md)', fontSize: '12.5px', cursor: 'pointer', fontWeight: filter === t ? '700' : '400',
              background: filter === t ? 'var(--accent)' : 'var(--bg-card)',
              color:      filter === t ? 'var(--accent-fg)' : 'var(--text-2)',
              border:    `1.5px solid ${filter === t ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow:  filter === t ? '0 2px 8px oklch(from var(--accent) l c h / 0.30)' : 'var(--shadow-xs)',
              transition: 'all 0.14s',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 && (
          <div style={{ color: 'var(--text-3)', padding: '48px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px dashed var(--border)', fontWeight: '500' }}>Keine Materialien gefunden.</div>
        )}
        {filtered.map(m => {
          const cls   = classes.find(c => c.id === m.classId);
          const color = cls ? classColors[cls.colorIdx] : 'var(--accent)';
          return (
            <div key={m.id} className="card-hover" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-lg)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, border: '1px solid var(--border-light)' }}>
                {typeIcons[m.type] || '📋'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-1)', marginBottom: '5px' }}>{m.title}</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {cls && <span style={{ fontSize: '11px', background: `oklch(from ${color} l c h / 0.13)`, color, padding: '2px 8px', borderRadius: 'var(--r-sm)', fontWeight: '700' }}>{cls.name}</span>}
                  {m.subject && <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: '500' }}>{m.subject}</span>}
                  {m.tags.map(tag => <span key={tag} style={{ fontSize: '11px', background: 'var(--bg-subtle)', color: 'var(--text-3)', padding: '2px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-light)' }}>{tag}</span>)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: '7px', fontWeight: '500' }}>{m.size} · {new Date(m.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div style={{ display: 'flex', gap: '7px', justifyContent: 'flex-end' }}>
                  <Btn variant="secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>Öffnen</Btn>
                  <Btn variant="secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>↓</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ProfileView ───────────────────────────────────────────────────────────
function ProfileView() {
  const { user } = AppData;
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ padding: '28px', maxWidth: '620px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '24px' }}>Mein Profil</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '22px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px 28px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), oklch(from var(--accent) calc(l + 0.05) c calc(h + 25)))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px oklch(from var(--accent) l c h / 0.40)' }}>
          <span style={{ color: '#fff', fontSize: '26px', fontWeight: '800' }}>{user.initials}</span>
        </div>
        <div>
          <div style={{ fontSize: '21px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.3px' }}>{user.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '3px', fontWeight: '500' }}>{user.role} · {user.school}</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {user.subjects.map(s => <span key={s} style={{ fontSize: '11.5px', background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '3px 11px', borderRadius: 'var(--r-full)', fontWeight: '700' }}>{s}</span>)}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px 28px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-1)', marginBottom: '18px' }}>Persönliche Daten</div>
        {[['Name', user.name], ['E-Mail', user.email], ['Schule', user.school], ['Rolle', user.role]].map(([label, val]) => (
          <div key={label} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
            <input defaultValue={val} style={iSt} />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <Btn onClick={() => { setSaved(true); window.showToast('✓ Profil gespeichert'); setTimeout(() => setSaved(false), 2500); }}
            style={{ background: saved ? 'var(--green)' : 'var(--accent)' }}>
            {saved ? '✓ Gespeichert' : 'Speichern'}
          </Btn>
        </div>
      </div>

      <div style={{ background: 'var(--purple-bg)', border: '1px solid oklch(from var(--purple) l c h / 0.3)', borderRadius: 'var(--r-xl)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: '26px' }}>✦</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--purple)', marginBottom: '3px' }}>Claude KI verbunden</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-3)', fontWeight: '500' }}>Alle KI-Services sind aktiv und mit deinem Konto verknüpft.</div>
        </div>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 0 3px var(--green-bg)', flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ── SettingsView ──────────────────────────────────────────────────────────
function SettingsView() {
  const [notifs,   setNotifs]   = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [calStart, setCalStart] = useState('07:00');

  const Toggle = ({ val, onChange }) => (
    <div onClick={() => onChange(!val)} style={{
      width: '44px', height: '24px', borderRadius: 'var(--r-full)',
      background: val ? 'var(--accent)' : 'var(--border)',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
      boxShadow: val ? '0 1px 6px oklch(from var(--accent) l c h / 0.35)' : 'none',
    }}>
      <div style={{ position: 'absolute', top: '3px', left: val ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.20)' }} />
    </div>
  );

  const Row = ({ label, desc, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-1)' }}>{label}</div>
        {desc && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px', fontWeight: '500' }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  const Card = ({ title, children }) => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '6px 24px 10px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-3)', padding: '16px 0 2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '28px', maxWidth: '620px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '24px' }}>Einstellungen</h2>

      <Card title="Allgemein">
        <Row label="Benachrichtigungen" desc="Erinnerungen zu Stunden und Terminen"><Toggle val={notifs} onChange={setNotifs}/></Row>
        <Row label="Automatisch speichern" desc="Materialien und Pläne automatisch sichern"><Toggle val={autoSave} onChange={setAutoSave}/></Row>
        <Row label="Kalender startet um">
          <select value={calStart} onChange={e=>setCalStart(e.target.value)} style={{...iSt, width:'auto', padding:'7px 12px'}}>
            {['06:00','07:00','07:30','08:00'].map(t=><option key={t} value={t}>{t} Uhr</option>)}
          </select>
        </Row>
      </Card>

      <Card title="Konto">
        <Row label="E-Mail-Adresse"><span style={{fontSize:'13px',color:'var(--text-3)',fontWeight:'500'}}>{AppData.user.email}</span></Row>
        <Row label="Passwort ändern"><Btn variant="secondary" style={{padding:'6px 14px',fontSize:'12.5px'}}>Ändern</Btn></Row>
        <Row label="Daten exportieren"><Btn variant="secondary" style={{padding:'6px 14px',fontSize:'12.5px'}} onClick={()=>window.showToast('Export wird vorbereitet…')}>Exportieren</Btn></Row>
      </Card>
    </div>
  );
}

Object.assign(window, { ClassesView, ClassDetailView, MaterialsView, ProfileView, SettingsView });
