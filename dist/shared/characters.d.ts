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
    colors: {
        primary: string;
        secondary: string;
    };
    /** Placeholder glyph until the SVG avatar art lands. */
    emoji: string;
}
export declare const CHARACTERS: CharacterDef[];
export declare function getCharacter(id: string): CharacterDef | null;
export declare function isValidCharacterId(id: string): boolean;
//# sourceMappingURL=characters.d.ts.map