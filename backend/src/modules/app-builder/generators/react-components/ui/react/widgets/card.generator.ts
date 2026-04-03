import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCardWidget = (
  resolved: ResolvedComponent,
  variant: 'cardWithForm' | 'cardWithImage' | 'cardWithLink' | 'cardWithList' | 'cardWithNavTab' | 'cardWithProfile' | 'cryptoCard' | 'ctaCard' | 'defaultCard' | 'pricingCard' | 'productCard' = 'defaultCard'
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
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowRight,
  ExternalLink,
  Gift,
  HelpCircle,
  MoreHorizontal,
  Check,
  X,
  Star,
  Apple,
  Play,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';`;

  const variants = {
    cardWithForm: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  fields?: any;
  onLogin?: (email: string, password: string, rememberMe: boolean) => void;
  onForgotPassword?: () => void;
  onCreate?: () => void;
  onEmailChange?: (email: string) => void;
  onPasswordChange?: (password: string) => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onLogin,
  onForgotPassword,
  onCreate,
  onEmailChange,
  onPasswordChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const title = ${getField('title')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const rememberMeText = ${getField('rememberMeText')};
  const forgotPasswordText = ${getField('forgotPasswordText')};
  const loginButtonText = ${getField('loginButtonText')};
  const registerText = ${getField('registerText')};
  const createAccountText = ${getField('createAccountText')};

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (onEmailChange) {
      onEmailChange(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (onPasswordChange) {
      onPasswordChange(value);
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin(email, password, rememberMe);
    } else {
      console.log('Login:', { email, password, rememberMe });
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      console.log('Forgot password clicked');
    }
  };

  const handleCreateAccount = () => {
    if (onCreate) {
      onCreate();
    } else {
      console.log('Create account clicked');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-gray-800">
        <CardHeader className="text-center space-y-2 pb-8">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">{emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={handleEmailChange}
              className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">{passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              placeholder={passwordPlaceholder}
              value={password}
              onChange={handlePasswordChange}
              className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-gray-400 dark:border-gray-600"
              />
              <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{rememberMeText}</Label>
            </div>
            <Button
              variant="link"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto text-sm font-medium"
              onClick={handleForgotPassword}
            >
              {forgotPasswordText}
            </Button>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white h-11 font-semibold shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleLogin}
          >
            {loginButtonText}
          </Button>

          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            {registerText}{' '}
            <Button
              variant="link"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto font-semibold"
              onClick={handleCreateAccount}
            >
              {createAccountText}
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    cardWithImage: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onButtonClick?: () => void;
  onImageClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onButtonClick,
  onImageClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const title = ${getField('title')};
  const description = ${getField('description')};
  const buttonText = ${getField('buttonText')};
  const imageEmoji = ${getField('imageEmoji')};

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      console.log('Button clicked');
    }
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick();
    } else {
      console.log('Image clicked');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl overflow-hidden shadow-xl border-gray-200 dark:border-gray-800">
        <div className="md:flex">
          <div
            onClick={handleImageClick}
            className="md:w-1/2 h-64 md:h-auto bg-gray-200 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <span className="text-6xl">{imageEmoji}</span>
            </div>
          </div>

          <CardContent className="md:w-1/2 p-8 flex flex-col justify-center space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white w-fit font-semibold shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleButtonClick}
            >
              {buttonText} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    cardWithLink: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onLinkClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onLinkClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const title = ${getField('title')};
  const description = ${getField('description')};
  const linkText = ${getField('linkText')};
  const iconComponent = ${getField('iconComponent')};

  const renderIcon = () => {
    switch (iconComponent) {
      case 'Gift':
        return <Gift className="w-6 h-6 text-gray-600" />;
      case 'HelpCircle':
        return <HelpCircle className="w-6 h-6 text-gray-600" />;
      default:
        return <Gift className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    } else {
      console.log('Link clicked');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 space-y-6">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mt-4">
            {renderIcon()}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
          
          <Button 
            variant="link" 
            className="text-blue-600 p-0 h-auto"
            onClick={handleLinkClick}
          >
            {linkText} <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    cardWithList: `
${commonImports}

interface CustomerData {
  name: string;
  email: string;
  amount: string;
  avatar?: string;
}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onViewAll?: () => void;
  onCustomerClick?: (customer: CustomerData) => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onViewAll,
  onCustomerClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const title = ${getField('title')};
  const viewAllText = ${getField('viewAllText')};
  const customers = ${getField('customers')};

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('View all clicked');
    }
  };

  const handleCustomerClick = (customer: CustomerData) => {
    if (onCustomerClick) {
      onCustomerClick(customer);
    } else {
      console.log('Customer clicked:', customer.name);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Button 
            variant="link" 
            className="text-blue-600 p-0"
            onClick={handleViewAll}
          >
            {viewAllText}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {customers.map((customer: CustomerData, index: number) => (
            <div 
              key={index} 
              onClick={() => handleCustomerClick(customer)}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">{customer.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    cardWithNavTab: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onTabChange?: (tab: string) => void;
  onButtonClick?: (activeTab: string) => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onTabChange,
  onButtonClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [activeTab, setActiveTab] = useState('About');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const tabs = ${getField('tabs')};
  const aboutTitle = ${getField('aboutTitle')};
  const aboutDescription1 = ${getField('aboutDescription1')};
  const aboutDescription2 = ${getField('aboutDescription2')};
  const buttonText = ${getField('buttonText')};
  const servicesTitle = ${getField('servicesTitle')};
  const servicesDescription = ${getField('servicesDescription')};
  const factsTitle = ${getField('factsTitle')};
  const factsDescription = ${getField('factsDescription')};

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    } else {
      console.log('Tab changed to:', tab);
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(activeTab);
    } else {
      console.log('Button clicked on tab:', activeTab);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-5xl">
        <div className="flex border-b">
          {tabs.map((tab: string) => (
            <Button
              key={tab}
              variant="ghost"
              className={cn(
                "px-8 py-4 rounded-none border-b-2",
                activeTab === tab
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        <CardContent className="p-12">
          {activeTab === 'About' && (
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {aboutTitle}
              </h1>
              
              <div className="space-y-4 max-w-4xl">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {aboutDescription1}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {aboutDescription2}
                </p>
              </div>
              
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                onClick={handleButtonClick}
              >
                {buttonText} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          
          {activeTab === 'Services' && (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{servicesTitle}</h2>
              <p className="text-gray-600 text-lg">{servicesDescription}</p>
            </div>
          )}
          
          {activeTab === 'Facts' && (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{factsTitle}</h2>
              <p className="text-gray-600 text-lg">{factsDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    cardWithProfile: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onAddFriend?: () => void;
  onMessage?: () => void;
  onMenuAction?: (action: string) => void;
  onAvatarClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onAddFriend,
  onMessage,
  onMenuAction,
  onAvatarClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const name = ${getField('name')};
  const role = ${getField('role')};
  const avatar = ${getField('avatar')};
  const addFriendText = ${getField('addFriendText')};
  const messageText = ${getField('messageText')};

  const handleAddFriend = () => {
    if (onAddFriend) {
      onAddFriend();
    } else {
      console.log('Add friend clicked');
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage();
    } else {
      console.log('Message clicked');
    }
  };

  const handleMenuAction = (action: string) => {
    if (onMenuAction) {
      onMenuAction(action);
    } else {
      console.log('Menu action:', action);
    }
  };

  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    } else {
      console.log('Avatar clicked');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-sm relative">
        <CardContent className="p-6 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleMenuAction('edit')}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('export')}>
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleMenuAction('delete')}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Avatar 
            className="w-20 h-20 mx-auto mb-4 mt-4 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onClick={handleAvatarClick}
          >
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {name}
          </h3>
          <p className="text-gray-600 mb-6">
            {role}
          </p>
          
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleAddFriend}
            >
              {addFriendText}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleMessage}
            >
              {messageText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    cryptoCard: `
${commonImports}

interface WalletData {
  name: string;
  icon: string;
  popular: boolean;
}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onWalletClick?: (wallet: WalletData) => void;
  onHelpClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onWalletClick,
  onHelpClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const title = ${getField('title')};
  const description = ${getField('description')};
  const helpText = ${getField('helpText')};
  const wallets = ${getField('wallets')};

  const handleWalletClick = (wallet: WalletData) => {
    if (onWalletClick) {
      onWalletClick(wallet);
    } else {
      console.log('Wallet clicked:', wallet.name);
    }
  };

  const handleHelpClick = () => {
    if (onHelpClick) {
      onHelpClick();
    } else {
      console.log('Help clicked');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <p className="text-gray-600 text-sm">
            {description}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {wallets.map((wallet: WalletData, index: number) => (
            <div
              key={index}
              onClick={() => handleWalletClick(wallet)}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{wallet.icon}</span>
                <span className="font-medium text-gray-900">{wallet.name}</span>
              </div>
              {wallet.popular && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  Popular
                </Badge>
              )}
            </div>
          ))}
          
          <div 
            onClick={handleHelpClick}
            className="flex items-center gap-2 pt-4 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">{helpText}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    ctaCard: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onAppStoreClick?: () => void;
  onPlayStoreClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onAppStoreClick,
  onPlayStoreClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const title = ${getField('title')};
  const description1 = ${getField('description1')};
  const description2 = ${getField('description2')};
  const appStoreText = ${getField('appStoreText')};
  const appStoreSubText = ${getField('appStoreSubText')};
  const playStoreText = ${getField('playStoreText')};
  const playStoreSubText = ${getField('playStoreSubText')};

  const handleAppStoreClick = () => {
    if (onAppStoreClick) {
      onAppStoreClick();
    } else {
      console.log('App Store clicked');
    }
  };

  const handlePlayStoreClick = () => {
    if (onPlayStoreClick) {
      onPlayStoreClick();
    } else {
      console.log('Play Store clicked');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl">
        <CardContent className="text-center p-12 space-y-8">
          <div className="space-y-4 mt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {title}
            </h1>
            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                {description1}
              </p>
              <p className="text-lg text-gray-600">
                {description2}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 h-auto"
              size="lg"
              onClick={handleAppStoreClick}
            >
              <Apple className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="text-xs">{appStoreText}</div>
                <div className="text-sm font-semibold">{appStoreSubText}</div>
              </div>
            </Button>
            
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 h-auto"
              size="lg"
              onClick={handlePlayStoreClick}
            >
              <Play className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="text-xs">{playStoreText}</div>
                <div className="text-sm font-semibold">{playStoreSubText}</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    defaultCard: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onCardClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onCardClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const title = ${getField('title')};
  const content = ${getField('content')};

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      console.log('Card clicked');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card 
        className="w-full max-w-2xl cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleCardClick}
      >
        <CardContent className="p-8 pt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {content}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    pricingCard: `
${commonImports}

interface FeatureData {
  name: string;
  included: boolean;
}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onPurchase?: () => void;
  onFeatureClick?: (feature: FeatureData) => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onPurchase,
  onFeatureClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const planName = ${getField('planName')};
  const price = ${getField('price')};
  const period = ${getField('period')};
  const buttonText = ${getField('buttonText')};
  const features = ${getField('features')};

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase();
    } else {
      console.log('Purchase clicked');
    }
  };

  const handleFeatureClick = (feature: FeatureData) => {
    if (onFeatureClick) {
      onFeatureClick(feature);
    } else {
      console.log('Feature clicked:', feature.name);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="text-center space-y-3 pb-8">
          <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm uppercase tracking-wider">{planName}</p>
          <CardTitle className="text-5xl font-bold text-gray-900 dark:text-white">
            {price} <span className="text-lg font-normal text-gray-600 dark:text-gray-400">{period}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {features.map((feature: FeatureData, index: number) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-lg transition-all"
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                  feature.included
                    ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500"
                )}>
                  {feature.included ? (
                    <Check className="w-4 h-4 font-bold" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <span className={cn(
                  "text-base",
                  feature.included
                    ? "text-gray-900 dark:text-white font-medium"
                    : "text-gray-500 dark:text-gray-600 line-through"
                )}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white h-12 font-semibold text-base shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-8"
            onClick={handlePurchase}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `,

    productCard: `
${commonImports}

interface CardProps {
  [key: string]: any;
  ${dataName}?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  actionButtons?: any[];
  onPurchase?: () => void;
  onImageClick?: () => void;
  onRatingClick?: (rating: number) => void;
}

const CardComponent: React.FC<CardProps> = ({
  ${dataName}: propData,
  className,
  onPurchase,
  onImageClick,
  onRatingClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const sourceData = ${dataName} || {};

  const productName = ${getField('productName')};
  const price = ${getField('price')};
  const rating = ${getField('rating')};
  const ratingText = ${getField('ratingText')};
  const buttonText = ${getField('buttonText')};
  const productEmoji = ${getField('productEmoji')};

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase();
    } else {
      console.log('Purchase clicked');
    }
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick();
    } else {
      console.log('Product image clicked');
    }
  };

  const handleRatingClick = () => {
    if (onRatingClick) {
      onRatingClick(rating);
    } else {
      console.log('Rating clicked:', rating);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-sm shadow-lg border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <div
            onClick={handleImageClick}
            className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-sm"
          >
            <div className="text-6xl">{productEmoji}</div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
              {productName}
            </h3>

            <div
              onClick={handleRatingClick}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5 transition-all",
                      i < rating
                        ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:underline">{ratingText}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{price}</span>
              <Button
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-6 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handlePurchase}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardComponent;
    `
  };

  return variants[variant] || variants.defaultCard;
};
