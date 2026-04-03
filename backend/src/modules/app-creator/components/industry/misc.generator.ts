/**
 * Miscellaneous Component Generators
 * For various industry-specific components
 */

export interface MiscOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Testimonial Slider Component
 */
export function generateTestimonialSlider(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TestimonialSliderProps {
      testimonials: Array<{
        id: string;
        content: string;
        author: string;
        role: string;
        company: string;
        avatar?: string;
        rating: number;
      }>;
    }

    const TestimonialSlider: React.FC<TestimonialSliderProps> = ({ testimonials }) => {
      const [currentIndex, setCurrentIndex] = React.useState(0);

      const next = () => setCurrentIndex((i) => (i + 1) % testimonials.length);
      const prev = () => setCurrentIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

      const testimonial = testimonials[currentIndex];

      return (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-4xl mb-4" style={{ color: '${primaryColor}' }}>"</div>
            <p className="text-xl text-gray-700 mb-6 italic">{testimonial.content}</p>
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {testimonial.avatar ? (
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {testimonial.author.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={prev} className="p-2 rounded-full border hover:bg-gray-50">←</button>
            <div className="flex gap-2 items-center">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={\`w-2 h-2 rounded-full transition-colors \${i === currentIndex ? '' : 'bg-gray-300'}\`}
                  style={{ backgroundColor: i === currentIndex ? '${primaryColor}' : undefined }}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full border hover:bg-gray-50">→</button>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Skill List Component
 */
export function generateSkillList(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SkillListProps {
      skills: Array<{
        name: string;
        level: number;
        category?: string;
        verified?: boolean;
      }>;
      editable?: boolean;
      onUpdate?: (skills: any[]) => void;
    }

    const SkillList: React.FC<SkillListProps> = ({ skills, editable, onUpdate }) => {
      const getLevelLabel = (level: number) => {
        if (level >= 90) return 'Expert';
        if (level >= 70) return 'Advanced';
        if (level >= 50) return 'Intermediate';
        if (level >= 30) return 'Beginner';
        return 'Novice';
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Skills</h3>
            {editable && (
              <button className="text-sm hover:underline" style={{ color: '${primaryColor}' }}>
                + Add Skill
              </button>
            )}
          </div>
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{skill.name}</span>
                    {skill.verified && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">✓ Verified</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{getLevelLabel(skill.level)}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: \`\${skill.level}%\`, backgroundColor: '${primaryColor}' }}
                  />
                </div>
                {skill.category && (
                  <p className="text-xs text-gray-500 mt-1">{skill.category}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Team Member Profile Component
 */
export function generateTeamMemberProfile(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TeamMemberProfileProps {
      member: {
        id: string;
        name: string;
        role: string;
        department: string;
        email: string;
        phone: string;
        avatar?: string;
        bio: string;
        skills: string[];
        projects: Array<{ name: string; role: string }>;
        socialLinks?: { linkedin?: string; twitter?: string };
      };
      onContact?: () => void;
    }

    const TeamMemberProfile: React.FC<TeamMemberProfileProps> = ({ member, onContact }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-200" style={{ background: \`linear-gradient(135deg, ${primaryColor}33 0%, ${primaryColor}11 100%)\` }} />
          <div className="p-6 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-sm overflow-hidden">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{member.name}</h1>
                <p className="text-gray-600">{member.role}</p>
                <p className="text-sm text-gray-500">{member.department}</p>
              </div>
              <button
                onClick={onContact}
                className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                Contact
              </button>
            </div>

            <p className="text-gray-600 mb-6">{member.bio}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📧 {member.email}</p>
                  <p>📱 {member.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {member.projects.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Current Projects</h3>
                <div className="space-y-2">
                  {member.projects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm">{project.name}</span>
                      <span className="text-xs text-gray-500">{project.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Values Section Component
 */
export function generateValuesSection(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ValuesSectionProps {
      values: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
      title?: string;
      subtitle?: string;
    }

    const ValuesSection: React.FC<ValuesSectionProps> = ({ values, title = 'Our Values', subtitle }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Stats Section Component
 */
export function generateStatsSection(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface StatsSectionProps {
      stats: Array<{
        value: string | number;
        label: string;
        suffix?: string;
        prefix?: string;
      }>;
      title?: string;
    }

    const StatsSection: React.FC<StatsSectionProps> = ({ stats, title }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {title && <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '${primaryColor}' }}>
                  {stat.prefix}{stat.value}{stat.suffix}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Service Features Component
 */
export function generateServiceFeatures(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ServiceFeaturesProps {
      features: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
      title?: string;
    }

    const ServiceFeatures: React.FC<ServiceFeaturesProps> = ({ features, title }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {title && <h2 className="text-xl font-bold mb-6">{title}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '${primaryColor}11' }}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Service Content Component
 */
export function generateServiceContent(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ServiceContentProps {
      service: {
        title: string;
        description: string;
        image?: string;
        benefits: string[];
        process?: Array<{ step: number; title: string; description: string }>;
      };
      onGetStarted?: () => void;
    }

    const ServiceContent: React.FC<ServiceContentProps> = ({ service, onGetStarted }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {service.image && (
            <div className="h-64 bg-gray-200">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{service.title}</h1>
            <p className="text-gray-600 mb-6">{service.description}</p>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Benefits</h3>
              <ul className="space-y-2">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span style={{ color: '${primaryColor}' }}>✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {service.process && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Our Process</h3>
                <div className="space-y-4">
                  {service.process.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: '${primaryColor}' }}
                      >
                        {step.step}
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onGetStarted}
              className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90"
              style={{ backgroundColor: '${primaryColor}' }}
            >
              Get Started
            </button>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Service CTA Component
 */
export function generateServiceCTA(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ServiceCTAProps {
      title: string;
      description: string;
      buttonText: string;
      onAction?: () => void;
      secondaryButtonText?: string;
      onSecondaryAction?: () => void;
    }

    const ServiceCTA: React.FC<ServiceCTAProps> = ({
      title,
      description,
      buttonText,
      onAction,
      secondaryButtonText,
      onSecondaryAction
    }) => {
      return (
        <div
          className="rounded-lg p-8 text-center"
          style={{ background: \`linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)\` }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">{description}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onAction}
              className="px-6 py-3 bg-white rounded-lg font-medium hover:bg-gray-100 transition-colors"
              style={{ color: '${primaryColor}' }}
            >
              {buttonText}
            </button>
            {secondaryButtonText && (
              <button
                onClick={onSecondaryAction}
                className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                {secondaryButtonText}
              </button>
            )}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Subscription Card Component
 */
export function generateSubscriptionCard(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SubscriptionCardProps {
      subscription: {
        id: string;
        name: string;
        price: number;
        interval: 'monthly' | 'yearly';
        status: 'active' | 'cancelled' | 'past_due' | 'trialing';
        currentPeriodEnd: string;
        features: string[];
        nextBillingAmount?: number;
      };
      onManage?: () => void;
      onCancel?: () => void;
    }

    const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onManage, onCancel }) => {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        cancelled: 'bg-gray-100 text-gray-800',
        past_due: 'bg-red-100 text-red-800',
        trialing: 'bg-blue-100 text-blue-800',
      };

      const statusLabels = {
        active: 'Active',
        cancelled: 'Cancelled',
        past_due: 'Past Due',
        trialing: 'Trial',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{subscription.name}</h3>
              <p className="text-gray-500">
                \${subscription.price}/{subscription.interval === 'monthly' ? 'mo' : 'yr'}
              </p>
            </div>
            <span className={\`px-3 py-1 rounded-full text-sm font-medium \${statusColors[subscription.status]}\`}>
              {statusLabels[subscription.status]}
            </span>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {subscription.status === 'active' ? 'Next billing date' : 'Ends on'}:
              <span className="font-medium ml-1">{subscription.currentPeriodEnd}</span>
            </p>
            {subscription.nextBillingAmount && (
              <p className="text-sm text-gray-600">
                Amount: <span className="font-medium">\${subscription.nextBillingAmount}</span>
              </p>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Included Features:</p>
            <ul className="space-y-1">
              {subscription.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <span style={{ color: '${primaryColor}' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onManage}
              className="flex-1 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90"
              style={{ backgroundColor: '${primaryColor}' }}
            >
              Manage Plan
            </button>
            {subscription.status === 'active' && (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Search Results Component
 */
export function generateSearchResults(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SearchResultsProps {
      query: string;
      results: Array<{
        id: string;
        title: string;
        description: string;
        url: string;
        category?: string;
        image?: string;
        relevanceScore?: number;
      }>;
      totalResults: number;
      onResultClick?: (id: string) => void;
    }

    const SearchResults: React.FC<SearchResultsProps> = ({ query, results, totalResults, onResultClick }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <p className="text-sm text-gray-600">
              {totalResults.toLocaleString()} results for "<span className="font-medium">{query}</span>"
            </p>
          </div>
          <div className="divide-y">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onResultClick?.(result.id)}
              >
                <div className="flex gap-4">
                  {result.image && (
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img src={result.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {result.category && (
                      <p className="text-xs text-gray-500 mb-1">{result.category}</p>
                    )}
                    <h3 className="font-medium hover:underline" style={{ color: '${primaryColor}' }}>
                      {result.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{result.description}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{result.url}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Shopping List Component
 */
export function generateShoppingList(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ShoppingListProps {
      items: Array<{
        id: string;
        name: string;
        quantity: number;
        unit: string;
        category: string;
        checked: boolean;
        price?: number;
      }>;
      onToggle?: (id: string) => void;
      onRemove?: (id: string) => void;
      onAdd?: () => void;
    }

    const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggle, onRemove, onAdd }) => {
      const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      const totalEstimate = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">Shopping List</h2>
              <p className="text-sm text-gray-500">{items.length} items • Est. \${totalEstimate.toFixed(2)}</p>
            </div>
            <button
              onClick={onAdd}
              className="px-3 py-1 text-sm text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: '${primaryColor}' }}
            >
              + Add Item
            </button>
          </div>
          <div className="divide-y">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{category}</h3>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggle?.(item.id)}
                        className="rounded"
                        style={{ accentColor: '${primaryColor}' }}
                      />
                      <span className={\`flex-1 \${item.checked ? 'line-through text-gray-400' : ''}\`}>
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500">{item.quantity} {item.unit}</span>
                      {item.price && (
                        <span className="text-sm text-gray-500">\${(item.price * item.quantity).toFixed(2)}</span>
                      )}
                      <button
                        onClick={() => onRemove?.(item.id)}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Reward Tiers Component
 */
export function generateRewardTiers(options: MiscOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface RewardTiersProps {
      tiers: Array<{
        id: string;
        name: string;
        pointsRequired: number;
        benefits: string[];
        icon: string;
        color: string;
      }>;
      currentPoints: number;
      currentTier: string;
    }

    const RewardTiers: React.FC<RewardTiersProps> = ({ tiers, currentPoints, currentTier }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Your Points</p>
            <p className="text-3xl font-bold" style={{ color: '${primaryColor}' }}>{currentPoints.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => {
              const isCurrentTier = tier.id === currentTier;
              const isUnlocked = currentPoints >= tier.pointsRequired;

              return (
                <div
                  key={tier.id}
                  className={\`relative rounded-lg border-2 p-4 \${isCurrentTier ? 'border-2' : 'border'}\`}
                  style={{ borderColor: isCurrentTier ? tier.color : '#E5E7EB' }}
                >
                  {isCurrentTier && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs text-white rounded-full"
                      style={{ backgroundColor: tier.color }}
                    >
                      Current
                    </span>
                  )}
                  <div className="text-center mb-3">
                    <span className="text-3xl">{tier.icon}</span>
                    <h3 className="font-semibold mt-2" style={{ color: tier.color }}>{tier.name}</h3>
                    <p className="text-sm text-gray-500">{tier.pointsRequired.toLocaleString()} pts</p>
                  </div>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                        <span style={{ color: tier.color }}>•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {!isUnlocked && (
                    <div className="mt-3 pt-3 border-t text-center">
                      <p className="text-xs text-gray-500">
                        {(tier.pointsRequired - currentPoints).toLocaleString()} pts to unlock
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  `;
}
