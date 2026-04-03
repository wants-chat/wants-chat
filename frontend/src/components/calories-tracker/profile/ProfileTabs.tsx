import React from 'react';
import { Button } from '../../ui/button';

interface ProfileTabsProps {
  activeTab: 'overview' | 'achievements';
  onTabChange: (tab: 'overview' | 'achievements') => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="flex gap-1 p-1 bg-secondary/20 rounded-lg">
      <Button
        variant={activeTab === 'overview' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => onTabChange('overview')}
      >
        Overview
      </Button>
      <Button
        variant={activeTab === 'achievements' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => onTabChange('achievements')}
      >
        Achievements
      </Button>
    </div>
  );
};

export default ProfileTabs;