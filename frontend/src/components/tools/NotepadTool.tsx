import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Trash2, Copy, Check, Download, Search, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'content', header: 'Content', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

interface NotepadToolProps {
  uiConfig?: UIConfig;
}

export const NotepadTool: React.FC<NotepadToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: notes,
    setData: setNotes,
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
  } = useToolData<Note>('notepad', [], COLUMNS);

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Set active note when notes load
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params && !isLoading) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        const newNote: Note = {
          id: Date.now().toString(),
          title: 'New Note',
          content: params.text || params.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addItem(newNote);
        setActiveNoteId(newNote.id);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isLoading]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `Note ${notes.length + 1}`,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(newNote);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    deleteItem(id);
    if (activeNoteId === id) {
      const remainingNotes = notes.filter(n => n.id !== id);
      setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
  };

  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    if (!activeNoteId) return;
    updateItem(activeNoteId, {
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const copyNote = async () => {
    if (!activeNote) return;
    try {
      await navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = `${activeNote.title}\n\n${activeNote.content}`;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (execErr) {
        console.error('Failed to copy:', execErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([`${activeNote.title}\n\n${activeNote.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = activeNote?.content.trim().split(/\s+/).filter(Boolean).length || 0;
  const charCount = activeNote?.content.length || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.notepad.notepad', 'Notepad')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.notepad.quickNotesThatSyncAcross', 'Quick notes that sync across devices')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">{t('tools.notepad.prefilled', 'Prefilled')}</span>
              </div>
            )}
            <WidgetEmbedButton toolSlug="notepad" toolName="Notepad" />

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
              onExportCSV={() => exportCSV({ filename: 'notepad_notes' })}
              onExportExcel={() => exportExcel({ filename: 'notepad_notes' })}
              onExportJSON={() => exportJSON({ filename: 'notepad_notes' })}
              onExportPDF={() => exportPDF({ filename: 'notepad_notes', title: 'Notepad Notes' })}
              onPrint={() => print('Notepad Notes')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={notes.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="flex h-[500px]">
        {/* Sidebar */}
        <div className={`w-64 border-r ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex flex-col`}>
          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools.notepad.searchNotes', 'Search notes...')}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* New Note Button */}
          <div className="px-3 pb-3">
            <button
              onClick={createNote}
              className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.notepad.newNote', 'New Note')}
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors group ${
                  activeNoteId === note.id
                    ? isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-900'
                    : isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{note.title}</div>
                    <div className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {note.content.substring(0, 50) || 'Empty note'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                      isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {activeNote ? (
            <>
              {/* Note Title */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateNote('title', e.target.value)}
                  className={`w-full text-xl font-semibold bg-transparent border-none outline-none ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder={t('tools.notepad.noteTitle', 'Note title...')}
                />
              </div>

              {/* Note Content */}
              <div className="flex-1 p-4">
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote('content', e.target.value)}
                  placeholder={t('tools.notepad.startWriting', 'Start writing...')}
                  className={`w-full h-full resize-none bg-transparent border-none outline-none ${
                    isDark ? 'text-gray-300 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Footer */}
              <div className={`px-4 py-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {wordCount} words · {charCount} characters
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyNote}
                    className={`p-2 rounded-lg transition-colors ${
                      copied ? 'bg-green-500 text-white' : isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    title={t('tools.notepad.copyNote', 'Copy note')}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={downloadNote}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    title={t('tools.notepad.downloadNote', 'Download note')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.notepad.selectANoteOrCreate', 'Select a note or create a new one')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotepadTool;
