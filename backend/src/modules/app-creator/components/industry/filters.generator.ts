/**
 * Filter Component Generators
 * Common filter patterns for various industries
 */

export interface FiltersOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Campaign Filters Component (Marketing)
 */
export function generateCampaignFiltersMarketing(options: FiltersOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CampaignFiltersMarketingProps {
      onFilterChange?: (filters: any) => void;
    }

    const CampaignFiltersMarketing: React.FC<CampaignFiltersMarketingProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        type: '',
        channel: '',
        dateRange: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="ppc">PPC</option>
                <option value="content">Content</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={filters.channel}
                onChange={(e) => handleChange('channel', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Channels</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Case Filters Lawfirm Component
 */
export function generateCaseFiltersLawfirm(options: FiltersOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CaseFiltersLawfirmProps {
      onFilterChange?: (filters: any) => void;
    }

    const CaseFiltersLawfirm: React.FC<CaseFiltersLawfirmProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        caseType: '',
        attorney: '',
        priority: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search cases..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
              <select
                value={filters.caseType}
                onChange={(e) => handleChange('caseType', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="litigation">Litigation</option>
                <option value="corporate">Corporate</option>
                <option value="family">Family Law</option>
                <option value="criminal">Criminal</option>
                <option value="real-estate">Real Estate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attorney</label>
              <select
                value={filters.attorney}
                onChange={(e) => handleChange('attorney', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Attorneys</option>
                <option value="att-1">John Smith</option>
                <option value="att-2">Sarah Johnson</option>
                <option value="att-3">Michael Brown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Booking Filters Venue Component
 */
export function generateBookingFiltersVenue(options: FiltersOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface BookingFiltersVenueProps {
      onFilterChange?: (filters: any) => void;
    }

    const BookingFiltersVenue: React.FC<BookingFiltersVenueProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        venue: '',
        eventType: '',
        status: '',
        dateRange: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search bookings..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <select
                value={filters.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Venues</option>
                <option value="ballroom">Grand Ballroom</option>
                <option value="garden">Garden Terrace</option>
                <option value="conference">Conference Hall</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => handleChange('eventType', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="conference">Conference</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Estimate Filters Component
 */
export function generateEstimateFilters(options: FiltersOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface EstimateFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const EstimateFilters: React.FC<EstimateFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        customer: '',
        dateRange: '',
        priceRange: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search estimates..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                placeholder="Filter by customer"
                value={filters.customer}
                onChange={(e) => handleChange('customer', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Any Price</option>
                <option value="0-1000">Under $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000+">Over $10,000</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Incident Filters Component
 */
export function generateIncidentFiltersComponent(options: FiltersOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface IncidentFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const IncidentFiltersLocal: React.FC<IncidentFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        severity: '',
        type: '',
        status: '',
        assignee: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search incidents..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="security">Security</option>
                <option value="technical">Technical</option>
                <option value="operational">Operational</option>
                <option value="safety">Safety</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={filters.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                <option value="team-1">Security Team</option>
                <option value="team-2">IT Team</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Reservation Filters Component
 */
export function generateReservationFilters(options: FiltersOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ReservationFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const ReservationFilters: React.FC<ReservationFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        date: '',
        time: '',
        partySize: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="seated">Seated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <select
                value={filters.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Times</option>
                <option value="lunch">Lunch (11AM-2PM)</option>
                <option value="dinner-early">Early Dinner (5-7PM)</option>
                <option value="dinner-late">Late Dinner (7-10PM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
              <select
                value={filters.partySize}
                onChange={(e) => handleChange('partySize', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Any Size</option>
                <option value="1-2">1-2 guests</option>
                <option value="3-4">3-4 guests</option>
                <option value="5-6">5-6 guests</option>
                <option value="7+">7+ guests</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}
