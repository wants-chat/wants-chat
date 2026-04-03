/**
 * Headers and UI Component Generators
 * For page headers, category displays, and UI elements
 */

export interface HeadersUIOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Campaign Header Component
 */
export function generateCampaignHeaderMarketing(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CampaignHeaderMarketingProps {
      campaign: {
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'completed';
        type: string;
        budget: number;
        spent: number;
        startDate: string;
        endDate: string;
        impressions: number;
        clicks: number;
        conversions: number;
      };
      onEdit?: () => void;
      onPause?: () => void;
    }

    const CampaignHeaderMarketing: React.FC<CampaignHeaderMarketingProps> = ({ campaign, onEdit, onPause }) => {
      const statusColors = {
        draft: 'bg-gray-100 text-gray-800',
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-blue-100 text-blue-800',
      };

      const ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00';
      const convRate = campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2) : '0.00';

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${statusColors[campaign.status]}\`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-500">{campaign.type} • {campaign.startDate} - {campaign.endDate}</p>
            </div>
            <div className="flex gap-2">
              {campaign.status === 'active' && (
                <button onClick={onPause} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Pause
                </button>
              )}
              <button
                onClick={onEdit}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                Edit Campaign
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>
                \${campaign.spent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">of \${campaign.budget.toLocaleString()} budget</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{campaign.impressions.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Impressions</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{campaign.clicks.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Clicks ({ctr}% CTR)</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{campaign.conversions.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Conversions ({convRate}%)</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">
                \${campaign.conversions > 0 ? (campaign.spent / campaign.conversions).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-500">Cost per Conversion</p>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Category Header Component
 */
export function generateCategoryHeader(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CategoryHeaderProps {
      category: {
        id: string;
        name: string;
        description: string;
        image?: string;
        itemCount: number;
        parentCategory?: string;
      };
      breadcrumbs?: Array<{ label: string; href: string }>;
      onEdit?: () => void;
    }

    const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category, breadcrumbs, onEdit }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {category.image && (
            <div className="h-48 bg-gray-200">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-4">
                <ol className="flex items-center gap-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <a href={crumb.href} className="text-gray-500 hover:underline">{crumb.label}</a>
                      {index < breadcrumbs.length - 1 && <span className="text-gray-400">/</span>}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
                <p className="text-gray-600 mb-2">{category.description}</p>
                <p className="text-sm text-gray-500">{category.itemCount} items</p>
              </div>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Edit Category
                </button>
              )}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Category Pills Component
 */
export function generateCategoryPills(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CategoryPillsProps {
      categories: Array<{
        id: string;
        name: string;
        count?: number;
        icon?: string;
      }>;
      selected?: string;
      onSelect?: (id: string) => void;
      showAll?: boolean;
    }

    const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, selected, onSelect, showAll = true }) => {
      return (
        <div className="flex flex-wrap gap-2">
          {showAll && (
            <button
              onClick={() => onSelect?.('')}
              className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                !selected
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }\`}
              style={{ backgroundColor: !selected ? '${primaryColor}' : undefined }}
            >
              All
            </button>
          )}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect?.(cat.id)}
              className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                selected === cat.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }\`}
              style={{ backgroundColor: selected === cat.id ? '${primaryColor}' : undefined }}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
              {cat.count !== undefined && (
                <span className="ml-1 opacity-75">({cat.count})</span>
              )}
            </button>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Channel Header Component
 */
export function generateChannelHeader(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ChannelHeaderProps {
      channel: {
        id: string;
        name: string;
        description: string;
        image?: string;
        subscribers: number;
        videos: number;
        views: number;
        isSubscribed?: boolean;
      };
      onSubscribe?: () => void;
    }

    const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel, onSubscribe }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200" />
          <div className="p-6 -mt-16">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-full bg-white shadow-md overflow-hidden border-4 border-white">
                {channel.image ? (
                  <img src={channel.image} alt={channel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
                    {channel.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 mb-2">
                <h1 className="text-2xl font-bold">{channel.name}</h1>
                <p className="text-gray-500 text-sm">
                  {channel.subscribers.toLocaleString()} subscribers • {channel.videos} videos
                </p>
              </div>
              <button
                onClick={onSubscribe}
                className={\`px-6 py-2 rounded-lg font-medium \${
                  channel.isSubscribed
                    ? 'bg-gray-200 text-gray-800'
                    : 'text-white'
                }\`}
                style={{ backgroundColor: !channel.isSubscribed ? '${primaryColor}' : undefined }}
              >
                {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            <p className="text-gray-600 mt-4">{channel.description}</p>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <span>👁️ {channel.views.toLocaleString()} total views</span>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Channel Tabs Component
 */
export function generateChannelTabs(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ChannelTabsProps {
      tabs: Array<{
        id: string;
        label: string;
        count?: number;
      }>;
      activeTab: string;
      onTabChange?: (id: string) => void;
    }

    const ChannelTabs: React.FC<ChannelTabsProps> = ({ tabs, activeTab, onTabChange }) => {
      return (
        <div className="border-b">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={\`px-4 py-3 text-sm font-medium border-b-2 transition-colors \${
                  activeTab === tab.id
                    ? 'border-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }\`}
                style={{ color: activeTab === tab.id ? '${primaryColor}' : undefined }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 text-gray-400">({tab.count})</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      );
    };
  `;
}

/**
 * Generate Class Header Component
 */
export function generateClassHeader(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ClassHeaderProps {
      classInfo: {
        id: string;
        name: string;
        instructor: string;
        schedule: string;
        room: string;
        capacity: number;
        enrolled: number;
        duration: string;
        level: string;
        description: string;
      };
      onEnroll?: () => void;
      onEdit?: () => void;
    }

    const ClassHeader: React.FC<ClassHeaderProps> = ({ classInfo, onEnroll, onEdit }) => {
      const spotsLeft = classInfo.capacity - classInfo.enrolled;

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{classInfo.name}</h1>
              <p className="text-gray-600">{classInfo.description}</p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button onClick={onEdit} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Edit
                </button>
              )}
              {onEnroll && (
                <button
                  onClick={onEnroll}
                  disabled={spotsLeft <= 0}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '${primaryColor}' }}
                >
                  {spotsLeft > 0 ? 'Enroll Now' : 'Class Full'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="font-medium">{classInfo.instructor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="font-medium">{classInfo.schedule}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Room</p>
              <p className="font-medium">{classInfo.room}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{classInfo.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <p className={\`font-medium \${spotsLeft <= 3 ? 'text-orange-600' : ''}\`}>
                {spotsLeft} spots left
              </p>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Design Stats Component
 */
export function generateDesignStats(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    const DesignStats: React.FC = () => {
      const stats = [
        { label: 'Active Projects', value: '12', icon: '📁', change: '+3 this week' },
        { label: 'Designs Completed', value: '156', icon: '🎨', change: '+24 this month' },
        { label: 'Client Revisions', value: '8', icon: '✏️', change: 'Pending' },
        { label: 'Revenue (MTD)', value: '$24,500', icon: '💰', change: '+12%' },
      ];

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '${primaryColor}' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Forum Sidebar Component
 */
export function generateForumSidebar(options: HeadersUIOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ForumSidebarProps {
      categories: Array<{
        id: string;
        name: string;
        icon: string;
        count: number;
      }>;
      recentTopics: Array<{
        id: string;
        title: string;
        replies: number;
      }>;
      selectedCategory?: string;
      onSelectCategory?: (id: string) => void;
      onSelectTopic?: (id: string) => void;
    }

    const ForumSidebar: React.FC<ForumSidebarProps> = ({
      categories,
      recentTopics,
      selectedCategory,
      onSelectCategory,
      onSelectTopic
    }) => {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Categories</h3>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory?.(cat.id)}
                  className={\`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm \${
                    selectedCategory === cat.id
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }\`}
                  style={{ backgroundColor: selectedCategory === cat.id ? '${primaryColor}' : undefined }}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </span>
                  <span className="text-xs opacity-75">{cat.count}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Recent Topics</h3>
            <div className="space-y-2">
              {recentTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic?.(topic.id)}
                  className="w-full text-left p-2 rounded hover:bg-gray-50"
                >
                  <p className="text-sm font-medium line-clamp-2">{topic.title}</p>
                  <p className="text-xs text-gray-500">{topic.replies} replies</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    };
  `;
}
