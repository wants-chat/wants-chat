'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Paintbrush,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Camera,
  FileText,
  DollarSign,
  Package,
  ClipboardList,
  Ruler,
  Home,
  Sun,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Users,
  Palette,
  ShieldCheck,
  Armchair,
  Plus,
  Trash2,
  Save,
  Download,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Edit,
  Square,
  Loader2,
} from 'lucide-react';

// Types
interface RoomMeasurement {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  wallArea: number;
  ceilingArea: number;
  windows: number;
  doors: number;
  includesCeiling: boolean;
  includesTrim: boolean;
  notes: string;
}

interface PaintSpecification {
  id: string;
  brand: string;
  productName: string;
  color: string;
  colorCode: string;
  finish: 'flat' | 'matte' | 'eggshell' | 'satin' | 'semi-gloss' | 'gloss';
  coverage: number;
  pricePerGallon: number;
  gallonsNeeded: number;
  totalCost: number;
  application: 'walls' | 'ceiling' | 'trim' | 'exterior' | 'primer';
}

interface PrepWorkItem {
  id: string;
  task: string;
  completed: boolean;
  notes: string;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
}

interface PhotoEntry {
  id: string;
  type: 'before' | 'after';
  room: string;
  description: string;
  timestamp: string;
}

interface MaterialOrder {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  ordered: boolean;
  received: boolean;
}

interface FurnitureProtection {
  id: string;
  item: string;
  location: string;
  action: 'move' | 'cover' | 'remove';
  notes: string;
}

interface WeatherConsideration {
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: boolean;
  suitable: boolean;
  notes: string;
}

interface ColorConsultation {
  date: string;
  consultant: string;
  primaryColors: string[];
  accentColors: string[];
  recommendations: string;
  customerPreferences: string;
  finalSelections: string;
}

interface PaintingProject {
  id: string;
  // Customer Info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyType: 'residential' | 'commercial' | 'industrial';
  // Project Details
  projectType: 'interior' | 'exterior' | 'both';
  projectStatus: 'estimate' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  // Measurements
  rooms: RoomMeasurement[];
  totalWallArea: number;
  totalCeilingArea: number;
  // Surface Prep
  surfaceCondition: string;
  prepNotes: string;
  prepChecklist: PrepWorkItem[];
  // Paint Specs
  paintSpecifications: PaintSpecification[];
  // Crew
  crewMembers: CrewMember[];
  // Color Consultation
  colorConsultation: ColorConsultation;
  // Furniture Protection
  furnitureProtection: FurnitureProtection[];
  // Weather (Exterior)
  weatherConsiderations: WeatherConsideration[];
  // Materials
  materialOrders: MaterialOrder[];
  // Photos
  photos: PhotoEntry[];
  // Estimate
  laborCost: number;
  materialsCost: number;
  equipmentCost: number;
  overhead: number;
  profit: number;
  taxRate: number;
  estimatedTotal: number;
  deposit: number;
  depositPaid: boolean;
  // Notes
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const PREP_CHECKLIST_ITEMS = [
  'Remove outlet/switch covers',
  'Fill nail holes and cracks',
  'Sand rough surfaces',
  'Clean walls/surfaces',
  'Apply primer to stains',
  'Tape off trim and edges',
  'Lay drop cloths',
  'Cover fixtures',
  'Remove wall hangings',
  'Scrape loose paint',
  'Repair drywall damage',
  'Caulk gaps and seams',
  'Degloss shiny surfaces',
  'Apply primer coat',
  'Power wash exterior',
];

const PAINT_FINISHES = [
  { value: 'flat', label: 'Flat' },
  { value: 'matte', label: 'Matte' },
  { value: 'eggshell', label: 'Eggshell' },
  { value: 'satin', label: 'Satin' },
  { value: 'semi-gloss', label: 'Semi-Gloss' },
  { value: 'gloss', label: 'Gloss' },
];

const PAINT_BRANDS = [
  'Benjamin Moore',
  'Sherwin-Williams',
  'Behr',
  'PPG',
  'Valspar',
  'Dunn-Edwards',
  'Farrow & Ball',
  'Pratt & Lambert',
  'Other',
];

// Export columns for projects
const PROJECT_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'propertyAddress', header: 'Address', type: 'string' },
  { key: 'propertyCity', header: 'City', type: 'string' },
  { key: 'propertyState', header: 'State', type: 'string' },
  { key: 'propertyZip', header: 'Zip', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'projectType', header: 'Project Type', type: 'string' },
  { key: 'projectStatus', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'totalWallArea', header: 'Wall Area (sq ft)', type: 'number' },
  { key: 'totalCeilingArea', header: 'Ceiling Area (sq ft)', type: 'number' },
  { key: 'laborCost', header: 'Labor Cost', type: 'currency' },
  { key: 'materialsCost', header: 'Materials Cost', type: 'currency' },
  { key: 'equipmentCost', header: 'Equipment Cost', type: 'currency' },
  { key: 'estimatedTotal', header: 'Estimated Total', type: 'currency' },
  { key: 'deposit', header: 'Deposit', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const createEmptyProject = (): PaintingProject => ({
  id: generateId(),
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  propertyAddress: '',
  propertyCity: '',
  propertyState: '',
  propertyZip: '',
  propertyType: 'residential',
  projectType: 'interior',
  projectStatus: 'estimate',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  rooms: [],
  totalWallArea: 0,
  totalCeilingArea: 0,
  surfaceCondition: '',
  prepNotes: '',
  prepChecklist: PREP_CHECKLIST_ITEMS.map(task => ({
    id: generateId(),
    task,
    completed: false,
    notes: '',
  })),
  paintSpecifications: [],
  crewMembers: [],
  colorConsultation: {
    date: '',
    consultant: '',
    primaryColors: [],
    accentColors: [],
    recommendations: '',
    customerPreferences: '',
    finalSelections: '',
  },
  furnitureProtection: [],
  weatherConsiderations: [],
  materialOrders: [],
  photos: [],
  laborCost: 0,
  materialsCost: 0,
  equipmentCost: 0,
  overhead: 10,
  profit: 15,
  taxRate: 0,
  estimatedTotal: 0,
  deposit: 0,
  depositPaid: false,
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

interface PaintingContractorToolProps {
  uiConfig?: UIConfig;
}

export const PaintingContractorTool = ({ uiConfig }: PaintingContractorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: projects,
    setData: setProjects,
    addItem: addProject,
    updateItem: updateProject,
    deleteItem: deleteProjectFromHook,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PaintingProject>('painting-contractor', [], PROJECT_COLUMNS);

  const [currentProject, setCurrentProject] = useState<PaintingProject>(createEmptyProject());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true,
    measurements: false,
    surface: false,
    paint: false,
    crew: false,
    color: false,
    furniture: false,
    weather: false,
    materials: false,
    photos: false,
    estimate: false,
  });
  const [savedMessage, setSavedMessage] = useState('');

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.customerName) {
        setCurrentProject(prev => ({ ...prev, customerName: params.customerName as string }));
        hasChanges = true;
      }
      if (params.phone) {
        setCurrentProject(prev => ({ ...prev, customerPhone: params.phone as string }));
        hasChanges = true;
      }
      if (params.address) {
        setCurrentProject(prev => ({ ...prev, serviceAddress: params.address as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate totals
  const totalWallArea = useMemo(() => {
    return currentProject.rooms.reduce((sum, room) => sum + room.wallArea, 0);
  }, [currentProject.rooms]);

  const totalCeilingArea = useMemo(() => {
    return currentProject.rooms.reduce((sum, room) => room.includesCeiling ? sum + room.ceilingArea : sum, 0);
  }, [currentProject.rooms]);

  const paintCosts = useMemo(() => {
    return currentProject.paintSpecifications.reduce((sum, spec) => sum + spec.totalCost, 0);
  }, [currentProject.paintSpecifications]);

  const laborCosts = useMemo(() => {
    return currentProject.crewMembers.reduce((sum, crew) => {
      const hours = calculateHours(crew.startTime, crew.endTime);
      return sum + (hours * crew.hourlyRate);
    }, 0);
  }, [currentProject.crewMembers]);

  const materialOrdersCost = useMemo(() => {
    return currentProject.materialOrders.reduce((sum, order) => sum + (order.quantity * order.unitPrice), 0);
  }, [currentProject.materialOrders]);

  const estimateTotal = useMemo(() => {
    const subtotal = currentProject.laborCost + currentProject.materialsCost + currentProject.equipmentCost;
    const overheadAmount = subtotal * (currentProject.overhead / 100);
    const profitAmount = subtotal * (currentProject.profit / 100);
    const beforeTax = subtotal + overheadAmount + profitAmount;
    const taxAmount = beforeTax * (currentProject.taxRate / 100);
    return beforeTax + taxAmount;
  }, [currentProject.laborCost, currentProject.materialsCost, currentProject.equipmentCost, currentProject.overhead, currentProject.profit, currentProject.taxRate]);

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
  };

  // Room handlers
  const addRoom = () => {
    const newRoom: RoomMeasurement = {
      id: generateId(),
      name: '',
      length: 0,
      width: 0,
      height: 8,
      wallArea: 0,
      ceilingArea: 0,
      windows: 0,
      doors: 0,
      includesCeiling: false,
      includesTrim: true,
      notes: '',
    };
    setCurrentProject(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
    }));
  };

  const updateRoom = (id: string, field: keyof RoomMeasurement, value: string | number | boolean) => {
    setCurrentProject(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id === id) {
          const updated = { ...room, [field]: value };
          // Calculate areas
          const perimeter = 2 * (updated.length + updated.width);
          const windowArea = updated.windows * 15; // avg window area
          const doorArea = updated.doors * 21; // avg door area
          updated.wallArea = (perimeter * updated.height) - windowArea - doorArea;
          updated.ceilingArea = updated.length * updated.width;
          return updated;
        }
        return room;
      }),
    }));
  };

  const removeRoom = (id: string) => {
    setCurrentProject(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== id),
    }));
  };

  // Paint specification handlers
  const addPaintSpec = () => {
    const newSpec: PaintSpecification = {
      id: generateId(),
      brand: '',
      productName: '',
      color: '',
      colorCode: '',
      finish: 'eggshell',
      coverage: 350,
      pricePerGallon: 0,
      gallonsNeeded: 0,
      totalCost: 0,
      application: 'walls',
    };
    setCurrentProject(prev => ({
      ...prev,
      paintSpecifications: [...prev.paintSpecifications, newSpec],
    }));
  };

  const updatePaintSpec = (id: string, field: keyof PaintSpecification, value: string | number) => {
    setCurrentProject(prev => ({
      ...prev,
      paintSpecifications: prev.paintSpecifications.map(spec => {
        if (spec.id === id) {
          const updated = { ...spec, [field]: value };
          // Calculate gallons and cost
          if (field === 'coverage' || field === 'pricePerGallon') {
            const area = spec.application === 'walls' ? totalWallArea :
                        spec.application === 'ceiling' ? totalCeilingArea :
                        totalWallArea * 0.1; // trim estimate
            updated.gallonsNeeded = Math.ceil(area / (updated.coverage || 350));
            updated.totalCost = updated.gallonsNeeded * updated.pricePerGallon;
          }
          return updated;
        }
        return spec;
      }),
    }));
  };

  const removePaintSpec = (id: string) => {
    setCurrentProject(prev => ({
      ...prev,
      paintSpecifications: prev.paintSpecifications.filter(s => s.id !== id),
    }));
  };

  // Crew handlers
  const addCrewMember = () => {
    const newCrew: CrewMember = {
      id: generateId(),
      name: '',
      role: 'Painter',
      scheduledDate: currentProject.startDate,
      startTime: '08:00',
      endTime: '17:00',
      hourlyRate: 25,
    };
    setCurrentProject(prev => ({
      ...prev,
      crewMembers: [...prev.crewMembers, newCrew],
    }));
  };

  const updateCrewMember = (id: string, field: keyof CrewMember, value: string | number) => {
    setCurrentProject(prev => ({
      ...prev,
      crewMembers: prev.crewMembers.map(crew =>
        crew.id === id ? { ...crew, [field]: value } : crew
      ),
    }));
  };

  const removeCrewMember = (id: string) => {
    setCurrentProject(prev => ({
      ...prev,
      crewMembers: prev.crewMembers.filter(c => c.id !== id),
    }));
  };

  // Prep checklist handlers
  const togglePrepItem = (id: string) => {
    setCurrentProject(prev => ({
      ...prev,
      prepChecklist: prev.prepChecklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const updatePrepItemNotes = (id: string, notes: string) => {
    setCurrentProject(prev => ({
      ...prev,
      prepChecklist: prev.prepChecklist.map(item =>
        item.id === id ? { ...item, notes } : item
      ),
    }));
  };

  // Furniture protection handlers
  const addFurnitureItem = () => {
    const newItem: FurnitureProtection = {
      id: generateId(),
      item: '',
      location: '',
      action: 'cover',
      notes: '',
    };
    setCurrentProject(prev => ({
      ...prev,
      furnitureProtection: [...prev.furnitureProtection, newItem],
    }));
  };

  const updateFurnitureItem = (id: string, field: keyof FurnitureProtection, value: string) => {
    setCurrentProject(prev => ({
      ...prev,
      furnitureProtection: prev.furnitureProtection.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeFurnitureItem = (id: string) => {
    setCurrentProject(prev => ({
      ...prev,
      furnitureProtection: prev.furnitureProtection.filter(f => f.id !== id),
    }));
  };

  // Weather handlers
  const addWeatherEntry = () => {
    const newEntry: WeatherConsideration = {
      date: new Date().toISOString().split('T')[0],
      temperature: 70,
      humidity: 50,
      windSpeed: 5,
      precipitation: false,
      suitable: true,
      notes: '',
    };
    setCurrentProject(prev => ({
      ...prev,
      weatherConsiderations: [...prev.weatherConsiderations, newEntry],
    }));
  };

  const updateWeatherEntry = (index: number, field: keyof WeatherConsideration, value: string | number | boolean) => {
    setCurrentProject(prev => ({
      ...prev,
      weatherConsiderations: prev.weatherConsiderations.map((entry, i) => {
        if (i === index) {
          const updated = { ...entry, [field]: value };
          // Auto-determine suitability
          updated.suitable = updated.temperature >= 50 && updated.temperature <= 85 &&
                            updated.humidity <= 85 &&
                            updated.windSpeed <= 15 &&
                            !updated.precipitation;
          return updated;
        }
        return entry;
      }),
    }));
  };

  const removeWeatherEntry = (index: number) => {
    setCurrentProject(prev => ({
      ...prev,
      weatherConsiderations: prev.weatherConsiderations.filter((_, i) => i !== index),
    }));
  };

  // Material order handlers
  const addMaterialOrder = () => {
    const newOrder: MaterialOrder = {
      id: generateId(),
      item: '',
      quantity: 1,
      unit: 'each',
      unitPrice: 0,
      supplier: '',
      ordered: false,
      received: false,
    };
    setCurrentProject(prev => ({
      ...prev,
      materialOrders: [...prev.materialOrders, newOrder],
    }));
  };

  const updateMaterialOrder = (id: string, field: keyof MaterialOrder, value: string | number | boolean) => {
    setCurrentProject(prev => ({
      ...prev,
      materialOrders: prev.materialOrders.map(order =>
        order.id === id ? { ...order, [field]: value } : order
      ),
    }));
  };

  const removeMaterialOrder = (id: string) => {
    setCurrentProject(prev => ({
      ...prev,
      materialOrders: prev.materialOrders.filter(o => o.id !== id),
    }));
  };

  // Photo handlers
  const addPhoto = (type: 'before' | 'after') => {
    const newPhoto: PhotoEntry = {
      id: generateId(),
      type,
      room: '',
      description: '',
      timestamp: new Date().toISOString(),
    };
    setCurrentProject(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto],
    }));
  };

  const updatePhoto = (id: string, field: keyof PhotoEntry, value: string) => {
    setCurrentProject(prev => ({
      ...prev,
      photos: prev.photos.map(photo =>
        photo.id === id ? { ...photo, [field]: value } : photo
      ),
    }));
  };

  const removePhoto = (id: string) => {
    setCurrentProject(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id),
    }));
  };

  // Project handlers
  const saveProject = () => {
    const updatedProject = {
      ...currentProject,
      totalWallArea,
      totalCeilingArea,
      estimatedTotal: estimateTotal,
      updatedAt: new Date().toISOString(),
    };

    const existingProject = projects.find(p => p.id === updatedProject.id);
    if (existingProject) {
      updateProject(updatedProject.id, updatedProject);
    } else {
      addProject(updatedProject);
    }

    setCurrentProject(updatedProject);
    setSavedMessage('Project saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const createNewProject = () => {
    setCurrentProject(createEmptyProject());
  };

  const loadProject = (project: PaintingProject) => {
    setCurrentProject(project);
  };

  const deleteProject = (id: string) => {
    deleteProjectFromHook(id);
    if (currentProject.id === id) {
      createNewProject();
    }
  };

  const generateEstimate = () => {
    const estimate = `
PAINTING ESTIMATE
=================

Estimate #: EST-${currentProject.id.toUpperCase()}
Date: ${new Date().toLocaleDateString()}

CUSTOMER INFORMATION
--------------------
Name: ${currentProject.customerName}
Phone: ${currentProject.customerPhone}
Email: ${currentProject.customerEmail}
Property: ${currentProject.propertyAddress}
${currentProject.propertyCity}, ${currentProject.propertyState} ${currentProject.propertyZip}
Property Type: ${currentProject.propertyType}

PROJECT DETAILS
---------------
Project Type: ${currentProject.projectType.toUpperCase()}
Status: ${currentProject.projectStatus}
Start Date: ${currentProject.startDate}
${currentProject.endDate ? `End Date: ${currentProject.endDate}` : ''}

ROOM MEASUREMENTS
-----------------
${currentProject.rooms.map(room =>
  `${room.name}: ${room.length}' x ${room.width}' x ${room.height}'
   Wall Area: ${room.wallArea.toFixed(0)} sq ft
   ${room.includesCeiling ? `Ceiling Area: ${room.ceilingArea.toFixed(0)} sq ft` : ''}
   Windows: ${room.windows}, Doors: ${room.doors}`
).join('\n\n') || 'No rooms specified'}

Total Wall Area: ${totalWallArea.toFixed(0)} sq ft
Total Ceiling Area: ${totalCeilingArea.toFixed(0)} sq ft

PAINT SPECIFICATIONS
--------------------
${currentProject.paintSpecifications.map(spec =>
  `${spec.brand} ${spec.productName}
   Color: ${spec.color} (${spec.colorCode})
   Finish: ${spec.finish}
   Application: ${spec.application}
   Gallons Needed: ${spec.gallonsNeeded}
   Cost: $${spec.totalCost.toFixed(2)}`
).join('\n\n') || 'No paint specifications'}

COST BREAKDOWN
--------------
Labor: $${currentProject.laborCost.toFixed(2)}
Materials: $${currentProject.materialsCost.toFixed(2)}
Equipment: $${currentProject.equipmentCost.toFixed(2)}
Subtotal: $${(currentProject.laborCost + currentProject.materialsCost + currentProject.equipmentCost).toFixed(2)}

Overhead (${currentProject.overhead}%): $${((currentProject.laborCost + currentProject.materialsCost + currentProject.equipmentCost) * currentProject.overhead / 100).toFixed(2)}
Profit (${currentProject.profit}%): $${((currentProject.laborCost + currentProject.materialsCost + currentProject.equipmentCost) * currentProject.profit / 100).toFixed(2)}
${currentProject.taxRate > 0 ? `Tax (${currentProject.taxRate}%): $${(estimateTotal * currentProject.taxRate / 100).toFixed(2)}` : ''}

=====================
TOTAL ESTIMATE: $${estimateTotal.toFixed(2)}
=====================

${currentProject.deposit > 0 ? `Deposit Required: $${currentProject.deposit.toFixed(2)} (${currentProject.depositPaid ? t('tools.paintingContractor.paid', 'PAID') : t('tools.paintingContractor.pending', 'PENDING')})` : ''}

NOTES
-----
${currentProject.notes || 'No additional notes'}

This estimate is valid for 30 days from the date above.
Thank you for your business!
    `.trim();

    const blob = new Blob([estimate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `painting-estimate-${currentProject.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const selectClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`;

  const sectionHeaderClass = `flex items-center justify-between cursor-pointer p-3 rounded-lg ${
    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-100 hover:bg-gray-200'
  }`;

  const cardClass = `rounded-lg border ${
    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } p-4 mb-4`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Paintbrush className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.paintingContractor.paintingContractorManager', 'Painting Contractor Manager')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.paintingContractor.completePaintingProjectEstimationAnd', 'Complete painting project estimation and management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="painting-contractor" toolName="Painting Contractor" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme === 'dark' ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'painting-projects' })}
            onExportExcel={() => exportExcel({ filename: 'painting-projects' })}
            onExportJSON={() => exportJSON({ filename: 'painting-projects' })}
            onExportPDF={() => exportPDF({
              filename: 'painting-projects',
              title: 'Painting Contractor Projects',
              subtitle: `${projects.length} projects`
            })}
            onPrint={() => print('Painting Contractor Projects')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
          <button
            onClick={createNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.paintingContractor.newProject', 'New Project')}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {savedMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects Sidebar */}
        <div className={`lg:col-span-1 ${cardClass}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.paintingContractor.projects', 'Projects')}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {projects.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.paintingContractor.noProjectsYet', 'No projects yet')}
              </p>
            ) : (
              projects.map(project => (
                <div
                  key={project.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    currentProject.id === project.id
                      ? 'bg-[#0D9488]/20 border border-[#0D9488]'
                      : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => loadProject(project)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {project.customerName || 'Unnamed Customer'}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)} Project
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      project.projectStatus === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      project.projectStatus === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      project.projectStatus === 'scheduled' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      project.projectStatus === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {project.projectStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-3 space-y-4">
          {/* Customer Information Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('customer')}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.customerPropertyInformation', 'Customer & Property Information')}
                </span>
              </div>
              {expandedSections.customer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.customer && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.customerName', 'Customer Name *')}</label>
                  <input
                    type="text"
                    value={currentProject.customerName}
                    onChange={e => setCurrentProject(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder={t('tools.paintingContractor.fullName', 'Full name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.phoneNumber', 'Phone Number *')}</label>
                  <input
                    type="tel"
                    value={currentProject.customerPhone}
                    onChange={e => setCurrentProject(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.email', 'Email')}</label>
                  <input
                    type="email"
                    value={currentProject.customerEmail}
                    onChange={e => setCurrentProject(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder={t('tools.paintingContractor.customerEmailCom', 'customer@email.com')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.propertyType', 'Property Type')}</label>
                  <select
                    value={currentProject.propertyType}
                    onChange={e => setCurrentProject(prev => ({ ...prev, propertyType: e.target.value as 'residential' | 'commercial' | 'industrial' }))}
                    className={selectClass}
                  >
                    <option value="residential">{t('tools.paintingContractor.residential', 'Residential')}</option>
                    <option value="commercial">{t('tools.paintingContractor.commercial', 'Commercial')}</option>
                    <option value="industrial">{t('tools.paintingContractor.industrial', 'Industrial')}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.paintingContractor.propertyAddress', 'Property Address *')}</label>
                  <input
                    type="text"
                    value={currentProject.propertyAddress}
                    onChange={e => setCurrentProject(prev => ({ ...prev, propertyAddress: e.target.value }))}
                    placeholder={t('tools.paintingContractor.123MainStreet', '123 Main Street')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.city', 'City')}</label>
                  <input
                    type="text"
                    value={currentProject.propertyCity}
                    onChange={e => setCurrentProject(prev => ({ ...prev, propertyCity: e.target.value }))}
                    placeholder={t('tools.paintingContractor.city2', 'City')}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.state', 'State')}</label>
                    <input
                      type="text"
                      value={currentProject.propertyState}
                      onChange={e => setCurrentProject(prev => ({ ...prev, propertyState: e.target.value }))}
                      placeholder={t('tools.paintingContractor.state2', 'State')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.zipCode', 'ZIP Code')}</label>
                    <input
                      type="text"
                      value={currentProject.propertyZip}
                      onChange={e => setCurrentProject(prev => ({ ...prev, propertyZip: e.target.value }))}
                      placeholder="12345"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.projectType', 'Project Type')}</label>
                  <select
                    value={currentProject.projectType}
                    onChange={e => setCurrentProject(prev => ({ ...prev, projectType: e.target.value as 'interior' | 'exterior' | 'both' }))}
                    className={selectClass}
                  >
                    <option value="interior">{t('tools.paintingContractor.interior', 'Interior')}</option>
                    <option value="exterior">{t('tools.paintingContractor.exterior', 'Exterior')}</option>
                    <option value="both">{t('tools.paintingContractor.bothInteriorExterior', 'Both Interior & Exterior')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.projectStatus', 'Project Status')}</label>
                  <select
                    value={currentProject.projectStatus}
                    onChange={e => setCurrentProject(prev => ({ ...prev, projectStatus: e.target.value as PaintingProject['projectStatus'] }))}
                    className={selectClass}
                  >
                    <option value="estimate">{t('tools.paintingContractor.estimate', 'Estimate')}</option>
                    <option value="scheduled">{t('tools.paintingContractor.scheduled', 'Scheduled')}</option>
                    <option value="in-progress">{t('tools.paintingContractor.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.paintingContractor.completed', 'Completed')}</option>
                    <option value="cancelled">{t('tools.paintingContractor.cancelled', 'Cancelled')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.startDate', 'Start Date')}</label>
                  <input
                    type="date"
                    value={currentProject.startDate}
                    onChange={e => setCurrentProject(prev => ({ ...prev, startDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.endDate', 'End Date')}</label>
                  <input
                    type="date"
                    value={currentProject.endDate}
                    onChange={e => setCurrentProject(prev => ({ ...prev, endDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Room Measurements Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('measurements')}
            >
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.roomAreaMeasurements', 'Room/Area Measurements')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentProject.rooms.length} rooms, {totalWallArea.toFixed(0)} sq ft)
                </span>
              </div>
              {expandedSections.measurements ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.measurements && (
              <div className="mt-4 space-y-4">
                {currentProject.rooms.map((room) => (
                  <div key={room.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.paintingContractor.roomName', 'Room Name')}</label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={e => updateRoom(room.id, 'name', e.target.value)}
                          placeholder={t('tools.paintingContractor.livingRoomBedroomEtc', 'Living Room, Bedroom, etc.')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.lengthFt', 'Length (ft)')}</label>
                        <input
                          type="number"
                          value={room.length}
                          onChange={e => updateRoom(room.id, 'length', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.widthFt', 'Width (ft)')}</label>
                        <input
                          type="number"
                          value={room.width}
                          onChange={e => updateRoom(room.id, 'width', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.heightFt', 'Height (ft)')}</label>
                        <input
                          type="number"
                          value={room.height}
                          onChange={e => updateRoom(room.id, 'height', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeRoom(room.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.windows', 'Windows')}</label>
                        <input
                          type="number"
                          value={room.windows}
                          onChange={e => updateRoom(room.id, 'windows', parseInt(e.target.value) || 0)}
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.doors', 'Doors')}</label>
                        <input
                          type="number"
                          value={room.doors}
                          onChange={e => updateRoom(room.id, 'doors', parseInt(e.target.value) || 0)}
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          checked={room.includesCeiling}
                          onChange={e => updateRoom(room.id, 'includesCeiling', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.paintingContractor.includeCeiling', 'Include Ceiling')}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          checked={room.includesTrim}
                          onChange={e => updateRoom(room.id, 'includesTrim', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.paintingContractor.includeTrim', 'Include Trim')}</span>
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.paintingContractor.wallArea', 'Wall Area')}</label>
                        <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          {room.wallArea.toFixed(0)} sq ft
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelClass}>{t('tools.paintingContractor.notes', 'Notes')}</label>
                      <input
                        type="text"
                        value={room.notes}
                        onChange={e => updateRoom(room.id, 'notes', e.target.value)}
                        placeholder={t('tools.paintingContractor.specialConsiderationsAccentWallsEtc', 'Special considerations, accent walls, etc.')}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addRoom}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.paintingContractor.addRoomArea', 'Add Room/Area')}
                </button>

                {currentProject.rooms.length > 0 && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintingContractor.totalWallArea', 'Total Wall Area:')}</span>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalWallArea.toFixed(0)} sq ft</p>
                      </div>
                      <div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintingContractor.totalCeilingArea', 'Total Ceiling Area:')}</span>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalCeilingArea.toFixed(0)} sq ft</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Surface Preparation Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('surface')}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.surfacePreparationChecklist', 'Surface Preparation & Checklist')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentProject.prepChecklist.filter(i => i.completed).length}/{currentProject.prepChecklist.length} completed)
                </span>
              </div>
              {expandedSections.surface ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.surface && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.surfaceConditionAssessment', 'Surface Condition Assessment')}</label>
                  <textarea
                    value={currentProject.surfaceCondition}
                    onChange={e => setCurrentProject(prev => ({ ...prev, surfaceCondition: e.target.value }))}
                    placeholder={t('tools.paintingContractor.describeTheCurrentConditionOf', 'Describe the current condition of walls, ceilings, trim...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.preparationNotes', 'Preparation Notes')}</label>
                  <textarea
                    value={currentProject.prepNotes}
                    onChange={e => setCurrentProject(prev => ({ ...prev, prepNotes: e.target.value }))}
                    placeholder={t('tools.paintingContractor.specialPreparationRequirementsProblemAreas', 'Special preparation requirements, problem areas...')}
                    rows={2}
                    className={inputClass}
                  />
                </div>

                <div>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.paintingContractor.prepWorkChecklist', 'Prep Work Checklist')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentProject.prepChecklist.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg flex items-start gap-3 ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => togglePrepItem(item.id)}
                          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <div className="flex-1">
                          <span className={`text-sm ${item.completed ? 'line-through opacity-60' : ''} ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            {item.task}
                          </span>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={e => updatePrepItemNotes(item.id, e.target.value)}
                            placeholder={t('tools.paintingContractor.notes2', 'Notes...')}
                            className={`mt-1 w-full text-xs px-2 py-1 rounded border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-gray-300 placeholder-gray-400'
                                : 'bg-white border-gray-200 text-gray-600 placeholder-gray-400'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Paint Specifications Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('paint')}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.paintSpecifications', 'Paint Specifications')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  (${paintCosts.toFixed(2)})
                </span>
              </div>
              {expandedSections.paint ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.paint && (
              <div className="mt-4 space-y-4">
                {currentProject.paintSpecifications.map((spec) => (
                  <div key={spec.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.brand', 'Brand')}</label>
                        <select
                          value={spec.brand}
                          onChange={e => updatePaintSpec(spec.id, 'brand', e.target.value)}
                          className={selectClass}
                        >
                          <option value="">{t('tools.paintingContractor.selectBrand', 'Select brand...')}</option>
                          {PAINT_BRANDS.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.productName', 'Product Name')}</label>
                        <input
                          type="text"
                          value={spec.productName}
                          onChange={e => updatePaintSpec(spec.id, 'productName', e.target.value)}
                          placeholder={t('tools.paintingContractor.regalSelectDurationEtc', 'Regal Select, Duration, etc.')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.colorName', 'Color Name')}</label>
                        <input
                          type="text"
                          value={spec.color}
                          onChange={e => updatePaintSpec(spec.id, 'color', e.target.value)}
                          placeholder={t('tools.paintingContractor.simplyWhite', 'Simply White')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.colorCode', 'Color Code')}</label>
                        <input
                          type="text"
                          value={spec.colorCode}
                          onChange={e => updatePaintSpec(spec.id, 'colorCode', e.target.value)}
                          placeholder={t('tools.paintingContractor.oc117', 'OC-117')}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.finish', 'Finish')}</label>
                        <select
                          value={spec.finish}
                          onChange={e => updatePaintSpec(spec.id, 'finish', e.target.value)}
                          className={selectClass}
                        >
                          {PAINT_FINISHES.map(finish => (
                            <option key={finish.value} value={finish.value}>{finish.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.application', 'Application')}</label>
                        <select
                          value={spec.application}
                          onChange={e => updatePaintSpec(spec.id, 'application', e.target.value)}
                          className={selectClass}
                        >
                          <option value="walls">{t('tools.paintingContractor.walls', 'Walls')}</option>
                          <option value="ceiling">{t('tools.paintingContractor.ceiling', 'Ceiling')}</option>
                          <option value="trim">{t('tools.paintingContractor.trim', 'Trim')}</option>
                          <option value="exterior">{t('tools.paintingContractor.exterior2', 'Exterior')}</option>
                          <option value="primer">{t('tools.paintingContractor.primer', 'Primer')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.coverageSqFtGal', 'Coverage (sq ft/gal)')}</label>
                        <input
                          type="number"
                          value={spec.coverage}
                          onChange={e => updatePaintSpec(spec.id, 'coverage', parseFloat(e.target.value) || 350)}
                          min="100"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.priceGallon', 'Price/Gallon ($)')}</label>
                        <input
                          type="number"
                          value={spec.pricePerGallon}
                          onChange={e => updatePaintSpec(spec.id, 'pricePerGallon', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className={labelClass}>{t('tools.paintingContractor.gallons', 'Gallons')}</label>
                          <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            {spec.gallonsNeeded}
                          </div>
                        </div>
                        <button
                          onClick={() => removePaintSpec(spec.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addPaintSpec}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.paintingContractor.addPaintSpecification', 'Add Paint Specification')}
                </button>
              </div>
            )}
          </div>

          {/* Crew Scheduling Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('crew')}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.crewScheduling', 'Crew Scheduling')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentProject.crewMembers.length} members)
                </span>
              </div>
              {expandedSections.crew ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.crew && (
              <div className="mt-4 space-y-4">
                {currentProject.crewMembers.map((crew) => (
                  <div key={crew.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.paintingContractor.name', 'Name')}</label>
                        <input
                          type="text"
                          value={crew.name}
                          onChange={e => updateCrewMember(crew.id, 'name', e.target.value)}
                          placeholder={t('tools.paintingContractor.crewMemberName', 'Crew member name')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.role', 'Role')}</label>
                        <select
                          value={crew.role}
                          onChange={e => updateCrewMember(crew.id, 'role', e.target.value)}
                          className={selectClass}
                        >
                          <option value="Lead Painter">{t('tools.paintingContractor.leadPainter', 'Lead Painter')}</option>
                          <option value="Painter">{t('tools.paintingContractor.painter', 'Painter')}</option>
                          <option value="Prep Work">{t('tools.paintingContractor.prepWork', 'Prep Work')}</option>
                          <option value="Apprentice">{t('tools.paintingContractor.apprentice', 'Apprentice')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.date', 'Date')}</label>
                        <input
                          type="date"
                          value={crew.scheduledDate}
                          onChange={e => updateCrewMember(crew.id, 'scheduledDate', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.start', 'Start')}</label>
                        <input
                          type="time"
                          value={crew.startTime}
                          onChange={e => updateCrewMember(crew.id, 'startTime', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.end', 'End')}</label>
                        <input
                          type="time"
                          value={crew.endTime}
                          onChange={e => updateCrewMember(crew.id, 'endTime', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.hourlyRate', 'Hourly Rate ($)')}</label>
                        <input
                          type="number"
                          value={crew.hourlyRate}
                          onChange={e => updateCrewMember(crew.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.hours', 'Hours')}</label>
                        <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          {calculateHours(crew.startTime, crew.endTime).toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.dayCost', 'Day Cost')}</label>
                        <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          ${(calculateHours(crew.startTime, crew.endTime) * crew.hourlyRate).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeCrewMember(crew.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addCrewMember}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.paintingContractor.addCrewMember', 'Add Crew Member')}
                </button>
              </div>
            )}
          </div>

          {/* Color Consultation Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('color')}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.colorConsultationNotes', 'Color Consultation Notes')}
                </span>
              </div>
              {expandedSections.color ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.color && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.consultationDate', 'Consultation Date')}</label>
                    <input
                      type="date"
                      value={currentProject.colorConsultation.date}
                      onChange={e => setCurrentProject(prev => ({
                        ...prev,
                        colorConsultation: { ...prev.colorConsultation, date: e.target.value }
                      }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.consultantName', 'Consultant Name')}</label>
                    <input
                      type="text"
                      value={currentProject.colorConsultation.consultant}
                      onChange={e => setCurrentProject(prev => ({
                        ...prev,
                        colorConsultation: { ...prev.colorConsultation, consultant: e.target.value }
                      }))}
                      placeholder={t('tools.paintingContractor.colorConsultantName', 'Color consultant name')}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.customerPreferences', 'Customer Preferences')}</label>
                  <textarea
                    value={currentProject.colorConsultation.customerPreferences}
                    onChange={e => setCurrentProject(prev => ({
                      ...prev,
                      colorConsultation: { ...prev.colorConsultation, customerPreferences: e.target.value }
                    }))}
                    placeholder={t('tools.paintingContractor.customerSStylePreferencesExisting', 'Customer\'s style preferences, existing decor, lighting considerations...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.recommendations', 'Recommendations')}</label>
                  <textarea
                    value={currentProject.colorConsultation.recommendations}
                    onChange={e => setCurrentProject(prev => ({
                      ...prev,
                      colorConsultation: { ...prev.colorConsultation, recommendations: e.target.value }
                    }))}
                    placeholder={t('tools.paintingContractor.suggestedColorSchemesAccentColors', 'Suggested color schemes, accent colors, finish recommendations...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.paintingContractor.finalSelections', 'Final Selections')}</label>
                  <textarea
                    value={currentProject.colorConsultation.finalSelections}
                    onChange={e => setCurrentProject(prev => ({
                      ...prev,
                      colorConsultation: { ...prev.colorConsultation, finalSelections: e.target.value }
                    }))}
                    placeholder={t('tools.paintingContractor.finalColorChoicesWithRoom', 'Final color choices with room assignments...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Furniture Protection Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('furniture')}
            >
              <div className="flex items-center gap-2">
                <Armchair className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.furnitureProtectionRequirements', 'Furniture & Protection Requirements')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentProject.furnitureProtection.length} items)
                </span>
              </div>
              {expandedSections.furniture ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.furniture && (
              <div className="mt-4 space-y-4">
                {currentProject.furnitureProtection.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.paintingContractor.item', 'Item')}</label>
                        <input
                          type="text"
                          value={item.item}
                          onChange={e => updateFurnitureItem(item.id, 'item', e.target.value)}
                          placeholder={t('tools.paintingContractor.sofaPianoEtc', 'Sofa, Piano, etc.')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.location', 'Location')}</label>
                        <input
                          type="text"
                          value={item.location}
                          onChange={e => updateFurnitureItem(item.id, 'location', e.target.value)}
                          placeholder={t('tools.paintingContractor.livingRoom', 'Living Room')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.action', 'Action')}</label>
                        <select
                          value={item.action}
                          onChange={e => updateFurnitureItem(item.id, 'action', e.target.value)}
                          className={selectClass}
                        >
                          <option value="cover">{t('tools.paintingContractor.coverWithPlastic', 'Cover with plastic')}</option>
                          <option value="move">{t('tools.paintingContractor.moveToCenter', 'Move to center')}</option>
                          <option value="remove">{t('tools.paintingContractor.removeFromRoom', 'Remove from room')}</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeFurnitureItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={e => updateFurnitureItem(item.id, 'notes', e.target.value)}
                        placeholder={t('tools.paintingContractor.specialHandlingNotes', 'Special handling notes...')}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addFurnitureItem}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.paintingContractor.addFurnitureItem', 'Add Furniture Item')}
                </button>
              </div>
            )}
          </div>

          {/* Weather Considerations Section (Exterior) */}
          {(currentProject.projectType === 'exterior' || currentProject.projectType === 'both') && (
            <div className={cardClass}>
              <div
                className={sectionHeaderClass}
                onClick={() => toggleSection('weather')}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-[#0D9488]" />
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.paintingContractor.weatherConsiderationsExterior', 'Weather Considerations (Exterior)')}
                  </span>
                </div>
                {expandedSections.weather ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {expandedSections.weather && (
                <div className="mt-4 space-y-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        {t('tools.paintingContractor.idealExteriorPaintingConditionsTemperature', 'Ideal exterior painting conditions: Temperature 50-85F, Humidity below 85%, Wind under 15 mph, No precipitation expected for 24-48 hours.')}
                      </p>
                    </div>
                  </div>

                  {currentProject.weatherConsiderations.map((entry, index) => (
                    <div key={index} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div>
                          <label className={labelClass}>{t('tools.paintingContractor.date2', 'Date')}</label>
                          <input
                            type="date"
                            value={entry.date}
                            onChange={e => updateWeatherEntry(index, 'date', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.paintingContractor.tempF', 'Temp (F)')}</label>
                          <div className="relative">
                            <Thermometer className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                              type="number"
                              value={entry.temperature}
                              onChange={e => updateWeatherEntry(index, 'temperature', parseFloat(e.target.value) || 0)}
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.paintingContractor.humidity', 'Humidity (%)')}</label>
                          <div className="relative">
                            <Droplets className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                              type="number"
                              value={entry.humidity}
                              onChange={e => updateWeatherEntry(index, 'humidity', parseFloat(e.target.value) || 0)}
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.paintingContractor.windMph', 'Wind (mph)')}</label>
                          <div className="relative">
                            <Wind className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                              type="number"
                              value={entry.windSpeed}
                              onChange={e => updateWeatherEntry(index, 'windSpeed', parseFloat(e.target.value) || 0)}
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            checked={entry.precipitation}
                            onChange={e => updateWeatherEntry(index, 'precipitation', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                          />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.paintingContractor.rain', 'Rain')}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          {entry.suitable ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className={`text-sm ${entry.suitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {entry.suitable ? t('tools.paintingContractor.suitable', 'Suitable') : t('tools.paintingContractor.notIdeal', 'Not Ideal')}
                          </span>
                          <button
                            onClick={() => removeWeatherEntry(index)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addWeatherEntry}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.paintingContractor.addWeatherCheck', 'Add Weather Check')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Material Ordering Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('materials')}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.materialOrdering', 'Material Ordering')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  (${materialOrdersCost.toFixed(2)})
                </span>
              </div>
              {expandedSections.materials ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.materials && (
              <div className="mt-4 space-y-4">
                {currentProject.materialOrders.map((order) => (
                  <div key={order.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.paintingContractor.item2', 'Item')}</label>
                        <input
                          type="text"
                          value={order.item}
                          onChange={e => updateMaterialOrder(order.id, 'item', e.target.value)}
                          placeholder={t('tools.paintingContractor.dropClothsTapeBrushes', 'Drop cloths, tape, brushes...')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.quantity', 'Quantity')}</label>
                        <input
                          type="number"
                          value={order.quantity}
                          onChange={e => updateMaterialOrder(order.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.unit', 'Unit')}</label>
                        <select
                          value={order.unit}
                          onChange={e => updateMaterialOrder(order.id, 'unit', e.target.value)}
                          className={selectClass}
                        >
                          <option value="each">{t('tools.paintingContractor.each', 'Each')}</option>
                          <option value="roll">{t('tools.paintingContractor.roll', 'Roll')}</option>
                          <option value="pack">{t('tools.paintingContractor.pack', 'Pack')}</option>
                          <option value="gallon">{t('tools.paintingContractor.gallon', 'Gallon')}</option>
                          <option value="box">{t('tools.paintingContractor.box', 'Box')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.unitPrice', 'Unit Price ($)')}</label>
                        <input
                          type="number"
                          value={order.unitPrice}
                          onChange={e => updateMaterialOrder(order.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeMaterialOrder(order.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.supplier', 'Supplier')}</label>
                        <input
                          type="text"
                          value={order.supplier}
                          onChange={e => updateMaterialOrder(order.id, 'supplier', e.target.value)}
                          placeholder={t('tools.paintingContractor.supplierName', 'Supplier name')}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          checked={order.ordered}
                          onChange={e => updateMaterialOrder(order.id, 'ordered', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.paintingContractor.ordered', 'Ordered')}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          checked={order.received}
                          onChange={e => updateMaterialOrder(order.id, 'received', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.paintingContractor.received', 'Received')}</span>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.paintingContractor.total', 'Total')}</label>
                        <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          ${(order.quantity * order.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addMaterialOrder}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.paintingContractor.addMaterialOrder', 'Add Material Order')}
                </button>
              </div>
            )}
          </div>

          {/* Photos Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('photos')}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.beforeAfterPhotos', 'Before/After Photos')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentProject.photos.length} photos)
                </span>
              </div>
              {expandedSections.photos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.photos && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before Photos */}
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.paintingContractor.beforePhotos', 'Before Photos')}
                    </h4>
                    {currentProject.photos.filter(p => p.type === 'before').map(photo => (
                      <div key={photo.id} className={`p-3 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <Camera className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={photo.room}
                          onChange={e => updatePhoto(photo.id, 'room', e.target.value)}
                          placeholder={t('tools.paintingContractor.roomName2', 'Room name')}
                          className={`${inputClass} mb-2`}
                        />
                        <input
                          type="text"
                          value={photo.description}
                          onChange={e => updatePhoto(photo.id, 'description', e.target.value)}
                          placeholder={t('tools.paintingContractor.photoDescription', 'Photo description')}
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addPhoto('before')}
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg w-full justify-center ${
                        theme === 'dark'
                          ? t('tools.paintingContractor.borderGray600TextGray', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.paintingContractor.borderGray300TextGray', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.paintingContractor.addBeforePhoto', 'Add Before Photo')}
                    </button>
                  </div>

                  {/* After Photos */}
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.paintingContractor.afterPhotos', 'After Photos')}
                    </h4>
                    {currentProject.photos.filter(p => p.type === 'after').map(photo => (
                      <div key={photo.id} className={`p-3 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <Camera className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={photo.room}
                          onChange={e => updatePhoto(photo.id, 'room', e.target.value)}
                          placeholder={t('tools.paintingContractor.roomName3', 'Room name')}
                          className={`${inputClass} mb-2`}
                        />
                        <input
                          type="text"
                          value={photo.description}
                          onChange={e => updatePhoto(photo.id, 'description', e.target.value)}
                          placeholder={t('tools.paintingContractor.photoDescription2', 'Photo description')}
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addPhoto('after')}
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg w-full justify-center ${
                        theme === 'dark'
                          ? t('tools.paintingContractor.borderGray600TextGray2', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.paintingContractor.borderGray300TextGray2', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.paintingContractor.addAfterPhoto', 'Add After Photo')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Estimate Builder Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('estimate')}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.paintingContractor.estimateBuilder', 'Estimate Builder')}
                </span>
                <span className={`text-sm font-bold text-[#0D9488]`}>
                  (${estimateTotal.toFixed(2)})
                </span>
              </div>
              {expandedSections.estimate ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.estimate && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.laborCost', 'Labor Cost ($)')}</label>
                    <input
                      type="number"
                      value={currentProject.laborCost}
                      onChange={e => setCurrentProject(prev => ({ ...prev, laborCost: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.materialsCost', 'Materials Cost ($)')}</label>
                    <input
                      type="number"
                      value={currentProject.materialsCost}
                      onChange={e => setCurrentProject(prev => ({ ...prev, materialsCost: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.equipmentCost', 'Equipment Cost ($)')}</label>
                    <input
                      type="number"
                      value={currentProject.equipmentCost}
                      onChange={e => setCurrentProject(prev => ({ ...prev, equipmentCost: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.overhead', 'Overhead (%)')}</label>
                    <input
                      type="number"
                      value={currentProject.overhead}
                      onChange={e => setCurrentProject(prev => ({ ...prev, overhead: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.profit', 'Profit (%)')}</label>
                    <input
                      type="number"
                      value={currentProject.profit}
                      onChange={e => setCurrentProject(prev => ({ ...prev, profit: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.taxRate', 'Tax Rate (%)')}</label>
                    <input
                      type="number"
                      value={currentProject.taxRate}
                      onChange={e => setCurrentProject(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.paintingContractor.subtotal', 'Subtotal:')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        ${(currentProject.laborCost + currentProject.materialsCost + currentProject.equipmentCost).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Overhead ({currentProject.overhead}%):</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        ${((currentProject.laborCost + currentProject.materialsCost + currentProject.equipmentCost) * currentProject.overhead / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Profit ({currentProject.profit}%):</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        ${((currentProject.laborCost + currentProject.materialsCost + currentProject.equipmentCost) * currentProject.profit / 100).toFixed(2)}
                      </span>
                    </div>
                    {currentProject.taxRate > 0 && (
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Tax ({currentProject.taxRate}%):</span>
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          ${(estimateTotal * currentProject.taxRate / (100 + currentProject.taxRate)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className={`border-t pt-2 flex justify-between ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.paintingContractor.totalEstimate', 'Total Estimate:')}</span>
                      <span className="font-bold text-[#0D9488] text-xl">${estimateTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.paintingContractor.depositRequired', 'Deposit Required ($)')}</label>
                    <input
                      type="number"
                      value={currentProject.deposit}
                      onChange={e => setCurrentProject(prev => ({ ...prev, deposit: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      checked={currentProject.depositPaid}
                      onChange={e => setCurrentProject(prev => ({ ...prev, depositPaid: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                    />
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      {t('tools.paintingContractor.depositPaid', 'Deposit Paid')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-[#0D9488]" />
              {t('tools.paintingContractor.additionalNotes', 'Additional Notes')}
            </h3>
            <textarea
              value={currentProject.notes}
              onChange={e => setCurrentProject(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('tools.paintingContractor.anyAdditionalNotesAboutThis', 'Any additional notes about this project...')}
              rows={4}
              className={inputClass}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveProject}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium shadow-lg shadow-[#0D9488]/20"
            >
              <Save className="w-4 h-4" />
              {t('tools.paintingContractor.saveProject', 'Save Project')}
            </button>
            <button
              onClick={generateEstimate}
              disabled={!currentProject.customerName}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {t('tools.paintingContractor.generateEstimate', 'Generate Estimate')}
            </button>
            <button
              onClick={createNewProject}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.paintingContractor.newProject2', 'New Project')}
            </button>
          </div>

          {/* Info Section */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.paintingContractor.aboutPaintingContractorManager', 'About Painting Contractor Manager')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              A comprehensive tool for managing painting projects from estimate to completion. Track customer information,
              room measurements, paint specifications, crew scheduling, color consultations, furniture protection,
              weather conditions for exterior work, material orders, and before/after photos.
              Your data is automatically synced to the cloud when logged in, with local storage fallback for offline access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintingContractorTool;
