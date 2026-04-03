
export interface Task {
  id: string; // uuid
  categoryId: string; // uuid
  title: string;
  notes?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueAt?: string; // ISO date
  isActive: boolean;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface Category {
  id: string; // uuid
  name: string;
  color?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
