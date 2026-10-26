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
  const { lang, characterId, setCharacterId, currentLessonIdx, goToLesson, completedLessons } = useApp();
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
      </div>

      <div className="section-label">
        {t(lang, 'tut.title')} · {t(lang, 'home.progress', { done: completedCount, total: lessons.length })}
      </div>

      <div className="home-progress-bar">
        <div className="home-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="home-syllabus">
        {ACBL_CHAPTERS.map(ch => {
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
                      <span className="home-syllabus-no">{isDone ? '✓' : idx + 1}</span>
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
        })}
      </div>
    </div>
  );
}
