import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Copy, CheckCircle, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface ContractTemplateToolProps {
  uiConfig?: UIConfig;
}

type ContractType =
  | 'service_agreement'
  | 'employment_contract'
  | 'independent_contractor'
  | 'lease_agreement'
  | 'sales_contract'
  | 'partnership_agreement'
  | 'consulting_agreement'
  | 'licensing_agreement';

interface ContractClause {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  isIncluded: boolean;
}

interface ContractData {
  contractType: ContractType;
  partyA: {
    name: string;
    address: string;
    email: string;
    representative: string;
  };
  partyB: {
    name: string;
    address: string;
    email: string;
    representative: string;
  };
  effectiveDate: string;
  terminationDate: string;
  governingLaw: string;
  paymentTerms: string;
  description: string;
  customClauses: ContractClause[];
}

const CONTRACT_TYPES: { value: ContractType; label: string; description: string }[] = [
  { value: 'service_agreement', label: 'Service Agreement', description: 'For service providers and clients' },
  { value: 'employment_contract', label: 'Employment Contract', description: 'For employer-employee relationships' },
  { value: 'independent_contractor', label: 'Independent Contractor', description: 'For freelancers and contractors' },
  { value: 'lease_agreement', label: 'Lease Agreement', description: 'For property rental arrangements' },
  { value: 'sales_contract', label: 'Sales Contract', description: 'For buying and selling goods' },
  { value: 'partnership_agreement', label: 'Partnership Agreement', description: 'For business partnerships' },
  { value: 'consulting_agreement', label: 'Consulting Agreement', description: 'For consultants and advisors' },
  { value: 'licensing_agreement', label: 'Licensing Agreement', description: 'For intellectual property licensing' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const getDefaultClauses = (contractType: ContractType): ContractClause[] => {
  const baseClauses: ContractClause[] = [
    { id: '1', title: 'Confidentiality', content: 'Both parties agree to maintain the confidentiality of all proprietary information shared during the term of this agreement.', isRequired: true, isIncluded: true },
    { id: '2', title: 'Indemnification', content: 'Each party agrees to indemnify and hold harmless the other party from any claims, damages, or expenses arising from their breach of this agreement.', isRequired: true, isIncluded: true },
    { id: '3', title: 'Dispute Resolution', content: 'Any disputes arising from this agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.', isRequired: false, isIncluded: true },
    { id: '4', title: 'Force Majeure', content: 'Neither party shall be liable for any failure to perform due to circumstances beyond their reasonable control, including but not limited to acts of God, war, or natural disasters.', isRequired: false, isIncluded: true },
    { id: '5', title: 'Assignment', content: 'Neither party may assign or transfer this agreement without the prior written consent of the other party.', isRequired: false, isIncluded: false },
    { id: '6', title: 'Severability', content: 'If any provision of this agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.', isRequired: true, isIncluded: true },
  ];

  if (contractType === 'employment_contract') {
    baseClauses.push(
      { id: '7', title: 'Non-Compete', content: 'Employee agrees not to engage in any competing business within a radius of [MILES] miles for a period of [MONTHS] months following termination.', isRequired: false, isIncluded: false },
      { id: '8', title: 'Benefits', content: 'Employee shall be entitled to participate in all benefit programs offered by the Company, subject to the terms of such programs.', isRequired: false, isIncluded: true }
    );
  }

  if (contractType === 'independent_contractor') {
    baseClauses.push(
      { id: '9', title: 'Independent Contractor Status', content: 'The Contractor is an independent contractor and not an employee of the Company. The Contractor is responsible for all taxes and insurance.', isRequired: true, isIncluded: true }
    );
  }

  return baseClauses;
};

export default function ContractTemplateTool({ uiConfig }: ContractTemplateToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [contractData, setContractData] = useState<ContractData>({
    contractType: 'service_agreement',
    partyA: { name: '', address: '', email: '', representative: '' },
    partyB: { name: '', address: '', email: '', representative: '' },
    effectiveDate: '',
    terminationDate: '',
    governingLaw: 'California',
    paymentTerms: '',
    description: '',
    customClauses: getDefaultClauses('service_agreement'),
  });

  const [generatedContract, setGeneratedContract] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'parties' | 'terms' | 'clauses'>('parties');

  const handleContractTypeChange = (type: ContractType) => {
    setContractData(prev => ({
      ...prev,
      contractType: type,
      customClauses: getDefaultClauses(type),
    }));
    setGeneratedContract(null);
  };

  const toggleClause = (clauseId: string) => {
    setContractData(prev => ({
      ...prev,
      customClauses: prev.customClauses.map(clause =>
        clause.id === clauseId && !clause.isRequired
          ? { ...clause, isIncluded: !clause.isIncluded }
          : clause
      ),
    }));
  };

  const addCustomClause = () => {
    const newClause: ContractClause = {
      id: Date.now().toString(),
      title: '',
      content: '',
      isRequired: false,
      isIncluded: true,
    };
    setContractData(prev => ({
      ...prev,
      customClauses: [...prev.customClauses, newClause],
    }));
  };

  const updateCustomClause = (clauseId: string, field: 'title' | 'content', value: string) => {
    setContractData(prev => ({
      ...prev,
      customClauses: prev.customClauses.map(clause =>
        clause.id === clauseId ? { ...clause, [field]: value } : clause
      ),
    }));
  };

  const removeCustomClause = (clauseId: string) => {
    setContractData(prev => ({
      ...prev,
      customClauses: prev.customClauses.filter(clause => clause.id !== clauseId || clause.isRequired),
    }));
  };

  const generateContract = () => {
    const { partyA, partyB, effectiveDate, terminationDate, governingLaw, paymentTerms, description, customClauses, contractType } = contractData;

    const contractTypeName = CONTRACT_TYPES.find(t => t.value === contractType)?.label || 'Agreement';
    const includedClauses = customClauses.filter(c => c.isIncluded && c.title && c.content);

    const contract = `
${contractTypeName.toUpperCase()}

This ${contractTypeName} ("Agreement") is entered into as of ${effectiveDate ? new Date(effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[EFFECTIVE DATE]'} by and between:

PARTY A:
${partyA.name || '[PARTY A NAME]'}
${partyA.address || '[PARTY A ADDRESS]'}
Email: ${partyA.email || '[PARTY A EMAIL]'}
Representative: ${partyA.representative || '[PARTY A REPRESENTATIVE]'}

AND

PARTY B:
${partyB.name || '[PARTY B NAME]'}
${partyB.address || '[PARTY B ADDRESS]'}
Email: ${partyB.email || '[PARTY B EMAIL]'}
Representative: ${partyB.representative || '[PARTY B REPRESENTATIVE]'}

RECITALS

WHEREAS, the parties desire to enter into this Agreement to define their respective rights and obligations;

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

1. DESCRIPTION OF SERVICES/GOODS

${description || '[DESCRIPTION OF SERVICES OR GOODS]'}

2. TERM

This Agreement shall commence on the Effective Date and shall continue until ${terminationDate ? new Date(terminationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[TERMINATION DATE]'}, unless earlier terminated in accordance with the provisions of this Agreement.

3. PAYMENT TERMS

${paymentTerms || '[PAYMENT TERMS AND CONDITIONS]'}

${includedClauses.map((clause, index) => `${index + 4}. ${clause.title.toUpperCase()}

${clause.content}`).join('\n\n')}

${includedClauses.length + 4}. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of ${governingLaw}, without regard to its conflicts of law principles.

${includedClauses.length + 5}. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, warranties, and agreements between the parties.

${includedClauses.length + 6}. AMENDMENTS

This Agreement may not be amended or modified except by a written instrument signed by both parties.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

PARTY A:

_________________________________
${partyA.name || '[PARTY A NAME]'}
By: ${partyA.representative || '[AUTHORIZED REPRESENTATIVE]'}
Date: _________________


PARTY B:

_________________________________
${partyB.name || '[PARTY B NAME]'}
By: ${partyB.representative || '[AUTHORIZED REPRESENTATIVE]'}
Date: _________________
`.trim();

    setGeneratedContract(contract);
  };

  const copyToClipboard = async () => {
    if (generatedContract) {
      await navigator.clipboard.writeText(generatedContract);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadContract = () => {
    if (generatedContract) {
      const blob = new Blob([generatedContract], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contractData.contractType}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const reset = () => {
    setContractData({
      contractType: 'service_agreement',
      partyA: { name: '', address: '', email: '', representative: '' },
      partyB: { name: '', address: '', email: '', representative: '' },
      effectiveDate: '',
      terminationDate: '',
      governingLaw: 'California',
      paymentTerms: '',
      description: '',
      customClauses: getDefaultClauses('service_agreement'),
    });
    setGeneratedContract(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('tools.contractTemplate.contractTemplateGenerator', 'Contract Template Generator')}</h1>
                <p className="text-teal-100 text-sm mt-1">{t('tools.contractTemplate.createProfessionalLegalContractsWith', 'Create professional legal contracts with customizable clauses')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Contract Type Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.contractTemplate.contractType', 'Contract Type')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {CONTRACT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleContractTypeChange(type.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      contractData.contractType === type.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                        : isDark
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`font-medium text-sm ${
                      contractData.contractType === type.value
                        ? 'text-teal-700 dark:text-teal-300'
                        : isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {(['parties', 'terms', 'clauses'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'parties' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Party A */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractTemplate.partyAFirstParty', 'Party A (First Party)')}</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('tools.contractTemplate.companyIndividualName', 'Company/Individual Name')}
                      value={contractData.partyA.name}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyA: { ...prev.partyA, name: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.contractTemplate.address', 'Address')}
                      value={contractData.partyA.address}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyA: { ...prev.partyA, address: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                    <input
                      type="email"
                      placeholder={t('tools.contractTemplate.email', 'Email')}
                      value={contractData.partyA.email}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyA: { ...prev.partyA, email: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.contractTemplate.authorizedRepresentative', 'Authorized Representative')}
                      value={contractData.partyA.representative}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyA: { ...prev.partyA, representative: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </div>

                {/* Party B */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractTemplate.partyBSecondParty', 'Party B (Second Party)')}</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('tools.contractTemplate.companyIndividualName2', 'Company/Individual Name')}
                      value={contractData.partyB.name}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyB: { ...prev.partyB, name: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.contractTemplate.address2', 'Address')}
                      value={contractData.partyB.address}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyB: { ...prev.partyB, address: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                    <input
                      type="email"
                      placeholder={t('tools.contractTemplate.email2', 'Email')}
                      value={contractData.partyB.email}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyB: { ...prev.partyB, email: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.contractTemplate.authorizedRepresentative2', 'Authorized Representative')}
                      value={contractData.partyB.representative}
                      onChange={(e) => setContractData(prev => ({ ...prev, partyB: { ...prev.partyB, representative: e.target.value } }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.contractTemplate.effectiveDate', 'Effective Date')}
                    </label>
                    <input
                      type="date"
                      value={contractData.effectiveDate}
                      onChange={(e) => setContractData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.contractTemplate.terminationDate', 'Termination Date')}
                    </label>
                    <input
                      type="date"
                      value={contractData.terminationDate}
                      onChange={(e) => setContractData(prev => ({ ...prev, terminationDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.contractTemplate.governingLawState', 'Governing Law (State)')}
                  </label>
                  <select
                    value={contractData.governingLaw}
                    onChange={(e) => setContractData(prev => ({ ...prev, governingLaw: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  >
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.contractTemplate.descriptionOfServicesGoods', 'Description of Services/Goods')}
                  </label>
                  <textarea
                    value={contractData.description}
                    onChange={(e) => setContractData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('tools.contractTemplate.describeTheServicesOrGoods', 'Describe the services or goods covered by this contract...')}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.contractTemplate.paymentTerms', 'Payment Terms')}
                  </label>
                  <textarea
                    value={contractData.paymentTerms}
                    onChange={(e) => setContractData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder={t('tools.contractTemplate.specifyPaymentAmountsScheduleAnd', 'Specify payment amounts, schedule, and conditions...')}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'clauses' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractTemplate.contractClauses', 'Contract Clauses')}</h3>
                  <button
                    onClick={addCustomClause}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.contractTemplate.addClause', 'Add Clause')}
                  </button>
                </div>

                <div className="space-y-3">
                  {contractData.customClauses.map((clause) => (
                    <div
                      key={clause.id}
                      className={`p-4 rounded-lg border ${
                        clause.isIncluded
                          ? isDark ? 'border-teal-500/50 bg-teal-900/20' : 'border-teal-200 bg-teal-50'
                          : isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={clause.isIncluded}
                          onChange={() => toggleClause(clause.id)}
                          disabled={clause.isRequired}
                          className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div className="flex-1">
                          {clause.isRequired ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {clause.title}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 rounded">
                                  {t('tools.contractTemplate.required', 'Required')}
                                </span>
                              </div>
                              <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {clause.content}
                              </p>
                            </>
                          ) : (
                            <>
                              <input
                                type="text"
                                value={clause.title}
                                onChange={(e) => updateCustomClause(clause.id, 'title', e.target.value)}
                                placeholder={t('tools.contractTemplate.clauseTitle', 'Clause Title')}
                                className={`w-full px-2 py-1 rounded border text-sm font-medium ${
                                  isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                              <textarea
                                value={clause.content}
                                onChange={(e) => updateCustomClause(clause.id, 'content', e.target.value)}
                                placeholder={t('tools.contractTemplate.clauseContent', 'Clause content...')}
                                rows={2}
                                className={`w-full mt-2 px-2 py-1 rounded border text-sm ${
                                  isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </>
                          )}
                        </div>
                        {!clause.isRequired && (
                          <button
                            onClick={() => removeCustomClause(clause.id)}
                            className="p-1 text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generateContract}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                {t('tools.contractTemplate.generateContract', 'Generate Contract')}
              </button>
              <button
                onClick={reset}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Contract */}
            {generatedContract && (
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractTemplate.generatedContract', 'Generated Contract')}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        copied
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : isDark
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? t('tools.contractTemplate.copied', 'Copied!') : t('tools.contractTemplate.copy', 'Copy')}
                    </button>
                    <button
                      onClick={downloadContract}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('tools.contractTemplate.download', 'Download')}
                    </button>
                  </div>
                </div>
                <pre className={`whitespace-pre-wrap text-sm font-mono p-4 rounded-lg max-h-96 overflow-y-auto ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}>
                  {generatedContract}
                </pre>
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>{t('tools.contractTemplate.disclaimer', 'Disclaimer:')}</strong> This tool generates template contracts for reference purposes only.
                Generated contracts should be reviewed by a qualified legal professional before use.
                This is not legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
