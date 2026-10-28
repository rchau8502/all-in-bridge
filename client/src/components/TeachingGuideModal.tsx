import { useState, useEffect } from 'react';
import { t, type Lang } from '../i18n.js';
import { audio } from '../audio.js';

interface TeachingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  onGoToBasicsDrill?: () => void;
  onGoToLesson?: (lessonIdx: number) => void;
  onGoToMiniBridge?: () => void;
  onGoToLectureBoard?: (boardId: string) => void;
}

type GuideTab = 'flow' | 'cheatsheet' | 'minibridge' | 'pitfalls';

export function TeachingGuideModal({
  isOpen,
  onClose,
  lang,
  onGoToBasicsDrill,
  onGoToLesson,
  onGoToMiniBridge,
  onGoToLectureBoard,
}: TeachingGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>('flow');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="glossary-backdrop" onClick={onClose}>
      <div className="teaching-guide-modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="glossary-header">
          <div className="glossary-title-wrap">
            <h2 className="glossary-title">🎓 {t(lang, 'guide.title')}</h2>
            <span className="teaching-guide-subtitle">{t(lang, 'guide.subtitle')}</span>
          </div>
          <div className="glossary-header-actions">
            <button
              type="button"
              className="btn small ghost print-handout-btn"
              onClick={() => {
                audio.sfx('click');
                window.print();
              }}
              title={t(lang, 'guide.printHandout')}
            >
              🖨️ {t(lang, 'guide.printHandout')}
            </button>
            <button type="button" className="glossary-close-btn" onClick={onClose} aria-label="Close guide">
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="teaching-guide-tabs">
          <button
            type="button"
            className={`teaching-guide-tab ${activeTab === 'flow' ? 'active' : ''}`}
            onClick={() => {
              audio.sfx('click');
              setActiveTab('flow');
            }}
          >
            ⏱️ {t(lang, 'guide.tabFlow')}
          </button>
          <button
            type="button"
            className={`teaching-guide-tab ${activeTab === 'cheatsheet' ? 'active' : ''}`}
            onClick={() => {
              audio.sfx('click');
              setActiveTab('cheatsheet');
            }}
          >
            📋 {t(lang, 'guide.tabCheatsheet')}
          </button>
          <button
            type="button"
            className={`teaching-guide-tab ${activeTab === 'minibridge' ? 'active' : ''}`}
            onClick={() => {
              audio.sfx('click');
              setActiveTab('minibridge');
            }}
          >
            🌱 {t(lang, 'guide.tabMiniBridge')}
          </button>
          <button
            type="button"
            className={`teaching-guide-tab ${activeTab === 'pitfalls' ? 'active' : ''}`}
            onClick={() => {
              audio.sfx('click');
              setActiveTab('pitfalls');
            }}
          >
            💡 {t(lang, 'guide.tabPitfalls')}
          </button>
        </div>

        {/* Modal Body */}
        <div className="teaching-guide-body">
          {/* TAB 1: 40-MINUTE TA LESSON FLOW */}
          {activeTab === 'flow' && (
            <div className="guide-tab-pane">
              <div className="guide-intro-banner">
                <span className="guide-intro-icon">📢</span>
                <p className="guide-intro-text">
                  {lang === 'zh'
                    ? '协助者专用教案：针对完全没有接触过桥牌的零基础学员，建议分四阶段（每阶段约 10 分钟）循序渐进讲解，并配合网站交互演练。'
                    : 'Instructor & TA Lesson Plan: A structured 40-minute zero-to-one guide for teaching complete beginners without cognitive overload.'}
                </p>
              </div>

              <div className="lesson-phase-list">
                {/* Phase 1 */}
                <div className="lesson-phase-card">
                  <div className="phase-badge phase-1">00–10 min</div>
                  <div className="phase-content">
                    <h3 className="phase-title">
                      {lang === 'zh' ? '第一阶段：认识牌桌、搭档与跟牌铁律' : 'Phase 1: Table Setup, Partnerships & The Golden Rule'}
                    </h3>
                    <ul className="phase-bullets">
                      <li>
                        <strong>{lang === 'zh' ? '四人两队' : '4 Players, 2 Teams'}:</strong>{' '}
                        {lang === 'zh'
                          ? '北与南是一队，东与西是一队，搭档始终对面就坐。'
                          : 'North-South vs East-West; partners always sit directly opposite.'}
                      </li>
                      <li>
                        <strong>{lang === 'zh' ? '发牌与墩' : 'Dealing & Tricks'}:</strong>{' '}
                        {lang === 'zh'
                          ? '52 张牌每人发 13 张。轮流出牌一轮 4 张称为「一墩 (Trick)」，整副牌共 13 墩。'
                          : '52 cards, 13 per player. Each 4-card round is a "Trick" (13 tricks in total).'}
                      </li>
                      <li>
                        <strong className="phase-highlight">{lang === 'zh' ? '牌桌第一铁律 (Follow Suit)' : 'Golden Law (Follow Suit)'}:</strong>{' '}
                        {lang === 'zh'
                          ? '领出方引出什么花色，手中只要有该花色必须跟出！绝对不能任意换花色。'
                          : 'You MUST follow the suit led if you hold any cards in that suit!'}
                      </li>
                    </ul>
                    <div className="phase-action">
                      <span className="phase-action-tip">👉 {lang === 'zh' ? '课堂操作建议' : 'Class Action'}:</span>
                      <button
                        type="button"
                        className="btn small primary phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToLectureBoard?.('lecture_follow_suit');
                        }}
                      >
                        🎬 {lang === 'zh' ? '演示例牌 1: 跟牌与高牌' : 'Demo Board 1: Follow Suit'}
                      </button>
                      <button
                        type="button"
                        className="btn small ghost phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToLesson?.(0); // Lesson 1: deck
                        }}
                      >
                        🚀 {lang === 'zh' ? '第 1 课' : 'Lesson 1'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="lesson-phase-card">
                  <div className="phase-badge phase-2">10–20 min</div>
                  <div className="phase-content">
                    <h3 className="phase-title">
                      {lang === 'zh' ? '第二阶段：无将比大小、将牌将吃与飞牌魔法' : 'Phase 2: High Cards, Trump Ruffing & The Finesse'}
                    </h3>
                    <ul className="phase-bullets">
                      <li>
                        <strong>{lang === 'zh' ? '无将 (NT)' : 'No-Trump (NT)'}:</strong>{' '}
                        {lang === 'zh'
                          ? '没有特权花色，引牌同门中点数最大者拿墩（A 最大，2 最小）。'
                          : 'No special suit; highest card in the led suit wins (Ace high, 2 low).'}
                      </li>
                      <li>
                        <strong className="phase-highlight">{lang === 'zh' ? '将牌威力 (Trump Ruff)' : 'Trump Power (Ruffing)'}:</strong>{' '}
                        {lang === 'zh'
                          ? '断门（手中无该花色）时打出将牌叫“将吃”。哪怕是最小的将牌 2，也能吃掉对手的 A！'
                          : 'When void in the led suit, a trump card "ruffs" and beats any non-trump card, even an outside Ace!'}
                      </li>
                      <li>
                        <strong>{lang === 'zh' ? '飞牌 (Finesse)' : 'The Finesse'}:</strong>{' '}
                        {lang === 'zh'
                          ? '由弱向强引牌，捕捉对手夹在中间的大牌。'
                          : 'Lead from weakness toward strength to trap opponent honors.'}
                      </li>
                    </ul>
                    <div className="phase-action">
                      <span className="phase-action-tip">👉 {lang === 'zh' ? '课堂操作建议' : 'Class Action'}:</span>
                      <button
                        type="button"
                        className="btn small primary phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToLectureBoard?.('lecture_trump_ruff');
                        }}
                      >
                        🎬 {lang === 'zh' ? '演示例牌 2: 将牌将吃' : 'Demo Board 2: Trump Ruff'}
                      </button>
                      <button
                        type="button"
                        className="btn small ghost phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToLectureBoard?.('lecture_finesse');
                        }}
                      >
                        🎬 {lang === 'zh' ? '演示例牌 3: 经典飞牌' : 'Demo Board 3: Finesse'}
                      </button>
                      <button
                        type="button"
                        className="btn small ghost phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToLesson?.(1); // Lesson 2: tricks
                        }}
                      >
                        🚀 {lang === 'zh' ? '第 2 课' : 'Lesson 2'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="lesson-phase-card">
                  <div className="phase-badge phase-3">20–30 min</div>
                  <div className="phase-content">
                    <h3 className="phase-title">
                      {lang === 'zh' ? '第三阶段：底墩公理、目标墩数与大牌点心算' : 'Phase 3: Book Math, Game Targets & HCP Valuation'}
                    </h3>
                    <ul className="phase-bullets">
                      <li>
                        <strong className="phase-highlight">{lang === 'zh' ? '底墩公理 (Book = 6)' : 'The Book = 6 Tricks'}:</strong>{' '}
                        {lang === 'zh'
                          ? '前 6 墩是义务底线，叫 N 阶就是要赢 6 + N 墩（例如 3NT = 6+3=9 墩；4♠ = 6+4=10 墩）。'
                          : 'First 6 tricks are the book. Target tricks = 6 + bid level (e.g. 3NT = 9 tricks, 4♠ = 10 tricks).'}
                      </li>
                      <li>
                        <strong>{lang === 'zh' ? '大牌点 (HCP)' : 'High Card Points (HCP)'}:</strong>{' '}
                        {lang === 'zh'
                          ? 'A=4 点、K=3 点、Q=2 点、J=1 点。整副牌共 40 点，平均每家 10 点。'
                          : 'A=4, K=3, Q=2, J=1. 40 points total in the deck, average 10 per hand.'}
                      </li>
                      <li>
                        <strong>{lang === 'zh' ? '25点成局金标准' : '25-Point Golden Threshold'}:</strong>{' '}
                        {lang === 'zh'
                          ? '北南二人大牌点加起来达到 25 点，即可果断冲击成局定约（3NT、4♠、4♥）赢取丰厚奖分！'
                          : 'Partnership with 25+ combined points should bid game (3NT, 4♠, 4♥) for game bonus!'}
                      </li>
                    </ul>
                    <div className="phase-action">
                      <span className="phase-action-tip">👉 {lang === 'zh' ? '全班互动' : 'Class Action'}:</span>
                      <button
                        type="button"
                        className="btn small primary phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToLectureBoard?.('lecture_nt_planning');
                        }}
                      >
                        🎬 {lang === 'zh' ? '演示例牌 4: 25点3NT赢墩规划' : 'Demo Board 4: 3NT Planning'}
                      </button>
                      <button
                        type="button"
                        className="btn small ghost phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToBasicsDrill?.();
                        }}
                      >
                        🌱 {lang === 'zh' ? '全班零基础闯关' : 'Zero-to-One Quiz'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phase 4 */}
                <div className="lesson-phase-card">
                  <div className="phase-badge phase-4">30–40 min</div>
                  <div className="phase-content">
                    <h3 className="phase-title">
                      {lang === 'zh' ? '第四阶段：自由上桌与双人同机实战' : 'Phase 4: Hands-on Practice & Duo Tabletop Play'}
                    </h3>
                    <ul className="phase-bullets">
                      <li>
                        <strong>{lang === 'zh' ? '明手职责 (Dummy)' : 'Dummy Role'}:</strong>{' '}
                        {lang === 'zh'
                          ? '首攻一出明手摊牌在桌上，庄家全权指挥南家与北家两手牌。'
                          : 'Dummy spreads hand face-up after lead; declarer commands both hands.'}
                      </li>
                      <li>
                        <strong>{lang === 'zh' ? '双人搭档模式' : 'Duo Tabletop Mode'}:</strong>{' '}
                        {lang === 'zh'
                          ? '学生两两一组，使用手机平放桌面开启「双人同机」，合力完成整副 13 墩对局。'
                          : 'Two students share one screen with Duo mode, playing together against bots.'}
                      </li>
                    </ul>
                    <div className="phase-action">
                      <span className="phase-action-tip">👉 {lang === 'zh' ? '课堂实操' : 'Class Action'}:</span>
                      <button
                        type="button"
                        className="btn small primary phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToLectureBoard?.('lecture_minibridge_fit');
                        }}
                      >
                        🎬 {lang === 'zh' ? '演示例牌 5: 迷你桥牌9张配合' : 'Demo Board 5: MiniBridge Fit'}
                      </button>
                      <button
                        type="button"
                        className="btn small ghost phase-btn"
                        onClick={() => {
                          onClose();
                          onGoToMiniBridge?.();
                        }}
                      >
                        🌱 {lang === 'zh' ? '开启随机迷你桥牌' : 'Random MiniBridge'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL 5-MIN CHEATSHEET */}
          {activeTab === 'cheatsheet' && (
            <div className="guide-tab-pane">
              <div className="cheatsheet-grid">
                {/* Card 1: Suits hierarchy */}
                <div className="cheat-card">
                  <h4 className="cheat-card-title">♠️ {lang === 'zh' ? '花色等级与成局阶数' : 'Suits & Game Targets'}</h4>
                  <div className="cheat-row">
                    <span className="cheat-tag nt">NT 无将</span>
                    <span className="cheat-desc">{lang === 'zh' ? '最高阶花色 · 3 阶成局 (需 9 墩)' : 'Highest strain · 3-level Game (9 tricks)'}</span>
                  </div>
                  <div className="cheat-row">
                    <span className="cheat-tag major">♠ ♥ 高花 (Majors)</span>
                    <span className="cheat-desc">{lang === 'zh' ? '黑桃与红桃 · 4 阶成局 (需 10 墩)' : 'Spades & Hearts · 4-level Game (10 tricks)'}</span>
                  </div>
                  <div className="cheat-row">
                    <span className="cheat-tag minor">♦ ♣ 低花 (Minors)</span>
                    <span className="cheat-desc">{lang === 'zh' ? '方块与梅花 · 5 阶成局 (需 11 墩)' : 'Diamonds & Clubs · 5-level Game (11 tricks)'}</span>
                  </div>
                </div>

                {/* Card 2: HCP Table */}
                <div className="cheat-card">
                  <h4 className="cheat-card-title">🔢 {lang === 'zh' ? '大牌点心算表 (HCP)' : 'High Card Points (HCP)'}</h4>
                  <div className="hcp-mini-table">
                    <div className="hcp-cell">
                      <strong className="hcp-rank">A</strong>
                      <span className="hcp-pts">4 {lang === 'zh' ? '点' : 'pts'}</span>
                    </div>
                    <div className="hcp-cell">
                      <strong className="hcp-rank">K</strong>
                      <span className="hcp-pts">3 {lang === 'zh' ? '点' : 'pts'}</span>
                    </div>
                    <div className="hcp-cell">
                      <strong className="hcp-rank">Q</strong>
                      <span className="hcp-pts">2 {lang === 'zh' ? '点' : 'pts'}</span>
                    </div>
                    <div className="hcp-cell">
                      <strong className="hcp-rank">J</strong>
                      <span className="hcp-pts">1 {lang === 'zh' ? '点' : 'pts'}</span>
                    </div>
                  </div>
                  <div className="cheat-note">
                    {lang === 'zh'
                      ? '💡 4 张 A + 4 张 K + 4 张 Q + 4 张 J = 整副牌正好 40 点！'
                      : '💡 4 Aces + 4 Kings + 4 Queens + 4 Jacks = exactly 40 HCP in deck!'}
                  </div>
                </div>

                {/* Card 3: The Book Math */}
                <div className="cheat-card">
                  <h4 className="cheat-card-title">📐 {lang === 'zh' ? '定约墩数公式 (Book Formula)' : 'Contract Tricks Formula'}</h4>
                  <div className="formula-box">
                    <span className="formula-highlight">{lang === 'zh' ? '目标总墩数 = 6 (底墩) + 叫牌阶数' : 'Target Tricks = 6 (Book) + Bid Level'}</span>
                  </div>
                  <ul className="formula-examples">
                    <li>1NT = 6 + 1 = <strong>7 {lang === 'zh' ? '墩' : 'tricks'}</strong></li>
                    <li>3NT = 6 + 3 = <strong>9 {lang === 'zh' ? '墩' : 'tricks'}</strong></li>
                    <li>4♠ / 4♥ = 6 + 4 = <strong>10 {lang === 'zh' ? '墩' : 'tricks'}</strong></li>
                    <li>6NT / 6♥ = 6 + 6 = <strong>12 {lang === 'zh' ? '墩 (小满贯)' : 'tricks (Small Slam)'}</strong></li>
                    <li>7NT = 6 + 7 = <strong>13 {lang === 'zh' ? '墩 (大满贯全胜)' : 'tricks (Grand Slam)'}</strong></li>
                  </ul>
                </div>

                {/* Card 4: Play Rules */}
                <div className="cheat-card">
                  <h4 className="cheat-card-title">⚡ {lang === 'zh' ? '牌桌出牌四大军规' : 'Four Laws of Card Play'}</h4>
                  <ol className="rules-numbered-list">
                    <li>
                      <strong>{lang === 'zh' ? '有同门必须跟' : 'Must Follow Suit'}:</strong>{' '}
                      {lang === 'zh' ? '手中只要有引牌花色，绝对不能出其他花色。' : 'Play led suit if you have it.'}
                    </li>
                    <li>
                      <strong>{lang === 'zh' ? '断门方可垫或将' : 'Void Permits Discard/Ruff'}:</strong>{' '}
                      {lang === 'zh' ? '手中没有该花色时，才允许垫牌或用将牌将吃。' : 'Only when out of that suit.'}
                    </li>
                    <li>
                      <strong>{lang === 'zh' ? '同门比大，将牌至尊' : 'Trumps Beat Outside Cards'}:</strong>{' '}
                      {lang === 'zh' ? '将牌可以吃掉任何非将牌（哪怕是A）。' : 'Trumps ruff any non-trump honor.'}
                    </li>
                    <li>
                      <strong>{lang === 'zh' ? '谁拿墩谁引牌' : 'Winner Leads Next'}:</strong>{' '}
                      {lang === 'zh' ? '赢得该墩的牌手获得下一墩的首先出牌权。' : 'Trick winner leads to next trick.'}
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MINIBRIDGE PEDAGOGY */}
          {activeTab === 'minibridge' && (
            <div className="guide-tab-pane">
              <div className="guide-intro-banner">
                <span className="guide-intro-icon">🌱</span>
                <p className="guide-intro-text">
                  {lang === 'zh'
                    ? 'ACBL 与欧洲桥牌联盟 (EBU) 官方首推的新手入门黄金法则：跳过复杂的 35 个叫品竞叫过程，直奔桥牌最核心的「大牌点心算 + 8张高花配合 + 明手做庄拿墩」，让学员在第一节课 5 分钟内上手！'
                    : 'The ACBL & EBU gold standard for introductory classes: bypass the 35-bid auction box on Day 1. Focus entirely on HCP arithmetic, 8-card fits, and dummy declarer play in 5 minutes!'}
                </p>
              </div>

              <div className="minibridge-steps-list">
                <div className="minibridge-step-card">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <h4 className="step-title">{lang === 'zh' ? '第 1 步：心算报点，强力方定约 (Count HCP)' : 'Step 1: Count HCP & Determine Declarer'}</h4>
                    <p className="step-desc">
                      {lang === 'zh'
                        ? '全桌四人各自心算手牌点力（A=4, K=3, Q=2, J=1）。北南二人大牌点相加 vs 东西二人大牌点相加。点数总和更高的一方成为定约攻方；获胜搭档中点力更高的人担任「庄家 (Declarer)」，另一人成为「明手 (Dummy)」。'
                        : 'Each player calculates their HCP. Combine North+South vs East+West. The pair with more total HCP wins the contract. The player with more points becomes Declarer; partner becomes Dummy.'}
                    </p>
                  </div>
                </div>

                <div className="minibridge-step-card">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <h4 className="step-title">{lang === 'zh' ? '第 2 步：明手全摊，全场公开 (Dummy Spreads Hand)' : 'Step 2: Dummy Spreads All 13 Cards'}</h4>
                    <p className="step-desc">
                      {lang === 'zh'
                        ? '首攻发出后，明手将手里的 13 张牌全部面朝上摊在桌上，按花色排列好。庄家与两名防守方都能清晰看到明手的所有扑克。庄家一人全权运筹指挥自己与明手两手牌！'
                        : 'After the opening lead, dummy lays all 13 cards face-up in suit columns. Declarer commands both hands with complete visibility of dummy’s resources.'}
                    </p>
                  </div>
                </div>

                <div className="minibridge-step-card">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <h4 className="step-title">{lang === 'zh' ? '第 3 步：8张配合选定约，25点冲成局 (Fit & Game Threshold)' : 'Step 3: Check 8-Card Fit & 25-Point Game'}</h4>
                    <p className="step-desc">
                      {lang === 'zh'
                        ? '庄家查看两手牌的高花：♠ 或 ♥ 合计是否达到 8 张黄金配合？若有 8 张打该高花有将定约；若无高花配合打无将 (NT)！两手合计达到 25 点果断打成局（4♠/4♥ 需10墩，3NT 需9墩）；不足 25 点打部分定约（2♠/2♥ 需8墩，1NT 需7墩）。'
                        : 'Check for an 8-card major fit (♠ or ♥). If fit exists, play that major! If no fit, play No-Trump. With 25+ combined HCP, choose Game (4♠/4♥ or 3NT); with under 25 HCP, choose Part-Score (2♠/2♥ or 1NT).'}
                    </p>
                  </div>
                </div>

                <div className="minibridge-step-card">
                  <div className="step-num">4</div>
                  <div className="step-content">
                    <h4 className="step-title">{lang === 'zh' ? '第 4 步：防守首攻，13 墩实战拿分 (Opening Lead & Play)' : 'Step 4: Opening Lead & 13 Tricks Play'}</h4>
                    <p className="step-desc">
                      {lang === 'zh'
                        ? '庄家的左手方打出首攻。有花色必须跟出！庄家先数必赢墩，有将定约及早清拔敌方将牌，树立长套或由弱引强飞牌。打满 13 墩后对比目标墩数检验成败。'
                        : 'Declarer’s LHO makes the opening lead. Follow suit is strictly mandatory! Count sure winners, pull defensive trumps, and orchestrate finesses. Compare total tricks won against target.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="minibridge-cta-box">
                <button
                  type="button"
                  className="btn primary big phase-btn"
                  onClick={() => {
                    onClose();
                    onGoToMiniBridge?.();
                  }}
                >
                  🚀 {lang === 'zh' ? '立即开启一局迷你桥牌演示 (MiniBridge)' : 'Start a Live MiniBridge Game Now'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PITFALLS & FAQS */}
          {activeTab === 'pitfalls' && (
            <div className="guide-tab-pane">
              <div className="faq-list">
                <div className="faq-item">
                  <h4 className="faq-q">❓ {lang === 'zh' ? '为什么叫 1 阶定约要拿 7 墩，而不是 1 墩？' : 'Why does a 1-level contract require 7 tricks instead of 1?'}</h4>
                  <p className="faq-a">
                    {lang === 'zh'
                      ? '在桥牌诞生之初，两支队伍各自拿 6 墩是势均力敌的平局（6+6=12 墩，第 13 墩分胜负）。因此前 6 墩被定义为「底墩 (Book)」，不计分值。叫牌时说“1♠”，含义是“我承诺在 6 墩底线之上再多赢 1 墩”，所以必须赢下 6 + 1 = 7 墩才算获胜！'
                      : 'The first 6 tricks are considered the "Book" (a baseline even split of 6-6 tricks). When you bid at the 1-level, you are promising to win 1 trick BEYOND the 6-trick book, requiring 7 tricks total.'}
                  </p>
                </div>

                <div className="faq-item">
                  <h4 className="faq-q">❓ {lang === 'zh' ? '我手里明明有别的花色的大牌 A，为什么不能打出来吃掉对手？' : 'Why cannot I play an Ace from another suit to win the trick?'}</h4>
                  <p className="faq-a">
                    {lang === 'zh'
                      ? '这是初学者最常犯的错误！桥牌的核心规则是必须跟出引牌花色（Follow Suit）。如果别人出黑桃，而你手里有黑桃，你就必须跟黑桃。只有当你手中完全没有黑桃时，才能打出其他花色（非将牌定约下垫牌无权拿墩；有将定约下出将牌才能将吃获胜）。'
                      : 'You must follow suit. If Spades are led and you hold any Spades, you MUST play a Spade. Discarding an Ace of another suit has zero trick-winning power unless it is a trump.'}
                  </p>
                </div>

                <div className="faq-item">
                  <h4 className="faq-q">❓ {lang === 'zh' ? '为什么明手要把牌全部摊开，不能自己决定怎么出？' : 'Why does Dummy spread all cards face-up instead of playing independently?'}</h4>
                  <p className="faq-a">
                    {lang === 'zh'
                      ? '桥牌的独特魅力在于：叫牌获胜者成为“定约人（庄家）”，庄家的搭档退居为“明手”。明手将 13 张牌全部公开摊在牌桌上供全场观摩，由庄家统一运筹两手牌的桥路、飞牌与吃墩次序。这使得桥牌脱离了单纯的运气摸牌，演变为两手牌统筹的战略博弈！'
                      : 'Dummy laying down all 13 cards turns bridge into a game of strategy where declarer orchestrates the combined assets of both hands with complete visibility of dummy.'}
                  </p>
                </div>

                <div className="faq-item">
                  <h4 className="faq-q">❓ {lang === 'zh' ? '为什么 3NT 是 9 墩成局，而 4♠ 却是 10 墩成局？' : 'Why is 3NT Game at 9 tricks while 4♠ is Game at 10 tricks?'}</h4>
                  <p className="faq-a">
                    {lang === 'zh'
                      ? '桥牌规定定约基本分达到 100 分即构成“成局 (Game)”并享有高额奖分。无将 (NT) 第一墩 40 分，后续每墩 30 分，因此 3NT 刚好是 40 + 30 + 30 = 100 分（需赢 6+3=9 墩）；而高花（♠和♥）每墩 30 分，需要 4 阶才能达到 30 × 4 = 120 分（超过100分，需赢 6+4=10 墩）。'
                      : 'A "Game" requires 100 trick points. In NT, trick 1 scores 40 pts, and tricks 2-3 score 30 pts each (40+30+30=100 pts -> 3NT). Major suits score 30 pts per trick, requiring 4 tricks (120 pts -> 4♠/4♥).'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="teaching-guide-footer">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              onClose();
              onGoToBasicsDrill?.();
            }}
          >
            🌱 {lang === 'zh' ? '去测验：零基础闯关练习' : 'Practice: Zero-to-One Quiz'}
          </button>
          <button type="button" className="btn ghost" onClick={onClose}>
            {lang === 'zh' ? '关闭' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
