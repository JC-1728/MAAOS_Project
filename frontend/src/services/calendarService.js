const BACKEND_URL = 'http://localhost:8000';

const sampleSchedule = [
  { day: 'Monday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Database Systems', faculty: ['Dr. Thomas'] }], isLab: false },
  { day: 'Monday', periods: [3,4,5], time: '11:00 - 13:50', courses: [{ name: 'DBMS Lab', faculty: ['Dr. Thomas', 'Ms. Priya'] }], isLab: true },
  { day: 'Tuesday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Machine Learning', faculty: ['Dr. Kumar'] }], isLab: false },
  { day: 'Tuesday', periods: [5,6], time: '13:00 - 14:50', courses: [{ name: 'Software Engineering', faculty: ['Prof. Nair'] }], isLab: false },
  { day: 'Wednesday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Computer Networks', faculty: ['Dr. Menon'] }], isLab: false },
  { day: 'Wednesday', periods: [3,4,5], time: '11:00 - 13:50', courses: [{ name: 'ML Lab', faculty: ['Dr. Kumar', 'Mr. Anand'] }], isLab: true },
  { day: 'Thursday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Software Engineering', faculty: ['Prof. Nair'] }], isLab: false },
  { day: 'Thursday', periods: [3,4], time: '11:00 - 12:50', courses: [{ name: 'Database Systems', faculty: ['Dr. Thomas'] }], isLab: false },
  { day: 'Friday', periods: [1,2], time: '9:00 - 10:50', courses: [{ name: 'Machine Learning', faculty: ['Dr. Kumar'] }], isLab: false },
  { day: 'Friday', periods: [3,4,5], time: '11:00 - 13:50', courses: [{ name: 'CN Lab', faculty: ['Dr. Menon', 'Ms. Sara'] }], isLab: true },
];

export async function getWeeklySchedule() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/calendar/weekly`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('maaos_token')}` },
    });
    if (!res.ok) throw new Error('Backend unavailable');
    return await res.json();
  } catch {
    return sampleSchedule;
  }
}
