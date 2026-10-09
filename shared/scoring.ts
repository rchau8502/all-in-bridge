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

import type { Contract, Denom } from './bidding.js';

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

function oddTrickValue(denom: Denom, trickIndex: number): number {
  // trickIndex: 0-based among the odd tricks.
  if (denom === 'C' || denom === 'D') return 20;
  if (denom === 'H' || denom === 'S') return 30;
  return trickIndex === 0 ? 40 : 30; // NT
}

export function scoreContract(
  contract: Contract,
  tricksTaken: number,
  vulnerable: boolean
): ScoreBreakdown {
  if (tricksTaken < 0 || tricksTaken > 13) throw new Error('tricksTaken out of range');
  const tricksNeeded = 6 + contract.level;
  const made = tricksTaken >= tricksNeeded;
  const mult = contract.doubled === 2 ? 4 : contract.doubled === 1 ? 2 : 1;

  let trickScore = 0, overtrickPoints = 0, insultBonus = 0;
  let gameOrPartScoreBonus = 0, slamBonus = 0, undertrickPenalty = 0;

  if (made) {
    for (let i = 0; i < contract.level; i++) {
      trickScore += oddTrickValue(contract.denom, i) * mult;
    }
    const over = tricksTaken - tricksNeeded;
    if (contract.doubled === 0) {
      for (let i = 0; i < over; i++) overtrickPoints += oddTrickValue(contract.denom, contract.level + i);
    } else if (contract.doubled === 1) {
      overtrickPoints = over * (vulnerable ? 200 : 100);
      insultBonus = 50;
    } else {
      overtrickPoints = over * (vulnerable ? 400 : 200);
      insultBonus = 100;
    }
    gameOrPartScoreBonus = trickScore >= 100 ? (vulnerable ? 500 : 300) : 50;
    if (contract.level === 6) slamBonus = vulnerable ? 750 : 500;
    if (contract.level === 7) slamBonus = vulnerable ? 1500 : 1000;
  } else {
    const under = tricksNeeded - tricksTaken;
    if (contract.doubled === 0) {
      undertrickPenalty = under * (vulnerable ? 100 : 50);
    } else {
      // Doubled penalty schedule, then ×2 if redoubled.
      let p: number;
      if (!vulnerable) {
        p = 0;
        for (let i = 1; i <= under; i++) p += i === 1 ? 100 : i <= 3 ? 200 : 300;
      } else {
        p = 0;
        for (let i = 1; i <= under; i++) p += i === 1 ? 200 : 300;
      }
      if (contract.doubled === 2) p *= 2;
      undertrickPenalty = p;
    }
  }

  const total = made
    ? trickScore + overtrickPoints + insultBonus + gameOrPartScoreBonus + slamBonus
    : -undertrickPenalty;

  return {
    tricksTaken, tricksNeeded, made, trickScore, overtrickPoints, insultBonus,
    gameOrPartScoreBonus, slamBonus, undertrickPenalty, total,
  };
}
