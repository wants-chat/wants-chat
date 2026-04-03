import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiTrophy,
  mdiMedal
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { PersonalRecord } from '../../../types/fitness';

interface PersonalRecordsProps {
  records: PersonalRecord[];
  onViewAll?: () => void;
}

const PersonalRecords: React.FC<PersonalRecordsProps> = ({ records, onViewAll }) => {
  return (
    <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Icon path={mdiTrophy} size={1} className="text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold">Personal Records</h3>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {records.map((pr) => (
          <div 
            key={pr.exerciseId} 
            className="p-4 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200/30 dark:border-yellow-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Icon path={mdiMedal} size={0.8} className="text-yellow-600" />
              </div>
              <div>
                <p className="font-medium capitalize">
                  {pr.exerciseId.replace('-', ' ')}
                </p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                  {pr.value} {pr.unit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PersonalRecords;