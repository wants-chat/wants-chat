/**
 * Alarm Scheduler Hook
 * Checks alarm times and triggers notifications/sounds
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { alarmSound, showAlarmNotification, requestNotificationPermission } from '../../utils/alarmSound';
import type { SleepAlarm } from '../../types/health/sleep';

interface UseAlarmSchedulerOptions {
  alarms: SleepAlarm[];
  enabled?: boolean;
  onAlarmTriggered?: (alarm: SleepAlarm) => void;
}

interface AlarmSchedulerState {
  activeAlarm: SleepAlarm | null;
  isRinging: boolean;
  snoozeCount: number;
}

const getDayOfWeek = (): string => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[new Date().getDay()];
};

const getCurrentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const isTimeInWindow = (current: string, start: string, end: string): boolean => {
  const [currentH, currentM] = current.split(':').map(Number);
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const currentMinutes = currentH * 60 + currentM;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight windows (e.g., 23:00 - 07:00)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export const useAlarmScheduler = ({
  alarms,
  enabled = true,
  onAlarmTriggered,
}: UseAlarmSchedulerOptions) => {
  const [state, setState] = useState<AlarmSchedulerState>({
    activeAlarm: null,
    isRinging: false,
    snoozeCount: 0,
  });

  const lastTriggeredRef = useRef<string | null>(null);
  const snoozeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if any alarm should trigger
  const checkAlarms = useCallback(() => {
    if (!enabled || state.isRinging) return;

    const currentTime = getCurrentTime();
    const currentDay = getDayOfWeek();

    for (const alarm of alarms) {
      // Skip inactive alarms
      if (!alarm.isActive) continue;

      // Check if alarm is set for today
      if (!alarm.daysActive?.includes(currentDay)) continue;

      // Check if we already triggered this alarm in the last minute
      const alarmKey = `${alarm.id}-${currentTime}`;
      if (lastTriggeredRef.current === alarmKey) continue;

      // Check if current time is within wake window
      if (isTimeInWindow(currentTime, alarm.wakeWindowStart, alarm.wakeWindowEnd)) {
        // Trigger alarm!
        lastTriggeredRef.current = alarmKey;
        triggerAlarm(alarm);
        break;
      }
    }
  }, [alarms, enabled, state.isRinging]);

  // Trigger an alarm
  const triggerAlarm = useCallback((alarm: SleepAlarm) => {
    console.log('Triggering alarm:', alarm.name || 'Smart Alarm');

    setState(prev => ({
      ...prev,
      activeAlarm: alarm,
      isRinging: true,
    }));

    // Show notification and play sound
    showAlarmNotification(
      alarm.name || 'Wake Up!',
      `It's time to wake up! Current time: ${getCurrentTime()}`,
      (alarm.soundType as any) || 'gentle'
    );

    onAlarmTriggered?.(alarm);
  }, [onAlarmTriggered]);

  // Dismiss the alarm
  const dismissAlarm = useCallback(() => {
    alarmSound.stop();

    if (snoozeTimeoutRef.current) {
      clearTimeout(snoozeTimeoutRef.current);
      snoozeTimeoutRef.current = null;
    }

    setState({
      activeAlarm: null,
      isRinging: false,
      snoozeCount: 0,
    });
  }, []);

  // Snooze the alarm
  const snoozeAlarm = useCallback(() => {
    const { activeAlarm, snoozeCount } = state;

    if (!activeAlarm) return;

    // Check max snoozes
    const maxSnoozes = activeAlarm.maxSnoozes || 3;
    if (snoozeCount >= maxSnoozes) {
      console.log('Max snoozes reached');
      return;
    }

    // Stop current sound
    alarmSound.stop();

    setState(prev => ({
      ...prev,
      isRinging: false,
      snoozeCount: prev.snoozeCount + 1,
    }));

    // Set timeout to trigger again
    const snoozeDuration = (activeAlarm.snoozeDurationMinutes || 9) * 60 * 1000;
    console.log(`Snoozing for ${activeAlarm.snoozeDurationMinutes || 9} minutes`);

    snoozeTimeoutRef.current = setTimeout(() => {
      if (state.activeAlarm) {
        triggerAlarm(state.activeAlarm);
      }
    }, snoozeDuration);
  }, [state, triggerAlarm]);

  // Test alarm sound
  const testSound = useCallback((soundType: string = 'gentle') => {
    alarmSound.stop();
    alarmSound.playOnce(soundType as any, 3000);
  }, []);

  // Stop test sound
  const stopSound = useCallback(() => {
    alarmSound.stop();
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Set up interval to check alarms every 30 seconds
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    checkAlarms();

    // Check every 30 seconds
    const intervalId = setInterval(checkAlarms, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, checkAlarms]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      alarmSound.stop();
      if (snoozeTimeoutRef.current) {
        clearTimeout(snoozeTimeoutRef.current);
      }
    };
  }, []);

  return {
    activeAlarm: state.activeAlarm,
    isRinging: state.isRinging,
    snoozeCount: state.snoozeCount,
    dismissAlarm,
    snoozeAlarm,
    testSound,
    stopSound,
  };
};

export default useAlarmScheduler;
