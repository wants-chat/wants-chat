import React from 'react';
import { Add, Restaurant } from '@mui/icons-material';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import ActivityCard from './ActivityCard';
import AddActivityForm from './AddActivityForm';
import type { DayPlan, Activity } from '../../types/ai-travel-planner';

interface DayItineraryProps {
  day: DayPlan;
  dayIndex: number;
  editingActivity: string | null;
  addingActivityDay: number | null;
  onSaveActivity: (dayIndex: number, activityId: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (dayIndex: number, activityId: string) => void;
  onAddActivity: (dayIndex: number) => void;
  onSaveNewActivity: (dayIndex: number, newActivity: Partial<Activity>) => void;
  onCancelAddActivity: () => void;
  setEditingActivity: (id: string | null) => void;
}

const DayItinerary: React.FC<DayItineraryProps> = ({
  day,
  dayIndex,
  editingActivity,
  addingActivityDay,
  onSaveActivity,
  onDeleteActivity,
  onAddActivity,
  onSaveNewActivity,
  onCancelAddActivity,
  setEditingActivity,
}) => {
  return (
    <Card className="rounded-2xl mb-4 sm:mb-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-3 sm:p-6 rounded-t-2xl">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <span className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {day.day}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight text-white">{day.title}</h3>
              <p className="text-xs sm:text-sm text-white/60">{day.date}</p>
            </div>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs sm:text-sm self-start bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => onAddActivity(dayIndex)}
          >
            <Add className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Add Activity</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Activities */}
        <div className="space-y-3 sm:space-y-4">
          {/* Add New Activity Form */}
          {addingActivityDay === dayIndex && (
            <AddActivityForm
              dayIndex={dayIndex}
              onSave={onSaveNewActivity}
              onCancel={onCancelAddActivity}
            />
          )}

          {(day.activities || []).map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              dayIndex={dayIndex}
              isEditing={editingActivity === activity.id}
              onSave={onSaveActivity}
              onDelete={onDeleteActivity}
              onCancelEdit={() => setEditingActivity(null)}
            />
          ))}
        </div>

        {/* Meals */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base text-white">
            <Restaurant className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
            Recommended Dining
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(day.meals || []).map((meal) => (
              <div key={meal.type} className="rounded-xl p-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs capitalize bg-white/10 text-white/70 border-white/20">
                    {meal.type}
                  </Badge>
                  <span className="text-xs sm:text-sm font-semibold text-teal-400">
                    ${meal.estimatedCost}
                  </span>
                </div>
                <p className="font-medium text-xs sm:text-sm leading-tight text-white">{meal.restaurant}</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  {meal.cuisine} • {meal.location}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {day.notes && (
          <div className="mt-3 sm:mt-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
            <p className="text-xs sm:text-sm text-teal-300 leading-relaxed">
              <strong className="text-teal-200">Note:</strong> {day.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DayItinerary;