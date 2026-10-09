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
import type { GameEvent } from '../shared/events.js';
import { randomUUID } from 'node:crypto';

const PORT = parseInt(process.env['PORT'] ?? '8080', 10);

const sockets = new Map<string, WebSocket>();

const manager = new RoomManager((clientId: string, event: GameEvent) => {
  const ws = sockets.get(clientId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
});

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws: WebSocket) => {
  const clientId = randomUUID();
  sockets.set(clientId, ws);

  ws.on('message', (data: Buffer) => {
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
setInterval(() => manager.sweep(Date.now()), 30_000);

console.log(`All-In Bridge server listening on :${PORT}`);
