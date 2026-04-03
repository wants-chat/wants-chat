import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Upload, Description as FileText, Close as X } from '@mui/icons-material';

interface UploadFileSectionProps {
  uploadedFile: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

const UploadFileSection: React.FC<UploadFileSectionProps> = ({
  uploadedFile,
  onFileUpload,
  onRemoveFile
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-primary/5 dark:from-gray-800 dark:via-gray-800 dark:to-primary/10 border-l-4 border-primary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
          Upload Test Report
        </CardTitle>
        <CardDescription>
          Upload a PDF or image of your test results for automatic extraction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}
            >
              <Upload className="h-8 w-8" style={{ color: 'rgb(71, 189, 255)' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Test Report
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop your test report here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supports PDF, JPG, PNG (Max 10MB)
            </p>
            <Input
              type="file"
              accept=".pdf,image/*"
              onChange={onFileUpload}
              className="hidden"
              id="test-upload"
            />
            <Label htmlFor="test-upload">
              <Button variant="outline" className="cursor-pointer h-12 px-8 rounded-xl">
                Choose File
              </Button>
            </Label>
          </div>
        </div>
        {uploadedFile && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {uploadedFile.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveFile}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFileSection;
