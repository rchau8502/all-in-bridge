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
  const [reconnecting, setReconnecting] = useState(false);
  const clientRef = useRef<GameClient | null>(null);
  if (!clientRef.current) clientRef.current = new GameClient();
  const stateRef = useRef({ roomCode, screen, name, characterId, lang });
  stateRef.current = { roomCode, screen, name, characterId, lang };
  const reconnectingRef = useRef(false);

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

  // Auto-reconnect: if the socket drops while inside a room, retry and rejoin.
  // The server matches the stable player id, restores the seat, and replies
  // with room_snapshot, which the active screen applies.
  useEffect(() => {
    const client = clientRef.current!;
    client.onClose = (manual: boolean) => {
      if (manual) return;
      const s = stateRef.current;
      if (!s.roomCode || s.screen === 'home' || s.screen === 'tutorial') return;
      if (reconnectingRef.current) return;
      reconnectingRef.current = true;
      setReconnecting(true);
      void (async () => {
        let ok = false;
        for (let i = 0; i < 8 && !ok; i++) {
          await new Promise(r => setTimeout(r, 1500));
          try {
            await client.connect();
            ok = true;
          } catch { /* retry */ }
        }
        if (ok) {
          const cur = stateRef.current;
          client.join(cur.roomCode, cur.name.trim() || 'Player', cur.characterId, cur.lang);
        } else {
          // Give up: back to home so the user can rejoin by hand.
          stateRef.current = { ...stateRef.current, roomCode: '', screen: 'home' };
          setRoomCode('');
          setMySeat(null);
          setScreen('home');
        }
        reconnectingRef.current = false;
        setReconnecting(false);
      })();
    };
    return () => { client.onClose = () => {}; };
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
        {reconnecting && (
          <div className="reconnect-overlay">
            <div className="reconnect-card">🔄 {t(lang, 'conn.reconnecting')}</div>
          </div>
        )}
        <footer className="footer">{t(lang, 'app.footer')}</footer>
      </div>
    </Ctx.Provider>
  );
}
