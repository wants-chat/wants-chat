import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Plus, Trash2, Copy, Check, RotateCcw, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface GPACalculatorToolProps {
  uiConfig?: UIConfig;
}

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Course Name', type: 'string' },
  { key: 'grade', header: 'Grade', type: 'string' },
  { key: 'credits', header: 'Credits', type: 'number' },
  { key: 'gradePoints', header: 'Grade Points', type: 'number' },
];

// Default courses for new users
const DEFAULT_COURSES: Course[] = [
  { id: '1', name: '', grade: 'A', credits: 3 },
  { id: '2', name: '', grade: 'B+', credits: 3 },
  { id: '3', name: '', grade: 'A-', credits: 4 },
];

export const GPACalculatorTool: React.FC<GPACalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: courses,
    setData: setCourses,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Course>('gpa-calculator', DEFAULT_COURSES, COLUMNS);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses.map((course: any, index: number) => ({
          id: String(index + 1),
          name: course.name || '',
          grade: course.grade || 'A',
          credits: course.credits || 3,
        })));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled, setCourses]);

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: '',
      grade: 'A',
      credits: 3,
    };
    addItem(newCourse);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      deleteItem(id);
    }
  };

  const handleUpdateCourse = (id: string, field: keyof Course, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  const calculations = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const points = gradePoints[course.grade] ?? 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    return { gpa, totalCredits, totalPoints };
  }, [courses]);

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-500';
    if (gpa >= 3.0) return 'text-blue-500';
    if (gpa >= 2.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGPALabel = (gpa: number) => {
    if (gpa >= 3.9) return 'Summa Cum Laude';
    if (gpa >= 3.7) return 'Magna Cum Laude';
    if (gpa >= 3.5) return 'Cum Laude';
    if (gpa >= 3.0) return 'Good Standing';
    if (gpa >= 2.0) return 'Satisfactory';
    return 'Academic Probation';
  };

  const handleCopy = () => {
    const text = `GPA: ${calculations.gpa.toFixed(2)}
Total Credits: ${calculations.totalCredits}
Status: ${getGPALabel(calculations.gpa)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setCourses([{ id: '1', name: '', grade: 'A', credits: 3 }]);
  };

  // Prepare export data with calculated grade points
  const getExportData = () => {
    return courses.map((course, index) => ({
      ...course,
      name: course.name || `Course ${index + 1}`,
      gradePoints: gradePoints[course.grade] ?? 0,
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gPACalculator.gpaCalculator', 'GPA Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gPACalculator.calculateYourGradePointAverage', 'Calculate your grade point average')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="g-p-a-calculator" toolName="G P A Calculator" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'gpa_calculator' })}
              onExportExcel={() => exportExcel({ filename: 'gpa_calculator' })}
              onExportJSON={() => exportJSON({ filename: 'gpa_calculator' })}
              onExportPDF={() => exportPDF({
                filename: 'gpa_calculator',
                title: 'GPA Calculator Report',
                subtitle: `GPA: ${calculations.gpa.toFixed(2)} | Total Credits: ${calculations.totalCredits} | ${getGPALabel(calculations.gpa)}`,
              })}
              onPrint={() => print('GPA Calculator Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* GPA Display */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
          <div className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            {t('tools.gPACalculator.yourGpa', 'Your GPA')}
          </div>
          <div className={`text-6xl font-bold ${getGPAColor(calculations.gpa)}`}>
            {calculations.gpa.toFixed(2)}
          </div>
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {getGPALabel(calculations.gpa)} • {calculations.totalCredits} credits
          </div>
          <button
            onClick={handleCopy}
            className={`mt-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto transition-colors ${
              copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('tools.gPACalculator.copied', 'Copied!') : t('tools.gPACalculator.copyGpa', 'Copy GPA')}
          </button>
        </div>

        {/* Course List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Courses ({courses.length})
            </label>
            <button
              onClick={reset}
              className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <RotateCcw className="w-3 h-3" />
              {t('tools.gPACalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
            <div className="col-span-5">{t('tools.gPACalculator.courseName', 'Course Name')}</div>
            <div className="col-span-3">{t('tools.gPACalculator.grade', 'Grade')}</div>
            <div className="col-span-3">{t('tools.gPACalculator.credits', 'Credits')}</div>
            <div className="col-span-1"></div>
          </div>

          {courses.map((course, index) => (
            <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={course.name}
                onChange={(e) => handleUpdateCourse(course.id, 'name', e.target.value)}
                placeholder={`Course ${index + 1}`}
                className={`col-span-5 px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <select
                value={course.grade}
                onChange={(e) => handleUpdateCourse(course.id, 'grade', e.target.value)}
                className={`col-span-3 px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {Object.keys(gradePoints).map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="6"
                value={course.credits}
                onChange={(e) => handleUpdateCourse(course.id, 'credits', parseInt(e.target.value) || 1)}
                className={`col-span-3 px-3 py-2 rounded-lg border text-sm text-center ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <button
                onClick={() => removeCourse(course.id)}
                disabled={courses.length <= 1}
                className={`col-span-1 p-2 rounded-lg transition-colors disabled:opacity-30 ${
                  isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={addCourse}
            className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
              isDark ? 'border-gray-700 hover:border-gray-600 text-gray-400' : 'border-gray-300 hover:border-gray-400 text-gray-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.gPACalculator.addCourse', 'Add Course')}
          </button>
        </div>

        {/* Grade Scale Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gPACalculator.gradeScale', 'Grade Scale')}</h4>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {Object.entries(gradePoints).map(([grade, points]) => (
              <div key={grade} className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{grade}</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{points.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.gPACalculator.tip', 'Tip:')}</strong> GPA is calculated as: (Grade Points x Credits) / Total Credits.
            Most schools use a 4.0 scale.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GPACalculatorTool;
