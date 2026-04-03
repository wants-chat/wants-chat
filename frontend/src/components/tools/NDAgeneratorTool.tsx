import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Download, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface NdaGeneratorToolProps {
  uiConfig?: UIConfig;
}

type NDAType = 'unilateral' | 'bilateral' | 'multilateral';
type NDAScope = 'general' | 'employment' | 'business' | 'technology' | 'investor';

interface NDAData {
  ndaType: NDAType;
  scope: NDAScope;
  disclosingParty: {
    name: string;
    address: string;
    representative: string;
  };
  receivingParty: {
    name: string;
    address: string;
    representative: string;
  };
  effectiveDate: string;
  duration: string;
  durationUnit: 'months' | 'years';
  governingLaw: string;
  purpose: string;
  confidentialInfo: string[];
  exclusions: string[];
  returnRequirement: boolean;
  injunctiveRelief: boolean;
  nonSolicitation: boolean;
  nonCompete: boolean;
  nonCompeteDuration: string;
}

const NDA_TYPES: { value: NDAType; label: string; description: string }[] = [
  { value: 'unilateral', label: 'Unilateral (One-Way)', description: 'One party discloses, one receives' },
  { value: 'bilateral', label: 'Bilateral (Mutual)', description: 'Both parties share confidential info' },
  { value: 'multilateral', label: 'Multilateral', description: 'Three or more parties involved' },
];

const NDA_SCOPES: { value: NDAScope; label: string }[] = [
  { value: 'general', label: 'General Business' },
  { value: 'employment', label: 'Employment/HR' },
  { value: 'business', label: 'Business Partnership' },
  { value: 'technology', label: 'Technology/Software' },
  { value: 'investor', label: 'Investor/Fundraising' },
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

const DEFAULT_CONFIDENTIAL_INFO = [
  'Trade secrets and proprietary information',
  'Business strategies and plans',
  'Financial information and projections',
  'Customer and supplier lists',
  'Technical data and specifications',
  'Marketing strategies and data',
  'Personnel information',
];

const DEFAULT_EXCLUSIONS = [
  'Information already in the public domain',
  'Information known to the receiving party prior to disclosure',
  'Information independently developed by the receiving party',
  'Information obtained from a third party without breach of confidentiality',
  'Information required to be disclosed by law or court order',
];

export default function NdaGeneratorTool({ uiConfig }: NdaGeneratorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ndaData, setNdaData] = useState<NDAData>({
    ndaType: 'bilateral',
    scope: 'general',
    disclosingParty: { name: '', address: '', representative: '' },
    receivingParty: { name: '', address: '', representative: '' },
    effectiveDate: '',
    duration: '2',
    durationUnit: 'years',
    governingLaw: 'California',
    purpose: '',
    confidentialInfo: [...DEFAULT_CONFIDENTIAL_INFO],
    exclusions: [...DEFAULT_EXCLUSIONS],
    returnRequirement: true,
    injunctiveRelief: true,
    nonSolicitation: false,
    nonCompete: false,
    nonCompeteDuration: '12',
  });

  const [generatedNDA, setGeneratedNDA] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newConfidentialItem, setNewConfidentialItem] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const addConfidentialInfo = () => {
    if (newConfidentialItem.trim()) {
      setNdaData(prev => ({
        ...prev,
        confidentialInfo: [...prev.confidentialInfo, newConfidentialItem.trim()],
      }));
      setNewConfidentialItem('');
    }
  };

  const removeConfidentialInfo = (index: number) => {
    setNdaData(prev => ({
      ...prev,
      confidentialInfo: prev.confidentialInfo.filter((_, i) => i !== index),
    }));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setNdaData(prev => ({
        ...prev,
        exclusions: [...prev.exclusions, newExclusion.trim()],
      }));
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    setNdaData(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index),
    }));
  };

  const generateNDA = () => {
    const { disclosingParty, receivingParty, effectiveDate, duration, durationUnit, governingLaw, purpose, confidentialInfo, exclusions, ndaType, returnRequirement, injunctiveRelief, nonSolicitation, nonCompete, nonCompeteDuration } = ndaData;

    const isMutual = ndaType === 'bilateral' || ndaType === 'multilateral';
    const effectiveDateStr = effectiveDate
      ? new Date(effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '[EFFECTIVE DATE]';

    const nda = `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${effectiveDateStr} (the "Effective Date") by and between:

${isMutual ? 'PARTY A:' : 'DISCLOSING PARTY:'}
${disclosingParty.name || '[PARTY A NAME]'}
Address: ${disclosingParty.address || '[PARTY A ADDRESS]'}
Representative: ${disclosingParty.representative || '[PARTY A REPRESENTATIVE]'}

AND

${isMutual ? 'PARTY B:' : 'RECEIVING PARTY:'}
${receivingParty.name || '[PARTY B NAME]'}
Address: ${receivingParty.address || '[PARTY B ADDRESS]'}
Representative: ${receivingParty.representative || '[PARTY B REPRESENTATIVE]'}

${isMutual ? '(Each a "Party" and collectively the "Parties")' : '(collectively, the "Parties")'}

RECITALS

WHEREAS, ${isMutual ? 'the Parties wish to explore a potential business relationship and, in connection therewith, may disclose to each other certain confidential and proprietary information' : 'the Disclosing Party possesses certain confidential and proprietary information that it may disclose to the Receiving Party'};

${purpose ? `WHEREAS, the purpose of this disclosure is: ${purpose};` : 'WHEREAS, the Parties wish to protect the confidentiality of such information;'}

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION

"Confidential Information" means any and all information or data, whether oral, written, electronic, or visual, that is disclosed by ${isMutual ? 'either Party (the "Disclosing Party") to the other Party (the "Receiving Party")' : 'the Disclosing Party to the Receiving Party'}, including but not limited to:

${confidentialInfo.map((item, index) => `   ${String.fromCharCode(97 + index)}) ${item}`).join('\n')}

Confidential Information includes any copies, analyses, compilations, studies, or other documents prepared by ${isMutual ? 'either Party' : 'the Receiving Party'} that contain or reflect the Confidential Information.

2. EXCLUSIONS FROM CONFIDENTIAL INFORMATION

Confidential Information does not include information that:

${exclusions.map((item, index) => `   ${String.fromCharCode(97 + index)}) ${item}`).join('\n')}

3. OBLIGATIONS OF ${isMutual ? 'THE PARTIES' : 'RECEIVING PARTY'}

${isMutual ? 'Each Party' : 'The Receiving Party'} agrees to:

   a) Hold the Confidential Information in strict confidence;
   b) Not disclose the Confidential Information to any third party without prior written consent;
   c) Use the Confidential Information solely for the purposes contemplated by this Agreement;
   d) Take reasonable measures to protect the secrecy of the Confidential Information, at least equivalent to the measures taken to protect its own confidential information;
   e) Limit access to the Confidential Information to those employees, agents, or representatives who have a need to know and who are bound by confidentiality obligations at least as protective as this Agreement.

4. TERM

This Agreement shall remain in effect for a period of ${duration} ${durationUnit} from the Effective Date. The obligations of confidentiality shall survive the termination or expiration of this Agreement for a period of ${duration} ${durationUnit}.

${returnRequirement ? `5. RETURN OF MATERIALS

Upon termination of this Agreement or upon request by ${isMutual ? 'either Party' : 'the Disclosing Party'}, ${isMutual ? 'the other Party' : 'the Receiving Party'} shall promptly return or destroy all Confidential Information, including all copies, notes, and derivative materials, and shall certify in writing that such return or destruction has been completed.` : ''}

${injunctiveRelief ? `${returnRequirement ? '6' : '5'}. INJUNCTIVE RELIEF

${isMutual ? 'Each Party' : 'The Receiving Party'} acknowledges that any unauthorized disclosure of Confidential Information may cause irreparable harm to ${isMutual ? 'the other Party' : 'the Disclosing Party'}, and that monetary damages may be inadequate. Therefore, ${isMutual ? 'either Party' : 'the Disclosing Party'} shall be entitled to seek injunctive relief, in addition to any other remedies available at law or in equity.` : ''}

${nonSolicitation ? `${returnRequirement && injunctiveRelief ? '7' : returnRequirement || injunctiveRelief ? '6' : '5'}. NON-SOLICITATION

${isMutual ? 'Neither Party' : 'The Receiving Party'} shall, during the term of this Agreement and for a period of ${nonCompeteDuration} months thereafter, directly or indirectly solicit, hire, or engage any employee, contractor, or consultant of ${isMutual ? 'the other Party' : 'the Disclosing Party'} without prior written consent.` : ''}

${nonCompete ? `${(() => {
  let num = 5;
  if (returnRequirement) num++;
  if (injunctiveRelief) num++;
  if (nonSolicitation) num++;
  return num;
})()}. NON-COMPETE

${isMutual ? 'Neither Party' : 'The Receiving Party'} agrees that during the term of this Agreement and for a period of ${nonCompeteDuration} months thereafter, it shall not engage in any business activity that directly competes with the business of ${isMutual ? 'the other Party' : 'the Disclosing Party'}, within the same geographic area.` : ''}

${(() => {
  let num = 5;
  if (returnRequirement) num++;
  if (injunctiveRelief) num++;
  if (nonSolicitation) num++;
  if (nonCompete) num++;
  return num;
})()}. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of ${governingLaw}, without regard to its conflicts of law principles.

${(() => {
  let num = 6;
  if (returnRequirement) num++;
  if (injunctiveRelief) num++;
  if (nonSolicitation) num++;
  if (nonCompete) num++;
  return num;
})()}. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, warranties, and agreements between the Parties.

${(() => {
  let num = 7;
  if (returnRequirement) num++;
  if (injunctiveRelief) num++;
  if (nonSolicitation) num++;
  if (nonCompete) num++;
  return num;
})()}. AMENDMENTS

This Agreement may not be amended or modified except by a written instrument signed by both Parties.

${(() => {
  let num = 8;
  if (returnRequirement) num++;
  if (injunctiveRelief) num++;
  if (nonSolicitation) num++;
  if (nonCompete) num++;
  return num;
})()}. SEVERABILITY

If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

IN WITNESS WHEREOF, the Parties have executed this Non-Disclosure Agreement as of the date first above written.

${isMutual ? 'PARTY A:' : 'DISCLOSING PARTY:'}

_________________________________
${disclosingParty.name || '[NAME]'}
By: ${disclosingParty.representative || '[AUTHORIZED REPRESENTATIVE]'}
Date: _________________


${isMutual ? 'PARTY B:' : 'RECEIVING PARTY:'}

_________________________________
${receivingParty.name || '[NAME]'}
By: ${receivingParty.representative || '[AUTHORIZED REPRESENTATIVE]'}
Date: _________________
`.trim();

    setGeneratedNDA(nda);
  };

  const copyToClipboard = async () => {
    if (generatedNDA) {
      await navigator.clipboard.writeText(generatedNDA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadNDA = () => {
    if (generatedNDA) {
      const blob = new Blob([generatedNDA], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NDA_${ndaData.ndaType}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const reset = () => {
    setNdaData({
      ndaType: 'bilateral',
      scope: 'general',
      disclosingParty: { name: '', address: '', representative: '' },
      receivingParty: { name: '', address: '', representative: '' },
      effectiveDate: '',
      duration: '2',
      durationUnit: 'years',
      governingLaw: 'California',
      purpose: '',
      confidentialInfo: [...DEFAULT_CONFIDENTIAL_INFO],
      exclusions: [...DEFAULT_EXCLUSIONS],
      returnRequirement: true,
      injunctiveRelief: true,
      nonSolicitation: false,
      nonCompete: false,
      nonCompeteDuration: '12',
    });
    setGeneratedNDA(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('tools.nDAgenerator.ndaGenerator', 'NDA Generator')}</h1>
                <p className="text-teal-100 text-sm mt-1">{t('tools.nDAgenerator.createProfessionalNonDisclosureAgreements', 'Create professional non-disclosure agreements')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* NDA Type Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.nDAgenerator.ndaType', 'NDA Type')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {NDA_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setNdaData(prev => ({ ...prev, ndaType: type.value }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      ndaData.ndaType === type.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                        : isDark
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`font-medium ${
                      ndaData.ndaType === type.value
                        ? 'text-teal-700 dark:text-teal-300'
                        : isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </div>
                    <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.nDAgenerator.ndaScope', 'NDA Scope')}
              </label>
              <select
                value={ndaData.scope}
                onChange={(e) => setNdaData(prev => ({ ...prev, scope: e.target.value as NDAScope }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500`}
              >
                {NDA_SCOPES.map((scope) => (
                  <option key={scope.value} value={scope.value}>{scope.label}</option>
                ))}
              </select>
            </div>

            {/* Party Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Party A / Disclosing Party */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {ndaData.ndaType === 'unilateral' ? t('tools.nDAgenerator.disclosingParty', 'Disclosing Party') : t('tools.nDAgenerator.partyA', 'Party A')}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('tools.nDAgenerator.companyIndividualName', 'Company/Individual Name')}
                    value={ndaData.disclosingParty.name}
                    onChange={(e) => setNdaData(prev => ({
                      ...prev,
                      disclosingParty: { ...prev.disclosingParty, name: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.nDAgenerator.address', 'Address')}
                    value={ndaData.disclosingParty.address}
                    onChange={(e) => setNdaData(prev => ({
                      ...prev,
                      disclosingParty: { ...prev.disclosingParty, address: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.nDAgenerator.authorizedRepresentative', 'Authorized Representative')}
                    value={ndaData.disclosingParty.representative}
                    onChange={(e) => setNdaData(prev => ({
                      ...prev,
                      disclosingParty: { ...prev.disclosingParty, representative: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>

              {/* Party B / Receiving Party */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {ndaData.ndaType === 'unilateral' ? t('tools.nDAgenerator.receivingParty', 'Receiving Party') : t('tools.nDAgenerator.partyB', 'Party B')}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('tools.nDAgenerator.companyIndividualName2', 'Company/Individual Name')}
                    value={ndaData.receivingParty.name}
                    onChange={(e) => setNdaData(prev => ({
                      ...prev,
                      receivingParty: { ...prev.receivingParty, name: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.nDAgenerator.address2', 'Address')}
                    value={ndaData.receivingParty.address}
                    onChange={(e) => setNdaData(prev => ({
                      ...prev,
                      receivingParty: { ...prev.receivingParty, address: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.nDAgenerator.authorizedRepresentative2', 'Authorized Representative')}
                    value={ndaData.receivingParty.representative}
                    onChange={(e) => setNdaData(prev => ({
                      ...prev,
                      receivingParty: { ...prev.receivingParty, representative: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.nDAgenerator.effectiveDate', 'Effective Date')}
                </label>
                <input
                  type="date"
                  value={ndaData.effectiveDate}
                  onChange={(e) => setNdaData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.nDAgenerator.duration', 'Duration')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={ndaData.duration}
                    onChange={(e) => setNdaData(prev => ({ ...prev, duration: e.target.value }))}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                  <select
                    value={ndaData.durationUnit}
                    onChange={(e) => setNdaData(prev => ({ ...prev, durationUnit: e.target.value as 'months' | 'years' }))}
                    className={`px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="months">{t('tools.nDAgenerator.months', 'Months')}</option>
                    <option value="years">{t('tools.nDAgenerator.years', 'Years')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.nDAgenerator.governingLaw', 'Governing Law')}
                </label>
                <select
                  value={ndaData.governingLaw}
                  onChange={(e) => setNdaData(prev => ({ ...prev, governingLaw: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                >
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.nDAgenerator.purposeOfDisclosure', 'Purpose of Disclosure')}
              </label>
              <textarea
                value={ndaData.purpose}
                onChange={(e) => setNdaData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder={t('tools.nDAgenerator.describeThePurposeOfSharing', 'Describe the purpose of sharing confidential information...')}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500`}
              />
            </div>

            {/* Confidential Information */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.nDAgenerator.confidentialInformationTypes', 'Confidential Information Types')}
              </label>
              <div className="space-y-2 mb-3">
                {ndaData.confidentialInfo.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                    <button
                      onClick={() => removeConfidentialInfo(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      {t('tools.nDAgenerator.remove', 'Remove')}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConfidentialItem}
                  onChange={(e) => setNewConfidentialItem(e.target.value)}
                  placeholder={t('tools.nDAgenerator.addConfidentialInformationType', 'Add confidential information type...')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                  onKeyPress={(e) => e.key === 'Enter' && addConfidentialInfo()}
                />
                <button
                  onClick={addConfidentialInfo}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  {t('tools.nDAgenerator.add', 'Add')}
                </button>
              </div>
            </div>

            {/* Additional Options */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nDAgenerator.additionalClauses', 'Additional Clauses')}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ndaData.returnRequirement}
                    onChange={(e) => setNdaData(prev => ({ ...prev, returnRequirement: e.target.checked }))}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.nDAgenerator.returnOfMaterials', 'Return of Materials')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ndaData.injunctiveRelief}
                    onChange={(e) => setNdaData(prev => ({ ...prev, injunctiveRelief: e.target.checked }))}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.nDAgenerator.injunctiveRelief', 'Injunctive Relief')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ndaData.nonSolicitation}
                    onChange={(e) => setNdaData(prev => ({ ...prev, nonSolicitation: e.target.checked }))}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.nDAgenerator.nonSolicitation', 'Non-Solicitation')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ndaData.nonCompete}
                    onChange={(e) => setNdaData(prev => ({ ...prev, nonCompete: e.target.checked }))}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.nDAgenerator.nonCompete', 'Non-Compete')}</span>
                </label>
              </div>
              {(ndaData.nonSolicitation || ndaData.nonCompete) && (
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.nDAgenerator.nonCompeteNonSolicitationDuration', 'Non-Compete/Non-Solicitation Duration (months)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ndaData.nonCompeteDuration}
                    onChange={(e) => setNdaData(prev => ({ ...prev, nonCompeteDuration: e.target.value }))}
                    className={`w-32 px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generateNDA}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                {t('tools.nDAgenerator.generateNda', 'Generate NDA')}
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

            {/* Generated NDA */}
            {generatedNDA && (
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nDAgenerator.generatedNda', 'Generated NDA')}</h3>
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
                      {copied ? t('tools.nDAgenerator.copied', 'Copied!') : t('tools.nDAgenerator.copy', 'Copy')}
                    </button>
                    <button
                      onClick={downloadNDA}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('tools.nDAgenerator.download', 'Download')}
                    </button>
                  </div>
                </div>
                <pre className={`whitespace-pre-wrap text-sm font-mono p-4 rounded-lg max-h-96 overflow-y-auto ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}>
                  {generatedNDA}
                </pre>
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>{t('tools.nDAgenerator.disclaimer', 'Disclaimer:')}</strong> This NDA generator creates template documents for reference purposes only.
                Generated NDAs should be reviewed by a qualified legal professional before execution.
                This is not legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
