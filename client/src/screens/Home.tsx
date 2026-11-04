import { useApp } from '../App.js';
import { t } from '../i18n.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { Avatar } from '../components/ui.js';
import { audio } from '../audio.js';
import { getLessons } from '../../../shared/lessons.js';
import { ACBL_CHAPTERS } from '../../../shared/chapters.js';

/**
 * Home — the bootcamp front door. This app is a teaching tool now:
 * pick your coach character, track progress, then jump straight into lessons.
 */
export function Home() {
  const { lang, characterId, setCharacterId, currentLessonIdx, goToLesson, completedLessons, go, openTeachingGuide } = useApp();
  const lessons = getLessons(lang);
  const lessonIdToIdx = new Map(lessons.map((l, idx) => [l.id, idx]));

  const completedCount = completedLessons.size;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);
  const nextUpIdx = Math.min(
    currentLessonIdx < lessons.length ? currentLessonIdx : 0,
    lessons.length - 1
  );

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-title">{t(lang, 'app.title')}</div>
        <div className="hero-sub">{t(lang, 'app.subtitle')}</div>
      </div>

      <div className="profile-plate">
        <Avatar id={characterId} className="plate-avatar" />
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
        <button className="btn primary big menu-btn" onClick={() => goToLesson(nextUpIdx)}>
          {completedCount > 0
            ? `▶ ${t(lang, 'home.continue')} ${nextUpIdx + 1}: ${lessons[nextUpIdx]!.title}`
            : `🎓 ${t(lang, 'home.tutorial')}`}
        </button>
        <button className="btn ghost big menu-btn drill-launch-btn" onClick={() => go('drill')}>
          🌱 {t(lang, 'drill.modeBasics')}
        </button>
        <button className="btn ghost big menu-btn freeplay-launch-btn" onClick={() => go('freeplay')}>
          🃏 {t(lang, 'freeplay.title')}
        </button>
        <button className="btn ghost big menu-btn guide-launch-btn" onClick={openTeachingGuide}>
          🎓 {t(lang, 'guide.title')}
        </button>
      </div>

      <div className="section-label">
        {t(lang, 'tut.title')} · {t(lang, 'home.progress', { done: completedCount, total: lessons.length })}
      </div>

      <div className="home-progress-bar">
        <div className="home-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="home-syllabus">
        {(['basic', 'advanced'] as const).map(track => {
          const chapters = ACBL_CHAPTERS.filter(ch => ch.track === track);
          const trackIds = chapters.flatMap(ch => ch.lessonIds);
          const count = chapters.reduce((n, ch) => n + ch.lessonIds.length, 0);
          const heading = lang === 'zh'
            ? `${track === 'basic' ? '基础篇' : '进阶篇'} · ${count}课${track === 'advanced' ? '（选学）' : ''}`
            : `${track === 'basic' ? 'Foundations' : 'Advanced'} · ${count} lessons${track === 'advanced' ? ' (optional)' : ''}`;
          const description = lang === 'zh'
            ? (track === 'basic' ? '先用简单自然叫牌、顺叫、逆叫和二盖一，学会判断成局。' : '掌握基础后，再学习人工约定、复杂竞争与满贯工具；部分约定会替代基础篇的简化处理。')
            : (track === 'basic' ? 'Start with natural strength-showing bids, simple rebids, reverses and two-over-one.' : 'Optional conventions, competitive agreements and slam tools; some replace the beginner shortcuts.');
          const content = chapters.map(ch => {
          const chLessons = ch.lessonIds
            .map(id => {
              const idx = lessonIdToIdx.get(id);
              return idx !== undefined ? { lesson: lessons[idx]!, idx } : null;
            })
            .filter((item): item is { lesson: (typeof lessons)[0]; idx: number } => item !== null);

          const chDone = chLessons.filter(item => completedLessons.has(item.lesson.id)).length;

          return (
            <div key={ch.id} className="home-chapter-card">
              <div className="home-chapter-header">
                <div className="home-chapter-titles">
                  <span className="home-chapter-tag">{ch.acblClasses}</span>
                  <div className="home-chapter-title">{ch.title[lang]}</div>
                  <div className="home-chapter-sub">{ch.subtitle[lang]}</div>
                </div>
                <div className="home-chapter-stat">
                  {chDone} / {chLessons.length}
                </div>
              </div>

              <div className="home-chapter-lessons">
                {chLessons.map(({ lesson: l, idx }) => {
                  const isDone = completedLessons.has(l.id);
                  const isCurrent = idx === currentLessonIdx;
                  return (
                    <button
                      key={l.id}
                      className={`home-syllabus-item ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => goToLesson(idx)}
                    >
                      <span className="home-syllabus-no">{isDone ? '✓' : trackIds.indexOf(l.id) + 1}</span>
                      <span className="home-syllabus-title">{l.title}</span>
                      <span className="home-syllabus-stars" title={isDone ? 'Mastered' : 'Not yet completed'}>
                        {isDone ? '★★★' : '☆☆☆'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
          });
          return track === 'advanced' ? (
            <details className="course-track advanced-track" key={track}>
              <summary>{heading}</summary><p>{description}</p>{content}
            </details>
          ) : (
            <section className="course-track basic-track" key={track}>
              <h2>{heading}</h2><p>{description}</p>{content}
            </section>
          );
        })}
      </div>
    </div>
  );
}
