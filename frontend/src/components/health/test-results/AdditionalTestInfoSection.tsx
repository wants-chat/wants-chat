import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Assessment as AnalysisIcon, CalendarToday as Calendar } from '@mui/icons-material';
import { TestResultFormProps } from '../../../types/health';

const AdditionalTestInfoSection: React.FC<TestResultFormProps> = ({
  formData,
  handleInputChange,
  errors
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-primary/5 dark:from-gray-800 dark:via-gray-800 dark:to-primary/10 border-l-4 border-primary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <AnalysisIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
          Additional Information
        </CardTitle>
        <CardDescription>
          Clinical interpretation, notes, and follow-up requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="interpretation" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Clinical Interpretation
          </Label>
          <textarea
            id="interpretation"
            placeholder="Doctor's interpretation or summary of results..."
            value={formData.interpretation}
            onChange={(e) => handleInputChange('interpretation', e.target.value)}
            className="w-full min-h-[120px] px-4 py-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 mt-1 resize-none"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Additional Notes
          </Label>
          <textarea
            id="notes"
            placeholder="Any additional notes or observations..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full min-h-[120px] px-4 py-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 mt-1 resize-none"
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <input
              type="checkbox"
              id="followUpRequired"
              checked={formData.followUpRequired}
              onChange={(e) => handleInputChange('followUpRequired', e.target.checked)}
              className="w-5 h-5 rounded"
              style={{ accentColor: 'rgb(71, 189, 255)' }}
            />
            <Label htmlFor="followUpRequired" className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
              Follow-up required
            </Label>
          </div>

          {formData.followUpRequired && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
              <div>
                <Label htmlFor="followUpDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Follow-up Date
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                    className="pl-12 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nextTestDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Next Test Date
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="nextTestDate"
                    type="date"
                    value={formData.nextTestDate}
                    onChange={(e) => handleInputChange('nextTestDate', e.target.value)}
                    className="pl-12 h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalTestInfoSection;
