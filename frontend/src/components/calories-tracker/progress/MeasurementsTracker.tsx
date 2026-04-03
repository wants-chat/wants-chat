import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

interface MeasurementsTrackerProps {
  measurements: Measurements;
  lastUpdated: Date;
  onUpdate: () => void;
}

const MeasurementsTracker: React.FC<MeasurementsTrackerProps> = ({
  measurements,
  lastUpdated,
  onUpdate
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Body Measurements</h3>
          <Button size="sm" variant="outline" onClick={onUpdate}>
            Update
          </Button>
        </div>
        
        <div className="space-y-3">
          {Object.entries(measurements).map(([part, value]) => (
            <div key={part} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <span className="capitalize text-foreground">{part}</span>
              <span className="font-bold text-foreground">{value} cm</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
};

export default MeasurementsTracker;