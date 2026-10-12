# All-In Bridge — Club Playtest Guide

How to host a playtest session for the bridge club from a Mac on the same Wi-Fi.

## One-time setup (host Mac)

```bash
# Node 18+ required (https://nodejs.org)
cd ~/workspace/all-in-bridge   # or wherever you cloned the repo
npm install
cd client && npm install
```

## Hosting a session

**Terminal 1 — game server (port 8080):**
```bash
cd ~/workspace/all-in-bridge
npm run server
```

**Terminal 2 — web client, exposed to the LAN:**
```bash
cd ~/workspace/all-in-bridge/client
npm run dev -- --host
```

**Find the Mac's Wi-Fi IP** (share this with players):
```bash
ipconfig getifaddr en0
```

Players on the same Wi-Fi open `http://<THAT-IP>:5173` on their phones or
laptops. The game connects to the server automatically — no config needed.

> macOS may ask to allow Node through the firewall — click Allow.
> Everyone must be on the same Wi-Fi network (a phone hotspot works too).

## Playing

1. Enter your name, pick a character, choose language (EN/中文).
2. **Quick Play** — jump into matchmaking; when 4 players are waiting, a table forms automatically.
3. **Create** a room → you get a 6-character share code. Or **Join** with a code.
4. The first 4 people in play N/E/S/W; anyone after that auto-joins as an observer.
5. Bid, play, score. "Next board" deals again.
6. **Claiming:** when the rest are yours, the declarer can tap ✋ Claim and name
   how many of the remaining tricks they'll win — both defenders must accept.
7. **Dropped?** If your connection dies mid-game, the app auto-reconnects and
   puts you back in your seat (within 60s).
8. Your results are tracked automatically — tap **📊 Stats** on the home screen
   for your boards, win rate, recent games, and the club leaderboard.

## Duplicate competition (club night mode)

1. Create competition → you get a `Txxxxx` code. Tick **Public** and pick a duration
   (1/3/7 days, or no limit) to run an async club event — players join tables
   whenever they're free during the window.
2. Create 2+ tables under it — every table plays the *same* pre-shuffled boards.
3. Players can also tap **Refresh** under Duplicate Competition to see all open
   public competitions and **Join a table** directly — no share code needed.
4. Live matchpoint standings update as tables finish.

## Test checklist

- [ ] 4-player game start to finish (bidding → play → score → next board)
- [ ] Bidding: pass, suit bids, NT, double, redouble
- [ ] Disconnect mid-game and rejoin within 60 seconds (hand should restore)
- [ ] Observer joins mid-game and sees the table
- [ ] Mixed-language table (some players EN, some 中文)
- [ ] Bridge Bootcamp tutorial on a phone
- [ ] Duplicate: 2 tables finish a board, standings page updates

## Reporting a bug

Paste into the group chat:

```
What happened:
What I expected:
My seat + character:
Room code:
Phone or desktop + browser:
Screenshot (if visual):
```

## Stopping

Ctrl+C both terminals. Competition results persist in `./data/competitions.json`.
