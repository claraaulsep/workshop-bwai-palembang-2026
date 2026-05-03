'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ConnectedServices = {
  gemini: boolean;
  groq: boolean;
  serper: boolean;
  loginEnabled: boolean;
};

const DEFAULT_PLAYER_NAME = '_YOUR_NAME_';
const DEFAULT_SYS_MSG = 'You are a helpful AI assistant for the Build With AI Palembang 2026 workshop.';

export type QuestContextType = {
  ollamaConnected: boolean;
  chatCount: number;
  permanentKbUsed: boolean;
  ragChatCount: number;
  serperChatCount: number;
  fileDirectlyUploaded: boolean;
  systemMessageModified: boolean;
  playerName: string;
  playerNameModified: boolean;
  noneShallPassCompleted: boolean;

  incrementChatCount: () => void;
  incrementRagChatCount: () => void;
  incrementSerperChatCount: () => void;
  markPermanentKbUsed: () => void;
  markFileDirectlyUploaded: () => void;
  markSystemMessageModified: () => void;
  markNoneShallPassCompleted: () => void;
  resetProgress: () => void;
  setPlayerName: (name: string) => void;
  connectOllama: () => void;

  quests: {
    gemini: boolean; groq: boolean; ollama: boolean; serper: boolean;
    loginEnabled: boolean;
    initialTry: boolean;
    permanentKbConnected: boolean;
    ragTry: boolean;
    serperTry: boolean;
    noneShallPass: boolean;
    // side
    fileUploaded: boolean;
    systemMsgChanged: boolean;
    nameChanged: boolean;
  };

  achievementQueue: string[];
  popAchievement: () => void;
};

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children, initialConnections }: {
  children: React.ReactNode;
  initialConnections: ConnectedServices;
}) {
  const [ollamaConnected,         setOllamaConnected]         = useState(false);
  const [chatCount,               setChatCount]               = useState(0);
  const [permanentKbUsed,         setPermanentKbUsed]         = useState(false);
  const [ragChatCount,            setRagChatCount]            = useState(0);
  const [serperChatCount,         setSerperChatCount]         = useState(0);
  const [fileDirectlyUploaded,    setFileDirectlyUploaded]    = useState(false);
  const [systemMessageModified,   setSystemMessageModified]   = useState(false);
  const [playerName,              setPlayerNameState]         = useState(DEFAULT_PLAYER_NAME);
  const [noneShallPassCompleted,  setNoneShallPassCompleted]  = useState(false);
  const [achievementQueue,        setAchievementQueue]        = useState<string[]>([]);

  const playerNameModified = playerName !== DEFAULT_PLAYER_NAME && playerName.trim() !== '';

  const quests = {
    gemini:               initialConnections.gemini,
    groq:                 initialConnections.groq,
    serper:               initialConnections.serper,
    loginEnabled:         initialConnections.loginEnabled,
    ollama:               ollamaConnected,
    initialTry:           chatCount >= 3,
    permanentKbConnected: permanentKbUsed,
    ragTry:               ragChatCount >= 3,
    serperTry:            serperChatCount >= 3,
    noneShallPass:        noneShallPassCompleted,
    fileUploaded:         fileDirectlyUploaded,
    systemMsgChanged:     systemMessageModified,
    nameChanged:          playerNameModified,
  };

  // ── Load from localStorage once on mount ───────────────────────────────────
  useEffect(() => {
    const load = (k: string) => localStorage.getItem(k);
    const num  = (k: string) => parseInt(load(k) ?? '0', 10);

    if (load('chatCount'))               setChatCount(num('chatCount'));
    if (load('ragChatCount'))            setRagChatCount(num('ragChatCount'));
    if (load('serperChatCount'))         setSerperChatCount(num('serperChatCount'));
    if (load('permanentKbUsed')   === 'true') setPermanentKbUsed(true);
    if (load('fileUploaded')      === 'true') setFileDirectlyUploaded(true);
    if (load('sysModified')       === 'true') setSystemMessageModified(true);
    if (load('ollamaConnected')   === 'true') setOllamaConnected(true);
    if (load('noneShallPass')     === 'true') setNoneShallPassCompleted(true);
    const savedName = load('playerName');
    if (savedName) setPlayerNameState(savedName);
  }, []);

  const push = useCallback((msg: string) => {
    setAchievementQueue(prev => [...prev, msg]);
  }, []);

  // ── One-time API key connection achievements ────────────────────────────────
  // Each fires ONCE ever — guarded by a localStorage flag to survive page refreshes.
  useEffect(() => {
    if (initialConnections.gemini && !localStorage.getItem('ach_gemini')) {
      localStorage.setItem('ach_gemini', 'true');
      push('Google AI Studio Connected!');
    }
  }, [initialConnections.gemini]); // eslint-disable-line

  useEffect(() => {
    if (initialConnections.groq && !localStorage.getItem('ach_groq')) {
      localStorage.setItem('ach_groq', 'true');
      push('Groq Cloud Connected!');
    }
  }, [initialConnections.groq]); // eslint-disable-line

  useEffect(() => {
    if (initialConnections.serper && !localStorage.getItem('ach_serper')) {
      localStorage.setItem('ach_serper', 'true');
      push('Internet Search Unlocked!');
    }
  }, [initialConnections.serper]); // eslint-disable-line

  // ── Gameplay achievement triggers (each fires once via state dependency) ───
  useEffect(() => { if (ollamaConnected)       push('Local Ollama is Online!');        }, [ollamaConnected,        push]);
  useEffect(() => { if (chatCount >= 3)        push('Chat Novice — 3 messages sent!'); }, [chatCount,              push]);
  useEffect(() => { if (permanentKbUsed)       push('Knowledge Base Connected!');      }, [permanentKbUsed,        push]);
  useEffect(() => { if (ragChatCount >= 3)     push('RAG Master — 3 RAG chats done!'); }, [ragChatCount,           push]);
  useEffect(() => { if (serperChatCount >= 3)  push('Web Search Expert!');             }, [serperChatCount,        push]);
  useEffect(() => { if (fileDirectlyUploaded)  push('File Upload Mastered!');          }, [fileDirectlyUploaded,   push]);
  useEffect(() => { if (systemMessageModified) push('System Prompt Customized!');      }, [systemMessageModified,  push]);
  useEffect(() => { if (playerNameModified)    push('Identity Established!');          }, [playerNameModified,     push]); // eslint-disable-line
  useEffect(() => { if (noneShallPassCompleted) push('🔐 NONE SHALL PASS — Secret Unlocked!'); }, [noneShallPassCompleted, push]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const incrementChatCount = useCallback(() => {
    setChatCount(p => { const n = p + 1; localStorage.setItem('chatCount', String(n)); return n; });
  }, []);

  const incrementRagChatCount = useCallback(() => {
    setRagChatCount(p => { const n = p + 1; localStorage.setItem('ragChatCount', String(n)); return n; });
  }, []);

  const incrementSerperChatCount = useCallback(() => {
    setSerperChatCount(p => { const n = p + 1; localStorage.setItem('serperChatCount', String(n)); return n; });
  }, []);

  const markPermanentKbUsed = useCallback(() => {
    setPermanentKbUsed(true); localStorage.setItem('permanentKbUsed', 'true');
  }, []);

  const markFileDirectlyUploaded = useCallback(() => {
    setFileDirectlyUploaded(true); localStorage.setItem('fileUploaded', 'true');
  }, []);

  const markSystemMessageModified = useCallback(() => {
    setSystemMessageModified(true); localStorage.setItem('sysModified', 'true');
  }, []);

  const markNoneShallPassCompleted = useCallback(() => {
    setNoneShallPassCompleted(true); localStorage.setItem('noneShallPass', 'true');
  }, []);

  const resetProgress = useCallback(() => {
    // Clear all quest counters and completion flags from localStorage
    const keys = [
      'chatCount', 'ragChatCount', 'serperChatCount',
      'permanentKbUsed', 'fileUploaded', 'sysModified',
      'ollamaConnected', 'noneShallPass',
      'ach_gemini', 'ach_groq', 'ach_serper',
    ];
    keys.forEach(k => localStorage.removeItem(k));
    // Reset all state (keep playerName)
    setChatCount(0);
    setRagChatCount(0);
    setSerperChatCount(0);
    setPermanentKbUsed(false);
    setFileDirectlyUploaded(false);
    setSystemMessageModified(false);
    setOllamaConnected(false);
    setNoneShallPassCompleted(false);
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setPlayerNameState(name); localStorage.setItem('playerName', name);
  }, []);

  const connectOllama = useCallback(() => {
    setOllamaConnected(true); localStorage.setItem('ollamaConnected', 'true');
  }, []);

  const popAchievement = useCallback(() => {
    setAchievementQueue(p => p.slice(1));
  }, []);

  return (
    <QuestContext.Provider value={{
      ollamaConnected, chatCount, permanentKbUsed, ragChatCount, serperChatCount,
      fileDirectlyUploaded, systemMessageModified, playerName, playerNameModified,
      noneShallPassCompleted,
      incrementChatCount, incrementRagChatCount, incrementSerperChatCount,
      markPermanentKbUsed, markFileDirectlyUploaded, markSystemMessageModified,
      markNoneShallPassCompleted, resetProgress, setPlayerName, connectOllama,
      quests, achievementQueue, popAchievement,
    }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error('useQuest must be used within QuestProvider');
  return ctx;
}

export { DEFAULT_SYS_MSG, DEFAULT_PLAYER_NAME };
