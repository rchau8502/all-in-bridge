/** Shared presentational bits: cards, banners, coin rain, speech bubbles. */
import type { Card, Seat } from '../../../shared/deck.js';
import { cardLabel } from '../../../shared/deck.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { t, seatLabel, type Lang } from '../i18n.js';

const SUIT_SYM: Record<string, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
const SUIT_CLASS: Record<string, string> = { S: 'spade', H: 'heart', D: 'diamond', C: 'club' };
const RANK_LABEL: Record<number, string> = {
  14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: '10', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2',
};

export function CardView({
  card, small, dim, onClick, playable, selected,
}: {
  card: Card; small?: boolean; dim?: boolean;
  onClick?: () => void; playable?: boolean; selected?: boolean;
}) {
  const cls = [
    'card', SUIT_CLASS[card.suit], small ? 'small' : '',
    dim ? 'dim' : '', playable ? 'playable' : '', selected ? 'selected' : '',
    onClick ? 'clickable' : '',
  ].join(' ');
  return (
    <div className={cls} onClick={onClick} title={cardLabel(card)}>
      <span className="corner tl">{RANK_LABEL[card.rank]}<br />{SUIT_SYM[card.suit]}</span>
      <span className="pip">{SUIT_SYM[card.suit]}</span>
      <span className="corner br">{RANK_LABEL[card.rank]}<br />{SUIT_SYM[card.suit]}</span>
    </div>
  );
}

export function CardBack({ small }: { small?: boolean }) {
  return <div className={`card back ${small ? 'small' : ''}`} />;
}

/** Full-screen dramatic banner for announce events. Auto-dismiss handled by parent. */
export function Banner({ textKey, lang, sub }: { textKey: string; lang: Lang; sub?: string }) {
  return (
    <div className="banner-wrap">
      <div className="banner">
        <div className="banner-text">{t(lang, textKey as Parameters<typeof t>[1])}</div>
        {sub && <div className="banner-sub">{sub}</div>}
      </div>
    </div>
  );
}

/** Flying coins for the results screen. */
export function CoinRain({ count = 24 }: { count?: number }) {
  const coins = Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    dur: 1.6 + Math.random() * 1.4,
    size: 14 + Math.random() * 18,
  }));
  return (
    <div className="coin-rain">
      {coins.map((c, i) => (
        <div
          key={`coin-${i}`}
          className="coin"
          style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, width: c.size, height: c.size }}
        />
      ))}
    </div>
  );
}

/** Speech bubble over a seat (voice lines / emotes / reactions). */
export function Bubble({ text, emoji }: { text?: string; emoji?: string }) {
  return (
    <div className="bubble">
      {emoji && <span className="bubble-emoji">{emoji}</span>}
      {text && <span>{text}</span>}
    </div>
  );
}

export function characterEmoji(id: string): string {
  return CHARACTERS.find(c => c.id === id)?.emoji ?? '🃏';
}

/** Illustrated avatar portrait (generated set in public/avatars/). */
export function avatarUrl(id: string): string {
  return `avatars/${id}.webp`;
}

export function Avatar({ id, className }: { id: string; className?: string }) {
  return <img src={avatarUrl(id)} alt={id} className={className ?? 'avatar-img'} draggable={false} />;
}

export function SeatTag({ seat, lang }: { seat: Seat; lang: Lang }) {
  return <span className="seat-tag">{seatLabel(lang, seat)}</span>;
}
