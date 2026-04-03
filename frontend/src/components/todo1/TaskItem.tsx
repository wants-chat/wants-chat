import React, { useState } from 'react';
import { Task } from '../../types/todo1';
import { toast } from '../../components/ui/sonner';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onComplete }) => {
  const confirmation = useConfirmation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = task.status === 'done';
  const isInProgress = task.status === 'in_progress';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete Task',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (confirmed) {
      onDelete(task.id);
      toast.success(`Task deleted successfully!`);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id);
    toast.success(`Task marked as complete!`);
  };

  const handleToggleExpand = () => {
    if (task.notes) {
      setIsExpanded(!isExpanded);
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          border: 'border-red-400/50',
          label: 'High Priority'
        };
      case 'medium':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10',
          border: 'border-yellow-400/50',
          label: 'Medium Priority'
        };
      case 'low':
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-400/10',
          border: 'border-emerald-400/50',
          label: 'Low Priority'
        };
      default:
        return {
          color: 'text-white/60',
          bg: 'bg-white/10',
          border: 'border-white/20',
          label: 'No Priority'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'done':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-400/10',
          label: 'Completed'
        };
      case 'in_progress':
        return {
          icon: Clock,
          color: 'text-cyan-400',
          bg: 'bg-cyan-400/10',
          label: 'In Progress'
        };
      default:
        return {
          icon: Circle,
          color: 'text-white/40',
          bg: 'bg-white/10',
          label: 'To Do'
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <GlassCard
        className={cn(
          "group cursor-pointer",
          isCompleted && "opacity-60",
          priorityConfig.border,
          "border-l-4"
        )}
        onClick={handleToggleExpand}
        hover={true}
      >
        <div className="flex items-start gap-3">
          {/* Status Checkbox */}
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={cn(
              "mt-0.5 flex-shrink-0 rounded-full p-0.5 transition-colors",
              !isCompleted && "hover:bg-emerald-400/20"
            )}
          >
            <StatusIcon
              className={cn(
                "h-5 w-5 transition-colors",
                statusConfig.color,
                !isCompleted && "hover:text-emerald-400"
              )}
            />
          </button>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-white",
                    isCompleted && "line-through text-white/40"
                  )}
                >
                  {task.title}
                </h3>

                {/* Notes Preview */}
                {task.notes && !isExpanded && (
                  <p className="text-sm text-white/60 mt-1 line-clamp-1">
                    {task.notes.replace(/<[^>]*>/g, '')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleComplete}
                    className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {!isCompleted && (
                      <DropdownMenuItem onClick={handleComplete}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Expanded Notes */}
            {task.notes && isExpanded && (
              <div
                className="mt-3 text-sm text-white/80 prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: task.notes }}
              />
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
                  priorityConfig.bg,
                  priorityConfig.color
                )}
              >
                <Flag className="h-3 w-3" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>

              {/* Status Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
                  statusConfig.bg,
                  statusConfig.color
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>

              {/* Due Time */}
              {task.dueAt && (
                <span className="inline-flex items-center gap-1 text-xs text-white/60">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              )}

              {/* Expand Indicator */}
              {task.notes && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="ml-auto text-xs text-white/40 hover:text-white/60 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      More
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </>
  );
};

export default TaskItem;
