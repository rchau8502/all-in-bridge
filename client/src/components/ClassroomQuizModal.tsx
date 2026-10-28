import { useState, useEffect } from 'react';
import { t, type Lang } from '../i18n.js';
import { audio } from '../audio.js';
import type { ClassroomBoard, ClassroomPopQuiz } from '../../../shared/classroom-boards.js';

interface ClassroomQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  board: ClassroomBoard;
}

export function ClassroomQuizModal({ isOpen, onClose, lang, board }: ClassroomQuizModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    }
  }, [isOpen, board.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || board.quizzes.length === 0) return null;

  const currentQuiz: ClassroomPopQuiz = board.quizzes[currentIdx]!;
  const isLastQuiz = currentIdx === board.quizzes.length - 1;

  const handleSelectOption = (optId: string, isCorrect: boolean) => {
    if (isSubmitted) return;
    setSelectedOptionId(optId);
    setIsSubmitted(true);
    if (isCorrect) {
      audio.sfx('fanfare');
    } else {
      audio.sfx('click');
    }
  };

  const handleNext = () => {
    if (isLastQuiz) {
      onClose();
    } else {
      audio.sfx('click');
      setCurrentIdx(i => i + 1);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    }
  };

  return (
    <div className="glossary-backdrop" onClick={onClose}>
      <div className="classroom-quiz-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="quiz-card-header">
          <div className="quiz-header-titles">
            <span className="quiz-badge">🎓 {board.phaseLabel[lang]}</span>
            <h2 className="quiz-title">
              {t(lang, 'quiz.modalTitle')} · {board.title[lang]}
            </h2>
          </div>
          <button type="button" className="glossary-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="quiz-step-indicator">
          {board.quizzes.map((_, i) => (
            <div
              key={i}
              className={`quiz-dot ${i === currentIdx ? 'active' : i < currentIdx ? 'done' : ''}`}
            />
          ))}
          <span className="quiz-step-text">
            {currentIdx + 1} / {board.quizzes.length}
          </span>
        </div>

        {/* Question Body */}
        <div className="quiz-body">
          <h3 className="quiz-question-text">❓ {currentQuiz.question[lang]}</h3>

          <div className="quiz-options-list">
            {currentQuiz.options.map(opt => {
              const isSelected = selectedOptionId === opt.id;
              let optionClass = 'quiz-option-btn';
              if (isSubmitted) {
                if (opt.isCorrect) {
                  optionClass += ' is-correct';
                } else if (isSelected) {
                  optionClass += ' is-wrong';
                }
              } else if (isSelected) {
                optionClass += ' is-selected';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={optionClass}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                >
                  <span className="option-letter">{opt.id.toUpperCase()}</span>
                  <span className="option-text">{opt.text[lang]}</span>
                  {isSubmitted && opt.isCorrect && <span className="option-mark">✓</span>}
                  {isSubmitted && isSelected && !opt.isCorrect && <span className="option-mark">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback & Pedagogical Explanation */}
          {isSubmitted && (
            <div className="quiz-explanation-box">
              <div className="explanation-title">
                💡 {lang === 'zh' ? '助教带读解析' : 'Teacher Explanation'}:
              </div>
              <p className="explanation-p">{currentQuiz.explanation[lang]}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="quiz-card-footer">
          {isSubmitted ? (
            <button type="button" className="btn primary big quiz-action-btn" onClick={handleNext}>
              {isLastQuiz ? `✓ ${t(lang, 'quiz.closeBtn')}` : `▶ ${t(lang, 'quiz.nextBtn')}`}
            </button>
          ) : (
            <button type="button" className="btn ghost" onClick={onClose}>
              {t(lang, 'quiz.closeBtn')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
