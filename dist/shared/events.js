/**
 * events.ts — language-neutral event codes.
 *
 * The server (and game core) NEVER emits pre-rendered display strings.
 * Every event is a code + structured payload; each client localizes it
 * into its own selected language (EN/中文). This is what makes
 * mixed-language tables work: a Chinese player and an English player
 * share one game and each sees/hears their own language.
 */
export function makeEvent(type, payload) {
    return { type, payload, at: Date.now() };
}
//# sourceMappingURL=events.js.map