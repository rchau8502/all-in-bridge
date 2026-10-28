/**
 * trick-explain.ts — turns a completed trick into a plain-language,
 * line-by-line explanation for the post-trick review pause: who won,
 * who lost, and exactly WHY (follow suit, biggest card, trump, discards).
 * Both languages are hand-written templates, not translations.
 */
import type { Card, Seat } from './deck.js';

export type ReviewLang = 'en' | 'zh';

export interface DefenseSignal {
  seat: Seat;
  card: Card;
  kind: 'attitude_encourage' | 'attitude_discourage' | 'discard_encourage' | 'honor_lead';
  label: { en: string; zh: string };
  meaning: { en: string; zh: string };
}

export interface TrickReviewData {
  plays: Array<{ seat: Seat; card: Card }>;
  winner: Seat;
  trump: Card['suit'] | null;
  tricksWon: Record<'NS' | 'EW', number>;
}

const SUIT_SYM: Record<Card['suit'], string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
const SUIT_EN: Record<Card['suit'], string> = { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' };
const SUIT_ZH: Record<Card['suit'], string> = { S: '黑桃', H: '红桃', D: '方块', C: '梅花' };
const RANK_EN: Record<number, string> = { 14: 'ace', 13: 'king', 12: 'queen', 11: 'jack' };
const RANK_ZH: Record<number, string> = { 14: 'A', 13: 'K', 12: 'Q', 11: 'J' };

function seatName(seat: Seat, lang: ReviewLang): string {
  if (lang === 'zh') return { S: '你', N: '搭档', W: '西家', E: '东家' }[seat];
  return { S: 'You', N: 'Partner', W: 'West', E: 'East' }[seat];
}

/** "A♥" — compact label, same in both languages. */
export function cardShort(card: Card): string {
  const r = RANK_ZH[card.rank] ?? String(card.rank);
  return `${r}${SUIT_SYM[card.suit]}`;
}

/** EN "the ace of hearts" / ZH "红桃A". */
function cardWords(card: Card, lang: ReviewLang): string {
  if (lang === 'zh') return `${SUIT_ZH[card.suit]}${RANK_ZH[card.rank] ?? card.rank}`;
  const r = RANK_EN[card.rank] ?? String(card.rank);
  return `the ${r} of ${SUIT_EN[card.suit]}`;
}

export function detectDefenseSignals(
  plays: Array<{ seat: Seat; card: Card }>,
  trump: Card['suit'] | null
): DefenseSignal[] {
  if (plays.length === 0) return [];
  const signals: DefenseSignal[] = [];
  const leadPlay = plays[0]!;
  const ledSuit = leadPlay.card.suit;

  // 1. Check defender lead from touching honors (top of sequence)
  if (leadPlay.seat === 'W' || leadPlay.seat === 'E') {
    const rank = leadPlay.card.rank;
    if (rank === 13) {
      signals.push({
        seat: leadPlay.seat,
        card: leadPlay.card,
        kind: 'honor_lead',
        label: { en: 'Lead: Top of Sequence', zh: '首攻：相邻大牌顶张' },
        meaning: {
          en: 'Led King from touching honors (promises Queen or Ace-King).',
          zh: '首攻大牌K：承诺相邻大牌序列（持有KQ或AK）。',
        },
      });
    } else if (rank === 12) {
      signals.push({
        seat: leadPlay.seat,
        card: leadPlay.card,
        kind: 'honor_lead',
        label: { en: 'Lead: Top of Sequence', zh: '首攻：相邻大牌顶张' },
        meaning: {
          en: 'Led Queen from touching honors (promises Jack).',
          zh: '首攻大牌Q：承诺相邻大牌序列（持有QJ）。',
        },
      });
    } else if (rank === 11) {
      signals.push({
        seat: leadPlay.seat,
        card: leadPlay.card,
        kind: 'honor_lead',
        label: { en: 'Lead: Top of Sequence', zh: '首攻：相邻大牌顶张' },
        meaning: {
          en: 'Led Jack from touching honors (promises 10).',
          zh: '首攻大牌J：承诺相邻大牌序列（持有J10）。',
        },
      });
    }
  }

  // 2. Check defender attitude when following to partner's lead
  for (let i = 1; i < plays.length; i++) {
    const play = plays[i]!;
    if (play.seat !== 'W' && play.seat !== 'E') continue;

    const partnerSeat = play.seat === 'W' ? 'E' : 'W';
    if (leadPlay.seat === partnerSeat) {
      if (play.card.suit === ledSuit) {
        if (play.card.rank >= 7 && play.card.rank <= 10) {
          signals.push({
            seat: play.seat,
            card: play.card,
            kind: 'attitude_encourage',
            label: { en: 'Attitude: Encouraging', zh: '态度信号：鼓励' },
            meaning: {
              en: `High spot card (${cardShort(play.card)}) encourages partner to continue ${SUIT_EN[ledSuit]}.`,
              zh: `出大牌(${cardShort(play.card)})：鼓励同伴继续攻出${SUIT_ZH[ledSuit]}。`,
            },
          });
        } else if (play.card.rank >= 2 && play.card.rank <= 4) {
          signals.push({
            seat: play.seat,
            card: play.card,
            kind: 'attitude_discourage',
            label: { en: 'Attitude: Discouraging', zh: '态度信号：不鼓励' },
            meaning: {
              en: `Low spot card (${cardShort(play.card)}) discourages; suggests switching suits.`,
              zh: `出小牌(${cardShort(play.card)})：不鼓励，建议同伴换攻其他花色。`,
            },
          });
        }
      }
    }

    // 3. Discard signaling
    if (play.card.suit !== ledSuit && play.card.suit !== trump) {
      if (play.card.rank >= 8) {
        signals.push({
          seat: play.seat,
          card: play.card,
          kind: 'discard_encourage',
          label: { en: 'Discard Signal', zh: '垫牌信号：鼓励' },
          meaning: {
            en: `High discard of ${cardShort(play.card)} signals interest and strength in ${SUIT_EN[play.card.suit]}.`,
            zh: `垫出大牌${cardShort(play.card)}：表示在${SUIT_ZH[play.card.suit]}上有实力/兴趣。`,
          },
        });
      }
    }
  }

  return signals;
}

export function explainTrick(data: TrickReviewData, lang: ReviewLang): {
  title: string;
  lines: string[];
  signals: DefenseSignal[];
  headline: string;
} {
  const { plays, winner, trump, tricksWon } = data;
  const led = plays[0]!.card.suit;
  const winPlay = plays.find(p => p.seat === winner)!;
  const learnerSideWon = winner === 'N' || winner === 'S';
  const zh = lang === 'zh';
  const name = (s: Seat) => seatName(s, lang);

  const title = zh
    ? `${learnerSideWon ? '🏆' : '😖'} ${name(winner)}赢下这一墩 —— 靠${cardWords(winPlay.card, lang)}`
    : `${learnerSideWon ? '🏆' : '😖'} ${name(winner)} win${winner === 'S' ? '' : 's'} this trick — with ${cardWords(winPlay.card, lang)}`;

  const lines: string[] = [];

  // 0) Headline for quick classroom projector display
  let headline = '';
  if (trump && winPlay.card.suit === trump && led !== trump) {
    headline = zh
      ? `${name(winner)}以将牌 ${cardShort(winPlay.card)} 将吃杀敌！将牌大过天`
      : `${name(winner)} trumped in with ${cardShort(winPlay.card)}! Trumps beat all`;
  } else if (led === trump) {
    headline = zh
      ? `${name(winner)}以将牌 ${cardShort(winPlay.card)} 拔将胜出！`
      : `${name(winner)} won with trump ${cardShort(winPlay.card)}!`;
  } else {
    headline = zh
      ? `${name(winner)}以 ${cardShort(winPlay.card)} 顶张赢墩！引牌花色最大牌`
      : `${name(winner)} took the trick with ${cardShort(winPlay.card)}! Highest card of led suit`;
  }

  // 1) Recap, in play order. 跟/follow only when the card follows the led suit.
  if (zh) {
    const parts = plays.map((p, i) => {
      const c = cardWords(p.card, lang);
      if (i === 0) return `${name(p.seat)}先出${c}`;
      return p.card.suit === led ? `${name(p.seat)}跟${c}` : `${name(p.seat)}出${c}`;
    });
    lines.push(parts.join('，') + '。');
  } else {
    const parts = plays.map((p, i) => {
      const c = cardWords(p.card, lang);
      if (i === 0) return `${name(p.seat)} led ${c}`;
      return p.card.suit === led ? `${name(p.seat)} followed with ${c}` : `${name(p.seat)} played ${c}`;
    });
    lines.push(parts.join(', ') + '.');
  }

  // 2) WHY the winner won.
  const otherTrumps = trump
    ? plays.filter(p => p.seat !== winner && p.card.suit === trump)
    : [];
  if (trump && winPlay.card.suit === trump && led !== trump) {
    if (zh) {
      lines.push(
        `${name(winner)}手里已经没有${SUIT_ZH[led]}了，于是拿将牌${cardWords(winPlay.card, lang)}毙掉这一墩。记住：将牌大过天——任何一张将牌，都能赢过领出的花色，哪怕对方出的是A。`,
      );
      for (const t of otherTrumps) {
        lines.push(`${name(t.seat)}也用了将牌${cardWords(t.card, lang)}，但没有${name(winner)}的那张大，所以还是输了。`);
      }
    } else {
      lines.push(
        `${name(winner)} had no ${SUIT_EN[led]} left, so they trumped in with ${cardWords(winPlay.card, lang)}. Remember: ANY trump beats EVERY card of the led suit — even an ace. That's why this trick belongs to ${name(winner).toLowerCase() === 'you' ? 'you' : name(winner)}.`,
      );
      for (const t of otherTrumps) {
        lines.push(`${name(t.seat)} trumped too, with ${cardWords(t.card, lang)} — but ${name(winner)}'s trump was bigger, so it still lost.`);
      }
    }
  } else {
    const ledCards = plays.filter(p => p.card.suit === led).map(p => cardShort(p.card)).join('、');
    const ledCardsEn = plays.filter(p => p.card.suit === led).map(p => cardShort(p.card)).join(', ');
    if (zh) {
      lines.push(
        led === trump
          ? `这一墩领出的是将牌${SUIT_ZH[led]}，有将牌必须跟将牌。桌上的将牌是${ledCards}，最大的是${cardWords(winPlay.card, lang)}，所以${name(winner)}赢。`
          : `规矩是：有${SUIT_ZH[led]}必须跟${SUIT_ZH[led]}。这一墩桌上的${SUIT_ZH[led]}是${ledCards}，其中最大的是${cardWords(winPlay.card, lang)}，所以${name(winner)}赢下这一墩。`,
      );
    } else {
      const mid = winner === 'S' ? 'you' : name(winner);
      lines.push(
        led === trump
          ? `Trumps were led, and you must follow suit when you can. The trumps on the table were ${ledCardsEn} — the biggest is ${cardWords(winPlay.card, lang)}, so ${mid} take${winner === 'S' ? '' : 's'} it.`
          : `The rule: if you have ${SUIT_EN[led]}, you must play ${SUIT_EN[led]}. The ${SUIT_EN[led]} on the table were ${ledCardsEn} — the biggest is ${cardWords(winPlay.card, lang)}, so ${mid} win${winner === 'S' ? '' : 's'} the trick.`,
      );
    }
  }

  // 3) Discards: off-suit, non-trump cards can never win — call each one out.
  const discards = plays.filter(p => p.card.suit !== led && p.card.suit !== trump);
  for (const d of discards) {
    if (zh) {
      lines.push(`${name(d.seat)}没有${SUIT_ZH[led]}了，垫掉了一张${cardWords(d.card, lang)}。垫掉的牌只是"送掉"——它永远赢不了这一墩，牌再大也没用。`);
    } else {
      lines.push(`${name(d.seat)} had no ${SUIT_EN[led]} left and threw away ${cardWords(d.card, lang)}. A throw-away can NEVER win a trick, no matter how big the card is.`);
    }
  }

  // 4) Defense Signals analysis
  const signals = detectDefenseSignals(plays, trump);
  for (const s of signals) {
    if (zh) {
      lines.push(`🛡️ 【防守信号】${name(s.seat)}打出${cardShort(s.card)} —— ${s.meaning.zh}`);
    } else {
      lines.push(`🛡️ [Defense Signal] ${name(s.seat)} played ${cardShort(s.card)} — ${s.meaning.en}`);
    }
  }

  // 5) Running score, from the learner's side (the learner is South / NS).
  if (zh) {
    lines.push(`目前墩数 —— 你们 ${tricksWon.NS} 墩，对方 ${tricksWon.EW} 墩。赢墩的人领出下一墩。`);
  } else {
    lines.push(`Tricks so far — your side ${tricksWon.NS}, their side ${tricksWon.EW}. The winner leads the next trick.`);
  }

  return { title, lines, signals, headline };
}
