# All-In Bridge / 全民桥牌

A bridge **teaching** app with arcade energy — a conversational coach,
card slams, character reactions, music and punchy SFX. Western cartoon
presentation, bilingual EN/中文 from the ground up (both language versions
hand-written in parallel, never machine-translated).

**Play it:** https://rchau8502.github.io/all-in-bridge/ — the full
35-lesson Bridge Bootcamp runs right in the browser, no account, no install.

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

Each lesson starts with its learning focus. Detailed card analysis pauses
only after the **opening card**; later play uses action hints without
repeated card-by-card reviews. When the remaining tricks are provably
cashable, the learner can claim them and continue to the lesson wrap-up.

The catalog has **25 foundation lessons** and **10 optional advanced lessons**.
Foundations use a simple natural two-over-one game-forcing system: natural
major raises, Stayman and Jacoby transfers (including the strong-hand
declarer logic), inverted minor raises, Jacoby 2NT, splinters, minimum and
invitational rebids, reverses and game decisions.
Within the same natural bid family, higher commitments show more strength.
Named conventions use their agreed meanings. Inverted minors show 11+ and
five+ support, forcing at least one round, with stopper-first continuations
to investigate 3NT. All basic non-pass auction calls carry an authored
non-forcing, one-round-forcing or game-forcing label.
Once game is already forced, economical shape-showing bids are not weak sign-offs.
Lesson 13 retains the Dating Model for invitations and game forces.
The former repeated strength/minor-response module is now the visible
“Semi-Forcing 1NT: I Have More to Say” lesson. It covers the 5–12 waiting
range, three-card limit raises, long suits with voids, and the narrow
flat-minimum exception for opener passing. Three communication states
(new information, unfinished message, and finished/partner decides)
connect the opening, response and rebid lessons.

Advanced lessons hold Smolen, Texas transfers, Bergen,
competitive agreements, fourth-suit forcing, checkback, fast/slow arrival,
controls and keycards. They explicitly introduce any convention that replaces
the foundation agreement, such as Bergen replacing the natural limit raise.
The advanced syllabus starts collapsed; tutorial navigation shows one track
at a time. Every lesson ends with a bilingual review table.
Use **Back** or **Left arrow** to restore a previous teaching or auction
position, including hands and scores. Lesson IDs remain stable, and old
index-only bookmarks migrate by lesson identity after the reordering.

1. Say Hi to the Cards — suits, colors, ranks; play your first trick
2. Win the Tricks — follow suit, highest card wins, winner leads next
3. Count and Plan — meet declarer, dummy and the opening lead; sure winners counted from both hands, the finesse, developing secondary honors (knock the ace out, count your stoppers)
4. Establish the Long Suit — grow winners in notrump: count their cards, duck once, cash the little ones
5. Trump Power — ruffing: any trump beats any card of the led suit
6. Count Your Losers — trump contracts flip the script: count losers from the long hand, then plan
7. Make Losers Vanish — ruff in dummy, throw losers on spare winners, the ruffing finesse
8. Defense I: The Opening Lead — switch sides: suit choice, the modern agreements (fourth best, top of a sequence), reading partner's cards
9. Defense II: Play With Partner — the four chair rules: third hand high, cover an honor, fourth hand cheap, second hand low
10. The Contract: A Promise — what a contract is (trump + level, level + 6 tricks), game contracts and the fat bonus, the 25-point line, the 8-card fit
11. Bidding Is Talking — bids as messages, high-card points, fits
12. Answer Partner — responding to a minor-suit opening
13. Raise and Play — a complete 2♥ hand as declarer, dummy face-up
14. Opener Tells More — opener's rebid after a major response
15. Go for Game! — scoring, partscore vs game, the ~25-point rule
16. Jump In! — overcalling when the other side opens first

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
