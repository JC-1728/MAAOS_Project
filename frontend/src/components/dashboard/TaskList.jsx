import TaskCard from "./TaskCard";

export default function TaskList({
  tasks,
  countdown,
  formatTime,
}) {
  return (
    <div className="space-y-6">
      {tasks.map((task, idx) => (
        <TaskCard
          key={task.id}
          task={task}
          idx={idx}
          countdown={countdown}
          formatTime={formatTime}
        />
      ))}
    </div>
  );
}