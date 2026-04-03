import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Download, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface PrivacyPolicyGeneratorToolProps {
  uiConfig?: UIConfig;
}

type BusinessType = 'website' | 'mobile_app' | 'saas' | 'ecommerce' | 'social_platform';

interface PolicyData {
  businessName: string;
  businessType: BusinessType;
  websiteUrl: string;
  contactEmail: string;
  contactAddress: string;
  effectiveDate: string;
  dataCollected: {
    personalInfo: boolean;
    contactInfo: boolean;
    paymentInfo: boolean;
    locationData: boolean;
    deviceInfo: boolean;
    cookiesTracking: boolean;
    socialMediaData: boolean;
    usageData: boolean;
    userContent: boolean;
  };
  dataPurposes: {
    serviceProvision: boolean;
    communication: boolean;
    marketing: boolean;
    analytics: boolean;
    personalization: boolean;
    security: boolean;
    legal: boolean;
  };
  thirdPartySharing: boolean;
  thirdParties: string[];
  internationalTransfer: boolean;
  childrenData: boolean;
  childrenAgeLimit: string;
  dataRetention: string;
  userRights: {
    access: boolean;
    rectification: boolean;
    erasure: boolean;
    portability: boolean;
    optOut: boolean;
    withdraw: boolean;
  };
  gdprCompliance: boolean;
  ccpaCompliance: boolean;
  cookiePolicy: boolean;
  securityMeasures: string;
}

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'mobile_app', label: 'Mobile Application' },
  { value: 'saas', label: 'SaaS Platform' },
  { value: 'ecommerce', label: 'E-Commerce Store' },
  { value: 'social_platform', label: 'Social Media Platform' },
];

const COMMON_THIRD_PARTIES = [
  'Google Analytics',
  'Facebook Pixel',
  'Stripe (Payments)',
  'PayPal',
  'Mailchimp',
  'SendGrid',
  'AWS',
  'Cloudflare',
  'Intercom',
  'Zendesk',
  'HubSpot',
  'Salesforce',
];

export default function PrivacyPolicyGeneratorTool({ uiConfig }: PrivacyPolicyGeneratorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [policyData, setPolicyData] = useState<PolicyData>({
    businessName: '',
    businessType: 'website',
    websiteUrl: '',
    contactEmail: '',
    contactAddress: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    dataCollected: {
      personalInfo: true,
      contactInfo: true,
      paymentInfo: false,
      locationData: false,
      deviceInfo: true,
      cookiesTracking: true,
      socialMediaData: false,
      usageData: true,
      userContent: false,
    },
    dataPurposes: {
      serviceProvision: true,
      communication: true,
      marketing: false,
      analytics: true,
      personalization: false,
      security: true,
      legal: true,
    },
    thirdPartySharing: true,
    thirdParties: ['Google Analytics'],
    internationalTransfer: false,
    childrenData: false,
    childrenAgeLimit: '13',
    dataRetention: '2 years',
    userRights: {
      access: true,
      rectification: true,
      erasure: true,
      portability: true,
      optOut: true,
      withdraw: true,
    },
    gdprCompliance: false,
    ccpaCompliance: false,
    cookiePolicy: true,
    securityMeasures: 'SSL encryption, secure servers, access controls, and regular security audits',
  });

  const [generatedPolicy, setGeneratedPolicy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'data' | 'sharing' | 'rights'>('basic');

  const toggleThirdParty = (party: string) => {
    setPolicyData(prev => ({
      ...prev,
      thirdParties: prev.thirdParties.includes(party)
        ? prev.thirdParties.filter(p => p !== party)
        : [...prev.thirdParties, party],
    }));
  };

  const generatePolicy = () => {
    const {
      businessName,
      businessType,
      websiteUrl,
      contactEmail,
      contactAddress,
      effectiveDate,
      dataCollected,
      dataPurposes,
      thirdPartySharing,
      thirdParties,
      internationalTransfer,
      childrenData,
      childrenAgeLimit,
      dataRetention,
      userRights,
      gdprCompliance,
      ccpaCompliance,
      cookiePolicy,
      securityMeasures,
    } = policyData;

    const effectiveDateStr = effectiveDate
      ? new Date(effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '[EFFECTIVE DATE]';

    const businessTypeName = BUSINESS_TYPES.find(t => t.value === businessType)?.label || 'service';

    const dataCollectedList = [];
    if (dataCollected.personalInfo) dataCollectedList.push('Personal identification information (name, email address, phone number)');
    if (dataCollected.contactInfo) dataCollectedList.push('Contact information and mailing address');
    if (dataCollected.paymentInfo) dataCollectedList.push('Payment and billing information (credit card numbers, billing address)');
    if (dataCollected.locationData) dataCollectedList.push('Location data and geographic information');
    if (dataCollected.deviceInfo) dataCollectedList.push('Device information (IP address, browser type, operating system)');
    if (dataCollected.cookiesTracking) dataCollectedList.push('Cookies and tracking technologies data');
    if (dataCollected.socialMediaData) dataCollectedList.push('Social media profile information');
    if (dataCollected.usageData) dataCollectedList.push('Usage data and interaction with our services');
    if (dataCollected.userContent) dataCollectedList.push('User-generated content and communications');

    const purposesList = [];
    if (dataPurposes.serviceProvision) purposesList.push('To provide, operate, and maintain our services');
    if (dataPurposes.communication) purposesList.push('To communicate with you about your account and our services');
    if (dataPurposes.marketing) purposesList.push('To send you marketing and promotional materials');
    if (dataPurposes.analytics) purposesList.push('To analyze usage patterns and improve our services');
    if (dataPurposes.personalization) purposesList.push('To personalize your experience');
    if (dataPurposes.security) purposesList.push('To protect the security and integrity of our services');
    if (dataPurposes.legal) purposesList.push('To comply with legal obligations and enforce our terms');

    const rightsList = [];
    if (userRights.access) rightsList.push('Right to access your personal data');
    if (userRights.rectification) rightsList.push('Right to rectify inaccurate personal data');
    if (userRights.erasure) rightsList.push('Right to erasure ("right to be forgotten")');
    if (userRights.portability) rightsList.push('Right to data portability');
    if (userRights.optOut) rightsList.push('Right to opt-out of marketing communications');
    if (userRights.withdraw) rightsList.push('Right to withdraw consent');

    const policy = `
PRIVACY POLICY

Last Updated: ${effectiveDateStr}

${businessName || '[COMPANY NAME]'} ("we," "us," or "our") operates the ${businessTypeName}${websiteUrl ? ` at ${websiteUrl}` : ''}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.

Please read this Privacy Policy carefully. By accessing or using our services, you agree to the collection and use of information in accordance with this policy.

1. INFORMATION WE COLLECT

We may collect and process the following types of information:

${dataCollectedList.map((item, index) => `   ${index + 1}. ${item}`).join('\n')}

We collect this information:
- Directly from you when you provide it to us
- Automatically when you use our services
- From third-party sources, where permitted by law

2. HOW WE USE YOUR INFORMATION

We use the information we collect for the following purposes:

${purposesList.map((item, index) => `   ${index + 1}. ${item}`).join('\n')}

3. LEGAL BASIS FOR PROCESSING (${gdprCompliance ? 'GDPR Compliant' : 'General'})

We process your personal information based on:
- Your consent
- The performance of a contract with you
- Compliance with legal obligations
- Our legitimate business interests
${gdprCompliance ? '- Public interest or official authority' : ''}

${thirdPartySharing ? `4. SHARING OF YOUR INFORMATION

We may share your personal information with:

Third-Party Service Providers:
${thirdParties.map((party, index) => `   ${index + 1}. ${party}`).join('\n')}

We may also share your information:
- To comply with legal obligations
- To protect our rights and safety
- In connection with a business transaction (merger, acquisition, etc.)
- With your consent

All third parties are required to maintain the confidentiality and security of your personal information.` : `4. SHARING OF YOUR INFORMATION

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.`}

${internationalTransfer ? `5. INTERNATIONAL DATA TRANSFERS

Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place, including:
- Standard contractual clauses
- Privacy Shield certification (where applicable)
- Binding corporate rules` : ''}

${internationalTransfer ? '6' : '5'}. DATA RETENTION

We retain your personal information for ${dataRetention} from the date of collection or your last interaction with our services, unless a longer retention period is required by law.

${internationalTransfer ? '7' : '6'}. DATA SECURITY

We implement appropriate technical and organizational measures to protect your personal information, including:

${securityMeasures}

However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.

${internationalTransfer ? '8' : '7'}. YOUR RIGHTS

You have the following rights regarding your personal information:

${rightsList.map((item, index) => `   ${index + 1}. ${item}`).join('\n')}

To exercise these rights, please contact us at ${contactEmail || '[CONTACT EMAIL]'}.

${childrenData ? `${internationalTransfer ? '9' : '8'}. CHILDREN'S PRIVACY

Our services are not directed to children under the age of ${childrenAgeLimit}. We do not knowingly collect personal information from children under ${childrenAgeLimit}. If you become aware that a child has provided us with personal information, please contact us immediately.` : `${internationalTransfer ? '9' : '8'}. CHILDREN'S PRIVACY

Our services are not intended for children under the age of ${childrenAgeLimit}. We do not knowingly collect personal information from children under ${childrenAgeLimit}. If we discover that we have collected personal information from a child under ${childrenAgeLimit}, we will delete it immediately.`}

${cookiePolicy ? `${internationalTransfer ? '10' : '9'}. COOKIES AND TRACKING TECHNOLOGIES

We use cookies and similar tracking technologies to:
- Remember your preferences
- Analyze usage patterns
- Deliver targeted advertising
- Improve our services

You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our services.

Types of cookies we use:
- Essential cookies (required for basic functionality)
- Analytics cookies (to understand how you use our services)
- Marketing cookies (to deliver relevant advertisements)
- Preference cookies (to remember your settings)` : ''}

${gdprCompliance ? `${internationalTransfer ? (cookiePolicy ? '11' : '10') : (cookiePolicy ? '10' : '9')}. GDPR COMPLIANCE

If you are a resident of the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):

- Right to lodge a complaint with a supervisory authority
- Right to object to processing based on legitimate interests
- Right to restriction of processing
- Rights related to automated decision-making and profiling

Our Data Protection Officer can be contacted at ${contactEmail || '[DPO EMAIL]'}.` : ''}

${ccpaCompliance ? `${(() => {
  let num = internationalTransfer ? (cookiePolicy ? (gdprCompliance ? 12 : 11) : (gdprCompliance ? 11 : 10)) : (cookiePolicy ? (gdprCompliance ? 11 : 10) : (gdprCompliance ? 10 : 9));
  return num;
})()}. CALIFORNIA PRIVACY RIGHTS (CCPA)

If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):

- Right to know what personal information is collected
- Right to know whether personal information is sold or disclosed
- Right to opt-out of the sale of personal information
- Right to request deletion of personal information
- Right to non-discrimination for exercising your rights

To submit a request, please contact us at ${contactEmail || '[CONTACT EMAIL]'}.

We do not sell your personal information.` : ''}

${(() => {
  let num = 9;
  if (internationalTransfer) num++;
  if (cookiePolicy) num++;
  if (gdprCompliance) num++;
  if (ccpaCompliance) num++;
  return num;
})()}. CHANGES TO THIS PRIVACY POLICY

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.

${(() => {
  let num = 10;
  if (internationalTransfer) num++;
  if (cookiePolicy) num++;
  if (gdprCompliance) num++;
  if (ccpaCompliance) num++;
  return num;
})()}. CONTACT US

If you have questions about this Privacy Policy or our data practices, please contact us:

${businessName || '[COMPANY NAME]'}
${contactAddress || '[ADDRESS]'}
Email: ${contactEmail || '[EMAIL]'}
${websiteUrl ? `Website: ${websiteUrl}` : ''}

For data protection inquiries, please include "Privacy" in the subject line.
`.trim();

    setGeneratedPolicy(policy);
  };

  const copyToClipboard = async () => {
    if (generatedPolicy) {
      await navigator.clipboard.writeText(generatedPolicy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPolicy = () => {
    if (generatedPolicy) {
      const blob = new Blob([generatedPolicy], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy_policy_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const reset = () => {
    setPolicyData({
      businessName: '',
      businessType: 'website',
      websiteUrl: '',
      contactEmail: '',
      contactAddress: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      dataCollected: {
        personalInfo: true,
        contactInfo: true,
        paymentInfo: false,
        locationData: false,
        deviceInfo: true,
        cookiesTracking: true,
        socialMediaData: false,
        usageData: true,
        userContent: false,
      },
      dataPurposes: {
        serviceProvision: true,
        communication: true,
        marketing: false,
        analytics: true,
        personalization: false,
        security: true,
        legal: true,
      },
      thirdPartySharing: true,
      thirdParties: ['Google Analytics'],
      internationalTransfer: false,
      childrenData: false,
      childrenAgeLimit: '13',
      dataRetention: '2 years',
      userRights: {
        access: true,
        rectification: true,
        erasure: true,
        portability: true,
        optOut: true,
        withdraw: true,
      },
      gdprCompliance: false,
      ccpaCompliance: false,
      cookiePolicy: true,
      securityMeasures: 'SSL encryption, secure servers, access controls, and regular security audits',
    });
    setGeneratedPolicy(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('tools.privacyPolicyGenerator.privacyPolicyGenerator', 'Privacy Policy Generator')}</h1>
                <p className="text-teal-100 text-sm mt-1">{t('tools.privacyPolicyGenerator.createGdprAndCcpaCompliant', 'Create GDPR and CCPA compliant privacy policies')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {(['basic', 'data', 'sharing', 'rights'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'basic' ? 'Business Info' : tab === 'data' ? 'Data Collection' : tab === 'sharing' ? t('tools.privacyPolicyGenerator.sharingTransfer', 'Sharing & Transfer') : t('tools.privacyPolicyGenerator.userRights2', 'User Rights')}
                </button>
              ))}
            </div>

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.privacyPolicyGenerator.businessName', 'Business Name *')}
                    </label>
                    <input
                      type="text"
                      value={policyData.businessName}
                      onChange={(e) => setPolicyData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder={t('tools.privacyPolicyGenerator.yourCompanyName', 'Your Company Name')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.privacyPolicyGenerator.businessType', 'Business Type')}
                    </label>
                    <select
                      value={policyData.businessType}
                      onChange={(e) => setPolicyData(prev => ({ ...prev, businessType: e.target.value as BusinessType }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    >
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.privacyPolicyGenerator.websiteUrl', 'Website URL')}
                  </label>
                  <input
                    type="url"
                    value={policyData.websiteUrl}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder={t('tools.privacyPolicyGenerator.httpsWwwExampleCom', 'https://www.example.com')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.privacyPolicyGenerator.contactEmail', 'Contact Email *')}
                    </label>
                    <input
                      type="email"
                      value={policyData.contactEmail}
                      onChange={(e) => setPolicyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder={t('tools.privacyPolicyGenerator.privacyExampleCom', 'privacy@example.com')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.privacyPolicyGenerator.effectiveDate', 'Effective Date')}
                    </label>
                    <input
                      type="date"
                      value={policyData.effectiveDate}
                      onChange={(e) => setPolicyData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.privacyPolicyGenerator.businessAddress', 'Business Address')}
                  </label>
                  <textarea
                    value={policyData.contactAddress}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, contactAddress: e.target.value }))}
                    placeholder={t('tools.privacyPolicyGenerator.123BusinessStCityState', '123 Business St, City, State, ZIP')}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Compliance Options */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.privacyPolicyGenerator.complianceRequirements', 'Compliance Requirements')}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={policyData.gdprCompliance}
                        onChange={(e) => setPolicyData(prev => ({ ...prev, gdprCompliance: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.privacyPolicyGenerator.gdprComplianceEu', 'GDPR Compliance (EU)')}</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={policyData.ccpaCompliance}
                        onChange={(e) => setPolicyData(prev => ({ ...prev, ccpaCompliance: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.privacyPolicyGenerator.ccpaComplianceCalifornia', 'CCPA Compliance (California)')}</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={policyData.cookiePolicy}
                        onChange={(e) => setPolicyData(prev => ({ ...prev, cookiePolicy: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.privacyPolicyGenerator.includeCookiePolicy', 'Include Cookie Policy')}</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={policyData.childrenData}
                        onChange={(e) => setPolicyData(prev => ({ ...prev, childrenData: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.privacyPolicyGenerator.childrenSDataCoppa', 'Children\'s Data (COPPA)')}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.privacyPolicyGenerator.dataTypesCollected', 'Data Types Collected')}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries({
                      personalInfo: 'Personal Information (name, email)',
                      contactInfo: 'Contact Information',
                      paymentInfo: 'Payment Information',
                      locationData: 'Location Data',
                      deviceInfo: 'Device Information',
                      cookiesTracking: 'Cookies & Tracking',
                      socialMediaData: 'Social Media Data',
                      usageData: 'Usage Data',
                      userContent: 'User-Generated Content',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={policyData.dataCollected[key as keyof typeof policyData.dataCollected]}
                          onChange={(e) => setPolicyData(prev => ({
                            ...prev,
                            dataCollected: { ...prev.dataCollected, [key]: e.target.checked }
                          }))}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.privacyPolicyGenerator.dataUsagePurposes', 'Data Usage Purposes')}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries({
                      serviceProvision: 'Service Provision',
                      communication: 'Communication',
                      marketing: 'Marketing & Promotions',
                      analytics: 'Analytics & Improvements',
                      personalization: 'Personalization',
                      security: 'Security & Fraud Prevention',
                      legal: 'Legal Compliance',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={policyData.dataPurposes[key as keyof typeof policyData.dataPurposes]}
                          onChange={(e) => setPolicyData(prev => ({
                            ...prev,
                            dataPurposes: { ...prev.dataPurposes, [key]: e.target.checked }
                          }))}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.privacyPolicyGenerator.dataRetentionPeriod', 'Data Retention Period')}
                  </label>
                  <select
                    value={policyData.dataRetention}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, dataRetention: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                    <option value="3 years">3 years</option>
                    <option value="5 years">5 years</option>
                    <option value="as long as necessary for the purposes outlined">{t('tools.privacyPolicyGenerator.asLongAsNecessary', 'As long as necessary')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Sharing Tab */}
            {activeTab === 'sharing' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={policyData.thirdPartySharing}
                      onChange={(e) => setPolicyData(prev => ({ ...prev, thirdPartySharing: e.target.checked }))}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.privacyPolicyGenerator.shareDataWithThirdParties', 'Share Data with Third Parties')}</span>
                  </label>

                  {policyData.thirdPartySharing && (
                    <div className="grid md:grid-cols-3 gap-2">
                      {COMMON_THIRD_PARTIES.map((party) => (
                        <label key={party} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={policyData.thirdParties.includes(party)}
                            onChange={() => toggleThirdParty(party)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{party}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={policyData.internationalTransfer}
                      onChange={(e) => setPolicyData(prev => ({ ...prev, internationalTransfer: e.target.checked }))}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.privacyPolicyGenerator.internationalDataTransfers', 'International Data Transfers')}</span>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.privacyPolicyGenerator.checkIfYouTransferData', 'Check if you transfer data outside the user\'s country')}</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.privacyPolicyGenerator.securityMeasures', 'Security Measures')}
                  </label>
                  <textarea
                    value={policyData.securityMeasures}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, securityMeasures: e.target.value }))}
                    placeholder={t('tools.privacyPolicyGenerator.describeTheSecurityMeasuresYou', 'Describe the security measures you implement...')}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>
            )}

            {/* User Rights Tab */}
            {activeTab === 'rights' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.privacyPolicyGenerator.userRights', 'User Rights')}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries({
                      access: 'Right to Access',
                      rectification: 'Right to Rectification',
                      erasure: 'Right to Erasure',
                      portability: 'Right to Data Portability',
                      optOut: 'Right to Opt-Out',
                      withdraw: 'Right to Withdraw Consent',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={policyData.userRights[key as keyof typeof policyData.userRights]}
                          onChange={(e) => setPolicyData(prev => ({
                            ...prev,
                            userRights: { ...prev.userRights, [key]: e.target.checked }
                          }))}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {policyData.childrenData && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.privacyPolicyGenerator.minimumAgeRequirement', 'Minimum Age Requirement')}
                    </label>
                    <select
                      value={policyData.childrenAgeLimit}
                      onChange={(e) => setPolicyData(prev => ({ ...prev, childrenAgeLimit: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-teal-500`}
                    >
                      <option value="13">13 years (COPPA)</option>
                      <option value="16">16 years (GDPR)</option>
                      <option value="18">18 years</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generatePolicy}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {t('tools.privacyPolicyGenerator.generatePrivacyPolicy', 'Generate Privacy Policy')}
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

            {/* Generated Policy */}
            {generatedPolicy && (
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.privacyPolicyGenerator.generatedPrivacyPolicy', 'Generated Privacy Policy')}</h3>
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
                      {copied ? t('tools.privacyPolicyGenerator.copied', 'Copied!') : t('tools.privacyPolicyGenerator.copy', 'Copy')}
                    </button>
                    <button
                      onClick={downloadPolicy}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('tools.privacyPolicyGenerator.download', 'Download')}
                    </button>
                  </div>
                </div>
                <pre className={`whitespace-pre-wrap text-sm font-mono p-4 rounded-lg max-h-96 overflow-y-auto ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}>
                  {generatedPolicy}
                </pre>
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>{t('tools.privacyPolicyGenerator.disclaimer', 'Disclaimer:')}</strong> This privacy policy generator creates template documents for reference purposes only.
                Generated policies should be reviewed by a qualified legal professional before publication.
                This is not legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
