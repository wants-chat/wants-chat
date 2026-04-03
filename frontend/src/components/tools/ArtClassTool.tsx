import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Users, Clock, Calendar, DollarSign, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface ArtClass {
  id: string;
  name: string;
  type: string;
  instructor: string;
  maxStudents: number;
  enrolledStudents: number;
  duration: number;
  price: number;
  schedule: string;
  materials: string[];
}

const classTypes = ['Painting', 'Drawing', 'Sculpture', 'Pottery', 'Mixed Media', 'Digital Art', 'Watercolor', 'Acrylic'];

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Class Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'instructor', header: 'Instructor', type: 'string' },
  { key: 'maxStudents', header: 'Max Students', type: 'number' },
  { key: 'enrolledStudents', header: 'Enrolled', type: 'number' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'price', header: 'Price ($)', type: 'currency' },
  { key: 'schedule', header: 'Schedule', type: 'string' },
  { key: 'materials', header: 'Materials', type: 'string' },
];

interface ArtClassToolProps {
  uiConfig?: UIConfig;
}

export const ArtClassTool: React.FC<ArtClassToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: classes,
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
  } = useToolData<ArtClass>('art-class', [], COLUMNS);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Painting',
    instructor: '',
    maxStudents: 12,
    duration: 120,
    price: 50,
    schedule: '',
    materials: '',
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.classType && classTypes.includes(params.classType)) {
        setFormData(prev => ({ ...prev, type: params.classType as string }));
        hasChanges = true;
      }
      if (params.maxStudents) {
        setFormData(prev => ({ ...prev, maxStudents: params.maxStudents as number }));
        hasChanges = true;
      }
      if (params.duration) {
        setFormData(prev => ({ ...prev, duration: params.duration as number }));
        hasChanges = true;
      }
      if (params.price) {
        setFormData(prev => ({ ...prev, price: params.price as number }));
        hasChanges = true;
      }
      if (params.instructor) {
        setFormData(prev => ({ ...prev, instructor: params.instructor as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addClass = () => {
    const newClass: ArtClass = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      instructor: formData.instructor,
      maxStudents: formData.maxStudents,
      enrolledStudents: 0,
      duration: formData.duration,
      price: formData.price,
      schedule: formData.schedule,
      materials: formData.materials.split(',').map(m => m.trim()).filter(Boolean),
    };
    addItem(newClass);
    setShowForm(false);
    setFormData({ name: '', type: 'Painting', instructor: '', maxStudents: 12, duration: 120, price: 50, schedule: '', materials: '' });
  };

  const removeClass = (id: string) => deleteItem(id);

  const enrollStudent = (id: string) => {
    const artClass = classes.find(c => c.id === id);
    if (artClass && artClass.enrolledStudents < artClass.maxStudents) {
      updateItem(id, { enrolledStudents: artClass.enrolledStudents + 1 });
    }
  };

  const inputClass = `w-full p-3 rounded-lg border ${
    theme === 'dark' ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:ring-2 focus:ring-[#0D9488]`;

  const cardClass = `p-4 rounded-lg ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.artClass.artClassManager', 'Art Class Manager')}
        </h2>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {t('tools.artClass.manageArtClassesSchedulesAnd', 'Manage art classes, schedules, and enrollment')}
        </p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">
            {isEditFromGallery ? t('tools.artClass.dataRestoredFromYourSaved', 'Data restored from your saved gallery') : t('tools.artClass.prefilledFromAiResponse', 'Prefilled from AI response')}
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <WidgetEmbedButton toolSlug="art-class" toolName="Art Class" />

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
          onExportCSV={() => exportCSV({ filename: 'art-class' })}
          onExportExcel={() => exportExcel({ filename: 'art-class' })}
          onExportJSON={() => exportJSON({ filename: 'art-class' })}
          onExportPDF={() => exportPDF({ filename: 'art-class', title: 'Art Class Data' })}
          onPrint={() => print('Art Class Data')}
          onCopyToClipboard={() => copyToClipboard('tab')}
          onImportCSV={async (file) => { await importCSV(file); }}
          onImportJSON={async (file) => { await importJSON(file); }}
          theme={isDark ? 'dark' : 'light'}
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]"
        >
          <Plus className="w-5 h-5" />
          {t('tools.artClass.addClass', 'Add Class')}
        </button>
      </div>

      {showForm && (
        <div className={cardClass}>
          <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.artClass.newArtClass', 'New Art Class')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.artClass.className', 'Class Name')} value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClass}>
              {classTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder={t('tools.artClass.instructorName', 'Instructor Name')} value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.artClass.maxStudents', 'Max Students')} value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.artClass.durationMinutes', 'Duration (minutes)')} value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.artClass.price', 'Price ($)')} value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className={inputClass} />
            <input type="text" placeholder={t('tools.artClass.scheduleEGMon2', 'Schedule (e.g., Mon 2-4pm)')} value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className={inputClass} />
            <input type="text" placeholder={t('tools.artClass.materialsCommaSeparated', 'Materials (comma separated)')} value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })} className={inputClass} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addClass} disabled={!formData.name || !formData.instructor}
              className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50">
              {t('tools.artClass.saveClass', 'Save Class')}
            </button>
            <button onClick={() => setShowForm(false)}
              className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-[#333] text-white' : 'bg-gray-200 text-gray-900'}`}>
              {t('tools.artClass.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className={`${cardClass} text-center py-8`}>
            <Palette className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.artClass.noClassesAddedYet', 'No classes added yet')}</p>
          </div>
        ) : (
          classes.map(c => (
            <div key={c.id} className={cardClass}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{c.name}</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{c.type} • {c.instructor}</p>
                </div>
                <button onClick={() => removeClass(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0D9488]" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{c.enrolledStudents}/{c.maxStudents}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{c.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${c.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{c.schedule}</span>
                </div>
              </div>
              <button onClick={() => enrollStudent(c.id)} disabled={c.enrolledStudents >= c.maxStudents}
                className="text-sm px-3 py-1 bg-[#0D9488] text-white rounded hover:bg-[#0B8276] disabled:opacity-50">
                {t('tools.artClass.enrollStudent', 'Enroll Student')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArtClassTool;
