import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  Heart,
  Brain,
  Zap,
  Shield,
  Moon,
  Eye,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { toast } from '../ui/sonner';

interface MoodTrackerProps {
  sessionId?: string;
  initialMood?: {
    mood?: number;
    energy?: number;
    stress?: number;
    anxiety?: number;
    sleep?: number;
    focus?: number;
  };
  onComplete?: (moodData: any) => void;
  variant?: 'full' | 'simple' | 'post-session';
  title?: string;
}

interface MoodData {
  mood: number;
  energy: number;
  stress: number;
  anxiety: number;
  sleep: number;
  focus: number;
  gratitude: string[];
  notes: string;
  triggers: string[];
  activities: string[];
}

const MoodTracker: React.FC<MoodTrackerProps> = ({
  sessionId,
  initialMood,
  onComplete,
  variant = 'full',
  title = 'How are you feeling today?'
}) => {
  const [moodData, setMoodData] = useState<MoodData>({
    mood: initialMood?.mood || 5,
    energy: initialMood?.energy || 5,
    stress: initialMood?.stress || 5,
    anxiety: initialMood?.anxiety || 5,
    sleep: initialMood?.sleep || 5,
    focus: initialMood?.focus || 5,
    gratitude: [],
    notes: '',
    triggers: [],
    activities: []
  });

  const [gratitudeInput, setGratitudeInput] = useState('');
  const [triggerInput, setTriggerInput] = useState('');
  const [activityInput, setActivityInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const moodEmojis: Record<number, string> = {
    1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😊',
    6: '😄', 7: '😁', 8: '🤩', 9: '🥳', 10: '🌟'
  };

  const energyEmojis = {
    1: '😴', 2: '🥱', 3: '😐', 4: '🙂', 5: '😊',
    6: '💪', 7: '⚡', 8: '🔥', 9: '🚀', 10: '⭐'
  };

  const stressEmojis = {
    1: '😌', 2: '🙂', 3: '😐', 4: '😬', 5: '😰',
    6: '😨', 7: '😱', 8: '🤯', 9: '💥', 10: '🔥'
  };

  const anxietyEmojis = {
    1: '😌', 2: '🙂', 3: '😐', 4: '😬', 5: '😰',
    6: '😨', 7: '😱', 8: '🤯', 9: '💥', 10: '🌊'
  };

  const sleepEmojis = {
    1: '😵', 2: '🥱', 3: '😴', 4: '😐', 5: '🙂',
    6: '😊', 7: '✨', 8: '🌟', 9: '💤', 10: '🛌'
  };

  const focusEmojis = {
    1: '🤯', 2: '😵‍💫', 3: '😐', 4: '🤔', 5: '🙂',
    6: '🎯', 7: '🧠', 8: '⚡', 9: '🔥', 10: '💡'
  };

  const commonTriggers = [
    'Work stress', 'Relationship issues', 'Financial concerns', 'Health worries',
    'Social situations', 'Traffic', 'News/media', 'Weather', 'Sleep issues', 'Technology'
  ];

  const commonActivities = [
    'Exercise', 'Reading', 'Music', 'Cooking', 'Walking', 'Social time',
    'Work', 'Learning', 'Creating', 'Gaming', 'Nature', 'Meditation'
  ];

  const ScaleSelector = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon, 
    emojis, 
    lowLabel, 
    highLabel 
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: any;
    emojis: Record<number, string>;
    lowLabel: string;
    highLabel: string;
  }) => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-medium">{label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {value}/10 {emojis[value]}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">{lowLabel}</span>
          <div className="flex-1 px-2">
            <input
              type="range"
              min="1"
              max="10"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(value - 1) * 11.11}%, hsl(var(--secondary)) ${(value - 1) * 11.11}%, hsl(var(--secondary)) 100%)`
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-16 text-right">{highLabel}</span>
        </div>
      </div>
    </Card>
  );

  const addGratitude = () => {
    if (gratitudeInput.trim() && moodData.gratitude.length < 5) {
      setMoodData(prev => ({
        ...prev,
        gratitude: [...prev.gratitude, gratitudeInput.trim()]
      }));
      setGratitudeInput('');
    }
  };

  const removeGratitude = (index: number) => {
    setMoodData(prev => ({
      ...prev,
      gratitude: prev.gratitude.filter((_, i) => i !== index)
    }));
  };

  const addTrigger = (trigger: string) => {
    if (!moodData.triggers.includes(trigger)) {
      setMoodData(prev => ({
        ...prev,
        triggers: [...prev.triggers, trigger]
      }));
    }
  };

  const removeTrigger = (trigger: string) => {
    setMoodData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const addActivity = (activity: string) => {
    if (!moodData.activities.includes(activity)) {
      setMoodData(prev => ({
        ...prev,
        activities: [...prev.activities, activity]
      }));
    }
  };

  const removeActivity = (activity: string) => {
    setMoodData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== activity)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would typically call your API to save the mood data
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Mood logged successfully!", {
        description: "Your emotional state has been recorded.",
      });

      if (onComplete) {
        onComplete({
          ...moodData,
          date: new Date(),
          sessionId
        });
      }
    } catch (error) {
      console.error('Failed to save mood data:', error);
      toast.error("Failed to save mood", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'simple') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
            <Button
              key={mood}
              variant={moodData.mood === mood ? "default" : "outline"}
              size="sm"
              onClick={() => setMoodData(prev => ({ ...prev, mood }))}
              className="h-12 text-lg"
            >
              {moodEmojis[mood]}
            </Button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <span>😢 Terrible</span>
          <span>🌟 Amazing</span>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Log Mood
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">
          Track your emotional well-being and identify patterns over time
        </p>
      </div>

      {/* Mood Scales */}
      <div className="grid gap-4 md:grid-cols-2">
        <ScaleSelector
          label="Overall Mood"
          value={moodData.mood}
          onChange={(value) => setMoodData(prev => ({ ...prev, mood: value }))}
          icon={Heart}
          emojis={moodEmojis}
          lowLabel="Terrible"
          highLabel="Amazing"
        />

        <ScaleSelector
          label="Energy Level"
          value={moodData.energy}
          onChange={(value) => setMoodData(prev => ({ ...prev, energy: value }))}
          icon={Zap}
          emojis={energyEmojis}
          lowLabel="Exhausted"
          highLabel="Energized"
        />

        <ScaleSelector
          label="Stress Level"
          value={moodData.stress}
          onChange={(value) => setMoodData(prev => ({ ...prev, stress: value }))}
          icon={Shield}
          emojis={stressEmojis}
          lowLabel="Calm"
          highLabel="Overwhelmed"
        />

        <ScaleSelector
          label="Anxiety Level"
          value={moodData.anxiety}
          onChange={(value) => setMoodData(prev => ({ ...prev, anxiety: value }))}
          icon={Brain}
          emojis={anxietyEmojis}
          lowLabel="Peaceful"
          highLabel="Anxious"
        />

        <ScaleSelector
          label="Sleep Quality"
          value={moodData.sleep}
          onChange={(value) => setMoodData(prev => ({ ...prev, sleep: value }))}
          icon={Moon}
          emojis={sleepEmojis}
          lowLabel="Terrible"
          highLabel="Perfect"
        />

        <ScaleSelector
          label="Focus & Clarity"
          value={moodData.focus}
          onChange={(value) => setMoodData(prev => ({ ...prev, focus: value }))}
          icon={Eye}
          emojis={focusEmojis}
          lowLabel="Scattered"
          highLabel="Sharp"
        />
      </div>

      {/* Gratitude */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          What are you grateful for today?
        </h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={gratitudeInput}
              onChange={(e) => setGratitudeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGratitude()}
              placeholder="I'm grateful for..."
              className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
            <Button onClick={addGratitude} size="sm" disabled={!gratitudeInput.trim() || moodData.gratitude.length >= 5}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {moodData.gratitude.map((item, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {item}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeGratitude(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Triggers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stress Triggers</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {commonTriggers.map((trigger) => (
              <Badge
                key={trigger}
                variant={moodData.triggers.includes(trigger) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => 
                  moodData.triggers.includes(trigger) 
                    ? removeTrigger(trigger)
                    : addTrigger(trigger)
                }
              >
                {trigger}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={triggerInput}
              onChange={(e) => setTriggerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && triggerInput.trim() && addTrigger(triggerInput.trim())}
              placeholder="Add custom trigger..."
              className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <Button 
              onClick={() => {
                if (triggerInput.trim()) {
                  addTrigger(triggerInput.trim());
                  setTriggerInput('');
                }
              }} 
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Activities</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {commonActivities.map((activity) => (
              <Badge
                key={activity}
                variant={moodData.activities.includes(activity) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => 
                  moodData.activities.includes(activity) 
                    ? removeActivity(activity)
                    : addActivity(activity)
                }
              >
                {activity}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && activityInput.trim() && addActivity(activityInput.trim())}
              placeholder="Add custom activity..."
              className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <Button 
              onClick={() => {
                if (activityInput.trim()) {
                  addActivity(activityInput.trim());
                  setActivityInput('');
                }
              }} 
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
        <Textarea
          value={moodData.notes}
          onChange={(e) => setMoodData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="How are you feeling? What's on your mind? Any insights or thoughts you'd like to record..."
          className="min-h-24 resize-none"
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground mt-2 text-right">
          {moodData.notes.length}/500 characters
        </div>
      </Card>

      {/* Submit */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            This information will help track your mental health patterns over time
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="px-8">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Mood Log
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MoodTracker;