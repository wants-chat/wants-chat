'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Save,
  Download,
  Eye,
  Edit3,
  Building2,
  User,
  Target,
  ListChecks,
  Calendar,
  DollarSign,
  FileCheck,
  Award,
  Briefcase,
  PenTool,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  GripVertical,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ProposalGeneratorToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Deliverable {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  percentage: number;
}

interface PricingItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  description: string;
  results: string;
}

interface Proposal {
  id: string;
  template: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  // Client Information
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  // Project Details
  projectTitle: string;
  projectScope: string;
  projectObjectives: string;
  // Deliverables
  deliverables: Deliverable[];
  // Timeline
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  // Pricing
  pricingModel: 'fixed' | 'hourly' | 'retainer';
  pricingItems: PricingItem[];
  hourlyRate: number;
  estimatedHours: number;
  retainerFee: number;
  retainerPeriod: string;
  discount: number;
  tax: number;
  // Terms and Conditions
  paymentTerms: string;
  cancellationPolicy: string;
  confidentiality: string;
  additionalTerms: string;
  // About Us
  companyName: string;
  companyDescription: string;
  credentials: string;
  // Case Studies
  caseStudies: CaseStudy[];
  // Signature
  signatureName: string;
  signatureTitle: string;
  signatureDate: string;
}

const TEMPLATES = [
  { value: 'consulting', label: 'Consulting Services', icon: Briefcase },
  { value: 'development', label: 'Software Development', icon: FileText },
  { value: 'design', label: 'Design Services', icon: PenTool },
  { value: 'marketing', label: 'Marketing Services', icon: Target },
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'gray', icon: Edit3 },
  sent: { label: 'Sent', color: 'blue', icon: Send },
  viewed: { label: 'Viewed', color: 'yellow', icon: Eye },
  accepted: { label: 'Accepted', color: 'green', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'red', icon: XCircle },
};

const COLUMNS: ColumnConfig[] = [
  {
    key: 'projectTitle',
    header: 'Project Title',
    type: 'string',
  },
  {
    key: 'clientName',
    header: 'Client Name',
    type: 'string',
  },
  {
    key: 'clientCompany',
    header: 'Client Company',
    type: 'string',
  },
  {
    key: 'status',
    header: 'Status',
    type: 'string',
  },
  {
    key: 'createdAt',
    header: 'Created Date',
    type: 'date',
  },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const createEmptyProposal = (template: string = 'consulting'): Proposal => ({
  id: generateId(),
  template,
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  clientName: '',
  clientCompany: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  projectTitle: '',
  projectScope: '',
  projectObjectives: '',
  deliverables: [],
  startDate: '',
  endDate: '',
  milestones: [],
  pricingModel: 'fixed',
  pricingItems: [],
  hourlyRate: 0,
  estimatedHours: 0,
  retainerFee: 0,
  retainerPeriod: 'monthly',
  discount: 0,
  tax: 0,
  paymentTerms: '50% upfront, 50% upon completion',
  cancellationPolicy: 'Either party may cancel with 30 days written notice.',
  confidentiality: 'All project information will be kept strictly confidential.',
  additionalTerms: '',
  companyName: '',
  companyDescription: '',
  credentials: '',
  caseStudies: [],
  signatureName: '',
  signatureTitle: '',
  signatureDate: '',
});

export const ProposalGeneratorTool = ({ uiConfig }: ProposalGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Use the useToolData hook for backend persistence
  const {
    data: proposals,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    print,
    copyToClipboard,
  } = useToolData<Proposal>(
    'proposal-generator',
    [],
    COLUMNS,
    { autoSave: true }
  );

  const [currentProposal, setCurrentProposal] = useState<Proposal>(createEmptyProposal());
  const [activeSection, setActiveSection] = useState<string>('client');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.company || params.amount) {
        setCurrentProposal(prev => ({
          ...prev,
          projectTitle: params.title || prev.projectTitle,
          projectScope: params.description || prev.projectScope,
          clientCompany: params.company || prev.clientCompany,
        }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate totals
  const pricingTotals = useMemo(() => {
    let subtotal = 0;
    if (currentProposal.pricingModel === 'fixed') {
      subtotal = currentProposal.pricingItems.reduce((sum, item) => sum + item.total, 0);
    } else if (currentProposal.pricingModel === 'hourly') {
      subtotal = currentProposal.hourlyRate * currentProposal.estimatedHours;
    } else {
      subtotal = currentProposal.retainerFee;
    }
    const discountAmount = subtotal * (currentProposal.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (currentProposal.tax / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, discountAmount, afterDiscount, taxAmount, total };
  }, [currentProposal]);

  // Update proposal field
  const updateProposal = (field: keyof Proposal, value: any) => {
    setCurrentProposal(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Deliverables management
  const addDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: generateId(),
      title: '',
      description: '',
      completed: false,
    };
    updateProposal('deliverables', [...currentProposal.deliverables, newDeliverable]);
  };

  const updateDeliverable = (id: string, field: keyof Deliverable, value: any) => {
    updateProposal(
      'deliverables',
      currentProposal.deliverables.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      )
    );
  };

  const removeDeliverable = (id: string) => {
    updateProposal(
      'deliverables',
      currentProposal.deliverables.filter(d => d.id !== id)
    );
  };

  // Milestones management
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: generateId(),
      title: '',
      description: '',
      dueDate: '',
      percentage: 0,
    };
    updateProposal('milestones', [...currentProposal.milestones, newMilestone]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    updateProposal(
      'milestones',
      currentProposal.milestones.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const removeMilestone = (id: string) => {
    updateProposal(
      'milestones',
      currentProposal.milestones.filter(m => m.id !== id)
    );
  };

  // Pricing items management
  const addPricingItem = () => {
    const newItem: PricingItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      rate: 0,
      total: 0,
    };
    updateProposal('pricingItems', [...currentProposal.pricingItems, newItem]);
  };

  const updatePricingItem = (id: string, field: keyof PricingItem, value: any) => {
    updateProposal(
      'pricingItems',
      currentProposal.pricingItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.total = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removePricingItem = (id: string) => {
    updateProposal(
      'pricingItems',
      currentProposal.pricingItems.filter(item => item.id !== id)
    );
  };

  // Case studies management
  const addCaseStudy = () => {
    const newCaseStudy: CaseStudy = {
      id: generateId(),
      title: '',
      client: '',
      description: '',
      results: '',
    };
    updateProposal('caseStudies', [...currentProposal.caseStudies, newCaseStudy]);
  };

  const updateCaseStudy = (id: string, field: keyof CaseStudy, value: any) => {
    updateProposal(
      'caseStudies',
      currentProposal.caseStudies.map(cs =>
        cs.id === id ? { ...cs, [field]: value } : cs
      )
    );
  };

  const removeCaseStudy = (id: string) => {
    updateProposal(
      'caseStudies',
      currentProposal.caseStudies.filter(cs => cs.id !== id)
    );
  };

  // Save proposal
  const saveProposal = () => {
    const existingIndex = proposals.findIndex(p => p.id === currentProposal.id);
    if (existingIndex >= 0) {
      updateItem(currentProposal.id, currentProposal);
    } else {
      addItem(currentProposal);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Create new proposal
  const createNewProposal = () => {
    setCurrentProposal(createEmptyProposal());
    setIsPreviewMode(false);
    setActiveSection('client');
  };

  // Load proposal
  const loadProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setIsPreviewMode(false);
    setActiveSection('client');
  };

  // Delete proposal
  const deleteProposal = (id: string) => {
    deleteItem(id);
    if (currentProposal.id === id) {
      createNewProposal();
    }
  };

  // Copy proposal content
  const copyProposal = async () => {
    const content = generateProposalText();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export handlers using hook methods
  const handleExportCSV = () => {
    exportCSV({ filename: 'proposals' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'proposals' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'proposals' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'proposals',
      title: 'Business Proposals Report',
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print('Business Proposals Report');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // Generate proposal text
  const generateProposalText = () => {
    const lines: string[] = [];
    lines.push('=' .repeat(60));
    lines.push(`BUSINESS PROPOSAL: ${currentProposal.projectTitle || 'Untitled Project'}`);
    lines.push('=' .repeat(60));
    lines.push('');

    // Client Info
    lines.push('CLIENT INFORMATION');
    lines.push('-'.repeat(40));
    if (currentProposal.clientName) lines.push(`Name: ${currentProposal.clientName}`);
    if (currentProposal.clientCompany) lines.push(`Company: ${currentProposal.clientCompany}`);
    if (currentProposal.clientEmail) lines.push(`Email: ${currentProposal.clientEmail}`);
    if (currentProposal.clientPhone) lines.push(`Phone: ${currentProposal.clientPhone}`);
    if (currentProposal.clientAddress) lines.push(`Address: ${currentProposal.clientAddress}`);
    lines.push('');

    // Project Scope
    lines.push('PROJECT SCOPE & OBJECTIVES');
    lines.push('-'.repeat(40));
    if (currentProposal.projectScope) lines.push(`Scope:\n${currentProposal.projectScope}`);
    if (currentProposal.projectObjectives) lines.push(`\nObjectives:\n${currentProposal.projectObjectives}`);
    lines.push('');

    // Deliverables
    if (currentProposal.deliverables.length > 0) {
      lines.push('DELIVERABLES');
      lines.push('-'.repeat(40));
      currentProposal.deliverables.forEach((d, i) => {
        lines.push(`${i + 1}. ${d.title}`);
        if (d.description) lines.push(`   ${d.description}`);
      });
      lines.push('');
    }

    // Timeline
    lines.push('TIMELINE');
    lines.push('-'.repeat(40));
    if (currentProposal.startDate) lines.push(`Start Date: ${currentProposal.startDate}`);
    if (currentProposal.endDate) lines.push(`End Date: ${currentProposal.endDate}`);
    if (currentProposal.milestones.length > 0) {
      lines.push('\nMilestones:');
      currentProposal.milestones.forEach((m, i) => {
        lines.push(`${i + 1}. ${m.title} - Due: ${m.dueDate || 'TBD'} (${m.percentage}%)`);
        if (m.description) lines.push(`   ${m.description}`);
      });
    }
    lines.push('');

    // Pricing
    lines.push('PRICING');
    lines.push('-'.repeat(40));
    lines.push(`Pricing Model: ${currentProposal.pricingModel.charAt(0).toUpperCase() + currentProposal.pricingModel.slice(1)}`);
    if (currentProposal.pricingModel === 'fixed' && currentProposal.pricingItems.length > 0) {
      currentProposal.pricingItems.forEach(item => {
        lines.push(`- ${item.description}: $${item.total.toFixed(2)} (${item.quantity} x $${item.rate.toFixed(2)})`);
      });
    } else if (currentProposal.pricingModel === 'hourly') {
      lines.push(`Rate: $${currentProposal.hourlyRate}/hour`);
      lines.push(`Estimated Hours: ${currentProposal.estimatedHours}`);
    } else if (currentProposal.pricingModel === 'retainer') {
      lines.push(`Retainer Fee: $${currentProposal.retainerFee}/${currentProposal.retainerPeriod}`);
    }
    lines.push(`\nSubtotal: $${pricingTotals.subtotal.toFixed(2)}`);
    if (currentProposal.discount > 0) lines.push(`Discount (${currentProposal.discount}%): -$${pricingTotals.discountAmount.toFixed(2)}`);
    if (currentProposal.tax > 0) lines.push(`Tax (${currentProposal.tax}%): $${pricingTotals.taxAmount.toFixed(2)}`);
    lines.push(`TOTAL: $${pricingTotals.total.toFixed(2)}`);
    lines.push('');

    // Terms
    lines.push('TERMS & CONDITIONS');
    lines.push('-'.repeat(40));
    if (currentProposal.paymentTerms) lines.push(`Payment Terms: ${currentProposal.paymentTerms}`);
    if (currentProposal.cancellationPolicy) lines.push(`Cancellation: ${currentProposal.cancellationPolicy}`);
    if (currentProposal.confidentiality) lines.push(`Confidentiality: ${currentProposal.confidentiality}`);
    if (currentProposal.additionalTerms) lines.push(`Additional: ${currentProposal.additionalTerms}`);
    lines.push('');

    // About Us
    if (currentProposal.companyName || currentProposal.companyDescription) {
      lines.push('ABOUT US');
      lines.push('-'.repeat(40));
      if (currentProposal.companyName) lines.push(`Company: ${currentProposal.companyName}`);
      if (currentProposal.companyDescription) lines.push(`\n${currentProposal.companyDescription}`);
      if (currentProposal.credentials) lines.push(`\nCredentials: ${currentProposal.credentials}`);
      lines.push('');
    }

    // Case Studies
    if (currentProposal.caseStudies.length > 0) {
      lines.push('CASE STUDIES');
      lines.push('-'.repeat(40));
      currentProposal.caseStudies.forEach((cs, i) => {
        lines.push(`${i + 1}. ${cs.title} (${cs.client})`);
        if (cs.description) lines.push(`   ${cs.description}`);
        if (cs.results) lines.push(`   Results: ${cs.results}`);
      });
      lines.push('');
    }

    // Signature
    lines.push('SIGNATURE');
    lines.push('-'.repeat(40));
    lines.push(`\n\n_____________________________`);
    if (currentProposal.signatureName) lines.push(currentProposal.signatureName);
    if (currentProposal.signatureTitle) lines.push(currentProposal.signatureTitle);
    if (currentProposal.signatureDate) lines.push(`Date: ${currentProposal.signatureDate}`);

    return lines.join('\n');
  };

  const sections = [
    { id: 'client', label: 'Client Info', icon: User },
    { id: 'scope', label: 'Scope & Objectives', icon: Target },
    { id: 'deliverables', label: 'Deliverables', icon: ListChecks },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'terms', label: 'Terms', icon: FileCheck },
    { id: 'about', label: 'About Us', icon: Building2 },
    { id: 'cases', label: 'Case Studies', icon: Briefcase },
    { id: 'signature', label: 'Signature', icon: PenTool },
  ];

  // Input classes
  const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#0D9488]'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#0D9488]'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`;

  const labelClass = `block text-sm font-medium mb-2 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const sectionHeaderClass = `flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
  }`;

  // Render section content
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'client':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.clientName', 'Client Name *')}</label>
              <input
                type="text"
                value={currentProposal.clientName}
                onChange={(e) => updateProposal('clientName', e.target.value)}
                placeholder={t('tools.proposalGenerator.johnSmith', 'John Smith')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.company', 'Company')}</label>
              <input
                type="text"
                value={currentProposal.clientCompany}
                onChange={(e) => updateProposal('clientCompany', e.target.value)}
                placeholder={t('tools.proposalGenerator.acmeCorporation', 'Acme Corporation')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.email', 'Email')}</label>
              <input
                type="email"
                value={currentProposal.clientEmail}
                onChange={(e) => updateProposal('clientEmail', e.target.value)}
                placeholder={t('tools.proposalGenerator.johnExampleCom', 'john@example.com')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.phone', 'Phone')}</label>
              <input
                type="tel"
                value={currentProposal.clientPhone}
                onChange={(e) => updateProposal('clientPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.proposalGenerator.address', 'Address')}</label>
              <textarea
                value={currentProposal.clientAddress}
                onChange={(e) => updateProposal('clientAddress', e.target.value)}
                placeholder={t('tools.proposalGenerator.123BusinessStSuite100', '123 Business St, Suite 100, City, State 12345')}
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'scope':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.projectTitle', 'Project Title *')}</label>
              <input
                type="text"
                value={currentProposal.projectTitle}
                onChange={(e) => updateProposal('projectTitle', e.target.value)}
                placeholder={t('tools.proposalGenerator.websiteRedesignProject', 'Website Redesign Project')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.projectScope', 'Project Scope')}</label>
              <textarea
                value={currentProposal.projectScope}
                onChange={(e) => updateProposal('projectScope', e.target.value)}
                placeholder={t('tools.proposalGenerator.describeTheScopeOfThe', 'Describe the scope of the project, including what is and isn\'t included...')}
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.projectObjectives', 'Project Objectives')}</label>
              <textarea
                value={currentProposal.projectObjectives}
                onChange={(e) => updateProposal('projectObjectives', e.target.value)}
                placeholder={t('tools.proposalGenerator.listTheKeyObjectivesAnd', 'List the key objectives and goals of this project...')}
                rows={4}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'deliverables':
        return (
          <div className="space-y-4">
            {currentProposal.deliverables.map((deliverable, index) => (
              <div
                key={deliverable.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-2">
                    <GripVertical className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="checkbox"
                      checked={deliverable.completed}
                      onChange={(e) => updateDeliverable(deliverable.id, 'completed', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={deliverable.title}
                      onChange={(e) => updateDeliverable(deliverable.id, 'title', e.target.value)}
                      placeholder={`Deliverable ${index + 1}`}
                      className={inputClass}
                    />
                    <textarea
                      value={deliverable.description}
                      onChange={(e) => updateDeliverable(deliverable.id, 'description', e.target.value)}
                      placeholder={t('tools.proposalGenerator.description3', 'Description...')}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                  <button
                    onClick={() => removeDeliverable(deliverable.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addDeliverable}
              className={`w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                theme === 'dark'
                  ? t('tools.proposalGenerator.borderGray600TextGray', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.proposalGenerator.borderGray300TextGray', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.proposalGenerator.addDeliverable', 'Add Deliverable')}
            </button>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.proposalGenerator.startDate', 'Start Date')}</label>
                <input
                  type="date"
                  value={currentProposal.startDate}
                  onChange={(e) => updateProposal('startDate', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.proposalGenerator.endDate', 'End Date')}</label>
                <input
                  type="date"
                  value={currentProposal.endDate}
                  onChange={(e) => updateProposal('endDate', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={`${labelClass} flex items-center gap-2`}>
                <Clock className="w-4 h-4" />
                {t('tools.proposalGenerator.milestones', 'Milestones')}
              </label>
              <div className="space-y-4 mt-3">
                {currentProposal.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                            placeholder={t('tools.proposalGenerator.milestoneTitle', 'Milestone title')}
                            className={inputClass}
                          />
                          <input
                            type="date"
                            value={milestone.dueDate}
                            onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                            className={inputClass}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={milestone.percentage}
                              onChange={(e) => updateMilestone(milestone.id, 'percentage', parseInt(e.target.value) || 0)}
                              min="0"
                              max="100"
                              className={`${inputClass} w-20`}
                            />
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>%</span>
                          </div>
                        </div>
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                          placeholder={t('tools.proposalGenerator.description4', 'Description...')}
                          rows={2}
                          className={inputClass}
                        />
                      </div>
                      <button
                        onClick={() => removeMilestone(milestone.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addMilestone}
                  className={`w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    theme === 'dark'
                      ? t('tools.proposalGenerator.borderGray600TextGray2', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.proposalGenerator.borderGray300TextGray2', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.proposalGenerator.addMilestone', 'Add Milestone')}
                </button>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            {/* Pricing Model Selection */}
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.pricingModel', 'Pricing Model')}</label>
              <div className="grid grid-cols-3 gap-3">
                {(['fixed', 'hourly', 'retainer'] as const).map((model) => (
                  <button
                    key={model}
                    onClick={() => updateProposal('pricingModel', model)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      currentProposal.pricingModel === model
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {model.charAt(0).toUpperCase() + model.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Fixed Pricing Items */}
            {currentProposal.pricingModel === 'fixed' && (
              <div className="space-y-4">
                <div className={`grid grid-cols-12 gap-2 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}>
                  <div className="col-span-5 text-sm font-medium">{t('tools.proposalGenerator.description', 'Description')}</div>
                  <div className="col-span-2 text-sm font-medium text-center">{t('tools.proposalGenerator.qty', 'Qty')}</div>
                  <div className="col-span-2 text-sm font-medium text-center">{t('tools.proposalGenerator.rate', 'Rate')}</div>
                  <div className="col-span-2 text-sm font-medium text-center">{t('tools.proposalGenerator.total', 'Total')}</div>
                  <div className="col-span-1"></div>
                </div>
                {currentProposal.pricingItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updatePricingItem(item.id, 'description', e.target.value)}
                        placeholder={t('tools.proposalGenerator.itemDescription', 'Item description')}
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePricingItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className={`${inputClass} text-center`}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updatePricingItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className={`${inputClass} text-center`}
                      />
                    </div>
                    <div className={`col-span-2 text-center font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${item.total.toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removePricingItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addPricingItem}
                  className={`w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    theme === 'dark'
                      ? t('tools.proposalGenerator.borderGray600TextGray3', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.proposalGenerator.borderGray300TextGray3', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.proposalGenerator.addLineItem', 'Add Line Item')}
                </button>
              </div>
            )}

            {/* Hourly Pricing */}
            {currentProposal.pricingModel === 'hourly' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.proposalGenerator.hourlyRate', 'Hourly Rate ($)')}</label>
                  <input
                    type="number"
                    value={currentProposal.hourlyRate}
                    onChange={(e) => updateProposal('hourlyRate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.proposalGenerator.estimatedHours', 'Estimated Hours')}</label>
                  <input
                    type="number"
                    value={currentProposal.estimatedHours}
                    onChange={(e) => updateProposal('estimatedHours', parseInt(e.target.value) || 0)}
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Retainer Pricing */}
            {currentProposal.pricingModel === 'retainer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.proposalGenerator.retainerFee', 'Retainer Fee ($)')}</label>
                  <input
                    type="number"
                    value={currentProposal.retainerFee}
                    onChange={(e) => updateProposal('retainerFee', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.proposalGenerator.period', 'Period')}</label>
                  <select
                    value={currentProposal.retainerPeriod}
                    onChange={(e) => updateProposal('retainerPeriod', e.target.value)}
                    className={inputClass}
                  >
                    <option value="weekly">{t('tools.proposalGenerator.weekly', 'Weekly')}</option>
                    <option value="bi-weekly">{t('tools.proposalGenerator.biWeekly', 'Bi-Weekly')}</option>
                    <option value="monthly">{t('tools.proposalGenerator.monthly', 'Monthly')}</option>
                    <option value="quarterly">{t('tools.proposalGenerator.quarterly', 'Quarterly')}</option>
                    <option value="yearly">{t('tools.proposalGenerator.yearly', 'Yearly')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Discount and Tax */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.proposalGenerator.discount', 'Discount (%)')}</label>
                <input
                  type="number"
                  value={currentProposal.discount}
                  onChange={(e) => updateProposal('discount', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.proposalGenerator.tax', 'Tax (%)')}</label>
                <input
                  type="number"
                  value={currentProposal.tax}
                  onChange={(e) => updateProposal('tax', parseFloat(e.target.value) || 0)}
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Totals */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.proposalGenerator.subtotal', 'Subtotal')}</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${pricingTotals.subtotal.toFixed(2)}</span>
                </div>
                {currentProposal.discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({currentProposal.discount}%)</span>
                    <span>-${pricingTotals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {currentProposal.tax > 0 && (
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Tax ({currentProposal.tax}%)</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${pricingTotals.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.proposalGenerator.total2', 'Total')}</span>
                  <span className="text-[#0D9488]">${pricingTotals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.paymentTerms', 'Payment Terms')}</label>
              <textarea
                value={currentProposal.paymentTerms}
                onChange={(e) => updateProposal('paymentTerms', e.target.value)}
                placeholder={t('tools.proposalGenerator.eG50Upfront50', 'e.g., 50% upfront, 50% upon completion')}
                rows={2}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.cancellationPolicy', 'Cancellation Policy')}</label>
              <textarea
                value={currentProposal.cancellationPolicy}
                onChange={(e) => updateProposal('cancellationPolicy', e.target.value)}
                placeholder={t('tools.proposalGenerator.termsForProjectCancellation', 'Terms for project cancellation...')}
                rows={2}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.confidentialityClause', 'Confidentiality Clause')}</label>
              <textarea
                value={currentProposal.confidentiality}
                onChange={(e) => updateProposal('confidentiality', e.target.value)}
                placeholder={t('tools.proposalGenerator.confidentialityAndNdaTerms', 'Confidentiality and NDA terms...')}
                rows={2}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.additionalTerms', 'Additional Terms')}</label>
              <textarea
                value={currentProposal.additionalTerms}
                onChange={(e) => updateProposal('additionalTerms', e.target.value)}
                placeholder={t('tools.proposalGenerator.anyAdditionalTermsAndConditions', 'Any additional terms and conditions...')}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.companyName', 'Company Name')}</label>
              <input
                type="text"
                value={currentProposal.companyName}
                onChange={(e) => updateProposal('companyName', e.target.value)}
                placeholder={t('tools.proposalGenerator.yourCompanyName', 'Your Company Name')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.companyDescription', 'Company Description')}</label>
              <textarea
                value={currentProposal.companyDescription}
                onChange={(e) => updateProposal('companyDescription', e.target.value)}
                placeholder={t('tools.proposalGenerator.describeYourCompanyMissionAnd', 'Describe your company, mission, and what makes you unique...')}
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.credentialsCertifications', 'Credentials & Certifications')}</label>
              <textarea
                value={currentProposal.credentials}
                onChange={(e) => updateProposal('credentials', e.target.value)}
                placeholder={t('tools.proposalGenerator.listRelevantCertificationsAwardsAnd', 'List relevant certifications, awards, and achievements...')}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'cases':
        return (
          <div className="space-y-4">
            {currentProposal.caseStudies.map((caseStudy, index) => (
              <div
                key={caseStudy.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    theme === 'dark' ? t('tools.proposalGenerator.bg0d948820Text0d9488', 'bg-[#0D9488]/20 text-[#0D9488]') : t('tools.proposalGenerator.bg0d948810Text0d9488', 'bg-[#0D9488]/10 text-[#0D9488]')
                  }`}>
                    Case Study {index + 1}
                  </span>
                  <button
                    onClick={() => removeCaseStudy(caseStudy.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={caseStudy.title}
                      onChange={(e) => updateCaseStudy(caseStudy.id, 'title', e.target.value)}
                      placeholder={t('tools.proposalGenerator.projectTitle2', 'Project Title')}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={caseStudy.client}
                      onChange={(e) => updateCaseStudy(caseStudy.id, 'client', e.target.value)}
                      placeholder={t('tools.proposalGenerator.clientName2', 'Client Name')}
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    value={caseStudy.description}
                    onChange={(e) => updateCaseStudy(caseStudy.id, 'description', e.target.value)}
                    placeholder={t('tools.proposalGenerator.describeTheProjectAndYour', 'Describe the project and your role...')}
                    rows={2}
                    className={inputClass}
                  />
                  <textarea
                    value={caseStudy.results}
                    onChange={(e) => updateCaseStudy(caseStudy.id, 'results', e.target.value)}
                    placeholder={t('tools.proposalGenerator.keyResultsAndAchievements', 'Key results and achievements...')}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addCaseStudy}
              className={`w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                theme === 'dark'
                  ? t('tools.proposalGenerator.borderGray600TextGray4', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.proposalGenerator.borderGray300TextGray4', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.proposalGenerator.addCaseStudy', 'Add Case Study')}
            </button>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.proposalGenerator.fullName', 'Full Name')}</label>
                <input
                  type="text"
                  value={currentProposal.signatureName}
                  onChange={(e) => updateProposal('signatureName', e.target.value)}
                  placeholder={t('tools.proposalGenerator.yourFullName', 'Your Full Name')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.proposalGenerator.title', 'Title')}</label>
                <input
                  type="text"
                  value={currentProposal.signatureTitle}
                  onChange={(e) => updateProposal('signatureTitle', e.target.value)}
                  placeholder={t('tools.proposalGenerator.ceoDirectorManager', 'CEO / Director / Manager')}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.proposalGenerator.date', 'Date')}</label>
              <input
                type="date"
                value={currentProposal.signatureDate}
                onChange={(e) => updateProposal('signatureDate', e.target.value)}
                className={`${inputClass} max-w-xs`}
              />
            </div>
            <div className={`p-6 rounded-lg border-2 border-dashed text-center ${
              theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
            }`}>
              <PenTool className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.proposalGenerator.digitalSignatureWillAppearHere', 'Digital signature will appear here')}
              </p>
              <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                <p className={`text-lg font-script ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'cursive' }}>
                  {currentProposal.signatureName || 'Your Signature'}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentProposal.signatureTitle}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render preview
  const renderPreview = () => (
    <div className={`max-w-4xl mx-auto p-8 rounded-lg shadow-lg ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {currentProposal.projectTitle || 'Business Proposal'}
        </h1>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Prepared for: {currentProposal.clientName || 'Client Name'}
          {currentProposal.clientCompany && ` | ${currentProposal.clientCompany}`}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {(() => {
            const statusConfig = STATUS_CONFIG[currentProposal.status];
            const Icon = statusConfig.icon;
            return (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                ${statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
                ${statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                ${statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                ${statusConfig.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                ${statusConfig.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
              `}>
                <Icon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Client Information */}
      {(currentProposal.clientName || currentProposal.clientEmail) && (
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <User className="w-5 h-5 text-[#0D9488]" />
            {t('tools.proposalGenerator.clientInformation', 'Client Information')}
          </h2>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {currentProposal.clientName && (
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.proposalGenerator.name', 'Name:')}</span>
                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProposal.clientName}</span>
                </div>
              )}
              {currentProposal.clientCompany && (
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.proposalGenerator.company2', 'Company:')}</span>
                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProposal.clientCompany}</span>
                </div>
              )}
              {currentProposal.clientEmail && (
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.proposalGenerator.email2', 'Email:')}</span>
                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProposal.clientEmail}</span>
                </div>
              )}
              {currentProposal.clientPhone && (
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.proposalGenerator.phone2', 'Phone:')}</span>
                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProposal.clientPhone}</span>
                </div>
              )}
            </div>
            {currentProposal.clientAddress && (
              <div className="mt-3 text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.proposalGenerator.address2', 'Address:')}</span>
                <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProposal.clientAddress}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Project Scope */}
      {(currentProposal.projectScope || currentProposal.projectObjectives) && (
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Target className="w-5 h-5 text-[#0D9488]" />
            {t('tools.proposalGenerator.projectScopeObjectives', 'Project Scope & Objectives')}
          </h2>
          {currentProposal.projectScope && (
            <div className="mb-4">
              <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.proposalGenerator.scope', 'Scope')}</h3>
              <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentProposal.projectScope}
              </p>
            </div>
          )}
          {currentProposal.projectObjectives && (
            <div>
              <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.proposalGenerator.objectives', 'Objectives')}</h3>
              <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentProposal.projectObjectives}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Deliverables */}
      {currentProposal.deliverables.length > 0 && (
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <ListChecks className="w-5 h-5 text-[#0D9488]" />
            {t('tools.proposalGenerator.deliverables', 'Deliverables')}
          </h2>
          <div className="space-y-3">
            {currentProposal.deliverables.map((d, index) => (
              <div key={d.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  d.completed ? 'bg-green-500 text-white' : t('tools.proposalGenerator.bg0d9488TextWhite', 'bg-[#0D9488] text-white')
                }`}>
                  {d.completed ? <Check className="w-3 h-3" /> : index + 1}
                </span>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{d.title}</p>
                  {d.description && (
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{d.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {(currentProposal.startDate || currentProposal.milestones.length > 0) && (
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Calendar className="w-5 h-5 text-[#0D9488]" />
            {t('tools.proposalGenerator.timeline', 'Timeline')}
          </h2>
          {(currentProposal.startDate || currentProposal.endDate) && (
            <div className={`flex gap-8 mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              {currentProposal.startDate && (
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.proposalGenerator.startDate2', 'Start Date')}</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProposal.startDate}</p>
                </div>
              )}
              {currentProposal.endDate && (
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.proposalGenerator.endDate2', 'End Date')}</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProposal.endDate}</p>
                </div>
              )}
            </div>
          )}
          {currentProposal.milestones.length > 0 && (
            <div className="space-y-3">
              {currentProposal.milestones.map((m, index) => (
                <div key={m.id} className={`flex items-center gap-4 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{m.title}</p>
                    {m.description && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{m.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {m.dueDate && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{m.dueDate}</p>
                    )}
                    <p className="text-sm text-[#0D9488] font-medium">{m.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pricing */}
      <section className="mb-8">
        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <DollarSign className="w-5 h-5 text-[#0D9488]" />
          {t('tools.proposalGenerator.pricing', 'Pricing')}
        </h2>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Pricing Model: <span className="font-medium capitalize">{currentProposal.pricingModel}</span>
          </p>

          {currentProposal.pricingModel === 'fixed' && currentProposal.pricingItems.length > 0 && (
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  <th className="text-left py-2">{t('tools.proposalGenerator.description2', 'Description')}</th>
                  <th className="text-center py-2">{t('tools.proposalGenerator.qty2', 'Qty')}</th>
                  <th className="text-center py-2">{t('tools.proposalGenerator.rate2', 'Rate')}</th>
                  <th className="text-right py-2">{t('tools.proposalGenerator.total3', 'Total')}</th>
                </tr>
              </thead>
              <tbody>
                {currentProposal.pricingItems.map(item => (
                  <tr key={item.id} className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    <td className="py-2">{item.description}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-center py-2">${item.rate.toFixed(2)}</td>
                    <td className="text-right py-2">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {currentProposal.pricingModel === 'hourly' && (
            <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <p>Rate: ${currentProposal.hourlyRate}/hour</p>
              <p>Estimated Hours: {currentProposal.estimatedHours}</p>
            </div>
          )}

          {currentProposal.pricingModel === 'retainer' && (
            <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <p>Retainer Fee: ${currentProposal.retainerFee}/{currentProposal.retainerPeriod}</p>
            </div>
          )}

          <div className={`border-t pt-3 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex justify-between text-sm">
              <span>{t('tools.proposalGenerator.subtotal2', 'Subtotal')}</span>
              <span>${pricingTotals.subtotal.toFixed(2)}</span>
            </div>
            {currentProposal.discount > 0 && (
              <div className="flex justify-between text-sm text-green-500">
                <span>Discount ({currentProposal.discount}%)</span>
                <span>-${pricingTotals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {currentProposal.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({currentProposal.tax}%)</span>
                <span>${pricingTotals.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className={`flex justify-between text-lg font-bold mt-2 pt-2 border-t ${
              theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-900'
            }`}>
              <span>{t('tools.proposalGenerator.total4', 'Total')}</span>
              <span className="text-[#0D9488]">${pricingTotals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Terms */}
      {(currentProposal.paymentTerms || currentProposal.cancellationPolicy) && (
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FileCheck className="w-5 h-5 text-[#0D9488]" />
            {t('tools.proposalGenerator.termsConditions', 'Terms & Conditions')}
          </h2>
          <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentProposal.paymentTerms && (
              <div>
                <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.proposalGenerator.paymentTerms2', 'Payment Terms')}</p>
                <p>{currentProposal.paymentTerms}</p>
              </div>
            )}
            {currentProposal.cancellationPolicy && (
              <div>
                <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.proposalGenerator.cancellationPolicy2', 'Cancellation Policy')}</p>
                <p>{currentProposal.cancellationPolicy}</p>
              </div>
            )}
            {currentProposal.confidentiality && (
              <div>
                <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.proposalGenerator.confidentiality', 'Confidentiality')}</p>
                <p>{currentProposal.confidentiality}</p>
              </div>
            )}
            {currentProposal.additionalTerms && (
              <div>
                <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.proposalGenerator.additionalTerms2', 'Additional Terms')}</p>
                <p>{currentProposal.additionalTerms}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Us */}
      {currentProposal.companyName && (
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Building2 className="w-5 h-5 text-[#0D9488]" />
            {t('tools.proposalGenerator.aboutUs', 'About Us')}
          </h2>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {currentProposal.companyName}
            </h3>
            {currentProposal.companyDescription && (
              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentProposal.companyDescription}
              </p>
            )}
            {currentProposal.credentials && (
              <div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.proposalGenerator.credentialsCertifications2', 'Credentials & Certifications')}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentProposal.credentials}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Case Studies */}
      {currentProposal.caseStudies.length > 0 && (
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Award className="w-5 h-5 text-[#0D9488]" />
            {t('tools.proposalGenerator.caseStudies', 'Case Studies')}
          </h2>
          <div className="grid gap-4">
            {currentProposal.caseStudies.map((cs) => (
              <div key={cs.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{cs.title}</h3>
                <p className={`text-sm ${theme === 'dark' ? t('tools.proposalGenerator.text0d9488', 'text-[#0D9488]') : t('tools.proposalGenerator.text0d94882', 'text-[#0D9488]')}`}>{cs.client}</p>
                {cs.description && (
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{cs.description}</p>
                )}
                {cs.results && (
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="font-medium">{t('tools.proposalGenerator.results', 'Results:')}</span>{cs.results}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Signature */}
      <section className="mb-8">
        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <PenTool className="w-5 h-5 text-[#0D9488]" />
          {t('tools.proposalGenerator.signature', 'Signature')}
        </h2>
        <div className={`p-6 rounded-lg border-2 border-dashed text-center ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
        }`}>
          <p className={`text-2xl mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'cursive' }}>
            {currentProposal.signatureName || 'Signature'}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentProposal.signatureTitle}
          </p>
          {currentProposal.signatureDate && (
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Date: {currentProposal.signatureDate}
            </p>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.proposalGenerator.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[#0D9488]" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.proposalGenerator.proposalGenerator', 'Proposal Generator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.proposalGenerator.createProfessionalBusinessProposals', 'Create professional business proposals')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="proposal-generator" toolName="Proposal Generator" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={theme}
              size="md"
            />
            {proposals.length > 0 && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                disabled={proposals.length === 0}
                showImport={false}
                theme={theme}
              />
            )}
            <button
              onClick={createNewProposal}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.proposalGenerator.newProposal', 'New Proposal')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Saved Proposals */}
          <div className="lg:col-span-1">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.proposalGenerator.savedProposals', 'Saved Proposals')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.proposalGenerator.noSavedProposalsYet', 'No saved proposals yet')}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {proposals.map((proposal) => {
                      const statusConfig = STATUS_CONFIG[proposal.status];
                      return (
                        <div
                          key={proposal.id}
                          onClick={() => loadProposal(proposal)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            currentProposal.id === proposal.id
                              ? 'bg-[#0D9488]/10 border border-[#0D9488]'
                              : theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {proposal.projectTitle || 'Untitled'}
                              </p>
                              <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {proposal.clientName || 'No client'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProposal(proposal.id);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
                              ${statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300' : ''}
                              ${statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                              ${statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                              ${statusConfig.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                              ${statusConfig.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                            `}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Template & Status Selection */}
            <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className={labelClass}>{t('tools.proposalGenerator.template', 'Template')}</label>
                    <select
                      value={currentProposal.template}
                      onChange={(e) => updateProposal('template', e.target.value)}
                      className={inputClass}
                    >
                      {TEMPLATES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className={labelClass}>{t('tools.proposalGenerator.status', 'Status')}</label>
                    <select
                      value={currentProposal.status}
                      onChange={(e) => updateProposal('status', e.target.value as Proposal['status'])}
                      className={inputClass}
                    >
                      {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                        isPreviewMode
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {isPreviewMode ? t('tools.proposalGenerator.edit', 'Edit') : t('tools.proposalGenerator.preview', 'Preview')}
                    </button>
                    <button
                      onClick={copyProposal}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                        copied
                          ? 'bg-green-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? t('tools.proposalGenerator.copied', 'Copied!') : t('tools.proposalGenerator.copy', 'Copy')}
                    </button>
                    <button
                      onClick={saveProposal}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                        saveSuccess
                          ? 'bg-green-500 text-white' : t('tools.proposalGenerator.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                      }`}
                    >
                      {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saveSuccess ? t('tools.proposalGenerator.saved', 'Saved!') : t('tools.proposalGenerator.save', 'Save')}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editor / Preview */}
            {isPreviewMode ? (
              renderPreview()
            ) : (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="pt-6">
                  {/* Section Navigation */}
                  <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeSection === section.id
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {section.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Section Content */}
                  <div className="min-h-[400px]">
                    {renderSectionContent(activeSection)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Section */}
            <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.proposalGenerator.aboutProposalGenerator', 'About Proposal Generator')}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Create professional business proposals with customizable templates. Include client information,
                project scope, deliverables, timelines, pricing options (fixed, hourly, or retainer), terms and conditions,
                company credentials, case studies, and digital signatures. All proposals are automatically saved to your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalGeneratorTool;
