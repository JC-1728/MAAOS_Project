// Static timetable data used by TimetableAgendaView

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const schedule = [
  { day: 'Monday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Database Systems', faculty: ['Dr. Thomas'] }], isLab: false, code: 'CS301' },
  { day: 'Monday', periods: [3,4,5], time: '11:00 - 13:50', courses: [{ name: 'DBMS Lab', faculty: ['Dr. Thomas', 'Ms. Priya'] }], isLab: true, code: 'CS301L' },
  { day: 'Tuesday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Machine Learning', faculty: ['Dr. Kumar'] }], isLab: false, code: 'CS302' },
  { day: 'Tuesday', periods: [5,6], time: '13:00 - 14:50', courses: [{ name: 'Software Engineering', faculty: ['Prof. Nair'] }], isLab: false, code: 'CS303' },
  { day: 'Wednesday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Computer Networks', faculty: ['Dr. Menon'] }], isLab: false, code: 'CS304' },
  { day: 'Wednesday', periods: [3,4,5], time: '11:00 - 13:50', courses: [{ name: 'ML Lab', faculty: ['Dr. Kumar', 'Mr. Anand'] }], isLab: true, code: 'CS302L' },
  { day: 'Thursday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Software Engineering', faculty: ['Prof. Nair'] }], isLab: false, code: 'CS303' },
  { day: 'Thursday', periods: [3,4], time: '11:00 - 12:50', courses: [{ name: 'Database Systems', faculty: ['Dr. Thomas'] }], isLab: false, code: 'CS301' },
  { day: 'Friday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Machine Learning', faculty: ['Dr. Kumar'] }], isLab: false, code: 'CS302' },
  { day: 'Friday', periods: [3,4,5], time: '11:00 - 13:50', courses: [{ name: 'CN Lab', faculty: ['Dr. Menon', 'Ms. Sara'] }], isLab: true, code: 'CS304L' },
];

export function getTodaySchedule() {
  const today = days[new Date().getDay() - 1]; // Monday=0 in our array
  if (!today) return [];
  return schedule.filter((s) => s.day === today);
}

export function getFlatSchedule() {
  return schedule;
}
