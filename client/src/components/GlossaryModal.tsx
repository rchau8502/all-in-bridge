import { useState, useMemo, useEffect } from 'react';
import type { Lang } from '../i18n.js';
import { getGlossaryTerms, type TermCategory } from '../../../shared/glossary.js';
import { audio } from '../audio.js';

interface GlossaryModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const CATEGORY_NAMES: Record<Lang, Record<TermCategory | 'all', string>> = {
  en: {
    all: 'All',
    basics: 'Basics',
    bidding: 'Bidding',
    play: 'Play & Defense',
    scoring: 'Scoring',
  },
  zh: {
    all: '全部',
    basics: '基础规则',
    bidding: '叫牌约定',
    play: '做牌与防守',
    scoring: '算分与成局',
  },
};

export function GlossaryModal({ lang, isOpen, onClose, initialQuery = '' }: GlossaryModalProps) {
  const [selectedCat, setSelectedCat] = useState<TermCategory | 'all'>('all');
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialQuery, onClose]);

  const terms = useMemo(() => {
    return getGlossaryTerms(lang, selectedCat, query);
  }, [lang, selectedCat, query]);

  if (!isOpen) return null;

  return (
    <div className="glossary-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="glossary-dialog" onClick={e => e.stopPropagation()}>
        <div className="glossary-header">
          <div className="glossary-title">
            <span className="glossary-icon">📖</span>
            {lang === 'zh' ? 'ACBL 桥牌术语与口诀词典' : 'ACBL Bridge Glossary & Mnemonics'}
          </div>
          <button
            className="chip glossary-close-btn"
            onClick={() => { audio.sfx('click'); onClose(); }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="glossary-search-row">
          <input
            type="search"
            className="input glossary-search-input"
            placeholder={lang === 'zh' ? '搜索术语、口诀或规则（如 飞牌、HCP、10-5-2）...' : 'Search terms or mnemonics (e.g. Finesse, HCP, High Five)...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="glossary-cat-row">
          {(['all', 'basics', 'bidding', 'play', 'scoring'] as const).map(cat => (
            <button
              key={cat}
              className={`chip ${selectedCat === cat ? 'active' : ''}`}
              onClick={() => { audio.sfx('click'); setSelectedCat(cat); }}
            >
              {CATEGORY_NAMES[lang][cat]}
            </button>
          ))}
        </div>

        <div className="glossary-list">
          {terms.length === 0 ? (
            <div className="glossary-empty">
              {lang === 'zh' ? '未找到相关术语，换个关键词试试看吧。' : 'No terms found. Try another search keyword.'}
            </div>
          ) : (
            terms.map(t => (
              <div key={t.id} className="glossary-card">
                <div className="glossary-card-top">
                  <span className="glossary-term-name">{t.term}</span>
                  <div className="glossary-tags">
                    {t.acblClass && (
                      <span className="glossary-class-badge">
                        {lang === 'zh' ? `第 ${t.acblClass} 课` : `Class ${t.acblClass}`}
                      </span>
                    )}
                    <span className={`glossary-cat-badge cat-${t.category}`}>
                      {CATEGORY_NAMES[lang][t.category]}
                    </span>
                  </div>
                </div>

                <p className="glossary-def">{t.definition}</p>

                {t.ruleFormula && (
                  <div className="glossary-formula">
                    <span className="formula-icon">📐</span>
                    <b>{t.ruleFormula}</b>
                  </div>
                )}

                {t.mnemonic && (
                  <div className="glossary-mnemonic">
                    <span className="mnemonic-icon">💡</span>
                    <span>{t.mnemonic}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
