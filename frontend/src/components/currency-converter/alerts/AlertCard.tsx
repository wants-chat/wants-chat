import React, { useState } from 'react';
import { CurrencyAlert } from '../../../types/currency-converter/currencyAlert';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Bell, 
  Clock, 
  Edit2, 
  Trash2,
  Mail,
  Smartphone,
  MoreVertical
} from 'lucide-react';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

interface AlertCardProps {
  alert: CurrencyAlert;
  onEdit: (alert: CurrencyAlert) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onSelect: (alert: CurrencyAlert) => void;
  isSelected?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onEdit,
  onDelete,
  onToggleStatus,
  onSelect,
  isSelected = false
}) => {
  // Handle both camelCase and snake_case field names
  const baseCurrency = alert.baseCurrency || alert.base_currency || 'N/A';
  const targetCurrency = alert.targetCurrency || alert.target_currency || 'N/A';
  const alertType = alert.alertType || alert.alert_type || 'above';
  const isActive = alert.isActive ?? alert.is_active ?? false;
  const emailNotification = alert.emailNotification ?? alert.email_notification ?? false;
  const pushNotification = alert.pushNotification ?? alert.push_notification ?? false;
  const currentRate = alert.currentRate || alert.current_rate;
  const triggerCount = alert.triggerCount || alert.trigger_count || 0;

  const getAlertTypeIcon = () => {
    switch (alertType) {
      case 'above':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'below':
        return <TrendingDown className="h-5 w-5 text-rose-400" />;
      case 'change':
        return <Activity className="h-5 w-5 text-cyan-400" />;
      default:
        return null;
    }
  };

  const getAlertTypeText = () => {
    switch (alertType) {
      case 'above':
        return `Alert when rate > ${alert.threshold}`;
      case 'below':
        return `Alert when rate < ${alert.threshold}`;
      case 'change':
        return `Alert on ${alert.threshold}% change`;
      default:
        return '';
    }
  };

  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const getProgressPercentage = () => {
    if (!currentRate || !alert.threshold) return 0;

    if (alertType === 'above') {
      return Math.min((currentRate / alert.threshold) * 100, 100);
    } else if (alertType === 'below') {
      return Math.min((alert.threshold / currentRate) * 100, 100);
    }
    return 0;
  };

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl rounded-xl shadow-sm border border-white/10 p-5 mb-3 cursor-pointer transition-all hover:bg-white/10 hover:border-teal-400/30 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-teal-400/50 border-teal-400/40 bg-teal-500/10' : ''
      }`}
      onClick={() => onSelect(alert)}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {/* Alert Name and Status */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg border border-teal-400/20">
              {getAlertTypeIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-base">
                {alert.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-white/80">
                  {baseCurrency}/{targetCurrency}
                </span>
                {isActive ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="text-xs text-white/40">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => {
              onToggleStatus(alert.id, checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-cyan-500 data-[state=unchecked]:bg-white/20 [&>span]:bg-white [&>span]:shadow-md"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/20 text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(alert);
            }}
            title="Edit Alert"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-500/20 text-red-400 hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(alert.id);
            }}
            title="Delete Alert"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alert Details Section */}
      <div className="space-y-3">
        {/* Threshold Info */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">
              {alertType === 'above' ? 'Alert when above' :
               alertType === 'below' ? 'Alert when below' :
               'Alert on change'}
            </span>
            <span className="text-sm font-semibold text-teal-300">
              {alertType === 'change'
                ? `${alert.threshold}%`
                : alert.threshold.toFixed(4)}
            </span>
          </div>

          {/* Progress Bar */}
          {currentRate && alertType !== 'change' && (
            <>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    alertType === 'above'
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-400'
                      : 'bg-gradient-to-r from-rose-400 to-orange-400'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50">
                <span>Current: <span className="text-white/80">{currentRate.toFixed(4)}</span></span>
                <span className="text-teal-300/80">{Math.abs(((currentRate - alert.threshold) / alert.threshold) * 100).toFixed(1)}% away</span>
              </div>
            </>
          )}
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Frequency */}
            <div className="flex items-center gap-1.5 text-white/70">
              <Clock className="h-3.5 w-3.5" />
              <span className="capitalize">{alert.frequency}</span>
            </div>

            {/* Triggers */}
            {triggerCount > 0 && (
              <div className="flex items-center gap-1.5 text-white/70">
                <Bell className="h-3.5 w-3.5" />
                <span>{triggerCount} triggered</span>
              </div>
            )}
          </div>

          {/* Notification Channels */}
          <div className="flex items-center gap-2">
            {emailNotification && (
              <div className="p-1.5 bg-white/10 rounded border border-white/20" title="Email notifications enabled">
                <Mail className="h-3.5 w-3.5 text-teal-400" />
              </div>
            )}
            {pushNotification && (
              <div className="p-1.5 bg-white/10 rounded border border-white/20" title="Push notifications enabled">
                <Smartphone className="h-3.5 w-3.5 text-teal-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;