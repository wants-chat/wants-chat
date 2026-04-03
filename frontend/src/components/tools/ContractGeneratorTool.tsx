import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Scale,
  Printer,
  Copy,
  Check,
  Save,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  DollarSign,
  FileCheck,
  Download,
  FolderOpen,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface ContractGeneratorToolProps {
  uiConfig?: UIConfig;
}

// Contract types
const contractTypes = [
  { value: 'service_agreement', label: 'Service Agreement', partyALabel: 'Service Provider', partyBLabel: 'Client' },
  { value: 'nda', label: 'Non-Disclosure Agreement (NDA)', partyALabel: 'Disclosing Party', partyBLabel: 'Receiving Party' },
  { value: 'freelance_contract', label: 'Freelance Contract', partyALabel: 'Freelancer', partyBLabel: 'Client' },
  { value: 'employment_agreement', label: 'Employment Agreement', partyALabel: 'Employer', partyBLabel: 'Employee' },
  { value: 'rental_agreement', label: 'Rental Agreement', partyALabel: 'Landlord', partyBLabel: 'Tenant' },
];

// Default clauses per contract type
const defaultClauses: Record<string, { id: string; title: string; content: string; enabled: boolean }[]> = {
  service_agreement: [
    { id: 'scope', title: 'Scope of Services', content: 'The Service Provider agrees to provide the following services to the Client as described in the attached Schedule A or as mutually agreed upon in writing by both parties.', enabled: true },
    { id: 'payment', title: 'Payment Terms', content: 'The Client agrees to pay the Service Provider the agreed-upon fees according to the payment schedule outlined in this agreement. Late payments may be subject to interest charges.', enabled: true },
    { id: 'confidentiality', title: 'Confidentiality', content: 'Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this agreement and shall not disclose such information to third parties without prior written consent.', enabled: true },
    { id: 'termination', title: 'Termination', content: 'Either party may terminate this agreement with written notice as specified in the terms. Upon termination, the Client shall pay for all services rendered up to the termination date.', enabled: true },
    { id: 'liability', title: 'Limitation of Liability', content: 'The Service Provider\'s liability under this agreement shall be limited to the total fees paid by the Client. Neither party shall be liable for indirect, incidental, or consequential damages.', enabled: true },
    { id: 'ip', title: 'Intellectual Property', content: 'Unless otherwise agreed, all intellectual property created during the provision of services shall belong to the Client upon full payment.', enabled: false },
    { id: 'indemnification', title: 'Indemnification', content: 'Each party agrees to indemnify and hold harmless the other party from any claims, damages, or expenses arising from their breach of this agreement.', enabled: false },
  ],
  nda: [
    { id: 'definition', title: 'Definition of Confidential Information', content: 'Confidential Information includes all data, materials, documents, and other information disclosed by the Disclosing Party that is marked as confidential or should reasonably be understood to be confidential.', enabled: true },
    { id: 'obligations', title: 'Obligations of Receiving Party', content: 'The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to third parties without prior written consent; (c) use Confidential Information only for the agreed purpose.', enabled: true },
    { id: 'exclusions', title: 'Exclusions', content: 'Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was known to the Receiving Party prior to disclosure; (c) is independently developed without use of Confidential Information.', enabled: true },
    { id: 'duration', title: 'Duration of Confidentiality', content: 'The obligations of confidentiality shall remain in effect for the period specified in this agreement from the date of disclosure.', enabled: true },
    { id: 'return', title: 'Return of Information', content: 'Upon termination of this agreement or request by the Disclosing Party, the Receiving Party shall return or destroy all Confidential Information and certify such destruction in writing.', enabled: true },
    { id: 'injunctive', title: 'Injunctive Relief', content: 'The parties acknowledge that breach of this agreement may cause irreparable harm and that the Disclosing Party shall be entitled to seek injunctive relief in addition to other remedies.', enabled: false },
  ],
  freelance_contract: [
    { id: 'scope', title: 'Scope of Work', content: 'The Freelancer agrees to perform the services described in this agreement. Any changes to the scope of work must be agreed upon in writing and may result in adjusted fees.', enabled: true },
    { id: 'deliverables', title: 'Deliverables', content: 'The Freelancer shall deliver the completed work according to the timeline specified in this agreement. All deliverables must meet the quality standards agreed upon by both parties.', enabled: true },
    { id: 'compensation', title: 'Compensation', content: 'The Client agrees to pay the Freelancer the agreed-upon rate for services rendered. Payment shall be made according to the schedule outlined in this agreement.', enabled: true },
    { id: 'independent', title: 'Independent Contractor Status', content: 'The Freelancer is an independent contractor and not an employee of the Client. The Freelancer is responsible for their own taxes, insurance, and benefits.', enabled: true },
    { id: 'revisions', title: 'Revisions', content: 'This agreement includes the specified number of revision rounds. Additional revisions beyond this scope may be subject to additional fees.', enabled: true },
    { id: 'ownership', title: 'Ownership of Work', content: 'Upon full payment, all rights to the completed work shall transfer to the Client. Until payment is received, the Freelancer retains all rights.', enabled: true },
    { id: 'cancellation', title: 'Cancellation Policy', content: 'If the Client cancels this project, they shall pay for all work completed to date plus any non-refundable expenses incurred by the Freelancer.', enabled: false },
  ],
  employment_agreement: [
    { id: 'position', title: 'Position and Duties', content: 'The Employee is hired for the position specified in this agreement and agrees to perform all duties associated with this role to the best of their ability.', enabled: true },
    { id: 'compensation', title: 'Compensation and Benefits', content: 'The Employee shall receive the salary and benefits as specified in this agreement, payable according to the Employer\'s standard payroll schedule.', enabled: true },
    { id: 'work_hours', title: 'Work Hours', content: 'The Employee agrees to work the hours specified in this agreement. Overtime may be required and shall be compensated according to applicable laws.', enabled: true },
    { id: 'confidentiality', title: 'Confidentiality', content: 'The Employee agrees to maintain the confidentiality of all proprietary information belonging to the Employer during and after the term of employment.', enabled: true },
    { id: 'non_compete', title: 'Non-Compete Clause', content: 'For the period specified after termination, the Employee agrees not to engage in any business that directly competes with the Employer within the specified geographic area.', enabled: false },
    { id: 'termination', title: 'Termination', content: 'Either party may terminate this employment relationship with the notice period specified in this agreement. Termination for cause may be immediate.', enabled: true },
    { id: 'ip_assignment', title: 'Intellectual Property Assignment', content: 'All work product and inventions created during employment belong exclusively to the Employer.', enabled: true },
  ],
  rental_agreement: [
    { id: 'premises', title: 'Description of Premises', content: 'The Landlord agrees to rent to the Tenant the property described in this agreement for residential/commercial use only.', enabled: true },
    { id: 'term', title: 'Lease Term', content: 'This lease shall begin on the effective date and continue for the period specified, unless terminated earlier according to the terms of this agreement.', enabled: true },
    { id: 'rent', title: 'Rent Payment', content: 'The Tenant agrees to pay the monthly rent amount specified in this agreement, due on the first day of each month. Late payments may be subject to fees.', enabled: true },
    { id: 'deposit', title: 'Security Deposit', content: 'The Tenant shall provide a security deposit as specified. This deposit will be returned within the legally required timeframe after move-out, minus any deductions for damages or unpaid rent.', enabled: true },
    { id: 'maintenance', title: 'Maintenance and Repairs', content: 'The Landlord is responsible for major repairs and maintaining the property in habitable condition. The Tenant is responsible for routine maintenance and keeping the premises clean.', enabled: true },
    { id: 'utilities', title: 'Utilities', content: 'The Tenant is responsible for paying all utilities unless otherwise specified in this agreement.', enabled: true },
    { id: 'pets', title: 'Pet Policy', content: 'Pets are not allowed on the premises unless explicitly approved in writing by the Landlord, subject to additional pet deposit and pet rent.', enabled: false },
    { id: 'subletting', title: 'Subletting', content: 'The Tenant may not sublet the premises or assign this lease without the prior written consent of the Landlord.', enabled: true },
  ],
};

interface PartyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface ContractDetails {
  effectiveDate: string;
  endDate: string;
  description: string;
  paymentAmount: string;
  paymentSchedule: string;
}

interface ClauseItem {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  isCustom?: boolean;
}

interface SavedTemplate {
  id: string;
  name: string;
  contractType: string;
  partyA: PartyInfo;
  partyB: PartyInfo;
  details: ContractDetails;
  clauses: ClauseItem[];
  createdAt: string;
}

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Template Name', type: 'string' },
  { key: 'contractType', header: 'Contract Type', type: 'string' },
  { key: 'partyAName', header: 'Party A Name', type: 'string' },
  { key: 'partyAEmail', header: 'Party A Email', type: 'string' },
  { key: 'partyBName', header: 'Party B Name', type: 'string' },
  { key: 'partyBEmail', header: 'Party B Email', type: 'string' },
  { key: 'effectiveDate', header: 'Effective Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'paymentAmount', header: 'Payment Amount', type: 'string' },
  { key: 'paymentSchedule', header: 'Payment Schedule', type: 'string' },
  { key: 'clauseCount', header: 'Clause Count', type: 'number' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

export const ContractGeneratorTool: React.FC<ContractGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: savedTemplates,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard: copyTemplatesUtil,
    print: printTemplates,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<SavedTemplate>('contract-generator', [], COLUMNS);

  // State
  const [contractType, setContractType] = useState(contractTypes[0]);
  const [partyA, setPartyA] = useState<PartyInfo>({ name: '', address: '', email: '', phone: '' });
  const [partyB, setPartyB] = useState<PartyInfo>({ name: '', address: '', email: '', phone: '' });
  const [details, setDetails] = useState<ContractDetails>({
    effectiveDate: '',
    endDate: '',
    description: '',
    paymentAmount: '',
    paymentSchedule: 'monthly',
  });
  const [clauses, setClauses] = useState<ClauseItem[]>(defaultClauses[contractTypes[0].value]);
  const [customClause, setCustomClause] = useState({ title: '', content: '' });
  const [showAddClause, setShowAddClause] = useState(false);
  const [expandedClauses, setExpandedClauses] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.description || params.title || params.company || params.amount) {
        setDetails(prev => ({
          ...prev,
          description: params.description || params.title || prev.description,
          paymentAmount: params.amount?.toString() || prev.paymentAmount,
        }));
        if (params.company) {
          setPartyB(prev => ({ ...prev, name: params.company || prev.name }));
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);


  // Update clauses when contract type changes
  useEffect(() => {
    setClauses(defaultClauses[contractType.value] || []);
  }, [contractType]);

  const toggleClause = (id: string) => {
    setClauses(clauses.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const toggleExpandClause = (id: string) => {
    setExpandedClauses(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addCustomClause = () => {
    if (!customClause.title || !customClause.content) return;
    const newClause: ClauseItem = {
      id: `custom_${Date.now()}`,
      title: customClause.title,
      content: customClause.content,
      enabled: true,
      isCustom: true,
    };
    setClauses([...clauses, newClause]);
    setCustomClause({ title: '', content: '' });
    setShowAddClause(false);
  };

  const removeCustomClause = (id: string) => {
    setClauses(clauses.filter(c => c.id !== id));
  };

  const updateClauseContent = (id: string, content: string) => {
    setClauses(clauses.map(c => c.id === id ? { ...c, content } : c));
  };

  const generateContract = () => {
    const enabledClauses = clauses.filter(c => c.enabled);
    const selectedType = contractType;

    let contract = `
================================================================================
                              ${selectedType.label.toUpperCase()}
================================================================================

This ${selectedType.label} ("Agreement") is entered into as of ${details.effectiveDate || '[EFFECTIVE DATE]'}

BETWEEN:

${selectedType.partyALabel.toUpperCase()} ("Party A"):
Name: ${partyA.name || '[PARTY A NAME]'}
Address: ${partyA.address || '[PARTY A ADDRESS]'}
Email: ${partyA.email || '[PARTY A EMAIL]'}
Phone: ${partyA.phone || '[PARTY A PHONE]'}

AND

${selectedType.partyBLabel.toUpperCase()} ("Party B"):
Name: ${partyB.name || '[PARTY B NAME]'}
Address: ${partyB.address || '[PARTY B ADDRESS]'}
Email: ${partyB.email || '[PARTY B EMAIL]'}
Phone: ${partyB.phone || '[PARTY B PHONE]'}

--------------------------------------------------------------------------------
                                 AGREEMENT TERMS
--------------------------------------------------------------------------------

TERM OF AGREEMENT:
This Agreement shall commence on ${details.effectiveDate || '[START DATE]'} and shall continue until ${details.endDate || '[END DATE]'}, unless terminated earlier in accordance with the terms herein.

${details.description ? `DESCRIPTION OF SERVICES/WORK:\n${details.description}\n` : ''}
${details.paymentAmount ? `PAYMENT AMOUNT: ${details.paymentAmount}` : ''}
${details.paymentSchedule ? `\nPAYMENT SCHEDULE: ${details.paymentSchedule.charAt(0).toUpperCase() + details.paymentSchedule.slice(1)}` : ''}

--------------------------------------------------------------------------------
                              TERMS AND CONDITIONS
--------------------------------------------------------------------------------

`;

    enabledClauses.forEach((clause, index) => {
      contract += `
${index + 1}. ${clause.title.toUpperCase()}

${clause.content}

`;
    });

    contract += `
--------------------------------------------------------------------------------
                                   SIGNATURES
--------------------------------------------------------------------------------

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.


${selectedType.partyALabel.toUpperCase()}:

Signature: _____________________________

Name: ${partyA.name || '________________________________'}

Date: _________________________________


${selectedType.partyBLabel.toUpperCase()}:

Signature: _____________________________

Name: ${partyB.name || '________________________________'}

Date: _________________________________

================================================================================
                            END OF AGREEMENT
================================================================================
`;

    return contract;
  };

  const handleCopy = async () => {
    const contract = generateContract();
    await navigator.clipboard.writeText(contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const contract = generateContract();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${contractType.label}</title>
            <style>
              body { font-family: 'Courier New', monospace; white-space: pre-wrap; padding: 40px; line-height: 1.6; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>${contract}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const contract = generateContract();
    const blob = new Blob([contract], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractType.label.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveTemplate = () => {
    if (!templateName) return;

    const template: SavedTemplate = {
      id: `template_${Date.now()}`,
      name: templateName,
      contractType: contractType.value,
      partyA,
      partyB,
      details,
      clauses,
      createdAt: new Date().toISOString(),
    };

    addItem(template);
    setTemplateName('');
    setShowSaveDialog(false);
  };

  const loadTemplate = (template: SavedTemplate) => {
    const type = contractTypes.find(t => t.value === template.contractType);
    if (type) setContractType(type);
    setPartyA(template.partyA);
    setPartyB(template.partyB);
    setDetails(template.details);
    setClauses(template.clauses);
    setShowTemplates(false);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteItem(id);
  };

  // Calculate template stats for export
  const templateCount = useMemo(() => savedTemplates.length, [savedTemplates]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 m-4 mb-0 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.contractGenerator.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.contractGenerator.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.contractGenerator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Scale className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractGenerator.contractGenerator', 'Contract Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.contractGenerator.createProfessionalLegalContractsAnd', 'Create professional legal contracts and agreements')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="contract-generator" toolName="Contract Generator" />

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
              onExportCSV={() => exportCSV({ filename: 'contract_templates' })}
              onExportExcel={() => exportExcel({ filename: 'contract_templates' })}
              onExportJSON={() => exportJSON({ filename: 'contract_templates' })}
              onExportPDF={() => exportPDF({
                filename: 'contract_templates',
                title: 'Contract Templates',
                subtitle: `${templateCount} saved templates`
              })}
              onPrint={() => printTemplates('Contract Templates')}
              onCopyToClipboard={() => copyTemplatesUtil('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={savedTemplates.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowTemplates(true)}
              className={`p-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} rounded-lg transition-colors`}
              title={t('tools.contractGenerator.loadTemplate', 'Load Template')}
            >
              <FolderOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className={`p-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} rounded-lg transition-colors`}
              title={t('tools.contractGenerator.saveAsTemplate2', 'Save as Template')}
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Contract Type Selection */}
        <div>
          <label className={labelClass}>{t('tools.contractGenerator.contractType', 'Contract Type')}</label>
          <select
            value={contractType.value}
            onChange={(e) => {
              const type = contractTypes.find(t => t.value === e.target.value);
              if (type) setContractType(type);
            }}
            className={inputClass}
          >
            {contractTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Party Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Party A */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[#0D9488]" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contractType.partyALabel}</h4>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={t('tools.contractGenerator.fullNameCompanyName', 'Full Name / Company Name')}
                value={partyA.name}
                onChange={(e) => setPartyA({ ...partyA, name: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder={t('tools.contractGenerator.address', 'Address')}
                value={partyA.address}
                onChange={(e) => setPartyA({ ...partyA, address: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder={t('tools.contractGenerator.email', 'Email')}
                  value={partyA.email}
                  onChange={(e) => setPartyA({ ...partyA, email: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="tel"
                  placeholder={t('tools.contractGenerator.phone', 'Phone')}
                  value={partyA.phone}
                  onChange={(e) => setPartyA({ ...partyA, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Party B */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[#0D9488]" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contractType.partyBLabel}</h4>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={t('tools.contractGenerator.fullNameCompanyName2', 'Full Name / Company Name')}
                value={partyB.name}
                onChange={(e) => setPartyB({ ...partyB, name: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder={t('tools.contractGenerator.address2', 'Address')}
                value={partyB.address}
                onChange={(e) => setPartyB({ ...partyB, address: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder={t('tools.contractGenerator.email2', 'Email')}
                  value={partyB.email}
                  onChange={(e) => setPartyB({ ...partyB, email: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="tel"
                  placeholder={t('tools.contractGenerator.phone2', 'Phone')}
                  value={partyB.phone}
                  onChange={(e) => setPartyB({ ...partyB, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contract Details */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="w-4 h-4 text-[#0D9488]" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractGenerator.contractDetails', 'Contract Details')}</h4>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {t('tools.contractGenerator.effectiveDate', 'Effective Date')}
                </label>
                <input
                  type="date"
                  value={details.effectiveDate}
                  onChange={(e) => setDetails({ ...details, effectiveDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {t('tools.contractGenerator.endDate', 'End Date')}
                </label>
                <input
                  type="date"
                  value={details.endDate}
                  onChange={(e) => setDetails({ ...details, endDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.contractGenerator.descriptionOfServicesWork', 'Description of Services/Work')}</label>
              <textarea
                value={details.description}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
                placeholder={t('tools.contractGenerator.describeTheServicesWorkOr', 'Describe the services, work, or subject matter of this contract...')}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  {t('tools.contractGenerator.paymentAmount', 'Payment Amount')}
                </label>
                <input
                  type="text"
                  value={details.paymentAmount}
                  onChange={(e) => setDetails({ ...details, paymentAmount: e.target.value })}
                  placeholder={t('tools.contractGenerator.eG5000Or', 'e.g., $5,000 or $50/hour')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.contractGenerator.paymentSchedule', 'Payment Schedule')}</label>
                <select
                  value={details.paymentSchedule}
                  onChange={(e) => setDetails({ ...details, paymentSchedule: e.target.value })}
                  className={inputClass}
                >
                  <option value="upfront">{t('tools.contractGenerator.upfront100', 'Upfront (100%)')}</option>
                  <option value="50-50">50% Upfront, 50% on Completion</option>
                  <option value="milestones">{t('tools.contractGenerator.milestoneBased', 'Milestone-based')}</option>
                  <option value="weekly">{t('tools.contractGenerator.weekly', 'Weekly')}</option>
                  <option value="bi-weekly">{t('tools.contractGenerator.biWeekly', 'Bi-Weekly')}</option>
                  <option value="monthly">{t('tools.contractGenerator.monthly', 'Monthly')}</option>
                  <option value="upon-completion">{t('tools.contractGenerator.uponCompletion', 'Upon Completion')}</option>
                  <option value="net-15">{t('tools.contractGenerator.net15', 'Net 15')}</option>
                  <option value="net-30">{t('tools.contractGenerator.net30', 'Net 30')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Clauses Section */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0D9488]" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractGenerator.contractClauses', 'Contract Clauses')}</h4>
            </div>
            <button
              onClick={() => setShowAddClause(!showAddClause)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.contractGenerator.addClause', 'Add Clause')}
            </button>
          </div>

          {/* Add Custom Clause Form */}
          {showAddClause && (
            <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              <h5 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.contractGenerator.addCustomClause', 'Add Custom Clause')}</h5>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t('tools.contractGenerator.clauseTitle', 'Clause Title')}
                  value={customClause.title}
                  onChange={(e) => setCustomClause({ ...customClause, title: e.target.value })}
                  className={inputClass}
                />
                <textarea
                  placeholder={t('tools.contractGenerator.clauseContent', 'Clause Content')}
                  value={customClause.content}
                  onChange={(e) => setCustomClause({ ...customClause, content: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCustomClause}
                    disabled={!customClause.title || !customClause.content}
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('tools.contractGenerator.addClause2', 'Add Clause')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddClause(false);
                      setCustomClause({ title: '', content: '' });
                    }}
                    className={`px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg transition-colors`}
                  >
                    {t('tools.contractGenerator.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clause List */}
          <div className="space-y-2">
            {clauses.map((clause) => (
              <div
                key={clause.id}
                className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} overflow-hidden`}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clause.enabled}
                        onChange={() => toggleClause(clause.id)}
                        className="sr-only peer"
                      />
                      <div className={`w-9 h-5 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:bg-[#0D9488] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full`}></div>
                    </label>
                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'} ${!clause.enabled && 'opacity-50'}`}>
                      {clause.title}
                      {clause.isCustom && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-[#0D9488]/10 text-[#0D9488] rounded-full">{t('tools.contractGenerator.custom', 'Custom')}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {clause.isCustom && (
                      <button
                        onClick={() => removeCustomClause(clause.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpandClause(clause.id)}
                      className={`p-1 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded transition-colors`}
                    >
                      {expandedClauses.includes(clause.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {expandedClauses.includes(clause.id) && (
                  <div className={`px-3 pb-3 ${!clause.enabled && 'opacity-50'}`}>
                    <textarea
                      value={clause.content}
                      onChange={(e) => updateClauseContent(clause.id, e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'} rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none resize-none`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 min-w-[150px] py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
          >
            <FileText className="w-5 h-5" />
            {t('tools.contractGenerator.previewContract', 'Preview Contract')}
          </button>
          <button
            onClick={handleCopy}
            className={`py-3 px-6 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} font-medium rounded-xl transition-all flex items-center justify-center gap-2`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                {t('tools.contractGenerator.copied', 'Copied!')}
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                {t('tools.contractGenerator.copy', 'Copy')}
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className={`py-3 px-6 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} font-medium rounded-xl transition-all flex items-center justify-center gap-2`}
          >
            <Printer className="w-5 h-5" />
            {t('tools.contractGenerator.print', 'Print')}
          </button>
          <button
            onClick={handleDownload}
            className={`py-3 px-6 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} font-medium rounded-xl transition-all flex items-center justify-center gap-2`}
          >
            <Download className="w-5 h-5" />
            {t('tools.contractGenerator.download', 'Download')}
          </button>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-4xl max-h-[90vh] ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl overflow-hidden flex flex-col`}>
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractGenerator.contractPreview', 'Contract Preview')}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                    title={t('tools.contractGenerator.copy2', 'Copy')}
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handlePrint}
                    className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                    title={t('tools.contractGenerator.print2', 'Print')}
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                    title={t('tools.contractGenerator.download2', 'Download')}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <pre className={`whitespace-pre-wrap font-mono text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} leading-relaxed`}>
                  {generateContract()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Save Template Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractGenerator.saveAsTemplate', 'Save as Template')}</h3>
              <input
                type="text"
                placeholder={t('tools.contractGenerator.templateName', 'Template Name')}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={saveTemplate}
                  disabled={!templateName}
                  className="flex-1 py-2 px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('tools.contractGenerator.save', 'Save')}
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setTemplateName('');
                  }}
                  className={`flex-1 py-2 px-4 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg transition-colors`}
                >
                  {t('tools.contractGenerator.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Dialog */}
        {showTemplates && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-lg max-h-[80vh] ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl overflow-hidden flex flex-col`}>
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractGenerator.savedTemplates', 'Saved Templates')}</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {savedTemplates.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t('tools.contractGenerator.noSavedTemplatesYet', 'No saved templates yet')}</p>
                    <p className="text-sm mt-1">{t('tools.contractGenerator.createAndSaveAContract', 'Create and save a contract template to reuse later')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{template.name}</h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {contractTypes.find(t => t.value === template.contractType)?.label}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(template.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadTemplate(template)}
                              className="px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                            >
                              {t('tools.contractGenerator.load', 'Load')}
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.contractGenerator.aboutContractGenerator', 'About Contract Generator')}
          </h4>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.contractGenerator.createProfessionalLegalContractsWith', 'Create professional legal contracts with customizable clauses. This tool generates contracts for various purposes including service agreements, NDAs, freelance contracts, employment agreements, and rental agreements. Customize clauses, add your own terms, and save templates for future use. Always consult with a legal professional before using any contract for official purposes.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractGeneratorTool;
