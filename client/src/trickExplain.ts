/**
 * trickExplain.ts — turns a completed trick into a plain-language,
 * line-by-line explanation for the post-trick review pause: who won,
 * who lost, and exactly WHY (follow suit, biggest card, trump, discards).
 * Both languages are hand-written templates, not translations.
 */
import type { Card, Seat } from '../../shared/deck.js';

export type ReviewLang = 'en' | 'zh';

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

export function explainTrick(data: TrickReviewData, lang: ReviewLang): { title: string; lines: string[] } {
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
    // Ruff win: winner had none of the led suit and trumped in.
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
    // Biggest card of the led suit wins (also covers trump-led tricks).
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

  // 4) Running score, from the learner's side (the learner is South / NS).
  if (zh) {
    lines.push(`目前墩数 —— 你们 ${tricksWon.NS} 墩，对方 ${tricksWon.EW} 墩。赢墩的人领出下一墩。`);
  } else {
    lines.push(`Tricks so far — your side ${tricksWon.NS}, their side ${tricksWon.EW}. The winner leads the next trick.`);
  }

  return { title, lines };
}
