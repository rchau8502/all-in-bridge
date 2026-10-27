import { useState, useEffect, useRef } from 'react';
import type { Lang } from '../i18n.js';
import { t } from '../i18n.js';
import { audio } from '../audio.js';

interface PbnModalProps {
  lang: Lang;
  isOpen: boolean;
  currentDealPbn: string;
  onLoadPbn: (pbn: string) => boolean;
  onClose: () => void;
}

export function PbnModal({
  lang,
  isOpen,
  currentDealPbn,
  onLoadPbn,
  onClose,
}: PbnModalProps) {
  const [pasteText, setPasteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPasteText('');
    setCopied(false);
    setErrorMsg('');
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentDealPbn);
      setCopied(true);
      audio.sfx('click');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleImport = () => {
    if (!pasteText.trim()) return;
    const ok = onLoadPbn(pasteText.trim());
    if (ok) {
      audio.sfx('shuffle');
      onClose();
    } else {
      audio.sfx('lose');
      setErrorMsg(t(lang, 'pbn.invalid'));
    }
  };

  return (
    <div
      className="modal-backdrop pbn-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) {
          audio.sfx('click');
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog pbn-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(lang, 'pbn.modalTitle')}
      >
        <div className="pbn-header">
          <h2 className="pbn-title">📋 {t(lang, 'pbn.modalTitle')}</h2>
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

        {/* Section 1: Export Current Deal */}
        <div className="pbn-section">
          <label className="pbn-label">{t(lang, 'pbn.exportDesc')}</label>
          <div className="pbn-copy-row">
            <input
              type="text"
              readOnly
              value={currentDealPbn}
              className="pbn-input readonly"
              onClick={e => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              className="btn primary"
              onClick={handleCopy}
            >
              {copied ? t(lang, 'pbn.copied') : t(lang, 'pbn.copyBtn')}
            </button>
          </div>
        </div>

        <div className="pbn-divider" />

        {/* Section 2: Import Custom Deal */}
        <div className="pbn-section">
          <label className="pbn-label">{t(lang, 'pbn.importDesc')}</label>
          <textarea
            className="pbn-textarea"
            placeholder='e.g. N:AK5.T98.765.4322 QJT.K76.432.AKQ5 ... or [Deal "N:..."]'
            value={pasteText}
            onChange={e => {
              setPasteText(e.target.value);
              setErrorMsg('');
            }}
            rows={3}
          />
          {errorMsg && <div className="pbn-error">{errorMsg}</div>}
          <div className="pbn-actions">
            <button
              type="button"
              className="btn primary big"
              onClick={handleImport}
              disabled={!pasteText.trim()}
            >
              📥 {t(lang, 'pbn.loadBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
