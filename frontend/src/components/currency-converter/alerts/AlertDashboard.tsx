import React from 'react';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { 
  mdiBellOutline,
  mdiPulse,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiCheckCircle,
  mdiPlusCircleOutline,
  mdiAlertCircleOutline,
  mdiClockOutline,
  mdiEarth,
  mdiStarOutline,
  mdiCurrencyUsd,
  mdiChartLine,
  mdiSwapHorizontal,
  mdiBell
} from '@mdi/js';
import { useCurrencyAlerts } from '../../../hooks/currency/useCurrencyAlerts';

interface AlertDashboardProps {
  onCreateNew: () => void;
}

const AlertDashboard: React.FC<AlertDashboardProps> = ({ onCreateNew }) => {
  const { alerts, loading } = useCurrencyAlerts();

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!alerts || alerts.length === 0) {
      return {
        total: 0,
        active: 0,
        triggered_today: 0,
        most_watched_pair: 'N/A',
        success_rate: 0,
        currency_pairs: new Set(),
        alert_types: { above: 0, below: 0, change: 0 }
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currencyPairs = new Map<string, number>();
    const alertTypes = { above: 0, below: 0, change: 0 };

    alerts.forEach(alert => {
      const baseCurrency = alert.baseCurrency || alert.base_currency || 'N/A';
      const targetCurrency = alert.targetCurrency || alert.target_currency || 'N/A';
      const alertType = alert.alertType || alert.alert_type || 'above';
      const pair = `${baseCurrency}/${targetCurrency}`;
      currencyPairs.set(pair, (currencyPairs.get(pair) || 0) + 1);
      alertTypes[alertType]++;
    });

    const mostWatched = Array.from(currencyPairs.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      total: alerts.length,
      active: alerts.filter(a => a.isActive ?? a.is_active).length,
      triggered_today: alerts.filter(a => {
        const lastTriggered = a.lastTriggeredAt || a.last_triggered_at;
        if (!lastTriggered) return false;
        const triggeredDate = new Date(lastTriggered);
        return triggeredDate >= today;
      }).length,
      most_watched_pair: mostWatched ? mostWatched[0] : 'N/A',
      success_rate: 0, // Should come from backend API
      currency_pairs: currencyPairs,
      alert_types: alertTypes
    };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="p-4 bg-teal-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
          </div>
          <p className="text-white/60">Loading alert dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 p-6 rounded-xl border border-teal-400/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                <Icon path={mdiBellOutline} size={1.2} className="text-white" />
              </div>
              Currency Alerts
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Monitor exchange rates and get notified when they reach your target values
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-300">{stats.active}</div>
            <div className="text-xs text-white/60">Active Alerts</div>
            <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-2 py-1 text-xs text-white/80 mt-1">
              <Icon path={mdiClockOutline} size={0.4} className="mr-1 inline" />
              Real-time
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Icon path={mdiBellOutline} size={0.8} className="text-blue-400" />
            </div>
            <span className="text-xs text-blue-300 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-300">{stats.total}</div>
          <p className="text-sm text-blue-300/70 mt-1">
            Configured alerts
          </p>
        </div>

        <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Icon path={mdiPulse} size={0.8} className="text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-300 font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold text-emerald-300">{stats.active}</div>
          <p className="text-sm text-emerald-300/70 mt-1">
            Currently monitoring
          </p>
        </div>

        <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Icon path={mdiTrendingUp} size={0.8} className="text-orange-400" />
            </div>
            <span className="text-xs text-orange-300 font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-orange-300">{stats.triggered_today}</div>
          <p className="text-sm text-orange-300/70 mt-1">
            Triggered alerts
          </p>
        </div>

        <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Icon path={mdiCheckCircle} size={0.8} className="text-purple-400" />
            </div>
            <span className="text-xs text-purple-300 font-medium">Success</span>
          </div>
          <div className="text-2xl font-bold text-purple-300">{stats.success_rate}%</div>
          <p className="text-sm text-purple-300/70 mt-1">
            Delivery rate
          </p>
        </div>
      </div>

      {/* Most Watched & Alert Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Icon path={mdiEarth} size={0.8} className="text-teal-400" />
              <h3 className="text-lg font-semibold text-white">Currency Pair Distribution</h3>
            </div>
          </div>
          <div className="p-6">
            {stats.total === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-white/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Icon path={mdiChartLine} size={1.5} className="text-white/60" />
                </div>
                <p className="text-white/60">No alerts created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.from(stats.currency_pairs.entries()) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([pair, count]) => (
                    <div key={pair} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon path={mdiCurrencyUsd} size={0.6} className="text-teal-400" />
                        <span className="font-mono text-sm font-medium text-white">{pair}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-white/20 rounded-full h-2">
                          <div
                            className="bg-teal-400 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs bg-white/10 border border-white/20 rounded-full px-2 py-1 text-white/80">
                          {count} {count === 1 ? 'alert' : 'alerts'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Icon path={mdiAlertCircleOutline} size={0.8} className="text-teal-400" />
              <h3 className="text-lg font-semibold text-white">Alert Types</h3>
            </div>
          </div>
          <div className="p-6">
            {stats.total === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-white/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Icon path={mdiAlertCircleOutline} size={1.5} className="text-white/60" />
                </div>
                <p className="text-white/60">No alerts created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Icon path={mdiTrendingUp} size={0.6} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-white">Above Threshold</span>
                  </div>
                  <span className="text-lg font-bold text-blue-300">{stats.alert_types.above}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-500/20 rounded-lg border border-orange-400/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Icon path={mdiTrendingDown} size={0.6} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-white">Below Threshold</span>
                  </div>
                  <span className="text-lg font-bold text-orange-300">{stats.alert_types.below}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Icon path={mdiPulse} size={0.6} className="text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-white">Percentage Change</span>
                  </div>
                  <span className="text-lg font-bold text-purple-300">{stats.alert_types.change}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Icon path={mdiClockOutline} size={0.8} className="text-teal-400" />
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onCreateNew}
              className="group h-32 border-2 border-dashed border-white/20 rounded-lg hover:border-teal-400 hover:bg-teal-500/10 transition-all duration-200 flex flex-col items-center justify-center gap-3"
            >
              <div className="p-3 bg-teal-500/20 rounded-full group-hover:bg-teal-500/30 transition-colors">
                <Icon path={mdiPlusCircleOutline} size={1.2} className="text-teal-400" />
              </div>
              <span className="text-sm font-medium text-white">Create New Alert</span>
            </button>

            <button
              className="group h-32 border-2 border-dashed border-white/20 rounded-lg opacity-50 cursor-not-allowed flex flex-col items-center justify-center gap-3"
              disabled
            >
              <div className="p-3 bg-white/10 rounded-full">
                <Icon path={mdiStarOutline} size={1.2} className="text-white/60" />
              </div>
              <span className="text-sm font-medium text-white/60">Popular Templates</span>
              <span className="text-xs text-white/40">Coming Soon</span>
            </button>

            <button
              className="group h-32 border-2 border-dashed border-white/20 rounded-lg opacity-50 cursor-not-allowed flex flex-col items-center justify-center gap-3"
              disabled
            >
              <div className="p-3 bg-white/10 rounded-full">
                <Icon path={mdiChartLine} size={1.2} className="text-white/60" />
              </div>
              <span className="text-sm font-medium text-white/60">Market Analysis</span>
              <span className="text-xs text-white/40">Coming Soon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      {stats.total === 0 && (
        <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-400/30">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Icon path={mdiBell} size={2} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Getting Started with Alerts</h3>
              <p className="text-white/60">Set up your first currency alert in just a few steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="p-3 bg-blue-500/20 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-300">1</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Create Your First Alert</h4>
                <p className="text-sm text-white/60">Set up monitoring for your preferred currency pair</p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-emerald-500/20 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-300">2</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Configure Notifications</h4>
                <p className="text-sm text-white/60">Choose how you want to be notified when thresholds are reached</p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-purple-500/20 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-300">3</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Monitor & Adjust</h4>
                <p className="text-sm text-white/60">Track performance and adjust thresholds as market conditions change</p>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 h-12 px-8 rounded-lg font-medium transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2 text-white"
              >
                <Icon path={mdiPlusCircleOutline} size={0.8} />
                Create Your First Alert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDashboard;