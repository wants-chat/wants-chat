'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileSignature,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  FileText,
  Users,
  Clipboard,
  History,
  PenTool,
  Languages,
  AlertTriangle,
  Check,
  RefreshCw,
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
interface ConsentQuestion {
  question: string;
  answer: boolean;
  required: boolean;
}

interface ConsentRecord {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  formType: 'surgical' | 'anesthesia' | 'procedure' | 'treatment' | 'research' | 'hipaa' | 'general';
  formTitle: string;
  procedureName?: string;
  providerId: string;
  providerName: string;
  signedDate?: string;
  signedBy: 'patient' | 'guardian' | 'poa';
  signerName?: string;
  signerRelationship?: string;
  witnessName?: string;
  witnessDate?: string;
  status: 'pending' | 'signed' | 'expired' | 'revoked' | 'declined';
  expirationDate?: string;
  electronicSignature: boolean;
  signatureData?: string;
  risks: string[];
  benefits: string[];
  alternatives: string[];
  questions: ConsentQuestion[];
  language: string;
  interpreterUsed: boolean;
  interpreterName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsentTemplate {
  id: string;
  name: string;
  formType: 'surgical' | 'anesthesia' | 'procedure' | 'treatment' | 'research' | 'hipaa' | 'general';
  version: string;
  effectiveDate: string;
  content: string;
  requiredQuestions: string[];
  department: string;
  status: 'active' | 'draft' | 'archived';
}

interface ConsentAudit {
  id: string;
  consentId: string;
  action: 'created' | 'viewed' | 'signed' | 'revoked' | 'expired' | 'modified';
  performedBy: string;
  performedAt: string;
  ipAddress?: string;
  details: string;
}

interface MedicalConsentToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'medical-consent';

const consentColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'formTitle', header: 'Form Title', type: 'string' },
  { key: 'formType', header: 'Type', type: 'string' },
  { key: 'providerName', header: 'Provider', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'signedDate', header: 'Signed Date', type: 'date' },
  { key: 'expirationDate', header: 'Expiration', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewConsent = (): ConsentRecord => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dateOfBirth: '',
  formType: 'general',
  formTitle: '',
  procedureName: '',
  providerId: '',
  providerName: '',
  signedDate: '',
  signedBy: 'patient',
  signerName: '',
  signerRelationship: '',
  witnessName: '',
  witnessDate: '',
  status: 'pending',
  expirationDate: '',
  electronicSignature: true,
  signatureData: '',
  risks: [],
  benefits: [],
  alternatives: [],
  questions: [],
  language: 'English',
  interpreterUsed: false,
  interpreterName: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const formTypes = [
  { value: 'surgical', label: 'Surgical Consent', icon: FileSignature },
  { value: 'anesthesia', label: 'Anesthesia Consent', icon: Shield },
  { value: 'procedure', label: 'Procedure Consent', icon: Clipboard },
  { value: 'treatment', label: 'Treatment Consent', icon: FileText },
  { value: 'research', label: 'Research/Study Consent', icon: Users },
  { value: 'hipaa', label: 'HIPAA Authorization', icon: Shield },
  { value: 'general', label: 'General Consent', icon: FileText },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'signed', label: 'Signed' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'declined', label: 'Declined' },
];

const signerTypes = [
  { value: 'patient', label: 'Patient' },
  { value: 'guardian', label: 'Guardian/Parent' },
  { value: 'poa', label: 'Power of Attorney' },
];

const languages = [
  'English', 'Spanish', 'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Vietnamese',
  'Korean', 'Tagalog', 'Arabic', 'French', 'German', 'Russian', 'Portuguese',
  'Japanese', 'Hindi', 'Urdu', 'Polish', 'Italian', 'Other',
];

const defaultTemplates: ConsentTemplate[] = [
  {
    id: 'tpl-1',
    name: 'General Surgical Consent',
    formType: 'surgical',
    version: '2.1',
    effectiveDate: '2024-01-01',
    content: 'Standard surgical consent form including risks, benefits, and alternatives.',
    requiredQuestions: [
      'I understand the proposed procedure and its risks',
      'I have had the opportunity to ask questions',
      'I consent to blood transfusion if needed',
    ],
    department: 'Surgery',
    status: 'active',
  },
  {
    id: 'tpl-2',
    name: 'Anesthesia Consent Form',
    formType: 'anesthesia',
    version: '1.5',
    effectiveDate: '2024-01-01',
    content: 'Anesthesia consent covering general, regional, and local anesthesia options.',
    requiredQuestions: [
      'I have disclosed all medications and supplements',
      'I understand the anesthesia options discussed',
      'I have followed pre-operative fasting instructions',
    ],
    department: 'Anesthesiology',
    status: 'active',
  },
  {
    id: 'tpl-3',
    name: 'HIPAA Privacy Authorization',
    formType: 'hipaa',
    version: '3.0',
    effectiveDate: '2024-01-01',
    content: 'HIPAA compliant authorization for use and disclosure of protected health information.',
    requiredQuestions: [
      'I authorize the use of my health information as described',
      'I understand I can revoke this authorization in writing',
    ],
    department: 'Administration',
    status: 'active',
  },
  {
    id: 'tpl-4',
    name: 'Clinical Research Study Consent',
    formType: 'research',
    version: '1.2',
    effectiveDate: '2024-03-01',
    content: 'IRB-approved consent form for clinical research participation.',
    requiredQuestions: [
      'I understand participation is voluntary',
      'I can withdraw from the study at any time',
      'I understand the study procedures and risks',
      'I agree to follow the study protocol',
    ],
    department: 'Research',
    status: 'active',
  },
  {
    id: 'tpl-5',
    name: 'Outpatient Procedure Consent',
    formType: 'procedure',
    version: '1.8',
    effectiveDate: '2024-02-01',
    content: 'Consent form for outpatient diagnostic and therapeutic procedures.',
    requiredQuestions: [
      'I understand the procedure being performed',
      'I have been informed of potential complications',
      'I understand post-procedure care instructions',
    ],
    department: 'Outpatient Services',
    status: 'active',
  },
  {
    id: 'tpl-6',
    name: 'Treatment Plan Consent',
    formType: 'treatment',
    version: '2.0',
    effectiveDate: '2024-01-15',
    content: 'Consent for ongoing medical treatment plans and therapy protocols.',
    requiredQuestions: [
      'I understand my diagnosis and treatment plan',
      'I have discussed alternative treatment options',
      'I agree to attend follow-up appointments',
    ],
    department: 'Medical Services',
    status: 'active',
  },
];

const commonRisks = [
  'Infection', 'Bleeding', 'Pain', 'Scarring', 'Nerve damage', 'Blood clots',
  'Allergic reaction', 'Anesthesia complications', 'Need for additional surgery',
  'Failure to achieve desired outcome', 'Death (rare)', 'Organ damage',
  'Delayed healing', 'Adverse drug reaction', 'Cardiac complications',
];

const commonBenefits = [
  'Relief of symptoms', 'Improved function', 'Diagnosis', 'Prevention of complications',
  'Improved quality of life', 'Treatment of condition', 'Pain relief',
  'Disease management', 'Life extension', 'Cure of condition',
];

const commonAlternatives = [
  'No treatment/watchful waiting', 'Medication therapy', 'Physical therapy',
  'Alternative procedure', 'Non-surgical treatment', 'Lifestyle modifications',
  'Palliative care', 'Second opinion', 'Delayed treatment',
];

export const MedicalConsentTool: React.FC<MedicalConsentToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const {
    data: consents,
    addItem: addConsent,
    updateItem: updateConsent,
    deleteItem: deleteConsent,
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
  } = useToolData<ConsentRecord>(TOOL_ID, [], consentColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);
  const [editingConsent, setEditingConsent] = useState<ConsentRecord | null>(null);
  const [formData, setFormData] = useState<ConsentRecord>(createNewConsent());
  const [newRisk, setNewRisk] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newAlternative, setNewAlternative] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [templates] = useState<ConsentTemplate[]>(defaultTemplates);
  const [auditLog, setAuditLog] = useState<ConsentAudit[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'templates' | 'audit'>('list');

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const signedToday = consents.filter(c => {
      if (!c.signedDate) return false;
      const signedDate = new Date(c.signedDate);
      signedDate.setHours(0, 0, 0, 0);
      return signedDate.getTime() === today.getTime();
    });

    const pending = consents.filter(c => c.status === 'pending');

    const expiringSoon = consents.filter(c => {
      if (!c.expirationDate || c.status !== 'signed') return false;
      const expDate = new Date(c.expirationDate);
      return expDate >= today && expDate <= sevenDaysFromNow;
    });

    const expired = consents.filter(c => c.status === 'expired');
    const signed = consents.filter(c => c.status === 'signed');

    return {
      total: consents.length,
      signedToday: signedToday.length,
      pending: pending.length,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      signed: signed.length,
    };
  }, [consents]);

  // Filtered consents
  const filteredConsents = useMemo(() => {
    return consents.filter(consent => {
      const matchesSearch = searchQuery === '' ||
        consent.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consent.formTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consent.providerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || consent.formType === filterType;
      const matchesStatus = filterStatus === '' || consent.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [consents, searchQuery, filterType, filterStatus]);

  const addAuditEntry = (consentId: string, action: ConsentAudit['action'], details: string) => {
    const entry: ConsentAudit = {
      id: crypto.randomUUID(),
      consentId,
      action,
      performedBy: 'Current User',
      performedAt: new Date().toISOString(),
      details,
    };
    setAuditLog(prev => [entry, ...prev]);
  };

  const handleSave = () => {
    if (editingConsent) {
      updateConsent(formData.id, { ...formData, updatedAt: new Date().toISOString() });
      addAuditEntry(formData.id, 'modified', `Consent form "${formData.formTitle}" was modified`);
    } else {
      addConsent({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      addAuditEntry(formData.id, 'created', `Consent form "${formData.formTitle}" was created`);
    }
    setShowModal(false);
    setEditingConsent(null);
    setFormData(createNewConsent());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Consent Record',
      message: 'Are you sure you want to delete this consent record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const consent = consents.find(c => c.id === id);
      deleteConsent(id);
      if (consent) {
        addAuditEntry(id, 'modified', `Consent form "${consent.formTitle}" was deleted`);
      }
      if (selectedConsent?.id === id) setSelectedConsent(null);
    }
  };

  const handleSign = () => {
    if (selectedConsent && signatureCanvasRef.current) {
      const signatureData = signatureCanvasRef.current.toDataURL();
      const updated = {
        ...selectedConsent,
        status: 'signed' as const,
        signedDate: new Date().toISOString().split('T')[0],
        signatureData,
        updatedAt: new Date().toISOString(),
      };
      updateConsent(selectedConsent.id, updated);
      setSelectedConsent(updated);
      addAuditEntry(selectedConsent.id, 'signed', `Consent form "${selectedConsent.formTitle}" was signed`);
      setShowSignatureModal(false);
      clearSignature();
    }
  };

  const handleRevoke = async (consent: ConsentRecord) => {
    const confirmed = await confirm({
      title: 'Revoke Consent',
      message: 'Are you sure you want to revoke this consent?',
      confirmText: 'Revoke',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const updated = { ...consent, status: 'revoked' as const, updatedAt: new Date().toISOString() };
      updateConsent(consent.id, updated);
      if (selectedConsent?.id === consent.id) setSelectedConsent(updated);
      addAuditEntry(consent.id, 'revoked', `Consent form "${consent.formTitle}" was revoked`);
    }
  };

  const openEditModal = (consent: ConsentRecord) => {
    setEditingConsent(consent);
    setFormData(consent);
    setShowModal(true);
  };

  const applyTemplate = (template: ConsentTemplate) => {
    setFormData({
      ...formData,
      formType: template.formType,
      formTitle: template.name,
      questions: template.requiredQuestions.map(q => ({
        question: q,
        answer: false,
        required: true,
      })),
    });
    setShowTemplateModal(false);
  };

  const addRisk = () => {
    if (newRisk.trim() && !formData.risks.includes(newRisk.trim())) {
      setFormData({ ...formData, risks: [...formData.risks, newRisk.trim()] });
      setNewRisk('');
    }
  };

  const removeRisk = (risk: string) => {
    setFormData({ ...formData, risks: formData.risks.filter(r => r !== risk) });
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData({ ...formData, benefits: formData.benefits.filter(b => b !== benefit) });
  };

  const addAlternative = () => {
    if (newAlternative.trim() && !formData.alternatives.includes(newAlternative.trim())) {
      setFormData({ ...formData, alternatives: [...formData.alternatives, newAlternative.trim()] });
      setNewAlternative('');
    }
  };

  const removeAlternative = (alt: string) => {
    setFormData({ ...formData, alternatives: formData.alternatives.filter(a => a !== alt) });
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData({
        ...formData,
        questions: [...formData.questions, { question: newQuestion.trim(), answer: false, required: true }],
      });
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const toggleQuestionAnswer = (index: number) => {
    const updated = [...formData.questions];
    updated[index].answer = !updated[index].answer;
    setFormData({ ...formData, questions: updated });
  };

  // Signature canvas functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = theme === 'dark' ? '#ffffff' : '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'signed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'revoked': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'declined': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = formTypes.find(t => t.value === type);
    return typeConfig?.icon || FileText;
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

  const tabClass = (active: boolean) => `px-4 py-2 font-medium rounded-lg transition-colors ${
    active
      ? 'bg-cyan-500/20 text-cyan-400'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
            <FileSignature className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.medicalConsent.medicalConsentManager', 'Medical Consent Manager')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.medicalConsent.managePatientConsentFormsSignatures', 'Manage patient consent forms, signatures, and compliance')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="medical-consent" toolName="Medical Consent" />

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
            onExportCSV={() => exportCSV({ filename: 'medical-consent-forms' })}
            onExportExcel={() => exportExcel({ filename: 'medical-consent-forms' })}
            onExportJSON={() => exportJSON({ filename: 'medical-consent-forms' })}
            onExportPDF={() => exportPDF({ filename: 'medical-consent-forms', title: 'Medical Consent Records' })}
            onPrint={() => print('Medical Consent Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={consents.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewConsent()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.medicalConsent.newConsent', 'New Consent')}
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalConsent.totalForms', 'Total Forms')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalConsent.signedToday', 'Signed Today')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.signedToday}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalConsent.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalConsent.expiringSoon', 'Expiring Soon')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.expiringSoon}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalConsent.expired', 'Expired')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${cardClass} p-2 mb-6`}>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('list')} className={tabClass(activeTab === 'list')}>
            <FileText className="w-4 h-4 inline-block mr-2" />
            {t('tools.medicalConsent.consentForms', 'Consent Forms')}
          </button>
          <button onClick={() => setActiveTab('templates')} className={tabClass(activeTab === 'templates')}>
            <Clipboard className="w-4 h-4 inline-block mr-2" />
            {t('tools.medicalConsent.templates', 'Templates')}
          </button>
          <button onClick={() => setActiveTab('audit')} className={tabClass(activeTab === 'audit')}>
            <History className="w-4 h-4 inline-block mr-2" />
            {t('tools.medicalConsent.auditLog2', 'Audit Log')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className={`${cardClass} p-4 mb-6`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('tools.medicalConsent.searchPatientFormOrProvider', 'Search patient, form, or provider...')}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full sm:w-44`}>
                <option value="">{t('tools.medicalConsent.allTypes', 'All Types')}</option>
                {formTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
                <option value="">{t('tools.medicalConsent.allStatus', 'All Status')}</option>
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Consent List and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Consent List */}
            <div className={`${cardClass} lg:col-span-1`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-lg font-semibold">Consent Records ({filteredConsents.length})</h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : filteredConsents.length === 0 ? (
                  <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.medicalConsent.noConsentFormsFound', 'No consent forms found')}</p>
                  </div>
                ) : (
                  <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredConsents.map(consent => {
                      const TypeIcon = getTypeIcon(consent.formType);
                      return (
                        <div
                          key={consent.id}
                          onClick={() => {
                            setSelectedConsent(consent);
                            addAuditEntry(consent.id, 'viewed', `Consent form "${consent.formTitle}" was viewed`);
                          }}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedConsent?.id === consent.id
                              ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                              : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <TypeIcon className="w-4 h-4 text-cyan-500" />
                              </div>
                              <div>
                                <p className="font-medium">{consent.formTitle}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {consent.patientName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(consent.status)}`}>
                                    {consent.status}
                                  </span>
                                  {consent.electronicSignature && (
                                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">e-Sig</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={(e) => { e.stopPropagation(); openEditModal(consent); }} className="p-1.5 hover:bg-gray-600 rounded">
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(consent.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
              {selectedConsent ? (
                <div>
                  <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold">{selectedConsent.formTitle}</h2>
                          <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedConsent.status)}`}>
                            {selectedConsent.status}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Patient: {selectedConsent.patientName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedConsent.status === 'pending' && (
                          <button onClick={() => setShowSignatureModal(true)} className={buttonPrimary}>
                            <PenTool className="w-4 h-4" /> Sign
                          </button>
                        )}
                        {selectedConsent.status === 'signed' && (
                          <button onClick={() => handleRevoke(selectedConsent)} className={buttonSecondary}>
                            <XCircle className="w-4 h-4" /> Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.medicalConsent.formType', 'Form Type')}</p>
                        <p className="font-medium capitalize">{selectedConsent.formType}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.medicalConsent.provider', 'Provider')}</p>
                        <p className="font-medium">{selectedConsent.providerName || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.medicalConsent.signedDate', 'Signed Date')}</p>
                        <p className="font-medium">{selectedConsent.signedDate || 'Not signed'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.medicalConsent.expires', 'Expires')}</p>
                        <p className="font-medium">{selectedConsent.expirationDate || 'No expiration'}</p>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-500" />
                        {t('tools.medicalConsent.patientInformation2', 'Patient Information')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.medicalConsent.patientName', 'Patient Name')}</p>
                          <p className="font-medium">{selectedConsent.patientName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.medicalConsent.dateOfBirth', 'Date of Birth')}</p>
                          <p className="font-medium">{selectedConsent.dateOfBirth || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.medicalConsent.patientId', 'Patient ID')}</p>
                          <p className="font-medium">{selectedConsent.patientId || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Procedure Info */}
                    {selectedConsent.procedureName && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Clipboard className="w-4 h-4 text-cyan-500" />
                          {t('tools.medicalConsent.procedure', 'Procedure')}
                        </h3>
                        <p>{selectedConsent.procedureName}</p>
                      </div>
                    )}

                    {/* Risks, Benefits, Alternatives */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedConsent.risks.length > 0 && (
                        <div className={`p-4 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            Risks ({selectedConsent.risks.length})
                          </h3>
                          <ul className="text-sm space-y-1">
                            {selectedConsent.risks.map((risk, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">-</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedConsent.benefits.length > 0 && (
                        <div className={`p-4 rounded-lg border border-green-500/30 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Benefits ({selectedConsent.benefits.length})
                          </h3>
                          <ul className="text-sm space-y-1">
                            {selectedConsent.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">+</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedConsent.alternatives.length > 0 && (
                        <div className={`p-4 rounded-lg border border-blue-500/30 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-400">
                            <RefreshCw className="w-4 h-4" />
                            Alternatives ({selectedConsent.alternatives.length})
                          </h3>
                          <ul className="text-sm space-y-1">
                            {selectedConsent.alternatives.map((alt, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">-</span>
                                <span>{alt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Consent Questions */}
                    {selectedConsent.questions.length > 0 && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Check className="w-4 h-4 text-cyan-500" />
                          Consent Questions ({selectedConsent.questions.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedConsent.questions.map((q, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                q.answer ? 'bg-green-500 text-white' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                              }`}>
                                {q.answer && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-sm">{q.question}</span>
                              {q.required && <span className="text-xs text-red-400">*Required</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Signature Info */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-cyan-500" />
                        {t('tools.medicalConsent.signatureInformation', 'Signature Information')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.medicalConsent.signedBy', 'Signed By')}</p>
                          <p className="font-medium capitalize">{selectedConsent.signedBy}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.medicalConsent.signerName', 'Signer Name')}</p>
                          <p className="font-medium">{selectedConsent.signerName || selectedConsent.patientName}</p>
                        </div>
                        {selectedConsent.signerRelationship && (
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.medicalConsent.relationship', 'Relationship')}</p>
                            <p className="font-medium">{selectedConsent.signerRelationship}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.medicalConsent.electronicSignature', 'Electronic Signature')}</p>
                          <p className="font-medium">{selectedConsent.electronicSignature ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      {selectedConsent.signatureData && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-400 mb-2">{t('tools.medicalConsent.signature', 'Signature')}</p>
                          <img
                            src={selectedConsent.signatureData}
                            alt="Signature"
                            className={`max-w-xs border rounded ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Witness Info */}
                    {selectedConsent.witnessName && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-500" />
                          {t('tools.medicalConsent.witnessInformation2', 'Witness Information')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.medicalConsent.witnessName', 'Witness Name')}</p>
                            <p className="font-medium">{selectedConsent.witnessName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.medicalConsent.witnessDate', 'Witness Date')}</p>
                            <p className="font-medium">{selectedConsent.witnessDate || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Language Info */}
                    {selectedConsent.interpreterUsed && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Languages className="w-4 h-4 text-cyan-500" />
                          {t('tools.medicalConsent.languageServices', 'Language Services')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.medicalConsent.language', 'Language')}</p>
                            <p className="font-medium">{selectedConsent.language}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.medicalConsent.interpreter', 'Interpreter')}</p>
                            <p className="font-medium">{selectedConsent.interpreterName || 'Used'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedConsent.notes && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.medicalConsent.notes', 'Notes')}</h3>
                        <p className="text-sm">{selectedConsent.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileSignature className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('tools.medicalConsent.selectAConsentForm', 'Select a consent form')}</p>
                  <p className="text-sm">{t('tools.medicalConsent.chooseAConsentRecordTo', 'Choose a consent record to view details')}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className={cardClass}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.medicalConsent.consentFormTemplates', 'Consent Form Templates')}</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.medicalConsent.selectATemplateToQuickly', 'Select a template to quickly create standardized consent forms')}
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => {
                const TypeIcon = getTypeIcon(template.formType);
                return (
                  <div key={template.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <TypeIcon className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          v{template.version} | {template.department}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {template.content}
                    </p>
                    <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {template.requiredQuestions.length} required questions
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        template.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        template.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {template.status}
                      </span>
                      <button
                        onClick={() => {
                          setFormData(createNewConsent());
                          applyTemplate(template);
                          setShowModal(true);
                        }}
                        className="text-sm text-cyan-500 hover:text-cyan-400 font-medium"
                      >
                        {t('tools.medicalConsent.useTemplate', 'Use Template')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className={cardClass}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.medicalConsent.auditLog', 'Audit Log')}</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.medicalConsent.trackAllConsentFormActivities', 'Track all consent form activities for compliance')}
            </p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {auditLog.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.medicalConsent.noAuditEntriesYet', 'No audit entries yet')}</p>
                <p className="text-sm">{t('tools.medicalConsent.activitiesWillBeLoggedAs', 'Activities will be logged as you interact with consent forms')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {auditLog.map(entry => (
                  <div key={entry.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        entry.action === 'signed' ? 'bg-green-500/20' :
                        entry.action === 'revoked' ? 'bg-red-500/20' :
                        entry.action === 'viewed' ? 'bg-blue-500/20' :
                        entry.action === 'created' ? 'bg-cyan-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        {entry.action === 'signed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {entry.action === 'revoked' && <XCircle className="w-4 h-4 text-red-500" />}
                        {entry.action === 'viewed' && <Eye className="w-4 h-4 text-blue-500" />}
                        {entry.action === 'created' && <Plus className="w-4 h-4 text-cyan-500" />}
                        {entry.action === 'modified' && <Edit2 className="w-4 h-4 text-yellow-500" />}
                        {entry.action === 'expired' && <Clock className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{entry.action}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {entry.details}
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(entry.performedAt).toLocaleString()} by {entry.performedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} z-10`}>
              <h2 className="text-xl font-bold">{editingConsent ? t('tools.medicalConsent.editConsentForm', 'Edit Consent Form') : t('tools.medicalConsent.newConsentForm', 'New Consent Form')}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowTemplateModal(true)} className={buttonSecondary}>
                  <Clipboard className="w-4 h-4" /> Use Template
                </button>
                <button onClick={() => { setShowModal(false); setEditingConsent(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Form Type and Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalConsent.formType2', 'Form Type *')}</label>
                  <select value={formData.formType} onChange={(e) => setFormData({ ...formData, formType: e.target.value as any })} className={inputClass}>
                    {formTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalConsent.formTitle', 'Form Title *')}</label>
                  <input type="text" value={formData.formTitle} onChange={(e) => setFormData({ ...formData, formTitle: e.target.value })} className={inputClass} placeholder={t('tools.medicalConsent.eGConsentForKnee', 'e.g., Consent for Knee Replacement Surgery')} />
                </div>
              </div>

              {/* Patient Information */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <h3 className="font-medium mb-3">{t('tools.medicalConsent.patientInformation', 'Patient Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.medicalConsent.patientName2', 'Patient Name *')}</label>
                    <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalConsent.patientId2', 'Patient ID')}</label>
                    <input type="text" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalConsent.dateOfBirth2', 'Date of Birth')}</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Provider and Procedure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalConsent.providerName', 'Provider Name *')}</label>
                  <input type="text" value={formData.providerName} onChange={(e) => setFormData({ ...formData, providerName: e.target.value })} className={inputClass} placeholder={t('tools.medicalConsent.eGDrJohnSmith', 'e.g., Dr. John Smith')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalConsent.procedureName', 'Procedure Name')}</label>
                  <input type="text" value={formData.procedureName || ''} onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })} className={inputClass} placeholder={t('tools.medicalConsent.eGTotalKneeArthroplasty', 'e.g., Total Knee Arthroplasty')} />
                </div>
              </div>

              {/* Risks */}
              <div>
                <label className={labelClass}>{t('tools.medicalConsent.risks', 'Risks')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newRisk} onChange={(e) => setNewRisk(e.target.value)} placeholder={t('tools.medicalConsent.addRisk', 'Add risk')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRisk())} />
                  <button type="button" onClick={addRisk} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonRisks.filter(r => !formData.risks.includes(r)).slice(0, 6).map(r => (
                    <button key={r} type="button" onClick={() => setFormData({ ...formData, risks: [...formData.risks, r] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {r}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.risks.map((r, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                      {r} <button onClick={() => removeRisk(r)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className={labelClass}>{t('tools.medicalConsent.benefits', 'Benefits')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} placeholder={t('tools.medicalConsent.addBenefit', 'Add benefit')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())} />
                  <button type="button" onClick={addBenefit} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonBenefits.filter(b => !formData.benefits.includes(b)).slice(0, 5).map(b => (
                    <button key={b} type="button" onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, b] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {b}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((b, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                      {b} <button onClick={() => removeBenefit(b)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Alternatives */}
              <div>
                <label className={labelClass}>{t('tools.medicalConsent.alternatives', 'Alternatives')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newAlternative} onChange={(e) => setNewAlternative(e.target.value)} placeholder={t('tools.medicalConsent.addAlternative', 'Add alternative')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlternative())} />
                  <button type="button" onClick={addAlternative} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonAlternatives.filter(a => !formData.alternatives.includes(a)).slice(0, 4).map(a => (
                    <button key={a} type="button" onClick={() => setFormData({ ...formData, alternatives: [...formData.alternatives, a] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {a}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.alternatives.map((a, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                      {a} <button onClick={() => removeAlternative(a)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Consent Questions */}
              <div>
                <label className={labelClass}>{t('tools.medicalConsent.consentQuestions', 'Consent Questions')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder={t('tools.medicalConsent.addConsentQuestion', 'Add consent question')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())} />
                  <button type="button" onClick={addQuestion} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {formData.questions.map((q, i) => (
                    <div key={i} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleQuestionAnswer(i)}
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            q.answer ? 'bg-green-500 text-white' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                        >
                          {q.answer && <Check className="w-3 h-3" />}
                        </button>
                        <span className="text-sm">{q.question}</span>
                        {q.required && <span className="text-xs text-red-400">*</span>}
                      </div>
                      <button onClick={() => removeQuestion(i)} className="p-1 hover:bg-red-500/20 rounded">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Settings */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <h3 className="font-medium mb-3">{t('tools.medicalConsent.signatureSettings', 'Signature Settings')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.medicalConsent.signedBy2', 'Signed By')}</label>
                    <select value={formData.signedBy} onChange={(e) => setFormData({ ...formData, signedBy: e.target.value as any })} className={inputClass}>
                      {signerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  {formData.signedBy !== 'patient' && (
                    <>
                      <div>
                        <label className={labelClass}>{t('tools.medicalConsent.signerName2', 'Signer Name')}</label>
                        <input type="text" value={formData.signerName || ''} onChange={(e) => setFormData({ ...formData, signerName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.medicalConsent.relationship2', 'Relationship')}</label>
                        <input type="text" value={formData.signerRelationship || ''} onChange={(e) => setFormData({ ...formData, signerRelationship: e.target.value })} className={inputClass} />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <input type="checkbox" id="eSignature" checked={formData.electronicSignature} onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="eSignature" className="text-sm">{t('tools.medicalConsent.electronicSignature2', 'Electronic Signature')}</label>
                </div>
              </div>

              {/* Witness Information */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <h3 className="font-medium mb-3">{t('tools.medicalConsent.witnessInformation', 'Witness Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.medicalConsent.witnessName2', 'Witness Name')}</label>
                    <input type="text" value={formData.witnessName || ''} onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalConsent.witnessDate2', 'Witness Date')}</label>
                    <input type="date" value={formData.witnessDate || ''} onChange={(e) => setFormData({ ...formData, witnessDate: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Language & Interpreter */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <h3 className="font-medium mb-3">{t('tools.medicalConsent.languageInterpreter', 'Language & Interpreter')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.medicalConsent.language2', 'Language')}</label>
                    <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className={inputClass}>
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input type="checkbox" id="interpreter" checked={formData.interpreterUsed} onChange={(e) => setFormData({ ...formData, interpreterUsed: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="interpreter" className="text-sm">{t('tools.medicalConsent.interpreterUsed', 'Interpreter Used')}</label>
                  </div>
                  {formData.interpreterUsed && (
                    <div>
                      <label className={labelClass}>{t('tools.medicalConsent.interpreterName', 'Interpreter Name')}</label>
                      <input type="text" value={formData.interpreterName || ''} onChange={(e) => setFormData({ ...formData, interpreterName: e.target.value })} className={inputClass} />
                    </div>
                  )}
                </div>
              </div>

              {/* Expiration & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalConsent.expirationDate', 'Expiration Date')}</label>
                  <input type="date" value={formData.expirationDate || ''} onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalConsent.status', 'Status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.medicalConsent.notes2', 'Notes')}</label>
                <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.medicalConsent.additionalNotesOrComments', 'Additional notes or comments...')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingConsent(null); }} className={buttonSecondary}>{t('tools.medicalConsent.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.patientName || !formData.formTitle || !formData.providerName} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Consent Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.medicalConsent.selectTemplate', 'Select Template')}</h2>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-3">
              {templates.filter(t => t.status === 'active').map(template => {
                const TypeIcon = getTypeIcon(template.formType);
                return (
                  <div
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${theme === 'dark' ? 'border-gray-700 hover:border-cyan-500 hover:bg-gray-700/50' : 'border-gray-200 hover:border-cyan-500 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <TypeIcon className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          v{template.version} | {template.department}
                        </p>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {template.requiredQuestions.length} required questions
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.medicalConsent.signConsentForm', 'Sign Consent Form')}</h2>
              <button onClick={() => setShowSignatureModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-sm mb-2"><strong>{t('tools.medicalConsent.form', 'Form:')}</strong> {selectedConsent.formTitle}</p>
                <p className="text-sm"><strong>{t('tools.medicalConsent.patient', 'Patient:')}</strong> {selectedConsent.patientName}</p>
              </div>

              {/* Consent Questions Confirmation */}
              {selectedConsent.questions.length > 0 && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    {t('tools.medicalConsent.pleaseConfirmYouUnderstand', 'Please confirm you understand:')}
                  </p>
                  <ul className="text-sm space-y-1">
                    {selectedConsent.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{q.question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className={labelClass}>{t('tools.medicalConsent.drawYourSignature', 'Draw Your Signature')}</label>
                <canvas
                  ref={signatureCanvasRef}
                  width={400}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className={`w-full border rounded-lg cursor-crosshair ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}
                />
                <button type="button" onClick={clearSignature} className="text-sm text-cyan-500 hover:text-cyan-400 mt-2">
                  {t('tools.medicalConsent.clearSignature', 'Clear Signature')}
                </button>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowSignatureModal(false)} className={buttonSecondary}>{t('tools.medicalConsent.cancel2', 'Cancel')}</button>
                <button type="button" onClick={handleSign} className={buttonPrimary}>
                  <PenTool className="w-4 h-4" /> Sign & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.medicalConsent.aboutMedicalConsentManager', 'About Medical Consent Manager')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage patient consent forms for medical procedures, surgeries, treatments, and research studies. Track electronic signatures,
          monitor expiration dates, and maintain a complete audit trail for regulatory compliance. Use pre-built templates to quickly
          generate standardized consent forms with required questions, risks, benefits, and alternatives disclosures.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default MedicalConsentTool;
