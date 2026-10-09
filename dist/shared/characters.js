/**
 * characters.ts — the selectable character roster.
 *
 * Each player picks a character before a game. A character is an identity:
 * avatar art (inline SVG lands in milestone 6; `emoji` is the placeholder
 * glyph until then) plus a voice pack (see voices.ts). Names/taglines are
 * i18n keys — the locale files arrive in milestone 7.
 */
export const CHARACTERS = [
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
export function getCharacter(id) {
    return CHARACTERS.find(c => c.id === id) ?? null;
}
export function isValidCharacterId(id) {
    return getCharacter(id) !== null;
}
//# sourceMappingURL=characters.js.map