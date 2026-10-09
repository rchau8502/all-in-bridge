import { useState } from 'react';
import { useApp } from '../App.js';
import { t } from '../i18n.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { audio } from '../audio.js';
import type { GameEvent } from '../../../shared/events.js';

const errCode = (ev: GameEvent): string | null =>
  ev.type === 'error' ? (ev.payload as { code: string }).code : null;

export function Home() {
  const { lang, name, setName, characterId, setCharacterId, client, go, setRoomCode, setMySeat } = useApp();
  const [joinCode, setJoinCode] = useState('');
  const [compName, setCompName] = useState('');
  const [compBoards, setCompBoards] = useState('8');
  const [followCode, setFollowCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const ensureConnected = async (): Promise<boolean> => {
    if (client.connected) return true;
    setBusy(true);
    try {
      await client.connect();
      return true;
    } catch {
      setErr('Connection failed — is the game server running?');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const playerName = name.trim() || `Player${Math.floor(Math.random() * 900 + 100)}`;

  const doCreate = async () => {
    if (!(await ensureConnected())) return;
    audio.sfx('join');
    client.onEvent = ev => {
      if (ev.type === 'room_joined') {
        const pl = ev.payload as { roomCode: string; seat: 'N' | 'E' | 'S' | 'W' | 'observer' };
        setRoomCode(pl.roomCode);
        setMySeat(pl.seat);
        go('lobby');
      }
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.join(undefined, playerName, characterId, lang);
  };

  const doJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    if (!(await ensureConnected())) return;
    audio.sfx('join');
    client.onEvent = ev => {
      if (ev.type === 'room_joined') {
        const pl = ev.payload as { roomCode: string; seat: 'N' | 'E' | 'S' | 'W' | 'observer' };
        setRoomCode(pl.roomCode);
        setMySeat(pl.seat);
        go('lobby');
      }
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.join(code, playerName, characterId, lang);
  };

  const doCreateComp = async () => {
    if (!(await ensureConnected())) return;
    const boards = Math.max(1, Math.min(32, parseInt(compBoards, 10) || 8));
    client.onEvent = ev => {
      if (ev.type === 'competition_created') go('compete');
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.createCompetition(compName.trim() || 'Friday Game', boards);
  };

  const doFollow = async () => {
    const code = followCode.trim().toUpperCase();
    if (!code) return;
    if (!(await ensureConnected())) return;
    client.onEvent = ev => {
      if (ev.type === 'competition_joined') go('compete');
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.followCompetition(code);
  };

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-title">{t(lang, 'app.title')}</div>
        <div className="hero-sub">{t(lang, 'app.subtitle')}</div>
      </div>
      {import.meta.env.VITE_DEMO === '1' && (
        <div className="demo-banner">{t(lang, 'home.demo')}</div>
      )}

      <input
        className="input name-input"
        placeholder={t(lang, 'home.namePh')}
        value={name}
        maxLength={16}
        onChange={e => setName(e.target.value)}
      />

      <div className="section-label">{t(lang, 'home.character')}</div>
      <div className="char-row">
        {CHARACTERS.map(c => (
          <button
            key={c.id}
            className={`char-card ${characterId === c.id ? 'active' : ''}`}
            onClick={() => { setCharacterId(c.id); audio.sfx('click'); }}
            style={{ ['--c1' as string]: c.colors.primary, ['--c2' as string]: c.colors.secondary }}
          >
            <span className="char-emoji">{c.emoji}</span>
            <span className="char-name">{lang === 'zh'
              ? { cowboy: '牛仔', gamer: '电竞少年', grandma: '奶奶', robot: '机器人' }[c.id]
              : c.id[0]!.toUpperCase() + c.id.slice(1)}</span>
          </button>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn primary big" disabled={busy} onClick={doCreate}>
          {t(lang, 'home.createRoom')}
        </button>
      </div>
      <div className="join-row">
        <input
          className="input"
          placeholder={t(lang, 'home.joinPh')}
          value={joinCode}
          maxLength={6}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && doJoin()}
        />
        <button className="btn" disabled={busy} onClick={doJoin}>{t(lang, 'home.join')}</button>
      </div>

      <button className="btn ghost big" onClick={() => go('tutorial')}>
        🎓 {t(lang, 'home.tutorial')}
      </button>

      <div className="comp-box">
        <div className="section-label">🏆 {t(lang, 'home.compTitle')}</div>
        <div className="join-row">
          <input
            className="input" placeholder={t(lang, 'home.compNamePh')}
            value={compName} maxLength={30} onChange={e => setCompName(e.target.value)}
          />
          <input
            className="input boards" placeholder={t(lang, 'home.compBoards')}
            value={compBoards} inputMode="numeric" onChange={e => setCompBoards(e.target.value)}
          />
          <button className="btn" disabled={busy} onClick={doCreateComp}>{t(lang, 'home.createComp')}</button>
        </div>
        <div className="join-row">
          <input
            className="input" placeholder={t(lang, 'home.followPh')}
            value={followCode} maxLength={6} onChange={e => setFollowCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && doFollow()}
          />
          <button className="btn" disabled={busy} onClick={doFollow}>{t(lang, 'home.follow')}</button>
        </div>
      </div>

      <p className="hint">{t(lang, 'home.howto')}</p>
      {err && <div className="error">{err}</div>}
    </div>
  );
}
