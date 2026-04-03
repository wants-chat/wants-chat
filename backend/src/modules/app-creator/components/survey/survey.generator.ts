/**
 * Survey Component Generators
 *
 * Generates survey and feedback components including:
 * - SurveyBuilder: Create and edit surveys with drag-and-drop questions
 * - SurveyFilters: Filter surveys by status, date, type
 * - SurveyForm: Render and submit survey responses
 * - SurveyHeader: Display survey info and controls
 * - SurveyStats: Overview statistics for surveys
 */

export interface SurveyOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

/**
 * Generate a SurveyBuilder component for creating and editing surveys
 */
export function generateSurveyBuilder(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyBuilder',
    endpoint = '/surveys',
    title = 'Create Survey',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Settings,
  Type,
  ListChecks,
  ToggleLeft,
  Star,
  AlignLeft,
  Hash,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'single-choice' | 'multiple-choice' | 'rating' | 'scale' | 'date' | 'number';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface Survey {
  id?: string;
  title: string;
  description?: string;
  questions: Question[];
  status: 'draft' | 'active' | 'closed';
  startsAt?: string;
  endsAt?: string;
}

interface ${componentName}Props {
  surveyId?: string;
  onSave?: (survey: Survey) => void;
  onPreview?: (survey: Survey) => void;
}

const questionTypes = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'single-choice', label: 'Single Choice', icon: ListChecks },
  { type: 'multiple-choice', label: 'Multiple Choice', icon: ListChecks },
  { type: 'rating', label: 'Star Rating', icon: Star },
  { type: 'scale', label: 'Number Scale', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'number', label: 'Number', icon: Hash },
] as const;

const ${componentName}: React.FC<${componentName}Props> = ({ surveyId, onSave, onPreview }) => {
  const queryClient = useQueryClient();
  const [survey, setSurvey] = useState<Survey>({
    title: '',
    description: '',
    questions: [],
    status: 'draft',
  });
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Fetch existing survey if editing
  const { isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;
      const response = await api.get<any>(\`${endpoint}/\${surveyId}\`);
      const data = response?.data || response;
      if (data) setSurvey(data);
      return data;
    },
    enabled: !!surveyId,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Survey) => {
      if (surveyId) {
        return api.put<any>(\`${endpoint}/\${surveyId}\`, data);
      }
      return api.post<any>('${endpoint}', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      if (onSave) onSave(survey);
    },
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addQuestion = useCallback((type: Question['type']) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      title: '',
      required: false,
      options: type.includes('choice') ? ['Option 1', 'Option 2'] : undefined,
      min: type === 'scale' ? 1 : undefined,
      max: type === 'scale' ? 10 : undefined,
    };
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setExpandedQuestion(newQuestion.id);
    setShowTypeSelector(false);
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }));
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    setSurvey(prev => {
      const question = prev.questions.find(q => q.id === id);
      if (!question) return prev;
      const newQuestion = { ...question, id: generateId() };
      const index = prev.questions.findIndex(q => q.id === id);
      const questions = [...prev.questions];
      questions.splice(index + 1, 0, newQuestion);
      return { ...prev, questions };
    });
  }, []);

  const moveQuestion = useCallback((id: string, direction: 'up' | 'down') => {
    setSurvey(prev => {
      const index = prev.questions.findIndex(q => q.id === id);
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === prev.questions.length - 1)) {
        return prev;
      }
      const questions = [...prev.questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      return { ...prev, questions };
    });
  }, []);

  const addOption = useCallback((questionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: [...(q.options || []), \`Option \${(q.options?.length || 0) + 1}\`] };
      }),
    }));
  }, []);

  const updateOption = useCallback((questionId: string, index: number, value: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const options = [...(q.options || [])];
        options[index] = value;
        return { ...q, options };
      }),
    }));
  }, []);

  const removeOption = useCallback((questionId: string, index: number) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const options = (q.options || []).filter((_, i) => i !== index);
        return { ...q, options };
      }),
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">${title}</h1>
        <div className="flex items-center gap-3">
          {onPreview && (
            <button
              onClick={() => onPreview(survey)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
          <button
            onClick={() => saveMutation.mutate(survey)}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Survey
          </button>
        </div>
      </div>

      {/* Survey Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Survey Title</label>
            <input
              type="text"
              value={survey.title}
              onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter survey title..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
            <textarea
              value={survey.description || ''}
              onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this survey..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={survey.status}
                onChange={(e) => setSurvey(prev => ({ ...prev, status: e.target.value as Survey['status'] }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={survey.startsAt || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, startsAt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
              <input
                type="datetime-local"
                value={survey.endsAt || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, endsAt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Questions</h2>

        {survey.questions.map((question, index) => {
          const TypeIcon = questionTypes.find(t => t.type === question.type)?.icon || Type;
          const isExpanded = expandedQuestion === question.id;

          return (
            <div
              key={question.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Question Header */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}>
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <TypeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {question.title || \`Question \${index + 1}\`}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  <p className="text-sm text-gray-500">{questionTypes.find(t => t.type === question.type)?.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveQuestion(question.id, 'up'); }}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveQuestion(question.id, 'down'); }}
                    disabled={index === survey.questions.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateQuestion(question.id); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteQuestion(question.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Editor */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question</label>
                    <input
                      type="text"
                      value={question.title}
                      onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                      placeholder="Enter your question..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
                    <input
                      type="text"
                      value={question.description || ''}
                      onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                      placeholder="Add helper text..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Options for choice questions */}
                  {question.type.includes('choice') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options</label>
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                            <button
                              onClick={() => removeOption(question.id, optIndex)}
                              disabled={(question.options?.length || 0) <= 2}
                              className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(question.id)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scale settings */}
                  {question.type === 'scale' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Value</label>
                        <input
                          type="number"
                          value={question.min || 1}
                          onChange={(e) => updateQuestion(question.id, { min: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Value</label>
                        <input
                          type="number"
                          value={question.max || 10}
                          onChange={(e) => updateQuestion(question.id, { max: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Required toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Required question</span>
                  </label>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Question */}
        <div className="relative">
          <button
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>

          {showTypeSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {questionTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a SurveyFilters component for filtering surveys
 */
export function generateSurveyFilters(options: SurveyOptions = {}): string {
  const { componentName = 'SurveyFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import { Search, X, Filter, Calendar, ChevronDown } from 'lucide-react';

interface FilterValues {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  type: '',
  dateFrom: '',
  dateTo: '',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className = '',
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status || currentFilters.type || currentFilters.dateFrom || currentFilters.dateTo;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={currentFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search surveys..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {currentFilters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={\`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors \${
              isExpanded || hasActiveFilters
                ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }\`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
            <ChevronDown className={\`w-4 h-4 transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />
          </button>

          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={currentFilters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={currentFilters.type}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="feedback">Feedback</option>
                <option value="poll">Poll</option>
                <option value="quiz">Quiz</option>
                <option value="research">Research</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={currentFilters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={currentFilters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearAll}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a SurveyForm component for rendering and submitting surveys
 */
export function generateSurveyForm(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyForm',
    endpoint = '/surveys',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'single-choice' | 'multiple-choice' | 'rating' | 'scale' | 'date' | 'number';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface ${componentName}Props {
  surveyId: string;
  onComplete?: (responses: Record<string, any>) => void;
  showProgress?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  onComplete,
  showProgress = true,
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch survey
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${surveyId}\`);
      return response?.data || response;
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return api.post<any>(\`${endpoint}/\${surveyId}/responses\`, { responses: data });
    },
    onSuccess: () => {
      setSubmitted(true);
      if (onComplete) onComplete(responses);
    },
  });

  const updateResponse = useCallback((questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  }, []);

  const toggleMultipleChoice = useCallback((questionId: string, option: string) => {
    setResponses(prev => {
      const current = prev[questionId] || [];
      const updated = current.includes(option)
        ? current.filter((o: string) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  }, []);

  const validateStep = useCallback(() => {
    if (!survey) return false;
    const question = survey.questions[currentStep];
    if (!question) return true;

    if (question.required) {
      const value = responses[question.id];
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        setErrors(prev => ({ ...prev, [question.id]: 'This question is required' }));
        return false;
      }
    }
    return true;
  }, [survey, currentStep, responses]);

  const handleNext = useCallback(() => {
    if (validateStep() && survey) {
      if (currentStep < survey.questions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        submitMutation.mutate(responses);
      }
    }
  }, [validateStep, survey, currentStep, responses, submitMutation]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Survey not found</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Thank You!</h2>
        <p className="text-gray-600 dark:text-gray-400">Your response has been recorded successfully.</p>
      </div>
    );
  }

  const question = survey.questions[currentStep];
  const progress = ((currentStep + 1) / survey.questions.length) * 100;

  const renderQuestion = () => {
    if (!question) return null;
    const value = responses[question.id];
    const error = errors[question.id];

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Your answer..."
            className={\`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white \${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }\`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Your answer..."
            rows={4}
            className={\`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white \${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }\`}
          />
        );

      case 'single-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className={\`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors \${
                  value === option
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }\`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={value === option}
                  onChange={() => updateResponse(question.id, option)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className={\`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors \${
                  (value || []).includes(option)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }\`}
              >
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={() => toggleMultipleChoice(question.id, option)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateResponse(question.id, star)}
                className="p-2 transition-colors"
              >
                <Star
                  className={\`w-8 h-8 \${
                    (value || 0) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }\`}
                />
              </button>
            ))}
          </div>
        );

      case 'scale':
        const min = question.min || 1;
        const max = question.max || 10;
        return (
          <div className="space-y-4">
            <div className="flex justify-between gap-2 flex-wrap">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
                <button
                  key={num}
                  onClick={() => updateResponse(question.id, num)}
                  className={\`w-10 h-10 rounded-lg font-medium transition-colors \${
                    value === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            className={\`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white \${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }\`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter a number..."
            className={\`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white \${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }\`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{survey.title}</h1>
        {survey.description && (
          <p className="text-gray-600 dark:text-gray-400">{survey.description}</p>
        )}
      </div>

      {/* Progress */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentStep + 1} of {survey.questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: \`\${progress}%\` }}
            />
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {question?.title}
            {question?.required && <span className="text-red-500 ml-1">*</span>}
          </h2>
          {question?.description && (
            <p className="text-gray-600 dark:text-gray-400">{question.description}</p>
          )}
        </div>

        <div className="mb-6">
          {renderQuestion()}
          {errors[question?.id] && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[question?.id]}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={submitMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStep === survey.questions.length - 1 ? (
              'Submit'
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a SurveyHeader component for displaying survey info
 */
export function generateSurveyHeader(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyHeader',
    endpoint = '/surveys',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Calendar,
  Users,
  BarChart2,
  Clock,
  Edit,
  Share2,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  surveyId: string;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onViewResponses?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  onEdit,
  onShare,
  onDelete,
  onViewResponses,
}) => {
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${surveyId}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  const statusConfig = {
    draft: { label: 'Draft', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    active: { label: 'Active', icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    closed: { label: 'Closed', icon: XCircle, color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
  };

  const status = statusConfig[survey.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  const formatDate = (date: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Main Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{survey.title}</h1>
              <span className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium \${status.color}\`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
            {survey.description && (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{survey.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            {onViewResponses && (
              <button
                onClick={onViewResponses}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Eye className="w-4 h-4" />
                View Responses
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{survey.questionsCount || survey.questions?.length || 0}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{survey.responsesCount || 0}</p>
              <p className="text-sm text-gray-500">Responses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(survey.startsAt)}</p>
              <p className="text-sm text-gray-500">Start Date</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(survey.endsAt)}</p>
              <p className="text-sm text-gray-500">End Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a SurveyStats component for displaying survey statistics
 */
export function generateSurveyStats(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyStats',
    endpoint = '/surveys/stats',
    title = 'Survey Overview',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart2,
  PieChart,
} from 'lucide-react';
import { api } from '@/lib/api';

interface StatsData {
  totalSurveys?: number;
  activeSurveys?: number;
  totalResponses?: number;
  averageCompletionRate?: number;
  averageResponseTime?: string;
  recentActivity?: Array<{
    id: string;
    surveyTitle: string;
    responseCount: number;
    date: string;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className = '' }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['survey-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {};
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Surveys',
      value: stats?.totalSurveys || 0,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Surveys',
      value: stats?.activeSurveys || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600',
    },
    {
      label: 'Total Responses',
      value: stats?.totalResponses || 0,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Avg. Completion Rate',
      value: \`\${(stats?.averageCompletionRate || 0).toFixed(1)}%\`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className={\`space-y-6 \${className}\`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">${title}</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
              <div className={\`p-3 rounded-xl \${stat.bgColor}\`}>
                <stat.icon className={\`w-6 h-6 \${stat.iconColor}\`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Response Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 mx-auto mb-2" />
              <p>Response trend chart</p>
              <p className="text-sm">Integrate with your charting library</p>
            </div>
          </div>
        </div>

        {/* Survey Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Survey Status Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-2" />
              <p>Status distribution chart</p>
              <p className="text-sm">Integrate with your charting library</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats.recentActivity.map((activity: any) => (
              <div key={activity.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.surveyTitle}</p>
                  <p className="text-sm text-gray-500">{activity.responseCount} new responses</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {new Date(activity.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
