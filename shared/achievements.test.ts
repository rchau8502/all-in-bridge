import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, getAchievement, evaluateAchievements } from './achievements.js';

describe('Achievements System', () => {
  it('all achievements have icons, titles, and descriptions in EN and ZH', () => {
    expect(ACHIEVEMENTS.length).toBe(8);
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(a.title.en).toBeTruthy();
      expect(a.title.zh).toBeTruthy();
      expect(a.description.en).toBeTruthy();
      expect(a.description.zh).toBeTruthy();
    }
  });

  it('retrieves an achievement by id', () => {
    const a = getAchievement('finesse_master');
    expect(a).toBeDefined();
    expect(a?.title.en).toBe('Finesse Virtuoso');
    expect(a?.title.zh).toBe('飞牌大师');
  });

  it('evaluates unlocked achievements accurately', () => {
    const unlocked = evaluateAchievements({
      completedLessonIds: ['tricks', 'finesse'],
      drillOpeningStreak: 5,
      drillResponseStreak: 2,
      highestTricksWonInDeal: 9,
      hasMadeGameContract: true,
      tricksWonTotal: 10,
    });

    expect(unlocked).toContain('first_trick');
    expect(unlocked).toContain('finesse_master');
    expect(unlocked).toContain('opening_pro');
    expect(unlocked).toContain('game_maker');
    expect(unlocked).not.toContain('response_expert');
    expect(unlocked).not.toContain('slam_grandee');
    expect(unlocked).not.toContain('bootcamp_grad');
  });

  it('unlocks slam and graduate when conditions met', () => {
    const all16 = Array.from({ length: 16 }, (_, i) => `lesson-${i}`);
    const unlocked = evaluateAchievements({
      completedLessonIds: all16,
      drillOpeningStreak: 0,
      drillResponseStreak: 0,
      highestTricksWonInDeal: 12,
      hasMadeGameContract: false,
      tricksWonTotal: 15,
    });

    expect(unlocked).toContain('slam_grandee');
    expect(unlocked).toContain('bootcamp_grad');
  });
});
