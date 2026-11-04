import type { Lesson } from './tutorial.js';
export type ForcingStatus = 'NF' | 'F1' | 'GF' | 'SF';

/** Authored by auction, not inferred from height or a points regex.
 * A force ends at its agreed stopping point, not just on any limited bid. */
export const BASIC_FORCING_STATUS: Record<string, ForcingStatus[]> = {
  bidding: ['NF', 'NF'],
  'minor-responses': ['NF', 'F1', 'NF'],
  'full-hand': ['NF', 'F1', 'NF'],
  conversation: ['NF', 'F1', 'NF'],
  scoring: ['NF', 'NF', 'NF'],
  overcall: ['NF', 'NF', 'NF'],
  'stayman-fit': ['NF', 'F1', 'NF', 'NF', 'NF'],
  'jacoby-transfers': ['NF', 'F1', 'NF', 'NF', 'NF'],
  'strength-and-minors': ['NF', 'SF', 'NF', 'NF', 'NF'],
  'inverted-minor-raises': ['NF', 'F1', 'F1', 'F1', 'F1', 'NF'],
  'major-forcing-raises': ['NF', 'GF', 'NF'],
  'opener-rebids': ['NF', 'F1', 'NF'],
  'reverse-bids': ['NF', 'F1', 'F1', 'NF', 'NF'],
  'two-over-one-basics': ['NF', 'GF', 'GF', 'GF', 'NF'],
};

export function withForcingNotes(lesson: Lesson, lang: 'en' | 'zh'): Lesson {
  const statuses = BASIC_FORCING_STATUS[lesson.id];
  if (!statuses) return lesson;
  const labels = lang === 'zh'
    ? { NF: '【不逼叫】', SF: '【半逼叫】', F1: '【逼叫一轮】', GF: '【逼局】' }
    : { NF: '[Non-forcing]', SF: '[Semi-forcing]', F1: '[Forcing one round]', GF: '[Game forcing]' };
  let index = 0;
  const steps = lesson.steps.map(step => step.kind !== 'auction' ? step : {
    ...step,
    script: step.script.map(action => {
      const call = 'expected' in action ? action.expected : action.bid;
      if (call === 'P') return action; // An opponent's pass does not cancel a partner's force.
      const status = statuses[index++];
      if (!status) throw new Error('missing forcing status: '+lesson.id);
      return { ...action, note: `${labels[status]} ${action.note ?? ''}`,
        ...('hint' in action ? { hint: `${labels[status]} ${action.hint}` } : {}) };
    })
  });
  if (index !== statuses.length) throw new Error('unused forcing status: '+lesson.id);
  return { ...lesson, steps };
}
