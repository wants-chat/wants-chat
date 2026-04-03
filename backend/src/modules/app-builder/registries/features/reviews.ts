/**
 * Reviews Feature Definition
 *
 * This feature adds product reviews, ratings, and customer feedback
 * capabilities to applications requiring user-generated reviews.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const REVIEWS_FEATURE: FeatureDefinition = {
  id: 'reviews',
  name: 'Reviews & Ratings',
  category: 'commerce',
  description: 'Customer reviews, star ratings, and feedback management',
  icon: 'star',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'booking',
    'restaurant',
    'food-delivery',
    'hotel',
    'travel',
    'service-booking',
    'salon',
    'spa',
    'fitness',
    'healthcare',
    'online-course',
    'digital-products',
    'freelance',
    'rental',
    'real-estate',
    'automotive',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'reviews',
    'ratings',
    'review',
    'rating',
    'stars',
    'star rating',
    'feedback',
    'customer reviews',
    'product reviews',
    'testimonials',
    'rate',
    'user feedback',
    'review system',
    'write review',
    'leave review',
    'customer feedback',
    'review management',
    'verified reviews',
    'review moderation',
    'rating system',
  ],

  /** Enabled by default for included app types */
  enabledByDefault: true,

  /** User can opt-out */
  optional: true,

  // ─────────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ─────────────────────────────────────────────────────────────

  /** Other features this depends on */
  dependencies: [
    'user-auth', // Need users to write reviews
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'reviews',
      route: '/reviews',
      section: 'frontend',
      title: 'My Reviews',
      authRequired: true,
      templateId: 'reviews-page',
      components: [
        'review-list',
        'review-filters',
        'review-stats',
      ],
      layout: 'default',
    },
    {
      id: 'write-review',
      route: '/reviews/write/:itemId',
      section: 'frontend',
      title: 'Write a Review',
      authRequired: true,
      templateId: 'write-review-page',
      components: [
        'review-form',
        'rating-stars',
        'image-upload',
      ],
      layout: 'centered',
    },
    {
      id: 'edit-review',
      route: '/reviews/:reviewId/edit',
      section: 'frontend',
      title: 'Edit Review',
      authRequired: true,
      templateId: 'edit-review-page',
      components: [
        'review-form',
        'rating-stars',
        'image-upload',
      ],
      layout: 'centered',
    },
    {
      id: 'admin-reviews',
      route: '/admin/reviews',
      section: 'admin',
      title: 'Reviews Management',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-reviews-page',
      components: [
        'review-list',
        'review-filters',
        'review-moderation',
        'review-stats',
      ],
      layout: 'dashboard',
    },
    {
      id: 'admin-review-detail',
      route: '/admin/reviews/:reviewId',
      section: 'admin',
      title: 'Review Details',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-review-detail-page',
      components: [
        'review-detail',
        'review-actions',
        'reviewer-info',
        'review-response',
      ],
      layout: 'dashboard',
    },
    {
      id: 'vendor-reviews',
      route: '/vendor/reviews',
      section: 'vendor',
      title: 'Product Reviews',
      authRequired: true,
      roles: ['vendor'],
      templateId: 'vendor-reviews-page',
      components: [
        'review-list',
        'review-summary',
        'review-response',
      ],
      layout: 'dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'review-form',
    'rating-stars',
    'review-list',
    'review-summary',
    'review-card',
    'review-filters',
    'review-stats',
    'review-moderation',
    'review-detail',
    'review-actions',
    'reviewer-info',
    'review-response',
    'rating-breakdown',
    'verified-badge',
    'helpful-votes',
    'review-images',
    'average-rating',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'reviews',
      displayName: 'Reviews',
      description: 'Customer reviews with text content',
      isCore: true,
    },
    {
      name: 'ratings',
      displayName: 'Ratings',
      description: 'Star ratings for products/services',
      isCore: true,
    },
    {
      name: 'review_images',
      displayName: 'Review Images',
      description: 'Images attached to reviews',
      isCore: false,
    },
    {
      name: 'review_votes',
      displayName: 'Review Votes',
      description: 'Helpful/not helpful votes on reviews',
      isCore: false,
    },
    {
      name: 'review_responses',
      displayName: 'Review Responses',
      description: 'Business owner responses to reviews',
      isCore: false,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Public review routes
    {
      method: 'GET',
      path: '/products/:productId/reviews',
      auth: false,
      handler: 'crud',
      entity: 'reviews',
      operation: 'list',
      description: 'Get reviews for a product',
    },
    {
      method: 'GET',
      path: '/products/:productId/rating',
      auth: false,
      handler: 'aggregate',
      entity: 'ratings',
      description: 'Get average rating for a product',
    },
    {
      method: 'GET',
      path: '/reviews/:id',
      auth: false,
      handler: 'crud',
      entity: 'reviews',
      operation: 'get',
      description: 'Get review details',
    },

    // Authenticated review routes
    {
      method: 'GET',
      path: '/reviews',
      auth: true,
      handler: 'crud',
      entity: 'reviews',
      operation: 'list',
      description: 'Get user reviews',
    },
    {
      method: 'POST',
      path: '/reviews',
      auth: true,
      handler: 'crud',
      entity: 'reviews',
      operation: 'create',
      description: 'Create a new review',
    },
    {
      method: 'PUT',
      path: '/reviews/:id',
      auth: true,
      handler: 'crud',
      entity: 'reviews',
      operation: 'update',
      description: 'Update own review',
    },
    {
      method: 'DELETE',
      path: '/reviews/:id',
      auth: true,
      handler: 'crud',
      entity: 'reviews',
      operation: 'delete',
      description: 'Delete own review',
    },
    {
      method: 'POST',
      path: '/reviews/:id/vote',
      auth: true,
      handler: 'custom',
      entity: 'review_votes',
      description: 'Vote on a review (helpful/not helpful)',
    },
    {
      method: 'POST',
      path: '/reviews/:id/images',
      auth: true,
      handler: 'crud',
      entity: 'review_images',
      operation: 'create',
      description: 'Upload images for review',
    },
    {
      method: 'DELETE',
      path: '/reviews/:id/images/:imageId',
      auth: true,
      handler: 'crud',
      entity: 'review_images',
      operation: 'delete',
      description: 'Remove image from review',
    },

    // Admin review routes
    {
      method: 'GET',
      path: '/admin/reviews',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'reviews',
      operation: 'list',
      description: 'Admin: list all reviews',
    },
    {
      method: 'GET',
      path: '/admin/reviews/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'reviews',
      operation: 'get',
      description: 'Admin: get review details',
    },
    {
      method: 'PUT',
      path: '/admin/reviews/:id/approve',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'reviews',
      description: 'Admin: approve a review',
    },
    {
      method: 'PUT',
      path: '/admin/reviews/:id/reject',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'reviews',
      description: 'Admin: reject a review',
    },
    {
      method: 'DELETE',
      path: '/admin/reviews/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'reviews',
      operation: 'delete',
      description: 'Admin: delete a review',
    },
    {
      method: 'PUT',
      path: '/admin/reviews/:id/flag',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'reviews',
      description: 'Admin: flag review for moderation',
    },
    {
      method: 'GET',
      path: '/admin/reviews/flagged',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'reviews',
      description: 'Admin: get flagged reviews',
    },
    {
      method: 'GET',
      path: '/admin/reviews/stats',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'reviews',
      description: 'Admin: get review statistics',
    },

    // Vendor review routes
    {
      method: 'GET',
      path: '/vendor/reviews',
      auth: true,
      role: 'vendor',
      handler: 'crud',
      entity: 'reviews',
      operation: 'list',
      description: 'Vendor: get reviews for own products',
    },
    {
      method: 'POST',
      path: '/vendor/reviews/:id/respond',
      auth: true,
      role: 'vendor',
      handler: 'crud',
      entity: 'review_responses',
      operation: 'create',
      description: 'Vendor: respond to a review',
    },
    {
      method: 'PUT',
      path: '/vendor/reviews/:id/respond',
      auth: true,
      role: 'vendor',
      handler: 'crud',
      entity: 'review_responses',
      operation: 'update',
      description: 'Vendor: update response to a review',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'requirePurchaseForReview',
      label: 'Require Purchase for Review',
      type: 'boolean',
      default: true,
      description: 'Only allow reviews from verified purchasers',
    },
    {
      key: 'enableModerationQueue',
      label: 'Enable Moderation Queue',
      type: 'boolean',
      default: true,
      description: 'Reviews require approval before publishing',
    },
    {
      key: 'ratingScale',
      label: 'Rating Scale',
      type: 'select',
      default: '5',
      options: [
        { value: '5', label: '1-5 Stars' },
        { value: '10', label: '1-10 Points' },
        { value: 'thumbs', label: 'Thumbs Up/Down' },
      ],
      description: 'Rating scale to use',
    },
    {
      key: 'allowReviewImages',
      label: 'Allow Review Images',
      type: 'boolean',
      default: true,
      description: 'Allow customers to upload images with reviews',
    },
    {
      key: 'maxImagesPerReview',
      label: 'Max Images Per Review',
      type: 'number',
      default: 5,
      description: 'Maximum number of images per review',
    },
    {
      key: 'enableHelpfulVotes',
      label: 'Enable Helpful Votes',
      type: 'boolean',
      default: true,
      description: 'Allow users to vote reviews as helpful',
    },
    {
      key: 'allowVendorResponse',
      label: 'Allow Vendor Response',
      type: 'boolean',
      default: true,
      description: 'Allow vendors to respond to reviews',
    },
    {
      key: 'minReviewLength',
      label: 'Minimum Review Length',
      type: 'number',
      default: 20,
      description: 'Minimum characters for review text',
    },
    {
      key: 'showVerifiedBadge',
      label: 'Show Verified Purchase Badge',
      type: 'boolean',
      default: true,
      description: 'Display badge for verified purchaser reviews',
    },
    {
      key: 'enableReviewEditing',
      label: 'Enable Review Editing',
      type: 'boolean',
      default: true,
      description: 'Allow users to edit their reviews',
    },
  ],
};
