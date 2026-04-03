import React, { useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Notification } from '../../types/habits';

interface NotificationDropdownProps {
  notifications: Notification[];
  showNotifications: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  showNotifications,
  onToggle,
  onClose,
  onMarkAsRead,
  onClearAll
}) => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, onClose]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'streak': return '🔥';
      case 'achievement': return '🏆';
      case 'miss': return '⚠️';
      default: return '📢';
    }
  };

  const getNotificationColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/20';
      case 'medium': return 'border-yellow-500 bg-yellow-500/20';
      case 'low': return 'border-green-500 bg-green-500/20';
      default: return '';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative" ref={notificationRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 z-50">
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {onClearAll && notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/20">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/20 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-500/20' : ''
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl mt-1">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-white/40 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};