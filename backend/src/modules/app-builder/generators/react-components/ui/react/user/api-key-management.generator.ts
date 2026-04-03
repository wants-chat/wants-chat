import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateApiKeyManagement = (
  resolved: ResolvedComponent,
  variant: 'list' | 'cards' | 'detailed' = 'list'
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
  const entity = dataSource?.split('.').pop() || 'api_keys';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'api_keys'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Key, Copy, Eye, EyeOff, Trash2, Plus, TrendingUp, Calendar, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';`;

  const variants = {
    list: `
${commonImports}

interface ApiKeyManagementProps {
  ${dataName}?: any;
  className?: string;
  onGenerateKey?: () => void;
  onRevokeKey?: (keyId: string) => void;
}

export default function ApiKeyManagement({ ${dataName}: propData, className, onGenerateKey, onRevokeKey }: ApiKeyManagementProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [apiKeys, setApiKeys] = useState(${getField('apiKeys')});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const apiKeysTitle = ${getField('apiKeysTitle')};
  const generateKeyButton = ${getField('generateKeyButton')};
  const revokeButton = ${getField('revokeButton')};
  const copyButton = ${getField('copyButton')};
  const viewUsageButton = ${getField('viewUsageButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Inactive' },
      expired: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Expired' }
    };
    return configs[status as keyof typeof configs] || configs.inactive;
  };

  const maskKey = (key: string) => {
    const parts = key.split('_');
    if (parts.length < 3) return key;
    return \`\${parts[0]}_\${parts[1]}_\${'*'.repeat(20)}\${key.slice(-8)}\`;
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    console.log('Copied key:', key);
    alert('API key copied to clipboard!');
  };

  const handleRevoke = (keyId: string, keyName: string) => {
    if (confirm(\`Are you sure you want to revoke "\${keyName}"? This action cannot be undone.\`)) {
      console.log('Revoking key:', keyId);
      setApiKeys(apiKeys.filter((k: any) => k.id !== keyId));
      onRevokeKey && onRevokeKey(keyId);
    }
  };

  const handleGenerateKey = () => {
    console.log('Generating new API key');
    onGenerateKey ? onGenerateKey() : alert('Opening key generation dialog...');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{apiKeysTitle}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage your API keys and access tokens</p>
          </div>
          <Button
            onClick={handleGenerateKey}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {generateKeyButton}
          </Button>
        </div>

        {/* API Keys Table */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">API Key</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Last Used</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Usage</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((apiKey: any) => {
                    const statusConfig = getStatusConfig(apiKey.status);
                    const isVisible = visibleKeys.has(apiKey.id);

                    return (
                      <tr
                        key={apiKey.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{apiKey.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono">
                              {isVisible ? apiKey.key : maskKey(apiKey.key)}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleCopy(apiKey.key)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                          {apiKey.lastUsed}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                          {formatNumber(apiKey.usageCount)} calls
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 dark:text-blue-400"
                            >
                              {viewUsageButton}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevoke(apiKey.id, apiKey.name)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {revokeButton}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `,

    cards: `
${commonImports}

interface ApiKeyManagementProps {
  ${dataName}?: any;
  className?: string;
  onGenerateKey?: () => void;
  onRevokeKey?: (keyId: string) => void;
}

export default function ApiKeyManagement({ ${dataName}: propData, className, onGenerateKey, onRevokeKey }: ApiKeyManagementProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [apiKeys, setApiKeys] = useState(${getField('apiKeys')});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const apiKeysTitle = ${getField('apiKeysTitle')};
  const generateKeyButton = ${getField('generateKeyButton')};
  const revokeButton = ${getField('revokeButton')};
  const copyButton = ${getField('copyButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Inactive' },
      expired: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Expired' }
    };
    return configs[status as keyof typeof configs] || configs.inactive;
  };

  const maskKey = (key: string) => {
    const parts = key.split('_');
    if (parts.length < 3) return key;
    return \`\${parts[0]}_\${parts[1]}_\${'*'.repeat(20)}\${key.slice(-8)}\`;
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    console.log('Copied key:', key);
    alert('API key copied to clipboard!');
  };

  const handleRevoke = (keyId: string, keyName: string) => {
    if (confirm(\`Are you sure you want to revoke "\${keyName}"?\`)) {
      console.log('Revoking key:', keyId);
      setApiKeys(apiKeys.filter((k: any) => k.id !== keyId));
      onRevokeKey && onRevokeKey(keyId);
    }
  };

  const handleGenerateKey = () => {
    console.log('Generating new API key');
    onGenerateKey ? onGenerateKey() : alert('Opening key generation dialog...');
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{apiKeysTitle}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage your API keys</p>
          </div>
          <Button
            onClick={handleGenerateKey}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {generateKeyButton}
          </Button>
        </div>

        {/* API Keys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apiKeys.map((apiKey: any) => {
            const statusConfig = getStatusConfig(apiKey.status);
            const isVisible = visibleKeys.has(apiKey.id);

            return (
              <Card key={apiKey.id} className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="w-5 h-5 text-gray-400" />
                      {apiKey.name}
                    </CardTitle>
                    <Badge className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* API Key */}
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">API Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono truncate">
                        {isVisible ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(apiKey.key)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Created</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{apiKey.createdDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Expires</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{apiKey.expiryDate}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Last Used</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{apiKey.lastUsed}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat().format(apiKey.usageCount)}
                    </p>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(apiKey.id, apiKey.name)}
                    className="w-full text-red-600 hover:text-red-700 border-red-200 dark:border-red-900"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {revokeButton}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
    `,

    detailed: `
${commonImports}

interface ApiKeyManagementProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ApiKeyManagement({ ${dataName}: propData, className }: ApiKeyManagementProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [apiKeys] = useState(${getField('apiKeys')});

  const apiKeysTitle = ${getField('apiKeysTitle')};

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Inactive' },
      expired: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Expired' }
    };
    return configs[status as keyof typeof configs] || configs.inactive;
  };

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{apiKeysTitle}</h2>
            <Button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Generate New Key
            </Button>
          </div>

          <div className="space-y-2">
            {apiKeys.map((apiKey: any) => {
              const statusConfig = getStatusConfig(apiKey.status);
              return (
                <button
                  key={apiKey.id}
                  onClick={() => setSelectedKey(apiKey)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-colors',
                    selectedKey?.id === apiKey.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{apiKey.name}</span>
                    <Badge className={cn('text-xs', statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{apiKey.lastUsed}</p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {selectedKey ? (
            <div className="max-w-4xl">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedKey.name}</h2>
                  <Badge className={getStatusConfig(selectedKey.status).color}>
                    {getStatusConfig(selectedKey.status).label}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="dark:bg-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Activity className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-50" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat().format(selectedKey.usageCount)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dark:bg-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-10 h-10 text-green-600 dark:text-green-400 opacity-50" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedKey.createdDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dark:bg-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-50" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Expires</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedKey.expiryDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
                <CardHeader>
                  <CardTitle>API Key Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>API Key</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={selectedKey.key}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" onClick={() => alert('Copied!')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Last Used</Label>
                      <Input value={selectedKey.lastUsed} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input value={selectedKey.status} readOnly className="mt-1 capitalize" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Revoke Key
                </Button>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Usage Statistics
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Select an API key to view details</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.list;
};
