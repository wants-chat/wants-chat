import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollText, Download, Copy, CheckCircle, RefreshCw, Sparkles, Save, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { api } from '../../lib/api';

interface TermsGeneratorToolProps {
  uiConfig?: UIConfig;
}

type ServiceType = 'website' | 'mobile_app' | 'saas' | 'ecommerce' | 'marketplace' | 'subscription';

interface TermsData {
  businessName: string;
  serviceType: ServiceType;
  websiteUrl: string;
  contactEmail: string;
  effectiveDate: string;
  governingLaw: string;
  serviceDescription: string;
  // Account Terms
  accountRequired: boolean;
  minimumAge: string;
  // Payment Terms
  paidService: boolean;
  subscriptionBased: boolean;
  refundPolicy: string;
  freeTrialDays: string;
  // Content
  userGeneratedContent: boolean;
  contentLicense: string;
  // Liability
  liabilityLimit: string;
  warrantyDisclaimer: boolean;
  // Termination
  terminationNotice: string;
  // Additional
  acceptableUse: boolean;
  intellectualProperty: boolean;
  disputeResolution: 'arbitration' | 'court' | 'mediation';
  classActionWaiver: boolean;
}

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'mobile_app', label: 'Mobile Application' },
  { value: 'saas', label: 'SaaS Platform' },
  { value: 'ecommerce', label: 'E-Commerce Store' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'subscription', label: 'Subscription Service' },
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

export default function TermsGeneratorTool({ uiConfig }: TermsGeneratorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [termsData, setTermsData] = useState<TermsData>({
    businessName: '',
    serviceType: 'website',
    websiteUrl: '',
    contactEmail: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    governingLaw: 'California',
    serviceDescription: '',
    accountRequired: true,
    minimumAge: '18',
    paidService: false,
    subscriptionBased: false,
    refundPolicy: '30',
    freeTrialDays: '14',
    userGeneratedContent: false,
    contentLicense: 'non-exclusive',
    liabilityLimit: 'amount paid',
    warrantyDisclaimer: true,
    terminationNotice: '30',
    acceptableUse: true,
    intellectualProperty: true,
    disputeResolution: 'arbitration',
    classActionWaiver: true,
  });

  const [generatedTerms, setGeneratedTerms] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'account' | 'payment' | 'legal'>('basic');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.termsData) {
          setTermsData(prev => ({
            ...prev,
            ...params.termsData,
          }));
          hasPrefill = true;
        }
        // Also check individual fields
        if (params.businessName) {
          setTermsData(prev => ({ ...prev, businessName: params.businessName }));
          hasPrefill = true;
        }
        if (params.serviceType) {
          setTermsData(prev => ({ ...prev, serviceType: params.serviceType }));
          hasPrefill = true;
        }
        if (params.websiteUrl) {
          setTermsData(prev => ({ ...prev, websiteUrl: params.websiteUrl }));
          hasPrefill = true;
        }
        if (params.contactEmail) {
          setTermsData(prev => ({ ...prev, contactEmail: params.contactEmail }));
          hasPrefill = true;
        }
        // Restore the generated terms
        if (params.text) {
          setGeneratedTerms(params.text);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const generateTerms = () => {
    const {
      businessName,
      serviceType,
      websiteUrl,
      contactEmail,
      effectiveDate,
      governingLaw,
      serviceDescription,
      accountRequired,
      minimumAge,
      paidService,
      subscriptionBased,
      refundPolicy,
      freeTrialDays,
      userGeneratedContent,
      contentLicense,
      liabilityLimit,
      warrantyDisclaimer,
      terminationNotice,
      acceptableUse,
      intellectualProperty,
      disputeResolution,
      classActionWaiver,
    } = termsData;

    const effectiveDateStr = effectiveDate
      ? new Date(effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '[EFFECTIVE DATE]';

    const serviceTypeName = SERVICE_TYPES.find(t => t.value === serviceType)?.label || 'service';

    let sectionNum = 1;

    const terms = `
TERMS OF SERVICE

Last Updated: ${effectiveDateStr}

Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the ${serviceTypeName}${websiteUrl ? ` at ${websiteUrl}` : ''} operated by ${businessName || '[COMPANY NAME]'} ("us", "we", or "our").

Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.

By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.

${sectionNum++}. DESCRIPTION OF SERVICE

${serviceDescription || `${businessName || '[COMPANY NAME]'} provides a ${serviceTypeName.toLowerCase()} that allows users to access our services and features.`}

We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice.

${accountRequired ? `${sectionNum++}. ACCOUNTS

When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.

You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.

You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.

You must be at least ${minimumAge} years old to use this Service. By using this Service and by agreeing to these Terms, you warrant and represent that you are at least ${minimumAge} years of age.` : ''}

${acceptableUse ? `${sectionNum++}. ACCEPTABLE USE

You agree not to use the Service:

a) In any way that violates any applicable federal, state, local, or international law or regulation;

b) To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation;

c) To impersonate or attempt to impersonate ${businessName || 'the Company'}, a ${businessName || 'Company'} employee, another user, or any other person or entity;

d) To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm ${businessName || 'the Company'} or users of the Service;

e) To introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful;

f) To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.` : ''}

${userGeneratedContent ? `${sectionNum++}. USER CONTENT

Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("User Content").

You are responsible for the User Content that you post to the Service, including its legality, reliability, and appropriateness.

By posting User Content to the Service, you grant us a ${contentLicense === 'non-exclusive' ? 'non-exclusive, worldwide, royalty-free' : contentLicense === 'exclusive' ? 'exclusive, worldwide, royalty-free' : 'limited, non-exclusive'} license to use, modify, publicly perform, publicly display, reproduce, and distribute such User Content on and through the Service.

You retain any and all of your rights to any User Content you submit, post, or display on or through the Service and you are responsible for protecting those rights.

We have the right but not the obligation to monitor and edit all User Content provided by users.` : ''}

${intellectualProperty ? `${sectionNum++}. INTELLECTUAL PROPERTY

The Service and its original content (excluding User Content provided by users), features, and functionality are and will remain the exclusive property of ${businessName || '[COMPANY NAME]'} and its licensors.

The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.

Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ${businessName || '[COMPANY NAME]'}.` : ''}

${paidService ? `${sectionNum++}. PAYMENTS

${subscriptionBased ? `Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select.

${freeTrialDays ? `We may offer a free trial period of ${freeTrialDays} days. At the end of the free trial period, your payment method will be charged unless you cancel before the end of the trial period.` : ''}

A valid payment method, including credit card, is required to process the payment for your Subscription. You shall provide ${businessName || '[COMPANY NAME]'} with accurate and complete billing information.` : `Certain aspects of the Service may be provided for a fee. You agree to pay all applicable fees as described on the Service.`}

${refundPolicy ? `Refund Policy: You may request a refund within ${refundPolicy} days of your purchase. Refunds are processed at our discretion and may be subject to certain conditions.` : 'All sales are final. No refunds will be issued except as required by applicable law.'}

We reserve the right to change our pricing at any time. We will provide you with reasonable notice of any pricing changes.` : ''}

${sectionNum++}. LINKS TO OTHER WEBSITES

Our Service may contain links to third-party websites or services that are not owned or controlled by ${businessName || '[COMPANY NAME]'}.

${businessName || '[COMPANY NAME]'} has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services.

We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.

${warrantyDisclaimer ? `${sectionNum++}. DISCLAIMER OF WARRANTIES

THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.

${businessName || '[COMPANY NAME]'}, ITS SUBSIDIARIES, AFFILIATES, AND ITS LICENSORS DO NOT WARRANT THAT:
a) THE SERVICE WILL FUNCTION UNINTERRUPTED, SECURE, OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION;
b) ANY ERRORS OR DEFECTS WILL BE CORRECTED;
c) THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS;
d) THE RESULTS OF USING THE SERVICE WILL MEET YOUR REQUIREMENTS.` : ''}

${sectionNum++}. LIMITATION OF LIABILITY

IN NO EVENT SHALL ${(businessName || '[COMPANY NAME]').toUpperCase()}, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:

a) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE;
b) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE;
c) ANY CONTENT OBTAINED FROM THE SERVICE;
d) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.

${liabilityLimit === 'amount paid' ? `IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID ${businessName || '[COMPANY NAME]'} IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED DOLLARS ($100).` : `IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED ${liabilityLimit}.`}

${sectionNum++}. INDEMNIFICATION

You agree to defend, indemnify, and hold harmless ${businessName || '[COMPANY NAME]'} and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of:

a) Your use and access of the Service;
b) Your violation of any term of these Terms;
c) Your violation of any third-party right, including without limitation any copyright, property, or privacy right;
d) Any claim that your User Content caused damage to a third party.

${sectionNum++}. TERMINATION

We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

Upon termination, your right to use the Service will immediately cease.

${terminationNotice ? `If you wish to terminate your account, you may simply discontinue using the Service or provide us with ${terminationNotice} days written notice.` : 'If you wish to terminate your account, you may simply discontinue using the Service.'}

All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.

${sectionNum++}. ${disputeResolution === 'arbitration' ? 'ARBITRATION' : disputeResolution === 'mediation' ? 'MEDIATION' : 'DISPUTE RESOLUTION'}

${disputeResolution === 'arbitration' ? `Any dispute arising from or relating to the subject matter of these Terms shall be finally settled by binding arbitration in ${governingLaw}, using the English language, in accordance with the Arbitration Rules and Procedures of the American Arbitration Association ("AAA").

The arbitrator's award shall be binding and may be entered as a judgment in any court of competent jurisdiction.

${classActionWaiver ? 'CLASS ACTION WAIVER: TO THE EXTENT PERMITTED BY LAW, YOU AND WE AGREE THAT EACH PARTY MAY BRING DISPUTES AGAINST THE OTHER PARTY ONLY IN AN INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.' : ''}` : disputeResolution === 'mediation' ? `Any dispute arising from or relating to the subject matter of these Terms shall first be submitted to non-binding mediation. If mediation is unsuccessful, either party may pursue their claims in a court of competent jurisdiction in ${governingLaw}.` : `Any dispute arising from or relating to the subject matter of these Terms shall be resolved in the courts of ${governingLaw}.`}

${sectionNum++}. GOVERNING LAW

These Terms shall be governed and construed in accordance with the laws of the State of ${governingLaw}, United States, without regard to its conflict of law provisions.

Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.

${sectionNum++}. CHANGES TO TERMS

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.

What constitutes a material change will be determined at our sole discretion.

By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.

${sectionNum++}. SEVERABILITY

If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.

${sectionNum++}. ENTIRE AGREEMENT

These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.

${sectionNum++}. CONTACT US

If you have any questions about these Terms, please contact us:

${businessName || '[COMPANY NAME]'}
Email: ${contactEmail || '[EMAIL]'}
${websiteUrl ? `Website: ${websiteUrl}` : ''}
`.trim();

    setGeneratedTerms(terms);
  };

  const copyToClipboard = async () => {
    if (generatedTerms) {
      await navigator.clipboard.writeText(generatedTerms);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTerms = () => {
    if (generatedTerms) {
      const blob = new Blob([generatedTerms], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `terms_of_service_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSave = async () => {
    if (!generatedTerms) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Terms of Service: ${termsData.businessName || 'Untitled'}`,
        prompt: `Terms of Service for ${termsData.businessName || 'business'}`,
        metadata: {
          text: generatedTerms,
          toolId: 'terms-generator',
          termsData: termsData,
          businessName: termsData.businessName,
          serviceType: termsData.serviceType,
          websiteUrl: termsData.websiteUrl,
          contactEmail: termsData.contactEmail,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setTermsData({
      businessName: '',
      serviceType: 'website',
      websiteUrl: '',
      contactEmail: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      governingLaw: 'California',
      serviceDescription: '',
      accountRequired: true,
      minimumAge: '18',
      paidService: false,
      subscriptionBased: false,
      refundPolicy: '30',
      freeTrialDays: '14',
      userGeneratedContent: false,
      contentLicense: 'non-exclusive',
      liabilityLimit: 'amount paid',
      warrantyDisclaimer: true,
      terminationNotice: '30',
      acceptableUse: true,
      intellectualProperty: true,
      disputeResolution: 'arbitration',
      classActionWaiver: true,
    });
    setGeneratedTerms(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <ScrollText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('tools.termsGenerator.termsOfServiceGenerator', 'Terms of Service Generator')}</h1>
                <p className="text-teal-100 text-sm mt-1">{t('tools.termsGenerator.createComprehensiveTermsOfService', 'Create comprehensive terms of service for your business')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Prefill Indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">
                  {isEditFromGallery
                    ? t('tools.termsGenerator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.termsGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {(['basic', 'account', 'payment', 'legal'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'basic' ? 'Business Info' : tab === 'account' ? 'Account & Content' : tab === 'payment' ? t('tools.termsGenerator.payment', 'Payment') : t('tools.termsGenerator.legal', 'Legal')}
                </button>
              ))}
            </div>

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.termsGenerator.businessName', 'Business Name *')}
                    </label>
                    <input
                      type="text"
                      value={termsData.businessName}
                      onChange={(e) => setTermsData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder={t('tools.termsGenerator.yourCompanyName', 'Your Company Name')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.termsGenerator.serviceType', 'Service Type')}
                    </label>
                    <select
                      value={termsData.serviceType}
                      onChange={(e) => setTermsData(prev => ({ ...prev, serviceType: e.target.value as ServiceType }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    >
                      {SERVICE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.termsGenerator.websiteUrl', 'Website URL')}
                  </label>
                  <input
                    type="url"
                    value={termsData.websiteUrl}
                    onChange={(e) => setTermsData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder={t('tools.termsGenerator.httpsWwwExampleCom', 'https://www.example.com')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.termsGenerator.contactEmail', 'Contact Email *')}
                    </label>
                    <input
                      type="email"
                      value={termsData.contactEmail}
                      onChange={(e) => setTermsData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder={t('tools.termsGenerator.legalExampleCom', 'legal@example.com')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.termsGenerator.effectiveDate', 'Effective Date')}
                    </label>
                    <input
                      type="date"
                      value={termsData.effectiveDate}
                      onChange={(e) => setTermsData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.termsGenerator.serviceDescription', 'Service Description')}
                  </label>
                  <textarea
                    value={termsData.serviceDescription}
                    onChange={(e) => setTermsData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                    placeholder={t('tools.termsGenerator.describeYourService', 'Describe your service...')}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.termsGenerator.governingLawState', 'Governing Law (State)')}
                  </label>
                  <select
                    value={termsData.governingLaw}
                    onChange={(e) => setTermsData(prev => ({ ...prev, governingLaw: e.target.value }))}
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
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.termsGenerator.accountSettings', 'Account Settings')}</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={termsData.accountRequired}
                        onChange={(e) => setTermsData(prev => ({ ...prev, accountRequired: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.termsGenerator.accountRegistrationRequired', 'Account Registration Required')}</span>
                    </label>

                    {termsData.accountRequired && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t('tools.termsGenerator.minimumAge', 'Minimum Age')}
                        </label>
                        <select
                          value={termsData.minimumAge}
                          onChange={(e) => setTermsData(prev => ({ ...prev, minimumAge: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-teal-500`}
                        >
                          <option value="13">13 years</option>
                          <option value="16">16 years</option>
                          <option value="18">18 years</option>
                          <option value="21">21 years</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.termsGenerator.contentSettings', 'Content Settings')}</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={termsData.userGeneratedContent}
                        onChange={(e) => setTermsData(prev => ({ ...prev, userGeneratedContent: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.termsGenerator.allowUserGeneratedContent', 'Allow User-Generated Content')}</span>
                    </label>

                    {termsData.userGeneratedContent && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t('tools.termsGenerator.contentLicenseType', 'Content License Type')}
                        </label>
                        <select
                          value={termsData.contentLicense}
                          onChange={(e) => setTermsData(prev => ({ ...prev, contentLicense: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-teal-500`}
                        >
                          <option value="non-exclusive">{t('tools.termsGenerator.nonExclusiveLicense', 'Non-Exclusive License')}</option>
                          <option value="exclusive">{t('tools.termsGenerator.exclusiveLicense', 'Exclusive License')}</option>
                          <option value="limited">{t('tools.termsGenerator.limitedLicense', 'Limited License')}</option>
                        </select>
                      </div>
                    )}

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={termsData.acceptableUse}
                        onChange={(e) => setTermsData(prev => ({ ...prev, acceptableUse: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.termsGenerator.includeAcceptableUsePolicy', 'Include Acceptable Use Policy')}</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={termsData.intellectualProperty}
                        onChange={(e) => setTermsData(prev => ({ ...prev, intellectualProperty: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.termsGenerator.includeIntellectualPropertySection', 'Include Intellectual Property Section')}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={termsData.paidService}
                      onChange={(e) => setTermsData(prev => ({ ...prev, paidService: e.target.checked }))}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.termsGenerator.paidService', 'Paid Service')}</span>
                  </label>

                  {termsData.paidService && (
                    <div className="space-y-4 pl-8">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={termsData.subscriptionBased}
                          onChange={(e) => setTermsData(prev => ({ ...prev, subscriptionBased: e.target.checked }))}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.termsGenerator.subscriptionBasedBilling', 'Subscription-Based Billing')}</span>
                      </label>

                      {termsData.subscriptionBased && (
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {t('tools.termsGenerator.freeTrialDays', 'Free Trial Days')}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={termsData.freeTrialDays}
                            onChange={(e) => setTermsData(prev => ({ ...prev, freeTrialDays: e.target.value }))}
                            className={`w-32 px-3 py-2 rounded-lg border ${
                              isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-teal-500`}
                          />
                        </div>
                      )}

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t('tools.termsGenerator.refundPolicyDays', 'Refund Policy (days)')}
                        </label>
                        <select
                          value={termsData.refundPolicy}
                          onChange={(e) => setTermsData(prev => ({ ...prev, refundPolicy: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-teal-500`}
                        >
                          <option value="">{t('tools.termsGenerator.noRefunds', 'No Refunds')}</option>
                          <option value="7">7 Days</option>
                          <option value="14">14 Days</option>
                          <option value="30">30 Days</option>
                          <option value="60">60 Days</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.termsGenerator.liabilityWarranty', 'Liability & Warranty')}</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={termsData.warrantyDisclaimer}
                        onChange={(e) => setTermsData(prev => ({ ...prev, warrantyDisclaimer: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.termsGenerator.includeWarrantyDisclaimer', 'Include Warranty Disclaimer')}</span>
                    </label>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {t('tools.termsGenerator.liabilityLimit', 'Liability Limit')}
                      </label>
                      <select
                        value={termsData.liabilityLimit}
                        onChange={(e) => setTermsData(prev => ({ ...prev, liabilityLimit: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-teal-500`}
                      >
                        <option value="amount paid">{t('tools.termsGenerator.amountPaidInLast6', 'Amount Paid in Last 6 Months')}</option>
                        <option value="$100">$100</option>
                        <option value="$500">$500</option>
                        <option value="$1,000">$1,000</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.termsGenerator.disputeResolution', 'Dispute Resolution')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {t('tools.termsGenerator.resolutionMethod', 'Resolution Method')}
                      </label>
                      <select
                        value={termsData.disputeResolution}
                        onChange={(e) => setTermsData(prev => ({ ...prev, disputeResolution: e.target.value as 'arbitration' | 'court' | 'mediation' }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-teal-500`}
                      >
                        <option value="arbitration">{t('tools.termsGenerator.bindingArbitration', 'Binding Arbitration')}</option>
                        <option value="mediation">{t('tools.termsGenerator.mediationFirst', 'Mediation First')}</option>
                        <option value="court">{t('tools.termsGenerator.courtLitigation', 'Court Litigation')}</option>
                      </select>
                    </div>

                    {termsData.disputeResolution === 'arbitration' && (
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={termsData.classActionWaiver}
                          onChange={(e) => setTermsData(prev => ({ ...prev, classActionWaiver: e.target.checked }))}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.termsGenerator.includeClassActionWaiver', 'Include Class Action Waiver')}</span>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.termsGenerator.terminationNoticePeriodDays', 'Termination Notice Period (days)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={termsData.terminationNotice}
                    onChange={(e) => setTermsData(prev => ({ ...prev, terminationNotice: e.target.value }))}
                    className={`w-32 px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generateTerms}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ScrollText className="w-5 h-5" />
                {t('tools.termsGenerator.generateTermsOfService', 'Generate Terms of Service')}
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

            {/* Generated Terms */}
            {generatedTerms && (
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                    Generated Terms of Service
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                      {t('tools.termsGenerator.editable', 'Editable')}
                    </span>
                  </h3>
                  <div className="flex gap-2 items-center">
                    {saveSuccess && (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {t('tools.termsGenerator.saved', 'Saved!')}
                      </span>
                    )}
                    {isSaving && (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t('tools.termsGenerator.saving', 'Saving...')}
                      </span>
                    )}
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
                      {copied ? t('tools.termsGenerator.copied', 'Copied!') : t('tools.termsGenerator.copy', 'Copy')}
                    </button>
                    <button
                      onClick={downloadTerms}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('tools.termsGenerator.download', 'Download')}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-300'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
                      } disabled:opacity-50`}
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.termsGenerator.save', 'Save')}
                    </button>
                  </div>
                </div>
                <textarea
                  value={generatedTerms}
                  onChange={(e) => setGeneratedTerms(e.target.value)}
                  rows={20}
                  className={`w-full text-sm font-mono p-4 rounded-lg border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-y ${
                    isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                  placeholder={t('tools.termsGenerator.generatedTermsWillAppearHere', 'Generated terms will appear here...')}
                />
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>{t('tools.termsGenerator.disclaimer', 'Disclaimer:')}</strong> This terms of service generator creates template documents for reference purposes only.
                Generated terms should be reviewed by a qualified legal professional before publication.
                This is not legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
