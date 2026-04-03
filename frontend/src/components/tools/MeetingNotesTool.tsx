import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2, Copy, Check, Save, Sparkles, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface GeneratedNotes {
  content: string;
  timestamp: Date;
}

interface MeetingNote {
  id: string;
  meetingTitle: string;
  attendees: string;
  rawNotes: string;
  generatedContent: string;
  outputFormat: string;
  createdAt: string;
}

const outputFormats = [
  { value: 'summary', label: 'Executive Summary' },
  { value: 'detailed', label: 'Detailed Notes' },
  { value: 'action-items', label: 'Action Items Only' },
  { value: 'bullet-points', label: 'Bullet Points' },
  { value: 'structured', label: 'Structured (Sections)' },
];

// Column configuration for exports
const MEETING_NOTES_COLUMNS: ColumnConfig[] = [
  { key: 'meetingTitle', header: 'Meeting Title', type: 'string' },
  { key: 'attendees', header: 'Attendees', type: 'string' },
  { key: 'outputFormat', header: 'Format', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

interface MeetingNotesToolProps {
  uiConfig?: UIConfig;
}

export const MeetingNotesTool: React.FC<MeetingNotesToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [meetingTitle, setMeetingTitle] = useState('');
  const [attendees, setAttendees] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [outputFormat, setOutputFormat] = useState(outputFormats[0].value);
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [includeDecisions, setIncludeDecisions] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNotes | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Use hook for backend sync
  const {
    data: savedNotes,
    addItem: addSavedNote,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MeetingNote>('meeting-notes', [], MEETING_NOTES_COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Apply prefill data from uiConfig.params or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.meetingTitle) {
          setMeetingTitle(params.meetingTitle);
          hasPrefill = true;
        }
        if (params.attendees) {
          setAttendees(params.attendees);
          hasPrefill = true;
        }
        if (params.rawNotes) {
          setRawNotes(params.rawNotes);
          hasPrefill = true;
        }
        if (params.outputFormat) {
          setOutputFormat(params.outputFormat);
          hasPrefill = true;
        }
        // Restore the generated content
        if (params.text) {
          setGeneratedNotes({
            content: params.text,
            timestamp: new Date(),
          });
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setRawNotes(params.text || params.content || '');
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!rawNotes.trim()) {
      setError('Please enter your meeting notes or transcript');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const systemMessage = `You are an expert at organizing and summarizing meeting notes. You extract key information, action items, and decisions clearly and professionally.`;

      const prompt = `Transform the following meeting notes into a well-organized ${outputFormat} format:

${meetingTitle ? `Meeting Title: ${meetingTitle}` : ''}
${attendees ? `Attendees: ${attendees}` : ''}

Raw Notes/Transcript:
${rawNotes}

Requirements:
- Format as ${outputFormat}
${includeActionItems ? '- Include a clear "Action Items" section with owners and deadlines if mentioned' : ''}
${includeDecisions ? '- Include a "Key Decisions" section highlighting decisions made' : ''}
- Identify and highlight important topics discussed
- Use clear, professional language
- Maintain the key points and context
- Add timestamps if available in the original notes

Please organize and format these notes professionally.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage,
        temperature: 0.5,
        maxTokens: 2000,
      });

      if (response.success && response.data?.text) {
        setGeneratedNotes({
          content: response.data.text,
          timestamp: new Date(),
        });
      } else {
        setError(response.error || 'Failed to process meeting notes');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing notes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedNotes) return;
    try {
      await navigator.clipboard.writeText(generatedNotes.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!generatedNotes) return;

    try {
      // Save to content library for Gallery view
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Meeting Notes: ${meetingTitle || 'Untitled Meeting'}`,
        prompt: `Meeting notes for ${meetingTitle || 'Untitled Meeting'}`,
        metadata: {
          text: generatedNotes.content,
          toolId: 'meeting-notes', // Tool ID for re-opening
          meetingTitle: meetingTitle || 'Untitled Meeting',
          attendees,
          rawNotes,
          outputFormat,
        },
      });

      // Also save to tool data for tool-specific history
      const newNote: MeetingNote = {
        id: Math.random().toString(36).substring(2, 11),
        meetingTitle: meetingTitle || 'Untitled Meeting',
        attendees,
        rawNotes,
        generatedContent: generatedNotes.content,
        outputFormat,
        createdAt: new Date().toISOString(),
      };
      addSavedNote(newNote);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : t('tools.meetingNotes.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <FileText className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.meetingNotes.aiMeetingNotesOrganizer', 'AI Meeting Notes Organizer')}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.meetingNotes.transformRawNotesIntoOrganized', 'Transform raw notes into organized summaries')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">
                  {isEditFromGallery ? t('tools.meetingNotes.restoredFromGallery', 'Restored from Gallery') : t('tools.meetingNotes.prefilled', 'Prefilled')}
                </span>
              </div>
            )}
            <ExportDropdown
              data={savedNotes}
              columns={MEETING_NOTES_COLUMNS}
              filename="meeting-notes"
              title={t('tools.meetingNotes.meetingNotesExport', 'Meeting Notes Export')}
              onExportCSV={() => exportToCSV(savedNotes, MEETING_NOTES_COLUMNS, 'meeting-notes')}
              onExportExcel={() => exportToExcel(savedNotes, MEETING_NOTES_COLUMNS, 'meeting-notes')}
              onExportJSON={() => exportToJSON(savedNotes, 'meeting-notes')}
              onExportPDF={() => exportToPDF(savedNotes, MEETING_NOTES_COLUMNS, 'Meeting Notes', 'meeting-notes')}
              onCopy={() => copyUtil(savedNotes, MEETING_NOTES_COLUMNS)}
              onPrint={() => printData(savedNotes, MEETING_NOTES_COLUMNS, 'Meeting Notes')}
              theme={theme}
            />
            <WidgetEmbedButton toolSlug="meeting-notes" toolName="Meeting Notes" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={theme}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Meeting Title */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.meetingNotes.meetingTitleOptional', 'Meeting Title (Optional)')}
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder={t('tools.meetingNotes.eGQ4PlanningSession', 'e.g., Q4 Planning Session')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Attendees */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.meetingNotes.attendeesOptional', 'Attendees (Optional)')}
          </label>
          <input
            type="text"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder={t('tools.meetingNotes.eGJohnSarahMike', 'e.g., John, Sarah, Mike, Lisa')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Raw Notes */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.meetingNotes.rawMeetingNotesTranscript', 'Raw Meeting Notes/Transcript *')}
          </label>
          <textarea
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder={t('tools.meetingNotes.pasteYourMeetingNotesTranscript', 'Paste your meeting notes, transcript, or bullet points here...')}
            rows={8}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.meetingNotes.outputFormat', 'Output Format')}</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            {outputFormats.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIncludeActionItems(!includeActionItems)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                includeActionItems ? 'bg-[#0D9488]' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  includeActionItems ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.meetingNotes.includeActionItemsSection', 'Include Action Items section')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIncludeDecisions(!includeDecisions)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                includeDecisions ? 'bg-[#0D9488]' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  includeDecisions ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.meetingNotes.includeKeyDecisionsSection', 'Include Key Decisions section')}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !rawNotes.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.meetingNotes.processingNotes', 'Processing Notes...')}
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              {t('tools.meetingNotes.organizeMeetingNotes', 'Organize Meeting Notes')}
            </>
          )}
        </button>

        {/* Generated Notes */}
        {generatedNotes && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <FileText className="w-4 h-4" />
                {t('tools.meetingNotes.organizedNotes', 'Organized Notes')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.meetingNotes.saved', 'Saved!')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg transition-colors text-sm`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      {t('tools.meetingNotes.copied', 'Copied!')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('tools.meetingNotes.copy', 'Copy')}
                    </>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'} rounded-lg transition-colors text-sm`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.meetingNotes.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl max-h-96 overflow-y-auto`}>
              <div className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none`}>
                {generatedNotes.content}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedNotes && !isGenerating && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.meetingNotes.yourOrganizedMeetingNotesWill', 'Your organized meeting notes will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingNotesTool;
