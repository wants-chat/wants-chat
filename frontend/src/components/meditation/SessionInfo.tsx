import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { User, Clock, Headphones } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation, mdiVolumeHigh } from '@mdi/js';

interface SessionInfoProps {
  title?: string;
  instructor?: string;
  description?: string;
  duration: number;
  currentTime: number;
}

export const SessionInfo: React.FC<SessionInfoProps> = ({
  title = 'Loading...',
  instructor = 'Unknown',
  description = '',
  duration,
  currentTime,
}) => {
  const formatRemainingTime = () => {
    const remaining = duration - currentTime;
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <>
      <Card className="p-6 mb-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/30 mx-auto mb-4 flex items-center justify-center">
            <Icon path={mdiMeditation} size={2} className="text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {title}
            <span className="text-lg font-normal text-muted-foreground ml-2">
              ({formatRemainingTime()} left)
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">{instructor}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Session Details</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-400" />
              <span className="text-sm">Duration</span>
            </div>
            <Badge variant="secondary">{Math.floor(duration / 60)} minutes</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-teal-400" />
              <span className="text-sm">Audio Type</span>
            </div>
            <Badge variant="outline">Guided Meditation</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon path={mdiVolumeHigh} size={0.8} className="text-teal-400" />
              <span className="text-sm">Background</span>
            </div>
            <Badge variant="outline">Nature Sounds</Badge>
          </div>
        </div>
      </Card>
    </>
  );
};