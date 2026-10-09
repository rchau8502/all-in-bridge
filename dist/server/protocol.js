/**
 * protocol.ts — client → server messages.
 *
 * JSON over WebSocket. The server validates every message; malformed or
 * out-of-turn actions get an `error` event, never a crash.
 */
const ACTIONS = new Set([
    'join', 'start', 'next_board', 'bid', 'play', 'pick_character', 'emote', 'voice',
    'create_competition', 'create_table', 'follow_competition', 'snapshot',
]);
/** Parse + shape-check an inbound message. Throws on anything invalid. */
export function parseClientMessage(data) {
    let obj;
    try {
        obj = typeof data === 'string' ? JSON.parse(data) : data;
    }
    catch {
        throw new Error('invalid-json');
    }
    if (!obj || typeof obj !== 'object' || !ACTIONS.has(obj['action'])) {
        throw new Error('unknown-action');
    }
    const action = obj['action'];
    const str = (v) => typeof v === 'string' && v.length > 0;
    switch (action) {
        case 'join': {
            if (!str(obj['name']) || !str(obj['characterId']))
                throw new Error('bad-join');
            if (obj['lang'] !== 'en' && obj['lang'] !== 'zh')
                throw new Error('bad-join');
            if (obj['roomCode'] !== undefined && !str(obj['roomCode']))
                throw new Error('bad-join');
            if (obj['clientId'] !== undefined && !str(obj['clientId']))
                throw new Error('bad-join');
            return obj;
        }
        case 'pick_character': {
            if (!str(obj['characterId']))
                throw new Error('bad-character');
            return obj;
        }
        case 'emote': {
            if (!str(obj['emoteId']))
                throw new Error('bad-emote');
            return obj;
        }
        case 'voice': {
            if (!str(obj['lineId']))
                throw new Error('bad-voice');
            return obj;
        }
        case 'bid': {
            if (obj['bid'] === undefined)
                throw new Error('bad-bid');
            return obj;
        }
        case 'play': {
            if (obj['card'] === undefined)
                throw new Error('bad-play');
            return obj;
        }
        case 'create_competition': {
            if (!str(obj['name']))
                throw new Error('bad-competition');
            const boards = obj['boards'];
            if (typeof boards !== 'number' || !Number.isInteger(boards) || boards < 1 || boards > 32) {
                throw new Error('bad-competition');
            }
            return obj;
        }
        case 'create_table':
        case 'follow_competition': {
            if (!str(obj['competitionCode']))
                throw new Error('bad-competition');
            return obj;
        }
        default:
            return obj; // start, next_board
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
    'bad-competition',
    'competition-not-found',
    'no-more-boards',
];
//# sourceMappingURL=protocol.js.map