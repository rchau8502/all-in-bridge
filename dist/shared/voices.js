/**
 * voices.ts — voice-line system.
 *
 * Voice packs live at `voices/{lang}/{character}/{lineId}.mp3`
 * (e.g. `voices/en/cowboy/bid_3nt.mp3`). Recordings are supplied later by
 * volunteer VAs; the game MUST keep working when files are missing —
 * every lookup falls back to null so the client can stay silent (or show
 * text) instead of breaking.
 *
 * The canonical line-ID list mirrors the voice recording script
 * (~/workspace/your_files/codex-anime-bridge/voice-recording-script.md).
 * Add new lines here AND to the recording script together.
 */
import { isValidCharacterId } from './characters.js';
const BID_IDS = (() => {
    const ids = ['pass'];
    const denoms = ['c', 'd', 'h', 's', 'nt'];
    for (let level = 1; level <= 7; level++) {
        for (const d of denoms)
            ids.push(`bid_${level}${d}`);
    }
    ids.push('double', 'redouble');
    return ids;
})();
/** Every voice line a character can have, per language. */
export const VOICE_LINE_IDS = [
    'hello',
    'gl',
    ...BID_IDS,
    'game_made',
    'slam_bid',
    'trick_win',
    'nice_play',
    'wow',
    'oops',
    'win_game',
    'lose_game',
    'thanks',
    'hurry',
    'haha',
];
export function isVoiceLineId(id) {
    return VOICE_LINE_IDS.includes(id);
}
/** URL for a voice clip. Does NOT check existence — use VoicePack for that. */
export function voiceUrl(lang, characterId, lineId) {
    if (lang !== 'en' && lang !== 'zh')
        throw new Error(`bad lang: ${lang}`);
    if (!isValidCharacterId(characterId))
        throw new Error(`bad character: ${characterId}`);
    if (!isVoiceLineId(lineId))
        throw new Error(`bad voice line id: ${lineId}`);
    return `voices/${lang}/${characterId}/${lineId}.mp3`;
}
/**
 * Build a pack, probing which files exist. `exists` is injected so the
 * browser client can use fetch-HEAD while tests use a stub. Probing is
 * sequential and cheap (51 small checks, cached by the client).
 */
export async function loadVoicePack(lang, characterId, exists) {
    if (!isValidCharacterId(characterId))
        throw new Error(`bad character: ${characterId}`);
    const available = new Set();
    for (const lineId of VOICE_LINE_IDS) {
        const url = voiceUrl(lang, characterId, lineId);
        try {
            if (await exists(url))
                available.add(lineId);
        }
        catch {
            // A failed probe counts as missing — never break the game.
        }
    }
    return {
        lang,
        characterId,
        available,
        url(lineId) {
            if (!isVoiceLineId(lineId))
                return null;
            return available.has(lineId) ? voiceUrl(lang, characterId, lineId) : null;
        },
    };
}
/**
 * Per-seat character picks for a table. Duplicates are allowed (cosmetic).
 * The PVP server owns the authoritative copy; this validates client input.
 */
export class CharacterSelect {
    constructor() {
        this.picks = new Map(); // seat -> characterId
    }
    pick(seat, characterId) {
        if (!isValidCharacterId(characterId)) {
            throw new Error(`unknown character: ${characterId}`);
        }
        this.picks.set(seat, characterId);
    }
    get(seat) {
        return this.picks.get(seat) ?? null;
    }
    clear(seat) {
        this.picks.delete(seat);
    }
    entries() {
        return [...this.picks.entries()];
    }
}
//# sourceMappingURL=voices.js.map