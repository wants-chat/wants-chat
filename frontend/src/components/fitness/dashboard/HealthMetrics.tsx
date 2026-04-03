import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Heart, Activity, Droplets, Moon } from 'lucide-react';

interface HealthMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
  min: number;
  max: number;
  optimal: { min: number; max: number };
}

interface HealthMetricsProps {
  metrics?: HealthMetric[];
}

const defaultMetrics: HealthMetric[] = [
  {
    id: 'heart-rate',
    label: 'Heart Rate',
    value: 72,
    unit: 'bpm',
    status: 'good',
    icon: Heart,
    min: 40,
    max: 120,
    optimal: { min: 60, max: 80 }
  },
  {
    id: 'blood-pressure',
    label: 'Blood Pressure',
    value: 120,
    unit: 'mmHg',
    status: 'good',
    icon: Activity,
    min: 90,
    max: 180,
    optimal: { min: 110, max: 130 }
  },
  {
    id: 'hydration',
    label: 'Hydration',
    value: 75,
    unit: '%',
    status: 'warning',
    icon: Droplets,
    min: 0,
    max: 100,
    optimal: { min: 80, max: 100 }
  },
  {
    id: 'sleep',
    label: 'Sleep Quality',
    value: 85,
    unit: '%',
    status: 'good',
    icon: Moon,
    min: 0,
    max: 100,
    optimal: { min: 75, max: 100 }
  }
];

const HealthMetrics: React.FC<HealthMetricsProps> = ({
  metrics = defaultMetrics
}) => {
  const getStatusColor = (status: HealthMetric['status']) => {
    switch (status) {
      case 'good': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200';
      case 'warning': return 'text-primary bg-primary/10 border-primary/20';
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getProgressColor = (status: HealthMetric['status']) => {
    switch (status) {
      case 'good': return 'bg-emerald-500';
      case 'warning': return 'bg-primary';
      case 'critical': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const calculateProgress = (metric: HealthMetric) => {
    const range = metric.max - metric.min;
    const progress = ((metric.value - metric.min) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const isInOptimalRange = (metric: HealthMetric) => {
    return metric.value >= metric.optimal.min && metric.value <= metric.optimal.max;
  };

  return (
    <Card className="p-6 bg-card border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Health Metrics</h3>
        <p className="text-sm text-muted-foreground">Track your vital health indicators</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const progress = calculateProgress(metric);
          const isOptimal = isInOptimalRange(metric);

          return (
            <div key={metric.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {metric.value} {metric.unit}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(metric.status)}`}
                >
                  {metric.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Progress 
                    value={progress} 
                    className="h-2"
                  />
                  {/* Optimal range indicator */}
                  <div 
                    className="absolute top-0 h-2 bg-emerald-500/30 dark:bg-emerald-500/20"
                    style={{
                      left: `${((metric.optimal.min - metric.min) / (metric.max - metric.min)) * 100}%`,
                      width: `${((metric.optimal.max - metric.optimal.min) / (metric.max - metric.min)) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{metric.min}</span>
                  <span className={isOptimal ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
                    Optimal: {metric.optimal.min}-{metric.optimal.max}
                  </span>
                  <span>{metric.max}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Health Tips</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Maintain a resting heart rate between 60-80 bpm for optimal cardiovascular health
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Drink at least 8 glasses of water daily to maintain proper hydration
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Aim for 7-9 hours of quality sleep each night for recovery
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HealthMetrics;