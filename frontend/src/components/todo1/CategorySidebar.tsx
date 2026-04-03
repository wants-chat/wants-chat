import React, { useState } from 'react';
import { Category } from '../../types/todo1';
import { Button } from '../ui/button';
import {
  Plus,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Inbox,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

export type QuickFilter = 'all' | 'in_progress' | 'completed' | null;

interface CategorySidebarProps {
  categories: Category[];
  onSelectCategory: (id: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  selectedCategoryId: string | null;
  quickFilter: QuickFilter;
  onQuickFilterChange: (filter: QuickFilter) => void;
  taskCounts?: {
    all: number;
    inProgress: number;
    completed: number;
  };
  loading?: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  selectedCategoryId,
  quickFilter,
  onQuickFilterChange,
  taskCounts = { all: 0, inProgress: 0, completed: 0 },
  loading = false
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getCategoryIcon = (color: string | undefined) => {
    return (
      <div
        className="w-3 h-3 rounded-sm"
        style={{ backgroundColor: color || '#6b7280' }}
      />
    );
  };

  const handleQuickFilter = (filter: QuickFilter) => {
    onSelectCategory(null); // Deselect category
    onQuickFilterChange(filter);
  };

  const handleCategorySelect = (categoryId: string) => {
    onQuickFilterChange(null); // Clear quick filter
    onSelectCategory(categoryId);
  };

  return (
    <div className="w-72 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          Workspace
        </h2>
      </div>

      {/* Quick Filters */}
      <div className="p-2">
        <div className="space-y-1">
          <button
            onClick={() => handleQuickFilter('all')}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors",
              quickFilter === 'all'
                ? "bg-teal-500/20 text-teal-300"
                : "text-white hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <Inbox className={cn("h-4 w-4", quickFilter === 'all' ? "text-teal-400" : "text-teal-400/70")} />
              <span>All Tasks</span>
            </div>
            {taskCounts.all > 0 && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/80">
                {taskCounts.all}
              </span>
            )}
          </button>
          <button
            onClick={() => handleQuickFilter('in_progress')}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors",
              quickFilter === 'in_progress'
                ? "bg-blue-500/20 text-blue-300"
                : "text-white hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <Clock className={cn("h-4 w-4", quickFilter === 'in_progress' ? "text-blue-400" : "text-blue-400/70")} />
              <span>In Progress</span>
            </div>
            {taskCounts.inProgress > 0 && (
              <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">
                {taskCounts.inProgress}
              </span>
            )}
          </button>
          <button
            onClick={() => handleQuickFilter('completed')}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors",
              quickFilter === 'completed'
                ? "bg-green-500/20 text-green-300"
                : "text-white hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className={cn("h-4 w-4", quickFilter === 'completed' ? "text-green-400" : "text-green-400/70")} />
              <span>Completed</span>
            </div>
            {taskCounts.completed > 0 && (
              <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full">
                {taskCounts.completed}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="px-4 py-2">
        <div className="border-t border-white/20" />
      </div>

      {/* Categories Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          Categories
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddCategory}
          className="h-7 w-7 p-0 hover:bg-white/10 text-white"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto px-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 px-4">
            <FolderOpen className="h-10 w-10 mx-auto text-teal-400/60 mb-3" />
            <p className="text-sm text-white/80 mb-3">No categories yet</p>
            <Button variant="outline" size="sm" onClick={onAddCategory} className="border-white/30 text-white hover:bg-white/10">
              <Plus className="h-4 w-4 mr-1" />
              Create Category
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map(category => (
              <div
                key={category.id}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                  selectedCategoryId === category.id && !quickFilter
                    ? "bg-teal-500/20 text-teal-300"
                    : "hover:bg-white/10 text-white"
                )}
                onClick={() => handleCategorySelect(category.id)}
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getCategoryIcon(category.color)}
                  <span className="truncate font-medium text-sm">{category.name}</span>
                </div>

                {/* Actions */}
                <div className={cn(
                  "flex items-center gap-1 transition-opacity",
                  hoveredId === category.id || selectedCategoryId === category.id ? "opacity-100" : "opacity-0"
                )}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-white/20 text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditCategory(category); }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.id); }}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Add Category Button */}
      <div className="p-3 border-t border-white/20">
        <Button
          onClick={onAddCategory}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>
    </div>
  );
};

export default CategorySidebar;
