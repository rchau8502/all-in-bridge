# All-In Bridge / 全民桥牌

A bridge **teaching** app with arcade energy — a conversational coach,
card slams, character reactions, music and punchy SFX. Western cartoon
presentation, bilingual EN/中文 from the ground up (both language versions
hand-written in parallel, never machine-translated).

**Play it:** https://rchau8502.github.io/all-in-bridge/ — the full
12-lesson Bridge Bootcamp runs right in the browser, no account, no install.

## Layout

- `shared/` — pure game logic, no I/O: deck, bidding, play, scoring,
  tutorial engine + bilingual lessons, character roster, voice-line registry.
- `client/` — Vite + React web app: home (pick your coach) and the
  Bridge Bootcamp tutorial. All music/SFX synthesized with the Web Audio
  API; voice packs are the only external assets
  (`voices/{lang}/{character}/{line}.mp3`) and missing files fall back
  to silence.

## Tutorial — Bridge Bootcamp (ACBL Series 1)

Scripted, bilingual lessons following the ACBL Intro to Bridge Series 1
progression — play first, then bidding. The coach teaches like a friend
at the table: short chat bubbles, everyday analogies, and the HOW and WHY
of every single step. All four hands are face-up (open book) so learners
can see exactly what is happening and why it works.

After **every trick**, play pauses for a review: the four cards stay on
the table, the winning card glows, and the coach explains — card by card —
who won, who lost, and why (follow suit, biggest card wins, trumps beat
everything, and a throw-away card can never win a trick).

1. Say Hi to the Cards — suits, colors, ranks; play your first trick
2. Win the Tricks — follow suit, highest card wins, winner leads next
3. Count and Plan — sure winners, the finesse, entries between hands
4. Trump Power — ruffing: any trump beats any card of the led suit
5. Count Your Losers — trump contracts flip the script: count losers from the long hand, then plan
6. Make Losers Vanish — ruff in dummy, throw losers on spare winners, the ruffing finesse
7. Bidding Is Talking — bids as messages, high-card points, fits
8. Answer Partner — responding to a minor-suit opening
9. Raise and Play — a complete 2♥ hand as declarer, dummy face-up
10. Opener Tells More — opener's rebid after a major response
11. Go for Game! — scoring, partscore vs game, the ~25-point rule
12. Jump In! — overcalling when the other side opens first

## Run it

```bash
cd client && npm install
npm run dev        # → http://localhost:5173

# production build (GitHub Pages variant)
GH_PAGES=1 npm run build   # → client/dist, serve statically
```

## Test

```bash
npm test                                # engine + tutorial + explainer tests (vitest)
npx tsc --noEmit -p tsconfig.json       # shared type-check
cd client && npm run build              # client type-check + bundle
```

## Voice packs

AI-generated EN/ZH placeholder voices ship in `client/public/voices/`;
club recordings can replace them file-for-file
(`voices/{en,zh}/{cowboy,gamer,grandma,robot}/{line}.mp3`).
