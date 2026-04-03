/**
 * Centralized Pricing Configuration for Wants AI
 *
 * Update this file to change pricing, features, and FAQ across the entire site.
 * All pricing pages and components should import from this file.
 */

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'features' | 'technical' | 'account';
}

// =============================================================================
// PRICING PLANS
// =============================================================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    price: {
      monthly: 0,
      yearly: 0
    },
    currency: '$',
    features: [
      { text: '3 AI messages/day', included: true },
      { text: 'Gemini 2.0 Flash only', included: true },
      { text: '100+ tools (3 pins max)', included: true },
      { text: '3 image generations/month', included: true },
      { text: '1 app project', included: true },
      { text: 'Community support', included: true }
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For individuals who want more',
    price: {
      monthly: 19.99,
      yearly: 199.99
    },
    currency: '$',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: '2,500 AI messages/month', included: true },
      { text: 'All 30+ AI models', included: true },
      { text: 'Unlimited tool uses', included: true },
      { text: '100 image generations/month', included: true },
      { text: '10 video generations/month', included: true },
      { text: 'All export formats', included: true }
    ]
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams & power users',
    price: {
      monthly: 49.99,
      yearly: 499.99
    },
    currency: '$',
    features: [
      { text: 'Unlimited AI messages', included: true },
      { text: 'Unlimited image generation', included: true },
      { text: '100 video generations/month', included: true },
      { text: 'No-code app builder', included: true },
      { text: '5 team members included', included: true },
      { text: 'API access', included: true }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations at scale',
    price: {
      monthly: 149.99,
      yearly: 1499.99
    },
    currency: '$',
    features: [
      { text: 'Everything unlimited', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom AI model training', included: true },
      { text: 'SSO & SAML', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: '99.9% SLA guarantee', included: true }
    ]
  }
];

// =============================================================================
// FAQ ITEMS - Specific to Wants AI Platform
// =============================================================================

export const FAQ_ITEMS: FAQItem[] = [
  // General Questions
  {
    question: "What is Wants AI?",
    answer: "Wants AI represents a paradigm shift in AI interaction. It's the world's first intent-to-interface AI platform - while traditional chatbots generate text responses, Wants detects your intent and dynamically renders fully functional user interfaces. With 1,100+ smart tools, 30+ AI models, and 100+ integrations, it effectively replaces 20+ standalone apps including ChatGPT, Canva, Notion, Zapier, and more in a single unified platform.",
    category: "general"
  },
  {
    question: "How does Wants AI differ from ChatGPT or other AI chatbots?",
    answer: "The fundamental difference is Intent → Interface vs Intent → Text. Traditional AI chatbots output text you must read, copy, and paste elsewhere. Wants AI renders interactive, functional interfaces directly. Ask for a mortgage calculator - get a working calculator with sliders and charts. Ask for a resume - get a professional editor with templates. Ask for data analysis - get interactive visualizations. It's AI that renders solutions, not just describes them.",
    category: "general"
  },
  {
    question: "What categories of tools does Wants AI cover?",
    answer: "Wants AI spans 31+ categories including: Financial (calculators, budgeting, invoices), Health & Wellness (BMI, calories, fitness trackers), Business (proposals, contracts, analytics), Legal (document generators, compliance tools), Creative (image editing, design tools, content generators), Developer (code formatters, API testers, JSON tools), Education (flashcards, study aids, language learning), and many more specialized categories for real estate, automotive, gardening, childcare, and beyond.",
    category: "general"
  },
  {
    question: "Can I use Wants AI on multiple devices?",
    answer: "Yes! Wants AI is a progressive web app that works seamlessly on any device with a modern browser - desktop, laptop, tablet, or smartphone. Paid plans include real-time sync across all your devices, so you can start work on your computer and continue on mobile. Free users can access on all platforms with limited sync capabilities.",
    category: "general"
  },

  // Pricing Questions
  {
    question: "What's included in the Free plan?",
    answer: "The Free plan is generous and free forever: 3 AI messages per day using Google's Gemini 2.0 Flash model, access to 100+ essential tools (with up to 3 pinned favorites), 3 AI image generations per month, 1 app builder project, and community support. No credit card required - start using Wants AI immediately.",
    category: "pricing"
  },
  {
    question: "What AI models can I access on each plan?",
    answer: "Free plan: Gemini 2.0 Flash (Google's fast, capable free-tier model). Pro/Team/Enterprise: All 30+ AI models including OpenAI GPT-5 Mini, GPT-4o Mini, Anthropic Claude 3.5 Haiku, Claude 3.5 Sonnet, Google Gemini 2.0 Pro, DeepSeek V3, Meta Llama 3, Mistral, Mixtral, and more. Each model has different strengths - use GPT for general tasks, Claude for nuanced writing, Gemini for multimodal, and specialized models for specific use cases.",
    category: "pricing"
  },
  {
    question: "What's included in each subscription plan?",
    answer: "Free ($0): 3 AI messages/day (Gemini 2.0 Flash), 100+ tools, 3 image generations/month. Pro ($19.99/mo): 2,500 AI messages, all 30+ models, unlimited tools, 100 images, 10 videos/month, all export formats. Team ($49.99/mo): Unlimited AI messages, unlimited images, 100 videos, no-code app builder, 5 team members, API access. Enterprise ($149.99/mo): Everything unlimited, unlimited team members, custom AI training, SSO/SAML, dedicated support, 99.9% SLA.",
    category: "pricing"
  },
  {
    question: "Do you offer annual discounts?",
    answer: "Yes! Save up to 17% with annual billing - that's like getting 2 months free. Pro: $199.99/year (save $40). Team: $499.99/year (save $100). Enterprise: $1,499.99/year (save $300). All annual plans include the same features as monthly plans with the added benefit of price lock for the year.",
    category: "pricing"
  },
  {
    question: "Do you offer refunds?",
    answer: "Absolutely. We offer a no-questions-asked 30-day money-back guarantee for all paid plans. If Wants AI doesn't transform how you work, contact support@wants.chat for a full refund. You can also cancel anytime - your access continues until the end of your billing period with no additional charges.",
    category: "pricing"
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes! All new users get a 14-day free trial of Pro features. Experience all 30+ AI models, unlimited tool access, and premium features risk-free. No credit card required to start - only add payment details if you decide to continue after the trial.",
    category: "pricing"
  },

  // Features Questions
  {
    question: "What are the 1,100+ tools available?",
    answer: "Wants AI includes tools for virtually every use case: Text Tools (formatters, diff comparers, case converters), Financial Calculators (mortgage, loan, ROI, tax), Health Tools (BMI, calorie, macro, pregnancy trackers), Generators (QR codes, barcodes, passwords, invoices, contracts), Converters (units, currencies, time zones, file formats), AI Writing (emails, documents, social media, SEO content), Image Tools (editors, compressors, format converters, background removers), Developer Tools (JSON formatters, regex testers, API builders, code generators), Legal Tools (NDA, contract, GDPR generators), and 25+ more categories.",
    category: "features"
  },
  {
    question: "How do AI message limits work?",
    answer: "Free users: 3 AI messages per day using Gemini 2.0 Flash, resetting at midnight UTC. Pro users: 2,500 messages per month across all 30+ AI models, resetting on your billing date. Team/Enterprise: Unlimited AI messages with no caps. Each 'message' is one request-response cycle. Tool usage (calculators, generators, etc.) doesn't count against AI message limits.",
    category: "features"
  },
  {
    question: "What can I do with the App Builder?",
    answer: "The App Builder (Team and Enterprise plans) lets you create custom applications using natural language. Describe your app idea - 'Build a customer feedback tracker with ratings, categories, and charts' - and Wants AI generates a fully functional application with UI components, business logic, data storage, and integrations. Export apps or embed them in your existing workflows.",
    category: "features"
  },
  {
    question: "How does Wants AI handle integrations?",
    answer: "Wants AI connects with 100+ popular services: Google Workspace (Docs, Sheets, Drive), Microsoft 365, Slack, Discord, Zapier, Notion, Trello, Asana, Salesforce, HubSpot, Stripe, and many more. Integrations enable seamless data flow - generate a report in Wants, export to Google Sheets, and trigger a Slack notification, all in one workflow.",
    category: "features"
  },
  {
    question: "Is API access available?",
    answer: "Yes! Team and Enterprise plans include full API access. Build custom integrations, embed Wants AI capabilities in your products, automate workflows programmatically, and create white-label solutions. Our REST API is well-documented with SDKs for JavaScript, Python, and more. Enterprise customers get dedicated API support and custom rate limits.",
    category: "features"
  },
  {
    question: "What makes the AI image and video generation special?",
    answer: "Wants AI integrates multiple state-of-the-art image generation models for different use cases: photorealistic images, artistic styles, logos, product mockups, and more. Video generation supports explainer videos, social media content, and presentations. All generated content is yours to use commercially with proper licensing included in paid plans.",
    category: "features"
  },

  // Technical Questions
  {
    question: "How secure is my data?",
    answer: "Security is foundational to Wants AI. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our infrastructure is SOC 2 Type II compliant, GDPR and CCPA compliant, with regular third-party security audits. We never train our models on your data, and Enterprise customers can opt for dedicated instances with additional security controls.",
    category: "technical"
  },
  {
    question: "Can I export my data?",
    answer: "Absolutely. Your data belongs to you. Pro and higher plans can export all data in multiple formats: PDF for documents, CSV for spreadsheets, JSON for raw data, and native formats for specific tools. Export individual items or bulk export everything from your account settings. We also support automated exports via API.",
    category: "technical"
  },
  {
    question: "What browsers and devices are supported?",
    answer: "Wants AI works on all modern browsers: Chrome, Firefox, Safari, Edge, and Opera. We support desktop (Windows, macOS, Linux), tablets (iPad, Android), and mobile devices. For the best experience, use the latest browser version. Our PWA can be installed as a native-like app on mobile devices for offline access to certain features.",
    category: "technical"
  },
  {
    question: "Is there an API rate limit?",
    answer: "Team plans: 1,000 requests/minute, suitable for most applications. Enterprise plans: Custom rate limits based on your needs, up to 10,000+ requests/minute. All plans include burst capacity for temporary spikes. Rate limit headers in API responses help you manage usage programmatically.",
    category: "technical"
  },
  {
    question: "Does Wants AI work offline?",
    answer: "Certain features work offline through our Progressive Web App technology. Tools that don't require AI processing (calculators, converters, text formatters) function without internet. Your work is cached locally and syncs when you're back online. AI-powered features require an internet connection.",
    category: "technical"
  },

  // Account Questions
  {
    question: "Can I share my account with team members?",
    answer: "Individual plans (Free, Pro) are designed for single users. Team plan includes 5 team members, each with their own login, private workspace, and full feature access. Enterprise plan offers unlimited team members with advanced admin controls, role-based permissions, SSO, and audit logs.",
    category: "account"
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "Your data is preserved for 30 days after cancellation, giving you time to export anything you need. After 30 days, you revert to Free plan access with your account intact. We never delete accounts unless you explicitly request it. Paid features become view-only until you resubscribe.",
    category: "account"
  },
  {
    question: "Can I change or cancel my plan anytime?",
    answer: "Yes, complete flexibility! Upgrade anytime for immediate access to new features (prorated for the billing period). Downgrade or cancel anytime from account settings - access continues until your billing period ends. No cancellation fees, no complicated processes.",
    category: "account"
  },
  {
    question: "How do I get support?",
    answer: "Free: Community forum and comprehensive help center with guides and tutorials. Pro: Email support with 24-hour response time. Team: Priority email support with 4-hour response time plus live chat. Enterprise: Dedicated account manager, phone support, 1-hour response time SLA, and custom onboarding. Contact: support@wants.chat",
    category: "account"
  },
  {
    question: "Can I use Wants AI for my business/commercially?",
    answer: "Yes! All plans permit commercial use. Content you create with Wants AI belongs to you. Pro and higher plans include commercial licensing for AI-generated images and videos. Enterprise plans include additional legal protections, custom terms, and priority IP support for business-critical applications.",
    category: "account"
  }
];

// =============================================================================
// CONFIGURATION
// =============================================================================

export const PRICING_CONFIG = {
  yearlyDiscount: 17, // Percentage saved on yearly plans
  trialDays: 14,
  supportEmail: 'support@wants.chat',
  salesEmail: 'sales@wants.chat',
  totalTools: 1100,
  totalAIModels: 30,
  totalIntegrations: 100,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getPlanById = (id: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === id);
};

export const getMonthlyPrice = (plan: PricingPlan, isYearly: boolean): number => {
  if (isYearly && plan.price.yearly > 0) {
    return Math.round(plan.price.yearly / 12);
  }
  return plan.price.monthly;
};

export const getFAQsByCategory = (category: string): FAQItem[] => {
  if (category === 'all') return FAQ_ITEMS;
  return FAQ_ITEMS.filter(item => item.category === category);
};

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'pricing', label: 'Pricing & Billing' },
  { id: 'features', label: 'Features' },
  { id: 'technical', label: 'Technical' },
  { id: 'account', label: 'Account' },
];
