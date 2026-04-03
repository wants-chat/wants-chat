/**
 * ToolsModal Component
 * Shows all available tools organized by categories with search and pin functionality
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { usePinnedTools } from '../contexts/PinnedToolsContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import {
  X,
  Search,
  Pin,
  PinOff,
  ChevronRight,
  Check,
  Send,
  Calculator,
  Code,
  Code2,
  Type,
  Lock,
  Repeat,
  Sparkles,
  Clock,
  Image,
  PenTool,
  Palette,
  Briefcase,
  Megaphone,
  Heart,
  Activity,
  DollarSign,
  ChefHat,
  Home,
  Flower,
  Car,
  PawPrint,
  Plane,
  Star,
  GraduationCap,
  Music,
  Scissors,
  Gamepad2,
  CheckSquare,
  Building2,
  UserCheck,
  Cloud,
  Grid3X3,
  Wrench,
  // Additional icons for tools
  Hash,
  Eye,
  GitCompare,
  FileJson,
  FlipHorizontal,
  SortAsc,
  Replace,
  Filter,
  FileDiff,
  Link,
  Shield,
  Key,
  Binary,
  Percent,
  Tag,
  Calendar,
  Receipt,
  Banknote,
  CalendarRange,
  BarChart,
  FunctionSquare,
  Landmark,
  Divide,
  Ratio,
  Thermometer,
  Ruler,
  Scale,
  Timer,
  Footprints,
  HardDrive,
  Gauge,
  QrCode,
  AlignLeft,
  Wifi,
  Barcode,
  User,
  Text,
  AlarmClock,
  Globe,
  CalendarCheck,
  Cake,
  FileMinus,
  Pipette,
  Wand2,
  Eraser,
  Maximize,
  Droplets,
  Stamp,
  Paintbrush,
  Trash2,
  RefreshCw,
  Droplet,
  Film,
  Scan,
  Mail,
  BookOpen,
  Newspaper,
  Share2,
  Languages,
  SpellCheck,
  FileText,
  Linkedin,
  Mic,
  Book,
  Quote,
  Hexagon,
  Video,
  UserCircle,
  Layout,
  Box,
  PieChart,
  FileSpreadsheet,
  Presentation,
  TrendingUp,
  Target,
  Lightbulb,
  MessageSquare,
  Bot,
  Brain,
  Zap,
  Network,
  Database,
  Server,
  Terminal,
  GitBranch,
  FileCode,
  Bug,
  TestTube,
  Package,
  Settings,
  Stethoscope,
  Apple,
  Moon,
  Bed,
  Dumbbell,
  Bike,
  Trophy,
  Flame,
  Footprints as Running,
  Waves,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingDown,
  LineChart,
  Beef,
  Coffee,
  Cookie,
  UtensilsCrossed,
  Hammer,
  Paintbrush as Paint,
  Sofa,
  Lightbulb as LightbulbIcon,
  Droplet as WaterDrop,
  Leaf,
  TreePine,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Fuel,
  Wrench as CarWrench,
  Truck,
  Dog,
  Cat,
  Fish,
  Bird,
  MapPin,
  Compass,
  Luggage,
  Hotel,
  Camera,
  Umbrella,
  Gem,
  Gift,
  CalendarDays,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Tv,
  BookMarked,
  Pencil,
  Puzzle,
  Dice1,
  Spade,
  PartyPopper,
  ListTodo,
  ClipboardList,
  FolderKanban,
  Users,
  Building,
  Store,
  Factory,
  Gavel,
  Sticker,
  FileCheck,
  FileSignature,
  Clipboard,
  BadgeCheck,
  UserPlus,
  CalendarClock,
  Phone,
  AtSign,
  Bell,
  AlertCircle,
  Info,
  HelpCircle,
  CircleDollarSign,
  Coins,
  Receipt as ReceiptIcon,
  ShoppingCart,
  ShoppingBag,
  Package as PackageIcon,
  Boxes,
  Archive,
  FolderOpen,
  Files,
  Layers,
  LayoutGrid,
  LayoutList,
  Table,
  Rows,
  Columns,
  SlidersHorizontal,
  Sliders,
  ToggleLeft,
  Power,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Mic2,
  MicOff,
  Radio,
  Podcast,
  Guitar,
  Piano,
  Drum,
  Clapperboard,
  Popcorn,
  Ticket,
  Trophy as TrophyIcon,
  Medal,
  Award,
  Crown,
  Swords,
  Shield as ShieldIcon,
  Rocket,
  Satellite,
  Mountain,
  Tent,
  Backpack,
  Map,
  Navigation,
  Anchor,
  Ship,
  Train,
  Bus,
  CarFront,
  Bike as BikeIcon,
  Footprints as Walk,
  Accessibility,
  Baby,
  PersonStanding,
  Shirt,
  ShirtIcon,
  Glasses,
  Hand,
  Fingerprint,
  Eye as EyeIcon,
  Ear,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  HeartHandshake,
  Handshake,
  ClipboardCheck,
  ListChecks,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Lock as LockIcon,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  UserCog,
  Settings2,
  Cog,
} from 'lucide-react';
import { useTools, ToolData, ToolCategory } from '../hooks/useTools';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string, title: string, type: string) => void;
}

// Icon mapping for categories
const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'text-tools': Type,
  'encoding': Lock,
  'calculators': Calculator,
  'converters': Repeat,
  'generators': Sparkles,
  'date-time': Clock,
  'image-tools': Image,
  'ai-writing': PenTool,
  'ai-creative': Palette,
  'ai-business': Briefcase,
  'ai-marketing': Megaphone,
  'developer': Code,
  'health-wellness': Heart,
  'fitness-sports': Activity,
  'finance': DollarSign,
  'cooking': ChefHat,
  'home-diy': Home,
  'gardening': Flower,
  'automotive': Car,
  'pet-care': PawPrint,
  'travel': Plane,
  'lifestyle': Star,
  'education': GraduationCap,
  'music': Music,
  'crafts': Scissors,
  'entertainment': Gamepad2,
  'productivity': CheckSquare,
  'business': Building2,
  'professional': UserCheck,
  'weather': Cloud,
  'photography': Image,
};

// Comprehensive icon mapping for all tools
const getToolIcon = (iconName: string): React.ComponentType<{ className?: string }> => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Basic
    'calculator': Calculator,
    'code': Code,
    'code-2': Code2,
    'type': Type,
    'lock': Lock,
    'sparkles': Sparkles,
    'clock': Clock,
    'image': Image,
    'palette': Palette,
    'heart': Heart,
    'activity': Activity,
    'home': Home,
    'car': Car,
    'star': Star,
    'music': Music,
    'wrench': Wrench,

    // Text tools
    'hash': Hash,
    'eye': Eye,
    'git-compare': GitCompare,
    'file-json': FileJson,
    'flip-horizontal': FlipHorizontal,
    'sort-asc': SortAsc,
    'replace': Replace,
    'filter': Filter,
    'file-diff': FileDiff,
    'regex': Code2,

    // Encoding
    'link': Link,
    'shield': Shield,
    'key': Key,
    'binary': Binary,

    // Calculators
    'percent': Percent,
    'tag': Tag,
    'calendar': Calendar,
    'receipt': Receipt,
    'banknote': Banknote,
    'calendar-range': CalendarRange,
    'bar-chart': BarChart,
    'function-square': FunctionSquare,
    'landmark': Landmark,
    'graduation-cap': GraduationCap,
    'divide': Divide,
    'ratio': Ratio,

    // Converters
    'thermometer': Thermometer,
    'ruler': Ruler,
    'scale': Scale,
    'timer': Timer,
    'dollar-sign': DollarSign,
    'footprints': Footprints,
    'hard-drive': HardDrive,
    'gauge': Gauge,
    'chef-hat': ChefHat,

    // Generators
    'qr-code': QrCode,
    'align-left': AlignLeft,
    'wifi': Wifi,
    'barcode': Barcode,
    'user': User,
    'text': Text,
    'pen-tool': PenTool,

    // Date & Time
    'alarm-clock': AlarmClock,
    'globe': Globe,
    'calendar-check': CalendarCheck,
    'cake': Cake,
    'users': Users,

    // Image tools
    'file-minus': FileMinus,
    'pipette': Pipette,
    'wand-2': Wand2,
    'eraser': Eraser,
    'maximize': Maximize,
    'droplets': Droplets,
    'stamp': Stamp,
    'paintbrush': Paintbrush,
    'trash-2': Trash2,
    'refresh-cw': RefreshCw,
    'droplet': Droplet,
    'film': Film,
    'scan': Scan,

    // AI Writing
    'mail': Mail,
    'book-open': BookOpen,
    'newspaper': Newspaper,
    'share-2': Share2,
    'repeat': Repeat,
    'languages': Languages,
    'spell-check': SpellCheck,
    'file-text': FileText,
    'linkedin': Linkedin,
    'mic': Mic,
    'book': Book,
    'quote': Quote,

    // AI Creative
    'hexagon': Hexagon,
    'video': Video,
    'user-circle': UserCircle,
    'layout': Layout,
    'box': Box,

    // AI Business
    'pie-chart': PieChart,
    'file-spreadsheet': FileSpreadsheet,
    'presentation': Presentation,
    'trending-up': TrendingUp,
    'target': Target,
    'lightbulb': Lightbulb,
    'message-square': MessageSquare,
    'briefcase': Briefcase,

    // AI Marketing
    'megaphone': Megaphone,
    'bot': Bot,

    // Developer
    'brain': Brain,
    'zap': Zap,
    'network': Network,
    'database': Database,
    'server': Server,
    'terminal': Terminal,
    'git-branch': GitBranch,
    'file-code': FileCode,
    'bug': Bug,
    'test-tube': TestTube,
    'package': Package,
    'settings': Settings,

    // Health & Wellness
    'stethoscope': Stethoscope,
    'apple': Apple,
    'moon': Moon,
    'bed': Bed,

    // Fitness & Sports
    'dumbbell': Dumbbell,
    'bike': Bike,
    'trophy': Trophy,
    'flame': Flame,
    'waves': Waves,

    // Finance
    'credit-card': CreditCard,
    'wallet': Wallet,
    'piggy-bank': PiggyBank,
    'trending-down': TrendingDown,
    'line-chart': LineChart,
    'coins': Coins,

    // Cooking
    'beef': Beef,
    'coffee': Coffee,
    'cookie': Cookie,
    'utensils-crossed': UtensilsCrossed,

    // Home & DIY
    'hammer': Hammer,
    'paint': Paintbrush,
    'sofa': Sofa,
    'water-drop': Droplet,

    // Gardening
    'flower': Flower,
    'leaf': Leaf,
    'tree-pine': TreePine,
    'sun': Sun,
    'cloud-rain': CloudRain,
    'snowflake': Snowflake,
    'wind': Wind,
    'cloud': Cloud,

    // Automotive
    'fuel': Fuel,
    'car-wrench': Wrench,
    'truck': Truck,
    'car-front': CarFront,

    // Pet Care
    'paw-print': PawPrint,
    'dog': Dog,
    'cat': Cat,
    'fish': Fish,
    'bird': Bird,

    // Travel
    'plane': Plane,
    'map-pin': MapPin,
    'compass': Compass,
    'luggage': Luggage,
    'hotel': Hotel,
    'camera': Camera,
    'umbrella': Umbrella,
    'map': Map,
    'navigation': Navigation,
    'anchor': Anchor,
    'ship': Ship,
    'train': Train,
    'bus': Bus,

    // Lifestyle
    'gem': Gem,
    'gift': Gift,
    'calendar-days': CalendarDays,
    'smartphone': Smartphone,
    'laptop': Laptop,
    'watch': Watch,
    'headphones': Headphones,
    'tv': Tv,

    // Education
    'book-marked': BookMarked,
    'pencil': Pencil,

    // Entertainment
    'gamepad-2': Gamepad2,
    'puzzle': Puzzle,
    'dice-1': Dice1,
    'spade': Spade,
    'party-popper': PartyPopper,
    'clapperboard': Clapperboard,
    'popcorn': Popcorn,
    'ticket': Ticket,

    // Music
    'radio': Radio,
    'podcast': Podcast,
    'guitar': Guitar,
    'piano': Piano,
    'drum': Drum,
    'volume-2': Volume2,
    'mic-2': Mic2,

    // Productivity
    'check-square': CheckSquare,
    'list-todo': ListTodo,
    'clipboard-list': ClipboardList,
    'folder-kanban': FolderKanban,
    'clipboard-check': ClipboardCheck,
    'list-checks': ListChecks,

    // Business
    'building-2': Building2,
    'building': Building,
    'store': Store,
    'factory': Factory,
    'gavel': Gavel,

    // Professional
    'user-check': UserCheck,
    'badge-check': BadgeCheck,
    'user-plus': UserPlus,
    'user-cog': UserCog,
    'file-check': FileCheck,
    'file-signature': FileSignature,
    'clipboard': Clipboard,

    // Communication
    'phone': Phone,
    'at-sign': AtSign,
    'send': Send,
    'bell': Bell,

    // Status
    'alert-circle': AlertCircle,
    'info': Info,
    'help-circle': HelpCircle,
    'check-circle': CheckCircle,
    'x-circle': XCircle,
    'alert-triangle': AlertTriangle,

    // Security
    'shield-check': ShieldCheck,
    'shield-alert': ShieldAlert,
    'unlock': Unlock,
    'key-round': KeyRound,

    // Sports & Games
    'medal': Medal,
    'award': Award,
    'crown': Crown,
    'swords': Swords,
    'rocket': Rocket,
    'mountain': Mountain,
    'tent': Tent,
    'backpack': Backpack,

    // UI
    'grid-3x3': Grid3X3,
    'layout-grid': LayoutGrid,
    'layout-list': LayoutList,
    'table': Table,
    'layers': Layers,
    'sliders': Sliders,
    'sliders-horizontal': SlidersHorizontal,

    // Misc
    'scissors': Scissors,
    'hand': Hand,
    'fingerprint': Fingerprint,
    'smile': Smile,
    'thumbs-up': ThumbsUp,
    'handshake': Handshake,
    'shopping-cart': ShoppingCart,
    'shopping-bag': ShoppingBag,
    'archive': Archive,
    'folder-open': FolderOpen,
    'files': Files,
    'boxes': Boxes,
    'cog': Cog,
    'settings-2': Settings2,
  };
  return iconMap[iconName] || Grid3X3;
};

export const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose, onSelectTool }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { pinnedTools, pinTool, unpinTool, isPinned } = usePinnedTools();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('pinned');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [toolDescription, setToolDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch tools from backend API (single source of truth)
  const {
    tools: allTools,
    categories: toolCategories,
    searchTools,
    getToolsByCategory,
  } = useTools();

  // Convert kebab-case tool ID to camelCase for i18n key lookup
  const toolIdToKey = (id: string) => id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  // Get translated tool title
  const getToolTitle = (tool: { id: string; title: string }) => {
    const key = toolIdToKey(tool.id);
    const translated = t(`toolComponents.${key}.title`, { defaultValue: '' });
    return translated || tool.title;
  };

  // Get translated tool description
  const getToolDescription = (tool: { id: string; description: string }) => {
    const key = toolIdToKey(tool.id);
    const translated = t(`toolComponents.${key}.description`, { defaultValue: '' });
    return translated || tool.description;
  };

  // Get translated category name
  const getCategoryName = (category: { id: string; name: string }) => {
    return t(`categories.${category.id}`, { defaultValue: category.name });
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Get filtered tools based on search and category
  const filteredTools = useMemo(() => {
    if (searchQuery.trim()) {
      return searchTools(searchQuery);
    }
    if (selectedCategory === 'pinned') {
      return pinnedTools.map(pt => allTools.find(t => t.id === pt.toolId)).filter(Boolean) as ToolData[];
    }
    if (selectedCategory === 'all') {
      return allTools;
    }
    if (selectedCategory) {
      return getToolsByCategory(selectedCategory);
    }
    return allTools;
  }, [searchQuery, selectedCategory, pinnedTools]);

  // Handle pin/unpin
  const handleTogglePin = (tool: ToolData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned(tool.id)) {
      unpinTool(tool.id);
    } else {
      pinTool({
        toolId: tool.id,
        title: tool.title,
        description: tool.description,
        icon: tool.icon,
        type: tool.type,
      });
    }
  };

  // Handle tool selection - don't close modal so user can browse more tools
  const handleSelectTool = (tool: ToolData) => {
    onSelectTool(tool.id, tool.title, tool.type);
    // Modal stays open so user can select more tools
  };

  // Handle request form submission
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolDescription.trim()) return;

    setIsSubmitting(true);

    // Simulate API call - in production, this would call your backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset after showing success
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowRequestForm(false);
      setToolDescription('');
    }, 2000);
  };

  // Reset request form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowRequestForm(false);
      setToolDescription('');
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-5xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col",
          theme === 'dark'
            ? 'bg-[#1a1a1a] border border-[#2a2a2a]'
            : 'bg-white border border-gray-200'
        )}
      >
        {/* Header */}
        <div className={cn(
          "px-6 py-4 border-b",
          theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200'
        )}>
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title and count */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="p-2 bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-xl">
                <Grid3X3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={cn(
                  "text-xl font-bold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {t('toolsModal.allTools')}
                </h2>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                )}>
                  {t('toolsModal.toolsAvailable', { count: allTools.length })}
                </p>
              </div>
            </div>

            {/* Center: Request text and button */}
            <div className="hidden lg:flex items-center gap-4 flex-1 justify-end mr-4">
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              )}>
                <span className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>{t('toolsModal.cantFindWhatYouNeed')}</span>{' '}
                <span className="text-[#0D9488]">{t('toolsModal.requestDescription')}</span>
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white rounded-lg font-medium text-sm hover:from-[#0F766E] hover:to-[#115E59] transition-all shadow-md shadow-[#0D9488]/20 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                {t('toolsModal.requestATool')}
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl transition-colors flex-shrink-0",
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-slate-400'
                  : 'hover:bg-gray-100 text-gray-500'
              )}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile: Request section */}
          <div className={cn(
            "lg:hidden mt-3 pt-3 border-t flex items-center justify-between gap-3",
            theme === 'dark' ? 'border-[#2a2a2a]/50' : 'border-gray-200/50'
          )}>
            <p className={cn(
              "text-xs",
              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
            )}>
              <span className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>{t('toolsModal.cantFindWhatYouNeed')}</span>{' '}
              <span className="text-[#0D9488]">{t('toolsModal.requestAToolMobile')}</span>
            </p>
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white rounded-lg font-medium text-xs hover:from-[#0F766E] hover:to-[#115E59] transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3" />
              {t('toolsModal.request')}
            </button>
          </div>

          {/* Search - Now below the header */}
          <div className="mt-4">
            <div className={cn(
              "relative flex items-center rounded-xl border transition-colors",
              theme === 'dark'
                ? 'bg-[#2a2a2a] border-[#3a3a3a] focus-within:border-[#0D9488]'
                : 'bg-gray-50 border-gray-200 focus-within:border-[#0D9488]'
            )}>
              <Search className={cn(
                "w-5 h-5 ml-3",
                theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
              )} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('toolsModal.searchTools')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "flex-1 px-3 py-2.5 bg-transparent outline-none text-sm",
                  theme === 'dark'
                    ? 'text-white placeholder:text-slate-500'
                    : 'text-gray-900 placeholder:text-gray-400'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={cn(
                    "p-1.5 mr-2 rounded-lg transition-colors",
                    theme === 'dark' ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-200'
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Request Form Modal Overlay */}
        {showRequestForm && (
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center p-4"
            onClick={() => setShowRequestForm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "rounded-2xl border p-6 max-w-md w-full shadow-2xl",
                theme === 'dark'
                  ? 'bg-[#1a1a1a] border-[#2a2a2a]'
                  : 'bg-white border-gray-200'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn(
                  "text-lg font-bold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {t('toolsModal.requestATool')}
                </h3>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className={cn(
                    "p-1 rounded-lg transition-colors",
                    theme === 'dark'
                      ? 'text-slate-400 hover:bg-[#2a2a2a] hover:text-white'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className={cn(
                "text-sm mb-4",
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              )}>
                {t('toolsModal.describeTheTool')} <span className="font-medium text-[#0D9488]">{user?.email || t('toolsModal.yourEmail')}</span>.
              </p>

              {submitSuccess ? (
                <div className="flex flex-col items-center py-6">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center mb-3",
                    theme === 'dark' ? 'bg-[#0D9488]/20' : 'bg-[#0D9488]/10'
                  )}>
                    <Check className="w-7 h-7 text-[#0D9488]" />
                  </div>
                  <h4 className={cn(
                    "text-lg font-medium mb-1",
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {t('toolsModal.requestSubmitted')}
                  </h4>
                  <p className={cn(
                    "text-sm text-center",
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                  )}>
                    {t('toolsModal.weWillReview')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-1.5",
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    )}>
                      {t('toolsModal.toolNameDescription')}
                    </label>
                    <textarea
                      value={toolDescription}
                      onChange={(e) => setToolDescription(e.target.value)}
                      placeholder={t('toolsModal.toolDescriptionPlaceholder')}
                      required
                      rows={3}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-colors resize-none",
                        theme === 'dark'
                          ? 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder-slate-500 focus:border-[#0D9488] focus:ring-[#0D9488]'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0D9488] focus:ring-[#0D9488]'
                      )}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !toolDescription.trim()}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white rounded-xl font-bold hover:from-[#0F766E] hover:to-[#115E59] transition-all shadow-lg shadow-[#0D9488]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('toolsModal.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t('toolsModal.submitRequest')}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Categories Sidebar */}
          <div className={cn(
            "w-64 border-r overflow-y-auto flex-shrink-0",
            theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200'
          )}>
            <div className="p-3 space-y-1">
              {/* Pinned Tools */}
              <button
                onClick={() => {
                  setSelectedCategory('pinned');
                  setSearchQuery('');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  selectedCategory === 'pinned'
                    ? 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-lg shadow-[#0D9488]/25'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-[#2a2a2a]'
                      : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Pin className="w-4 h-4" />
                <span>{t('toolsModal.pinnedTools')}</span>
                {pinnedTools.length > 0 && (
                  <span className={cn(
                    "ml-auto text-xs px-2 py-0.5 rounded-full",
                    selectedCategory === 'pinned'
                      ? 'bg-white/20'
                      : theme === 'dark' ? 'bg-[#0D9488]/20 text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]'
                  )}>
                    {pinnedTools.length}
                  </span>
                )}
              </button>

              {/* All Tools */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-lg shadow-[#0D9488]/25'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-[#2a2a2a]'
                      : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>{t('toolsModal.allTools')}</span>
                <span className={cn(
                  "ml-auto text-xs px-2 py-0.5 rounded-full",
                  selectedCategory === 'all'
                    ? 'bg-white/20'
                    : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                )}>
                  {allTools.length}
                </span>
              </button>

              {/* Divider */}
              <div className={cn(
                "h-px mx-2 my-2",
                theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-200'
              )} />

              {/* Category List */}
              {toolCategories.map((category) => {
                const IconComponent = categoryIconMap[category.id] || Calculator;
                const toolCount = getToolsByCategory(category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-lg shadow-[#0D9488]/25'
                        : theme === 'dark'
                          ? 'text-slate-300 hover:bg-[#2a2a2a]'
                          : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="truncate">{getCategoryName(category)}</span>
                    <span className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                      selectedCategory === category.id
                        ? 'bg-white/20'
                        : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                    )}>
                      {toolCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {searchQuery && (
              <div className={cn(
                "mb-4 text-sm",
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              )}>
                {t('toolsModal.resultsFor', { count: filteredTools.length, query: searchQuery })}
              </div>
            )}

            {selectedCategory === 'pinned' && pinnedTools.length === 0 && !searchQuery ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'
                )}>
                  <Pin className={cn(
                    "w-8 h-8",
                    theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                  )} />
                </div>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {t('toolsModal.noPinnedTools')}
                </h3>
                <p className={cn(
                  "text-sm text-center max-w-xs",
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                )}>
                  {t('toolsModal.noPinnedToolsDescription')}
                </p>
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'
                )}>
                  <Search className={cn(
                    "w-8 h-8",
                    theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                  )} />
                </div>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {t('toolsModal.noToolsFound')}
                </h3>
                <p className={cn(
                  "text-sm text-center max-w-xs",
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                )}>
                  {t('toolsModal.noToolsFoundDescription')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTools.map((tool) => {
                  const pinned = isPinned(tool.id);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleSelectTool(tool)}
                      className={cn(
                        "group relative p-4 rounded-xl border cursor-pointer transition-all duration-200",
                        theme === 'dark'
                          ? 'bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#0D9488] hover:bg-[#2f2f2f]'
                          : 'bg-white border-gray-200 hover:border-[#0D9488] hover:shadow-md'
                      )}
                    >
                      {/* Pin indicator */}
                      {pinned && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                        </div>
                      )}

                      {/* Tool Icon */}
                      {(() => {
                        const ToolIcon = getToolIcon(tool.icon);
                        return (
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
                            theme === 'dark'
                              ? 'bg-[#0D9488]/10 text-[#0D9488]'
                              : 'bg-[#0D9488]/10 text-[#0D9488] group-hover:bg-[#0D9488] group-hover:text-white'
                          )}>
                            <ToolIcon className="w-5 h-5" />
                          </div>
                        );
                      })()}

                      {/* Tool Info */}
                      <h4 className={cn(
                        "font-semibold text-sm mb-1 line-clamp-1",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {getToolTitle(tool)}
                      </h4>
                      <p className={cn(
                        "text-xs line-clamp-2",
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                      )}>
                        {getToolDescription(tool)}
                      </p>

                      {/* Pin Button - visible on hover */}
                      <button
                        onClick={(e) => handleTogglePin(tool, e)}
                        className={cn(
                          "absolute bottom-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200",
                          pinned
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                              ? 'bg-[#3a3a3a] hover:bg-[#0D9488] text-slate-400 hover:text-white'
                              : 'bg-gray-100 hover:bg-[#0D9488] text-gray-500 hover:text-white'
                        )}
                        title={pinned ? t('toolsModal.unpinTool') : t('toolsModal.pinToSidebar')}
                      >
                        {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "px-6 py-3 border-t flex items-center justify-between",
          theme === 'dark' ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-gray-200 bg-gray-50'
        )}>
          <div className={cn(
            "text-sm",
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            <span className="font-medium text-[#0D9488]">{pinnedTools.length}</span> {t('toolsModal.toolsPinned')}
          </div>
          <div className={cn(
            "text-xs",
            theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
          )}>
            {t('toolsModal.pressEscToClose')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsModal;
