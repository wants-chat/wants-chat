import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DarkMode, LightMode, Map, TravelExplore, AutoAwesome } from '@mui/icons-material';
import Icon from '@mdi/react';
import { mdiBell } from '@mdi/js';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from '../../types/ai-travel-planner';

interface TravelPlannerHeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: 'plans' | 'stats';
  setActiveTab: (tab: 'plans' | 'stats') => void;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement | null>;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const TravelPlannerHeader: React.FC<TravelPlannerHeaderProps> = ({
  theme,
  toggleTheme,
  activeTab,
  setActiveTab,
  notifications,
  showNotifications,
  setShowNotifications,
  notificationRef,
  markNotificationAsRead,
  clearAllNotifications,
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <TravelExplore className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-semibold text-white">
              <span className="hidden sm:inline">AI Travel Planners</span>
              <span className="sm:hidden">Travel</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Navigation Tabs */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={activeTab === 'plans' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('plans')}
                className="rounded-xl"
              >
                My Plans
              </Button>
              <Button
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('stats')}
                className="rounded-xl"
              >
                🌍 Travel Globe
              </Button>
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="flex sm:hidden items-center gap-1">
              <Button
                variant={activeTab === 'plans' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('plans')}
                className="rounded-xl px-2"
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('stats')}
                className="rounded-xl px-2"
              >
                <TravelExplore className="h-4 w-4" />
              </Button>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                className="relative"
              >
                <Icon path={mdiBell} size={0.8} />
                {notifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </Badge>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  setShowNotifications={setShowNotifications}
                  markNotificationAsRead={markNotificationAsRead}
                  clearAllNotifications={clearAllNotifications}
                />
              )}
            </div>

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <DarkMode className="h-5 w-5" /> : <LightMode className="h-5 w-5" />}
            </Button>
            <Button
              onClick={() => navigate('/generate-travel-plan')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600"
              size="sm"
            >
              <AutoAwesome className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Generate New Plan</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default TravelPlannerHeader;