import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Bloodtype } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const bloodSugarTypes = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'before-meal', label: 'Before Meal' },
  { value: 'after-meal', label: 'After Meal (Postprandial)' },
  { value: 'random', label: 'Random' },
  { value: 'bedtime', label: 'Bedtime' }
];

const BloodSugarSection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bloodtype className="h-5 w-5 text-teal-400" />
          Blood Sugar
        </CardTitle>
        <CardDescription className="text-white/60">
          Normal fasting: 70-100 mg/dL | After meal: 80-140 mg/dL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="bloodSugar" className="text-sm font-semibold text-white/80">
              Blood Sugar Level
              {getStatusBadge('bloodSugar', formData.bloodSugar)}
            </Label>
            <Input
              id="bloodSugar"
              type="number"
              placeholder="95"
              value={formData.bloodSugar}
              onChange={(e) => handleInputChange('bloodSugar', e.target.value)}
              className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <Label htmlFor="bloodSugarType" className="text-sm font-semibold text-white/80">Measurement Type</Label>
            <Select
              value={formData.bloodSugarType}
              onValueChange={(value) => handleInputChange('bloodSugarType', value)}
            >
              <SelectTrigger id="bloodSugarType" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                {bloodSugarTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/10">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bloodSugarUnit" className="text-sm font-semibold text-white/80">Unit</Label>
            <Select
              value={formData.bloodSugarUnit}
              onValueChange={(value) => handleInputChange('bloodSugarUnit', value)}
            >
              <SelectTrigger id="bloodSugarUnit" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                <SelectItem value="mg/dL" className="text-white hover:bg-white/10">mg/dL</SelectItem>
                <SelectItem value="mmol/L" className="text-white hover:bg-white/10">mmol/L</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodSugarSection;
