# All-In Bridge: Interactive Teaching Web Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix repository hygiene and runtime issues, connect the 408-voice audio system and syllabus progress tracking, refactor architecture boundaries, and turn All-In Bridge into a fully interactive, responsive bridge teaching web application.

**Architecture:** 
1. Untrack committed `node_modules` from git and enforce clean `.gitignore`.
2. Move `trickExplain.ts` into `shared/` to enforce strict unidirectional layering (`shared` -> `client`).
3. Add lesson progress tracking, completion badges, and direct navigation in `AppCtx`, `Home.tsx`, and `Tutorial.tsx`.
4. Integrate voice audio playback (`client/public/voices/`) in `audio.ts` and wire it into the `Tutorial` state machine (greeting, bidding calls, trick wins, and game results).
5. Add keyboard shortcuts, responsive layout polish, and full test suite verification.

**Tech Stack:** React 19, TypeScript 5.8+, Vite 8, Web Audio API + HTMLAudioElement, Vitest.

---

## Global Constraints

- No external runtime dependencies beyond React 19 and Vite.
- Audio playback must never block UI or throw unhandled exceptions if an audio asset fails to load.
- Maintain bilingual strictness: English and Chinese must pass `shared/lesson-lang.test.ts`.
- All Vitest test suites must pass without errors.
- Both root and client TypeScript builds (`tsc --noEmit` and `tsc -b`) must be 100% clean.

---

### Task 1: Repository Hygiene & Untrack node_modules

**Files:**
- Modify: `.gitignore`
- Modify: `client/tsconfig.app.json`
- Remove from git tracking: `node_modules/**`

- [ ] **Step 1: Untrack committed `node_modules` from git**
  Run `git rm -r --cached node_modules`
  Verify git status shows untracked node_modules ignored by `.gitignore`.

- [ ] **Step 2: Clean `client/tsconfig.app.json`**
  Remove `"../server"` from exclude array since `server/` was retired.

- [ ] **Step 3: Update `.gitignore`**
  Ensure root and client `node_modules`, `dist`, `.DS_Store` are properly ignored.

- [ ] **Step 4: Commit hygiene changes**
  `git commit -m "chore: untrack node_modules and clean tsconfig"`

---

### Task 2: Architectural Cleanliness — Move `trickExplain` to `shared/`

**Files:**
- Create: `shared/trick-explain.ts`
- Create: `client/src/trickExplain.ts` (re-export for backward compatibility)
- Modify: `shared/trick-explain.test.ts`
- Modify: `client/src/screens/Tutorial.tsx`

- [ ] **Step 1: Move implementation to `shared/trick-explain.ts`**
  Extract trick explanation and review formatting logic into pure shared module.

- [ ] **Step 2: Update `shared/trick-explain.test.ts` to import directly from `./trick-explain.js`**
  Removes cross-boundary import of `../client/src/trickExplain.js`.

- [ ] **Step 3: Verify tests pass**
  Run `npm test` and `npm run typecheck`.

- [ ] **Step 4: Commit architecture refactoring**
  `git commit -m "refactor: move trickExplain into shared module"`

---

### Task 3: Lesson Selection, Syllabus Navigation & Progress Persistence

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/screens/Home.tsx`
- Modify: `client/src/screens/Tutorial.tsx`
- Modify: `client/src/i18n.ts`

- [ ] **Step 1: Expand `AppCtx` in `client/src/App.tsx`**
  Add `currentLessonIdx: number`, `setCurrentLessonIdx: (idx: number) => void`, `completedLessons: Set<string>`, `markLessonCompleted: (id: string) => void`, and `goToLesson: (idx: number) => void`.
  Persist progress (`completedLessons` and `lastLessonIdx`) in `localStorage`.

- [ ] **Step 2: Update `Home.tsx` syllabus list**
  - Clicking any syllabus item calls `goToLesson(i)`, navigating directly to that lesson.
  - Display completion checkmarks (✓) and progress summary (e.g., "3 / 16 completed").
  - Add a "Continue Lesson [N]" primary action button when in progress.

- [ ] **Step 3: Update `Tutorial.tsx` navigation**
  - Initialize `lessonIdx` from `currentLessonIdx`.
  - When a lesson finishes (final result step or next lesson), call `markLessonCompleted(lesson.id)`.
  - Add previous/next lesson controls in the top bar of the tutorial.

- [ ] **Step 4: Verify build and types**
  Run `npm test` and `cd client && npm run build`.

- [ ] **Step 5: Commit syllabus navigation**
  `git commit -m "feat: add direct lesson selection and progress persistence"`

---

### Task 4: Voice Audio Integration (408 Character Audio Lines)

**Files:**
- Modify: `client/src/audio.ts`
- Modify: `client/src/screens/Tutorial.tsx`
- Modify: `client/src/App.tsx`
- Test: `shared/voices.test.ts` or add client audio tests

- [ ] **Step 1: Add voice playback support in `client/src/audio.ts`**
  Implement `playVoice(characterId: string, lang: Lang, lineId: string): Promise<void>`.
  Respect base path (GitHub Pages `/all-in-bridge/` vs root `/`), check `soundOn`, handle audio concurrency (stop previous voice when new voice starts), and catch playback errors gracefully.

- [ ] **Step 2: Hook voice triggers in `Tutorial.tsx`**
  - Lesson start: coach plays `'hello'` or `'gl'`.
  - When an auction bid happens (e.g. `P` -> `'pass'`, `1C` -> `'bid_1c'`, `3NT` -> `'bid_3nt'`, `X` -> `'double'`), look up corresponding `lineId` and trigger coach / bidder voice.
  - When a trick completes: winning seat plays `'trick_win'` or `'nice_play'`.
  - When contract made / hand finishes: play `'win_game'` / `'game_made'`, or on defeat `'lose_game'` / `'oops'`.

- [ ] **Step 3: Test voice line mapping logic**
  Ensure every bid and event cleanly maps to a valid `VOICE_LINE_IDS` without throwing errors.

- [ ] **Step 4: Commit voice audio integration**
  `git commit -m "feat: integrate character voice packs into tutorial table"`

---

### Task 5: Interactive Polish, Keyboard Shortcuts & Responsive Ergonomics

**Files:**
- Modify: `client/src/screens/Tutorial.tsx`
- Modify: `client/src/styles.css`

- [ ] **Step 1: Add keyboard accessibility**
  - `Space` / `Enter`: Advance tutorial dialog / tap next / dismiss review.
  - `ArrowLeft` / `ArrowRight`: Previous / Next lesson when on results screen.
  - `Escape`: Return to Home or close drawer.

- [ ] **Step 2: Visual feedback & hint refinement**
  - Clearer pulse / glow on cards learner is asked to play.
  - Improved error shake feedback when wrong card or bid is tapped.

- [ ] **Step 3: Verification with test suite and production build**
  Run `npm test`, `npm run typecheck`, `cd client && npm run build`, `cd client && npm run lint`.

- [ ] **Step 4: Commit interactive polish**
  `git commit -m "feat: add keyboard shortcuts, visual cues, and responsive polish"`
