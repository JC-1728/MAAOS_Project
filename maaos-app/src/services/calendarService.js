import timetable, {
  getFlatSchedule,
  getTodaySchedule,
  getTotalCredits,
  getCourseColor,
} from "../data/timetable";

// Simulates a backend API call
export async function getWeeklySchedule() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getFlatSchedule());
    }, 300);
  });
}

export async function getTodayClasses() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getTodaySchedule());
    }, 300);
  });
}

export async function getSemesterCredits() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getTotalCredits());
    }, 300);
  });
}

export async function getCourseBadgeColor(courseKey) {
  return getCourseColor(courseKey);
}

export default {
  getWeeklySchedule,
  getTodayClasses,
  getSemesterCredits,
  getCourseBadgeColor,
};