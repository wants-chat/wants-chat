import React, { useState } from 'react';
import { Plus, X, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import type { SleepDisturbance } from '../../../types/health/sleep';

interface DisturbanceLoggerProps {
  disturbances: SleepDisturbance[];
  onDisturbancesChange: (disturbances: SleepDisturbance[]) => void;
  readOnly?: boolean;
}

const disturbanceTypes = [
  { value: 'bathroom', label: 'Bathroom', icon: '🚽' },
  { value: 'noise', label: 'Noise', icon: '🔊' },
  { value: 'nightmare', label: 'Nightmare', icon: '😱' },
  { value: 'discomfort', label: 'Discomfort', icon: '😣' },
  { value: 'temperature', label: 'Temperature', icon: '🌡️' },
  { value: 'partner', label: 'Partner', icon: '👤' },
  { value: 'pet', label: 'Pet', icon: '🐾' },
  { value: 'child', label: 'Child', icon: '👶' },
  { value: 'other', label: 'Other', icon: '❓' },
];

export const DisturbanceLogger: React.FC<DisturbanceLoggerProps> = ({
  disturbances,
  onDisturbancesChange,
  readOnly = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDisturbance, setNewDisturbance] = useState<Partial<SleepDisturbance>>({
    type: 'other',
    duration: 5,
  });

  const handleAddDisturbance = () => {
    if (!newDisturbance.time || !newDisturbance.type) return;

    const disturbance: SleepDisturbance = {
      time: newDisturbance.time,
      type: newDisturbance.type,
      duration: newDisturbance.duration || 5,
      notes: newDisturbance.notes,
    };

    onDisturbancesChange([...disturbances, disturbance]);
    setNewDisturbance({ type: 'other', duration: 5 });
    setShowAddForm(false);
  };

  const handleRemoveDisturbance = (index: number) => {
    const updated = [...disturbances];
    updated.splice(index, 1);
    onDisturbancesChange(updated);
  };

  const getDisturbanceInfo = (type: string) => {
    return disturbanceTypes.find((d) => d.value === type) || { icon: '❓', label: type };
  };

  if (readOnly) {
    if (disturbances.length === 0) {
      return (
        <div className="text-sm text-white/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          No disturbances recorded
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {disturbances.map((disturbance, index) => {
          const info = getDisturbanceInfo(disturbance.type);
          return (
            <Badge key={index} variant="secondary" className="text-xs">
              {info.icon} {info.label} at {disturbance.time}
              {disturbance.duration && ` (${disturbance.duration}m)`}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Sleep Disturbances</CardTitle>
        {!showAddForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="text-teal-400 hover:text-teal-300"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Add Disturbance</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-white/70">Time</Label>
                <Input
                  type="time"
                  value={newDisturbance.time || ''}
                  onChange={(e) =>
                    setNewDisturbance({ ...newDisturbance, time: e.target.value })
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/70">Duration (min)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={newDisturbance.duration || ''}
                  onChange={(e) =>
                    setNewDisturbance({
                      ...newDisturbance,
                      duration: parseInt(e.target.value) || 5,
                    })
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/70">Type</Label>
              <div className="flex flex-wrap gap-2">
                {disturbanceTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={newDisturbance.type === type.value ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      newDisturbance.type === type.value
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-transparent'
                        : 'border-white/20'
                    )}
                    onClick={() =>
                      setNewDisturbance({ ...newDisturbance, type: type.value })
                    }
                  >
                    {type.icon} {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/70">Notes (optional)</Label>
              <Input
                type="text"
                value={newDisturbance.notes || ''}
                onChange={(e) =>
                  setNewDisturbance({ ...newDisturbance, notes: e.target.value })
                }
                placeholder="Any additional details..."
                className="bg-white/5 border-white/20"
              />
            </div>

            <Button
              onClick={handleAddDisturbance}
              disabled={!newDisturbance.time}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
            >
              Add Disturbance
            </Button>
          </div>
        )}

        {/* Disturbance List */}
        {disturbances.length === 0 ? (
          <div className="text-center py-6 text-white/40">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No disturbances recorded</p>
            <p className="text-xs">Track any interruptions to your sleep</p>
          </div>
        ) : (
          <div className="space-y-2">
            {disturbances.map((disturbance, index) => {
              const info = getDisturbanceInfo(disturbance.type);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{info.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{info.label}</p>
                      <p className="text-xs text-white/50 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {disturbance.time}
                        {disturbance.duration && ` • ${disturbance.duration} min`}
                      </p>
                      {disturbance.notes && (
                        <p className="text-xs text-white/40 mt-1">{disturbance.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleRemoveDisturbance(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisturbanceLogger;
