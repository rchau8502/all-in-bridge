/**
 * scoring.ts — duplicate-bridge scoring.
 *
 * Scores from the declaring side's perspective (positive = declarer scores).
 * `vulnerable` = whether the DECLARING side is vulnerable on this board.
 *
 * Reference (standard duplicate scoring):
 * - Odd tricks: minors 20, majors 30, NT 40 + 30 each. Doubled ×2, redoubled ×4.
 * - Game (trick score ≥ 100): 500 vul / 300 nonvul. Otherwise part-score 50.
 * - Slam bonus: small 500/750, grand 1000/1500 (nonvul/vul).
 * - Overtricks undoubled: trick value. Doubled: 100/200 (nonvul/vul) each.
 *   Redoubled: 200/400 each. Insult bonus: +50 doubled, +100 redoubled.
 * - Undertricks undoubled: 50/100 each. Doubled nonvul: 100, then 200, 200,
 *   then 300 each. Doubled vul: 200, then 300 each. Redoubled: ×2.
 */
import type { Contract } from './bidding.js';
export interface ScoreBreakdown {
    /** Tricks the declaring side took. */
    tricksTaken: number;
    /** Tricks the contract required (6 + level). */
    tricksNeeded: number;
    made: boolean;
    /** Points for contracted odd tricks (×2/×4 when doubled/redoubled). */
    trickScore: number;
    overtrickPoints: number;
    insultBonus: number;
    gameOrPartScoreBonus: number;
    slamBonus: number;
    undertrickPenalty: number;
    /** Total, declarer's perspective. */
    total: number;
}
export declare function scoreContract(contract: Contract, tricksTaken: number, vulnerable: boolean): ScoreBreakdown;
//# sourceMappingURL=scoring.d.ts.map