import React, { useState, useEffect } from 'react';
import {
  AlarmClock,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Vibrate,
  Clock,
  Settings2,
  Check,
  X,
  AlertTriangle,
  Play,
  Square,
} from 'lucide-react';
import { alarmSound, requestNotificationPermission } from '../../../utils/alarmSound';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import type { SleepAlarm } from '../../../types/health/sleep';

interface SmartAlarmConfigProps {
  alarm?: Partial<SleepAlarm>;
  onSave: (alarm: Partial<SleepAlarm>) => void;
  onCancel?: () => void;
  optimalWakeTime?: string | null;
  isLoading?: boolean;
  showCard?: boolean;
}

const daysOfWeek = [
  { value: 'mon', label: 'M' },
  { value: 'tue', label: 'T' },
  { value: 'wed', label: 'W' },
  { value: 'thu', label: 'T' },
  { value: 'fri', label: 'F' },
  { value: 'sat', label: 'S' },
  { value: 'sun', label: 'S' },
];

const soundTypes = [
  { value: 'gentle', label: 'Gentle', description: 'Soft, gradual tones' },
  { value: 'nature', label: 'Nature', description: 'Birds and forest sounds' },
  { value: 'classic', label: 'Classic', description: 'Traditional alarm' },
  { value: 'vibrant', label: 'Vibrant', description: 'Energetic wake-up' },
];

export const SmartAlarmConfig: React.FC<SmartAlarmConfigProps> = ({
  alarm,
  onSave,
  onCancel,
  optimalWakeTime,
  isLoading = false,
  showCard = false,
}) => {
  const [formData, setFormData] = useState<Partial<SleepAlarm>>({
    name: '',
    wakeWindowStart: '07:00',
    wakeWindowEnd: '07:30',
    daysActive: ['mon', 'tue', 'wed', 'thu', 'fri'],
    isSmartAlarm: true,
    gradualVolume: true,
    snoozeEnabled: true,
    snoozeDurationMinutes: 9,
    maxSnoozes: 3,
    soundType: 'gentle',
    vibrationEnabled: true,
    isActive: true,
    ...alarm,
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isTestingSound, setIsTestingSound] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  const handleDayToggle = (day: string) => {
    const current = formData.daysActive || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setFormData({ ...formData, daysActive: updated });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(formData);
  };

  const handleSaveClick = () => {
    onSave(formData);
  };

  const testAlarmSound = () => {
    if (isTestingSound) {
      // Stop the sound
      alarmSound.stop();
      setIsTestingSound(false);
    } else {
      // Play the selected sound type
      setIsTestingSound(true);
      alarmSound.playOnce((formData.soundType as any) || 'gentle', 3000);

      // Auto-stop after 3 seconds
      setTimeout(() => {
        setIsTestingSound(false);
      }, 3000);
    }
  };

  const testNotification = () => {
    // Test notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Smart Alarm Test', {
        body: 'Your alarm is set up correctly!',
        icon: '/favicon.ico',
        tag: 'alarm-test',
      });
    }

    // Also play sound
    testAlarmSound();
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      alarmSound.stop();
    };
  }, []);

  const formContent = (
        <div className="space-y-6">
          {/* Notification Permission Warning */}
          {notificationPermission !== 'granted' && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-200 font-medium">
                  Notifications not enabled
                </p>
                <p className="text-xs text-amber-200/70 mt-1">
                  Enable browser notifications to receive alarm alerts.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                  onClick={handleRequestNotificationPermission}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Enable Notifications
                </Button>
              </div>
            </div>
          )}

          {/* Alarm Name */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Alarm Name (optional)</Label>
            <Input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Morning Wake Up"
              className="bg-white/5 border-white/20"
            />
          </div>

          {/* Wake Window */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">Wake Window</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-white/50">Earliest</span>
                <Input
                  type="time"
                  value={formData.wakeWindowStart || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, wakeWindowStart: e.target.value })
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-white/50">Latest</span>
                <Input
                  type="time"
                  value={formData.wakeWindowEnd || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, wakeWindowEnd: e.target.value })
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            {optimalWakeTime && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-teal-300">
                  Optimal wake time: <strong>{optimalWakeTime}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Days Active */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Repeat</Label>
            <div className="flex gap-2">
              {daysOfWeek.map((day, index) => (
                <Button
                  key={day.value}
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'w-9 h-9 rounded-full',
                    formData.daysActive?.includes(day.value)
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-transparent text-white'
                      : 'border-white/20 text-white/60',
                    index >= 5 && 'border-purple-500/30'
                  )}
                  onClick={() => handleDayToggle(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Smart Alarm Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-sm font-medium text-white">Smart Alarm</p>
                <p className="text-xs text-white/50">
                  Wake you at optimal point in sleep cycle
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isSmartAlarm}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isSmartAlarm: checked })
              }
            />
          </div>

          {/* Sound Type */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Alarm Sound</Label>
            <div className="grid grid-cols-2 gap-2">
              {soundTypes.map((sound) => (
                <Button
                  key={sound.value}
                  type="button"
                  variant="outline"
                  className={cn(
                    'h-auto py-3 justify-start flex-col items-start',
                    formData.soundType === sound.value
                      ? 'bg-teal-500/30 border-teal-400 text-white'
                      : 'border-white/20 hover:border-white/40'
                  )}
                  onClick={() => setFormData({ ...formData, soundType: sound.value })}
                >
                  <span className="text-sm font-medium">{sound.label}</span>
                  <span className={cn(
                    "text-xs",
                    formData.soundType === sound.value ? "text-white/70" : "text-white/50"
                  )}>{sound.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/70">Gradual Volume</span>
              </div>
              <Switch
                checked={formData.gradualVolume}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, gradualVolume: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/70">Vibration</span>
              </div>
              <Switch
                checked={formData.vibrationEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, vibrationEnabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/70">Snooze</span>
              </div>
              <Switch
                checked={formData.snoozeEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, snoozeEnabled: checked })
                }
              />
            </div>
          </div>

          {/* Snooze Settings */}
          {formData.snoozeEnabled && (
            <div className="p-4 rounded-lg bg-white/5 space-y-3">
              <Label className="text-sm text-white/70">Snooze Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-white/50">Duration (min)</span>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.snoozeDurationMinutes || 9}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        snoozeDurationMinutes: parseInt(e.target.value) || 9,
                      })
                    }
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-white/50">Max Snoozes</span>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxSnoozes || 3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSnoozes: parseInt(e.target.value) || 3,
                      })
                    }
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Sound & Notification */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/20"
              onClick={testAlarmSound}
            >
              {isTestingSound ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Sound
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test Sound
                </>
              )}
            </Button>
            {notificationPermission === 'granted' && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/20"
                onClick={testNotification}
              >
                <Bell className="w-4 h-4 mr-2" />
                Test All
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/20"
                onClick={onCancel}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
              disabled={isLoading}
              onClick={handleSaveClick}
            >
              <Check className="w-4 h-4 mr-1" />
              {alarm?.id ? 'Update Alarm' : 'Save Alarm'}
            </Button>
          </div>
        </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlarmClock className="w-5 h-5 text-teal-400" />
            Smart Alarm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return formContent;
};

export default SmartAlarmConfig;
