'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ConnectedServices = { gemini: boolean; groq: boolean; serper: boolean };

const DEFAULT_PLAYER_NAME = '_YOUR_NAME_';
const DEFAULT_SYS_MSG = 'You are a helpful AI assistant for the Build With AI Palembang 2026 workshop.';

export type QuestContextType = {
  ollamaConnected: boolean;
  chatCount: number;
  permanentKbUsed: boolean;
  ragChatCount: number;
  fileDirectlyUploaded: boolean;
  systemMessageModified: boolean;
  playerName: string;
  playerNameModified: boolean;

  incrementChatCount: () => void;
  incrementRagChatCount: () => void;
  markPermanentKbUsed: () => void;
  markFileDirectlyUploaded: () => void;
  markSystemMessageModified: () => void;
  setPlayerName: (name: string) => void;
  connectOllama: () => void;

  quests: {
    gemini: boolean; groq: boolean; ollama: boolean; serper: boolean;
    initialTry: boolean;
    permanentKbConnected: boolean;
    ragTry: boolean;
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
  const [ollamaConnected, setOllamaConnected]           = useState(false);
  const [chatCount, setChatCount]                       = useState(0);
  const [permanentKbUsed, setPermanentKbUsed]           = useState(false);
  const [ragChatCount, setRagChatCount]                 = useState(0);
  const [fileDirectlyUploaded, setFileDirectlyUploaded] = useState(false);
  const [systemMessageModified, setSystemMessageModified] = useState(false);
  const [playerName, setPlayerNameState]                = useState(DEFAULT_PLAYER_NAME);
  const [achievementQueue, setAchievementQueue]         = useState<string[]>([]);

  const playerNameModified = playerName !== DEFAULT_PLAYER_NAME && playerName.trim() !== '';

  const quests = {
    gemini:               initialConnections.gemini,
    groq:                 initialConnections.groq,
    serper:               initialConnections.serper,
    ollama:               ollamaConnected,
    initialTry:           chatCount >= 3,
    permanentKbConnected: permanentKbUsed,
    ragTry:               ragChatCount >= 1,
    fileUploaded:         fileDirectlyUploaded,
    systemMsgChanged:     systemMessageModified,
    nameChanged:          playerNameModified,
  };

  // Load from localStorage
  useEffect(() => {
    const load = (k: string) => localStorage.getItem(k);
    if (load('chatCount'))           setChatCount(parseInt(load('chatCount')!, 10));
    if (load('ragChatCount'))        setRagChatCount(parseInt(load('ragChatCount')!, 10));
    if (load('permanentKbUsed') === 'true') setPermanentKbUsed(true);
    if (load('fileUploaded') === 'true')    setFileDirectlyUploaded(true);
    if (load('sysModified') === 'true')     setSystemMessageModified(true);
    if (load('ollamaConnected') === 'true') setOllamaConnected(true);
    const savedName = load('playerName');
    if (savedName) setPlayerNameState(savedName);
  }, []);

  const push = useCallback((msg: string) => {
    setAchievementQueue(prev => [...prev, msg]);
  }, []);

  // Individual achievement triggers
  useEffect(() => { if (initialConnections.gemini) push('Google AI Studio Connected!'); }, [initialConnections.gemini]); // eslint-disable-line
  useEffect(() => { if (initialConnections.groq)   push('Groq Cloud Connected!');         }, [initialConnections.groq]);  // eslint-disable-line
  useEffect(() => { if (initialConnections.serper) push('Internet Search Unlocked!');     }, [initialConnections.serper]); // eslint-disable-line
  useEffect(() => { if (ollamaConnected)  push('Local Ollama is Online!');       }, [ollamaConnected,  push]);
  useEffect(() => { if (chatCount >= 3)   push('Chat Novice — 3 messages sent!');}, [chatCount,        push]);
  useEffect(() => { if (permanentKbUsed)  push('Knowledge Base Connected!');     }, [permanentKbUsed,  push]);
  useEffect(() => { if (ragChatCount >= 1) push('RAG Quest Complete!');          }, [ragChatCount,     push]);
  useEffect(() => { if (fileDirectlyUploaded) push('File Upload Mastered!');     }, [fileDirectlyUploaded, push]);
  useEffect(() => { if (systemMessageModified) push('System Prompt Customized!');}, [systemMessageModified, push]);
  useEffect(() => { if (playerNameModified) push('Identity Established!');       }, [playerNameModified, push]); // eslint-disable-line

  const incrementChatCount = useCallback(() => {
    setChatCount(p => { const n = p + 1; localStorage.setItem('chatCount', String(n)); return n; });
  }, []);

  const incrementRagChatCount = useCallback(() => {
    setRagChatCount(p => { const n = p + 1; localStorage.setItem('ragChatCount', String(n)); return n; });
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
      ollamaConnected, chatCount, permanentKbUsed, ragChatCount,
      fileDirectlyUploaded, systemMessageModified, playerName, playerNameModified,
      incrementChatCount, incrementRagChatCount, markPermanentKbUsed,
      markFileDirectlyUploaded, markSystemMessageModified, setPlayerName, connectOllama,
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
