import { useState, useRef, useEffect, useMemo } from 'react';
import type { Lang } from '../i18n.js';
import { ACBL_GLOSSARY, type RawGlossaryTerm } from '../../../shared/glossary.js';
import { audio } from '../audio.js';

interface InlineGlossaryTextProps {
  text: string;
  lang: Lang;
  className?: string;
  onOpenFullGlossary?: (termQuery: string) => void;
}

interface TermMatch {
  term: RawGlossaryTerm;
  word: string;
}

export function InlineGlossaryText({
  text,
  lang,
  className = '',
  onOpenFullGlossary,
}: InlineGlossaryTextProps) {
  const [activeTerm, setActiveTerm] = useState<RawGlossaryTerm | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!activeTerm) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveTerm(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveTerm(null);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTerm]);

  // Build sorted list of search keywords for regex matching (longer terms first)
  const keywordsMap = useMemo(() => {
    const map = new Map<string, RawGlossaryTerm>();
    for (const item of ACBL_GLOSSARY) {
      const w = item.term[lang].toLowerCase();
      map.set(w, item);
      // Also add common short aliases
      if (item.id === 'finesse') {
        map.set(lang === 'zh' ? '飞牌' : 'finesse', item);
      } else if (item.id === 'dummy') {
        map.set(lang === 'zh' ? '明手' : 'dummy', item);
      } else if (item.id === 'declarer') {
        map.set(lang === 'zh' ? '定约人' : 'declarer', item);
        map.set(lang === 'zh' ? '庄家' : 'declarer', item);
      } else if (item.id === 'opening-lead') {
        map.set(lang === 'zh' ? '首攻' : 'opening lead', item);
      } else if (item.id === 'contract') {
        map.set(lang === 'zh' ? '定约' : 'contract', item);
      } else if (item.id === 'overcall') {
        map.set(lang === 'zh' ? '争叫' : 'overcall', item);
        map.set('10-5-2', item);
      } else if (item.id === 'high-five') {
        map.set('high five', item);
      } else if (item.id === 'four-on-the-floor') {
        map.set('four on the floor', item);
      }
    }
    return map;
  }, [lang]);

  // Tokenize text into matches and plain strings
  const tokens = useMemo(() => {
    if (!text) return [];
    // Sort keys by length descending to match longest phrases first
    const keys = Array.from(keywordsMap.keys()).sort((a, b) => b.length - a.length);
    if (keys.length === 0) return [text];

    // Escape regex special chars
    const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');

    const parts = text.split(regex);
    return parts.map((part): string | TermMatch => {
      const match = keywordsMap.get(part.toLowerCase());
      if (match) {
        return { term: match, word: part };
      }
      return part;
    });
  }, [text, keywordsMap]);

  const handleTermClick = (e: React.MouseEvent, term: RawGlossaryTerm) => {
    e.stopPropagation();
    audio.sfx('click');
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPos({
      x: Math.min(window.innerWidth - 280, Math.max(16, rect.left + rect.width / 2 - 140)),
      y: rect.bottom + window.scrollY + 8,
    });
    setActiveTerm(term);
  };

  return (
    <>
      <span className={className}>
        {tokens.map((token, idx) => {
          if (typeof token === 'string') {
            return <span key={idx}>{token}</span>;
          }
          return (
            <button
              type="button"
              key={idx}
              className="glossary-inline-trigger"
              onClick={e => handleTermClick(e, token.term)}
              title={`${token.term.term[lang]} (${lang === 'zh' ? '点击查看释义' : 'tap for definition'})`}
            >
              {token.word}
              <span className="inline-glossary-dot" aria-hidden="true" />
            </button>
          );
        })}
      </span>

      {activeTerm && popoverPos && (
        <div
          ref={popoverRef}
          className="glossary-inline-popover"
          style={{ left: `${popoverPos.x}px`, top: `${popoverPos.y}px` }}
          onClick={e => e.stopPropagation()}
        >
          <div className="popover-top">
            <span className="popover-title">{activeTerm.term[lang]}</span>
            <button
              type="button"
              className="popover-close"
              onClick={() => setActiveTerm(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <p className="popover-def">{activeTerm.definition[lang]}</p>

          {activeTerm.mnemonic && (
            <div className="popover-mnemonic">
              💡 {activeTerm.mnemonic[lang]}
            </div>
          )}

          {activeTerm.ruleFormula && (
            <div className="popover-formula">
              📐 {activeTerm.ruleFormula[lang]}
            </div>
          )}

          {onOpenFullGlossary && (
            <button
              type="button"
              className="popover-more-btn"
              onClick={() => {
                const q = activeTerm.term[lang];
                setActiveTerm(null);
                onOpenFullGlossary(q);
              }}
            >
              {lang === 'zh' ? '查阅词典完整条目 ↗' : 'View in full glossary ↗'}
            </button>
          )}
        </div>
      )}
    </>
  );
}
