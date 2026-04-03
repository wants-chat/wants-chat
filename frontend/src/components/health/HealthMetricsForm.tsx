import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateHealthMetric } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, Activity, Heart, Thermometer } from 'lucide-react';
import { toast } from '../ui/toast';

interface HealthMetricFormData {
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'temperature' | 'bmi' | 'body_fat';
  value: number | string;
  systolic?: number;
  diastolic?: number;
  unit: string;
  recordedAt: string;
  notes?: string;
}

const HealthMetricsForm: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<HealthMetricFormData>();
  const createHealthMetric = useCreateHealthMetric();

  const metricTypes = [
    { value: 'weight', label: 'Weight', icon: '⚖️', unit: 'kg' },
    { value: 'blood_pressure', label: 'Blood Pressure', icon: '🩺', unit: 'mmHg' },
    { value: 'heart_rate', label: 'Heart Rate', icon: '❤️', unit: 'bpm' },
    { value: 'blood_sugar', label: 'Blood Sugar', icon: '🩸', unit: 'mg/dL' },
    { value: 'temperature', label: 'Temperature', icon: '🌡️', unit: '°C' },
    { value: 'bmi', label: 'BMI', icon: '📏', unit: 'kg/m²' },
    { value: 'body_fat', label: 'Body Fat', icon: '📊', unit: '%' }
  ];

  const selectedMetric = metricTypes.find(type => type.value === selectedType);

  const onSubmit = async (data: HealthMetricFormData) => {
    try {
      let metricValue: number | { systolic: number; diastolic: number };
      
      if (data.type === 'blood_pressure') {
        metricValue = {
          systolic: data.systolic!,
          diastolic: data.diastolic!
        };
      } else {
        metricValue = parseFloat(data.value as string);
      }

      await createHealthMetric.mutateAsync({
        type: data.type,
        value: metricValue,
        unit: selectedMetric?.unit || '',
        recordedAt: new Date(data.recordedAt),
        notes: data.notes
      });

      toast.success(`${selectedMetric?.label} recorded successfully!`);
      reset();
      setSelectedType('');
    } catch (error) {
      toast.error('Failed to record health metric. Please try again.');
      console.error('Error creating health metric:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Record Health Metric
        </CardTitle>
        <CardDescription>
          Track your vital signs and health measurements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Metric Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Metric Type</Label>
            <Select 
              value={selectedType} 
              onValueChange={(value) => {
                setSelectedType(value);
                setValue('type', value as any);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a health metric to record" />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                      <span className="text-sm text-muted-foreground">({type.unit})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">Please select a metric type</p>
            )}
          </div>

          {selectedType && (
            <>
              {/* Value Input(s) */}
              <div className="space-y-4">
                {selectedType === 'blood_pressure' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systolic">Systolic (mmHg)</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        {...register('systolic', { 
                          required: 'Systolic pressure is required',
                          min: { value: 60, message: 'Value must be at least 60' },
                          max: { value: 250, message: 'Value must be less than 250' }
                        })}
                      />
                      {errors.systolic && (
                        <p className="text-sm text-destructive">{errors.systolic.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        {...register('diastolic', { 
                          required: 'Diastolic pressure is required',
                          min: { value: 40, message: 'Value must be at least 40' },
                          max: { value: 150, message: 'Value must be less than 150' }
                        })}
                      />
                      {errors.diastolic && (
                        <p className="text-sm text-destructive">{errors.diastolic.message}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      Value ({selectedMetric?.unit})
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.1"
                      placeholder={
                        selectedType === 'weight' ? '70.5' :
                        selectedType === 'heart_rate' ? '72' :
                        selectedType === 'blood_sugar' ? '100' :
                        selectedType === 'temperature' ? '36.5' :
                        selectedType === 'bmi' ? '22.5' :
                        selectedType === 'body_fat' ? '15.0' : '0'
                      }
                      {...register('value', { 
                        required: 'Value is required',
                        min: { value: 0.1, message: 'Value must be greater than 0' }
                      })}
                    />
                    {errors.value && (
                      <p className="text-sm text-destructive">{errors.value.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Date/Time */}
              <div className="space-y-2">
                <Label htmlFor="recordedAt">Date & Time</Label>
                <Input
                  id="recordedAt"
                  type="datetime-local"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  {...register('recordedAt', { required: 'Date and time is required' })}
                />
                {errors.recordedAt && (
                  <p className="text-sm text-destructive">{errors.recordedAt.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this measurement..."
                  rows={3}
                  {...register('notes')}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={createHealthMetric.loading}
              >
                {createHealthMetric.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Record {selectedMetric?.label}
                  </>
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsForm;