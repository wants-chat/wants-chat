import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { MonitorWeight as Scale } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const WeightBMISection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Scale className="h-5 w-5 text-teal-400" />
          Weight & BMI
        </CardTitle>
        <CardDescription className="text-white/60">
          Normal BMI range: 18.5-24.9 kg/m²
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="weight" className="text-sm font-semibold text-white/80">Weight</Label>
            <div className="flex gap-3 mt-1">
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Select
                value={formData.weightUnit}
                onValueChange={(value) => handleInputChange('weightUnit', value)}
              >
                <SelectTrigger className="w-24 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                  <SelectItem value="kg" className="text-white hover:bg-white/10">kg</SelectItem>
                  <SelectItem value="lbs" className="text-white hover:bg-white/10">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="height" className="text-sm font-semibold text-white/80">Height</Label>
            <div className="flex gap-3 mt-1">
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="170"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Select
                value={formData.heightUnit}
                onValueChange={(value) => handleInputChange('heightUnit', value)}
              >
                <SelectTrigger className="w-24 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                  <SelectItem value="cm" className="text-white hover:bg-white/10">cm</SelectItem>
                  <SelectItem value="ft" className="text-white hover:bg-white/10">ft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {formData.bmi && (
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold text-white/80">
                Calculated BMI
                {getStatusBadge('bmi', formData.bmi)}
              </Label>
              <div className="p-4 bg-white/10 border border-white/20 rounded-xl mt-1">
                <span className="text-3xl font-bold text-white">{formData.bmi}</span>
                <span className="ml-2 text-white/60">kg/m²</span>
                <div className="mt-2 text-sm text-white/60">
                  {parseFloat(formData.bmi) < 18.5 && 'Underweight'}
                  {parseFloat(formData.bmi) >= 18.5 && parseFloat(formData.bmi) < 25 && 'Normal weight'}
                  {parseFloat(formData.bmi) >= 25 && parseFloat(formData.bmi) < 30 && 'Overweight'}
                  {parseFloat(formData.bmi) >= 30 && 'Obese'}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightBMISection;
