# All-In Bridge / 全民桥牌

Full contract bridge with the energy of 全民斗地主 — western cartoon arcade
presentation, PVP-only, no bots. Bilingual EN/中文 from the ground up:
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
