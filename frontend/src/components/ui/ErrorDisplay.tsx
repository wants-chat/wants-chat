import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message,
  onRetry,
  className = ''
}) => {
  return (
    <Card className={`border-red-200 dark:border-red-800 ${className}`}>
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">
          Something went wrong
        </h3>
        <p className="text-red-600 dark:text-red-400 mb-4">
          {message}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;