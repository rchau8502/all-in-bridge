/**
 * protocol.ts — client → server messages.
 *
 * JSON over WebSocket. The server validates every message; malformed or
 * out-of-turn actions get an `error` event, never a crash.
 */

import type { Bid } from '../shared/bidding.js';
import type { Card, Seat } from '../shared/deck.js';
import type { Lang } from '../shared/voices.js';

export type { Bid } from '../shared/bidding.js';
export type { Card, Seat } from '../shared/deck.js';

export type ClientMessage =
  | { action: 'join'; roomCode?: string; name: string; characterId: string; lang: Lang; clientId?: string }
  | { action: 'start' }
  | { action: 'next_board' }
  | { action: 'bid'; bid: unknown }
  | { action: 'play'; card: unknown }
  | { action: 'pick_character'; characterId: string }
  | { action: 'emote'; emoteId: string }
  | { action: 'voice'; lineId: string };

const ACTIONS = new Set([
  'join', 'start', 'next_board', 'bid', 'play', 'pick_character', 'emote', 'voice',
]);

/** Parse + shape-check an inbound message. Throws on anything invalid. */
export function parseClientMessage(data: unknown): ClientMessage {
  let obj: Record<string, unknown>;
  try {
    obj = typeof data === 'string' ? JSON.parse(data) : (data as Record<string, unknown>);
  } catch {
    throw new Error('invalid-json');
  }
  if (!obj || typeof obj !== 'object' || !ACTIONS.has(obj['action'] as string)) {
    throw new Error('unknown-action');
  }
  const action = obj['action'] as ClientMessage['action'];

  const str = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

  switch (action) {
    case 'join': {
      if (!str(obj['name']) || !str(obj['characterId'])) throw new Error('bad-join');
      if (obj['lang'] !== 'en' && obj['lang'] !== 'zh') throw new Error('bad-join');
      if (obj['roomCode'] !== undefined && !str(obj['roomCode'])) throw new Error('bad-join');
      if (obj['clientId'] !== undefined && !str(obj['clientId'])) throw new Error('bad-join');
      return obj as ClientMessage;
    }
    case 'pick_character': {
      if (!str(obj['characterId'])) throw new Error('bad-character');
      return obj as ClientMessage;
    }
    case 'emote': {
      if (!str(obj['emoteId'])) throw new Error('bad-emote');
      return obj as ClientMessage;
    }
    case 'voice': {
      if (!str(obj['lineId'])) throw new Error('bad-voice');
      return obj as ClientMessage;
    }
    case 'bid': {
      if (obj['bid'] === undefined) throw new Error('bad-bid');
      return obj as ClientMessage;
    }
    case 'play': {
      if (obj['card'] === undefined) throw new Error('bad-play');
      return obj as ClientMessage;
    }
    default:
      return obj as ClientMessage; // start, next_board
  }
}

/** Error codes the server can send back in `error` events. */
export const ERROR_CODES = [
  'unknown-action',
  'invalid-json',
  'bad-join',
  'bad-character',
  'bad-emote',
  'bad-voice',
  'bad-bid',
  'bad-play',
  'not-in-room',
  'not-your-turn',
  'illegal-bid',
  'illegal-play',
  'not-your-card',
  'wrong-phase',
  'not-host',
  'need-4-players',
  'unknown-character',
  'room-not-found',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];
