/**
 * Auction Component Generators
 *
 * Generates React components for auction/bidding platforms
 */

export interface AuctionOptions {
  title?: string;
  className?: string;
}

/**
 * Generates AuctionFilters component
 */
export function generateAuctionFilters(options: AuctionOptions = {}): string {
  const { title = 'Filter Auctions', className = '' } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface AuctionFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  search: string;
  category: string;
  status: string;
  priceRange: { min: number; max: number };
  sortBy: string;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'art', label: 'Art & Collectibles' },
  { value: 'jewelry', label: 'Jewelry & Watches' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'antiques', label: 'Antiques' },
  { value: 'other', label: 'Other' },
];

const statuses = [
  { value: '', label: 'All Status' },
  { value: 'live', label: 'Live Now' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'ended', label: 'Ended' },
];

const sortOptions = [
  { value: 'ending-soonest', label: 'Ending Soonest' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'most-bids', label: 'Most Bids' },
];

export default function AuctionFilters({ onFilterChange, className = '' }: AuctionFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    status: '',
    priceRange: { min: 0, max: 100000 },
    sortBy: 'ending-soonest',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 p-4 \${className}\`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search auctions..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((sort) => (
            <option key={sort.value} value={sort.value}>{sort.label}</option>
          ))}
        </select>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg"
        >
          <Filter className="w-4 h-4" />
          <span>Advanced</span>
          <ChevronDown className={\`w-4 h-4 transition-transform \${showAdvanced ? 'rotate-180' : ''}\`} />
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * Generates AuctionTimer component
 */
export function generateAuctionTimer(options: AuctionOptions = {}): string {
  const { className = '' } = options;

  return `import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface AuctionTimerProps {
  endTime: Date | string;
  onEnd?: () => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(endTime: Date): TimeLeft {
  const difference = endTime.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

export default function AuctionTimer({
  endTime,
  onEnd,
  className = '',
  showLabel = true,
  size = 'md',
}: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(new Date(endTime))
  );
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(new Date(endTime));
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !hasEnded) {
        setHasEnded(true);
        onEnd?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd, hasEnded]);

  const isEndingSoon = timeLeft.total > 0 && timeLeft.total < 60 * 60 * 1000; // Less than 1 hour
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 5 * 60 * 1000; // Less than 5 minutes

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const boxSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  if (hasEnded) {
    return (
      <div className={\`flex items-center gap-2 text-gray-500 \${sizeClasses[size]} \${className}\`}>
        <Clock className="w-4 h-4" />
        <span>Auction Ended</span>
      </div>
    );
  }

  return (
    <div className={\`\${className}\`}>
      {showLabel && (
        <div className={\`flex items-center gap-2 mb-2 \${isUrgent ? 'text-red-600' : isEndingSoon ? 'text-orange-600' : 'text-gray-600'}\`}>
          {isUrgent ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span className={\`font-medium \${sizeClasses[size]}\`}>
            {isUrgent ? 'Ending Very Soon!' : isEndingSoon ? 'Ending Soon' : 'Time Remaining'}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <div className={\`\${boxSizeClasses[size]} flex flex-col items-center justify-center bg-gray-100 rounded-lg\`}>
              <span className={\`font-bold \${sizeClasses[size]}\`}>{timeLeft.days}</span>
              <span className="text-xs text-gray-500">Days</span>
            </div>
            <span className="text-gray-400">:</span>
          </>
        )}

        <div className={\`\${boxSizeClasses[size]} flex flex-col items-center justify-center \${isUrgent ? 'bg-red-100' : isEndingSoon ? 'bg-orange-100' : 'bg-gray-100'} rounded-lg\`}>
          <span className={\`font-bold \${sizeClasses[size]} \${isUrgent ? 'text-red-600' : ''}\`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500">Hours</span>
        </div>

        <span className="text-gray-400">:</span>

        <div className={\`\${boxSizeClasses[size]} flex flex-col items-center justify-center \${isUrgent ? 'bg-red-100' : isEndingSoon ? 'bg-orange-100' : 'bg-gray-100'} rounded-lg\`}>
          <span className={\`font-bold \${sizeClasses[size]} \${isUrgent ? 'text-red-600' : ''}\`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500">Min</span>
        </div>

        <span className="text-gray-400">:</span>

        <div className={\`\${boxSizeClasses[size]} flex flex-col items-center justify-center \${isUrgent ? 'bg-red-100 animate-pulse' : isEndingSoon ? 'bg-orange-100' : 'bg-gray-100'} rounded-lg\`}>
          <span className={\`font-bold \${sizeClasses[size]} \${isUrgent ? 'text-red-600' : ''}\`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500">Sec</span>
        </div>
      </div>
    </div>
  );
}`;
}

/**
 * Generates BidForm component
 */
export function generateBidForm(options: AuctionOptions = {}): string {
  const { title = 'Place a Bid', className = '' } = options;

  return `import React, { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Check } from 'lucide-react';

interface BidFormProps {
  auctionId: string;
  currentBid: number;
  minimumBid: number;
  bidIncrement?: number;
  onBidSubmit?: (amount: number) => Promise<void>;
  className?: string;
}

export default function BidForm({
  auctionId,
  currentBid,
  minimumBid,
  bidIncrement = 10,
  onBidSubmit,
  className = '',
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState(minimumBid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const suggestedBids = [
    minimumBid,
    minimumBid + bidIncrement,
    minimumBid + bidIncrement * 2,
    minimumBid + bidIncrement * 5,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (bidAmount < minimumBid) {
      setError(\`Minimum bid is $\${minimumBid.toLocaleString()}\`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onBidSubmit?.(bidAmount);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 p-6 \${className}\`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">${title}</h3>

      {/* Current Bid Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-2xl font-bold text-gray-900">
              \${currentBid.toLocaleString()}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
      </div>

      {/* Quick Bid Buttons */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Quick Bid</p>
        <div className="grid grid-cols-4 gap-2">
          {suggestedBids.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setBidAmount(amount)}
              className={\`px-3 py-2 text-sm font-medium rounded-lg border transition-colors \${
                bidAmount === amount
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500'
              }\`}
            >
              \${amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Bid Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Maximum Bid
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={minimumBid}
              step={bidIncrement}
              className="w-full pl-10 pr-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Minimum bid: \${minimumBid.toLocaleString()}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span>Bid placed successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || bidAmount < minimumBid}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Placing Bid...
            </span>
          ) : (
            \`Place Bid: $\${bidAmount.toLocaleString()}\`
          )}
        </button>
      </form>

      {/* Terms */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        By placing a bid, you agree to the auction terms and conditions.
        All bids are binding.
      </p>
    </div>
  );
}`;
}

/**
 * Generates BidHistory component
 */
export function generateBidHistory(options: AuctionOptions = {}): string {
  const { title = 'Bid History', className = '' } = options;

  return `import React from 'react';
import { User, Clock, TrendingUp } from 'lucide-react';

interface Bid {
  id: string;
  bidder: {
    id: string;
    name: string;
    avatar?: string;
  };
  amount: number;
  timestamp: string;
  isWinning?: boolean;
}

interface BidHistoryProps {
  bids: Bid[];
  maxItems?: number;
  className?: string;
}

export default function BidHistory({ bids, maxItems = 10, className = '' }: BidHistoryProps) {
  const displayBids = bids.slice(0, maxItems);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return \`\${Math.floor(diff / 60000)}m ago\`;
    if (diff < 86400000) return \`\${Math.floor(diff / 3600000)}h ago\`;
    return date.toLocaleDateString();
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          ${title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{bids.length} total bids</p>
      </div>

      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {displayBids.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No bids yet</p>
            <p className="text-sm">Be the first to place a bid!</p>
          </div>
        ) : (
          displayBids.map((bid, index) => (
            <div
              key={bid.id}
              className={\`p-4 flex items-center gap-4 \${bid.isWinning ? 'bg-green-50' : ''}\`}
            >
              {/* Rank */}
              <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium \${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-200 text-gray-700' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-600'
              }\`}>
                {index + 1}
              </div>

              {/* Bidder Info */}
              <div className="flex items-center gap-3 flex-1">
                {bid.bidder.avatar ? (
                  <img
                    src={bid.bidder.avatar}
                    alt={bid.bidder.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{bid.bidder.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(bid.timestamp)}
                  </p>
                </div>
              </div>

              {/* Bid Amount */}
              <div className="text-right">
                <p className={\`text-lg font-bold \${bid.isWinning ? 'text-green-600' : 'text-gray-900'}\`}>
                  \${bid.amount.toLocaleString()}
                </p>
                {bid.isWinning && (
                  <span className="text-xs text-green-600 font-medium">Winning</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {bids.length > maxItems && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All {bids.length} Bids
          </button>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * Generates AuctionCard component
 */
export function generateAuctionCard(options: AuctionOptions = {}): string {
  const { className = '' } = options;

  return `import React from 'react';
import { Clock, Users, Gavel, Heart } from 'lucide-react';

interface AuctionCardProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  startingBid?: number;
  bidCount: number;
  endTime: Date | string;
  category?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

export default function AuctionCard({
  id,
  title,
  image,
  currentBid,
  startingBid,
  bidCount,
  endTime,
  category,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
  className = '',
}: AuctionCardProps) {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  const isEnded = diff <= 0;
  const isEndingSoon = diff > 0 && diff < 60 * 60 * 1000;

  const getTimeString = () => {
    if (isEnded) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return \`\${days}d \${hours}h left\`;
    if (hours > 0) return \`\${hours}h \${minutes}m left\`;
    return \`\${minutes}m left\`;
  };

  return (
    <div
      className={\`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer \${className}\`}
      onClick={() => onClick?.(id)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Category Badge */}
        {category && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
            {category}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
          className={\`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors \${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          }\`}
        >
          <Heart className={\`w-4 h-4 \${isFavorite ? 'fill-current' : ''}\`} />
        </button>

        {/* Status Badge */}
        {isEnded ? (
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
            Ended
          </span>
        ) : isEndingSoon ? (
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
            Ending Soon!
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>

        <div className="space-y-2">
          {/* Current Bid */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current Bid</span>
            <span className="text-lg font-bold text-gray-900">
              \${currentBid.toLocaleString()}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Gavel className="w-4 h-4" />
              {bidCount} bids
            </span>
            <span className={\`flex items-center gap-1 \${isEndingSoon ? 'text-red-500 font-medium' : ''}\`}>
              <Clock className="w-4 h-4" />
              {getTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}`;
}
