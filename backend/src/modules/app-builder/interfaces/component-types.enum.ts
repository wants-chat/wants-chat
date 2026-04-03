/**
 * Component Type Enum
 *
 * Comprehensive enum of all 313+ supported React component types.
 * This ensures type safety between:
 * - App Type Catalogs (app-types.catalog.ts)
 * - Component Generator Service (component-generator.service.ts)
 * - Organized Component Generators (ui/react/**)
 */

export enum ComponentType {
  // ============================================================================
  // DATA DISPLAY & TABLES
  // ============================================================================
  DATA_TABLE = 'data-table',
  TABLE = 'table',
  DETAIL_VIEW = 'detail-view',
  ENTITY_DETAIL_WITH_HEADER = 'entity-detail-with-header',
  PRODUCT_LIST_VIEW = 'product-list-view',
  TRANSACTION_HISTORY_TABLE = 'transaction-history-table',
  USER_MANAGEMENT_TABLE = 'user-management-table',
  ORDER_HISTORY_LIST = 'order-history-list',

  // ============================================================================
  // FORMS & INPUTS
  // ============================================================================
  FORM = 'form',
  FORM_COMPONENTS = 'form-components',
  LOGIN_FORM = 'login-form',
  REGISTER_FORM = 'register-form',
  CONTACT_FORM = 'contact-form',
  BASIC_CONTACT_FORM = 'basic-contact-form',
  FEEDBACK_FORM = 'feedback-form',
  SURVEY_FORM = 'survey-form',
  APPLICATION_FORM = 'application-form',
  BOOKING_RESERVATION_FORM = 'booking-reservation-form',
  CHECKOUT_FORM = 'checkout-form',
  CREDIT_CARD_FORM = 'credit-card-form',
  SHIPPING_ADDRESS_FORM = 'shipping-address-form',
  PASSWORD_CHANGE_FORM = 'password-change-form',
  PROFILE_EDIT_FORM = 'profile-edit-form',
  RESET_PASSWORD_FORM = 'reset-password-form',
  FORGOT_PASSWORD_FORM = 'forgot-password-form',
  WRITE_REVIEW_FORM = 'write-review-form',
  SUPPORT_TICKET_FORM = 'support-ticket-form',
  COMMENT_FORM = 'comment-form',
  COMMENT_REPLY_FORM = 'comment-reply-form',
  FORUM_POST_EDITOR = 'forum-post-editor',
  NEWSLETTER_SIGNUP = 'newsletter-signup',
  WIZARD_FORM = 'wizard-form',
  MULTI_COLUMN_FORM = 'multi-column-form',
  INLINE_FORM = 'inline-form',
  REGISTRATION_MULTI_STEP = 'registration-multi-step',
  VERIFY_EMAIL_FORM = 'verify-email-form',

  // Form Fields
  FORM_FIELD_EMAIL = 'form-field-email',
  FORM_FIELD_PASSWORD = 'form-field-password',
  FORM_FIELD_TEXT = 'form-field-text',
  INPUT = 'input',
  TEXTAREA = 'textarea',
  BUTTON = 'button',
  LABEL = 'label',

  // Advanced Form Inputs
  DATE_PICKER_SINGLE = 'date-picker-single',
  DATE_PICKER_RANGE = 'date-picker-range',
  DATETIME_PICKER = 'datetime-picker',
  TIME_PICKER = 'time-picker',
  COLOR_PICKER = 'color-picker',
  FILE_UPLOAD_SINGLE = 'file-upload-single',
  FILE_UPLOAD_MULTIPLE = 'file-upload-multiple',
  DRAG_DROP_UPLOADER = 'drag-drop-uploader',
  IMAGE_UPLOAD_PREVIEW = 'image-upload-preview',
  MEDIA_UPLOAD_PREVIEW = 'media-upload-preview',
  AUTOCOMPLETE_INPUT = 'autocomplete-input',
  ADDRESS_AUTOCOMPLETE = 'address-autocomplete',
  PHONE_NUMBER_INPUT = 'phone-number-input',
  CREDIT_CARD_INPUT = 'credit-card-input',
  CURRENCY_SELECTOR = 'currency-selector',
  LANGUAGE_SELECTOR = 'language-selector',
  SHIPPING_METHOD_SELECTOR = 'shipping-method-selector',
  SIZE_VARIANT_SELECTOR = 'size-variant-selector',
  RATING_INPUT_STARS = 'rating-input-stars',
  RATING_INPUT_NUMBERS = 'rating-input-numbers',
  SLIDER_RANGE = 'slider-range',
  PRICE_RANGE_SLIDER = 'price-range-slider',
  TAG_INPUT = 'tag-input',
  EMOJI_PICKER = 'emoji-picker',
  RICH_TEXT_EDITOR = 'rich-text-editor',
  MARKDOWN_EDITOR = 'markdown-editor',
  CODE_EDITOR = 'code-editor',
  SIGNATURE_PAD = 'signature-pad',
  SIGNATURE_PAD_DIGITAL = 'signature-pad-digital',
  PROMO_CODE_INPUT = 'promo-code-input',
  CAPTCHA_INTEGRATION = 'captcha-integration',
  FORM_PROGRESS_INDICATOR = 'form-progress-indicator',
  FORM_VALIDATION_MESSAGES = 'form-validation-messages',
  BULK_ACTIONS_TOOLBAR = 'bulk-actions-toolbar',

  // ============================================================================
  // CHARTS & ANALYTICS
  // ============================================================================
  CHART = 'chart',
  CHART_WIDGET = 'chart-widget',
  DATA_VIZ_LINE_CHART = 'data-viz-line-chart',
  DATA_VIZ_BAR_CHART = 'data-viz-bar-chart',
  DATA_VIZ_PIE_CHART = 'data-viz-pie-chart',
  DATA_VIZ_AREA_CHART = 'data-viz-area-chart',
  COMPARISON_CHART = 'comparison-chart',
  ANALYTICS_CARD = 'analytics-cards',
  ANALYTICS_OVERVIEW_CARDS = 'analytics-overview-cards',
  KPI_CARD = 'kpi-card',
  STATS_WIDGET = 'stats-widget',
  STAT_CARD = 'stat-card',
  STATISTICS_CARDS = 'statistics-cards',
  STATISTICS_NUMBERS_SECTION = 'statistics-numbers-section',
  DASHBOARD = 'dashboard',
  ACTIVITY_FEED_DASHBOARD = 'activity-feed-dashboard',
  BILLING_DASHBOARD = 'billing-dashboard',

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  NAVBAR = 'navbar',
  HEADER_STICKY = 'header-sticky',
  HEADER_TRANSPARENT = 'header-transparent',
  HEADER_MEGA_MENU = 'header-mega-menu',
  FOOTER = 'footer',
  FOOTER_MINIMAL = 'footer-minimal',
  FOOTER_MULTI_COLUMN = 'footer-multi-column',
  SIDEBAR = 'sidebar',
  SIDEBAR_NAVIGATION = 'sidebar-navigation',
  BREADCRUMB_NAVIGATION = 'breadcrumb-navigation',
  PAGINATION = 'pagination',
  TABS_NAVIGATION = 'tabs-navigation',
  HAMBURGER_MENU = 'hamburger-menu',
  DROPDOWN_MENU = 'dropdown-menu',
  MEGA_MENU_DROPDOWN = 'mega-menu-dropdown',
  MOBILE_BOTTOM_NAV = 'mobile-bottom-nav',
  ACCORDION_MENU = 'accordion-menu',
  ACCORDION = 'accordion',

  // ============================================================================
  // E-COMMERCE
  // ============================================================================
  PRODUCT_CARD = 'product-card',
  PRODUCT_CARD_COMPACT = 'product-card-compact',
  PRODUCT_CARD_DETAILED = 'product-card-detailed',
  PRODUCT_GRID = 'product-grid',
  PRODUCT_GRID_TWO_COLUMN = 'product-grid-two-column',
  PRODUCT_GRID_THREE_COLUMN = 'product-grid-three-column',
  PRODUCT_GRID_FOUR_COLUMN = 'product-grid-four-column',
  PRODUCT_DETAIL_PAGE = 'product-detail-page',
  JOB_DETAIL_PAGE = 'job-detail-page',
  COMPANY_CARD_GRID = 'company-card-grid',
  COMPANY_DETAIL_PAGE = 'company-detail-page',
  PRODUCT_IMAGE_GALLERY = 'product-image-gallery',
  PRODUCT_CAROUSEL = 'product-carousel',
  PRODUCT_FILTER = 'product-filter',
  PRODUCT_FILTER_SIDEBAR = 'product-filter-sidebar',
  PRODUCT_COMPARISON_TABLE = 'product-comparison-table',
  PRODUCT_QUICK_VIEW = 'product-quick-view',
  PRODUCT_REVIEWS_LIST = 'product-reviews-list',
  PRODUCT_CONFIGURATOR = 'product-configurator',
  PRODUCT_360_VIEWER = 'product-360-viewer',
  PRODUCT_3D_VIEWER = 'product-3d-viewer',
  AR_PREVIEW_INTERFACE = 'ar-preview-interface',
  SHOPPING_CART = 'shopping-cart',
  CART_FULL_PAGE = 'cart-full-page',
  CART_MINI_DROPDOWN = 'cart-mini-dropdown',
  CART_SUMMARY_SIDEBAR = 'cart-summary-sidebar',
  CART_ITEM_ROW = 'cart-item-row',
  EMPTY_CART_STATE = 'empty-cart-state',
  CHECKOUT_STEPS = 'checkout-steps',
  ORDER_SUMMARY = 'order-summary',
  ORDER_CONFIRMATION = 'order-confirmation',
  ORDER_TRACKING = 'order-tracking',
  ORDER_DETAILS_VIEW = 'order-details-view',
  ORDER_REVIEW = 'order-review',
  WISHLIST = 'wishlist',
  RECENTLY_VIEWED = 'recently-viewed',
  RELATED_PRODUCTS_SECTION = 'related-products-section',
  INVENTORY_STATUS = 'inventory-status',
  PRICING_TABLE_TWO = 'pricing-table-two',
  PRICING_TABLE_THREE = 'pricing-table-three',
  PRICING_TABLE_MULTI = 'pricing-table-multi',
  PAYMENT_METHOD = 'payment-method',
  PAYMENT_HISTORY = 'payment-history',
  INVOICE_DISPLAY = 'invoice-display',
  RECEIPT_GENERATOR = 'receipt-generator',
  REVIEW_SUMMARY = 'review-summary',
  CUSTOMER_REVIEWS_CAROUSEL = 'customer-reviews-carousel',
  TRUST_BADGES_SECTION = 'trust-badges-section',

  // ============================================================================
  // FOOD & RESTAURANT
  // ============================================================================
  RESTAURANT_DETAIL_HEADER = 'restaurant-detail-header',

  // ============================================================================
  // BLOG & CONTENT
  // ============================================================================
  BLOG_LIST = 'blog-list',
  BLOG_GRID = 'blog-grid',
  BLOG_GRID_LAYOUT = 'blog-grid-layout',
  BLOG_LIST_LAYOUT = 'blog-list-layout',
  BLOG_MASONRY_LAYOUT = 'blog-masonry-layout',
  BLOG_POST_CONTENT = 'blog-post-content',
  BLOG_POST_HEADER = 'blog-post-header',
  DETAIL_PAGE_HEADER = 'detail-page-header',
  BLOG_CARD = 'blog-card',
  FEATURED_BLOG_POST = 'featured-blog-post',
  BLOG_SIDEBAR = 'blog-sidebar',
  BLOG_TABLE_OF_CONTENTS = 'blog-table-of-contents',
  BLOG_SEARCH_BAR = 'blog-search-bar',
  AUTHOR_BIO = 'author-bio',
  RELATED_ARTICLES = 'related-articles',
  ARTICLE_PAGINATION = 'article-pagination',
  CATEGORIES_WIDGET = 'categories-widget',
  TAG_CLOUD_WIDGET = 'tag-cloud-widget',
  POPULAR_POSTS_WIDGET = 'popular-posts-widget',
  READING_PROGRESS_BAR = 'reading-progress-bar',
  COMMENT_SECTION = 'comment-section',
  COMMENT_THREAD = 'comment-thread',
  ARCHIVE_WIDGET = 'archive-widget',

  // ============================================================================
  // SOCIAL MEDIA
  // ============================================================================
  POST_COMPOSER = 'post-composer',
  SOCIAL_POST_CARD = 'social-post-card',
  SOCIAL_MEDIA_FEED = 'social-media-feed',
  ACTIVITY_FEED = 'activity-feed',
  ACTIVITY_TIMELINE_SOCIAL = 'activity-timeline-social',
  LIKE_REACTION_BUTTONS = 'like-reaction-buttons',
  SHARE_BUTTONS = 'share-buttons',
  SHARE_MODAL_SOCIAL = 'share-modal-social',
  FOLLOW_UNFOLLOW_BUTTON = 'follow-unfollow-button',
  FRIEND_CONNECTION_LIST = 'friend-connection-list',
  NOTIFICATION_DROPDOWN_SOCIAL = 'notification-dropdown-social',
  DIRECT_MESSAGING_LIST = 'direct-messaging-list',
  DIRECT_MESSAGING_THREAD = 'direct-messaging-thread',
  GROUP_CHAT_INTERFACE = 'group-chat-interface',
  MENTIONS_TAGS_SYSTEM = 'mentions-tags-system',
  HASHTAG_DISPLAY = 'hashtag-display',

  // ============================================================================
  // USER & PROFILE
  // ============================================================================
  USER_PROFILE = 'user-profile',
  USER_PROFILE_VIEW = 'user-profile-view',
  RESUME_MANAGER = 'resume-manager',
  USER_PROFILE_CARD_MINI = 'user-profile-card-mini',
  PROFILE_CARD = 'profile-card',
  ACCOUNT_SETTINGS = 'account-settings',
  AVATAR_UPLOAD = 'avatar-upload',
  TEAM_MEMBERS_GRID = 'team-members-grid',
  ROLE_MANAGEMENT = 'role-management',
  API_KEY_MANAGEMENT = 'api-key-management',
  USAGE_METRICS_DISPLAY = 'usage-metrics-display',
  VERSION_HISTORY = 'version-history',
  SETTINGS_PANEL_ADMIN = 'settings-panel-admin',
  SYSTEM_NOTIFICATIONS_USER = 'system-notifications-user',
  DELETE_ACCOUNT_CONFIRMATION = 'delete-account-confirmation',

  // ============================================================================
  // AUTH & SECURITY
  // ============================================================================
  LOGIN_MODAL = 'login-modal',
  SOCIAL_LOGIN = 'social-login',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  TWO_FACTOR_AUTH = 'two-factor-auth',
  SESSION_TIMEOUT_WARNING = 'session-timeout-warning',
  ACCESS_DENIED_PAGE = 'access-denied-page',
  AGE_VERIFICATION_MODAL = 'age-verification-modal',

  // ============================================================================
  // MODALS & DIALOGS
  // ============================================================================
  MODAL_DIALOG = 'modal-dialog',
  CONFIRMATION_DIALOG = 'confirmation-dialog',
  LIGHTBOX_MODAL_VIEWER = 'lightbox-modal-viewer',
  EXIT_INTENT_POPUP = 'exit-intent-popup',

  // ============================================================================
  // NOTIFICATIONS & ALERTS
  // ============================================================================
  TOAST_NOTIFICATION = 'toast-notification',
  NOTIFICATION_LIST = 'notification-list',
  NOTIFICATION_CENTER_PANEL = 'notification-center-panel',
  ALERT_BANNER = 'alert-banner',
  ANNOUNCEMENT_BAR = 'announcement-bar',
  SYSTEM_NOTIFICATIONS = 'system-notifications',
  PUSH_NOTIFICATION_PROMPT = 'push-notification-prompt',

  // ============================================================================
  // MEDIA
  // ============================================================================
  IMAGE_GALLERY_GRID = 'image-gallery-grid',
  IMAGE_GALLERY_MASONRY = 'image-gallery-masonry',
  THUMBNAIL_GALLERY = 'thumbnail-gallery',
  IMAGE_ZOOM_HOVER = 'image-zoom-hover',
  IMAGE_ZOOM_CLICK = 'image-zoom-click',
  BEFORE_AFTER_SLIDER = 'before-after-slider',
  MEDIA_CAROUSEL = 'media-carousel',
  VIDEO_PLAYER_EMBEDDED = 'video-player-embedded',
  VIDEO_PLAYER_CUSTOM = 'video-player-custom',
  VIDEO_THUMBNAIL_GRID = 'video-thumbnail-grid',
  AUDIO_PLAYER = 'audio-player',
  TRACK_DETAIL_PAGE = 'track-detail-page',
  PLAYLIST_INTERFACE = 'playlist-interface',

  // ============================================================================
  // EDUCATION & LEARNING
  // ============================================================================
  COURSE_MODULES_LIST = 'course-modules-list',

  // ============================================================================
  // FITNESS & GYM
  // ============================================================================
  TRAINER_GRID = 'trainer-grid',
  TRAINER_DETAIL_VIEW = 'trainer-detail-view',
  CLASS_DETAIL_VIEW = 'class-detail-view',

  // ============================================================================
  // CALENDAR & EVENTS
  // ============================================================================
  CALENDAR = 'calendar',
  CALENDAR_EVENT = 'calendar-event',
  CLASS_SCHEDULE_GRID = 'class-schedule-grid',
  COUNTDOWN_TIMER_EVENT = 'countdown-timer-event',
  COUNTDOWN_TIMER_OFFER = 'countdown-timer-offer',

  // ============================================================================
  // EVENT TICKETING
  // ============================================================================
  EVENT_GRID = 'event-grid',
  EVENT_CARD = 'event-card',
  EVENT_DETAIL_PAGE = 'event-detail-page',
  TICKET_SELECTOR = 'ticket-selector',
  TICKET_LIST = 'ticket-list',
  TICKET_DETAIL_VIEW = 'ticket-detail-view',
  TICKET_CARD = 'ticket-card',
  QR_SCANNER = 'qr-scanner',

  // ============================================================================
  // HELP & SUPPORT
  // ============================================================================
  HELP_CENTER_HOME = 'help-center-home',
  HELP_ARTICLE_PAGE = 'help-article-page',
  ARTICLE_SEARCH_HELP = 'article-search-help',
  FAQ_ACCORDION_SIMPLE = 'faq-accordion-simple',
  FAQ_ACCORDION_CATEGORIZED = 'faq-accordion-categorized',
  FAQ_SEARCH = 'faq-search',
  KNOWLEDGE_BASE_CATEGORIES = 'knowledge-base-categories',
  DOCUMENTATION_VIEWER = 'documentation-viewer',
  VIDEO_TUTORIALS_GALLERY = 'video-tutorials-gallery',
  TUTORIAL_WALKTHROUGH = 'tutorial-walkthrough',
  GUIDED_TOUR_WALKTHROUGH = 'guided-tour-walkthrough',
  TROUBLESHOOTING_WIZARD = 'troubleshooting-wizard',
  SUPPORT_TICKET_LIST_HELP = 'support-ticket-list-help',
  SUPPORT_TICKET_DETAIL_HELP = 'support-ticket-detail-help',
  LIVE_CHAT_WIDGET_HELP = 'live-chat-widget-help',
  CHATBOT_SUPPORT = 'chatbot-support',
  REVIEW_HELPFUL_VOTING = 'review-helpful-voting',
  HELP_SIDEBAR_CONTEXTUAL = 'help-sidebar-contextual',
  CHANGELOG_DISPLAY = 'changelog-display',

  // ============================================================================
  // ERROR PAGES
  // ============================================================================
  ERROR_404 = 'error-404',
  ERROR_404_PAGE = 'error-404-page',
  ERROR_500 = 'error-500',
  ERROR_500_PAGE = 'error-500-page',
  ERROR_MESSAGE = 'error-message',
  COMING_SOON_PAGE = 'coming-soon-page',
  MAINTENANCE_MODE_PAGE = 'maintenance-mode-page',

  // ============================================================================
  // CONTENT PAGES
  // ============================================================================
  ABOUT_PAGE = 'about-page',
  ABOUT_PAGE_CONTENT = 'about-page-content',
  CONTACT_PAGE = 'contact-page',
  CONTACT_PAGE_CONTENT = 'contact-page-content',
  LEGAL_PAGE = 'legal-page',
  LEGAL_PAGE_CONTENT = 'legal-page-content',
  SITEMAP_CONTENT = 'sitemap-content',

  // ============================================================================
  // HERO & LANDING
  // ============================================================================
  HERO_SECTION = 'hero-section',
  HERO_FULL_WIDTH = 'hero-full-width',
  HERO_CENTERED = 'hero-centered',
  HERO_SPLIT = 'hero-split',
  HERO_SPLIT_LAYOUT = 'hero-split-layout',
  HERO_VIDEO_BG = 'hero-video-bg',
  CTA_BLOCK = 'cta-block',
  CTA_SECTION_CENTERED = 'cta-section-centered',
  CTA_SECTION_WITH_IMAGE = 'cta-section-with-image',
  FEATURE_SHOWCASE_GRID = 'feature-showcase-grid',
  FEATURE_SHOWCASE_ALTERNATING = 'feature-showcase-alternating',
  TESTIMONIAL_SLIDER = 'testimonial-slider',
  TESTIMONIAL_GRID = 'testimonial-grid',
  PARTNER_CLIENT_LOGOS = 'partner-client-logos',
  PRESS_MENTIONS = 'press-mentions',
  AWARDS_SHOWCASE = 'awards-showcase',
  CASE_STUDY_CARDS = 'case-study-cards',
  PROMOTIONAL_BANNER_TOP = 'promotional-banner-top',

  // ============================================================================
  // WIDGETS & UTILITIES
  // ============================================================================
  KANBAN_BOARD = 'kanban-board',
  WHITEBOARD_INTERFACE = 'whiteboard-interface',
  DRAWING_CANVAS = 'drawing-canvas',
  INTERACTIVE_DEMO = 'interactive-demo',
  QR_CODE_GENERATOR = 'qr-code-generator',
  QR_CODE_SCANNER = 'qr-code-scanner',
  PROGRESS_INDICATOR_LINEAR = 'progress-indicator-linear',
  PROGRESS_INDICATOR_CIRCULAR = 'progress-indicator-circular',
  ROADMAP_TIMELINE = 'roadmap-timeline',
  STATUS_BADGE = 'status-badge',
  CARD = 'card',
  TOOLTIP_SYSTEM = 'tooltip-system',
  SKELETON_SCREEN = 'skeleton-screen',
  LOADING_STATE_SPINNER = 'loading-state-spinner',
  EMPTY_STATE_NO_DATA = 'empty-state-no-data',
  SEARCH_BAR = 'search-bar',
  SEARCH_RESULTS_PAGE = 'search-results-page',
  THEME_TOGGLE = 'theme-toggle',
  COOKIE_CONSENT_SIMPLE = 'cookie-consent-simple',
  COOKIE_CONSENT_DETAILED = 'cookie-consent-detailed',
  ACCESSIBILITY_MENU = 'accessibility-menu',
  FONT_SIZE_ADJUSTER = 'font-size-adjuster',
  HIGH_CONTRAST_MODE = 'high-contrast-mode',
  SCREEN_READER_ANNOUNCEMENTS = 'screen-reader-announcements',
  SKIP_NAVIGATION = 'skip-navigation',
  CONNECTION_LOST_BANNER = 'connection-lost-banner',
  OFFLINE_MODE_INTERFACE = 'offline-mode-interface',
  STATUS_PAGE_SERVICE = 'status-page-service',
  SUCCESS_MESSAGE = 'success-message',
  NO_RESULTS_FOUND = 'no-results-found',
  ONBOARDING_FLOW = 'onboarding-flow',
  EXPORT_DATA_INTERFACE = 'export-data-interface',
  DATABASE_MANAGEMENT = 'database-management',
  LOGS_VIEWER = 'logs-viewer',
  CATEGORY_GRID = 'category-grid',

  // ============================================================================
  // BUDGET & EXPENSE TRACKING
  // ============================================================================
  EXPENSE_CARD = 'expense-card',
  BUDGET_PROGRESS_CARD = 'budget-progress-card',
  FINANCIAL_GOAL_CARD = 'financial-goal-card',
  EXPENSE_LIST = 'expense-list',
  BUDGET_OVERVIEW = 'budget-overview',
  CATEGORY_SPENDING = 'category-spending',
  TRANSACTION_HISTORY = 'transaction-history',

  // ============================================================================
  // TRAVEL & BOOKING
  // ============================================================================
  TRAVEL_HERO = 'travel-hero',
  TRAVEL_DESTINATIONS_GRID = 'travel-destinations-grid',
  TRAVEL_DESTINATION_DETAIL_PAGE = 'travel-destination-detail-page',
  TRAVEL_HOTELS_GRID = 'travel-hotels-grid',
  TRAVEL_HOTEL_DETAIL_PAGE = 'travel-hotel-detail-page',
  TRAVEL_FLIGHTS_LIST = 'travel-flights-list',
  TRAVEL_FLIGHTS_GRID = 'travel-flights-grid',
  TRAVEL_FLIGHT_DETAIL_PAGE = 'travel-flight-detail-page',
  TRAVEL_TOUR_PACKAGES_GRID = 'travel-tour-packages-grid',
  TRAVEL_TOUR_DETAIL_PAGE = 'travel-tour-detail-page',
  TRAVEL_TRIP_CARD = 'travel-trip-card',
  TRAVEL_BOOKING_CARD = 'travel-booking-card',
  TRAVEL_SEARCH_BAR = 'travel-search-bar',
  TRAVEL_FLIGHT_CARD = 'travel-flight-card',
  TRAVEL_HOTEL_CARD = 'travel-hotel-card',
  TRAVEL_DESTINATION_CARD = 'travel-destination-card',
  TRAVEL_DASHBOARD_PAGE = 'travel-dashboard-page',
  TRAVEL_BOOKING_CONFIRMATION_PAGE = 'travel-booking-confirmation-page',

  // ============================================================================
  // HEALTHCARE & MEDICAL
  // ============================================================================
  PATIENT_CARD = 'patient-card',
  APPOINTMENT_SCHEDULER = 'appointment-scheduler',
  MEDICAL_RECORD_VIEW = 'medical-record-view',
  PRESCRIPTION_LIST = 'prescription-list',

  // ============================================================================
  // REAL ESTATE & PROPERTY
  // ============================================================================
  PROPERTY_CARD = 'property-card',
  PROPERTY_SEARCH = 'property-search',

  // ============================================================================
  // AUTOMOTIVE
  // ============================================================================
  VEHICLE_CARD = 'vehicle-card',
  SERVICE_BOOKING = 'service-booking',

  // ============================================================================
  // BOOKING & SCHEDULING
  // ============================================================================
  TIME_SLOT_PICKER = 'time-slot-picker',
  BOOKING_SUMMARY = 'booking-summary',

  // ============================================================================
  // PET CARE
  // ============================================================================
  PET_PROFILE_CARD = 'pet-profile-card',
  PET_SERVICE_CARD = 'pet-service-card',
}

/**
 * Get all component type values as an array
 */
export const COMPONENT_TYPES = Object.values(ComponentType);

/**
 * Check if a string is a valid component type
 */
export function isValidComponentType(type: string): type is ComponentType {
  return COMPONENT_TYPES.includes(type as ComponentType);
}
