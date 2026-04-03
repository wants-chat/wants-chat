import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { mdiCheckCircle } from '@mdi/js';

interface Milestone {
  date: Date;
  type: string;
  description: string;
}

interface MilestonesProps {
  milestones: Milestone[];
}

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Milestones</h3>
        
        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon path={mdiCheckCircle} size={0.8} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{milestone.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {milestone.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No milestones yet. Keep tracking to unlock achievements!
          </p>
        )}
      </div>
    </Card>
  );
};

export default Milestones;