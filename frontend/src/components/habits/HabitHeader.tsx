import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ChevronLeft, Plus, Search, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { NotificationDropdown } from './NotificationDropdown';
import type { Notification, HabitTab } from '../../types/habits';

interface HabitHeaderProps {
  title: string;
  theme: string;
  onThemeToggle: () => void;
  notifications?: Notification[];
  showNotifications?: boolean;
  onNotificationToggle?: () => void;
  onNotificationClose?: () => void;
  onNotificationMarkAsRead?: (id: string) => void;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showAddButton?: boolean;
  onAddClick?: () => void;
  activeTab?: HabitTab;
  onTabChange?: (tab: HabitTab) => void;
  showBackButton?: boolean;
}

export const HabitHeader: React.FC<HabitHeaderProps> = ({
  title,
  theme,
  onThemeToggle,
  notifications = [],
  showNotifications = false,
  onNotificationToggle,
  onNotificationClose,
  onNotificationMarkAsRead,
  showSearch = false,
  searchTerm = '',
  onSearchChange,
  showAddButton = false,
  onAddClick,
  activeTab,
  onTabChange,
  showBackButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/10 backdrop-blur-xl shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/habit-planner')}
                className="flex items-center"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
            )}
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {showSearch && onSearchChange && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="text"
                  placeholder="Search habits..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            )}

            {showAddButton && onAddClick && (
              <Button onClick={onAddClick} className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Habit
              </Button>
            )}

            {notifications && onNotificationToggle && onNotificationClose && onNotificationMarkAsRead && (
              <NotificationDropdown
                notifications={notifications}
                showNotifications={showNotifications}
                onToggle={onNotificationToggle}
                onClose={onNotificationClose}
                onMarkAsRead={onNotificationMarkAsRead}
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {activeTab && onTabChange && (
          <div className="flex space-x-1 pb-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('dashboard')}
              className="rounded-full"
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('calendar')}
              className="rounded-full"
            >
              Calendar
            </Button>
            <Button
              variant={activeTab === 'streaks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('streaks')}
              className="rounded-full"
            >
              Streaks
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};