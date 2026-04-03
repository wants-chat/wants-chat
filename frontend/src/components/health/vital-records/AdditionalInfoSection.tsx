import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { NoteAdd } from '@mui/icons-material';
import { VitalFormFieldProps } from '../../../types/health';

const AdditionalInfoSection: React.FC<VitalFormFieldProps> = ({
  formData,
  handleInputChange,
  errors,
  getStatusBadge
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <NoteAdd className="h-5 w-5 text-teal-400" />
          Additional Information
        </CardTitle>
        <CardDescription className="text-white/60">Optional details and notes about the measurements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="painLevel" className="text-sm font-semibold text-white/80">Pain Level (0-10)</Label>
            <Input
              id="painLevel"
              type="number"
              min="0"
              max="10"
              placeholder="0 = No pain, 10 = Severe pain"
              value={formData.painLevel}
              onChange={(e) => handleInputChange('painLevel', e.target.value)}
              className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <Label htmlFor="recordedBy" className="text-sm font-semibold text-white/80">Recorded By</Label>
            <Select
              value={formData.recordedBy}
              onValueChange={(value) => handleInputChange('recordedBy', value)}
            >
              <SelectTrigger id="recordedBy" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                <SelectItem value="self" className="text-white hover:bg-white/10">Self</SelectItem>
                <SelectItem value="family" className="text-white hover:bg-white/10">Family Member</SelectItem>
                <SelectItem value="caregiver" className="text-white hover:bg-white/10">Caregiver</SelectItem>
                <SelectItem value="nurse" className="text-white hover:bg-white/10">Nurse</SelectItem>
                <SelectItem value="doctor" className="text-white hover:bg-white/10">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="notes" className="text-sm font-semibold text-white/80">Notes</Label>
          <textarea
            id="notes"
            placeholder="Any additional notes, symptoms, or observations..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full min-h-[120px] px-4 py-3 border rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1 resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoSection;
