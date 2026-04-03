import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMaintenanceModePage = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'countdown' | 'detailed' = 'simple'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Mail, Phone, Twitter, Facebook, Linkedin, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface MaintenanceModePageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const MaintenanceModePage: React.FC<MaintenanceModePageProps> = ({
  ${dataName},
  className
}) => {
  const maintenanceData = ${dataName} || {};

  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const estimatedTimeLabel = ${getField('estimatedTimeLabel')};
  const estimatedTime = ${getField('estimatedTime')};

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4", className)}>
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <Settings className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {heading}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {estimatedTimeLabel}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {estimatedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModePage;
    `,

    countdown: `
${commonImports}

interface MaintenanceModePageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const MaintenanceModePage: React.FC<MaintenanceModePageProps> = ({
  ${dataName},
  className
}) => {
  const maintenanceData = ${dataName} || {};
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const countdownEndTime = ${getField('countdownEndTime')};
  const subscribeTitle = ${getField('subscribeTitle')};
  const subscribePlaceholder = ${getField('subscribePlaceholder')};
  const subscribeButton = ${getField('subscribeButton')};
  const subscribeSuccess = ${getField('subscribeSuccess')};

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = countdownEndTime - Date.now();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [countdownEndTime]);

  const handleSubscribe = () => {
    if (email) {
      console.log('Subscribing email:', email);
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 5000);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4", className)}>
      <div className="text-center max-w-3xl w-full">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-6">
            <Settings className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {heading}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {message}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          {[
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item: any, index: number) => (
            <Card key={index} className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {subscribeTitle}
            </h3>
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span>{subscribeSuccess}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={subscribePlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                  className="h-11"
                />
                <Button
                  onClick={handleSubscribe}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {subscribeButton}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceModePage;
    `,

    detailed: `
${commonImports}

interface MaintenanceModePageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const MaintenanceModePage: React.FC<MaintenanceModePageProps> = ({
  ${dataName},
  className
}) => {
  const maintenanceData = ${dataName} || {};
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const headingAlternate = ${getField('headingAlternate')};
  const detailedMessage = ${getField('detailedMessage')};
  const estimatedTime = ${getField('estimatedTime')};
  const subscribeTitle = ${getField('subscribeTitle')};
  const subscribePlaceholder = ${getField('subscribePlaceholder')};
  const subscribeButton = ${getField('subscribeButton')};
  const subscribeSuccess = ${getField('subscribeSuccess')};
  const socialMediaTitle = ${getField('socialMediaTitle')};
  const socialMediaLinks = ${getField('socialMediaLinks')};
  const urgentContactTitle = ${getField('urgentContactTitle')};
  const contactEmail = ${getField('contactEmail')};
  const contactPhone = ${getField('contactPhone')};
  const progressLabel = ${getField('progressLabel')};
  const progressPercentage = ${getField('progressPercentage')};

  const handleSubscribe = () => {
    if (email) {
      console.log('Subscribing email:', email);
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 5000);
    }
  };

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4", className)}>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <Settings className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            {headingAlternate}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            {detailedMessage}
          </p>

          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Back online by {estimatedTime}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {subscribeTitle}
              </h3>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{subscribeSuccess}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder={subscribePlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                    className="h-11"
                  />
                  <Button
                    onClick={handleSubscribe}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {subscribeButton}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {urgentContactTitle}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <a
                    href={\`mailto:\${contactEmail}\`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <a
                    href={\`tel:\${contactPhone}\`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {contactPhone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progressLabel}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {socialMediaTitle}
          </h3>
          <div className="flex justify-center gap-3">
            {socialMediaLinks.map((link: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                onClick={() => console.log('Opening', link.platform)}
                className="w-10 h-10"
              >
                {getSocialIcon(link.icon)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModePage;
    `
  };

  return variants[variant] || variants.simple;
};
