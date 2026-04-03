'use client';

import React from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';

export interface SyncStatusProps {
  isSynced: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  syncError: string | null;
  onForceSync?: () => void;
  theme?: 'light' | 'dark';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function SyncStatus({
  isSynced,
  isSaving,
  lastSaved,
  syncError,
  onForceSync,
  theme = 'light',
  showLabel = true,
  size = 'md',
}: SyncStatusProps) {
  const isDark = theme === 'dark';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const date = new Date(lastSaved);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isSaving) {
    return (
      <div className={`flex items-center gap-2 ${textSize}`}>
        <RefreshCw className={`${iconSize} animate-spin text-blue-500`} />
        {showLabel && (
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Saving...
          </span>
        )}
      </div>
    );
  }

  if (syncError) {
    return (
      <div
        className={`flex items-center gap-2 ${textSize} cursor-pointer`}
        onClick={onForceSync}
        title={`${syncError}. Click to retry.`}
      >
        <AlertTriangle className={`${iconSize} text-yellow-500`} />
        {showLabel && (
          <span className="text-yellow-600">
            {size === 'sm' ? 'Offline' : 'Sync failed'}
          </span>
        )}
      </div>
    );
  }

  if (isSynced) {
    return (
      <div className={`flex items-center gap-2 ${textSize}`} title={`Last saved: ${formatLastSaved()}`}>
        <Cloud className={`${iconSize} text-green-500`} />
        {showLabel && (
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {size === 'sm' ? 'Synced' : `Saved ${formatLastSaved()}`}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${textSize} cursor-pointer`}
      onClick={onForceSync}
      title="Data saved locally. Click to sync to cloud."
    >
      <CloudOff className={`${iconSize} ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      {showLabel && (
        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
          Local only
        </span>
      )}
    </div>
  );
}

export default SyncStatus;
