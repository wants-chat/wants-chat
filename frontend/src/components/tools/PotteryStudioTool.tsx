import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleDot, Users, Calendar, DollarSign, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface ClassSession {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  maxStudents: number;
  enrolled: number;
  price: number;
  instructor: string;
}

interface KilnReservation {
  id: string;
  student: string;
  date: string;
  time: string;
  duration: number;
  pieces: number;
}

const classTypes = ['Wheel Throwing', 'Hand Building', 'Glazing', 'Sculpting', 'Raku Firing', 'Kids Class'];

const CLASS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Class Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'instructor', header: 'Instructor', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'maxStudents', header: 'Max Students', type: 'number' },
  { key: 'enrolled', header: 'Enrolled', type: 'number' },
  { key: 'price', header: 'Price', type: 'currency' },
];

const KILN_COLUMNS: ColumnConfig[] = [
  { key: 'student', header: 'Student', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'duration', header: 'Duration (hours)', type: 'number' },
  { key: 'pieces', header: 'Pieces', type: 'number' },
];

interface PotteryStudioToolProps {
  uiConfig?: UIConfig;
}

export const PotteryStudioTool: React.FC<PotteryStudioToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'kiln'>('classes');
  const [showForm, setShowForm] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', type: 'Wheel Throwing', date: '', time: '10:00', maxStudents: 8, price: 65, instructor: '' });
  const [kilnForm, setKilnForm] = useState({ student: '', date: '', time: '09:00', duration: 2, pieces: 1 });

  // Use useToolData hook for backend persistence - Classes
  const {
    data: classes,
    addItem: addClassItem,
    updateItem: updateClassItem,
    deleteItem: deleteClassItem,
    exportCSV: exportClassesCSV,
    exportExcel: exportClassesExcel,
    exportJSON: exportClassesJSON,
    exportPDF: exportClassesPDF,
    importCSV: importClassesCSV,
    importJSON: importClassesJSON,
    copyToClipboard: copyClassesToClipboard,
    print: printClasses,
    isLoading: isLoadingClasses,
    isSaving: isSavingClasses,
    isSynced: isSyncedClasses,
    lastSaved: lastSavedClasses,
    syncError: syncErrorClasses,
    forceSync: forceSyncClasses,
  } = useToolData<ClassSession>('pottery-studio-classes', [], CLASS_COLUMNS);

  // Use useToolData hook for backend persistence - Kiln Reservations
  const {
    data: kilnReservations,
    addItem: addKilnItem,
    deleteItem: deleteKilnItem,
    exportCSV: exportKilnCSV,
    exportExcel: exportKilnExcel,
    exportJSON: exportKilnJSON,
    exportPDF: exportKilnPDF,
    importCSV: importKilnCSV,
    importJSON: importKilnJSON,
    copyToClipboard: copyKilnToClipboard,
    print: printKiln,
    isLoading: isLoadingKiln,
    isSaving: isSavingKiln,
    isSynced: isSyncedKiln,
    lastSaved: lastSavedKiln,
    syncError: syncErrorKiln,
    forceSync: forceSyncKiln,
  } = useToolData<KilnReservation>('pottery-studio-kiln', [], KILN_COLUMNS);

  const isLoading = isLoadingClasses || isLoadingKiln;

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.classType && classTypes.includes(params.classType)) {
        setClassForm(prev => ({ ...prev, type: params.classType as string }));
        hasChanges = true;
      }
      if (params.maxStudents) {
        setClassForm(prev => ({ ...prev, maxStudents: params.maxStudents as number }));
        hasChanges = true;
      }
      if (params.price) {
        setClassForm(prev => ({ ...prev, price: params.price as number }));
        hasChanges = true;
      }
      if (params.instructor) {
        setClassForm(prev => ({ ...prev, instructor: params.instructor as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addClass = () => {
    const newClass: ClassSession = { id: Date.now().toString(), ...classForm, enrolled: 0 };
    addClassItem(newClass);
    setShowForm(false);
    setClassForm({ name: '', type: 'Wheel Throwing', date: '', time: '10:00', maxStudents: 8, price: 65, instructor: '' });
  };

  const addKilnReservation = () => {
    const newRes: KilnReservation = { id: Date.now().toString(), ...kilnForm };
    addKilnItem(newRes);
    setShowForm(false);
    setKilnForm({ student: '', date: '', time: '09:00', duration: 2, pieces: 1 });
  };

  const enrollStudent = (id: string) => {
    const classToUpdate = classes.find(c => c.id === id);
    if (classToUpdate && classToUpdate.enrolled < classToUpdate.maxStudents) {
      updateClassItem(id, { enrolled: classToUpdate.enrolled + 1 });
    }
  };

  const deleteClass = (id: string) => deleteClassItem(id);
  const deleteKilnRes = (id: string) => deleteKilnItem(id);

  const totalRevenue = classes.reduce((sum, c) => sum + c.enrolled * c.price, 0);

  // Export helpers - use hook's export functions based on active tab
  const handleExportCSV = () => {
    if (activeTab === 'classes') {
      exportClassesCSV({ filename: 'pottery-classes' });
    } else {
      exportKilnCSV({ filename: 'kiln-reservations' });
    }
  };

  const handleExportExcel = () => {
    if (activeTab === 'classes') {
      exportClassesExcel({ filename: 'pottery-classes' });
    } else {
      exportKilnExcel({ filename: 'kiln-reservations' });
    }
  };

  const handleExportJSON = () => {
    if (activeTab === 'classes') {
      exportClassesJSON({ filename: 'pottery-classes' });
    } else {
      exportKilnJSON({ filename: 'kiln-reservations' });
    }
  };

  const handleExportPDF = async () => {
    if (activeTab === 'classes') {
      await exportClassesPDF({ filename: 'pottery-classes', title: 'Pottery Classes Report' });
    } else {
      await exportKilnPDF({ filename: 'kiln-reservations', title: 'Kiln Reservations Report' });
    }
  };

  const handleCopy = async (): Promise<boolean> => {
    if (activeTab === 'classes') {
      return await copyClassesToClipboard('tab');
    } else {
      return await copyKilnToClipboard('tab');
    }
  };

  const handlePrint = () => {
    if (activeTab === 'classes') {
      printClasses('Pottery Classes');
    } else {
      printKiln('Kiln Reservations');
    }
  };

  const handleImportCSV = async (file: File) => {
    if (activeTab === 'classes') {
      await importClassesCSV(file);
    } else {
      await importKilnCSV(file);
    }
  };

  const handleImportJSON = async (file: File) => {
    if (activeTab === 'classes') {
      await importClassesJSON(file);
    } else {
      await importKilnJSON(file);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  const inputClass = `w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488]`;
  const cardClass = `p-4 rounded-lg ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <CircleDot className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.potteryStudio.potteryStudio', 'Pottery Studio')}</h2>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.potteryStudio.manageClassesAndKilnReservations', 'Manage classes and kiln reservations')}</p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.potteryStudio.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-[#0D9488]/10 rounded-lg"><Calendar className="w-6 h-6 text-[#0D9488]" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.potteryStudio.classes', 'Classes')}</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{classes.length}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-orange-500/10 rounded-lg"><CircleDot className="w-6 h-6 text-orange-500" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.potteryStudio.kilnBookings', 'Kiln Bookings')}</p>
            <p className="text-xl font-bold text-orange-500">{kilnReservations.length}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-green-500" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.potteryStudio.revenue', 'Revenue')}</p>
            <p className="text-xl font-bold text-green-500">${totalRevenue}</p></div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['classes', 'kiln'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'text-[#0D9488] border-b-2 border-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {tab === 'kiln' ? t('tools.potteryStudio.kilnReservations', 'Kiln Reservations') : t('tools.potteryStudio.classes2', 'Classes')}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <WidgetEmbedButton toolSlug="pottery-studio" toolName="Pottery Studio" />

          <SyncStatus
            isSynced={activeTab === 'classes' ? isSyncedClasses : isSyncedKiln}
            isSaving={activeTab === 'classes' ? isSavingClasses : isSavingKiln}
            lastSaved={activeTab === 'classes' ? lastSavedClasses : lastSavedKiln}
            syncError={activeTab === 'classes' ? syncErrorClasses : syncErrorKiln}
            onForceSync={activeTab === 'classes' ? forceSyncClasses : forceSyncKiln}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onCopyToClipboard={handleCopy}
            onPrint={handlePrint}
            onImportCSV={handleImportCSV}
            onImportJSON={handleImportJSON}
            theme={isDark ? 'dark' : 'light'}
          />
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]">
            <Plus className="w-5 h-5" />Add
          </button>
        </div>
      </div>

      {showForm && activeTab === 'classes' && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.potteryStudio.className', 'Class Name')} value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className={inputClass} />
            <select value={classForm.type} onChange={(e) => setClassForm({ ...classForm, type: e.target.value })} className={inputClass}>
              {classTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder={t('tools.potteryStudio.instructor', 'Instructor')} value={classForm.instructor} onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })} className={inputClass} />
            <input type="date" value={classForm.date} onChange={(e) => setClassForm({ ...classForm, date: e.target.value })} className={inputClass} />
            <input type="time" value={classForm.time} onChange={(e) => setClassForm({ ...classForm, time: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.potteryStudio.maxStudents', 'Max Students')} value={classForm.maxStudents} onChange={(e) => setClassForm({ ...classForm, maxStudents: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.potteryStudio.price', 'Price ($)')} value={classForm.price} onChange={(e) => setClassForm({ ...classForm, price: parseFloat(e.target.value) })} className={inputClass} />
            <button onClick={addClass} disabled={!classForm.name || !classForm.date} className="px-4 py-3 bg-[#0D9488] text-white rounded-lg disabled:opacity-50">{t('tools.potteryStudio.save', 'Save')}</button>
          </div>
        </div>
      )}

      {showForm && activeTab === 'kiln' && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.potteryStudio.studentName', 'Student Name')} value={kilnForm.student} onChange={(e) => setKilnForm({ ...kilnForm, student: e.target.value })} className={inputClass} />
            <input type="date" value={kilnForm.date} onChange={(e) => setKilnForm({ ...kilnForm, date: e.target.value })} className={inputClass} />
            <input type="time" value={kilnForm.time} onChange={(e) => setKilnForm({ ...kilnForm, time: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.potteryStudio.durationHours', 'Duration (hours)')} value={kilnForm.duration} onChange={(e) => setKilnForm({ ...kilnForm, duration: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.potteryStudio.pieces', 'Pieces')} value={kilnForm.pieces} onChange={(e) => setKilnForm({ ...kilnForm, pieces: parseInt(e.target.value) })} className={inputClass} />
            <button onClick={addKilnReservation} disabled={!kilnForm.student || !kilnForm.date} className="px-4 py-3 bg-[#0D9488] text-white rounded-lg disabled:opacity-50">{t('tools.potteryStudio.save2', 'Save')}</button>
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="space-y-3">
          {classes.map(c => (
            <div key={c.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{c.name}</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{c.type} • {c.instructor} • {c.date} at {c.time}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{c.enrolled}/{c.maxStudents} enrolled • ${c.price}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => enrollStudent(c.id)} disabled={c.enrolled >= c.maxStudents} className="text-sm px-3 py-1 bg-[#0D9488] text-white rounded disabled:opacity-50">{t('tools.potteryStudio.enroll', 'Enroll')}</button>
                  <button onClick={() => deleteClass(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kiln' && (
        <div className="space-y-3">
          {kilnReservations.map(r => (
            <div key={r.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{r.student}</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{r.date} at {r.time} • {r.duration} hours • {r.pieces} pieces</p>
                </div>
                <button onClick={() => deleteKilnRes(r.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotteryStudioTool;
