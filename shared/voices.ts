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

export type Lang = 'en' | 'zh';

const BID_IDS: string[] = (() => {
  const ids: string[] = ['pass'];
  const denoms = ['c', 'd', 'h', 's', 'nt'];
  for (let level = 1; level <= 7; level++) {
    for (const d of denoms) ids.push(`bid_${level}${d}`);
  }
  ids.push('double', 'redouble');
  return ids;
})();

/** Every voice line a character can have, per language. */
export const VOICE_LINE_IDS: readonly string[] = [
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
] as const;

export type VoiceLineId = (typeof VOICE_LINE_IDS)[number];

export function isVoiceLineId(id: string): id is VoiceLineId {
  return (VOICE_LINE_IDS as readonly string[]).includes(id);
}

/** URL for a voice clip. Does NOT check existence — use VoicePack for that. */
export function voiceUrl(lang: Lang, characterId: string, lineId: string): string {
  if (lang !== 'en' && lang !== 'zh') throw new Error(`bad lang: ${lang}`);
  if (!isValidCharacterId(characterId)) throw new Error(`bad character: ${characterId}`);
  if (!isVoiceLineId(lineId)) throw new Error(`bad voice line id: ${lineId}`);
  return `voices/${lang}/${characterId}/${lineId}.mp3`;
}

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
export async function loadVoicePack(
  lang: Lang,
  characterId: string,
  exists: (url: string) => Promise<boolean>
): Promise<VoicePack> {
  if (!isValidCharacterId(characterId)) throw new Error(`bad character: ${characterId}`);
  const available = new Set<string>();
  for (const lineId of VOICE_LINE_IDS) {
    const url = voiceUrl(lang, characterId, lineId);
    try {
      if (await exists(url)) available.add(lineId);
    } catch {
      // A failed probe counts as missing — never break the game.
    }
  }
  return {
    lang,
    characterId,
    available,
    url(lineId: string): string | null {
      if (!isVoiceLineId(lineId)) return null;
      return available.has(lineId) ? voiceUrl(lang, characterId, lineId) : null;
    },
  };
}

/**
 * Per-seat character picks for a table. Duplicates are allowed (cosmetic).
 * The PVP server owns the authoritative copy; this validates client input.
 */
export class CharacterSelect {
  private picks = new Map<string, string>(); // seat -> characterId

  pick(seat: string, characterId: string): void {
    if (!isValidCharacterId(characterId)) {
      throw new Error(`unknown character: ${characterId}`);
    }
    this.picks.set(seat, characterId);
  }

  get(seat: string): string | null {
    return this.picks.get(seat) ?? null;
  }

  clear(seat: string): void {
    this.picks.delete(seat);
  }

  entries(): Array<[string, string]> {
    return [...this.picks.entries()];
  }
}
