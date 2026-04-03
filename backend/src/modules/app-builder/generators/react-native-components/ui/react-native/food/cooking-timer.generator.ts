import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

/**
 * React Native Cooking Timer Component Generator
 *
 * Generates a multi-timer management system showing:
 * - Quick timer presets (5, 10, 15, 20, 30 minutes)
 * - Custom timer creation
 * - Multiple simultaneous timers
 * - Visual countdown with progress circle
 * - Sound/vibration notifications
 * - Pause/resume/stop controls
 */

export function generateRNCookingTimer(
  resolved: ResolvedComponent,
  variant: string = 'standard'
): { code: string; imports: string[] } {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'timers';

  const code = `import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Vibration, ActivityIndicator } from 'react-native';

interface Timer {
  id: string;
  name: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface CookingTimerProps {
  timers?: any;
  timer?: any;
  data?: any;
  onTimerComplete?: (timerId: string) => void;
  [key: string]: any;
}

export default function CookingTimer({ timers: timersProp, timer, data: propData, onTimerComplete, ...props }: CookingTimerProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState('10');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Quick preset timers (in minutes)
  const presets = [5, 10, 15, 20, 30];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (propData || timersProp || timer) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || timersProp || timer || fetchedData || {};

  useEffect(() => {
    // Timer tick every second
    intervalRef.current = setInterval(() => {
      setTimers(prevTimers => {
        return prevTimers.map(timer => {
          if (timer.isRunning && !timer.isPaused && timer.remainingSeconds > 0) {
            const newRemaining = timer.remainingSeconds - 1;

            // Timer completed
            if (newRemaining === 0) {
              Vibration.vibrate([0, 500, 200, 500]);
              if (onTimerComplete) {
                onTimerComplete(timer.id);
              }
              return { ...timer, remainingSeconds: 0, isRunning: false };
            }

            return { ...timer, remainingSeconds: newRemaining };
          }
          return timer;
        });
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onTimerComplete]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return \`\${hrs}:\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
    }
    return \`\${mins}:\${String(secs).padStart(2, '0')}\`;
  };

  const addTimer = (name: string, minutes: number) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      name: name || \`Timer \${timers.length + 1}\`,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true,
      isPaused: false,
    };
    setTimers([...timers, newTimer]);
  };

  const handleQuickTimer = (minutes: number) => {
    addTimer(\`\${minutes} min timer\`, minutes);
  };

  const handleAddCustomTimer = () => {
    const minutes = parseInt(newTimerMinutes) || 10;
    addTimer(newTimerName, minutes);
    setShowAddModal(false);
    setNewTimerName('');
    setNewTimerMinutes('10');
  };

  const togglePause = (timerId: string) => {
    setTimers(timers.map(t =>
      t.id === timerId ? { ...t, isPaused: !t.isPaused } : t
    ));
  };

  const stopTimer = (timerId: string) => {
    setTimers(timers.filter(t => t.id !== timerId));
  };

  const resetTimer = (timerId: string) => {
    setTimers(timers.map(t =>
      t.id === timerId
        ? { ...t, remainingSeconds: t.totalSeconds, isRunning: true, isPaused: false }
        : t
    ));
  };

  const getProgressPercentage = (timer: Timer): number => {
    return ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading timers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cooking Timers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Presets */}
      <View style={styles.presetsSection}>
        <Text style={styles.presetsTitle}>Quick Start</Text>
        <View style={styles.presetsGrid}>
          {presets.map(minutes => (
            <TouchableOpacity
              key={minutes}
              style={styles.presetButton}
              onPress={() => handleQuickTimer(minutes)}
            >
              <Text style={styles.presetIcon}>⏱️</Text>
              <Text style={styles.presetText}>{minutes} min</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Timers */}
      <ScrollView style={styles.timersScroll}>
        {timers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyTitle}>No active timers</Text>
            <Text style={styles.emptyText}>
              Start a quick timer or create a custom one
            </Text>
          </View>
        ) : (
          timers.map(timer => {
            const progress = getProgressPercentage(timer);
            const isCompleted = timer.remainingSeconds === 0;

            return (
              <View
                key={timer.id}
                style={[
                  styles.timerCard,
                  isCompleted && styles.timerCardCompleted
                ]}
              >
                {/* Timer Info */}
                <View style={styles.timerHeader}>
                  <Text style={styles.timerName}>{timer.name}</Text>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓ Done</Text>
                    </View>
                  )}
                </View>

                {/* Circular Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressCircle}>
                    {/* This would use SVG or react-native-svg in production */}
                    <View style={styles.progressInner}>
                      <Text style={[
                        styles.timeDisplay,
                        isCompleted && styles.timeDisplayCompleted
                      ]}>
                        {formatTime(timer.remainingSeconds)}
                      </Text>
                      <Text style={styles.timeTotal}>
                        / {formatTime(timer.totalSeconds)}
                      </Text>
                    </View>
                  </View>

                  {/* Linear Progress Bar */}
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: \`\${progress}%\`,
                          backgroundColor: isCompleted ? '#10b981' : '#6366f1'
                        }
                      ]}
                    />
                  </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                  {!isCompleted ? (
                    <>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => togglePause(timer.id)}
                      >
                        <Text style={styles.controlIcon}>
                          {timer.isPaused ? '▶️' : '⏸️'}
                        </Text>
                        <Text style={styles.controlText}>
                          {timer.isPaused ? 'Resume' : 'Pause'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => resetTimer(timer.id)}
                      >
                        <Text style={styles.controlIcon}>🔄</Text>
                        <Text style={styles.controlText}>Reset</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.controlButton, styles.stopButton]}
                        onPress={() => stopTimer(timer.id)}
                      >
                        <Text style={styles.controlIcon}>⏹️</Text>
                        <Text style={[styles.controlText, styles.stopText]}>
                          Stop
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.controlButton, styles.removeButton]}
                      onPress={() => stopTimer(timer.id)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Custom Timer Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Timer</Text>

            <Text style={styles.inputLabel}>Timer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Boil eggs"
              value={newTimerName}
              onChangeText={setNewTimerName}
            />

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              keyboardType="number-pad"
              value={newTimerMinutes}
              onChangeText={setNewTimerMinutes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalAddButton]}
                onPress={handleAddCustomTimer}
              >
                <Text style={styles.modalAddText}>Add Timer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  presetsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  presetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timersScroll: {
    flex: 1,
    padding: 16,
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  timerCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInner: {
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366f1',
  },
  timeDisplayCompleted: {
    color: '#10b981',
  },
  timeTotal: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  controlIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  controlText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  stopButton: {
    backgroundColor: '#fef2f2',
  },
  stopText: {
    color: '#dc2626',
  },
  removeButton: {
    backgroundColor: '#e5e7eb',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalAddButton: {
    backgroundColor: '#6366f1',
  },
  modalAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`;

  return {
    code,
    imports: []
  };
}
