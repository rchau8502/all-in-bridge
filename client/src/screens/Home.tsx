import { useState } from 'react';
import { useApp } from '../App.js';
import { t, seatLabel } from '../i18n.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { Avatar } from '../components/ui.js';
import { audio } from '../audio.js';
import type { GameEvent } from '../../../shared/events.js';
import type { CompetitionSummary, PlayerStatsData, LeaderboardEntry } from '../../../shared/events.js';

const errCode = (ev: GameEvent): string | null =>
  ev.type === 'error' ? (ev.payload as { code: string }).code : null;

const DURATIONS = [
  { hours: 0, label: 'home.noLimit' },
  { hours: 24, label: '1d' },
  { hours: 72, label: '3d' },
  { hours: 168, label: '7d' },
];

function endsIn(lang: 'en' | 'zh', ts: number | null): string {
  if (!ts) return lang === 'zh' ? '不限时' : 'no limit';
  const ms = ts - Date.now();
  if (ms <= 0) return '—';
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  if (lang === 'zh') return d > 0 ? `${d}天${h % 24}小时后` : `${h}小时后`;
  return d > 0 ? `in ${d}d ${h % 24}h` : `in ${h}h`;
}

export function Home() {
  const { lang, name, setName, characterId, setCharacterId, client, go, setRoomCode, setMySeat } = useApp();
  const [joinCode, setJoinCode] = useState('');
  const [compName, setCompName] = useState('');
  const [compBoards, setCompBoards] = useState('8');
  const [followCode, setFollowCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [showComp, setShowComp] = useState(false);
  const [err, setErr] = useState('');
  const [queueing, setQueueing] = useState(false);
  const [queuePos, setQueuePos] = useState(0);
  const [queueWaiting, setQueueWaiting] = useState(0);
  const [compPublic, setCompPublic] = useState(false);
  const [compDur, setCompDur] = useState('0');
  const [openComps, setOpenComps] = useState<CompetitionSummary[] | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [myStats, setMyStats] = useState<PlayerStatsData | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);

  const ensureConnected = async (): Promise<boolean> => {
    if (client.connected) return true;
    setBusy(true);
    try {
      await client.connect();
      return true;
    } catch {
      setErr(t(lang, import.meta.env.VITE_DEMO === '1' ? 'home.connFailedDemo' : 'home.connFailed'));
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
    const hours = parseInt(compDur, 10) || 0;
    client.onEvent = ev => {
      if (ev.type === 'competition_created') go('compete');
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.createCompetition(compName.trim() || 'Friday Game', boards, compPublic, hours);
  };

  const handleOpenTableFound = (tableCode: string) => {
    client.onEvent = ev2 => {
      if (ev2.type === 'room_joined') {
        const pl = ev2.payload as { roomCode: string; seat: 'N' | 'E' | 'S' | 'W' | 'observer' };
        setRoomCode(pl.roomCode);
        setMySeat(pl.seat);
        go('lobby');
      }
      const ec2 = errCode(ev2); if (ec2) setErr(ec2);
    };
    client.join(tableCode, playerName, characterId, lang);
  };

  const refreshComps = async () => {
    if (!(await ensureConnected())) return;
    client.onEvent = ev => {
      if (ev.type === 'competitions_list') {
        setOpenComps((ev.payload as { competitions: CompetitionSummary[] }).competitions);
      } else if (ev.type === 'open_table_found') {
        handleOpenTableFound((ev.payload as { tableCode: string }).tableCode);
      }
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.listCompetitions();
  };

  const doJoinOpenTable = async (code: string) => {
    if (!(await ensureConnected())) return;
    client.onEvent = ev => {
      if (ev.type === 'open_table_found') {
        handleOpenTableFound((ev.payload as { tableCode: string }).tableCode);
      }
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.joinOpenTable(code);
  };

  const doQuickPlay = async () => {
    if (!(await ensureConnected())) return;
    audio.sfx('join');
    setQueueing(true);
    setQueuePos(0);
    client.onEvent = ev => {
      if (ev.type === 'queue_update') {
        const p = ev.payload as { position: number; waiting: number };
        setQueuePos(p.position);
        setQueueWaiting(p.waiting);
      } else if (ev.type === 'room_joined') {
        const pl = ev.payload as { roomCode: string; seat: 'N' | 'E' | 'S' | 'W' | 'observer' };
        setQueueing(false);
        setRoomCode(pl.roomCode);
        setMySeat(pl.seat);
        go('lobby');
      }
      const ec = errCode(ev); if (ec) { setErr(ec); setQueueing(false); }
    };
    client.quickMatch(playerName, characterId, lang);
  };

  const cancelQueue = () => {
    client.leaveQueue();
    setQueueing(false);
  };

  const refreshStats = async () => {
    if (!(await ensureConnected())) return;
    client.onEvent = ev => {
      if (ev.type === 'player_stats') {
        const p = ev.payload as { found: boolean; stats?: PlayerStatsData };
        setMyStats(p.found && p.stats ? p.stats : null);
      } else if (ev.type === 'leaderboard') {
        setBoard((ev.payload as { entries: LeaderboardEntry[] }).entries);
      }
      const ec = errCode(ev); if (ec) setErr(ec);
    };
    client.getStats();
    client.getLeaderboard();
  };

  const toggleStats = async () => {
    const next = !showStats;
    setShowStats(next);
    if (next) {
      audio.sfx('click');
      await refreshStats();
    }
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

      <div className="profile-plate">
        <Avatar id={characterId} className="plate-avatar" />
        <input
          className="input name-input"
          placeholder={t(lang, 'home.namePh')}
          value={name}
          maxLength={16}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="section-label">{t(lang, 'home.character')}</div>
      <div className="char-row">
        {CHARACTERS.map(c => (
          <button
            key={c.id}
            className={`char-card ${characterId === c.id ? 'active' : ''}`}
            onClick={() => { setCharacterId(c.id); audio.sfx('click'); }}
            style={{ ['--c1' as string]: c.colors.primary, ['--c2' as string]: c.colors.secondary }}
          >
            <Avatar id={c.id} className="char-portrait" />
            <span className="char-name">{lang === 'zh'
              ? { cowboy: '牛仔', gamer: '电竞少年', grandma: '奶奶', robot: '机器人' }[c.id]
              : c.id[0]!.toUpperCase() + c.id.slice(1)}</span>
          </button>
        ))}
      </div>

      <div className="menu">
        {queueing ? (
          <div className="queue-box">
            <div className="queue-title">⚡ {t(lang, 'home.searching')}</div>
            {queuePos > 0 && (
              <div className="hint">#{queuePos} · {queueWaiting} {t(lang, 'home.inQueue')}</div>
            )}
            <button className="btn ghost" onClick={cancelQueue}>{t(lang, 'home.cancelSearch')}</button>
          </div>
        ) : (
          <>
            <button className="btn primary big menu-btn" disabled={busy} onClick={doQuickPlay}>
              ⚡ {t(lang, 'home.quickPlay')}
            </button>
            <button className="btn primary big menu-btn" disabled={busy} onClick={doCreate}>
              🃏 {t(lang, 'home.createRoom')}
            </button>
            <div className="join-row menu-row">
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
          </>
        )}
        <button className="btn ghost big menu-btn" onClick={() => go('tutorial')}>
          🎓 {t(lang, 'home.tutorial')}
        </button>
        <button className="btn ghost big menu-btn" onClick={() => { audio.sfx('click'); setShowComp(v => !v); }}>
          🏆 {t(lang, 'home.compTitle')}
        </button>
        <button className="btn ghost big menu-btn" disabled={busy} onClick={toggleStats}>
          📊 {t(lang, 'home.stats')}
        </button>
      </div>

      {showComp && (
        <div className="comp-box">
          <div className="join-row">
            <input
              className="input" placeholder={t(lang, 'home.compNamePh')}
              value={compName} maxLength={30} onChange={e => setCompName(e.target.value)}
            />
            <input
              className="input boards" placeholder={t(lang, 'home.compBoards')}
              value={compBoards} inputMode="numeric" onChange={e => setCompBoards(e.target.value)}
            />
            <select className="input" value={compDur} onChange={e => setCompDur(e.target.value)}
              title={t(lang, 'home.duration')}>
              {DURATIONS.map(d => (
                <option key={d.hours} value={String(d.hours)}>
                  {d.label === 'home.noLimit' ? t(lang, 'home.noLimit') : d.label}
                </option>
              ))}
            </select>
            <button className="btn" disabled={busy} onClick={doCreateComp}>{t(lang, 'home.createComp')}</button>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={compPublic} onChange={e => setCompPublic(e.target.checked)} />
            {t(lang, 'home.makePublic')}
          </label>
          <div className="join-row">
            <input
              className="input" placeholder={t(lang, 'home.followPh')}
              value={followCode} maxLength={6} onChange={e => setFollowCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && doFollow()}
            />
            <button className="btn" disabled={busy} onClick={doFollow}>{t(lang, 'home.follow')}</button>
            <button className="btn ghost" disabled={busy} onClick={refreshComps}>{t(lang, 'home.refresh')}</button>
          </div>
          <div className="section-label">{t(lang, 'home.openComps')}</div>
          {openComps === null ? (
            <div className="hint">…</div>
          ) : openComps.length === 0 ? (
            <div className="hint">{t(lang, 'home.noOpenComps')}</div>
          ) : (
            openComps.map(c => (
              <div className="comp-row" key={c.code}>
                <div className="comp-row-main">
                  <div><b>{c.name}</b> <span className="dim">{c.code}</span></div>
                  <div className="dim small">
                    {c.boards} {t(lang, 'home.boardsN')} · {c.tables} {t(lang, 'home.tablesN')} · {c.players} {t(lang, 'home.playersN')} · {t(lang, 'home.endsIn')} {endsIn(lang, c.closesAt)}
                  </div>
                </div>
                <button className="btn" disabled={busy} onClick={() => doJoinOpenTable(c.code)}>
                  {t(lang, 'home.joinTable')}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showStats && (
        <div className="comp-box stats-box">
          <div className="section-label">{t(lang, 'home.myStats')}</div>
          {myStats === null ? (
            <div className="dim">{t(lang, 'home.noStats')}</div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-cell">
                  <div className="stat-num">{myStats.boards}</div>
                  <div className="stat-lab">{t(lang, 'home.boards')}</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-num">
                    {myStats.boards ? Math.round((myStats.wins / myStats.boards) * 100) : 0}%
                  </div>
                  <div className="stat-lab">{t(lang, 'home.winRate')}</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-num">
                    {myStats.boards ? Math.round(myStats.totalScore / myStats.boards) : 0}
                  </div>
                  <div className="stat-lab">{t(lang, 'home.avgScore')}</div>
                </div>
              </div>
              <div className="section-label">{t(lang, 'home.recentBoards')}</div>
              {myStats.recent.map((b, i) => (
                <div key={i} className="stat-row">
                  <span className="stat-contract">
                    {b.contract ? `${b.contract} · ${seatLabel(lang, b.declarer!)}` : t(lang, 'home.passedOut')}
                  </span>
                  <span className={b.won ? 'stat-score won' : 'stat-score'}>
                    {b.score > 0 ? `+${b.score}` : `${b.score}`}
                  </span>
                </div>
              ))}
            </>
          )}
          <div className="section-label">{t(lang, 'home.leaderboard')}</div>
          {board === null || board.length === 0 ? (
            <div className="dim small">—</div>
          ) : (
            board.map((e, i) => (
              <div key={i} className="stat-row">
                <span>#{i + 1} {e.name}</span>
                <span className="dim small">
                  {e.boards} {t(lang, 'home.boards')} · {e.winRate}% · {e.avgScore > 0 ? '+' : ''}{e.avgScore}
                </span>
              </div>
            ))
          )}
          <button className="btn ghost" disabled={busy} onClick={refreshStats}>
            {t(lang, 'home.refresh')}
          </button>
        </div>
      )}

      <p className="hint">{t(lang, 'home.howto')}</p>
      {err && <div className="error">{err}</div>}
    </div>
  );
}
