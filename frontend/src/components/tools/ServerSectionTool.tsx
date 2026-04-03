import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useToolData } from '@/hooks/useToolData';
import type { ColumnConfig } from '@/lib/toolDataUtils';
import { SyncStatus } from '@/components/ui/SyncStatus';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { WidgetEmbedButton } from '@/components/ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  MapPin,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Grid3X3,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface Section {
  id: string;
  name: string;
  tables: string[];
  capacity: number;
}

interface ServerAssignment {
  id: string;
  serverName: string;
  sectionId: string;
  shiftStart: string;
  shiftEnd: string;
  status: 'active' | 'on-break' | 'off-duty';
  currentCovers: number;
  totalTips: number;
  notes: string;
  assignedAt: string;
}

const defaultSections: Section[] = [
  { id: 'section-1', name: 'Front Dining', tables: ['1', '2', '3', '4'], capacity: 16 },
  { id: 'section-2', name: 'Back Dining', tables: ['5', '6', '7', '8'], capacity: 20 },
  { id: 'section-3', name: 'Patio', tables: ['P1', 'P2', 'P3'], capacity: 12 },
  { id: 'section-4', name: 'Bar Area', tables: ['B1', 'B2'], capacity: 8 },
  { id: 'section-5', name: 'Private Room', tables: ['PR1'], capacity: 12 },
];

const ServerSectionTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const COLUMNS: ColumnConfig[] = [
    { key: 'serverName', header: 'Server Name', type: 'string' },
    { key: 'sectionId', header: 'Section', type: 'string' },
    { key: 'shiftStart', header: 'Shift Start', type: 'string' },
    { key: 'shiftEnd', header: 'Shift End', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'currentCovers', header: 'Covers', type: 'number' },
    { key: 'totalTips', header: 'Tips', type: 'currency' },
  ];

  const {
    data: assignments,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
  } = useToolData<ServerAssignment>('server-section', [], COLUMNS);

  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ServerAssignment | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    serverName: '',
    sectionId: '',
    shiftStart: '11:00',
    shiftEnd: '19:00',
    notes: '',
  });

  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    tables: '',
    capacity: '',
  });

  const exportColumns: ColumnConfig[] = [
    { key: 'serverName', header: 'Server Name', width: 20 },
    { key: 'sectionName', header: 'Section', width: 15 },
    { key: 'tables', header: 'Tables', width: 15 },
    { key: 'shiftStart', header: 'Shift Start', width: 12 },
    { key: 'shiftEnd', header: 'Shift End', width: 12 },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'currentCovers', header: 'Covers', width: 10 },
    { key: 'totalTips', header: 'Tips ($)', width: 12 },
    { key: 'notes', header: 'Notes', width: 25 },
  ];

  const getExportData = () => {
    return assignments.map(a => {
      const section = sections.find(s => s.id === a.sectionId);
      return {
        ...a,
        sectionName: section?.name || 'Unassigned',
        tables: section?.tables.join(', ') || '',
      };
    });
  };

  const getSectionById = (id: string) => sections.find(s => s.id === id);

  const getAssignmentsForSection = (sectionId: string) => {
    return assignments.filter(a => a.sectionId === sectionId && a.status !== 'off-duty');
  };

  const getUnassignedServers = () => {
    return assignments.filter(a => !a.sectionId || a.status === 'off-duty');
  };

  const resetForm = () => {
    setFormData({
      serverName: '',
      sectionId: '',
      shiftStart: '11:00',
      shiftEnd: '19:00',
      notes: '',
    });
    setEditingAssignment(null);
    setShowAssignmentForm(false);
  };

  const resetSectionForm = () => {
    setSectionFormData({
      name: '',
      tables: '',
      capacity: '',
    });
    setEditingSection(null);
    setShowSectionForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serverName.trim()) return;

    const assignmentData: ServerAssignment = {
      id: editingAssignment?.id || `assignment-${Date.now()}`,
      serverName: formData.serverName.trim(),
      sectionId: formData.sectionId,
      shiftStart: formData.shiftStart,
      shiftEnd: formData.shiftEnd,
      status: 'active',
      currentCovers: editingAssignment?.currentCovers || 0,
      totalTips: editingAssignment?.totalTips || 0,
      notes: formData.notes.trim(),
      assignedAt: editingAssignment?.assignedAt || new Date().toISOString(),
    };

    if (editingAssignment) {
      updateItem(editingAssignment.id, assignmentData);
    } else {
      addItem(assignmentData);
    }

    resetForm();
  };

  const handleSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionFormData.name.trim()) return;

    const tables = sectionFormData.tables.split(',').map(t => t.trim()).filter(Boolean);
    const capacity = parseInt(sectionFormData.capacity) || tables.length * 4;

    if (editingSection) {
      setSections(prev => prev.map(s =>
        s.id === editingSection.id
          ? { ...s, name: sectionFormData.name.trim(), tables, capacity }
          : s
      ));
    } else {
      const newSection: Section = {
        id: `section-${Date.now()}`,
        name: sectionFormData.name.trim(),
        tables,
        capacity,
      };
      setSections(prev => [...prev, newSection]);
    }

    resetSectionForm();
  };

  const handleEdit = (assignment: ServerAssignment) => {
    setFormData({
      serverName: assignment.serverName,
      sectionId: assignment.sectionId,
      shiftStart: assignment.shiftStart,
      shiftEnd: assignment.shiftEnd,
      notes: assignment.notes,
    });
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  const handleEditSection = (section: Section) => {
    setSectionFormData({
      name: section.name,
      tables: section.tables.join(', '),
      capacity: section.capacity.toString(),
    });
    setEditingSection(section);
    setShowSectionForm(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove Server Assignment',
      message: 'Remove this server assignment?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleDeleteSection = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Section',
      message: 'Delete this section? Servers will become unassigned.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      // Unassign servers from this section
      assignments.filter(a => a.sectionId === id).forEach(a => {
        updateItem(a.id, { sectionId: '' });
      });
      setSections(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleStatusChange = (assignment: ServerAssignment, status: ServerAssignment['status']) => {
    updateItem(assignment.id, { status });
  };

  const handleReassign = (assignment: ServerAssignment, newSectionId: string) => {
    updateItem(assignment.id, { sectionId: newSectionId });
  };

  const handleUpdateCovers = (assignment: ServerAssignment, delta: number) => {
    const newCovers = Math.max(0, assignment.currentCovers + delta);
    updateItem(assignment.id, { currentCovers: newCovers });
  };

  const getStatusColor = (status: ServerAssignment['status']) => {
    switch (status) {
      case 'active':
        return isDark ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-300';
      case 'on-break':
        return isDark ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'off-duty':
        return isDark ? 'bg-gray-800 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600';
    }
  };

  const getSectionColor = (index: number) => {
    const colors = [
      isDark ? 'border-blue-700 bg-blue-900/20' : 'border-blue-300 bg-blue-50',
      isDark ? 'border-purple-700 bg-purple-900/20' : 'border-purple-300 bg-purple-50',
      isDark ? 'border-green-700 bg-green-900/20' : 'border-green-300 bg-green-50',
      isDark ? 'border-orange-700 bg-orange-900/20' : 'border-orange-300 bg-orange-50',
      isDark ? 'border-pink-700 bg-pink-900/20' : 'border-pink-300 bg-pink-50',
    ];
    return colors[index % colors.length];
  };

  // Calculate stats
  const totalActiveServers = assignments.filter(a => a.status === 'active').length;
  const totalCovers = assignments.reduce((sum, a) => sum + a.currentCovers, 0);
  const totalTips = assignments.reduce((sum, a) => sum + a.totalTips, 0);
  const onBreakCount = assignments.filter(a => a.status === 'on-break').length;

  if (isLoading) {
    return (
      <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                <Users className={`h-6 w-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div>
                <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                  {t('tools.serverSection.serverSectionAssignment', 'Server Section Assignment')}
                </CardTitle>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.serverSection.manageServerAssignmentsAndFloor', 'Manage server assignments and floor sections')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="server-section" toolName="Server Section" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'server-sections' })}
                onExportExcel={() => exportExcel({ filename: 'server-sections' })}
                onExportJSON={() => exportJSON({ filename: 'server-sections' })}
                onExportPDF={() => exportPDF({
                  filename: 'server-sections',
                  title: 'Server Section Assignments',
                  subtitle: `${assignments.length} assignments`,
                })}
                onPrint={() => print('Server Section Assignments')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                theme={isDark ? 'dark' : 'light'}
                disabled={assignments.length === 0}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalActiveServers}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.serverSection.activeServers', 'Active Servers')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalCovers}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.serverSection.totalCovers', 'Total Covers')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${totalTips.toFixed(0)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.serverSection.totalTips', 'Total Tips')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className={`h-8 w-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {onBreakCount}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.serverSection.onBreak2', 'On Break')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setShowAssignmentForm(true)}
          className={isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('tools.serverSection.addServer', 'Add Server')}
        </Button>
        <Button
          onClick={() => setShowSectionForm(true)}
          variant="outline"
          className={isDark ? 'border-gray-700 text-gray-300' : ''}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {t('tools.serverSection.addSection', 'Add Section')}
        </Button>
        <div className="flex-1" />
        <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('grid')}
            className={`rounded-none ${activeView === 'grid' ? (isDark ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('list')}
            className={`rounded-none ${activeView === 'list' ? (isDark ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assignment Form */}
      {showAssignmentForm && (
        <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingAssignment ? t('tools.serverSection.editServerAssignment', 'Edit Server Assignment') : t('tools.serverSection.addServerAssignment', 'Add Server Assignment')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.serverName', 'Server Name *')}</Label>
                  <Input
                    value={formData.serverName}
                    onChange={(e) => setFormData(prev => ({ ...prev, serverName: e.target.value }))}
                    placeholder={t('tools.serverSection.enterServerName', 'Enter server name')}
                    className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
                    required
                  />
                </div>
                <div>
                  <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.section', 'Section')}</Label>
                  <Select
                    value={formData.sectionId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sectionId: value }))}
                  >
                    <SelectTrigger className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                      <SelectValue placeholder={t('tools.serverSection.selectSection', 'Select section')} />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                      <SelectItem value="">{t('tools.serverSection.unassigned', 'Unassigned')}</SelectItem>
                      {sections.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name} (Tables: {section.tables.join(', ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.shiftStart', 'Shift Start')}</Label>
                  <Input
                    type="time"
                    value={formData.shiftStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, shiftStart: e.target.value }))}
                    className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
                  />
                </div>
                <div>
                  <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.shiftEnd', 'Shift End')}</Label>
                  <Input
                    type="time"
                    value={formData.shiftEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, shiftEnd: e.target.value }))}
                    className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
                  />
                </div>
              </div>
              <div>
                <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.notes', 'Notes')}</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('tools.serverSection.anySpecialNotes', 'Any special notes...')}
                  className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAssignment ? t('tools.serverSection.update', 'Update') : t('tools.serverSection.add', 'Add')} Server
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  {t('tools.serverSection.cancel', 'Cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Section Form */}
      {showSectionForm && (
        <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingSection ? t('tools.serverSection.editSection', 'Edit Section') : t('tools.serverSection.addSection2', 'Add Section')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.sectionName', 'Section Name *')}</Label>
                  <Input
                    value={sectionFormData.name}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('tools.serverSection.eGFrontDining', 'e.g., Front Dining')}
                    className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
                    required
                  />
                </div>
                <div>
                  <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.tablesCommaSeparated', 'Tables (comma-separated)')}</Label>
                  <Input
                    value={sectionFormData.tables}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, tables: e.target.value }))}
                    placeholder="e.g., 1, 2, 3, 4"
                    className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
                  />
                </div>
                <div>
                  <Label className={isDark ? 'text-gray-300' : ''}>{t('tools.serverSection.capacity', 'Capacity')}</Label>
                  <Input
                    type="number"
                    value={sectionFormData.capacity}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder={t('tools.serverSection.totalSeats', 'Total seats')}
                    className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSection ? t('tools.serverSection.update2', 'Update') : t('tools.serverSection.add2', 'Add')} Section
                </Button>
                <Button type="button" variant="outline" onClick={resetSectionForm}>
                  <X className="h-4 w-4 mr-2" />
                  {t('tools.serverSection.cancel2', 'Cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grid View - Floor Plan Style */}
      {activeView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => {
            const sectionAssignments = getAssignmentsForSection(section.id);
            const sectionCovers = sectionAssignments.reduce((sum, a) => sum + a.currentCovers, 0);

            return (
              <Card
                key={section.id}
                className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'} ${getSectionColor(index)} border-2`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {section.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection(section)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSection(section.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tables: {section.tables.join(', ')} | Capacity: {section.capacity}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Current covers: {sectionCovers}/{section.capacity}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {sectionAssignments.length === 0 ? (
                    <div className={`text-center py-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <AlertTriangle className="h-5 w-5 mx-auto mb-1 opacity-50" />
                      {t('tools.serverSection.noServerAssigned', 'No server assigned')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sectionAssignments.map(assignment => (
                        <div
                          key={assignment.id}
                          className={`p-2 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {assignment.serverName}
                            </span>
                            <Badge className={`text-xs ${getStatusColor(assignment.status)}`}>
                              {assignment.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {assignment.shiftStart} - {assignment.shiftEnd} | Covers: {assignment.currentCovers}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateCovers(assignment, 1)}
                              className="h-6 px-2 text-xs"
                            >
                              +1
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateCovers(assignment, -1)}
                              className="h-6 px-2 text-xs"
                            >
                              -1
                            </Button>
                            <div className="flex-1" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(assignment)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Unassigned Servers */}
          {getUnassignedServers().length > 0 && (
            <Card className={isDark ? 'bg-gray-900 border-gray-800 border-dashed' : 'bg-white border-dashed'}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.serverSection.unassignedOffDuty', 'Unassigned / Off Duty')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {getUnassignedServers().map(assignment => (
                    <div
                      key={assignment.id}
                      className={`p-2 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.serverName}
                        </span>
                        <Badge className={`text-xs ${getStatusColor(assignment.status)}`}>
                          {assignment.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Select
                          value={assignment.sectionId}
                          onValueChange={(value) => handleReassign(assignment, value)}
                        >
                          <SelectTrigger className={`h-7 text-xs ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                            <SelectValue placeholder={t('tools.serverSection.assignTo', 'Assign to...')} />
                          </SelectTrigger>
                          <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                            {sections.map(section => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(assignment)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(assignment.id)}
                          className="h-7 w-7 p-0 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
          <CardContent className="p-0">
            {assignments.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.serverSection.noServerAssignmentsYet', 'No server assignments yet')}</p>
                <p className="text-sm">{t('tools.serverSection.addServersAndAssignThem', 'Add servers and assign them to sections')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b'}>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.serverSection.server', 'Server')}
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.serverSection.section2', 'Section')}
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.serverSection.shift', 'Shift')}
                      </th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.serverSection.status', 'Status')}
                      </th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.serverSection.covers', 'Covers')}
                      </th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.serverSection.tips', 'Tips')}
                      </th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.serverSection.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(assignment => {
                      const section = getSectionById(assignment.sectionId);
                      return (
                        <tr
                          key={assignment.id}
                          className={`border-b ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                          <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <div className="font-medium">{assignment.serverName}</div>
                            {assignment.notes && (
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {assignment.notes}
                              </div>
                            )}
                          </td>
                          <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {section ? (
                              <div>
                                <div>{section.name}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Tables: {section.tables.join(', ')}
                                </div>
                              </div>
                            ) : (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.serverSection.unassigned2', 'Unassigned')}</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {assignment.shiftStart} - {assignment.shiftEnd}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Select
                              value={assignment.status}
                              onValueChange={(value) => handleStatusChange(assignment, value as ServerAssignment['status'])}
                            >
                              <SelectTrigger className={`h-8 w-28 text-xs ${getStatusColor(assignment.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                                <SelectItem value="active">{t('tools.serverSection.active', 'Active')}</SelectItem>
                                <SelectItem value="on-break">{t('tools.serverSection.onBreak', 'On Break')}</SelectItem>
                                <SelectItem value="off-duty">{t('tools.serverSection.offDuty', 'Off Duty')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateCovers(assignment, -1)}
                                className="h-6 w-6 p-0"
                              >
                                -
                              </Button>
                              <span className="w-8">{assignment.currentCovers}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateCovers(assignment, 1)}
                                className="h-6 w-6 p-0"
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            ${assignment.totalTips.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(assignment)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(assignment.id)}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className={`h-5 w-5 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="font-medium mb-1">{t('tools.serverSection.serverSectionTips', 'Server Section Tips:')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('tools.serverSection.balanceSectionSizesBasedOn', 'Balance section sizes based on server experience levels')}</li>
                <li>{t('tools.serverSection.considerTableTurnoverRatesWhen', 'Consider table turnover rates when making assignments')}</li>
                <li>{t('tools.serverSection.rotateSectionsToGiveAll', 'Rotate sections to give all servers fair earning opportunities')}</li>
                <li>{t('tools.serverSection.trackCoversPerSectionTo', 'Track covers per section to identify high-traffic areas')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog />
    </div>
  );
};

export default ServerSectionTool;
