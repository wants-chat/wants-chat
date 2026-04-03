import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSurveyForm = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'detailed' | 'minimal' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, ChevronRight, ChevronLeft, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    standard: `
${commonImports}

interface SurveyFormStandardProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSuccess?: (data: any) => void;
  [key: string]: any;
}

const SurveyFormStandard: React.FC<SurveyFormStandardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSuccess }) => {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const questions = ${getField('questions')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleMultipleChoice = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckbox = (questionId: number, value: string) => {
    const current = answers[questionId] || [];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setAnswers(prev => ({ ...prev, [questionId]: updated }));
  };

  const handleRating = (questionId: number, rating: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleText = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) {
        onSuccess(data);
      }
      setTimeout(() => {
        setAnswers({});
        setStatus('idle');
      }, 4000);
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('Survey submission error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    submitMutation.mutate(answers);
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {mainTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {mainDescription}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: \`\${progress}%\` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {Object.keys(answers).length} of {questions.length} questions answered
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                {successTitle}
              </h4>
              <p className="text-green-700 dark:text-green-300">
                {successMessage}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((q: any, index: number) => (
                <div key={q.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                  <Label className="text-base font-semibold mb-3 block">
                    {index + 1}. {q.question}
                  </Label>

                  {q.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {q.options.map((option: string) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={\`question-\${q.id}\`}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={() => handleMultipleChoice(q.id, option)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-900 dark:text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="space-y-2">
                      {q.options.map((option: string) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={(answers[q.id] || []).includes(option)}
                            onChange={() => handleCheckbox(q.id, option)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-gray-900 dark:text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from({ length: q.scale }, (_, i) => i + 1).map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRating(q.id, rating)}
                          className={\`w-12 h-12 rounded-lg border-2 font-semibold transition-all \${
                            answers[q.id] === rating
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                          }\`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => handleText(q.id, e.target.value)}
                      rows={4}
                      className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={q.placeholder}
                    />
                  )}
                </div>
              ))}

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {sendingButton}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    {submitButton}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyFormStandard;
    `,

    detailed: `
${commonImports}

interface SurveyFormDetailedProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSuccess?: (data: any) => void;
  [key: string]: any;
}

const SurveyFormDetailed: React.FC<SurveyFormDetailedProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSuccess }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const questions = ${getField('questions')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('Survey submission error:', err);
    },
  });

  const handleSubmit = async () => {
    setStatus('loading');
    submitMutation.mutate(answers);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4", className)}>
      <div className="max-w-2xl mx-auto">
        {status === 'success' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {successTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {successMessage}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {mainTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {mainDescription}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: \`\${progress}%\` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentStep + 1}/{questions.length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg p-8 min-h-[400px] flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {currentQuestion.question}
                </h4>

                {currentQuestion.type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: string) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAnswer(option)}
                        className={\`w-full text-left p-4 rounded-lg border-2 transition-all \${
                          answers[currentQuestion.id] === option
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }\`}
                      >
                        <span className="text-gray-900 dark:text-white font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'rating' && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    {Array.from({ length: currentQuestion.scale }, (_, i) => i + 1).map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleAnswer(rating)}
                        className={\`w-14 h-14 rounded-lg border-2 font-bold text-lg transition-all \${
                          answers[currentQuestion.id] === rating
                            ? 'bg-blue-600 border-blue-600 text-white scale-110'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                        }\`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    rows={6}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={currentQuestion.placeholder}
                  />
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-6 flex justify-between gap-4">
              <Button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="h-11"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                {previousButton}
              </Button>

              {isLastQuestion ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  className="h-11 bg-blue-600 hover:bg-blue-700"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {sendingButton}
                    </>
                  ) : (
                    <>
                      {submitButton}
                      <Send className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-11 bg-blue-600 hover:bg-blue-700"
                >
                  {nextButton}
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyFormDetailed;
    `,

    minimal: `
${commonImports}

interface SurveyFormMinimalProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSuccess?: (data: any) => void;
  [key: string]: any;
}

const SurveyFormMinimal: React.FC<SurveyFormMinimalProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSuccess }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successMessage = ${getField('successMessage')};

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) {
        onSuccess(data);
      }
      setTimeout(() => {
        setRating(0);
        setFeedback('');
        setStatus('idle');
      }, 3000);
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('Survey submission error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    submitMutation.mutate({ rating, feedback });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {mainTitle}
        </h3>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <p className="text-green-700 dark:text-green-300 font-medium">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-center block mb-4">How would you rate your experience?</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={\`h-10 w-10 \${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }\`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Additional Feedback (Optional)</Label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tell us more..."
              />
            </div>

            <Button
              type="submit"
              disabled={status === 'loading' || rating === 0}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            >
              {status === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {sendingButton}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  {submitButton}
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SurveyFormMinimal;
    `
  };

  return variants[variant] || variants.standard;
};
