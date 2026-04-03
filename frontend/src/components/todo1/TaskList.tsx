import React, { useState, useMemo } from 'react';
import { Task } from '../../types/todo1';
import TaskItem from './TaskItem';
import { Button } from '../ui/button';
import {
  CheckCircle2,
  Clock,
  Circle,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
}

type FilterOption = 'all' | 'todo' | 'in_progress' | 'done';

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask, onCompleteTask }) => {
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (filterBy === 'all') return tasks;
    return tasks.filter(task => task.status === filterBy);
  }, [tasks, filterBy]);

  // Group tasks by status for visual separation
  const groupedTasks = useMemo(() => {
    if (filterBy !== 'all') return { filtered: filteredTasks };

    return {
      todo: filteredTasks.filter(t => t.status === 'todo'),
      inProgress: filteredTasks.filter(t => t.status === 'in_progress'),
      done: filteredTasks.filter(t => t.status === 'done'),
    };
  }, [filteredTasks, filterBy]);

  const getFilterCounts = () => ({
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  });

  const counts = getFilterCounts();

  return (
    <div className="space-y-4">
      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-white/20">
        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <Button
            variant={filterBy === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterBy('all')}
            className={filterBy === 'all' ? 'h-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'h-8 text-white/60 hover:text-white hover:bg-white/10'}
          >
            All
            <span className="ml-1.5 text-xs opacity-70">{counts.all}</span>
          </Button>
          <Button
            variant={filterBy === 'todo' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterBy('todo')}
            className={filterBy === 'todo' ? 'h-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'h-8 text-white/60 hover:text-white hover:bg-white/10'}
          >
            <Circle className="h-3 w-3 mr-1.5" />
            To Do
            <span className="ml-1.5 text-xs opacity-70">{counts.todo}</span>
          </Button>
          <Button
            variant={filterBy === 'in_progress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterBy('in_progress')}
            className={filterBy === 'in_progress' ? 'h-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'h-8 text-white/60 hover:text-white hover:bg-white/10'}
          >
            <Clock className="h-3 w-3 mr-1.5" />
            In Progress
            <span className="ml-1.5 text-xs opacity-70">{counts.in_progress}</span>
          </Button>
          <Button
            variant={filterBy === 'done' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterBy('done')}
            className={filterBy === 'done' ? 'h-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'h-8 text-white/60 hover:text-white hover:bg-white/10'}
          >
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Done
            <span className="ml-1.5 text-xs opacity-70">{counts.done}</span>
          </Button>
        </div>
      </div>

      {/* Task Groups */}
      {filterBy === 'all' ? (
        <div className="space-y-6">
          {/* To Do Section */}
          {groupedTasks.todo && groupedTasks.todo.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Circle className="h-4 w-4 text-white/40" />
                <h3 className="text-sm font-medium text-white/60">
                  To Do
                </h3>
                <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  {groupedTasks.todo.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.todo.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onComplete={onCompleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress Section */}
          {groupedTasks.inProgress && groupedTasks.inProgress.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-white/60">
                  In Progress
                </h3>
                <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                  {groupedTasks.inProgress.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.inProgress.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onComplete={onCompleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Done Section */}
          {groupedTasks.done && groupedTasks.done.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-white/60">
                  Completed
                </h3>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  {groupedTasks.done.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.done.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onComplete={onCompleteTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Filtered View */
        <div className="space-y-3">
          {groupedTasks.filtered?.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onComplete={onCompleteTask}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            {filterBy === 'done' ? (
              <CheckCircle2 className="h-8 w-8 text-white/40" />
            ) : filterBy === 'in_progress' ? (
              <Clock className="h-8 w-8 text-white/40" />
            ) : (
              <Circle className="h-8 w-8 text-white/40" />
            )}
          </div>
          <p className="text-white/60">
            {filterBy === 'all'
              ? 'No tasks yet'
              : `No ${filterBy.replace('_', ' ')} tasks`}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
