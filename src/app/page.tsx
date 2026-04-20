'use client';

import Image from 'next/image';
import { useQuest } from '@/context/QuestContext';
import QuestContainer from '@/components/QuestContainer';
import { Sword, Star, Trophy } from 'lucide-react';

export default function MissionDashboard() {
  const { quests } = useQuest();

  const mainQuests = [quests.gemini, quests.initialTry, quests.permanentKbConnected, quests.ragTry, quests.serper];
  const sideQuests = [quests.groq, quests.ollama, quests.fileUploaded, quests.systemMsgChanged, quests.nameChanged];
  const completedMain = mainQuests.filter(Boolean).length;
  const completedSide = sideQuests.filter(Boolean).length;
  const totalCount = mainQuests.length + sideQuests.length;
  const completedCount = completedMain + completedSide;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Sword size={18} style={{ color: 'var(--aap-yellow)' }} />
          <h1 className="pixel-text-shadow-gold"
            style={{ color: 'var(--aap-yellow)', fontSize: 'clamp(11px,1.5vw,16px)', letterSpacing: '0.08em' }}>
            MISSION DASHBOARD
          </h1>
        </div>
        <p style={{ fontSize: 8, color: 'var(--aap-grey)' }}>BUILD WITH AI — PALEMBANG 2026</p>
        <div style={{ marginTop: 16, maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 8 }}>
            <span style={{ color: 'var(--aap-grey)' }}>OVERALL PROGRESS</span>
            <span style={{ color: 'var(--aap-yellow)' }}>{completedCount}/{totalCount} QUESTS</span>
          </div>
          <div style={{ display: 'flex', gap: 3, height: 14 }}>
            {Array.from({ length: totalCount }).map((_, i) => (
              <div key={i} style={{
                flex: 1,
                background: i < completedCount ? 'var(--aap-yellow)' : 'var(--aap-dark3)',
                border: `2px solid ${i < completedCount ? 'var(--aap-amber)' : 'var(--aap-slate)'}`,
                transition: `background 0.3s ${i * 0.04}s`,
              }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* MAIN QUESTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '4px solid var(--aap-yellow)', paddingBottom: 10, marginBottom: 20 }}>
            <Star size={14} style={{ color: 'var(--aap-yellow)' }} />
            <h2 className="pixel-text-shadow-gold" style={{ color: 'var(--aap-yellow)', fontSize: 11 }}>
              MAIN QUESTS ({completedMain}/{mainQuests.length})
            </h2>
          </div>

          <section style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-sky)', marginBottom: 10, textTransform: 'uppercase' }}>▶ I. Connected by a Thread</p>
            <QuestContainer title="Connect to Google AI Studio" description="GEMINI_API_KEY set in .env.local" isCompleted={quests.gemini} />
          </section>

          <section style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-sky)', marginBottom: 10, textTransform: 'uppercase' }}>▶ II. Start Me Up</p>
            <QuestContainer title="Communicate with chatbot 3 times" description="Send 3 messages in the chatbot."
              isCompleted={quests.initialTry} isLocked={!quests.gemini && !quests.groq && !quests.ollama} />
          </section>

          <section style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-sky)', marginBottom: 10, textTransform: 'uppercase' }}>▶ III. Information Society</p>
            <QuestContainer title="Activate Permanent Knowledge Base"
              description="Toggle a Permanent Inventory file active in the chatbot."
              isCompleted={quests.permanentKbConnected} isLocked={!quests.initialTry} />
            <QuestContainer title="Communicate with RAG chatbot"
              description="Send 1 message with a knowledge base active."
              isCompleted={quests.ragTry} isLocked={!quests.permanentKbConnected} />
          </section>

          <section style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-sky)', marginBottom: 10, textTransform: 'uppercase' }}>▶ IV. Welcome to the Grid</p>
            <QuestContainer title="Connect to Serper" description="SERPER_API_KEY set in .env.local"
              isCompleted={quests.serper} isLocked={!quests.ragTry} />
          </section>
        </div>

        {/* SIDE QUESTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '4px solid var(--aap-grey)', paddingBottom: 10, marginBottom: 20 }}>
            <Star size={14} style={{ color: 'var(--aap-grey)' }} />
            <h2 style={{ color: 'var(--aap-grey-mid)', fontSize: 11 }}>SIDE QUESTS ({completedSide}/{sideQuests.length})</h2>
          </div>

          <section style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-cyan)', marginBottom: 10, textTransform: 'uppercase' }}>▶ The Wanderer</p>
            <QuestContainer title="Connect to Groq Cloud" description="GROQ_API_KEY set in .env.local" isCompleted={quests.groq} type="side" />
            <QuestContainer title="Connected to Local Ollama" description="Localhost:11434 ping successful." isCompleted={quests.ollama} type="side" />
          </section>

          <section style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-cyan)', marginBottom: 10, textTransform: 'uppercase' }}>▶ The Tinkerer</p>
            <QuestContainer title="Upload file directly to chatbot"
              description="Upload a .CSV or .TXT file via the Upload File section in the chat." isCompleted={quests.fileUploaded} type="side" />
            <QuestContainer title="Customize the System Prompt"
              description="Modify the default system message in the chat panel." isCompleted={quests.systemMsgChanged} type="side" />
          </section>

          <section style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-cyan)', marginBottom: 10, textTransform: 'uppercase' }}>▶ The Identity</p>
            <QuestContainer title="Set your Player Name"
              description="Change _YOUR_NAME_ to your real name in the Player Stats page." isCompleted={quests.nameChanged} type="side" />
          </section>

          {/* Ampera Bridge */}
          <div style={{ position: 'relative', height: 180, border: '4px solid var(--aap-blue)', boxShadow: '4px 4px 0 var(--aap-darkest)', overflow: 'hidden' }}>
            <Image src="/ampera_background.png" alt="Ampera Bridge" fill sizes="100%" style={{ objectFit: 'cover', imageRendering: 'pixelated' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,52,100,0.9) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, fontSize: 8, color: 'var(--aap-sky)', textAlign: 'center' }}>⛩ AMPERA BRIDGE — PALEMBANG</div>
            {completedCount === totalCount && (
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--aap-amber)', border: '2px solid var(--aap-yellow)', color: 'var(--aap-darkest)', fontSize: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trophy size={12} /> ALL CLEAR!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
