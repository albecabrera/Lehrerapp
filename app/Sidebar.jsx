
function Sidebar({ currentView, onNavigate }) {
  const { classes, classColors, user } = AppData;

  const calItems = [
    { id: 'today', label: 'Heute',  icon: '◈' },
    { id: 'week',  label: 'Woche',  icon: '▦' },
    { id: 'month', label: 'Monat',  icon: '▤' },
    { id: 'year',  label: 'Jahr',   icon: '◻' },
  ];
  const planItems = [
    { id: 'sequenzplan', label: 'Jahres- & Sequenzplan', icon: '≡' },
    { id: 'countdown',   label: 'Ferien-Countdown',      icon: '✦' },
  ];
  const kiItems = [
    { id: 'worksheet',    label: 'Arbeitsblatt-Generator', icon: '📄', badge: null   },
    { id: 'tafelbild',    label: 'Tafelbild-Planner',      icon: '⬚',  badge: null   },
    { id: 'differenz',    label: 'Differenzierungshelfer', icon: '⊞',  badge: null   },
    { id: 'appbaukasten', label: 'App-Baukasten',          icon: '📱',  badge: 'Beta' },
    { id: 'elternbrief',  label: 'Elternbrief-Assistent',  icon: '✉️',  badge: null   },
  ];

  const NavBtn = ({ id, label, icon, badge }) => {
    const active = currentView === id;
    return (
      <button
        className="nav-btn"
        onClick={() => onNavigate(id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          width: '100%', padding: '7px 10px',
          background: active ? 'var(--accent-bg)' : 'transparent',
          border: 'none', borderRadius: 'var(--r-md)', margin: '1px 0',
          color: active ? 'var(--accent-text)' : 'var(--text-2)',
          fontSize: '13px', fontWeight: active ? '600' : '400', textAlign: 'left',
          borderLeft: active ? '2.5px solid var(--accent)' : '2.5px solid transparent',
        }}
      >
        <span style={{ fontSize: '13px', width: '18px', textAlign: 'center', flexShrink: 0, opacity: active ? 1 : 0.75 }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {badge && (
          <span style={{ fontSize: '9px', background: 'var(--amber-bg)', color: 'var(--amber)', padding: '2px 6px', borderRadius: 'var(--r-sm)', fontWeight: '700' }}>{badge}</span>
        )}
      </button>
    );
  };

  const Section = ({ label, action, actionId }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px 4px' }}>
      <span style={{ fontSize: '9.5px', fontWeight: '700', color: 'var(--text-3)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>{label}</span>
      {action && (
        <button onClick={() => onNavigate(actionId)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontSize: '18px', lineHeight: 1, padding: '0 2px',
          opacity: 0.8, transition: 'opacity 0.15s !important',
        }} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.8}>+</button>
      )}
    </div>
  );

  return (
    <div id="sidebar" style={{
      width: '228px', minWidth: '228px', height: '100vh', overflowY: 'auto',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 13px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), oklch(from var(--accent) calc(l + 0.08) calc(c - 0.02) calc(h + 30)))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px oklch(from var(--accent) l c h / 0.35)',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: '800' }}>L</span>
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '14.5px', color: 'var(--text-1)', letterSpacing: '-0.4px' }}>LehrerApp</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '1px' }}>{user.school}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '6px 6px', flex: 1, overflowY: 'auto' }}>
        {/* Kalender */}
        <Section label="Kalender" />
        {calItems.map(it => <NavBtn key={it.id} {...it} />)}

        {/* Planung */}
        <Section label="Planung" />
        {planItems.map(it => <NavBtn key={it.id} {...it} />)}

        {/* Klassen */}
        <Section label="Klassen" action actionId="classes" />
        {classes.map(cls => {
          const active = currentView === 'class-' + cls.id;
          const color = classColors[cls.colorIdx];
          return (
            <button
              key={cls.id}
              className="nav-btn"
              onClick={() => onNavigate('class-' + cls.id)}
              style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '6px 10px',
              background: active ? 'var(--accent-bg)' : 'transparent',
              border: 'none', borderRadius: 'var(--r-md)', margin: '1px 0',
              color: active ? 'var(--accent-text)' : 'var(--text-2)',
              fontSize: '13px', fontWeight: active ? '600' : '400', textAlign: 'left',
              borderLeft: active ? '2.5px solid var(--accent)' : '2.5px solid transparent',
              opacity: 1,
            }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px', background: color, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 1px 4px ${color}55`,
              }}>
                <span style={{ color: '#fff', fontSize: '9px', fontWeight: '800' }}>{cls.name.slice(0,2).toUpperCase()}</span>
              </div>
              <span style={{ fontSize: '12px', opacity: 0.9, flexShrink: 0 }}>📘</span>
              <span style={{ flex: 1 }}>{cls.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: '500' }}>{cls.students}</span>
            </button>
          );
        })}
        <button onClick={() => onNavigate('classes')} className="nav-btn" style={{
          display: 'flex', width: '100%', padding: '6px 10px 6px 42px',
          background: 'none', border: 'none', borderRadius: 'var(--r-md)',
          color: 'var(--accent)', fontSize: '12px', textAlign: 'left', fontWeight: '500',
          borderLeft: '2.5px solid transparent',
        }}>Alle Klassen ansehen →</button>

        {/* Materialdatenbank */}
        <div style={{ margin: '4px 0' }}>
          <NavBtn id="materials" label="Materialdatenbank" icon="◫" />
        </div>

        {/* KI-Services */}
        <div style={{ marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 10px 4px' }}>
            <span style={{ fontSize: '9.5px', fontWeight: '700', color: 'var(--text-3)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>KI-Services</span>
            <span style={{ fontSize: '9px', background: 'var(--purple)', color: '#fff', padding: '2px 6px', borderRadius: 'var(--r-sm)', fontWeight: '700' }}>✦ KI</span>
          </div>
          {kiItems.map(it => <NavBtn key={it.id} {...it} />)}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border-light)', padding: '8px 6px 12px', flexShrink: 0 }}>
        <button className="nav-btn" onClick={() => onNavigate('profile')} style={{
          display: 'flex', alignItems: 'center', gap: '9px', width: '100%', padding: '7px 10px',
          background: currentView === 'profile' ? 'var(--accent-bg)' : 'transparent',
          border: 'none', borderRadius: 'var(--r-md)', margin: '1px 0',
          color: currentView === 'profile' ? 'var(--accent-text)' : 'var(--text-2)',
          fontSize: '13px', textAlign: 'left',
          borderLeft: currentView === 'profile' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), oklch(from var(--accent) calc(l + 0.05) c calc(h + 20)))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: '9px', fontWeight: '700' }}>{user.initials}</span>
          </div>
          <span style={{ flex: 1, fontWeight: currentView === 'profile' ? '600' : '400' }}>Mein Profil</span>
        </button>
        <NavBtn id="settings" label="Einstellungen" icon="⚙" />
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar });
