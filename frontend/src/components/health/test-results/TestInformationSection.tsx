import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { AssignmentTurnedIn as TestIcon, CalendarToday as Calendar } from '@mui/icons-material';
import { TestResultFormProps } from '../../../types/health';

const testTypes = [
  { value: 'blood_test', label: 'Blood Test' },
  { value: 'urine_test', label: 'Urine Test' },
  { value: 'imaging', label: 'Imaging (X-Ray, MRI, CT)' },
  { value: 'cardiac', label: 'Cardiac Test' },
  { value: 'pulmonary', label: 'Pulmonary Function' },
  { value: 'neurological', label: 'Neurological Test' },
  { value: 'endocrine', label: 'Endocrine/Hormonal Test' },
  { value: 'genetic', label: 'Genetic Test' },
  { value: 'allergy', label: 'Allergy Test' },
  { value: 'cancer_screening', label: 'Cancer Screening' },
  { value: 'infectious_disease', label: 'Infectious Disease' },
  { value: 'vitamin_mineral', label: 'Vitamin & Mineral Test' }
];

const collectionMethods = [
  { value: 'venipuncture', label: 'Venipuncture (Blood Draw)' },
  { value: 'fingerstick', label: 'Finger Stick' },
  { value: 'urine', label: 'Urine Sample' },
  { value: 'swab', label: 'Swab' },
  { value: 'biopsy', label: 'Biopsy' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'other', label: 'Other' }
];

const urgencyLevels = [
  { value: 'stat', label: 'STAT (Emergency)' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'routine', label: 'Routine' },
  { value: 'scheduled', label: 'Scheduled' }
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'abnormal', label: 'Abnormal - Review Required' },
  { value: 'critical', label: 'Critical - Immediate Action' }
];

const TestInformationSection: React.FC<TestResultFormProps> = ({
  formData,
  handleInputChange,
  errors
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-primary/5 dark:from-gray-800 dark:via-gray-800 dark:to-primary/10 border-l-4 border-primary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TestIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
          Test Information
        </CardTitle>
        <CardDescription>
          Enter basic information about the medical test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="testName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Test Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="testName"
                placeholder="e.g., Complete Blood Count (CBC)"
                value={formData.testName}
                onChange={(e) => handleInputChange('testName', e.target.value)}
                className={`mt-1 h-12 rounded-xl ${errors.testName ? 'border-red-500' : ''}`}
              />
              {errors.testName && (
                <p className="text-sm text-red-500 mt-1">{errors.testName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="testType" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Test Type
              </Label>
              <Select
                value={formData.testType}
                onValueChange={(value) => handleInputChange('testType', value)}
              >
                <SelectTrigger id="testType" className="mt-1 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportNumber" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Report/Reference Number
              </Label>
              <Input
                id="reportNumber"
                placeholder="e.g., LAB-2024-001234"
                value={formData.reportNumber}
                onChange={(e) => handleInputChange('reportNumber', e.target.value)}
                className="mt-1 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="collectionMethod" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Collection Method
              </Label>
              <Select
                value={formData.collectionMethod}
                onValueChange={(value) => handleInputChange('collectionMethod', value)}
              >
                <SelectTrigger id="collectionMethod" className="mt-1 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {collectionMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Test Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="testDate"
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => handleInputChange('testDate', e.target.value)}
                    className={`pl-12 h-12 rounded-xl ${errors.testDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.testDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.testDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="resultDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Result Date
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="resultDate"
                    type="date"
                    value={formData.resultDate}
                    onChange={(e) => handleInputChange('resultDate', e.target.value)}
                    className="pl-12 h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="urgency" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Urgency Level
              </Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => handleInputChange('urgency', value)}
              >
                <SelectTrigger id="urgency" className="mt-1 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger id="status" className="mt-1 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <input
                type="checkbox"
                id="fastingRequired"
                checked={formData.fastingRequired}
                onChange={(e) => handleInputChange('fastingRequired', e.target.checked)}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'rgb(71, 189, 255)' }}
              />
              <Label htmlFor="fastingRequired" className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
                Fasting was required for this test
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestInformationSection;
