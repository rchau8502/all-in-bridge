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
export type Lang = 'en' | 'zh';
/** Every voice line a character can have, per language. */
export declare const VOICE_LINE_IDS: readonly string[];
export type VoiceLineId = (typeof VOICE_LINE_IDS)[number];
export declare function isVoiceLineId(id: string): id is VoiceLineId;
/** URL for a voice clip. Does NOT check existence — use VoicePack for that. */
export declare function voiceUrl(lang: Lang, characterId: string, lineId: string): string;
export interface VoicePack {
    lang: Lang;
    characterId: string;
    /** Line IDs with a real file behind them. */
    available: ReadonlySet<string>;
    /**
     * URL for a line, or null when the file is missing.
     * Callers MUST handle null (silent fallback / on-screen text).
     */
    url(lineId: string): string | null;
}
/**
 * Build a pack, probing which files exist. `exists` is injected so the
 * browser client can use fetch-HEAD while tests use a stub. Probing is
 * sequential and cheap (51 small checks, cached by the client).
 */
export declare function loadVoicePack(lang: Lang, characterId: string, exists: (url: string) => Promise<boolean>): Promise<VoicePack>;
/**
 * Per-seat character picks for a table. Duplicates are allowed (cosmetic).
 * The PVP server owns the authoritative copy; this validates client input.
 */
export declare class CharacterSelect {
    private picks;
    pick(seat: string, characterId: string): void;
    get(seat: string): string | null;
    clear(seat: string): void;
    entries(): Array<[string, string]>;
}
//# sourceMappingURL=voices.d.ts.map