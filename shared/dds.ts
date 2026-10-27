/**
 * dds.ts — Double Dummy Analysis & Makeable Contracts Matrix
 *
 * Implements standard duplicate bridge makeable contracts evaluation (20 combinations:
 * 4 seats x 5 strains: NT, Spades, Hearts, Diamonds, Clubs), Optimum Result calculation,
 * Par Score calculation, and PBN [Ability] tag formatting.
 */

import type { Card, Hands, Seat, Suit } from './deck.js';
import { SEATS, partnerOf } from './deck.js';
import { scoreContract } from './scoring.js';
import { calculateHcp, getSuitLengths } from './evaluator.js';

export type Strain = 'NT' | 'S' | 'H' | 'D' | 'C';
export const STRAINS: Strain[] = ['NT', 'S', 'H', 'D', 'C'];

export type MakeableTable = Record<Seat, Record<Strain, number>>;

export interface ParResult {
  score: number; // Duplicate bridge score from NS perspective (e.g. +420, -400)
  contract: string; // e.g. "4S S" or "3NT E"
  tricks: number;
  level: number;
  strain: Strain;
  seat: Seat;
  doubled: boolean;
  text: { en: string; zh: string };
}

export interface DealAnalysis {
  makeable: MakeableTable;
  par: ParResult;
  hcp: Record<Seat, number>;
  totalHcp: Record<'NS' | 'EW', number>;
}

/**
 * Checks if a hand has a stopper in a suit:
 * A (any length), Kx (length >= 2), Qxx (length >= 3), Jxxx (length >= 4)
 */
function hasStopper(cards: Card[], suit: Suit): boolean {
  const suitCards = cards.filter(c => c.suit === suit);
  const len = suitCards.length;
  if (len === 0) return false;
  const ranks = new Set(suitCards.map(c => c.rank));
  if (ranks.has(14)) return true; // Ace
  if (ranks.has(13) && len >= 2) return true; // Kx
  if (ranks.has(12) && len >= 3) return true; // Qxx
  if (ranks.has(11) && len >= 4) return true; // Jxxx
  return false;
}

/**
 * Count quick top tricks in a suit for a partnership (combining two hands)
 */
function countSuitWinners(declCards: Card[], dummyCards: Card[], opp1Cards: Card[], opp2Cards: Card[], suit: Suit): {
  topWinners: number;
  longWinners: number;
  oppWinners: number;
} {
  const ourCards = [...declCards, ...dummyCards].filter(c => c.suit === suit);
  const oppCards = [...opp1Cards, ...opp2Cards].filter(c => c.suit === suit);
  const ourRanks = ourCards.map(c => c.rank).sort((a, b) => b - a);
  const oppRanks = oppCards.map(c => c.rank).sort((a, b) => b - a);

  const ourH = ourRanks.filter(r => r >= 10);
  const oppH = oppRanks.filter(r => r >= 10);

  let oppAces = oppH.filter(r => r === 14).length;
  let oppKings = oppH.filter(r => r === 13).length;
  let oppQueens = oppH.filter(r => r === 12).length;
  let topWinners = 0;

  for (const r of ourH) {
    if (r === 14) {
      topWinners++;
    } else if (r === 13) {
      if (oppAces > 0) {
        oppAces--;
      } else {
        topWinners++;
      }
    } else if (r === 12) {
      if (oppAces > 0) {
        oppAces--;
      } else if (oppKings > 0) {
        oppKings--;
      } else {
        topWinners++;
      }
    } else if (r === 11) {
      if (oppAces === 0 && oppKings === 0 && oppQueens === 0) {
        topWinners++;
      } else {
        topWinners += 0.4;
      }
    } else if (r === 10) {
      if (oppAces === 0 && oppKings === 0 && oppQueens === 0) {
        topWinners += 0.8;
      }
    }
  }

  // Length potential
  const declLen = declCards.filter(c => c.suit === suit).length;
  const dummyLen = dummyCards.filter(c => c.suit === suit).length;
  const maxLen = Math.max(declLen, dummyLen);
  const oppLen = oppCards.length;

  let longWinners = 0;
  if (maxLen >= 5) {
    const oppAvg = Math.ceil(oppLen / 2);
    longWinners = Math.max(0, maxLen - Math.max(topWinners, oppAvg));
  }

  // Opponent quick cashable winners
  let oppWinners = 0;
  if (oppCards.some(c => c.rank === 14) && !ourCards.some(c => c.rank === 14)) oppWinners++;
  if (oppCards.some(c => c.rank === 13) && !ourCards.some(c => c.rank === 14) && !ourCards.some(c => c.rank === 13)) oppWinners++;

  return {
    topWinners: Math.min(topWinners, ourCards.length),
    longWinners: Math.min(longWinners, 4),
    oppWinners,
  };
}

/**
 * Estimate makeable tricks for a specific declarer and strain.
 */
function estimateTricks(
  hands: Hands,
  declarer: Seat,
  strain: Strain
): number {
  const dummy = partnerOf(declarer);
  const declHand = hands[declarer];
  const dummyHand = hands[dummy];

  const opp1: Seat = declarer === 'N' || declarer === 'S' ? 'E' : 'N';
  const opp2: Seat = partnerOf(opp1);
  const opp1Hand = hands[opp1];
  const opp2Hand = hands[opp2];

  const combinedHcp = calculateHcp(declHand) + calculateHcp(dummyHand);
  const suits: Suit[] = ['S', 'H', 'D', 'C'];

  if (strain === 'NT') {
    // --- NO-TRUMP EVALUATION ---
    let totalWinners = 0;
    let unstoppedSuits = 0;
    let oppMaxRun = 0;

    for (const suit of suits) {
      const stopped = hasStopper(declHand, suit) || hasStopper(dummyHand, suit);
      const { topWinners, longWinners } = countSuitWinners(declHand, dummyHand, opp1Hand, opp2Hand, suit);
      totalWinners += topWinners + longWinners;

      if (!stopped) {
        unstoppedSuits++;
        const oppLen1 = opp1Hand.filter(c => c.suit === suit).length;
        const oppLen2 = opp2Hand.filter(c => c.suit === suit).length;
        const oppMax = Math.max(oppLen1, oppLen2);
        if (oppMax >= 4) {
          oppMaxRun = Math.max(oppMaxRun, oppMax - 1);
        }
      }
    }

    // HCP baseline
    let hcpBase = 7;
    if (combinedHcp >= 37) hcpBase = 13;
    else if (combinedHcp >= 33) hcpBase = 12;
    else if (combinedHcp >= 31) hcpBase = 11;
    else if (combinedHcp >= 28) hcpBase = 10;
    else if (combinedHcp >= 25) hcpBase = 9;
    else if (combinedHcp >= 22) hcpBase = 8;
    else if (combinedHcp >= 19) hcpBase = 7;
    else if (combinedHcp >= 16) hcpBase = 6;
    else if (combinedHcp >= 13) hcpBase = 5;
    else if (combinedHcp >= 10) hcpBase = 4;
    else hcpBase = Math.max(1, Math.floor(combinedHcp / 3));

    // Combine top trick analysis with HCP baseline
    let tricks = Math.round((hcpBase * 0.6) + (totalWinners * 0.4));
    if (unstoppedSuits >= 2 && oppMaxRun >= 3) {
      tricks = Math.max(2, tricks - 1);
    }
    return Math.min(13, Math.max(0, tricks));
  }

  // --- SUIT CONTRACT EVALUATION ---
  const trump = strain as Suit;
  const declLens = getSuitLengths(declHand);
  const dummyLens = getSuitLengths(dummyHand);
  const trumpFit = declLens[trump] + dummyLens[trump];

  let trumpTricks = 0;
  const trumpAnalysis = countSuitWinners(declHand, dummyHand, opp1Hand, opp2Hand, trump);
  trumpTricks = Math.max(trumpAnalysis.topWinners, Math.min(trumpFit, trumpFit - trumpAnalysis.oppWinners));

  // Side-suit tricks
  let sideWinners = 0;
  let ruffTricks = 0;
  let oppCashTricks = 0;

  for (const suit of suits) {
    if (suit === trump) continue;

    const { topWinners, longWinners, oppWinners } = countSuitWinners(declHand, dummyHand, opp1Hand, opp2Hand, suit);
    sideWinners += topWinners + longWinners;
    oppCashTricks += oppWinners;

    // Dummy ruff potential (shortness in dummy with trumps to spare)
    const dLen = dummyLens[suit];
    if (dLen <= 1 && dummyLens[trump] >= 3 && declLens[suit] > dLen) {
      ruffTricks += dLen === 0 ? 2 : 1;
    }
  }

  // Baseline from HCP and Fit
  let baseTricks = Math.floor(combinedHcp / 3);
  if (trumpFit >= 8) baseTricks += 1;
  if (trumpFit >= 9) baseTricks += 1;
  if (trumpFit >= 10) baseTricks += 1;

  if (combinedHcp >= 25 && trumpFit >= 8) {
    baseTricks = Math.max(baseTricks, 10); // Standard 4-major game
  }
  if (combinedHcp >= 33 && trumpFit >= 8) {
    baseTricks = Math.max(baseTricks, 12); // Small slam
  }
  if (combinedHcp >= 37 && trumpFit >= 8) {
    baseTricks = 13; // Grand slam
  }

  const calculated = trumpTricks + sideWinners + ruffTricks;
  let finalTricks = Math.round((baseTricks * 0.5) + (calculated * 0.5));
  if (oppCashTricks >= 3) {
    finalTricks = Math.min(finalTricks, 13 - oppCashTricks);
  }

  return Math.min(13, Math.max(0, finalTricks));
}

/**
 * Compute the complete 4x5 Makeable Contracts Table (Double Dummy Matrix).
 */
export function calculateMakeableContracts(hands: Hands): MakeableTable {
  const table: MakeableTable = {
    N: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
    S: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
    E: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
    W: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
  };

  for (const seat of SEATS) {
    for (const strain of STRAINS) {
      table[seat][strain] = estimateTricks(hands, seat, strain);
    }
  }

  return table;
}

/**
 * Format a MakeableTable into a PBN [Ability] tag string.
 * Order: N:NT.S.H.D.C S:... E:... W:...
 */
export function formatAbilityTag(table: MakeableTable): string {
  const parts = SEATS.map(seat => {
    const vals = STRAINS.map(st => table[seat][st]).join('.');
    return `${seat}:${vals}`;
  });
  return parts.join(' ');
}

/**
 * Parse a PBN [Ability] tag value into a MakeableTable.
 * Supports:
 * - "N:9.10.10.8.7 S:9.10.10.8.7 E:4.3.3.5.6 W:4.3.3.5.6"
 * - "N:9 S:9 E:4 W:4" (NT only)
 */
export function parseAbilityTag(tagValue: string): MakeableTable {
  const table: MakeableTable = {
    N: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
    S: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
    E: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
    W: { NT: 0, S: 0, H: 0, D: 0, C: 0 },
  };

  const tokens = tagValue.trim().split(/\s+/);
  for (const token of tokens) {
    const colon = token.indexOf(':');
    if (colon === -1) continue;
    const seat = token.slice(0, colon).toUpperCase() as Seat;
    if (!SEATS.includes(seat)) continue;
    const valStr = token.slice(colon + 1);
    const subVals = valStr.split('.');

    if (subVals.length === 5) {
      STRAINS.forEach((st, idx) => {
        const num = parseInt(subVals[idx]!, 10);
        if (!isNaN(num)) table[seat][st] = Math.max(0, Math.min(13, num));
      });
    } else if (subVals.length === 1) {
      const num = parseInt(subVals[0]!, 10);
      if (!isNaN(num)) table[seat].NT = Math.max(0, Math.min(13, num));
    }
  }

  return table;
}

/**
 * Calculate the Par Score and Par Contract from a MakeableTable.
 */
export function calculateParScore(
  table: MakeableTable,
  vul: 'None' | 'NS' | 'EW' | 'All' = 'None'
): ParResult {
  const nsVul = vul === 'NS' || vul === 'All';
  const ewVul = vul === 'EW' || vul === 'All';

  let bestNsScore = -99999;
  let bestNsContract: { level: number; strain: Strain; seat: Seat; score: number } | null = null;

  let bestEwScore = -99999;
  let bestEwContract: { level: number; strain: Strain; seat: Seat; score: number } | null = null;

  // Evaluate makeable contracts for NS
  for (const seat of (['N', 'S'] as Seat[])) {
    for (const strain of STRAINS) {
      const tricks = table[seat][strain];
      const maxLevel = tricks - 6;
      if (maxLevel >= 1) {
        for (let lvl = 1; lvl <= maxLevel; lvl++) {
          const denom = strain === 'NT' ? 'NT' : strain;
          const res = scoreContract(
            { level: lvl as 1 | 2 | 3 | 4 | 5 | 6 | 7, denom, declarer: seat, doubled: 0 },
            tricks,
            nsVul
          );
          if (res.total > bestNsScore) {
            bestNsScore = res.total;
            bestNsContract = { level: lvl, strain, seat, score: res.total };
          }
        }
      }
    }
  }

  // Evaluate makeable contracts for EW
  for (const seat of (['E', 'W'] as Seat[])) {
    for (const strain of STRAINS) {
      const tricks = table[seat][strain];
      const maxLevel = tricks - 6;
      if (maxLevel >= 1) {
        for (let lvl = 1; lvl <= maxLevel; lvl++) {
          const denom = strain === 'NT' ? 'NT' : strain;
          const res = scoreContract(
            { level: lvl as 1 | 2 | 3 | 4 | 5 | 6 | 7, denom, declarer: seat, doubled: 0 },
            tricks,
            ewVul
          );
          if (res.total > bestEwScore) {
            bestEwScore = res.total;
            bestEwContract = { level: lvl, strain, seat, score: res.total };
          }
        }
      }
    }
  }

  // Equilibrium Par contract
  if (bestNsContract && (!bestEwContract || bestNsScore >= bestEwScore)) {
    const cStr = `${bestNsContract.level}${bestNsContract.strain} ${bestNsContract.seat}`;
    return {
      score: bestNsScore,
      contract: cStr,
      tricks: table[bestNsContract.seat][bestNsContract.strain],
      level: bestNsContract.level,
      strain: bestNsContract.strain,
      seat: bestNsContract.seat,
      doubled: false,
      text: {
        en: `Par: NS ${cStr} (+${bestNsScore})`,
        zh: `标准定约: 北南 ${cStr} (+${bestNsScore})`,
      },
    };
  } else if (bestEwContract) {
    const cStr = `${bestEwContract.level}${bestEwContract.strain} ${bestEwContract.seat}`;
    return {
      score: -bestEwScore,
      contract: cStr,
      tricks: table[bestEwContract.seat][bestEwContract.strain],
      level: bestEwContract.level,
      strain: bestEwContract.strain,
      seat: bestEwContract.seat,
      doubled: false,
      text: {
        en: `Par: EW ${cStr} (-${bestEwScore})`,
        zh: `标准定约: 东西 ${cStr} (-${bestEwScore})`,
      },
    };
  }

  return {
    score: 0,
    contract: 'Pass',
    tricks: 0,
    level: 0,
    strain: 'NT',
    seat: 'N',
    doubled: false,
    text: {
      en: 'Par: Pass Out (0)',
      zh: '标准定约: 全场弃牌 (0)',
    },
  };
}

/**
 * Full deal analysis packaging makeable table, par result, and HCP breakdown.
 */
export function analyzeDeal(hands: Hands): DealAnalysis {
  const hcp: Record<Seat, number> = {
    N: calculateHcp(hands.N),
    E: calculateHcp(hands.E),
    S: calculateHcp(hands.S),
    W: calculateHcp(hands.W),
  };

  const totalHcp = {
    NS: hcp.N + hcp.S,
    EW: hcp.E + hcp.W,
  };

  const makeable = calculateMakeableContracts(hands);
  const par = calculateParScore(makeable, 'None');

  return {
    makeable,
    par,
    hcp,
    totalHcp,
  };
}
