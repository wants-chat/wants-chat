import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2, Copy, Check, Save, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface GrammarIssue {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  message: string;
  position: number;
  length: number;
  suggestion: string;
  original: string;
}

interface CheckResult {
  original: string;
  corrected: string;
  issues: GrammarIssue[];
  score: number;
  readabilityScore: number;
  timestamp: Date;
}

const checkTypes = [
  { value: 'grammar', label: 'Grammar', icon: BookOpen, color: 'text-blue-600' },
  { value: 'spelling', label: 'Spelling', icon: CheckCircle, color: 'text-green-600' },
  { value: 'punctuation', label: 'Punctuation', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'style', label: 'Style', icon: Check, color: 'text-purple-600' },
];

const COLUMNS = [
  { key: 'type', label: 'Type' },
  { key: 'original', label: 'Original' },
  { key: 'suggestion', label: 'Suggestion' },
  { key: 'message', label: 'Message' },
];

interface GrammarCheckerToolProps {
  uiConfig?: UIConfig;
}

const GrammarCheckerTool = ({ uiConfig }: GrammarCheckerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedCheckTypes, setSelectedCheckTypes] = useState<string[]>(['grammar', 'spelling', 'punctuation', 'style']);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCorrected, setCopiedCorrected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<number>>(new Set());
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.inputText || params.text) {
          setInputText(params.inputText || params.text);
          hasPrefill = true;
        }
        if (params.checkTypes && Array.isArray(params.checkTypes)) {
          setSelectedCheckTypes(params.checkTypes);
          hasPrefill = true;
        }
        // Restore the result if available
        if (params.correctedText) {
          setResult({
            original: params.originalText || params.inputText || '',
            corrected: params.correctedText,
            issues: params.issues || [],
            score: params.score || 0,
            readabilityScore: params.readabilityScore || 0,
            timestamp: new Date(),
          });
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.text || params.inputText) {
          setInputText(params.text || params.inputText);
          hasPrefill = true;
        }
        if (params.checkTypes && Array.isArray(params.checkTypes)) {
          setSelectedCheckTypes(params.checkTypes);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const toggleCheckType = (type: string) => {
    setSelectedCheckTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleCheck = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to check');
      return;
    }

    if (selectedCheckTypes.length === 0) {
      setError('Please select at least one check type');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const checkTypesStr = selectedCheckTypes.join(', ');

      const prompt = `Analyze the following text for ${checkTypesStr} issues.

Text to check:
${inputText}

Please provide:
1. A corrected version of the text
2. List of issues found (each on a new line with format: [TYPE] Original: "..." → Suggested: "..." - Reason: ...)
3. Overall writing quality score (0-100)
4. Readability score (Flesch Reading Ease scale)

Format your response as:
CORRECTED:
[corrected text here]

ISSUES:
[list issues here]

SCORE: [0-100]
READABILITY: [0-100]`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        context: 'grammar_checker',
        options: {
          checkTypes: selectedCheckTypes,
        },
      });

      const generatedText = response.data?.text || response.data?.content || response.text || '';

      if (!generatedText) {
        throw new Error('No analysis generated');
      }

      // Parse the response
      const correctedMatch = generatedText.match(/CORRECTED:\s*\n([\s\S]*?)(?=\n\nISSUES:|$)/i);
      const issuesMatch = generatedText.match(/ISSUES:\s*\n([\s\S]*?)(?=\n\nSCORE:|$)/i);
      const scoreMatch = generatedText.match(/SCORE:\s*(\d+)/i);
      const readabilityMatch = generatedText.match(/READABILITY:\s*(\d+)/i);

      const corrected = correctedMatch ? correctedMatch[1].trim() : inputText;
      const issuesText = issuesMatch ? issuesMatch[1].trim() : '';
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 85;
      const readabilityScore = readabilityMatch ? parseInt(readabilityMatch[1]) : 60;

      // Parse issues
      const issues: GrammarIssue[] = [];
      if (issuesText) {
        const issueLines = issuesText.split('\n').filter(line => line.trim());
        issueLines.forEach((line, index) => {
          const typeMatch = line.match(/\[(.*?)\]/);
          const originalMatch = line.match(/Original:\s*"(.*?)"/);
          const suggestedMatch = line.match(/Suggested:\s*"(.*?)"/);
          const reasonMatch = line.match(/Reason:\s*(.*?)$/);

          if (typeMatch && originalMatch && suggestedMatch) {
            const type = typeMatch[1].toLowerCase() as GrammarIssue['type'];
            const original = originalMatch[1];
            const suggestion = suggestedMatch[1];
            const message = reasonMatch ? reasonMatch[1].trim() : 'Improvement suggested';

            // Try to find position in original text
            const position = inputText.indexOf(original);

            issues.push({
              type: ['grammar', 'spelling', 'punctuation', 'style'].includes(type)
                ? type
                : 'style',
              message,
              position: position >= 0 ? position : index * 10,
              length: original.length,
              suggestion,
              original,
            });
          }
        });
      }

      setResult({
        original: inputText,
        corrected,
        issues,
        score: Math.min(100, Math.max(0, score)),
        readabilityScore: Math.min(100, Math.max(0, readabilityScore)),
        timestamp: new Date(),
      });
      setAcceptedSuggestions(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check grammar');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyCorrected = async () => {
    if (result?.corrected) {
      try {
        await navigator.clipboard.writeText(result.corrected);
        setCopiedCorrected(true);
        setTimeout(() => setCopiedCorrected(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!result?.corrected) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: 'Grammar Checked Text',
        prompt: 'Grammar checked text',
        metadata: {
          toolId: 'grammar-checker',
          inputText: result.original,
          correctedText: result.corrected,
          originalText: result.original,
          checkTypes: selectedCheckTypes,
          score: result.score,
          readabilityScore: result.readabilityScore,
          issuesCount: result.issues.length,
          issues: result.issues,
        },
      });

      // Call onSaveCallback if provided (for gallery refresh)
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    setAcceptedSuggestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const resetTool = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setCopiedCorrected(false);
    setAcceptedSuggestions(new Set());
  };

  // Export handlers
  const handleExportCSV = () => {
    if (!result) return;

    const rows = result.issues.map(issue => [
      issue.type,
      issue.original,
      issue.suggestion,
      issue.message,
    ]);

    const csv = [
      COLUMNS.map(col => col.label).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grammar-check-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!result) return;

    const data = {
      original: result.original,
      corrected: result.corrected,
      score: result.score,
      readabilityScore: result.readabilityScore,
      timestamp: result.timestamp,
      issues: result.issues.map(issue => ({
        type: issue.type,
        original: issue.original,
        suggestion: issue.suggestion,
        message: issue.message,
        position: issue.position,
        length: issue.length,
      })),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grammar-check-results.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    if (!result) return false;

    const text = `Grammar Check Results\n\nOriginal Text:\n${result.original}\n\nCorrected Text:\n${result.corrected}\n\nScore: ${result.score}/100\nReadability: ${result.readabilityScore}/100\nIssues Found: ${result.issues.length}`;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return isDark ? 'text-green-400' : 'text-green-600';
    if (score >= 70) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className="bg-white/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('tools.grammarChecker.grammarChecker', 'Grammar Checker')}</h2>
              <p className="text-teal-50 text-sm mt-1">{t('tools.grammarChecker.aiPoweredGrammarSpellingAnd', 'AI-powered grammar, spelling, and writing analysis')}</p>
              {isPrefilled && (
                <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
                  <Sparkles className="w-3 h-3" />
                  <span>{isEditFromGallery ? t('tools.grammarChecker.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.grammarChecker.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
                </div>
              )}
            </div>
          </div>
          {result && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Check Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.grammarChecker.checkFor', 'Check For:')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {checkTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleCheckType(type.value)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedCheckTypes.includes(type.value)
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : isDark
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-650'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <type.icon className={`w-4 h-4 ${selectedCheckTypes.includes(type.value) ? 'text-teal-600 dark:text-teal-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${selectedCheckTypes.includes(type.value) ? isDark ? 'text-teal-400' : 'text-teal-600' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.grammarChecker.textToCheck', 'Text to Check')}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('tools.grammarChecker.pasteOrTypeYourText', 'Paste or type your text here for grammar and writing analysis...')}
              rows={10}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Character count: {inputText.length}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCheck}
              disabled={isChecking || !inputText.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('tools.grammarChecker.analyzing', 'Analyzing...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{t('tools.grammarChecker.checkWriting', 'Check Writing')}</span>
                </>
              )}
            </button>

            {result && (
              <button
                onClick={resetTool}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.grammarChecker.newCheck', 'New Check')}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="space-y-6">
            {/* Scores */}
            <div className={`border rounded-lg p-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {t('tools.grammarChecker.overallAnalysis', 'Overall Analysis')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                    {result.score}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.grammarChecker.writingScore', 'Writing Score')}
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('tools.grammarChecker.outOf100', 'out of 100')}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {result.readabilityScore}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.grammarChecker.readability', 'Readability')}
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {getReadabilityLabel(result.readabilityScore)}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {result.issues.length}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.grammarChecker.issuesFound', 'Issues Found')}
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('tools.grammarChecker.suggestionsAvailable', 'suggestions available')}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            {result.issues.length > 0 && (
              <div className={`border rounded-lg p-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  Issues & Suggestions ({result.issues.length})
                </h3>
                <div className="space-y-3">
                  {result.issues.map((issue, index) => {
                    const isAccepted = acceptedSuggestions.has(index);
                    const typeInfo = checkTypes.find(t => t.value === issue.type);

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 transition-all ${
                          isAccepted
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                            : isDark
                            ? 'bg-gray-800 border-gray-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {typeInfo && <typeInfo.icon className={`w-4 h-4 ${typeInfo.color}`} />}
                              <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {issue.type}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {issue.message}
                            </p>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="line-through">{issue.original}</span>
                              <span className="mx-2">→</span>
                              <span className="font-semibold text-teal-600 dark:text-teal-400">{issue.suggestion}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSuggestion(index)}
                            className={`ml-4 p-2 rounded-lg transition-colors ${
                              isAccepted
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                : isDark
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Corrected Text */}
            <div className={`border rounded-lg p-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {t('tools.grammarChecker.correctedText', 'Corrected Text')}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyCorrected}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      copiedCorrected
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : isDark
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {copiedCorrected ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('tools.grammarChecker.copied', 'Copied!')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{t('tools.grammarChecker.copy', 'Copy')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('tools.grammarChecker.saving', 'Saving...')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{t('tools.grammarChecker.save', 'Save')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={`whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {result.corrected}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarCheckerTool;
