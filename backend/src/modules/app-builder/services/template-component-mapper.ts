/**
 * Template to Component Mapper
 *
 * Maps feature templateIds and componentIds to ComponentType enum values.
 * This bridges the gap between feature definitions and the component generator registry.
 */

import { ComponentType } from '../interfaces/component-types.enum';

/**
 * Maps templateId from feature definitions to the primary ComponentType for that page
 * The templateId determines the main page structure/layout
 */
export const TEMPLATE_TO_COMPONENT_TYPE: Record<string, ComponentType> = {
  // Blog & Content
  'blog-list': ComponentType.BLOG_LIST,
  'blog-grid': ComponentType.BLOG_GRID,
  'blog-post': ComponentType.BLOG_POST_CONTENT,
  'write-post': ComponentType.POST_COMPOSER,
  'post-editor': ComponentType.POST_COMPOSER,
  'admin-posts': ComponentType.DATA_TABLE,
  'admin-categories': ComponentType.DATA_TABLE,
  'admin-comments': ComponentType.COMMENT_SECTION,

  // Auth pages
  'login': ComponentType.LOGIN_FORM,
  'register': ComponentType.REGISTER_FORM,
  'forgot-password': ComponentType.FORGOT_PASSWORD_FORM,
  'reset-password': ComponentType.RESET_PASSWORD_FORM,
  'verify-email': ComponentType.VERIFY_EMAIL_FORM,
  'profile': ComponentType.USER_PROFILE,

  // E-commerce
  'products-list': ComponentType.PRODUCT_GRID,
  'product-grid': ComponentType.PRODUCT_GRID,
  'product-detail': ComponentType.PRODUCT_DETAIL_PAGE,
  'cart': ComponentType.SHOPPING_CART,
  'checkout': ComponentType.CHECKOUT_STEPS,
  'order-confirmation': ComponentType.ORDER_CONFIRMATION,
  'wishlist': ComponentType.WISHLIST,

  // Categories
  'categories': ComponentType.CATEGORY_GRID,
  'category': ComponentType.CATEGORY_GRID,
  'category-page': ComponentType.CATEGORY_GRID,

  // Search
  'search': ComponentType.BLOG_SEARCH_BAR,
  'search-results': ComponentType.BLOG_LIST,

  // Dashboard
  'dashboard': ComponentType.DASHBOARD,
  'admin-dashboard': ComponentType.DASHBOARD,
  'analytics': ComponentType.ANALYTICS_OVERVIEW_CARDS,

  // Forms
  'contact': ComponentType.CONTACT_FORM,
  'feedback': ComponentType.FEEDBACK_FORM,
  'survey': ComponentType.SURVEY_FORM,

  // Settings
  'settings': ComponentType.USER_PROFILE,
  'account-settings': ComponentType.USER_PROFILE,

  // Booking (using appropriate components)
  'booking': ComponentType.BOOKING_RESERVATION_FORM,
  'reservations': ComponentType.DATA_TABLE,
  'appointments': ComponentType.APPOINTMENT_SCHEDULER,
  'schedule-appointment': ComponentType.APPOINTMENT_SCHEDULER,
  'book-appointment': ComponentType.APPOINTMENT_SCHEDULER,

  // Social
  'feed': ComponentType.SOCIAL_MEDIA_FEED,
  'activity': ComponentType.ACTIVITY_FEED,
  'messages': ComponentType.DIRECT_MESSAGING_THREAD,

  // Healthcare
  'patient-list': ComponentType.DATA_TABLE,
  'patient-detail': ComponentType.DETAIL_VIEW,
  'appointments-list': ComponentType.DATA_TABLE,

  // Events
  'event-detail': ComponentType.EVENT_DETAIL_PAGE,

  // Detail views (using specific components where available)
  'appointment-detail': ComponentType.APPOINTMENT_SCHEDULER,
  'invoice-detail': ComponentType.INVOICE_DISPLAY,
  'reservation-detail': ComponentType.BOOKING_RESERVATION_FORM,
  'course-detail': ComponentType.CLASS_DETAIL_VIEW,
  'order-detail': ComponentType.ORDER_DETAILS_VIEW,
  'booking-detail': ComponentType.BOOKING_RESERVATION_FORM,
  'service-detail': ComponentType.DETAIL_VIEW,
  'client-detail': ComponentType.DETAIL_VIEW,
  'member-detail': ComponentType.USER_PROFILE_VIEW,
  'property-detail': ComponentType.PROPERTY_CARD,
  'listing-detail': ComponentType.PRODUCT_DETAIL_PAGE,

  // Notifications & Inbox
  'notifications-list': ComponentType.NOTIFICATION_LIST,
  'notifications': ComponentType.NOTIFICATION_LIST,
  'inbox': ComponentType.DIRECT_MESSAGING_THREAD,
  'messages-list': ComponentType.DIRECT_MESSAGING_THREAD,

  // Inventory & Orders (using specific components)
  'inventory-page': ComponentType.INVENTORY_STATUS,
  'inventory': ComponentType.INVENTORY_STATUS,
  'inventory-list': ComponentType.DATA_TABLE,
  'orders-page': ComponentType.ORDER_HISTORY_LIST,
  'orders': ComponentType.ORDER_HISTORY_LIST,
  'orders-list': ComponentType.ORDER_HISTORY_LIST,
  'order-history': ComponentType.ORDER_HISTORY_LIST,
  'order-tracking': ComponentType.ORDER_TRACKING,
  'order-tracking-page': ComponentType.ORDER_TRACKING,

  // Transactions & Finance (using specific components)
  'transaction-history-page': ComponentType.TRANSACTION_HISTORY,
  'transaction-history': ComponentType.TRANSACTION_HISTORY,
  'transactions': ComponentType.TRANSACTION_HISTORY,
  'payments': ComponentType.PAYMENT_HISTORY,
  'payments-list': ComponentType.PAYMENT_HISTORY,
  'invoices': ComponentType.ORDER_HISTORY_LIST,
  'invoices-list': ComponentType.ORDER_HISTORY_LIST,

  // Documents & Files
  'shared-documents': ComponentType.DATA_TABLE,
  'documents': ComponentType.DATA_TABLE,
  'documents-list': ComponentType.DATA_TABLE,
  'files': ComponentType.DATA_TABLE,
  'files-list': ComponentType.DATA_TABLE,

  // Calendar & Scheduling
  'calendar-view': ComponentType.CALENDAR,
  'calendar': ComponentType.CALENDAR,
  'schedule-view': ComponentType.CLASS_SCHEDULE_GRID,
  'schedule': ComponentType.CLASS_SCHEDULE_GRID,
  'availability': ComponentType.CALENDAR,

  // Subscriptions & Pricing
  'subscription-page': ComponentType.PRICING_TABLE_THREE,
  'subscriptions': ComponentType.DATA_TABLE,
  'pricing': ComponentType.PRICING_TABLE_THREE,
  'plans': ComponentType.PRICING_TABLE_THREE,

  // Confirmation pages
  'confirmation-page': ComponentType.ORDER_CONFIRMATION,
  'booking-confirmation': ComponentType.ORDER_CONFIRMATION,
  'payment-confirmation': ComponentType.ORDER_CONFIRMATION,

  // Reviews & Feedback
  'reviews-page': ComponentType.PRODUCT_REVIEWS_LIST,
  'reviews': ComponentType.PRODUCT_REVIEWS_LIST,
  'reviews-list': ComponentType.PRODUCT_REVIEWS_LIST,
  'testimonials': ComponentType.TESTIMONIAL_GRID,

  // Admin pages (generic)
  'admin-orders': ComponentType.DATA_TABLE,
  'admin-users': ComponentType.DATA_TABLE,
  'admin-customers': ComponentType.DATA_TABLE,
  'admin-products': ComponentType.DATA_TABLE,
  'admin-services': ComponentType.DATA_TABLE,
  'admin-appointments': ComponentType.DATA_TABLE,
  'admin-bookings': ComponentType.DATA_TABLE,
  'admin-invoices': ComponentType.DATA_TABLE,
  'admin-inventory': ComponentType.DATA_TABLE,
  'admin-reports': ComponentType.ANALYTICS_OVERVIEW_CARDS,

  // Lists (user-facing - using appropriate UI components)
  'clients-list': ComponentType.TEAM_MEMBERS_GRID,
  'customers-list': ComponentType.TEAM_MEMBERS_GRID,
  'members-list': ComponentType.TEAM_MEMBERS_GRID,
  'staff-list': ComponentType.TEAM_MEMBERS_GRID,
  'team-list': ComponentType.TEAM_MEMBERS_GRID,
  'services-list': ComponentType.PRODUCT_GRID,
  // 'products-list' already defined above at line 34
  'courses-list': ComponentType.PRODUCT_GRID,
  'classes-list': ComponentType.CLASS_SCHEDULE_GRID,
  'sessions-list': ComponentType.CALENDAR,
  'bookings-list': ComponentType.ORDER_HISTORY_LIST,
  // 'appointments-list' already defined above at line 80
  'properties-list': ComponentType.PRODUCT_GRID,
  'listings-list': ComponentType.PRODUCT_GRID,
  'projects-list': ComponentType.KANBAN_BOARD,
  'tasks-list': ComponentType.KANBAN_BOARD,

  // Agenda & Shifts
  'agenda-view': ComponentType.CALENDAR,
  'agenda': ComponentType.CALENDAR,
  'shift-detail': ComponentType.DETAIL_VIEW,
  'shift-view': ComponentType.DETAIL_VIEW,
  'shifts-list': ComponentType.DATA_TABLE,
  'shifts': ComponentType.DATA_TABLE,
  'roster': ComponentType.DATA_TABLE,
  'roster-view': ComponentType.DATA_TABLE,

  // Project & Case management
  'project-detail': ComponentType.DETAIL_VIEW,
  'case-detail': ComponentType.DETAIL_VIEW,
  'case-view': ComponentType.DETAIL_VIEW,
  'cases-list': ComponentType.DATA_TABLE,

  // Stock & Inventory management
  'stock-levels-page': ComponentType.DATA_TABLE,
  'stock-levels': ComponentType.DATA_TABLE,
  'stock': ComponentType.DATA_TABLE,

  // Order tracking (specific mappings already defined at lines 112-113 with ORDER_TRACKING)
  // 'order-tracking-page' and 'order-tracking' use ComponentType.ORDER_TRACKING
  'tracking-detail': ComponentType.ORDER_TRACKING,
  'tracking-page': ComponentType.ORDER_TRACKING,
  'shipment-tracking': ComponentType.ORDER_TRACKING,

  // Floor plan & Layouts
  'floor-plan': ComponentType.DATA_TABLE,
  'floor-view': ComponentType.DATA_TABLE,
  'seating-chart': ComponentType.DATA_TABLE,
  'layout-view': ComponentType.DATA_TABLE,

  // Special modes
  'kiosk-mode': ComponentType.DASHBOARD,
  'kiosk': ComponentType.DASHBOARD,
  'pos-view': ComponentType.DASHBOARD,
  'pos': ComponentType.DASHBOARD,

  // Tickets & Confirmations
  'ticket-confirmation': ComponentType.ORDER_CONFIRMATION,
  'ticket-detail': ComponentType.DETAIL_VIEW,
  'tickets-list': ComponentType.DATA_TABLE,

  // Medical & Health
  'medical-history': ComponentType.DATA_TABLE,
  'health-records': ComponentType.DATA_TABLE,
  'patient-records': ComponentType.DATA_TABLE,
  'vitals-history': ComponentType.DATA_TABLE,

  // Editors & Builders
  'curriculum-editor': ComponentType.DATA_TABLE,
  'content-editor': ComponentType.POST_COMPOSER,
  'menu-builder': ComponentType.DATA_TABLE,
  'form-builder': ComponentType.DATA_TABLE,

  // Rate & Pricing management
  'rate-manager': ComponentType.DATA_TABLE,
  'rates-list': ComponentType.DATA_TABLE,
  'pricing-manager': ComponentType.DATA_TABLE,

  // Client portal
  'client-portal': ComponentType.DASHBOARD,
  'customer-portal': ComponentType.DASHBOARD,
  'member-portal': ComponentType.DASHBOARD,
  'user-portal': ComponentType.DASHBOARD,

  // Reports
  'reports': ComponentType.ANALYTICS_OVERVIEW_CARDS,
  'reports-list': ComponentType.DATA_TABLE,
  'report-detail': ComponentType.DETAIL_VIEW,

  // Staff & HR
  'shift-swaps': ComponentType.DATA_TABLE,
  'shift-swap': ComponentType.DATA_TABLE,
  'time-entries-list': ComponentType.DATA_TABLE,
  'time-entries': ComponentType.DATA_TABLE,
  'attendance': ComponentType.DATA_TABLE,
  'child-attendance': ComponentType.DATA_TABLE,

  // Generic lists
  'list-page': ComponentType.DATA_TABLE,
  'list-view': ComponentType.DATA_TABLE,
  'browse': ComponentType.DATA_TABLE,
  'browse-page': ComponentType.DATA_TABLE,

  // File & Document detail
  'file-detail': ComponentType.DETAIL_VIEW,
  'document-detail': ComponentType.DETAIL_VIEW,

  // Task & Project management (using Kanban for task boards)
  'task-board': ComponentType.KANBAN_BOARD,
  'kanban': ComponentType.KANBAN_BOARD,
  'task-detail': ComponentType.DETAIL_VIEW,
  'project-board': ComponentType.KANBAN_BOARD,

  // Intake & Submissions
  'intake-detail': ComponentType.DETAIL_VIEW,
  'intake-form': ComponentType.FORM,
  'submission-view': ComponentType.DETAIL_VIEW,
  'submissions-list': ComponentType.DATA_TABLE,

  // Admin pages (more)
  'admin-check-ins': ComponentType.DATA_TABLE,
  'admin-patients': ComponentType.DATA_TABLE,
  'admin-staff': ComponentType.DATA_TABLE,
  'admin-reminders': ComponentType.DATA_TABLE,
  'admin-members': ComponentType.DATA_TABLE,
  'admin-schedules': ComponentType.DATA_TABLE,

  // Certificates & Builders
  'certificate-builder': ComponentType.DATA_TABLE,
  'certificate-detail': ComponentType.DETAIL_VIEW,
  'certificates-list': ComponentType.DATA_TABLE,

  // Routes & Logistics
  'route-detail': ComponentType.DETAIL_VIEW,
  'routes-list': ComponentType.DATA_TABLE,
  'route-planner': ComponentType.DATA_TABLE,

  // Service confirmation
  'service-confirmation': ComponentType.ORDER_CONFIRMATION,
  'appointment-confirmation': ComponentType.ORDER_CONFIRMATION,

  // Messaging
  'new-message': ComponentType.DIRECT_MESSAGING_THREAD,
  'compose-message': ComponentType.DIRECT_MESSAGING_THREAD,

  // Cases & Legal
  'my-cases': ComponentType.DATA_TABLE,
  'case-list': ComponentType.DATA_TABLE,

  // Vehicle & Equipment
  'vehicle-history-report': ComponentType.DETAIL_VIEW,
  'vehicle-detail': ComponentType.DETAIL_VIEW,
  'equipment-detail': ComponentType.DETAIL_VIEW,

  // Room & Space management
  'room-status': ComponentType.DATA_TABLE,
  'room-detail': ComponentType.DETAIL_VIEW,
  'rooms-list': ComponentType.DATA_TABLE,

  // Picking & Warehouse
  'picking-queue': ComponentType.DATA_TABLE,
  'packing-list': ComponentType.DATA_TABLE,
  'warehouse-view': ComponentType.DATA_TABLE,

  // Memberships
  'memberships-browse': ComponentType.DATA_TABLE,
  'membership-detail': ComponentType.DETAIL_VIEW,
  'memberships-list': ComponentType.DATA_TABLE,

  // Class & Course management
  'class-detail': ComponentType.CLASS_DETAIL_VIEW,
  'class-list': ComponentType.DATA_TABLE,
  'course-list': ComponentType.DATA_TABLE,

  // Bids & Auctions
  'bid-detail': ComponentType.DETAIL_VIEW,
  'bids-list': ComponentType.DATA_TABLE,
  'auction-detail': ComponentType.DETAIL_VIEW,

  // Academic
  'academic-record': ComponentType.DATA_TABLE,
  'grades': ComponentType.DATA_TABLE,
  'transcript': ComponentType.DETAIL_VIEW,

  // Restaurant & Food
  'menu-items': ComponentType.PRODUCT_GRID,
  'menu': ComponentType.PRODUCT_GRID,
  'menu-list': ComponentType.PRODUCT_GRID,
  'menu-categories': ComponentType.CATEGORY_GRID,
  'menu-detail': ComponentType.PRODUCT_DETAIL_PAGE,
  'menu-item-detail': ComponentType.PRODUCT_DETAIL_PAGE,
  'restaurant-menu': ComponentType.PRODUCT_GRID,
  'reservation-widget': ComponentType.BOOKING_RESERVATION_FORM,
  'table-management': ComponentType.DATA_TABLE,
  'order-queue': ComponentType.DATA_TABLE,

  // Medical & Healthcare
  'patient-chart': ComponentType.MEDICAL_RECORD_VIEW,
  'patient-intake': ComponentType.FORM,
  'vitals': ComponentType.DATA_TABLE,
  'diagnosis': ComponentType.DETAIL_VIEW,
  'treatment-plan': ComponentType.DETAIL_VIEW,
  'lab-orders': ComponentType.DATA_TABLE,
  'imaging-orders': ComponentType.DATA_TABLE,
  'clinical-notes': ComponentType.DATA_TABLE,

  // Warehouse & Logistics
  'bin-locations': ComponentType.DATA_TABLE,
  'pick-list': ComponentType.DATA_TABLE,
  'receiving': ComponentType.DATA_TABLE,
  'shipments': ComponentType.DATA_TABLE,
  'locations': ComponentType.DATA_TABLE,

  // Business Operations
  'bid-compare': ComponentType.DATA_TABLE,
  'order-entry': ComponentType.FORM,
  'order-builder': ComponentType.FORM,
  'quote-builder': ComponentType.FORM,
  'estimate-builder': ComponentType.FORM,
  'proposal-builder': ComponentType.FORM,

  // Memberships & Signups
  'membership-signup': ComponentType.FORM,
  'member-signup': ComponentType.FORM,
  'signup-form': ComponentType.FORM,
  'registration': ComponentType.FORM,
  'enroll': ComponentType.FORM,

  // Classes & Courses
  'course-builder': ComponentType.DATA_TABLE,
  'class-signup': ComponentType.FORM,
  'class-builder': ComponentType.DATA_TABLE,
  'curriculum-builder': ComponentType.DATA_TABLE,
  'lesson-builder': ComponentType.DATA_TABLE,
  'module-builder': ComponentType.DATA_TABLE,
  'admin-courses': ComponentType.DATA_TABLE,
  'admin-classes': ComponentType.DATA_TABLE,
  'admin-lessons': ComponentType.DATA_TABLE,

  // Warehouse & Inventory (more)
  'cycle-count': ComponentType.DATA_TABLE,
  'cycle-counts': ComponentType.DATA_TABLE,
  'stock-count': ComponentType.DATA_TABLE,
  'inventory-audit': ComponentType.DATA_TABLE,

  // POS & Sales
  'cash-drawer': ComponentType.DASHBOARD,
  'pos-terminal': ComponentType.DASHBOARD,
  'pos-register': ComponentType.DASHBOARD,
  'end-of-day': ComponentType.DASHBOARD,
  'sales-summary': ComponentType.DASHBOARD,

  // Bids & Auctions
  'admin-bids': ComponentType.DATA_TABLE,
  'bid-management': ComponentType.DATA_TABLE,
  'auction-management': ComponentType.DATA_TABLE,

  // Membership Management
  'freeze-request': ComponentType.FORM,
  'cancel-request': ComponentType.FORM,
  'upgrade-request': ComponentType.FORM,
  'membership-status': ComponentType.DETAIL_VIEW,

  // Carrier & Logistics Setup
  'carrier-setup': ComponentType.FORM,
  'carrier-management': ComponentType.DATA_TABLE,
  'shipping-setup': ComponentType.FORM,
  'shipping-zones': ComponentType.DATA_TABLE,

  // Logs & Summaries
  'daily-logs-summary': ComponentType.DATA_TABLE,
  'logs-summary': ComponentType.DATA_TABLE,
  'activity-summary': ComponentType.DATA_TABLE,
  'weekly-summary': ComponentType.DATA_TABLE,

  // Instructors & Staff
  'admin-instructors': ComponentType.DATA_TABLE,
  'instructor-management': ComponentType.DATA_TABLE,
  'trainer-management': ComponentType.DATA_TABLE,
  'coach-management': ComponentType.DATA_TABLE,

  // Assignments & Progress
  'admin-assignments': ComponentType.DATA_TABLE,
  'assignment-management': ComponentType.DATA_TABLE,
  'child-progress': ComponentType.DATA_TABLE,
  'student-progress': ComponentType.DATA_TABLE,
  'learner-progress': ComponentType.DATA_TABLE,

  // Badges & Achievements
  'badge-designer': ComponentType.DATA_TABLE,
  'badge-management': ComponentType.DATA_TABLE,
  'achievements': ComponentType.DATA_TABLE,
  'certificates-management': ComponentType.DATA_TABLE,
  'admin-badges': ComponentType.DATA_TABLE,

  // Labels & Printing
  'label-generator': ComponentType.FORM,
  'label-designer': ComponentType.FORM,
  'print-labels': ComponentType.FORM,
  'barcode-generator': ComponentType.FORM,

  // Daily Logs
  'admin-daily-logs': ComponentType.DATA_TABLE,
  'daily-logs': ComponentType.DATA_TABLE,
  'shift-logs': ComponentType.DATA_TABLE,
  'activity-logs': ComponentType.DATA_TABLE,

  // Student Management
  'student-add': ComponentType.FORM,
  'student-edit': ComponentType.FORM,
  'student-profile': ComponentType.USER_PROFILE,

  // Report Cards & Reports
  'report-cards': ComponentType.DATA_TABLE,
  'progress-reports': ComponentType.DATA_TABLE,
  'grade-reports': ComponentType.DATA_TABLE,

  // Carrier Management
  'admin-carriers': ComponentType.DATA_TABLE,
  'carrier-list': ComponentType.DATA_TABLE,
  'shipping-carriers': ComponentType.DATA_TABLE,

  // Class Selection
  'class-selection': ComponentType.DATA_TABLE,
  'course-selection': ComponentType.DATA_TABLE,
  'subject-selection': ComponentType.DATA_TABLE,

  // Credentials & Verification
  'credential-verify': ComponentType.FORM,
  'credential-verification': ComponentType.FORM,
  'verify-credentials': ComponentType.FORM,
  'certificate-verify': ComponentType.FORM,

  // Absence & Attendance
  'absence-management': ComponentType.DATA_TABLE,
  'absence-tracker': ComponentType.DATA_TABLE,
  'leave-management': ComponentType.DATA_TABLE,
  'time-off-requests': ComponentType.DATA_TABLE,
  'excuse-request': ComponentType.FORM,
  'excuse-form': ComponentType.FORM,

  // Certificate Issuance
  'issue-certificates': ComponentType.FORM,
  'certificate-issue': ComponentType.FORM,
  'generate-certificate': ComponentType.FORM,
  'award-certificate': ComponentType.FORM,

  // Common Missing Templates (bulk add)
  // Ticket & Purchase
  'ticket-purchase': ComponentType.CHECKOUT_STEPS,
  'ticket-checkout': ComponentType.CHECKOUT_STEPS,
  'buy-ticket': ComponentType.CHECKOUT_STEPS,
  'package-purchase': ComponentType.CHECKOUT_STEPS,
  'package-checkout': ComponentType.CHECKOUT_STEPS,
  'buy-package': ComponentType.CHECKOUT_STEPS,

  // Driver & Delivery Routes
  'driver-route': ComponentType.DATA_TABLE,
  'driver-routes': ComponentType.DATA_TABLE,
  'route-assignment': ComponentType.DATA_TABLE,
  'delivery-route': ComponentType.DATA_TABLE,
  'route-planning': ComponentType.DATA_TABLE,

  // Parts & Inventory
  'add-part': ComponentType.FORM,
  'part-entry': ComponentType.FORM,
  'parts-entry': ComponentType.FORM,
  'inventory-entry': ComponentType.FORM,

  // Cases & Admin
  'admin-cases': ComponentType.DATA_TABLE,
  'case-management': ComponentType.DATA_TABLE,
  'case-admin': ComponentType.DATA_TABLE,

  // Calculators
  'takeoff-calculator': ComponentType.FORM,
  'material-calculator': ComponentType.FORM,
  'payment-calculator': ComponentType.FORM,
  'quote-calculator': ComponentType.FORM,
  'duty-calculator': ComponentType.FORM,
  'valuation-tool': ComponentType.FORM,

  // Treatment & Health
  'treatment-progress': ComponentType.DATA_TABLE,
  'treatment-tracker': ComponentType.DATA_TABLE,
  'progress-tracking': ComponentType.DATA_TABLE,

  // Intake & Submissions
  'intake-submissions': ComponentType.DATA_TABLE,
  'intake-list': ComponentType.DATA_TABLE,
  'submissions': ComponentType.DATA_TABLE,

  // Showings & Requests
  'showing-requests': ComponentType.DATA_TABLE,
  'showing-scheduler': ComponentType.DATA_TABLE,
  'showing-calendar': ComponentType.CALENDAR,

  // Leases & Rooms
  'admin-leases': ComponentType.DATA_TABLE,
  'lease-management': ComponentType.DATA_TABLE,
  'admin-rooms': ComponentType.DATA_TABLE,
  'room-management': ComponentType.DATA_TABLE,

  // Gradebook & Education
  'gradebook': ComponentType.DATA_TABLE,
  'grade-book': ComponentType.DATA_TABLE,
  'grades-management': ComponentType.DATA_TABLE,
  'course-player': ComponentType.DETAIL_VIEW,
  'lesson-player': ComponentType.DETAIL_VIEW,

  // Prescriptions
  'new-prescription': ComponentType.FORM,
  'prescription-entry': ComponentType.FORM,
  'prescribe': ComponentType.FORM,

  // Fleet & Maps
  'fleet-map': ComponentType.DATA_TABLE,
  'vehicle-map': ComponentType.DATA_TABLE,
  'location-map': ComponentType.DATA_TABLE,

  // Sessions
  'session-signup': ComponentType.FORM,
  'session-register': ComponentType.FORM,
  'session-booking': ComponentType.BOOKING_RESERVATION_FORM,

  // Background Checks
  'run-history-check': ComponentType.FORM,
  'background-check': ComponentType.FORM,
  'history-check': ComponentType.FORM,

  // Incidents
  'incident-report': ComponentType.FORM,
  'incident-form': ComponentType.FORM,
  'incident-entry': ComponentType.FORM,

  // Insurance
  'insurance-verification': ComponentType.FORM,
  'insurance-verif': ComponentType.FORM,
  'verify-insurance': ComponentType.FORM,

  // Equipment
  'equipment-maintenance': ComponentType.DATA_TABLE,
  'equipment-mainte': ComponentType.DATA_TABLE,
  'maintenance-schedule': ComponentType.DATA_TABLE,

  // Workouts
  'workout-builder': ComponentType.DATA_TABLE,
  'workout-designer': ComponentType.DATA_TABLE,
  'exercise-builder': ComponentType.DATA_TABLE,

  // Requests & Approvals
  'submit-request': ComponentType.FORM,
  'request-form': ComponentType.FORM,
  'change-order-approval': ComponentType.DATA_TABLE,
  'change-order-app': ComponentType.DATA_TABLE,
  'approval-queue': ComponentType.DATA_TABLE,

  // More Common Missing Templates
  // Tickets (user-facing)
  'my-tickets': ComponentType.TICKET_LIST,
  'user-tickets': ComponentType.TICKET_LIST,
  'purchased-tickets': ComponentType.TICKET_LIST,

  // Admin Routes & Intakes
  'admin-routes': ComponentType.DATA_TABLE,
  'admin-intakes': ComponentType.DATA_TABLE,
  'admin-takeoffs': ComponentType.DATA_TABLE,
  'admin-trainers': ComponentType.DATA_TABLE,
  'admin-showings': ComponentType.DATA_TABLE,
  'admin-equipment': ComponentType.DATA_TABLE,
  'admin-subcontractors': ComponentType.DATA_TABLE,
  'admin-subcontract': ComponentType.DATA_TABLE,

  // Vendor & Service
  'vendor-management': ComponentType.DATA_TABLE,
  'vendor-list': ComponentType.DATA_TABLE,
  'service-requests': ComponentType.DATA_TABLE,
  'service-request': ComponentType.FORM,

  // Claims & Finance
  'new-claim': ComponentType.FORM,
  'claim-form': ComponentType.FORM,
  'file-claim': ComponentType.FORM,
  'finance-application': ComponentType.FORM,
  'finance-applicatio': ComponentType.FORM,
  'loan-application': ComponentType.FORM,
  'apply-online': ComponentType.FORM,
  'make-payment': ComponentType.FORM,
  'payment-form': ComponentType.FORM,

  // Grade Entry
  'grade-entry': ComponentType.FORM,
  'enter-grades': ComponentType.FORM,
  'grades-input': ComponentType.FORM,

  // Service Records
  'add-service-record': ComponentType.FORM,
  'service-record': ComponentType.FORM,
  'maintenance-record': ComponentType.FORM,

  // Geofencing
  'geofences': ComponentType.DATA_TABLE,
  'geofence-management': ComponentType.DATA_TABLE,
  'geo-zones': ComponentType.DATA_TABLE,

  // Medical Orders
  'new-imaging-order': ComponentType.FORM,
  'imaging-order': ComponentType.FORM,
  'new-lab-order': ComponentType.FORM,
  'lab-order': ComponentType.FORM,
  'patient-immunizations': ComponentType.DATA_TABLE,
  'patient-immuniza': ComponentType.DATA_TABLE,
  'immunization-record': ComponentType.DATA_TABLE,

  // Quiz & Progress
  'quiz-builder': ComponentType.DATA_TABLE,
  'quiz-designer': ComponentType.DATA_TABLE,
  'progress-charts': ComponentType.DATA_TABLE,
  'progress-graphs': ComponentType.DATA_TABLE,

  // Quotes & Analysis
  'my-quotes': ComponentType.DATA_TABLE,
  'user-quotes': ComponentType.DATA_TABLE,
  'market-analysis': ComponentType.DATA_TABLE,

  // Video Rooms
  'provider-video-room': ComponentType.DETAIL_VIEW,
  'provider-video-roo': ComponentType.DETAIL_VIEW,
  'video-room': ComponentType.DETAIL_VIEW,

  // Walkthrough & Inspections
  'punch-walkthrough': ComponentType.FORM,
  'punch-list': ComponentType.DATA_TABLE,
  'walkthrough-form': ComponentType.FORM,

  // Final Missing Templates
  // Packages
  'admin-packages': ComponentType.DATA_TABLE,
  'package-management': ComponentType.DATA_TABLE,
  'packages-list': ComponentType.DATA_TABLE,

  // Billing & Rates
  'billing-rates': ComponentType.DATA_TABLE,
  'rate-settings': ComponentType.DATA_TABLE,
  'pricing-rates': ComponentType.DATA_TABLE,

  // GPA & Calculators
  'gpa-calculator': ComponentType.FORM,
  'grade-calculator': ComponentType.FORM,
  'trade-in-calculator': ComponentType.FORM,
  'trade-in-calculato': ComponentType.FORM,

  // Document Generation
  'document-generate': ComponentType.FORM,
  'generate-document': ComponentType.FORM,
  'document-generator': ComponentType.FORM,

  // Recalls & Checks
  'recall-check': ComponentType.FORM,
  'recall-lookup': ComponentType.FORM,
  'safety-recall': ComponentType.DATA_TABLE,

  // Pre-qualification
  'pre-qualification': ComponentType.FORM,
  'pre-qualify': ComponentType.FORM,
  'prequalification': ComponentType.FORM,

  // Seat & Show Selection
  'seat-selection': ComponentType.FORM,
  'seat-picker': ComponentType.FORM,
  'select-seats': ComponentType.FORM,
  'admin-shows': ComponentType.DATA_TABLE,
  'show-management': ComponentType.DATA_TABLE,

  // Vaccines & Medical
  'administer-vaccine': ComponentType.FORM,
  'vaccine-admin': ComponentType.FORM,
  'vaccination-form': ComponentType.FORM,

  // Membership Purchase
  'membership-purchase': ComponentType.CHECKOUT_STEPS,
  'membership-purchas': ComponentType.CHECKOUT_STEPS,
  'buy-membership': ComponentType.CHECKOUT_STEPS,

  // Delivery
  'delivery-capture': ComponentType.FORM,
  'delivery-confirm': ComponentType.FORM,
  'proof-of-delivery': ComponentType.FORM,

  // Admin Quotes
  'admin-quotes': ComponentType.DATA_TABLE,
  'quote-management': ComponentType.DATA_TABLE,
  'quotes-admin': ComponentType.DATA_TABLE,

  // Measurements
  'measurements-log': ComponentType.DATA_TABLE,
  'measurement-history': ComponentType.DATA_TABLE,
  'body-measurements': ComponentType.DATA_TABLE,

  // Box Office
  'box-office-will-call': ComponentType.DATA_TABLE,
  'box-office-will-c': ComponentType.DATA_TABLE,
  'will-call': ComponentType.DATA_TABLE,
  'box-office': ComponentType.DATA_TABLE,

  // Final 10 Missing Templates
  'seat-confirmation': ComponentType.ORDER_CONFIRMATION,
  'trade-in-offer': ComponentType.DETAIL_VIEW,
  'trade-offer': ComponentType.DETAIL_VIEW,
  'body-stats': ComponentType.DATA_TABLE,
  'health-stats': ComponentType.DATA_TABLE,
  'portal-document-upload': ComponentType.FILE_UPLOAD_SINGLE,
  'portal-document': ComponentType.FILE_UPLOAD_SINGLE,
  'document-upload': ComponentType.FILE_UPLOAD_SINGLE,
  'case-notes': ComponentType.DATA_TABLE,
  'client-notes': ComponentType.DATA_TABLE,
  'delivery-exceptions': ComponentType.DATA_TABLE,
  'delivery-exception': ComponentType.DATA_TABLE,
  'exception-handling': ComponentType.DATA_TABLE,
  'admin-cash-reconciliation': ComponentType.DATA_TABLE,
  'admin-cash-r': ComponentType.DATA_TABLE,
  'cash-reconciliation': ComponentType.DATA_TABLE,

  // Last 3 Missing
  'admin-trade-ins': ComponentType.DATA_TABLE,
  'trade-in-management': ComponentType.DATA_TABLE,
  'portal-payment': ComponentType.FORM,
  'portal-checkout': ComponentType.CHECKOUT_STEPS,
  'fitness-goals': ComponentType.STATISTICS_CARDS,
  'goal-settings': ComponentType.STATISTICS_CARDS,
  'food-diary': ComponentType.ACTIVITY_FEED,
  'food-log': ComponentType.ACTIVITY_FEED,
  'meal-diary': ComponentType.ACTIVITY_FEED,
  'recipe-library': ComponentType.PRODUCT_GRID,
  'recipes-library': ComponentType.PRODUCT_GRID,
  'nutrition-goals': ComponentType.BUDGET_OVERVIEW,
  'nutrition-tracker': ComponentType.STATISTICS_CARDS,
  'calorie-tracker': ComponentType.STATISTICS_CARDS,
  'macro-goals': ComponentType.BUDGET_OVERVIEW,
  'weight-tracker': ComponentType.STATISTICS_CARDS,
  'body-composition': ComponentType.STATISTICS_CARDS,
  'supplement-tracker': ComponentType.ACTIVITY_FEED,
  'hydration-tracker': ComponentType.STATISTICS_CARDS,
  'sleep-tracker': ComponentType.STATISTICS_CARDS,
  'admin-recipes': ComponentType.DATA_TABLE,

  // ========================================
  // Social Network Templates
  // ========================================

  // Social Feed & Profile
  'followers': ComponentType.TEAM_MEMBERS_GRID,
  'following': ComponentType.TEAM_MEMBERS_GRID,
  'explore': ComponentType.SOCIAL_MEDIA_FEED,
  'groups': ComponentType.TEAM_MEMBERS_GRID,
  'group-detail': ComponentType.DETAIL_VIEW,
  'post-detail': ComponentType.BLOG_POST_CONTENT,
  'message-thread': ComponentType.DIRECT_MESSAGING_THREAD,
  'my-groups': ComponentType.TEAM_MEMBERS_GRID,
  'suggested-groups': ComponentType.TEAM_MEMBERS_GRID,

  // Generic fallbacks for common patterns
  'detail': ComponentType.DETAIL_VIEW,
  'list': ComponentType.DATA_TABLE,
  'form': ComponentType.FORM,
  'grid': ComponentType.DATA_TABLE,
  'table': ComponentType.DATA_TABLE,
  'view': ComponentType.DETAIL_VIEW,

  // Roles & Permissions
  'roles-permissions': ComponentType.DATA_TABLE,
  'roles': ComponentType.DATA_TABLE,
  'permissions': ComponentType.DATA_TABLE,
  'access-control': ComponentType.DATA_TABLE,

  // Service & Status
  'service-status': ComponentType.DATA_TABLE,
  'status-page': ComponentType.DATA_TABLE,
  'system-status': ComponentType.DATA_TABLE,

  // Visitor & Check-in
  'visitor-log': ComponentType.DATA_TABLE,
  'visitor-list': ComponentType.DATA_TABLE,
  'check-in': ComponentType.FORM,
  'check-in-list': ComponentType.DATA_TABLE,

  // Tasks (my) - user-facing, using appropriate UI components
  'my-tasks': ComponentType.KANBAN_BOARD,
  'my-orders': ComponentType.ORDER_HISTORY_LIST,
  'my-bookings': ComponentType.ORDER_HISTORY_LIST,
  'my-appointments': ComponentType.CALENDAR,
  'my-invoices': ComponentType.ORDER_HISTORY_LIST,
  'my-classes': ComponentType.CLASS_SCHEDULE_GRID,
  'my-courses': ComponentType.PRODUCT_GRID,
  'my-valuations': ComponentType.ORDER_HISTORY_LIST,
  'my-trade-ins': ComponentType.ORDER_HISTORY_LIST,

  // Enrollment & History
  'enrollment-history': ComponentType.DATA_TABLE,
  'enrollment-list': ComponentType.DATA_TABLE,
  'enrollment-detail': ComponentType.DETAIL_VIEW,

  // Dispatch & Logistics
  'dispatch-board': ComponentType.DATA_TABLE,
  'dispatch-list': ComponentType.DATA_TABLE,
  'dispatch-detail': ComponentType.DETAIL_VIEW,

  // Certificate templates
  'certificate-templates': ComponentType.DATA_TABLE,
  'templates-list': ComponentType.DATA_TABLE,
  'template-editor': ComponentType.POST_COMPOSER,

  // Admin (more)
  'admin-venues': ComponentType.DATA_TABLE,
  'admin-box-office': ComponentType.DATA_TABLE,
  'admin-gallery': ComponentType.DATA_TABLE,
  'admin-warehouse': ComponentType.DATA_TABLE,
  'admin-billing': ComponentType.DATA_TABLE,
  'admin-tickets': ComponentType.DATA_TABLE,
  'admin-show-instances': ComponentType.DATA_TABLE,
  'admin-safety': ComponentType.DATA_TABLE,

  // Confirmations
  'test-drive-confirmation': ComponentType.ORDER_CONFIRMATION,
  'rental-confirmation': ComponentType.ORDER_CONFIRMATION,

  // Reports & Documents
  'plagiarism-report': ComponentType.DETAIL_VIEW,
  'inspection-report': ComponentType.DETAIL_VIEW,
  'audit-report': ComponentType.DETAIL_VIEW,

  // Expenses & Finance (using specific components)
  'expenses': ComponentType.EXPENSE_LIST,
  'expenses-list': ComponentType.EXPENSE_LIST,
  'expense-detail': ComponentType.DETAIL_VIEW,
  'budget': ComponentType.BUDGET_OVERVIEW,
  'budget-overview': ComponentType.BUDGET_OVERVIEW,

  // Parts & Inventory
  'parts-by-vehicle': ComponentType.DATA_TABLE,
  'parts-list': ComponentType.DATA_TABLE,
  'parts-catalog': ComponentType.DATA_TABLE,

  // Member account
  'member-account': ComponentType.USER_PROFILE,
  'my-account': ComponentType.USER_PROFILE,
  'account': ComponentType.USER_PROFILE,

  // Workflow & Builders
  'workflow-builder': ComponentType.DATA_TABLE,
  'process-builder': ComponentType.DATA_TABLE,

  // Alerts & Notifications (user-facing)
  'vital-alerts': ComponentType.NOTIFICATION_LIST,
  'alerts': ComponentType.NOTIFICATION_LIST,
  'alerts-list': ComponentType.NOTIFICATION_LIST,

  // Waiting rooms
  'virtual-waiting-room': ComponentType.DATA_TABLE,
  'waiting-list': ComponentType.DATA_TABLE,
  'queue': ComponentType.DATA_TABLE,

  // Compliance & Subcontractors
  'subcontractor-compliance': ComponentType.DATA_TABLE,
  'compliance-list': ComponentType.DATA_TABLE,
  'compliance-detail': ComponentType.DETAIL_VIEW,

  // Renewal & Tracking
  'renewal-tracker': ComponentType.DATA_TABLE,
  'renewals': ComponentType.DATA_TABLE,

  // Kitchen & Operations
  'kitchen-screen': ComponentType.DATA_TABLE,
  'kitchen-display': ComponentType.DATA_TABLE,

  // Inspections
  'inspections': ComponentType.DATA_TABLE,
  'inspection-detail': ComponentType.DETAIL_VIEW,
  'inspection-list': ComponentType.DATA_TABLE,

  // Medical records (using healthcare components)
  'immunization-records': ComponentType.DATA_TABLE,
  'medical-records': ComponentType.MEDICAL_RECORD_VIEW,
  'health-history': ComponentType.MEDICAL_RECORD_VIEW,
  'prescriptions': ComponentType.PRESCRIPTION_LIST,
  'prescription-list': ComponentType.PRESCRIPTION_LIST,

  // Editors
  'document-edit': ComponentType.POST_COMPOSER,
  'contract-editor': ComponentType.POST_COMPOSER,
  'document-editor': ComponentType.POST_COMPOSER,

  // Work orders
  'work-order': ComponentType.DETAIL_VIEW,
  'work-orders': ComponentType.DATA_TABLE,
  'work-order-list': ComponentType.DATA_TABLE,
  'work-order-detail': ComponentType.DETAIL_VIEW,

  // Member billing
  'member-billing': ComponentType.DATA_TABLE,
  'billing-history': ComponentType.DATA_TABLE,
  'payment-history': ComponentType.DATA_TABLE,
  'member-benefits': ComponentType.DATA_TABLE,

  // Trip & Travel
  'trip-history': ComponentType.ORDER_HISTORY_LIST,
  'trips': ComponentType.ORDER_HISTORY_LIST,
  'trip-detail': ComponentType.DETAIL_VIEW,

  // Admin (even more)
  'admin-issued-certificates': ComponentType.DATA_TABLE,
  'admin-album': ComponentType.DATA_TABLE,
  'admin-vitals': ComponentType.DATA_TABLE,
  'admin-valuations': ComponentType.DATA_TABLE,
  'admin-chat': ComponentType.DIRECT_MESSAGING_THREAD,
  'admin-certificates': ComponentType.DATA_TABLE,
  'admin-photos': ComponentType.DATA_TABLE,
  'admin-media': ComponentType.DATA_TABLE,

  // Student management
  'student-groups': ComponentType.DATA_TABLE,
  'students-list': ComponentType.DATA_TABLE,
  'student-detail': ComponentType.DETAIL_VIEW,

  // Enrollment
  'enrollment-wizard': ComponentType.FORM,
  'enrollment-form': ComponentType.FORM,
  'registration-wizard': ComponentType.FORM,

  // Document signing
  'document-sign': ComponentType.FORM,
  'sign-contract': ComponentType.FORM,
  'signature-form': ComponentType.FORM,
  'e-signature': ComponentType.FORM,

  // Test drives
  'my-test-drives': ComponentType.ORDER_HISTORY_LIST,
  'test-drives': ComponentType.ORDER_HISTORY_LIST,
  'test-drive-detail': ComponentType.DETAIL_VIEW,

  // Events (upcoming)
  'upcoming-events': ComponentType.EVENT_GRID,
  'events-list': ComponentType.EVENT_GRID,
  'event-list': ComponentType.EVENT_GRID,

  // Rubric & Grading
  'rubric-editor': ComponentType.DATA_TABLE,
  'rubrics': ComponentType.DATA_TABLE,
  'grading': ComponentType.DATA_TABLE,

  // Discounts & Deals
  'discounts-page': ComponentType.PRODUCT_GRID,
  'discounts': ComponentType.PRODUCT_GRID,
  'coupons': ComponentType.PRODUCT_GRID,
  'deals-pipeline': ComponentType.KANBAN_BOARD,
  'deals': ComponentType.KANBAN_BOARD,

  // Video & Consultation
  'video-consultation': ComponentType.DETAIL_VIEW,
  'consultation-room': ComponentType.DETAIL_VIEW,
  'video-call': ComponentType.DETAIL_VIEW,

  // Quotes & Results
  'quote-results': ComponentType.DETAIL_VIEW,
  'quote-detail': ComponentType.DETAIL_VIEW,
  'quotes-list': ComponentType.DATA_TABLE,

  // Timer & Prep
  'prep-timer': ComponentType.DATA_TABLE,
  'timer': ComponentType.DATA_TABLE,
  'countdown': ComponentType.DATA_TABLE,

  // Portals
  'pharmacy-portal': ComponentType.DASHBOARD,
  'guest-portal': ComponentType.DASHBOARD,
  'vendor-portal': ComponentType.DASHBOARD,
  'supplier-portal': ComponentType.DASHBOARD,

  // Approvals
  'my-approvals': ComponentType.ORDER_HISTORY_LIST,
  'approvals': ComponentType.ORDER_HISTORY_LIST,
  'pending-approvals': ComponentType.ORDER_HISTORY_LIST,

  // Move in/out
  'move-in-out': ComponentType.DATA_TABLE,
  'move-in': ComponentType.FORM,
  'move-out': ComponentType.FORM,

  // Immunization
  'immunization-due': ComponentType.DATA_TABLE,
  'vaccinations': ComponentType.DATA_TABLE,

  // Driver & Deliveries
  'driver-deliveries': ComponentType.ORDER_HISTORY_LIST,
  'deliveries': ComponentType.ORDER_HISTORY_LIST,
  'delivery-list': ComponentType.ORDER_HISTORY_LIST,
  'delivery-detail': ComponentType.DETAIL_VIEW,

  // Clearance
  'clearance-tracker': ComponentType.DATA_TABLE,
  'clearance': ComponentType.DATA_TABLE,

  // Driver & Scorecards
  'driver-scorecards': ComponentType.DATA_TABLE,
  'scorecards': ComponentType.DATA_TABLE,
  'scorecard-detail': ComponentType.DETAIL_VIEW,
  'performance-scores': ComponentType.DATA_TABLE,

  // Education & Registration
  'drop-add': ComponentType.DATA_TABLE,
  'course-registration': ComponentType.DATA_TABLE,
  'class-registration': ComponentType.DATA_TABLE,

  // Sessions (my)
  'my-sessions': ComponentType.ORDER_HISTORY_LIST,
  'session-history': ComponentType.ACTIVITY_FEED,
  'session-detail': ComponentType.DETAIL_VIEW,

  // Template & Builder
  'template-builder': ComponentType.DATA_TABLE,
  'template-list': ComponentType.DATA_TABLE,
  'template-detail': ComponentType.DETAIL_VIEW,

  // Groups (additional)
  'my-group': ComponentType.TEAM_MEMBERS_GRID,
  'group-sessions': ComponentType.CLASS_SCHEDULE_GRID,

  // Recall & Results
  'recall-results': ComponentType.DATA_TABLE,
  'recalls': ComponentType.DATA_TABLE,
  'recall-detail': ComponentType.DETAIL_VIEW,

  // Grade & Academic
  'grade-scales': ComponentType.DATA_TABLE,
  'grading-scales': ComponentType.DATA_TABLE,

  // Concierge & Service
  'concierge': ComponentType.DASHBOARD,
  'service-desk': ComponentType.DASHBOARD,
  'help-desk': ComponentType.DATA_TABLE,

  // Admin (more types)
  'admin-prescriptions': ComponentType.DATA_TABLE,
  'admin-pods': ComponentType.DATA_TABLE,
  'admin-telehealth': ComponentType.DATA_TABLE,
  'admin-maintenance': ComponentType.DATA_TABLE,
  'admin-immunizations': ComponentType.DATA_TABLE,
  'admin-imaging': ComponentType.DATA_TABLE,
  'admin-announcements': ComponentType.DATA_TABLE,
  'admin-treatments': ComponentType.DATA_TABLE,
  'admin-procedures': ComponentType.DATA_TABLE,

  // Vehicle financing
  'vehicle-financing': ComponentType.DATA_TABLE,
  'financing-options': ComponentType.DATA_TABLE,
  'loan-calculator': ComponentType.FORM,

  // Workflow
  'workflow-runs': ComponentType.DATA_TABLE,
  'workflow-history': ComponentType.DATA_TABLE,
  'workflow-detail': ComponentType.DETAIL_VIEW,

  // Promotions
  'promotions-page': ComponentType.PRODUCT_GRID,
  'promotions': ComponentType.PRODUCT_GRID,
  'offers': ComponentType.PRODUCT_GRID,

  // Court & Legal
  'court-directory': ComponentType.DATA_TABLE,
  'court-list': ComponentType.DATA_TABLE,
  'legal-directory': ComponentType.DATA_TABLE,

  // Workout & Fitness
  'workout-log': ComponentType.ACTIVITY_FEED,
  'workout-history': ComponentType.ACTIVITY_FEED,
  'exercise-log': ComponentType.ACTIVITY_FEED,

  // Rate & Management
  'rate-management': ComponentType.DATA_TABLE,
  'rate-list': ComponentType.DATA_TABLE,
  'pricing-list': ComponentType.DATA_TABLE,

  // HS Code & Customs
  'hs-code-lookup': ComponentType.DATA_TABLE,
  'customs-lookup': ComponentType.DATA_TABLE,
  'tariff-lookup': ComponentType.DATA_TABLE,

  // Enrollments (my)
  'my-enrollments': ComponentType.ORDER_HISTORY_LIST,
  'my-registrations': ComponentType.ORDER_HISTORY_LIST,
  'my-subscriptions': ComponentType.ORDER_HISTORY_LIST,

  // Admin (fleet & sessions)
  'admin-fleet': ComponentType.DATA_TABLE,
  'admin-sessions': ComponentType.DATA_TABLE,
  'admin-guest-services': ComponentType.DATA_TABLE,
  'admin-rent': ComponentType.DATA_TABLE,
  'admin-customs': ComponentType.DATA_TABLE,
  'admin-vehicles': ComponentType.DATA_TABLE,
  'admin-drivers': ComponentType.DATA_TABLE,

  // Recall & Campaigns
  'recall-campaign': ComponentType.DATA_TABLE,
  'campaigns': ComponentType.DATA_TABLE,
  'campaign-detail': ComponentType.DETAIL_VIEW,

  // Application status
  'application-status': ComponentType.DATA_TABLE,
  'applications': ComponentType.DATA_TABLE,
  'application-detail': ComponentType.DETAIL_VIEW,

  // Portal cases
  'portal-cases': ComponentType.DATA_TABLE,
  'case-portal': ComponentType.DATA_TABLE,

  // Team & Workouts
  'team-workouts': ComponentType.DATA_TABLE,
  'team-activities': ComponentType.DATA_TABLE,
  'team-schedule': ComponentType.DATA_TABLE,

  // Note templates
  'note-templates': ComponentType.DATA_TABLE,
  'notes-list': ComponentType.DATA_TABLE,
  'note-detail': ComponentType.DETAIL_VIEW,

  // Tour & Builder
  'tour-builder': ComponentType.DATA_TABLE,
  'tour-list': ComponentType.DATA_TABLE,
  'tour-detail': ComponentType.DETAIL_VIEW,

  // Quiz & Assessment
  'quiz-page': ComponentType.PRODUCT_GRID,
  'quizzes': ComponentType.PRODUCT_GRID,
  'quiz-detail': ComponentType.DETAIL_VIEW,
  'assessment': ComponentType.FORM,

  // Screening & Lab
  'screening-report': ComponentType.DETAIL_VIEW,
  'screening-list': ComponentType.DATA_TABLE,
  'lab-results': ComponentType.DATA_TABLE,
  'test-results': ComponentType.DATA_TABLE,

  // Exercise library
  'exercise-library': ComponentType.PRODUCT_GRID,
  'exercises': ComponentType.PRODUCT_GRID,
  'exercise-detail': ComponentType.DETAIL_VIEW,

  // Admin (enrollments & requests)
  'admin-enrollments': ComponentType.DATA_TABLE,
  'admin-requests': ComponentType.DATA_TABLE,
  'admin-screening': ComponentType.DATA_TABLE,
  'admin-registrations': ComponentType.DATA_TABLE,

  // Personal records
  'personal-records': ComponentType.ACTIVITY_FEED,
  'my-records': ComponentType.ACTIVITY_FEED,
  'progress-photos': ComponentType.IMAGE_GALLERY_GRID,
  'photo-gallery': ComponentType.IMAGE_GALLERY_GRID,

  // Portal & Conversations
  'portal-conversation': ComponentType.DIRECT_MESSAGING_THREAD,
  'conversation': ComponentType.DIRECT_MESSAGING_THREAD,
  'chat': ComponentType.DIRECT_MESSAGING_THREAD,

  // Bootcamps
  'bootcamps': ComponentType.PRODUCT_GRID,
  'bootcamp-detail': ComponentType.DETAIL_VIEW,
  'programs': ComponentType.PRODUCT_GRID,
  'program-detail': ComponentType.DETAIL_VIEW,

  // Tour editing
  'tour-edit': ComponentType.POST_COMPOSER,
  'tour-editor': ComponentType.POST_COMPOSER,

  // Quiz results
  'quiz-results': ComponentType.DATA_TABLE,
  'results': ComponentType.DATA_TABLE,
  'score-report': ComponentType.DETAIL_VIEW,

  // Equipment & Check-in
  'equipment-checkin': ComponentType.FORM,
  'equipment-checkout': ComponentType.FORM,
  'equipment-list': ComponentType.DATA_TABLE,

  // Patient records
  'patient-lab-history': ComponentType.DATA_TABLE,
  'lab-history': ComponentType.DATA_TABLE,
  'patient-history': ComponentType.DATA_TABLE,

  // Registration & Periods
  'admin-registration-periods': ComponentType.DATA_TABLE,
  'registration-periods': ComponentType.DATA_TABLE,
  'academic-periods': ComponentType.DATA_TABLE,
  'semesters': ComponentType.DATA_TABLE,

  // Rate management
  'rate-parity': ComponentType.DATA_TABLE,
  'rate-rules': ComponentType.DATA_TABLE,

  // Progress & Tracking
  'macro-tracker': ComponentType.STATISTICS_CARDS,
  'progress-tracker': ComponentType.STATISTICS_CARDS,
  'goal-tracker': ComponentType.STATISTICS_CARDS,
  'habit-tracker': ComponentType.ACTIVITY_FEED,

  // Admin (tours & laboratory)
  'admin-tours': ComponentType.DATA_TABLE,
  'admin-laboratory': ComponentType.DATA_TABLE,
  'admin-lab': ComponentType.DATA_TABLE,
  'admin-studies': ComponentType.DATA_TABLE,

  // ========================================
  // Missing feature templateIds (comprehensive)
  // ========================================

  // Forms - Add/Create/Edit/Submit/Write
  'add-client': ComponentType.FORM,
  'add-payment-method-page': ComponentType.CREDIT_CARD_FORM,
  'create-announcement': ComponentType.FORM,
  'create-discount-page': ComponentType.FORM,
  'create-event': ComponentType.FORM,
  'create-ticket': ComponentType.FORM,
  'edit-discount-page': ComponentType.FORM,
  'edit-review-page': ComponentType.FORM,
  'submit-feedback': ComponentType.FEEDBACK_FORM,
  'write-review-page': ComponentType.FORM,
  'email-compose': ComponentType.POST_COMPOSER,
  'invoice-create': ComponentType.FORM,
  'invoice-edit': ComponentType.FORM,
  'make-reservation': ComponentType.BOOKING_RESERVATION_FORM,
  'join-waitlist': ComponentType.FORM,

  // Analytics & Dashboards
  'admin-analytics-dashboard': ComponentType.ANALYTICS_OVERVIEW_CARDS,
  'analytics-dashboard': ComponentType.ANALYTICS_OVERVIEW_CARDS,
  'analytics-page': ComponentType.ANALYTICS_OVERVIEW_CARDS,
  'main-dashboard': ComponentType.DASHBOARD,
  'time-tracking-dashboard': ComponentType.DASHBOARD,

  // Admin pages
  'admin-documents': ComponentType.DATA_TABLE,
  'admin-feedback': ComponentType.DATA_TABLE,
  'admin-media-library': ComponentType.DATA_TABLE,
  'admin-order-detail-page': ComponentType.ORDER_DETAILS_VIEW,
  'admin-orders-page': ComponentType.DATA_TABLE,
  'admin-reservations': ComponentType.DATA_TABLE,
  'admin-review-detail-page': ComponentType.DETAIL_VIEW,
  'admin-reviews-page': ComponentType.DATA_TABLE,
  'admin-schedule': ComponentType.CLASS_SCHEDULE_GRID,
  'admin-tables': ComponentType.DATA_TABLE,
  'admin-tags': ComponentType.DATA_TABLE,
  'admin-ticket-view': ComponentType.DETAIL_VIEW,
  'admin-waitlist': ComponentType.DATA_TABLE,

  // List pages
  'announcements-list': ComponentType.ACTIVITY_FEED,
  'categories-list': ComponentType.CATEGORY_GRID,
  'companies-list': ComponentType.COMPANY_CARD_GRID,
  'contacts-list': ComponentType.TEAM_MEMBERS_GRID,
  'contracts-list': ComponentType.ORDER_HISTORY_LIST,
  'email-logs': ComponentType.DATA_TABLE,
  'email-templates': ComponentType.DATA_TABLE,
  'gallery-list': ComponentType.IMAGE_GALLERY_GRID,
  'pages-list': ComponentType.BLOG_GRID,
  'playlists': ComponentType.PLAYLIST_INTERFACE,
  'reservations-list': ComponentType.ORDER_HISTORY_LIST,
  'tags-list': ComponentType.TAG_CLOUD_WIDGET,
  'workflows-list': ComponentType.KANBAN_BOARD,

  // Detail/View pages
  'album-view': ComponentType.DETAIL_VIEW,
  'announcement-detail': ComponentType.DETAIL_VIEW,
  'contact-detail': ComponentType.DETAIL_VIEW,
  'contract-detail': ComponentType.DETAIL_VIEW,
  'deal-detail': ComponentType.DETAIL_VIEW,
  'detail-page': ComponentType.DETAIL_VIEW,
  'document-view': ComponentType.DETAIL_VIEW,
  'feedback-detail': ComponentType.DETAIL_VIEW,
  'order-detail-page': ComponentType.ORDER_DETAILS_VIEW,
  'playlist-view': ComponentType.DETAIL_VIEW,
  'report-view': ComponentType.DETAIL_VIEW,
  'tag-page': ComponentType.DETAIL_VIEW,
  'waitlist-status': ComponentType.DETAIL_VIEW,
  'media-player': ComponentType.DETAIL_VIEW,

  // Settings pages
  'availability-settings': ComponentType.USER_PROFILE,
  'blocked-times': ComponentType.CALENDAR,
  'invoice-settings': ComponentType.USER_PROFILE,
  'organization-settings': ComponentType.USER_PROFILE,
  'profile-settings': ComponentType.PROFILE_EDIT_FORM,
  'reminders-settings': ComponentType.USER_PROFILE,
  'security-settings': ComponentType.USER_PROFILE,
  'settings-page': ComponentType.USER_PROFILE,
  'special-hours': ComponentType.CALENDAR,

  // Builder/Editor pages
  'blocks-library': ComponentType.DATA_TABLE,
  'custom-reports-builder': ComponentType.DATA_TABLE,
  'menus-editor': ComponentType.DATA_TABLE,
  'page-editor': ComponentType.POST_COMPOSER,
  'report-builder': ComponentType.DATA_TABLE,

  // Chat/Messaging
  'chat-home': ComponentType.DIRECT_MESSAGING_THREAD,
  'chat-room': ComponentType.DIRECT_MESSAGING_THREAD,

  // E-commerce
  'cart-page': ComponentType.SHOPPING_CART,
  'checkout-page': ComponentType.CHECKOUT_STEPS,
  'coupons-page': ComponentType.DATA_TABLE,
  'payment-methods-page': ComponentType.DATA_TABLE,
  'pricing-page': ComponentType.PRICING_TABLE_THREE,
  'reorder-page': ComponentType.SHOPPING_CART,
  'wishlist-page': ComponentType.WISHLIST,
  'shared-wishlist-page': ComponentType.WISHLIST,
  'vendor-orders-page': ComponentType.DATA_TABLE,
  'vendor-reviews-page': ComponentType.DATA_TABLE,
  'stock-movements-page': ComponentType.DATA_TABLE,

  // Auth & Profile
  'auth-page': ComponentType.LOGIN_FORM,
  'profile-page': ComponentType.USER_PROFILE,
  'invite-members': ComponentType.FORM,

  // Files & Media
  'file-manager': ComponentType.DATA_TABLE,
  'media-library': ComponentType.DATA_TABLE,
  'project-files': ComponentType.DATA_TABLE,
  'upload-page': ComponentType.FILE_UPLOAD_SINGLE,

  // Reports & Analytics
  'reports-page': ComponentType.DATA_TABLE,
  'scheduled-reports': ComponentType.DATA_TABLE,

  // Feedback
  'feedback-board': ComponentType.DATA_TABLE,

  // Check-in & Form
  'check-in-page': ComponentType.FORM,
  'form-page': ComponentType.FORM,

  // Time & Calendar
  'project-timeline': ComponentType.CALENDAR,
  'scheduled-reminders': ComponentType.DATA_TABLE,
  'time-off': ComponentType.CALENDAR,
  'timer-page': ComponentType.DETAIL_VIEW,

  // ========================================
  // Missing Template Mappings (from test failures)
  // ========================================

  // Editor/Create forms for various entities
  'course-editor': ComponentType.FORM,
  'curriculum-edit': ComponentType.FORM,
  'lesson-editor': ComponentType.FORM,
  'module-editor': ComponentType.FORM,
  'admin-ticket-create': ComponentType.FORM,
  'ticket-create': ComponentType.FORM,
  'vehicle-create': ComponentType.FORM,
  'vehicle-edit': ComponentType.FORM,
  'bid-create': ComponentType.FORM,
  'bid-edit': ComponentType.FORM,
  'create-shipment': ComponentType.FORM,
  'shipment-create': ComponentType.FORM,
  'shipment-edit': ComponentType.FORM,
  'claim-create': ComponentType.FORM,
  'claim-edit': ComponentType.FORM,
  'treatment-create': ComponentType.FORM,
  'treatment-edit': ComponentType.FORM,
  'lease-create': ComponentType.FORM,
  'lease-edit': ComponentType.FORM,
  'admin-venue-create': ComponentType.FORM,
  'venue-create': ComponentType.FORM,
  'venue-edit': ComponentType.FORM,
  'daily-log-create': ComponentType.FORM,
  'log-create': ComponentType.FORM,

  // Property & Real Estate
  'property-create': ComponentType.FORM,
  'property-edit': ComponentType.FORM,
  'listing-create': ComponentType.FORM,
  'listing-edit': ComponentType.FORM,
  'unit-create': ComponentType.FORM,
  'unit-edit': ComponentType.FORM,
  'tenant-create': ComponentType.FORM,
  'tenant-edit': ComponentType.FORM,

  // Healthcare & Medical
  'patient-create': ComponentType.FORM,
  'patient-edit': ComponentType.FORM,
  'appointment-create': ComponentType.BOOKING_RESERVATION_FORM,
  'appointment-edit': ComponentType.BOOKING_RESERVATION_FORM,
  'prescription-create': ComponentType.FORM,
  'prescription-edit': ComponentType.FORM,
  'diagnosis-create': ComponentType.FORM,
  'lab-order-create': ComponentType.FORM,
  'imaging-order-create': ComponentType.FORM,
  'referral-create': ComponentType.FORM,
  'procedure-create': ComponentType.FORM,

  // Events & Venues
  'event-create': ComponentType.FORM,
  'event-edit': ComponentType.FORM,
  'show-create': ComponentType.FORM,
  'show-edit': ComponentType.FORM,
  'performance-create': ComponentType.FORM,
  'seating-create': ComponentType.FORM,

  // Automotive & Fleet
  'service-create': ComponentType.FORM,
  'service-edit': ComponentType.FORM,
  'maintenance-create': ComponentType.FORM,
  'repair-create': ComponentType.FORM,
  'inspection-create': ComponentType.FORM,
  'test-drive-create': ComponentType.BOOKING_RESERVATION_FORM,
  'trade-in-create': ComponentType.FORM,

  // Shipping & Logistics
  'delivery-create': ComponentType.FORM,
  'route-create': ComponentType.FORM,
  'pickup-create': ComponentType.FORM,
  'customs-create': ComponentType.FORM,
  'manifest-create': ComponentType.FORM,
  'container-create': ComponentType.FORM,

  // Education & Training
  'student-create': ComponentType.FORM,
  'enrollment-create': ComponentType.FORM,
  'assignment-create': ComponentType.FORM,
  'grade-create': ComponentType.FORM,
  'class-create': ComponentType.FORM,
  'session-create': ComponentType.FORM,
  'attendance-create': ComponentType.FORM,

  // Finance & Insurance
  'policy-create': ComponentType.FORM,
  'policy-edit': ComponentType.FORM,
  'quote-create': ComponentType.FORM,
  'coverage-create': ComponentType.FORM,
  'premium-create': ComponentType.FORM,

  // Legal & Compliance
  'contract-create': ComponentType.FORM,
  'contract-edit': ComponentType.FORM,
  'document-create': ComponentType.FORM,
  'agreement-create': ComponentType.FORM,

  // HR & Staff
  'employee-create': ComponentType.FORM,
  'employee-edit': ComponentType.FORM,
  'schedule-create': ComponentType.FORM,
  'shift-create': ComponentType.FORM,
  'timesheet-create': ComponentType.FORM,
  'leave-create': ComponentType.FORM,
  'payroll-create': ComponentType.FORM,

  // Inventory & Warehouse
  'item-create': ComponentType.FORM,
  'item-edit': ComponentType.FORM,
  'sku-create': ComponentType.FORM,
  'transfer-create': ComponentType.FORM,
  'adjustment-create': ComponentType.FORM,
  'reorder-create': ComponentType.FORM,

  // Projects & Tasks
  'project-create': ComponentType.FORM,
  'project-edit': ComponentType.FORM,
  'task-create': ComponentType.FORM,
  'task-edit': ComponentType.FORM,
  'milestone-create': ComponentType.FORM,
  'workorder-create': ComponentType.FORM,
  'change-order-create': ComponentType.FORM,

  // Sales & CRM
  'lead-create': ComponentType.FORM,
  'lead-edit': ComponentType.FORM,
  'opportunity-create': ComponentType.FORM,
  'deal-create': ComponentType.FORM,
  'proposal-create': ComponentType.FORM,
  'estimate-create': ComponentType.FORM,

  // Memberships & Subscriptions
  'member-create': ComponentType.FORM,
  'subscription-create': ComponentType.FORM,
  'pass-create': ComponentType.FORM,
  'package-create': ComponentType.FORM,

  // Pet & Animal Care
  'pet-create': ComponentType.FORM,
  'pet-edit': ComponentType.FORM,
  'vaccination-create': ComponentType.FORM,
  'grooming-create': ComponentType.BOOKING_RESERVATION_FORM,

  // Food & Restaurant
  'order-create': ComponentType.FORM,
  'reservation-create': ComponentType.BOOKING_RESERVATION_FORM,
  'menu-item-create': ComponentType.FORM,
  'recipe-create': ComponentType.FORM,

  // Construction & Trades
  'takeoff-create': ComponentType.FORM,
  'material-create': ComponentType.FORM,
  'subcontractor-create': ComponentType.FORM,
  'permit-create': ComponentType.FORM,
  'punch-create': ComponentType.FORM,

  // Fitness & Wellness
  'workout-create': ComponentType.FORM,
  'exercise-create': ComponentType.FORM,
  'program-create': ComponentType.FORM,
  'class-signup-create': ComponentType.BOOKING_RESERVATION_FORM,
  'trainer-create': ComponentType.FORM,

  // Generic create/edit patterns
  'admin-create': ComponentType.FORM,
  'create': ComponentType.FORM,
  'new': ComponentType.FORM,
  'edit': ComponentType.FORM,
  'add': ComponentType.FORM,
  'update': ComponentType.FORM,
};

/**
 * Maps componentId from feature definitions to ComponentType enum
 * ComponentIds are the individual components that make up a page
 */
export const COMPONENT_ID_TO_TYPE: Record<string, ComponentType> = {
  // Blog components
  'blog-header': ComponentType.BLOG_POST_HEADER,
  'featured-posts': ComponentType.FEATURED_BLOG_POST,
  'posts-grid': ComponentType.BLOG_GRID,
  'posts-list': ComponentType.BLOG_LIST,
  'post-card': ComponentType.BLOG_CARD,
  'category-filter': ComponentType.CATEGORIES_WIDGET,
  'search-bar': ComponentType.BLOG_SEARCH_BAR,
  'pagination': ComponentType.PAGINATION,
  'post-header': ComponentType.BLOG_POST_HEADER,
  'post-content': ComponentType.BLOG_POST_CONTENT,
  'author-bio': ComponentType.AUTHOR_BIO,
  'share-buttons': ComponentType.SHARE_BUTTONS,
  'related-posts': ComponentType.RELATED_ARTICLES,
  'comments-section': ComponentType.COMMENT_SECTION,
  'post-editor': ComponentType.POST_COMPOSER,
  'title-input': ComponentType.INPUT,
  'slug-input': ComponentType.INPUT,
  'category-selector': ComponentType.CATEGORIES_WIDGET,
  'tags-input': ComponentType.TAG_INPUT,
  'featured-image': ComponentType.IMAGE_UPLOAD_PREVIEW,
  'publish-settings': ComponentType.FORM,
  'posts-table': ComponentType.DATA_TABLE,
  'status-filter': ComponentType.PRODUCT_FILTER,
  'bulk-actions': ComponentType.BULK_ACTIONS_TOOLBAR,
  'post-stats': ComponentType.STATS_WIDGET,
  'category-tree': ComponentType.ACCORDION_MENU,
  'category-form': ComponentType.FORM,
  'category-stats': ComponentType.STATS_WIDGET,
  'comment-form': ComponentType.COMMENT_FORM,
  'comment-item': ComponentType.COMMENT_THREAD,
  'blog-sidebar': ComponentType.BLOG_SIDEBAR,
  'table-of-contents': ComponentType.BLOG_TABLE_OF_CONTENTS,
  'tag-cloud': ComponentType.TAG_CLOUD_WIDGET,

  // Auth components
  'login-form': ComponentType.LOGIN_FORM,
  'register-form': ComponentType.REGISTER_FORM,
  'forgot-password-form': ComponentType.FORGOT_PASSWORD_FORM,
  'reset-password-form': ComponentType.RESET_PASSWORD_FORM,
  'profile-form': ComponentType.PROFILE_EDIT_FORM,

  // E-commerce components
  'product-grid': ComponentType.PRODUCT_GRID,
  'product-card': ComponentType.PRODUCT_CARD,
  'product-detail': ComponentType.PRODUCT_DETAIL_PAGE,
  'product-gallery': ComponentType.PRODUCT_IMAGE_GALLERY,
  'add-to-cart': ComponentType.BUTTON,
  'shopping-cart': ComponentType.SHOPPING_CART,
  'cart-summary': ComponentType.CART_SUMMARY_SIDEBAR,
  'checkout-form': ComponentType.CHECKOUT_FORM,
  'order-summary': ComponentType.ORDER_SUMMARY,
  'payment-form': ComponentType.CREDIT_CARD_FORM,
  'address-form': ComponentType.SHIPPING_ADDRESS_FORM,

  // Navigation components
  'navbar': ComponentType.NAVBAR,
  'sidebar': ComponentType.SIDEBAR,
  'footer': ComponentType.FOOTER,
  'breadcrumbs': ComponentType.BREADCRUMB_NAVIGATION,
  'tabs': ComponentType.TABS_NAVIGATION,

  // Data display components
  'data-table': ComponentType.DATA_TABLE,
  'stats-cards': ComponentType.STATISTICS_CARDS,
  'chart': ComponentType.CHART,
  'kpi-card': ComponentType.KPI_CARD,

  // Form components
  'form': ComponentType.FORM,
  'input': ComponentType.INPUT,
  'textarea': ComponentType.TEXTAREA,
  'select': ComponentType.INPUT,
  'checkbox': ComponentType.INPUT,
  'radio': ComponentType.INPUT,
  'date-picker': ComponentType.DATE_PICKER_SINGLE,
  'file-upload': ComponentType.FILE_UPLOAD_SINGLE,
  'rich-text': ComponentType.RICH_TEXT_EDITOR,

  // Widgets
  'activity-feed': ComponentType.ACTIVITY_FEED,
  'notifications': ComponentType.NOTIFICATION_DROPDOWN_SOCIAL,

  // Media
  'image-gallery': ComponentType.PRODUCT_IMAGE_GALLERY,
  'carousel': ComponentType.PRODUCT_CAROUSEL,

  // Landing page components
  'hero-section': ComponentType.HERO_SECTION,
  'hero-full-width': ComponentType.HERO_SECTION,
  'hero-centered': ComponentType.HERO_SECTION,
  'hero-split-layout': ComponentType.HERO_SECTION,
  'cta-block': ComponentType.CTA_BLOCK,
  'feature-showcase-grid': ComponentType.FEATURE_SHOWCASE_GRID,
  'feature-showcase-alternating': ComponentType.FEATURE_SHOWCASE_ALTERNATING,
  'testimonial-grid': ComponentType.TESTIMONIAL_GRID,
  'testimonial-slider': ComponentType.TESTIMONIAL_SLIDER,
  'newsletter-signup': ComponentType.NEWSLETTER_SIGNUP,
  'partner-client-logos': ComponentType.PARTNER_CLIENT_LOGOS,
  'awards-showcase': ComponentType.STATISTICS_CARDS,
  'author-spotlight': ComponentType.AUTHOR_BIO,
  'promotional-banner': ComponentType.PROMOTIONAL_BANNER_TOP,
  'featured-products': ComponentType.PRODUCT_GRID,
  'product-showcase': ComponentType.PRODUCT_CAROUSEL,
  'category-showcase': ComponentType.CATEGORIES_WIDGET,
  'category-list': ComponentType.CATEGORIES_WIDGET,
  'recent-posts-grid': ComponentType.BLOG_GRID,

  // ========================================
  // Social Network Components
  // ========================================

  // User list & profile components
  'user-list': ComponentType.TEAM_MEMBERS_GRID,
  'user-card': ComponentType.USER_PROFILE_VIEW,
  'user-search': ComponentType.BLOG_SEARCH_BAR,
  'suggested-users': ComponentType.TEAM_MEMBERS_GRID,
  'suggested-users-grid': ComponentType.TEAM_MEMBERS_GRID,
  'follow-unfollow-button': ComponentType.BUTTON,
  'profile-header': ComponentType.USER_PROFILE,
  'profile-stats': ComponentType.STATISTICS_CARDS,
  'profile-tabs': ComponentType.TABS_NAVIGATION,
  'profile-edit-button': ComponentType.BUTTON,
  'user-posts-grid': ComponentType.BLOG_GRID,
  'user-media-gallery': ComponentType.IMAGE_GALLERY_GRID,

  // Social feed components
  'post-composer': ComponentType.POST_COMPOSER,
  'social-media-feed': ComponentType.SOCIAL_MEDIA_FEED,
  'social-post-card': ComponentType.BLOG_CARD,
  'trending-sidebar': ComponentType.BLOG_SIDEBAR,
  'activity-indicators': ComponentType.STATS_WIDGET,
  'like-reaction-buttons': ComponentType.SHARE_BUTTONS,
  'trending-topics': ComponentType.TAG_CLOUD_WIDGET,
  'popular-posts': ComponentType.BLOG_GRID,

  // Group components
  'groups-list': ComponentType.TEAM_MEMBERS_GRID,
  'group-card': ComponentType.USER_PROFILE_VIEW,
  'group-header': ComponentType.USER_PROFILE,
  'group-stats': ComponentType.STATISTICS_CARDS,
  'group-feed': ComponentType.SOCIAL_MEDIA_FEED,
  'group-members': ComponentType.TEAM_MEMBERS_GRID,
  'join-group-button': ComponentType.BUTTON,
  'create-group-button': ComponentType.BUTTON,
  'group-search': ComponentType.BLOG_SEARCH_BAR,
  'my-groups': ComponentType.TEAM_MEMBERS_GRID,
  'suggested-groups': ComponentType.TEAM_MEMBERS_GRID,

  // Messaging components
  'conversations-list': ComponentType.NOTIFICATION_LIST,
  'conversation-header': ComponentType.BLOG_POST_HEADER,
  'direct-messaging-thread': ComponentType.DIRECT_MESSAGING_THREAD,
  'message-input': ComponentType.TEXTAREA,
  'new-message-button': ComponentType.BUTTON,
  'message-search': ComponentType.BLOG_SEARCH_BAR,

  // Notification components
  'notification-list': ComponentType.NOTIFICATION_LIST,
  'notification-filters': ComponentType.PRODUCT_FILTER,
  'mark-all-read-button': ComponentType.BUTTON,

  // Search components
  'search-tabs': ComponentType.TABS_NAVIGATION,
  'search-results-posts': ComponentType.BLOG_GRID,
  'search-results-users': ComponentType.TEAM_MEMBERS_GRID,
  'search-results-groups': ComponentType.TEAM_MEMBERS_GRID,

  // Settings components
  'settings-sidebar': ComponentType.SIDEBAR,
  'profile-settings': ComponentType.PROFILE_EDIT_FORM,
  'privacy-settings': ComponentType.FORM,
  'notification-settings': ComponentType.FORM,
  'account-settings': ComponentType.FORM,

  // Admin & Moderation components
  'users-table': ComponentType.DATA_TABLE,
  'reports-table': ComponentType.DATA_TABLE,
  'post-moderation-actions': ComponentType.BULK_ACTIONS_TOOLBAR,
  'user-moderation-actions': ComponentType.BULK_ACTIONS_TOOLBAR,
  'content-filters': ComponentType.PRODUCT_FILTER,
  'user-filters': ComponentType.PRODUCT_FILTER,
  'report-detail': ComponentType.DETAIL_VIEW,
  'moderation-actions': ComponentType.BULK_ACTIONS_TOOLBAR,
};

/**
 * Get ComponentType from templateId
 */
export function getComponentTypeFromTemplate(templateId: string): ComponentType | null {
  // Direct match
  if (TEMPLATE_TO_COMPONENT_TYPE[templateId]) {
    return TEMPLATE_TO_COMPONENT_TYPE[templateId];
  }

  // Try to find partial match
  const normalizedId = templateId.toLowerCase().replace(/_/g, '-');
  for (const [key, value] of Object.entries(TEMPLATE_TO_COMPONENT_TYPE)) {
    if (normalizedId.includes(key) || key.includes(normalizedId)) {
      return value;
    }
  }

  return null;
}

/**
 * Get ComponentType from componentId
 */
export function getComponentTypeFromId(componentId: string): ComponentType | null {
  // Direct match
  if (COMPONENT_ID_TO_TYPE[componentId]) {
    return COMPONENT_ID_TO_TYPE[componentId];
  }

  // Try to find partial match
  const normalizedId = componentId.toLowerCase().replace(/_/g, '-');
  for (const [key, value] of Object.entries(COMPONENT_ID_TO_TYPE)) {
    if (normalizedId.includes(key) || key.includes(normalizedId)) {
      return value;
    }
  }

  return null;
}

/**
 * Page layout configurations based on templateId
 */
export const PAGE_LAYOUTS: Record<string, {
  layout: 'default' | 'dashboard' | 'centered' | 'full' | 'split';
  hasHeader: boolean;
  hasSidebar: boolean;
  hasFooter: boolean;
}> = {
  // Auth pages - centered, minimal
  'login': { layout: 'centered', hasHeader: false, hasSidebar: false, hasFooter: false },
  'register': { layout: 'centered', hasHeader: false, hasSidebar: false, hasFooter: false },
  'forgot-password': { layout: 'centered', hasHeader: false, hasSidebar: false, hasFooter: false },
  'reset-password': { layout: 'centered', hasHeader: false, hasSidebar: false, hasFooter: false },

  // Content pages - default with full header/footer
  'blog-list': { layout: 'default', hasHeader: true, hasSidebar: true, hasFooter: true },
  'blog-post': { layout: 'default', hasHeader: true, hasSidebar: false, hasFooter: true },
  'write-post': { layout: 'default', hasHeader: true, hasSidebar: true, hasFooter: false },

  // Admin pages - dashboard layout
  'admin-posts': { layout: 'dashboard', hasHeader: true, hasSidebar: true, hasFooter: false },
  'admin-categories': { layout: 'dashboard', hasHeader: true, hasSidebar: true, hasFooter: false },
  'admin-dashboard': { layout: 'dashboard', hasHeader: true, hasSidebar: true, hasFooter: false },

  // E-commerce
  'products-list': { layout: 'default', hasHeader: true, hasSidebar: true, hasFooter: true },
  'product-detail': { layout: 'default', hasHeader: true, hasSidebar: false, hasFooter: true },
  'cart': { layout: 'default', hasHeader: true, hasSidebar: false, hasFooter: true },
  'checkout': { layout: 'default', hasHeader: true, hasSidebar: false, hasFooter: false },

  // Default
  'default': { layout: 'default', hasHeader: true, hasSidebar: true, hasFooter: true },
};

/**
 * Get page layout configuration
 */
export function getPageLayout(templateId: string) {
  return PAGE_LAYOUTS[templateId] || PAGE_LAYOUTS['default'];
}

/**
 * Get icon name for a component type
 */
export function getIconForComponentType(componentType: ComponentType): string {
  const iconMap: Record<string, string> = {
    // Blog
    [ComponentType.BLOG_LIST]: 'file-text',
    [ComponentType.BLOG_GRID]: 'layout-grid',
    [ComponentType.BLOG_POST_CONTENT]: 'file-text',
    [ComponentType.POST_COMPOSER]: 'pen-square',
    [ComponentType.COMMENT_SECTION]: 'message-square',
    [ComponentType.AUTHOR_BIO]: 'user',

    // E-commerce
    [ComponentType.PRODUCT_GRID]: 'package',
    [ComponentType.SHOPPING_CART]: 'shopping-cart',
    [ComponentType.CHECKOUT_STEPS]: 'credit-card',

    // Navigation
    [ComponentType.DASHBOARD]: 'layout-dashboard',
    [ComponentType.DATA_TABLE]: 'list',
    [ComponentType.CATEGORIES_WIDGET]: 'tag',

    // Auth
    [ComponentType.LOGIN_FORM]: 'log-in',
    [ComponentType.REGISTER_FORM]: 'user-plus',
    [ComponentType.USER_PROFILE]: 'user',

    // Default
    'default': 'file',
  };

  return iconMap[componentType] || iconMap['default'];
}
