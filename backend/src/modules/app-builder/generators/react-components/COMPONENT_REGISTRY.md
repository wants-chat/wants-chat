# React Component Generator Registry

**Version:** 1.0
**Total Components:** 314+
**Last Updated:** 2025-11-19

This document provides a comprehensive guide to the React component generator system. It serves as both a reference for developers and a knowledge base for agentic systems working with the Fluxez app builder.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Component Categories](#component-categories)
4. [Data Flow & Field Mapping](#data-flow--field-mapping)
5. [Variant System](#variant-system)
6. [Component Catalog by Category](#component-catalog-by-category)
7. [Best Practices](#best-practices)
8. [Real-World Usage Examples](#real-world-usage-examples)

---

## Architecture Overview

### Core Concepts

The component generator system follows a **type-safe, registry-based architecture** that maps ComponentType enum values to generator functions. This ensures:

1. **Type Safety**: All component types have corresponding generators
2. **Compile-time Validation**: Type mismatches are caught during development
3. **Easy Discovery**: Centralized registry makes components easy to find
4. **Consistent API**: All generators follow the same signature

### Key Files

```
react-components/
├── component-generator.service.ts    # Main service orchestrator
├── component.registry.ts             # Central registry mapping types to generators
├── types/
│   └── resolved-component.interface.ts  # Data structure contracts
└── ui/react/
    ├── auth/                         # Authentication components
    ├── blog/                         # Blog & content components
    ├── calendar/                     # Calendar & events
    ├── charts/                       # Data visualization
    ├── common/                       # Shared components
    ├── ecommerce/                    # E-commerce specific
    ├── error/                        # Error pages
    ├── forms/                        # Form components
    ├── help/                         # Help & support
    ├── legal/                        # Legal pages
    ├── media/                        # Media components
    ├── modals/                       # Modals & dialogs
    ├── navigation/                   # Navigation components
    ├── shadcn/                       # ShadCN UI primitives
    ├── social/                       # Social media features
    ├── tables/                       # Data tables & lists
    ├── user/                         # User profile & settings
    └── widgets/                      # Utility widgets
```

### Generator Function Signature

```typescript
export type ComponentGenerator = (
  resolved: ResolvedComponent,
  variant?: string
) => string;
```

**Parameters:**
- `resolved`: Contains component type, data source, field mappings, and warnings
- `variant`: Optional string to select different visual styles (e.g., 'grid', 'list', 'compact')

**Returns:** Complete React component code as a string

---

## Directory Structure

```
src/modules/app-builder/generators/react-components/
│
├── app/                              # App-level configurations
│   └── index.ts
│
├── auth/                             # Authentication wrappers
│   └── index.ts
│
├── config/                           # Configuration utilities
│   └── index.ts
│
├── core/                             # Core generator utilities
│   └── index.ts
│
├── types/                            # TypeScript interfaces
│   └── resolved-component.interface.ts
│
├── ui/react/                         # React component generators
│   ├── auth/                         # 13 generators
│   ├── blog/                         # 26 generators
│   ├── calendar/                     # 5 generators
│   ├── charts/                       # 20 generators
│   ├── common/                       # 29 generators
│   ├── ecommerce/                    # 36 generators
│   ├── error/                        # 6 generators
│   ├── forms/                        # 50 generators
│   ├── help/                         # 20 generators
│   ├── legal/                        # 5 generators
│   ├── media/                        # 17 generators
│   ├── modals/                       # 9 generators
│   ├── navigation/                   # 21 generators
│   ├── shadcn/                       # 25 generators
│   ├── social/                       # 13 generators
│   ├── tables/                       # 19 generators
│   ├── user/                         # 18 generators
│   └── widgets/                      # 25 generators
│
├── component-generator.service.ts    # Main service
└── component.registry.ts             # Central registry
```

---

## Component Categories

### 1. DATA DISPLAY & TABLES (6 components)

**Purpose**: Display structured data in tabular or list formats

**Component Types:**
- `DATA_TABLE`: Full-featured data table with sorting, filtering, pagination
- `TABLE`: Basic ShadCN table primitive
- `PRODUCT_LIST_VIEW`: Product listing with images and details
- `TRANSACTION_HISTORY_TABLE`: Financial transaction history
- `USER_MANAGEMENT_TABLE`: User admin interface
- `ORDER_HISTORY_LIST`: Order tracking and history

**Common Use Cases:**
- Admin dashboards
- Data management interfaces
- E-commerce product listings
- User account pages

**Key Features:**
- Built-in CRUD operations (View, Edit, Delete)
- React Query integration for data fetching
- Responsive design
- Loading and error states
- Action dropdowns
- Modal confirmations

**Expected Data Structure:**
```typescript
{
  dataSource: string,           // Entity name (e.g., 'users', 'products')
  fieldMappings: [
    { targetField: 'id', sourceField: 'id' },
    { targetField: 'name', sourceField: 'name' },
    { targetField: 'email', sourceField: 'email' },
    { targetField: 'status', sourceField: 'status' },
    { targetField: 'createdDate', sourceField: 'created_at' }
  ]
}
```

---

### 2. FORMS & INPUTS (98 components)

**Purpose**: User input, data collection, and form workflows

#### Core Forms (14 components)
- `FORM`: Generic form component
- `FORM_COMPONENTS`: Multi-section card-based form
- `LOGIN_FORM`: Authentication login
- `REGISTER_FORM`: User registration
- `CONTACT_FORM`: Contact submission
- `FEEDBACK_FORM`: User feedback collection
- `SURVEY_FORM`: Survey questionnaire
- `APPLICATION_FORM`: Job/program application
- `BOOKING_RESERVATION_FORM`: Reservation booking
- `CHECKOUT_FORM`: E-commerce checkout
- `WIZARD_FORM`: Multi-step wizard
- `MULTI_COLUMN_FORM`: Grid layout form
- `INLINE_FORM`: Compact inline form
- `REGISTRATION_MULTI_STEP`: Multi-step registration

#### Form Fields (7 components)
- `FORM_FIELD_EMAIL`: Email input with validation
- `FORM_FIELD_PASSWORD`: Password with show/hide toggle
- `FORM_FIELD_TEXT`: Text input
- `INPUT`: ShadCN input primitive
- `TEXTAREA`: Multi-line text input
- `BUTTON`: ShadCN button primitive
- `LABEL`: Form label component

#### Advanced Inputs (34 components)
Date & Time:
- `DATE_PICKER_SINGLE`: Single date selection
- `DATE_PICKER_RANGE`: Date range picker
- `DATETIME_PICKER`: Date and time combined
- `TIME_PICKER`: Time selection

File Upload:
- `FILE_UPLOAD_SINGLE`: Single file upload
- `FILE_UPLOAD_MULTIPLE`: Multi-file upload
- `DRAG_DROP_UPLOADER`: Drag-and-drop interface
- `IMAGE_UPLOAD_PREVIEW`: Image upload with preview
- `MEDIA_UPLOAD_PREVIEW`: Media file upload

Autocomplete & Selection:
- `AUTOCOMPLETE_INPUT`: Autocomplete suggestions
- `ADDRESS_AUTOCOMPLETE`: Address lookup
- `PHONE_NUMBER_INPUT`: Phone with country code
- `CREDIT_CARD_INPUT`: Credit card with validation
- `CURRENCY_SELECTOR`: Currency dropdown
- `LANGUAGE_SELECTOR`: Language picker
- `SHIPPING_METHOD_SELECTOR`: Shipping options
- `SIZE_VARIANT_SELECTOR`: Product size/variant

Rating & Feedback:
- `RATING_INPUT_STARS`: Star rating (1-5)
- `RATING_INPUT_NUMBERS`: Numeric rating
- `SLIDER_RANGE`: Range slider
- `PRICE_RANGE_SLIDER`: Price filter slider

Content Editors:
- `RICH_TEXT_EDITOR`: WYSIWYG editor
- `MARKDOWN_EDITOR`: Markdown editing
- `CODE_EDITOR`: Code syntax highlighting
- `EMOJI_PICKER`: Emoji selection
- `TAG_INPUT`: Tag management

Specialized:
- `COLOR_PICKER`: Color selection
- `SIGNATURE_PAD`: Digital signature capture
- `SIGNATURE_PAD_DIGITAL`: Enhanced signature pad
- `PROMO_CODE_INPUT`: Promo/coupon code
- `CAPTCHA_INTEGRATION`: Bot prevention

#### Form Utilities (10 components)
- `FORM_PROGRESS_INDICATOR`: Multi-step progress bar
- `FORM_VALIDATION_MESSAGES`: Error display
- `BULK_ACTIONS_TOOLBAR`: Batch operations
- `SEARCH_BAR`: Search input with suggestions
- `SEARCH_RESULTS_PAGE`: Search results display

**Variant System Example (FORM_COMPONENTS):**
```typescript
// Three visual variants available
variant: 'card' | 'minimal' | 'modern' = 'modern'

// 'card': Multi-section cards with icons
// 'minimal': Borderless, underline-only inputs
// 'modern': Rounded inputs with background fill
```

**Expected Data Structure:**
```typescript
{
  dataSource: string,
  fieldMappings: [
    { targetField: 'mainTitle', sourceField: 'form_title' },
    { targetField: 'emailLabel', sourceField: 'email_label' },
    { targetField: 'emailPlaceholder', sourceField: 'email_placeholder' },
    { targetField: 'passwordLabel', sourceField: 'password_label' },
    { targetField: 'submitButton', sourceField: 'submit_text' },
    { targetField: 'countryOptions', sourceField: 'countries' }  // Array
  ]
}
```

**Best Practices:**
- Use `WIZARD_FORM` for complex multi-step processes
- Use `INLINE_FORM` for quick edits in tables
- Use `FORM_COMPONENTS` with 'modern' variant for professional look
- Always include validation messages
- Provide clear labels and placeholders

---

### 3. CHARTS & ANALYTICS (18 components)

**Purpose**: Data visualization and business intelligence

#### Chart Types
- `CHART`: Generic chart wrapper
- `CHART_WIDGET`: Chart with title and legend
- `DATA_VIZ_LINE_CHART`: Time series line chart
- `DATA_VIZ_BAR_CHART`: Bar/column chart
- `DATA_VIZ_PIE_CHART`: Pie/donut chart
- `DATA_VIZ_AREA_CHART`: Area chart with fill
- `COMPARISON_CHART`: Side-by-side comparison

#### KPI & Stats
- `KPI_CARD`: Single metric with trend indicator
- `ANALYTICS_CARD`: Metric card with chart
- `ANALYTICS_OVERVIEW_CARDS`: Multi-metric grid
- `STATS_WIDGET`: Simple stat display
- `STAT_CARD`: Stat with icon
- `STATISTICS_CARDS`: Grid of stat cards
- `STATISTICS_NUMBERS_SECTION`: Number showcase

#### Dashboards
- `DASHBOARD`: Full dashboard layout
- `ACTIVITY_FEED_DASHBOARD`: Activity stream dashboard
- `BILLING_DASHBOARD`: Billing & payments dashboard

**KPI Card Field Mapping:**
```typescript
// KPI_CARD expects minimal data
{
  dataSource: 'orders/stats',  // Endpoint or entity
  fieldMappings: [
    { targetField: 'count', sourceField: 'total_orders' },
    { targetField: 'trend', sourceField: 'trend' },  // 'up', 'down', 'neutral'
    { targetField: 'changePercent', sourceField: 'change_percentage' }
  ]
}

// Component accepts props:
{
  title: 'Total Orders',
  icon: 'activity',  // 'calendar', 'users', 'dollar', 'activity'
  color: 'blue',     // 'blue', 'green', 'yellow', 'red', 'purple', 'gray'
  endpoint: '/api/orders/stats'
}
```

**Chart Data Format:**
```typescript
// LINE/BAR/AREA charts
{
  labels: string[],      // X-axis labels
  datasets: [
    {
      label: string,
      data: number[],
      backgroundColor: string,
      borderColor: string
    }
  ]
}

// PIE chart
{
  labels: string[],
  data: number[]
}
```

**Best Practices:**
- Use `KPI_CARD` for dashboard overview metrics
- Use `DATA_VIZ_LINE_CHART` for time-series data
- Use `DATA_VIZ_PIE_CHART` for category distributions
- Use `ANALYTICS_OVERVIEW_CARDS` for multi-metric dashboards
- Color-code KPI cards: green for revenue, blue for users, yellow for pending

---

### 4. NAVIGATION (21 components)

**Purpose**: Site navigation, menus, and wayfinding

#### Headers & Navbars
- `NAVBAR`: Main navigation bar
- `HEADER_STICKY`: Fixed-position header
- `HEADER_TRANSPARENT`: Transparent overlay header
- `HEADER_MEGA_MENU`: Large dropdown menu
- `HAMBURGER_MENU`: Mobile menu toggle
- `ANNOUNCEMENT_BAR`: Top announcement banner

#### Sidebars & Panels
- `SIDEBAR`: Collapsible sidebar
- `SIDEBAR_NAVIGATION`: Sidebar with nav links
- `CART_MINI_DROPDOWN`: Shopping cart dropdown

#### Menus
- `DROPDOWN_MENU`: ShadCN dropdown
- `MEGA_MENU_DROPDOWN`: Multi-column dropdown
- `ACCORDION_MENU`: Expandable accordion nav
- `ACCORDION`: Generic accordion
- `MOBILE_BOTTOM_NAV`: Mobile bottom tab bar

#### Navigation Aids
- `BREADCRUMB_NAVIGATION`: Breadcrumb trail
- `PAGINATION`: Page navigation
- `TABS_NAVIGATION`: Tab-based navigation
- `ACCESSIBILITY_MENU`: Accessibility options
- `NOTIFICATION_DROPDOWN_SOCIAL`: Notifications dropdown

#### Product Navigation
- `PRODUCT_FILTER`: Filter panel
- `PRODUCT_FILTER_SIDEBAR`: Filter sidebar

**Expected Data:**
```typescript
// NAVBAR / SIDEBAR
{
  dataSource: 'navigation',
  fieldMappings: [
    { targetField: 'logo', sourceField: 'site_logo' },
    { targetField: 'links', sourceField: 'menu_items' },  // Array of links
    { targetField: 'ctaText', sourceField: 'cta_button_text' }
  ]
}

// PAGINATION
{
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
}
```

**Best Practices:**
- Use `HEADER_STICKY` for better UX on scroll
- Use `MEGA_MENU_DROPDOWN` for sites with many categories
- Use `MOBILE_BOTTOM_NAV` for mobile-first apps
- Use `BREADCRUMB_NAVIGATION` for deep site hierarchies
- Combine `SIDEBAR_NAVIGATION` with `DATA_TABLE` for admin panels

---

### 5. E-COMMERCE (46 components)

**Purpose**: Online shopping and product management

#### Product Display
- `PRODUCT_CARD`: Product card (grid/list/compact/detailed/minimal variants)
- `PRODUCT_CARD_COMPACT`: Compact product card
- `PRODUCT_CARD_DETAILED`: Detailed product card
- `PRODUCT_GRID`: Product grid layout
- `PRODUCT_GRID_TWO_COLUMN`: 2-column grid
- `PRODUCT_GRID_THREE_COLUMN`: 3-column grid
- `PRODUCT_GRID_FOUR_COLUMN`: 4-column grid
- `PRODUCT_DETAIL_PAGE`: Full product page
- `PRODUCT_IMAGE_GALLERY`: Image gallery with zoom
- `PRODUCT_CAROUSEL`: Product slider
- `PRODUCT_COMPARISON_TABLE`: Compare products
- `PRODUCT_QUICK_VIEW`: Quick view modal
- `PRODUCT_CONFIGURATOR`: Product customization
- `PRODUCT_360_VIEWER`: 360-degree viewer
- `PRODUCT_3D_VIEWER`: 3D model viewer
- `AR_PREVIEW_INTERFACE`: Augmented reality preview

#### Shopping Cart
- `SHOPPING_CART`: Cart component
- `CART_FULL_PAGE`: Full-page cart
- `CART_MINI_DROPDOWN`: Mini cart dropdown
- `CART_SUMMARY_SIDEBAR`: Cart summary sidebar
- `CART_ITEM_ROW`: Single cart item
- `EMPTY_CART_STATE`: Empty cart message

#### Checkout & Orders
- `CHECKOUT_STEPS`: Multi-step checkout
- `CHECKOUT_FORM`: Checkout form
- `ORDER_SUMMARY`: Order summary
- `ORDER_CONFIRMATION`: Order confirmation page
- `ORDER_TRACKING`: Track shipment
- `ORDER_DETAILS_VIEW`: Order details
- `ORDER_REVIEW`: Review before purchase
- `ORDER_HISTORY_LIST`: Past orders

#### Wishlist & Recommendations
- `WISHLIST`: Wishlist component
- `RECENTLY_VIEWED`: Recently viewed products
- `RELATED_PRODUCTS_SECTION`: Recommended products

#### Inventory & Pricing
- `INVENTORY_STATUS`: Stock level indicator
- `PRICING_TABLE_TWO`: 2-tier pricing
- `PRICING_TABLE_THREE`: 3-tier pricing
- `PRICING_TABLE_MULTI`: Multi-tier pricing

#### Payments & Billing
- `PAYMENT_METHOD`: Payment options
- `PAYMENT_HISTORY`: Payment records
- `INVOICE_DISPLAY`: Invoice viewer
- `RECEIPT_GENERATOR`: Receipt generation

#### Reviews & Trust
- `PRODUCT_REVIEWS_LIST`: Product reviews
- `REVIEW_SUMMARY`: Review aggregation
- `CUSTOMER_REVIEWS_CAROUSEL`: Review slider
- `TRUST_BADGES_SECTION`: Trust badges

**Product Card Variants:**
```typescript
variant: 'grid' | 'list' | 'compact' | 'detailed' | 'minimal'

// 'grid': Standard card for product grids (hover actions)
// 'list': Horizontal layout with features list
// 'compact': Small cards for tight spaces
// 'detailed': Full product page with tabs
// 'minimal': Minimal design for mobile
```

**Product Data Structure:**
```typescript
{
  dataSource: 'products',
  fieldMappings: [
    { targetField: 'id', sourceField: 'product_id' },
    { targetField: 'name', sourceField: 'title' },
    { targetField: 'price', sourceField: 'price' },
    { targetField: 'originalPrice', sourceField: 'original_price' },
    { targetField: 'image', sourceField: 'featured_image' },
    { targetField: 'images', sourceField: 'gallery' },  // Array
    { targetField: 'description', sourceField: 'description' },
    { targetField: 'category', sourceField: 'category_name' },
    { targetField: 'brand', sourceField: 'brand_name' },
    { targetField: 'rating', sourceField: 'avg_rating' },
    { targetField: 'reviewCount', sourceField: 'review_count' },
    { targetField: 'inStock', sourceField: 'in_stock' },
    { targetField: 'stockCount', sourceField: 'stock_quantity' },
    { targetField: 'features', sourceField: 'features' },  // Array
    { targetField: 'badge', sourceField: 'badge_text' },  // 'New', 'Sale', etc.
    { targetField: 'discount', sourceField: 'discount_percentage' }
  ]
}
```

**Best Practices:**
- Use `PRODUCT_GRID_THREE_COLUMN` for desktop, responsive to mobile
- Use `PRODUCT_CARD` with 'grid' variant for category pages
- Use `PRODUCT_CARD` with 'detailed' variant for product pages
- Use `CART_SUMMARY_SIDEBAR` alongside `CART_FULL_PAGE`
- Use `CHECKOUT_STEPS` for multi-step checkout flows
- Always show `INVENTORY_STATUS` near add-to-cart button
- Include `RELATED_PRODUCTS_SECTION` on product pages

---

### 6. FOOD & RESTAURANT (1 component)

**Purpose**: Food delivery and restaurant management

#### Restaurant Display
- `RESTAURANT_DETAIL_HEADER`: Restaurant detail header with info, ratings, and delivery details

**Restaurant Data Structure:**
```typescript
{
  dataSource: 'restaurants',
  fieldMappings: [
    { targetField: 'id', sourceField: 'id' },
    { targetField: 'name', sourceField: 'name' },
    { targetField: 'description', sourceField: 'description' },
    { targetField: 'logo_url', sourceField: 'logo_url' },  // or 'logo'
    { targetField: 'cover_image', sourceField: 'cover_image' },  // or 'image'
    { targetField: 'cuisine_types', sourceField: 'cuisine_types' },  // or 'cuisine'
    { targetField: 'location', sourceField: 'location' },  // or 'address'
    { targetField: 'phone', sourceField: 'phone' },
    { targetField: 'rating', sourceField: 'rating' },
    { targetField: 'review_count', sourceField: 'review_count' },  // or 'reviews_count'
    { targetField: 'delivery_fee', sourceField: 'delivery_fee' },
    { targetField: 'minimum_order', sourceField: 'minimum_order' },  // or 'min_order'
    { targetField: 'estimated_delivery_time', sourceField: 'estimated_delivery_time' },  // or 'delivery_time'
    { targetField: 'is_open', sourceField: 'is_open' },  // or 'open'
    { targetField: 'opening_hours', sourceField: 'opening_hours' }  // or 'hours'
  ]
}
```

**Variants:**
```typescript
variant: 'standard' | 'minimal'

// 'standard': Full restaurant header with cover image, logo, detailed info
// 'minimal': Compact header with essential info only
```

**Best Practices:**
- Use `RESTAURANT_DETAIL_HEADER` with 'standard' variant for restaurant detail pages
- Combine with `PRODUCT_GRID` to display menu items below the header
- Ensure `is_open` field is boolean for proper status badge display
- Include `opening_hours` for better user experience

---

### 7. BLOG & CONTENT (26 components)

**Purpose**: Content publishing and blog management

#### Blog Layouts
- `BLOG_LIST`: Blog post list
- `BLOG_GRID`: Grid of blog posts
- `BLOG_GRID_LAYOUT`: Customizable grid layout
- `BLOG_LIST_LAYOUT`: List layout
- `BLOG_MASONRY_LAYOUT`: Pinterest-style masonry

#### Blog Posts
- `BLOG_POST_CONTENT`: Post body content
- `BLOG_POST_HEADER`: Post header (title, meta)
- `BLOG_CARD`: Blog post card
- `FEATURED_BLOG_POST`: Hero blog post

#### Blog Navigation
- `BLOG_SIDEBAR`: Sidebar with widgets
- `BLOG_TABLE_OF_CONTENTS`: TOC navigation
- `BLOG_SEARCH_BAR`: Blog search

#### Author & Related
- `AUTHOR_BIO`: Author information
- `RELATED_ARTICLES`: Related posts
- `ARTICLE_PAGINATION`: Prev/next navigation

#### Categories & Tags
- `CATEGORIES_WIDGET`: Category list
- `TAG_CLOUD_WIDGET`: Tag cloud
- `TAG_INPUT`: Tag editor

#### Comments
- `COMMENT_SECTION`: Comment thread
- `COMMENT_THREAD`: Nested comments
- `COMMENT_FORM`: Comment submission
- `COMMENT_REPLY_FORM`: Reply to comment
- `FORUM_POST_EDITOR`: Forum post editor

#### Content Pages
- `ABOUT_PAGE_CONTENT`: About page
- `SITEMAP_CONTENT`: Sitemap page

#### Social
- `POST_COMPOSER`: Create post
- `SOCIAL_POST_CARD`: Social media post card

**Expected Data:**
```typescript
{
  dataSource: 'posts',
  fieldMappings: [
    { targetField: 'id', sourceField: 'post_id' },
    { targetField: 'title', sourceField: 'post_title' },
    { targetField: 'excerpt', sourceField: 'post_excerpt' },
    { targetField: 'content', sourceField: 'post_content' },
    { targetField: 'featuredImage', sourceField: 'featured_image' },
    { targetField: 'author', sourceField: 'author_name' },
    { targetField: 'authorAvatar', sourceField: 'author_avatar' },
    { targetField: 'publishDate', sourceField: 'published_at' },
    { targetField: 'category', sourceField: 'category_name' },
    { targetField: 'tags', sourceField: 'tags' },  // Array
    { targetField: 'readTime', sourceField: 'read_time' }
  ]
}
```

**Best Practices:**
- Use `BLOG_GRID_LAYOUT` for modern blog homepages
- Use `BLOG_LIST_LAYOUT` for traditional blogs
- Always include `BLOG_SIDEBAR` with categories and popular posts
- Use `BLOG_TABLE_OF_CONTENTS` for long-form content
- Include `RELATED_ARTICLES` at end of posts

---

### 8. SOCIAL MEDIA (13 components)

**Purpose**: Social networking features

- `SOCIAL_MEDIA_FEED`: Social feed
- `ACTIVITY_FEED`: Activity stream
- `ACTIVITY_TIMELINE_SOCIAL`: Timeline view
- `LIKE_REACTION_BUTTONS`: Like/react buttons
- `SHARE_BUTTONS`: Share to social media
- `SHARE_MODAL_SOCIAL`: Share modal
- `FOLLOW_UNFOLLOW_BUTTON`: Follow toggle
- `FRIEND_CONNECTION_LIST`: Friend list
- `DIRECT_MESSAGING_LIST`: Message threads
- `DIRECT_MESSAGING_THREAD`: Message conversation
- `GROUP_CHAT_INTERFACE`: Group chat
- `MENTIONS_TAGS_SYSTEM`: @mention system
- `HASHTAG_DISPLAY`: Hashtag display
- `NOTIFICATION_CENTER_PANEL`: Notification center

---

### 9. USER & PROFILE (18 components)

**Purpose**: User account management

- `USER_PROFILE`: User profile page
- `USER_PROFILE_VIEW`: View-only profile
- `USER_PROFILE_CARD_MINI`: Mini profile card
- `PROFILE_CARD`: Profile summary card
- `ACCOUNT_SETTINGS`: Settings page
- `PROFILE_EDIT_FORM`: Edit profile form
- `AVATAR_UPLOAD`: Avatar upload
- `TEAM_MEMBERS_GRID`: Team directory
- `USER_MANAGEMENT_TABLE`: Admin user table
- `ROLE_MANAGEMENT`: Role/permission editor
- `API_KEY_MANAGEMENT`: API key management
- `USAGE_METRICS_DISPLAY`: Usage statistics
- `VERSION_HISTORY`: Change history
- `SETTINGS_PANEL_ADMIN`: Admin settings
- `SYSTEM_NOTIFICATIONS_USER`: User notifications
- `NEWSLETTER_SIGNUP`: Newsletter subscription
- `RESET_PASSWORD_FORM`: Password reset
- `LOGS_VIEWER`: Activity logs

---

### 10. AUTH & SECURITY (13 components)

**Purpose**: Authentication and access control

#### Login & Registration
- `LOGIN_FORM`: Login form (4 variants)
- `LOGIN_MODAL`: Login modal
- `REGISTER_FORM`: Registration form
- `REGISTRATION_MULTI_STEP`: Multi-step registration
- `SOCIAL_LOGIN`: OAuth login buttons

#### Password Management
- `PASSWORD_RESET`: Reset password
- `PASSWORD_CHANGE_FORM`: Change password
- `FORGOT_PASSWORD_FORM`: Forgot password

#### Verification
- `EMAIL_VERIFICATION`: Email verification
- `VERIFY_EMAIL_FORM`: Email verify form
- `TWO_FACTOR_AUTH`: 2FA authentication

#### Security
- `SESSION_TIMEOUT_WARNING`: Session timeout alert
- `ACCESS_DENIED_PAGE`: 403 access denied
- `DELETE_ACCOUNT_CONFIRMATION`: Delete account modal
- `AGE_VERIFICATION_MODAL`: Age gate

**Login Form Variants:**
```typescript
variant: 'loginWithHero' | 'loginWithFeatures' | 'loginWithImage' | 'loginCentered'

// 'loginCentered': Simple centered form
// 'loginWithHero': Split screen with hero image
// 'loginWithFeatures': Features list on side
// 'loginWithImage': Background image
```

---

### 11. MODALS & DIALOGS (9 components)

**Purpose**: Overlays and pop-ups

- `MODAL_DIALOG`: Generic modal
- `CONFIRMATION_DIALOG`: Confirm action
- `LIGHTBOX_MODAL_VIEWER`: Image lightbox
- `EXIT_INTENT_POPUP`: Exit intent modal
- `TOAST_NOTIFICATION`: Toast message
- `ALERT_BANNER`: Alert banner
- `TOOLTIP_SYSTEM`: Tooltip component

---

### 12. NOTIFICATIONS & ALERTS (7 components)

- `NOTIFICATION_LIST`: Notification list
- `NOTIFICATION_CENTER_PANEL`: Notification panel
- `SYSTEM_NOTIFICATIONS`: System alerts
- `PUSH_NOTIFICATION_PROMPT`: Push notification opt-in
- `ALERT_BANNER`: Alert banner
- `ANNOUNCEMENT_BAR`: Announcement bar
- `TOAST_NOTIFICATION`: Toast messages

---

### 13. MEDIA (17 components)

**Purpose**: Images, videos, and media galleries

#### Image Galleries
- `IMAGE_GALLERY_GRID`: Grid gallery
- `IMAGE_GALLERY_MASONRY`: Masonry gallery
- `THUMBNAIL_GALLERY`: Thumbnail browser
- `IMAGE_ZOOM_HOVER`: Hover zoom
- `IMAGE_ZOOM_CLICK`: Click to zoom
- `BEFORE_AFTER_SLIDER`: Before/after slider

#### Carousels & Sliders
- `MEDIA_CAROUSEL`: Media slider
- `SLIDER_RANGE`: Range slider
- `PRICE_RANGE_SLIDER`: Price slider
- `TESTIMONIAL_SLIDER`: Testimonial carousel
- `CUSTOMER_REVIEWS_CAROUSEL`: Review carousel

#### Video & Audio
- `VIDEO_PLAYER_EMBEDDED`: Embedded video
- `VIDEO_PLAYER_CUSTOM`: Custom video player
- `VIDEO_THUMBNAIL_GRID`: Video grid
- `AUDIO_PLAYER`: Audio player
- `PLAYLIST_INTERFACE`: Audio/video playlist

#### Upload
- `IMAGE_UPLOAD_PREVIEW`: Image upload
- `MEDIA_UPLOAD_PREVIEW`: Media upload

---

### 14. CALENDAR & EVENTS (5 components)

- `CALENDAR`: Full calendar
- `COUNTDOWN_TIMER_EVENT`: Event countdown
- `COUNTDOWN_TIMER_OFFER`: Offer countdown
- `ROADMAP_TIMELINE`: Roadmap timeline
- `SESSION_TIMEOUT_WARNING`: Session timeout

---

### 15. HELP & SUPPORT (20 components)

**Purpose**: Documentation and customer support

#### Help Centers
- `HELP_CENTER_HOME`: Help center homepage
- `HELP_ARTICLE_PAGE`: Help article
- `ARTICLE_SEARCH_HELP`: Search help articles
- `KNOWLEDGE_BASE_CATEGORIES`: KB categories

#### FAQs
- `FAQ_ACCORDION_SIMPLE`: Simple FAQ
- `FAQ_ACCORDION_CATEGORIZED`: Categorized FAQ
- `FAQ_SEARCH`: FAQ search

#### Documentation
- `DOCUMENTATION_VIEWER`: Doc viewer
- `VIDEO_TUTORIALS_GALLERY`: Video tutorials
- `TUTORIAL_WALKTHROUGH`: Step-by-step tutorial
- `GUIDED_TOUR_WALKTHROUGH`: Product tour
- `TROUBLESHOOTING_WIZARD`: Troubleshoot wizard
- `CHANGELOG_DISPLAY`: Changelog

#### Support
- `SUPPORT_TICKET_FORM`: Create ticket
- `SUPPORT_TICKET_LIST_HELP`: Ticket list
- `SUPPORT_TICKET_DETAIL_HELP`: Ticket details
- `LIVE_CHAT_WIDGET_HELP`: Live chat
- `CHATBOT_SUPPORT`: Chatbot
- `REVIEW_HELPFUL_VOTING`: Was this helpful?
- `HELP_SIDEBAR_CONTEXTUAL`: Contextual help

---

### 16. ERROR PAGES (7 components)

- `ERROR_404_PAGE`: 404 not found
- `ERROR_500_PAGE`: 500 server error
- `ERROR_MESSAGE`: Generic error
- `COMING_SOON_PAGE`: Coming soon
- `MAINTENANCE_MODE_PAGE`: Maintenance mode
- `ACCESS_DENIED_PAGE`: 403 forbidden

---

### 17. CONTENT PAGES (7 components)

- `ABOUT_PAGE_CONTENT`: About page
- `CONTACT_PAGE_CONTENT`: Contact page
- `LEGAL_PAGE_CONTENT`: Legal/terms page
- `CONTACT_FORM`: Contact form
- `BASIC_CONTACT_FORM`: Simple contact form
- `SITEMAP_CONTENT`: Sitemap

---

### 18. HERO & LANDING (14 components)

**Purpose**: Landing page sections

#### Hero Sections
- `HERO_SECTION`: Generic hero
- `HERO_FULL_WIDTH`: Full-width hero
- `HERO_CENTERED`: Centered hero
- `HERO_SPLIT_LAYOUT`: Split hero

#### Features & CTAs
- `CTA_BLOCK`: Call-to-action
- `FEATURE_SHOWCASE_GRID`: Feature grid
- `FEATURE_SHOWCASE_ALTERNATING`: Alternating features

#### Social Proof
- `TESTIMONIAL_GRID`: Testimonial grid
- `TESTIMONIAL_SLIDER`: Testimonial slider
- `PARTNER_CLIENT_LOGOS`: Logo grid
- `PRESS_MENTIONS`: Press logos
- `AWARDS_SHOWCASE`: Award badges
- `CASE_STUDY_CARDS`: Case studies

#### Promotions
- `PROMOTIONAL_BANNER_TOP`: Promo banner

---

### 19. WIDGETS & UTILITIES (25 components)

**Purpose**: Utility components and tools

#### Project Management
- `KANBAN_BOARD`: Kanban board
- `WHITEBOARD_INTERFACE`: Whiteboard
- `DRAWING_CANVAS`: Drawing tool
- `INTERACTIVE_DEMO`: Interactive demo
- `ROADMAP_TIMELINE`: Roadmap

#### QR Codes
- `QR_CODE_GENERATOR`: Generate QR
- `QR_CODE_SCANNER`: Scan QR

#### Progress Indicators
- `PROGRESS_INDICATOR_LINEAR`: Linear progress
- `PROGRESS_INDICATOR_CIRCULAR`: Circular progress
- `READING_PROGRESS_BAR`: Reading progress
- `STATUS_BADGE`: Status badge
- `FORM_PROGRESS_INDICATOR`: Form progress

#### Loading & Empty States
- `SKELETON_SCREEN`: Skeleton loader
- `LOADING_STATE_SPINNER`: Loading spinner
- `EMPTY_STATE_NO_DATA`: No data message
- `NO_RESULTS_FOUND`: No results

#### Accessibility
- `THEME_TOGGLE`: Dark/light mode
- `FONT_SIZE_ADJUSTER`: Font size control
- `HIGH_CONTRAST_MODE`: High contrast
- `SCREEN_READER_ANNOUNCEMENTS`: Screen reader
- `SKIP_NAVIGATION`: Skip to content
- `ACCESSIBILITY_MENU`: Accessibility menu

#### Cookies & Privacy
- `COOKIE_CONSENT_SIMPLE`: Simple cookie banner
- `COOKIE_CONSENT_DETAILED`: Detailed cookie consent

#### System Status
- `CONNECTION_LOST_BANNER`: Offline banner
- `OFFLINE_MODE_INTERFACE`: Offline mode
- `STATUS_PAGE_SERVICE`: Status page
- `SUCCESS_MESSAGE`: Success message

#### Onboarding
- `ONBOARDING_FLOW`: Onboarding wizard
- `GUIDED_TOUR_WALKTHROUGH`: Product tour

#### Data Management
- `EXPORT_DATA_INTERFACE`: Data export
- `DATABASE_MANAGEMENT`: DB admin

---

### 20. SHADCN UI PRIMITIVES (25 components)

**Purpose**: Low-level UI building blocks

- `ALERT_DIALOG`: Alert dialog
- `ALERT`: Alert component
- `AVATAR`: Avatar component
- `BADGE`: Badge component
- `BUTTON`: Button component
- `CARD`: Card component
- `CHECKBOX`: Checkbox
- `COLLAPSIBLE`: Collapsible
- `DIALOG`: Dialog modal
- `DROPDOWN_MENU`: Dropdown menu
- `INPUT`: Input field
- `LABEL`: Label component
- `PROGRESS`: Progress bar
- `RADIO_GROUP`: Radio group
- `SCROLL_AREA`: Scroll area
- `SELECT`: Select dropdown
- `SEPARATOR`: Separator line
- `SHEET`: Side sheet
- `SLIDER`: Slider component
- `SONNER`: Toast notifications
- `SWITCH`: Toggle switch
- `TABLE`: Table component
- `TABS`: Tabs component
- `TEXTAREA`: Textarea field

---

## Data Flow & Field Mapping

### ResolvedComponent Interface

```typescript
export interface ResolvedComponent {
  componentType: string;     // ComponentType enum value
  dataSource: string;        // Entity name or API endpoint
  fieldMappings: FieldMapping[];
  warnings: string[];        // Validation warnings
}

export interface FieldMapping {
  targetField: string;       // Field name expected by component
  sourceField: string;       // Actual field from data source
  fallback?: any;           // Default value if field missing
}
```

### Field Resolution Strategy

All generators use a common `getField()` helper pattern:

```typescript
const getField = (fieldName: string): string => {
  const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);

  if (mapping?.sourceField) {
    return `${dataName}?.${mapping.sourceField}`;
  }

  // Fallback strategies:

  // 1. ID fields
  if (fieldName === 'id' || fieldName.endsWith('Id')) {
    return `${dataName}?.id || ${dataName}?._id`;
  }

  // 2. Array fields (plurals, lists)
  if (fieldName.match(/items|products|users|features|links|etc/i)) {
    return `${dataName}?.${fieldName} || ([] as any[])`;
  }

  // 3. Object fields
  if (fieldName.match(/address|metadata|config|settings/i)) {
    return `${dataName}?.${fieldName} || ({} as any)`;
  }

  // 4. Scalar fallback
  return `${dataName}?.${fieldName} || ''`;
};
```

### Data Source Sanitization

Data sources are sanitized to camelCase variable names:

```typescript
const sanitizeVariableName = (name: string): string => {
  return name
    .split(/[._]/)
    .map((part, index) => {
      if (index === 0) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};

// Examples:
// 'products' -> 'products'
// 'order_items' -> 'orderItems'
// 'user.profile' -> 'userProfile'
```

---

## Variant System

Many components support multiple visual variants:

### Common Variant Patterns

#### 1. Layout Variants
```typescript
// Product Card
variant: 'grid' | 'list' | 'compact' | 'detailed' | 'minimal'

// Blog
variant: 'grid' | 'list' | 'masonry'

// Form
variant: 'card' | 'minimal' | 'modern'
```

#### 2. Style Variants
```typescript
// Login Form
variant: 'loginWithHero' | 'loginWithFeatures' | 'loginWithImage' | 'loginCentered'
```

#### 3. Column Variants
```typescript
// Product Grid
PRODUCT_GRID_TWO_COLUMN
PRODUCT_GRID_THREE_COLUMN
PRODUCT_GRID_FOUR_COLUMN
```

### How Variants Work

Variants are selected by passing a second parameter to the generator:

```typescript
const code = generateProductCard(resolved, 'grid');
const code = generateLoginForm(resolved, 'loginWithHero');
```

Each variant returns completely different JSX markup optimized for that use case.

---

## Best Practices

### 1. Component Selection

**For Admin Dashboards:**
```typescript
// Use:
- DATA_TABLE (for data management)
- KPI_CARD (for metrics)
- SIDEBAR_NAVIGATION (for navigation)
- FORM_COMPONENTS with 'modern' variant (for forms)
```

**For E-commerce Sites:**
```typescript
// Homepage:
- HERO_SECTION
- PRODUCT_GRID_THREE_COLUMN
- FEATURE_SHOWCASE_GRID
- TESTIMONIAL_SLIDER

// Category Pages:
- PRODUCT_FILTER_SIDEBAR
- PRODUCT_GRID with 'grid' variant
- PAGINATION

// Product Pages:
- PRODUCT_CARD with 'detailed' variant
- RELATED_PRODUCTS_SECTION
- PRODUCT_REVIEWS_LIST

// Cart & Checkout:
- CART_FULL_PAGE
- CART_SUMMARY_SIDEBAR
- CHECKOUT_STEPS
- ORDER_CONFIRMATION
```

**For Content/Blog Sites:**
```typescript
// Homepage:
- HERO_SECTION
- BLOG_GRID_LAYOUT
- FEATURED_BLOG_POST

// Blog Posts:
- BLOG_POST_HEADER
- BLOG_POST_CONTENT
- BLOG_TABLE_OF_CONTENTS
- AUTHOR_BIO
- COMMENT_SECTION
- RELATED_ARTICLES

// Sidebars:
- BLOG_SIDEBAR
- CATEGORIES_WIDGET
- POPULAR_POSTS_WIDGET
- TAG_CLOUD_WIDGET
```

**For SaaS Applications:**
```typescript
// Authentication:
- LOGIN_FORM with 'loginCentered' variant
- REGISTER_FORM
- TWO_FACTOR_AUTH

// Dashboard:
- ANALYTICS_OVERVIEW_CARDS
- DATA_VIZ_LINE_CHART
- DATA_TABLE
- ACTIVITY_FEED

// Settings:
- ACCOUNT_SETTINGS
- PROFILE_EDIT_FORM
- API_KEY_MANAGEMENT
```

### 2. Field Mapping Best Practices

**Always map these essential fields:**
```typescript
// For all components:
{ targetField: 'id', sourceField: 'unique_id' }

// For display components:
{ targetField: 'title', sourceField: 'name' }
{ targetField: 'description', sourceField: 'summary' }

// For images:
{ targetField: 'image', sourceField: 'featured_image' }
{ targetField: 'images', sourceField: 'gallery' }  // Array

// For timestamps:
{ targetField: 'createdDate', sourceField: 'created_at' }
{ targetField: 'updatedDate', sourceField: 'updated_at' }
```

**Handle arrays properly:**
```typescript
// Good - Arrays are recognized
{ targetField: 'products', sourceField: 'product_list' }
{ targetField: 'features', sourceField: 'feature_array' }

// Bad - Will be treated as scalar
{ targetField: 'product', sourceField: 'product_list' }
```

**Use semantic field names:**
```typescript
// Good - Clear intent
{ targetField: 'emailLabel', sourceField: 'email_input_label' }
{ targetField: 'submitButton', sourceField: 'submit_button_text' }

// Bad - Unclear
{ targetField: 'field1', sourceField: 'text1' }
```

### 3. Component Composition

**Combine complementary components:**

```typescript
// E-commerce Product Page
<Page>
  <PRODUCT_CARD variant="detailed" />           // Main product
  <PRODUCT_REVIEWS_LIST />                       // Reviews
  <RELATED_PRODUCTS_SECTION />                   // Recommendations
  <TRUST_BADGES_SECTION />                       // Trust signals
</Page>

// Dashboard
<Page>
  <SIDEBAR_NAVIGATION />
  <MainContent>
    <ANALYTICS_OVERVIEW_CARDS />                 // KPI cards
    <DATA_VIZ_LINE_CHART />                      // Trend chart
    <DATA_TABLE />                               // Data grid
  </MainContent>
</Page>

// Blog Post
<Page>
  <BLOG_POST_HEADER />                           // Title, meta
  <BLOG_TABLE_OF_CONTENTS />                     // TOC
  <BLOG_POST_CONTENT />                          // Body
  <AUTHOR_BIO />                                 // Author
  <COMMENT_SECTION />                            // Comments
  <RELATED_ARTICLES />                           // Related posts
  <BLOG_SIDEBAR>
    <CATEGORIES_WIDGET />
    <POPULAR_POSTS_WIDGET />
    <TAG_CLOUD_WIDGET />
  </BLOG_SIDEBAR>
</Page>
```

### 4. Performance Optimization

**Use appropriate variants:**
```typescript
// Mobile: Use compact variants
<PRODUCT_CARD variant="compact" />

// Desktop: Use detailed variants
<PRODUCT_CARD variant="grid" />

// List views: Use list variant
<PRODUCT_CARD variant="list" />
```

**Lazy load heavy components:**
```typescript
// Good for product galleries, media carousels
- IMAGE_GALLERY_GRID
- VIDEO_PLAYER_CUSTOM
- PRODUCT_360_VIEWER
```

**Optimize table components:**
```typescript
// Use DATA_TABLE for:
- Small to medium datasets (<1000 rows)
- Admin interfaces
- CRUD operations

// Consider server-side pagination for:
- Large datasets (>1000 rows)
- Public-facing tables
```

### 5. Accessibility

**Always include:**
- `ACCESSIBILITY_MENU` on all pages
- `SKIP_NAVIGATION` at top of page
- `SCREEN_READER_ANNOUNCEMENTS` for dynamic content
- `THEME_TOGGLE` for dark mode support

### 6. Error Handling

**Include appropriate error components:**
```typescript
// Application-wide:
- ERROR_404_PAGE
- ERROR_500_PAGE
- ACCESS_DENIED_PAGE

// Section-specific:
- EMPTY_STATE_NO_DATA (for empty tables)
- NO_RESULTS_FOUND (for empty search)
- CONNECTION_LOST_BANNER (for offline state)
```

---

## Real-World Usage Examples

### Example 1: E-commerce Product Catalog

**Catalog Definition:**
```typescript
{
  name: 'Products Page',
  route: '/products',
  components: [
    {
      type: ComponentType.PRODUCT_FILTER_SIDEBAR,
      position: { row: 0, col: 0, span: 3 },
      data: {
        entity: 'product_filters',
        fields: [
          { name: 'categories', type: 'array', label: 'Categories' },
          { name: 'priceRange', type: 'object', label: 'Price Range' },
          { name: 'brands', type: 'array', label: 'Brands' }
        ]
      }
    },
    {
      type: ComponentType.PRODUCT_GRID_THREE_COLUMN,
      position: { row: 0, col: 3, span: 9 },
      data: {
        entity: 'products',
        fields: [
          { name: 'id', type: 'text' },
          { name: 'name', type: 'text' },
          { name: 'price', type: 'number' },
          { name: 'originalPrice', type: 'number' },
          { name: 'image', type: 'text' },
          { name: 'rating', type: 'number' },
          { name: 'reviewCount', type: 'number' },
          { name: 'badge', type: 'text' },
          { name: 'inStock', type: 'boolean' }
        ]
      }
    }
  ]
}
```

**Generated Field Mappings:**
```typescript
{
  componentType: 'product-grid-three-column',
  dataSource: 'products',
  fieldMappings: [
    { targetField: 'id', sourceField: 'id' },
    { targetField: 'name', sourceField: 'name' },
    { targetField: 'price', sourceField: 'price' },
    { targetField: 'originalPrice', sourceField: 'originalPrice' },
    { targetField: 'image', sourceField: 'image' },
    { targetField: 'rating', sourceField: 'rating' },
    { targetField: 'reviewCount', sourceField: 'reviewCount' },
    { targetField: 'badge', sourceField: 'badge' },
    { targetField: 'inStock', sourceField: 'inStock' }
  ]
}
```

### Example 2: Admin Dashboard

**Catalog Definition:**
```typescript
{
  name: 'Dashboard',
  route: '/admin/dashboard',
  components: [
    {
      type: ComponentType.ANALYTICS_OVERVIEW_CARDS,
      position: { row: 0, col: 0, span: 12 },
      data: {
        entity: 'dashboard_stats',
        fields: [
          { name: 'totalUsers', type: 'number' },
          { name: 'totalRevenue', type: 'number' },
          { name: 'totalOrders', type: 'number' },
          { name: 'activeUsers', type: 'number' }
        ]
      }
    },
    {
      type: ComponentType.DATA_VIZ_LINE_CHART,
      position: { row: 1, col: 0, span: 8 },
      data: {
        entity: 'revenue_chart',
        fields: [
          { name: 'labels', type: 'array' },
          { name: 'data', type: 'array' }
        ]
      }
    },
    {
      type: ComponentType.DATA_TABLE,
      position: { row: 2, col: 0, span: 12 },
      data: {
        entity: 'recent_orders',
        fields: [
          { name: 'id', type: 'text' },
          { name: 'customer', type: 'text' },
          { name: 'total', type: 'number' },
          { name: 'status', type: 'text' },
          { name: 'date', type: 'date' }
        ]
      }
    }
  ]
}
```

### Example 3: Blog Homepage

**Catalog Definition:**
```typescript
{
  name: 'Blog Home',
  route: '/blog',
  components: [
    {
      type: ComponentType.FEATURED_BLOG_POST,
      position: { row: 0, col: 0, span: 12 },
      data: {
        entity: 'featured_post',
        fields: [
          { name: 'title', type: 'text' },
          { name: 'excerpt', type: 'text' },
          { name: 'featuredImage', type: 'text' },
          { name: 'author', type: 'text' },
          { name: 'publishDate', type: 'date' }
        ]
      }
    },
    {
      type: ComponentType.BLOG_GRID_LAYOUT,
      position: { row: 1, col: 0, span: 9 },
      data: {
        entity: 'posts',
        fields: [
          { name: 'id', type: 'text' },
          { name: 'title', type: 'text' },
          { name: 'excerpt', type: 'text' },
          { name: 'featuredImage', type: 'text' },
          { name: 'author', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'publishDate', type: 'date' },
          { name: 'readTime', type: 'text' }
        ]
      }
    },
    {
      type: ComponentType.BLOG_SIDEBAR,
      position: { row: 1, col: 9, span: 3 },
      data: {
        entity: 'sidebar_data',
        fields: [
          { name: 'categories', type: 'array' },
          { name: 'popularPosts', type: 'array' },
          { name: 'tags', type: 'array' }
        ]
      }
    }
  ]
}
```

### Example 4: Multi-Step Checkout

**Catalog Definition:**
```typescript
{
  name: 'Checkout',
  route: '/checkout',
  components: [
    {
      type: ComponentType.CHECKOUT_STEPS,
      position: { row: 0, col: 0, span: 12 },
      data: {
        entity: 'checkout',
        fields: [
          { name: 'currentStep', type: 'number' },
          { name: 'steps', type: 'array' }
        ]
      }
    },
    {
      type: ComponentType.CHECKOUT_FORM,
      position: { row: 1, col: 0, span: 8 },
      data: {
        entity: 'order',
        fields: [
          { name: 'shippingAddress', type: 'object' },
          { name: 'billingAddress', type: 'object' },
          { name: 'paymentMethod', type: 'text' },
          { name: 'shippingMethod', type: 'text' }
        ]
      }
    },
    {
      type: ComponentType.ORDER_SUMMARY,
      position: { row: 1, col: 8, span: 4 },
      data: {
        entity: 'order',
        fields: [
          { name: 'items', type: 'array' },
          { name: 'subtotal', type: 'number' },
          { name: 'tax', type: 'number' },
          { name: 'shipping', type: 'number' },
          { name: 'total', type: 'number' }
        ]
      }
    }
  ]
}
```

---

## Component Generator Implementation Details

### Generator Function Structure

All generators follow this pattern:

```typescript
export const generateComponentName = (
  resolved: ResolvedComponent,
  variant?: string
) => {
  // 1. Extract data source
  const dataSource = resolved.dataSource;

  // 2. Define field getter
  const getField = (fieldName: string): string => {
    // Field mapping logic...
  };

  // 3. Sanitize variable name
  const dataName = sanitizeVariableName(dataSource);

  // 4. Define common imports
  const commonImports = `...`;

  // 5. Define variants object (if applicable)
  const variants = {
    variantA: `...JSX template...`,
    variantB: `...JSX template...`,
  };

  // 6. Return selected variant
  return variants[variant] || variants.default;
};
```

### Generated Component Structure

All generated components include:

1. **Imports**: React, UI components, icons, utilities
2. **Props Interface**: TypeScript interface for component props
3. **Component Function**: React functional component
4. **State Management**: useState for local state
5. **Data Extraction**: Extract fields using getField()
6. **Event Handlers**: onClick, onChange, etc.
7. **JSX Template**: The component markup
8. **Export**: Default export

Example:
```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  data?: any;
  className?: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ data, className }) => {
  const [state, setState] = useState(initialValue);

  const title = data?.title || '';
  const description = data?.description || '';

  const handleAction = () => {
    console.log('Action triggered');
  };

  return (
    <div className={className}>
      <h2>{title}</h2>
      <p>{description}</p>
      <Button onClick={handleAction}>Click Me</Button>
    </div>
  );
};

export default MyComponent;
```

---

## Advanced Topics

### Custom Field Patterns

Generators recognize common field naming patterns:

**Arrays:**
- Any field ending in 's' or containing words like 'items', 'products', 'users', etc.
- Automatically defaults to `[]` if missing

**Objects:**
- Fields matching 'address', 'metadata', 'config', 'settings', etc.
- Automatically defaults to `{}` if missing

**Dates:**
- Fields matching 'date', 'createdAt', 'updatedAt', etc.
- Automatically formatted with `toLocaleDateString()`

**Booleans:**
- Fields ending in 'Enabled', 'Active', 'Visible', etc.
- Rendered as "Yes/No" or toggle switches

**Enums/Status:**
- Fields named 'status', 'state', 'type', etc.
- Rendered with colored badges

### React Query Integration

Table and dashboard components use React Query for data fetching:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['entityName'],
  queryFn: async () => {
    const response = await api.get('/entityName');
    return response.data || [];
  }
});
```

This provides:
- Automatic loading states
- Error handling
- Caching
- Refetching
- Optimistic updates

### ShadCN UI Integration

All components use ShadCN UI primitives for consistency:
- `Button`, `Input`, `Label`
- `Card`, `CardHeader`, `CardContent`
- `Dialog`, `Sheet`, `Dropdown`
- `Badge`, `Avatar`, `Separator`
- `Table`, `Tabs`, `Select`

This ensures:
- Consistent styling
- Dark mode support
- Accessibility
- Tailwind CSS integration

---

## Troubleshooting

### Common Issues

**Issue 1: Component not generating**
- Check that ComponentType is registered in `component.registry.ts`
- Verify generator function is exported from category index file
- Ensure dataSource is provided

**Issue 2: Missing field data**
- Verify field mappings are correct
- Check that sourceField exists in API response
- Use fallback values for optional fields

**Issue 3: Variant not working**
- Check that variant name is spelled correctly
- Verify variant exists in generator's variants object
- Use default variant if unsure

**Issue 4: Styling issues**
- Ensure Tailwind CSS is configured
- Check that ShadCN components are installed
- Verify dark mode classes are applied

---

## Future Enhancements

### Planned Features

1. **Server Components**: Next.js 13+ server component support
2. **Streaming**: React Suspense and streaming SSR
3. **Internationalization**: Multi-language support
4. **Theme Customization**: Custom color schemes
5. **Component Previews**: Visual component browser
6. **Testing Utilities**: Auto-generated test files
7. **Storybook Integration**: Component stories
8. **Performance Monitoring**: Built-in analytics

### Contributing

To add a new component generator:

1. Create generator file in appropriate category folder
2. Implement generator function with signature: `(resolved, variant?) => string`
3. Export generator from category `index.ts`
4. Add ComponentType enum value to `component-types.enum.ts`
5. Register in `component.registry.ts`
6. Update this documentation

---

## Appendix

### Complete ComponentType Enum Reference

See `/src/modules/app-builder/interfaces/component-types.enum.ts` for the complete list of 314+ component types.

### Generator File Locations

All generator files follow the naming pattern:
```
{component-name}.generator.ts
```

Located in:
```
/src/modules/app-builder/generators/react-components/ui/react/{category}/
```

### TypeScript Interfaces

**ResolvedComponent:**
```typescript
export interface ResolvedComponent {
  componentType: string;
  dataSource: string;
  fieldMappings: FieldMapping[];
  warnings: string[];
}
```

**FieldMapping:**
```typescript
export interface FieldMapping {
  targetField: string;
  sourceField: string;
  fallback?: any;
}
```

---

## Quick Reference

### Most Commonly Used Components

**Admin Interfaces:**
1. DATA_TABLE
2. FORM_COMPONENTS
3. KPI_CARD
4. SIDEBAR_NAVIGATION
5. ANALYTICS_OVERVIEW_CARDS

**E-commerce:**
1. PRODUCT_GRID
2. PRODUCT_CARD
3. CART_FULL_PAGE
4. CHECKOUT_FORM
5. ORDER_SUMMARY

**Content Sites:**
1. BLOG_GRID_LAYOUT
2. BLOG_POST_CONTENT
3. COMMENT_SECTION
4. AUTHOR_BIO
5. RELATED_ARTICLES

**Landing Pages:**
1. HERO_SECTION
2. FEATURE_SHOWCASE_GRID
3. TESTIMONIAL_SLIDER
4. CTA_BLOCK
5. PRICING_TABLE_THREE

### Component Compatibility Matrix

| Component Type | Works Well With | Avoid Combining With |
|---|---|---|
| DATA_TABLE | SIDEBAR_NAVIGATION, FORM_COMPONENTS | PRODUCT_GRID, BLOG_GRID |
| PRODUCT_GRID | PRODUCT_FILTER_SIDEBAR, PAGINATION | DATA_TABLE |
| BLOG_GRID | BLOG_SIDEBAR, CATEGORIES_WIDGET | PRODUCT_GRID |
| CHECKOUT_FORM | ORDER_SUMMARY, CART_SUMMARY_SIDEBAR | PRODUCT_GRID |
| KPI_CARD | ANALYTICS_OVERVIEW_CARDS, DATA_VIZ_LINE_CHART | BLOG_CARD |

---

**Document Version:** 1.0
**Generated:** 2025-11-17
**Component Count:** 313+
**Categories:** 19

For updates, issues, or questions, please refer to the main codebase documentation or contact the development team.
