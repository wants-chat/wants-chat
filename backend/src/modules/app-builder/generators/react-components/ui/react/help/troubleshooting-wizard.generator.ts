import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTroubleshootingWizard = (
  resolved: ResolvedComponent,
  variant: 'stepByStep' | 'flowchart' | 'quick' = 'stepByStep'
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
    return `/${dataSource || 'troubleshooting'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'troubleshooting';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronRight, ChevronLeft, RotateCcw, CheckCircle, MessageCircle, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    stepByStep: `
${commonImports}

interface TroubleshootingWizardStepByStepProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TroubleshootingWizardStepByStep: React.FC<TroubleshootingWizardStepByStepProps> = ({ ${dataName}: propData, className }) => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const wizardData = ${dataName} || {};

  const wizardTitle = ${getField('wizardTitle')};
  const wizardDescription = ${getField('wizardDescription')};
  const startButton = ${getField('startButton')};
  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const resetButton = ${getField('resetButton')};
  const contactSupportButton = ${getField('contactSupportButton')};
  const questions = ${getField('questions')};
  const solutions = ${getField('solutions')};
  const solutionFoundTitle = ${getField('solutionFoundTitle')};
  const stillNeedHelpText = ${getField('stillNeedHelpText')};
  const progressText = ${getField('progressText')};

  const currentQuestion = questions.find((q: any) => q.id === currentStep);
  const currentSolution = currentStep?.startsWith('solution-') ? solutions[currentStep] : null;

  const handleStart = () => {
    setCurrentStep('q1');
    setHistory([]);
  };

  const handleChoice = (nextStep: string) => {
    console.log('Choice selected, moving to:', nextStep);
    setHistory([...history, currentStep!]);
    setCurrentStep(nextStep);
  };

  const handleYesNo = (answer: 'yes' | 'no') => {
    console.log('Yes/No answer:', answer);
    const nextStep = answer === 'yes' ? currentQuestion.yesNext : currentQuestion.noNext;
    setHistory([...history, currentStep!]);
    setCurrentStep(nextStep);
  };

  const handleTextSubmit = () => {
    console.log('Text input:', textInput);
    if (textInput.trim()) {
      setHistory([...history, currentStep!]);
      setCurrentStep(currentQuestion.next);
      setTextInput('');
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousStep = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentStep(previousStep);
    }
  };

  const handleReset = () => {
    console.log('Wizard reset');
    setCurrentStep(null);
    setHistory([]);
    setTextInput('');
  };

  const getProgress = () => {
    return {
      current: history.length + 1,
      total: 5
    };
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        {/* Welcome Screen */}
        {!currentStep && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {wizardTitle}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {wizardDescription}
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-12 h-14 text-lg"
            >
              {startButton}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Question Screen */}
        {currentQuestion && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-gray-100 dark:bg-gray-700 px-8 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {progressText.replace('{current}', getProgress().current).replace('{total}', getProgress().total)}
                </span>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {resetButton}
                </Button>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: \`\${(getProgress().current / getProgress().total) * 100}%\` }}
                />
              </div>
            </div>

            {/* Question Content */}
            <div className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {currentQuestion.question}
              </h2>

              {/* Multiple Choice */}
              {currentQuestion.type === 'choice' && (
                <div className="space-y-4">
                  {currentQuestion.options.map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => handleChoice(option.next)}
                      className="w-full p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Yes/No */}
              {currentQuestion.type === 'yesno' && (
                <div className="flex gap-6">
                  <button
                    onClick={() => handleYesNo('yes')}
                    className="flex-1 p-8 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 border-2 border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-600 transition-all"
                  >
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                      <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                        Yes
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleYesNo('no')}
                    className="flex-1 p-8 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 border-2 border-red-200 dark:border-red-800 hover:border-red-500 dark:hover:border-red-600 transition-all"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 dark:bg-red-400 flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-2xl font-bold">✕</span>
                      </div>
                      <span className="text-2xl font-bold text-red-900 dark:text-red-100">
                        No
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Text Input */}
              {currentQuestion.type === 'text' && (
                <div>
                  <Input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                    placeholder="Type your answer here..."
                    className="h-14 text-lg mb-4"
                  />
                  <Button
                    onClick={handleTextSubmit}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    disabled={!textInput.trim()}
                  >
                    {nextButton}
                  </Button>
                </div>
              )}

              {/* Back Button */}
              {history.length > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="mt-6 gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {previousButton}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Solution Screen */}
        {currentSolution && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {solutionFoundTitle}
              </h2>
              <h3 className="text-xl text-gray-600 dark:text-gray-400">
                {currentSolution.title}
              </h3>
            </div>

            <div className="mb-8">
              <ol className="space-y-4">
                {currentSolution.steps.map((step: string, index: number) => (
                  <li key={index} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      {index + 1}
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 pt-1">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {currentSolution.helpfulLinks && (
              <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Helpful Resources:
                </h4>
                <div className="flex flex-wrap gap-3">
                  {currentSolution.helpfulLinks.map((link: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => alert(\`Opening: \${link}\`)}
                      className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {stillNeedHelpText}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {resetButton}
                </Button>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4" />
                  {contactSupportButton}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TroubleshootingWizardStepByStep;
    `,

    flowchart: `
${commonImports}

interface TroubleshootingWizardFlowchartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TroubleshootingWizardFlowchart: React.FC<TroubleshootingWizardFlowchartProps> = ({ ${dataName}: propData, className }) => {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string>('start');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const wizardData = ${dataName} || {};

  const wizardTitle = ${getField('wizardTitle')};
  const resetButton = ${getField('resetButton')};
  const questions = ${getField('questions')};
  const solutions = ${getField('solutions')};

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
    setSelectedPath([...selectedPath, nodeId]);
    setCurrentNode(nodeId);
  };

  const handleReset = () => {
    setSelectedPath([]);
    setCurrentNode('start');
  };

  const currentQuestion = questions.find((q: any) => q.id === currentNode);
  const currentSolution = currentNode.startsWith('solution-') ? solutions[currentNode] : null;

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {wizardTitle}
          </h1>
          <Button
            onClick={handleReset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {resetButton}
          </Button>
        </div>

        {/* Flowchart Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="space-y-8">
            {/* Start Node */}
            <div className="flex justify-center">
              <div
                className={cn(
                  "px-8 py-4 rounded-xl cursor-pointer transition-all",
                  currentNode === 'start'
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
                onClick={() => handleNodeClick('q1')}
              >
                <p className="text-center font-semibold">Start Here</p>
              </div>
            </div>

            {/* Question Nodes */}
            {currentNode !== 'start' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {questions.slice(0, 4).map((q: any) => (
                  <div
                    key={q.id}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all cursor-pointer",
                      selectedPath.includes(q.id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : currentNode === q.id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {q.question}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Question/Solution */}
        {currentQuestion && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h2>
            {currentQuestion.type === 'choice' && (
              <div className="grid md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option: any) => (
                  <button
                    key={option.id}
                    onClick={() => handleNodeClick(option.next)}
                    className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentSolution && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentSolution.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Follow these steps to resolve your issue
                </p>
              </div>
            </div>
            <ol className="space-y-3">
              {currentSolution.steps.map((step: string, index: number) => (
                <li key={index} className="flex gap-3">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {index + 1}.
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default TroubleshootingWizardFlowchart;
    `,

    quick: `
${commonImports}

interface TroubleshootingWizardQuickProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TroubleshootingWizardQuick: React.FC<TroubleshootingWizardQuickProps> = ({ ${dataName}: propData, className }) => {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const wizardData = ${dataName} || {};

  const wizardTitle = ${getField('wizardTitle')};
  const questions = ${getField('questions')};
  const solutions = ${getField('solutions')};
  const contactSupportButton = ${getField('contactSupportButton')};

  const firstQuestion = questions[0];
  const selectedSolution = selectedIssue ? solutions[\`solution-\${selectedIssue}\`] : null;

  const quickSolutions: Record<string, any> = {
    login: solutions['solution-login-error'],
    performance: solutions['solution-performance-entire'],
    billing: { title: 'Billing Questions', steps: ['Check your billing settings', 'Review recent transactions', 'Update payment method'] },
    features: { title: 'Feature Issues', steps: ['Check if feature is enabled', 'Review permissions', 'Clear cache and retry'] }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {wizardTitle}
        </h1>

        {/* Quick Issue Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {firstQuestion.options.map((option: any) => (
            <button
              key={option.id}
              onClick={() => setSelectedIssue(option.id)}
              className={cn(
                "p-6 rounded-xl border-2 transition-all text-center",
                selectedIssue === option.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg scale-105"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
              )}
            >
              <div className="text-4xl mb-3">
                {option.id === 'login' && '🔐'}
                {option.id === 'performance' && '⚡'}
                {option.id === 'billing' && '💳'}
                {option.id === 'features' && '⚙️'}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {option.label}
              </p>
            </button>
          ))}
        </div>

        {/* Quick Solution */}
        {selectedIssue && quickSolutions[selectedIssue] && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {quickSolutions[selectedIssue].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Try these quick fixes first
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <ol className="space-y-4">
                {quickSolutions[selectedIssue].steps.map((step: string, index: number) => (
                  <li key={index} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setSelectedIssue(null)}
                variant="outline"
              >
                Choose Different Issue
              </Button>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="h-4 w-4" />
                {contactSupportButton}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TroubleshootingWizardQuick;
    `
  };

  return variants[variant] || variants.stepByStep;
};
