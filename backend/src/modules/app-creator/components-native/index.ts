/**
 * React Native Component Generators Index for App Creator
 *
 * Central export for all React Native component generators.
 * These generators produce standalone React Native components
 * that work with entity definitions directly.
 *
 * Structure mirrors the React components in /components/ for parity.
 */

// ============================================
// UI COMPONENTS
// ============================================

export {
  generateButton,
  generateCard,
  generateInput,
  generateAvatar,
  generateEmptyState as generateEmptyStateComponent,
  generateLoadingSpinner,
  generateModal,
  generateToast,
  generateConfirmDialog,
  generateActionSheet,
  generateProgressBar,
} from './ui';

// ============================================
// HOOKS
// ============================================

export {
  generateUseDebounce,
  generateUseKeyboard,
  generateUseRefresh,
  generateUseStorage,
} from './hooks';

// ============================================
// DATA COMPONENTS
// ============================================

export {
  generateDataGrid as generateDataGridComponent,
  generateDataTable as generateDataTableComponent,
  generateDataList,
  generateSearchBar,
  generateBadge as generateBadgeComponent,
} from './data';

// ============================================
// FORM COMPONENTS
// ============================================

export {
  generateSelect,
  generateDatePicker as generateDatePickerComponent,
  generateTimePicker,
  generateTextarea,
  generateCheckbox,
  generateRadioGroup,
} from './form';

// ============================================
// MEDIA COMPONENTS
// ============================================

export {
  generateImageGallery,
  generateImagePicker,
  generateMediaPlayer,
  generateFilePicker,
  generateCachedImage,
} from './media-components';

// ============================================
// LAYOUT COMPONENTS
// ============================================

export {
  generateDivider,
  generateAccordion,
  generateTabs,
  generateChip,
  generateHeader,
  generateBottomSheet,
} from './layout';

// ============================================
// UTILS / GENERATOR HELPERS
// ============================================

export {
  // Case conversion utilities
  snakeCase,
  pascalCase,
  camelCase,
  kebabCase,
  pluralize,
  // Field formatting
  formatFieldLabel,
  getTableName,
  getEndpoint,
  getComponentName,
  getFieldDisplayValue,
  // React Native imports
  REACT_NATIVE_IMPORTS,
  REACT_NATIVE_IMPORTS_BASIC,
  NAVIGATION_IMPORTS,
  QUERY_IMPORTS,
  UTIL_IMPORTS,
  getIoniconsImport,
  getIoniconForField,
  // Component interface generation
  generateComponentInterface,
  // Status colors
  STATUS_COLORS,
  getStatusColors,
  generateStatusColorFunction,
  // Data fetching
  generateFetchHook,
  generateDeleteMutation,
  // UI state generation
  generateLoadingState,
  generateEmptyState,
  generateErrorState,
  generateDeleteAlert,
  // Style generation
  generateBaseStyles,
  generateHeaderStyles,
  generateCardStyles,
  generateButtonStyles,
  generateBadgeStyles,
  generateInputStyles,
  generateListStyles,
  generateGridStyles,
  // Formatting utilities
  formatCurrency,
  formatDate,
  formatDateTime,
  // Design tokens
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from './utils';

// ============================================
// COMMON/REUSABLE COMPONENTS
// ============================================

export {
  generateEntityList,
  generateEntityGrid,
  type EntityListOptions,
  type ListFieldConfig,
  type EntityGridOptions,
  type GridDisplayConfig,
} from './common';

// ============================================
// AUTH COMPONENTS
// ============================================

export {
  generateLoginScreen,
  generateRegisterScreen,
  generateForgotPasswordScreen,
  generateAuthContext,
  generateProfileScreen,
  type AuthOptions,
} from './auth';

// ============================================
// ECOMMERCE COMPONENTS
// ============================================

export {
  generateProductGrid,
  generateFeaturedProducts,
  generateCart,
  generateMiniCart,
  generateCheckout,
  generateOrderSummary,
  type ProductGridOptions,
  type CartOptions,
  type CheckoutOptions,
} from './ecommerce';

// ============================================
// BLOG COMPONENTS
// ============================================

export {
  generateBlogList,
  generateFeaturedPosts,
  type BlogListOptions,
  type FeaturedPostsOptions,
} from './blog';

// ============================================
// DASHBOARD COMPONENTS
// ============================================

export {
  generateDataGrid,
  generateActivityFeed,
  generateActivityTimeline,
  generateAnalyticsCharts,
  type DataGridOptions,
  type ActivityFeedOptions,
  type AnalyticsChartsOptions,
} from './dashboard';

// ============================================
// CRM COMPONENTS
// ============================================

export {
  generateKanbanBoard,
  generatePipelineOverview,
  generateContactProfile,
  generateCompanyProfile,
  generateDealCard,
  generateTaskList,
  generateNotesList,
  type KanbanBoardOptions,
  type PipelineOverviewOptions,
  type ContactProfileOptions,
  type CompanyProfileOptions,
  type DealCardOptions,
  type TaskListOptions,
  type NotesListOptions,
} from './crm';

// ============================================
// SOCIAL COMPONENTS
// ============================================

export {
  generateProfileHeader,
  generateProfileTabs,
  generateUserGrid,
  generatePostComposer,
  generatePostFeed,
  generateCommentSection,
  generateMessageList,
  generateChatInterface,
  generateNotificationList,
  type ProfileOptions,
  type PostsOptions,
  type MessagingOptions,
} from './social';

// ============================================
// DATING COMPONENTS
// ============================================

export {
  // Profile components
  generateDatingProfile,
  generateProfilePreview,
  generateProfileStats as generateDatingProfileStats,
  generateAthleteProfile,
  generateArtistProfile,
  type DatingProfileOptions,
  // Matching components
  generateSwipeCards,
  generateMatchCard,
  generateDiscoveryFilters,
  generateIcebreakers,
  type MatchingOptions,
  // Chat components
  generateChatWindowDating,
  type DatingChatOptions,
} from './dating';

// ============================================
// BOOKING COMPONENTS
// ============================================

export {
  generateServiceGrid,
  generateStaffGrid,
  generateBookingWizard,
  generateAppointmentList,
  generateDatePicker,
  generateTimeSlots,
  type ServiceGridOptions,
  type BookingWizardOptions,
  type AppointmentListOptions,
} from './booking';

// ============================================
// HEALTHCARE COMPONENTS
// ============================================

export {
  generatePatientProfile,
  generateMedicalHistory,
  generateAppointmentCalendar,
  generateAppointmentForm,
  generateDoctorGrid,
  generateDoctorProfile,
  generateDoctorSchedule,
  type PatientProfileOptions,
  type MedicalHistoryOptions,
  type AppointmentCalendarOptions,
  type AppointmentFormOptions,
  type DoctorGridOptions,
  type DoctorProfileOptions,
  type DoctorScheduleOptions,
} from './healthcare';

// ============================================
// FITNESS COMPONENTS
// ============================================

export {
  generateClassGrid,
  generateClassSchedule,
  generateClassDetail,
  generateClassFilters,
  generateTrainerGrid,
  generateTrainerProfile,
  generateWorkoutStats,
  generateWorkoutList,
  generateWorkoutForm,
  generateProgressCharts,
  type ClassGridOptions,
  type TrainerGridOptions,
  type WorkoutOptions,
} from './fitness';

// ============================================
// LMS (LEARNING MANAGEMENT) COMPONENTS
// ============================================

export {
  generateCourseGrid,
  generateCourseFilters,
  generateEnrolledCourses,
  generateCourseHeader,
  generateCurriculumList,
  generateProgressTracker,
  generateLessonPlayer,
  generateLessonSidebar,
  generateQuizPlayer,
  type CourseGridOptions,
  type CourseHeaderOptions,
  type LessonPlayerOptions,
} from './lms';

// ============================================
// REAL ESTATE COMPONENTS
// ============================================

export {
  generatePropertyGrid,
  generatePropertyCard,
  generatePropertyFilters,
  generatePropertyDetail,
  generatePropertyGallery,
  generatePropertyFeatures,
  generateAgentGrid,
  generateAgentProfile,
  type PropertyGridOptions,
  type PropertyDetailOptions,
  type AgentGridOptions,
} from './real-estate';

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
  type TravelSearchOptions,
  type DestinationGridOptions,
  type DestinationFiltersOptions,
  type DestinationHeaderOptions,
  type HotelGridOptions,
  type HotelFiltersOptions,
  type HotelDetailOptions,
  type FlightSearchOptions,
  type RoomSelectorOptions,
  type TourFiltersOptions,
  type TourItineraryOptions,
} from './travel';

// ============================================
// FINANCE COMPONENTS
// ============================================

export {
  generateAccountOverview,
  generateAccountCards,
  generateTransactionList,
  generateBudgetTracker,
  generateBudgetCategories,
  generateSpendingChart,
  generateInvoiceList,
  generateInvoiceDetail,
  generateInvoiceForm,
  generatePaymentForm,
  generatePaymentMethods,
  generatePaymentHistory,
  type AccountOptions,
  type BudgetOptions,
  type InvoiceOptions,
  type PaymentOptions,
} from './finance';

// ============================================
// PROJECT MANAGEMENT COMPONENTS
// ============================================

export {
  // Project Grid and related
  generateProjectGrid,
  generateProjectHeader,
  generateMilestoneTracker,
  generateTeamMembers,
  // Work Order components
  generateActiveWorkOrders,
  generateWorkOrderFilters,
  generateWorkOrderTimeline,
  generateWorkFilters,
  // Task components
  generateTaskDetail,
  generateTaskBoard,
  generateTaskListWedding,
  // Project Detail and Filter components
  generateProjectFilters,
  generateProjectFiltersConsulting,
  generateProjectFiltersDesign,
  generateProjectTimelineConsulting,
  // Time Tracking components
  generateTimeTracker,
  generateTimeTrackerConsulting,
  // Types
  type ProjectGridOptions,
  type WorkOrderOptions,
  type TaskOptions,
  type ProjectFilterOptions,
  type TimeTrackerOptions,
} from './project';

// ============================================
// EVENTS COMPONENTS
// ============================================

export {
  // Event Grid components
  generateEventGrid,
  generateEventFilters,
  type EventGridOptions,
  // Event Detail components
  generateEventHeader,
  generateEventSchedule,
  generateVenueInfo,
  type EventDetailOptions,
  // Ticket components
  generateTicketSelector,
  generateTicketList,
  generateTicketDetail,
  type TicketOptions,
  // Speaker and Sponsor components
  generateSpeakerGrid,
  generateSponsorGrid,
  type SpeakerGridOptions,
  // Arcade components
  generateArcadeStats,
  generateGameListPopular,
  generatePartyCalendarArcade,
  generatePartyListToday,
  type ArcadeOptions,
  // Cinema components
  generateCinemaStats,
  generateScreeningCalendar,
  generateScreeningListToday,
  generateNowPlaying,
  generateMovieFilters,
  type CinemaOptions,
  // Escape Room components
  generateEscapeRoomStats,
  generateBookingCalendarEscape,
  generateBookingListTodayEscape,
  generateRoomScheduleEscape,
  type EscapeRoomOptions,
  // Club components
  generateMemberFiltersClub,
  generateMemberProfileClub,
  generateEventCalendarClub,
  type ClubOptions,
  // Ticket Sales components
  generateTicketStats,
  generateTicketSalesToday,
  generateTicketSalesRecent,
  type TicketSalesOptions,
} from './events';

// ============================================
// JOB BOARD COMPONENTS
// ============================================

export {
  // Job Search components
  generateJobSearch,
  generateJobList,
  generateJobFilters,
  type JobSearchOptions,
  // Job Detail components
  generateJobDetail,
  generateApplyCard,
  type JobDetailOptions,
  // Company components
  generateCompanyCard,
  generateCompanyGrid,
  type CompanyCardOptions,
  // Application components
  generateApplicationForm,
  generateApplicationList,
  generateCandidateProfile,
  type ApplicationOptions,
} from './job-board';

// ============================================
// INSURANCE COMPONENTS
// ============================================

export {
  // Claims components
  generateClaimsList,
  generateClaimsStats,
  generateClaimForm,
  generateClaimTimeline,
  type ClaimsOptions,
  // Customer components
  generateCustomerProfile,
  generateDocumentList,
  type CustomerOptions,
  // Policy components
  generatePolicyList,
  generatePolicyDetail,
  generatePolicyFilters,
  generatePolicyForm,
  type PolicyOptions,
  // Quote components
  generateQuoteList,
  generateQuoteWizard,
  type QuoteOptions,
  // Stats components
  generateInsuranceStats,
  type InsuranceStatsOptions,
} from './insurance';

// ============================================
// LOGISTICS COMPONENTS
// ============================================

export {
  // Shipment components
  generateShipmentMap,
  generateShipmentFilters,
  generateShipmentTimeline,
  generateShipmentFiltersWarehouse,
  type ShipmentOptions,
  // Delivery components
  generateDeliverySchedule,
  generateDeliveryTracker,
  generateRoutePlanner,
  generateTruckSchedule,
  type DeliveryOptions,
  // Picking components
  generatePickList,
  generatePickQueue,
  type PickingOptions,
  // Warehouse components
  generateWarehouseStats,
  generateOrderListWarehouse,
  generateStockLevels,
  generateReceivingForm,
  generateReceivingList,
  type WarehouseOptions,
  // Logistics Stats components
  generateLogisticsStats,
  type LogisticsStatsOptions,
} from './logistics';

// ============================================
// MEDIA COMPONENTS
// ============================================

export {
  // Video Player components
  generateVideoPlayer,
  generatePlaylist,
  generateVideoGrid,
  type VideoPlayerOptions,
  // Audio Player components
  generateAudioPlayer,
  generateTrackList,
  generateAlbumGrid,
  type AudioPlayerOptions,
  // Gallery components
  generateGallery,
  generateLightbox,
  generateImageUpload,
  type GalleryOptions,
  // Podcast components
  generatePodcastPlayer,
  generateEpisodeList,
  generatePodcastGrid,
  generatePodcastSearch,
  generateEpisodeCard,
  type PodcastOptions,
  // Library components
  generateLibraryStats,
  generateLibraryActivity,
  generateLibraryTabs,
  generateMemberProfileLibrary,
  generateBookSearch,
  type LibraryOptions,
  // Music components
  generateMusicPlayerFull,
  generateMiniPlayer,
  generatePlaylistCard,
  generateArtistCard,
  generateQueueList,
  type MusicOptions,
  // Video components
  generateVideoCard,
  generateVideoComments,
  type VideoOptions,
  // Author components
  generateAuthorProfile,
  generateAuthorList,
  generateAuthorCard,
  type AuthorOptions,
} from './media';

// ============================================
// HOSPITALITY COMPONENTS
// ============================================

export {
  // Hotel components
  generateHotelStats,
  generateRoomFiltersHotel,
  generateRoomCalendar,
  generateRoomStatusOverview,
  generateGuestProfileHotel,
  generateGuestStats,
  generateHousekeepingBoard,
  generateOccupancyChart,
  type HotelOptions,
  // Campground components
  generateCampgroundStats,
  generateReservationCalendarCampground,
  generateActivityCalendarCampground,
  generateSiteAvailability,
  generateSiteSchedule,
  type CampgroundOptions,
  // Marina components
  generateMarinaStats,
  generateReservationCalendarMarina,
  generateReservationListTodayMarina,
  generateSlipAvailability,
  generateCustomerProfileMarina,
  type MarinaOptions,
  // Parking components
  generateParkingStats,
  generateOccupancyOverviewParking,
  generateReservationFiltersParking,
  generateCustomerProfileParking,
  type ParkingOptions,
  // Coworking components
  generateCoworkingStats,
  generateBookingCalendarCoworking,
  generateBookingListCoworking,
  generateMemberProfileCoworking,
  generateSpaceCalendar,
  type CoworkingOptions,
} from './hospitality';

// ============================================
// MARKETING COMPONENTS
// ============================================

export {
  // Affiliate components
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
  // Campaign components
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
  // Client components
  generateClientFilters,
  generateClientHeader,
  generateClientList,
  generateClientProjects,
  generateClientStats,
  type ClientFiltersOptions,
  type ClientHeaderOptions,
  type ClientListOptions,
  type ClientProjectsOptions,
  type ClientStatsOptions,
  // Referral components
  generateCampaignStatsReferral,
  generateRewardTiers,
  generateReferralFilters,
  type CampaignStatsReferralOptions,
  type RewardTiersOptions,
  type ReferralFiltersOptions,
  // Subscriber components
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
} from './marketing';

// ============================================
// SERVICES COMPONENTS
// ============================================

export {
  // Auto Repair
  generateAutorepairStats,
  generateCustomerProfileAutorepair,
  generateVehicleProfile,
  generateVehicleHistory,
  generateServiceCallListToday,
  generateRepairListPending,
  type AutorepairStatsOptions,
  type CustomerProfileAutorepairOptions,
  type VehicleProfileOptions,
  type VehicleHistoryOptions,
  type ServiceCallListTodayOptions,
  type RepairListPendingOptions,
  // HVAC
  generateHvacStats,
  generateCustomerDetailHvac,
  generateCustomerEquipmentHvac,
  generateServiceCallListTodayPlumbing,
  type HvacStatsOptions,
  type CustomerDetailHvacOptions,
  type CustomerEquipmentHvacOptions,
  type ServiceCallListTodayPlumbingOptions,
  // Plumbing
  generatePlumbingStats,
  generateCustomerDetailPlumbing,
  type PlumbingStatsOptions,
  type CustomerDetailPlumbingOptions,
  // Cleaning
  generateCleaningStats,
  generateBookingCalendarCleaning,
  generateCleanerProfile,
  generateCleanerSchedule,
  generateCustomerProfileCleaning,
  type CleaningStatsOptions,
  type BookingCalendarCleaningOptions,
  type CleanerProfileOptions,
  type CleanerScheduleOptions,
  type CustomerProfileCleaningOptions,
  // Moving
  generateMovingStats,
  generateMoveCalendar,
  generateUpcomingMoves,
  generateCustomerProfileMoving,
  type MovingStatsOptions,
  type MoveCalendarOptions,
  type UpcomingMovesOptions,
  type CustomerProfileMovingOptions,
  // Laundry
  generateLaundryStats,
  generateOrderFiltersLaundry,
  generateOrderTimelineLaundry,
  generateCustomerProfileLaundry,
  type LaundryStatsOptions,
  type OrderFiltersLaundryOptions,
  type OrderTimelineLaundryOptions,
  type CustomerProfileLaundryOptions,
  // Tailor
  generateTailorStats,
  generateFittingCalendar,
  generateFittingListToday,
  generateCustomerProfileTailor,
  type TailorStatsOptions,
  type FittingCalendarOptions,
  type FittingListTodayOptions,
  type CustomerProfileTailorOptions,
  // Print Shop
  generatePrintshopStats,
  generateCustomerProfilePrintshop,
  type PrintshopStatsOptions,
  type CustomerProfilePrintshopOptions,
  // Storage
  generateUnitAvailability,
  generateUnitFilters,
  generateCustomerProfileStorage,
  generateRenewalList,
  type UnitAvailabilityOptions,
  type UnitFiltersOptions,
  type CustomerProfileStorageOptions,
  type RenewalListOptions,
} from './services';

// ============================================
// RECRUITMENT COMPONENTS
// ============================================

export {
  // Jobs Components
  generateActiveJobsRecruitment,
  generateJobFiltersRecruitment,
  generateJobTimeline,
  type JobsRecruitmentOptions,
  // Candidates Components
  generateCandidateFilters,
  generatePlacementPipeline,
  generateInterviewSchedule,
  type CandidatesRecruitmentOptions,
  // Client Components
  generateClientProfileRecruitment,
  type ClientRecruitmentOptions,
  // Stats Components
  generateRecruitmentStats,
  generateRecruitmentKPICards,
  generateRecruitmentMetricsChart,
  type RecruitmentStatsOptions,
} from './recruitment';

// ============================================
// BEAUTY COMPONENTS
// ============================================

export {
  // Salon components
  generateAppointmentCalendarSalon,
  generateSalonStats,
  generateStylistProfile,
  generateStylistSchedule,
  generateClientProfileSalon,
  type SalonOptions,
  // Spa components
  generateAppointmentCalendarSpa,
  generateSpaStats,
  generateSpaSchedule,
  generateTherapistProfileSpa,
  generateClientProfileSpa,
  type SpaOptions,
} from './beauty';

// ============================================
// DELIVERY COMPONENTS
// ============================================

export {
  // Delivery List components
  generateDeliveryListFlorist,
  // Delivery Schedule components
  generateDeliveryScheduleGeneric,
  generateDeliveryScheduleFlorist,
  // Earnings components
  generateEarningsChart,
  generateEarningsSummary,
  // Types
  type FloristDeliveryOptions,
} from './delivery';

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
// SUPPORT COMPONENTS
// ============================================

export {
  // Knowledge Base components
  generateKnowledgeBase,
  generateArticleList,
  generateArticleDetail,
  type KnowledgeBaseOptions,
  // Ticket components
  generateTicketList,
  generateTicketDetail,
  generateTicketForm,
  type TicketOptions,
  // FAQ components
  generateFaqSection,
  generateFaqCategories,
  type FaqOptions,
  // Live Chat components
  generateLiveChat,
  generateChatWidget,
  type LiveChatOptions,
  // Article components
  generateArticleContent,
  generateArticleFeedback,
  generateArticleSidebar,
  generateRelatedArticles,
  type ArticleOptions,
  // KB components
  generateKBSearch,
  generateKBCategories,
  generateKBSidebar,
  type KBOptions,
  // Ticket Agent components
  generateTicketFilters,
  generateTicketInfo,
  generateTicketConversation,
  generateAgentReplyForm,
  generateTicketReplies,
  generateReplyForm,
  type TicketAgentOptions,
} from './support';

// ============================================
// LEGAL COMPONENTS
// ============================================

export {
  // Attorney components
  generateAttorneyProfile,
  type AttorneyOptions,
  // Case components
  generateCaseFilters,
  generateCaseFiltersLawfirm,
  generateCaseHeader,
  generateCaseListActive,
  generateCaseStats,
  generateCaseTimeline,
  generateCaseTimelineLawfirm,
  type CaseOptions,
  // Client components
  generateClientProfileLawfirm,
  generateClientProfileLegal,
  type ClientOptions,
  // Deadline components
  generateDeadlineListLawfirm,
  type DeadlineOptions,
  // Law Firm components
  generateLawfirmStats,
  type LawfirmOptions,
} from './legal';

// ============================================
// FORUM COMPONENTS
// ============================================

export {
  // Category components
  generateForumCategories,
  generateCategoryCard,
  type ForumCategoryOptions,
  // Thread components
  generateThreadList,
  generateThreadDetail,
  generateCreateThread,
  type ThreadOptions,
  // Post components
  generatePostList,
  generatePostEditor,
  generatePostReply,
  type PostOptions,
  // Member components
  generateMemberList,
  generateMemberProfile,
  generateLeaderboard,
  type MemberOptions,
  // Header components
  generateForumHeader,
  generateForumSidebar,
  generateSubforumList,
  generateAnnouncementList,
  type HeaderOptions,
  // Search components
  generateSearchFilters,
  generateSearchResults,
  generateMemberSearch,
  type SearchOptions,
  // Profile components
  generateProfileStats,
  generateBadgeList,
  generateMemberProfileCard,
  type ProfileOptions as ForumProfileOptions,
  // Group components
  generateGroupList,
  generateGroupCard,
  generateGroupDetail,
  type GroupOptions,
} from './forum';

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
  type VenueOptions as WeddingVenueOptions,
} from './wedding';

// ============================================
// SURVEY COMPONENTS
// ============================================

export {
  // Survey components
  generateSurveyBuilder,
  generateSurveyFilters,
  generateSurveyForm,
  generateSurveyHeader,
  generateSurveyStats,
  type SurveyOptions,
  // Response/Analytics components
  generateResponseChart,
  generateResponseSummary,
  generateQuestionAnalytics,
  type ResponseOptions,
} from './survey';

// ============================================
// LEISURE/RECREATION COMPONENTS
// ============================================

export {
  // Golf components
  generateGolfStats,
  generateTeeTimeCalendar,
  generateTeeTimeListToday,
  generateMemberProfileGolf,
  generateTournamentListUpcoming,
  generateLessonCalendarGolf,
  type GolfStatsOptions,
  type TeeTimeCalendarOptions,
  type TeeTimeListOptions,
  type MemberProfileGolfOptions,
  type TournamentListOptions,
  type LessonCalendarGolfOptions,
  // Ski Resort components
  generateSkiResortStats,
  generateLessonCalendarSki,
  generateTrailStatusOverview,
  type SkiResortStatsOptions,
  type LessonCalendarSkiOptions,
  type TrailStatusOverviewOptions,
} from './leisure';

// ============================================
// CREATIVE/DESIGN COMPONENTS
// ============================================

export {
  // Gallery components
  generateGalleryStats,
  generateSalesStatsGallery,
  generateArtworkFilters,
  generatePhotoGallery,
  type GalleryGeneratorOptions,
  // Artist components
  generateArtistProfileGallery,
  type ArtistGeneratorOptions,
  // Photo components
  generatePhotoStats,
  generateBookingCalendarPhoto,
  generateClientProfilePhoto,
  type PhotoGeneratorOptions,
  // Design components
  generateDesignStats,
  generateClientProfileDesign,
  type DesignGeneratorOptions,
} from './creative';

// ============================================
// PET SERVICES COMPONENTS
// ============================================

export {
  // Pet Boarding components
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
  // Pet Daycare components
  generateDaycareStats,
  generateActivityCalendarDaycare,
  generateCheckinListToday,
  generateChildProfile,
  type DaycareStatsOptions,
  type ActivityCalendarOptions,
  type CheckinListOptions,
  type ChildProfileOptions,
  // Veterinary components
  generatePetProfile,
  generateOwnerProfile,
  type PetProfileVetOptions,
  type OwnerProfileOptions,
} from './pets';

// ============================================
// INDUSTRY COMPONENTS
// ============================================

export {
  // Auction components
  generateAuctionFilters,
  generateAuctionTimer,
  generateBidForm,
  generateBidHistory,
  generateAuctionCard,
  type AuctionOptions,
  // Fitness & Yoga components
  generateClassCalendarYoga,
  generateClassListTodayYoga,
  generateInstructorProfileYoga,
  generateInstructorScheduleYoga,
  generateMemberProfileYoga,
  generatePublicScheduleYoga,
  generateDanceStudioStatsView,
  type FitnessYogaOptions,
  // Dance components
  generateClassFiltersDance,
  generateInstructorProfileDance,
  generateStudentProfileDance,
  generateScheduleCalendarDance,
  type DanceOptions,
  // Medical components
  generatePatientAppointments,
  generateMedicalRecords,
  generateDoctorList,
  generateMedicationTracker,
  generateVitalStats,
  type MedicalOptions,
  // Security components
  generateGuardFilters,
  generateGuardListActive,
  generateGuardProfile,
  generateGuardSchedule,
  generateIncidentFilters,
  generateIncidentListRecent,
  generateScheduleCalendarSecurity,
  type SecurityOptions,
  // Vehicle/Fleet components
  generateVehicleFilters,
  generateVehicleCard,
  generateVehicleDetail,
  generateTruckSchedule as generateTruckScheduleFleet,
  generateFleetStats,
  type VehicleOptions,
} from './industry';

// ============================================
// MISC COMPONENTS
// ============================================

export {
  generateAppointmentDetailView,
  generateContactInfo,
  generateClientLogos,
  generateContractRenewalDue,
  generateDentistSchedule,
  generateEventCalendarView,
  type MixedComponentOptions,
} from './misc';

// ============================================
// BUSINESS COMPONENTS
// ============================================

export {
  // Stats generators for various business types
  generateAccountingStats,
  generateArcadeStats as generateArcadeStatsBusiness,
  generateBakeryStats,
  generateBreweryStats,
  generateCateringStats,
  generateCinemaStats as generateCinemaStatsBusiness,
  generateConsultingStats,
  generateCrossfitStats,
  generateDanceStudioStats,
  generateDentalStats,
  generateEscapeRoomStats as generateEscapeRoomStatsBusiness,
  generateFloristStats,
  generateFoodtruckStats,
  generateFreelanceStats,
  generateJewelerStats,
  generateLibraryStats as generateLibraryStatsBusiness,
  generateLotStats,
  generateMarketingStats,
  generateMembershipStats,
  generateNurseryStats,
  generateOpticianStats,
  generatePharmacyStats,
  generateRehabStats,
  generateRentalStats,
  generateSecurityStats as generateSecurityStatsBusiness,
  generateSeniorStats,
  generateSkiResortStats as generateSkiResortStatsBusiness,
  generateTicketStats as generateTicketStatsBusiness,
  generateTravelagencyStats,
  generateVetClinicStats,
  generateYogaStats,
  generateBillingStatsDental,
  generateBillingStatsVet,
  generateInvoiceStatsConsulting,
  generateStatsSection,
  generateSalesStatsGalleryComponent,
  type BusinessStatsOptions,
} from './business';
