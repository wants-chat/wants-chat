'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Save,
  BookOpen,
  FileText,
  Bookmark,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Gavel,
  Building2,
  Globe,
  Star,
  StarOff,
  Copy,
  Link,
  Calendar,
  Tag,
  MessageSquare,
  History,
  TrendingUp,
  AlertCircle,
  Check,
  BarChart3,
  Users,
  FileCheck,
  Layers,
  MapPin,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface Citation {
  id: string;
  caseId: string;
  citedCase: string;
  citation: string;
  court: string;
  year: number;
  relationship: 'supporting' | 'distinguishing' | 'overruled' | 'questioned' | 'cited';
  relevance: 'high' | 'medium' | 'low';
  notes: string;
  pageReference: string;
  shepardStatus: 'positive' | 'negative' | 'caution' | 'neutral' | 'unknown';
}

interface StatuteReference {
  id: string;
  title: string;
  code: string;
  section: string;
  jurisdiction: string;
  effectiveDate: string;
  status: 'current' | 'amended' | 'repealed' | 'proposed';
  notes: string;
  relevance: 'primary' | 'secondary' | 'background';
}

interface SecondarySource {
  id: string;
  title: string;
  author: string;
  publication: string;
  type: 'treatise' | 'law-review' | 'practice-guide' | 'encyclopedia' | 'restatement' | 'other';
  citation: string;
  year: number;
  volume?: string;
  page?: string;
  notes: string;
  url?: string;
}

interface ResearchNote {
  id: string;
  content: string;
  category: 'issue' | 'argument' | 'finding' | 'question' | 'todo';
  createdAt: string;
  updatedAt: string;
}

interface ResearchTimelineEntry {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  sourceType?: 'case' | 'statute' | 'secondary' | 'memo';
}

interface ResearchProject {
  id: string;
  name: string;
  clientMatter: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'archived';
  priority: 'high' | 'medium' | 'low';
  jurisdiction: string;
  practiceArea: string;
  assignedTo: string;
  dueDate: string;
  issues: string[];
  citations: Citation[];
  statutes: StatuteReference[];
  secondarySources: SecondarySource[];
  notes: ResearchNote[];
  timeline: ResearchTimelineEntry[];
  westlawSearches: string[];
  lexisSearches: string[];
  memoContent: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LegalResearchToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'legal-research';

const projectColumns: ColumnConfig[] = [
  { key: 'name', header: 'Project Name', type: 'string' },
  { key: 'clientMatter', header: 'Client/Matter', type: 'string' },
  { key: 'jurisdiction', header: 'Jurisdiction', type: 'string' },
  { key: 'practiceArea', header: 'Practice Area', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewProject = (): ResearchProject => ({
  id: crypto.randomUUID(),
  name: '',
  clientMatter: '',
  description: '',
  status: 'active',
  priority: 'medium',
  jurisdiction: '',
  practiceArea: '',
  assignedTo: '',
  dueDate: '',
  issues: [],
  citations: [],
  statutes: [],
  secondarySources: [],
  notes: [],
  timeline: [],
  westlawSearches: [],
  lexisSearches: [],
  memoContent: '',
  tags: [],
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const practiceAreas = [
  'Administrative Law',
  'Antitrust',
  'Appellate',
  'Banking & Finance',
  'Bankruptcy',
  'Civil Litigation',
  'Commercial Law',
  'Constitutional Law',
  'Contract Law',
  'Corporate Law',
  'Criminal Law',
  'Employment Law',
  'Environmental Law',
  'Family Law',
  'Health Law',
  'Immigration Law',
  'Insurance Law',
  'Intellectual Property',
  'International Law',
  'Labor Law',
  'Mergers & Acquisitions',
  'Personal Injury',
  'Products Liability',
  'Real Estate',
  'Securities',
  'Tax Law',
  'Tort Law',
  'Trusts & Estates',
];

const jurisdictions = [
  'Federal - Supreme Court',
  'Federal - All Circuits',
  'Federal - 1st Circuit',
  'Federal - 2nd Circuit',
  'Federal - 3rd Circuit',
  'Federal - 4th Circuit',
  'Federal - 5th Circuit',
  'Federal - 6th Circuit',
  'Federal - 7th Circuit',
  'Federal - 8th Circuit',
  'Federal - 9th Circuit',
  'Federal - 10th Circuit',
  'Federal - 11th Circuit',
  'Federal - D.C. Circuit',
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

const shepardStatusLabels = {
  'positive': { label: 'Positive Treatment', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'negative': { label: 'Negative Treatment', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  'caution': { label: 'Caution', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'neutral': { label: 'Neutral', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  'unknown': { label: 'Not Checked', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export const LegalResearchTool: React.FC<LegalResearchToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: projects,
    addItem: addProject,
    updateItem: updateProject,
    deleteItem: deleteProject,
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
  } = useToolData<ResearchProject>(TOOL_ID, [], projectColumns);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPracticeArea, setFilterPracticeArea] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showStatuteModal, setShowStatuteModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);
  const [formData, setFormData] = useState<ResearchProject>(createNewProject());
  const [activeTab, setActiveTab] = useState<'overview' | 'citations' | 'statutes' | 'sources' | 'notes' | 'memo' | 'timeline'>('overview');
  const [newIssue, setNewIssue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    issues: true,
    citations: true,
    statutes: true,
    sources: true,
  });

  // Citation form state
  const [citationForm, setCitationForm] = useState<Omit<Citation, 'id'>>({
    caseId: '',
    citedCase: '',
    citation: '',
    court: '',
    year: new Date().getFullYear(),
    relationship: 'supporting',
    relevance: 'medium',
    notes: '',
    pageReference: '',
    shepardStatus: 'unknown',
  });

  // Statute form state
  const [statuteForm, setStatuteForm] = useState<Omit<StatuteReference, 'id'>>({
    title: '',
    code: '',
    section: '',
    jurisdiction: '',
    effectiveDate: '',
    status: 'current',
    notes: '',
    relevance: 'primary',
  });

  // Secondary source form state
  const [sourceForm, setSourceForm] = useState<Omit<SecondarySource, 'id'>>({
    title: '',
    author: '',
    publication: '',
    type: 'law-review',
    citation: '',
    year: new Date().getFullYear(),
    volume: '',
    page: '',
    notes: '',
    url: '',
  });

  // Note form state
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'issue' | 'argument' | 'finding' | 'question' | 'todo'>('finding');

  // Statistics
  const stats = useMemo(() => {
    const active = projects.filter(p => p.status === 'active');
    const highPriority = projects.filter(p => p.priority === 'high' && p.status === 'active');
    const totalCitations = projects.reduce((sum, p) => sum + p.citations.length, 0);
    const totalStatutes = projects.reduce((sum, p) => sum + p.statutes.length, 0);
    const favorites = projects.filter(p => p.isFavorite);
    const overdue = projects.filter(p => {
      if (!p.dueDate || p.status === 'completed') return false;
      return new Date(p.dueDate) < new Date();
    });
    return {
      total: projects.length,
      active: active.length,
      highPriority: highPriority.length,
      totalCitations,
      totalStatutes,
      favorites: favorites.length,
      overdue: overdue.length,
    };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientMatter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || project.status === filterStatus;
      const matchesPracticeArea = filterPracticeArea === '' || project.practiceArea === filterPracticeArea;
      const matchesPriority = filterPriority === '' || project.priority === filterPriority;
      const matchesFavorites = !showFavoritesOnly || project.isFavorite;
      return matchesSearch && matchesStatus && matchesPracticeArea && matchesPriority && matchesFavorites;
    });
  }, [projects, searchQuery, filterStatus, filterPracticeArea, filterPriority, showFavoritesOnly]);

  // Handlers
  const handleSaveProject = () => {
    const now = new Date().toISOString();
    if (editingProject) {
      updateProject(formData.id, { ...formData, updatedAt: now });
      if (selectedProject?.id === formData.id) {
        setSelectedProject({ ...formData, updatedAt: now });
      }
    } else {
      const newProject = { ...formData, createdAt: now, updatedAt: now };
      addProject(newProject);
    }
    setShowProjectModal(false);
    setEditingProject(null);
    setFormData(createNewProject());
  };

  const handleDeleteProject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this research project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteProject(id);
      if (selectedProject?.id === id) setSelectedProject(null);
    }
  };

  const openEditModal = (project: ResearchProject) => {
    setEditingProject(project);
    setFormData(project);
    setShowProjectModal(true);
  };

  const toggleFavorite = (project: ResearchProject) => {
    const updated = { ...project, isFavorite: !project.isFavorite, updatedAt: new Date().toISOString() };
    updateProject(project.id, updated);
    if (selectedProject?.id === project.id) {
      setSelectedProject(updated);
    }
  };

  const addIssue = () => {
    if (newIssue.trim() && selectedProject) {
      const updated = {
        ...selectedProject,
        issues: [...selectedProject.issues, newIssue.trim()],
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      setNewIssue('');
      addTimelineEntry('Added issue: ' + newIssue.trim());
    }
  };

  const removeIssue = (index: number) => {
    if (selectedProject) {
      const issue = selectedProject.issues[index];
      const updated = {
        ...selectedProject,
        issues: selectedProject.issues.filter((_, i) => i !== index),
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      addTimelineEntry('Removed issue: ' + issue);
    }
  };

  const addTag = () => {
    if (newTag.trim() && selectedProject && !selectedProject.tags.includes(newTag.trim())) {
      const updated = {
        ...selectedProject,
        tags: [...selectedProject.tags, newTag.trim()],
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    if (selectedProject) {
      const updated = {
        ...selectedProject,
        tags: selectedProject.tags.filter(t => t !== tag),
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
    }
  };

  const addTimelineEntry = (action: string, details: string = '', sourceType?: 'case' | 'statute' | 'secondary' | 'memo') => {
    if (selectedProject) {
      const entry: ResearchTimelineEntry = {
        id: crypto.randomUUID(),
        action,
        timestamp: new Date().toISOString(),
        details,
        sourceType,
      };
      const updated = {
        ...selectedProject,
        timeline: [entry, ...selectedProject.timeline],
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
    }
  };

  const saveCitation = () => {
    if (selectedProject && citationForm.citedCase) {
      const citation: Citation = { ...citationForm, id: crypto.randomUUID() };
      const updated = {
        ...selectedProject,
        citations: [...selectedProject.citations, citation],
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      setShowCitationModal(false);
      setCitationForm({
        caseId: '',
        citedCase: '',
        citation: '',
        court: '',
        year: new Date().getFullYear(),
        relationship: 'supporting',
        relevance: 'medium',
        notes: '',
        pageReference: '',
        shepardStatus: 'unknown',
      });
      addTimelineEntry('Added citation: ' + citation.citedCase, citation.citation, 'case');
    }
  };

  const deleteCitation = (id: string) => {
    if (selectedProject) {
      const citation = selectedProject.citations.find(c => c.id === id);
      const updated = {
        ...selectedProject,
        citations: selectedProject.citations.filter(c => c.id !== id),
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      if (citation) {
        addTimelineEntry('Removed citation: ' + citation.citedCase);
      }
    }
  };

  const saveStatute = () => {
    if (selectedProject && statuteForm.title) {
      const statute: StatuteReference = { ...statuteForm, id: crypto.randomUUID() };
      const updated = {
        ...selectedProject,
        statutes: [...selectedProject.statutes, statute],
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      setShowStatuteModal(false);
      setStatuteForm({
        title: '',
        code: '',
        section: '',
        jurisdiction: '',
        effectiveDate: '',
        status: 'current',
        notes: '',
        relevance: 'primary',
      });
      addTimelineEntry('Added statute: ' + statute.title, `${statute.code} ${statute.section}`, 'statute');
    }
  };

  const deleteStatute = (id: string) => {
    if (selectedProject) {
      const statute = selectedProject.statutes.find(s => s.id === id);
      const updated = {
        ...selectedProject,
        statutes: selectedProject.statutes.filter(s => s.id !== id),
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      if (statute) {
        addTimelineEntry('Removed statute: ' + statute.title);
      }
    }
  };

  const saveSecondarySource = () => {
    if (selectedProject && sourceForm.title) {
      const source: SecondarySource = { ...sourceForm, id: crypto.randomUUID() };
      const updated = {
        ...selectedProject,
        secondarySources: [...selectedProject.secondarySources, source],
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      setShowSourceModal(false);
      setSourceForm({
        title: '',
        author: '',
        publication: '',
        type: 'law-review',
        citation: '',
        year: new Date().getFullYear(),
        volume: '',
        page: '',
        notes: '',
        url: '',
      });
      addTimelineEntry('Added secondary source: ' + source.title, source.author, 'secondary');
    }
  };

  const deleteSecondarySource = (id: string) => {
    if (selectedProject) {
      const source = selectedProject.secondarySources.find(s => s.id === id);
      const updated = {
        ...selectedProject,
        secondarySources: selectedProject.secondarySources.filter(s => s.id !== id),
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      if (source) {
        addTimelineEntry('Removed secondary source: ' + source.title);
      }
    }
  };

  const addNote = () => {
    if (selectedProject && noteContent.trim()) {
      const note: ResearchNote = {
        id: crypto.randomUUID(),
        content: noteContent.trim(),
        category: noteCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = {
        ...selectedProject,
        notes: [...selectedProject.notes, note],
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      setNoteContent('');
      addTimelineEntry('Added research note', noteCategory);
    }
  };

  const deleteNote = (id: string) => {
    if (selectedProject) {
      const updated = {
        ...selectedProject,
        notes: selectedProject.notes.filter(n => n.id !== id),
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
    }
  };

  const saveMemo = () => {
    if (selectedProject) {
      const updated = {
        ...selectedProject,
        updatedAt: new Date().toISOString(),
      };
      updateProject(selectedProject.id, updated);
      setSelectedProject(updated);
      setShowMemoModal(false);
      addTimelineEntry('Updated research memo', '', 'memo');
    }
  };

  const updateMemoContent = (content: string) => {
    if (selectedProject) {
      setSelectedProject({ ...selectedProject, memoContent: content });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': case 'primary': return 'text-green-400';
      case 'medium': case 'secondary': return 'text-yellow-400';
      case 'low': case 'background': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getNoteIcon = (category: string) => {
    switch (category) {
      case 'issue': return AlertTriangle;
      case 'argument': return MessageSquare;
      case 'finding': return CheckCircle;
      case 'question': return AlertCircle;
      case 'todo': return Clock;
      default: return FileText;
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-indigo-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    isActive
      ? 'bg-indigo-500/20 text-indigo-400'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
            <Scale className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.legalResearch.legalResearch', 'Legal Research')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.legalResearch.manageResearchProjectsCitationsAnd', 'Manage research projects, citations, and legal analysis')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <WidgetEmbedButton toolSlug="legal-research" toolName="Legal Research" />

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
            onExportCSV={() => exportCSV({ filename: 'legal-research' })}
            onExportExcel={() => exportExcel({ filename: 'legal-research' })}
            onExportJSON={() => exportJSON({ filename: 'legal-research' })}
            onExportPDF={() => exportPDF({ filename: 'legal-research', title: 'Legal Research Projects' })}
            onPrint={() => print('Legal Research Projects')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={projects.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewProject()); setShowProjectModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('tools.legalResearch.newProject', 'New Project')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-lg">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.legalResearch.total', 'Total')}</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.legalResearch.active', 'Active')}</p>
              <p className="text-xl sm:text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.legalResearch.highPriority', 'High Priority')}</p>
              <p className="text-xl sm:text-2xl font-bold text-red-500">{stats.highPriority}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg">
              <Gavel className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.legalResearch.citations', 'Citations')}</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-500">{stats.totalCitations}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-lg">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.legalResearch.statutes', 'Statutes')}</p>
              <p className="text-xl sm:text-2xl font-bold text-cyan-500">{stats.totalStatutes}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.legalResearch.favorites', 'Favorites')}</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-500">{stats.favorites}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.legalResearch.overdue', 'Overdue')}</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-500">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.legalResearch.searchProjectsClientsOrDescriptions', 'Search projects, clients, or descriptions...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
              <option value="">{t('tools.legalResearch.allStatus', 'All Status')}</option>
              <option value="active">{t('tools.legalResearch.active2', 'Active')}</option>
              <option value="completed">{t('tools.legalResearch.completed', 'Completed')}</option>
              <option value="on-hold">{t('tools.legalResearch.onHold', 'On Hold')}</option>
              <option value="archived">{t('tools.legalResearch.archived', 'Archived')}</option>
            </select>
            <select value={filterPracticeArea} onChange={(e) => setFilterPracticeArea(e.target.value)} className={`${inputClass} w-full sm:w-44`}>
              <option value="">{t('tools.legalResearch.allPracticeAreas', 'All Practice Areas')}</option>
              {practiceAreas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
              <option value="">{t('tools.legalResearch.allPriority', 'All Priority')}</option>
              <option value="high">{t('tools.legalResearch.high', 'High')}</option>
              <option value="medium">{t('tools.legalResearch.medium', 'Medium')}</option>
              <option value="low">{t('tools.legalResearch.low', 'Low')}</option>
            </select>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                showFavoritesOnly
                  ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                  : theme === 'dark' ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              Research Projects ({filteredProjects.length})
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">{t('tools.legalResearch.noResearchProjects', 'No research projects')}</p>
                <p className="text-sm mt-1">{t('tools.legalResearch.createANewProjectTo', 'Create a new project to get started')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => { setSelectedProject(project); setActiveTab('overview'); }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedProject?.id === project.id
                        ? 'bg-indigo-500/10 border-l-4 border-indigo-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{project.name}</p>
                          {project.isFavorite && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" />}
                        </div>
                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {project.clientMatter}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                        {project.jurisdiction && (
                          <p className={`text-xs mt-2 flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            <MapPin className="w-3 h-3" />
                            {project.jurisdiction}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(project); }}
                          className="p-1.5 hover:bg-gray-600 rounded"
                        >
                          {project.isFavorite ? (
                            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(project); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedProject ? (
            <div>
              {/* Project Header */}
              <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(selectedProject.priority)}`}>
                        {selectedProject.priority} priority
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedProject.clientMatter}
                    </p>
                    {selectedProject.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedProject.tags.map(tag => (
                          <span key={tag} className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className={`px-4 sm:px-6 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
                <div className="flex gap-2 min-w-max">
                  <button onClick={() => setActiveTab('overview')} className={tabClass(activeTab === 'overview')}>{t('tools.legalResearch.overview', 'Overview')}</button>
                  <button onClick={() => setActiveTab('citations')} className={tabClass(activeTab === 'citations')}>
                    Citations ({selectedProject.citations.length})
                  </button>
                  <button onClick={() => setActiveTab('statutes')} className={tabClass(activeTab === 'statutes')}>
                    Statutes ({selectedProject.statutes.length})
                  </button>
                  <button onClick={() => setActiveTab('sources')} className={tabClass(activeTab === 'sources')}>
                    Sources ({selectedProject.secondarySources.length})
                  </button>
                  <button onClick={() => setActiveTab('notes')} className={tabClass(activeTab === 'notes')}>
                    Notes ({selectedProject.notes.length})
                  </button>
                  <button onClick={() => setActiveTab('memo')} className={tabClass(activeTab === 'memo')}>{t('tools.legalResearch.memo', 'Memo')}</button>
                  <button onClick={() => setActiveTab('timeline')} className={tabClass(activeTab === 'timeline')}>
                    Timeline ({selectedProject.timeline.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 max-h-[500px] overflow-y-auto">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Project Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.jurisdiction', 'Jurisdiction')}</p>
                        <p className="font-medium">{selectedProject.jurisdiction || 'Not set'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.practiceArea', 'Practice Area')}</p>
                        <p className="font-medium">{selectedProject.practiceArea || 'Not set'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.dueDate', 'Due Date')}</p>
                        <p className="font-medium">{selectedProject.dueDate || 'Not set'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.assignedTo', 'Assigned To')}</p>
                        <p className="font-medium">{selectedProject.assignedTo || 'Unassigned'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedProject.description && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('tools.legalResearch.description', 'Description')}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedProject.description}
                        </p>
                      </div>
                    )}

                    {/* Issues Section */}
                    <div>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('issues')}
                      >
                        <h3 className="font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          Legal Issues ({selectedProject.issues.length})
                        </h3>
                        {expandedSections.issues ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                      {expandedSections.issues && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newIssue}
                              onChange={(e) => setNewIssue(e.target.value)}
                              placeholder={t('tools.legalResearch.addALegalIssue', 'Add a legal issue...')}
                              className={inputClass}
                              onKeyPress={(e) => e.key === 'Enter' && addIssue()}
                            />
                            <button onClick={addIssue} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                          </div>
                          {selectedProject.issues.map((issue, idx) => (
                            <div key={idx} className={`flex items-start justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <p className="text-sm">{issue}</p>
                              <button onClick={() => removeIssue(idx)} className="p-1 hover:bg-red-500/20 rounded">
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tags Section */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-indigo-500" />
                        {t('tools.legalResearch.tags', 'Tags')}
                      </h3>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder={t('tools.legalResearch.addTag', 'Add tag...')}
                          className={`${inputClass} flex-1`}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <button onClick={addTag} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map(tag => (
                          <span key={tag} className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                            {tag}
                            <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                        <p className="text-2xl font-bold text-purple-500">{selectedProject.citations.length}</p>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.caseCitations', 'Case Citations')}</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                        <p className="text-2xl font-bold text-cyan-500">{selectedProject.statutes.length}</p>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.statutes2', 'Statutes')}</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
                        <p className="text-2xl font-bold text-green-500">{selectedProject.secondarySources.length}</p>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.secondarySources', 'Secondary Sources')}</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                        <p className="text-2xl font-bold text-yellow-500">{selectedProject.notes.length}</p>
                        <p className="text-xs text-gray-400">{t('tools.legalResearch.researchNotes', 'Research Notes')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Citations Tab */}
                {activeTab === 'citations' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{t('tools.legalResearch.caseLawCitations', 'Case Law Citations')}</h3>
                      <button onClick={() => setShowCitationModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Citation
                      </button>
                    </div>
                    {selectedProject.citations.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Gavel className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.legalResearch.noCitationsAddedYet', 'No citations added yet')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedProject.citations.map(citation => (
                          <div key={citation.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{citation.citedCase}</p>
                                  <span className={`px-2 py-0.5 text-xs rounded border ${shepardStatusLabels[citation.shepardStatus].color}`}>
                                    {shepardStatusLabels[citation.shepardStatus].label}
                                  </span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {citation.citation} ({citation.year})
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs">
                                  <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Court: {citation.court}
                                  </span>
                                  <span className={`capitalize ${getRelevanceColor(citation.relevance)}`}>
                                    {citation.relevance} relevance
                                  </span>
                                  <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                    {citation.relationship}
                                  </span>
                                </div>
                                {citation.notes && (
                                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {citation.notes}
                                  </p>
                                )}
                              </div>
                              <button onClick={() => deleteCitation(citation.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Statutes Tab */}
                {activeTab === 'statutes' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{t('tools.legalResearch.statutesRegulations', 'Statutes & Regulations')}</h3>
                      <button onClick={() => setShowStatuteModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Statute
                      </button>
                    </div>
                    {selectedProject.statutes.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.legalResearch.noStatutesAddedYet', 'No statutes added yet')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedProject.statutes.map(statute => (
                          <div key={statute.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{statute.title}</p>
                                  <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(statute.status)}`}>
                                    {statute.status}
                                  </span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {statute.code} {statute.section && `Section ${statute.section}`}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs">
                                  <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {statute.jurisdiction}
                                  </span>
                                  <span className={`capitalize ${getRelevanceColor(statute.relevance)}`}>
                                    {statute.relevance} authority
                                  </span>
                                </div>
                                {statute.notes && (
                                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {statute.notes}
                                  </p>
                                )}
                              </div>
                              <button onClick={() => deleteStatute(statute.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sources Tab */}
                {activeTab === 'sources' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{t('tools.legalResearch.secondarySources2', 'Secondary Sources')}</h3>
                      <button onClick={() => setShowSourceModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Source
                      </button>
                    </div>
                    {selectedProject.secondarySources.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.legalResearch.noSecondarySourcesAddedYet', 'No secondary sources added yet')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedProject.secondarySources.map(source => (
                          <div key={source.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{source.title}</p>
                                  <span className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                    {source.type.replace('-', ' ')}
                                  </span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {source.author} - {source.publication} ({source.year})
                                </p>
                                {source.citation && (
                                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {source.citation}
                                  </p>
                                )}
                                {source.notes && (
                                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {source.notes}
                                  </p>
                                )}
                                {source.url && (
                                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2">
                                    <ExternalLink className="w-3 h-3" /> View Source
                                  </a>
                                )}
                              </div>
                              <button onClick={() => deleteSecondarySource(source.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value as any)}
                        className={`${inputClass} sm:w-36`}
                      >
                        <option value="finding">{t('tools.legalResearch.finding', 'Finding')}</option>
                        <option value="issue">{t('tools.legalResearch.issue', 'Issue')}</option>
                        <option value="argument">{t('tools.legalResearch.argument', 'Argument')}</option>
                        <option value="question">{t('tools.legalResearch.question', 'Question')}</option>
                        <option value="todo">{t('tools.legalResearch.toDo', 'To-Do')}</option>
                      </select>
                      <div className="flex-1 flex gap-2">
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder={t('tools.legalResearch.addAResearchNote', 'Add a research note...')}
                          className={`${inputClass} flex-1`}
                          rows={2}
                        />
                        <button onClick={addNote} className={buttonPrimary}>
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {selectedProject.notes.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.legalResearch.noNotesAddedYet', 'No notes added yet')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedProject.notes.map(note => {
                          const NoteIcon = getNoteIcon(note.category);
                          return (
                            <div key={note.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <NoteIcon className="w-4 h-4 text-indigo-400" />
                                    <span className={`text-xs capitalize px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                      {note.category}
                                    </span>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {new Date(note.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm">{note.content}</p>
                                </div>
                                <button onClick={() => deleteNote(note.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Memo Tab */}
                {activeTab === 'memo' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-indigo-500" />
                        {t('tools.legalResearch.researchMemo2', 'Research Memo')}
                      </h3>
                      <button onClick={() => setShowMemoModal(true)} className={buttonPrimary}>
                        <Edit2 className="w-4 h-4" /> Edit Memo
                      </button>
                    </div>
                    {selectedProject.memoContent ? (
                      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedProject.memoContent}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.legalResearch.noMemoContentYet', 'No memo content yet')}</p>
                        <p className="text-sm mt-1">{t('tools.legalResearch.clickEditMemoToStart', 'Click Edit Memo to start drafting')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-500" />
                      {t('tools.legalResearch.researchTimeline', 'Research Timeline')}
                    </h3>
                    {selectedProject.timeline.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.legalResearch.noActivityRecordedYet', 'No activity recorded yet')}</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        <div className="space-y-4">
                          {selectedProject.timeline.map(entry => (
                            <div key={entry.id} className="relative pl-10">
                              <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${theme === 'dark' ? 'bg-gray-800 border-indigo-500' : 'bg-white border-indigo-500'}`}></div>
                              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                <p className="font-medium text-sm">{entry.action}</p>
                                {entry.details && (
                                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {entry.details}
                                  </p>
                                )}
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Scale className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.legalResearch.selectAResearchProject', 'Select a research project')}</p>
              <p className="text-sm">{t('tools.legalResearch.chooseAProjectToView', 'Choose a project to view details and manage research')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingProject ? t('tools.legalResearch.editProject', 'Edit Project') : t('tools.legalResearch.newResearchProject', 'New Research Project')}</h2>
              <button onClick={() => { setShowProjectModal(false); setEditingProject(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.legalResearch.projectName', 'Project Name *')}</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.eGSmithVJones', 'e.g., Smith v. Jones Motion Research')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.clientMatter', 'Client/Matter')}</label>
                  <input type="text" value={formData.clientMatter} onChange={(e) => setFormData({ ...formData, clientMatter: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.eGAbcCorp2024', 'e.g., ABC Corp - 2024-001')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.assignedTo2', 'Assigned To')}</label>
                  <input type="text" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.attorneyName', 'Attorney name')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.jurisdiction2', 'Jurisdiction')}</label>
                  <select value={formData.jurisdiction} onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.legalResearch.selectJurisdiction', 'Select jurisdiction')}</option>
                    {jurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.practiceArea2', 'Practice Area')}</label>
                  <select value={formData.practiceArea} onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.legalResearch.selectPracticeArea', 'Select practice area')}</option>
                    {practiceAreas.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.status', 'Status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.legalResearch.active3', 'Active')}</option>
                    <option value="completed">{t('tools.legalResearch.completed2', 'Completed')}</option>
                    <option value="on-hold">{t('tools.legalResearch.onHold2', 'On Hold')}</option>
                    <option value="archived">{t('tools.legalResearch.archived2', 'Archived')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.priority', 'Priority')}</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className={inputClass}>
                    <option value="high">{t('tools.legalResearch.high2', 'High')}</option>
                    <option value="medium">{t('tools.legalResearch.medium2', 'Medium')}</option>
                    <option value="low">{t('tools.legalResearch.low2', 'Low')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.dueDate2', 'Due Date')}</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.legalResearch.description2', 'Description')}</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.legalResearch.briefDescriptionOfTheResearch', 'Brief description of the research project...')} />
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowProjectModal(false); setEditingProject(null); }} className={buttonSecondary}>{t('tools.legalResearch.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSaveProject} disabled={!formData.name} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citation Modal */}
      {showCitationModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.legalResearch.addCaseCitation', 'Add Case Citation')}</h2>
              <button onClick={() => setShowCitationModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.legalResearch.caseName', 'Case Name *')}</label>
                <input type="text" value={citationForm.citedCase} onChange={(e) => setCitationForm({ ...citationForm, citedCase: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.eGMirandaVArizona', 'e.g., Miranda v. Arizona')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.citation', 'Citation')}</label>
                <input type="text" value={citationForm.citation} onChange={(e) => setCitationForm({ ...citationForm, citation: e.target.value })} className={inputClass} placeholder="e.g., 384 U.S. 436" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.court', 'Court')}</label>
                  <input type="text" value={citationForm.court} onChange={(e) => setCitationForm({ ...citationForm, court: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.eGUSSupreme', 'e.g., U.S. Supreme Court')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.year', 'Year')}</label>
                  <input type="number" value={citationForm.year} onChange={(e) => setCitationForm({ ...citationForm, year: parseInt(e.target.value) })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.relationship', 'Relationship')}</label>
                  <select value={citationForm.relationship} onChange={(e) => setCitationForm({ ...citationForm, relationship: e.target.value as any })} className={inputClass}>
                    <option value="supporting">{t('tools.legalResearch.supporting', 'Supporting')}</option>
                    <option value="distinguishing">{t('tools.legalResearch.distinguishing', 'Distinguishing')}</option>
                    <option value="overruled">{t('tools.legalResearch.overruled', 'Overruled')}</option>
                    <option value="questioned">{t('tools.legalResearch.questioned', 'Questioned')}</option>
                    <option value="cited">{t('tools.legalResearch.cited', 'Cited')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.relevance', 'Relevance')}</label>
                  <select value={citationForm.relevance} onChange={(e) => setCitationForm({ ...citationForm, relevance: e.target.value as any })} className={inputClass}>
                    <option value="high">{t('tools.legalResearch.high3', 'High')}</option>
                    <option value="medium">{t('tools.legalResearch.medium3', 'Medium')}</option>
                    <option value="low">{t('tools.legalResearch.low3', 'Low')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.shepardSKeyciteStatus', 'Shepard\'s/KeyCite Status')}</label>
                <select value={citationForm.shepardStatus} onChange={(e) => setCitationForm({ ...citationForm, shepardStatus: e.target.value as any })} className={inputClass}>
                  <option value="positive">{t('tools.legalResearch.positiveTreatment', 'Positive Treatment')}</option>
                  <option value="negative">{t('tools.legalResearch.negativeTreatment', 'Negative Treatment')}</option>
                  <option value="caution">{t('tools.legalResearch.caution', 'Caution')}</option>
                  <option value="neutral">{t('tools.legalResearch.neutral', 'Neutral')}</option>
                  <option value="unknown">{t('tools.legalResearch.notChecked', 'Not Checked')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.pageReference', 'Page Reference')}</label>
                <input type="text" value={citationForm.pageReference} onChange={(e) => setCitationForm({ ...citationForm, pageReference: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.eGAt46768', 'e.g., at 467-68')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.notes', 'Notes')}</label>
                <textarea value={citationForm.notes} onChange={(e) => setCitationForm({ ...citationForm, notes: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.legalResearch.keyHoldingsQuotationsOrAnalysis', 'Key holdings, quotations, or analysis...')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowCitationModal(false)} className={buttonSecondary}>{t('tools.legalResearch.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveCitation} disabled={!citationForm.citedCase} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Citation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statute Modal */}
      {showStatuteModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.legalResearch.addStatuteReference', 'Add Statute Reference')}</h2>
              <button onClick={() => setShowStatuteModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.legalResearch.titleName', 'Title/Name *')}</label>
                <input type="text" value={statuteForm.title} onChange={(e) => setStatuteForm({ ...statuteForm, title: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.eGSecuritiesExchangeAct', 'e.g., Securities Exchange Act of 1934')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.code', 'Code')}</label>
                  <input type="text" value={statuteForm.code} onChange={(e) => setStatuteForm({ ...statuteForm, code: e.target.value })} className={inputClass} placeholder="e.g., 15 U.S.C." />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.section', 'Section')}</label>
                  <input type="text" value={statuteForm.section} onChange={(e) => setStatuteForm({ ...statuteForm, section: e.target.value })} className={inputClass} placeholder="e.g., 78j(b)" />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.jurisdiction3', 'Jurisdiction')}</label>
                <select value={statuteForm.jurisdiction} onChange={(e) => setStatuteForm({ ...statuteForm, jurisdiction: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.legalResearch.selectJurisdiction2', 'Select jurisdiction')}</option>
                  {jurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.status2', 'Status')}</label>
                  <select value={statuteForm.status} onChange={(e) => setStatuteForm({ ...statuteForm, status: e.target.value as any })} className={inputClass}>
                    <option value="current">{t('tools.legalResearch.current', 'Current')}</option>
                    <option value="amended">{t('tools.legalResearch.amended', 'Amended')}</option>
                    <option value="repealed">{t('tools.legalResearch.repealed', 'Repealed')}</option>
                    <option value="proposed">{t('tools.legalResearch.proposed', 'Proposed')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.relevance2', 'Relevance')}</label>
                  <select value={statuteForm.relevance} onChange={(e) => setStatuteForm({ ...statuteForm, relevance: e.target.value as any })} className={inputClass}>
                    <option value="primary">{t('tools.legalResearch.primaryAuthority', 'Primary Authority')}</option>
                    <option value="secondary">{t('tools.legalResearch.secondary', 'Secondary')}</option>
                    <option value="background">{t('tools.legalResearch.background', 'Background')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.effectiveDate', 'Effective Date')}</label>
                <input type="date" value={statuteForm.effectiveDate} onChange={(e) => setStatuteForm({ ...statuteForm, effectiveDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.notes2', 'Notes')}</label>
                <textarea value={statuteForm.notes} onChange={(e) => setStatuteForm({ ...statuteForm, notes: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.legalResearch.keyProvisionsInterpretationsOrAnalysis', 'Key provisions, interpretations, or analysis...')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowStatuteModal(false)} className={buttonSecondary}>{t('tools.legalResearch.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveStatute} disabled={!statuteForm.title} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Statute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Source Modal */}
      {showSourceModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.legalResearch.addSecondarySource', 'Add Secondary Source')}</h2>
              <button onClick={() => setShowSourceModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.legalResearch.title', 'Title *')}</label>
                <input type="text" value={sourceForm.title} onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.articleOrBookTitle', 'Article or book title')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.authorS', 'Author(s)')}</label>
                <input type="text" value={sourceForm.author} onChange={(e) => setSourceForm({ ...sourceForm, author: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.authorNameS', 'Author name(s)')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.publication', 'Publication')}</label>
                  <input type="text" value={sourceForm.publication} onChange={(e) => setSourceForm({ ...sourceForm, publication: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.journalOrPublisher', 'Journal or publisher')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.type', 'Type')}</label>
                  <select value={sourceForm.type} onChange={(e) => setSourceForm({ ...sourceForm, type: e.target.value as any })} className={inputClass}>
                    <option value="law-review">{t('tools.legalResearch.lawReviewArticle', 'Law Review Article')}</option>
                    <option value="treatise">{t('tools.legalResearch.treatise', 'Treatise')}</option>
                    <option value="practice-guide">{t('tools.legalResearch.practiceGuide', 'Practice Guide')}</option>
                    <option value="encyclopedia">{t('tools.legalResearch.legalEncyclopedia', 'Legal Encyclopedia')}</option>
                    <option value="restatement">{t('tools.legalResearch.restatement', 'Restatement')}</option>
                    <option value="other">{t('tools.legalResearch.other', 'Other')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.volume', 'Volume')}</label>
                  <input type="text" value={sourceForm.volume} onChange={(e) => setSourceForm({ ...sourceForm, volume: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.vol', 'Vol.')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.page', 'Page')}</label>
                  <input type="text" value={sourceForm.page} onChange={(e) => setSourceForm({ ...sourceForm, page: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.page2', 'Page')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.legalResearch.year2', 'Year')}</label>
                  <input type="number" value={sourceForm.year} onChange={(e) => setSourceForm({ ...sourceForm, year: parseInt(e.target.value) })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.fullCitation', 'Full Citation')}</label>
                <input type="text" value={sourceForm.citation} onChange={(e) => setSourceForm({ ...sourceForm, citation: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.fullBluebookCitation', 'Full Bluebook citation')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.urlOptional', 'URL (optional)')}</label>
                <input type="url" value={sourceForm.url} onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })} className={inputClass} placeholder={t('tools.legalResearch.https', 'https://...')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.legalResearch.notes3', 'Notes')}</label>
                <textarea value={sourceForm.notes} onChange={(e) => setSourceForm({ ...sourceForm, notes: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.legalResearch.keyInsightsOrRelevance', 'Key insights or relevance...')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowSourceModal(false)} className={buttonSecondary}>{t('tools.legalResearch.cancel4', 'Cancel')}</button>
                <button type="button" onClick={saveSecondarySource} disabled={!sourceForm.title} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memo Modal */}
      {showMemoModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.legalResearch.researchMemo', 'Research Memo')}</h2>
              <button onClick={() => setShowMemoModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-400">
                  {t('tools.legalResearch.draftYourResearchMemoBelow', 'Draft your research memo below. Include the Question Presented, Brief Answer, Statement of Facts, Discussion, and Conclusion sections as applicable.')}
                </p>
              </div>
              <textarea
                value={selectedProject.memoContent}
                onChange={(e) => updateMemoContent(e.target.value)}
                className={`${inputClass} min-h-[400px] font-mono text-sm`}
                placeholder={t('tools.legalResearch.memoTemplate', `MEMORANDUM\n\nTO:\nFROM:\nDATE:\nRE:\n\nQUESTION PRESENTED\n[State the legal question(s) to be answered]\n\nBRIEF ANSWER\n[Provide a concise answer to the question(s)]\n\nSTATEMENT OF FACTS\n[Relevant facts of the matter]\n\nDISCUSSION\n[Legal analysis and application]\n\nCONCLUSION\n[Summary and recommendations]`)}
              />

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowMemoModal(false)} className={buttonSecondary}>{t('tools.legalResearch.cancel5', 'Cancel')}</button>
                <button type="button" onClick={saveMemo} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Memo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.legalResearch.aboutLegalResearchTool', 'About Legal Research Tool')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your legal research projects with comprehensive tracking of case law citations, statutes, regulations, and secondary sources.
          Track Shepard's/KeyCite status, organize research by jurisdiction and practice area, maintain research notes, draft memos, and
          keep a complete timeline of your research activities. Supports integration tracking for Westlaw and Lexis searches.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default LegalResearchTool;
