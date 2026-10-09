/**
 * characters.ts — the selectable character roster.
 *
 * Each player picks a character before a game. A character is an identity:
 * avatar art (inline SVG lands in milestone 6; `emoji` is the placeholder
 * glyph until then) plus a voice pack (see voices.ts). Names/taglines are
 * i18n keys — the locale files arrive in milestone 7.
 */

export interface CharacterDef {
  /** Stable id; also the voice-pack folder name. */
  id: string;
  /** i18n key for the display name, e.g. 'character.cowboy.name'. */
  nameKey: string;
  /** i18n key for the one-line personality tagline. */
  taglineKey: string;
  /** Brand colors used by the avatar art and UI accents. */
  colors: { primary: string; secondary: string };
  /** Placeholder glyph until the SVG avatar art lands. */
  emoji: string;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'cowboy',
    nameKey: 'character.cowboy.name',
    taglineKey: 'character.cowboy.tagline',
    colors: { primary: '#b3541e', secondary: '#f5d78e' },
    emoji: '🤠',
  },
  {
    id: 'gamer',
    nameKey: 'character.gamer.name',
    taglineKey: 'character.gamer.tagline',
    colors: { primary: '#7c3aed', secondary: '#22d3ee' },
    emoji: '🎮',
  },
  {
    id: 'grandma',
    nameKey: 'character.grandma.name',
    taglineKey: 'character.grandma.tagline',
    colors: { primary: '#db2777', secondary: '#fde68a' },
    emoji: '👵',
  },
  {
    id: 'robot',
    nameKey: 'character.robot.name',
    taglineKey: 'character.robot.tagline',
    colors: { primary: '#475569', secondary: '#38bdf8' },
    emoji: '🤖',
  },
];

export function getCharacter(id: string): CharacterDef | null {
  return CHARACTERS.find(c => c.id === id) ?? null;
}

export function isValidCharacterId(id: string): boolean {
  return getCharacter(id) !== null;
}
