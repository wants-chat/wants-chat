import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAboutPageContent = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'withTeam' | 'withTimeline' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
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
    return `/${dataSource || 'about'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'about';

  const variants = {
    standard: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Target, Users, Award, Heart, Loader2 } from 'lucide-react';

interface AboutPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AboutPageContent({ ${dataName}: propData, className }: AboutPageContentProps) {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const content = ${dataName} || {};
  const companyName = content.companyName || content.appName || content.organizationName || 'Company';
  const tagline = content.tagline || 'Building the future, together';
  const description = content.description || 'We are passionate about creating innovative solutions that make a difference in peoples lives.';
  const mission = content.mission || 'To empower individuals and businesses through technology.';
  const vision = content.vision || 'A world where technology enhances every aspect of life.';

  const values = content.values || [
    { icon: 'Heart', title: 'Customer First', description: 'Our customers are at the heart of everything we do.' },
    { icon: 'Users', title: 'Collaboration', description: 'We believe in the power of working together.' },
    { icon: 'Award', title: 'Excellence', description: 'We strive for excellence in all our endeavors.' },
    { icon: 'Target', title: 'Innovation', description: 'We continuously push the boundaries of whats possible.' }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return Heart;
      case 'Users': return Users;
      case 'Award': return Award;
      case 'Target': return Target;
      default: return Target;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white py-32 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-7xl font-extrabold mb-8 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">{companyName}</h1>
          <p className="text-4xl text-blue-100 mb-10 font-bold drop-shadow-lg">{tagline}</p>
          <p className="text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed font-medium">{description}</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100/50 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/20 p-10 rounded-3xl shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{mission}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 via-white to-purple-100/50 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/20 p-10 rounded-3xl shadow-2xl border-2 border-purple-200/50 dark:border-purple-700/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-6">Our Vision</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 mb-20 text-center drop-shadow-lg">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = getIcon(value.icon);
              return (
                <div key={index} className="group bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-rotate-1 border-2 border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-300">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base font-medium">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      {content.stats && content.stats.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {content.stats.map((stat: any, index: number) => (
                <div key={index}>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      {content.showCta !== false && (
        <section className="py-28 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-6xl font-extrabold mb-8 drop-shadow-2xl animate-pulse">{content.ctaTitle || 'Ready to Work With Us?'}</h2>
            <p className="text-3xl text-blue-100 mb-12 font-bold drop-shadow-lg">{content.ctaDescription || 'Lets create something amazing together.'}</p>
            <button className="bg-gradient-to-r from-white to-gray-100 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 px-16 py-5 rounded-2xl text-xl font-extrabold hover:from-blue-50 hover:to-purple-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-110 focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-purple-600 border-2 border-white/20 backdrop-blur-sm relative group overflow-hidden">
              <span className="relative z-10 text-blue-600 group-hover:text-purple-600 transition-colors duration-300">{content.ctaButtonText || 'Get in Touch'}</span>
              <div className="absolute inset-0 bg-white opacity-100 group-hover:opacity-90 transition-opacity"></div>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
    `,

    withTeam: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Github, Linkedin, Twitter, Mail, Loader2 } from 'lucide-react';

interface AboutPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AboutPageContent({ ${dataName}: propData, className }: AboutPageContentProps) {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const content = ${dataName} || {};
  const companyName = content.companyName || content.appName || content.organizationName || 'TechVision';
  const title = content.title || \`Meet Our Team\`;
  const description = content.description || 'We are a diverse team of passionate professionals dedicated to innovation and excellence. Together, we bring ideas to life and create solutions that make a difference.';
  const teamIntro = content.teamIntro || 'Our strength lies in our people. Each team member brings unique skills, perspectives, and passion to deliver exceptional results.';

  const teamMembers = content.teamMembers || [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      bio: 'Visionary leader with 15+ years in tech innovation. Passionate about building products that change lives.',
      social: { linkedin: '#', twitter: '#', email: 'sarah@company.com' }
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      bio: 'Tech enthusiast and architect. Expert in scalable systems and cloud infrastructure.',
      social: { github: '#', linkedin: '#', email: 'michael@company.com' }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      bio: 'Award-winning designer focused on creating intuitive and beautiful user experiences.',
      social: { linkedin: '#', twitter: '#', email: 'emily@company.com' }
    },
    {
      name: 'James Williams',
      role: 'Lead Developer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      bio: 'Full-stack developer passionate about clean code and best practices.',
      social: { github: '#', linkedin: '#', email: 'james@company.com' }
    },
    {
      name: 'Aisha Patel',
      role: 'Marketing Director',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
      bio: 'Strategic marketer with expertise in brand building and digital growth strategies.',
      social: { linkedin: '#', twitter: '#', email: 'aisha@company.com' }
    },
    {
      name: 'David Kim',
      role: 'Product Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      bio: 'Data-driven product leader focused on delivering value and driving innovation.',
      social: { linkedin: '#', twitter: '#', email: 'david@company.com' }
    }
  ];

  return (
    <div className={cn('w-full', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 text-white py-24 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-6xl font-extrabold mb-6 drop-shadow-2xl">{title}</h1>
          <p className="text-2xl text-green-50 max-w-3xl mx-auto leading-relaxed font-medium">{description}</p>
        </div>
      </section>

      {/* Team Introduction */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">{teamIntro}</p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-gray-200/50 dark:border-gray-700/50"
              >
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-green-500/20 group-hover:ring-green-500/50 transition-all duration-300">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {member.role}
                  </div>
                </div>

                {/* Info */}
                <div className="text-center mb-4 mt-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {member.bio}
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-3 mt-6">
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.email && (
                    <a
                      href={\`mailto:\${member.social.email}\`}
                      className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      {content.showJoinCta !== false && (
        <section className="py-20 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">Join Our Team</h2>
            <p className="text-2xl text-green-100 mb-10 font-medium">
              We're always looking for talented individuals to join our mission. Explore opportunities to grow with us.
            </p>
            <button className="bg-white text-green-600 px-12 py-4 rounded-xl text-lg font-bold hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              View Open Positions
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
    `,

    withTimeline: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Rocket, Users, TrendingUp, Award, Globe, Flag, Star, Loader2 } from 'lucide-react';

interface AboutPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AboutPageContent({ ${dataName}: propData, className }: AboutPageContentProps) {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const content = ${dataName} || {};
  const companyName = content.companyName || content.appName || content.organizationName || 'TechVision';
  const title = content.title || \`Our Journey\`;
  const description = content.description || 'From a small startup to a global leader, discover the milestones that shaped our story and continue to drive us forward.';

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Rocket, Users, TrendingUp, Award, Globe, Flag, Star
    };
    return icons[iconName] || Star;
  };

  const timelineItems = content.timeline || [
    {
      date: '2018',
      title: 'The Beginning',
      icon: 'Rocket',
      description: 'Founded with a vision to revolutionize the tech industry. Started in a small garage with just 3 passionate founders and one big dream.',
      highlight: true
    },
    {
      date: '2019',
      title: 'First Product Launch',
      icon: 'Sparkles',
      description: 'Released our flagship product to the market. Gained 1,000+ users in the first month and received overwhelming positive feedback.',
      stats: '1K+ Users'
    },
    {
      date: '2020',
      title: 'Team Expansion',
      icon: 'Users',
      description: 'Grew our team from 3 to 25 talented individuals. Opened our first official office and established our company culture.',
      stats: '25 Employees'
    },
    {
      date: '2021',
      title: 'Series A Funding',
      icon: 'TrendingUp',
      description: 'Secured $5M in Series A funding from leading investors. This enabled us to scale operations and accelerate product development.',
      stats: '$5M Raised'
    },
    {
      date: '2022',
      title: 'Global Expansion',
      icon: 'Globe',
      description: 'Expanded operations to 5 countries across 3 continents. Established regional offices and built a diverse, international team.',
      stats: '5 Countries'
    },
    {
      date: '2023',
      title: 'Industry Recognition',
      icon: 'Award',
      description: 'Won "Best Innovation Award" and "Startup of the Year". Our products and services recognized by industry leaders worldwide.',
      stats: '3 Major Awards'
    },
    {
      date: '2024',
      title: 'Market Leader',
      icon: 'Flag',
      description: 'Became the market leader in our segment with 100K+ active users. Launched new product lines and strategic partnerships.',
      stats: '100K+ Users',
      highlight: true
    },
    {
      date: '2025',
      title: 'The Future',
      icon: 'Star',
      description: 'Continuing to innovate and push boundaries. Focused on sustainable growth, AI integration, and expanding our global footprint.',
      future: true
    }
  ];

  return (
    <div className={cn('w-full', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white py-24 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-6xl font-extrabold mb-6 drop-shadow-2xl">{title}</h1>
          <p className="text-2xl text-orange-50 max-w-3xl mx-auto leading-relaxed font-medium">{description}</p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Central vertical line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-500 via-red-500 to-pink-500 rounded-full"></div>

            {/* Timeline items */}
            <div className="space-y-12">
              {timelineItems.map((item: any, index: number) => {
                const Icon = getIcon(item.icon);
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={index}
                    className={cn(
                      'relative flex items-center gap-8',
                      isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                    )}
                  >
                    {/* Content card */}
                    <div className={cn(
                      'flex-1 group',
                      isLeft ? 'md:text-right' : 'md:text-left'
                    )}>
                      <div className={cn(
                        'inline-block bg-gradient-to-br p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2',
                        item.highlight
                          ? 'from-orange-50 via-white to-orange-100/50 dark:from-orange-900/20 dark:via-gray-800 dark:to-orange-900/30 border-orange-400/50 dark:border-orange-600/50'
                          : item.future
                          ? 'from-purple-50 via-white to-purple-100/50 dark:from-purple-900/20 dark:via-gray-800 dark:to-purple-900/30 border-purple-400/50 dark:border-purple-600/50'
                          : 'from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 border-gray-200/50 dark:border-gray-700/50'
                      )}>
                        <div className={cn(
                          'flex items-center gap-3 mb-3',
                          isLeft ? 'md:flex-row-reverse md:justify-start' : 'md:justify-start'
                        )}>
                          <div className={cn(
                            'px-4 py-1 rounded-full text-sm font-bold',
                            item.highlight
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                              : item.future
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                          )}>
                            {item.date}
                          </div>
                          {item.stats && (
                            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                              {item.stats}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Center icon */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex">
                      <div className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-gray-900 transition-all duration-300 hover:scale-125',
                        item.highlight
                          ? 'bg-gradient-to-br from-orange-500 to-red-600'
                          : item.future
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : 'bg-gradient-to-br from-gray-600 to-gray-700'
                      )}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Mobile icon */}
                    <div className="md:hidden flex-shrink-0">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
                        item.highlight
                          ? 'bg-gradient-to-br from-orange-500 to-red-600'
                          : item.future
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : 'bg-gradient-to-br from-gray-600 to-gray-700'
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Spacer for alignment */}
                    <div className="hidden md:block flex-1"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {content.showCta !== false && (
        <section className="py-20 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">Be Part of Our Story</h2>
            <p className="text-2xl text-orange-100 mb-10 font-medium">
              Join us as we continue to innovate and shape the future of technology.
            </p>
            <button className="bg-white text-orange-600 px-12 py-4 rounded-xl text-lg font-bold hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              Start Your Journey
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.standard;
};