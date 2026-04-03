import React from 'react';
import { CurrencyAlert } from '../../../types/currency-converter/currencyAlert';
import { Button } from '../../ui/button';
import {
  Edit,
  Trash2,
  PlayCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Mail,
  Smartphone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useTestAlert, useDeleteAlert } from '../../../hooks/currency/useCurrencyAlerts';
import { useToast } from '../../ui/use-toast';
import { useConfirm } from '../../../contexts/ConfirmDialogContext';

interface AlertDetailsProps {
  alert: CurrencyAlert;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  onEdit,
  onDelete,
  onClose
}) => {
  const { testAlert, loading: isTesting } = useTestAlert();
  const { deleteAlert, loading: isDeleting } = useDeleteAlert();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const handleTest = async () => {
    const result = await testAlert(alert.id);
    if (result) {
      toast({
        title: 'Test Alert Sent',
        description: result.message || 'Test notification has been sent successfully.',
      });
    } else {
      toast({
        title: 'Test Failed',
        description: 'Failed to send test alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Alert',
      message: 'Are you sure you want to delete this alert?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (confirmed) {
      const success = await deleteAlert(alert.id);
      if (success) {
        toast({
          title: 'Alert Deleted',
          description: 'The alert has been successfully deleted.',
        });
        onDelete();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete the alert. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle both camelCase and snake_case field names
  const baseCurrency = alert.baseCurrency || alert.base_currency || 'N/A';
  const targetCurrency = alert.targetCurrency || alert.target_currency || 'N/A';
  const alertType = alert.alertType || alert.alert_type || 'above';
  const isActive = alert.isActive ?? alert.is_active ?? false;
  const emailNotification = alert.emailNotification ?? alert.email_notification ?? false;
  const pushNotification = alert.pushNotification ?? alert.push_notification ?? false;
  const currentRate = alert.currentRate || alert.current_rate;
  const triggerCount = alert.triggerCount || alert.trigger_count || 0;
  const lastTriggeredAt = alert.lastTriggeredAt || alert.last_triggered_at;
  const createdAt = alert.createdAt || alert.created_at || '';
  const updatedAt = alert.updatedAt || alert.updated_at || '';

  const getAlertTypeIcon = () => {
    switch (alertType) {
      case 'above':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'below':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'change':
        return <Activity className="h-5 w-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {alert.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-white/60 border border-white/20'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
              {baseCurrency}/{targetCurrency}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTest} disabled={isTesting} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
            <PlayCircle className="h-4 w-4 mr-2" />
            Test Alert
          </Button>
          <Button onClick={onEdit} className="border border-white/20 bg-white/10 text-white hover:bg-white/20">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-400/30">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-teal-400" />
            Alert Statistics
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-white/60">Total Triggers</p>
              <p className="text-2xl font-bold text-white">{triggerCount}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Last Triggered</p>
              <p className="text-sm font-medium text-white">
                {lastTriggeredAt ? formatDate(lastTriggeredAt) : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/60">Current Rate</p>
              <p className="text-2xl font-bold text-teal-300">{currentRate?.toFixed(4) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Target</p>
              <p className="text-2xl font-bold text-white">{alert.threshold.toFixed(4)}</p>
            </div>
          </div>

          {/* Progress to threshold */}
          {currentRate && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Progress to threshold</span>
                <span>
                  {((currentRate / alert.threshold) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    alertType === 'above'
                      ? 'bg-green-400'
                      : alertType === 'below'
                      ? 'bg-red-400'
                      : 'bg-blue-400'
                  }`}
                  style={{
                    width: `${Math.min((currentRate / alert.threshold) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">Configuration</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Alert Type</p>
              <div className="flex items-center gap-2">
                {getAlertTypeIcon()}
                <span className="font-medium text-white">
                  {alertType === 'above' ? 'Above threshold' :
                   alertType === 'below' ? 'Below threshold' :
                   'Percentage change'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Frequency</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/60" />
                <span className="font-medium capitalize text-white">{alert.frequency}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Currency Pair</p>
              <span className="font-medium font-mono text-white">
                {baseCurrency}/{targetCurrency}
              </span>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Threshold</p>
              <span className="font-medium text-white">
                {alertType === 'change'
                  ? `${alert.threshold}%`
                  : alert.threshold.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <p className="text-sm text-white/60 mb-2">Notification Channels</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Mail className={`h-4 w-4 ${emailNotification ? 'text-green-400' : 'text-white/40'}`} />
                <span className={emailNotification ? 'text-green-400' : 'text-white/40'}>
                  Email {emailNotification ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className={`h-4 w-4 ${pushNotification ? 'text-green-400' : 'text-white/40'}`} />
                <span className={pushNotification ? 'text-green-400' : 'text-white/40'}>
                  Push {pushNotification ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <p className="text-sm text-white/60 mb-2">Timestamps</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-4 w-4 text-white/60" />
                <span>Created: {formatDate(createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-4 w-4 text-white/60" />
                <span>Updated: {formatDate(updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Card (if exists) */}
      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white">Additional Information</h3>
          </div>
          <div className="p-6">
            <pre className="text-xs bg-white/10 text-white/80 p-3 rounded-lg overflow-auto border border-white/10">
              {JSON.stringify(alert.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDetails;