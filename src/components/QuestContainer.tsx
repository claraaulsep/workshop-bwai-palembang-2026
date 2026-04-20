'use client';

import { CheckCircle2, Lock, ChevronRight } from 'lucide-react';

interface QuestContainerProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked?: boolean;
  type?: 'main' | 'side';
}

export default function QuestContainer({
  title,
  description,
  isCompleted,
  isLocked = false,
  type = 'main',
}: QuestContainerProps) {
  // LOCKED STATE — readable, not just faded to invisible
  if (isLocked) {
    return (
      <div
        className="flex items-start gap-3 mb-5"
        style={{
          background: 'var(--aap-dark2)',
          border: '4px solid var(--aap-slate)',
          boxShadow: 'inset -4px -4px 0 var(--aap-darkest), 2px 2px 0 var(--aap-darkest)',
          padding: '12px',
          opacity: 0.78, // subtle dimming — still readable
        }}
      >
        <Lock size={18} style={{ color: 'var(--aap-grey)', flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1">
          <p style={{
            fontSize: '9px',
            color: 'var(--aap-grey-mid)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            lineHeight: 1.6,
          }}>
            {title}
          </p>
          <p style={{ fontSize: '8px', color: 'var(--aap-grey)', lineHeight: 1.8 }}>{description}</p>
        </div>
        <span style={{
          fontSize: '8px',
          background: 'var(--aap-slate-dark)',
          border: '2px solid var(--aap-slate)',
          color: 'var(--aap-grey-mid)',
          padding: '2px 6px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          🔒 LOCKED
        </span>
      </div>
    );
  }

  // COMPLETED STATE
  if (isCompleted) {
    return (
      <div
        className="flex items-start gap-3 mb-5 shimmer-gold"
        style={{
          background: 'var(--aap-dark3)',
          border: '4px solid var(--aap-yellow)',
          boxShadow: 'inset -4px -4px 0 #9a7000, inset 4px 4px 0 #fffc40, 4px 4px 0 var(--aap-darkest)',
          padding: '12px',
        }}
      >
        <CheckCircle2 size={18} style={{ color: 'var(--aap-yellow)', flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1">
          <p className="pixel-text-shadow-gold" style={{
            fontSize: '9px',
            color: 'var(--aap-yellow)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            lineHeight: 1.6,
          }}>
            {title}
          </p>
          <p style={{ fontSize: '8px', color: 'var(--aap-amber)', lineHeight: 1.8 }}>{description}</p>
        </div>
        <span style={{
          fontSize: '8px',
          background: 'var(--aap-amber)',
          border: '2px solid var(--aap-yellow)',
          color: 'var(--aap-darkest)',
          padding: '2px 6px',
          flexShrink: 0,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
        }}>
          ✓ CLEARED
        </span>
      </div>
    );
  }

  // ACTIVE STATE
  const isMain = type === 'main';
  return (
    <div
      className="flex items-start gap-3 mb-5"
      style={{
        background: isMain ? 'var(--aap-navy)' : 'var(--aap-dark3)',
        border: `4px solid ${isMain ? 'var(--aap-sky)' : 'var(--aap-grey)'}`,
        boxShadow: isMain
          ? 'inset -4px -4px 0 #0a1f40, inset 4px 4px 0 var(--aap-cyan), 4px 4px 0 var(--aap-darkest)'
          : 'inset -4px -4px 0 var(--aap-darkest), inset 4px 4px 0 var(--aap-slate), 4px 4px 0 var(--aap-darkest)',
        padding: '12px',
      }}
    >
      <ChevronRight size={18} style={{ color: isMain ? 'var(--aap-sky)' : 'var(--aap-grey)', flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1">
        <p className="pixel-text-shadow" style={{
          fontSize: '9px',
          color: 'var(--aap-white)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          lineHeight: 1.6,
        }}>
          {title}
        </p>
        <p style={{ fontSize: '8px', color: 'var(--aap-grey-mid)', lineHeight: 1.8 }}>{description}</p>
      </div>
      <span style={{
        fontSize: '8px',
        background: isMain ? 'var(--aap-blue)' : 'var(--aap-slate)',
        border: `2px solid ${isMain ? 'var(--aap-sky)' : 'var(--aap-grey)'}`,
        color: 'var(--aap-white)',
        padding: '2px 6px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        ACTIVE
      </span>
    </div>
  );
}
