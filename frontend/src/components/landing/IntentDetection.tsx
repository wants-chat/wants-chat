import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  X,
  Check,
  Sparkles,
  Brain,
  ArrowRight,
  AlertTriangle,
  FileText,
  Building2,
  Users,
  Calculator,
  Activity,
  DollarSign,
  Receipt,
  Scale,
  Plane,
  Heart,
  Ruler,
  Weight,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';

// Industry to tool mapping data structure
interface ToolExample {
  name: string;
  userMessage: string;
  traditionalResponse: string;
  intentLabel: string;
  icon: React.ElementType;
}

interface IndustryData {
  industry: string;
  tools: string[];
  example: ToolExample;
}

const industryToolData: IndustryData[] = [
  {
    industry: 'Health & Fitness',
    tools: ['BMI Calculator', 'Calorie Tracker', 'Workout Planner', 'Macro Calculator'],
    example: {
      name: 'BMI Calculator',
      userMessage: 'Calculate my BMI',
      traditionalResponse: 'BMI (Body Mass Index) is calculated by dividing your weight in kilograms by your height in meters squared. The formula is: BMI = weight(kg) / height(m)². A healthy BMI range is typically 18.5-24.9...',
      intentLabel: 'BMI Calculator',
      icon: Calculator,
    },
  },
  {
    industry: 'Finance & Business',
    tools: ['Invoice Generator', 'Expense Tracker', 'Budget Dashboard', 'Tax Calculator'],
    example: {
      name: 'Invoice Generator',
      userMessage: 'Create an invoice for my client',
      traditionalResponse: 'To create an invoice, you should include: your business details, client information, invoice number, date, itemized list of services/products, payment terms, total amount due...',
      intentLabel: 'Invoice Generator',
      icon: Receipt,
    },
  },
  {
    industry: 'Real Estate',
    tools: ['Mortgage Calculator', 'Property Valuation', 'ROI Calculator', 'Rent vs Buy'],
    example: {
      name: 'Mortgage Calculator',
      userMessage: 'Calculate my mortgage payment',
      traditionalResponse: 'Mortgage payments depend on several factors: loan amount, interest rate, loan term, and down payment. The monthly payment formula uses amortization calculations...',
      intentLabel: 'Mortgage Calculator',
      icon: Building2,
    },
  },
  {
    industry: 'Legal',
    tools: ['NDA Generator', 'Contract Generator', 'Legal Document Generator', 'Terms Generator'],
    example: {
      name: 'NDA Generator',
      userMessage: 'Draft an NDA agreement',
      traditionalResponse: 'A Non-Disclosure Agreement should include: identification of parties, definition of confidential information, obligations of receiving party, exclusions, term and termination...',
      intentLabel: 'NDA Generator',
      icon: FileText,
    },
  },
  {
    industry: 'Travel & Hospitality',
    tools: ['Travel Planner', 'Packing List', 'Currency Converter', 'Flight Tracker'],
    example: {
      name: 'Currency Converter',
      userMessage: 'Convert USD to EUR',
      traditionalResponse: 'Currency exchange rates fluctuate constantly. As of now, 1 USD is approximately 0.92 EUR. However, actual rates may vary depending on where you exchange...',
      intentLabel: 'Currency Converter',
      icon: RefreshCw,
    },
  },
  {
    industry: 'Healthcare',
    tools: ['Health Tracker', 'Medical Records', 'Appointment Scheduler', 'Symptom Checker'],
    example: {
      name: 'Health Tracker',
      userMessage: 'Track my blood pressure',
      traditionalResponse: 'Blood pressure is measured in millimeters of mercury (mmHg) and recorded as two numbers: systolic over diastolic. Normal blood pressure is typically around 120/80 mmHg...',
      intentLabel: 'Health Tracker',
      icon: Heart,
    },
  },
  {
    industry: 'Education',
    tools: ['Study Planner', 'AI Study Notes', 'Flashcard Generator', 'Quiz Maker'],
    example: {
      name: 'Study Planner',
      userMessage: 'Plan my study schedule',
      traditionalResponse: 'Effective study planning involves: breaking down subjects into topics, allocating time based on difficulty, incorporating breaks using techniques like Pomodoro...',
      intentLabel: 'Study Planner',
      icon: Calendar,
    },
  },
  {
    industry: 'Retail',
    tools: ['Inventory Manager', 'Invoice Generator', 'POS System', 'Sales Analytics'],
    example: {
      name: 'Inventory Manager',
      userMessage: 'Track my inventory',
      traditionalResponse: 'Inventory management involves tracking stock levels, monitoring reorder points, managing SKUs, and maintaining accurate records of products...',
      intentLabel: 'Inventory Manager',
      icon: Receipt,
    },
  },
  {
    industry: 'Manufacturing',
    tools: ['Production Scheduler', 'Quality Control', 'BOM Manager', 'Efficiency Tracker'],
    example: {
      name: 'Production Scheduler',
      userMessage: 'Schedule production runs',
      traditionalResponse: 'Production scheduling requires balancing capacity, demand forecasts, material availability, and workforce allocation to optimize throughput...',
      intentLabel: 'Production Scheduler',
      icon: Calendar,
    },
  },
  {
    industry: 'Insurance',
    tools: ['Insurance Quote Tool', 'Claims Processing', 'Risk Assessment', 'Policy Comparison'],
    example: {
      name: 'Insurance Quote Tool',
      userMessage: 'Get an insurance quote',
      traditionalResponse: 'Insurance premiums depend on many factors including coverage type, deductibles, personal information, risk factors, and the insurance provider...',
      intentLabel: 'Insurance Quote Tool',
      icon: Scale,
    },
  },
  {
    industry: 'Construction',
    tools: ['Concrete Calculator', 'Material Calculator', 'Project Timeline', 'Cost Estimator'],
    example: {
      name: 'Concrete Calculator',
      userMessage: 'Calculate concrete needed',
      traditionalResponse: 'Concrete volume is calculated using: length x width x depth. For a 10x10 foot area with 4 inches depth, you would need approximately 1.23 cubic yards...',
      intentLabel: 'Concrete Calculator',
      icon: Calculator,
    },
  },
  {
    industry: 'Technology',
    tools: ['Code Generator', 'API Tester', 'JSON Formatter', 'Regex Tester'],
    example: {
      name: 'JSON Formatter',
      userMessage: 'Format my JSON data',
      traditionalResponse: 'JSON (JavaScript Object Notation) should follow proper syntax: use double quotes for keys and string values, proper nesting with braces and brackets...',
      intentLabel: 'JSON Formatter',
      icon: FileText,
    },
  },
];

// Tool UI Components
const BMICalculatorUI: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
      <Calculator className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-sm font-medium">BMI Calculator</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Height</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <Ruler className="w-4 h-4 text-gray-500" />
            <span className="text-white text-sm">175 cm</span>
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Weight</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <Weight className="w-4 h-4 text-gray-500" />
            <span className="text-white text-sm">70 kg</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/30">
        <span className="text-gray-400 text-xs">Your BMI</span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-lg font-bold">22.9</span>
          <span className="text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/20">Normal</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
      >
        <Activity className="w-4 h-4" />
        Calculate BMI
      </motion.button>
    </div>
  </motion.div>
);

const InvoiceGeneratorUI: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
      <Receipt className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-sm font-medium">Invoice Generator</span>
    </div>
    <div className="p-4 space-y-3">
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Client</label>
        <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="text-white text-sm">Acme Corporation</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Amount</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-white text-sm">2,500.00</span>
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Due Date</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-white text-sm">Feb 15</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-gray-400 text-xs">Invoice #</span>
        <span className="text-cyan-400 text-xs font-medium px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
          INV-2024-0042
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
      >
        <Receipt className="w-4 h-4" />
        Generate Invoice
      </motion.button>
    </div>
  </motion.div>
);

const NDAGeneratorUI: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
      <FileText className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-sm font-medium">NDA Generator</span>
    </div>
    <div className="p-4 space-y-3">
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Party A (Disclosing Party)</label>
        <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="text-white text-sm">Your Company</span>
        </div>
      </div>
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Party B (Receiving Party)</label>
        <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-white text-sm">Partner Inc</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-gray-400 text-xs">Agreement Type</span>
        <span className="text-cyan-400 text-xs font-medium px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
          Mutual Agreement
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
      >
        <FileText className="w-4 h-4" />
        Generate NDA
      </motion.button>
    </div>
  </motion.div>
);

const CurrencyConverterUI: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
      <RefreshCw className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-sm font-medium">Currency Converter</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">From</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <span className="text-lg">🇺🇸</span>
            <span className="text-white text-sm">USD</span>
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">To</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <span className="text-lg">🇪🇺</span>
            <span className="text-white text-sm">EUR</span>
          </div>
        </div>
      </div>
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Amount</label>
        <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-white text-sm">1,000.00</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/30">
        <span className="text-gray-400 text-xs">Converted</span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-lg font-bold">920.50</span>
          <span className="text-emerald-400 text-xs">EUR</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
      >
        <RefreshCw className="w-4 h-4" />
        Convert
      </motion.button>
    </div>
  </motion.div>
);

const HealthTrackerUI: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
      <Heart className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-sm font-medium">Health Tracker</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Systolic</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span className="text-white text-sm">120</span>
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Diastolic</label>
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm">80</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/30">
        <span className="text-gray-400 text-xs">Status</span>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">Normal</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
      >
        <Heart className="w-4 h-4" />
        Log Reading
      </motion.button>
    </div>
  </motion.div>
);

// Generic tool UI for industries without specific UI
const GenericToolUI: React.FC<{ toolName: string; icon: React.ElementType }> = ({ toolName, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
      <Icon className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-sm font-medium">{toolName}</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-24 flex items-center justify-center bg-gray-900/50 rounded-lg border border-gray-700 border-dashed">
        <div className="text-center">
          <Icon className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
          <span className="text-gray-500 text-sm">Tool UI Ready</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
      >
        <Icon className="w-4 h-4" />
        Launch {toolName}
      </motion.button>
    </div>
  </motion.div>
);

// Helper function to get the tool UI component
const getToolUI = (industry: string, example: ToolExample) => {
  switch (industry) {
    case 'Health & Fitness':
      return <BMICalculatorUI />;
    case 'Finance & Business':
      return <InvoiceGeneratorUI />;
    case 'Legal':
      return <NDAGeneratorUI />;
    case 'Travel & Hospitality':
      return <CurrencyConverterUI />;
    case 'Healthcare':
      return <HealthTrackerUI />;
    default:
      return <GenericToolUI toolName={example.name} icon={example.icon} />;
  }
};

const IntentDetection: React.FC = () => {
  const { t } = useTranslation();
  const [selectedIndustry, setSelectedIndustry] = useState('Legal');

  const currentIndustryData = industryToolData.find(
    (data) => data.industry === selectedIndustry
  ) || industryToolData[3]; // Default to Legal (NDA)

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            {t('landing.intentDetection.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.intentDetection.title')}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> {t('landing.intentDetection.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.intentDetection.subtitle')}
          </p>
        </motion.div>

        {/* Industry Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-16 max-w-4xl mx-auto"
        >
          {industryToolData.map((data, index) => (
            <motion.button
              key={data.industry}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * index }}
              onClick={() => setSelectedIndustry(data.industry)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                selectedIndustry === data.industry
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gray-900/50 border border-gray-800 text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {data.industry}
            </motion.button>
          ))}
        </motion.div>

        {/* Side-by-Side Comparison */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Traditional AI Chatbots - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t('landing.intentDetection.traditionalAI')}</h3>
                  <p className="text-gray-500 text-sm">{t('landing.intentDetection.textOnlyResponses')}</p>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-6 space-y-4">
                {/* User Message */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`user-${selectedIndustry}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end"
                  >
                    <div className="bg-gray-800 rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                      <p className="text-white text-sm">{currentIndustryData.example.userMessage}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Bot Response */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`response-${selectedIndustry}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-800/50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[90%] border border-gray-700">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {currentIndustryData.example.traditionalResponse}
                      </p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-gray-500 text-sm mt-2"
                      >
                        typing...
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Warning */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mt-4"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">
                    {t('landing.intentDetection.separateToolWarning')}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Wants - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-lg" />

            <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/30 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">Wants</h3>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-emerald-400 text-sm">{t('landing.intentDetection.intentContextualUI')}</p>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-6 space-y-4">
                {/* User Message */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`wants-user-${selectedIndustry}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end"
                  >
                    <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                      <p className="text-white text-sm">{currentIndustryData.example.userMessage}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Intent Detection Badge */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`intent-${selectedIndustry}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      <Brain className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-medium">{t('landing.intentDetection.intentDetected')}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="text-cyan-400 text-xs font-medium">{currentIndustryData.example.intentLabel}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Dynamic Tool UI */}
                <AnimatePresence mode="wait">
                  <div key={`tool-${selectedIndustry}`}>
                    {getToolUI(selectedIndustry, currentIndustryData.example)}
                  </div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-500 text-sm mt-12 max-w-2xl mx-auto"
        >
          {t('landing.intentDetection.bottomNote')}
        </motion.p>
      </div>
    </section>
  );
};

export default IntentDetection;
