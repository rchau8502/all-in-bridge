import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../App.js';
import { REFERENCE_ROWS, REFERENCE_SECTIONS, findReferenceRows, explainBiddingLabels, referenceSequence, type RefLevel, type RefStatus, type RefText } from '../../../shared/bidding-reference.js';
import './bidding-reference.css';

const STATUS: Record<RefStatus, RefText> = {
  NF: { zh: 'NF · 不逼叫', en: 'NF · Non-forcing' },
  F1: { zh: 'F1 · 逼叫一轮', en: 'F1 · One-round force' },
  GF: { zh: 'GF · 逼局', en: 'GF · Game force' },
  SF: { zh: 'SF · 半逼叫', en: 'SF · Semi-forcing' },
  RULE: { zh: '判断原则', en: 'Principle' },
  AGREEMENT: { zh: '约定未启用', en: 'Not enabled' },
  REPLY: { zh: '人工答叫', en: 'Artificial reply' },
  INV: { zh: 'INV · 邀请（不逼叫）', en: 'INV · Invitation (non-forcing)' },
};

function initialSection(): string {
  const id = window.location.hash.split('/')[1] ?? 'all';
  return REFERENCE_SECTIONS.some(s => s.id === id) ? id : 'all';
}

function SuitText({ text }: { text: string }) {
  return <>{text.split(/([♠♥♦♣])/).map((part, i) => /[♠♥♦♣]/.test(part)
    ? <span key={i} className={`ref-suit ref-suit-${{ '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' }[part]}`}>{part}</span>
    : part)}</>;
}

export function BiddingReference() {
  const { lang, go } = useApp();
  const tr = (text: RefText) => text[lang];
  const [section, setSection] = useState(initialSection);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<RefLevel | 'all'>('all');
  const [status, setStatus] = useState<RefStatus | 'all'>('all');
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLElement>(null);
  const controls = useRef<HTMLElement>(null);
  const results = useRef<HTMLElement>(null);
  const filtered = useMemo(() => findReferenceRows(query, section, level, status), [query, section, level, status]);
  const counts = useMemo(() => {
    const available = findReferenceRows(query, 'all', level, status);
    return Object.fromEntries(REFERENCE_SECTIONS.map(s => [s.id, available.filter(r => r.section === s.id).length]));
  }, [query, level, status]);
  const groups = REFERENCE_SECTIONS.map(group => ({ ...group, rows: filtered.filter(r => r.section === group.id) })).filter(s => s.rows.length);
  if (query.trim()) groups.sort((a, b) => filtered.indexOf(a.rows[0]!) - filtered.indexOf(b.rows[0]!));
  const filteredCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const selectSection = (id: string) => {
    setSection(id);
    window.history.replaceState(null, '', `#bidding${id === 'all' ? '' : `/${id}`}`);
    results.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };
  const clear = () => { setQuery(''); setLevel('all'); setStatus('all'); selectSection('all'); };

  useEffect(() => {
    const onHash = () => setSection(initialSection());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLElement && event.target.isContentEditable)) {
        event.preventDefault(); input.current?.focus();
      }
    };
    window.addEventListener('hashchange', onHash); window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    const update = () => root.current?.style.setProperty('--ref-controls-height', `${controls.current?.offsetHeight ?? 150}px`);
    update();
    const observer = new ResizeObserver(update);
    if (controls.current) observer.observe(controls.current);
    return () => observer.disconnect();
  }, []);

  return <main className="bidding-reference" lang={lang === 'zh' ? 'zh-CN' : 'en'} ref={root}>
    <header className="ref-heading">
      <div>
        <div className="ref-eyebrow">2/1 GAME FORCE · QUICK REFERENCE</div>
        <h1>{lang === 'zh' ? '叫牌速查表' : 'Bidding quick reference'}</h1>
        <p>{lang === 'zh' ? '先找情境，再看点力、牌型与逼叫状态。' : 'Find the situation, then read strength, shape and forcing status.'}</p>
      </div>
      <div className="ref-actions">
        <button className="btn ghost" onClick={() => go('home')}>{lang === 'zh' ? '← 回首页' : '← Home'}</button>
        <button className="btn ghost ref-print" onClick={() => window.print()}>{lang === 'zh' ? '打印' : 'Print'}</button>
      </div>
    </header>

    <section className="ref-controls" ref={controls} aria-label={lang === 'zh' ? '搜索与筛选' : 'Search and filters'}>
      <label className="ref-search-label" htmlFor="bid-reference-search">{lang === 'zh' ? '查叫品或术语' : 'Find a bid or term'}</label>
      <div className="ref-search-row">
        <span aria-hidden="true">⌕</span>
        <input id="bid-reference-search" ref={input} type="search" value={query}
          placeholder={lang === 'zh' ? '搜索全部：1NT、1♥–2♣、半逼叫、Stayman、RKCB…' : 'Search all: 1NT, 1h–2c, semi-forcing, Stayman, RKCB…'}
          onChange={event => { setQuery(event.target.value); setSection('all'); window.history.replaceState(null, '', '#bidding'); }}
          onKeyDown={event => { if (event.key === 'Escape') setQuery(''); }} />
        <kbd aria-hidden="true">/</kbd>
        {query && <button className="ref-clear-query" onClick={() => { setQuery(''); input.current?.focus(); }} aria-label={lang === 'zh' ? '清空搜索' : 'Clear search'}>×</button>}
      </div>
      <div className="ref-filter-row">
        <div className="ref-segment" aria-label={lang === 'zh' ? '课程范围' : 'Course level'}>
          {(['all', 'basic', 'advanced'] as const).map(value => <button key={value} aria-pressed={level === value} onClick={() => setLevel(value)}>
            {lang === 'zh' ? { all: '全部内容', basic: '基础篇', advanced: '进阶篇' }[value] : { all: 'Everything', basic: 'Foundations', advanced: 'Advanced' }[value]}
          </button>)}
        </div>
        <label className="ref-status-filter">{lang === 'zh' ? '逼叫状态' : 'Forcing status'}
          <select aria-label={lang === 'zh' ? '逼叫状态' : 'Forcing status'} value={status} onChange={event => setStatus(event.target.value as RefStatus | 'all')}>
            <option value="all">{lang === 'zh' ? '全部状态' : 'All statuses'}</option>
            {(Object.keys(STATUS) as RefStatus[]).filter(s => REFERENCE_ROWS.some(row => row.status === s)).map(s => <option value={s} key={s}>{tr(STATUS[s])}</option>)}
          </select>
        </label>
        {(query || level !== 'all' || status !== 'all' || section !== 'all') && <button className="ref-reset" onClick={clear}>{lang === 'zh' ? '清除筛选' : 'Reset filters'}</button>}
        <span className="ref-count" role="status" aria-live="polite">{lang === 'zh' ? `找到 ${filtered.length} 条` : `${filtered.length} entries`}</span>
      </div>
    </section>

    <div className="ref-layout">
      <aside className="ref-sidebar">
        <nav aria-label={lang === 'zh' ? '速查分区' : 'Reference sections'}>
          <div className="ref-nav-label">{lang === 'zh' ? '选择情境' : 'CHOOSE A SITUATION'}</div>
          <button className={section === 'all' ? 'active' : ''} aria-current={section === 'all' ? 'true' : undefined} onClick={() => selectSection('all')}>
            <span>{lang === 'zh' ? '全部分区' : 'All sections'}</span><span>{filteredCount}</span>
          </button>
          {REFERENCE_SECTIONS.map((group, i) => <button key={group.id} className={section === group.id ? 'active' : ''} aria-current={section === group.id ? 'true' : undefined}
            onClick={() => selectSection(group.id)}>
            <span><small>{String(i + 1).padStart(2, '0')}</small>{tr(group.title)}</span><span>{counts[group.id] ?? 0}</span>
          </button>)}
        </nav>
      </aside>

      <section className="ref-results" ref={results} aria-label={lang === 'zh' ? '速查结果' : 'Reference results'}>
        <div className="ref-label-pairs" aria-label={lang === 'zh' ? '常用叫牌标签' : 'Bidding label pairs'}>
          <div><strong>{lang === 'zh' ? '花色简称' : 'Suit shorthand'}</strong><span>{lang === 'zh' ? 'm（低花：♣／♦）' : 'm · minors ♣/♦'}</span><span>{lang === 'zh' ? 'M（高花：♥／♠）' : 'M · majors ♥/♠'}</span></div>
          <div><strong>{lang === 'zh' ? '实力范围' : 'Strength range'}</strong><span>{lang === 'zh' ? 'MIN（低限）' : 'MIN · Minimum'}</span><span>{lang === 'zh' ? 'MAX（高限）' : 'MAX · Maximum'}</span></div>
          <div><strong>{lang === 'zh' ? '继续义务' : 'Commitment'}</strong><span>{lang === 'zh' ? 'INV（邀请，可Pass）' : 'INV · Invitation, may pass'}</span><span>{lang === 'zh' ? 'GF（逼局）' : 'GF · Game force'}</span></div>
        </div>

        {!filtered.length && <div className="ref-empty">
          <h2>{lang === 'zh' ? '当前筛选下没有结果' : 'No entries match these filters'}</h2>
          <p>{lang === 'zh' ? '试试1NT、2N、半逼叫或转移；也可恢复全部内容。' : 'Try 1NT, 2N, semi-forcing or transfer, or restore all entries.'}</p>
          <button className="btn primary" onClick={clear}>{lang === 'zh' ? '显示全部速查项' : 'Show all entries'}</button>
        </div>}

        {groups.map(group => <article className="ref-group" key={group.id} aria-labelledby={`ref-title-${group.id}`}>
          <header className="ref-group-heading">
            <div><h2 id={`ref-title-${group.id}`}>{tr(group.title)}<span>{group.rows.length}</span></h2><p>{tr(group.context)}</p></div>
          </header>
          <table className="ref-table">
            <thead><tr><th>{lang === 'zh' ? '叫品 / 进程' : 'Call / sequence'}</th><th>{lang === 'zh' ? '点力与牌型' : 'Strength & shape'}</th><th>{lang === 'zh' ? '状态' : 'Status'}</th><th>{lang === 'zh' ? '下一步 / 注意' : 'Next / remember'}</th></tr></thead>
            <tbody>{group.rows.map(row => <tr key={row.id} data-reference-id={row.id} className={row.status === 'AGREEMENT' ? 'ref-inactive' : ''}>
              <th scope="row">
                <div className="ref-sequence"><SuitText text={referenceSequence(row, lang)} /></div>
                <div className="ref-row-name">{explainBiddingLabels(tr(row.title), lang)}</div>
                <span className={`ref-level ref-level-${row.level}`}>{lang === 'zh' ? (row.level === 'basic' ? '基础' : '进阶') : (row.level === 'basic' ? 'Basic' : 'Advanced')}</span>
              </th>
              <td data-label={lang === 'zh' ? '点力与牌型' : 'Strength & shape'}><SuitText text={explainBiddingLabels(tr(row.requirements), lang)} /></td>
              <td className="ref-status-cell" data-label={lang === 'zh' ? '逼叫状态' : 'Status'}><span className={`ref-status ref-status-${row.status.toLowerCase()}`}>{tr(STATUS[row.status])}</span></td>
              <td data-label={lang === 'zh' ? '下一步' : 'Next'}>
                <div><SuitText text={explainBiddingLabels(tr(row.next), lang)} /></div>
                {row.warning && <p className="ref-route-note">{tr(row.warning)}</p>}
              </td>
            </tr>)}</tbody>
          </table>
        </article>)}
        <footer className="ref-footer">{lang === 'zh' ? `共${REFERENCE_SECTIONS.length}分区 · ${REFERENCE_ROWS.length}条 · 叫牌是沟通，点力范围要结合进程与搭档约定。` : `${REFERENCE_SECTIONS.length} sections · ${REFERENCE_ROWS.length} entries · Bidding communicates: read ranges in context and agree your methods.`}</footer>
      </section>
    </div>
  </main>;
}
