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

export class GameClient {
  private ws: WebSocket | null = null;
  onEvent: (ev: GameEvent) => void = () => {};
  onClose: () => void = () => {};
  clientId = '';

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
        this.onClose();
      };
    });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  private sendMsg(msg: unknown): void {
    if (this.connected) this.ws!.send(JSON.stringify(msg));
  }

  join(roomCode: string | undefined, name: string, characterId: string, lang: Lang, clientId?: string): void {
    this.sendMsg({ action: 'join', roomCode, name, characterId, lang, clientId: clientId || undefined });
  }
  start(): void { this.sendMsg({ action: 'start' }); }
  nextBoard(): void { this.sendMsg({ action: 'next_board' }); }
  bid(bid: Bid): void { this.sendMsg({ action: 'bid', bid }); }
  play(card: Card): void { this.sendMsg({ action: 'play', card: { suit: card.suit, rank: card.rank } }); }
  pickCharacter(characterId: string): void { this.sendMsg({ action: 'pick_character', characterId }); }
  voice(lineId: string): void { this.sendMsg({ action: 'voice', lineId }); }
  emote(emoteId: string): void { this.sendMsg({ action: 'emote', emoteId }); }
  createCompetition(name: string, boards: number): void { this.sendMsg({ action: 'create_competition', name, boards }); }
  createTable(competitionCode: string): void { this.sendMsg({ action: 'create_table', competitionCode }); }
  followCompetition(competitionCode: string): void { this.sendMsg({ action: 'follow_competition', competitionCode }); }
  snapshot(): void { this.sendMsg({ action: 'snapshot' }); }
}
