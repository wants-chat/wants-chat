import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateScreenReaderAnnouncements = (
  resolved: ResolvedComponent,
  variant: 'polite' | 'assertive' | 'status' = 'polite'
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
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, MessageSquare, AlertTriangle, Info, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    polite: `
${commonImports}

interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
  type: 'polite';
}

interface ScreenReaderAnnouncementsProps {
  ${dataName}?: any;
  className?: string;
  onAnnounce?: (message: string, type: 'polite') => void;
}

const ScreenReaderAnnouncementsComponent: React.FC<ScreenReaderAnnouncementsProps> = ({
  ${dataName}: propData,
  className,
  onAnnounce
}) => {
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

  const announcementData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const politeLabel = ${getField('politeLabel')};
  const politeDescription = ${getField('politeDescription')};
  const testPoliteButton = ${getField('testPoliteButton')};
  const clearButton = ${getField('clearButton')};
  const enabledLabel = ${getField('enabledLabel')};
  const samplePolite = ${getField('samplePolite')};

  const [enabled, setEnabled] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const politeRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (!enabled) return;

    const announcement: Announcement = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type: 'polite'
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Update the aria-live region
    if (politeRef.current) {
      politeRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (politeRef.current) {
          politeRef.current.textContent = '';
        }
      }, 1000);
    }

    if (onAnnounce) {
      onAnnounce(message, 'polite');
    }
  };

  const testAnnouncement = () => {
    announce(samplePolite);
  };

  const clearAnnouncements = () => {
    setAnnouncements([]);
    if (politeRef.current) {
      politeRef.current.textContent = '';
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      {/* Screen reader only - Polite announcements */}
      <div
        ref={politeRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2">
              {enabled ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <Label htmlFor="enabled-toggle">{enabledLabel}</Label>
            </div>
            <Switch
              id="enabled-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Toggle screen reader announcements"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">{politeLabel}</h3>
                <p className="text-sm text-blue-700 mt-1">{politeDescription}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={testAnnouncement}
                disabled={!enabled}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {testPoliteButton}
              </Button>
              <Button
                variant="outline"
                onClick={clearAnnouncements}
                disabled={announcements.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {clearButton}
              </Button>
            </div>
          </div>

          {announcements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Announcement History ({announcements.length})</Label>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {announcements.slice().reverse().map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900 flex-1">
                          {announcement.message}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Polite
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {announcement.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="font-medium mb-1">For Screen Reader Users:</p>
            <p>Polite announcements will be read by your screen reader after it finishes the current content. They will not interrupt your current activity.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenReaderAnnouncementsComponent;
    `,

    assertive: `
${commonImports}

interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
  type: 'assertive';
}

interface ScreenReaderAnnouncementsProps {
  ${dataName}?: any;
  className?: string;
  onAnnounce?: (message: string, type: 'assertive') => void;
}

const ScreenReaderAnnouncementsComponent: React.FC<ScreenReaderAnnouncementsProps> = ({
  ${dataName}: propData,
  className,
  onAnnounce
}) => {
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

  const announcementData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const assertiveLabel = ${getField('assertiveLabel')};
  const assertiveDescription = ${getField('assertiveDescription')};
  const testAssertiveButton = ${getField('testAssertiveButton')};
  const clearButton = ${getField('clearButton')};
  const enabledLabel = ${getField('enabledLabel')};
  const sampleAssertive = ${getField('sampleAssertive')};

  const [enabled, setEnabled] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const assertiveRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (!enabled) return;

    const announcement: Announcement = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type: 'assertive'
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Update the aria-live region
    if (assertiveRef.current) {
      assertiveRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (assertiveRef.current) {
          assertiveRef.current.textContent = '';
        }
      }, 1000);
    }

    if (onAnnounce) {
      onAnnounce(message, 'assertive');
    }
  };

  const testAnnouncement = () => {
    announce(sampleAssertive);
  };

  const clearAnnouncements = () => {
    setAnnouncements([]);
    if (assertiveRef.current) {
      assertiveRef.current.textContent = '';
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      {/* Screen reader only - Assertive announcements */}
      <div
        ref={assertiveRef}
        className="sr-only"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      />

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2">
              {enabled ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <Label htmlFor="enabled-toggle">{enabledLabel}</Label>
            </div>
            <Switch
              id="enabled-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Toggle screen reader announcements"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">{assertiveLabel}</h3>
                <p className="text-sm text-orange-700 mt-1">{assertiveDescription}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={testAnnouncement}
                disabled={!enabled}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {testAssertiveButton}
              </Button>
              <Button
                variant="outline"
                onClick={clearAnnouncements}
                disabled={announcements.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {clearButton}
              </Button>
            </div>
          </div>

          {announcements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Announcement History ({announcements.length})</Label>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {announcements.slice().reverse().map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 bg-white border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900 flex-1">
                          {announcement.message}
                        </p>
                        <Badge variant="destructive" className="text-xs">
                          Assertive
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {announcement.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="text-sm text-gray-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="font-medium mb-1">For Screen Reader Users:</p>
            <p>Assertive announcements will interrupt your screen reader immediately. Use these for important updates that require immediate attention.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenReaderAnnouncementsComponent;
    `,

    status: `
${commonImports}

interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
  type: 'polite' | 'assertive' | 'status';
}

interface ScreenReaderAnnouncementsProps {
  ${dataName}?: any;
  className?: string;
  onAnnounce?: (message: string, type: 'polite' | 'assertive' | 'status') => void;
}

const ScreenReaderAnnouncementsComponent: React.FC<ScreenReaderAnnouncementsProps> = ({
  ${dataName}: propData,
  className,
  onAnnounce
}) => {
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

  const announcementData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const politeLabel = ${getField('politeLabel')};
  const assertiveLabel = ${getField('assertiveLabel')};
  const statusLabel = ${getField('statusLabel')};
  const testPoliteButton = ${getField('testPoliteButton')};
  const testAssertiveButton = ${getField('testAssertiveButton')};
  const testStatusButton = ${getField('testStatusButton')};
  const clearButton = ${getField('clearButton')};
  const enabledLabel = ${getField('enabledLabel')};
  const samplePolite = ${getField('samplePolite')};
  const sampleAssertive = ${getField('sampleAssertive')};
  const sampleStatus = ${getField('sampleStatus')};

  const [enabled, setEnabled] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, type: 'polite' | 'assertive' | 'status') => {
    if (!enabled) return;

    const announcement: Announcement = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Update the appropriate aria-live region
    const ref = type === 'assertive' ? assertiveRef : type === 'status' ? statusRef : politeRef;
    if (ref.current) {
      ref.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (ref.current) {
          ref.current.textContent = '';
        }
      }, 1000);
    }

    if (onAnnounce) {
      onAnnounce(message, type);
    }
  };

  const clearAnnouncements = () => {
    setAnnouncements([]);
    [politeRef, assertiveRef, statusRef].forEach(ref => {
      if (ref.current) {
        ref.current.textContent = '';
      }
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      {/* Screen reader only - Multiple aria-live regions */}
      <div ref={politeRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
      <div ref={assertiveRef} className="sr-only" role="alert" aria-live="assertive" aria-atomic="true" />
      <div ref={statusRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2">
              {enabled ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <Label htmlFor="enabled-toggle">{enabledLabel}</Label>
            </div>
            <Switch
              id="enabled-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Toggle screen reader announcements"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Polite */}
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-sm text-blue-900">{politeLabel}</h3>
                </div>
                <p className="text-xs text-blue-700">{${getField('politeDescription')}}</p>
              </div>
              <Button
                onClick={() => announce(samplePolite, 'polite')}
                disabled={!enabled}
                size="sm"
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {testPoliteButton}
              </Button>
            </div>

            {/* Assertive */}
            <div className="space-y-3">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <h3 className="font-medium text-sm text-orange-900">{assertiveLabel}</h3>
                </div>
                <p className="text-xs text-orange-700">{${getField('assertiveDescription')}}</p>
              </div>
              <Button
                onClick={() => announce(sampleAssertive, 'assertive')}
                disabled={!enabled}
                size="sm"
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {testAssertiveButton}
              </Button>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-green-600" />
                  <h3 className="font-medium text-sm text-green-900">{statusLabel}</h3>
                </div>
                <p className="text-xs text-green-700">{${getField('statusDescription')}}</p>
              </div>
              <Button
                onClick={() => announce(sampleStatus, 'status')}
                disabled={!enabled}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Info className="w-4 h-4 mr-2" />
                {testStatusButton}
              </Button>
            </div>
          </div>

          {announcements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Announcement History ({announcements.length})</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAnnouncements}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {clearButton}
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {announcements.slice().reverse().map((announcement) => (
                    <div
                      key={announcement.id}
                      className={cn(
                        "p-3 border rounded-lg",
                        announcement.type === 'polite' && "bg-blue-50 border-blue-200",
                        announcement.type === 'assertive' && "bg-orange-50 border-orange-200",
                        announcement.type === 'status' && "bg-green-50 border-green-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900 flex-1">
                          {announcement.message}
                        </p>
                        <Badge
                          variant={announcement.type === 'assertive' ? 'destructive' : 'secondary'}
                          className="text-xs capitalize"
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {announcement.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenReaderAnnouncementsComponent;
    `
  };

  return variants[variant] || variants.polite;
};
