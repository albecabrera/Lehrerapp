
const { useState, useEffect, useRef } = React;

function parseStudentListText(raw) {
  return raw
    .split(/\r?\n|,|;/)
    .map(x => x.trim())
    .filter(Boolean)
    .filter(x => !/^name$/i.test(x));
}

function parseStudentCsv(raw, classDefault = '') {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  function splitCsvLine(line, delimiter) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  }

  function detectDelimiter(sampleLine) {
    const candidates = [';', ',', '\t'];
    const counts = candidates.map(d => ({ d, c: (sampleLine.match(new RegExp(`\\${d}`, 'g')) || []).length }));
    counts.sort((a, b) => b.c - a.c);
    return counts[0].c > 0 ? counts[0].d : ';';
  }

  const delimiter = detectDelimiter(lines[0]);
  const split = (line) => splitCsvLine(line, delimiter).map(x => x.replace(/^"|"$/g, '').trim());
  const headers = split(lines[0]).map(h => h.toLowerCase());

  const findHeader = (arr) => headers.findIndex(h => arr.some(a => h.includes(a)));
  const idx = {
    familienname: findHeader(['familienname', 'nachname', 'surname', 'last name', 'name']),
    vorname: findHeader(['vorname', 'firstname', 'first name', 'given name']),
    klasse: findHeader(['klasse', 'class']),
    spitzname: findHeader(['spitzname', 'nickname', 'rufname']),
    geschlecht: findHeader(['geschlecht', 'gender', 'sex']),
    besonderheiten: findHeader(['besonderheiten', 'hinweis', 'notiz', 'bemerkung', 'notes']),
  };
  const hasHeader = Object.values(idx).some(i => i >= 0);
  const start = hasHeader ? 1 : 0;

  return lines.slice(start).map(line => {
    const c = split(line);
    const row = {
      familienname: idx.familienname >= 0 ? (c[idx.familienname] || '') : (c[0] || ''),
      vorname: idx.vorname >= 0 ? (c[idx.vorname] || '') : (c[1] || ''),
      klasse: idx.klasse >= 0 ? (c[idx.klasse] || '') : (c[2] || ''),
      spitzname: idx.spitzname >= 0 ? (c[idx.spitzname] || '') : (c[3] || ''),
      geschlecht: idx.geschlecht >= 0 ? (c[idx.geschlecht] || '') : (c[4] || ''),
      besonderheiten: idx.besonderheiten >= 0 ? (c[idx.besonderheiten] || '') : (c[5] || ''),
    };
    // Heuristik: falls "Name" als Vollname kam, in Vorname/Nachname trennen
    if (row.familienname && !row.vorname) {
      if (row.familienname.includes(',')) {
        const [last, first] = row.familienname.split(',').map(x => x.trim());
        row.familienname = last || '';
        row.vorname = first || '';
      } else {
        const parts = row.familienname.trim().split(/\s+/);
        if (parts.length >= 2) {
          row.vorname = parts.pop() || '';
          row.familienname = parts.join(' ');
        }
      }
    }
    if (!row.klasse) row.klasse = classDefault;
    return row;
  }).filter(r => r.familienname || r.vorname);
}

const iSt = window.UI?.inputBase || {
  width: '100%', padding: '9px 12px', border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)', fontSize: '13px', background: 'var(--bg-input)',
  color: 'var(--text-1)', boxSizing: 'border-box', fontFamily: 'inherit',
};

const Btn = ({ onClick, children, variant = 'primary', style = {} }) => (
  <window.UI.Button onClick={onClick} variant={variant} style={style}>{children}</window.UI.Button>
);

const CLASS_COLOR_NAMES_DE = [
  'Blau',
  'Lila',
  'Rot',
  'Grün',
  'Gelb',
  'Türkis',
  'Pink',
  'Orange',
  'Oliv',
  'Navy',
  'Koralle',
  'Mint',
];

// ── ClassesView ───────────────────────────────────────────────────────────
function ClassesView({ onNavigate }) {
  const [showNew, setShowNew] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [dragClassId, setDragClassId] = useState(null);
  const [newClass, setNewClass] = useState({ name: '', subject: '', room: '', students: '0', colorIdx: 0 });
  const [, setVersion] = useState(0);
  const importRef = useRef(null);
  const { classes, classColors } = AppData;
  function moveClass(dragId, targetId) {
    if (!dragId || !targetId || dragId === targetId) return;
    const arr = [...(AppData.classes || [])];
    const from = arr.findIndex(c => c.id === dragId);
    const to = arr.findIndex(c => c.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    window.LocalStore.saveClasses(arr);
    setVersion(v => v + 1);
  }

  function exportBackup() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      classes: AppData.classes || [],
      rosters: AppData.rosters || {},
      events: AppData.events || {},
      materials: AppData.materials || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lehrerapp-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('✓ Backup exportiert');
  }

  async function importBackup(file) {
    try {
      const txt = await file.text();
      const data = JSON.parse(txt);
      if (!data || !Array.isArray(data.classes)) throw new Error('invalid_backup');
      window.LocalStore.saveClasses(data.classes || []);
      window.LocalStore.saveRosters(data.rosters || {});
      window.LocalStore.saveEvents(data.events || {});
      window.LocalStore.saveMaterials(data.materials || []);
      setVersion(v => v + 1);
      window.showToast('✓ Backup importiert');
    } catch {
      window.showToast('Fehler: ungültige Backup-Datei');
    }
  }

  return (
    <div style={{ padding: '28px', maxWidth: '980px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '4px' }}>Alle Klassen & Kurse</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '13.5px', fontWeight: '500' }}>{classes.length} Klassen · {classes.reduce((s, c) => s + c.students, 0)} Schüler:innen gesamt</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="secondary" onClick={exportBackup}>Backup exportieren</Btn>
          <Btn variant="secondary" onClick={() => importRef.current && importRef.current.click()}>Backup importieren</Btn>
          <Btn onClick={() => setShowNew(true)}>+ Klasse anlegen</Btn>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) importBackup(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(268px,1fr))', gap: '14px' }}>
        {classes.map(cls => {
          const color = classColors[cls.colorIdx];
          const events = Object.values(AppData.events).flat().filter(e => e.classId === cls.id);
          const mats   = AppData.materials.filter(m => m.classId === cls.id);
          return (
            <window.UI.Card
              key={cls.id}
              draggable
              onDragStart={(e) => {
                setDragClassId(cls.id);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(cls.id));
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData('text/plain')) || dragClassId;
                moveClass(id, cls.id);
                setDragClassId(null);
              }}
              onDragEnd={() => setDragClassId(null)}
              onClick={() => onNavigate('class-' + cls.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditClass({ ...cls });
              }}
              className="card-hover"
              style={{
              padding: '22px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
              transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
              opacity: dragClassId === cls.id ? 0.6 : 1,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', marginTop: '6px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: 'var(--r-lg)', background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 3px 10px ${color}44`,
                }}>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: '900' }}>{cls.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontWeight: '700' }}>
                    {cls.year ? `Jg. ${cls.year}` : 'Kurs'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditClass({ ...cls }); }}
                    style={{ padding: '5px 9px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
              <div
                onMouseDown={(e) => {
                  // Fallback robusto para clic derecho en algunos navegadores/trackpads
                  if (e.button === 2) {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditClass({ ...cls });
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditClass({ ...cls });
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditClass({ ...cls });
                }}
                title="Rechtsklick oder Doppelklick zum Umbenennen"
                style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-1)', marginBottom: '3px', letterSpacing: '-0.2px' }}
              >
                {cls.name}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '16px', fontWeight: '500' }}>{cls.subject} · {cls.room}</div>
              <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                {[['👥', cls.students, 'SuS'], ['📅', events.length, 'Stunden'], ['📄', mats.length, 'Materialien']].map(([icon, val, label], i) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-1)' }}>{val}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-3)', fontWeight: '500' }}>{label}</div>
                  </div>
                ))}
              </div>
              {expandedClassId === cls.id && (
                <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>Inhalt</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px', fontWeight: '600' }}>Nächste Stunden:</div>
                  {(events.filter(e => e.type === 'lesson').slice(0, 3)).map(ev => (
                    <div key={ev.id} style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '3px' }}>
                      • {ev.title} · {ev.start}–{ev.end}
                    </div>
                  ))}
                  {events.filter(e => e.type === 'lesson').length === 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>Keine geplanten Stunden.</div>
                  )}
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigate('class-' + cls.id); }}
                      style={{ padding: '6px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Öffnen
                    </button>
                  </div>
                </div>
              )}
            </window.UI.Card>
          );
        })}
      </div>

      <window.UI.Modal open={showNew} onClose={() => setShowNew(false)} panelStyle={{ width: '400px' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.3px', marginBottom: '20px' }}>Neue Klasse anlegen</div>
            {[['Klassenname', 'z.B. 9a KS', 'name'], ['Fach / Kurs', 'z.B. Informatik', 'subject'], ['Raum', 'z.B. R 204', 'room'], ['Anzahl SuS', '28', 'students']].map(([label, ph, key]) => (
              <div key={label} style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                <input value={newClass[key]} onChange={e => setNewClass(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={iSt} />
              </div>
            ))}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Klassenfarbe</label>
              <select value={newClass.colorIdx} onChange={e => setNewClass(p => ({ ...p, colorIdx: Number(e.target.value) }))} style={iSt}>
                {AppData.classColors.map((col, idx) => (
                  <option key={idx} value={idx}>{CLASS_COLOR_NAMES_DE[idx] || `Farbe ${idx + 1}`}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
              <Btn variant="secondary" onClick={() => setShowNew(false)}>Abbrechen</Btn>
              <Btn onClick={() => {
                if (!newClass.name.trim()) return window.showToast('Klassenname fehlt');
                window.LocalStore.addClass({
                  name: newClass.name.trim(),
                  subject: newClass.subject.trim() || 'Fach',
                  room: newClass.room.trim() || '—',
                  students: Number(newClass.students || 0),
                  year: null,
                  colorIdx: Number(newClass.colorIdx || 0),
                });
                setVersion(v => v + 1);
                setNewClass({ name: '', subject: '', room: '', students: '0', colorIdx: 0 });
                window.showToast('✓ Klasse angelegt');
                setShowNew(false);
              }}>Anlegen</Btn>
            </div>
      </window.UI.Modal>

      <window.UI.Modal open={!!editClass} onClose={() => setEditClass(null)} panelStyle={{ width: '400px' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.3px', marginBottom: '20px' }}>Klasse bearbeiten</div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Klassenname</label>
              <input value={editClass.name || ''} onChange={(e)=>setEditClass(p=>({...p,name:e.target.value}))} style={iSt} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Klassenfarbe</label>
              <select value={editClass.colorIdx ?? 0} onChange={(e)=>setEditClass(p=>({...p,colorIdx:Number(e.target.value)}))} style={iSt}>
                {AppData.classColors.map((col, idx) => (
                  <option key={idx} value={idx}>{CLASS_COLOR_NAMES_DE[idx] || `Farbe ${idx + 1}`}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
              <Btn variant="secondary" onClick={() => setEditClass(null)}>Abbrechen</Btn>
              <Btn onClick={() => {
                if (!editClass.name.trim()) return window.showToast('Klassenname fehlt');
                const next = AppData.classes.map(c => c.id === editClass.id ? { ...c, name: editClass.name.trim(), colorIdx: Number(editClass.colorIdx ?? 0) } : c);
                window.LocalStore.saveClasses(next);
                setVersion(v => v + 1);
                setEditClass(null);
                window.showToast('✓ Klassenname gespeichert');
              }}>Speichern</Btn>
            </div>
      </window.UI.Modal>
    </div>
  );
}

// ── ClassDetailView ───────────────────────────────────────────────────────
function ClassDetailView({ classId, onNavigate }) {
  const [tab, setTab] = useState('overview');
  const [studentInput, setStudentInput] = useState('');
  const [, setVersion] = useState(0);
  const normalizedClassId = Number(classId);
  const cls = AppData.classes.find(c => Number(c.id) === normalizedClassId);
  if (!cls) return <div style={{ padding: '28px', color: 'var(--text-2)' }}>Klasse nicht gefunden.</div>;
  const color = AppData.classColors[cls.colorIdx];
  const roster = window.LocalStore.getRoster(cls.id);
  const [draftRoster, setDraftRoster] = useState(roster);
  const [studentQuery, setStudentQuery] = useState('');
  const [sortBy, setSortBy] = useState('familienname');
  const [sortDir, setSortDir] = useState('asc');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const cellRefs = useRef({});
  useEffect(() => { setDraftRoster(window.LocalStore.getRoster(normalizedClassId)); }, [normalizedClassId]);
  useEffect(() => { cellRefs.current = {}; }, [draftRoster.length, normalizedClassId]);
  const fields = ['familienname','vorname','klasse','spitzname','geschlecht','besonderheiten'];
  const visibleRoster = [...draftRoster]
    .filter(r => {
      const q = studentQuery.trim().toLowerCase();
      if (!q) return true;
      return fields.some(f => String(r[f] || '').toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const av = String(a[sortBy] || '').toLowerCase();
      const bv = String(b[sortBy] || '').toLowerCase();
      const cmp = av.localeCompare(bv, 'de-DE');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  const totalPages = Math.max(1, Math.ceil(visibleRoster.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRoster = visibleRoster.slice((safePage - 1) * pageSize, safePage * pageSize);
  function focusCell(row, col) {
    const k = `${row}:${col}`;
    const el = cellRefs.current[k];
    if (el) { el.focus(); el.select?.(); }
  }
  function handleCellKeyDown(e, row, col) {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusCell(row, Math.min(fields.length - 1, col + 1)); return; }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); focusCell(row, Math.max(0, col - 1)); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); focusCell(Math.min(draftRoster.length - 1, row + 1), col); return; }
    if (e.key === 'ArrowUp')    { e.preventDefault(); focusCell(Math.max(0, row - 1), col); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const step = e.shiftKey ? -1 : 1;
      let nextCol = col + step;
      let nextRow = row;
      if (nextCol > fields.length - 1) { nextCol = 0; nextRow = Math.min(draftRoster.length - 1, row + 1); }
      if (nextCol < 0) { nextCol = fields.length - 1; nextRow = Math.max(0, row - 1); }
      focusCell(nextRow, nextCol);
    }
  }
  const materials = AppData.materials.filter(m => m.classId === cls.id);
  const allEvents = Object.entries(AppData.events).flatMap(([date, evs]) =>
    evs.filter(e => e.classId === cls.id).map(e => ({ ...e, date }))
  ).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ padding: '28px', maxWidth: '880px' }}>
      <button onClick={() => onNavigate('classes')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '13px', fontWeight: '600', marginBottom: '18px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>← Alle Klassen</button>
      <button onClick={() => {
        window.LocalStore.deleteClass(normalizedClassId);
        window.showToast('✓ Klasse gelöscht');
        onNavigate('classes');
      }} style={{ marginLeft: '10px', marginBottom: '18px', background: 'var(--red-bg)', border: '1px solid var(--red)', color: 'var(--red)', cursor: 'pointer', fontSize: '12px', fontWeight: '700', padding: '8px 12px', borderRadius: 'var(--r-md)' }}>
        Klasse löschen
      </button>

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
        {[['overview','Übersicht'],['students','Schüler:innen'],['schedule','Stundenplan'],['materials','Materialien']].map(([id, label]) => (
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
          {[
            ['👥 Schüler:innen', cls.students, 'students'],
            ['📅 Stunden geplant', allEvents.length, 'schedule'],
            ['📄 Materialien', materials.length, 'materials'],
            ['🏫 Raum', cls.room, null],
          ].map(([label, val, targetTab]) => (
            <div
              key={label}
              onClick={() => targetTab ? setTab(targetTab) : null}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                cursor: targetTab ? 'pointer' : 'default',
                transition: targetTab ? 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease' : 'none'
              }}
              onMouseEnter={e => {
                if (!targetTab) return;
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                if (!targetTab) return;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '7px', fontWeight: '600' }}>{label}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-1)', letterSpacing: '-0.3px' }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <window.UI.Card style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: '700', marginBottom: '8px' }}>Manuell hinzufügen</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={studentInput} onChange={e => setStudentInput(e.target.value)} placeholder="Vorname Nachname" style={iSt} />
              <Btn onClick={() => {
                const clean = (studentInput || '').trim();
                if (!clean) return window.showToast('Name fehlt');
                const [familienname, ...rest] = clean.split(/\s+/);
                const ok = true;
                setDraftRoster(prev => [...prev, {
                  id: Date.now() + Math.random(),
                  familienname,
                  vorname: rest.join(' '),
                  klasse: cls.name,
                  spitzname: '',
                  geschlecht: '',
                  besonderheiten: '',
                }]);
                if (!ok) return window.showToast('Name fehlt');
                setStudentInput('');
                setVersion(v => v + 1);
                window.showToast('✓ Schüler:in hinzugefügt');
              }}>Hinzufügen</Btn>
            </div>
          </window.UI.Card>

          <window.UI.Card style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: '700', marginBottom: '8px' }}>Liste hochladen (.csv / .cvs)</div>
            <input type="file" accept=".csv,.cvs" onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              if (!/\.(csv|cvs)$/i.test(file.name)) return window.showToast('Solo se permite .csv/.cvs');
              const text = await file.text();
              const records = parseStudentCsv(text, cls.name);
              const count = records.length;
              setDraftRoster(records.map((r, i) => ({ id: Date.now() + i, ...r })));
              setVersion(v => v + 1);
              window.showToast(`✓ ${count} Schüler:innen importiert`);
            }} style={iSt} />
          </window.UI.Card>

          <window.UI.Card style={{ padding: '16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-1)' }}>Klassenliste ({draftRoster.length})</div>
              <Btn onClick={() => {
                const all = { ...(AppData.rosters || {}), [String(cls.id)]: draftRoster };
                window.LocalStore.saveRosters(all);
                const c = AppData.classes.find(x => x.id === cls.id);
                if (c) c.students = draftRoster.length;
                window.LocalStore.saveClasses(AppData.classes);
                setVersion(v => v + 1);
                window.showToast('✓ Änderungen gespeichert');
              }}>Speichern</Btn>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
              <input
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Suche in der Tabelle…"
                style={{ ...iSt, flex: 1 }}
              />
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ ...iSt, width: '120px' }}>
                {[25, 50, 100].map(n => <option key={n} value={n}>{n} / Seite</option>)}
              </select>
            </div>
            {draftRoster.length === 0 ? (
              <window.UI.Alert type="info">Noch keine Schüler:innen erfasst.</window.UI.Alert>
            ) : (
              <>
              <div style={{ maxHeight: '420px', overflow: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr 1.5fr auto', gap: '6px' }}>
                {[
                  ['Familienname','familienname'],
                  ['Vorname','vorname'],
                  ['Klasse','klasse'],
                  ['Spitzname','spitzname'],
                  ['Geschlecht','geschlecht'],
                  ['Besonderheiten','besonderheiten'],
                  ['',''],
                ].map(([h, key]) => (
                  <button
                    key={h}
                    onClick={() => {
                      if (!key) return;
                      if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                      else { setSortBy(key); setSortDir('asc'); }
                    }}
                    style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '6px 8px', textAlign: 'left', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-sm)', cursor: key ? 'pointer' : 'default', position: 'sticky', top: 0, zIndex: 2 }}
                  >
                    {h}{key && sortBy === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                ))}
                {pagedRoster.map((s, i) => (
                  <React.Fragment key={s.id || i}>
                    {fields.map((field, colIdx) => (
                      <input
                        key={field}
                        ref={(el) => { cellRefs.current[`${i}:${colIdx}`] = el; }}
                        value={s[field] || (field === 'klasse' ? cls.name : '')}
                        onKeyDown={(e) => handleCellKeyDown(e, i, colIdx)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftRoster(prev => prev.map(r => r.id === s.id ? { ...r, [field]: val } : r));
                        }}
                        style={{ ...iSt, padding: '8px 10px', fontSize: '12.5px' }}
                      />
                    ))}
                    <button
                      onClick={() => {
                        setDraftRoster(prev => prev.filter(r => r.id !== s.id));
                        setVersion(v => v + 1);
                        window.showToast('✓ Schüler:in gelöscht');
                      }}
                      style={{ padding: '8px 10px', border: '1px solid var(--red)', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 'var(--r-md)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Löschen
                    </button>
                  </React.Fragment>
                ))}
              </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: '600' }}>
                  Seite {safePage} / {totalPages} · {visibleRoster.length} Einträge
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))}>←</Btn>
                  <Btn variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</Btn>
                </div>
              </div>
              </>
            )}
          </window.UI.Card>
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
  const avatarInputRef = useRef(null);
  const [subjectsDraft, setSubjectsDraft] = useState((user.subjects || []).join(', '));

  async function onAvatarSelected(file) {
    if (!file) return;
    const allowedExt = ['png', 'jpg', 'jpeg', 'heic'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowedExt.includes(ext)) {
      window.showToast('Nur .png, .jpg oder .heic erlaubt');
      return;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    window.LocalStore.saveUser({ avatarUrl: dataUrl });
    setSaved(true);
    window.showToast('✓ Profilbild gespeichert');
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div style={{ padding: '28px', maxWidth: '620px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '24px' }}>Mein Profil</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '22px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px 28px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), oklch(from var(--accent) calc(l + 0.05) c calc(h + 25)))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px oklch(from var(--accent) l c h / 0.40)', overflow: 'hidden' }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#fff', fontSize: '26px', fontWeight: '800' }}>{user.initials}</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: '21px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.3px' }}>{user.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '3px', fontWeight: '500' }}>{user.role} · {user.school}</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {user.subjects.map(s => <span key={s} style={{ fontSize: '11.5px', background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '3px 11px', borderRadius: 'var(--r-full)', fontWeight: '700' }}>{s}</span>)}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              ref={avatarInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.heic,image/png,image/jpeg,image/heic,image/heif"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files && e.target.files[0];
                await onAvatarSelected(file);
                e.target.value = '';
              }}
            />
            <Btn variant="secondary" onClick={() => avatarInputRef.current && avatarInputRef.current.click()}>Bild hochladen</Btn>
            {user.avatarUrl && (
              <Btn
                variant="secondary"
                onClick={() => {
                  window.LocalStore.saveUser({ avatarUrl: '' });
                  window.showToast('✓ Profilbild entfernt');
                }}
              >
                Entfernen
              </Btn>
            )}
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
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Fächer (Bearbeiten)
          </label>
          <input
            value={subjectsDraft}
            onChange={(e) => setSubjectsDraft(e.target.value)}
            placeholder="z.B. Informatik, Mathematik"
            style={iSt}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <Btn onClick={() => {
            const subjects = (subjectsDraft || '')
              .split(',')
              .map(s => s.trim())
              .filter(Boolean);
            window.LocalStore.saveUser({ subjects });
            setSaved(true);
            window.showToast('✓ Profil gespeichert');
            setTimeout(() => setSaved(false), 2500);
          }}
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
  const [schoolName, setSchoolName] = useState(AppData.user.school || '');

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
        <Row label="Schulname">
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <input value={schoolName} onChange={e=>setSchoolName(e.target.value)} style={{...iSt, width:'240px', padding:'7px 10px'}} />
            <Btn
              variant="secondary"
              style={{padding:'6px 12px',fontSize:'12px'}}
              onClick={() => {
                window.LocalStore.saveUser({ school: schoolName.trim() || AppData.user.school });
                window.showToast('✓ Schulname gespeichert');
                setTimeout(() => window.location.reload(), 350);
              }}
            >
              Speichern
            </Btn>
          </div>
        </Row>
        <Row label="Passwort ändern"><Btn variant="secondary" style={{padding:'6px 14px',fontSize:'12.5px'}}>Ändern</Btn></Row>
        <Row label="Daten exportieren"><Btn variant="secondary" style={{padding:'6px 14px',fontSize:'12.5px'}} onClick={()=>window.showToast('Export wird vorbereitet…')}>Exportieren</Btn></Row>
      </Card>
    </div>
  );
}

Object.assign(window, { ClassesView, ClassDetailView, MaterialsView, ProfileView, SettingsView });
