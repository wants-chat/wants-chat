import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateStatusPageService = (
  resolved: ResolvedComponent,
  variant: 'overview' | 'detailed' | 'history' = 'overview'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    overview: `
${commonImports}
import { CheckCircle, AlertTriangle, XCircle, Activity, RefreshCw, Bell } from 'lucide-react';

interface ServiceComponent {
  id: number;
  name: string;
  status: string;
  uptime: string;
  responseTime: string;
  description: string;
}

interface StatusOverviewProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const StatusOverview: React.FC<StatusOverviewProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [subscribed, setSubscribed] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const statusData = ${dataName} || {};

  const title = ${getField('overviewTitle')};
  const subtitle = ${getField('overviewSubtitle')};
  const operationalStatus = ${getField('operationalStatus')};
  const serviceComponents = ${getField('serviceComponents')};
  const subscribeButton = ${getField('subscribeButton')};
  const refreshButton = ${getField('refreshButton')};
  const unsubscribeButton = ${getField('unsubscribeButton')};
  const uptimeLabel = ${getField('uptimeLabel')};
  const responseTimeLabel = ${getField('responseTimeLabel')};
  const lastCheckedLabel = ${getField('lastCheckedLabel')};
  const uptimeMetrics = ${getField('uptimeMetrics')};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'degraded':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'outage':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing status...');
    setLastRefresh(new Date());
  };

  const handleSubscribe = () => {
    console.log('Subscribe clicked:', !subscribed);
    setSubscribed(!subscribed);
  };

  const overallStatus = serviceComponents.every((s: ServiceComponent) => s.status === 'operational')
    ? 'operational'
    : serviceComponents.some((s: ServiceComponent) => s.status === 'outage')
    ? 'outage'
    : 'degraded';

  return (
    <div className={cn("max-w-5xl mx-auto space-y-6", className)}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{subtitle}</p>

        <div className="flex items-center justify-center gap-3">
          <div className={\`inline-flex items-center gap-2 px-6 py-3 rounded-full \${getStatusColor(overallStatus)}\`}>
            {getStatusIcon(overallStatus)}
            <span className="font-semibold">
              {overallStatus === 'operational' ? operationalStatus : 'Service Issues Detected'}
            </span>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Status</h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">{refreshButton}</span>
            </button>
            <button
              onClick={handleSubscribe}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors \${
                subscribed
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }\`}
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm">{subscribed ? unsubscribeButton : subscribeButton}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {serviceComponents.map((service: ServiceComponent) => (
            <div
              key={service.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(service.status)}
                    <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                    <span
                      className={\`px-2 py-0.5 rounded-full text-xs font-medium \${getStatusColor(service.status)}\`}
                    >
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{service.description}</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{uptimeLabel}: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{service.uptime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{responseTimeLabel}: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{service.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {lastCheckedLabel}: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Uptime Metrics</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{uptimeMetrics.last24h}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last 24 Hours</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{uptimeMetrics.last7d}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{uptimeMetrics.last30d}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last 30 Days</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{uptimeMetrics.last90d}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last 90 Days</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatusOverview;
    `,

    detailed: `
${commonImports}
import { CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface ServiceComponent {
  id: number;
  name: string;
  status: string;
  uptime: string;
  responseTime: string;
  description: string;
}

interface Incident {
  id: number;
  title: string;
  status: string;
  severity: string;
  affectedServices: string[];
  startTime: string;
  lastUpdate: string;
  updates: { timestamp: string; message: string }[];
}

interface StatusDetailedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const StatusDetailed: React.FC<StatusDetailedProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [expandedIncident, setExpandedIncident] = useState<number | null>(null);

  const statusData = ${dataName} || {};

  const title = ${getField('detailedTitle')};
  const subtitle = ${getField('detailedSubtitle')};
  const serviceComponents = ${getField('serviceComponents')};
  const incidentHistory = ${getField('incidentHistory')};
  const viewDetailsButton = ${getField('viewDetailsButton')};
  const affectedServicesLabel = ${getField('affectedServicesLabel')};
  const statusLabel = ${getField('statusLabel')};
  const updatesLabel = ${getField('updatesLabel')};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'major':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'critical':
        return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const handleServiceClick = (serviceId: number) => {
    console.log('Service details clicked:', serviceId);
    setSelectedService(selectedService === serviceId ? null : serviceId);
  };

  const handleIncidentToggle = (incidentId: number) => {
    console.log('Incident toggled:', incidentId);
    setExpandedIncident(expandedIncident === incidentId ? null : incidentId);
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {serviceComponents.map((service: ServiceComponent) => (
          <Card
            key={service.id}
            className={\`p-4 cursor-pointer transition-all \${
              selectedService === service.id ? 'ring-2 ring-blue-500' : ''
            }\`}
            onClick={() => handleServiceClick(service.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{service.name}</h3>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Uptime</span>
                <span className="font-medium text-gray-900 dark:text-white">{service.uptime}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Response</span>
                <span className="font-medium text-gray-900 dark:text-white">{service.responseTime}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={\`h-full \${
                    service.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                  }\`}
                  style={{ width: service.uptime }}
                />
              </div>
            </div>

            {selectedService === service.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">{service.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Performance OK</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>View Metrics</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Incidents</h2>

        {incidentHistory.filter((inc: Incident) => inc.status !== 'resolved').length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No active incidents</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidentHistory
              .filter((inc: Incident) => inc.status !== 'resolved')
              .map((incident: Incident) => (
                <div
                  key={incident.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => handleIncidentToggle(incident.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                          <span
                            className={\`px-2 py-0.5 rounded-full text-xs font-medium \${getSeverityColor(
                              incident.severity
                            )}\`}
                          >
                            {incident.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{affectedServicesLabel}: {incident.affectedServices.join(', ')}</span>
                          <span>Started: {incident.startTime}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </div>
                    </div>
                  </button>

                  {expandedIncident === incident.id && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mt-4 mb-3">
                        {updatesLabel}
                      </h4>
                      <div className="space-y-3">
                        {incident.updates.map((update, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                                {update.timestamp}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{update.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StatusDetailed;
    `,

    history: `
${commonImports}
import { CheckCircle, AlertTriangle, XCircle, Calendar, Clock, Wrench } from 'lucide-react';

interface Incident {
  id: number;
  title: string;
  status: string;
  severity: string;
  affectedServices: string[];
  startTime: string;
  endTime?: string;
  duration?: string;
  updates: { timestamp: string; message: string }[];
}

interface Maintenance {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  duration: string;
  affectedServices: string[];
  description: string;
  impact: string;
}

interface StatusHistoryProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [selectedTab, setSelectedTab] = useState<'incidents' | 'maintenance'>('incidents');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const statusData = ${dataName} || {};

  const title = ${getField('historyTitle')};
  const subtitle = ${getField('historySubtitle')};
  const incidentHistory = ${getField('incidentHistory')};
  const scheduledMaintenance = ${getField('scheduledMaintenance')};
  const incidentsLabel = ${getField('incidentsLabel')};
  const maintenanceLabel = ${getField('maintenanceLabel')};
  const affectedServicesLabel = ${getField('affectedServicesLabel')};
  const durationLabel = ${getField('durationLabel')};
  const statusLabel = ${getField('statusLabel')};
  const updatesLabel = ${getField('updatesLabel')};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'investigating':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'identified':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'major':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'critical':
        return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const handleItemToggle = (itemId: number) => {
    console.log('Item toggled:', itemId);
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setSelectedTab('incidents')}
            className={\`pb-3 px-1 font-medium transition-colors relative \${
              selectedTab === 'incidents'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }\`}
          >
            {incidentsLabel}
            {selectedTab === 'incidents' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setSelectedTab('maintenance')}
            className={\`pb-3 px-1 font-medium transition-colors relative \${
              selectedTab === 'maintenance'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }\`}
          >
            {maintenanceLabel}
            {selectedTab === 'maintenance' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {selectedTab === 'incidents' ? (
          <div className="space-y-4">
            {incidentHistory.map((incident: Incident) => (
              <div
                key={incident.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => handleItemToggle(incident.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {getStatusIcon(incident.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                        <span
                          className={\`px-2 py-0.5 rounded-full text-xs font-medium \${getSeverityColor(
                            incident.severity
                          )}\`}
                        >
                          {incident.severity.toUpperCase()}
                        </span>
                        <span
                          className={\`px-2 py-0.5 rounded-full text-xs font-medium \${
                            incident.status === 'resolved'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                          }\`}
                        >
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>Started: {incident.startTime}</span>
                        </div>
                        {incident.duration && (
                          <div className="flex items-center gap-1.5">
                            <span>{durationLabel}: {incident.duration}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span>{affectedServicesLabel}: {incident.affectedServices.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {expandedItem === incident.id && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mt-4 mb-3">
                      Incident Timeline
                    </h4>
                    <div className="space-y-3">
                      {incident.updates.map((update, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={\`w-3 h-3 rounded-full \${
                                idx === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                              }\`}
                            />
                            {idx < incident.updates.length - 1 && (
                              <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[20px]" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                              {update.timestamp}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{update.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledMaintenance.map((maintenance: Maintenance) => (
              <div
                key={maintenance.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => handleItemToggle(maintenance.id + 1000)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Wrench className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {maintenance.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{maintenance.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{maintenance.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {expandedItem === maintenance.id + 1000 && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{maintenance.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {affectedServicesLabel}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {maintenance.affectedServices.join(', ')}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Expected Impact
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{maintenance.impact}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StatusHistory;
    `
  };

  return variants[variant] || variants.overview;
};
