import { useEffect, useRef } from 'react';
import type { Lang } from '../i18n.js';
import { t, bidLabelL } from '../i18n.js';
import { audio } from '../audio.js';
import { ACBL_CHALLENGES, type Challenge } from '../../../shared/challenges.js';

interface ChallengesModalProps {
  lang: Lang;
  isOpen: boolean;
  solvedIds: Set<string>;
  onSelectChallenge: (challenge: Challenge) => void;
  onClose: () => void;
}

export function ChallengesModal({
  lang,
  isOpen,
  solvedIds,
  onSelectChallenge,
  onClose,
}: ChallengesModalProps) {
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

  const solvedCount = ACBL_CHALLENGES.filter(c => solvedIds.has(c.id)).length;

  return (
    <div
      className="modal-backdrop challenges-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) {
          audio.sfx('click');
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog challenges-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(lang, 'challenges.modalTitle')}
      >
        <div className="challenges-header">
          <div className="challenges-title-wrap">
            <h2 className="challenges-title">🎯 {t(lang, 'challenges.modalTitle')}</h2>
            <span className="challenges-sub">{t(lang, 'challenges.modalSubtitle')}</span>
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

        {/* Status progress bar */}
        <div className="challenges-progress-bar">
          <div className="progress-label-row">
            <span className="progress-text">
              {lang === 'zh'
                ? `通关进度：${solvedCount} / ${ACBL_CHALLENGES.length} 局`
                : `Progress: ${solvedCount} of ${ACBL_CHALLENGES.length} Completed`}
            </span>
            <span className="progress-percent">
              {Math.round((solvedCount / ACBL_CHALLENGES.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${(solvedCount / ACBL_CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Challenges list */}
        <div className="challenges-list">
          {ACBL_CHALLENGES.map(c => {
            const isSolved = solvedIds.has(c.id);
            const contractTag = bidLabelL(lang, { type: 'bid', level: c.contract.level, denom: c.contract.denom });

            return (
              <div
                key={c.id}
                className={`challenge-card ${isSolved ? 'solved' : ''}`}
              >
                <div className="challenge-card-header">
                  <div className="challenge-badges">
                    <span className="challenge-cat-badge">{c.category[lang]}</span>
                    <span className="challenge-contract-badge">{contractTag} · {t(lang, 'challenges.target', { count: c.targetTricks })}</span>
                    {isSolved && <span className="challenge-solved-badge">✓ {t(lang, 'challenges.completed')}</span>}
                  </div>
                  <span className="challenge-acbl-ref">{c.acblClassRef}</span>
                </div>

                <h3 className="challenge-item-title">{c.title[lang]}</h3>
                <p className="challenge-objective">{c.objective[lang]}</p>

                <div className="challenge-actions">
                  <button
                    type="button"
                    className={`btn ${isSolved ? 'ghost' : 'primary'}`}
                    onClick={() => {
                      audio.sfx('click');
                      onSelectChallenge(c);
                      onClose();
                    }}
                  >
                    ▶ {t(lang, 'challenges.playBtn')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
