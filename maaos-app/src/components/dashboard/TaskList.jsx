import TaskCard from "./TaskCard";

export default function TaskList({ tasks }) {
  return (
    <div className="space-y-6">
      {tasks.map((task, idx) => (
        <TaskCard
          key={task.id}
          task={task}
          idx={idx}
        />
      ))}
    </div>
  );
}