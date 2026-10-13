# All-In Bridge / 全民桥牌

Full contract bridge with arcade energy — dramatic banners, card slams,
character reactions, flying-coin results, music and punchy SFX.
Western cartoon presentation, PVP-only, no bots. Bilingual EN/中文 from the ground up:
the server speaks language-neutral event codes, and every client renders
in its own language, so English and Chinese players can sit at the same table.

## Layout

- `shared/` — pure game logic, no I/O: deck, bidding, play, scoring,
  language-neutral events, tutorial engine + bilingual lessons, duplicate
  matchpoint scoring, character roster, voice-line registry.
- `server/` — authoritative WebSocket server: rooms by share code,
  observers, reconnects, hidden hands; duplicate competitions with shared
  boards, live matchpoint standings, and JSON persistence.
- `client/` — Vite + React web app: home, lobby, table, tutorial,
  competition standings. All music/SFX synthesized with the Web Audio API;
  voice packs are the only external assets (`voices/{lang}/{character}/{line}.mp3`)
  and the game tolerates missing files.

## Tutorial — Bridge Bootcamp (ACBL Series 1)

Scripted, bilingual (EN/中文) lessons following the ACBL Intro to Bridge
Series 1 progression — from "52 cards in a deck" to playing complete hands.
Lessons teach visually through guided bids and plays (no multiple-choice);
wrong actions get hints without advancing.

1. The Deck / 认识纸牌 — suits, colors, ranks, suit ranking for bidding
2. Winning Tricks / 赢墩 — follow suit, highest wins, winner leads
3. Trump / 将牌 — ruffing, trump beats everything
4. The Auction / 叫牌基础 — turn order, outranking, declarer
5. Bidding Conversation / 叫牌交流 — high-card points, opening, responding,
   rebidding, overcalls
6. Contracts & Scoring / 定约与计分 — what a contract means, scoring
7. Plan Your Play / 打牌计划 — count sure winners, cash them first
8. Play a Full Hand / 打一整副牌 — a complete 2♥ hand, declarer + dummy

## Run it

```bash
# 1. game server (port 8080)
npm run server

# 2. web client (dev)
cd client && npm run dev
# → http://localhost:5173 (connects to ws://<host>:8080)

# production client build
cd client && npm run build   # → client/dist, serve statically
```

## Test

```bash
npm test                 # all unit + integration tests (vitest)
npx tsc --noEmit -p tsconfig.json              # server/shared type-check
cd client && npx tsc -p tsconfig.app.json --noEmit   # client type-check
```

## Protocol

Clients speak JSON over WebSocket (`server/protocol.ts`); the server
replies with language-neutral `GameEvent`s (`shared/events.ts`).
One share code = one room: first four joiners play N/E/S/W, the rest watch
kibitzer-style. Seats survive disconnects for 60s with full state snapshots
on rejoin.

Competitions: `create_competition` → `Txxxxx` code; `create_table` adds
tables that all play the same pre-shuffled boards; `standings_update`
events carry live matchpoint standings. Competitions persist to
`./data/competitions.json` (override with `DATA_PATH`).

## Voice packs

Record per `voice-recording-script.md` (in `~/workspace/your_files/codex-anime-bridge/`)
and drop mp3s at `client/public/voices/{en,zh}/{cowboy,gamer,grandma,robot}/{line}.mp3`.
Missing files fall back to silence — never break the game.
