
const { useState, useEffect, useRef } = React;

function App() {
  const [view, setView]     = useState('today');
  const [calTab, setCalTab] = useState('today');
  const [activeTool, setActiveTool] = useState(null);
  const [dark, setDark]     = useState(() => window.getTheme() === 'dark');
  const [viewKey, setViewKey] = useState(0); // triggers re-mount animation
  const kiTools = ['worksheet','tafelbild','differenz','appbaukasten','elternbrief'];

  function navigate(id) {
    setViewKey(k => k + 1);
    if (kiTools.includes(id)) {
      setView('ki'); setActiveTool(id);
    } else if (['today','week','month','year'].includes(id)) {
      setView('calendar'); setCalTab(id);
    } else {
      setView(id); setActiveTool(null);
    }
  }

  function toggleDark() {
    const next = window.toggleTheme() === 'dark';
    setDark(next);
  }

  const sidebarKey = view === 'calendar' ? calTab
    : view === 'ki' && activeTool ? activeTool
    : view;

  const titles = {
    calendar: 'Kalender', sequenzplan: 'Jahres- & Sequenzplanung',
    countdown: 'Ferien-Countdown', classes: 'Klassen & Kurse',
    materials: 'Materialdatenbank', ki: 'KI-Services',
    profile: 'Mein Profil', settings: 'Einstellungen',
  };
  const pageTitle = view.startsWith('class-')
    ? (() => { const c = AppData.classes.find(cl => cl.id === parseInt(view.replace('class-',''))); return c ? c.name : 'Klasse'; })()
    : (titles[view] || 'Kalender');

  function renderContent() {
    if (view === 'calendar')     return <CalendarView calTab={calTab} onCalTabChange={setCalTab} />;
    if (view === 'sequenzplan')  return <PlanningView subView="sequenzplan" />;
    if (view === 'countdown')    return <PlanningView subView="countdown" />;
    if (view === 'classes')      return <ClassesView onNavigate={navigate} />;
    if (view && view.startsWith('class-')) {
      const id = parseInt(view.replace('class-',''));
      return <ClassDetailView classId={id} onNavigate={navigate} />;
    }
    if (view === 'materials')    return <MaterialsView />;
    if (view === 'ki')           return <AIToolsView activeToolId={activeTool} onToolOpen={setActiveTool} onToolBack={() => setActiveTool(null)} />;
    if (view === 'profile')      return <ProfileView />;
    if (view === 'settings')     return <SettingsView />;
    return <CalendarView calTab={calTab} onCalTabChange={setCalTab} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Figtree', system-ui, sans-serif" }}>
      <Sidebar currentView={sidebarKey} onNavigate={navigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-app)' }}>
        {/* Top bar */}
        <header style={{
          height: '56px', flexShrink: 0,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-1)', letterSpacing: '-0.2px' }}>{pageTitle}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Date chip */}
            <div style={{ fontSize: '12.5px', color: 'var(--text-3)', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-md)', padding: '5px 12px', fontWeight: '500' }}>
              Di, 28. April 2026
            </div>

            {/* Dark mode toggle */}
            <button id="theme-toggle" onClick={toggleDark} title="Theme wechseln" aria-label="Dark Mode umschalten">
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Avatar */}
            <button onClick={() => navigate('profile')} style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), oklch(from var(--accent) calc(l + 0.05) c calc(h + 20)))',
              border: '2px solid var(--bg-card)',
              boxShadow: '0 0 0 1.5px var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>{AppData.user.initials}</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main key={viewKey} className="view-enter" style={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { App });
