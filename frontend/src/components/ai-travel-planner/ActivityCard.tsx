import React from 'react';
import {
  Delete,
  Save,
  Cancel,
  Map,
  AccessTime,
  LocationOn,
  AttachMoney,
  PhotoCamera,
  Explore,
  Museum,
  ShoppingBag,
  Spa,
  Nightlife,
  LocalActivity,
} from '@mui/icons-material';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import type { Activity } from '../../types/ai-travel-planner';

interface ActivityCardProps {
  activity: Activity;
  dayIndex: number;
  isEditing: boolean;
  onSave: (dayIndex: number, activityId: string, updates: Partial<Activity>) => void;
  onDelete: (dayIndex: number, activityId: string) => void;
  onCancelEdit: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  dayIndex,
  isEditing,
  onSave,
  onDelete,
  onCancelEdit,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sightseeing':
        return <PhotoCamera className="h-4 w-4" />;
      case 'adventure':
        return <Explore className="h-4 w-4" />;
      case 'culture':
        return <Museum className="h-4 w-4" />;
      case 'shopping':
        return <ShoppingBag className="h-4 w-4" />;
      case 'relaxation':
        return <Spa className="h-4 w-4" />;
      case 'entertainment':
        return <Nightlife className="h-4 w-4" />;
      default:
        return <LocalActivity className="h-4 w-4" />;
    }
  };

  if (isEditing) {
    return (
      <div className="border border-white/20 rounded-xl p-3 sm:p-4 bg-white/5">
        <div className="space-y-3">
          <Input
            defaultValue={activity.name}
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
            placeholder="Activity name"
          />
          <Input
            defaultValue={activity.description}
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
            placeholder="Description"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onSave(dayIndex, activity.id, {})}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xs sm:text-sm"
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEdit}
              className="rounded-xl text-xs sm:text-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Cancel className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/20 rounded-xl p-3 sm:p-4 bg-white/5 hover:bg-white/10 transition-all">
      <div>
        {activity.image && (
          <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden h-32 sm:h-48">
            <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 sm:gap-4 flex-1">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 text-teal-400">
              <div className="scale-75 sm:scale-100">{getCategoryIcon(activity.category)}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                <h4 className="font-semibold text-sm sm:text-base leading-tight text-white">{activity.name}</h4>
                <Badge variant="outline" className="text-xs self-start bg-white/10 text-white/70 border-white/20">
                  {activity.category}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-white/60 mb-2 leading-relaxed">
                {activity.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs sm:text-sm text-white/50">
                <span className="flex items-center gap-1">
                  <AccessTime className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
                  {activity.time} • {activity.duration}
                </span>
                <span className="flex items-center gap-1">
                  <LocationOn className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
                  <span className="truncate">{activity.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <AttachMoney className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
                  ${activity.cost}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(dayIndex, activity.id)}
              className="h-6 w-6 sm:h-8 sm:w-8 text-white/60 hover:text-red-400 hover:bg-red-500/10"
            >
              <Delete className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            {activity.mapUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(activity.mapUrl, '_blank')}
                className="h-6 w-6 sm:h-8 sm:w-8 text-white/60 hover:text-teal-400 hover:bg-teal-500/10"
              >
                <Map className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;