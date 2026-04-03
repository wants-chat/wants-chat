import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Biotech, Add as Plus, Delete as Trash2, Warning as AlertCircle } from '@mui/icons-material';
import { TestParametersProps, TestParameter } from '../../../types/health';

const flagOptions = [
  { value: 'normal', label: 'Normal', color: 'text-green-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-800 font-bold' }
];

const TestParametersSection: React.FC<TestParametersProps> = ({
  formData,
  handleInputChange,
  errors,
  testParameters,
  handleParameterChange,
  addParameter,
  removeParameter
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-primary/5 dark:from-gray-800 dark:via-gray-800 dark:to-primary/10 border-l-4 border-primary">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Biotech className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
              Test Parameters & Results
            </CardTitle>
            <CardDescription>
              Add individual test parameters and their values
            </CardDescription>
          </div>
          <Button
            onClick={addParameter}
            className="h-12 px-6 rounded-xl text-white font-semibold"
            style={{ backgroundColor: 'rgb(71, 189, 255)' }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Parameter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.parameters && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.parameters}
            </p>
          </div>
        )}

        {testParameters.map((param, index) => (
          <Card key={param.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}
                  >
                    <Biotech className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Parameter {index + 1}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enter test parameter details
                    </p>
                  </div>
                </div>
                {testParameters.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeParameter(param.id)}
                    className="h-10 w-10 text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Label htmlFor={`param-${param.id}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Parameter Name
                  </Label>
                  <Input
                    id={`param-${param.id}`}
                    placeholder="e.g., Hemoglobin"
                    value={param.parameter}
                    onChange={(e) => handleParameterChange(param.id, 'parameter', e.target.value)}
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor={`flag-${param.id}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Flag
                  </Label>
                  <Select
                    value={param.flag}
                    onValueChange={(value) => handleParameterChange(param.id, 'flag', value as TestParameter['flag'])}
                  >
                    <SelectTrigger id={`flag-${param.id}`} className="mt-1 h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {flagOptions.map(flag => (
                        <SelectItem key={flag.value} value={flag.value}>
                          <span className={flag.color}>{flag.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`value-${param.id}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Value
                  </Label>
                  <Input
                    id={`value-${param.id}`}
                    placeholder="e.g., 14.5"
                    value={param.value}
                    onChange={(e) => handleParameterChange(param.id, 'value', e.target.value)}
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor={`unit-${param.id}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Unit
                  </Label>
                  <Input
                    id={`unit-${param.id}`}
                    placeholder="e.g., g/dL"
                    value={param.unit}
                    onChange={(e) => handleParameterChange(param.id, 'unit', e.target.value)}
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor={`range-${param.id}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Reference Range
                  </Label>
                  <Input
                    id={`range-${param.id}`}
                    placeholder="e.g., 12-16"
                    value={param.referenceRange}
                    onChange={(e) => handleParameterChange(param.id, 'referenceRange', e.target.value)}
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ background: 'linear-gradient(to right, rgb(71, 189, 255), rgb(51, 169, 235))' }} />
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default TestParametersSection;
