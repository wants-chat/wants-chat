/**
 * Member Component Generators
 * For member profiles, filters, groups, and search
 */

export interface MemberComponentsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Member Filters Component
 */
export function generateMemberFilters(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberFiltersProps {
      filters: {
        status?: string;
        memberType?: string;
        joinedAfter?: string;
        search?: string;
      };
      onChange?: (filters: any) => void;
    }

    const MemberFilters: React.FC<MemberFiltersProps> = ({ filters, onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search members..."
              value={filters.search || ''}
              onChange={(e) => onChange?.({ ...filters, search: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            />
            <select
              value={filters.status || ''}
              onChange={(e) => onChange?.({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filters.memberType || ''}
              onChange={(e) => onChange?.({ ...filters, memberType: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
            <input
              type="date"
              value={filters.joinedAfter || ''}
              onChange={(e) => onChange?.({ ...filters, joinedAfter: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            />
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Member Filters Club Component
 */
export function generateMemberFiltersClub(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberFiltersClubProps {
      filters: {
        membershipLevel?: string;
        status?: string;
        sport?: string;
        search?: string;
      };
      sports?: string[];
      onChange?: (filters: any) => void;
    }

    const MemberFiltersClub: React.FC<MemberFiltersClubProps> = ({ filters, sports = [], onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search members..."
              value={filters.search || ''}
              onChange={(e) => onChange?.({ ...filters, search: e.target.value })}
              className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg"
            />
            <select
              value={filters.membershipLevel || ''}
              onChange={(e) => onChange?.({ ...filters, membershipLevel: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Levels</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
            <select
              value={filters.sport || ''}
              onChange={(e) => onChange?.({ ...filters, sport: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Sports</option>
              {sports.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filters.status || ''}
              onChange={(e) => onChange?.({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Member Groups Component
 */
export function generateMemberGroups(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberGroupsProps {
      groups: Array<{
        id: string;
        name: string;
        memberCount: number;
        icon?: string;
        isJoined?: boolean;
      }>;
      onJoin?: (id: string) => void;
      onLeave?: (id: string) => void;
      onSelect?: (id: string) => void;
    }

    const MemberGroups: React.FC<MemberGroupsProps> = ({ groups, onJoin, onLeave, onSelect }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Groups</h3>
          </div>
          <div className="divide-y">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(group.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{group.icon || '👥'}</span>
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-gray-500">{group.memberCount} members</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); group.isJoined ? onLeave?.(group.id) : onJoin?.(group.id); }}
                  className={\`px-3 py-1 text-sm rounded-lg \${
                    group.isJoined
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'text-white hover:opacity-90'
                  }\`}
                  style={{ backgroundColor: !group.isJoined ? '${primaryColor}' : undefined }}
                >
                  {group.isJoined ? 'Leave' : 'Join'}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Member Growth Chart Component
 */
export function generateMemberGrowthChart(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberGrowthChartProps {
      data: Array<{
        month: string;
        newMembers: number;
        totalMembers: number;
        churn: number;
      }>;
    }

    const MemberGrowthChart: React.FC<MemberGrowthChartProps> = ({ data }) => {
      const maxTotal = Math.max(...data.map(d => d.totalMembers));

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold mb-4">Member Growth</h3>
          <div className="space-y-3">
            {data.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.month}</span>
                  <span className="text-gray-500">
                    +{item.newMembers} new • {item.totalMembers} total
                  </span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: \`\${(item.totalMembers / maxTotal) * 100}%\`,
                      backgroundColor: '${primaryColor}'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-bold text-lg" style={{ color: '${primaryColor}' }}>
                {data.reduce((sum, d) => sum + d.newMembers, 0)}
              </p>
              <p className="text-gray-500">Total New</p>
            </div>
            <div>
              <p className="font-bold text-lg">{data[data.length - 1]?.totalMembers || 0}</p>
              <p className="text-gray-500">Current Total</p>
            </div>
            <div>
              <p className="font-bold text-lg text-red-500">
                {data.reduce((sum, d) => sum + d.churn, 0)}
              </p>
              <p className="text-gray-500">Churned</p>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Member Profile Brewery Component
 */
export function generateMemberProfileBrewery(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberProfileBreweryProps {
      member: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        memberSince: string;
        membershipType: 'basic' | 'enthusiast' | 'connoisseur';
        favoriteStyles: string[];
        visitCount: number;
        totalSpent: number;
        lastVisit: string;
        rewards: number;
      };
      onEdit?: () => void;
    }

    const MemberProfileBrewery: React.FC<MemberProfileBreweryProps> = ({ member, onEdit }) => {
      const typeColors = {
        basic: 'bg-gray-100 text-gray-800',
        enthusiast: 'bg-amber-100 text-amber-800',
        connoisseur: 'bg-yellow-100 text-yellow-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍺</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{member.name}</h2>
                  <span className={\`px-2 py-0.5 rounded text-xs font-medium \${typeColors[member.membershipType]}\`}>
                    {member.membershipType}
                  </span>
                </div>
                <p className="text-gray-500">{member.email}</p>
                <p className="text-sm text-gray-400">Member since {member.memberSince}</p>
              </div>
              {onEdit && (
                <button onClick={onEdit} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{member.visitCount}</p>
              <p className="text-sm text-gray-500">Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">\${member.totalSpent}</p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{member.rewards}</p>
              <p className="text-sm text-gray-500">Reward Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{member.lastVisit}</p>
              <p className="text-sm text-gray-500">Last Visit</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-500 mb-2">Favorite Styles</p>
            <div className="flex flex-wrap gap-2">
              {member.favoriteStyles.map((style, i) => (
                <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm">
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Member Profile Club Component
 */
export function generateMemberProfileClub(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberProfileClubProps {
      member: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar?: string;
        memberNumber: string;
        memberSince: string;
        membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
        sports: string[];
        upcomingBookings: number;
        guestPasses: number;
        balance: number;
      };
      onEdit?: () => void;
      onAddGuest?: () => void;
    }

    const MemberProfileClub: React.FC<MemberProfileClubProps> = ({ member, onEdit, onAddGuest }) => {
      const levelColors = {
        bronze: 'bg-orange-100 text-orange-800',
        silver: 'bg-gray-200 text-gray-800',
        gold: 'bg-yellow-100 text-yellow-800',
        platinum: 'bg-purple-100 text-purple-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏌️</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{member.name}</h2>
                    <span className={\`px-2 py-0.5 rounded text-xs font-medium \${levelColors[member.membershipLevel]}\`}>
                      {member.membershipLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">#{member.memberNumber}</p>
                  <p className="text-sm text-gray-400">Member since {member.memberSince}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {onAddGuest && (
                  <button onClick={onAddGuest} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Add Guest
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                    style={{ backgroundColor: '${primaryColor}' }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{member.upcomingBookings}</p>
              <p className="text-sm text-gray-500">Upcoming Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{member.guestPasses}</p>
              <p className="text-sm text-gray-500">Guest Passes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">\${member.balance}</p>
              <p className="text-sm text-gray-500">Account Balance</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{member.sports.length}</p>
              <p className="text-sm text-gray-500">Sports</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-500 mb-2">Registered Sports</p>
            <div className="flex flex-wrap gap-2">
              {member.sports.map((sport, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{sport}</span>
              ))}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Member Profile Library Component
 */
export function generateMemberProfileLibrary(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberProfileLibraryProps {
      member: {
        id: string;
        name: string;
        email: string;
        cardNumber: string;
        avatar?: string;
        memberSince: string;
        booksCheckedOut: number;
        booksOnHold: number;
        fines: number;
        favoriteGenres: string[];
        readingHistory: Array<{ title: string; author: string; returnedDate: string }>;
      };
      onRenewCard?: () => void;
      onPayFines?: () => void;
    }

    const MemberProfileLibrary: React.FC<MemberProfileLibraryProps> = ({ member, onRenewCard, onPayFines }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{member.name}</h2>
                <p className="text-sm text-gray-500">Card: {member.cardNumber}</p>
                <p className="text-sm text-gray-400">Member since {member.memberSince}</p>
              </div>
              <div className="flex gap-2">
                {member.fines > 0 && onPayFines && (
                  <button onClick={onPayFines} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    Pay Fines (\${member.fines})
                  </button>
                )}
                {onRenewCard && (
                  <button onClick={onRenewCard} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Renew Card
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4 text-center border-b">
            <div>
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{member.booksCheckedOut}</p>
              <p className="text-sm text-gray-500">Checked Out</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{member.booksOnHold}</p>
              <p className="text-sm text-gray-500">On Hold</p>
            </div>
            <div>
              <p className={\`text-2xl font-bold \${member.fines > 0 ? 'text-red-500' : ''}\`}>
                \${member.fines.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Fines</p>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-semibold mb-3">Recent Reading History</h3>
            <div className="space-y-2">
              {member.readingHistory.slice(0, 5).map((book, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-gray-500">{book.author}</p>
                  </div>
                  <p className="text-gray-400">Returned {book.returnedDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Member Search Component
 */
export function generateMemberSearch(options: MemberComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MemberSearchProps {
      onSearch?: (query: string) => void;
      onSelect?: (member: any) => void;
      results?: Array<{
        id: string;
        name: string;
        email: string;
        avatar?: string;
        memberType: string;
      }>;
      isLoading?: boolean;
    }

    const MemberSearch: React.FC<MemberSearchProps> = ({ onSearch, onSelect, results = [], isLoading }) => {
      const [query, setQuery] = React.useState('');

      React.useEffect(() => {
        const timer = setTimeout(() => {
          if (query.length >= 2) onSearch?.(query);
        }, 300);
        return () => clearTimeout(timer);
      }, [query]);

      return (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members by name or email..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          />
          {query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-64 overflow-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : results.length > 0 ? (
                results.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => { onSelect?.(member); setQuery(''); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {member.avatar ? (
                        <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{member.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">{member.memberType}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No members found</div>
              )}
            </div>
          )}
        </div>
      );
    };
  `;
}
