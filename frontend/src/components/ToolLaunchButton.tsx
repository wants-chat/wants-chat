import React from 'react';
import {
  Calculator,
  Code,
  Lock,
  Link,
  Hash,
  Key,
  Activity,
  Percent,
  Tag,
  Calendar,
  Thermometer,
  Ruler,
  Scale,
  Clock,
  Palette,
  QrCode,
  AlignLeft,
  Eye,
  Type,
  Shield,
  ArrowRight,
  Home,
  Banknote,
  Receipt,
  CalendarRange,
  DollarSign,
  Timer,
  Binary,
  Ratio,
  Globe,
  AlarmClock,
  Image,
  FileText,
  Pipette,
  GitCompare,
  Code2
} from 'lucide-react';
import { UIConfig } from './ContextualUI';

// Icon mapping for tool IDs
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Text Tools
  'json-formatter': Code,
  'case-converter': Type,
  'word-counter': Hash,
  'markdown-preview': Eye,
  'regex-tester': Code2,
  'diff-checker': GitCompare,
  'html-preview': Code,
  'csv-json-converter': FileText,
  // Encoding Tools
  'base64': Lock,
  'url-encoder': Link,
  'hash-generator': Shield,
  'uuid-generator': Key,
  // Calculators
  'bmi-calculator': Activity,
  'percentage-calculator': Percent,
  'discount-calculator': Tag,
  'age-calculator': Calendar,
  'tip-calculator': Receipt,
  'mortgage-calculator': Home,
  'loan-calculator': Banknote,
  'date-diff-calculator': CalendarRange,
  // Unit Converters
  'temperature-converter': Thermometer,
  'length-converter': Ruler,
  'weight-converter': Scale,
  'time-converter': Clock,
  'color-converter': Palette,
  'currency-converter': DollarSign,
  'timestamp-converter': Timer,
  'number-base-converter': Binary,
  'aspect-ratio-calculator': Ratio,
  // Generators
  'qr-generator': QrCode,
  'password-generator': Lock,
  'lorem-ipsum': AlignLeft,
  'random-number': Hash,
  'gradient-generator': Palette,
  // Date & Time Tools
  'stopwatch': Timer,
  'countdown-timer': AlarmClock,
  'pomodoro-timer': Clock,
  'world-clock': Globe,
  // Image/Media Tools
  'image-resizer': Image,
  'image-compressor': Image,
  'color-picker': Pipette,
  // Generic type icons
  'calculator': Calculator,
  'converter': Ruler,
  'generator': Key,
  'encoder': Lock,
  'image-tool': Image,
};

interface ToolLaunchButtonProps {
  uiConfig: UIConfig;
  onClick: () => void;
}

export const ToolLaunchButton: React.FC<ToolLaunchButtonProps> = ({ uiConfig, onClick }) => {
  const toolId = uiConfig.toolId || uiConfig.type;
  const IconComponent = iconMap[toolId] || iconMap[uiConfig.type] || Calculator;

  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#0D9488]/30 hover:scale-[1.02]"
    >
      <div className="p-1.5 bg-white/20 rounded-lg">
        <IconComponent className="w-4 h-4" />
      </div>
      <span className="font-medium">Open {uiConfig.title}</span>
      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
    </button>
  );
};

// Compact version for inline use
export const ToolLaunchChip: React.FC<ToolLaunchButtonProps> = ({ uiConfig, onClick }) => {
  const toolId = uiConfig.toolId || uiConfig.type;
  const IconComponent = iconMap[toolId] || iconMap[uiConfig.type] || Calculator;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/20 hover:bg-[#0D9488]/30 text-[#0D9488] rounded-lg transition-all text-sm font-medium border border-[#0D9488]/30"
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{uiConfig.title}</span>
    </button>
  );
};
