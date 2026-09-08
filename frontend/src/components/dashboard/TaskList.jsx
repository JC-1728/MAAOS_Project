import TaskCard from './TaskCard';

export default function TaskList({ tasks, countdown, formatTime }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">NO ACTIVE TASKS</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tasks will appear here once loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300 tracking-wider">PRIORITY QUEUE</h2>
      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <TaskCard key={task.task_id || idx} task={task} idx={idx} />
        ))}
      </div>
    </div>
  );
}
