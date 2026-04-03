import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiScale, mdiFire, mdiChartLine, mdiCamera } from '@mdi/js';

interface ProgressTabsProps {
  activeTab: 'weight' | 'calories' | 'photos';
  onTabChange: (tab: 'weight' | 'calories' | 'photos') => void;
}

const ProgressTabs: React.FC<ProgressTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: Array<{
    id: 'weight' | 'calories' | 'photos';
    label: string;
    icon: string;
  }> = [
    { id: 'weight', label: 'Weight', icon: mdiScale },
    { id: 'calories', label: 'Calories', icon: mdiFire },
    { id: 'photos', label: 'Photos', icon: mdiCamera }
  ];

  return (
    <Card className="p-2 bg-white/5 border border-white/10">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon path={tab.icon} size={0.8} className="mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default ProgressTabs;