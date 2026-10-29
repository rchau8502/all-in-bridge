import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { t, type Lang } from './i18n.js';
import { audio } from './audio.js';
import { Home } from './screens/Home.js';
import { Tutorial } from './screens/Tutorial.js';
import { Drill } from './screens/Drill.js';
import { FreePlay } from './screens/FreePlay.js';
import { GlossaryModal } from './components/GlossaryModal.js';
import { AchievementsModal } from './components/AchievementsModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { TeachingGuideModal } from './components/TeachingGuideModal.js';
import { getLessons } from '../../shared/lessons.js';
import { ACHIEVEMENTS, getAchievement, type Achievement } from '../../shared/achievements.js';
import type { SuitOrderPref } from '../../shared/deck.js';
import './styles.css';

export type ScreenName = 'home' | 'tutorial' | 'drill' | 'freeplay';
export type FeltTheme = 'teal' | 'green' | 'navy';
export type FreePlayMode = 'quick' | 'minibridge' | 'auction' | 'duo';

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
  freePlayInitialMode: FreePlayMode;
  goToFreePlay: (mode?: FreePlayMode) => void;
  lectureBoardId: string | null;
  goToLectureBoard: (boardId: string) => void;
  completedLessons: Set<string>;
  markLessonCompleted: (id: string) => void;
  fourColor: boolean;
  toggleFourColor: () => void;
  feltTheme: FeltTheme;
  cycleFeltTheme: () => void;
  suitOrder: SuitOrderPref;
  setSuitOrder: (order: SuitOrderPref) => void;
  openGlossaryWithQuery: (q?: string) => void;
  presentationMode: boolean;
  togglePresentationMode: () => void;
  unlockedAchievements: Set<string>;
  unlockAchievement: (id: string) => void;
  openAchievements: () => void;
  openSettings: () => void;
  openTeachingGuide: () => void;
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
  const [suitOrder, setSuitOrderState] = useState<SuitOrderPref>(() => (localStorage.getItem('aib-suit-order') as SuitOrderPref) || 'standard');
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [teachingGuideOpen, setTeachingGuideOpen] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [screen, setScreen] = useState<ScreenName>('home');
  const [tick, setTick] = useState(0);

  const openTeachingGuide = useCallback(() => {
    audio.sfx('click');
    setTeachingGuideOpen(true);
  }, []);

  const openSettings = useCallback(() => {
    audio.sfx('click');
    setSettingsOpen(true);
  }, []);

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

  const setSuitOrder = useCallback((order: SuitOrderPref) => {
    setSuitOrderState(order);
    localStorage.setItem('aib-suit-order', order);
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

  const [freePlayInitialMode, setFreePlayInitialMode] = useState<FreePlayMode>('quick');
  const [lectureBoardId, setLectureBoardId] = useState<string | null>(null);

  const goToFreePlay = useCallback((mode: FreePlayMode = 'quick') => {
    setFreePlayInitialMode(mode);
    setLectureBoardId(null);
    audio.sfx('click');
    setScreen('freeplay');
  }, []);

  const goToLectureBoard = useCallback((boardId: string) => {
    setLectureBoardId(boardId);
    audio.sfx('click');
    setScreen('freeplay');
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

  const handleResetProgress = useCallback(() => {
    try {
      localStorage.removeItem('aib-completed-lessons');
      localStorage.removeItem('aib-achievements');
      localStorage.removeItem('aib-lesson-idx');
      setCompletedLessons(new Set());
      setUnlockedAchievements(new Set());
      setCurrentLessonIdx(0);
      audio.sfx('coin');
    } catch {
      // ignore
    }
  }, [setCurrentLessonIdx]);

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
      freePlayInitialMode,
      goToFreePlay,
      lectureBoardId,
      goToLectureBoard,
      completedLessons,
      markLessonCompleted,
      fourColor,
      toggleFourColor,
      feltTheme,
      cycleFeltTheme,
      suitOrder,
      setSuitOrder,
      openGlossaryWithQuery,
      presentationMode,
      togglePresentationMode,
      unlockedAchievements,
      unlockAchievement,
      openAchievements,
      openSettings,
      openTeachingGuide,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, characterId, screen, currentLessonIdx, completedLessons, fourColor, feltTheme, suitOrder, presentationMode, togglePresentationMode, openGlossaryWithQuery, unlockedAchievements, unlockAchievement, openAchievements, openSettings, openTeachingGuide, tick]
  );

  const bump = () => setTick(x => x + 1);

  return (
    <Ctx.Provider value={ctx}>
      <div className={`app ${fourColor ? 'four-color' : ''} ${presentationMode ? 'presentation-mode' : ''} theme-felt-${feltTheme}${screen === 'tutorial' || screen === 'freeplay' ? ' scene-fixed' : ''}`}>
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
            <button
              type="button"
              className={`chip guide-chip ${teachingGuideOpen ? 'active' : ''}`}
              onClick={openTeachingGuide}
              title={t(lang, 'guide.button')}
            >
              🎓 {t(lang, 'guide.short')}
            </button>
            <button
              className={`chip ${settingsOpen ? 'active' : ''}`}
              onClick={openSettings}
              title={t(lang, 'settings.title')}
            >
              ⚙️ {t(lang, 'settings.title')}
            </button>
          </div>
        </header>
        {screen === 'home' && <Home />}
        {screen === 'tutorial' && <Tutorial />}
        {screen === 'drill' && <Drill />}
        {screen === 'freeplay' && (
          <FreePlay
            initialMode={freePlayInitialMode}
            lectureBoardId={lectureBoardId}
            onClearLectureBoard={() => setLectureBoardId(null)}
          />
        )}
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
      <TeachingGuideModal
        isOpen={teachingGuideOpen}
        onClose={() => setTeachingGuideOpen(false)}
        lang={lang}
        onGoToBasicsDrill={() => {
          go('drill');
        }}
        onGoToLesson={(idx: number) => {
          goToLesson(idx);
        }}
        onGoToMiniBridge={() => {
          goToFreePlay('minibridge');
        }}
        onGoToLectureBoard={(boardId: string) => {
          goToLectureBoard(boardId);
        }}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
        fourColor={fourColor}
        onToggleFourColor={toggleFourColor}
        feltTheme={feltTheme}
        onChangeFeltTheme={(t: FeltTheme) => {
          setFeltTheme(t);
          localStorage.setItem('aib-felt-theme', t);
        }}
        suitOrder={suitOrder}
        onChangeSuitOrder={setSuitOrder}
        presentationMode={presentationMode}
        onTogglePresentationMode={togglePresentationMode}
        completedCount={completedLessons.size}
        totalLessons={getLessons(lang).length}
        achievementsCount={unlockedAchievements.size}
        totalAchievements={ACHIEVEMENTS.length}
        onResetProgress={handleResetProgress}
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
