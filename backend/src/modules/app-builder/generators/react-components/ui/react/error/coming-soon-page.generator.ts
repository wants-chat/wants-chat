import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateComingSoonPage = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'countdown' | 'teaser' = 'simple'
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
import { Mail, CheckCircle2, Twitter, Instagram, Facebook, Linkedin, Zap, Palette, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface ComingSoonPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  ${dataName},
  className
}) => {
  const comingSoonData = ${dataName} || {};
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const signupTitle = ${getField('signupTitle')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const signupButton = ${getField('signupButton')};
  const signupSuccess = ${getField('signupSuccess')};
  const followTitle = ${getField('followTitle')};

  const handleSignup = () => {
    if (email) {
      console.log('Email signup:', email);
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 5000);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4", className)}>
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <Badge className="mb-4 bg-white/20 text-white backdrop-blur-sm px-4 py-2">
            Coming Soon
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {heading}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {message}
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {signupTitle}
            </h3>
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-300 p-4 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span>{signupSuccess}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
                  className="h-12 bg-white/90 border-white/20"
                />
                <Button
                  onClick={handleSignup}
                  className="h-12 bg-white text-purple-600 hover:bg-white/90"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {signupButton}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <p className="text-white/80 text-sm mb-3">
            {followTitle}
          </p>
          <div className="flex justify-center gap-3">
            {[Twitter, Instagram, Facebook, Linkedin].map((Icon, index) => (
              <button
                key={index}
                className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                onClick={() => console.log('Social clicked')}
              >
                <Icon className="w-5 h-5 text-white" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
    `,

    countdown: `
${commonImports}

interface ComingSoonPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  ${dataName},
  className
}) => {
  const comingSoonData = ${dataName} || {};
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const headingAlternate = ${getField('headingAlternate')};
  const tagline = ${getField('tagline')};
  const countdownEndTime = ${getField('countdownEndTime')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const signupButtonAlternate = ${getField('signupButtonAlternate')};
  const signupSuccess = ${getField('signupSuccess')};
  const socialLinks = ${getField('socialLinks')};
  const backgroundImage = ${getField('backgroundImage')};

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = countdownEndTime - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
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

  const handleSignup = () => {
    if (email) {
      console.log('Email signup:', email);
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
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div
      className={cn("min-h-screen flex items-center justify-center p-4 relative", className)}
      style={{
        backgroundImage: \`url(\${backgroundImage})\`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 text-center max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">
            {headingAlternate}
          </h1>
          <p className="text-xl text-white/90">
            {tagline}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item: any, index: number) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-sm text-white/80 uppercase tracking-wider">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-md mx-auto mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-300 p-4 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span>{signupSuccess}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
                  className="h-12 bg-white/90 border-white/20"
                />
                <Button
                  onClick={handleSignup}
                  className="h-12 bg-white text-gray-900 hover:bg-white/90"
                >
                  {signupButtonAlternate}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          {socialLinks.map((link: any, index: number) => (
            <button
              key={index}
              className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
              onClick={() => console.log('Opening', link.platform)}
            >
              {getSocialIcon(link.icon)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
    `,

    teaser: `
${commonImports}

interface ComingSoonPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  ${dataName},
  className
}) => {
  const comingSoonData = ${dataName} || {};
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const heading = ${getField('heading')};
  const detailedMessage = ${getField('detailedMessage')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const signupButtonAlternate = ${getField('signupButtonAlternate')};
  const signupSuccess = ${getField('signupSuccess')};
  const teaserTitle = ${getField('teaserTitle')};
  const teaserFeatures = ${getField('teaserFeatures')};
  const heroImage = ${getField('heroImage')};
  const socialLinks = ${getField('socialLinks')};

  const handleSignup = () => {
    if (email) {
      console.log('Email signup:', email);
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 5000);
    }
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'palette': return <Palette className="w-6 h-6" />;
      case 'rocket': return <Rocket className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900", className)}>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Coming Soon
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {heading}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {detailedMessage}
          </p>

          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              {subscribed ? (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{signupSuccess}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
                    className="h-12"
                  />
                  <Button
                    onClick={handleSignup}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {signupButtonAlternate}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <img
            src={heroImage}
            alt="Coming Soon Preview"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            {teaserTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teaserFeatures.map((feature: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    {getFeatureIcon(feature.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Follow us for updates
          </p>
          <div className="flex justify-center gap-3">
            {socialLinks.map((link: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                onClick={() => console.log('Opening', link.platform)}
                className="w-12 h-12"
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

export default ComingSoonPage;
    `
  };

  return variants[variant] || variants.simple;
};
