import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Plus, Syringe, Trash2, PawPrint, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  owner: string;
  ownerPhone: string;
}

interface Record {
  id: string;
  petId: string;
  petName: string;
  date: string;
  type: string;
  description: string;
  veterinarian: string;
  nextVisit?: string;
}

const species = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Reptile', 'Other'];
const recordTypes = ['Checkup', 'Vaccination', 'Surgery', 'Dental', 'Emergency', 'Grooming', 'Lab Work', 'X-Ray'];

// Column configurations for exports
const PET_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Pet Name', type: 'string' },
  { key: 'species', header: 'Species', type: 'string' },
  { key: 'breed', header: 'Breed', type: 'string' },
  { key: 'age', header: 'Age (years)', type: 'number' },
  { key: 'weight', header: 'Weight (lbs)', type: 'number' },
  { key: 'owner', header: 'Owner Name', type: 'string' },
  { key: 'ownerPhone', header: 'Owner Phone', type: 'string' },
];

const RECORD_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'type', header: 'Record Type', type: 'string' },
  { key: 'veterinarian', header: 'Veterinarian', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'nextVisit', header: 'Next Visit', type: 'date' },
];

interface VeterinaryRecordsToolProps {
  uiConfig?: UIConfig;
}

export const VeterinaryRecordsTool: React.FC<VeterinaryRecordsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pets' | 'records'>('pets');
  const [showForm, setShowForm] = useState(false);
  const [petForm, setPetForm] = useState({ name: '', species: 'Dog', breed: '', age: 1, weight: 0, owner: '', ownerPhone: '' });
  const [recordForm, setRecordForm] = useState({ petId: '', date: '', type: 'Checkup', description: '', veterinarian: '', nextVisit: '' });

  // Use the useToolData hook for pets with backend persistence
  const {
    data: pets,
    addItem: addPetItem,
    deleteItem: deletePetItem,
    exportCSV: exportPetsCSV,
    exportExcel: exportPetsExcel,
    exportJSON: exportPetsJSON,
    exportPDF: exportPetsPDF,
    importCSV: importPetsCSV,
    importJSON: importPetsJSON,
    copyToClipboard: copyPetsToClipboard,
    print: printPets,
    isLoading: isPetsLoading,
    isSaving: isPetsSaving,
    isSynced: isPetsSynced,
    lastSaved: petsLastSaved,
    syncError: petsSyncError,
    forceSync: forcePetsSync,
  } = useToolData<Pet>('veterinary-pets', [], PET_COLUMNS);

  // Use the useToolData hook for records with backend persistence
  const {
    data: records,
    addItem: addRecordItem,
    deleteItem: deleteRecordItem,
    exportCSV: exportRecordsCSV,
    exportExcel: exportRecordsExcel,
    exportJSON: exportRecordsJSON,
    exportPDF: exportRecordsPDF,
    importCSV: importRecordsCSV,
    importJSON: importRecordsJSON,
    copyToClipboard: copyRecordsToClipboard,
    print: printRecords,
    isLoading: isRecordsLoading,
    isSaving: isRecordsSaving,
    isSynced: isRecordsSynced,
    lastSaved: recordsLastSaved,
    syncError: recordsSyncError,
    forceSync: forceRecordsSync,
  } = useToolData<Record>('veterinary-records', [], RECORD_COLUMNS);

  // Combined loading state
  const isLoading = isPetsLoading || isRecordsLoading;

  // Get current sync status based on active tab
  const currentSyncStatus = useMemo(() => {
    if (activeTab === 'pets') {
      return {
        isSynced: isPetsSynced,
        isSaving: isPetsSaving,
        lastSaved: petsLastSaved,
        syncError: petsSyncError,
        forceSync: forcePetsSync,
      };
    }
    return {
      isSynced: isRecordsSynced,
      isSaving: isRecordsSaving,
      lastSaved: recordsLastSaved,
      syncError: recordsSyncError,
      forceSync: forceRecordsSync,
    };
  }, [activeTab, isPetsSynced, isPetsSaving, petsLastSaved, petsSyncError, forcePetsSync, isRecordsSynced, isRecordsSaving, recordsLastSaved, recordsSyncError, forceRecordsSync]);

  // Get current export data based on active tab
  const currentExportData = useMemo(() => {
    return activeTab === 'pets' ? pets : records;
  }, [activeTab, pets, records]);

  const exportFilename = activeTab === 'pets' ? 'veterinary-pets' : 'veterinary-records';
  const exportTitle = activeTab === 'pets' ? 'Veterinary Pets' : 'Veterinary Records';

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.petName) {
        setPetForm(prev => ({ ...prev, name: params.petName as string }));
        hasChanges = true;
      }
      if (params.ownerName) {
        setPetForm(prev => ({ ...prev, owner: params.ownerName as string }));
        hasChanges = true;
      }
      if (params.species) {
        setPetForm(prev => ({ ...prev, species: params.species as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addPet = () => {
    const newPet: Pet = { id: Date.now().toString(), ...petForm };
    addPetItem(newPet);
    setShowForm(false);
    setPetForm({ name: '', species: 'Dog', breed: '', age: 1, weight: 0, owner: '', ownerPhone: '' });
  };

  const addRecord = () => {
    const pet = pets.find(p => p.id === recordForm.petId);
    if (!pet) return;
    const newRecord: Record = { id: Date.now().toString(), petName: pet.name, ...recordForm };
    addRecordItem(newRecord);
    setShowForm(false);
    setRecordForm({ petId: '', date: '', type: 'Checkup', description: '', veterinarian: '', nextVisit: '' });
  };

  const deletePet = (id: string) => {
    deletePetItem(id);
    // Also delete associated records
    records.filter(r => r.petId === id).forEach(r => deleteRecordItem(r.id));
  };

  const deleteRecord = (id: string) => deleteRecordItem(id);

  const inputClass = `w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488]`;
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
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E]">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.veterinaryRecords.veterinaryRecords', 'Veterinary Records')}</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.veterinaryRecords.managePetRecordsAndMedical', 'Manage pet records and medical history')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="veterinary-records" toolName="Veterinary Records" />

          <SyncStatus
            isSynced={currentSyncStatus.isSynced}
            isSaving={currentSyncStatus.isSaving}
            lastSaved={currentSyncStatus.lastSaved}
            syncError={currentSyncStatus.syncError}
            onForceSync={currentSyncStatus.forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          {currentExportData.length > 0 && (
            <ExportDropdown
              onExportCSV={() => activeTab === 'pets' ? exportPetsCSV({ filename: exportFilename }) : exportRecordsCSV({ filename: exportFilename })}
              onExportExcel={() => activeTab === 'pets' ? exportPetsExcel({ filename: exportFilename }) : exportRecordsExcel({ filename: exportFilename })}
              onExportJSON={() => activeTab === 'pets' ? exportPetsJSON({ filename: exportFilename }) : exportRecordsJSON({ filename: exportFilename })}
              onExportPDF={async () => {
                const options = {
                  filename: exportFilename,
                  title: exportTitle,
                  subtitle: `${currentExportData.length} ${activeTab === 'pets' ? 'pet' : 'record'}${currentExportData.length !== 1 ? 's' : ''} recorded`,
                };
                activeTab === 'pets' ? await exportPetsPDF(options) : await exportRecordsPDF(options);
              }}
              onPrint={() => activeTab === 'pets' ? printPets(exportTitle) : printRecords(exportTitle)}
              onCopyToClipboard={() => activeTab === 'pets' ? copyPetsToClipboard('tab') : copyRecordsToClipboard('tab')}
              onImportCSV={async (file) => { activeTab === 'pets' ? await importPetsCSV(file) : await importRecordsCSV(file); }}
              onImportJSON={async (file) => { activeTab === 'pets' ? await importPetsJSON(file) : await importRecordsJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-[#0D9488]/10 rounded-lg"><PawPrint className="w-6 h-6 text-[#0D9488]" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.veterinaryRecords.totalPets', 'Total Pets')}</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pets.length}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-purple-500/10 rounded-lg"><Stethoscope className="w-6 h-6 text-purple-500" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.veterinaryRecords.totalRecords', 'Total Records')}</p>
            <p className="text-xl font-bold text-purple-500">{records.length}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-blue-500/10 rounded-lg"><Syringe className="w-6 h-6 text-blue-500" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.veterinaryRecords.vaccinations', 'Vaccinations')}</p>
            <p className="text-xl font-bold text-blue-500">{records.filter(r => r.type === 'Vaccination').length}</p></div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['pets', 'records'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'text-[#0D9488] border-b-2 border-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {tab}
          </button>
        ))}
        <button onClick={() => setShowForm(!showForm)} className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]">
          <Plus className="w-5 h-5" />Add {activeTab === 'pets' ? t('tools.veterinaryRecords.pet', 'Pet') : t('tools.veterinaryRecords.record', 'Record')}
        </button>
      </div>

      {showForm && activeTab === 'pets' && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.veterinaryRecords.petName', 'Pet Name')} value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} className={inputClass} />
            <select value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value })} className={inputClass}>
              {species.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder={t('tools.veterinaryRecords.breed', 'Breed')} value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.veterinaryRecords.ageYears', 'Age (years)')} value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.veterinaryRecords.weightLbs', 'Weight (lbs)')} value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: parseFloat(e.target.value) })} className={inputClass} />
            <input type="text" placeholder={t('tools.veterinaryRecords.ownerName', 'Owner Name')} value={petForm.owner} onChange={(e) => setPetForm({ ...petForm, owner: e.target.value })} className={inputClass} />
            <input type="tel" placeholder={t('tools.veterinaryRecords.ownerPhone', 'Owner Phone')} value={petForm.ownerPhone} onChange={(e) => setPetForm({ ...petForm, ownerPhone: e.target.value })} className={inputClass} />
            <button onClick={addPet} disabled={!petForm.name || !petForm.owner} className="px-4 py-3 bg-[#0D9488] text-white rounded-lg disabled:opacity-50">{t('tools.veterinaryRecords.savePet', 'Save Pet')}</button>
          </div>
        </div>
      )}

      {showForm && activeTab === 'records' && pets.length > 0 && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={recordForm.petId} onChange={(e) => setRecordForm({ ...recordForm, petId: e.target.value })} className={inputClass}>
              <option value="">{t('tools.veterinaryRecords.selectPet', 'Select Pet')}</option>
              {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
            </select>
            <input type="date" value={recordForm.date} onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })} className={inputClass} />
            <select value={recordForm.type} onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })} className={inputClass}>
              {recordTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder={t('tools.veterinaryRecords.veterinarian', 'Veterinarian')} value={recordForm.veterinarian} onChange={(e) => setRecordForm({ ...recordForm, veterinarian: e.target.value })} className={inputClass} />
            <textarea placeholder={t('tools.veterinaryRecords.descriptionNotes', 'Description/Notes')} value={recordForm.description} onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })} className={`${inputClass} md:col-span-2`} rows={2} />
            <input type="date" placeholder={t('tools.veterinaryRecords.nextVisit', 'Next Visit')} value={recordForm.nextVisit} onChange={(e) => setRecordForm({ ...recordForm, nextVisit: e.target.value })} className={inputClass} />
            <button onClick={addRecord} disabled={!recordForm.petId || !recordForm.date} className="px-4 py-3 bg-[#0D9488] text-white rounded-lg disabled:opacity-50">{t('tools.veterinaryRecords.saveRecord', 'Save Record')}</button>
          </div>
        </div>
      )}

      {activeTab === 'pets' && (
        <div className="space-y-3">
          {pets.map(p => (
            <div key={p.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.name}</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{p.species} • {p.breed} • {p.age} yrs • {p.weight} lbs</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Owner: {p.owner} • {p.ownerPhone}</p>
                </div>
                <button onClick={() => deletePet(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-3">
          {records.map(r => (
            <div key={r.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{r.petName} - {r.type}</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{r.date} • Dr. {r.veterinarian}</p>
                  {r.description && <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{r.description}</p>}
                  {r.nextVisit && <p className="text-sm text-[#0D9488]">Next visit: {r.nextVisit}</p>}
                </div>
                <button onClick={() => deleteRecord(r.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VeterinaryRecordsTool;
