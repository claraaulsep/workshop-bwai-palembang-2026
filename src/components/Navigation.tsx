'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, MessageSquare, User, Swords } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'QUESTS',  path: '/',      icon: Map },
  { name: 'CHATBOT', path: '/chat',  icon: MessageSquare },
  { name: 'PLAYER',  path: '/about', icon: User },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position:        'fixed',
        top:             0,
        left:            0,
        height:          '100vh',
        width:           expanded ? '200px' : '60px',
        background:      'var(--aap-darkest)',
        borderRight:     '4px solid var(--aap-yellow)',
        boxShadow:       expanded ? '4px 0 0 var(--aap-slate)' : 'none',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'flex-start',
        padding:         '0',
        zIndex:          100,
        transition:      'width 0.2s ease',
        overflow:        'hidden',
      }}
    >
      {/* Logo area */}
      <div style={{
        width:        '100%',
        padding:      '16px 0',
        borderBottom: '4px solid var(--aap-slate)',
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        paddingLeft:  '18px',
        minHeight:    '72px',
        flexShrink:   0,
      }}>
        <Swords size={22} style={{ color: 'var(--aap-yellow)', flexShrink: 0 }} />
        {expanded && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div className="pixel-text-shadow-gold" style={{ color: 'var(--aap-yellow)', fontSize: '9px', letterSpacing: '0.08em' }}>
              BUILD WITH AI
            </div>
            <div style={{ color: 'var(--aap-grey)', fontSize: '7px', marginTop: '4px' }}>
              PALEMBANG 2026
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', padding: '12px 0' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           '14px',
                padding:       '12px 18px',
                fontSize:      '9px',
                textDecoration:'none',
                whiteSpace:    'nowrap',
                borderLeft:    isActive ? '4px solid var(--aap-yellow)' : '4px solid transparent',
                background:    isActive ? 'var(--aap-navy)' : 'transparent',
                color:         isActive ? 'var(--aap-yellow)' : 'var(--aap-grey-mid)',
                transition:    'background 0.15s, color 0.15s',
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--aap-dark3)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--aap-white)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--aap-grey-mid)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {expanded && item.name}
            </Link>
          );
        })}

      </nav>

      {/* Bottom branding */}
      {expanded && (
        <div style={{
          marginTop:  'auto',
          padding:    '16px',
          fontSize:   '7px',
          color:      'var(--aap-slate)',
          borderTop:  '4px solid var(--aap-slate)',
          width:      '100%',
          whiteSpace: 'nowrap',
        }}>
          BUILD WITH AI 2026
        </div>
      )}

      <style>{`
        @keyframes secretPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }
      `}</style>
    </aside>
  );
}
