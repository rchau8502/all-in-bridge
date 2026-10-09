/**
 * protocol.ts — client → server messages.
 *
 * JSON over WebSocket. The server validates every message; malformed or
 * out-of-turn actions get an `error` event, never a crash.
 */
import type { Lang } from '../shared/voices.js';
export type { Bid } from '../shared/bidding.js';
export type { Card, Seat } from '../shared/deck.js';
export type ClientMessage = {
    action: 'join';
    roomCode?: string;
    name: string;
    characterId: string;
    lang: Lang;
    clientId?: string;
} | {
    action: 'start';
} | {
    action: 'next_board';
} | {
    action: 'bid';
    bid: unknown;
} | {
    action: 'play';
    card: unknown;
} | {
    action: 'pick_character';
    characterId: string;
} | {
    action: 'emote';
    emoteId: string;
} | {
    action: 'voice';
    lineId: string;
} | {
    action: 'create_competition';
    name: string;
    boards: number;
} | {
    action: 'create_table';
    competitionCode: string;
} | {
    action: 'follow_competition';
    competitionCode: string;
} | {
    action: 'snapshot';
};
/** Parse + shape-check an inbound message. Throws on anything invalid. */
export declare function parseClientMessage(data: unknown): ClientMessage;
/** Error codes the server can send back in `error` events. */
export declare const ERROR_CODES: readonly ['unknown-action', 'invalid-json', 'bad-join', 'bad-character', 'bad-emote', 'bad-voice', 'bad-bid', 'bad-play', 'not-in-room', 'not-your-turn', 'illegal-bid', 'illegal-play', 'not-your-card', 'wrong-phase', 'not-host', 'need-4-players', 'unknown-character', 'room-not-found', 'bad-competition', 'competition-not-found', 'no-more-boards'];
export type ErrorCode = (typeof ERROR_CODES)[number];
//# sourceMappingURL=protocol.d.ts.map