import { useState, useEffect } from 'react';
import { t, type Lang } from '../i18n.js';
import { audio } from '../audio.js';
import type { FeltTheme } from '../App.js';
import type { SuitOrderPref } from '../../../shared/deck.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  fourColor: boolean;
  onToggleFourColor: () => void;
  feltTheme: FeltTheme;
  onChangeFeltTheme: (t: FeltTheme) => void;
  suitOrder: SuitOrderPref;
  onChangeSuitOrder: (order: SuitOrderPref) => void;
  presentationMode: boolean;
  onTogglePresentationMode: () => void;
  completedCount: number;
  totalLessons: number;
  achievementsCount: number;
  totalAchievements: number;
  onResetProgress: () => void;
}

export function SettingsModal(props: SettingsModalProps) {
  const { lang, isOpen, onClose } = props;

  const [sfxOn, setSfxOn] = useState(() => audio.soundOn);
  const [musicOn, setMusicOn] = useState(() => audio.musicOn);
  const [voiceOn, setVoiceOn] = useState(() => audio.voiceOn);
  const [hapticsOn, setHapticsOn] = useState(() => audio.hapticsOn);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmReset(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleSfx = () => {
    const next = !sfxOn;
    audio.setSoundOn(next);
    setSfxOn(next);
    if (next) audio.sfx('click');
  };

  const handleToggleMusic = () => {
    const next = !musicOn;
    audio.setMusicOn(next);
    setMusicOn(next);
  };

  const handleToggleVoice = () => {
    const next = !voiceOn;
    audio.setVoiceOn(next);
    setVoiceOn(next);
    audio.sfx('click');
  };

  const handleToggleHaptics = () => {
    const next = !hapticsOn;
    audio.setHapticsOn(next);
    setHapticsOn(next);
    if (next) audio.haptic([15, 30, 20]);
    audio.sfx('click');
  };

  const feltThemes: Array<{ id: FeltTheme; label: { en: string; zh: string }; color: string }> = [
    { id: 'teal', label: { en: 'Ocean Teal', zh: '海洋海蓝' }, color: '#134e4a' },
    { id: 'green', label: { en: 'Classic Felt', zh: '经典台呢绿' }, color: '#1b4d2e' },
    { id: 'navy', label: { en: 'Midnight Navy', zh: '午夜暗夜金' }, color: '#172a45' },
  ];

  return (
    <div className="glossary-backdrop" onClick={onClose}>
      <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
        <div className="glossary-header">
          <div className="glossary-title-wrap">
            <h2 className="glossary-title">⚙️ {t(lang, 'settings.title')}</h2>
          </div>
          <button type="button" className="glossary-close-btn" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="settings-modal-body">
          {/* Display & Visuals Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">🎨 {t(lang, 'settings.visuals')}</h3>

            <div className="settings-item">
              <div className="settings-item-info">
                <strong className="settings-item-label">{t(lang, 'settings.felt')}</strong>
                <span className="settings-item-desc">
                  {lang === 'zh' ? '切换牌桌毛呢材质与暗纹氛围' : 'Choose card table felt cloth atmosphere'}
                </span>
              </div>
              <div className="felt-theme-picker">
                {feltThemes.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`felt-theme-btn ${props.feltTheme === f.id ? 'active' : ''}`}
                    onClick={() => {
                      audio.sfx('click');
                      props.onChangeFeltTheme(f.id);
                    }}
                    style={{ '--felt-btn-color': f.color } as React.CSSProperties}
                  >
                    <span className="felt-swatch" />
                    <span>{f.label[lang]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <strong className="settings-item-label">{t(lang, 'settings.fourColor')}</strong>
                <span className="settings-item-desc">
                  {lang === 'zh'
                    ? '♠黑桃(黑) ♥红桃(红) ♦方块(橙) ♣梅花(绿) 消除混淆'
                    : '♠Spades(Black) ♥Hearts(Red) ♦Diamonds(Orange) ♣Clubs(Green)'}
                </span>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${props.fourColor ? 'on' : 'off'}`}
                onClick={props.onToggleFourColor}
              >
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-text">{props.fourColor ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <strong className="settings-item-label">{t(lang, 'settings.presentation')}</strong>
                <span className="settings-item-desc">
                  {lang === 'zh'
                    ? 'Jumbo Index 大字字体，牌面尺寸放大 30-40% 适应投屏'
                    : 'Jumbo Index typography & enlarged cards for screens and projectors'}
                </span>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${props.presentationMode ? 'on' : 'off'}`}
                onClick={props.onTogglePresentationMode}
              >
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-text">{props.presentationMode ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <strong className="settings-item-label">{t(lang, 'settings.suitOrder')}</strong>
                <span className="settings-item-desc">
                  {t(lang, 'settings.suitOrderDesc')}
                </span>
              </div>
              <div className="suit-order-picker" style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`chip ${props.suitOrder === 'standard' ? 'active' : ''}`}
                  onClick={() => {
                    audio.sfx('click');
                    props.onChangeSuitOrder('standard');
                  }}
                >
                  {t(lang, 'settings.suitOrderStandard')}
                </button>
                <button
                  type="button"
                  className={`chip ${props.suitOrder === 'reverse' ? 'active' : ''}`}
                  onClick={() => {
                    audio.sfx('click');
                    props.onChangeSuitOrder('reverse');
                  }}
                >
                  {t(lang, 'settings.suitOrderReverse')}
                </button>
              </div>
            </div>
          </div>

          {/* Audio & Haptics Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">🔊 {t(lang, 'settings.audio')}</h3>

            <div className="settings-grid-2col">
              <div className="settings-item compact">
                <div className="settings-item-info">
                  <strong className="settings-item-label">{t(lang, 'settings.sfx')}</strong>
                </div>
                <button
                  type="button"
                  className={`toggle-switch-btn ${sfxOn ? 'on' : 'off'}`}
                  onClick={handleToggleSfx}
                >
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                  <span className="toggle-text">{sfxOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="settings-item compact">
                <div className="settings-item-info">
                  <strong className="settings-item-label">{t(lang, 'settings.music')}</strong>
                </div>
                <button
                  type="button"
                  className={`toggle-switch-btn ${musicOn ? 'on' : 'off'}`}
                  onClick={handleToggleMusic}
                >
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                  <span className="toggle-text">{musicOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="settings-item compact">
                <div className="settings-item-info">
                  <strong className="settings-item-label">{t(lang, 'settings.voice')}</strong>
                </div>
                <button
                  type="button"
                  className={`toggle-switch-btn ${voiceOn ? 'on' : 'off'}`}
                  onClick={handleToggleVoice}
                >
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                  <span className="toggle-text">{voiceOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="settings-item compact">
                <div className="settings-item-info">
                  <strong className="settings-item-label">{t(lang, 'settings.haptics')}</strong>
                </div>
                <button
                  type="button"
                  className={`toggle-switch-btn ${hapticsOn ? 'on' : 'off'}`}
                  onClick={handleToggleHaptics}
                >
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                  <span className="toggle-text">{hapticsOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Guide */}
          <div className="settings-section">
            <h3 className="settings-section-title">⌨️ {t(lang, 'settings.shortcuts')}</h3>
            <div className="shortcuts-table">
              <div className="shortcut-row">
                <div className="shortcut-keys">
                  <kbd>Space</kbd> / <kbd>Enter</kbd>
                </div>
                <div className="shortcut-desc">
                  {lang === 'zh' ? '推进教学与对话步骤' : 'Advance tutorial & dialogue step'}
                </div>
              </div>
              <div className="shortcut-row">
                <div className="shortcut-keys">
                  <kbd>R</kbd>
                </div>
                <div className="shortcut-desc">
                  {lang === 'zh' ? '重置并重开当前课程' : 'Restart current lesson from beginning'}
                </div>
              </div>
              <div className="shortcut-row">
                <div className="shortcut-keys">
                  <kbd>Esc</kbd>
                </div>
                <div className="shortcut-desc">
                  {lang === 'zh' ? '关闭所有弹窗与面板' : 'Close open modals and panels'}
                </div>
              </div>
              <div className="shortcut-row">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>←</kbd> / <kbd>→</kbd>
                </div>
                <div className="shortcut-desc">
                  {lang === 'zh' ? '切换上一课 / 下一课' : 'Previous / next lesson navigation'}
                </div>
              </div>
              <div className="shortcut-row">
                <div className="shortcut-keys">
                  <kbd>U</kbd> / <kbd>Ctrl+Z</kbd>
                </div>
                <div className="shortcut-desc">
                  {t(lang, 'settings.shortcutUndo')}
                </div>
              </div>
            </div>
          </div>

          {/* Data & Storage Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">💾 {t(lang, 'settings.data')}</h3>
            <div className="settings-stats-row">
              <div className="stat-pill">
                <span className="stat-label">{lang === 'zh' ? '已完成课业' : 'Completed'}</span>
                <strong className="stat-val">
                  {props.completedCount} / {props.totalLessons}
                </strong>
              </div>
              <div className="stat-pill">
                <span className="stat-label">{lang === 'zh' ? '解锁勋章' : 'Badges'}</span>
                <strong className="stat-val">
                  {props.achievementsCount} / {props.totalAchievements}
                </strong>
              </div>
            </div>

            <div className="settings-reset-wrap">
              {confirmReset ? (
                <div className="reset-confirm-box">
                  <p className="reset-confirm-p">{t(lang, 'settings.resetConfirm')}</p>
                  <div className="reset-confirm-actions">
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => {
                        props.onResetProgress();
                        setConfirmReset(false);
                      }}
                    >
                      ⚠️ {lang === 'zh' ? '确认彻底重置' : 'Confirm Reset'}
                    </button>
                    <button
                      type="button"
                      className="btn small ghost"
                      onClick={() => setConfirmReset(false)}
                    >
                      {lang === 'zh' ? '取消' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn ghost small danger-text"
                  onClick={() => setConfirmReset(true)}
                >
                  🗑️ {t(lang, 'settings.reset')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
