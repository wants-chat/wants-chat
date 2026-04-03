import React from 'react';
import { BarChart3, BookOpen, FolderOpen, Calendar, Globe } from 'lucide-react';

interface RecipeTabsProps {
  activeTab: 'dashboard' | 'recipes' | 'all-recipes' | 'categories' | 'meal-plan';
  onTabChange: (tab: 'dashboard' | 'recipes' | 'all-recipes' | 'categories' | 'meal-plan') => void;
}

export const RecipeTabs: React.FC<RecipeTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: BarChart3,
      shortLabel: 'Dashboard'
    },
    {
      id: 'recipes' as const,
      label: 'My Recipes',
      icon: BookOpen,
      shortLabel: 'Recipes'
    },
    {
      id: 'all-recipes' as const,
      label: 'All Recipes',
      icon: Globe,
      shortLabel: 'All Recipes'
    },
    {
      id: 'categories' as const,
      label: 'Categories',
      icon: FolderOpen,
      shortLabel: 'Categories'
    },
    {
      id: 'meal-plan' as const,
      label: 'Meal Planner',
      icon: Calendar,
      shortLabel: 'Planner'
    }
  ];

  return (
    <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-200 whitespace-nowrap min-h-[44px] font-medium ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
              : 'text-white/60 hover:text-white hover:bg-white/10 bg-transparent'
          }`}
        >
          <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden text-sm">{tab.shortLabel}</span>
        </button>
      ))}
    </nav>
  );
};