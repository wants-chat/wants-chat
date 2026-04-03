import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { FavoriteBorder as HeartIcon } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const bpPositions = [
  { value: 'sitting', label: 'Sitting' },
  { value: 'standing', label: 'Standing' },
  { value: 'lying', label: 'Lying Down' }
];

const BloodPressureSection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <HeartIcon className="h-5 w-5 text-teal-400" />
          Blood Pressure
        </CardTitle>
        <CardDescription className="text-white/60">
          Normal range: Less than 120/80 mmHg
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Label htmlFor="systolic" className="text-sm font-semibold text-white/80">
              Systolic (Top)
              {getStatusBadge('systolic', formData.systolic)}
            </Label>
            <div className="relative mt-1">
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                value={formData.systolic}
                onChange={(e) => handleInputChange('systolic', e.target.value)}
                className={`h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.systolic ? 'border-red-500' : ''}`}
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">mmHg</span>
            </div>
            {errors.systolic && (
              <p className="text-sm text-red-400 mt-1">{errors.systolic}</p>
            )}
          </div>
          <div>
            <Label htmlFor="diastolic" className="text-sm font-semibold text-white/80">
              Diastolic (Bottom)
              {getStatusBadge('diastolic', formData.diastolic)}
            </Label>
            <div className="relative mt-1">
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={formData.diastolic}
                onChange={(e) => handleInputChange('diastolic', e.target.value)}
                className={`h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.diastolic ? 'border-red-500' : ''}`}
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">mmHg</span>
            </div>
            {errors.diastolic && (
              <p className="text-sm text-red-400 mt-1">{errors.diastolic}</p>
            )}
          </div>
          <div>
            <Label htmlFor="bpPosition" className="text-sm font-semibold text-white/80">Position</Label>
            <Select
              value={formData.bpPosition}
              onValueChange={(value) => handleInputChange('bpPosition', value)}
            >
              <SelectTrigger id="bpPosition" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                {bpPositions.map(pos => (
                  <SelectItem key={pos.value} value={pos.value} className="text-white hover:bg-white/10">
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bpArm" className="text-sm font-semibold text-white/80">Arm</Label>
            <Select
              value={formData.bpArm}
              onValueChange={(value) => handleInputChange('bpArm', value)}
            >
              <SelectTrigger id="bpArm" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                <SelectItem value="left" className="text-white hover:bg-white/10">Left Arm</SelectItem>
                <SelectItem value="right" className="text-white hover:bg-white/10">Right Arm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodPressureSection;
