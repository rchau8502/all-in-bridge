/**
 * achievements.ts — Badges and achievement milestones.
 *
 * Rewarding learner progress across ACBL Bootcamp lessons,
 * Bidding Drills, and Practice Table deals.
 */

export interface Achievement {
  id: string;
  icon: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  category: 'tutorial' | 'drill' | 'play';
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_trick',
    icon: '🃏',
    title: { en: 'First Trick', zh: '首战告捷' },
    description: {
      en: 'Won your first trick in All-In Bridge.',
      zh: '在对局或教程中成功拿下你的第一墩牌。',
    },
    category: 'tutorial',
  },
  {
    id: 'finesse_master',
    icon: '🎯',
    title: { en: 'Finesse Virtuoso', zh: '飞牌大师' },
    description: {
      en: 'Completed the Finesse lesson and mastered leading towards strength.',
      zh: '完成第5课飞牌教学，掌握“由弱引强”的50%经典战术。',
    },
    category: 'tutorial',
  },
  {
    id: 'trump_ruler',
    icon: '👑',
    title: { en: 'Trump Ruler', zh: '将牌主控' },
    description: {
      en: 'Mastered ruffing losers and pulling trumps in Chapter 2.',
      zh: '掌握短将牌手将吃与清拔敌方将牌的核心战术。',
    },
    category: 'tutorial',
  },
  {
    id: 'opening_pro',
    icon: '📐',
    title: { en: 'Opening Maestro', zh: '开叫达人' },
    description: {
      en: 'Scored a 5-streak in the Opening Bid Drill.',
      zh: '在开叫速训场中达成连续答对 5 题连胜。',
    },
    category: 'drill',
  },
  {
    id: 'response_expert',
    icon: '🚦',
    title: { en: 'Traffic Light Pro', zh: '应叫专家' },
    description: {
      en: 'Scored a 5-streak in the Responding Drill.',
      zh: '在应叫速训场中掌握红绿灯与黄金配合，达成 5 连胜。',
    },
    category: 'drill',
  },
  {
    id: 'game_maker',
    icon: '🏆',
    title: { en: 'Game Maker', zh: '局定约大师' },
    description: {
      en: 'Successfully made a 3NT, 4♠, or 4♥ game contract in the Practice Table.',
      zh: '在自由练习桌中成功达成 3NT、4♠ 或 4♥ 成局定约。',
    },
    category: 'play',
  },
  {
    id: 'slam_grandee',
    icon: '⭐',
    title: { en: 'Slam Grandee', zh: '满贯凯歌' },
    description: {
      en: 'Won 12 or more tricks in a single 13-trick deal.',
      zh: '单副牌局中豪取 12 墩或全部 13 墩（小满贯/大满贯）。',
    },
    category: 'play',
  },
  {
    id: 'bootcamp_grad',
    icon: '🎓',
    title: { en: 'ACBL Graduate', zh: '桥牌毕业生' },
    description: {
      en: 'Completed all 16 foundation lessons across all 4 ACBL Chapters.',
      zh: '全部通关官方四大篇章共 16 课桥牌教程，荣获结业徽章！',
    },
    category: 'tutorial',
  },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/** Check if conditions for new achievements are met. */
export function evaluateAchievements(stats: {
  completedLessonIds: string[];
  drillOpeningStreak: number;
  drillResponseStreak: number;
  highestTricksWonInDeal: number;
  hasMadeGameContract: boolean;
  tricksWonTotal: number;
}): string[] {
  const unlocked: string[] = [];

  if (stats.tricksWonTotal > 0 || stats.completedLessonIds.length > 0) {
    unlocked.push('first_trick');
  }
  if (stats.completedLessonIds.includes('finesse')) {
    unlocked.push('finesse_master');
  }
  if (stats.completedLessonIds.includes('ruffing') || stats.completedLessonIds.includes('trumps')) {
    unlocked.push('trump_ruler');
  }
  if (stats.drillOpeningStreak >= 5) {
    unlocked.push('opening_pro');
  }
  if (stats.drillResponseStreak >= 5) {
    unlocked.push('response_expert');
  }
  if (stats.hasMadeGameContract) {
    unlocked.push('game_maker');
  }
  if (stats.highestTricksWonInDeal >= 12) {
    unlocked.push('slam_grandee');
  }
  if (stats.completedLessonIds.length >= 16) {
    unlocked.push('bootcamp_grad');
  }

  return unlocked;
}
