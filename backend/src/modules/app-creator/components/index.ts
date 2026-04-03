/**
 * Component Generators Index for App Creator
 *
 * Central export for all component generators.
 * These generators produce standalone React components
 * that work with entity definitions directly.
 */

// Utility functions
export * from './utils';

// ============================================
// COMMON/REUSABLE COMPONENTS
// ============================================

// Entity CRUD
export { generateEntityTable, type ColumnConfig, type EntityTableOptions } from './common/entity-table.generator';
export { generateEntityGrid, type GridDisplayConfig, type EntityGridOptions } from './common/entity-grid.generator';
export { generateEntityDetail, type DetailFieldConfig, type EntityDetailOptions } from './common/entity-detail.generator';
export { generateEntityForm, type FormFieldConfig, type FormFieldType, type EntityFormOptions } from './common/entity-form.generator';
export { generateList, generateDomainList, type ListItemConfig, type ListOptions } from './common/list.generator';

// Navigation & Layout
export { generateNavbar, type NavLinkConfig, type NavbarOptions } from './common/navbar.generator';
export { generateSidebar, generateDomainSidebar, type MenuItemConfig, type SidebarSectionConfig, type SidebarOptions } from './common/sidebar.generator';
export { generateFooter, type FooterLinkSection, type SocialLink, type FooterOptions } from './common/footer.generator';
export { generateHero, generateHeroWithStats } from './common/hero.generator';

// Data Display
export { generateStatsDashboard, generateDomainStats, type StatConfig } from './common/stats-dashboard.generator';
export { generateCalendar, generateDomainCalendar, type CalendarEventConfig, type CalendarOptions } from './common/calendar.generator';
export { generateFilters, generateStatusFilter, generateEntityFilters, type FilterConfig, type FilterType, type FiltersOptions } from './common/filters.generator';

// Legacy exports (keeping for backward compatibility)
export { generateDataTable } from './common/data-table.generator';
export { generateDynamicForm } from './common/dynamic-form.generator';

// Generic UI Components
export {
  generateFilterForm,
  generateDetailView,
  generateDataList,
  generateSearchBar,
  generateCreateForm,
  generateEditForm,
  generateContactForm,
  generateSettingsForm,
  generateProfileView,
  generateStatsCards,
  generateCalendarView,
  generateBlogDetail,
  generateTrendingTopics,
  generateUserSuggestions,
  generateTeamList,
  generatePostDetail,
  generateCreatePost,
  type GenericUIOptions,
} from './common/generic-ui.generator';
export { generateClientProfileFreelance } from './common/client.generator';

// ============================================
// TRAVEL COMPONENTS
// ============================================

export {
  generateTravelSearch,
  generateDestinationGrid,
  generateDestinationFilters,
  generateDestinationHeader,
  generateHotelGrid,
  generateHotelFilters,
  generateHotelDetail,
  generateFlightSearch,
  generateRoomSelector,
  generateTourFilters,
  generateTourItinerary,
  type TravelOptions,
} from './travel/travel.generator';

// ============================================
// ECOMMERCE COMPONENTS
// ============================================

export { generateProductGrid, generateFeaturedProducts } from './ecommerce/product-grid.generator';
export { generateCart, generateMiniCart, type CartOptions } from './ecommerce/cart.generator';
export { generateCheckout, generateOrderSummary, type CheckoutOptions } from './ecommerce/checkout.generator';
export { generateProductDetail, type ProductDetailOptions } from './ecommerce/product-detail.generator';

// ============================================
// BLOG COMPONENTS
// ============================================

export { generateBlogList, generateFeaturedPosts } from './blog/blog-list.generator';

// ============================================
// DASHBOARD COMPONENTS
// ============================================

export { generateDataGrid, type DataGridOptions } from './dashboard/data-grid.generator';
export { generateActivityFeed, generateActivityTimeline, type ActivityFeedOptions } from './dashboard/activity-feed.generator';
export { generateAnalyticsCharts, type AnalyticsChartsOptions } from './dashboard/analytics-charts.generator';

// ============================================
// CRM COMPONENTS
// ============================================

export { generateKanbanBoard, generatePipelineOverview, type KanbanBoardOptions } from './crm/kanban-board.generator';
export { generateContactProfile, generateCompanyProfile, generateDealCard, type ContactProfileOptions } from './crm/contact-profile.generator';
export { generateTaskList, generateNotesList, type TaskListOptions } from './crm/task-list.generator';

// ============================================
// SOCIAL COMPONENTS
// ============================================

export { generateProfileHeader, generateProfileTabs, generateUserGrid, type ProfileOptions } from './social/profile.generator';
export { generatePostComposer, generatePostFeed, generateCommentSection, type PostsOptions } from './social/posts.generator';
export { generateMessageList, generateChatInterface, generateNotificationList, type MessagingOptions } from './social/messaging.generator';

// ============================================
// BOOKING COMPONENTS
// ============================================

export { generateServiceGrid, generateStaffGrid, type ServiceGridOptions } from './booking/service-grid.generator';
export { generateBookingWizard, type BookingWizardOptions } from './booking/booking-wizard.generator';
export { generateAppointmentList, generateBookingConfirmation, generateDatePicker, generateTimeSlots, type AppointmentListOptions } from './booking/appointment-list.generator';
export { generateBookingCalendarEscape, generateBookingFiltersRental, generateBookingFiltersTravel, generateBookingListTodayEscape, generateBookingListTravel, type ExtendedBookingOptions } from './booking/extended-booking.generator';

// ============================================
// PROJECT MANAGEMENT COMPONENTS
// ============================================

export { generateProjectGrid, generateProjectHeader, generateMilestoneTracker, generateTeamMembers, type ProjectGridOptions } from './project/project-grid.generator';

// ============================================
// LMS (LEARNING MANAGEMENT) COMPONENTS
// ============================================

export { generateCourseGrid, generateCourseFilters, generateEnrolledCourses, type CourseGridOptions } from './lms/course-grid.generator';
export { generateCourseHeader, generateCurriculumList, generateProgressTracker, type CourseHeaderOptions } from './lms/course-header.generator';
export { generateLessonPlayer, generateLessonSidebar, generateQuizPlayer, type LessonPlayerOptions } from './lms/lesson-player.generator';
export { generateCertificateGrid, type CertificateGridOptions } from './lms/certificate-grid.generator';

// ============================================
// HEALTHCARE COMPONENTS
// ============================================

export { generatePatientProfile, generateMedicalHistory, type PatientProfileOptions } from './healthcare/patient-profile.generator';
export { generateAppointmentCalendar, generateAppointmentForm, type AppointmentCalendarOptions } from './healthcare/appointment-calendar.generator';
export { generateDoctorGrid, generateDoctorProfile, generateDoctorSchedule, type DoctorGridOptions } from './healthcare/doctor-grid.generator';

// Healthcare Specialties
export {
  // Chiropractic
  generateChiropractorStats,
  generateSpineAssessment,
  generateAdjustmentHistory,
  // Dermatology
  generateDermatologyStats,
  generateSkinConditionTracker,
  generateBiopsyTracker,
  // Pediatrics
  generatePediatricsStats,
  generateGrowthChart,
  generateVaccinationSchedule,
  // Mental Health
  generateMentalHealthStats,
  generateTherapySessionNotes,
  generateMoodTracker,
  // Radiology
  generateRadiologyStats,
  generateImagingQueue,
  generateScanViewer,
  // Home Care
  generateHomeCareStats,
  generateVisitScheduleMap,
  generateCaregiverAssignment,
  // Lab/Diagnostics
  generateLabStats,
  generateLabResults,
  generateTestOrderForm,
  // Types
  type ChiropractorStatsOptions,
  type DermatologyStatsOptions,
  type PediatricsStatsOptions,
  type MentalHealthStatsOptions,
  type RadiologyStatsOptions,
  type HomeCareStatsOptions,
  type LabStatsOptions,
} from './healthcare/healthcare-specialties.generator';

// ============================================
// FITNESS COMPONENTS
// ============================================

export { generateMembershipPlans, type MembershipPlansOptions } from './fitness/membership-plans.generator';
export { generateClassGrid, generateClassSchedule, generateClassDetail, generateClassFilters, type ClassGridOptions } from './fitness/class-grid.generator';
export { generateTrainerGrid, generateTrainerProfile, type TrainerGridOptions } from './fitness/trainer-grid.generator';
export { generateWorkoutStats, generateWorkoutList, generateWorkoutForm, generateProgressCharts, type WorkoutOptions } from './fitness/workout.generator';

// ============================================
// REAL ESTATE COMPONENTS
// ============================================

export { generatePropertySearch, generatePropertyGrid, generatePropertyFilters, type PropertySearchOptions } from './real-estate/property-search.generator';
export { generatePropertyGallery, generatePropertyDetails, generateInquiryForm, type PropertyDetailOptions } from './real-estate/property-detail.generator';
export { generateAgentGrid, generateAgentProfile, type AgentGridOptions } from './real-estate/agent-grid.generator';

// ============================================
// FOOD & RESTAURANT COMPONENTS
// ============================================

export { generateMenuGrid, generateMenuCategories, type MenuGridOptions } from './food/menu-grid.generator';
export { generateCartPreview, generateCheckoutForm, generateOrderConfirmation, type FoodCartOptions } from './food/cart.generator';
export { generateOrderTracking, generateOrderList, generateOrderQueue, type OrderTrackingOptions } from './food/order-tracking.generator';
export { generateReservationForm, generateRestaurantInfo, type ReservationOptions } from './food/reservation.generator';
export { generateClientProfileCatering } from './food/catering.generator';

// ============================================
// JOB BOARD COMPONENTS
// ============================================

export { generateJobSearch, generateJobList, generateJobFilters, type JobSearchOptions } from './job-board/job-search.generator';
export { generateJobDetail, generateApplyCard, type JobDetailOptions } from './job-board/job-detail.generator';
export { generateCompanyCard, generateCompanyGrid, type CompanyCardOptions } from './job-board/company-card.generator';
export { generateApplicationForm, generateApplicationList, generateCandidateProfile, type ApplicationOptions } from './job-board/application.generator';

// ============================================
// EVENTS COMPONENTS
// ============================================

export { generateEventGrid, generateEventFilters, type EventGridOptions } from './events/event-grid.generator';
export { generateEventHeader, generateEventSchedule, generateVenueInfo, type EventDetailOptions } from './events/event-detail.generator';
export { generateTicketSelector, generateTicketList, generateTicketDetail, type TicketOptions } from './events/ticket.generator';
export { generateSpeakerGrid, generateSponsorGrid, type SpeakerGridOptions } from './events/speaker-grid.generator';

// ============================================
// FINANCE COMPONENTS
// ============================================

export { generateAccountOverview, generateAccountCards, generateTransactionList, type AccountOptions } from './finance/account.generator';
export { generateBudgetTracker, generateBudgetCategories, generateSpendingChart, type BudgetOptions } from './finance/budget.generator';
export { generateInvoiceList, generateInvoiceDetail, generateInvoiceForm, type InvoiceOptions } from './finance/invoice.generator';
export { generatePaymentForm, generatePaymentMethods, generatePaymentHistory, type PaymentOptions } from './finance/payment.generator';

// ============================================
// BANKING COMPONENTS
// ============================================

// Account management
export {
  generateAccountBalanceCards,
  generateAccountDetail,
  generateAccountList,
  type AccountOptions as BankingAccountOptions,
} from './banking/account.generator';

// Card management
export {
  generateCardDetail,
  generateCardList,
  type CardOptions,
} from './banking/card.generator';

// Bill payments
export {
  generateBillList,
  generateBillPaymentForm,
  type BillOptions,
} from './banking/bill.generator';

// Transfers and beneficiaries
export {
  generateTransferForm,
  generateTransferHistory,
  generateBeneficiaryList,
  type TransferOptions,
} from './banking/transfer.generator';

// Transaction management
export {
  generateTransactionTable,
  generateTransactionFilters,
  type TransactionOptions,
} from './banking/transaction.generator';

// Banking budgets
export {
  generateBudgetForm,
  generateBudgetOverview,
  type BudgetOptions as BankingBudgetOptions,
} from './banking/budget.generator';

// ============================================
// SUPPORT COMPONENTS
// ============================================

export { generateKnowledgeBase, generateArticleList, generateArticleDetail, type KnowledgeBaseOptions } from './support/knowledge-base.generator';
export { generateTicketList as generateSupportTicketList, generateTicketDetail as generateSupportTicketDetail, generateTicketForm as generateSupportTicketForm, type TicketOptions as SupportTicketOptions } from './support/ticket.generator';
export { generateFaqSection, generateFaqCategories, type FaqOptions } from './support/faq.generator';
export { generateLiveChat, generateChatWidget, type LiveChatOptions } from './support/live-chat.generator';

// ============================================
// MEDIA COMPONENTS
// ============================================

export { generateVideoPlayer, generatePlaylist, generateVideoGrid, type VideoPlayerOptions } from './media/video-player.generator';
export { generateAudioPlayer, generateTrackList, generateAlbumGrid, type AudioPlayerOptions } from './media/audio-player.generator';
export { generateGallery, generateLightbox, generateImageUpload, type GalleryOptions } from './media/gallery.generator';
export { generatePodcastPlayer, generateEpisodeList, generatePodcastGrid, type PodcastOptions } from './media/podcast.generator';

// ============================================
// FORUM COMPONENTS
// ============================================

export { generateForumCategories, generateCategoryCard, type ForumCategoryOptions } from './forum/category.generator';
export { generateThreadList, generateThreadDetail, generateCreateThread, type ThreadOptions } from './forum/thread.generator';
export { generatePostList, generatePostEditor, generatePostReply, type PostOptions } from './forum/post.generator';
export { generateMemberList, generateMemberProfile, generateLeaderboard, type MemberOptions } from './forum/member.generator';

// ============================================
// SURVEY/FEEDBACK COMPONENTS
// ============================================

export {
  generateSurveyBuilder,
  generateSurveyFilters,
  generateSurveyForm,
  generateSurveyHeader,
  generateSurveyStats,
  generateResponseChart,
  generateResponseSummary,
  generateQuestionAnalytics,
  type SurveyOptions,
  type ResponseOptions,
} from './survey';

// ============================================
// BEAUTY/SALON/SPA COMPONENTS
// ============================================

export {
  generateAppointmentCalendarSalon,
  generateSalonStats,
  generateStylistProfile,
  generateStylistSchedule,
  generateClientProfileSalon,
  type SalonOptions,
} from './beauty/salon.generator';

export {
  generateAppointmentCalendarSpa,
  generateSpaStats,
  generateSpaSchedule,
  generateTherapistProfileSpa,
  generateClientProfileSpa,
  type SpaOptions,
} from './beauty/spa.generator';

// ============================================
// WEDDING COMPONENTS
// ============================================

export {
  // Wedding core components
  generateWeddingStats,
  generateWeddingCountdown,
  generateWeddingTimeline,
  generateBudgetSummaryWedding,
  type WeddingOptions,
  // Task management components
  generateTaskBoardWedding,
  generateTaskListWedding,
  type WeddingTaskOptions,
  // Venue management components
  generateVenueCalendar,
  generateVenueStats,
  generateBookingFiltersVenue,
  generateClientProfileVenue,
  type VenueOptions,
} from './wedding';

// ============================================
// NONPROFIT COMPONENTS
// ============================================

export {
  // Church components
  generateChurchStats,
  generateSermonList,
  generateSermonNotes,
  generateSermonPlayer,
  generatePrayerList,
  type ChurchOptions,
  // Donation components
  generateDonationStats,
  generateDonationChart,
  generateDonationFiltersNonprofit,
  generateDonationSummary,
  generateDonorProfile,
  generateMemberDonations,
  type DonationOptions,
  // Campaign components
  generateCampaignListNonprofit,
  generateCampaignProgressNonprofit,
  generateFundingProgress,
  type CampaignOptions,
  // Funeral components
  generateFuneralStats,
  generateArrangementList,
  generateArrangementListUpcoming,
  generateObituaryListRecent,
  type FuneralOptions,
} from './nonprofit';

// ============================================
// LOGISTICS/WAREHOUSE COMPONENTS
// ============================================

// Shipment tracking and management
export {
  generateShipmentMap,
  generateShipmentFilters,
  generateShipmentTimeline,
  generateShipmentFiltersWarehouse,
  type ShipmentOptions,
} from './logistics/shipment.generator';

// Warehouse operations
export {
  generateWarehouseStats,
  generateOrderListWarehouse,
  generateStockLevels,
  generateReceivingForm,
  generateReceivingList,
  type WarehouseOptions,
} from './logistics/warehouse.generator';

// Delivery and routing
export {
  generateDeliverySchedule,
  generateDeliveryTracker,
  generateRoutePlanner,
  generateTruckSchedule,
  type DeliveryOptions,
} from './logistics/delivery.generator';

// Picking and fulfillment
export {
  generatePickList,
  generatePickQueue,
  type PickingOptions,
} from './logistics/picking.generator';

// Logistics analytics
export {
  generateLogisticsStats,
  type LogisticsStatsOptions,
} from './logistics/stats.generator';

// ============================================
// INSURANCE COMPONENTS
// ============================================

// Policy management
export {
  generatePolicyList,
  generatePolicyDetail,
  generatePolicyFilters,
  generatePolicyForm,
  type PolicyOptions,
} from './insurance/policy.generator';

// Claims processing
export {
  generateClaimsList,
  generateClaimsStats,
  generateClaimForm,
  generateClaimTimeline,
  type ClaimsOptions,
} from './insurance/claims.generator';

// Quote management
export {
  generateQuoteList,
  generateQuoteWizard,
  type QuoteOptions as InsuranceQuoteOptions,
} from './insurance/quote.generator';

// Customer management
export {
  generateCustomerProfile as generateInsuranceCustomerProfile,
  generateDocumentList,
  type CustomerOptions as InsuranceCustomerOptions,
} from './insurance/customer.generator';

// Insurance statistics
export {
  generateInsuranceStats,
  type InsuranceStatsOptions,
} from './insurance/stats.generator';

// ============================================
// CREATIVE/DESIGN COMPONENTS
// ============================================

// Gallery components
export {
  generateGalleryStats,
  generateSalesStatsGallery,
  generateArtworkFilters,
  generatePhotoGallery,
  type GalleryGeneratorOptions,
} from './creative/gallery.generator';

// Artist components
export {
  generateArtistProfileGallery,
  type ArtistGeneratorOptions,
} from './creative/artist.generator';

// Photography components
export {
  generatePhotoStats,
  generateBookingCalendarPhoto,
  generateClientProfilePhoto,
  type PhotoGeneratorOptions,
} from './creative/photo.generator';

// Design components
export {
  generateDesignStats,
  generateClientProfileDesign,
  type DesignGeneratorOptions,
} from './creative/design.generator';

// ============================================
// PET SERVICES COMPONENTS
// ============================================

// Pet Boarding
export {
  generatePetboardingStats,
  generateCalendarPetboarding,
  generateStaffScheduleBoarding,
  generatePetProfileBoarding,
  generateCurrentPets,
  generatePetActivities,
  generateFeedingSchedule,
  type BoardingStatsOptions,
  type CalendarBoardingOptions,
  type StaffScheduleOptions,
  type PetProfileBoardingOptions,
  type CurrentPetsOptions,
  type PetActivitiesOptions,
  type FeedingScheduleOptions,
} from './pets/boarding.generator';

// Pet Daycare
export {
  generateDaycareStats,
  generateActivityCalendarDaycare,
  generateCheckinListToday,
  generateChildProfile,
  type DaycareStatsOptions,
  type ActivityCalendarOptions,
  type CheckinListOptions,
  type ChildProfileOptions,
} from './pets/daycare.generator';

// Veterinary
export {
  generatePetProfile,
  generateOwnerProfile,
  type PetProfileVetOptions,
  type OwnerProfileOptions,
} from './pets/vet.generator';

// ============================================
// MARKETING COMPONENTS
// ============================================

// Campaign management
export {
  generateCampaignFilters,
  generateCampaignFiltersMarketing,
  generateCampaignHeader,
  generateCampaignListActive,
  generateCampaignPerformance,
  generateCampaignStats,
  generateCampaignStory,
  type CampaignFiltersOptions,
  type CampaignFiltersMarketingOptions,
  type CampaignHeaderOptions,
  type CampaignListActiveOptions,
  type CampaignPerformanceOptions,
  type CampaignStatsOptions,
  type CampaignStoryOptions,
} from './marketing/campaign.generator';

// Affiliate marketing
export {
  generateAffiliateLeaderboard,
  generateAffiliateStats,
  generateLinkGenerator,
  generatePayoutBalance,
  generateCommissionSummary,
  type AffiliateLeaderboardOptions,
  type AffiliateStatsOptions,
  type LinkGeneratorOptions,
  type PayoutBalanceOptions,
  type CommissionSummaryOptions,
} from './marketing/affiliate.generator';

// Referral program
export {
  generateCampaignStatsReferral,
  generateRewardTiers,
  generateReferralFilters,
  type CampaignStatsReferralOptions,
  type RewardTiersOptions,
  type ReferralFiltersOptions,
} from './marketing/referral.generator';

// Subscriber/SaaS metrics
export {
  generateSubscriberChart,
  generateSubscriberProfile,
  generateChurnMetrics,
  generateMrrStats,
  generatePlanDistribution,
  type SubscriberChartOptions,
  type SubscriberProfileOptions,
  type ChurnMetricsOptions,
  type MrrStatsOptions,
  type PlanDistributionOptions,
} from './marketing/subscriber.generator';

// Marketing client management
export {
  generateClientHeaderMarketing,
  generateClientPerformanceMarketing,
  generateProjectBoardMarketing,
  generateTaskListMarketing,
  type ClientHeaderMarketingOptions,
  type ClientPerformanceMarketingOptions,
  type ProjectBoardMarketingOptions,
  type TaskListMarketingOptions,
} from './marketing/client.generator';

// ============================================
// HOSPITALITY COMPONENTS
// ============================================

// Hotel management
export {
  generateHotelStats,
  generateRoomFiltersHotel,
  generateRoomCalendar,
  generateRoomStatusOverview,
  generateGuestProfileHotel,
  generateGuestStats,
  generateHousekeepingBoard,
  generateOccupancyChart,
  type HotelOptions,
} from './hospitality/hotel.generator';

// Campground/RV park management
export {
  generateCampgroundStats,
  generateReservationCalendarCampground,
  generateActivityCalendarCampground,
  generateSiteAvailability,
  generateSiteSchedule,
  type CampgroundOptions,
} from './hospitality/campground.generator';

// Marina/boat slip management
export {
  generateMarinaStats,
  generateReservationCalendarMarina,
  generateReservationListTodayMarina,
  generateSlipAvailability,
  generateCustomerProfileMarina,
  type MarinaOptions,
} from './hospitality/marina.generator';

// Parking lot/garage management
export {
  generateParkingStats,
  generateOccupancyOverviewParking,
  generateReservationFiltersParking,
  generateCustomerProfileParking,
  type ParkingOptions,
} from './hospitality/parking.generator';

// Coworking space management
export {
  generateCoworkingStats,
  generateBookingCalendarCoworking,
  generateBookingListCoworking,
  generateMemberProfileCoworking,
  generateSpaceCalendar,
  type CoworkingOptions,
} from './hospitality/coworking.generator';

// ============================================
// EDUCATION COMPONENTS
// ============================================

export * from './education';

// ============================================
// SERVICES INDUSTRY COMPONENTS
// ============================================

export * from './services';

// ============================================
// LEGAL COMPONENTS
// ============================================

export * from './legal';

// ============================================
// RECRUITMENT COMPONENTS
// ============================================

export * from './recruitment';

// ============================================
// DATING COMPONENTS
// ============================================

export * from './dating';

// ============================================
// LEISURE COMPONENTS
// ============================================

export * from './leisure';

// ============================================
// FORUM EXTENDED COMPONENTS
// ============================================

export * from './forum/header.generator';
export * from './forum/search.generator';

// ============================================
// BUSINESS/INDUSTRY STATS COMPONENTS
// ============================================

export * from './business';

// ============================================
// CONTENT/ARTICLE COMPONENTS
// ============================================

export * from './content';

// ============================================
// ACTIVITY/CALENDAR COMPONENTS
// ============================================

export * from './activity';

// ============================================
// PROFESSIONAL SERVICES COMPONENTS
// ============================================

export * from './professional';

// ============================================
// CUSTOMER/CLIENT PROFILE COMPONENTS
// ============================================

export * from './profiles';

// ============================================
// DELIVERY & LOGISTICS COMPONENTS
// ============================================

export * from './delivery';

// ============================================
// MISCELLANEOUS COMPONENTS
// ============================================

export * from './misc';

// ============================================
// INDUSTRY-SPECIFIC COMPONENTS
// ============================================

export * from './industry';

// ============================================
// AUTH COMPONENTS
// ============================================

export * from './auth';

// ============================================
// RE-EXPORT TYPES
// ============================================

export type { EnhancedEntityDefinition, EnhancedFieldDefinition } from '../dto/create-app.dto';
