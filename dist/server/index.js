/**
 * index.ts — WebSocket server bootstrap.
 *
 *   PORT=8080 node dist/server/index.js
 *
 * One process, many rooms. Clients speak JSON (see protocol.ts) and get
 * language-neutral GameEvents back (see shared/events.ts).
 */
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './manager.js';
import { randomUUID } from 'node:crypto';
const PORT = parseInt(process.env['PORT'] ?? '8080', 10);
const sockets = new Map();
const manager = new RoomManager((clientId, event) => {
    const ws = sockets.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
    }
});
const wss = new WebSocketServer({ port: PORT });
wss.on('connection', (ws) => {
    const clientId = randomUUID();
    sockets.set(clientId, ws);
    ws.on('message', (data) => {
        manager.handleMessage(clientId, data.toString('utf8'), Date.now());
    });
    ws.on('close', () => {
        sockets.delete(clientId);
        manager.handleDisconnect(clientId, Date.now());
    });
    ws.on('error', () => {
        sockets.delete(clientId);
        manager.handleDisconnect(clientId, Date.now());
    });
});
// Reap expired seats and empty rooms.
setInterval(() => manager.sweep(Date.now()), 30000);
// Persist competitions (boards + results) across restarts.
const DATA_PATH = process.env['DATA_PATH'] ?? './data/competitions.json';
manager.loadCompetitions(DATA_PATH);
setInterval(() => {
    try {
        manager.saveCompetitions(DATA_PATH);
    }
    catch (e) {
        console.error('competition save failed:', e.message);
    }
}, 60000);
process.on('SIGTERM', () => {
    try {
        manager.saveCompetitions(DATA_PATH);
    }
    catch { /* shutting down */ }
    process.exit(0);
});
console.log(`All-In Bridge server listening on :${PORT}`);
//# sourceMappingURL=index.js.map