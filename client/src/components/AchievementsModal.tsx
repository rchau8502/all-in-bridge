import { useState, useEffect, useRef } from 'react';
import type { Lang } from '../i18n.js';
import { t } from '../i18n.js';
import { ACHIEVEMENTS } from '../../../shared/achievements.js';
import { audio } from '../audio.js';

interface AchievementsModalProps {
  lang: Lang;
  isOpen: boolean;
  unlockedIds: Set<string>;
  onClose: () => void;
}

export function AchievementsModal({
  lang,
  isOpen,
  unlockedIds,
  onClose,
}: AchievementsModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'tutorial' | 'drill' | 'play'>('all');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        audio.sfx('click');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = ACHIEVEMENTS.filter(a => activeTab === 'all' || a.category === activeTab);
  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;
  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div
      className="modal-backdrop achievements-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) {
          audio.sfx('click');
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog achievements-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(lang, 'achievements.title')}
      >
        <div className="achievements-header">
          <div className="achievements-title-wrap">
            <h2 className="achievements-title">🏅 {t(lang, 'achievements.title')}</h2>
            <span className="achievements-sub">{t(lang, 'achievements.subtitle')}</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => {
              audio.sfx('click');
              onClose();
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="achievements-progress-card">
          <div className="progress-label-row">
            <span className="progress-text">
              {lang === 'zh'
                ? `总进度：${unlockedCount} / ${ACHIEVEMENTS.length} 已解锁`
                : `Progress: ${unlockedCount} of ${ACHIEVEMENTS.length} Unlocked`}
            </span>
            <span className="progress-percent">{progressPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="achievements-tabs">
          {(
            [
              { id: 'all', label: lang === 'zh' ? '全部' : 'All' },
              { id: 'tutorial', label: lang === 'zh' ? '教程' : 'Bootcamp' },
              { id: 'drill', label: lang === 'zh' ? '速训' : 'Drills' },
              { id: 'play', label: lang === 'zh' ? '对局' : 'Practice' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`achievements-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                audio.sfx('click');
                setActiveTab(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="achievements-grid">
          {filtered.map(a => {
            const isUnlocked = unlockedIds.has(a.id);
            return (
              <div
                key={a.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="badge-icon-wrap">
                  <span className="badge-icon">{a.icon}</span>
                  {isUnlocked && <span className="badge-glow-ring" />}
                </div>
                <div className="badge-info">
                  <div className="badge-title-row">
                    <span className="badge-title">{a.title[lang]}</span>
                    <span className={`badge-status ${isUnlocked ? 'status-unlocked' : 'status-locked'}`}>
                      {isUnlocked ? t(lang, 'achievements.unlocked') : t(lang, 'achievements.locked')}
                    </span>
                  </div>
                  <p className="badge-desc">{a.description[lang]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
