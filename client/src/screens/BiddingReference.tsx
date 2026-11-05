import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../App.js';
import { getLessons } from '../../../shared/lessons.js';
import { REFERENCE_ROWS, REFERENCE_SECTIONS, findReferenceRows, type RefLevel, type RefStatus, type RefText } from '../../../shared/bidding-reference.js';
import './bidding-reference.css';

const STATUS: Record<RefStatus, RefText> = {
  NF: { zh: 'NF · 不逼叫', en: 'NF · Non-forcing' },
  F1: { zh: 'F1 · 逼叫一轮', en: 'F1 · One-round force' },
  GF: { zh: 'GF · 逼局', en: 'GF · Game force' },
  SF: { zh: 'SF · 半逼叫', en: 'SF · Semi-forcing' },
  RULE: { zh: '判断原则', en: 'Principle' },
  AGREEMENT: { zh: '约定未启用', en: 'Not enabled' },
  REPLY: { zh: '人工答叫', en: 'Artificial reply' },
};
const SOURCE = `${import.meta.env.BASE_URL}reference/bidding-guide.pdf`;

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
  const { lang, go, goToLesson } = useApp();
  const tr = (text: RefText) => text[lang];
  const [section, setSection] = useState(initialSection);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<RefLevel | 'all'>('all');
  const [status, setStatus] = useState<RefStatus | 'all'>('all');
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLElement>(null);
  const controls = useRef<HTMLElement>(null);
  const results = useRef<HTMLElement>(null);
  const lessons = useMemo(() => getLessons(lang), [lang]);
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
  const openLesson = (id: string) => {
    const index = lessons.findIndex(l => l.id === id);
    if (index >= 0) goToLesson(index);
  };

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

  return <main className="bidding-reference" ref={root}>
    <header className="ref-heading">
      <div>
        <div className="ref-eyebrow">2/1 GAME FORCE · QUICK REFERENCE</div>
        <h1>{lang === 'zh' ? '叫牌速查表' : 'Bidding quick reference'}</h1>
        <p>{lang === 'zh' ? '先找情境，再看点力、牌型与逼叫状态。' : 'Find the situation, then read strength, shape and forcing status.'}</p>
      </div>
      <div className="ref-actions">
        <button className="btn ghost" onClick={() => go('home')}>{lang === 'zh' ? '← 回首页' : '← Home'}</button>
        <a className="btn ghost" href={SOURCE} target="_blank" rel="noreferrer">{lang === 'zh' ? '原讲义 PDF ↗' : 'Source PDF ↗'}</a>
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
            {(Object.keys(STATUS) as RefStatus[]).map(s => <option value={s} key={s}>{tr(STATUS[s])}</option>)}
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
        <div className="ref-convention-note">
          <strong>{lang === 'zh' ? '先看进程，再看状态。' : 'Context comes first.'}</strong>{' '}
          {lang === 'zh' ? '同一个叫品可有不同含义；状态指本行正在说明的叫品。默认无干扰、应叫者未Pass，竞争分区另列。' : 'The same call can mean different things. Status refers to the call being described in that row. Uncontested and unpassed unless the section says otherwise.'}
        </div>
        <details className="ref-agreements">
          <summary>{lang === 'zh' ? '本页约定与原讲义差异' : 'Agreements and source clarifications'}</summary>
          <p>{lang === 'zh' ? '依据 Yuqi Hu《Bridge Bidding Guide: Combined Handouts》（2026年4–5月）整理。采用网站现有二盖一体系；每条可打开原讲义对应页。' : 'Adapted from Yuqi Hu’s Bridge Bidding Guide: Combined Handouts (April–May 2026), using the website’s existing 2/1 agreements. Entries link to their source pages.'}</p>
          <ul>
            <li>{lang === 'zh' ? 'Texas完成后的4NT为RKCB，已纠正原表的“8–9点邀请”。未定将牌的定量4NT另列。' : '4NT after completed Texas is RKCB, correcting the source’s 8–9 invitation. Quantitative 4NT without agreed trumps is listed separately.'}</li>
            <li>{lang === 'zh' ? '半逼叫1NT可含三张邀请支持或缺门长套；开叫Pass例外沿用网站12–13点5332。' : 'Semi-forcing 1NT can include three-card limit support or a void and a long suit; the pass exception remains the website’s 12–13 balanced 5332.'}</li>
            <li>{lang === 'zh' ? 'Jacoby后无短套的实力分组沿用网站：4M为12–13，3NT为14–15，3M为16+。' : 'Jacoby rebids without shortness retain website ranges: 4M 12–13, 3NT 14–15, 3M 16+.'}</li>
            <li>{lang === 'zh' ? '基础直接3M为自然邀请；伯根进阶3M为弱阻击。两种处理不可在同一进程混用。' : 'Foundation direct 3M is invitational; Bergen 3M is weak. These are alternative treatments.'}</li>
            <li>{lang === 'zh' ? '低花反加叫是网站基础篇补充。讲义的直接Mini-Splinter 9–11版本仅保留索引，未启用。' : 'Inverted minors are a foundation supplement. The source’s direct 9–11 Mini-Splinter remains an indexed, inactive agreement.'}</li>
            <li>{lang === 'zh' ? '总墩数定律不是安全保证；技术性加倍的被迫应叫不保证四张；关键张回答不是自然止叫。' : 'The law of total tricks is not a safety guarantee; a forced takeout advance need not have four cards; keycard replies are not natural sign-offs.'}</li>
          </ul>
        </details>

        {!filtered.length && <div className="ref-empty">
          <h2>{lang === 'zh' ? '当前筛选下没有结果' : 'No entries match these filters'}</h2>
          <p>{lang === 'zh' ? '试试1NT、2N、半逼叫或转移；也可恢复全部内容。' : 'Try 1NT, 2N, semi-forcing or transfer, or restore all entries.'}</p>
          <button className="btn primary" onClick={clear}>{lang === 'zh' ? '显示全部速查项' : 'Show all entries'}</button>
        </div>}

        {groups.map(group => <article className="ref-group" key={group.id} aria-labelledby={`ref-title-${group.id}`}>
          <header className="ref-group-heading">
            <div><h2 id={`ref-title-${group.id}`}>{tr(group.title)}<span>{group.rows.length}</span></h2><p>{tr(group.context)}</p></div>
            <button className="ref-lesson-link" onClick={() => openLesson(group.lessonId)}>{lang === 'zh' ? '相关课程 ↗' : 'Related lesson ↗'}</button>
          </header>
          <table className="ref-table">
            <thead><tr><th>{lang === 'zh' ? '叫品 / 进程' : 'Call / sequence'}</th><th>{lang === 'zh' ? '点力与牌型' : 'Strength & shape'}</th><th>{lang === 'zh' ? '状态' : 'Status'}</th><th>{lang === 'zh' ? '下一步 / 注意' : 'Next / remember'}</th></tr></thead>
            <tbody>{group.rows.map(row => <tr key={row.id} data-reference-id={row.id} className={row.status === 'AGREEMENT' ? 'ref-inactive' : ''}>
              <th scope="row">
                <div className="ref-sequence"><SuitText text={row.sequence} /></div>
                <div className="ref-row-name">{tr(row.title)}</div>
                <span className={`ref-level ref-level-${row.level}`}>{lang === 'zh' ? (row.level === 'basic' ? '基础' : '进阶') : (row.level === 'basic' ? 'Basic' : 'Advanced')}</span>
              </th>
              <td data-label={lang === 'zh' ? '点力与牌型' : 'Strength & shape'}><SuitText text={tr(row.requirements)} /></td>
              <td className="ref-status-cell" data-label={lang === 'zh' ? '逼叫状态' : 'Status'}><span className={`ref-status ref-status-${row.status.toLowerCase()}`}>{tr(STATUS[row.status])}</span></td>
              <td data-label={lang === 'zh' ? '下一步' : 'Next'}>
                <div><SuitText text={tr(row.next)} /></div>
                <details className="ref-row-detail"><summary>{lang === 'zh' ? '细节与出处' : 'Details & source'}</summary>
                  {tr(row.note) && <p><SuitText text={tr(row.note)} /></p>}
                  <div className="ref-source-links">{row.pages.length ? row.pages.map(page => <a key={page} href={`${SOURCE}#page=${page}`} target="_blank" rel="noreferrer">{lang === 'zh' ? `讲义第${page}页 ↗` : `PDF p.${page} ↗`}</a>) : <span>{lang === 'zh' ? '网站课程补充' : 'Website supplement'}</span>}
                    <button onClick={() => openLesson(row.lessonId)}>{lang === 'zh' ? '查看讲解 ↗' : 'Open lesson ↗'}</button>
                  </div>
                </details>
              </td>
            </tr>)}</tbody>
          </table>
        </article>)}
        <footer className="ref-footer">{lang === 'zh' ? `共${REFERENCE_SECTIONS.length}分区 · ${REFERENCE_ROWS.length}条 · 叫牌是沟通，点力范围要结合进程与搭档约定。` : `${REFERENCE_SECTIONS.length} sections · ${REFERENCE_ROWS.length} entries · Bidding communicates: read ranges in context and agree your methods.`}</footer>
      </section>
    </div>
  </main>;
}
