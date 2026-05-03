'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuest, DEFAULT_PLAYER_NAME } from '@/context/QuestContext';
import { CheckCircle2, Globe, Database, Cpu, Edit2, Check, RotateCcw } from 'lucide-react';

const CHARACTERS = [
  { id: 'male_1',         name: 'The Architect',  role: 'Backend Engineer',  src: '/hero_male_1.png' },
  { id: 'male_2',         name: 'The Coder',       role: 'Full Stack Dev',    src: '/hero_male_2.png' },
  { id: 'female_hijab',   name: 'The Scholar',     role: 'AI Researcher',     src: '/hero_female_hijab.png' },
  { id: 'female_nohijab', name: 'The Strategist',  role: 'Data Scientist',    src: '/hero_female_nohijab.png' },
];

export default function PlayerStatsPage() {
  const { quests, playerName, setPlayerName, resetProgress } = useQuest();
  const [selectedId,   setSelectedId]   = useState('male_1');
  const [editingName,  setEditingName]  = useState(false);
  const [nameInput,    setNameInput]    = useState(playerName);
  const [confirmReset, setConfirmReset] = useState(false);
  const char = CHARACTERS.find(c => c.id === selectedId) ?? CHARACTERS[0];

  const llmPct    = ((quests.gemini ? 1 : 0) + (quests.groq ? 1 : 0) + (quests.ollama ? 1 : 0)) / 3 * 100;
  const ragPct    = ((quests.permanentKbConnected ? 1 : 0) + (quests.ragTry ? 1 : 0)) / 2 * 100;
  const chatPct   = quests.initialTry ? 100 : 0;
  const searchPct = quests.serper ? 100 : 0;
  const totalXP   = Math.round((llmPct + ragPct + chatPct + searchPct) / 4);

  const stats = [
    { name: 'LLM Connectivity', value: llmPct,    icon: <Cpu size={13} />,          color: '#249fde' },
    { name: 'RAG Mastery',      value: ragPct,    icon: <Database size={13} />,     color: '#9cdb43' },
    { name: 'Chat Mastery',     value: chatPct,   icon: <CheckCircle2 size={13} />, color: '#f9a31b' },
    { name: 'Agentic Search',   value: searchPct, icon: <Globe size={13} />,         color: '#d6f264' },
  ];

  function saveName() {
    const trimmed = nameInput.trim() || DEFAULT_PLAYER_NAME;
    setPlayerName(trimmed);
    setNameInput(trimmed);
    setEditingName(false);
  }

  const panelStyle = {
    background: 'var(--aap-dark3)', border: '4px solid var(--aap-grey)',
    boxShadow: 'inset -4px -4px 0 var(--aap-darkest), 4px 4px 0 var(--aap-darkest)',
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 16 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="pixel-text-shadow-gold" style={{ color: 'var(--aap-yellow)', fontSize: 14, letterSpacing: '0.1em' }}>PLAYER STATS</h1>
        <p style={{ fontSize: 8, color: 'var(--aap-grey)', marginTop: 6 }}>BUILD WITH AI — PALEMBANG 2026</p>
      </div>

      {/* CHARACTER SELECTION */}
      <div style={{ ...panelStyle, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 9, color: 'var(--aap-yellow)', marginBottom: 14 }}>⚔ SELECT YOUR CHARACTER</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {CHARACTERS.map(c => {
            const active = selectedId === c.id;
            return (
              <div key={c.id} onClick={() => setSelectedId(c.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 6px',
                cursor: 'pointer', userSelect: 'none',
                border: active ? '4px solid var(--aap-yellow)' : '4px solid var(--aap-slate)',
                background: active ? 'var(--aap-navy)' : 'var(--aap-dark2)',
                boxShadow: active ? 'inset -4px -4px 0 #9a7000, inset 4px 4px 0 #fffc40, 0 0 12px rgba(255,213,65,0.3)' : 'inset -2px -2px 0 var(--aap-darkest)',
              }}>
                <div style={{ position: 'relative', width: 64, height: 88, overflow: 'hidden' }}>
                  <Image key={c.id} src={c.src} alt={c.name} fill sizes="64px"
                    style={{ objectFit: 'cover', imageRendering: 'pixelated' }} />
                </div>
                <span style={{ fontSize: 7, color: active ? 'var(--aap-yellow)' : 'var(--aap-grey-lt)', textAlign: 'center', lineHeight: 1.5 }}>{c.name}</span>
                <span style={{ fontSize: 7, color: active ? 'var(--aap-amber)' : 'var(--aap-grey-dark)', textAlign: 'center' }}>{c.role}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROFILE CARD */}
      <div style={{
        background: 'var(--aap-navy)', border: '4px solid var(--aap-sky)',
        boxShadow: 'inset -4px -4px 0 #0a1f40, inset 4px 4px 0 var(--aap-cyan), 4px 4px 0 var(--aap-darkest)',
        padding: 20, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          position: 'relative', width: 110, height: 140, flexShrink: 0,
          border: '4px solid var(--aap-sky)', overflow: 'hidden', background: 'var(--aap-dark3)',
          boxShadow: 'inset -4px -4px 0 var(--aap-navy), inset 4px 4px 0 var(--aap-cyan)',
        }}>
          <Image key={char.id} src={char.src} alt={char.name} fill sizes="110px" loading="eager"
            style={{ objectFit: 'cover', imageRendering: 'pixelated' }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center', minWidth: 160 }}>
          {/* Editable player name */}
          <div>
            <p style={{ fontSize: 7, color: 'var(--aap-grey)', marginBottom: 4 }}>PLAYER NAME</p>
            {editingName ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  style={{
                    flex: 1, fontSize: 11, padding: '4px 8px',
                    background: 'var(--aap-dark2)', border: '4px solid var(--aap-yellow)',
                    color: 'var(--aap-white)', fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <div onClick={saveName} style={{ cursor: 'pointer', padding: 4, border: '2px solid var(--aap-green)', background: 'var(--aap-forest)' }}>
                  <Check size={14} style={{ color: 'var(--aap-green-lt)' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderBottom: '4px solid var(--aap-slate)', paddingBottom: 8 }}>
                <p className="pixel-text-shadow" style={{ fontSize: 12, color: playerName !== DEFAULT_PLAYER_NAME ? 'var(--aap-yellow)' : 'var(--aap-grey-mid)' }}>
                  {playerName}
                </p>
                <div onClick={() => { setNameInput(playerName); setEditingName(true); }}
                  style={{ cursor: 'pointer', marginLeft: 4, opacity: 0.6 }}>
                  <Edit2 size={12} style={{ color: 'var(--aap-grey)' }} />
                </div>
              </div>
            )}
          </div>
          <div>
            <p style={{ fontSize: 7, color: 'var(--aap-grey)', marginBottom: 4 }}>CLASS</p>
            <p style={{ fontSize: 10, color: 'var(--aap-sky)', borderBottom: '4px solid var(--aap-slate)', paddingBottom: 8 }}>{char.role}</p>
          </div>
          <div>
            <p style={{ fontSize: 7, color: 'var(--aap-grey)', marginBottom: 4 }}>GUILD</p>
            <p style={{ fontSize: 9, color: 'var(--aap-grey-lt)' }}>Build With AI — Palembang 2026</p>
          </div>
        </div>

        {/* XP */}
        <div style={{
          flexShrink: 0, width: 88, textAlign: 'center', background: 'var(--aap-dark3)',
          border: '4px solid var(--aap-yellow)',
          boxShadow: 'inset -4px -4px 0 #9a7000, inset 4px 4px 0 #fffc40',
          padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <p style={{ fontSize: 7, color: 'var(--aap-grey)' }}>TOTAL XP</p>
          <p className="pixel-text-shadow-gold" style={{ fontSize: 28, color: 'var(--aap-yellow)', lineHeight: 1 }}>{totalXP}</p>
          <p style={{ fontSize: 7, color: 'var(--aap-amber)' }}>/ 100</p>
        </div>
      </div>

      {/* SKILL TREE */}
      <div style={{ ...panelStyle, padding: 20 }}>
        <p style={{ fontSize: 9, color: 'var(--aap-yellow)', marginBottom: 20 }}>★ SKILL TREE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {stats.map(s => (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, color: s.color }}>
                  {s.icon}<span>{s.name}</span>
                </div>
                <span style={{ fontSize: 9, color: 'var(--aap-yellow)' }}>{s.value.toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', gap: 2, height: 16 }}>
                {Array.from({ length: 20 }).map((_, i) => {
                  const filled = (i + 1) / 20 * 100 <= s.value;
                  return <div key={i} style={{
                    flex: 1,
                    background: filled ? s.color : 'var(--aap-dark2)',
                    border: `2px solid ${filled ? s.color : 'var(--aap-slate-dark)'}`,
                    transition: `background 0.05s ${i * 0.03}s`,
                  }} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESET PROGRESS */}
      <div style={{ marginTop: 20, padding: 16, border: '2px dashed var(--aap-slate)', background: 'var(--aap-darkest)' }}>
        <p style={{ fontSize: 7, color: 'var(--aap-grey-dark)', marginBottom: 12 }}>⚠ DANGER ZONE</p>
        {!confirmReset ? (
          <div
            onClick={() => setConfirmReset(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', cursor: 'pointer', userSelect: 'none',
              border: '2px solid var(--aap-slate)', background: 'var(--aap-dark2)',
              color: 'var(--aap-grey-mid)', fontSize: 8,
            }}
          >
            <RotateCcw size={12} />
            RESET QUEST PROGRESS
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 7, color: 'var(--aap-red-bright)' }}>⚠ This will clear all quest progress. Player name is kept. Are you sure?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                onClick={() => { resetProgress(); setConfirmReset(false); }}
                style={{
                  flex: 1, padding: '10px 14px', cursor: 'pointer', userSelect: 'none', textAlign: 'center',
                  border: '2px solid var(--aap-red)', background: 'var(--aap-dark2)',
                  color: 'var(--aap-red-bright)', fontSize: 8,
                }}
              >
                ✗ YES, RESET
              </div>
              <div
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1, padding: '10px 14px', cursor: 'pointer', userSelect: 'none', textAlign: 'center',
                  border: '2px solid var(--aap-slate)', background: 'var(--aap-dark2)',
                  color: 'var(--aap-grey)', fontSize: 8,
                }}
              >
                ← CANCEL
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
