import { describe, it, expect } from 'vitest';
import { scoreContract } from './scoring.js';
import type { Contract } from './bidding.js';

function contract(level: number, denom: Contract['denom'], doubled: 0 | 1 | 2 = 0): Contract {
  return { level, denom, declarer: 'N', doubled };
}

describe('scoreContract — made contracts', () => {
  it('3NT made exactly, not vulnerable = 400', () => {
    // trick 40+30+30=100 → game bonus 300
    expect(scoreContract(contract(3, 'NT'), 9, false).total).toBe(400);
  });

  it('3NT made exactly, vulnerable = 600', () => {
    expect(scoreContract(contract(3, 'NT'), 9, true).total).toBe(600);
  });

  it('1S made, not vulnerable = 80 (part score)', () => {
    // trick 30 → part-score 50
    const s = scoreContract(contract(1, 'S'), 7, false);
    expect(s.total).toBe(80);
    expect(s.gameOrPartScoreBonus).toBe(50);
  });

  it('4H made, vulnerable = 620', () => {
    // trick 120 → game 500
    expect(scoreContract(contract(4, 'H'), 10, true).total).toBe(620);
  });

  it('1NT made +2 overtricks, not vulnerable = 150', () => {
    // trick 40, part 50, overtricks 2×30
    expect(scoreContract(contract(1, 'NT'), 9, false).total).toBe(150);
  });

  it('2D doubled, made exactly, not vulnerable = 180', () => {
    // trick 2×20×2=80 → part 50 + insult 50
    const s = scoreContract(contract(2, 'D', 1), 8, false);
    expect(s.total).toBe(180);
    expect(s.insultBonus).toBe(50);
  });

  it('2H doubled, made +1, not vulnerable = 570', () => {
    // trick 2×30×2=120 → game 300 + insult 50 + overtrick 100
    expect(scoreContract(contract(2, 'H', 1), 9, false).total).toBe(570);
  });

  it('2H doubled, made +1, vulnerable = 870', () => {
    // trick 120 → game 500 + insult 50 + overtrick 200
    expect(scoreContract(contract(2, 'H', 1), 9, true).total).toBe(870);
  });

  it('6S small slam made, vulnerable = 1430', () => {
    // trick 180 → game 500 + slam 750
    const s = scoreContract(contract(6, 'S'), 12, true);
    expect(s.total).toBe(1430);
    expect(s.slamBonus).toBe(750);
  });

  it('6S small slam made, not vulnerable = 980', () => {
    expect(scoreContract(contract(6, 'S'), 12, false).total).toBe(980);
  });

  it('7NT grand slam made, not vulnerable = 1520', () => {
    // trick 40+6×30=220 → game 300 + grand 1000
    const s = scoreContract(contract(7, 'NT'), 13, false);
    expect(s.total).toBe(1520);
    expect(s.slamBonus).toBe(1000);
  });

  it('7NT redoubled, made, vulnerable', () => {
    // trick 220×4=880 → game 500 + insult 100 + grand 1500 = 2980
    expect(scoreContract(contract(7, 'NT', 2), 13, true).total).toBe(2980);
  });
});

describe('scoreContract — defeated contracts', () => {
  it('3NT down 1, undoubled, not vulnerable = -50', () => {
    expect(scoreContract(contract(3, 'NT'), 8, false).total).toBe(-50);
  });

  it('3NT down 1, undoubled, vulnerable = -100', () => {
    expect(scoreContract(contract(3, 'NT'), 8, true).total).toBe(-100);
  });

  it('3NT doubled, down 1, not vulnerable = -100', () => {
    expect(scoreContract(contract(3, 'NT', 1), 8, false).total).toBe(-100);
  });

  it('3NT doubled, down 1, vulnerable = -200', () => {
    expect(scoreContract(contract(3, 'NT', 1), 8, true).total).toBe(-200);
  });

  it('3NT doubled, down 2, not vulnerable = -300', () => {
    // 100 + 200
    expect(scoreContract(contract(3, 'NT', 1), 7, false).total).toBe(-300);
  });

  it('3NT doubled, down 3, not vulnerable = -500', () => {
    // 100 + 200 + 200
    expect(scoreContract(contract(3, 'NT', 1), 6, false).total).toBe(-500);
  });

  it('3NT doubled, down 4, not vulnerable = -800', () => {
    // 100 + 200 + 200 + 300
    expect(scoreContract(contract(3, 'NT', 1), 5, false).total).toBe(-800);
  });

  it('3NT doubled, down 2, vulnerable = -500', () => {
    // 200 + 300
    expect(scoreContract(contract(3, 'NT', 1), 7, true).total).toBe(-500);
  });

  it('2S redoubled, down 1, not vulnerable = -200', () => {
    expect(scoreContract(contract(2, 'S', 2), 7, false).total).toBe(-200);
  });

  it('breakdown flags made=false on defeat', () => {
    const s = scoreContract(contract(4, 'H'), 8, false);
    expect(s.made).toBe(false);
    expect(s.tricksNeeded).toBe(10);
    expect(s.undertrickPenalty).toBe(100);
  });
});

describe('scoreContract — validation', () => {
  it('rejects out-of-range trick counts', () => {
    expect(() => scoreContract(contract(1, 'C'), 14, false)).toThrow();
    expect(() => scoreContract(contract(1, 'C'), -1, false)).toThrow();
  });
});
