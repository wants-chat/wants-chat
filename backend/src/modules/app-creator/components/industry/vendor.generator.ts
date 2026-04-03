/**
 * Vendor Component Generators
 * For vendor management, marketplaces, and supplier systems
 */

export interface VendorOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Vendor Card Component
 */
export function generateVendorCard(options: VendorOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VendorCardProps {
      vendor: {
        id: string;
        name: string;
        logo?: string;
        category: string;
        rating: number;
        reviewCount: number;
        location: string;
        verified: boolean;
        productsCount: number;
        responseTime: string;
      };
      onSelect?: (id: string) => void;
    }

    const VendorCard: React.FC<VendorCardProps> = ({ vendor, onSelect }) => {
      return (
        <div
          className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect?.(vendor.id)}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🏪</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{vendor.name}</h3>
                {vendor.verified && (
                  <span className="text-blue-500" title="Verified Vendor">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{vendor.category}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{vendor.rating}</span>
                  <span className="ml-1 text-gray-400">({vendor.reviewCount})</span>
                </span>
                <span>📍 {vendor.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
            <span className="text-gray-500">{vendor.productsCount} products</span>
            <span className="text-gray-500">Response: {vendor.responseTime}</span>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Vendor Header Component
 */
export function generateVendorHeader(options: VendorOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VendorHeaderProps {
      vendor: {
        id: string;
        name: string;
        logo?: string;
        coverImage?: string;
        category: string;
        description: string;
        rating: number;
        reviewCount: number;
        location: string;
        verified: boolean;
        joinedDate: string;
        productsCount: number;
        responseRate: number;
        shipOnTime: number;
      };
      onContact?: () => void;
      onFollow?: () => void;
    }

    const VendorHeader: React.FC<VendorHeaderProps> = ({ vendor, onContact, onFollow }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-gray-100 to-gray-200 relative">
            {vendor.coverImage && (
              <img src={vendor.coverImage} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="p-6 -mt-12 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden border-4 border-white">
                {vendor.logo ? (
                  <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🏪</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{vendor.name}</h1>
                  {vendor.verified && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mb-2">{vendor.category}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 font-medium">{vendor.rating}</span>
                    <span className="ml-1 text-gray-400">({vendor.reviewCount} reviews)</span>
                  </span>
                  <span>📍 {vendor.location}</span>
                  <span>📦 {vendor.productsCount} products</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onFollow}
                  className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-50"
                >
                  Follow
                </button>
                <button
                  onClick={onContact}
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90"
                  style={{ backgroundColor: '${primaryColor}' }}
                >
                  Contact Vendor
                </button>
              </div>
            </div>

            <p className="text-gray-600 mt-4">{vendor.description}</p>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{vendor.responseRate}%</p>
                <p className="text-sm text-gray-500">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{vendor.shipOnTime}%</p>
                <p className="text-sm text-gray-500">Ships on Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{vendor.joinedDate}</p>
                <p className="text-sm text-gray-500">Member Since</p>
              </div>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Vendor List Component
 */
export function generateVendorList(options: VendorOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VendorListProps {
      vendors: Array<{
        id: string;
        name: string;
        logo?: string;
        category: string;
        rating: number;
        reviewCount: number;
        verified: boolean;
        productsCount: number;
      }>;
      onSelect?: (id: string) => void;
    }

    const VendorList: React.FC<VendorListProps> = ({ vendors, onSelect }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border divide-y">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
              onClick={() => onSelect?.(vendor.id)}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {vendor.logo ? (
                  <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🏪</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{vendor.name}</h3>
                  {vendor.verified && <span className="text-blue-500 text-sm">✓</span>}
                </div>
                <p className="text-sm text-gray-500">{vendor.category}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{vendor.rating}</span>
                  <span className="ml-1 text-gray-400">({vendor.reviewCount})</span>
                </div>
                <p className="text-sm text-gray-500">{vendor.productsCount} products</p>
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Vendor Filters Component
 */
export function generateVendorFilters(options: VendorOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VendorFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const VendorFilters: React.FC<VendorFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        category: '',
        rating: '',
        verified: false,
        location: '',
      });

      const handleChange = (key: string, value: any) => {
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
                placeholder="Search vendors..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="food">Food & Beverage</option>
                <option value="services">Services</option>
                <option value="home">Home & Garden</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleChange('rating', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleChange('verified', e.target.checked)}
                  className="rounded"
                  style={{ accentColor: '${primaryColor}' }}
                />
                <span className="text-sm">Verified Only</span>
              </label>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Supplier Profile Component
 */
export function generateSupplierProfile(options: VendorOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SupplierProfileProps {
      supplier: {
        id: string;
        name: string;
        logo?: string;
        type: string;
        contactPerson: string;
        email: string;
        phone: string;
        address: string;
        status: 'active' | 'inactive' | 'pending';
        paymentTerms: string;
        leadTime: string;
        productsSupplied: number;
        totalOrders: number;
        lastOrderDate: string;
      };
      onEdit?: () => void;
      onContact?: () => void;
    }

    const SupplierProfile: React.FC<SupplierProfileProps> = ({ supplier, onEdit, onContact }) => {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {supplier.logo ? (
                  <img src={supplier.logo} alt={supplier.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🏭</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{supplier.name}</h2>
                <p className="text-gray-500">{supplier.type}</p>
                <span className={\`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium \${statusColors[supplier.status]}\`}>
                  {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={onContact}
                className="px-3 py-2 text-white rounded-lg text-sm hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                Contact
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Products Supplied</p>
              <p className="text-xl font-bold">{supplier.productsSupplied}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl font-bold">{supplier.totalOrders}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Lead Time</p>
              <p className="text-xl font-bold">{supplier.leadTime}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Last Order</p>
              <p className="text-xl font-bold">{supplier.lastOrderDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Contact Person:</span> {supplier.contactPerson}</p>
                <p><span className="text-gray-500">Email:</span> {supplier.email}</p>
                <p><span className="text-gray-500">Phone:</span> {supplier.phone}</p>
                <p><span className="text-gray-500">Address:</span> {supplier.address}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Business Terms</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Payment Terms:</span> {supplier.paymentTerms}</p>
                <p><span className="text-gray-500">Average Lead Time:</span> {supplier.leadTime}</p>
              </div>
            </div>
          </div>
        </div>
      );
    };
  `;
}
