'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Palette,
  TreeDeciduous,
  MapPin,
  User,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  Layers,
  Mountain,
  Droplets,
  Lightbulb,
  Fence,
  Square,
  PenTool,
  Home,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface LandscapeDesignToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ProjectStatus = 'inquiry' | 'design' | 'proposal' | 'approved' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
type ProjectType = 'full-landscape' | 'hardscape' | 'softscape' | 'irrigation' | 'lighting' | 'water-feature' | 'maintenance-plan' | 'renovation';
type DesignElement = 'patio' | 'deck' | 'walkway' | 'retaining-wall' | 'fire-pit' | 'outdoor-kitchen' | 'pergola' | 'fence' | 'planting-bed' | 'lawn' | 'pond' | 'fountain' | 'lighting' | 'irrigation' | 'drainage';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertySize: number;
  notes: string;
  createdAt: string;
}

interface DesignProject {
  id: string;
  clientId: string;
  projectName: string;
  projectType: ProjectType;
  status: ProjectStatus;
  designElements: DesignElement[];
  estimatedBudget: number;
  actualCost: number;
  depositAmount: number;
  depositPaid: boolean;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  designNotes: string;
  siteNotes: string;
  inspirationNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface DesignMilestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

// Constants
const PROJECT_TYPES: { value: ProjectType; label: string; icon: React.ReactNode }[] = [
  { value: 'full-landscape', label: 'Full Landscape Design', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'hardscape', label: 'Hardscape', icon: <Square className="w-4 h-4" /> },
  { value: 'softscape', label: 'Softscape/Planting', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'irrigation', label: 'Irrigation System', icon: <Droplets className="w-4 h-4" /> },
  { value: 'lighting', label: 'Landscape Lighting', icon: <Lightbulb className="w-4 h-4" /> },
  { value: 'water-feature', label: 'Water Feature', icon: <Droplets className="w-4 h-4" /> },
  { value: 'maintenance-plan', label: 'Maintenance Plan', icon: <Calendar className="w-4 h-4" /> },
  { value: 'renovation', label: 'Landscape Renovation', icon: <PenTool className="w-4 h-4" /> },
];

const DESIGN_ELEMENTS: { value: DesignElement; label: string; category: 'hardscape' | 'softscape' | 'features' }[] = [
  { value: 'patio', label: 'Patio', category: 'hardscape' },
  { value: 'deck', label: 'Deck', category: 'hardscape' },
  { value: 'walkway', label: 'Walkway', category: 'hardscape' },
  { value: 'retaining-wall', label: 'Retaining Wall', category: 'hardscape' },
  { value: 'fire-pit', label: 'Fire Pit', category: 'features' },
  { value: 'outdoor-kitchen', label: 'Outdoor Kitchen', category: 'features' },
  { value: 'pergola', label: 'Pergola/Gazebo', category: 'features' },
  { value: 'fence', label: 'Fence/Privacy Screen', category: 'hardscape' },
  { value: 'planting-bed', label: 'Planting Beds', category: 'softscape' },
  { value: 'lawn', label: 'Lawn Area', category: 'softscape' },
  { value: 'pond', label: 'Pond/Water Garden', category: 'features' },
  { value: 'fountain', label: 'Fountain', category: 'features' },
  { value: 'lighting', label: 'Landscape Lighting', category: 'features' },
  { value: 'irrigation', label: 'Irrigation System', category: 'features' },
  { value: 'drainage', label: 'Drainage Solution', category: 'features' },
];

const STATUS_COLORS: Record<ProjectStatus, string> = {
  inquiry: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  design: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  proposal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'on-hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Column configuration for exports
const PROJECT_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'projectType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'estimatedBudget', header: 'Budget', type: 'currency' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'targetCompletionDate', header: 'Target Completion', type: 'date' },
];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'propertySize', header: 'Property Size (sq ft)', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const LandscapeDesignTool: React.FC<LandscapeDesignToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: clients,
    addItem: addClientToBackend,
    updateItem: updateClientBackend,
    deleteItem: deleteClientBackend,
    isSynced: clientsSynced,
    isSaving: clientsSaving,
    lastSaved: clientsLastSaved,
    syncError: clientsSyncError,
    forceSync: forceClientsSync,
  } = useToolData<Client>('landscape-design-clients', [], CLIENT_COLUMNS);

  const {
    data: projects,
    addItem: addProjectToBackend,
    updateItem: updateProjectBackend,
    deleteItem: deleteProjectBackend,
    isSynced: projectsSynced,
    isSaving: projectsSaving,
    lastSaved: projectsLastSaved,
    syncError: projectsSyncError,
    forceSync: forceProjectsSync,
  } = useToolData<DesignProject>('landscape-design-projects', [], PROJECT_COLUMNS);

  const {
    data: milestones,
    addItem: addMilestoneToBackend,
    updateItem: updateMilestoneBackend,
    deleteItem: deleteMilestoneBackend,
  } = useToolData<DesignMilestone>('landscape-design-milestones', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'projects' | 'clients' | 'dashboard'>('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [newProject, setNewProject] = useState<Partial<DesignProject>>({
    clientId: '',
    projectName: '',
    projectType: 'full-landscape',
    status: 'inquiry',
    designElements: [],
    estimatedBudget: 0,
    actualCost: 0,
    depositAmount: 0,
    depositPaid: false,
    startDate: '',
    targetCompletionDate: '',
    designNotes: '',
    siteNotes: '',
    inspirationNotes: '',
  });

  const [newClient, setNewClient] = useState<Partial<Client>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertySize: 0,
    notes: '',
  });

  const [newMilestone, setNewMilestone] = useState<Partial<DesignMilestone>>({
    name: '',
    description: '',
    dueDate: '',
  });

  // Filtered data
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const client = clients.find(c => c.id === project.clientId);
      const clientName = client ? `${client.firstName} ${client.lastName}`.toLowerCase() : '';

      const matchesSearch = searchTerm === '' ||
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesType = filterType === 'all' || project.projectType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, clients, searchTerm, filterStatus, filterType]);

  // Dashboard stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => ['design', 'proposal', 'approved', 'in-progress'].includes(p.status));
    const totalBudget = activeProjects.reduce((sum, p) => sum + p.estimatedBudget, 0);
    const completedThisYear = projects.filter(p => {
      if (p.status !== 'completed' || !p.actualCompletionDate) return false;
      const completionYear = new Date(p.actualCompletionDate).getFullYear();
      return completionYear === new Date().getFullYear();
    });
    const pendingDeposits = projects.filter(p => !p.depositPaid && p.depositAmount > 0);

    return {
      activeProjectCount: activeProjects.length,
      totalClients: clients.length,
      activeBudget: totalBudget,
      completedThisYear: completedThisYear.length,
      pendingDeposits: pendingDeposits.length,
      projectsByStatus: Object.keys(STATUS_COLORS).map(status => ({
        status,
        count: projects.filter(p => p.status === status).length,
      })),
    };
  }, [projects, clients]);

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  };

  // Add project
  const handleAddProject = () => {
    if (!newProject.clientId || !newProject.projectName) {
      setValidationMessage('Please select a client and enter a project name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const project: DesignProject = {
      id: generateId(),
      clientId: newProject.clientId || '',
      projectName: newProject.projectName || '',
      projectType: newProject.projectType || 'full-landscape',
      status: 'inquiry',
      designElements: newProject.designElements || [],
      estimatedBudget: newProject.estimatedBudget || 0,
      actualCost: 0,
      depositAmount: newProject.depositAmount || 0,
      depositPaid: false,
      startDate: newProject.startDate || '',
      targetCompletionDate: newProject.targetCompletionDate || '',
      designNotes: newProject.designNotes || '',
      siteNotes: newProject.siteNotes || '',
      inspirationNotes: newProject.inspirationNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProjectToBackend(project);
    setShowProjectForm(false);
    resetProjectForm();
  };

  // Add client
  const handleAddClient = () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.phone) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Phone)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const client: Client = {
      id: generateId(),
      firstName: newClient.firstName || '',
      lastName: newClient.lastName || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      address: newClient.address || '',
      city: newClient.city || '',
      state: newClient.state || '',
      zipCode: newClient.zipCode || '',
      propertySize: newClient.propertySize || 0,
      notes: newClient.notes || '',
      createdAt: new Date().toISOString(),
    };

    addClientToBackend(client);
    setShowClientForm(false);
    resetClientForm();
  };

  // Update project status
  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    const updates: Partial<DesignProject> = { status, updatedAt: new Date().toISOString() };
    if (status === 'completed') {
      updates.actualCompletionDate = new Date().toISOString();
    }
    updateProjectBackend(id, updates);
  };

  // Toggle design element
  const toggleDesignElement = (element: DesignElement) => {
    setNewProject(prev => {
      const current = prev.designElements || [];
      const updated = current.includes(element)
        ? current.filter(e => e !== element)
        : [...current, element];
      return { ...prev, designElements: updated };
    });
  };

  // Add milestone
  const handleAddMilestone = (projectId: string) => {
    if (!newMilestone.name || !newMilestone.dueDate) {
      setValidationMessage('Please enter milestone name and due date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const milestone: DesignMilestone = {
      id: generateId(),
      projectId,
      name: newMilestone.name || '',
      description: newMilestone.description || '',
      dueDate: newMilestone.dueDate || '',
      completed: false,
    };

    addMilestoneToBackend(milestone);
    setNewMilestone({ name: '', description: '', dueDate: '' });
  };

  // Toggle milestone completion
  const toggleMilestoneComplete = (id: string, completed: boolean) => {
    updateMilestoneBackend(id, {
      completed,
      completedDate: completed ? new Date().toISOString() : undefined,
    });
  };

  // Delete handlers
  const handleDeleteProject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteProjectBackend(id);
      milestones.forEach(m => {
        if (m.projectId === id) deleteMilestoneBackend(m.id);
      });
      if (selectedProject?.id === id) setSelectedProject(null);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client? This will also remove their projects.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteClientBackend(id);
      projects.forEach(p => {
        if (p.clientId === id) {
          deleteProjectBackend(p.id);
          milestones.forEach(m => {
            if (m.projectId === p.id) deleteMilestoneBackend(m.id);
          });
        }
      });
    }
  };

  // Reset forms
  const resetProjectForm = () => {
    setNewProject({
      clientId: '',
      projectName: '',
      projectType: 'full-landscape',
      status: 'inquiry',
      designElements: [],
      estimatedBudget: 0,
      actualCost: 0,
      depositAmount: 0,
      depositPaid: false,
      startDate: '',
      targetCompletionDate: '',
      designNotes: '',
      siteNotes: '',
      inspirationNotes: '',
    });
  };

  const resetClientForm = () => {
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      propertySize: 0,
      notes: '',
    });
  };

  // Export data
  const projectExportData = filteredProjects.map(p => ({
    ...p,
    clientName: getClientName(p.clientId),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-7 h-7 text-green-600" />
            {t('tools.landscapeDesign.landscapeDesignProjects', 'Landscape Design Projects')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('tools.landscapeDesign.manageLandscapeDesignProjectsAnd', 'Manage landscape design projects and clients')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="landscape-design" toolName="Landscape Design" />

          <SyncStatus
            isSynced={projectsSynced && clientsSynced}
            isSaving={projectsSaving || clientsSaving}
            lastSaved={projectsLastSaved || clientsLastSaved}
            error={projectsSyncError || clientsSyncError}
          />
          <ExportDropdown
            data={projectExportData}
            columns={PROJECT_COLUMNS}
            filename="landscape-design-projects"
            title={t('tools.landscapeDesign.landscapeDesignProjects2', 'Landscape Design Projects')}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['projects', 'clients', 'dashboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Layers className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.activeProjects', 'Active Projects')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeProjectCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.totalClients', 'Total Clients')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.activeBudget', 'Active Budget')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.activeBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.completedYtd', 'Completed (YTD)')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedThisYear}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && !selectedProject && (
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.landscapeDesign.searchProjects', 'Search projects...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.landscapeDesign.allStatus', 'All Status')}</option>
                <option value="inquiry">{t('tools.landscapeDesign.inquiry', 'Inquiry')}</option>
                <option value="design">{t('tools.landscapeDesign.design', 'Design')}</option>
                <option value="proposal">{t('tools.landscapeDesign.proposal', 'Proposal')}</option>
                <option value="approved">{t('tools.landscapeDesign.approved', 'Approved')}</option>
                <option value="in-progress">{t('tools.landscapeDesign.inProgress', 'In Progress')}</option>
                <option value="completed">{t('tools.landscapeDesign.completed', 'Completed')}</option>
                <option value="on-hold">{t('tools.landscapeDesign.onHold', 'On Hold')}</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.landscapeDesign.allTypes', 'All Types')}</option>
                {PROJECT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowProjectForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.landscapeDesign.newProject', 'New Project')}
            </button>
          </div>

          {/* Projects List */}
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.noProjectsFound', 'No projects found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProject(project)}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{project.projectName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[project.status]}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {getClientName(project.clientId)}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Palette className="w-4 h-4" />
                            {PROJECT_TYPES.find(t => t.value === project.projectType)?.label}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(project.estimatedBudget)}
                          </span>
                          {project.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(project.startDate)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.designElements.slice(0, 4).map((element) => (
                            <span
                              key={element}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {DESIGN_ELEMENTS.find(e => e.value === element)?.label}
                            </span>
                          ))}
                          {project.designElements.length > 4 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              +{project.designElements.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Project Detail View */}
      {activeTab === 'projects' && selectedProject && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
            {t('tools.landscapeDesign.backToProjects', 'Back to Projects')}
          </button>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedProject.projectName}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{getClientName(selectedProject.clientId)}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[selectedProject.status]}`}>
                  {selectedProject.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.landscapeDesign.updateStatus', 'Update Status')}</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(STATUS_COLORS).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateProjectStatus(selectedProject.id, status as ProjectStatus)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedProject.status === status
                          ? STATUS_COLORS[status as ProjectStatus]
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.projectType', 'Project Type')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {PROJECT_TYPES.find(t => t.value === selectedProject.projectType)?.label}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.estimatedBudget', 'Estimated Budget')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedProject.estimatedBudget)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.deposit', 'Deposit')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(selectedProject.depositAmount)}
                    <span className={`ml-2 text-sm ${selectedProject.depositPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      ({selectedProject.depositPaid ? t('tools.landscapeDesign.paid', 'Paid') : t('tools.landscapeDesign.pending', 'Pending')})
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.startDate', 'Start Date')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedProject.startDate)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.landscapeDesign.targetCompletion', 'Target Completion')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedProject.targetCompletionDate)}</p>
                </div>
              </div>

              {/* Design Elements */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.landscapeDesign.designElements', 'Design Elements')}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.designElements.map((element) => (
                    <span
                      key={element}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm"
                    >
                      {DESIGN_ELEMENTS.find(e => e.value === element)?.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">{t('tools.landscapeDesign.projectMilestones', 'Project Milestones')}</h4>
                <div className="space-y-2 mb-4">
                  {milestones.filter(m => m.projectId === selectedProject.id).map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={(e) => toggleMilestoneComplete(milestone.id, e.target.checked)}
                        className="w-5 h-5 text-green-600 rounded"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {milestone.name}
                        </p>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {formatDate(milestone.dueDate)}
                      </span>
                      <button
                        onClick={() => deleteMilestoneBackend(milestone.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('tools.landscapeDesign.milestoneName', 'Milestone name')}
                    value={newMilestone.name}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleAddMilestone(selectedProject.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notes */}
              {(selectedProject.designNotes || selectedProject.siteNotes || selectedProject.inspirationNotes) && (
                <div className="space-y-4">
                  {selectedProject.designNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{t('tools.landscapeDesign.designNotes', 'Design Notes')}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedProject.designNotes}</p>
                    </div>
                  )}
                  {selectedProject.siteNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{t('tools.landscapeDesign.siteNotes', 'Site Notes')}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedProject.siteNotes}</p>
                    </div>
                  )}
                  {selectedProject.inspirationNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{t('tools.landscapeDesign.inspirationIdeas', 'Inspiration & Ideas')}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedProject.inspirationNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.landscapeDesign.searchClients', 'Search clients...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowClientForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.landscapeDesign.addClient2', 'Add Client')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients
              .filter(c =>
                searchTerm === '' ||
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {client.firstName} {client.lastName}
                      </h3>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </p>
                      {client.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {client.address}, {client.city}, {client.state}
                      </p>
                      {client.propertySize > 0 && (
                        <p className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          {client.propertySize.toLocaleString()} sq ft
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {projects.filter(p => p.clientId === client.id).length} projects
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.landscapeDesign.newDesignProject', 'New Design Project')}</CardTitle>
              <button onClick={() => setShowProjectForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.client', 'Client *')}</label>
                <select
                  value={newProject.clientId}
                  onChange={(e) => setNewProject(prev => ({ ...prev, clientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.landscapeDesign.selectAClient', 'Select a client')}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} - {c.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.projectName', 'Project Name *')}</label>
                  <input
                    type="text"
                    value={newProject.projectName}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.landscapeDesign.eGBackyardRenovation', 'e.g., Backyard Renovation')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.projectType2', 'Project Type')}</label>
                  <select
                    value={newProject.projectType}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectType: e.target.value as ProjectType }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {PROJECT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Design Elements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.landscapeDesign.designElements2', 'Design Elements')}</label>
                <div className="space-y-3">
                  {['hardscape', 'softscape', 'features'].map(category => (
                    <div key={category}>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {DESIGN_ELEMENTS.filter(e => e.category === category).map((element) => (
                          <button
                            key={element.value}
                            type="button"
                            onClick={() => toggleDesignElement(element.value)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              newProject.designElements?.includes(element.value)
                                ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-400'
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {element.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.estimatedBudget2', 'Estimated Budget ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={newProject.estimatedBudget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, estimatedBudget: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.depositAmount', 'Deposit Amount ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={newProject.depositAmount}
                    onChange={(e) => setNewProject(prev => ({ ...prev, depositAmount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.startDate2', 'Start Date')}</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.targetCompletion2', 'Target Completion')}</label>
                  <input
                    type="date"
                    value={newProject.targetCompletionDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, targetCompletionDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.designNotes2', 'Design Notes')}</label>
                <textarea
                  value={newProject.designNotes}
                  onChange={(e) => setNewProject(prev => ({ ...prev, designNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('tools.landscapeDesign.designIdeasStylePreferencesEtc', 'Design ideas, style preferences, etc.')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.siteNotes2', 'Site Notes')}</label>
                <textarea
                  value={newProject.siteNotes}
                  onChange={(e) => setNewProject(prev => ({ ...prev, siteNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('tools.landscapeDesign.siteConditionsDrainageExistingFeatures', 'Site conditions, drainage, existing features, etc.')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowProjectForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.landscapeDesign.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.landscapeDesign.createProject', 'Create Project')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Client Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.landscapeDesign.addClient', 'Add Client')}</CardTitle>
              <button onClick={() => setShowClientForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.phone', 'Phone *')}</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.email', 'Email')}</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.address', 'Address')}</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.city', 'City')}</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.state', 'State')}</label>
                  <input
                    type="text"
                    value={newClient.state}
                    onChange={(e) => setNewClient(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.zip', 'Zip')}</label>
                  <input
                    type="text"
                    value={newClient.zipCode}
                    onChange={(e) => setNewClient(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.propertySizeSqFt', 'Property Size (sq ft)')}</label>
                <input
                  type="number"
                  value={newClient.propertySize}
                  onChange={(e) => setNewClient(prev => ({ ...prev, propertySize: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.landscapeDesign.notes', 'Notes')}</label>
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowClientForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.landscapeDesign.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddClient}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.landscapeDesign.addClient3', 'Add Client')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg shadow-lg z-40">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default LandscapeDesignTool;
