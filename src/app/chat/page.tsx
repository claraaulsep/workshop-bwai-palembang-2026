'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuest, DEFAULT_SYS_MSG } from '@/context/QuestContext';
import { Send, Upload, Package, Zap, Cpu, Flame, X, ChevronDown, ChevronUp, Lock, RefreshCw } from 'lucide-react';

type Msg   = { role: 'user' | 'assistant'; content: string };
type PFile = { name: string; content: string };
type UFile = { id: string; name: string; content: string };

const MODELS = [
  { id: 'gemini',   label: 'Gemini',        sub: 'Google AI', key: 'gemini' as const,  icon: Zap,     color: '#249fde' },
  { id: 'groq_120', label: 'GPT-OSS 120B',  sub: 'Groq',      key: 'groq'   as const,  icon: Flame,   color: '#df3e23' },
  { id: 'groq_20',  label: 'GPT-OSS 20B',   sub: 'Groq',      key: 'groq'   as const,  icon: Flame,   color: '#fa6a0a' },
  { id: 'llama4',   label: 'Llama 4 Scout', sub: 'Groq',      key: 'groq'   as const,  icon: Cpu,     color: '#d6f264' },
  { id: 'llama33',  label: 'Llama 3.3 70B', sub: 'Groq',      key: 'groq'   as const,  icon: Cpu,     color: '#9cdb43' },
  { id: 'llama_8b', label: 'Llama 3.1 8B',  sub: 'Groq',      key: 'groq'   as const,  icon: Cpu,     color: '#59c135' },
  { id: 'ollama',   label: 'Ollama',         sub: 'Local',     key: 'ollama' as const,  icon: Package, color: '#bc4a9b' },
];

export default function ChatbotPage() {
  const {
    quests, chatCount,
    incrementChatCount, incrementRagChatCount,
    markPermanentKbUsed, markFileDirectlyUploaded, markSystemMessageModified,
  } = useQuest();

  const [messages,       setMessages]       = useState<Msg[]>([]);
  const [input,          setInput]          = useState('');
  const [selectedModel,  setSelectedModel]  = useState('gemini');
  const [isThinking,     setIsThinking]     = useState(false);
  const [error,          setError]          = useState('');
  const [systemMessage,  setSystemMessage]  = useState(DEFAULT_SYS_MSG);
  const [sysOpen,        setSysOpen]        = useState(false);
  const [permanentFiles, setPermanentFiles] = useState<PFile[]>([]);
  const [activePermIds,  setActivePermIds]  = useState<Set<string>>(new Set());
  const [uploadedFiles,  setUploadedFiles]  = useState<UFile[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load permanent knowledge files on mount
  useEffect(() => {
    fetch('/api/knowledge')
      .then(r => r.json())
      .then(d => setPermanentFiles(d.files ?? []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const anyKbActive = activePermIds.size > 0 || uploadedFiles.length > 0;

  function buildKnowledgeBase() {
    const parts: string[] = [];
    permanentFiles.filter(f => activePermIds.has(f.name)).forEach(f => parts.push(`--- ${f.name} ---\n${f.content}`));
    uploadedFiles.forEach(f => parts.push(`--- ${f.name} ---\n${f.content}`));
    return parts.join('\n\n');
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: Msg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsThinking(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: nextMessages.slice(-10), // last 5 turns
          systemMessage,
          knowledgeBase: anyKbActive ? buildKnowledgeBase() : '',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'API error');
      const reply: Msg = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, reply]);

      if (anyKbActive) incrementRagChatCount();
      else incrementChatCount();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setIsThinking(false);
      return;
    }
    setIsThinking(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend();
  }

  function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setUploadedFiles(prev => [...prev, { id: Date.now().toString(), name: file.name, content }]);
      markFileDirectlyUploaded();
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function removeUploadedFile(id: string) {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }

  function togglePermFile(name: string) {
    // Determine BEFORE setState to avoid calling markPermanentKbUsed inside a setState callback
    const isAdding = !activePermIds.has(name);
    setActivePermIds(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    if (isAdding) markPermanentKbUsed();
  }

  function handleSysChange(val: string) {
    setSystemMessage(val);
    if (val !== DEFAULT_SYS_MSG) markSystemMessageModified();
  }

  const panelStyle = {
    background: 'var(--aap-dark3)', border: '4px solid var(--aap-grey)',
    boxShadow: 'inset -4px -4px 0 var(--aap-darkest), 4px 4px 0 var(--aap-darkest)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 'calc(100vh - 80px)' }}>

      {/* MODEL SELECTOR */}
      <div style={{ ...panelStyle, padding: 12, flexShrink: 0 }}>
        <p style={{ fontSize: 9, color: 'var(--aap-yellow)', marginBottom: 10 }}>⚔ SELECT CHAMPION</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
          {MODELS.map(m => {
            const locked = !quests[m.key];
            const active = selectedModel === m.id && !locked;
            const Icon = m.icon;
            return (
              <div key={m.id} onClick={() => !locked && setSelectedModel(m.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 4, padding: '8px 4px',
                  cursor: locked ? 'not-allowed' : 'pointer', userSelect: 'none',
                  border: `4px solid ${active ? m.color : locked ? 'var(--aap-slate-dark)' : 'var(--aap-slate)'}`,
                  background: active ? 'var(--aap-navy)' : locked ? 'var(--aap-darkest)' : 'var(--aap-dark2)',
                  opacity: locked ? 0.4 : 1,
                  boxShadow: active ? `0 0 8px ${m.color}` : 'none',
                }}>
                {locked
                  ? <Lock size={12} style={{ color: 'var(--aap-slate)' }} />
                  : <Icon size={12} style={{ color: active ? m.color : 'var(--aap-grey)' }} />}
                <span style={{ fontSize: 7, color: active ? m.color : locked ? 'var(--aap-slate)' : 'var(--aap-grey-lt)', textAlign: 'center' }}>
                  {locked ? 'LOCKED' : m.label}
                </span>
                {!locked && <span style={{ fontSize: 6, color: 'var(--aap-grey-dark)' }}>{m.sub}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN ROW */}
      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>

        {/* SIDE PANEL */}
        <div style={{ ...panelStyle, padding: 12, width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>

          {/* System Message */}
          <div>
            <div onClick={() => setSysOpen(p => !p)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: 6 }}>
              <p style={{ fontSize: 8, color: 'var(--aap-yellow)' }}>⚙ SYSTEM MSG</p>
              {sysOpen ? <ChevronUp size={12} style={{ color: 'var(--aap-grey)' }} /> : <ChevronDown size={12} style={{ color: 'var(--aap-grey)' }} />}
            </div>
            {sysOpen && (
              <textarea
                value={systemMessage}
                onChange={e => handleSysChange(e.target.value)}
                rows={5}
                style={{
                  width: '100%', fontSize: 8, lineHeight: 1.6, padding: 6, resize: 'vertical',
                  background: 'var(--aap-dark2)', border: '2px solid var(--aap-slate)',
                  color: 'var(--aap-grey-lt)', fontFamily: 'inherit', outline: 'none',
                }}
              />
            )}
            {!sysOpen && systemMessage !== DEFAULT_SYS_MSG && (
              <p style={{ fontSize: 7, color: 'var(--aap-green-lt)' }}>✓ Custom prompt active</p>
            )}
          </div>

          <div style={{ borderTop: '2px solid var(--aap-slate)', paddingTop: 10 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-yellow)', marginBottom: 8 }}>📦 PERMANENT INVENTORY</p>
            {permanentFiles.length === 0
              ? <p style={{ fontSize: 7, color: 'var(--aap-grey-dark)' }}>No files in /public/knowledge/</p>
              : permanentFiles.map(f => {
                const on = activePermIds.has(f.name);
                return (
                  <div key={f.name} onClick={() => togglePermFile(f.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 8px', marginBottom: 4, cursor: 'pointer', userSelect: 'none',
                      border: `2px solid ${on ? 'var(--aap-yellow)' : 'var(--aap-slate)'}`,
                      background: on ? 'var(--aap-forest)' : 'var(--aap-darkest)',
                    }}>
                    <span style={{ fontSize: 9 }}>{on ? '✓' : '○'}</span>
                    <span style={{ fontSize: 7, color: on ? 'var(--aap-yellow)' : 'var(--aap-grey)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                  </div>
                );
              })
            }
          </div>

          <div style={{ borderTop: '2px solid var(--aap-slate)', paddingTop: 10 }}>
            <p style={{ fontSize: 8, color: 'var(--aap-yellow)', marginBottom: 8 }}>📤 UPLOAD FILE</p>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px', cursor: 'pointer',
              border: '2px dashed var(--aap-slate)', background: 'var(--aap-darkest)',
            }}>
              <Upload size={12} style={{ color: 'var(--aap-grey)' }} />
              <span style={{ fontSize: 7, color: 'var(--aap-grey)' }}>Add .CSV or .TXT</span>
              <input type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleUploadFile} />
            </label>
            {uploadedFiles.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', marginTop: 4,
                border: '2px solid var(--aap-sky)', background: 'var(--aap-navy)',
              }}>
                <span style={{ fontSize: 7, color: 'var(--aap-sky)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <div onClick={() => removeUploadedFile(f.id)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                  <X size={10} style={{ color: 'var(--aap-red-bright)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Chat counter */}
          <div style={{ marginTop: 'auto', background: 'var(--aap-dark2)', border: '4px solid var(--aap-slate)', padding: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 7, color: 'var(--aap-grey)', marginBottom: 4 }}>CHAT COUNT</p>
            <p style={{ fontSize: 20, color: 'var(--aap-yellow)' }}>
              {chatCount} <span style={{ color: 'var(--aap-slate)', fontSize: 12 }}>/ 3</span>
            </p>
            {anyKbActive && <p style={{ fontSize: 7, color: 'var(--aap-green-lt)', marginTop: 4 }}>✦ RAG ACTIVE</p>}
          </div>
        </div>

        {/* BATTLE LOG */}
        <div style={{
          flex: 1, minHeight: 0,
          background: 'var(--aap-navy)', border: '4px solid var(--aap-sky)',
          boxShadow: 'inset -4px -4px 0 #0a1f40, inset 4px 4px 0 var(--aap-cyan), 4px 4px 0 var(--aap-darkest)',
          display: 'flex', flexDirection: 'column', padding: 14,
        }}>
          <p style={{ fontSize: 9, color: 'var(--aap-sky)', marginBottom: 10, flexShrink: 0 }}>
            ▶ BATTLE LOG
          </p>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4, minHeight: 0 }}>
            {messages.length === 0 && (
              <p style={{ fontSize: 8, color: 'var(--aap-slate)', fontStyle: 'italic' }}>
                The Oracle awaits your command...
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 12px', fontSize: 9, lineHeight: 1.8,
                  border: msg.role === 'user' ? '4px solid var(--aap-yellow)' : '4px solid var(--aap-slate)',
                  background: 'var(--aap-dark3)',
                  color: msg.role === 'user' ? 'var(--aap-yellow)' : 'var(--aap-grey-lt)',
                  boxShadow: 'inset -2px -2px 0 var(--aap-darkest)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={12} style={{ color: 'var(--aap-sky)', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 8, color: 'var(--aap-grey)' }}>Thinking...</span>
              </div>
            )}
            {error && (
              <div style={{ padding: '8px 12px', fontSize: 8, color: 'var(--aap-red-bright)', border: '2px solid var(--aap-red)', background: 'var(--aap-dark3)' }}>
                ✗ {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexShrink: 0 }}>
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Enter your command..."
              style={{
                flex: 1, fontSize: 9, padding: '8px 12px',
                background: 'var(--aap-dark2)', border: '4px solid var(--aap-grey-dark)',
                color: 'var(--aap-white)', outline: 'none', fontFamily: 'inherit',
                boxShadow: 'inset 2px 2px 0 var(--aap-darkest)',
              }}
            />
            <button type="button" onClick={handleSend} disabled={isThinking}
              style={{
                padding: '8px 14px', cursor: isThinking ? 'wait' : 'pointer',
                border: '4px solid var(--aap-yellow)', background: 'var(--aap-amber)',
                color: 'var(--aap-darkest)', fontFamily: 'inherit',
                boxShadow: 'inset -2px -2px 0 #a05000, 2px 2px 0 var(--aap-darkest)',
                opacity: isThinking ? 0.6 : 1,
              }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
