import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAccessDeniedPage = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'detailed' | 'helpful' = 'simple'
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
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX, ArrowLeft, Home, Mail, User, LayoutDashboard, Globe, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface AccessDeniedPageProps {
  ${dataName}?: any;
  className?: string;
  onBack?: () => void;
  onHome?: () => void;
  onRequestAccess?: () => void;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  ${dataName},
  className,
  onBack,
  onHome,
  onRequestAccess
}) => {
  const accessData = ${dataName} || {};

  const errorCode = ${getField('errorCode')};
  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const backButton = ${getField('backButton')};
  const homeButton = ${getField('homeButton')};
  const requestAccessButton = ${getField('requestAccessButton')};

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log('Going back');
      window.history.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      console.log('Going home');
      window.location.href = '/';
    }
  };

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess();
    } else {
      console.log('Request access clicked');
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4", className)}>
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
            <ShieldX className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-8xl font-bold text-red-600 dark:text-red-400 mb-4">
            {errorCode}
          </h1>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {heading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={handleBack}
            variant="outline"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {backButton}
          </Button>
          <Button
            size="lg"
            onClick={handleHome}
            variant="outline"
          >
            <Home className="w-5 h-5 mr-2" />
            {homeButton}
          </Button>
          <Button
            size="lg"
            onClick={handleRequestAccess}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="w-5 h-5 mr-2" />
            {requestAccessButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
    `,

    detailed: `
${commonImports}

interface AccessDeniedPageProps {
  ${dataName}?: any;
  className?: string;
  onBack?: () => void;
  onRequestAccess?: () => void;
  onContactAdmin?: () => void;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  ${dataName},
  className,
  onBack,
  onRequestAccess,
  onContactAdmin
}) => {
  const accessData = ${dataName} || {};

  const headingAlternate = ${getField('headingAlternate')};
  const messageDetailed = ${getField('messageDetailed')};
  const reasonLabel = ${getField('reasonLabel')};
  const insufficientPermissions = ${getField('insufficientPermissions')};
  const requiredPermissionsLabel = ${getField('requiredPermissionsLabel')};
  const requiredPermissions = ${getField('requiredPermissions')};
  const yourRoleLabel = ${getField('yourRoleLabel')};
  const currentRole = ${getField('currentRole')};
  const backButton = ${getField('backButton')};
  const requestAccessButton = ${getField('requestAccessButton')};
  const contactAdminButton = ${getField('contactAdminButton')};

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess();
    } else {
      console.log('Request access clicked');
    }
  };

  const handleContactAdmin = () => {
    if (onContactAdmin) {
      onContactAdmin();
    } else {
      console.log('Contact admin clicked');
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4", className)}>
      <Card className="max-w-2xl w-full shadow-xl">
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
              <ShieldX className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {headingAlternate}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {messageDetailed}
            </p>
          </div>

          <Alert className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <div className="mb-2">
                <span className="font-medium">{reasonLabel}</span>
              </div>
              <p>{insufficientPermissions}</p>
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {yourRoleLabel}
              </h3>
              <Badge variant="secondary" className="text-base">
                <User className="w-4 h-4 mr-2" />
                {currentRole}
              </Badge>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {requiredPermissionsLabel}
              </h3>
              <div className="space-y-2">
                {requiredPermissions.map((permission: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {permission}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {backButton}
            </Button>
            <Button
              size="lg"
              onClick={handleRequestAccess}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {requestAccessButton}
            </Button>
            <Button
              size="lg"
              onClick={handleContactAdmin}
              variant="outline"
              className="flex-1"
            >
              {contactAdminButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;
    `,

    helpful: `
${commonImports}

interface AccessDeniedPageProps {
  ${dataName}?: any;
  className?: string;
  onRequestAccess?: () => void;
  onActionClick?: (action: any) => void;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  ${dataName},
  className,
  onRequestAccess,
  onActionClick
}) => {
  const accessData = ${dataName} || {};

  const headingDetailed = ${getField('headingDetailed')};
  const messageDetailed = ${getField('messageDetailed')};
  const helpTitle = ${getField('helpTitle')};
  const helpDescription = ${getField('helpDescription')};
  const requestAccessButton = ${getField('requestAccessButton')};
  const contactAdminButton = ${getField('contactAdminButton')};
  const adminEmail = ${getField('adminEmail')};
  const reasons = ${getField('reasons')};
  const suggestedActions = ${getField('suggestedActions')};

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess();
    } else {
      console.log('Request access clicked');
    }
  };

  const handleActionClick = (action: any) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      console.log('Action clicked:', action.title);
    }
  };

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'layout-dashboard': return <LayoutDashboard className="w-6 h-6" />;
      case 'globe': return <Globe className="w-6 h-6" />;
      case 'user': return <User className="w-6 h-6" />;
      default: return <Home className="w-6 h-6" />;
    }
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 p-4", className)}>
      <div className="max-w-4xl mx-auto pt-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
            <ShieldX className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {headingDetailed}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {messageDetailed}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Possible Reasons
              </h3>
              <ul className="space-y-3">
                {reasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {helpTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {helpDescription}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleRequestAccess}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {requestAccessButton}
                </Button>
                <a href={\`mailto:\${adminEmail}\`}>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    {contactAdminButton}
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Where would you like to go?
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {suggestedActions.map((action: any, index: number) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleActionClick(action)}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                    {getActionIcon(action.icon)}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {action.title}
                  </h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
    `
  };

  return variants[variant] || variants.simple;
};
