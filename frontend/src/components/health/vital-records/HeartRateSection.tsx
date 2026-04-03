import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Timeline as ActivityIcon } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const HeartRateSection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <ActivityIcon className="h-5 w-5 text-teal-400" />
          Heart Rate
        </CardTitle>
        <CardDescription className="text-white/60">
          Normal resting heart rate: 60-100 beats per minute
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="heartRate" className="text-sm font-semibold text-white/80">
              Heart Rate
              {getStatusBadge('heartRate', formData.heartRate)}
            </Label>
            <div className="relative mt-1">
              <Input
                id="heartRate"
                type="number"
                placeholder="72"
                value={formData.heartRate}
                onChange={(e) => handleInputChange('heartRate', e.target.value)}
                className="h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">bpm</span>
            </div>
          </div>
          <div>
            <Label htmlFor="heartRhythm" className="text-sm font-semibold text-white/80">Rhythm</Label>
            <Select
              value={formData.heartRhythm}
              onValueChange={(value) => handleInputChange('heartRhythm', value)}
            >
              <SelectTrigger id="heartRhythm" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                <SelectItem value="regular" className="text-white hover:bg-white/10">Regular</SelectItem>
                <SelectItem value="irregular" className="text-white hover:bg-white/10">Irregular</SelectItem>
                <SelectItem value="fast" className="text-white hover:bg-white/10">Fast (Tachycardia)</SelectItem>
                <SelectItem value="slow" className="text-white hover:bg-white/10">Slow (Bradycardia)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeartRateSection;
