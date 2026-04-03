import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Science } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const CholesterolSection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Science className="h-5 w-5 text-teal-400" />
          Cholesterol Levels
        </CardTitle>
        <CardDescription className="text-white/60">
          Total: &lt;200 | LDL: &lt;100 | HDL: &gt;40 | Triglycerides: &lt;150 mg/dL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="totalCholesterol" className="text-sm font-semibold text-white/80">Total Cholesterol</Label>
            <div className="relative mt-1">
              <Input
                id="totalCholesterol"
                type="number"
                placeholder="180"
                value={formData.totalCholesterol}
                onChange={(e) => handleInputChange('totalCholesterol', e.target.value)}
                className="h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">mg/dL</span>
            </div>
          </div>
          <div>
            <Label htmlFor="ldlCholesterol" className="text-sm font-semibold text-white/80">LDL (Bad) Cholesterol</Label>
            <div className="relative mt-1">
              <Input
                id="ldlCholesterol"
                type="number"
                placeholder="95"
                value={formData.ldlCholesterol}
                onChange={(e) => handleInputChange('ldlCholesterol', e.target.value)}
                className="h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">mg/dL</span>
            </div>
          </div>
          <div>
            <Label htmlFor="hdlCholesterol" className="text-sm font-semibold text-white/80">HDL (Good) Cholesterol</Label>
            <div className="relative mt-1">
              <Input
                id="hdlCholesterol"
                type="number"
                placeholder="55"
                value={formData.hdlCholesterol}
                onChange={(e) => handleInputChange('hdlCholesterol', e.target.value)}
                className="h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">mg/dL</span>
            </div>
          </div>
          <div>
            <Label htmlFor="triglycerides" className="text-sm font-semibold text-white/80">Triglycerides</Label>
            <div className="relative mt-1">
              <Input
                id="triglycerides"
                type="number"
                placeholder="120"
                value={formData.triglycerides}
                onChange={(e) => handleInputChange('triglycerides', e.target.value)}
                className="h-12 rounded-xl pr-16 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <span className="absolute right-4 top-3.5 text-sm text-white/50">mg/dL</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CholesterolSection;
