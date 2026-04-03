import React, { useState, useEffect } from 'react';
import { Task } from '../../types/todo1';
import { toast } from '../../components/ui/sonner';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';

interface TaskFormProps {
  onSubmit: (task: Partial<Task>) => void;
  onCancel?: () => void;
  task?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, task }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');

  const confirmation = useConfirmation();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || '');
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      setTitle('');
      setNotes('');
      setPriority('medium');
      setStatus('todo');
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      onSubmit({ ...task, title, notes, priority, status });
      toast.success(task ? 'Task updated successfully! ✅' : 'Task created successfully! 🎉');
    } catch (error) {
      toast.error(task ? 'Failed to update task. Please try again.' : 'Failed to create task. Please try again.');
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;

    // Check if form has been modified
    const hasChanges = title.trim() !== (task?.title || '') ||
                      notes.trim() !== (task?.notes || '') ||
                      priority !== (task?.priority || 'medium') ||
                      status !== (task?.status || 'todo');

    if (hasChanges) {
      const confirmed = await confirmation.showConfirmation({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to cancel without saving?',
        confirmText: 'Discard Changes',
        cancelText: 'Continue Editing',
        variant: 'default'
      });

      if (!confirmed) return;
    }

    onCancel();
  };

  const inputStyle = "w-full border border-white/20 rounded px-3 py-2 bg-white/10 text-white placeholder:text-white/40";

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-white">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-white">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputStyle}></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-white">Priority</label>
        <select value={priority} onChange={e => setPriority(e.target.value as any)} className={inputStyle}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-white">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className={inputStyle}>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="border border-white/20 text-white hover:bg-white/10 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        )}
        <button type="submit" className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 font-bold py-2 px-4 rounded">
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>

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
    </form>
  );
};

export default TaskForm;
