'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useQuest } from '@/context/QuestContext';

export default function AchievementToast() {
  const { achievementQueue, popAchievement } = useQuest();
  const currentAchievement = achievementQueue[0];

  useEffect(() => {
    if (currentAchievement) {
      const timer = setTimeout(() => {
        popAchievement();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [currentAchievement, popAchievement]);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none" style={{ maxWidth: '340px', width: '100%' }}>
      <AnimatePresence mode="wait">
        {currentAchievement && (
          <motion.div
            key={currentAchievement}
            initial={{ opacity: 0, y: 60, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              background: 'var(--aap-dark3)',
              border: '4px solid var(--aap-yellow)',
              boxShadow: 'inset -4px -4px 0 #9a7000, inset 4px 4px 0 #fffc40, 4px 4px 0 var(--aap-darkest), 0 0 20px rgba(255,213,65,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
            }}
          >
            {/* Icon Box */}
            <div style={{
              background: 'var(--aap-amber)',
              border: '4px solid var(--aap-yellow)',
              padding: '8px',
              flexShrink: 0,
              boxShadow: 'inset -2px -2px 0 #a05000, inset 2px 2px 0 var(--aap-yellow-lt)',
            }}>
              <Trophy size={20} style={{ color: 'var(--aap-darkest)' }} />
            </div>
            <div>
              <p style={{ fontSize: '8px', color: 'var(--aap-yellow)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
                ★ Achievement Unlocked ★
              </p>
              <p style={{ fontSize: '9px', color: 'var(--aap-grey-lt)', lineHeight: 1.7 }}>
                {currentAchievement}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
