import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiFire, mdiChartLine, mdiCalendarToday, mdiTarget } from '@mdi/js';

interface QuickNavigationProps {
  onNavigate: (path: string) => void;
}

const QuickNavigation: React.FC<QuickNavigationProps> = ({ onNavigate }) => {
  const navigationItems = [
    { path: '/calories-tracker/diary', icon: mdiFire, label: 'Food Diary' },
    { path: '/calories-tracker/progress', icon: mdiChartLine, label: 'Progress' },
    { path: '/calories-tracker/fasting', icon: mdiCalendarToday, label: 'Fasting' },
    { path: '/calories-tracker/profile', icon: mdiTarget, label: 'Profile' }
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant="outline"
            className="h-16 flex-col gap-2"
            onClick={() => onNavigate(item.path)}
          >
            <Icon path={item.icon} size={1} />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickNavigation;