import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTeamMembersGrid = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'minimal' | 'detailed' = 'cards'
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
    // Special case for 'teamMembers': API might return array directly (trainers entity) or nested {teamMembers: [...]}
    if (fieldName === 'teamMembers') {
      return `(Array.isArray(${dataName}) ? ${dataName} : ${dataName}?.${fieldName} || ([] as any[]))`;
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
  const entity = dataSource?.split('.').pop() || 'team_members';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'team_members'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';`;

  const variants = {
    cards: `
${commonImports}
import { Twitter, Linkedin, Github, Mail, Loader2 } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  photo: string;
  bio: string;
  email: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface CardsTeamGridProps {
  ${dataName}?: any;
  className?: string;
  onMemberClick?: (member: TeamMember) => void;
  onSocialClick?: (platform: string, url: string, memberId: number) => void;
  onEmailClick?: (email: string, memberId: number) => void;
  [key: string]: any;
}

const CardsTeamGrid: React.FC<CardsTeamGridProps> = ({
  ${dataName}: propData,
  className,
  onMemberClick,
  onSocialClick,
  onEmailClick
}) => {
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
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  const title = ${getField('cardsTitle')};
  const subtitle = ${getField('cardsSubtitle')};
  const members = ${getField('teamMembers')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleMemberClick = (member: TeamMember) => {
    if (onMemberClick) {
      onMemberClick(member);
    } else {
      console.log('Member clicked:', member.name);
    }
  };

  const handleSocialClick = (platform: string, url: string, memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSocialClick) {
      onSocialClick(platform, url, memberId);
    } else {
      console.log('Social link clicked:', platform, url);
      window.open(url, '_blank');
    }
  };

  const handleEmailClick = (email: string, memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEmailClick) {
      onEmailClick(email, memberId);
    } else {
      console.log('Email clicked:', email);
      window.location.href = \`mailto:\${email}\`;
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member: TeamMember) => (
          <Card
            key={member.id}
            onClick={() => handleMemberClick(member)}
            onMouseEnter={() => setHoveredMember(member.id)}
            onMouseLeave={() => setHoveredMember(null)}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
          >
            <div className="relative h-80 overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={\`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 \${hoveredMember === member.id ? 'opacity-100' : 'opacity-0'}\`} />

              {hoveredMember === member.id && (
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => handleEmailClick(member.email, member.id, e)}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all transform hover:scale-110"
                  >
                    <Mail className="h-5 w-5 text-gray-700" />
                  </button>
                  {member.socialLinks?.twitter && (
                    <button
                      onClick={(e) => handleSocialClick('Twitter', member.socialLinks!.twitter!, member.id, e)}
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all transform hover:scale-110"
                    >
                      <Twitter className="h-5 w-5 text-blue-500" />
                    </button>
                  )}
                  {member.socialLinks?.linkedin && (
                    <button
                      onClick={(e) => handleSocialClick('LinkedIn', member.socialLinks!.linkedin!, member.id, e)}
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all transform hover:scale-110"
                    >
                      <Linkedin className="h-5 w-5 text-blue-600" />
                    </button>
                  )}
                  {member.socialLinks?.github && (
                    <button
                      onClick={(e) => handleSocialClick('GitHub', member.socialLinks!.github!, member.id, e)}
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all transform hover:scale-110"
                    >
                      <Github className="h-5 w-5 text-gray-700" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                {member.bio}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardsTeamGrid;
    `,

    minimal: `
${commonImports}
import { Mail, Loader2 } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo: string;
  email: string;
}

interface MinimalTeamGridProps {
  ${dataName}?: any;
  className?: string;
  onMemberClick?: (member: TeamMember) => void;
  onEmailClick?: (email: string, memberId: number) => void;
}

const MinimalTeamGrid: React.FC<MinimalTeamGridProps> = ({
  ${dataName}: propData,
  className,
  onMemberClick,
  onEmailClick
}) => {
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

  const title = ${getField('minimalTitle')};
  const subtitle = ${getField('minimalSubtitle')};
  const members = ${getField('teamMembers')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleMemberClick = (member: TeamMember) => {
    if (onMemberClick) {
      onMemberClick(member);
    } else {
      console.log('Member clicked:', member.name);
    }
  };

  const handleEmailClick = (email: string, memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEmailClick) {
      onEmailClick(email, memberId);
    } else {
      console.log('Email clicked:', email);
      window.location.href = \`mailto:\${email}\`;
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {members.map((member: TeamMember) => (
          <div
            key={member.id}
            onClick={() => handleMemberClick(member)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="relative mb-4">
              <img
                src={member.photo}
                alt={member.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800 group-hover:ring-blue-500 transition-all duration-300"
              />
              <button
                onClick={(e) => handleEmailClick(member.email, member.id, e)}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75 shadow-lg hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-center group-hover:text-blue-600 transition-colors">
              {member.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinimalTeamGrid;
    `,

    detailed: `
${commonImports}
import { Twitter, Linkedin, Github, Mail, Phone, Briefcase, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  photo: string;
  bio: string;
  email: string;
  phone: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  skills: string[];
}

interface DetailedTeamGridProps {
  ${dataName}?: any;
  className?: string;
  onMemberClick?: (member: TeamMember) => void;
  onViewProfile?: (memberId: number, member: TeamMember) => void;
  onContact?: (memberId: number, member: TeamMember) => void;
  onSocialClick?: (platform: string, url: string, memberId: number) => void;
}

const DetailedTeamGrid: React.FC<DetailedTeamGridProps> = ({
  ${dataName}: propData,
  className,
  onMemberClick,
  onViewProfile,
  onContact,
  onSocialClick
}) => {
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

  const title = ${getField('detailedTitle')};
  const subtitle = ${getField('detailedSubtitle')};
  const members = ${getField('teamMembers')};
  const viewProfileLabel = ${getField('viewProfileLabel')};
  const contactLabel = ${getField('contactLabel')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleMemberClick = (member: TeamMember) => {
    if (onMemberClick) {
      onMemberClick(member);
    } else {
      console.log('Member clicked:', member.name);
    }
  };

  const handleViewProfile = (memberId: number, member: TeamMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProfile) {
      onViewProfile(memberId, member);
    } else {
      console.log('View profile clicked:', member.name);
    }
  };

  const handleContact = (memberId: number, member: TeamMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContact) {
      onContact(memberId, member);
    } else {
      console.log('Contact clicked:', member.email);
      window.location.href = \`mailto:\${member.email}\`;
    }
  };

  const handleSocialClick = (platform: string, url: string, memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSocialClick) {
      onSocialClick(platform, url, memberId);
    } else {
      console.log('Social link clicked:', platform, url);
      window.open(url, '_blank');
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {members.map((member: TeamMember) => (
          <Card
            key={member.id}
            onClick={() => handleMemberClick(member)}
            className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 h-64 md:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 hover:text-blue-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {member.role}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Briefcase className="h-4 w-4" />
                        <span>{member.department}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>

                {member.skills && member.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4 pb-4 border-b dark:border-gray-700">
                  <a
                    href={\`mailto:\${member.email}\`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                  {member.socialLinks.twitter && (
                    <button
                      onClick={(e) => handleSocialClick('Twitter', member.socialLinks.twitter!, member.id, e)}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </button>
                  )}
                  {member.socialLinks.linkedin && (
                    <button
                      onClick={(e) => handleSocialClick('LinkedIn', member.socialLinks.linkedin!, member.id, e)}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </button>
                  )}
                  {member.socialLinks.github && (
                    <button
                      onClick={(e) => handleSocialClick('GitHub', member.socialLinks.github!, member.id, e)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      title="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleViewProfile(member.id, member, e)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    {viewProfileLabel}
                  </button>
                  <button
                    onClick={(e) => handleContact(member.id, member, e)}
                    className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm text-gray-700 dark:text-gray-300"
                  >
                    {contactLabel}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DetailedTeamGrid;
    `
  };

  return variants[variant] || variants.cards;
};
