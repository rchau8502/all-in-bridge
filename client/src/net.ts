/** net.ts — thin WebSocket client. Server speaks language-neutral GameEvents. */
import type { GameEvent } from '../../shared/events.js';
import type { Card } from '../../shared/deck.js';
import type { Bid } from '../../shared/bidding.js';
import type { Lang } from './i18n.js';

function wsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const override = localStorage.getItem('aib-ws');
  if (override) return override;
  return `${proto}//${location.hostname}:8080`;
}

/** Stable per-player id, generated once per browser — used for stats/history. */
function loadPlayerId(): string {
  try {
    let id = localStorage.getItem('aib-player-id');
    if (!id) {
      try {
        id = crypto.randomUUID();
      } catch {
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
      }
      localStorage.setItem('aib-player-id', id);
    }
    return id;
  } catch {
    return '';
  }
}

export class GameClient {
  private ws: WebSocket | null = null;
  onEvent: (ev: GameEvent) => void = () => {};
  /** Called on close; `manual` is true when disconnect() was called deliberately. */
  onClose: (manual: boolean) => void = () => {};
  clientId = '';
  /** Stable identity for stats/history; sent as `clientId` on join. */
  readonly playerId = loadPlayerId();
  private manualClose = false;

  get connected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl());
      const timer = setTimeout(() => reject(new Error('ws-timeout')), 8000);
      ws.onopen = () => {
        clearTimeout(timer);
        this.ws = ws;
        resolve();
      };
      ws.onerror = () => {
        clearTimeout(timer);
        reject(new Error('ws-error'));
      };
      ws.onmessage = m => {
        try {
          this.onEvent(JSON.parse(m.data) as GameEvent);
        } catch { /* ignore malformed */ }
      };
      ws.onclose = () => {
        this.ws = null;
        const manual = this.manualClose;
        this.manualClose = false;
        this.onClose(manual);
      };
    });
  }

  disconnect(): void {
    this.manualClose = true;
    this.ws?.close();
    this.ws = null;
  }

  private sendMsg(msg: unknown): void {
    if (this.connected) this.ws!.send(JSON.stringify(msg));
  }

  join(roomCode: string | undefined, name: string, characterId: string, lang: Lang, clientId?: string): void {
    this.sendMsg({ action: 'join', roomCode, name, characterId, lang, clientId: clientId || this.playerId || undefined });
  }
  start(): void { this.sendMsg({ action: 'start' }); }
  nextBoard(): void { this.sendMsg({ action: 'next_board' }); }
  bid(bid: Bid): void { this.sendMsg({ action: 'bid', bid }); }
  play(card: Card): void { this.sendMsg({ action: 'play', card: { suit: card.suit, rank: card.rank } }); }
  pickCharacter(characterId: string): void { this.sendMsg({ action: 'pick_character', characterId }); }
  voice(lineId: string): void { this.sendMsg({ action: 'voice', lineId }); }
  emote(emoteId: string): void { this.sendMsg({ action: 'emote', emoteId }); }
  createCompetition(name: string, boards: number, isPublic?: boolean, durationHours?: number): void {
    this.sendMsg({ action: 'create_competition', name, boards, isPublic, durationHours });
  }
  createTable(competitionCode: string): void { this.sendMsg({ action: 'create_table', competitionCode }); }
  followCompetition(competitionCode: string): void { this.sendMsg({ action: 'follow_competition', competitionCode }); }
  listCompetitions(): void { this.sendMsg({ action: 'list_competitions' }); }
  joinOpenTable(competitionCode: string): void { this.sendMsg({ action: 'join_open_table', competitionCode }); }
  quickMatch(name: string, characterId: string, lang: Lang): void {
    this.sendMsg({ action: 'quick_match', name, characterId, lang, clientId: this.playerId || undefined });
  }
  leaveQueue(): void { this.sendMsg({ action: 'leave_queue' }); }
  getStats(): void { this.sendMsg({ action: 'get_stats' }); }
  getLeaderboard(): void { this.sendMsg({ action: 'get_leaderboard' }); }
  claim(tricks: number): void { this.sendMsg({ action: 'claim', tricks }); }
  claimAccept(): void { this.sendMsg({ action: 'claim_accept' }); }
  claimReject(): void { this.sendMsg({ action: 'claim_reject' }); }
  snapshot(): void { this.sendMsg({ action: 'snapshot' }); }
}
