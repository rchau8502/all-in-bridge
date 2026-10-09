import { describe, it, expect } from 'vitest';
import { CHARACTERS, getCharacter, isValidCharacterId } from './characters.js';
import { VOICE_LINE_IDS, isVoiceLineId, voiceUrl, loadVoicePack, CharacterSelect, } from './voices.js';
describe('character roster', () => {
    it('has exactly 4 characters with unique ids', () => {
        expect(CHARACTERS).toHaveLength(4);
        const ids = CHARACTERS.map(c => c.id);
        expect(new Set(ids).size).toBe(4);
        expect(ids).toEqual(['cowboy', 'gamer', 'grandma', 'robot']);
    });
    it('every character has name/tagline keys, colors, and an emoji', () => {
        for (const c of CHARACTERS) {
            expect(c.nameKey).toMatch(/^character\.[a-z]+\.name$/);
            expect(c.taglineKey).toMatch(/^character\.[a-z]+\.tagline$/);
            expect(c.colors.primary).toMatch(/^#[0-9a-f]{6}$/);
            expect(c.colors.secondary).toMatch(/^#[0-9a-f]{6}$/);
            expect(c.emoji.length).toBeGreaterThan(0);
        }
    });
    it('getCharacter finds by id, null otherwise', () => {
        expect(getCharacter('cowboy').id).toBe('cowboy');
        expect(getCharacter('nope')).toBeNull();
    });
    it('isValidCharacterId', () => {
        expect(isValidCharacterId('robot')).toBe(true);
        expect(isValidCharacterId('')).toBe(false);
    });
});
describe('voice line registry', () => {
    it('has 51 line ids: 2 greetings + 38 bids + 2 announcements + 6 reactions + 3 emotes', () => {
        expect(VOICE_LINE_IDS).toHaveLength(51);
        for (const id of ['hello', 'gl', 'pass', 'bid_1c', 'bid_7nt', 'double', 'redouble',
            'game_made', 'slam_bid', 'trick_win', 'nice_play', 'wow', 'oops',
            'win_game', 'lose_game', 'thanks', 'hurry', 'haha']) {
            expect(isVoiceLineId(id)).toBe(true);
        }
        expect(isVoiceLineId('bid_8c')).toBe(false);
        expect(isVoiceLineId('')).toBe(false);
    });
    it('covers all 35 level+denomination bids', () => {
        const bids = VOICE_LINE_IDS.filter(id => id.startsWith('bid_'));
        expect(bids).toHaveLength(35);
    });
});
describe('voiceUrl', () => {
    it('builds the {lang}/{character}/{lineId}.mp3 path', () => {
        expect(voiceUrl('en', 'cowboy', 'bid_3nt')).toBe('voices/en/cowboy/bid_3nt.mp3');
        expect(voiceUrl('zh', 'grandma', 'pass')).toBe('voices/zh/grandma/pass.mp3');
    });
    it('rejects bad lang, character, or line id', () => {
        expect(() => voiceUrl('fr', 'cowboy', 'pass')).toThrow();
        expect(() => voiceUrl('en', 'nope', 'pass')).toThrow();
        expect(() => voiceUrl('en', 'cowboy', 'nope')).toThrow();
    });
});
describe('loadVoicePack', () => {
    it('marks existing files available and missing ones not', async () => {
        const have = new Set(['voices/en/cowboy/hello.mp3', 'voices/en/cowboy/pass.mp3']);
        const pack = await loadVoicePack('en', 'cowboy', async (url) => have.has(url));
        expect(pack.available.has('hello')).toBe(true);
        expect(pack.available.has('pass')).toBe(true);
        expect(pack.available.has('bid_1c')).toBe(false);
        expect(pack.url('hello')).toBe('voices/en/cowboy/hello.mp3');
        expect(pack.url('bid_1c')).toBeNull(); // graceful fallback
        expect(pack.url('nope')).toBeNull();
    });
    it('an empty pack never breaks lookups', async () => {
        const pack = await loadVoicePack('zh', 'robot', async () => false);
        expect(pack.available.size).toBe(0);
        for (const id of VOICE_LINE_IDS) {
            expect(pack.url(id)).toBeNull();
        }
    });
    it('a failing probe counts as missing, not fatal', async () => {
        const pack = await loadVoicePack('en', 'gamer', async () => {
            throw new Error('network down');
        });
        expect(pack.available.size).toBe(0);
    });
    it('rejects unknown characters', async () => {
        await expect(loadVoicePack('en', 'nope', async () => true)).rejects.toThrow();
    });
});
describe('CharacterSelect', () => {
    it('picks, gets, clears, and lists', () => {
        const sel = new CharacterSelect();
        sel.pick('N', 'cowboy');
        sel.pick('S', 'cowboy'); // duplicates allowed
        expect(sel.get('N')).toBe('cowboy');
        expect(sel.get('E')).toBeNull();
        expect(sel.entries()).toHaveLength(2);
        sel.clear('N');
        expect(sel.get('N')).toBeNull();
    });
    it('rejects unknown character ids', () => {
        const sel = new CharacterSelect();
        expect(() => sel.pick('N', 'nope')).toThrow();
    });
});
//# sourceMappingURL=characters.test.js.map