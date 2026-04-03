'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Video,
  Calendar,
  Users,
  Camera,
  Clock,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  FileText,
  DollarSign,
  Send,
  Film,
  Clapperboard,
  Mic,
  Music,
  Settings,
  AlertCircle,
  Play,
  Pause,
  Edit2,
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Monitor,
  HardDrive,
  Upload,
  Download,
  Shield,
  RotateCcw,
  List,
  Sparkles,
} from 'lucide-react';

// Types
interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface Project {
  id: string;
  clientId: string;
  name: string;
  type: 'commercial' | 'documentary' | 'music_video' | 'corporate' | 'wedding' | 'event' | 'podcast' | 'other';
  scope: string;
  deadline: string;
  status: 'intake' | 'pre_production' | 'production' | 'post_production' | 'review' | 'delivered' | 'completed';
  startDate: string;
  budget: number;
  notes: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: 'camera' | 'audio' | 'lighting' | 'grip' | 'storage' | 'other';
  serialNumber: string;
  status: 'available' | 'checked_out' | 'maintenance' | 'reserved';
  checkedOutTo: string;
  dueDate: string;
  notes: string;
}

interface StudioBooking {
  id: string;
  studioName: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  notes: string;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  rate: number;
  availability: 'available' | 'busy' | 'on_leave';
}

interface CrewAssignment {
  id: string;
  projectId: string;
  crewMemberId: string;
  role: string;
  dates: string[];
  notes: string;
}

interface ShotListItem {
  id: string;
  projectId: string;
  sceneNumber: string;
  shotNumber: string;
  description: string;
  shotType: string;
  camera: string;
  lens: string;
  movement: string;
  audio: string;
  notes: string;
  completed: boolean;
}

interface StoryboardItem {
  id: string;
  projectId: string;
  sceneNumber: string;
  frameNumber: string;
  description: string;
  dialogue: string;
  action: string;
  cameraAngle: string;
  notes: string;
}

interface PostProductionTask {
  id: string;
  projectId: string;
  taskName: string;
  phase: 'ingest' | 'rough_cut' | 'fine_cut' | 'color' | 'audio_mix' | 'graphics' | 'final' | 'delivery';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  notes: string;
}

interface Revision {
  id: string;
  projectId: string;
  version: string;
  requestedBy: string;
  requestDate: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completedDate: string;
  notes: string;
}

interface DeliverableFormat {
  id: string;
  projectId: string;
  formatName: string;
  resolution: string;
  codec: string;
  frameRate: string;
  audioFormat: string;
  fileSize: string;
  platform: string;
  delivered: boolean;
}

interface FileTransfer {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: string;
  transferMethod: 'cloud' | 'physical' | 'ftp' | 'streaming';
  destination: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadDate: string;
  downloadLink: string;
  expiryDate: string;
  notes: string;
}

interface License {
  id: string;
  projectId: string;
  assetName: string;
  licenseType: 'royalty_free' | 'rights_managed' | 'creative_commons' | 'exclusive' | 'work_for_hire';
  usageRights: string;
  territory: string;
  duration: string;
  startDate: string;
  endDate: string;
  cost: number;
  provider: string;
  notes: string;
}

interface BudgetItem {
  id: string;
  projectId: string;
  category: 'crew' | 'equipment' | 'location' | 'talent' | 'post_production' | 'music_licensing' | 'travel' | 'catering' | 'insurance' | 'other';
  description: string;
  estimatedCost: number;
  actualCost: number;
  paid: boolean;
  notes: string;
}

interface AudioVideoData {
  id: string; // Required for useToolData hook
  clients: Client[];
  projects: Project[];
  equipment: EquipmentItem[];
  studioBookings: StudioBooking[];
  crewMembers: CrewMember[];
  crewAssignments: CrewAssignment[];
  shotList: ShotListItem[];
  storyboard: StoryboardItem[];
  postProductionTasks: PostProductionTask[];
  revisions: Revision[];
  deliverableFormats: DeliverableFormat[];
  fileTransfers: FileTransfer[];
  licenses: License[];
  budgetItems: BudgetItem[];
  activeProjectId: string | null;
}

// Column configurations for export
const projectColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'deadline', header: 'Deadline', type: 'date' },
  { key: 'budget', header: 'Budget', type: 'currency' },
];

const defaultData: AudioVideoData = {
  id: 'audio-video-main',
  clients: [],
  projects: [],
  equipment: [],
  studioBookings: [],
  crewMembers: [],
  crewAssignments: [],
  shotList: [],
  storyboard: [],
  postProductionTasks: [],
  revisions: [],
  deliverableFormats: [],
  fileTransfers: [],
  licenses: [],
  budgetItems: [],
  activeProjectId: null,
};

const projectTypes = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'music_video', label: 'Music Video' },
  { value: 'corporate', label: 'Corporate Video' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'event', label: 'Event Coverage' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'other', label: 'Other' },
];

const projectStatuses = [
  { value: 'intake', label: 'Intake' },
  { value: 'pre_production', label: 'Pre-Production' },
  { value: 'production', label: 'Production' },
  { value: 'post_production', label: 'Post-Production' },
  { value: 'review', label: 'Client Review' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
];

const equipmentCategories = [
  { value: 'camera', label: 'Cameras' },
  { value: 'audio', label: 'Audio Equipment' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'grip', label: 'Grip Equipment' },
  { value: 'storage', label: 'Storage/Media' },
  { value: 'other', label: 'Other' },
];

const equipmentStatuses = [
  { value: 'available', label: 'Available' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'reserved', label: 'Reserved' },
];

const postProductionPhases = [
  { value: 'ingest', label: 'Media Ingest' },
  { value: 'rough_cut', label: 'Rough Cut' },
  { value: 'fine_cut', label: 'Fine Cut' },
  { value: 'color', label: 'Color Grading' },
  { value: 'audio_mix', label: 'Audio Mix' },
  { value: 'graphics', label: 'Graphics/VFX' },
  { value: 'final', label: 'Final Review' },
  { value: 'delivery', label: 'Delivery Prep' },
];

const budgetCategories = [
  { value: 'crew', label: 'Crew' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'location', label: 'Location' },
  { value: 'talent', label: 'Talent' },
  { value: 'post_production', label: 'Post-Production' },
  { value: 'music_licensing', label: 'Music/Licensing' },
  { value: 'travel', label: 'Travel' },
  { value: 'catering', label: 'Catering' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

const licenseTypes = [
  { value: 'royalty_free', label: 'Royalty Free' },
  { value: 'rights_managed', label: 'Rights Managed' },
  { value: 'creative_commons', label: 'Creative Commons' },
  { value: 'exclusive', label: 'Exclusive License' },
  { value: 'work_for_hire', label: 'Work for Hire' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

interface AudioVideoToolProps {
  uiConfig?: UIConfig;
}

export const AudioVideoTool: React.FC<AudioVideoToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData for backend sync with localStorage fallback
  const {
    data: toolDataArray,
    setData: setToolDataArray,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    resetToDefault,
  } = useToolData<AudioVideoData>(
    'audio-video',
    [defaultData],
    projectColumns,
    { autoSave: true }
  );

  // Extract data from the array (useToolData manages arrays)
  const data = toolDataArray[0] || defaultData;

  // Helper to update data through the hook
  const setData = useCallback((updater: AudioVideoData | ((prev: AudioVideoData) => AudioVideoData)) => {
    setToolDataArray(prevArray => {
      const prev = prevArray[0] || defaultData;
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      return [newData];
    });
  }, [setToolDataArray]);

  const [activeTab, setActiveTab] = useState<string>('projects');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projectIntake: true,
    clients: true,
    calendar: true,
    equipment: false,
    studio: false,
    crew: false,
    shotList: false,
    storyboard: false,
    postProduction: false,
    revisions: false,
    deliverables: false,
    fileTransfer: false,
    licensing: false,
    budget: false,
  });

  // Data is now loaded/saved automatically by useToolData hook
  // No need for manual localStorage useEffect hooks

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateData = <K extends keyof AudioVideoData>(key: K, value: AudioVideoData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Client helpers
  const addClient = () => {
    const newClient: Client = {
      id: generateId(),
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    };
    updateData('clients', [...data.clients, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    updateData('clients', data.clients.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeClient = (id: string) => {
    updateData('clients', data.clients.filter(item => item.id !== id));
  };

  // Project helpers
  const addProject = () => {
    const newProject: Project = {
      id: generateId(),
      clientId: '',
      name: '',
      type: 'commercial',
      scope: '',
      deadline: '',
      status: 'intake',
      startDate: '',
      budget: 0,
      notes: '',
    };
    updateData('projects', [...data.projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    updateData('projects', data.projects.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeProject = (id: string) => {
    updateData('projects', data.projects.filter(item => item.id !== id));
  };

  // Equipment helpers
  const addEquipment = () => {
    const newEquipment: EquipmentItem = {
      id: generateId(),
      name: '',
      category: 'camera',
      serialNumber: '',
      status: 'available',
      checkedOutTo: '',
      dueDate: '',
      notes: '',
    };
    updateData('equipment', [...data.equipment, newEquipment]);
  };

  const updateEquipment = (id: string, updates: Partial<EquipmentItem>) => {
    updateData('equipment', data.equipment.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeEquipment = (id: string) => {
    updateData('equipment', data.equipment.filter(item => item.id !== id));
  };

  // Studio Booking helpers
  const addStudioBooking = () => {
    const newBooking: StudioBooking = {
      id: generateId(),
      studioName: '',
      projectId: data.activeProjectId || '',
      date: '',
      startTime: '',
      endTime: '',
      purpose: '',
      notes: '',
    };
    updateData('studioBookings', [...data.studioBookings, newBooking]);
  };

  const updateStudioBooking = (id: string, updates: Partial<StudioBooking>) => {
    updateData('studioBookings', data.studioBookings.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeStudioBooking = (id: string) => {
    updateData('studioBookings', data.studioBookings.filter(item => item.id !== id));
  };

  // Crew Member helpers
  const addCrewMember = () => {
    const newCrew: CrewMember = {
      id: generateId(),
      name: '',
      role: '',
      email: '',
      phone: '',
      rate: 0,
      availability: 'available',
    };
    updateData('crewMembers', [...data.crewMembers, newCrew]);
  };

  const updateCrewMember = (id: string, updates: Partial<CrewMember>) => {
    updateData('crewMembers', data.crewMembers.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeCrewMember = (id: string) => {
    updateData('crewMembers', data.crewMembers.filter(item => item.id !== id));
  };

  // Crew Assignment helpers
  const addCrewAssignment = () => {
    const newAssignment: CrewAssignment = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      crewMemberId: '',
      role: '',
      dates: [],
      notes: '',
    };
    updateData('crewAssignments', [...data.crewAssignments, newAssignment]);
  };

  const updateCrewAssignment = (id: string, updates: Partial<CrewAssignment>) => {
    updateData('crewAssignments', data.crewAssignments.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeCrewAssignment = (id: string) => {
    updateData('crewAssignments', data.crewAssignments.filter(item => item.id !== id));
  };

  // Shot List helpers
  const addShotListItem = () => {
    const newShot: ShotListItem = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      sceneNumber: '',
      shotNumber: '',
      description: '',
      shotType: '',
      camera: '',
      lens: '',
      movement: '',
      audio: '',
      notes: '',
      completed: false,
    };
    updateData('shotList', [...data.shotList, newShot]);
  };

  const updateShotListItem = (id: string, updates: Partial<ShotListItem>) => {
    updateData('shotList', data.shotList.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeShotListItem = (id: string) => {
    updateData('shotList', data.shotList.filter(item => item.id !== id));
  };

  // Storyboard helpers
  const addStoryboardItem = () => {
    const newFrame: StoryboardItem = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      sceneNumber: '',
      frameNumber: '',
      description: '',
      dialogue: '',
      action: '',
      cameraAngle: '',
      notes: '',
    };
    updateData('storyboard', [...data.storyboard, newFrame]);
  };

  const updateStoryboardItem = (id: string, updates: Partial<StoryboardItem>) => {
    updateData('storyboard', data.storyboard.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeStoryboardItem = (id: string) => {
    updateData('storyboard', data.storyboard.filter(item => item.id !== id));
  };

  // Post-Production Task helpers
  const addPostProductionTask = () => {
    const newTask: PostProductionTask = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      taskName: '',
      phase: 'ingest',
      assignedTo: '',
      dueDate: '',
      status: 'pending',
      notes: '',
    };
    updateData('postProductionTasks', [...data.postProductionTasks, newTask]);
  };

  const updatePostProductionTask = (id: string, updates: Partial<PostProductionTask>) => {
    updateData('postProductionTasks', data.postProductionTasks.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removePostProductionTask = (id: string) => {
    updateData('postProductionTasks', data.postProductionTasks.filter(item => item.id !== id));
  };

  // Revision helpers
  const addRevision = () => {
    const newRevision: Revision = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      version: '',
      requestedBy: '',
      requestDate: '',
      description: '',
      status: 'pending',
      completedDate: '',
      notes: '',
    };
    updateData('revisions', [...data.revisions, newRevision]);
  };

  const updateRevision = (id: string, updates: Partial<Revision>) => {
    updateData('revisions', data.revisions.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeRevision = (id: string) => {
    updateData('revisions', data.revisions.filter(item => item.id !== id));
  };

  // Deliverable Format helpers
  const addDeliverableFormat = () => {
    const newFormat: DeliverableFormat = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      formatName: '',
      resolution: '',
      codec: '',
      frameRate: '',
      audioFormat: '',
      fileSize: '',
      platform: '',
      delivered: false,
    };
    updateData('deliverableFormats', [...data.deliverableFormats, newFormat]);
  };

  const updateDeliverableFormat = (id: string, updates: Partial<DeliverableFormat>) => {
    updateData('deliverableFormats', data.deliverableFormats.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeDeliverableFormat = (id: string) => {
    updateData('deliverableFormats', data.deliverableFormats.filter(item => item.id !== id));
  };

  // File Transfer helpers
  const addFileTransfer = () => {
    const newTransfer: FileTransfer = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      fileName: '',
      fileSize: '',
      transferMethod: 'cloud',
      destination: '',
      status: 'pending',
      uploadDate: '',
      downloadLink: '',
      expiryDate: '',
      notes: '',
    };
    updateData('fileTransfers', [...data.fileTransfers, newTransfer]);
  };

  const updateFileTransfer = (id: string, updates: Partial<FileTransfer>) => {
    updateData('fileTransfers', data.fileTransfers.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeFileTransfer = (id: string) => {
    updateData('fileTransfers', data.fileTransfers.filter(item => item.id !== id));
  };

  // License helpers
  const addLicense = () => {
    const newLicense: License = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      assetName: '',
      licenseType: 'royalty_free',
      usageRights: '',
      territory: '',
      duration: '',
      startDate: '',
      endDate: '',
      cost: 0,
      provider: '',
      notes: '',
    };
    updateData('licenses', [...data.licenses, newLicense]);
  };

  const updateLicense = (id: string, updates: Partial<License>) => {
    updateData('licenses', data.licenses.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeLicense = (id: string) => {
    updateData('licenses', data.licenses.filter(item => item.id !== id));
  };

  // Budget Item helpers
  const addBudgetItem = () => {
    const newItem: BudgetItem = {
      id: generateId(),
      projectId: data.activeProjectId || '',
      category: 'crew',
      description: '',
      estimatedCost: 0,
      actualCost: 0,
      paid: false,
      notes: '',
    };
    updateData('budgetItems', [...data.budgetItems, newItem]);
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    updateData('budgetItems', data.budgetItems.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeBudgetItem = (id: string) => {
    updateData('budgetItems', data.budgetItems.filter(item => item.id !== id));
  };

  // Statistics
  const stats = useMemo(() => {
    const activeProject = data.projects.find(p => p.id === data.activeProjectId);
    const projectBudgetItems = data.budgetItems.filter(b => b.projectId === data.activeProjectId);
    const projectShots = data.shotList.filter(s => s.projectId === data.activeProjectId);
    const projectTasks = data.postProductionTasks.filter(t => t.projectId === data.activeProjectId);
    const projectRevisions = data.revisions.filter(r => r.projectId === data.activeProjectId);
    const projectDeliverables = data.deliverableFormats.filter(d => d.projectId === data.activeProjectId);

    const totalEstimated = projectBudgetItems.reduce((sum, b) => sum + b.estimatedCost, 0);
    const totalActual = projectBudgetItems.reduce((sum, b) => sum + b.actualCost, 0);
    const shotsCompleted = projectShots.filter(s => s.completed).length;
    const tasksCompleted = projectTasks.filter(t => t.status === 'completed').length;
    const revisionsCompleted = projectRevisions.filter(r => r.status === 'completed').length;
    const deliverablesCompleted = projectDeliverables.filter(d => d.delivered).length;
    const availableEquipment = data.equipment.filter(e => e.status === 'available').length;

    return {
      activeProject,
      totalProjects: data.projects.length,
      totalClients: data.clients.length,
      totalEquipment: data.equipment.length,
      availableEquipment,
      totalEstimated,
      totalActual,
      budgetVariance: totalEstimated - totalActual,
      shotsTotal: projectShots.length,
      shotsCompleted,
      tasksTotal: projectTasks.length,
      tasksCompleted,
      revisionsTotal: projectRevisions.length,
      revisionsCompleted,
      revisionsPending: projectRevisions.filter(r => r.status === 'pending').length,
      deliverablesTotal: projectDeliverables.length,
      deliverablesCompleted,
    };
  }, [data]);

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm Reset',
      message: 'Are you sure you want to reset all data? This cannot be undone.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      resetToDefault([defaultData]);
    }
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    badge,
  }: {
    title: string;
    icon: React.ElementType;
    section: string;
    badge?: string | number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-gray-700 hover:bg-gray-600'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#0D9488]" />
        </div>
        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </span>
        {badge !== undefined && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#0D9488]/20 text-[#0D9488]">
            {badge}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      ) : (
        <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      )}
    </button>
  );

  const inputClasses = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const textareaClasses = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none`;

  const selectClasses = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const labelClasses = `block text-sm font-medium mb-2 ${
    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
  }`;

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Film },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'equipment', label: 'Equipment', icon: Camera },
    { id: 'studio', label: 'Studio', icon: Building },
    { id: 'crew', label: 'Crew', icon: User },
    { id: 'production', label: 'Production', icon: Clapperboard },
    { id: 'post', label: 'Post', icon: Settings },
    { id: 'delivery', label: 'Delivery', icon: Send },
    { id: 'budget', label: 'Budget', icon: DollarSign },
  ];

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Video className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.audioVideo.audioVideoProductionTool', 'Audio/Video Production Tool')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.audioVideo.manageYourProductionProjectsFrom', 'Manage your production projects from intake to delivery')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="audio-video" toolName="Audio Video" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => {
              exportToCSV(data.projects, projectColumns, { filename: 'audio-video-projects' });
            }}
            onExportExcel={() => {
              exportToExcel(data.projects, projectColumns, { filename: 'audio-video-projects' });
            }}
            onExportJSON={() => {
              exportToJSON([data], { filename: 'audio-video-data' });
            }}
            onExportPDF={async () => {
              await exportToPDF(data.projects, projectColumns, {
                filename: 'audio-video-projects',
                title: 'Audio/Video Production Report',
                subtitle: `${data.projects.length} projects | ${data.clients.length} clients`,
              });
            }}
            onPrint={() => {
              printData(data.projects, projectColumns, { title: 'Audio/Video Projects' });
            }}
            onCopyToClipboard={async () => {
              return await copyUtil(data.projects, projectColumns, 'tab');
            }}
            showImport={false}
            theme={theme}
          />
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            {t('tools.audioVideo.resetAll', 'Reset All')}
          </button>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.audioVideo.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.projects', 'Projects')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalProjects}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.clients', 'Clients')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalClients}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.equipment', 'Equipment')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.availableEquipment}/{stats.totalEquipment}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.shots', 'Shots')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.shotsCompleted}/{stats.shotsTotal}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.tasks', 'Tasks')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.tasksCompleted}/{stats.tasksTotal}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.budget', 'Budget')}</p>
          <p className={`text-lg font-bold text-[#0D9488]`}>
            ${stats.totalActual.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Active Project Selector */}
      <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <label className={labelClasses}>{t('tools.audioVideo.activeProject', 'Active Project')}</label>
        <select
          value={data.activeProjectId || ''}
          onChange={(e) => updateData('activeProjectId', e.target.value || null)}
          className={selectClasses}
        >
          <option value="">{t('tools.audioVideo.selectAProject', 'Select a project...')}</option>
          {data.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name || 'Untitled Project'} - {projectStatuses.find(s => s.value === project.status)?.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <SectionHeader title={t('tools.audioVideo.projectIntake', 'Project Intake')} icon={Film} section="projectIntake" badge={data.projects.length} />
            {expandedSections.projectIntake && (
              <div className={`mt-4 p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="space-y-4">
                  {data.projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-4 rounded-lg ${
                        project.id === data.activeProjectId
                          ? 'ring-2 ring-[#0D9488] ' + (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')
                          : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.projectName', 'Project Name')}</label>
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) => updateProject(project.id, { name: e.target.value })}
                            placeholder={t('tools.audioVideo.projectName2', 'Project name')}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.client', 'Client')}</label>
                          <select
                            value={project.clientId}
                            onChange={(e) => updateProject(project.id, { clientId: e.target.value })}
                            className={selectClasses}
                          >
                            <option value="">{t('tools.audioVideo.selectClient', 'Select client...')}</option>
                            {data.clients.map((client) => (
                              <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.type', 'Type')}</label>
                          <select
                            value={project.type}
                            onChange={(e) => updateProject(project.id, { type: e.target.value as Project['type'] })}
                            className={selectClasses}
                          >
                            {projectTypes.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.status', 'Status')}</label>
                          <select
                            value={project.status}
                            onChange={(e) => updateProject(project.id, { status: e.target.value as Project['status'] })}
                            className={selectClasses}
                          >
                            {projectStatuses.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.startDate', 'Start Date')}</label>
                          <input
                            type="date"
                            value={project.startDate}
                            onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.deadline', 'Deadline')}</label>
                          <input
                            type="date"
                            value={project.deadline}
                            onChange={(e) => updateProject(project.id, { deadline: e.target.value })}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.budget2', 'Budget ($)')}</label>
                          <input
                            type="number"
                            value={project.budget || ''}
                            onChange={(e) => updateProject(project.id, { budget: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClasses}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>{t('tools.audioVideo.scope', 'Scope')}</label>
                          <textarea
                            value={project.scope}
                            onChange={(e) => updateProject(project.id, { scope: e.target.value })}
                            placeholder={t('tools.audioVideo.projectScopeAndDeliverables', 'Project scope and deliverables...')}
                            rows={2}
                            className={textareaClasses}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => updateData('activeProjectId', project.id)}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            project.id === data.activeProjectId
                              ? t('tools.audioVideo.bg0d9488TextWhite', 'bg-[#0D9488] text-white') : t('tools.audioVideo.text0d9488HoverBg0d9488', 'text-[#0D9488] hover:bg-[#0D9488]/10')
                          }`}
                        >
                          {project.id === data.activeProjectId ? t('tools.audioVideo.active', 'Active') : t('tools.audioVideo.setActive', 'Set Active')}
                        </button>
                        <button
                          onClick={() => removeProject(project.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addProject}
                    className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.audioVideo.addProject', 'Add Project')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <SectionHeader title={t('tools.audioVideo.clientProfiles', 'Client Profiles')} icon={Users} section="clients" badge={data.clients.length} />
            {expandedSections.clients && (
              <div className={`mt-4 p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="space-y-4">
                  {data.clients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.name', 'Name')}</label>
                          <input
                            type="text"
                            value={client.name}
                            onChange={(e) => updateClient(client.id, { name: e.target.value })}
                            placeholder={t('tools.audioVideo.clientName', 'Client name')}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.company', 'Company')}</label>
                          <input
                            type="text"
                            value={client.company}
                            onChange={(e) => updateClient(client.id, { company: e.target.value })}
                            placeholder={t('tools.audioVideo.companyName', 'Company name')}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.email', 'Email')}</label>
                          <input
                            type="email"
                            value={client.email}
                            onChange={(e) => updateClient(client.id, { email: e.target.value })}
                            placeholder={t('tools.audioVideo.emailExampleCom', 'email@example.com')}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.phone', 'Phone')}</label>
                          <input
                            type="tel"
                            value={client.phone}
                            onChange={(e) => updateClient(client.id, { phone: e.target.value })}
                            placeholder={t('tools.audioVideo.phoneNumber', 'Phone number')}
                            className={inputClasses}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>{t('tools.audioVideo.address', 'Address')}</label>
                          <input
                            type="text"
                            value={client.address}
                            onChange={(e) => updateClient(client.id, { address: e.target.value })}
                            placeholder={t('tools.audioVideo.address2', 'Address')}
                            className={inputClasses}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className={labelClasses}>{t('tools.audioVideo.notes', 'Notes')}</label>
                          <textarea
                            value={client.notes}
                            onChange={(e) => updateClient(client.id, { notes: e.target.value })}
                            placeholder={t('tools.audioVideo.additionalNotes', 'Additional notes...')}
                            rows={2}
                            className={textareaClasses}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => removeClient(client.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addClient}
                    className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.audioVideo.addClient', 'Add Client')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div>
            <SectionHeader title={t('tools.audioVideo.equipmentBookingCheckout', 'Equipment Booking/Checkout')} icon={Camera} section="equipment" badge={data.equipment.length} />
            {expandedSections.equipment !== false && (
              <div className={`mt-4 p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {equipmentCategories.map((category) => {
                  const categoryItems = data.equipment.filter(e => e.category === category.value);
                  return (
                    <div key={category.value} className="mb-6">
                      <h4 className={`text-sm font-medium mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {category.label} ({categoryItems.length})
                      </h4>
                      <div className="space-y-3">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateEquipment(item.id, { name: e.target.value })}
                                placeholder={t('tools.audioVideo.equipmentName', 'Equipment name')}
                                className={inputClasses}
                              />
                              <input
                                type="text"
                                value={item.serialNumber}
                                onChange={(e) => updateEquipment(item.id, { serialNumber: e.target.value })}
                                placeholder={t('tools.audioVideo.serialNumber', 'Serial number')}
                                className={inputClasses}
                              />
                              <select
                                value={item.status}
                                onChange={(e) => updateEquipment(item.id, { status: e.target.value as EquipmentItem['status'] })}
                                className={selectClasses}
                              >
                                {equipmentStatuses.map((status) => (
                                  <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <select
                                  value={item.category}
                                  onChange={(e) => updateEquipment(item.id, { category: e.target.value as EquipmentItem['category'] })}
                                  className={`flex-1 ${selectClasses}`}
                                >
                                  {equipmentCategories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => removeEquipment(item.id)}
                                  className="p-2 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {item.status === 'checked_out' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <input
                                  type="text"
                                  value={item.checkedOutTo}
                                  onChange={(e) => updateEquipment(item.id, { checkedOutTo: e.target.value })}
                                  placeholder={t('tools.audioVideo.checkedOutTo', 'Checked out to')}
                                  className={inputClasses}
                                />
                                <input
                                  type="date"
                                  value={item.dueDate}
                                  onChange={(e) => updateEquipment(item.id, { dueDate: e.target.value })}
                                  className={inputClasses}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={addEquipment}
                  className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.audioVideo.addEquipment', 'Add Equipment')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Studio Tab */}
        {activeTab === 'studio' && (
          <div>
            <SectionHeader title={t('tools.audioVideo.studioScheduling', 'Studio Scheduling')} icon={Building} section="studio" badge={data.studioBookings.length} />
            {expandedSections.studio !== false && (
              <div className={`mt-4 p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="space-y-4">
                  {data.studioBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.studioName', 'Studio Name')}</label>
                          <input
                            type="text"
                            value={booking.studioName}
                            onChange={(e) => updateStudioBooking(booking.id, { studioName: e.target.value })}
                            placeholder={t('tools.audioVideo.studioARecordingRoomEtc', 'Studio A, Recording Room, etc.')}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.project', 'Project')}</label>
                          <select
                            value={booking.projectId}
                            onChange={(e) => updateStudioBooking(booking.id, { projectId: e.target.value })}
                            className={selectClasses}
                          >
                            <option value="">{t('tools.audioVideo.selectProject', 'Select project...')}</option>
                            {data.projects.map((project) => (
                              <option key={project.id} value={project.id}>{project.name || 'Untitled'}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.date', 'Date')}</label>
                          <input
                            type="date"
                            value={booking.date}
                            onChange={(e) => updateStudioBooking(booking.id, { date: e.target.value })}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.startTime', 'Start Time')}</label>
                          <input
                            type="time"
                            value={booking.startTime}
                            onChange={(e) => updateStudioBooking(booking.id, { startTime: e.target.value })}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.endTime', 'End Time')}</label>
                          <input
                            type="time"
                            value={booking.endTime}
                            onChange={(e) => updateStudioBooking(booking.id, { endTime: e.target.value })}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>{t('tools.audioVideo.purpose', 'Purpose')}</label>
                          <input
                            type="text"
                            value={booking.purpose}
                            onChange={(e) => updateStudioBooking(booking.id, { purpose: e.target.value })}
                            placeholder={t('tools.audioVideo.recordingFilmingEtc', 'Recording, filming, etc.')}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => removeStudioBooking(booking.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addStudioBooking}
                    className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.audioVideo.addBooking', 'Add Booking')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Crew Tab */}
        {activeTab === 'crew' && (
          <>
            <div className="mb-4">
              <SectionHeader title={t('tools.audioVideo.crewMembers', 'Crew Members')} icon={User} section="crew" badge={data.crewMembers.length} />
              {expandedSections.crew !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.crewMembers.map((crew) => (
                      <div
                        key={crew.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.name2', 'Name')}</label>
                            <input
                              type="text"
                              value={crew.name}
                              onChange={(e) => updateCrewMember(crew.id, { name: e.target.value })}
                              placeholder={t('tools.audioVideo.crewMemberName', 'Crew member name')}
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.role', 'Role')}</label>
                            <input
                              type="text"
                              value={crew.role}
                              onChange={(e) => updateCrewMember(crew.id, { role: e.target.value })}
                              placeholder={t('tools.audioVideo.directorDpEditorEtc', 'Director, DP, Editor, etc.')}
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.email2', 'Email')}</label>
                            <input
                              type="email"
                              value={crew.email}
                              onChange={(e) => updateCrewMember(crew.id, { email: e.target.value })}
                              placeholder={t('tools.audioVideo.emailExampleCom2', 'email@example.com')}
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.phone2', 'Phone')}</label>
                            <input
                              type="tel"
                              value={crew.phone}
                              onChange={(e) => updateCrewMember(crew.id, { phone: e.target.value })}
                              placeholder={t('tools.audioVideo.phoneNumber2', 'Phone number')}
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.dayRate', 'Day Rate ($)')}</label>
                            <input
                              type="number"
                              value={crew.rate || ''}
                              onChange={(e) => updateCrewMember(crew.id, { rate: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.availability', 'Availability')}</label>
                            <select
                              value={crew.availability}
                              onChange={(e) => updateCrewMember(crew.id, { availability: e.target.value as CrewMember['availability'] })}
                              className={selectClasses}
                            >
                              <option value="available">{t('tools.audioVideo.available', 'Available')}</option>
                              <option value="busy">{t('tools.audioVideo.busy', 'Busy')}</option>
                              <option value="on_leave">{t('tools.audioVideo.onLeave', 'On Leave')}</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => removeCrewMember(crew.id)}
                            className="p-2 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addCrewMember}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addCrewMember', 'Add Crew Member')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Crew Assignments */}
            <div>
              <SectionHeader title={t('tools.audioVideo.crewAssignments', 'Crew Assignments')} icon={Users} section="crewAssignments" badge={data.crewAssignments.filter(a => a.projectId === data.activeProjectId).length} />
              {expandedSections.crewAssignments !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.crewAssignments.filter(a => a.projectId === data.activeProjectId).map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.crewMember', 'Crew Member')}</label>
                            <select
                              value={assignment.crewMemberId}
                              onChange={(e) => updateCrewAssignment(assignment.id, { crewMemberId: e.target.value })}
                              className={selectClasses}
                            >
                              <option value="">{t('tools.audioVideo.selectCrewMember', 'Select crew member...')}</option>
                              {data.crewMembers.map((crew) => (
                                <option key={crew.id} value={crew.id}>{crew.name} - {crew.role}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.roleOnProject', 'Role on Project')}</label>
                            <input
                              type="text"
                              value={assignment.role}
                              onChange={(e) => updateCrewAssignment(assignment.id, { role: e.target.value })}
                              placeholder={t('tools.audioVideo.roleForThisProject', 'Role for this project')}
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>{t('tools.audioVideo.notes2', 'Notes')}</label>
                            <input
                              type="text"
                              value={assignment.notes}
                              onChange={(e) => updateCrewAssignment(assignment.id, { notes: e.target.value })}
                              placeholder={t('tools.audioVideo.additionalNotes2', 'Additional notes')}
                              className={inputClasses}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => removeCrewAssignment(assignment.id)}
                            className="p-2 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addCrewAssignment}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addAssignment', 'Add Assignment')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Production Tab */}
        {activeTab === 'production' && (
          <>
            {/* Shot List */}
            <div className="mb-4">
              <SectionHeader title={t('tools.audioVideo.shotList', 'Shot List')} icon={List} section="shotList" badge={`${stats.shotsCompleted}/${stats.shotsTotal}`} />
              {expandedSections.shotList !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.shotList.filter(s => s.projectId === data.activeProjectId).map((shot) => (
                      <div
                        key={shot.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => updateShotListItem(shot.id, { completed: !shot.completed })}
                            className="mt-1"
                          >
                            {shot.completed ? (
                              <CheckSquare className="w-5 h-5 text-[#0D9488]" />
                            ) : (
                              <Square className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                              type="text"
                              value={shot.sceneNumber}
                              onChange={(e) => updateShotListItem(shot.id, { sceneNumber: e.target.value })}
                              placeholder={t('tools.audioVideo.scene', 'Scene #')}
                              className={`${inputClasses} ${shot.completed ? 'line-through opacity-60' : ''}`}
                            />
                            <input
                              type="text"
                              value={shot.shotNumber}
                              onChange={(e) => updateShotListItem(shot.id, { shotNumber: e.target.value })}
                              placeholder={t('tools.audioVideo.shot', 'Shot #')}
                              className={`${inputClasses} ${shot.completed ? 'line-through opacity-60' : ''}`}
                            />
                            <input
                              type="text"
                              value={shot.shotType}
                              onChange={(e) => updateShotListItem(shot.id, { shotType: e.target.value })}
                              placeholder={t('tools.audioVideo.shotTypeWsMsCu', 'Shot type (WS, MS, CU)')}
                              className={inputClasses}
                            />
                            <input
                              type="text"
                              value={shot.camera}
                              onChange={(e) => updateShotListItem(shot.id, { camera: e.target.value })}
                              placeholder={t('tools.audioVideo.camera', 'Camera')}
                              className={inputClasses}
                            />
                            <div className="md:col-span-2">
                              <input
                                type="text"
                                value={shot.description}
                                onChange={(e) => updateShotListItem(shot.id, { description: e.target.value })}
                                placeholder={t('tools.audioVideo.shotDescription', 'Shot description')}
                                className={`${inputClasses} ${shot.completed ? 'line-through opacity-60' : ''}`}
                              />
                            </div>
                            <input
                              type="text"
                              value={shot.lens}
                              onChange={(e) => updateShotListItem(shot.id, { lens: e.target.value })}
                              placeholder={t('tools.audioVideo.lens', 'Lens')}
                              className={inputClasses}
                            />
                            <input
                              type="text"
                              value={shot.movement}
                              onChange={(e) => updateShotListItem(shot.id, { movement: e.target.value })}
                              placeholder={t('tools.audioVideo.cameraMovement', 'Camera movement')}
                              className={inputClasses}
                            />
                          </div>
                          <button
                            onClick={() => removeShotListItem(shot.id)}
                            className="p-2 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addShotListItem}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addShot', 'Add Shot')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Storyboard */}
            <div>
              <SectionHeader title={t('tools.audioVideo.storyboard', 'Storyboard')} icon={Clapperboard} section="storyboard" badge={data.storyboard.filter(s => s.projectId === data.activeProjectId).length} />
              {expandedSections.storyboard !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.storyboard.filter(s => s.projectId === data.activeProjectId).map((frame) => (
                      <div
                        key={frame.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={frame.sceneNumber}
                            onChange={(e) => updateStoryboardItem(frame.id, { sceneNumber: e.target.value })}
                            placeholder={t('tools.audioVideo.scene2', 'Scene #')}
                            className={inputClasses}
                          />
                          <input
                            type="text"
                            value={frame.frameNumber}
                            onChange={(e) => updateStoryboardItem(frame.id, { frameNumber: e.target.value })}
                            placeholder={t('tools.audioVideo.frame', 'Frame #')}
                            className={inputClasses}
                          />
                          <input
                            type="text"
                            value={frame.cameraAngle}
                            onChange={(e) => updateStoryboardItem(frame.id, { cameraAngle: e.target.value })}
                            placeholder={t('tools.audioVideo.cameraAngle', 'Camera angle')}
                            className={inputClasses}
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={frame.action}
                              onChange={(e) => updateStoryboardItem(frame.id, { action: e.target.value })}
                              placeholder={t('tools.audioVideo.action', 'Action')}
                              className={inputClasses}
                            />
                            <button
                              onClick={() => removeStoryboardItem(frame.id)}
                              className="p-2 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={frame.description}
                              onChange={(e) => updateStoryboardItem(frame.id, { description: e.target.value })}
                              placeholder={t('tools.audioVideo.visualDescription', 'Visual description')}
                              className={inputClasses}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={frame.dialogue}
                              onChange={(e) => updateStoryboardItem(frame.id, { dialogue: e.target.value })}
                              placeholder={t('tools.audioVideo.dialogue', 'Dialogue')}
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addStoryboardItem}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addFrame', 'Add Frame')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Post-Production Tab */}
        {activeTab === 'post' && (
          <>
            {/* Post-Production Workflow */}
            <div className="mb-4">
              <SectionHeader title={t('tools.audioVideo.postProductionWorkflow', 'Post-Production Workflow')} icon={Settings} section="postProduction" badge={`${stats.tasksCompleted}/${stats.tasksTotal}`} />
              {expandedSections.postProduction !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  {postProductionPhases.map((phase) => {
                    const phaseTasks = data.postProductionTasks.filter(t => t.projectId === data.activeProjectId && t.phase === phase.value);
                    return (
                      <div key={phase.value} className="mb-6">
                        <h4 className={`text-sm font-medium mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {phase.label} ({phaseTasks.filter(t => t.status === 'completed').length}/{phaseTasks.length})
                        </h4>
                        <div className="space-y-3">
                          {phaseTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input
                                  type="text"
                                  value={task.taskName}
                                  onChange={(e) => updatePostProductionTask(task.id, { taskName: e.target.value })}
                                  placeholder={t('tools.audioVideo.taskName', 'Task name')}
                                  className={inputClasses}
                                />
                                <input
                                  type="text"
                                  value={task.assignedTo}
                                  onChange={(e) => updatePostProductionTask(task.id, { assignedTo: e.target.value })}
                                  placeholder={t('tools.audioVideo.assignedTo', 'Assigned to')}
                                  className={inputClasses}
                                />
                                <input
                                  type="date"
                                  value={task.dueDate}
                                  onChange={(e) => updatePostProductionTask(task.id, { dueDate: e.target.value })}
                                  className={inputClasses}
                                />
                                <div className="flex gap-2">
                                  <select
                                    value={task.status}
                                    onChange={(e) => updatePostProductionTask(task.id, { status: e.target.value as PostProductionTask['status'] })}
                                    className={`flex-1 ${selectClasses}`}
                                  >
                                    <option value="pending">{t('tools.audioVideo.pending', 'Pending')}</option>
                                    <option value="in_progress">{t('tools.audioVideo.inProgress', 'In Progress')}</option>
                                    <option value="review">{t('tools.audioVideo.review', 'Review')}</option>
                                    <option value="completed">{t('tools.audioVideo.completed', 'Completed')}</option>
                                  </select>
                                  <button
                                    onClick={() => removePostProductionTask(task.id)}
                                    className="p-2 text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={addPostProductionTask}
                    className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.audioVideo.addTask', 'Add Task')}
                  </button>
                </div>
              )}
            </div>

            {/* Revision Tracking */}
            <div>
              <SectionHeader title={t('tools.audioVideo.revisionTracking', 'Revision Tracking')} icon={RotateCcw} section="revisions" badge={stats.revisionsPending > 0 ? `${stats.revisionsPending} pending` : stats.revisionsTotal} />
              {expandedSections.revisions !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.revisions.filter(r => r.projectId === data.activeProjectId).map((revision) => (
                      <div
                        key={revision.id}
                        className={`p-4 rounded-lg ${
                          revision.status === 'pending'
                            ? 'ring-2 ring-yellow-500/50 ' + (theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50')
                            : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={revision.version}
                            onChange={(e) => updateRevision(revision.id, { version: e.target.value })}
                            placeholder={t('tools.audioVideo.versionV1V2Etc', 'Version (v1, v2, etc.)')}
                            className={inputClasses}
                          />
                          <input
                            type="text"
                            value={revision.requestedBy}
                            onChange={(e) => updateRevision(revision.id, { requestedBy: e.target.value })}
                            placeholder={t('tools.audioVideo.requestedBy', 'Requested by')}
                            className={inputClasses}
                          />
                          <input
                            type="date"
                            value={revision.requestDate}
                            onChange={(e) => updateRevision(revision.id, { requestDate: e.target.value })}
                            className={inputClasses}
                          />
                          <select
                            value={revision.status}
                            onChange={(e) => updateRevision(revision.id, { status: e.target.value as Revision['status'] })}
                            className={selectClasses}
                          >
                            <option value="pending">{t('tools.audioVideo.pending2', 'Pending')}</option>
                            <option value="in_progress">{t('tools.audioVideo.inProgress2', 'In Progress')}</option>
                            <option value="completed">{t('tools.audioVideo.completed2', 'Completed')}</option>
                            <option value="rejected">{t('tools.audioVideo.rejected', 'Rejected')}</option>
                          </select>
                          <div className="md:col-span-3">
                            <textarea
                              value={revision.description}
                              onChange={(e) => updateRevision(revision.id, { description: e.target.value })}
                              placeholder={t('tools.audioVideo.revisionDescription', 'Revision description...')}
                              rows={2}
                              className={textareaClasses}
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => removeRevision(revision.id)}
                              className="p-2 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addRevision}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addRevision', 'Add Revision')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <>
            {/* Deliverable Formats */}
            <div className="mb-4">
              <SectionHeader title={t('tools.audioVideo.deliverableFormats', 'Deliverable Formats')} icon={Monitor} section="deliverables" badge={`${stats.deliverablesCompleted}/${stats.deliverablesTotal}`} />
              {expandedSections.deliverables !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.deliverableFormats.filter(d => d.projectId === data.activeProjectId).map((format) => (
                      <div
                        key={format.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => updateDeliverableFormat(format.id, { delivered: !format.delivered })}
                            className="mt-1"
                          >
                            {format.delivered ? (
                              <CheckSquare className="w-5 h-5 text-[#0D9488]" />
                            ) : (
                              <Square className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                              type="text"
                              value={format.formatName}
                              onChange={(e) => updateDeliverableFormat(format.id, { formatName: e.target.value })}
                              placeholder={t('tools.audioVideo.formatNameWebBroadcastEtc', 'Format name (Web, Broadcast, etc.)')}
                              className={`${inputClasses} ${format.delivered ? 'line-through opacity-60' : ''}`}
                            />
                            <input
                              type="text"
                              value={format.resolution}
                              onChange={(e) => updateDeliverableFormat(format.id, { resolution: e.target.value })}
                              placeholder={t('tools.audioVideo.resolution1920x1080', 'Resolution (1920x1080)')}
                              className={inputClasses}
                            />
                            <input
                              type="text"
                              value={format.codec}
                              onChange={(e) => updateDeliverableFormat(format.id, { codec: e.target.value })}
                              placeholder={t('tools.audioVideo.codecH264Prores', 'Codec (H.264, ProRes)')}
                              className={inputClasses}
                            />
                            <input
                              type="text"
                              value={format.frameRate}
                              onChange={(e) => updateDeliverableFormat(format.id, { frameRate: e.target.value })}
                              placeholder={t('tools.audioVideo.frameRate24fps30fps', 'Frame rate (24fps, 30fps)')}
                              className={inputClasses}
                            />
                            <input
                              type="text"
                              value={format.audioFormat}
                              onChange={(e) => updateDeliverableFormat(format.id, { audioFormat: e.target.value })}
                              placeholder={t('tools.audioVideo.audioFormatAacPcm', 'Audio format (AAC, PCM)')}
                              className={inputClasses}
                            />
                            <input
                              type="text"
                              value={format.platform}
                              onChange={(e) => updateDeliverableFormat(format.id, { platform: e.target.value })}
                              placeholder={t('tools.audioVideo.platformYoutubeTv', 'Platform (YouTube, TV)')}
                              className={inputClasses}
                            />
                            <input
                              type="text"
                              value={format.fileSize}
                              onChange={(e) => updateDeliverableFormat(format.id, { fileSize: e.target.value })}
                              placeholder={t('tools.audioVideo.fileSize', 'File size')}
                              className={inputClasses}
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => removeDeliverableFormat(format.id)}
                                className="p-2 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addDeliverableFormat}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addFormat', 'Add Format')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* File Transfer/Delivery */}
            <div className="mb-4">
              <SectionHeader title={t('tools.audioVideo.fileTransferDelivery', 'File Transfer/Delivery')} icon={Upload} section="fileTransfer" badge={data.fileTransfers.filter(f => f.projectId === data.activeProjectId).length} />
              {expandedSections.fileTransfer !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.fileTransfers.filter(f => f.projectId === data.activeProjectId).map((transfer) => (
                      <div
                        key={transfer.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={transfer.fileName}
                            onChange={(e) => updateFileTransfer(transfer.id, { fileName: e.target.value })}
                            placeholder={t('tools.audioVideo.fileName', 'File name')}
                            className={inputClasses}
                          />
                          <input
                            type="text"
                            value={transfer.fileSize}
                            onChange={(e) => updateFileTransfer(transfer.id, { fileSize: e.target.value })}
                            placeholder={t('tools.audioVideo.fileSize2', 'File size')}
                            className={inputClasses}
                          />
                          <select
                            value={transfer.transferMethod}
                            onChange={(e) => updateFileTransfer(transfer.id, { transferMethod: e.target.value as FileTransfer['transferMethod'] })}
                            className={selectClasses}
                          >
                            <option value="cloud">{t('tools.audioVideo.cloudStorage', 'Cloud Storage')}</option>
                            <option value="ftp">{t('tools.audioVideo.ftp', 'FTP')}</option>
                            <option value="physical">{t('tools.audioVideo.physicalDrive', 'Physical Drive')}</option>
                            <option value="streaming">{t('tools.audioVideo.streamingPlatform', 'Streaming Platform')}</option>
                          </select>
                          <select
                            value={transfer.status}
                            onChange={(e) => updateFileTransfer(transfer.id, { status: e.target.value as FileTransfer['status'] })}
                            className={selectClasses}
                          >
                            <option value="pending">{t('tools.audioVideo.pending3', 'Pending')}</option>
                            <option value="uploading">{t('tools.audioVideo.uploading', 'Uploading')}</option>
                            <option value="completed">{t('tools.audioVideo.completed3', 'Completed')}</option>
                            <option value="failed">{t('tools.audioVideo.failed', 'Failed')}</option>
                          </select>
                          <input
                            type="text"
                            value={transfer.destination}
                            onChange={(e) => updateFileTransfer(transfer.id, { destination: e.target.value })}
                            placeholder={t('tools.audioVideo.destination', 'Destination')}
                            className={inputClasses}
                          />
                          <input
                            type="url"
                            value={transfer.downloadLink}
                            onChange={(e) => updateFileTransfer(transfer.id, { downloadLink: e.target.value })}
                            placeholder={t('tools.audioVideo.downloadLink', 'Download link')}
                            className={inputClasses}
                          />
                          <input
                            type="date"
                            value={transfer.expiryDate}
                            onChange={(e) => updateFileTransfer(transfer.id, { expiryDate: e.target.value })}
                            className={inputClasses}
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeFileTransfer(transfer.id)}
                              className="p-2 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFileTransfer}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addTransfer', 'Add Transfer')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rights/Usage Licensing */}
            <div>
              <SectionHeader title={t('tools.audioVideo.rightsUsageLicensing', 'Rights/Usage Licensing')} icon={Shield} section="licensing" badge={data.licenses.filter(l => l.projectId === data.activeProjectId).length} />
              {expandedSections.licensing !== false && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="space-y-4">
                    {data.licenses.filter(l => l.projectId === data.activeProjectId).map((license) => (
                      <div
                        key={license.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={license.assetName}
                            onChange={(e) => updateLicense(license.id, { assetName: e.target.value })}
                            placeholder={t('tools.audioVideo.assetNameMusicFootageEtc', 'Asset name (music, footage, etc.)')}
                            className={inputClasses}
                          />
                          <select
                            value={license.licenseType}
                            onChange={(e) => updateLicense(license.id, { licenseType: e.target.value as License['licenseType'] })}
                            className={selectClasses}
                          >
                            {licenseTypes.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={license.provider}
                            onChange={(e) => updateLicense(license.id, { provider: e.target.value })}
                            placeholder={t('tools.audioVideo.providerSource', 'Provider/Source')}
                            className={inputClasses}
                          />
                          <input
                            type="number"
                            value={license.cost || ''}
                            onChange={(e) => updateLicense(license.id, { cost: parseFloat(e.target.value) || 0 })}
                            placeholder={t('tools.audioVideo.cost', 'Cost ($)')}
                            min="0"
                            step="0.01"
                            className={inputClasses}
                          />
                          <input
                            type="text"
                            value={license.usageRights}
                            onChange={(e) => updateLicense(license.id, { usageRights: e.target.value })}
                            placeholder={t('tools.audioVideo.usageRights', 'Usage rights')}
                            className={inputClasses}
                          />
                          <input
                            type="text"
                            value={license.territory}
                            onChange={(e) => updateLicense(license.id, { territory: e.target.value })}
                            placeholder={t('tools.audioVideo.territoryWorldwideUsEtc', 'Territory (Worldwide, US, etc.)')}
                            className={inputClasses}
                          />
                          <input
                            type="date"
                            value={license.startDate}
                            onChange={(e) => updateLicense(license.id, { startDate: e.target.value })}
                            className={inputClasses}
                          />
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={license.endDate}
                              onChange={(e) => updateLicense(license.id, { endDate: e.target.value })}
                              className={`flex-1 ${inputClasses}`}
                            />
                            <button
                              onClick={() => removeLicense(license.id)}
                              className="p-2 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addLicense}
                      className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.audioVideo.addLicense', 'Add License')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div>
            <SectionHeader title={t('tools.audioVideo.projectBudgetTracking', 'Project Budget Tracking')} icon={DollarSign} section="budget" badge={`$${stats.totalActual.toLocaleString()}`} />
            {expandedSections.budget !== false && (
              <div className={`mt-4 p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {/* Budget Summary */}
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
                }`}>
                  <div className="text-center">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.estimated', 'Estimated')}</p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${stats.totalEstimated.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.actual', 'Actual')}</p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${stats.totalActual.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.variance', 'Variance')}</p>
                    <p className={`text-lg font-bold ${
                      stats.budgetVariance >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stats.budgetVariance >= 0 ? '+' : ''}${stats.budgetVariance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioVideo.projectBudget', 'Project Budget')}</p>
                    <p className={`text-lg font-bold text-[#0D9488]`}>
                      ${stats.activeProject?.budget?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {/* Budget Items by Category */}
                {budgetCategories.map((category) => {
                  const categoryItems = data.budgetItems.filter(b => b.projectId === data.activeProjectId && b.category === category.value);
                  const categoryEstimated = categoryItems.reduce((sum, b) => sum + b.estimatedCost, 0);
                  const categoryActual = categoryItems.reduce((sum, b) => sum + b.actualCost, 0);

                  return (
                    <div key={category.value} className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {category.label}
                        </h4>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Est: ${categoryEstimated.toLocaleString()} | Actual: ${categoryActual.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                              <div className="md:col-span-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updateBudgetItem(item.id, { description: e.target.value })}
                                  placeholder={t('tools.audioVideo.description', 'Description')}
                                  className={inputClasses}
                                />
                              </div>
                              <input
                                type="number"
                                value={item.estimatedCost || ''}
                                onChange={(e) => updateBudgetItem(item.id, { estimatedCost: parseFloat(e.target.value) || 0 })}
                                placeholder={t('tools.audioVideo.estimated2', 'Estimated ($)')}
                                min="0"
                                step="0.01"
                                className={inputClasses}
                              />
                              <input
                                type="number"
                                value={item.actualCost || ''}
                                onChange={(e) => updateBudgetItem(item.id, { actualCost: parseFloat(e.target.value) || 0 })}
                                placeholder={t('tools.audioVideo.actual2', 'Actual ($)')}
                                min="0"
                                step="0.01"
                                className={inputClasses}
                              />
                              <div className="flex items-center gap-3">
                                <label className={`flex items-center gap-2 cursor-pointer ${
                                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={item.paid}
                                    onChange={(e) => updateBudgetItem(item.id, { paid: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                                  />
                                  <span className="text-sm">{t('tools.audioVideo.paid', 'Paid')}</span>
                                </label>
                                <button
                                  onClick={() => removeBudgetItem(item.id)}
                                  className="p-2 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={addBudgetItem}
                  className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.audioVideo.addBudgetItem', 'Add Budget Item')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.audioVideo.aboutAudioVideoProductionTool', 'About Audio/Video Production Tool')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.audioVideo.aComprehensiveProductionManagementTool', 'A comprehensive production management tool for audio and video projects. Manage project intake, client profiles, production calendars, equipment booking, studio scheduling, crew assignments, shot lists, storyboards, post-production workflows, revision tracking, deliverable formats, file transfers, rights/usage licensing, and project budgets. All data is automatically saved to your browser.')}
          </p>
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default AudioVideoTool;
