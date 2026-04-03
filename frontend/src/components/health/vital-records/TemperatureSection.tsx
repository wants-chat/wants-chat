import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Thermostat } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const temperatureLocations = [
  { value: 'oral', label: 'Oral' },
  { value: 'ear', label: 'Ear (Tympanic)' },
  { value: 'forehead', label: 'Forehead (Temporal)' },
  { value: 'armpit', label: 'Armpit (Axillary)' },
  { value: 'rectal', label: 'Rectal' }
];

const TemperatureSection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Thermostat className="h-5 w-5 text-teal-400" />
          Body Temperature
        </CardTitle>
        <CardDescription className="text-white/60">
          Normal range: 97.8-99.1°F (36.5-37.3°C)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="temperature" className="text-sm font-semibold text-white/80">
              Temperature
              {getStatusBadge('temperature', formData.temperature)}
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="98.6"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <Label htmlFor="temperatureUnit" className="text-sm font-semibold text-white/80">Unit</Label>
            <Select
              value={formData.temperatureUnit}
              onValueChange={(value) => handleInputChange('temperatureUnit', value)}
            >
              <SelectTrigger id="temperatureUnit" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                <SelectItem value="fahrenheit" className="text-white hover:bg-white/10">°F (Fahrenheit)</SelectItem>
                <SelectItem value="celsius" className="text-white hover:bg-white/10">°C (Celsius)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="temperatureLocation" className="text-sm font-semibold text-white/80">Location</Label>
            <Select
              value={formData.temperatureLocation}
              onValueChange={(value) => handleInputChange('temperatureLocation', value)}
            >
              <SelectTrigger id="temperatureLocation" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                {temperatureLocations.map(loc => (
                  <SelectItem key={loc.value} value={loc.value} className="text-white hover:bg-white/10">
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureSection;
