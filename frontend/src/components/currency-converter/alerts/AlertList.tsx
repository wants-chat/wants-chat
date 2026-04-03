import React, { useState, useEffect } from 'react';
import { CurrencyAlert } from '../../../types/currency-converter/currencyAlert';
import AlertCard from './AlertCard';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiBellOutline,
  mdiMagnify,
  mdiFilter,
  mdiSwapVertical,
  mdiPlusCircleOutline,
  mdiLoading
} from '@mdi/js';
import { useCurrencyAlerts, useDeleteAlert, useToggleAlertStatus } from '../../../hooks/currency/useCurrencyAlerts';
import { toast } from 'sonner';
import { ConfirmationModal } from '../../ui/confirmation-modal';
import { useConfirmation } from '../../../hooks/useConfirmation';

interface AlertListProps {
  onSelectAlert: (alert: CurrencyAlert | null) => void;
  onCreateNew: () => void;
  onEditAlert: (alert: CurrencyAlert) => void;
  selectedAlert: CurrencyAlert | null;
}

const AlertList: React.FC<AlertListProps> = ({ 
  onSelectAlert, 
  onCreateNew,
  onEditAlert,
  selectedAlert
}) => {
  const { alerts, loading, error, refetch } = useCurrencyAlerts();
  const { deleteAlert, loading: isDeleting } = useDeleteAlert();
  const { toggleStatus, loading: isToggling } = useToggleAlertStatus();
  const confirmation = useConfirmation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'above' | 'below' | 'change'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'triggered'>('created');

  // Filter and sort alerts
  const filteredAlerts = React.useMemo(() => {
    let filtered = [...(alerts || [])];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(alert => 
        alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${alert.base_currency}/${alert.target_currency}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => 
        statusFilter === 'active' ? alert.is_active : !alert.is_active
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.alert_type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'triggered':
          return (b.trigger_count || 0) - (a.trigger_count || 0);
        case 'created':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [alerts, searchQuery, statusFilter, typeFilter, sortBy]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Alert',
      message: 'Are you sure you want to delete this alert? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    const success = await deleteAlert(id);
    if (success) {
      toast.success('The alert has been successfully deleted.');
      refetch();
      if (selectedAlert?.id === id) {
        onSelectAlert(null);
      }
    } else {
      toast.error('Failed to delete the alert. Please try again.');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const result = await toggleStatus(id, isActive);
    if (result) {
      toast.success(`The alert has been ${isActive ? 'activated' : 'deactivated'}.`);
      refetch();
    } else {
      toast.error('Failed to update alert status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border-r border-white/10 rounded-xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="p-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
            </div>
            <p className="text-white/60">Loading alerts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border-r border-white/10 rounded-xl">
        <div className="text-center py-12 px-6">
          <div className="p-4 bg-red-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Icon path={mdiBellOutline} size={1.5} className="text-red-400" />
          </div>
          <p className="text-red-400 mb-4">Error loading alerts: {error}</p>
          <Button onClick={() => refetch()} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border-r border-white/10 rounded-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg">
              <Icon path={mdiBellOutline} size={0.9} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                My Alerts
              </h2>
              <p className="text-sm text-teal-300/80">
                {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'} configured
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Icon
            path={mdiMagnify}
            size={0.6}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
          />
          <Input
            type="text"
            placeholder="Search by name or currency pair..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="h-10 bg-white/10 border-white/20 text-white focus:border-white/40 text-xs">
              <Icon path={mdiFilter} size={0.5} className="mr-1" />
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="all" className="text-white hover:bg-white/10">all</SelectItem>
              <SelectItem value="active" className="text-white hover:bg-white/10">active</SelectItem>
              <SelectItem value="inactive" className="text-white hover:bg-white/10">inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger className="h-10 bg-white/10 border-white/20 text-white focus:border-white/40 text-xs">
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="all" className="text-white hover:bg-white/10">all</SelectItem>
              <SelectItem value="above" className="text-white hover:bg-white/10">above</SelectItem>
              <SelectItem value="below" className="text-white hover:bg-white/10">below</SelectItem>
              <SelectItem value="change" className="text-white hover:bg-white/10">change</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="h-10 bg-white/10 border-white/20 text-white focus:border-white/40 text-xs">
              <Icon path={mdiSwapVertical} size={0.5} className="mr-1" />
              <SelectValue placeholder="created" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="created" className="text-white hover:bg-white/10">created</SelectItem>
              <SelectItem value="name" className="text-white hover:bg-white/10">name</SelectItem>
              <SelectItem value="triggered" className="text-white hover:bg-white/10">triggered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Icon path={mdiBellOutline} size={1.5} className="text-teal-400" />
            </div>
            <h3 className="text-base font-medium text-white mb-2">
              No alerts found
            </h3>
            <p className="text-sm text-white/60 text-center max-w-sm mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters to find alerts'
                : 'Create your first price alert to get notified when exchange rates change'}
            </p>
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white transition-all flex items-center gap-2 shadow-lg"
            >
              <Icon path={mdiPlusCircleOutline} size={0.6} />
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onEdit={onEditAlert}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onSelect={onSelectAlert}
                isSelected={selectedAlert?.id === alert.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with Create Button */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <Button
          onClick={onCreateNew}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-11 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          disabled={isDeleting || isToggling}
        >
          <Icon path={mdiPlusCircleOutline} size={0.6} />
          Create New Alert
        </Button>
      </div>

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default AlertList;