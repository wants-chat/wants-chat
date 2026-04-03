import React, { useState } from 'react';
import Icon from '@mdi/react';
import { 
  mdiBell,
  mdiDumbbell,
  mdiTrophy,
  mdiFire,
  mdiTrendingUp,
  mdiCheckCircle,
  mdiClose,
  mdiDelete
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface Notification {
  id: string;
  type: 'workout' | 'progress' | 'achievement' | 'streak';
  title: string;
  message: string;
  time: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'workout': return mdiDumbbell;
      case 'progress': return mdiTrendingUp;
      case 'achievement': return mdiTrophy;
      case 'streak': return mdiFire;
      default: return mdiBell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-primary';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getTimeDisplay = (time: Date) => {
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-16 right-4 w-80">
        <Card className="p-0 bg-card border shadow-lg" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Icon path={mdiBell} size={0.8} className="text-primary" />
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMarkAllAsRead}
                  className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                >
                  Mark all read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <Icon path={mdiClose} size={0.5} />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-secondary/20 transition-colors ${
                    !notification.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      notification.priority === 'high' ? 'bg-destructive/10' :
                      notification.priority === 'medium' ? 'bg-primary/10' : 'bg-muted/20'
                    }`}>
                      <Icon 
                        path={getNotificationIcon(notification.type)} 
                        size={0.6} 
                        className={getPriorityColor(notification.priority)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate ${
                          !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2">
                          {getTimeDisplay(notification.time)}
                        </span>
                      </div>
                      
                      <p className={`text-xs mb-2 ${
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="h-5 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <Icon path={mdiCheckCircle} size={0.4} className="mr-1" />
                            Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(notification.id)}
                          className="h-5 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Icon path={mdiDelete} size={0.4} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <Icon path={mdiBell} size={1.5} className="text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Showing {recentNotifications.length} of {notifications.length} notifications
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NotificationDropdown;