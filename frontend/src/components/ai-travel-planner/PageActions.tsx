import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { DarkMode, LightMode } from '@mui/icons-material';
import Icon from '@mdi/react';
import { mdiBell } from '@mdi/js';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from '../../types/ai-travel-planner';

interface PageActionsProps {
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement>;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const PageActions: React.FC<PageActionsProps> = ({
  notifications,
  showNotifications,
  setShowNotifications,
  notificationRef,
  markNotificationAsRead,
  clearAllNotifications,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-4">
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
    </div>
  );
};

export default PageActions;