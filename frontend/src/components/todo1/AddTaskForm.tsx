import React, { useState } from 'react';
import { Category } from '../../types/todo1';
import { toast } from '../../components/ui/sonner';

interface AddTaskFormProps {
  lists: Category[];
  onAddTask: (task: any) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ lists, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [listId, setListId] = useState(lists[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (!listId) {
      toast.error('Please select a list');
      return;
    }

    try {
      // This is a simplified version. In a real app, we'd handle all fields.
      onAddTask({ title, listId });
      setTitle('');
      toast.success('Task added successfully! 📝');
    } catch (error) {
      toast.error('Failed to add task. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="font-bold mb-2">Add New Task</h3>
      <div className="flex gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="flex-grow border rounded px-2 py-1"
        />
        <select value={listId} onChange={(e) => setListId(e.target.value)} className="border rounded px-2 py-1">
          {lists.map(list => (
            <option key={list.id} value={list.id}>{list.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
          Add
        </button>
      </div>
    </form>
  );
};

export default AddTaskForm;
