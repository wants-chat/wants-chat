'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Scale,
  Users,
  Building,
  FileCheck,
  Clock,
  AlertCircle,
  Hash,
  Copy,
  ChevronDown,
  ChevronUp,
  Gavel,
  BookOpen,
  CheckCircle2,
  LayoutList,
  Paperclip,
  Download,
  Eye,
  RefreshCw,
  MapPin,
  User,
  Briefcase,
  ListOrdered,
  PenTool,
  History,
  MessageSquare,
  Flag,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';

// Types
interface Party {
  id: string;
  name: string;
  role: 'plaintiff' | 'defendant' | 'petitioner' | 'respondent' | 'appellant' | 'appellee' | 'cross-claimant' | 'third-party-defendant';
  type: 'individual' | 'corporation' | 'llc' | 'partnership' | 'government' | 'trust' | 'estate' | 'other';
  address: string;
  phone: string;
  email: string;
  attorney: string;
  attorneyBar: string;
  proSe: boolean;
}

interface Exhibit {
  id: string;
  number: string;
  description: string;
  documentType: string;
  dateOfDocument: string;
  batesStart: string;
  batesEnd: string;
  status: 'pending' | 'attached' | 'filed' | 'rejected';
  notes: string;
}

interface Paragraph {
  id: string;
  number: number;
  content: string;
  type: 'allegation' | 'admission' | 'denial' | 'affirmative-defense' | 'prayer' | 'general' | 'incorporation';
  exhibitRefs: string[];
  citations: string[];
}

interface DraftVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string;
  status: 'draft' | 'review' | 'approved' | 'filed';
}

interface ReviewComment {
  id: string;
  paragraphId: string;
  author: string;
  content: string;
  createdAt: string;
  resolved: boolean;
}

interface Pleading {
  id: string;
  caseNumber: string;
  caseName: string;
  court: string;
  jurisdiction: string;
  division: string;
  judge: string;
  pleadingType: 'complaint' | 'answer' | 'motion' | 'response' | 'reply' | 'cross-complaint' | 'counterclaim' | 'amended-complaint' | 'demurrer' | 'motion-to-dismiss' | 'summary-judgment' | 'opposition' | 'petition' | 'memorandum' | 'declaration' | 'stipulation';
  title: string;
  parties: Party[];
  paragraphs: Paragraph[];
  exhibits: Exhibit[];
  versions: DraftVersion[];
  comments: ReviewComment[];
  prayerForRelief: string[];
  verificationRequired: boolean;
  verificationText: string;
  signatureBlock: string;
  filingDeadline: string;
  status: 'drafting' | 'review' | 'approved' | 'filed' | 'served';
  formatStyle: 'federal' | 'california' | 'new-york' | 'texas' | 'florida' | 'custom';
  lineNumbering: boolean;
  doubleSpaced: boolean;
  localRules: string;
  createdAt: string;
  updatedAt: string;
}

interface PleadingDrafterToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'pleading-drafter';

const pleadingColumns: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case Number', type: 'string' },
  { key: 'caseName', header: 'Case Name', type: 'string' },
  { key: 'pleadingType', header: 'Type', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'court', header: 'Court', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'filingDeadline', header: 'Deadline', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewPleading = (): Pleading => ({
  id: crypto.randomUUID(),
  caseNumber: '',
  caseName: '',
  court: '',
  jurisdiction: '',
  division: '',
  judge: '',
  pleadingType: 'complaint',
  title: '',
  parties: [],
  paragraphs: [],
  exhibits: [],
  versions: [],
  comments: [],
  prayerForRelief: [],
  verificationRequired: false,
  verificationText: '',
  signatureBlock: '',
  filingDeadline: '',
  status: 'drafting',
  formatStyle: 'federal',
  lineNumbering: true,
  doubleSpaced: true,
  localRules: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewParty = (): Party => ({
  id: crypto.randomUUID(),
  name: '',
  role: 'plaintiff',
  type: 'individual',
  address: '',
  phone: '',
  email: '',
  attorney: '',
  attorneyBar: '',
  proSe: false,
});

const createNewParagraph = (number: number): Paragraph => ({
  id: crypto.randomUUID(),
  number,
  content: '',
  type: 'allegation',
  exhibitRefs: [],
  citations: [],
});

const createNewExhibit = (number: string): Exhibit => ({
  id: crypto.randomUUID(),
  number,
  description: '',
  documentType: '',
  dateOfDocument: '',
  batesStart: '',
  batesEnd: '',
  status: 'pending',
  notes: '',
});

const pleadingTypes = [
  { value: 'complaint', label: 'Complaint' },
  { value: 'answer', label: 'Answer' },
  { value: 'motion', label: 'Motion' },
  { value: 'response', label: 'Response to Motion' },
  { value: 'reply', label: 'Reply' },
  { value: 'cross-complaint', label: 'Cross-Complaint' },
  { value: 'counterclaim', label: 'Counterclaim' },
  { value: 'amended-complaint', label: 'Amended Complaint' },
  { value: 'demurrer', label: 'Demurrer' },
  { value: 'motion-to-dismiss', label: 'Motion to Dismiss' },
  { value: 'summary-judgment', label: 'Motion for Summary Judgment' },
  { value: 'opposition', label: 'Opposition' },
  { value: 'petition', label: 'Petition' },
  { value: 'memorandum', label: 'Memorandum of Points & Authorities' },
  { value: 'declaration', label: 'Declaration' },
  { value: 'stipulation', label: 'Stipulation' },
];

const partyRoles = [
  { value: 'plaintiff', label: 'Plaintiff' },
  { value: 'defendant', label: 'Defendant' },
  { value: 'petitioner', label: 'Petitioner' },
  { value: 'respondent', label: 'Respondent' },
  { value: 'appellant', label: 'Appellant' },
  { value: 'appellee', label: 'Appellee' },
  { value: 'cross-claimant', label: 'Cross-Claimant' },
  { value: 'third-party-defendant', label: 'Third-Party Defendant' },
];

const partyTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'government', label: 'Government Entity' },
  { value: 'trust', label: 'Trust' },
  { value: 'estate', label: 'Estate' },
  { value: 'other', label: 'Other' },
];

const paragraphTypes = [
  { value: 'allegation', label: 'Allegation' },
  { value: 'admission', label: 'Admission' },
  { value: 'denial', label: 'Denial' },
  { value: 'affirmative-defense', label: 'Affirmative Defense' },
  { value: 'prayer', label: 'Prayer for Relief' },
  { value: 'general', label: 'General Statement' },
  { value: 'incorporation', label: 'Incorporation by Reference' },
];

const formatStyles = [
  { value: 'federal', label: 'Federal (FRCP)' },
  { value: 'california', label: 'California' },
  { value: 'new-york', label: 'New York' },
  { value: 'texas', label: 'Texas' },
  { value: 'florida', label: 'Florida' },
  { value: 'custom', label: 'Custom' },
];

const pleadingTemplates = [
  { type: 'complaint', title: 'General Civil Complaint', description: 'Standard complaint template with jurisdiction and parties' },
  { type: 'answer', title: 'Answer to Complaint', description: 'Response to complaint with admissions, denials, and defenses' },
  { type: 'motion-to-dismiss', title: 'Motion to Dismiss', description: 'Motion to dismiss under Rule 12(b)' },
  { type: 'summary-judgment', title: 'Summary Judgment Motion', description: 'Motion for summary judgment with statement of facts' },
  { type: 'cross-complaint', title: 'Cross-Complaint', description: 'Cross-complaint against co-defendants' },
  { type: 'demurrer', title: 'Demurrer', description: 'Challenge to legal sufficiency of pleading' },
];

const commonCitations = [
  'Fed. R. Civ. P. 8(a)',
  'Fed. R. Civ. P. 12(b)(6)',
  '28 U.S.C. § 1331',
  '28 U.S.C. § 1332',
  'Fed. R. Evid. 401',
  'Fed. R. Evid. 402',
  'Fed. R. Evid. 403',
  'Bell Atl. Corp. v. Twombly, 550 U.S. 544 (2007)',
  'Ashcroft v. Iqbal, 556 U.S. 662 (2009)',
  'Celotex Corp. v. Catrett, 477 U.S. 317 (1986)',
];

export const PleadingDrafterTool: React.FC<PleadingDrafterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: pleadings,
    addItem: addPleading,
    updateItem: updatePleading,
    deleteItem: deletePleading,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Pleading>(TOOL_ID, [], pleadingColumns);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showParagraphModal, setShowParagraphModal] = useState(false);
  const [showExhibitModal, setShowExhibitModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedPleading, setSelectedPleading] = useState<Pleading | null>(null);
  const [editingPleading, setEditingPleading] = useState<Pleading | null>(null);
  const [formData, setFormData] = useState<Pleading>(createNewPleading());
  const [partyData, setPartyData] = useState<Party>(createNewParty());
  const [editingPartyIndex, setEditingPartyIndex] = useState<number | null>(null);
  const [paragraphData, setParagraphData] = useState<Paragraph>(createNewParagraph(1));
  const [editingParagraphIndex, setEditingParagraphIndex] = useState<number | null>(null);
  const [exhibitData, setExhibitData] = useState<Exhibit>(createNewExhibit('A'));
  const [editingExhibitIndex, setEditingExhibitIndex] = useState<number | null>(null);
  const [newCitation, setNewCitation] = useState('');
  const [newRelief, setNewRelief] = useState('');
  const [activeTab, setActiveTab] = useState<'caption' | 'parties' | 'body' | 'exhibits' | 'prayer' | 'signature'>('caption');
  const [expandedSections, setExpandedSections] = useState<string[]>(['caption']);

  // Statistics
  const stats = useMemo(() => {
    const drafting = pleadings.filter(p => p.status === 'drafting');
    const inReview = pleadings.filter(p => p.status === 'review');
    const filed = pleadings.filter(p => p.status === 'filed');
    const overdue = pleadings.filter(p => {
      if (!p.filingDeadline || p.status === 'filed') return false;
      return new Date(p.filingDeadline) < new Date();
    });
    return {
      total: pleadings.length,
      drafting: drafting.length,
      inReview: inReview.length,
      filed: filed.length,
      overdue: overdue.length,
    };
  }, [pleadings]);

  // Filtered pleadings
  const filteredPleadings = useMemo(() => {
    return pleadings.filter(pleading => {
      const matchesSearch = searchQuery === '' ||
        pleading.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pleading.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pleading.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || pleading.pleadingType === filterType;
      const matchesStatus = filterStatus === '' || pleading.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [pleadings, searchQuery, filterType, filterStatus]);

  // Handlers
  const handleSave = () => {
    if (editingPleading) {
      updatePleading(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      const newVersion: DraftVersion = {
        id: crypto.randomUUID(),
        version: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        changes: 'Initial draft created',
        status: 'draft',
      };
      addPleading({ ...formData, versions: [newVersion], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingPleading(null);
    setFormData(createNewPleading());
    setActiveTab('caption');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this pleading? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePleading(id);
      if (selectedPleading?.id === id) setSelectedPleading(null);
    }
  };

  const openEditModal = (pleading: Pleading) => {
    setEditingPleading(pleading);
    setFormData(pleading);
    setShowModal(true);
  };

  const handleAddParty = () => {
    if (editingPartyIndex !== null) {
      const updatedParties = [...formData.parties];
      updatedParties[editingPartyIndex] = partyData;
      setFormData({ ...formData, parties: updatedParties });
    } else {
      setFormData({ ...formData, parties: [...formData.parties, partyData] });
    }
    setShowPartyModal(false);
    setPartyData(createNewParty());
    setEditingPartyIndex(null);
  };

  const handleEditParty = (index: number) => {
    setPartyData(formData.parties[index]);
    setEditingPartyIndex(index);
    setShowPartyModal(true);
  };

  const handleDeleteParty = (index: number) => {
    setFormData({
      ...formData,
      parties: formData.parties.filter((_, i) => i !== index),
    });
  };

  const handleAddParagraph = () => {
    if (editingParagraphIndex !== null) {
      const updatedParagraphs = [...formData.paragraphs];
      updatedParagraphs[editingParagraphIndex] = paragraphData;
      setFormData({ ...formData, paragraphs: updatedParagraphs });
    } else {
      const nextNumber = formData.paragraphs.length + 1;
      setFormData({ ...formData, paragraphs: [...formData.paragraphs, { ...paragraphData, number: nextNumber }] });
    }
    setShowParagraphModal(false);
    setParagraphData(createNewParagraph(formData.paragraphs.length + 2));
    setEditingParagraphIndex(null);
  };

  const handleEditParagraph = (index: number) => {
    setParagraphData(formData.paragraphs[index]);
    setEditingParagraphIndex(index);
    setShowParagraphModal(true);
  };

  const handleDeleteParagraph = (index: number) => {
    const updatedParagraphs = formData.paragraphs
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, number: i + 1 }));
    setFormData({ ...formData, paragraphs: updatedParagraphs });
  };

  const handleAddExhibit = () => {
    if (editingExhibitIndex !== null) {
      const updatedExhibits = [...formData.exhibits];
      updatedExhibits[editingExhibitIndex] = exhibitData;
      setFormData({ ...formData, exhibits: updatedExhibits });
    } else {
      setFormData({ ...formData, exhibits: [...formData.exhibits, exhibitData] });
    }
    setShowExhibitModal(false);
    const nextLetter = String.fromCharCode('A'.charCodeAt(0) + formData.exhibits.length + 1);
    setExhibitData(createNewExhibit(nextLetter));
    setEditingExhibitIndex(null);
  };

  const handleEditExhibit = (index: number) => {
    setExhibitData(formData.exhibits[index]);
    setEditingExhibitIndex(index);
    setShowExhibitModal(true);
  };

  const handleDeleteExhibit = (index: number) => {
    setFormData({
      ...formData,
      exhibits: formData.exhibits.filter((_, i) => i !== index),
    });
  };

  const addCitationToParagraph = () => {
    if (newCitation.trim() && !paragraphData.citations.includes(newCitation.trim())) {
      setParagraphData({
        ...paragraphData,
        citations: [...paragraphData.citations, newCitation.trim()],
      });
      setNewCitation('');
    }
  };

  const removeCitationFromParagraph = (citation: string) => {
    setParagraphData({
      ...paragraphData,
      citations: paragraphData.citations.filter(c => c !== citation),
    });
  };

  const addPrayerForRelief = () => {
    if (newRelief.trim() && !formData.prayerForRelief.includes(newRelief.trim())) {
      setFormData({
        ...formData,
        prayerForRelief: [...formData.prayerForRelief, newRelief.trim()],
      });
      setNewRelief('');
    }
  };

  const removePrayerForRelief = (relief: string) => {
    setFormData({
      ...formData,
      prayerForRelief: formData.prayerForRelief.filter(r => r !== relief),
    });
  };

  const applyTemplate = (templateType: string) => {
    const template = pleadingTemplates.find(t => t.type === templateType);
    if (template) {
      setFormData({
        ...formData,
        pleadingType: templateType as Pleading['pleadingType'],
        title: template.title,
      });

      // Add template-specific paragraphs
      if (templateType === 'complaint') {
        const templateParagraphs: Paragraph[] = [
          { ...createNewParagraph(1), content: 'Plaintiff brings this action against Defendant(s) and alleges as follows:', type: 'general' },
          { ...createNewParagraph(2), content: 'This Court has jurisdiction over this matter pursuant to [cite jurisdiction].', type: 'allegation' },
          { ...createNewParagraph(3), content: 'Venue is proper in this Court pursuant to [cite venue statute].', type: 'allegation' },
          { ...createNewParagraph(4), content: 'Plaintiff is [describe plaintiff].', type: 'allegation' },
          { ...createNewParagraph(5), content: 'Defendant is [describe defendant].', type: 'allegation' },
        ];
        setFormData(prev => ({ ...prev, paragraphs: templateParagraphs }));
      } else if (templateType === 'answer') {
        const templateParagraphs: Paragraph[] = [
          { ...createNewParagraph(1), content: 'Defendant answers the Complaint as follows:', type: 'general' },
          { ...createNewParagraph(2), content: 'Defendant admits the allegations in Paragraph __ of the Complaint.', type: 'admission' },
          { ...createNewParagraph(3), content: 'Defendant denies the allegations in Paragraph __ of the Complaint.', type: 'denial' },
          { ...createNewParagraph(4), content: 'Defendant is without knowledge or information sufficient to form a belief as to the truth of the allegations in Paragraph __ and therefore denies the same.', type: 'denial' },
        ];
        setFormData(prev => ({ ...prev, paragraphs: templateParagraphs }));
      }
    }
    setShowTemplateModal(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'drafting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'review': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'filed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'served': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-500' };
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: 'text-yellow-500' };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'text-blue-400' };
    return { text: `Due in ${diffDays} days`, color: 'text-gray-400' };
  };

  const generateCaption = (pleading: Pleading) => {
    const plaintiffs = pleading.parties.filter(p => ['plaintiff', 'petitioner', 'appellant'].includes(p.role));
    const defendants = pleading.parties.filter(p => ['defendant', 'respondent', 'appellee'].includes(p.role));

    return {
      plaintiffs: plaintiffs.map(p => p.name).join(', ') || '[PLAINTIFF(S)]',
      defendants: defendants.map(p => p.name).join(', ') || '[DEFENDANT(S)]',
    };
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      : theme === 'dark'
        ? 'text-gray-400 hover:bg-gray-700'
        : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
            <Scale className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pleadingDrafter.pleadingDrafter', 'Pleading Drafter')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.pleadingDrafter.draftAndManageLegalPleading', 'Draft and manage legal pleading documents')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <WidgetEmbedButton toolSlug="pleading-drafter" toolName="Pleading Drafter" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'pleading-drafter' })}
            onExportExcel={() => exportExcel({ filename: 'pleading-drafter' })}
            onExportJSON={() => exportJSON({ filename: 'pleading-drafter' })}
            onExportPDF={() => exportPDF({ filename: 'pleading-drafter', title: 'Pleading Documents' })}
            onPrint={() => print('Pleading Documents')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={pleadings.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => setShowTemplateModal(true)} className={buttonSecondary}>
            <BookOpen className="w-4 h-4" />
            {t('tools.pleadingDrafter.templates', 'Templates')}
          </button>
          <button onClick={() => { setFormData(createNewPleading()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.pleadingDrafter.newPleading', 'New Pleading')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pleadingDrafter.total', 'Total')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Edit2 className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pleadingDrafter.drafting', 'Drafting')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.drafting}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pleadingDrafter.inReview', 'In Review')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.inReview}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <FileCheck className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pleadingDrafter.filed', 'Filed')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.filed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pleadingDrafter.overdue', 'Overdue')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.pleadingDrafter.searchByCaseNameNumber', 'Search by case name, number, or title...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.pleadingDrafter.allTypes', 'All Types')}</option>
            {pleadingTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.pleadingDrafter.allStatus', 'All Status')}</option>
            <option value="drafting">{t('tools.pleadingDrafter.drafting2', 'Drafting')}</option>
            <option value="review">{t('tools.pleadingDrafter.inReview2', 'In Review')}</option>
            <option value="approved">{t('tools.pleadingDrafter.approved', 'Approved')}</option>
            <option value="filed">{t('tools.pleadingDrafter.filed2', 'Filed')}</option>
            <option value="served">{t('tools.pleadingDrafter.served', 'Served')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pleading List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.pleadingDrafter.pleadingDocuments', 'Pleading Documents')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredPleadings.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.pleadingDrafter.noPleadingsFound', 'No pleadings found')}</p>
                <p className="text-sm mt-1">{t('tools.pleadingDrafter.createANewPleadingTo', 'Create a new pleading to get started')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPleadings.map(pleading => {
                  const deadlineStatus = getDeadlineStatus(pleading.filingDeadline);
                  return (
                    <div
                      key={pleading.id}
                      onClick={() => setSelectedPleading(pleading)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedPleading?.id === pleading.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <p className="font-medium truncate">{pleading.title || pleading.caseName || 'Untitled'}</p>
                          </div>
                          <p className={`text-sm mt-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {pleading.caseNumber} - {pleading.court || 'No court specified'}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(pleading.status)}`}>
                              {pleading.status}
                            </span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {pleadingTypes.find(t => t.value === pleading.pleadingType)?.label}
                            </span>
                          </div>
                          {deadlineStatus && (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${deadlineStatus.color}`}>
                              <Clock className="w-3 h-3" />
                              {deadlineStatus.text}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(pleading); }}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(pleading.id); }}
                            className="p-1.5 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedPleading ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold">{selectedPleading.title || 'Untitled Pleading'}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedPleading.status)}`}>
                        {selectedPleading.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedPleading.caseNumber} | {selectedPleading.court}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className={buttonSecondary}
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button onClick={() => openEditModal(selectedPleading)} className={buttonPrimary}>
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Case Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-indigo-500" />
                    {t('tools.pleadingDrafter.caseInformation', 'Case Information')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.pleadingDrafter.caseNumber', 'Case Number')}</p>
                      <p className="font-medium">{selectedPleading.caseNumber || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.pleadingDrafter.jurisdiction', 'Jurisdiction')}</p>
                      <p className="font-medium">{selectedPleading.jurisdiction || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.pleadingDrafter.division', 'Division')}</p>
                      <p className="font-medium">{selectedPleading.division || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.pleadingDrafter.judge', 'Judge')}</p>
                      <p className="font-medium">{selectedPleading.judge || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Parties */}
                {selectedPleading.parties.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-500" />
                      Parties ({selectedPleading.parties.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPleading.parties.map((party, idx) => (
                        <div key={party.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{party.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              ['plaintiff', 'petitioner', 'appellant'].includes(party.role)
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {partyRoles.find(r => r.value === party.role)?.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {partyTypes.find(t => t.value === party.type)?.label}
                            </span>
                          </div>
                          {party.attorney && !party.proSe && (
                            <p className="text-xs text-gray-400 mt-1">Atty: {party.attorney}</p>
                          )}
                          {party.proSe && (
                            <p className="text-xs text-yellow-400 mt-1">{t('tools.pleadingDrafter.proSe', 'Pro Se')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paragraphs Summary */}
                {selectedPleading.paragraphs.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-green-500" />
                      Document Body ({selectedPleading.paragraphs.length} paragraphs)
                    </h3>
                    <div className={`max-h-60 overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      {selectedPleading.paragraphs.map((para) => (
                        <div key={para.id} className={`p-3 border-b last:border-b-0 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-mono text-cyan-500 flex-shrink-0">{para.number}.</span>
                            <div className="flex-1">
                              <p className="text-sm line-clamp-2">{para.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {paragraphTypes.find(t => t.value === para.type)?.label}
                                </span>
                                {para.citations.length > 0 && (
                                  <span className="text-xs text-blue-400">
                                    {para.citations.length} citation(s)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exhibits */}
                {selectedPleading.exhibits.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-orange-500" />
                      Exhibits ({selectedPleading.exhibits.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPleading.exhibits.map((exhibit) => (
                        <div key={exhibit.id} className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <span className="font-mono font-bold text-orange-500">Ex. {exhibit.number}</span>
                          <span className="ml-2 text-sm">{exhibit.description || 'No description'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prayer for Relief */}
                {selectedPleading.prayerForRelief.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-purple-500" />
                      {t('tools.pleadingDrafter.prayerForRelief3', 'Prayer for Relief')}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedPleading.prayerForRelief.map((relief, idx) => (
                        <li key={idx} className="text-sm">{relief}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Filing Deadline & Formatting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPleading.filingDeadline && (
                    <div className={`p-4 rounded-lg border ${
                      getDeadlineStatus(selectedPleading.filingDeadline)?.color.includes('red')
                        ? 'border-red-500/30 bg-red-500/10'
                        : theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('tools.pleadingDrafter.filingDeadline2', 'Filing Deadline')}
                      </h3>
                      <p className="text-lg font-bold">
                        {new Date(selectedPleading.filingDeadline).toLocaleDateString()}
                      </p>
                      {getDeadlineStatus(selectedPleading.filingDeadline) && (
                        <p className={`text-sm ${getDeadlineStatus(selectedPleading.filingDeadline)?.color}`}>
                          {getDeadlineStatus(selectedPleading.filingDeadline)?.text}
                        </p>
                      )}
                    </div>
                  )}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t('tools.pleadingDrafter.formatSettings', 'Format Settings')}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>Style: {formatStyles.find(f => f.value === selectedPleading.formatStyle)?.label}</p>
                      <p>Line Numbering: {selectedPleading.lineNumbering ? 'Yes' : 'No'}</p>
                      <p>Double Spaced: {selectedPleading.doubleSpaced ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Version History */}
                {selectedPleading.versions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-400" />
                      {t('tools.pleadingDrafter.versionHistory', 'Version History')}
                    </h3>
                    <div className="space-y-2">
                      {[...selectedPleading.versions].reverse().slice(0, 3).map((version) => (
                        <div key={version.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Version {version.version}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(version.status)}`}>
                              {version.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{version.changes}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(version.createdAt).toLocaleString()} by {version.createdBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Scale className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.pleadingDrafter.selectAPleadingDocument', 'Select a pleading document')}</p>
              <p className="text-sm">{t('tools.pleadingDrafter.chooseADocumentFromThe', 'Choose a document from the list to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingPleading ? t('tools.pleadingDrafter.editPleading', 'Edit Pleading') : t('tools.pleadingDrafter.newPleading2', 'New Pleading')}</h2>
              <button onClick={() => { setShowModal(false); setEditingPleading(null); setActiveTab('caption'); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className={`px-6 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-wrap gap-2`}>
              <button onClick={() => setActiveTab('caption')} className={tabClass(activeTab === 'caption')}>
                <Gavel className="w-4 h-4 inline mr-1" /> Caption
              </button>
              <button onClick={() => setActiveTab('parties')} className={tabClass(activeTab === 'parties')}>
                <Users className="w-4 h-4 inline mr-1" /> Parties
              </button>
              <button onClick={() => setActiveTab('body')} className={tabClass(activeTab === 'body')}>
                <ListOrdered className="w-4 h-4 inline mr-1" /> Body
              </button>
              <button onClick={() => setActiveTab('exhibits')} className={tabClass(activeTab === 'exhibits')}>
                <Paperclip className="w-4 h-4 inline mr-1" /> Exhibits
              </button>
              <button onClick={() => setActiveTab('prayer')} className={tabClass(activeTab === 'prayer')}>
                <Scale className="w-4 h-4 inline mr-1" /> Prayer
              </button>
              <button onClick={() => setActiveTab('signature')} className={tabClass(activeTab === 'signature')}>
                <PenTool className="w-4 h-4 inline mr-1" /> Signature
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Caption Tab */}
              {activeTab === 'caption' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.court', 'Court *')}</label>
                      <input
                        type="text"
                        value={formData.court}
                        onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.eGUnitedStatesDistrict', 'e.g., United States District Court')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.jurisdiction2', 'Jurisdiction')}</label>
                      <input
                        type="text"
                        value={formData.jurisdiction}
                        onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.eGCentralDistrictOf', 'e.g., Central District of California')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.division2', 'Division')}</label>
                      <input
                        type="text"
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.eGWesternDivision', 'e.g., Western Division')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.caseNumber2', 'Case Number')}</label>
                      <input
                        type="text"
                        value={formData.caseNumber}
                        onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.eG224Cv', 'e.g., 2:24-cv-01234')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.caseName', 'Case Name')}</label>
                      <input
                        type="text"
                        value={formData.caseName}
                        onChange={(e) => setFormData({ ...formData, caseName: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.eGSmithVJones', 'e.g., Smith v. Jones')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.assignedJudge', 'Assigned Judge')}</label>
                      <input
                        type="text"
                        value={formData.judge}
                        onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.eGHonJohnSmith', 'e.g., Hon. John Smith')}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.pleadingType', 'Pleading Type *')}</label>
                      <select
                        value={formData.pleadingType}
                        onChange={(e) => setFormData({ ...formData, pleadingType: e.target.value as Pleading['pleadingType'] })}
                        className={inputClass}
                      >
                        {pleadingTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.documentTitle', 'Document Title *')}</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.eGComplaintForBreach', 'e.g., Complaint for Breach of Contract')}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.formatStyle', 'Format Style')}</label>
                      <select
                        value={formData.formatStyle}
                        onChange={(e) => setFormData({ ...formData, formatStyle: e.target.value as Pleading['formatStyle'] })}
                        className={inputClass}
                      >
                        {formatStyles.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.status', 'Status')}</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Pleading['status'] })}
                        className={inputClass}
                      >
                        <option value="drafting">{t('tools.pleadingDrafter.drafting3', 'Drafting')}</option>
                        <option value="review">{t('tools.pleadingDrafter.inReview3', 'In Review')}</option>
                        <option value="approved">{t('tools.pleadingDrafter.approved2', 'Approved')}</option>
                        <option value="filed">{t('tools.pleadingDrafter.filed3', 'Filed')}</option>
                        <option value="served">{t('tools.pleadingDrafter.served2', 'Served')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.filingDeadline', 'Filing Deadline')}</label>
                      <input
                        type="date"
                        value={formData.filingDeadline}
                        onChange={(e) => setFormData({ ...formData, filingDeadline: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.lineNumbering}
                        onChange={(e) => setFormData({ ...formData, lineNumbering: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.pleadingDrafter.lineNumbering', 'Line Numbering')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.doubleSpaced}
                        onChange={(e) => setFormData({ ...formData, doubleSpaced: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.pleadingDrafter.doubleSpaced', 'Double Spaced')}</span>
                    </label>
                  </div>

                  <div>
                    <label className={labelClass}>{t('tools.pleadingDrafter.localRulesSpecialRequirements', 'Local Rules / Special Requirements')}</label>
                    <textarea
                      value={formData.localRules}
                      onChange={(e) => setFormData({ ...formData, localRules: e.target.value })}
                      placeholder={t('tools.pleadingDrafter.anySpecialLocalCourtRules', 'Any special local court rules or requirements...')}
                      className={inputClass}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Parties Tab */}
              {activeTab === 'parties' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Parties ({formData.parties.length})</h3>
                    <button
                      onClick={() => { setPartyData(createNewParty()); setEditingPartyIndex(null); setShowPartyModal(true); }}
                      className={buttonPrimary}
                    >
                      <Plus className="w-4 h-4" /> Add Party
                    </button>
                  </div>

                  {formData.parties.length === 0 ? (
                    <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('tools.pleadingDrafter.noPartiesAddedYet', 'No parties added yet')}</p>
                      <p className="text-sm text-gray-400">{t('tools.pleadingDrafter.addPlaintiffsAndDefendantsTo', 'Add plaintiffs and defendants to your pleading')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.parties.map((party, idx) => (
                        <div key={party.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{party.name || 'Unnamed Party'}</span>
                                {party.proSe && <span className="text-xs text-yellow-400">(Pro Se)</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  ['plaintiff', 'petitioner', 'appellant'].includes(party.role)
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {partyRoles.find(r => r.value === party.role)?.label}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {partyTypes.find(t => t.value === party.type)?.label}
                                </span>
                              </div>
                              {party.attorney && (
                                <p className="text-sm text-gray-400 mt-1">Attorney: {party.attorney}</p>
                              )}
                              {party.address && (
                                <p className="text-xs text-gray-500 mt-1">{party.address}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditParty(idx)} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button onClick={() => handleDeleteParty(idx)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Body Tab */}
              {activeTab === 'body' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Paragraphs ({formData.paragraphs.length})</h3>
                    <button
                      onClick={() => {
                        setParagraphData(createNewParagraph(formData.paragraphs.length + 1));
                        setEditingParagraphIndex(null);
                        setShowParagraphModal(true);
                      }}
                      className={buttonPrimary}
                    >
                      <Plus className="w-4 h-4" /> Add Paragraph
                    </button>
                  </div>

                  {formData.paragraphs.length === 0 ? (
                    <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <ListOrdered className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('tools.pleadingDrafter.noParagraphsAddedYet', 'No paragraphs added yet')}</p>
                      <p className="text-sm text-gray-400">{t('tools.pleadingDrafter.addNumberedParagraphsToYour', 'Add numbered paragraphs to your pleading body')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.paragraphs.map((para, idx) => (
                        <div key={para.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-lg font-mono font-bold text-cyan-500 flex-shrink-0">{para.number}.</span>
                            <div className="flex-1">
                              <p className="text-sm">{para.content || 'Empty paragraph'}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  para.type === 'allegation' ? 'bg-blue-500/20 text-blue-400' :
                                  para.type === 'denial' ? 'bg-red-500/20 text-red-400' :
                                  para.type === 'admission' ? 'bg-green-500/20 text-green-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {paragraphTypes.find(t => t.value === para.type)?.label}
                                </span>
                                {para.citations.length > 0 && (
                                  <span className="text-xs text-gray-400">{para.citations.length} citation(s)</span>
                                )}
                                {para.exhibitRefs.length > 0 && (
                                  <span className="text-xs text-orange-400">{para.exhibitRefs.length} exhibit ref(s)</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditParagraph(idx)} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button onClick={() => handleDeleteParagraph(idx)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Exhibits Tab */}
              {activeTab === 'exhibits' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Exhibits ({formData.exhibits.length})</h3>
                    <button
                      onClick={() => {
                        const nextLetter = String.fromCharCode('A'.charCodeAt(0) + formData.exhibits.length);
                        setExhibitData(createNewExhibit(nextLetter));
                        setEditingExhibitIndex(null);
                        setShowExhibitModal(true);
                      }}
                      className={buttonPrimary}
                    >
                      <Plus className="w-4 h-4" /> Add Exhibit
                    </button>
                  </div>

                  {formData.exhibits.length === 0 ? (
                    <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('tools.pleadingDrafter.noExhibitsAddedYet', 'No exhibits added yet')}</p>
                      <p className="text-sm text-gray-400">{t('tools.pleadingDrafter.addExhibitsToReferenceIn', 'Add exhibits to reference in your pleading')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.exhibits.map((exhibit, idx) => (
                        <div key={exhibit.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-orange-500">Exhibit {exhibit.number}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  exhibit.status === 'attached' ? 'bg-green-500/20 text-green-400' :
                                  exhibit.status === 'filed' ? 'bg-blue-500/20 text-blue-400' :
                                  exhibit.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {exhibit.status}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{exhibit.description || 'No description'}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                {exhibit.documentType && <span>Type: {exhibit.documentType}</span>}
                                {exhibit.dateOfDocument && <span>Date: {exhibit.dateOfDocument}</span>}
                                {exhibit.batesStart && exhibit.batesEnd && (
                                  <span>Bates: {exhibit.batesStart} - {exhibit.batesEnd}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditExhibit(idx)} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button onClick={() => handleDeleteExhibit(idx)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Prayer Tab */}
              {activeTab === 'prayer' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">{t('tools.pleadingDrafter.prayerForRelief', 'Prayer for Relief')}</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.pleadingDrafter.listTheReliefYouAre', 'List the relief you are requesting from the court.')}
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRelief}
                      onChange={(e) => setNewRelief(e.target.value)}
                      placeholder={t('tools.pleadingDrafter.enterReliefRequested', 'Enter relief requested...')}
                      className={inputClass}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrayerForRelief())}
                    />
                    <button onClick={addPrayerForRelief} className={buttonPrimary}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {formData.prayerForRelief.length > 0 ? (
                    <div className="space-y-2">
                      {formData.prayerForRelief.map((relief, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <span className="font-mono text-cyan-500">{idx + 1}.</span>
                          <span className="flex-1">{relief}</span>
                          <button onClick={() => removePrayerForRelief(relief)} className="p-1 hover:bg-red-500/20 rounded">
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-6 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-gray-400">{t('tools.pleadingDrafter.noReliefItemsAdded', 'No relief items added')}</p>
                    </div>
                  )}

                  <div className="mt-6">
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pleadingDrafter.commonReliefRequests', 'Common Relief Requests:')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Compensatory damages in an amount to be proven at trial',
                        'Punitive damages',
                        'Injunctive relief',
                        'Declaratory relief',
                        'Attorneys fees and costs',
                        'Pre-judgment and post-judgment interest',
                        'Such other and further relief as the Court deems just and proper',
                      ].filter(r => !formData.prayerForRelief.includes(r)).slice(0, 4).map((relief, idx) => (
                        <button
                          key={idx}
                          onClick={() => setFormData({ ...formData, prayerForRelief: [...formData.prayerForRelief, relief] })}
                          className={`px-3 py-1 text-sm rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          + {relief.length > 40 ? relief.slice(0, 40) + '...' : relief}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Signature Tab */}
              {activeTab === 'signature' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.verificationRequired}
                        onChange={(e) => setFormData({ ...formData, verificationRequired: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.pleadingDrafter.verificationRequired', 'Verification Required')}</span>
                    </label>
                  </div>

                  {formData.verificationRequired && (
                    <div>
                      <label className={labelClass}>{t('tools.pleadingDrafter.verificationText', 'Verification Text')}</label>
                      <textarea
                        value={formData.verificationText}
                        onChange={(e) => setFormData({ ...formData, verificationText: e.target.value })}
                        placeholder={t('tools.pleadingDrafter.iDeclareUnderPenaltyOf', 'I declare under penalty of perjury under the laws of the State of [State] that the foregoing is true and correct...')}
                        className={inputClass}
                        rows={4}
                      />
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          verificationText: 'I declare under penalty of perjury under the laws of the United States that the foregoing is true and correct. Executed on [DATE] at [CITY], [STATE].'
                        })}
                        className={`mt-2 text-sm ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
                      >
                        {t('tools.pleadingDrafter.useStandardFederalVerification', 'Use standard federal verification')}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>{t('tools.pleadingDrafter.signatureBlock', 'Signature Block')}</label>
                    <textarea
                      value={formData.signatureBlock}
                      onChange={(e) => setFormData({ ...formData, signatureBlock: e.target.value })}
                      placeholder={`Respectfully submitted,

___________________________
[Attorney Name]
[Bar Number]
[Firm Name]
[Address]
[Phone]
[Email]
Attorney for [Party]`}
                      className={`${inputClass} font-mono`}
                      rows={10}
                    />
                  </div>

                  <button
                    onClick={() => setFormData({
                      ...formData,
                      signatureBlock: `Respectfully submitted,

Dated: _______________

___________________________
[Attorney Name], Esq.
State Bar No. [Bar Number]
[Firm Name]
[Address Line 1]
[City, State ZIP]
Telephone: [Phone]
Facsimile: [Fax]
Email: [Email]

Attorney for [Party Role] [Party Name]`
                    })}
                    className={buttonSecondary}
                  >
                    {t('tools.pleadingDrafter.useTemplateSignatureBlock', 'Use template signature block')}
                  </button>
                </div>
              )}
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button onClick={() => { setShowModal(false); setEditingPleading(null); setActiveTab('caption'); }} className={buttonSecondary}>
                {t('tools.pleadingDrafter.cancel4', 'Cancel')}
              </button>
              <button onClick={handleSave} disabled={!formData.court || !formData.title} className={buttonPrimary}>
                <Save className="w-4 h-4" /> {editingPleading ? t('tools.pleadingDrafter.update', 'Update') : t('tools.pleadingDrafter.create', 'Create')} Pleading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Party Modal */}
      {showPartyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingPartyIndex !== null ? t('tools.pleadingDrafter.editParty', 'Edit Party') : t('tools.pleadingDrafter.addParty', 'Add Party')}</h2>
              <button onClick={() => setShowPartyModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.pleadingDrafter.partyName', 'Party Name *')}</label>
                <input
                  type="text"
                  value={partyData.name}
                  onChange={(e) => setPartyData({ ...partyData, name: e.target.value })}
                  placeholder={t('tools.pleadingDrafter.fullLegalName', 'Full legal name')}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.role', 'Role *')}</label>
                  <select
                    value={partyData.role}
                    onChange={(e) => setPartyData({ ...partyData, role: e.target.value as Party['role'] })}
                    className={inputClass}
                  >
                    {partyRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.type', 'Type')}</label>
                  <select
                    value={partyData.type}
                    onChange={(e) => setPartyData({ ...partyData, type: e.target.value as Party['type'] })}
                    className={inputClass}
                  >
                    {partyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.pleadingDrafter.address', 'Address')}</label>
                <textarea
                  value={partyData.address}
                  onChange={(e) => setPartyData({ ...partyData, address: e.target.value })}
                  placeholder={t('tools.pleadingDrafter.fullAddress', 'Full address')}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={partyData.phone}
                    onChange={(e) => setPartyData({ ...partyData, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.email', 'Email')}</label>
                  <input
                    type="email"
                    value={partyData.email}
                    onChange={(e) => setPartyData({ ...partyData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="proSe"
                  checked={partyData.proSe}
                  onChange={(e) => setPartyData({ ...partyData, proSe: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="proSe" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.pleadingDrafter.proSeSelfRepresented', 'Pro Se (Self-Represented)')}</label>
              </div>
              {!partyData.proSe && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pleadingDrafter.attorneyName', 'Attorney Name')}</label>
                    <input
                      type="text"
                      value={partyData.attorney}
                      onChange={(e) => setPartyData({ ...partyData, attorney: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pleadingDrafter.barNumber', 'Bar Number')}</label>
                    <input
                      type="text"
                      value={partyData.attorneyBar}
                      onChange={(e) => setPartyData({ ...partyData, attorneyBar: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => setShowPartyModal(false)} className={buttonSecondary}>{t('tools.pleadingDrafter.cancel', 'Cancel')}</button>
                <button onClick={handleAddParty} disabled={!partyData.name} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> {editingPartyIndex !== null ? t('tools.pleadingDrafter.update2', 'Update') : t('tools.pleadingDrafter.add', 'Add')} Party
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paragraph Modal */}
      {showParagraphModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingParagraphIndex !== null ? t('tools.pleadingDrafter.editParagraph', 'Edit Paragraph') : t('tools.pleadingDrafter.addParagraph', 'Add Paragraph')}</h2>
              <button onClick={() => setShowParagraphModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.paragraphNumber', 'Paragraph Number')}</label>
                  <input
                    type="number"
                    value={paragraphData.number}
                    onChange={(e) => setParagraphData({ ...paragraphData, number: parseInt(e.target.value) || 1 })}
                    className={inputClass}
                    min={1}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.type2', 'Type')}</label>
                  <select
                    value={paragraphData.type}
                    onChange={(e) => setParagraphData({ ...paragraphData, type: e.target.value as Paragraph['type'] })}
                    className={inputClass}
                  >
                    {paragraphTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.pleadingDrafter.content', 'Content *')}</label>
                <textarea
                  value={paragraphData.content}
                  onChange={(e) => setParagraphData({ ...paragraphData, content: e.target.value })}
                  placeholder={t('tools.pleadingDrafter.enterParagraphContent', 'Enter paragraph content...')}
                  className={inputClass}
                  rows={6}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.pleadingDrafter.citations', 'Citations')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCitation}
                    onChange={(e) => setNewCitation(e.target.value)}
                    placeholder={t('tools.pleadingDrafter.addCitation', 'Add citation...')}
                    className={inputClass}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCitationToParagraph())}
                  />
                  <button onClick={addCitationToParagraph} className={buttonSecondary}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonCitations.filter(c => !paragraphData.citations.includes(c)).slice(0, 4).map((citation, idx) => (
                    <button
                      key={idx}
                      onClick={() => setParagraphData({ ...paragraphData, citations: [...paragraphData.citations, citation] })}
                      className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      + {citation.length > 30 ? citation.slice(0, 30) + '...' : citation}
                    </button>
                  ))}
                </div>
                {paragraphData.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {paragraphData.citations.map((citation, idx) => (
                      <span key={idx} className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                        {citation.length > 40 ? citation.slice(0, 40) + '...' : citation}
                        <button onClick={() => removeCitationFromParagraph(citation)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>{t('tools.pleadingDrafter.exhibitReferences', 'Exhibit References')}</label>
                <div className="flex flex-wrap gap-2">
                  {formData.exhibits.map((exhibit) => (
                    <button
                      key={exhibit.id}
                      onClick={() => {
                        const refs = paragraphData.exhibitRefs.includes(exhibit.id)
                          ? paragraphData.exhibitRefs.filter(r => r !== exhibit.id)
                          : [...paragraphData.exhibitRefs, exhibit.id];
                        setParagraphData({ ...paragraphData, exhibitRefs: refs });
                      }}
                      className={`px-3 py-1 text-sm rounded ${
                        paragraphData.exhibitRefs.includes(exhibit.id)
                          ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50'
                          : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Ex. {exhibit.number}
                    </button>
                  ))}
                  {formData.exhibits.length === 0 && (
                    <p className="text-sm text-gray-400">{t('tools.pleadingDrafter.noExhibitsAvailableAddExhibits', 'No exhibits available. Add exhibits first.')}</p>
                  )}
                </div>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => setShowParagraphModal(false)} className={buttonSecondary}>{t('tools.pleadingDrafter.cancel2', 'Cancel')}</button>
                <button onClick={handleAddParagraph} disabled={!paragraphData.content} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> {editingParagraphIndex !== null ? t('tools.pleadingDrafter.update3', 'Update') : t('tools.pleadingDrafter.add2', 'Add')} Paragraph
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exhibit Modal */}
      {showExhibitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingExhibitIndex !== null ? t('tools.pleadingDrafter.editExhibit', 'Edit Exhibit') : t('tools.pleadingDrafter.addExhibit', 'Add Exhibit')}</h2>
              <button onClick={() => setShowExhibitModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.exhibitNumber', 'Exhibit Number *')}</label>
                  <input
                    type="text"
                    value={exhibitData.number}
                    onChange={(e) => setExhibitData({ ...exhibitData, number: e.target.value })}
                    placeholder="e.g., A, B, 1, 2"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.status2', 'Status')}</label>
                  <select
                    value={exhibitData.status}
                    onChange={(e) => setExhibitData({ ...exhibitData, status: e.target.value as Exhibit['status'] })}
                    className={inputClass}
                  >
                    <option value="pending">{t('tools.pleadingDrafter.pending', 'Pending')}</option>
                    <option value="attached">{t('tools.pleadingDrafter.attached', 'Attached')}</option>
                    <option value="filed">{t('tools.pleadingDrafter.filed4', 'Filed')}</option>
                    <option value="rejected">{t('tools.pleadingDrafter.rejected', 'Rejected')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.pleadingDrafter.description', 'Description *')}</label>
                <input
                  type="text"
                  value={exhibitData.description}
                  onChange={(e) => setExhibitData({ ...exhibitData, description: e.target.value })}
                  placeholder={t('tools.pleadingDrafter.briefDescriptionOfTheExhibit', 'Brief description of the exhibit')}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.documentType', 'Document Type')}</label>
                  <input
                    type="text"
                    value={exhibitData.documentType}
                    onChange={(e) => setExhibitData({ ...exhibitData, documentType: e.target.value })}
                    placeholder={t('tools.pleadingDrafter.eGContractEmailPhoto', 'e.g., Contract, Email, Photo')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.dateOfDocument', 'Date of Document')}</label>
                  <input
                    type="date"
                    value={exhibitData.dateOfDocument}
                    onChange={(e) => setExhibitData({ ...exhibitData, dateOfDocument: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.batesStart', 'Bates Start')}</label>
                  <input
                    type="text"
                    value={exhibitData.batesStart}
                    onChange={(e) => setExhibitData({ ...exhibitData, batesStart: e.target.value })}
                    placeholder={t('tools.pleadingDrafter.eGDoc0001', 'e.g., DOC-0001')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.pleadingDrafter.batesEnd', 'Bates End')}</label>
                  <input
                    type="text"
                    value={exhibitData.batesEnd}
                    onChange={(e) => setExhibitData({ ...exhibitData, batesEnd: e.target.value })}
                    placeholder={t('tools.pleadingDrafter.eGDoc0025', 'e.g., DOC-0025')}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.pleadingDrafter.notes', 'Notes')}</label>
                <textarea
                  value={exhibitData.notes}
                  onChange={(e) => setExhibitData({ ...exhibitData, notes: e.target.value })}
                  placeholder={t('tools.pleadingDrafter.additionalNotesAboutThisExhibit', 'Additional notes about this exhibit...')}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => setShowExhibitModal(false)} className={buttonSecondary}>{t('tools.pleadingDrafter.cancel3', 'Cancel')}</button>
                <button onClick={handleAddExhibit} disabled={!exhibitData.number || !exhibitData.description} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> {editingExhibitIndex !== null ? t('tools.pleadingDrafter.update4', 'Update') : t('tools.pleadingDrafter.add3', 'Add')} Exhibit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.pleadingDrafter.pleadingTemplates', 'Pleading Templates')}</h2>
              <button onClick={() => setShowTemplateModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.pleadingDrafter.selectATemplateToStart', 'Select a template to start your pleading with pre-formatted content.')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pleadingTemplates.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => applyTemplate(template.type)}
                    className={`p-4 rounded-lg text-left transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <span className="font-semibold">{template.title}</span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedPleading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.pleadingDrafter.documentPreview', 'Document Preview')}</h2>
              <button onClick={() => setShowPreviewModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {/* Preview content - formatted like a legal document */}
              <div className={`font-serif ${selectedPleading.doubleSpaced ? 'leading-relaxed' : 'leading-normal'}`}>
                {/* Court Header */}
                <div className="text-center mb-8">
                  <p className="font-bold uppercase">{selectedPleading.court}</p>
                  {selectedPleading.jurisdiction && <p>{selectedPleading.jurisdiction}</p>}
                  {selectedPleading.division && <p>{selectedPleading.division}</p>}
                </div>

                {/* Caption */}
                <div className="border border-gray-400 p-4 mb-8">
                  <div className="flex">
                    <div className="flex-1 pr-4 border-r border-gray-400">
                      <p className="mb-2">{generateCaption(selectedPleading).plaintiffs},</p>
                      <p className="ml-8">{t('tools.pleadingDrafter.plaintiffS', 'Plaintiff(s),')}</p>
                      <p className="my-4">v.</p>
                      <p className="mb-2">{generateCaption(selectedPleading).defendants},</p>
                      <p className="ml-8">{t('tools.pleadingDrafter.defendantS', 'Defendant(s).')}</p>
                    </div>
                    <div className="flex-1 pl-4">
                      <p>Case No.: {selectedPleading.caseNumber || '[CASE NUMBER]'}</p>
                      {selectedPleading.judge && <p className="mt-2">Judge: {selectedPleading.judge}</p>}
                      <p className="mt-4 font-bold uppercase">{selectedPleading.title}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                {selectedPleading.paragraphs.map((para) => (
                  <p key={para.id} className="mb-4">
                    <span className="font-bold mr-4">{para.number}.</span>
                    {para.content}
                    {para.citations.length > 0 && (
                      <span className="italic"> ({para.citations.join('; ')})</span>
                    )}
                  </p>
                ))}

                {/* Prayer for Relief */}
                {selectedPleading.prayerForRelief.length > 0 && (
                  <div className="mt-8">
                    <p className="font-bold uppercase mb-4 text-center">{t('tools.pleadingDrafter.prayerForRelief2', 'PRAYER FOR RELIEF')}</p>
                    <p className="mb-2">{t('tools.pleadingDrafter.whereforePlaintiffRespectfullyRequestsThat', 'WHEREFORE, Plaintiff respectfully requests that this Court:')}</p>
                    {selectedPleading.prayerForRelief.map((relief, idx) => (
                      <p key={idx} className="ml-8 mb-2">{idx + 1}. {relief};</p>
                    ))}
                  </div>
                )}

                {/* Verification */}
                {selectedPleading.verificationRequired && selectedPleading.verificationText && (
                  <div className="mt-8 border-t pt-4">
                    <p className="font-bold uppercase mb-4">{t('tools.pleadingDrafter.verification', 'VERIFICATION')}</p>
                    <p className="whitespace-pre-line">{selectedPleading.verificationText}</p>
                  </div>
                )}

                {/* Signature Block */}
                {selectedPleading.signatureBlock && (
                  <div className="mt-8 whitespace-pre-line">
                    {selectedPleading.signatureBlock}
                  </div>
                )}
              </div>
            </div>
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button onClick={() => setShowPreviewModal(false)} className={buttonSecondary}>
                {t('tools.pleadingDrafter.close', 'Close')}
              </button>
              <button onClick={() => print(selectedPleading.title)} className={buttonPrimary}>
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.pleadingDrafter.aboutPleadingDrafter', 'About Pleading Drafter')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Draft and manage legal pleading documents with party management, paragraph numbering, exhibit tracking, and jurisdiction-specific formatting.
          Create complaints, answers, motions, and other court filings with proper legal formatting and citation support.
          Track filing deadlines and document versions throughout the drafting process.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default PleadingDrafterTool;
