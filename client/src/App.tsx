import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { t, type Lang } from './i18n.js';
import { audio } from './audio.js';
import { Home } from './screens/Home.js';
import { Tutorial } from './screens/Tutorial.js';
import './styles.css';

export type ScreenName = 'home' | 'tutorial';

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
  const [screen, setScreen] = useState<ScreenName>('home');
  const [tick, setTick] = useState(0);

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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, characterId, screen, currentLessonIdx, completedLessons, tick]
  );

  const bump = () => setTick(x => x + 1);

  return (
    <Ctx.Provider value={ctx}>
      <div className="app">
        <header className="topbar">
          <div className="logo" onClick={() => go('home')}>
            <span className="logo-suit">♠</span> {t(lang, 'app.title')}
          </div>
          <div className="topbar-right">
            <button className={`chip ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`chip ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>中文</button>
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
        <footer className="footer">{t(lang, 'app.footer')}</footer>
      </div>
    </Ctx.Provider>
  );
}
