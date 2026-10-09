import { useEffect, useState } from 'react';
import { useApp } from '../App.js';
import { t } from '../i18n.js';
import { audio } from '../audio.js';
import type { StandingEntry } from '../../../shared/duplicate.js';

export function Compete() {
  const { lang, client, go } = useApp();
  const [compCode, setCompCode] = useState('');
  const [compName, setCompName] = useState('');
  const [tables, setTables] = useState<string[]>([]);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [boardsCompleted, setBoardsCompleted] = useState(0);
  const [boardsTotal, setBoardsTotal] = useState(0);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    client.onEvent = ev => {
      const p = ev.payload as Record<string, any>;
      if (ev.type === 'competition_created') {
        setCompCode(p['competitionCode']);
        setTables([p['tableCode']]);
        setBoardsTotal(p['boards']);
        audio.sfx('join');
      } else if (ev.type === 'competition_joined') {
        setCompCode(p['competitionCode']);
        setCompName(p['name']);
        setTables(p['tables']);
        setBoardsTotal(p['boards']);
      } else if (ev.type === 'table_created') {
        setTables(ts => [...ts, p['tableCode']]);
        audio.sfx('join');
      } else if (ev.type === 'standings_update') {
        setStandings(p['standings']);
        setBoardsCompleted(p['boardsCompleted']);
        setBoardsTotal(p['boardsTotal']);
      }
    };
    return () => { client.onEvent = () => {}; };
  }, [client]);

  const copy = (code: string) => {
    void navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="compete">
      <div className="tut-header">
        <button className="btn ghost" onClick={() => go('home')}>{t(lang, 'comp.back')}</button>
        <div className="tut-title">🏆 {compName || t(lang, 'home.compTitle')}</div>
        <div className="tut-progress">{compCode}</div>
      </div>

      {compCode && (
        <div className="comp-codes">
          <div className="code-row" onClick={() => copy(compCode)}>
            <span>{t(lang, 'home.followPh')}: <b>{compCode}</b></span>
            <span>{copied === compCode ? t(lang, 'lobby.copied') : '📋'}</span>
          </div>
          <p className="hint">{t(lang, 'comp.share')}</p>
          <div className="tables-row">
            {tables.map(tc => (
              <button key={tc} className="chip big" onClick={() => copy(tc)} title={t(lang, 'comp.tableCode')}>
                🂡 {tc} {copied === tc ? '✓' : ''}
              </button>
            ))}
            <button className="btn" onClick={() => client.createTable(compCode)}>+ {t(lang, 'comp.tableCode')}</button>
          </div>
        </div>
      )}

      <div className="section-label">
        {t(lang, 'comp.standings')} · {boardsCompleted}/{boardsTotal} {t(lang, 'comp.boards')}
      </div>
      {standings.length === 0 ? (
        <p className="hint">…</p>
      ) : (
        <table className="standings">
          <thead>
            <tr>
              <th>#</th>
              <th>{t(lang, 'comp.pair')}</th>
              <th>{t(lang, 'comp.boards')}</th>
              <th>{t(lang, 'comp.mps')}</th>
              <th>{t(lang, 'comp.pct')}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.pairId} className={i === 0 ? 'leader' : ''}>
                <td>{i + 1}</td>
                <td>{s.tableId} · {s.direction}</td>
                <td>{s.boardsPlayed}</td>
                <td>{s.totalMatchpoints}</td>
                <td>{s.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
