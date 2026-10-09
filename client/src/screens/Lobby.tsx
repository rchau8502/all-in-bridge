import { useEffect, useState } from 'react';
import { useApp } from '../App.js';
import { t, seatLabel } from '../i18n.js';
import { Avatar } from '../components/ui.js';
import { audio } from '../audio.js';
import type { Seat } from '../../../shared/deck.js';
import { SEATS } from '../../../shared/deck.js';

interface SeatInfo { name: string; characterId: string; connected: boolean; }

export function Lobby() {
  const { lang, client, go, roomCode, mySeat } = useApp();
  const [seats, setSeats] = useState<Record<Seat, SeatInfo | null>>({ N: null, E: null, S: null, W: null });
  const [observers, setObservers] = useState(0);
  const [hostSeat, setHostSeat] = useState<Seat | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    client.onEvent = ev => {
      const p = ev.payload as Record<string, unknown>;
      if (ev.type === 'players_update') {
        setSeats(p['seats'] as Record<Seat, SeatInfo | null>);
        setObservers(p['observers'] as number);
        setHostSeat(p['hostSeat'] as Seat | null);
      } else if (ev.type === 'game_start') {
        go('table');
      }
    };
    return () => { client.onEvent = () => {}; };
  }, [client, go]);

  const playerCount = SEATS.filter(s => seats[s]).length;
  const isHost = mySeat !== null && mySeat !== 'observer' && mySeat === hostSeat;

  const copyCode = () => {
    void navigator.clipboard?.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="lobby">
      <div className="room-code-box" onClick={copyCode}>
        <div className="room-code-label">{t(lang, 'lobby.roomCode')}</div>
        <div className="room-code">{roomCode || '…'}</div>
        <div className="room-code-hint">{copied ? t(lang, 'lobby.copied') : '📋'}</div>
      </div>

      <div className="seats-grid">
        {SEATS.map(s => {
          const info = seats[s];
          const isMe = mySeat === s;
          return (
            <div key={s} className={`seat-card ${info ? 'filled' : ''} ${isMe ? 'me' : ''}`}>
              <div className="seat-name">{seatLabel(lang, s)}</div>
              {info ? (
                <>
                  <div className="seat-emoji"><Avatar id={info.characterId} /></div>
                  <div className="seat-player">{info.name}{isMe ? ` (${t(lang, 'lobby.you')})` : ''}</div>
                  {hostSeat === s && <div className="host-badge">👑 {t(lang, 'lobby.host')}</div>}
                  {!info.connected && <div className="dc-badge">…</div>}
                </>
              ) : (
                <div className="seat-empty">{t(lang, 'lobby.seatEmpty')}</div>
              )}
            </div>
          );
        })}
      </div>

      {observers > 0 && (
        <div className="observers">👀 {t(lang, 'lobby.observers')}: {observers}</div>
      )}
      {mySeat === 'observer' && <div className="observers">👀 {t(lang, 'table.observerTag')}</div>}

      <div className="lobby-actions">
        {isHost ? (
          <button
            className="btn primary big"
            disabled={playerCount !== 4}
            onClick={() => { audio.sfx('click'); client.start(); }}
          >
            {t(lang, 'lobby.start')}
          </button>
        ) : (
          <div className="hint">{t(lang, 'lobby.waiting')}</div>
        )}
        {playerCount !== 4 && <div className="hint">{t(lang, 'lobby.need4')} ({playerCount}/4)</div>}
        <button className="btn ghost" onClick={() => { client.disconnect(); go('home'); }}>
          {t(lang, 'lobby.leave')}
        </button>
      </div>
    </div>
  );
}
