import React, { useState, useEffect } from 'react';
import { HelpCircle, Copy, Check, RefreshCw, Sparkles, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type Industry = 'ecommerce' | 'saas' | 'service' | 'healthcare' | 'education' | 'finance' | 'general';
type FAQCategory = 'general' | 'pricing' | 'support' | 'shipping' | 'returns' | 'account' | 'product' | 'technical';

interface FAQItem {
  question: string;
  answer: string;
  category: FAQCategory;
}

interface FAQTemplate {
  question: string;
  answer: string;
  category: FAQCategory;
  industry: Industry[];
}

const faqTemplates: FAQTemplate[] = [
  // General
  { question: "What is {company}?", answer: "{company} is a {industry_desc} that helps {target_audience} {value_proposition}. We've been serving customers since {founded_year} and are committed to {mission}.", category: 'general', industry: ['ecommerce', 'saas', 'service', 'healthcare', 'education', 'finance', 'general'] },
  { question: "How can I contact {company}?", answer: "You can reach us through multiple channels: Email us at support@{domain}, call us at {phone}, or use our live chat feature available on our website during business hours ({hours}). We typically respond within {response_time}.", category: 'support', industry: ['ecommerce', 'saas', 'service', 'healthcare', 'education', 'finance', 'general'] },
  { question: "Where is {company} located?", answer: "{company} is headquartered in {location}. We serve customers {service_area} and our team is available to assist you {availability}.", category: 'general', industry: ['ecommerce', 'saas', 'service', 'healthcare', 'education', 'finance', 'general'] },

  // Pricing
  { question: "What are your pricing options?", answer: "We offer flexible pricing plans to suit different needs. Our plans start at {starting_price} and include {base_features}. For enterprise solutions or custom requirements, please contact our sales team for a personalized quote.", category: 'pricing', industry: ['saas', 'service', 'education', 'general'] },
  { question: "Do you offer a free trial?", answer: "Yes! We offer a {trial_period}-day free trial with full access to all features. No credit card required to start. This gives you enough time to explore our platform and see how it fits your needs.", category: 'pricing', industry: ['saas', 'education', 'general'] },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through our encrypted payment system.", category: 'pricing', industry: ['ecommerce', 'saas', 'service', 'education', 'finance', 'general'] },
  { question: "Can I cancel my subscription anytime?", answer: "Absolutely! You can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have access until the end of your current billing period. We don't offer prorated refunds, but there are no cancellation fees.", category: 'pricing', industry: ['saas', 'education', 'general'] },

  // Shipping (E-commerce)
  { question: "How long does shipping take?", answer: "Standard shipping takes {shipping_time} business days. Express shipping is available for {express_time}-day delivery. International orders typically arrive within {international_time} business days depending on the destination.", category: 'shipping', industry: ['ecommerce'] },
  { question: "Do you ship internationally?", answer: "Yes, we ship to over {countries_count} countries worldwide. International shipping rates and delivery times vary by location. You can view the exact shipping cost at checkout before completing your purchase.", category: 'shipping', industry: ['ecommerce'] },
  { question: "How can I track my order?", answer: "Once your order ships, you'll receive an email with a tracking number and link. You can also track your order by logging into your account and viewing your order history. Updates are provided in real-time.", category: 'shipping', industry: ['ecommerce'] },

  // Returns
  { question: "What is your return policy?", answer: "We offer a {return_period}-day return policy on all unused items in original packaging. To initiate a return, simply contact our support team or start the process through your account. Refunds are processed within {refund_time} business days.", category: 'returns', industry: ['ecommerce'] },
  { question: "How do I request a refund?", answer: "To request a refund, contact our support team with your order number. For eligible returns, we'll provide a prepaid shipping label. Once we receive the item, your refund will be processed within {refund_time} business days to your original payment method.", category: 'returns', industry: ['ecommerce', 'saas', 'service', 'general'] },

  // Account
  { question: "How do I create an account?", answer: "Creating an account is quick and easy! Click the 'Sign Up' button on our website, enter your email address and create a password. You can also sign up using your Google or social media accounts for faster access.", category: 'account', industry: ['ecommerce', 'saas', 'service', 'education', 'finance', 'general'] },
  { question: "I forgot my password. How can I reset it?", answer: "No problem! Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within minutes. If you don't see the email, check your spam folder or contact support.", category: 'account', industry: ['ecommerce', 'saas', 'service', 'education', 'finance', 'general'] },
  { question: "Is my personal information secure?", answer: "Absolutely. We take security seriously and use industry-standard encryption (SSL/TLS) to protect your data. We never sell your personal information to third parties. For more details, please review our Privacy Policy.", category: 'account', industry: ['ecommerce', 'saas', 'service', 'healthcare', 'education', 'finance', 'general'] },

  // Product/Technical
  { question: "What makes {company} different from competitors?", answer: "{company} stands out through our {differentiator}. Unlike others, we focus on {unique_approach}, resulting in {benefit_result}. Our customers consistently praise our {praise_point}.", category: 'product', industry: ['saas', 'service', 'healthcare', 'education', 'general'] },
  { question: "Do you offer customer support?", answer: "Yes! We provide {support_type} customer support. Our dedicated team is available {support_hours} to help you with any questions or issues. {support_channels}", category: 'support', industry: ['ecommerce', 'saas', 'service', 'healthcare', 'education', 'finance', 'general'] },
  { question: "Is there a mobile app available?", answer: "Yes, our mobile app is available for both iOS and Android devices. Download it from the App Store or Google Play Store to access {company} on the go with all the features you love.", category: 'technical', industry: ['saas', 'education', 'finance', 'general'] },
  { question: "What integrations do you support?", answer: "We integrate with popular tools including {integrations}. Our API also allows for custom integrations. Visit our integrations page for the complete list or contact us about specific requirements.", category: 'technical', industry: ['saas', 'general'] },

  // Healthcare specific
  { question: "Are your services HIPAA compliant?", answer: "Yes, {company} is fully HIPAA compliant. We implement rigorous security measures to protect patient health information, including encryption, access controls, and regular security audits.", category: 'technical', industry: ['healthcare'] },
  { question: "Do you accept insurance?", answer: "We accept most major insurance plans. Coverage varies by plan, so we recommend verifying your benefits before your appointment. Our billing team is available to help you understand your coverage and costs.", category: 'pricing', industry: ['healthcare'] },

  // Finance specific
  { question: "Is my money safe with {company}?", answer: "Your funds are protected through multiple security measures. We use bank-level encryption, two-factor authentication, and your deposits are FDIC insured up to $250,000. We're also regulated by {regulatory_body}.", category: 'account', industry: ['finance'] },
  { question: "What are the fees for your services?", answer: "We believe in transparent pricing. Our fee structure includes {fee_structure}. There are no hidden fees, and you can view all applicable charges before confirming any transaction.", category: 'pricing', industry: ['finance'] },
];

const defaultValues = {
  company: 'Our Company',
  domain: 'example.com',
  phone: '1-800-XXX-XXXX',
  hours: '9 AM - 6 PM EST',
  response_time: '24 hours',
  location: 'New York, NY',
  service_area: 'nationwide',
  availability: 'Monday through Friday',
  starting_price: '$29/month',
  base_features: 'core features and support',
  trial_period: '14',
  shipping_time: '3-5',
  express_time: '1-2',
  international_time: '7-14',
  countries_count: '100',
  return_period: '30',
  refund_time: '5-7',
  industry_desc: 'leading provider',
  target_audience: 'businesses and individuals',
  value_proposition: 'achieve their goals',
  founded_year: '2020',
  mission: 'delivering exceptional value',
  differentiator: 'customer-first approach',
  unique_approach: 'personalized solutions',
  benefit_result: 'measurable results',
  praise_point: 'responsive support and ease of use',
  support_type: 'comprehensive',
  support_hours: '24/7',
  support_channels: 'Reach us via email, phone, or live chat.',
  integrations: 'Slack, Zapier, Google Workspace, and more',
  regulatory_body: 'relevant financial authorities',
  fee_structure: 'competitive transaction fees and no monthly minimums',
};

interface AIFAQGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AIFAQGeneratorTool: React.FC<AIFAQGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedFAQs, setGeneratedFAQs] = useState<FAQItem[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'general' as Industry,
    website: '',
    customTopics: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<FAQCategory[]>(['general', 'pricing', 'support']);
  const [faqCount, setFaqCount] = useState(6);

  const toggleCategory = (category: FAQCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateFAQs = () => {
    const applicableTemplates = faqTemplates.filter(
      t => t.industry.includes(formData.industry) && selectedCategories.includes(t.category)
    );

    const shuffled = [...applicableTemplates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(faqCount, shuffled.length));

    const company = formData.companyName || defaultValues.company;
    const domain = formData.website?.replace(/^https?:\/\//, '').replace(/\/$/, '') || defaultValues.domain;

    const faqs = selected.map(template => {
      let question = template.question;
      let answer = template.answer;

      // Replace all placeholders
      const replacements: Record<string, string> = {
        ...defaultValues,
        company,
        domain,
      };

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        question = question.replace(regex, value);
        answer = answer.replace(regex, value);
      });

      return {
        question,
        answer,
        category: template.category,
      };
    });

    setGeneratedFAQs(faqs);
    setExpandedIndex(null);
  };

  const handleCopyAll = () => {
    const text = generatedFAQs
      .map((faq, i) => `Q${i + 1}: ${faq.question}\nA: ${faq.answer}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJSON = () => {
    const json = JSON.stringify(generatedFAQs, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeFAQ = (index: number) => {
    setGeneratedFAQs(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.companyName) setFormData(prev => ({ ...prev, companyName: params.companyName }));
      if (params.industry) setFormData(prev => ({ ...prev, industry: params.industry }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const industries: { value: Industry; label: string }[] = [
    { value: 'general', label: 'General Business' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'saas', label: 'SaaS / Software' },
    { value: 'service', label: 'Service Business' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
  ];

  const categories: { value: FAQCategory; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'support', label: 'Support' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns' },
    { value: 'account', label: 'Account' },
    { value: 'product', label: 'Product' },
    { value: 'technical', label: 'Technical' },
  ];

  const getCategoryColor = (category: FAQCategory) => {
    const colors: Record<FAQCategory, string> = {
      general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      pricing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      support: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      shipping: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      returns: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      account: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      product: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      technical: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[category];
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <HelpCircle className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aIFAQGenerator.aiFaqGenerator', 'AI FAQ Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIFAQGenerator.createComprehensiveFaqContentFor', 'Create comprehensive FAQ content for your business')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aIFAQGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Business Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIFAQGenerator.companyName', 'Company Name')}</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder={t('tools.aIFAQGenerator.eGAcmeCorp', 'e.g., Acme Corp')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIFAQGenerator.industry', 'Industry')}</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {industries.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIFAQGenerator.websiteOptional', 'Website (Optional)')}</label>
          <input
            type="text"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder={t('tools.aIFAQGenerator.eGWwwExampleCom', 'e.g., www.example.com')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIFAQGenerator.faqCategories', 'FAQ Categories')}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategories.includes(cat.value)
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Number of FAQs: {faqCount}</label>
          <input
            type="range"
            min="3"
            max="12"
            value={faqCount}
            onChange={(e) => setFaqCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateFAQs}
          disabled={selectedCategories.length === 0}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aIFAQGenerator.generateFaqs', 'Generate FAQs')}
        </button>

        {/* Generated FAQs */}
        {generatedFAQs.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                Generated FAQs ({generatedFAQs.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAll}
                  className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy Text
                </button>
                <button
                  onClick={handleCopyJSON}
                  className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Copy className="w-3 h-3" />
                  {t('tools.aIFAQGenerator.copyJson', 'Copy JSON')}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {generatedFAQs.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div
                    className={`p-4 cursor-pointer flex items-start justify-between gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(faq.category)}`}>
                          {faq.category}
                        </span>
                      </div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {faq.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFAQ(index); }}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedIndex === index ? (
                        <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </div>
                  </div>
                  {expandedIndex === index && (
                    <div className={`px-4 pb-4 pt-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={generateFAQs}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aIFAQGenerator.generateMoreFaqs', 'Generate More FAQs')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {generatedFAQs.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIFAQGenerator.enterYourBusinessDetailsAnd', 'Enter your business details and select categories to generate FAQs')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFAQGeneratorTool;
