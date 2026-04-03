import React from 'react';
import Icon from '@mdi/react';
import { mdiBell } from '@mdi/js';
import { Close } from '@mui/icons-material';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Notification } from '../../types/ai-travel-planner';

interface NotificationDropdownProps {
  notifications: Notification[];
  setShowNotifications: (show: boolean) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  setShowNotifications,
  markNotificationAsRead,
  clearAllNotifications,
}) => {
  return (
    <div
      className="absolute top-full right-0 mt-2 w-72 sm:w-80 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="p-0 bg-card border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Icon path={mdiBell} size={0.8} style={{ color: 'rgb(71, 189, 255)' }} />
            <h3 className="font-semibold text-foreground">Travel Reminders</h3>
            {notifications.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notifications.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllNotifications}
                className="h-6 px-2 text-xs hover:bg-primary/10"
                style={{ color: 'rgb(71, 189, 255)' }}
              >
                Mark all read
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNotifications(false)}
              className="h-6 w-6 p-0"
            >
              <Close className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b hover:bg-secondary/20 transition-colors bg-primary/5 border-l-2 border-l-primary`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded flex-shrink-0 bg-primary/10`}>
                    <span className="text-lg">
                      {notification.type === 'travel-day'
                        ? '✈️'
                        : notification.type === 'day-before'
                        ? '🧳'
                        : notification.type === 'week-before'
                        ? '📋'
                        : '📅'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate text-foreground">
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(notification.triggerDate).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs mb-2 text-foreground">{notification.message}</p>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          markNotificationAsRead(notification.id);
                          setShowNotifications(false);
                        }}
                        className="h-5 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        ✓ Read
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="h-5 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <Icon path={mdiBell} size={2} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">No travel reminders at the moment</p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Generate a travel plan to get reminders
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationDropdown;