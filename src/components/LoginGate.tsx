'use client';

import { useState, useEffect } from 'react';
import { useQuest } from '@/context/QuestContext';
import { Shield, KeyRound } from 'lucide-react';

// ── Main Gate ──────────────────────────────────────────────────────────────────
export default function LoginGate({
  loginEnabled,
  children,
}: {
  loginEnabled: boolean;
  children: React.ReactNode;
}) {
  const { markNoneShallPassCompleted } = useQuest();
  const [authenticated, setAuthenticated] = useState(false);
  const [ready,         setReady]         = useState(false);

  useEffect(() => {
    if (!loginEnabled) {
      // No credentials configured — gate is open, show app normally
      setAuthenticated(true);
    } else {
      // Credentials configured — check if already logged in this session
      const token = sessionStorage.getItem('loginToken');
      setAuthenticated(token === 'true');
    }
    setReady(true);
  }, [loginEnabled]);

  // Prevent flash of wrong content before sessionStorage check
  if (!ready) return null;

  // Gate is open — render the app
  if (!loginEnabled || authenticated) {
    return <>{children}</>;
  }

  // Gate is LOCKED — full-screen login takes over
  function handleSuccess() {
    sessionStorage.setItem('loginToken', 'true');
    markNoneShallPassCompleted();
    setAuthenticated(true);
  }

  return <GateScreen onSuccess={handleSuccess} />;
}

// ── Login Screen ───────────────────────────────────────────────────────────────
function GateScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [attempts, setAttempts] = useState(0);
  const [glitch,   setGlitch]   = useState(false);

  useEffect(() => {
    if (status === 'error') {
      setGlitch(true);
      const t = setTimeout(() => setGlitch(false), 600);
      return () => clearTimeout(t);
    }
  }, [status, attempts]);

  async function handleSubmit() {
    if (!username.trim() || !password.trim() || status === 'loading') return;
    setStatus('loading');

    try {
      const res  = await fetch('/api/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setTimeout(onSuccess, 1500);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setStatus('error');
        // Reset to idle so next attempt can re-trigger glitch
        setTimeout(() => setStatus('idle'), 1800);
      }
    } catch {
      setAttempts(p => p + 1);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1800);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  const errorMsg = getErrorMsg(attempts);

  return (
    <div style={fullscreenStyle}>
      {/* Scanlines */}
      <div style={scanlinesStyle} />

      {/* Gate Box */}
      <div style={{
        ...gateBoxStyle,
        animation: glitch ? 'glitch 0.08s steps(2) 5' : 'none',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Shield size={36} style={{ color: '#8b0000' }} />
          <h1 style={titleStyle}>NONE SHALL PASS</h1>
          <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg, transparent, #8b0000, transparent)' }} />
          <p style={subtitleStyle}>IDENTIFY YOURSELF, TRAVELER</p>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
              autoComplete="off"
              placeholder="_ _ _ _ _ _ _ _"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="off"
              placeholder="* * * * * * * *"
              style={inputStyle}
            />
          </div>

          {/* Feedback */}
          {status === 'error' && (
            <div style={errorBoxStyle}>
              ✗ ACCESS DENIED
              <span style={{ fontSize: 7, display: 'block', marginTop: 4, color: '#ff8888' }}>
                {errorMsg}
              </span>
            </div>
          )}
          {status === 'success' && (
            <div style={successBoxStyle}>
              <KeyRound size={14} style={{ marginRight: 8, flexShrink: 0 }} />
              GATE OPENED — ENTERING...
            </div>
          )}

          {/* Submit */}
          <div
            onClick={handleSubmit}
            style={{
              ...btnStyle,
              opacity: status === 'loading' ? 0.6 : 1,
              cursor:  status === 'loading' ? 'wait' : 'pointer',
            }}
          >
            {status === 'loading' ? '▶ VERIFYING...' : '▶ ENTER'}
          </div>
        </div>

        {/* Hint after failures */}
        <p style={{ fontSize: 7, color: '#3a0000', marginTop: 28, textAlign: 'center', minHeight: 12 }}>
          {attempts > 2 ? 'The answer lies where secrets are kept.' : '???'}
        </p>
      </div>

      <style>{`
        @keyframes glitch {
          0%   { transform: translate(-3px,  1px) skewX(-2deg); filter: hue-rotate(90deg);  }
          25%  { transform: translate( 3px, -1px) skewX( 2deg); filter: hue-rotate(0deg);   }
          50%  { transform: translate(-2px,  2px) skewX(-1deg); filter: hue-rotate(180deg); }
          75%  { transform: translate( 2px, -2px) skewX( 1deg); filter: hue-rotate(0deg);   }
          100% { transform: translate(0,     0)   skewX(0);     filter: hue-rotate(0deg);   }
        }
        input::placeholder { color: #3a0000; }
        input:focus {
          outline: none;
          border-color: #ff4444 !important;
          box-shadow: 0 0 8px rgba(255,68,68,0.4);
        }
      `}</style>
    </div>
  );
}

// ── Flavor messages on wrong password ─────────────────────────────────────────
function getErrorMsg(attempt: number): string {
  const msgs = [
    'WHO ARE YOU?',
    'THE GATE REMEMBERS YOUR FAILURE.',
    'TURN BACK WHILE YOU STILL CAN.',
    'YOU ARE NOT WORTHY.',
    'THE GUARDIAN GROWS IMPATIENT.',
    'SEEK ELSEWHERE FOR THE ANSWER.',
    '...',
  ];
  return msgs[Math.min(attempt - 1, msgs.length - 1)];
}

// ── Styles ────────────────────────────────────────────────────────────────────
const fullscreenStyle: React.CSSProperties = {
  position:       'fixed',
  inset:          0,
  zIndex:         9999,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  background:     '#0a0000',
};

const scanlinesStyle: React.CSSProperties = {
  position:        'fixed',
  inset:           0,
  zIndex:          10000,
  backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 4px)',
  pointerEvents:   'none',
};

const gateBoxStyle: React.CSSProperties = {
  position:      'relative',
  zIndex:        10001,
  width:         '100%',
  maxWidth:      400,
  padding:       40,
  background:    '#0d0000',
  border:        '4px solid #8b0000',
  boxShadow:     '0 0 40px rgba(139,0,0,0.7), inset 0 0 24px rgba(139,0,0,0.1), 6px 6px 0 #000',
  display:       'flex',
  flexDirection: 'column',
  alignItems:    'center',
};

const titleStyle: React.CSSProperties = {
  fontFamily:  'var(--font-pixel), monospace',
  fontSize:    11,
  color:       '#cc0000',
  letterSpacing: '0.15em',
  textAlign:   'center',
  textShadow:  '0 0 12px rgba(200,0,0,0.9)',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily:  'var(--font-pixel), monospace',
  fontSize:    7,
  color:       '#660000',
  letterSpacing: '0.1em',
};

const labelStyle: React.CSSProperties = {
  fontFamily:  'var(--font-pixel), monospace',
  fontSize:    8,
  color:       '#880000',
  letterSpacing: '0.1em',
};

const inputStyle: React.CSSProperties = {
  fontFamily:  'var(--font-pixel), monospace',
  fontSize:    9,
  padding:     '10px 12px',
  background:  '#0a0000',
  border:      '2px solid #4a0000',
  color:       '#ff4444',
  width:       '100%',
  letterSpacing: '0.2em',
  transition:  'border-color 0.15s, box-shadow 0.15s',
};

const errorBoxStyle: React.CSSProperties = {
  fontFamily:  'var(--font-pixel), monospace',
  fontSize:    8,
  color:       '#ff4444',
  padding:     '10px 12px',
  background:  '#1a0000',
  border:      '2px solid #8b0000',
  textAlign:   'center',
};

const successBoxStyle: React.CSSProperties = {
  fontFamily:  'var(--font-pixel), monospace',
  fontSize:    8,
  color:       '#ffd700',
  padding:     '10px 12px',
  background:  '#1a1000',
  border:      '2px solid #ffd700',
  textAlign:   'center',
  display:     'flex',
  alignItems:  'center',
  justifyContent: 'center',
};

const btnStyle: React.CSSProperties = {
  fontFamily:  'var(--font-pixel), monospace',
  fontSize:    9,
  padding:     '12px 24px',
  background:  '#4a0000',
  border:      '4px solid #8b0000',
  color:       '#ff4444',
  textAlign:   'center',
  userSelect:  'none',
  boxShadow:   'inset -2px -2px 0 #1a0000, 2px 2px 0 #000',
  letterSpacing: '0.1em',
  width:       '100%',
};
