import { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react';
import { t, type Lang } from './i18n.js';
import type { Seat } from '../../shared/deck.js';
import { GameClient } from './net.js';
import { audio } from './audio.js';
import { Home } from './screens/Home.js';
import { Lobby } from './screens/Lobby.js';
import { Table } from './screens/Table.js';
import { Tutorial } from './screens/Tutorial.js';
import { Compete } from './screens/Compete.js';
import './styles.css';

export type ScreenName = 'home' | 'lobby' | 'table' | 'tutorial' | 'compete';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  name: string;
  setName: (n: string) => void;
  characterId: string;
  setCharacterId: (c: string) => void;
  client: GameClient;
  screen: ScreenName;
  go: (s: ScreenName) => void;
  roomCode: string;
  setRoomCode: (c: string) => void;
  mySeat: Seat | 'observer' | null;
  setMySeat: (s: Seat | 'observer' | null) => void;
}

const Ctx = createContext<AppCtx>(null as unknown as AppCtx);
export const useApp = () => useContext(Ctx);

export function App() {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('aib-lang') as Lang) || 'en');
  const [name, setName] = useState(() => localStorage.getItem('aib-name') || '');
  const [characterId, setCharacterId] = useState(() => localStorage.getItem('aib-char') || 'cowboy');
  const [screen, setScreen] = useState<ScreenName>('home');
  const [tick, setTick] = useState(0);
  const [roomCode, setRoomCode] = useState('');
  const [mySeat, setMySeat] = useState<Seat | 'observer' | null>(null);
  const clientRef = useRef<GameClient | null>(null);
  if (!clientRef.current) clientRef.current = new GameClient();

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('aib-lang', l);
  };

  useEffect(() => {
    localStorage.setItem('aib-name', name);
  }, [name]);
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
      lang, setLang, name, setName, characterId, setCharacterId,
      client: clientRef.current!, screen, go, roomCode, setRoomCode, mySeat, setMySeat,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, name, characterId, screen, tick, roomCode, mySeat]
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
        {screen === 'lobby' && <Lobby />}
        {screen === 'table' && <Table />}
        {screen === 'tutorial' && <Tutorial />}
        {screen === 'compete' && <Compete />}
        <footer className="footer">{t(lang, 'app.footer')}</footer>
      </div>
    </Ctx.Provider>
  );
}
