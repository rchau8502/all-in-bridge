/**
 * manager.ts — rooms by share code, clients by connection.
 *
 * One share code = one room instance. The manager routes inbound messages
 * to the right room and tracks which room each connected client belongs to.
 */
import { Room } from './room.js';
import { parseClientMessage } from './protocol.js';
import { makeEvent } from '../shared/events.js';
import { Competition } from './competition.js';
import { isValidCharacterId } from '../shared/characters.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no confusables
export function makeRoomCode(rng = Math.random) {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARS[Math.floor(rng() * CODE_CHARS.length)];
    }
    return code;
}
export class RoomManager {
    constructor(send, boardSource, rng = Math.random) {
        this.send = send;
        this.boardSource = boardSource;
        this.rng = rng;
        this.rooms = new Map();
        this.clientRoom = new Map(); // clientId -> room code
        this.competitions = new Map();
        this.followers = new Map(); // competition code -> clientIds
        this.competitionTables = new Set(); // room codes owned by competitions
        this.queue = []; // quick-match waiting list (ephemeral)
    }
    getRoom(code) {
        return this.rooms.get(code.toUpperCase());
    }
    getCompetition(code) {
        return this.competitions.get(code.toUpperCase());
    }
    /** Route one inbound message from a connected client. */
    handleMessage(clientId, raw, now) {
        let msg;
        try {
            msg = parseClientMessage(raw);
        }
        catch (e) {
            this.send(clientId, makeEvent('error', { code: e.message }));
            return;
        }
        if (msg.action === 'create_competition' || msg.action === 'create_table' ||
            msg.action === 'follow_competition' || msg.action === 'list_competitions' ||
            msg.action === 'join_open_table') {
            this.handleCompetitionAction(clientId, msg, now);
            return;
        }
        if (msg.action === 'quick_match' || msg.action === 'leave_queue') {
            this.handleQueueAction(clientId, msg, now);
            return;
        }
        if (msg.action === 'join') {
            this.dequeue(clientId);
            const wantCode = msg.roomCode?.toUpperCase();
            let room = wantCode ? this.rooms.get(wantCode) : undefined;
            if (wantCode && !room) {
                this.send(clientId, makeEvent('error', { code: 'room-not-found' }));
                return;
            }
            if (!room) {
                let code = makeRoomCode(this.rng);
                while (this.rooms.has(code))
                    code = makeRoomCode(this.rng);
                room = new Room(code, this.send, this.boardSource);
                this.rooms.set(code, room);
            }
            this.clientRoom.set(clientId, room.code);
            try {
                room.join(msg, clientId, now);
            }
            catch (e) {
                this.send(clientId, makeEvent('error', { code: 'bad-join' }));
            }
            return;
        }
        const code = this.clientRoom.get(clientId);
        const room = code ? this.rooms.get(code) : undefined;
        if (!room) {
            this.send(clientId, makeEvent('error', { code: 'not-in-room' }));
            return;
        }
        room.handle(clientId, msg, now);
    }
    handleDisconnect(clientId, now) {
        const code = this.clientRoom.get(clientId);
        if (code)
            this.rooms.get(code)?.leave(clientId, now);
        if (this.dequeue(clientId))
            this.broadcastQueue();
    }
    /** Remove a client from the quick-match queue. Returns true if they were queued. */
    dequeue(clientId) {
        const i = this.queue.findIndex(q => q.clientId === clientId);
        if (i === -1)
            return false;
        this.queue.splice(i, 1);
        return true;
    }
    // ------------------------------------------------------------ quick match ---
    handleQueueAction(clientId, msg, now) {
        if (msg.action === 'leave_queue') {
            if (this.dequeue(clientId))
                this.broadcastQueue();
            return;
        }
        if (!isValidCharacterId(msg.characterId)) {
            this.send(clientId, makeEvent('error', { code: 'unknown-character' }));
            return;
        }
        this.dequeue(clientId);
        this.queue.push({
            clientId,
            name: msg.name.slice(0, 16),
            characterId: msg.characterId,
            lang: msg.lang,
        });
        this.broadcastQueue();
        this.tryMatch(now);
    }
    broadcastQueue() {
        this.queue.forEach((q, i) => {
            this.send(q.clientId, makeEvent('queue_update', { position: i + 1, waiting: this.queue.length }));
        });
    }
    /** Form tables of 4 from the waiting queue. */
    tryMatch(now) {
        while (this.queue.length >= 4) {
            const four = this.queue.splice(0, 4);
            let code = makeRoomCode(this.rng);
            while (this.rooms.has(code))
                code = makeRoomCode(this.rng);
            const room = new Room(code, this.send, this.boardSource);
            this.rooms.set(code, room);
            for (const q of four) {
                this.clientRoom.set(q.clientId, code);
                try {
                    room.join({ action: 'join', name: q.name, characterId: q.characterId, lang: q.lang }, q.clientId, now);
                }
                catch {
                    this.send(q.clientId, makeEvent('error', { code: 'bad-join' }));
                }
            }
        }
        this.broadcastQueue();
    }
    /** Expire dead seats; drop empty non-competition rooms. */
    sweep(now) {
        for (const [code, room] of this.rooms) {
            room.sweep(now);
            if (room.connectedClients().length === 0 && !this.competitionTables.has(code)) {
                this.rooms.delete(code);
            }
        }
    }
    roomCount() {
        return this.rooms.size;
    }
    // ------------------------------------------------------- competitions ---
    makeCompetitionCode() {
        let code = 'T' + makeRoomCode(this.rng).slice(0, 5);
        while (this.competitions.has(code))
            code = 'T' + makeRoomCode(this.rng).slice(0, 5);
        return code;
    }
    handleCompetitionAction(clientId, msg, now) {
        if (msg.action === 'list_competitions') {
            const open = [...this.competitions.values()]
                .filter(c => c.isPublic && c.isOpen(now))
                .map(c => c.summary(now));
            this.send(clientId, makeEvent('competitions_list', { competitions: open }));
            return;
        }
        if (msg.action === 'create_competition') {
            const code = this.makeCompetitionCode();
            const comp = Competition.create(code, msg.name.slice(0, 40), msg.boards, {
                rng: this.rng,
                isPublic: msg.isPublic ?? false,
                durationHours: msg.durationHours ?? 0,
                now,
            });
            this.competitions.set(code, comp);
            this.followers.set(code, new Set());
            const table = this.createTable(comp);
            this.send(clientId, makeEvent('competition_created', {
                competitionCode: code,
                tableCode: table.code,
                boards: comp.boards.length,
            }));
            return;
        }
        const comp = this.competitions.get(msg.competitionCode.toUpperCase());
        if (!comp) {
            this.send(clientId, makeEvent('error', { code: 'competition-not-found' }));
            return;
        }
        if (msg.action === 'join_open_table') {
            if (!comp.isOpen(now)) {
                this.send(clientId, makeEvent('error', { code: 'competition-closed' }));
                return;
            }
            let table = comp.tables.find(t => t.playerCount() < 4);
            if (!table)
                table = this.createTable(comp);
            this.send(clientId, makeEvent('open_table_found', { competitionCode: comp.code, tableCode: table.code }));
            return;
        }
        if (msg.action === 'create_table') {
            const table = this.createTable(comp);
            this.send(clientId, makeEvent('table_created', { competitionCode: comp.code, tableCode: table.code }));
            return;
        }
        // follow_competition
        this.followers.get(comp.code).add(clientId);
        this.send(clientId, makeEvent('competition_joined', {
            competitionCode: comp.code,
            name: comp.name,
            boards: comp.boards.length,
            tables: comp.tables.map(t => t.code),
        }));
        this.sendStandings(clientId, comp);
    }
    createTable(comp) {
        let code = makeRoomCode(this.rng);
        while (this.rooms.has(code))
            code = makeRoomCode(this.rng);
        return this.attachTable(comp, code);
    }
    attachTable(comp, code) {
        const room = new Room(code, this.send, comp.fixedSource(), {
            onBoardComplete: () => this.publishStandings(comp),
        });
        this.rooms.set(code, room);
        comp.addTable(room);
        this.competitionTables.add(code);
        return room;
    }
    standingsPayload(comp) {
        return {
            competitionCode: comp.code,
            standings: comp.standings(),
            boardsCompleted: comp.boardsCompleted(),
            boardsTotal: comp.boards.length,
        };
    }
    sendStandings(clientId, comp) {
        this.send(clientId, makeEvent('standings_update', this.standingsPayload(comp)));
    }
    /** Broadcast fresh standings to followers and everyone at the tables. */
    publishStandings(comp) {
        const event = makeEvent('standings_update', this.standingsPayload(comp));
        for (const fid of this.followers.get(comp.code) ?? []) {
            this.send(fid, event);
        }
        for (const table of comp.tables) {
            for (const cid of table.connectedClients()) {
                this.send(cid, event);
            }
        }
    }
    // ---------------------------------------------------------- persistence ---
    /** Persist all competitions (boards + results) to a JSON file. */
    saveCompetitions(path) {
        const data = [...this.competitions.values()].map(c => c.toJSON());
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, JSON.stringify(data));
    }
    /** Restore competitions; tables are recreated (empty seats, results kept). */
    loadCompetitions(path) {
        if (!existsSync(path))
            return;
        const data = JSON.parse(readFileSync(path, 'utf8'));
        for (const j of data) {
            if (this.competitions.has(j.code))
                continue;
            const comp = Competition.fromJSON(j);
            this.competitions.set(j.code, comp);
            this.followers.set(j.code, new Set());
            for (const t of j.tables) {
                const room = this.attachTable(comp, t.code);
                room.tableResults.push(...t.results);
            }
        }
    }
}
//# sourceMappingURL=manager.js.map