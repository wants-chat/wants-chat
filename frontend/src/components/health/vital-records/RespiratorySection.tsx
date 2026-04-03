import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Opacity } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const RespiratorySection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Opacity className="h-5 w-5 text-teal-400" />
          Respiratory
        </CardTitle>
        <CardDescription className="text-white/60">
          Normal SpO2: 95-100% | Normal respiratory rate: 12-20 breaths/min
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="respiratoryRate" className="text-sm font-semibold text-white/80">
              Respiratory Rate
              {getStatusBadge('respiratoryRate', formData.respiratoryRate)}
            </Label>
            <div className="relative mt-1">
              <Input
                id="respiratoryRate"
                type="number"
                placeholder="16"
                value={formData.respiratoryRate}
                onChange={(e) => handleInputChange('respiratoryRate', e.target.value)}
                className="h-12 rounded-xl pr-28 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">breaths/min</span>
            </div>
          </div>
          <div>
            <Label htmlFor="oxygenSaturation" className="text-sm font-semibold text-white/80">
              Oxygen Saturation (SpO2)
              {getStatusBadge('oxygenSaturation', formData.oxygenSaturation)}
            </Label>
            <div className="relative mt-1">
              <Input
                id="oxygenSaturation"
                type="number"
                placeholder="98"
                value={formData.oxygenSaturation}
                onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
                className="h-12 rounded-xl pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">%</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4 p-4 bg-white/10 border border-white/20 rounded-xl">
              <input
                type="checkbox"
                id="onOxygen"
                checked={formData.onOxygen}
                onChange={(e) => handleInputChange('onOxygen', e.target.checked)}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'rgb(71, 189, 255)' }}
              />
              <Label htmlFor="onOxygen" className="cursor-pointer text-sm font-semibold text-white/80">
                Currently on supplemental oxygen
              </Label>
            </div>
            {formData.onOxygen && (
              <div>
                <Label htmlFor="oxygenFlow" className="text-sm font-semibold text-white/80">
                  Oxygen Flow Rate <span className="text-red-400">*</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="oxygenFlow"
                    type="number"
                    step="0.5"
                    placeholder="2"
                    value={formData.oxygenFlow}
                    onChange={(e) => handleInputChange('oxygenFlow', e.target.value)}
                    className={`h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.oxygenFlow ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute right-4 top-3.5 text-sm text-white/50">L/min</span>
                </div>
                {errors.oxygenFlow && (
                  <p className="text-sm text-red-400 mt-1">{errors.oxygenFlow}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RespiratorySection;
