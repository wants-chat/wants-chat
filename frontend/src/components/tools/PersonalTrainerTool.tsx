import React, { useState, useEffect } from 'react';
import { Dumbbell, Users, Calendar, DollarSign, Plus, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Client {
  id: string;
  name: string;
  email: string;
  goal: string;
  sessionsRemaining: number;
  sessionPrice: number;
  nextSession: string;
}

interface Session {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  completed: boolean;
}

const goals = ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Strength Training', 'Flexibility', 'Sports Performance'];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'goal', header: 'Goal', type: 'string' },
  { key: 'sessionsRemaining', header: 'Sessions Remaining', type: 'number' },
  { key: 'sessionPrice', header: 'Price/Session', type: 'currency' },
  { key: 'nextSession', header: 'Next Session', type: 'date' },
];

const SESSION_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'completed', header: 'Completed', type: 'boolean' },
];

interface PersonalTrainerToolProps {
  uiConfig?: UIConfig;
}

export const PersonalTrainerTool: React.FC<PersonalTrainerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'sessions'>('clients');
  const [showForm, setShowForm] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', email: '', goal: 'Weight Loss', sessionsRemaining: 10, sessionPrice: 60, nextSession: '' });
  const [sessionForm, setSessionForm] = useState({ clientId: '', date: '', time: '', duration: 60, notes: '' });

  // Use the useToolData hook for backend persistence - Clients
  const {
    data: clients,
    addItem: addClientItem,
    updateItem: updateClientItem,
    deleteItem: deleteClientItem,
    exportCSV: exportClientsCSV,
    exportExcel: exportClientsExcel,
    exportJSON: exportClientsJSON,
    exportPDF: exportClientsPDF,
    importCSV: importClientsCSV,
    importJSON: importClientsJSON,
    copyToClipboard: copyClientsToClipboard,
    print: printClients,
    isLoading: isLoadingClients,
    isSaving: isSavingClients,
    isSynced: isSyncedClients,
    lastSaved: lastSavedClients,
    syncError: syncErrorClients,
    forceSync: forceSyncClients,
  } = useToolData<Client>('personal-trainer-clients', [], CLIENT_COLUMNS);

  // Use the useToolData hook for backend persistence - Sessions
  const {
    data: sessions,
    addItem: addSessionItem,
    updateItem: updateSessionItem,
    deleteItem: deleteSessionItem,
    exportCSV: exportSessionsCSV,
    exportExcel: exportSessionsExcel,
    exportJSON: exportSessionsJSON,
    exportPDF: exportSessionsPDF,
    importCSV: importSessionsCSV,
    importJSON: importSessionsJSON,
    copyToClipboard: copySessionsToClipboard,
    print: printSessions,
    isLoading: isLoadingSessions,
    isSaving: isSavingSessions,
    isSynced: isSyncedSessions,
    lastSaved: lastSavedSessions,
    syncError: syncErrorSessions,
    forceSync: forceSyncSessions,
  } = useToolData<Session>('personal-trainer-sessions', [], SESSION_COLUMNS);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.clientName) {
        setClientForm(prev => ({ ...prev, name: params.clientName as string }));
        hasChanges = true;
      }
      if (params.email) {
        setClientForm(prev => ({ ...prev, email: params.email as string }));
        hasChanges = true;
      }
      if (params.goal) {
        setClientForm(prev => ({ ...prev, goal: params.goal as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addClient = () => {
    const newClient: Client = { id: Date.now().toString(), ...clientForm };
    addClientItem(newClient);
    setShowForm(false);
    setClientForm({ name: '', email: '', goal: 'Weight Loss', sessionsRemaining: 10, sessionPrice: 60, nextSession: '' });
  };

  const addSession = () => {
    const client = clients.find(c => c.id === sessionForm.clientId);
    if (!client) return;
    const newSession: Session = { id: Date.now().toString(), clientName: client.name, ...sessionForm, completed: false };
    addSessionItem(newSession);
    setShowForm(false);
    setSessionForm({ clientId: '', date: '', time: '', duration: 60, notes: '' });
  };

  const completeSession = (id: string) => {
    updateSessionItem(id, { completed: true });
    const session = sessions.find(s => s.id === id);
    if (session) {
      const client = clients.find(c => c.id === session.clientId);
      if (client) {
        updateClientItem(client.id, { sessionsRemaining: Math.max(0, client.sessionsRemaining - 1) });
      }
    }
  };

  const deleteClient = (id: string) => deleteClientItem(id);
  const deleteSession = (id: string) => deleteSessionItem(id);

  const totalClients = clients.length;
  const upcomingSessions = sessions.filter(s => !s.completed).length;
  const monthlyRevenue = sessions.filter(s => s.completed).length * (clients[0]?.sessionPrice || 60);

  const inputClass = `w-full p-3 rounded-lg border ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488]`;
  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

  // Loading state
  if (isLoadingClients || isLoadingSessions) {
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
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.personalTrainer.personalTrainerTool', 'Personal Trainer Tool')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.personalTrainer.manageClientsAndTrainingSessions', 'Manage clients and training sessions')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-[#0D9488]/10 rounded-lg"><Users className="w-6 h-6 text-[#0D9488]" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.personalTrainer.totalClients', 'Total Clients')}</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalClients}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-purple-500/10 rounded-lg"><Calendar className="w-6 h-6 text-purple-500" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.personalTrainer.upcomingSessions', 'Upcoming Sessions')}</p>
            <p className="text-xl font-bold text-purple-500">{upcomingSessions}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-green-500" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.personalTrainer.revenue', 'Revenue')}</p>
            <p className="text-xl font-bold text-green-500">${monthlyRevenue}</p></div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['clients', 'sessions'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'text-[#0D9488] border-b-2 border-[#0D9488]' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {tab}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <WidgetEmbedButton toolSlug="personal-trainer" toolName="Personal Trainer" />

          <SyncStatus
            isSynced={activeTab === 'clients' ? isSyncedClients : isSyncedSessions}
            isSaving={activeTab === 'clients' ? isSavingClients : isSavingSessions}
            lastSaved={activeTab === 'clients' ? lastSavedClients : lastSavedSessions}
            syncError={activeTab === 'clients' ? syncErrorClients : syncErrorSessions}
            onForceSync={activeTab === 'clients' ? forceSyncClients : forceSyncSessions}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => activeTab === 'clients'
              ? exportClientsCSV({ filename: 'personal-trainer-clients' })
              : exportSessionsCSV({ filename: 'personal-trainer-sessions' })}
            onExportExcel={() => activeTab === 'clients'
              ? exportClientsExcel({ filename: 'personal-trainer-clients' })
              : exportSessionsExcel({ filename: 'personal-trainer-sessions' })}
            onExportJSON={() => activeTab === 'clients'
              ? exportClientsJSON({ filename: 'personal-trainer-clients' })
              : exportSessionsJSON({ filename: 'personal-trainer-sessions' })}
            onExportPDF={async () => activeTab === 'clients'
              ? await exportClientsPDF({ filename: 'personal-trainer-clients', title: 'Clients Report' })
              : await exportSessionsPDF({ filename: 'personal-trainer-sessions', title: 'Training Sessions Report' })}
            onPrint={() => activeTab === 'clients'
              ? printClients('Personal Trainer - Clients')
              : printSessions('Personal Trainer - Sessions')}
            onCopyToClipboard={() => activeTab === 'clients'
              ? copyClientsToClipboard('tab')
              : copySessionsToClipboard('tab')}
            onImportCSV={async (file) => activeTab === 'clients'
              ? await importClientsCSV(file)
              : await importSessionsCSV(file)}
            onImportJSON={async (file) => activeTab === 'clients'
              ? await importClientsJSON(file)
              : await importSessionsJSON(file)}
            theme={isDark ? 'dark' : 'light'}
          />
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]">
            <Plus className="w-5 h-5" />Add {activeTab === 'clients' ? t('tools.personalTrainer.client', 'Client') : t('tools.personalTrainer.session', 'Session')}
          </button>
        </div>
      </div>

      {showForm && activeTab === 'clients' && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.personalTrainer.clientName', 'Client Name')} value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className={inputClass} />
            <input type="email" placeholder={t('tools.personalTrainer.email', 'Email')} value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} className={inputClass} />
            <select value={clientForm.goal} onChange={(e) => setClientForm({ ...clientForm, goal: e.target.value })} className={inputClass}>
              {goals.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input type="number" placeholder={t('tools.personalTrainer.sessions', 'Sessions')} value={clientForm.sessionsRemaining} onChange={(e) => setClientForm({ ...clientForm, sessionsRemaining: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.personalTrainer.priceSession', 'Price/Session')} value={clientForm.sessionPrice} onChange={(e) => setClientForm({ ...clientForm, sessionPrice: parseFloat(e.target.value) })} className={inputClass} />
            <input type="date" value={clientForm.nextSession} onChange={(e) => setClientForm({ ...clientForm, nextSession: e.target.value })} className={inputClass} />
          </div>
          <button onClick={addClient} disabled={!clientForm.name} className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg disabled:opacity-50">{t('tools.personalTrainer.saveClient', 'Save Client')}</button>
        </div>
      )}

      {showForm && activeTab === 'sessions' && clients.length > 0 && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={sessionForm.clientId} onChange={(e) => setSessionForm({ ...sessionForm, clientId: e.target.value })} className={inputClass}>
              <option value="">{t('tools.personalTrainer.selectClient', 'Select Client')}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} className={inputClass} />
            <input type="time" value={sessionForm.time} onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.personalTrainer.durationMin', 'Duration (min)')} value={sessionForm.duration} onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })} className={inputClass} />
            <textarea placeholder={t('tools.personalTrainer.notes', 'Notes')} value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} className={`${inputClass} md:col-span-2`} rows={2} />
          </div>
          <button onClick={addSession} disabled={!sessionForm.clientId || !sessionForm.date} className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg disabled:opacity-50">{t('tools.personalTrainer.saveSession', 'Save Session')}</button>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="space-y-3">
          {clients.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.personalTrainer.noClientsYetAddYour', 'No clients yet. Add your first client to get started!')}</p>
            </div>
          )}
          {clients.map(c => (
            <div key={c.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.name}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{c.email} • {c.goal}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{c.sessionsRemaining} sessions left • ${c.sessionPrice}/session</p>
                </div>
                <button onClick={() => deleteClient(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.personalTrainer.noSessionsYetAddYour', 'No sessions yet. Add your first session to get started!')}</p>
            </div>
          )}
          {sessions.map(s => (
            <div key={s.id} className={`${cardClass} ${s.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.clientName}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.date} at {s.time} • {s.duration} min</p>
                  {s.notes && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.notes}</p>}
                </div>
                <div className="flex gap-2">
                  {!s.completed && <button onClick={() => completeSession(s.id)} className="text-sm px-3 py-1 bg-green-500 text-white rounded">{t('tools.personalTrainer.complete', 'Complete')}</button>}
                  <button onClick={() => deleteSession(s.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalTrainerTool;
