// timetable.js
// MCA Semester 3, Batch 2025-2027 — Timetable Data

// ==================== COURSE MASTER DATA ====================
// type: 'core' | 'elective' | 'lab' | 'project' | 'colloquium' | 'flexi'
// color: Tailwind-friendly hex used for UI badges/cells
export const courses = {
  A: {
    code: '25MCT2114',
    name: 'Computer Networks',
    faculty: ['Dr. Sunandha Rajagopal'],
    periodsPerWeek: 4,
    type: 'core',
    credits: 4,
    color: '#3B82F6', // blue
  },
  B: {
    code: '25MCT2115',
    name: 'Software Project Design and Lifecycle Management',
    faculty: ['Dr. Amrita Priya K'],
    periodsPerWeek: 3,
    type: 'core',
    credits: 3,
    color: '#8B5CF6', // violet
  },
  C1: {
    code: '25MCTPE2117-11',
    name: 'Cyber Forensics',
    faculty: ['Dr. Akhil Mathew Philip'],
    periodsPerWeek: 3,
    type: 'elective',
    credits: 3,
    color: '#EF4444', // red
  },
  C2: {
    code: '25MCTPE2117-31',
    name: 'Generative AI',
    faculty: ['Mr. Gopeekrishnan R'],
    periodsPerWeek: 3,
    type: 'elective',
    credits: 3,
    color: '#F97316', // orange
  },
  D1: {
    code: '25MCEPE2118-11',
    name: 'Cyber Security',
    faculty: ['Mr. Ummer E M'],
    periodsPerWeek: 5,
    type: 'elective',
    credits: 4,
    color: '#EC4899', // pink
  },
  D2: {
    code: '25MCEPE2118-31',
    name: 'Business Analytics',
    faculty: ['Dr. Libin M Joseph'],
    periodsPerWeek: 5,
    type: 'elective',
    credits: 4,
    color: '#14B8A6', // teal
  },
  J1: {
    code: '25MCLPE2116-12',
    name: 'Linux Programming',
    faculty: ['Ms. Avani S', 'Ms. Grace Joseph'],
    periodsPerWeek: 4,
    type: 'lab',
    credits: 2,
    color: '#22C55E', // green
  },
  J2: {
    code: '25MCLPE2116-44',
    name: 'Mobile Application Development',
    faculty: ['Dr. Rani Saritha R', 'Er. Vidya N'],
    periodsPerWeek: 4,
    type: 'lab',
    credits: 2,
    color: '#84CC16', // lime
  },
  DSC1: {
    code: '25MCMOOC02-1',
    name: 'Cloud Computing Concepts and Technologies',
    faculty: ['Ms. Sreelekshmi R'],
    periodsPerWeek: 2,
    type: 'elective',
    credits: 2,
    color: '#06B6D4', // cyan
  },
  DSC2: {
    code: '25MCMOOC04-1',
    name: 'Information Privacy and Security',
    faculty: ['Er. Vidya N'],
    periodsPerWeek: 2,
    type: 'elective',
    credits: 2,
    color: '#0EA5E9', // sky
  },
  K: {
    code: '25MCR2119',
    name: 'Core Domain Presentation Colloquium',
    faculty: ['Mr. Jacob Zacharia', 'Er. Akshara Sasidharan'],
    periodsPerWeek: 2,
    type: 'colloquium',
    credits: 1,
    color: '#A855F7', // purple
  },
  L: {
    code: '25MCP2120',
    name: 'Capstone Project Preliminary',
    faculty: ['Mr. Ankitha Philip'],
    periodsPerWeek: 4,
    type: 'project',
    credits: 4,
    color: '#F59E0B', // amber
  },
  FH: {
    code: 'FH',
    name: 'Flexi Hour',
    faculty: [],
    periodsPerWeek: 2,
    type: 'flexi',
    credits: 0,
    color: '#9CA3AF', // gray
  },
};

// ==================== PERIOD DEFINITIONS ====================
export const periods = [
  { period: 1, time: '9:00 - 10:00' },
  { period: 2, time: '10:05 - 11:05' },
  { period: 3, time: '11:15 - 12:15' },
  { period: 'BREAK', time: '12:15 - 1:15', isBreak: true },
  { period: 4, time: '1:15 - 2:15' },
  { period: 5, time: '2:20 - 3:20' },
  { period: 6, time: '3:30 - 4:30' },
];

// ==================== WEEKLY SCHEDULE GRID ====================
// Each cell holds either:
//   - a single course key (string), e.g. 'A'
//   - null / 'FREE' for no class
//
// labBlocks (per day) explicitly describes any multi-period lab span:
//   { courseKeys: ['D1','D2'], periods: [1,2], label: 'D (L)' }
// This keeps the grid data honest (no silent colSpan guessing) — the UI
// merges cells purely by reading labBlocks, and the periods map below is
// only a fallback for non-lab, single-period slots.
export const schedule = {
  Monday: {
    periods: { 1: 'J1', 2: 'D1', 3: 'D1', 4: 'K', 5: 'FH', 6: 'A' },
    // Period 1 uses the J1/J2 parallel lab slot; periods 2-3 use D1/D2 parallel elective slot.
    labBlocks: [],
  },
  Tuesday: {
    periods: { 1: 'L', 2: 'D1', 3: 'D1', 4: 'C1', 5: 'FH', 6: 'B' },
    labBlocks: [],
  },
  Wednesday: {
    periods: { 1: 'L', 2: 'L', 3: 'A', 4: 'D1', 5: 'DSC1', 6: 'A' },
    labBlocks: [],
  },
  Thursday: {
    periods: { 1: 'D1', 2: 'D1', 3: 'C1', 4: 'A', 5: 'B', 6: 'DSC1' },
    // Explicit lab span: D1/D2 (Cyber Security / Business Analytics) run as
    // one continuous double-period lab block across periods 1-2.
    labBlocks: [
      { courseKeys: ['D1', 'D2'], periods: [1, 2], label: 'D (L)' },
    ],
  },
  Friday: {
    periods: { 1: 'C1', 2: 'B', 3: 'K', 4: 'FREE', 5: 'J1', 6: 'J1' },
    // J1/J2 (Linux Programming / Mobile App Dev) run as one continuous
    // double-period lab block across periods 5-6.
    labBlocks: [
      { courseKeys: ['J1', 'J2'], periods: [5, 6], label: 'J' },
    ],
  },
};

// ==================== PARALLEL SLOT GROUPS ====================
// Slots where two elective/lab sections run simultaneously; a student
// attends only one. Used to expand a legacy single-letter grid code
// ('C', 'D', 'J', 'DSC') into its real subgroup pair, for backward
// compatibility with any old data that still uses combined codes.
export const parallelGroups = {
  C: ['C1', 'C2'],
  D: ['D1', 'D2'],
  J: ['J1', 'J2'],
  DSC: ['DSC1', 'DSC2'],
};

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// ==================== HEADER METADATA ====================
export const meta = {
  programme: 'MCA',
  semester: 3,
  batch: '2025-2027',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Resolve a schedule cell code to full course details.
 * Accepts either a direct course key ('A', 'C1', 'J2', ...) or a legacy
 * combined code ('C', 'D', 'J', 'DSC'), which expands to its parallel pair.
 */
export function resolveCourse(code) {
  if (!code || code === 'FREE') return null;
  if (code === 'BREAK') return { name: 'BREAK HOURS', isBreak: true };

  if (courses[code]) return { key: code, ...courses[code] };

  if (parallelGroups[code]) {
    return {
      isGroup: true,
      options: parallelGroups[code].map((key) => ({ key, ...courses[key] })),
    };
  }

  return null;
}

/**
 * Get the lab block (if any) covering a given day + period.
 * Returns null if the period is not part of a multi-period lab span.
 */
export function getLabBlock(day, period) {
  const daySchedule = schedule[day];
  if (!daySchedule?.labBlocks?.length) return null;
  return (
    daySchedule.labBlocks.find((block) => block.periods.includes(period)) ||
    null
  );
}

/**
 * Get the full weekly schedule as a flat array of lecture entries.
 * Lab-block periods are collapsed into a single entry spanning their
 * full period range instead of being duplicated per period.
 */
export function getFlatSchedule() {
  const entries = [];
  const nonBreakPeriods = periods.filter((p) => !p.isBreak).map((p) => p.period);

  days.forEach((day) => {
    const daySchedule = schedule[day];
    const consumedByLab = new Set();

    // Emit lab blocks first, spanning their full period range.
    (daySchedule.labBlocks || []).forEach((block) => {
      block.periods.forEach((p) => consumedByLab.add(p));
      const startTime = periods.find((p) => p.period === block.periods[0])?.time;
      const endTime = periods.find((p) => p.period === block.periods[block.periods.length - 1])?.time;
      entries.push({
        day,
        periods: block.periods,
        time: `${startTime?.split(' - ')[0]} - ${endTime?.split(' - ')[1]}`,
        code: block.label,
        isLab: true,
        courses: block.courseKeys.map((key) => ({ key, ...courses[key] })),
      });
    });

    // Emit remaining single-period entries.
    nonBreakPeriods.forEach((periodNum) => {
      if (consumedByLab.has(periodNum)) return;
      const code = daySchedule.periods[periodNum];
      if (!code || code === 'FREE') return;

      entries.push({
        day,
        periods: [periodNum],
        time: periods.find((p) => p.period === periodNum)?.time,
        code,
        isLab: false,
        courses: [resolveCourse(code)].filter(Boolean),
      });
    });
  });

  return entries;
}

/**
 * Get today's schedule (or a named day's schedule).
 */
export function getTodaySchedule(dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })) {
  if (!days.includes(dayName)) return [];
  return getFlatSchedule()
    .filter((e) => e.day === dayName)
    .sort((a, b) => a.periods[0] - b.periods[0]);
}

/**
 * Total periods/week for a given course key.
 */
export function getPeriodsPerWeek(courseKey) {
  return courses[courseKey]?.periodsPerWeek ?? 0;
}

/**
 * Total credits for a given course key.
 */
export function getCredits(courseKey) {
  return courses[courseKey]?.credits ?? 0;
}

/**
 * Get the UI color for a course key (falls back to gray if unknown).
 */
export function getCourseColor(courseKey) {
  return courses[courseKey]?.color ?? '#9CA3AF';
}

/**
 * Sum of credits across the whole semester (unique courses only).
 */
export function getTotalCredits() {
  return Object.values(courses).reduce((sum, c) => sum + (c.credits || 0), 0);
}

export default {
  courses,
  periods,
  schedule,
  parallelGroups,
  days,
  meta,
  resolveCourse,
  getLabBlock,
  getFlatSchedule,
  getTodaySchedule,
  getPeriodsPerWeek,
  getCredits,
  getCourseColor,
  getTotalCredits,
};