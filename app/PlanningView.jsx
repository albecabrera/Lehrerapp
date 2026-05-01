
const { useState } = React;

function CountdownView() {
  const today = new Date('2026-04-28');
  const holidays = AppData.holidays.map(h => ({
    ...h, startDate: new Date(h.start), endDate: new Date(h.end),
  }));
  const upcoming = holidays.filter(h => h.startDate > today).sort((a,b) => a.startDate - b.startDate);
  const next = upcoming[0];
  const daysLeft = next ? Math.ceil((next.startDate - today) / 86400000) : 0;
  const schoolYearEnd = new Date('2026-07-12');
  const daysToEnd = Math.ceil((schoolYearEnd - today) / 86400000);
  const totalDays = Math.ceil((schoolYearEnd - new Date('2025-09-01')) / 86400000);
  const passedDays = totalDays - daysToEnd;
  const pct = Math.round(passedDays / totalDays * 100);

  const hColors = [
    { grad: 'linear-gradient(135deg, oklch(0.50 0.17 250), oklch(0.52 0.17 280))', accent: 'oklch(0.50 0.17 250)' },
    { grad: 'linear-gradient(135deg, oklch(0.52 0.17 40), oklch(0.55 0.17 60))',   accent: 'oklch(0.52 0.17 40)'  },
    { grad: 'linear-gradient(135deg, oklch(0.50 0.17 20), oklch(0.50 0.17 350))',  accent: 'oklch(0.50 0.17 20)'  },
    { grad: 'linear-gradient(135deg, oklch(0.50 0.17 155), oklch(0.52 0.17 175))', accent: 'oklch(0.50 0.17 155)' },
  ];

  return (
    <div style={{ padding: '28px', maxWidth: '820px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '4px' }}>Ferien-Countdown</h2>
      <p style={{ color: 'var(--text-3)', fontSize: '13.5px', marginBottom: '28px', fontWeight: '500' }}>Schuljahr 2025/2026</p>

      {/* Hero card */}
      {next && (
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), oklch(from var(--accent) calc(l + 0.04) c calc(h + 35)))',
          borderRadius: 'var(--r-2xl)', padding: '32px 36px', marginBottom: '20px',
          color: '#fff', boxShadow: '0 8px 32px oklch(from var(--accent) l c h / 0.40)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -60, right: 60, width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ fontSize: '12px', fontWeight: '700', opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Nächste Ferien</div>
          <div style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '6px' }}>{next.name}</div>
          <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '28px', fontWeight: '500' }}>
            {new Date(next.start).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })} – {new Date(next.end).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { val: Math.floor(daysLeft/7), label: 'Wochen' },
              { val: daysLeft % 7,           label: 'Tage' },
              { val: daysLeft,               label: 'Gesamt Tage' },
            ].map(({ val, label }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: 'var(--r-xl)', padding: '16px 22px', textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '38px', fontWeight: '900', lineHeight: 1, letterSpacing: '-1px' }}>{val}</div>
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px', fontWeight: '600' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* School year progress */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '22px 26px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-1)' }}>🎓 Schuljahresfortschritt</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '2px', fontWeight: '500' }}>Endet am 12. Juli 2026 · noch {daysToEnd} Tage</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '-0.5px' }}>{pct}%</div>
        </div>
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--r-full)', height: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), oklch(from var(--accent) calc(l + 0.04) c calc(h + 20)))', borderRadius: 'var(--r-full)', transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* Upcoming holidays grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {upcoming.map((h, i) => {
          const days = Math.ceil((h.startDate - today) / 86400000);
          const dur  = Math.ceil((h.endDate - h.startDate) / 86400000);
          const c = hColors[i % hColors.length];
          return (
            <div key={h.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: c.grad }} />
              <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--text-1)', marginBottom: '5px', marginTop: '4px' }}>{h.name}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '12px', fontWeight: '500' }}>
                {new Date(h.start).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} – {new Date(h.end).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })} · {dur} Tage
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontSize: '28px', fontWeight: '900', color: c.accent, letterSpacing: '-0.5px' }}>{days}</span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-3)', fontWeight: '500' }}>Tage bis dahin</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sequenzplan ───────────────────────────────────────────────────────────
function SequenzplanView() {
  const [selectedClass, setSelectedClass] = useState(AppData.sequenzplan[0]?.classId);
  const plan = AppData.sequenzplan.find(p => p.classId === selectedClass);
  const cls  = AppData.classes.find(c => c.id === selectedClass);
  const color = cls ? AppData.classColors[cls.colorIdx] : 'var(--accent)';
  const done  = plan ? plan.months.filter(m => m.done).length : 0;
  const total = plan ? plan.months.length : 0;

  return (
    <div style={{ padding: '28px', maxWidth: '920px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: '4px' }}>Jahres- & Sequenzplanung</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '13.5px', fontWeight: '500' }}>Schuljahr 2025/2026</p>
        </div>
        <button style={{
          background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--r-md)',
          padding: '9px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 2px 8px oklch(from var(--accent) l c h / 0.35)',
        }}>+ Neue Klasse</button>
      </div>

      {/* Class tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {AppData.sequenzplan.map(p => {
          const c   = AppData.classes.find(cl => cl.id === p.classId);
          const col = c ? AppData.classColors[c.colorIdx] : 'var(--accent)';
          const isActive = p.classId === selectedClass;
          return (
            <button key={p.classId} onClick={() => setSelectedClass(p.classId)} style={{
              padding: '7px 18px', borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              background: isActive ? col : 'var(--bg-card)',
              color: isActive ? '#fff' : 'var(--text-2)',
              border: `1.5px solid ${isActive ? col : 'var(--border)'}`,
              boxShadow: isActive ? `0 2px 8px ${col}44` : 'var(--shadow-xs)',
              transition: 'all 0.15s',
            }}>{c ? c.name : 'Klasse'}</button>
          );
        })}
      </div>

      {plan && cls && (
        <>
          {/* Progress */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '22px 26px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-1)' }}>{cls.name} · {cls.subject}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: '600' }}>{done} / {total} Einheiten</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--r-full)', height: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${done/total*100}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 'var(--r-full)', transition: 'width 0.7s ease' }} />
            </div>
          </div>

          {/* Month grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px' }}>
            {plan.months.map((m, i) => (
              <div key={i} style={{
                background: m.current ? `oklch(from ${color} l c h / 0.10)` : 'var(--bg-card)',
                border: `1.5px solid ${m.current ? color : m.done ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)', padding: '14px 16px',
                boxShadow: m.current ? `0 2px 12px ${color}30` : 'var(--shadow-xs)',
                position: 'relative', overflow: 'hidden',
              }}>
                {m.done && !m.current && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px', background: color, opacity: 0.4 }} />}
                {m.current && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: m.current ? color : 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{m.m}</span>
                  {m.done && !m.current && <span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>}
                  {m.current && <span style={{ fontSize: '8px', background: color, color: '#fff', padding: '2px 6px', borderRadius: 'var(--r-sm)', fontWeight: '800' }}>Jetzt</span>}
                </div>
                <div style={{ fontSize: '12.5px', color: m.current ? 'var(--text-1)' : 'var(--text-2)', fontWeight: m.current ? '700' : '400', lineHeight: 1.4 }}>{m.topic}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PlanningView({ subView }) {
  if (subView === 'countdown') return <CountdownView />;
  return <SequenzplanView />;
}

Object.assign(window, { PlanningView });
