import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { t, type Lang } from './i18n.js';
import { audio } from './audio.js';
import { Home } from './screens/Home.js';
import { Tutorial } from './screens/Tutorial.js';
import { Drill } from './screens/Drill.js';
import { FreePlay } from './screens/FreePlay.js';
import { GlossaryModal } from './components/GlossaryModal.js';
import { AchievementsModal } from './components/AchievementsModal.js';
import { ACHIEVEMENTS, getAchievement, type Achievement } from '../../shared/achievements.js';
import './styles.css';

export type ScreenName = 'home' | 'tutorial' | 'drill' | 'freeplay';
export type FeltTheme = 'teal' | 'green' | 'navy';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  characterId: string;
  setCharacterId: (c: string) => void;
  screen: ScreenName;
  go: (s: ScreenName) => void;
  currentLessonIdx: number;
  setCurrentLessonIdx: (idx: number) => void;
  goToLesson: (idx: number) => void;
  completedLessons: Set<string>;
  markLessonCompleted: (id: string) => void;
  fourColor: boolean;
  toggleFourColor: () => void;
  feltTheme: FeltTheme;
  cycleFeltTheme: () => void;
  openGlossaryWithQuery: (q?: string) => void;
  presentationMode: boolean;
  togglePresentationMode: () => void;
  unlockedAchievements: Set<string>;
  unlockAchievement: (id: string) => void;
  openAchievements: () => void;
}

const Ctx = createContext<AppCtx>(null as unknown as AppCtx);
export const useApp = () => useContext(Ctx);

export function App() {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('aib-lang') as Lang) || 'en');
  const [characterId, setCharacterId] = useState(() => localStorage.getItem('aib-char') || 'cowboy');
  const [currentLessonIdx, setCurrentLessonIdxState] = useState<number>(() => {
    const saved = localStorage.getItem('aib-lesson-idx');
    const parsed = saved !== null ? parseInt(saved, 10) : 0;
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('aib-completed-lessons');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [fourColor, setFourColor] = useState<boolean>(() => localStorage.getItem('aib-four-color') === '1');
  const [feltTheme, setFeltTheme] = useState<FeltTheme>(() => (localStorage.getItem('aib-felt-theme') as FeltTheme) || 'teal');
  const [presentationMode, setPresentationMode] = useState<boolean>(() => localStorage.getItem('aib-presentation-mode') === '1');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('aib-achievements');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [screen, setScreen] = useState<ScreenName>('home');
  const [tick, setTick] = useState(0);

  const togglePresentationMode = useCallback(() => {
    setPresentationMode(prev => {
      const next = !prev;
      localStorage.setItem('aib-presentation-mode', next ? '1' : '0');
      audio.sfx('click');
      return next;
    });
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setUnlockedAchievements(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('aib-achievements', JSON.stringify([...next]));
      const ach = getAchievement(id);
      if (ach) {
        audio.sfx('fanfare');
        setRecentAchievement(ach);
        window.setTimeout(() => {
          setRecentAchievement(cur => (cur?.id === id ? null : cur));
        }, 4000);
      }
      return next;
    });
  }, []);

  const openAchievements = useCallback(() => {
    audio.sfx('click');
    setAchievementsOpen(true);
  }, []);

  const openGlossaryWithQuery = useCallback((q?: string) => {
    setGlossaryQuery(q ?? '');
    setGlossaryOpen(true);
    audio.sfx('click');
  }, []);

  const toggleFourColor = useCallback(() => {
    setFourColor(prev => {
      const next = !prev;
      localStorage.setItem('aib-four-color', next ? '1' : '0');
      audio.sfx('click');
      return next;
    });
  }, []);

  const cycleFeltTheme = useCallback(() => {
    setFeltTheme(prev => {
      const next: FeltTheme = prev === 'teal' ? 'green' : prev === 'green' ? 'navy' : 'teal';
      localStorage.setItem('aib-felt-theme', next);
      audio.sfx('click');
      return next;
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('aib-lang', l);
  };

  const setCurrentLessonIdx = useCallback((idx: number) => {
    setCurrentLessonIdxState(idx);
    localStorage.setItem('aib-lesson-idx', String(idx));
  }, []);

  const markLessonCompleted = useCallback((id: string) => {
    setCompletedLessons(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('aib-completed-lessons', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const goToLesson = useCallback((idx: number) => {
    setCurrentLessonIdx(idx);
    audio.sfx('click');
    setScreen('tutorial');
  }, [setCurrentLessonIdx]);

  useEffect(() => {
    localStorage.setItem('aib-char', characterId);
  }, [characterId]);

  // Music starts on first interaction.
  useEffect(() => {
    const kick = () => {
      audio.unlock();
      if (audio.musicOn) audio.startMusic();
      window.removeEventListener('pointerdown', kick);
    };
    window.addEventListener('pointerdown', kick);
    return () => window.removeEventListener('pointerdown', kick);
  }, []);

  const go = (s: ScreenName) => {
    audio.sfx('click');
    setScreen(s);
  };

  const ctx = useMemo<AppCtx>(
    () => ({
      lang,
      setLang,
      characterId,
      setCharacterId,
      screen,
      go,
      currentLessonIdx,
      setCurrentLessonIdx,
      goToLesson,
      completedLessons,
      markLessonCompleted,
      fourColor,
      toggleFourColor,
      feltTheme,
      cycleFeltTheme,
      openGlossaryWithQuery,
      presentationMode,
      togglePresentationMode,
      unlockedAchievements,
      unlockAchievement,
      openAchievements,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, characterId, screen, currentLessonIdx, completedLessons, fourColor, feltTheme, presentationMode, togglePresentationMode, openGlossaryWithQuery, unlockedAchievements, unlockAchievement, openAchievements, tick]
  );

  const bump = () => setTick(x => x + 1);

  return (
    <Ctx.Provider value={ctx}>
      <div className={`app ${fourColor ? 'four-color' : ''} ${presentationMode ? 'presentation-mode' : ''} theme-felt-${feltTheme}`}>
        <header className="topbar">
          <div className="logo" onClick={() => go('home')}>
            <span className="logo-suit">♠</span> {t(lang, 'app.title')}
          </div>
          <div className="topbar-right">
            <button className={`chip ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`chip ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>中文</button>
            <button
              className={`chip ${fourColor ? 'active' : ''}`}
              onClick={toggleFourColor}
              title={t(lang, 'home.fourColor')}
            >🃏 4C</button>
            <button
              className={`chip presentation-chip ${presentationMode ? 'active' : ''}`}
              onClick={togglePresentationMode}
              title={t(lang, 'home.presentationMode')}
            >
              📺 {lang === 'zh' ? '投屏大字' : 'Cast'}
            </button>
            <button
              className="chip theme-chip"
              onClick={cycleFeltTheme}
              title={t(lang, 'home.theme')}
            >
              {feltTheme === 'teal' ? '🌊' : feltTheme === 'green' ? '🌲' : '🌌'}
            </button>
            <button
              className={`chip ${screen === 'drill' ? 'active' : ''}`}
              onClick={() => go('drill')}
              title={t(lang, 'drill.title')}
            >
              🎯 {t(lang, 'drill.title')}
            </button>
            <button
              className={`chip ${screen === 'freeplay' ? 'active' : ''}`}
              onClick={() => go('freeplay')}
              title={t(lang, 'freeplay.title')}
            >
              🃏 {t(lang, 'freeplay.title')}
            </button>
            <button
              className="chip"
              onClick={() => openGlossaryWithQuery('')}
              title={t(lang, 'home.glossary')}
            >
              📖 {t(lang, 'home.glossary')}
            </button>
            <button
              className="chip"
              onClick={openAchievements}
              title={t(lang, 'achievements.title')}
            >
              🏅 {t(lang, 'achievements.title')} ({unlockedAchievements.size}/{ACHIEVEMENTS.length})
            </button>
            <button
              className={`chip ${audio.musicOn ? 'active' : ''}`}
              onClick={() => { audio.musicOn = !audio.musicOn; if (audio.musicOn) audio.startMusic(); else audio.stopMusic(); bump(); }}
              title={t(lang, 'home.music')}
            >🎵</button>
            <button
              className={`chip ${audio.soundOn ? 'active' : ''}`}
              onClick={() => { audio.soundOn = !audio.soundOn; bump(); }}
              title={t(lang, 'home.sound')}
            >🔊</button>
          </div>
        </header>
        {screen === 'home' && <Home />}
        {screen === 'tutorial' && <Tutorial />}
        {screen === 'drill' && <Drill />}
        {screen === 'freeplay' && <FreePlay />}
        <footer className="footer">{t(lang, 'app.footer')}</footer>
      </div>
      <GlossaryModal
        lang={lang}
        isOpen={glossaryOpen}
        initialQuery={glossaryQuery}
        onClose={() => setGlossaryOpen(false)}
      />
      <AchievementsModal
        lang={lang}
        isOpen={achievementsOpen}
        unlockedIds={unlockedAchievements}
        onClose={() => setAchievementsOpen(false)}
      />
      {recentAchievement && (
        <div
          className="achievement-toast"
          role="alert"
          onClick={openAchievements}
        >
          <div className="toast-icon-wrap">
            <span className="toast-icon">{recentAchievement.icon}</span>
          </div>
          <div className="toast-text-wrap">
            <span className="toast-label">
              {lang === 'zh' ? '🎉 解锁新成就！' : '🎉 Achievement Unlocked!'}
            </span>
            <strong className="toast-title">{recentAchievement.title[lang]}</strong>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
