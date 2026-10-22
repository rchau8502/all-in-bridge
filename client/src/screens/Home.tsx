import { useApp } from '../App.js';
import { t } from '../i18n.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { Avatar } from '../components/ui.js';
import { audio } from '../audio.js';
import { getLessons } from '../../../shared/lessons.js';

/**
 * Home — the bootcamp front door. This app is a teaching tool now:
 * pick your coach character, then jump straight into the lessons.
 */
export function Home() {
  const { lang, characterId, setCharacterId, go } = useApp();
  const lessons = getLessons(lang);

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
        <button className="btn primary big menu-btn" onClick={() => go('tutorial')}>
          🎓 {t(lang, 'home.tutorial')}
        </button>
      </div>

      <div className="section-label">{t(lang, 'tut.title')} · {lessons.length} {t(lang, 'tut.lessonsUnit')}</div>
      <div className="home-syllabus">
        {lessons.map((l, i) => (
          <button key={l.id} className="home-syllabus-item" onClick={() => go('tutorial')}>
            <span className="home-syllabus-no">{i + 1}</span>
            <span>{l.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
