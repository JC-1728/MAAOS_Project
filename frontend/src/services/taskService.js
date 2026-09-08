const BACKEND_URL = 'http://localhost:8000';

// Sample tasks for when backend is unavailable
const sampleTasks = [
  {
    task_id: 1,
    title: 'Database Systems Assignment',
    description: 'ER Diagram + Normalization for Library Management System',
    category: 'ASSIGNMENT',
    categoryColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    progress: 65,
  },
  {
    task_id: 2,
    title: 'Machine Learning Lab Report',
    description: 'Implementation of KNN and Decision Tree classifiers',
    category: 'LAB',
    categoryColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    progress: 30,
  },
  {
    task_id: 3,
    title: 'Software Engineering Seminar',
    description: 'Prepare slides on Agile vs Waterfall methodologies',
    category: 'SEMINAR',
    categoryColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    progress: 10,
  },
];

export async function getTasks() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('maaos_token')}`,
      },
    });
    if (!res.ok) throw new Error('Backend unavailable');
    return await res.json();
  } catch {
    // Fallback to sample tasks when backend is unavailable
    return sampleTasks;
  }
}
