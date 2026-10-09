/**
 * manager.ts — rooms by share code, clients by connection.
 *
 * One share code = one room instance. The manager routes inbound messages
 * to the right room and tracks which room each connected client belongs to.
 */
import { Room } from './room.js';
import type { SendFn, BoardSource } from './room.js';
import { Competition } from './competition.js';
export declare function makeRoomCode(rng?: () => number): string;
export declare class RoomManager {
    private send;
    private boardSource?;
    private rng;
    private rooms;
    private clientRoom;
    private competitions;
    private followers;
    private competitionTables;
    constructor(send: SendFn, boardSource?: BoardSource | undefined, rng?: () => number);
    getRoom(code: string): Room | undefined;
    getCompetition(code: string): Competition | undefined;
    /** Route one inbound message from a connected client. */
    handleMessage(clientId: string, raw: unknown, now: number): void;
    handleDisconnect(clientId: string, now: number): void;
    /** Expire dead seats; drop empty non-competition rooms. */
    sweep(now: number): void;
    roomCount(): number;
    private makeCompetitionCode;
    private handleCompetitionAction;
    private createTable;
    private attachTable;
    private standingsPayload;
    private sendStandings;
    /** Broadcast fresh standings to followers and everyone at the tables. */
    publishStandings(comp: Competition): void;
    /** Persist all competitions (boards + results) to a JSON file. */
    saveCompetitions(path: string): void;
    /** Restore competitions; tables are recreated (empty seats, results kept). */
    loadCompetitions(path: string): void;
}
//# sourceMappingURL=manager.d.ts.map