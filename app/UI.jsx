const UI = (() => {
  function Button({ children, onClick, variant = 'primary', style = {}, ...rest }) {
    const base = {
      padding: '9px 20px',
      borderRadius: 'var(--r-md)',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      border: 'none',
      transition: 'transform 0.12s, box-shadow 0.12s',
    };
    const variants = {
      primary: {
        background: 'var(--accent)',
        color: 'var(--accent-fg)',
        boxShadow: '0 2px 8px oklch(from var(--accent) l c h / 0.35)',
      },
      secondary: {
        background: 'var(--bg-card)',
        color: 'var(--text-2)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xs)',
      },
      danger: {
        background: 'var(--red-bg)',
        color: 'var(--red)',
        border: '1px solid var(--red)',
      },
    };
    const st = { ...base, ...(variants[variant] || variants.primary), ...style };
    return (
      <button
        onClick={onClick}
        style={st}
        onMouseEnter={e => {
          if (variant === 'primary') {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px oklch(from var(--accent) l c h / 0.40)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          if (variant === 'primary') e.currentTarget.style.boxShadow = '0 2px 8px oklch(from var(--accent) l c h / 0.35)';
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }

  const inputBase = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)',
    fontSize: '13px',
    background: 'var(--bg-input)',
    color: 'var(--text-1)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  function Card({ children, style = {}, ...rest }) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-sm)',
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }

  function Modal({ open, onClose, children, panelStyle = {} }) {
    if (!open) return null;
    return (
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-modal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Card
          onClick={(e) => e.stopPropagation()}
          className="modal-enter"
          style={{ width: '400px', padding: '28px', boxShadow: 'var(--shadow-modal)', ...panelStyle }}
        >
          {children}
        </Card>
      </div>
    );
  }

  function Alert({ type = 'info', children, style = {} }) {
    const types = {
      info: { bg: 'var(--bg-subtle)', fg: 'var(--text-2)', border: 'var(--border)' },
      success: { bg: 'var(--green-bg)', fg: 'var(--green)', border: 'var(--green)' },
      error: { bg: 'var(--red-bg)', fg: 'var(--red)', border: 'var(--red)' },
      warn: { bg: 'var(--amber-bg)', fg: 'var(--amber)', border: 'var(--amber)' },
    };
    const t = types[type] || types.info;
    return (
      <div style={{ background: t.bg, color: t.fg, border: `1px solid ${t.border}`, borderRadius: 'var(--r-md)', padding: '10px 12px', fontSize: '12.5px', fontWeight: '700', ...style }}>
        {children}
      </div>
    );
  }

  return { Button, inputBase, Card, Modal, Alert };
})();

Object.assign(window, { UI });
