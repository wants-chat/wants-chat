import { Blueprint } from './blueprint.interface';

/**
 * Travel/Tourism Blueprint
 *
 * Defines the structure for a travel booking application:
 * - Destinations
 * - Hotels/Accommodations
 * - Flights
 * - Tours/Packages
 * - Bookings
 * - Reviews
 */
export const travelBlueprint: Blueprint = {
  appType: 'travel',
  description: 'Travel booking app with destinations, hotels, flights, and tour packages',

  coreEntities: ['destination', 'hotel', 'flight', 'tour', 'booking', 'review', 'traveler'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Home/Landing
    {
      path: '/',
      name: 'Home',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'Discover Your Next Adventure',
            subtitle: 'Book flights, hotels, and tours to amazing destinations worldwide',
            primaryCTA: 'Search Destinations',
            primaryCTALink: '/destinations',
            secondaryCTA: 'View Deals',
            secondaryCTALink: '/deals',
          },
        },
        {
          id: 'search',
          component: 'travel-search',
          position: 'main',
        },
        {
          id: 'featured-destinations',
          component: 'destination-grid',
          entity: 'destination',
          position: 'main',
          props: {
            title: 'Popular Destinations',
            limit: 6,
            featured: true,
          },
        },
        {
          id: 'featured-tours',
          component: 'tour-grid',
          entity: 'tour',
          position: 'main',
          props: {
            title: 'Top Tour Packages',
            limit: 4,
            featured: true,
          },
        },
      ],
    },
    // Destinations
    {
      path: '/destinations',
      name: 'Destinations',
      layout: 'two-column',
      sections: [
        {
          id: 'destination-filters',
          component: 'destination-filters',
          position: 'sidebar',
        },
        {
          id: 'destination-grid',
          component: 'destination-grid',
          entity: 'destination',
          position: 'main',
        },
      ],
    },
    // Destination Detail
    {
      path: '/destinations/:id',
      name: 'Destination Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'destination-header',
          component: 'destination-header',
          entity: 'destination',
          position: 'main',
        },
        {
          id: 'destination-hotels',
          component: 'hotel-grid',
          entity: 'hotel',
          position: 'main',
          props: {
            title: 'Hotels in this Destination',
          },
        },
        {
          id: 'destination-tours',
          component: 'tour-grid',
          entity: 'tour',
          position: 'main',
          props: {
            title: 'Tours & Activities',
          },
        },
      ],
    },
    // Hotels
    {
      path: '/hotels',
      name: 'Hotels',
      layout: 'two-column',
      sections: [
        {
          id: 'hotel-filters',
          component: 'hotel-filters',
          position: 'sidebar',
        },
        {
          id: 'hotel-grid',
          component: 'hotel-grid',
          entity: 'hotel',
          position: 'main',
        },
      ],
    },
    // Hotel Detail
    {
      path: '/hotels/:id',
      name: 'Hotel Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'hotel-detail',
          component: 'hotel-detail',
          entity: 'hotel',
          position: 'main',
        },
        {
          id: 'room-selector',
          component: 'room-selector',
          position: 'main',
        },
        {
          id: 'hotel-reviews',
          component: 'review-list',
          entity: 'review',
          position: 'main',
          props: {
            title: 'Guest Reviews',
          },
        },
      ],
    },
    // Flights
    {
      path: '/flights',
      name: 'Flights',
      layout: 'single-column',
      sections: [
        {
          id: 'flight-search',
          component: 'flight-search',
          position: 'main',
        },
        {
          id: 'flight-results',
          component: 'flight-list',
          entity: 'flight',
          position: 'main',
        },
      ],
    },
    // Tours
    {
      path: '/tours',
      name: 'Tours',
      layout: 'two-column',
      sections: [
        {
          id: 'tour-filters',
          component: 'tour-filters',
          position: 'sidebar',
        },
        {
          id: 'tour-grid',
          component: 'tour-grid',
          entity: 'tour',
          position: 'main',
        },
      ],
    },
    // Tour Detail
    {
      path: '/tours/:id',
      name: 'Tour Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'tour-detail',
          component: 'tour-detail',
          entity: 'tour',
          position: 'main',
        },
        {
          id: 'tour-itinerary',
          component: 'tour-itinerary',
          position: 'main',
        },
        {
          id: 'tour-booking',
          component: 'tour-booking-form',
          position: 'main',
        },
      ],
    },
    // User Dashboard
    {
      path: '/dashboard',
      name: 'My Trips',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'My Trips', path: '/dashboard', icon: 'Plane' },
              { label: 'Bookings', path: '/dashboard/bookings', icon: 'Calendar' },
              { label: 'Saved', path: '/dashboard/saved', icon: 'Heart' },
              { label: 'Reviews', path: '/dashboard/reviews', icon: 'Star' },
              { label: 'Profile', path: '/dashboard/profile', icon: 'User' },
            ],
          },
        },
        {
          id: 'upcoming-trips',
          component: 'booking-list',
          entity: 'booking',
          position: 'main',
          props: {
            title: 'Upcoming Trips',
            status: 'upcoming',
          },
        },
        {
          id: 'past-trips',
          component: 'booking-list',
          entity: 'booking',
          position: 'main',
          props: {
            title: 'Past Trips',
            status: 'completed',
          },
        },
      ],
    },
    // Bookings
    {
      path: '/dashboard/bookings',
      name: 'My Bookings',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'bookings-list',
          component: 'booking-list',
          entity: 'booking',
          position: 'main',
          props: {
            title: 'All Bookings',
          },
        },
      ],
    },
    // Booking Detail
    {
      path: '/dashboard/bookings/:id',
      name: 'Booking Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'booking-detail',
          component: 'booking-detail',
          entity: 'booking',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Destinations
    { method: 'GET', path: '/destinations', entity: 'destination', operation: 'list' },
    { method: 'GET', path: '/destinations/:id', entity: 'destination', operation: 'get' },
    { method: 'GET', path: '/destinations/:id/hotels', entity: 'hotel', operation: 'list' },
    { method: 'GET', path: '/destinations/:id/tours', entity: 'tour', operation: 'list' },

    // Hotels
    { method: 'GET', path: '/hotels', entity: 'hotel', operation: 'list' },
    { method: 'GET', path: '/hotels/:id', entity: 'hotel', operation: 'get' },
    { method: 'GET', path: '/hotels/:id/rooms', entity: 'hotel', operation: 'custom' },
    { method: 'GET', path: '/hotels/:id/reviews', entity: 'review', operation: 'list' },

    // Flights
    { method: 'GET', path: '/flights/search', entity: 'flight', operation: 'list' },
    { method: 'GET', path: '/flights/:id', entity: 'flight', operation: 'get' },

    // Tours
    { method: 'GET', path: '/tours', entity: 'tour', operation: 'list' },
    { method: 'GET', path: '/tours/:id', entity: 'tour', operation: 'get' },

    // Bookings
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/bookings/:id', entity: 'booking', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/bookings/:id/cancel', entity: 'booking', operation: 'update', requiresAuth: true },

    // Reviews
    { method: 'POST', path: '/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    destination: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'country', type: 'string', required: true },
        { name: 'city', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'gallery', type: 'json' },
        { name: 'highlights', type: 'json' },
        { name: 'best_time_to_visit', type: 'string' },
        { name: 'average_temperature', type: 'json' },
        { name: 'currency', type: 'string' },
        { name: 'language', type: 'string' },
        { name: 'timezone', type: 'string' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'hotel' },
        { type: 'hasMany', target: 'tour' },
      ],
    },
    hotel: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'address', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'latitude', type: 'decimal' },
        { name: 'longitude', type: 'decimal' },
        { name: 'star_rating', type: 'integer' },
        { name: 'price_per_night', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'gallery', type: 'json' },
        { name: 'amenities', type: 'json' },
        { name: 'room_types', type: 'json' },
        { name: 'check_in_time', type: 'string' },
        { name: 'check_out_time', type: 'string' },
        { name: 'cancellation_policy', type: 'text' },
        { name: 'rating', type: 'decimal' },
        { name: 'review_count', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'destination' },
        { type: 'hasMany', target: 'review' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    flight: {
      defaultFields: [
        { name: 'airline', type: 'string', required: true },
        { name: 'flight_number', type: 'string', required: true },
        { name: 'departure_airport', type: 'string', required: true },
        { name: 'arrival_airport', type: 'string', required: true },
        { name: 'departure_time', type: 'datetime', required: true },
        { name: 'arrival_time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'class', type: 'enum' },
        { name: 'stops', type: 'integer' },
        { name: 'layover_info', type: 'json' },
        { name: 'baggage_allowance', type: 'json' },
        { name: 'seats_available', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    tour: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration_days', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'max_participants', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'image_url', type: 'image' },
        { name: 'gallery', type: 'json' },
        { name: 'itinerary', type: 'json' },
        { name: 'inclusions', type: 'json' },
        { name: 'exclusions', type: 'json' },
        { name: 'meeting_point', type: 'string' },
        { name: 'start_dates', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'review_count', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'destination' },
        { type: 'hasMany', target: 'review' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_type', type: 'enum', required: true },
        { name: 'booking_reference', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'check_in_date', type: 'date' },
        { name: 'check_out_date', type: 'date' },
        { name: 'guests', type: 'integer' },
        { name: 'total_price', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'special_requests', type: 'text' },
        { name: 'traveler_info', type: 'json' },
        { name: 'confirmation_sent', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'hotel' },
        { type: 'belongsTo', target: 'flight' },
        { type: 'belongsTo', target: 'tour' },
      ],
    },
    review: {
      defaultFields: [
        { name: 'rating', type: 'integer', required: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'text', required: true },
        { name: 'pros', type: 'json' },
        { name: 'cons', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'trip_type', type: 'enum' },
        { name: 'visit_date', type: 'date' },
        { name: 'helpful_count', type: 'integer' },
        { name: 'is_verified', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'hotel' },
        { type: 'belongsTo', target: 'tour' },
      ],
    },
    traveler: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'passport_number', type: 'string' },
        { name: 'passport_expiry', type: 'date' },
        { name: 'nationality', type: 'string' },
        { name: 'dietary_requirements', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default travelBlueprint;
