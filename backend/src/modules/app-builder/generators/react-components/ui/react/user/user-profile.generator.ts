import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateUserProfile = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'withSkills' | 'socialMedia' | 'statsCard' | 'teamLead' = 'simple'
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
  const entity = dataSource?.split('.').pop() || 'data';

  const variants = {
    simple: `
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface UserProfileProps {
  ${dataName}?: any;
  className?: string;
  onUpdateProfile?: (profileData: any) => void;
  [key: string]: any;
}

export default function UserProfile({ ${dataName}: propData, className, onUpdateProfile }: UserProfileProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const name = ${getField('name')};
  const title = ${getField('title')};
  const email = ${getField('email')};
  const phone = ${getField('phone')};
  const location = ${getField('location')};
  const joinDate = ${getField('joinDate')};
  const avatar = ${getField('avatar')};
  const stats = ${getField('statsSimple')};
  const about = ${getField('about')};
  const editProfileButton = ${getField('editProfileButton')};
  const shareButton = ${getField('shareButton')};
  const aboutTitle = ${getField('aboutTitle')};
  const projectsLabel = ${getField('projectsLabel')};
  const followersLabel = ${getField('followersLabel')};
  const followingLabel = ${getField('followingLabel')};
  const joinedLabel = ${getField('joinedLabel')};

  // Event handlers
  const handleAvatarClick = () => {
    console.log('Avatar clicked');
    alert('View full profile picture');
  };

  const handleContactClick = (type: string, value: string) => {
    console.log(\`Contact clicked: \${type} - \${value}\`);
    alert(\`\${type}: \${value}\`);
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    if (onUpdateProfile) {
      onUpdateProfile({ name, title, email, phone, location, avatar, about });
    } else {
      alert('Opening profile editor...');
    }
  };

  const handleShare = () => {
    console.log('Share clicked');
    alert('Share profile: Copy link or share on social media');
  };

  const handleStatClick = (label: string, value: string | number) => {
    console.log(\`Stat clicked: \${label} - \${value}\`);
    alert(\`\${label}: \${value}\`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        {/* Simple Profile Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Profile Picture */}
            <div className="relative group">
              <img
                src={avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition-all duration-300 ring-4 ring-blue-500 dark:ring-purple-500 ring-offset-2 dark:ring-offset-gray-50 shadow-2xl"
                onClick={handleAvatarClick}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">{name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{title}</p>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div 
                  className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => handleContactClick('Email', email)}
                >
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>
                <div 
                  className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => handleContactClick('Phone', phone)}
                >
                  <Phone className="w-4 h-4" />
                  <span>{phone}</span>
                </div>
                <div 
                  className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => handleContactClick('Location', location)}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{joinedLabel} {joinDate}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-3 justify-center sm:justify-start">
                <button
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  onClick={handleEditProfile}
                >
                  {editProfileButton}
                </button>
                <button
                  className="px-6 py-2.5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-purple-500 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-white dark:bg-gray-800"
                  onClick={handleShare}
                >
                  {shareButton}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
            <div
              className="cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 rounded-xl p-3 transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-purple-700"
              onClick={() => handleStatClick(projectsLabel, stats.projects)}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.projects}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{projectsLabel}</div>
            </div>
            <div
              className="cursor-pointer hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl p-3 transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-green-200 dark:hover:border-emerald-700"
              onClick={() => handleStatClick(followersLabel, stats.followers)}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{stats.followers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{followersLabel}</div>
            </div>
            <div
              className="cursor-pointer hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/30 dark:hover:to-yellow-900/30 rounded-xl p-3 transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-orange-200 dark:hover:border-yellow-700"
              onClick={() => handleStatClick(followingLabel, stats.following)}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">{stats.following}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{followingLabel}</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6 bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm p-6 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{aboutTitle}</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {about}
          </p>
        </div>
      </div>
    </div>
  );
}
    `,

    withSkills: `
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Award, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface UserProfileProps {
  ${dataName}?: any;
  className?: string;
  onUpdateProfile?: (profileData: any) => void;
  [key: string]: any;
}

export default function UserProfile({ ${dataName}: propData, className, onUpdateProfile }: UserProfileProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const name = ${getField('name')};
  const title = ${getField('title')};
  const avatar = ${getField('avatar')};
  const skills = ${getField('skills')};
  const experience = ${getField('experience')};
  const education = ${getField('education')};
  const followButton = ${getField('followButton')};
  const skillsTitle = ${getField('skillsTitle')};
  const experienceTitle = ${getField('experienceTitle')};
  const educationTitle = ${getField('educationTitle')};

  // Event handlers
  const handleAvatarClick = () => {
    console.log('Avatar clicked');
    alert(\`View \${name}'s profile picture\`);
  };

  const handleFollow = () => {
    console.log('Follow button clicked');
    if (onUpdateProfile) {
      onUpdateProfile({ action: 'follow', userId: userData.id });
    } else {
      alert(\`Following \${name}\`);
    }
  };

  const handleSkillClick = (skill: string) => {
    console.log(\`Skill clicked: \${skill}\`);
    alert(\`Skill: \${skill}\\nClick to see projects using this skill\`);
  };

  const handleExperienceClick = (exp: any) => {
    console.log('Experience clicked:', exp);
    alert(\`\${exp.role} at \${exp.company}\\n\${exp.period}\`);
  };

  const handleEducationClick = () => {
    console.log('Education clicked');
    alert(\`\${education.degree}\\n\${education.institution}\\n\${education.period}\`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm p-6 mb-6 hover:shadow-2xl transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-all duration-300 ring-4 ring-blue-500 dark:ring-purple-500 ring-offset-2 dark:ring-offset-gray-50 shadow-2xl"
                onClick={handleAvatarClick}
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{name}</h2>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{title}</p>
            </div>
            <button
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={handleFollow}
            >
              {followButton}
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm p-6 mb-6 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{skillsTitle}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, index: number) => {
              const gradients = [
                'from-blue-600 to-purple-600',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-yellow-500',
                'from-pink-500 to-rose-600'
              ];
              return (
                <button
                  key={index}
                  className={cn("px-4 py-2 rounded-full bg-gradient-to-r text-white font-bold cursor-pointer hover:scale-110 transition-all shadow-lg hover:shadow-xl", gradients[index % gradients.length])}
                  onClick={() => handleSkillClick(skill)}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm p-6 mb-6 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{experienceTitle}</h3>
          </div>
          <div className="space-y-4">
            {experience.map((exp: any, index: number) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 dark:border-purple-500 pl-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-r-lg p-3 transition-all hover:scale-[1.02] shadow-md hover:shadow-lg"
                onClick={() => handleExperienceClick(exp)}
              >
                <h4 className="font-bold text-gray-900 dark:text-white">{exp.role}</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{exp.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm p-6 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{educationTitle}</h3>
          </div>
          <div
            className="cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 rounded-xl p-4 transition-all hover:scale-[1.02] shadow-md hover:shadow-lg border-2 border-transparent hover:border-green-200 dark:hover:border-emerald-700"
            onClick={handleEducationClick}
          >
            <h4 className="font-bold text-gray-900 dark:text-white">{education.degree}</h4>
            <p className="text-gray-600 dark:text-gray-400 font-medium">{education.institution}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">{education.period}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    socialMedia: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Bookmark, Grid3X3, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface UserProfileProps {
  ${dataName}?: any;
  className?: string;
  onUpdateProfile?: (profileData: any) => void;
  [key: string]: any;
}

export default function UserProfile({ ${dataName}: propData, className, onUpdateProfile }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const username = ${getField('username')};
  const bio = ${getField('bio')};
  const avatar = ${getField('avatar')};
  const stats = ${getField('statsSocial')};
  const posts = ${getField('posts')};
  const postsTab = ${getField('postsTab')};
  const savedTab = ${getField('savedTab')};
  const likedTab = ${getField('likedTab')};
  const noSavedPosts = ${getField('noSavedPosts')};
  const noLikedPosts = ${getField('noLikedPosts')};
  const postsLabel = ${getField('postsLabel')};
  const followersLabel = ${getField('followersLabel')};
  const followingLabel = ${getField('followingLabel')};

  // Event handlers
  const handleAvatarClick = () => {
    console.log('Avatar clicked');
    alert(\`View @\${username}'s profile picture\`);
  };

  const handleStatClick = (label: string, value: string) => {
    console.log(\`Stat clicked: \${label} - \${value}\`);
    if (label === postsLabel) {
      alert(\`\${value} posts\\nView all posts\`);
    } else if (label === followersLabel) {
      alert(\`\${value} followers\\nView followers list\`);
    } else {
      alert(\`\${value} following\\nView following list\`);
    }
  };

  const handleTabClick = (tab: string) => {
    console.log(\`Tab clicked: \${tab}\`);
    setActiveTab(tab);
  };

  const handlePostClick = (index: number) => {
    console.log(\`Post clicked: \${index + 1}\`);
    alert(\`Opening post \${index + 1}\\nLikes, comments, and share options available\`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-4xl mx-auto", className)}>
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-all ring-4 ring-blue-500 dark:ring-purple-500 ring-offset-2 dark:ring-offset-gray-50 shadow-2xl"
                onClick={handleAvatarClick}
              />
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{username}</h1>
                <p className="text-gray-600 dark:text-gray-400">{bio}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-4 text-sm">
              <div
                className="cursor-pointer hover:scale-105 transition-all px-3 py-1.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30"
                onClick={() => handleStatClick(postsLabel, stats.posts)}
              >
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.posts}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1 font-medium">{postsLabel}</span>
              </div>
              <div
                className="cursor-pointer hover:scale-105 transition-all px-3 py-1.5 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30"
                onClick={() => handleStatClick(followersLabel, stats.followers)}
              >
                <span className="font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{stats.followers}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1 font-medium">{followersLabel}</span>
              </div>
              <div
                className="cursor-pointer hover:scale-105 transition-all px-3 py-1.5 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/30 dark:hover:to-yellow-900/30"
                onClick={() => handleStatClick(followingLabel, stats.following)}
              >
                <span className="font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">{stats.following}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1 font-medium">{followingLabel}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabClick('posts')}
              className={cn(
                "flex-1 flex items-center justify-center py-3 text-sm font-bold transition-all",
                activeTab === 'posts'
                  ? "border-t-4 border-blue-600 dark:border-purple-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              <span className={activeTab === 'posts' ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" : ""}>{postsTab}</span>
            </button>
            <button
              onClick={() => handleTabClick('saved')}
              className={cn(
                "flex-1 flex items-center justify-center py-3 text-sm font-bold transition-all",
                activeTab === 'saved'
                  ? "border-t-4 border-green-600 dark:border-emerald-600 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              <span className={activeTab === 'saved' ? "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent" : ""}>{savedTab}</span>
            </button>
            <button
              onClick={() => handleTabClick('liked')}
              className={cn(
                "flex-1 flex items-center justify-center py-3 text-sm font-bold transition-all",
                activeTab === 'liked'
                  ? "border-t-4 border-pink-600 dark:border-rose-600 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <Heart className="w-4 h-4 mr-2" />
              <span className={activeTab === 'liked' ? "bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent" : ""}>{likedTab}</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-4">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-200 dark:bg-gray-700 cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => handlePostClick(index)}
                >
                  <img src={post} alt={\`Post \${index + 1}\`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="text-center py-20">
              <Bookmark className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">{noSavedPosts}</p>
            </div>
          )}

          {activeTab === 'liked' && (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">{noLikedPosts}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `,

    statsCard: `
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Eye, ThumbsUp, MessageCircle, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface UserProfileProps {
  ${dataName}?: any;
  className?: string;
  onUpdateProfile?: (profileData: any) => void;
  [key: string]: any;
}

export default function UserProfile({ ${dataName}: propData, className, onUpdateProfile }: UserProfileProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const name = ${getField('name')};
  const title = ${getField('title')};
  const avatar = ${getField('avatar')};
  const stats = ${getField('statsCard')};
  const about = ${getField('aboutTech')};
  const editProfileButton = ${getField('editProfileButton')};
  const aboutTitle = ${getField('aboutTitle')};

  const iconMap: any = {
    Eye: Eye,
    ThumbsUp: ThumbsUp,
    MessageCircle: MessageCircle,
  };

  // Event handlers
  const handleAvatarClick = () => {
    console.log('Avatar clicked');
    alert(\`View \${name}'s profile picture\`);
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    if (onUpdateProfile) {
      onUpdateProfile({ name, title, avatar, about });
    } else {
      alert('Opening profile editor...');
    }
  };

  const handleStatClick = (stat: any) => {
    console.log('Stat card clicked:', stat);
    alert(\`\${stat.label}: \${stat.value}\\nView detailed analytics\`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-5xl mx-auto p-4 lg:p-8", className)}>
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-6 hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-all ring-4 ring-blue-500 dark:ring-purple-500 ring-offset-2 dark:ring-offset-gray-50 shadow-2xl"
                onClick={handleAvatarClick}
              />
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{name}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{title}</p>
              </div>
            </div>
            <button
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={handleEditProfile}
            >
              {editProfileButton}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat: any, index: number) => {
            const Icon = iconMap[stat.icon] || Eye;
            const gradients = [
              { bg: 'from-blue-600 to-purple-600', icon: 'from-blue-500 to-purple-500' },
              { bg: 'from-green-500 to-emerald-500', icon: 'from-green-400 to-emerald-400' },
              { bg: 'from-orange-500 to-yellow-500', icon: 'from-orange-400 to-yellow-400' }
            ];
            const gradient = gradients[index % gradients.length];
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-2xl transition-all hover:scale-105"
                onClick={() => handleStatClick(stat)}
              >
                <div className={cn("w-14 h-14 rounded-full bg-gradient-to-r flex items-center justify-center shadow-lg mb-3", gradient.bg)}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className={cn("text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent", gradient.bg)}>{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{aboutTitle}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {about}
          </p>
        </div>
      </div>
    </div>
  );
}
    `,

    teamLead: `
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Target, Rocket, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface UserProfileProps {
  ${dataName}?: any;
  className?: string;
  onUpdateProfile?: (profileData: any) => void;
  [key: string]: any;
}

export default function UserProfile({ ${dataName}: propData, className, onUpdateProfile }: UserProfileProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const name = ${getField('name')};
  const title = ${getField('title')};
  const avatar = ${getField('avatar')};
  const stats = ${getField('statsTeamLead')};
  const team = ${getField('team')};
  const projects = ${getField('projects')};
  const connectButton = ${getField('connectButton')};
  const messageButton = ${getField('messageButton')};
  const currentProjectsTitle = ${getField('currentProjectsTitle')};
  const teamMembersTitle = ${getField('teamMembersTitle')};
  const completedLabel = ${getField('completedLabel')};

  const iconMap: any = {
    Briefcase: Briefcase,
    Users: Users,
    Target: Target,
  };

  // Event handlers
  const handleAvatarClick = () => {
    console.log('Avatar clicked');
    alert(\`View \${name}'s profile picture\`);
  };

  const handleConnect = () => {
    console.log('Connect button clicked');
    alert(\`Sending connection request to \${name}\`);
  };

  const handleMessage = () => {
    console.log('Message button clicked');
    alert(\`Opening message conversation with \${name}\`);
  };

  const handleStatClick = (stat: any) => {
    console.log('Stat clicked:', stat);
    alert(\`\${stat.label}: \${stat.value}\\nView detailed information\`);
  };

  const handleProjectClick = (project: any) => {
    console.log('Project clicked:', project);
    alert(\`\${project.name}\\nStatus: \${project.status}\\nProgress: \${project.progress}%\`);
  };

  const handleTeamMemberClick = (member: any) => {
    console.log('Team member clicked:', member);
    alert(\`\${member.name}\\n\${member.role}\\nView profile\`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-6xl mx-auto p-4 lg:p-8", className)}>
        {/* Header Card */}
        <Card className="mb-6 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-6 mb-6">
              <img
                src={avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-all ring-4 ring-blue-500 dark:ring-purple-500 ring-offset-2 dark:ring-offset-gray-50 shadow-2xl"
                onClick={handleAvatarClick}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{name}</h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{title}</p>
              </div>
              <div className="flex gap-3">
                <button
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  onClick={handleConnect}
                >
                  {connectButton}
                </button>
                <button
                  className="px-6 py-2.5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-purple-500 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-white dark:bg-gray-800"
                  onClick={handleMessage}
                >
                  {messageButton}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat: any, index: number) => {
                const Icon = iconMap[stat.icon] || Briefcase;
                const gradients = [
                  'from-blue-600 to-purple-600',
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-yellow-500'
                ];
                const gradient = gradients[index % gradients.length];
                return (
                  <div
                    key={index}
                    className="text-center p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-200 dark:border-gray-700"
                    onClick={() => handleStatClick(stat)}
                  >
                    <div className={cn("w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r flex items-center justify-center shadow-lg", gradient)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={cn("text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent", gradient)}>{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Projects */}
          <Card className="dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{currentProjectsTitle}</h3>
              </div>
              <div className="space-y-4">
                {projects.map((project: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-blue-100 dark:border-blue-900"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">{project.name}</h4>
                      <button
                        className={cn(
                          "px-3 py-1 rounded-full font-bold text-sm shadow-lg",
                          project.status === 'Completed'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        )}
                      >
                        {project.status}
                      </button>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all shadow-lg"
                        style={{ width: \`\${project.progress}%\` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{project.progress}% {completedLabel}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{teamMembersTitle}</h3>
              </div>
              <div className="space-y-3">
                {team.map((member: any, index: number) => {
                  const gradients = [
                    'from-blue-600 to-purple-600',
                    'from-green-500 to-emerald-500',
                    'from-orange-500 to-yellow-500',
                    'from-pink-500 to-rose-600'
                  ];
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700"
                      onClick={() => handleTeamMemberClick(member)}
                    >
                      <div className={cn("w-11 h-11 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold shadow-lg", gradients[index % gradients.length])}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{member.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{member.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
