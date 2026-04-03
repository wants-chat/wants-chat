/**
 * Common Component Generators Index
 *
 * Exports all common/reusable component generators
 */

// Entity CRUD Components
export * from './entity-table.generator';
export * from './entity-grid.generator';
export * from './entity-detail.generator';
export * from './entity-form.generator';
export * from './list.generator';

// Navigation & Layout
export * from './navbar.generator';
export * from './sidebar.generator';
export * from './footer.generator';
export * from './hero.generator';

// Data Display
export * from './stats-dashboard.generator';
export * from './calendar.generator';
export * from './filters.generator';

// Stats & Analytics Widgets
export * from './stats-widgets.generator';
export * from './stats-section.generator';

// Lists & Tables (Batch 3)
export * from './active-list.generator';
// detail.generator uses DetailFieldConfig that conflicts with entity-detail.generator
// Using explicit exports to avoid conflicts
export {
  generateAppointmentDetail as generateAppointmentDetailSpecialized,
  generateTaskDetail,
  type DetailSectionConfig,
  type SpecializedDetailOptions,
} from './detail.generator';
export * from './schedule.generator';
export * from './today-list.generator';

// Content Sections (Batch 2)
export * from './content.generator';
export * from './page-header.generator';
export * from './service.generator';

// Contact & Maps (Batch 4)
export * from './contact.generator';

// Client Profiles (Batch 4)
export * from './client.generator';

// Freelance Components (Batch 4)
export * from './freelance.generator';

// Consulting Components (Batch 4)
export * from './consulting.generator';

// Channel Components (Batch 6)
export * from './channel.generator';

// Calendar & Events (Batch 6)
export * from './calendar-events.generator';

// Session Components (Batch 6)
// session.generator exports generateSessionListActive which conflicts with active-list.generator
// Using explicit exports to avoid conflicts
export {
  generateSessionList,
  generateSessionListActive as generateSessionListActiveExtended,
  type SessionListOptions,
  type SessionListActiveOptions,
} from './session.generator';

// Class/Education Components (Batch 6)
export * from './class.generator';

// Gamification Components (Batch 6)
export * from './leaderboard.generator';
export * from './skill.generator';

// Industry-Specific Components (Batch 6)
export * from './jeweler.generator';
export * from './optics.generator';

// Tracking & Shipping
export * from './tracking.generator';

// Reports & Analytics
export * from './report.generator';

// Team & Organization
export * from './team.generator';

// Financial & Loans
export * from './loan.generator';
export * from './billing.generator';

// Contracts & Renewals
export * from './contract.generator';

// Pending Items & Approvals
export * from './pending.generator';

// Rentals & Expiring Items
export * from './expiring.generator';

// Blog Components (Batch 5)
export * from './blog-extras.generator';

// Subscription Components (Batch 5)
export * from './subscription.generator';

// Asset Management Components (Batch 5)
export * from './asset.generator';

// Estimate & Quote Components (Batch 5)
export * from './estimate.generator';

// Senior Care Components (Batch 5)
export * from './senior.generator';

// Accounting Components (Batch 5)
export * from './accounting.generator';
