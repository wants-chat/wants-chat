'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Languages,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  DollarSign,
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  Star,
  Phone,
  Video,
  MapPin,
  Zap,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Award,
  Briefcase,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

// Types
interface Translator {
  id: string;
  name: string;
  email: string;
  languagePairs: { source: string; target: string }[];
  specializations: string[];
  hourlyRate: number;
  certifications: string[];
  rating: number;
  availability: 'available' | 'busy' | 'unavailable';
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  isRecurring: boolean;
  discountPercentage: number;
  projectCount: number;
  totalSpent: number;
}

interface TranslationProject {
  id: string;
  clientId: string;
  translatorId: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  documentType: string;
  specialization: string;
  wordCount: number;
  pricePerWord: number;
  totalPrice: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'delivered';
  deadline: string;
  createdAt: string;
  isRush: boolean;
  isCertified: boolean;
  rushFee: number;
  certificationFee: number;
  notes: string;
  reviewStatus: 'not_started' | 'in_progress' | 'approved' | 'revision_needed';
  reviewNotes: string;
}

interface InterpretationSession {
  id: string;
  clientId: string;
  interpreterId: string | null;
  type: 'in_person' | 'phone' | 'video';
  sourceLanguage: string;
  targetLanguage: string;
  specialization: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in hours
  hourlyRate: number;
  totalPrice: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  notes: string;
}

interface Invoice {
  id: string;
  clientId: string;
  projectIds: string[];
  sessionIds: string[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  dueDate: string;
}

// Constants
const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese (Simplified)', 'Chinese (Traditional)', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Bengali', 'Dutch', 'Polish', 'Turkish', 'Vietnamese', 'Thai', 'Indonesian',
  'Malay', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Hebrew', 'Czech',
  'Romanian', 'Hungarian', 'Ukrainian', 'Farsi', 'Swahili', 'Tagalog'
];

const DOCUMENT_TYPES = [
  'General Document', 'Legal Contract', 'Medical Report', 'Technical Manual',
  'Marketing Material', 'Website Content', 'Academic Paper', 'Financial Report',
  'Patent Document', 'Immigration Document', 'Birth Certificate', 'Marriage Certificate',
  'Diploma/Transcript', 'Business Plan', 'User Manual', 'Software UI', 'Subtitle/Caption'
];

const SPECIALIZATIONS = [
  'General', 'Legal', 'Medical', 'Technical', 'Marketing', 'Financial',
  'Scientific', 'Literary', 'IT/Software', 'Engineering', 'Pharmaceutical',
  'Automotive', 'Aerospace', 'Gaming', 'E-commerce', 'Tourism'
];

const BASE_RATES: Record<string, number> = {
  'General': 0.08,
  'Legal': 0.15,
  'Medical': 0.14,
  'Technical': 0.12,
  'Marketing': 0.10,
  'Financial': 0.13,
  'Scientific': 0.14,
  'Literary': 0.11,
  'IT/Software': 0.12,
  'Engineering': 0.13,
  'Pharmaceutical': 0.15,
  'Automotive': 0.12,
  'Aerospace': 0.16,
  'Gaming': 0.10,
  'E-commerce': 0.09,
  'Tourism': 0.08
};

const RUSH_FEE_PERCENTAGE = 0.50;
const CERTIFICATION_FEE = 25;
const TAX_RATE = 0.10;

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Export columns configuration
const PROJECTS_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Project ID', type: 'string' },
  { key: 'clientId', header: 'Client ID', type: 'string' },
  { key: 'sourceLanguage', header: 'Source Language', type: 'string' },
  { key: 'targetLanguage', header: 'Target Language', type: 'string' },
  { key: 'documentType', header: 'Document Type', type: 'string' },
  { key: 'specialization', header: 'Specialization', type: 'string' },
  { key: 'wordCount', header: 'Word Count', type: 'number' },
  { key: 'pricePerWord', header: 'Price per Word', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'deadline', header: 'Deadline', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'isRush', header: 'Rush Order', type: 'boolean' },
  { key: 'isCertified', header: 'Certified', type: 'boolean' },
  { key: 'translatorId', header: 'Translator ID', type: 'string' },
];

const INTERPRETATION_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Session ID', type: 'string' },
  { key: 'clientId', header: 'Client ID', type: 'string' },
  { key: 'type', header: 'Session Type', type: 'string' },
  { key: 'sourceLanguage', header: 'Source Language', type: 'string' },
  { key: 'targetLanguage', header: 'Target Language', type: 'string' },
  { key: 'specialization', header: 'Specialization', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'duration', header: 'Duration (hours)', type: 'number' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'interpreterId', header: 'Interpreter ID', type: 'string' },
];

const TRANSLATORS_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Translator ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'availability', header: 'Availability', type: 'string' },
];

const CLIENTS_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Client ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'isRecurring', header: 'Recurring Client', type: 'boolean' },
  { key: 'discountPercentage', header: 'Discount %', type: 'number' },
  { key: 'projectCount', header: 'Project Count', type: 'number' },
  { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
];

const INVOICES_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Invoice ID', type: 'string' },
  { key: 'clientId', header: 'Client ID', type: 'string' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'discount', header: 'Discount', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
];

interface TranslationServiceToolProps {
  uiConfig?: UIConfig;
}

export const TranslationServiceTool: React.FC<TranslationServiceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Initialize hooks for data with backend sync
  const translatorsData = useToolData<Translator>(
    'translation-service-translators',
    [],
    TRANSLATORS_EXPORT_COLUMNS,
    { autoSave: true }
  );
  const {
    data: translators,
    isSynced: translatorsSynced,
    isSaving: translatorsSaving,
    lastSaved: translatorsLastSaved,
    syncError: translatorsSyncError,
    forceSync: forceTranslatorsSync,
  } = translatorsData;

  const clientsData = useToolData<Client>(
    'translation-service-clients',
    [],
    CLIENTS_EXPORT_COLUMNS,
    { autoSave: true }
  );
  const {
    data: clients,
    isSynced: clientsSynced,
    isSaving: clientsSaving,
    lastSaved: clientsLastSaved,
    syncError: clientsSyncError,
    forceSync: forceClientsSync,
  } = clientsData;

  const projectsData = useToolData<TranslationProject>(
    'translation-service-projects',
    [],
    PROJECTS_EXPORT_COLUMNS,
    { autoSave: true }
  );
  const {
    data: projects,
    isSynced: projectsSynced,
    isSaving: projectsSaving,
    lastSaved: projectsLastSaved,
    syncError: projectsSyncError,
    forceSync: forceProjectsSync,
  } = projectsData;

  const sessionsData = useToolData<InterpretationSession>(
    'translation-service-sessions',
    [],
    INTERPRETATION_EXPORT_COLUMNS,
    { autoSave: true }
  );
  const {
    data: sessions,
    isSynced: sessionsSynced,
    isSaving: sessionsSaving,
    lastSaved: sessionsLastSaved,
    syncError: sessionsSyncError,
    forceSync: forceSessionsSync,
  } = sessionsData;

  const invoicesData = useToolData<Invoice>(
    'translation-service-invoices',
    [],
    INVOICES_EXPORT_COLUMNS,
    { autoSave: true }
  );
  const {
    data: invoices,
    isSynced: invoicesSynced,
    isSaving: invoicesSaving,
    lastSaved: invoicesLastSaved,
    syncError: invoicesSyncError,
    forceSync: forceInvoicesSync,
  } = invoicesData;

  // State
  const [activeTab, setActiveTab] = useState<'projects' | 'interpretation' | 'translators' | 'clients' | 'invoices'>('projects');

  // UI State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showTranslatorForm, setShowTranslatorForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Form States
  const [projectForm, setProjectForm] = useState({
    clientId: '',
    sourceLanguage: 'English',
    targetLanguage: 'Spanish',
    documentType: 'General Document',
    specialization: 'General',
    wordCount: 0,
    deadline: '',
    isRush: false,
    isCertified: false,
    notes: ''
  });

  const [sessionForm, setSessionForm] = useState({
    clientId: '',
    type: 'video' as 'in_person' | 'phone' | 'video',
    sourceLanguage: 'English',
    targetLanguage: 'Spanish',
    specialization: 'General',
    scheduledDate: '',
    scheduledTime: '',
    duration: 1,
    location: '',
    notes: ''
  });

  const [translatorForm, setTranslatorForm] = useState({
    name: '',
    email: '',
    languagePairs: [{ source: 'English', target: 'Spanish' }],
    specializations: ['General'],
    hourlyRate: 50,
    certifications: [] as string[],
    newCertification: ''
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    isRecurring: false,
    discountPercentage: 0
  });

  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    selectedProjects: [] as string[],
    selectedSessions: [] as string[],
    dueDate: ''
  });

  // Calculate project price
  const calculateProjectPrice = useMemo(() => {
    return (wordCount: number, specialization: string, isRush: boolean, isCertified: boolean, discountPercentage: number = 0) => {
      const baseRate = BASE_RATES[specialization] || BASE_RATES['General'];
      let total = wordCount * baseRate;

      if (isRush) {
        total += total * RUSH_FEE_PERCENTAGE;
      }

      if (isCertified) {
        total += CERTIFICATION_FEE;
      }

      if (discountPercentage > 0) {
        total -= total * (discountPercentage / 100);
      }

      return total;
    };
  }, []);

  // Calculate session price
  const calculateSessionPrice = (duration: number, specialization: string, discountPercentage: number = 0) => {
    const baseRate = (BASE_RATES[specialization] || BASE_RATES['General']) * 1000; // Convert to hourly
    let total = duration * baseRate;

    if (discountPercentage > 0) {
      total -= total * (discountPercentage / 100);
    }

    return total;
  };

  // Get client by ID
  const getClient = (clientId: string) => clients.find(c => c.id === clientId);

  // Get translator by ID
  const getTranslator = (translatorId: string) => translators.find(t => t.id === translatorId);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const client = getClient(project.clientId);
      const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.documentType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter, clients]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const client = getClient(session.clientId);
      const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchTerm, statusFilter, clients]);

  // Dashboard stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => !['completed', 'delivered'].includes(p.status)).length;
    const pendingReviews = projects.filter(p => p.status === 'review').length;
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length;
    const totalRevenue = projects.reduce((sum, p) => sum + (p.status === 'delivered' ? p.totalPrice : 0), 0) +
                        sessions.reduce((sum, s) => sum + (s.status === 'completed' ? s.totalPrice : 0), 0);
    const rushOrders = projects.filter(p => p.isRush && !['completed', 'delivered'].includes(p.status)).length;
    const certifiedProjects = projects.filter(p => p.isCertified).length;

    return { activeProjects, pendingReviews, upcomingSessions, totalRevenue, rushOrders, certifiedProjects };
  }, [projects, sessions]);

  // Handlers
  const handleAddProject = () => {
    const client = getClient(projectForm.clientId);
    const discount = client?.discountPercentage || 0;
    const totalPrice = calculateProjectPrice(
      projectForm.wordCount,
      projectForm.specialization,
      projectForm.isRush,
      projectForm.isCertified,
      discount
    );

    const newProject: TranslationProject = {
      id: generateId(),
      clientId: projectForm.clientId,
      translatorId: null,
      sourceLanguage: projectForm.sourceLanguage,
      targetLanguage: projectForm.targetLanguage,
      documentType: projectForm.documentType,
      specialization: projectForm.specialization,
      wordCount: projectForm.wordCount,
      pricePerWord: BASE_RATES[projectForm.specialization] || BASE_RATES['General'],
      totalPrice,
      status: 'pending',
      deadline: projectForm.deadline,
      createdAt: new Date().toISOString(),
      isRush: projectForm.isRush,
      isCertified: projectForm.isCertified,
      rushFee: projectForm.isRush ? projectForm.wordCount * (BASE_RATES[projectForm.specialization] || BASE_RATES['General']) * RUSH_FEE_PERCENTAGE : 0,
      certificationFee: projectForm.isCertified ? CERTIFICATION_FEE : 0,
      notes: projectForm.notes,
      reviewStatus: 'not_started',
      reviewNotes: ''
    };

    projectsData.addItem(newProject);

    // Update client stats
    if (client) {
      clientsData.updateItem(client.id, { projectCount: client.projectCount + 1 });
    }

    resetProjectForm();
    setShowProjectForm(false);
  };

  const handleAddSession = () => {
    const client = getClient(sessionForm.clientId);
    const discount = client?.discountPercentage || 0;
    const hourlyRate = (BASE_RATES[sessionForm.specialization] || BASE_RATES['General']) * 1000;
    const totalPrice = calculateSessionPrice(sessionForm.duration, sessionForm.specialization, discount);

    const newSession: InterpretationSession = {
      id: generateId(),
      clientId: sessionForm.clientId,
      interpreterId: null,
      type: sessionForm.type,
      sourceLanguage: sessionForm.sourceLanguage,
      targetLanguage: sessionForm.targetLanguage,
      specialization: sessionForm.specialization,
      scheduledDate: sessionForm.scheduledDate,
      scheduledTime: sessionForm.scheduledTime,
      duration: sessionForm.duration,
      hourlyRate,
      totalPrice,
      status: 'scheduled',
      location: sessionForm.location,
      notes: sessionForm.notes
    };

    sessionsData.addItem(newSession);
    resetSessionForm();
    setShowSessionForm(false);
  };

  const handleAddTranslator = () => {
    const newTranslator: Translator = {
      id: generateId(),
      name: translatorForm.name,
      email: translatorForm.email,
      languagePairs: translatorForm.languagePairs,
      specializations: translatorForm.specializations,
      hourlyRate: translatorForm.hourlyRate,
      certifications: translatorForm.certifications,
      rating: 5.0,
      availability: 'available'
    };

    translatorsData.addItem(newTranslator);
    resetTranslatorForm();
    setShowTranslatorForm(false);
  };

  const handleAddClient = () => {
    const newClient: Client = {
      id: generateId(),
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone,
      company: clientForm.company,
      isRecurring: clientForm.isRecurring,
      discountPercentage: clientForm.isRecurring ? clientForm.discountPercentage : 0,
      projectCount: 0,
      totalSpent: 0
    };

    clientsData.addItem(newClient);
    resetClientForm();
    setShowClientForm(false);
  };

  const handleGenerateInvoice = () => {
    const client = getClient(invoiceForm.clientId);
    if (!client) return;

    const selectedProjectsData = projects.filter(p => invoiceForm.selectedProjects.includes(p.id));
    const selectedSessionsData = sessions.filter(s => invoiceForm.selectedSessions.includes(s.id));

    const subtotal = selectedProjectsData.reduce((sum, p) => sum + p.totalPrice, 0) +
                    selectedSessionsData.reduce((sum, s) => sum + s.totalPrice, 0);
    const discount = subtotal * (client.discountPercentage / 100);
    const tax = (subtotal - discount) * TAX_RATE;
    const total = subtotal - discount + tax;

    const newInvoice: Invoice = {
      id: generateId(),
      clientId: invoiceForm.clientId,
      projectIds: invoiceForm.selectedProjects,
      sessionIds: invoiceForm.selectedSessions,
      subtotal,
      discount,
      tax,
      total,
      status: 'draft',
      createdAt: new Date().toISOString(),
      dueDate: invoiceForm.dueDate
    };

    invoicesData.addItem(newInvoice);

    // Update client total spent
    clientsData.updateItem(client.id, { totalSpent: client.totalSpent + total });

    resetInvoiceForm();
    setShowInvoiceForm(false);
  };

  const handleAssignTranslator = (projectId: string, translatorId: string) => {
    projectsData.updateItem(projectId, { translatorId, status: 'assigned' as const });
  };

  const handleAssignInterpreter = (sessionId: string, interpreterId: string) => {
    sessionsData.updateItem(sessionId, { interpreterId });
  };

  const handleUpdateProjectStatus = (projectId: string, status: TranslationProject['status']) => {
    projectsData.updateItem(projectId, { status });
  };

  const handleUpdateSessionStatus = (sessionId: string, status: InterpretationSession['status']) => {
    sessionsData.updateItem(sessionId, { status });
  };

  const handleUpdateReviewStatus = (projectId: string, reviewStatus: TranslationProject['reviewStatus'], reviewNotes: string = '') => {
    projectsData.updateItem(projectId, { reviewStatus, reviewNotes });
  };

  const handleDeleteProject = (projectId: string) => {
    projectsData.deleteItem(projectId);
  };

  const handleDeleteSession = (sessionId: string) => {
    sessionsData.deleteItem(sessionId);
  };

  const handleDeleteTranslator = (translatorId: string) => {
    translatorsData.deleteItem(translatorId);
  };

  const handleDeleteClient = (clientId: string) => {
    clientsData.deleteItem(clientId);
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    invoicesData.updateItem(invoiceId, { status });
  };

  // Export handlers using hook methods
  const handleExportProjectsCSV = () => {
    projectsData.exportCSV({ filename: 'translation-projects' });
  };

  const handleExportProjectsExcel = () => {
    projectsData.exportExcel({ filename: 'translation-projects' });
  };

  const handleExportProjectsJSON = () => {
    projectsData.exportJSON({ filename: 'translation-projects' });
  };

  const handleExportProjectsPDF = async () => {
    await projectsData.exportPDF({
      filename: 'translation-projects',
      title: 'Translation Projects Report',
      subtitle: `Total Projects: ${projects.length} | Total Revenue: ${formatCurrency(projects.reduce((sum, p) => sum + p.totalPrice, 0))}`,
      orientation: 'landscape',
    });
  };

  const handleCopyProjectsClipboard = async () => {
    return projectsData.copyToClipboard('json');
  };

  const handlePrintProjects = () => {
    projectsData.print(`Translation Projects Report (Total: ${projects.length})`);
  };

  const handleExportInterpretationCSV = () => {
    sessionsData.exportCSV({ filename: 'interpretation-sessions' });
  };

  const handleExportInterpretationExcel = () => {
    sessionsData.exportExcel({ filename: 'interpretation-sessions' });
  };

  const handleExportInterpretationJSON = () => {
    sessionsData.exportJSON({ filename: 'interpretation-sessions' });
  };

  const handleExportInterpretationPDF = async () => {
    await sessionsData.exportPDF({
      filename: 'interpretation-sessions',
      title: 'Interpretation Sessions Report',
      subtitle: `Total Sessions: ${sessions.length} | Total Revenue: ${formatCurrency(sessions.reduce((sum, s) => sum + s.totalPrice, 0))}`,
      orientation: 'landscape',
    });
  };

  const handleCopyInterpretationClipboard = async () => {
    return sessionsData.copyToClipboard('json');
  };

  const handlePrintInterpretation = () => {
    sessionsData.print(`Interpretation Sessions Report (Total: ${sessions.length})`);
  };

  const handleExportTranslatorsCSV = () => {
    translatorsData.exportCSV({ filename: 'translators' });
  };

  const handleExportTranslatorsExcel = () => {
    translatorsData.exportExcel({ filename: 'translators' });
  };

  const handleExportTranslatorsJSON = () => {
    translatorsData.exportJSON({ filename: 'translators' });
  };

  const handleExportTranslatorsPDF = async () => {
    await translatorsData.exportPDF({
      filename: 'translators',
      title: 'Translators Report',
      subtitle: `Total Translators: ${translators.length}`,
      orientation: 'portrait',
    });
  };

  const handleCopyTranslatorsClipboard = async () => {
    return translatorsData.copyToClipboard('json');
  };

  const handlePrintTranslators = () => {
    translatorsData.print(`Translators Report (Total: ${translators.length})`);
  };

  const handleExportClientsCSV = () => {
    clientsData.exportCSV({ filename: 'clients' });
  };

  const handleExportClientsExcel = () => {
    clientsData.exportExcel({ filename: 'clients' });
  };

  const handleExportClientsJSON = () => {
    clientsData.exportJSON({ filename: 'clients' });
  };

  const handleExportClientsPDF = async () => {
    await clientsData.exportPDF({
      filename: 'clients',
      title: 'Clients Report',
      subtitle: `Total Clients: ${clients.length} | Total Revenue: ${formatCurrency(clients.reduce((sum, c) => sum + c.totalSpent, 0))}`,
      orientation: 'landscape',
    });
  };

  const handleCopyClientsClipboard = async () => {
    return clientsData.copyToClipboard('json');
  };

  const handlePrintClients = () => {
    clientsData.print(`Clients Report (Total: ${clients.length})`);
  };

  const handleExportInvoicesCSV = () => {
    invoicesData.exportCSV({ filename: 'invoices' });
  };

  const handleExportInvoicesExcel = () => {
    invoicesData.exportExcel({ filename: 'invoices' });
  };

  const handleExportInvoicesJSON = () => {
    invoicesData.exportJSON({ filename: 'invoices' });
  };

  const handleExportInvoicesPDF = async () => {
    await invoicesData.exportPDF({
      filename: 'invoices',
      title: 'Invoices Report',
      subtitle: `Total Invoices: ${invoices.length} | Total Amount: ${formatCurrency(invoices.reduce((sum, i) => sum + i.total, 0))}`,
      orientation: 'landscape',
    });
  };

  const handleCopyInvoicesClipboard = async () => {
    return invoicesData.copyToClipboard('json');
  };

  const handlePrintInvoices = () => {
    invoicesData.print(`Invoices Report (Total: ${invoices.length})`);
  };

  // Reset forms
  const resetProjectForm = () => {
    setProjectForm({
      clientId: '',
      sourceLanguage: 'English',
      targetLanguage: 'Spanish',
      documentType: 'General Document',
      specialization: 'General',
      wordCount: 0,
      deadline: '',
      isRush: false,
      isCertified: false,
      notes: ''
    });
  };

  const resetSessionForm = () => {
    setSessionForm({
      clientId: '',
      type: 'video',
      sourceLanguage: 'English',
      targetLanguage: 'Spanish',
      specialization: 'General',
      scheduledDate: '',
      scheduledTime: '',
      duration: 1,
      location: '',
      notes: ''
    });
  };

  const resetTranslatorForm = () => {
    setTranslatorForm({
      name: '',
      email: '',
      languagePairs: [{ source: 'English', target: 'Spanish' }],
      specializations: ['General'],
      hourlyRate: 50,
      certifications: [],
      newCertification: ''
    });
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      isRecurring: false,
      discountPercentage: 0
    });
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      clientId: '',
      selectedProjects: [],
      selectedSessions: [],
      dueDate: ''
    });
  };

  // Get compatible translators for a language pair
  const getCompatibleTranslators = (source: string, target: string) => {
    return translators.filter(t =>
      t.languagePairs.some(lp => lp.source === source && lp.target === target) &&
      t.availability !== 'unavailable'
    );
  };

  // Styles
  const cardClass = `${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl`;
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;
  const labelClass = `block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`;
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] rounded-xl shadow-lg">
            <Languages className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textClass}`}>
              {t('tools.translationService.translationServiceManager', 'Translation Service Manager')}
            </h1>
            <p className={mutedTextClass}>
              {t('tools.translationService.manageTranslationProjectsInterpretationSessions', 'Manage translation projects, interpretation sessions, and invoicing')}
            </p>
          </div>
        </div>

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.translationService.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-[#0D9488]" />
              <span className={mutedTextClass}>{t('tools.translationService.activeProjects', 'Active Projects')}</span>
            </div>
            <p className={`text-2xl font-bold ${textClass}`}>{stats.activeProjects}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span className={mutedTextClass}>{t('tools.translationService.pendingReviews', 'Pending Reviews')}</span>
            </div>
            <p className={`text-2xl font-bold ${textClass}`}>{stats.pendingReviews}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className={mutedTextClass}>{t('tools.translationService.upcomingSessions', 'Upcoming Sessions')}</span>
            </div>
            <p className={`text-2xl font-bold ${textClass}`}>{stats.upcomingSessions}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className={mutedTextClass}>{t('tools.translationService.rushOrders', 'Rush Orders')}</span>
            </div>
            <p className={`text-2xl font-bold ${textClass}`}>{stats.rushOrders}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className={mutedTextClass}>{t('tools.translationService.certified', 'Certified')}</span>
            </div>
            <p className={`text-2xl font-bold ${textClass}`}>{stats.certifiedProjects}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className={mutedTextClass}>{t('tools.translationService.totalRevenue', 'Total Revenue')}</span>
            </div>
            <p className={`text-2xl font-bold ${textClass}`}>{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'projects', label: 'Translation Projects', icon: FileText },
            { id: 'interpretation', label: 'Interpretation', icon: Phone },
            { id: 'translators', label: 'Translators', icon: Users },
            { id: 'clients', label: 'Clients', icon: Briefcase },
            { id: 'invoices', label: 'Invoices', icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white shadow-lg'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        {(activeTab === 'projects' || activeTab === 'interpretation') && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedTextClass}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('tools.translationService.search', 'Search...')}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className={`w-5 h-5 ${mutedTextClass}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">{t('tools.translationService.allStatus', 'All Status')}</option>
                {activeTab === 'projects' ? (
                  <>
                    <option value="pending">{t('tools.translationService.pending', 'Pending')}</option>
                    <option value="assigned">{t('tools.translationService.assigned', 'Assigned')}</option>
                    <option value="in_progress">{t('tools.translationService.inProgress', 'In Progress')}</option>
                    <option value="review">{t('tools.translationService.review', 'Review')}</option>
                    <option value="completed">{t('tools.translationService.completed', 'Completed')}</option>
                    <option value="delivered">{t('tools.translationService.delivered', 'Delivered')}</option>
                  </>
                ) : (
                  <>
                    <option value="scheduled">{t('tools.translationService.scheduled', 'Scheduled')}</option>
                    <option value="in_progress">{t('tools.translationService.inProgress2', 'In Progress')}</option>
                    <option value="completed">{t('tools.translationService.completed2', 'Completed')}</option>
                    <option value="cancelled">{t('tools.translationService.cancelled', 'Cancelled')}</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Translation Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.translationProjects', 'Translation Projects')}</h2>
              <div className="flex items-center gap-2">
                <WidgetEmbedButton toolSlug="translation-service" toolName="Translation Service" />

                <SyncStatus
                  isSynced={projectsSynced}
                  isSaving={projectsSaving}
                  lastSaved={projectsLastSaved}
                  syncError={projectsSyncError}
                  onForceSync={forceProjectsSync}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={handleExportProjectsCSV}
                  onExportExcel={handleExportProjectsExcel}
                  onExportJSON={handleExportProjectsJSON}
                  onExportPDF={handleExportProjectsPDF}
                  onCopyToClipboard={handleCopyProjectsClipboard}
                  onPrint={handlePrintProjects}
                  disabled={projects.length === 0}
                  showImport={false}
                  theme={theme}
                />
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.translationService.newProject', 'New Project')}
                </button>
              </div>
            </div>

            {/* Project Form Modal */}
            {showProjectForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.newTranslationProject', 'New Translation Project')}</h3>
                    <button onClick={() => { setShowProjectForm(false); resetProjectForm(); }}>
                      <X className={`w-6 h-6 ${mutedTextClass}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Client Selection */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.client', 'Client *')}</label>
                      <select
                        value={projectForm.clientId}
                        onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.translationService.selectAClient', 'Select a client')}</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} {client.company ? `(${client.company})` : ''}
                            {client.isRecurring ? ` - ${client.discountPercentage}% discount` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Language Pair */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.sourceLanguage', 'Source Language *')}</label>
                        <select
                          value={projectForm.sourceLanguage}
                          onChange={(e) => setProjectForm({ ...projectForm, sourceLanguage: e.target.value })}
                          className={inputClass}
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.targetLanguage', 'Target Language *')}</label>
                        <select
                          value={projectForm.targetLanguage}
                          onChange={(e) => setProjectForm({ ...projectForm, targetLanguage: e.target.value })}
                          className={inputClass}
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Document Type & Specialization */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.documentType', 'Document Type *')}</label>
                        <select
                          value={projectForm.documentType}
                          onChange={(e) => setProjectForm({ ...projectForm, documentType: e.target.value })}
                          className={inputClass}
                        >
                          {DOCUMENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.specialization', 'Specialization *')}</label>
                        <select
                          value={projectForm.specialization}
                          onChange={(e) => setProjectForm({ ...projectForm, specialization: e.target.value })}
                          className={inputClass}
                        >
                          {SPECIALIZATIONS.map(spec => (
                            <option key={spec} value={spec}>{spec} (${BASE_RATES[spec]}/word)</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Word Count & Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.wordCount', 'Word Count *')}</label>
                        <input
                          type="number"
                          value={projectForm.wordCount || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, wordCount: parseInt(e.target.value) || 0 })}
                          placeholder={t('tools.translationService.enterWordCount', 'Enter word count')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.deadline', 'Deadline *')}</label>
                        <input
                          type="date"
                          value={projectForm.deadline}
                          onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Rush & Certified */}
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={projectForm.isRush}
                          onChange={(e) => setProjectForm({ ...projectForm, isRush: e.target.checked })}
                          className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                        />
                        <span className={textClass}>{t('tools.translationService.rushOrder50', 'Rush Order (+50%)')}</span>
                        <Zap className="w-4 h-4 text-orange-500" />
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={projectForm.isCertified}
                          onChange={(e) => setProjectForm({ ...projectForm, isCertified: e.target.checked })}
                          className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                        />
                        <span className={textClass}>Certified Translation (+${CERTIFICATION_FEE})</span>
                        <Award className="w-4 h-4 text-yellow-500" />
                      </label>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.notes', 'Notes')}</label>
                      <textarea
                        value={projectForm.notes}
                        onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
                        placeholder={t('tools.translationService.additionalNotesOrInstructions', 'Additional notes or instructions...')}
                        rows={3}
                        className={inputClass}
                      />
                    </div>

                    {/* Price Preview */}
                    {projectForm.wordCount > 0 && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className={`font-semibold mb-2 ${textClass}`}>{t('tools.translationService.priceBreakdown', 'Price Breakdown')}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className={mutedTextClass}>Base ({projectForm.wordCount} words x ${BASE_RATES[projectForm.specialization]}):</span>
                            <span className={textClass}>{formatCurrency(projectForm.wordCount * BASE_RATES[projectForm.specialization])}</span>
                          </div>
                          {projectForm.isRush && (
                            <div className="flex justify-between text-orange-500">
                              <span>{t('tools.translationService.rushFee50', 'Rush Fee (+50%):')}</span>
                              <span>{formatCurrency(projectForm.wordCount * BASE_RATES[projectForm.specialization] * RUSH_FEE_PERCENTAGE)}</span>
                            </div>
                          )}
                          {projectForm.isCertified && (
                            <div className="flex justify-between text-yellow-600">
                              <span>{t('tools.translationService.certificationFee', 'Certification Fee:')}</span>
                              <span>{formatCurrency(CERTIFICATION_FEE)}</span>
                            </div>
                          )}
                          {projectForm.clientId && getClient(projectForm.clientId)?.discountPercentage > 0 && (
                            <div className="flex justify-between text-green-500">
                              <span>Client Discount ({getClient(projectForm.clientId)?.discountPercentage}%):</span>
                              <span>-{formatCurrency(
                                calculateProjectPrice(projectForm.wordCount, projectForm.specialization, projectForm.isRush, projectForm.isCertified, 0) -
                                calculateProjectPrice(projectForm.wordCount, projectForm.specialization, projectForm.isRush, projectForm.isCertified, getClient(projectForm.clientId)?.discountPercentage || 0)
                              )}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold pt-2 border-t border-gray-500">
                            <span className={textClass}>{t('tools.translationService.total', 'Total:')}</span>
                            <span className="text-[#0D9488]">
                              {formatCurrency(calculateProjectPrice(
                                projectForm.wordCount,
                                projectForm.specialization,
                                projectForm.isRush,
                                projectForm.isCertified,
                                getClient(projectForm.clientId)?.discountPercentage || 0
                              ))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddProject}
                        disabled={!projectForm.clientId || !projectForm.wordCount || !projectForm.deadline}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        {t('tools.translationService.createProject', 'Create Project')}
                      </button>
                      <button
                        onClick={() => { setShowProjectForm(false); resetProjectForm(); }}
                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.translationService.cancel', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Projects List */}
            <div className="space-y-4">
              {filteredProjects.length === 0 ? (
                <div className={`${cardClass} p-12 text-center`}>
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                  <p className={mutedTextClass}>{t('tools.translationService.noProjectsFoundCreateYour', 'No projects found. Create your first translation project!')}</p>
                </div>
              ) : (
                filteredProjects.map(project => {
                  const client = getClient(project.clientId);
                  const translator = project.translatorId ? getTranslator(project.translatorId) : null;
                  const isExpanded = expandedProjectId === project.id;
                  const compatibleTranslators = getCompatibleTranslators(project.sourceLanguage, project.targetLanguage);

                  return (
                    <div key={project.id} className={cardClass}>
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-semibold ${textClass}`}>{client?.name || 'Unknown Client'}</h3>
                              {project.isRush && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                                  <Zap className="w-3 h-3" /> Rush
                                </span>
                              )}
                              {project.isCertified && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                                  <Award className="w-3 h-3" /> Certified
                                </span>
                              )}
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                project.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                                project.status === 'assigned' ? 'bg-blue-100 text-blue-600' :
                                project.status === 'in_progress' ? 'bg-purple-100 text-purple-600' :
                                project.status === 'review' ? 'bg-yellow-100 text-yellow-600' :
                                project.status === 'completed' ? 'bg-green-100 text-green-600' :
                                'bg-teal-100 text-teal-600'
                              }`}>
                                {project.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className={mutedTextClass}>
                                {project.sourceLanguage} → {project.targetLanguage}
                              </span>
                              <span className={mutedTextClass}>{project.documentType}</span>
                              <span className={mutedTextClass}>{project.wordCount.toLocaleString()} words</span>
                              <span className={mutedTextClass}>Due: {formatDate(project.deadline)}</span>
                              <span className="text-[#0D9488] font-semibold">{formatCurrency(project.totalPrice)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronUp className={mutedTextClass} /> : <ChevronDown className={mutedTextClass} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Project Details */}
                            <div>
                              <h4 className={`font-semibold mb-3 ${textClass}`}>{t('tools.translationService.projectDetails', 'Project Details')}</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className={mutedTextClass}>{t('tools.translationService.specialization2', 'Specialization:')}</span>
                                  <span className={textClass}>{project.specialization}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={mutedTextClass}>{t('tools.translationService.pricePerWord', 'Price per Word:')}</span>
                                  <span className={textClass}>${project.pricePerWord}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={mutedTextClass}>{t('tools.translationService.created', 'Created:')}</span>
                                  <span className={textClass}>{formatDate(project.createdAt)}</span>
                                </div>
                                {project.notes && (
                                  <div className="pt-2">
                                    <span className={mutedTextClass}>{t('tools.translationService.notes2', 'Notes:')}</span>
                                    <p className={`mt-1 ${textClass}`}>{project.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Translator Assignment */}
                            <div>
                              <h4 className={`font-semibold mb-3 ${textClass}`}>{t('tools.translationService.translator', 'Translator')}</h4>
                              {translator ? (
                                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-[#0D9488]" />
                                    <span className={`font-medium ${textClass}`}>{translator.name}</span>
                                    <span className="flex items-center gap-1 text-yellow-500 text-sm">
                                      <Star className="w-4 h-4 fill-current" />
                                      {translator.rating.toFixed(1)}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${mutedTextClass}`}>{translator.email}</p>
                                </div>
                              ) : (
                                <div>
                                  <select
                                    onChange={(e) => handleAssignTranslator(project.id, e.target.value)}
                                    className={inputClass}
                                    defaultValue=""
                                  >
                                    <option value="" disabled>{t('tools.translationService.assignATranslator', 'Assign a translator')}</option>
                                    {compatibleTranslators.map(t => (
                                      <option key={t.id} value={t.id}>
                                        {t.name} ({t.rating.toFixed(1)} stars) - ${t.hourlyRate}/hr
                                      </option>
                                    ))}
                                  </select>
                                  {compatibleTranslators.length === 0 && (
                                    <p className="text-sm text-orange-500 mt-2">
                                      {t('tools.translationService.noTranslatorsAvailableForThis', 'No translators available for this language pair')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quality Review */}
                          <div className="mt-6">
                            <h4 className={`font-semibold mb-3 ${textClass}`}>{t('tools.translationService.qualityReview', 'Quality Review')}</h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {['not_started', 'in_progress', 'approved', 'revision_needed'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleUpdateReviewStatus(project.id, status as TranslationProject['reviewStatus'])}
                                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                                    project.reviewStatus === status
                                      ? 'bg-[#0D9488] text-white'
                                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {status.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Status Actions */}
                          <div className="mt-6 flex flex-wrap gap-2">
                            <span className={`text-sm ${mutedTextClass}`}>{t('tools.translationService.updateStatus', 'Update Status:')}</span>
                            {['pending', 'assigned', 'in_progress', 'review', 'completed', 'delivered'].map(status => (
                              <button
                                key={status}
                                onClick={() => handleUpdateProjectStatus(project.id, status as TranslationProject['status'])}
                                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                  project.status === status
                                    ? 'bg-[#0D9488] text-white'
                                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {status.replace('_', ' ')}
                              </button>
                            ))}
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="ml-auto px-3 py-1 text-xs rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Interpretation Tab */}
        {activeTab === 'interpretation' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.interpretationSessions', 'Interpretation Sessions')}</h2>
              <div className="flex items-center gap-2">
                <SyncStatus
                  isSynced={sessionsSynced}
                  isSaving={sessionsSaving}
                  lastSaved={sessionsLastSaved}
                  syncError={sessionsSyncError}
                  onForceSync={forceSessionsSync}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={handleExportInterpretationCSV}
                  onExportExcel={handleExportInterpretationExcel}
                  onExportJSON={handleExportInterpretationJSON}
                  onExportPDF={handleExportInterpretationPDF}
                  onCopyToClipboard={handleCopyInterpretationClipboard}
                  onPrint={handlePrintInterpretation}
                  disabled={sessions.length === 0}
                  showImport={false}
                  theme={theme}
                />
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.translationService.scheduleSession', 'Schedule Session')}
                </button>
              </div>
            </div>

            {/* Session Form Modal */}
            {showSessionForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.scheduleInterpretationSession', 'Schedule Interpretation Session')}</h3>
                    <button onClick={() => { setShowSessionForm(false); resetSessionForm(); }}>
                      <X className={`w-6 h-6 ${mutedTextClass}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Client Selection */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.client2', 'Client *')}</label>
                      <select
                        value={sessionForm.clientId}
                        onChange={(e) => setSessionForm({ ...sessionForm, clientId: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.translationService.selectAClient2', 'Select a client')}</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} {client.company ? `(${client.company})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Session Type */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.sessionType', 'Session Type *')}</label>
                      <div className="flex gap-4">
                        {[
                          { value: 'in_person', label: 'In-Person', icon: MapPin },
                          { value: 'phone', label: 'Phone', icon: Phone },
                          { value: 'video', label: 'Video', icon: Video }
                        ].map(type => (
                          <button
                            key={type.value}
                            onClick={() => setSessionForm({ ...sessionForm, type: type.value as typeof sessionForm.type })}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                              sessionForm.type === type.value
                                ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                                : theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            <type.icon className="w-5 h-5" />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language Pair */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.sourceLanguage2', 'Source Language *')}</label>
                        <select
                          value={sessionForm.sourceLanguage}
                          onChange={(e) => setSessionForm({ ...sessionForm, sourceLanguage: e.target.value })}
                          className={inputClass}
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.targetLanguage2', 'Target Language *')}</label>
                        <select
                          value={sessionForm.targetLanguage}
                          onChange={(e) => setSessionForm({ ...sessionForm, targetLanguage: e.target.value })}
                          className={inputClass}
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.specialization3', 'Specialization *')}</label>
                      <select
                        value={sessionForm.specialization}
                        onChange={(e) => setSessionForm({ ...sessionForm, specialization: e.target.value })}
                        className={inputClass}
                      >
                        {SPECIALIZATIONS.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date, Time & Duration */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.date', 'Date *')}</label>
                        <input
                          type="date"
                          value={sessionForm.scheduledDate}
                          onChange={(e) => setSessionForm({ ...sessionForm, scheduledDate: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.time', 'Time *')}</label>
                        <input
                          type="time"
                          value={sessionForm.scheduledTime}
                          onChange={(e) => setSessionForm({ ...sessionForm, scheduledTime: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.durationHours', 'Duration (hours) *')}</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={sessionForm.duration}
                          onChange={(e) => setSessionForm({ ...sessionForm, duration: parseFloat(e.target.value) || 0 })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Location (for in-person) */}
                    {sessionForm.type === 'in_person' && (
                      <div>
                        <label className={labelClass}>{t('tools.translationService.location', 'Location *')}</label>
                        <input
                          type="text"
                          value={sessionForm.location}
                          onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                          placeholder={t('tools.translationService.enterMeetingLocation', 'Enter meeting location')}
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.notes3', 'Notes')}</label>
                      <textarea
                        value={sessionForm.notes}
                        onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                        placeholder={t('tools.translationService.additionalNotesOrContext', 'Additional notes or context...')}
                        rows={3}
                        className={inputClass}
                      />
                    </div>

                    {/* Price Preview */}
                    {sessionForm.duration > 0 && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center">
                          <span className={mutedTextClass}>
                            Estimated Total ({sessionForm.duration} hours x ${((BASE_RATES[sessionForm.specialization] || BASE_RATES['General']) * 1000).toFixed(0)}/hr):
                          </span>
                          <span className="text-xl font-bold text-[#0D9488]">
                            {formatCurrency(calculateSessionPrice(
                              sessionForm.duration,
                              sessionForm.specialization,
                              getClient(sessionForm.clientId)?.discountPercentage || 0
                            ))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddSession}
                        disabled={!sessionForm.clientId || !sessionForm.scheduledDate || !sessionForm.scheduledTime}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        {t('tools.translationService.scheduleSession2', 'Schedule Session')}
                      </button>
                      <button
                        onClick={() => { setShowSessionForm(false); resetSessionForm(); }}
                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.translationService.cancel2', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className={`${cardClass} p-12 text-center`}>
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                  <p className={mutedTextClass}>{t('tools.translationService.noInterpretationSessionsScheduled', 'No interpretation sessions scheduled.')}</p>
                </div>
              ) : (
                filteredSessions.map(session => {
                  const client = getClient(session.clientId);
                  const interpreter = session.interpreterId ? getTranslator(session.interpreterId) : null;

                  return (
                    <div key={session.id} className={`${cardClass} p-4`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {session.type === 'in_person' && <MapPin className="w-5 h-5 text-blue-500" />}
                            {session.type === 'phone' && <Phone className="w-5 h-5 text-green-500" />}
                            {session.type === 'video' && <Video className="w-5 h-5 text-purple-500" />}
                            <h3 className={`font-semibold ${textClass}`}>{client?.name || 'Unknown Client'}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              session.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                              session.status === 'in_progress' ? 'bg-purple-100 text-purple-600' :
                              session.status === 'completed' ? 'bg-green-100 text-green-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {session.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className={mutedTextClass}>
                              {session.sourceLanguage} ↔ {session.targetLanguage}
                            </span>
                            <span className={mutedTextClass}>{session.specialization}</span>
                            <span className={mutedTextClass}>
                              {formatDate(session.scheduledDate)} at {session.scheduledTime}
                            </span>
                            <span className={mutedTextClass}>{session.duration} hours</span>
                            <span className="text-[#0D9488] font-semibold">{formatCurrency(session.totalPrice)}</span>
                          </div>
                          {session.location && (
                            <p className={`text-sm mt-2 ${mutedTextClass}`}>
                              <MapPin className="w-4 h-4 inline mr-1" />
                              {session.location}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!interpreter && (
                            <select
                              onChange={(e) => handleAssignInterpreter(session.id, e.target.value)}
                              className={`${inputClass} text-sm w-40`}
                              defaultValue=""
                            >
                              <option value="" disabled>{t('tools.translationService.assignInterpreter', 'Assign interpreter')}</option>
                              {getCompatibleTranslators(session.sourceLanguage, session.targetLanguage).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          )}
                          {interpreter && (
                            <span className={`text-sm ${mutedTextClass}`}>{interpreter.name}</span>
                          )}
                          <select
                            value={session.status}
                            onChange={(e) => handleUpdateSessionStatus(session.id, e.target.value as InterpretationSession['status'])}
                            className={`${inputClass} text-sm w-32`}
                          >
                            <option value="scheduled">{t('tools.translationService.scheduled2', 'Scheduled')}</option>
                            <option value="in_progress">{t('tools.translationService.inProgress3', 'In Progress')}</option>
                            <option value="completed">{t('tools.translationService.completed3', 'Completed')}</option>
                            <option value="cancelled">{t('tools.translationService.cancelled2', 'Cancelled')}</option>
                          </select>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Translators Tab */}
        {activeTab === 'translators' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.translatorsInterpreters', 'Translators & Interpreters')}</h2>
              <div className="flex items-center gap-2">
                <SyncStatus
                  isSynced={translatorsSynced}
                  isSaving={translatorsSaving}
                  lastSaved={translatorsLastSaved}
                  syncError={translatorsSyncError}
                  onForceSync={forceTranslatorsSync}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={handleExportTranslatorsCSV}
                  onExportExcel={handleExportTranslatorsExcel}
                  onExportJSON={handleExportTranslatorsJSON}
                  onExportPDF={handleExportTranslatorsPDF}
                  onCopyToClipboard={handleCopyTranslatorsClipboard}
                  onPrint={handlePrintTranslators}
                  disabled={translators.length === 0}
                  showImport={false}
                  theme={theme}
                />
                <button
                  onClick={() => setShowTranslatorForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.translationService.addTranslator2', 'Add Translator')}
                </button>
              </div>
            </div>

            {/* Translator Form Modal */}
            {showTranslatorForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.addTranslator', 'Add Translator')}</h3>
                    <button onClick={() => { setShowTranslatorForm(false); resetTranslatorForm(); }}>
                      <X className={`w-6 h-6 ${mutedTextClass}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.name', 'Name *')}</label>
                        <input
                          type="text"
                          value={translatorForm.name}
                          onChange={(e) => setTranslatorForm({ ...translatorForm, name: e.target.value })}
                          placeholder={t('tools.translationService.fullName', 'Full name')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.email', 'Email *')}</label>
                        <input
                          type="email"
                          value={translatorForm.email}
                          onChange={(e) => setTranslatorForm({ ...translatorForm, email: e.target.value })}
                          placeholder={t('tools.translationService.emailAddress', 'Email address')}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Hourly Rate */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.hourlyRate', 'Hourly Rate ($)')}</label>
                      <input
                        type="number"
                        value={translatorForm.hourlyRate}
                        onChange={(e) => setTranslatorForm({ ...translatorForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                      />
                    </div>

                    {/* Language Pairs */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.languagePairs', 'Language Pairs')}</label>
                      {translatorForm.languagePairs.map((pair, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <select
                            value={pair.source}
                            onChange={(e) => {
                              const newPairs = [...translatorForm.languagePairs];
                              newPairs[index].source = e.target.value;
                              setTranslatorForm({ ...translatorForm, languagePairs: newPairs });
                            }}
                            className={inputClass}
                          >
                            {LANGUAGES.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                          <span className={`self-center ${mutedTextClass}`}>→</span>
                          <select
                            value={pair.target}
                            onChange={(e) => {
                              const newPairs = [...translatorForm.languagePairs];
                              newPairs[index].target = e.target.value;
                              setTranslatorForm({ ...translatorForm, languagePairs: newPairs });
                            }}
                            className={inputClass}
                          >
                            {LANGUAGES.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                          {translatorForm.languagePairs.length > 1 && (
                            <button
                              onClick={() => {
                                const newPairs = translatorForm.languagePairs.filter((_, i) => i !== index);
                                setTranslatorForm({ ...translatorForm, languagePairs: newPairs });
                              }}
                              className="p-2 text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setTranslatorForm({
                          ...translatorForm,
                          languagePairs: [...translatorForm.languagePairs, { source: 'English', target: 'Spanish' }]
                        })}
                        className="text-sm text-[#0D9488] hover:underline"
                      >
                        {t('tools.translationService.addAnotherLanguagePair', '+ Add another language pair')}
                      </button>
                    </div>

                    {/* Specializations */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.specializations', 'Specializations')}</label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALIZATIONS.map(spec => (
                          <button
                            key={spec}
                            onClick={() => {
                              const newSpecs = translatorForm.specializations.includes(spec)
                                ? translatorForm.specializations.filter(s => s !== spec)
                                : [...translatorForm.specializations, spec];
                              setTranslatorForm({ ...translatorForm, specializations: newSpecs });
                            }}
                            className={`px-3 py-1 text-sm rounded-lg transition-all ${
                              translatorForm.specializations.includes(spec)
                                ? 'bg-[#0D9488] text-white'
                                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.certifications', 'Certifications')}</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={translatorForm.newCertification}
                          onChange={(e) => setTranslatorForm({ ...translatorForm, newCertification: e.target.value })}
                          placeholder={t('tools.translationService.eGAtaCertifiedCourt', 'e.g., ATA Certified, Court Certified')}
                          className={inputClass}
                        />
                        <button
                          onClick={() => {
                            if (translatorForm.newCertification.trim()) {
                              setTranslatorForm({
                                ...translatorForm,
                                certifications: [...translatorForm.certifications, translatorForm.newCertification.trim()],
                                newCertification: ''
                              });
                            }
                          }}
                          className="px-4 py-2 bg-[#0D9488] text-white rounded-lg"
                        >
                          {t('tools.translationService.add', 'Add')}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {translatorForm.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Award className="w-4 h-4 text-yellow-500" />
                            {cert}
                            <button
                              onClick={() => setTranslatorForm({
                                ...translatorForm,
                                certifications: translatorForm.certifications.filter((_, i) => i !== index)
                              })}
                              className="ml-1 text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddTranslator}
                        disabled={!translatorForm.name || !translatorForm.email}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        {t('tools.translationService.addTranslator3', 'Add Translator')}
                      </button>
                      <button
                        onClick={() => { setShowTranslatorForm(false); resetTranslatorForm(); }}
                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.translationService.cancel3', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Translators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {translators.length === 0 ? (
                <div className={`${cardClass} p-12 text-center col-span-full`}>
                  <Users className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                  <p className={mutedTextClass}>{t('tools.translationService.noTranslatorsAddedYet', 'No translators added yet.')}</p>
                </div>
              ) : (
                translators.map(translator => (
                  <div key={translator.id} className={cardClass}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`font-semibold ${textClass}`}>{translator.name}</h3>
                          <p className={`text-sm ${mutedTextClass}`}>{translator.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className={textClass}>{translator.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className={`text-sm ${mutedTextClass}`}>{t('tools.translationService.languages', 'Languages:')}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {translator.languagePairs.map((pair, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                              {pair.source} → {pair.target}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className={`text-sm ${mutedTextClass}`}>{t('tools.translationService.specializations2', 'Specializations:')}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {translator.specializations.map((spec, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {translator.certifications.length > 0 && (
                        <div className="mb-3">
                          <span className={`text-sm ${mutedTextClass}`}>{t('tools.translationService.certifications2', 'Certifications:')}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {translator.certifications.map((cert, i) => (
                              <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded">
                                <Award className="w-3 h-3" /> {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className={textClass}>${translator.hourlyRate}/hr</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            translator.availability === 'available' ? 'bg-green-100 text-green-600' :
                            translator.availability === 'busy' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {translator.availability}
                          </span>
                          <button
                            onClick={() => handleDeleteTranslator(translator.id)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.clients', 'Clients')}</h2>
              <div className="flex items-center gap-2">
                <SyncStatus
                  isSynced={clientsSynced}
                  isSaving={clientsSaving}
                  lastSaved={clientsLastSaved}
                  syncError={clientsSyncError}
                  onForceSync={forceClientsSync}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={handleExportClientsCSV}
                  onExportExcel={handleExportClientsExcel}
                  onExportJSON={handleExportClientsJSON}
                  onExportPDF={handleExportClientsPDF}
                  onCopyToClipboard={handleCopyClientsClipboard}
                  onPrint={handlePrintClients}
                  disabled={clients.length === 0}
                  showImport={false}
                  theme={theme}
                />
                <button
                  onClick={() => setShowClientForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.translationService.addClient2', 'Add Client')}
                </button>
              </div>
            </div>

            {/* Client Form Modal */}
            {showClientForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} p-6 w-full max-w-lg`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.addClient', 'Add Client')}</h3>
                    <button onClick={() => { setShowClientForm(false); resetClientForm(); }}>
                      <X className={`w-6 h-6 ${mutedTextClass}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.name2', 'Name *')}</label>
                        <input
                          type="text"
                          value={clientForm.name}
                          onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                          placeholder={t('tools.translationService.fullName2', 'Full name')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.company', 'Company')}</label>
                        <input
                          type="text"
                          value={clientForm.company}
                          onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                          placeholder={t('tools.translationService.companyName', 'Company name')}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.translationService.email2', 'Email *')}</label>
                        <input
                          type="email"
                          value={clientForm.email}
                          onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                          placeholder={t('tools.translationService.emailAddress2', 'Email address')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.translationService.phone', 'Phone')}</label>
                        <input
                          type="tel"
                          value={clientForm.phone}
                          onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                          placeholder={t('tools.translationService.phoneNumber', 'Phone number')}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clientForm.isRecurring}
                          onChange={(e) => setClientForm({ ...clientForm, isRecurring: e.target.checked })}
                          className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                        />
                        <span className={textClass}>{t('tools.translationService.recurringClient', 'Recurring Client')}</span>
                      </label>
                      {clientForm.isRecurring && (
                        <div className="flex items-center gap-2">
                          <label className={mutedTextClass}>{t('tools.translationService.discount', 'Discount:')}</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={clientForm.discountPercentage}
                            onChange={(e) => setClientForm({ ...clientForm, discountPercentage: parseInt(e.target.value) || 0 })}
                            className={`${inputClass} w-20`}
                          />
                          <span className={mutedTextClass}>%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddClient}
                        disabled={!clientForm.name || !clientForm.email}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        {t('tools.translationService.addClient3', 'Add Client')}
                      </button>
                      <button
                        onClick={() => { setShowClientForm(false); resetClientForm(); }}
                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.translationService.cancel4', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.length === 0 ? (
                <div className={`${cardClass} p-12 text-center col-span-full`}>
                  <Briefcase className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                  <p className={mutedTextClass}>{t('tools.translationService.noClientsAddedYet', 'No clients added yet.')}</p>
                </div>
              ) : (
                clients.map(client => (
                  <div key={client.id} className={cardClass}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${textClass}`}>{client.name}</h3>
                            {client.isRecurring && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                                <RefreshCw className="w-3 h-3" /> {client.discountPercentage}% off
                              </span>
                            )}
                          </div>
                          {client.company && (
                            <p className={`text-sm ${mutedTextClass}`}>{client.company}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1 text-sm mb-3">
                        <p className={mutedTextClass}>{client.email}</p>
                        {client.phone && <p className={mutedTextClass}>{client.phone}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className={mutedTextClass}>{client.projectCount} projects</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className={textClass}>{formatCurrency(client.totalSpent)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.invoices', 'Invoices')}</h2>
              <div className="flex items-center gap-2">
                <SyncStatus
                  isSynced={invoicesSynced}
                  isSaving={invoicesSaving}
                  lastSaved={invoicesLastSaved}
                  syncError={invoicesSyncError}
                  onForceSync={forceInvoicesSync}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={handleExportInvoicesCSV}
                  onExportExcel={handleExportInvoicesExcel}
                  onExportJSON={handleExportInvoicesJSON}
                  onExportPDF={handleExportInvoicesPDF}
                  onCopyToClipboard={handleCopyInvoicesClipboard}
                  onPrint={handlePrintInvoices}
                  disabled={invoices.length === 0}
                  showImport={false}
                  theme={theme}
                />
                <button
                  onClick={() => setShowInvoiceForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.translationService.generateInvoice2', 'Generate Invoice')}
                </button>
              </div>
            </div>

            {/* Invoice Form Modal */}
            {showInvoiceForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-semibold ${textClass}`}>{t('tools.translationService.generateInvoice', 'Generate Invoice')}</h3>
                    <button onClick={() => { setShowInvoiceForm(false); resetInvoiceForm(); }}>
                      <X className={`w-6 h-6 ${mutedTextClass}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Client Selection */}
                    <div>
                      <label className={labelClass}>{t('tools.translationService.client3', 'Client *')}</label>
                      <select
                        value={invoiceForm.clientId}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value, selectedProjects: [], selectedSessions: [] })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.translationService.selectAClient3', 'Select a client')}</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>

                    {invoiceForm.clientId && (
                      <>
                        {/* Select Projects */}
                        <div>
                          <label className={labelClass}>{t('tools.translationService.projectsToInvoice', 'Projects to Invoice')}</label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {projects
                              .filter(p => p.clientId === invoiceForm.clientId && p.status === 'delivered')
                              .map(project => (
                                <label key={project.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={invoiceForm.selectedProjects.includes(project.id)}
                                    onChange={(e) => {
                                      const newSelected = e.target.checked
                                        ? [...invoiceForm.selectedProjects, project.id]
                                        : invoiceForm.selectedProjects.filter(id => id !== project.id);
                                      setInvoiceForm({ ...invoiceForm, selectedProjects: newSelected });
                                    }}
                                    className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                                  />
                                  <span className={textClass}>
                                    {project.documentType} ({project.wordCount} words) - {formatCurrency(project.totalPrice)}
                                  </span>
                                </label>
                              ))}
                            {projects.filter(p => p.clientId === invoiceForm.clientId && p.status === 'delivered').length === 0 && (
                              <p className={mutedTextClass}>{t('tools.translationService.noCompletedProjectsAvailableFor', 'No completed projects available for invoicing')}</p>
                            )}
                          </div>
                        </div>

                        {/* Select Sessions */}
                        <div>
                          <label className={labelClass}>{t('tools.translationService.sessionsToInvoice', 'Sessions to Invoice')}</label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {sessions
                              .filter(s => s.clientId === invoiceForm.clientId && s.status === 'completed')
                              .map(session => (
                                <label key={session.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={invoiceForm.selectedSessions.includes(session.id)}
                                    onChange={(e) => {
                                      const newSelected = e.target.checked
                                        ? [...invoiceForm.selectedSessions, session.id]
                                        : invoiceForm.selectedSessions.filter(id => id !== session.id);
                                      setInvoiceForm({ ...invoiceForm, selectedSessions: newSelected });
                                    }}
                                    className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                                  />
                                  <span className={textClass}>
                                    {session.type} ({session.duration} hrs) - {formatCurrency(session.totalPrice)}
                                  </span>
                                </label>
                              ))}
                            {sessions.filter(s => s.clientId === invoiceForm.clientId && s.status === 'completed').length === 0 && (
                              <p className={mutedTextClass}>{t('tools.translationService.noCompletedSessionsAvailableFor', 'No completed sessions available for invoicing')}</p>
                            )}
                          </div>
                        </div>

                        {/* Due Date */}
                        <div>
                          <label className={labelClass}>{t('tools.translationService.dueDate', 'Due Date *')}</label>
                          <input
                            type="date"
                            value={invoiceForm.dueDate}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                            className={inputClass}
                          />
                        </div>

                        {/* Invoice Preview */}
                        {(invoiceForm.selectedProjects.length > 0 || invoiceForm.selectedSessions.length > 0) && (
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className={`font-semibold mb-3 ${textClass}`}>{t('tools.translationService.invoicePreview', 'Invoice Preview')}</h4>
                            <div className="space-y-2 text-sm">
                              {(() => {
                                const client = getClient(invoiceForm.clientId);
                                const selectedProjectsData = projects.filter(p => invoiceForm.selectedProjects.includes(p.id));
                                const selectedSessionsData = sessions.filter(s => invoiceForm.selectedSessions.includes(s.id));
                                const subtotal = selectedProjectsData.reduce((sum, p) => sum + p.totalPrice, 0) +
                                                selectedSessionsData.reduce((sum, s) => sum + s.totalPrice, 0);
                                const discount = subtotal * ((client?.discountPercentage || 0) / 100);
                                const tax = (subtotal - discount) * TAX_RATE;
                                const total = subtotal - discount + tax;

                                return (
                                  <>
                                    <div className="flex justify-between">
                                      <span className={mutedTextClass}>{t('tools.translationService.subtotal', 'Subtotal:')}</span>
                                      <span className={textClass}>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {client?.discountPercentage > 0 && (
                                      <div className="flex justify-between text-green-500">
                                        <span>Client Discount ({client.discountPercentage}%):</span>
                                        <span>-{formatCurrency(discount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className={mutedTextClass}>Tax ({(TAX_RATE * 100).toFixed(0)}%):</span>
                                      <span className={textClass}>{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-gray-500">
                                      <span className={textClass}>{t('tools.translationService.total2', 'Total:')}</span>
                                      <span className="text-[#0D9488]">{formatCurrency(total)}</span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleGenerateInvoice}
                        disabled={!invoiceForm.clientId || !invoiceForm.dueDate || (invoiceForm.selectedProjects.length === 0 && invoiceForm.selectedSessions.length === 0)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        {t('tools.translationService.generateInvoice3', 'Generate Invoice')}
                      </button>
                      <button
                        onClick={() => { setShowInvoiceForm(false); resetInvoiceForm(); }}
                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.translationService.cancel5', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices List */}
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className={`${cardClass} p-12 text-center`}>
                  <DollarSign className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                  <p className={mutedTextClass}>{t('tools.translationService.noInvoicesGeneratedYet', 'No invoices generated yet.')}</p>
                </div>
              ) : (
                invoices.map(invoice => {
                  const client = getClient(invoice.clientId);

                  return (
                    <div key={invoice.id} className={`${cardClass} p-4`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-semibold ${textClass}`}>Invoice #{invoice.id.slice(0, 8).toUpperCase()}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              invoice.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                              invoice.status === 'paid' ? 'bg-green-100 text-green-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {invoice.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className={mutedTextClass}>Client: {client?.name || 'Unknown'}</span>
                            <span className={mutedTextClass}>Created: {formatDate(invoice.createdAt)}</span>
                            <span className={mutedTextClass}>Due: {formatDate(invoice.dueDate)}</span>
                            <span className={mutedTextClass}>{invoice.projectIds.length} projects, {invoice.sessionIds.length} sessions</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(invoice.total)}</p>
                            {invoice.discount > 0 && (
                              <p className="text-sm text-green-500">Saved {formatCurrency(invoice.discount)}</p>
                            )}
                          </div>
                          <select
                            value={invoice.status}
                            onChange={(e) => handleUpdateInvoiceStatus(invoice.id, e.target.value as Invoice['status'])}
                            className={`${inputClass} text-sm w-28`}
                          >
                            <option value="draft">{t('tools.translationService.draft', 'Draft')}</option>
                            <option value="sent">{t('tools.translationService.sent', 'Sent')}</option>
                            <option value="paid">{t('tools.translationService.paid', 'Paid')}</option>
                            <option value="overdue">{t('tools.translationService.overdue', 'Overdue')}</option>
                          </select>
                          <button className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-all">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`${cardClass} p-6 mt-8`}>
          <h3 className={`font-semibold mb-3 ${textClass}`}>{t('tools.translationService.aboutTranslationServiceManager', 'About Translation Service Manager')}</h3>
          <p className={`text-sm ${mutedTextClass}`}>
            A comprehensive tool for managing translation and interpretation services. Features include project intake with word count pricing,
            translator assignment by language pair, deadline and rush order management, certified translation tracking, interpretation scheduling
            (in-person, phone, video), hourly rate tracking, quality review workflow, specialization areas (legal, medical, technical), recurring
            client discounts, and invoice generation. All data is saved locally for quick access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TranslationServiceTool;
