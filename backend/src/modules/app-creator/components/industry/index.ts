/**
 * Industry-Specific Component Generators
 */

// Fitness & Yoga
export {
  generateClassCalendarYoga,
  generateClassListTodayYoga,
  generateInstructorProfileYoga,
  generateInstructorScheduleYoga,
  generateMemberProfileYoga,
  generatePublicScheduleYoga,
  generateDanceStudioStatsView,
  generateClassFiltersDance,
  generateInstructorProfileDance,
  generateStudentProfileDance,
  generateScheduleCalendarDance,
  type FitnessYogaOptions,
} from './fitness-yoga.generator';

// Security Industry
export {
  generateGuardFilters,
  generateGuardListActive,
  generateGuardProfile,
  generateGuardSchedule,
  generateIncidentFilters,
  generateIncidentListRecent,
  generateScheduleCalendarSecurity,
  type SecurityOptions,
} from './security.generator';

// Medical/Healthcare
export {
  generatePatientFilters,
  generatePatientFiltersVet,
  generatePatientProfileDental,
  generatePatientProfileRehab,
  generatePatientProfileVet,
  generatePatientProgressOverview,
  generateVetProfile,
  generateVetSchedule,
  generateTreatmentHistory,
  generateDentistProfile,
  generateAppointmentDetail as generateAppointmentDetailMedical,
  type MedicalOptions,
} from './medical.generator';

// CrossFit/Gym
export {
  generateWodCalendar,
  generateWodToday,
  generatePublicWod,
  generateLeaderboardPreview,
  generateWorkshopListUpcoming,
  type CrossfitOptions,
} from './crossfit.generator';

// Orders & Inventory
export {
  generateOrderFilters,
  generateOrderFiltersBakery,
  generateOrderFiltersFlorist,
  generateOrderHeader,
  generateOrderItems,
  generateOrderListReady,
  generateInventoryFilters,
  generateLowStockAlert,
  generateTodaysOrders,
  type OrdersOptions,
} from './orders.generator';

// Entertainment & Media
export {
  generateVideoCard,
  generateVideoComments,
  generateMusicPlayer,
  generateNowPlaying,
  generatePodcastSearch,
  generateEpisodeCard,
  generateMovieFilters,
  generateGameListPopular,
  generateGenreGrid,
  type EntertainmentOptions,
} from './entertainment.generator';

// Professional Services
export {
  generateTimeTracker,
  generateTimeTrackerConsulting,
  generateFreelancerProfile,
  generateClientHeaderConsulting,
  generateProjectFiltersConsulting,
  generateProjectTimelineConsulting,
  generateRevenueReportConsulting,
} from './professional.generator';

// Schedule & Calendar
export {
  generateTodaySchedule,
  generateSessionListActive,
  generateTherapistSchedule,
  generateTechnicianSchedule,
} from './schedule.generator';

// Client/Customer Profiles (only ones that don't exist elsewhere)
export {
  generateClientProfileSecurity,
  generateClientProfileTravel,
  type ClientProfileOptions,
} from './client-profiles.generator';

// Auction Components
export {
  generateAuctionFilters,
  generateAuctionTimer,
  generateBidForm,
  generateBidHistory,
  generateAuctionCard,
  type AuctionOptions,
} from './auction.generator';

// Event & Calendar Components
export {
  generateEventCalendarBrewery,
  generateEventCalendarCatering,
  generateEventListUpcoming,
  generateCampaignFilters as generateCampaignFiltersIndustry,
  generateCampaignHeader as generateCampaignHeaderIndustry,
  generateVenueCalendar as generateVenueCalendarIndustry,
  generateReservationCalendar,
  type EventCalendarOptions,
} from './event-calendar.generator';

// Customer & Staff Components (Hvac, Plumbing, Boarding already exist in services/pets modules)
export {
  generateDriverProfile,
  generateTechnicianProfile,
  type CustomerStaffOptions,
} from './customer-staff.generator';

// Ticketing & Support Components
export {
  generateTicketFilters,
  generateTicketConversation,
  generateTicketInfo,
  generateTicketReplies,
  generateTicketSalesToday,
  generateTicketSalesRecent,
  type TicketingOptions,
} from './ticketing.generator';

// Venue Components
export {
  generateVenueStats as generateVenueStatsIndustry,
  generateVenueCard,
  generateVenueFilters,
  generateVenueDetail,
  generateVenueBookingForm,
  type VenueOptions as VenueOptionsIndustry,
} from './venue.generator';

// Vendor Components
export {
  generateVendorCard,
  generateVendorHeader,
  generateVendorList,
  generateVendorFilters,
  generateSupplierProfile,
  type VendorOptions,
} from './vendor.generator';

// Vehicle & Fleet Components
export {
  generateVehicleFilters,
  generateVehicleCard,
  generateVehicleDetail,
  generateTruckSchedule as generateTruckScheduleIndustry,
  generateFleetStats,
  type VehicleOptions,
} from './vehicle.generator';

// Work Order Components
export {
  generateWorkOrderFilters,
  generateWorkOrderTimeline,
  generateWorkFilters,
  generateWorkOrderCard,
  generateWorkOrderDetail,
  type WorkOrderOptions,
} from './work-order.generator';

// Trip & Travel Components
export {
  generateTripFilters,
  generateTripItinerary,
  generateTripCard,
  generateTrackingInfo,
  generateUpcomingMoves as generateUpcomingMovesIndustry,
  generateUpcomingDepartures,
  type TripOptions,
} from './trip.generator';

// Miscellaneous Components
export {
  generateTestimonialSlider,
  generateSkillList,
  generateTeamMemberProfile,
  generateValuesSection,
  generateStatsSection as generateStatsSectionIndustry,
  generateServiceFeatures,
  generateServiceContent,
  generateServiceCTA,
  generateSubscriptionCard,
  generateSearchResults as generateSearchResultsIndustry,
  generateShoppingList,
  generateRewardTiers as generateRewardTiersIndustry,
  type MiscOptions,
} from './misc.generator';

// Reports & Analytics Components
export {
  generateSalesChart,
  generateRevenueChart,
  generateUtilizationReport,
  generateSalesStatsGallery as generateSalesStatsGalleryIndustry,
  generateFulfillmentReport,
  generateStockByWarehouse,
  type ReportsOptions,
} from './reports.generator';

// Specialized Industry Components
export {
  generateVetSearch,
  generateTourListToday,
  generateTeeTimeListToday as generateTeeTimeListTodayIndustry,
  generateSkiResortStats as generateSkiResortStatsIndustry,
  generateTournamentListUpcoming as generateTournamentListUpcomingIndustry,
  generateTestListUpcoming as generateTestListUpcomingIndustry,
  generateRoomStatusOverview as generateRoomStatusOverviewIndustry,
  generateResidentProfile,
  type SpecializedOptions,
} from './specialized.generator';

// Filter Components
export {
  generateCampaignFiltersMarketing as generateCampaignFiltersMarketingIndustry,
  generateCaseFiltersLawfirm as generateCaseFiltersLawfirmIndustry,
  generateBookingFiltersVenue as generateBookingFiltersVenueIndustry,
  generateEstimateFilters,
  generateIncidentFiltersComponent,
  generateReservationFilters,
  type FiltersOptions,
} from './filters.generator';

// Lists & Timelines Components
export {
  generateCaseTimelineLawfirm as generateCaseTimelineLawfirmIndustry,
  generateDeadlineListAccounting,
  generateDeadlineListLawfirm as generateDeadlineListLawfirmIndustry,
  generateEstimateListPending,
  generateAppointmentListTodayRehab as generateAppointmentListTodayRehabIndustry,
  generateLessonListTodayDriving as generateLessonListTodayDrivingIndustry,
  generateFlightListToday as generateFlightListTodayIndustry,
  generateExamListToday as generateExamListTodayIndustry,
  type ListsOptions,
} from './lists-timelines.generator';

// Headers & UI Components
export {
  generateCampaignHeaderMarketing,
  generateCategoryHeader,
  generateCategoryPills,
  generateChannelHeader,
  generateChannelTabs,
  generateClassHeader,
  generateDesignStats as generateDesignStatsIndustry,
  generateForumSidebar as generateForumSidebarIndustry,
  type HeadersUIOptions,
} from './headers-ui.generator';

// Calendar Components
export {
  generateCalendarAccounting as generateCalendarAccountingIndustry,
  generateEventCalendarClub,
  generateExamCalendar as generateExamCalendarIndustry,
  generateLessonCalendarGolf as generateLessonCalendarGolfIndustry,
  generateLessonCalendarMusic as generateLessonCalendarMusicIndustry,
  type CalendarsOptions,
} from './calendars.generator';

// Knowledge Base Components
export {
  generateKBCategories,
  generateKBSearch,
  generateKBSidebar,
  type KnowledgeBaseOptions as KBOptions,
} from './knowledge-base.generator';

// Member Components
export {
  generateMemberFilters,
  generateMemberFiltersClub,
  generateMemberGroups,
  generateMemberGrowthChart,
  generateMemberProfileBrewery,
  generateMemberProfileClub,
  generateMemberProfileLibrary,
  generateMemberSearch as generateMemberSearchIndustry,
  type MemberComponentsOptions,
} from './member-components.generator';

// Order & Inventory Components
export {
  generateOrderListRecentBrewery,
  generateOrderListRecentNursery,
  generateOrderQueueFoodtruck,
  generateOrderTimelineLaundry as generateOrderTimelineLaundryIndustry,
  generatePendingOrdersFlorist,
  generateLowStockAlerts,
  generateStockAdjustmentForm,
  generateInventoryReport,
  type OrderInventoryOptions,
} from './order-inventory.generator';

// Schedule Components
export {
  generateScheduleCalendarFoodtruck,
  generatePartyCalendarArcade,
  generatePartyListToday,
  generateTourCalendarBrewery,
  generateRoomScheduleEscape,
  generateScreeningCalendar,
  generateScreeningListToday,
  generateSessionList,
  generateSiteScheduleComponent,
  type ScheduleComponentsOptions,
} from './schedule-components.generator';

// UI Components
export {
  generateAssetBrowser,
  generateBadgeList,
  generateLocationMap,
  generateMapSection,
  generatePageHeader,
  generateProcessSection,
  generateReplyForm,
  generateReportList,
  generateSubforumList as generateSubforumListIndustry,
  generateTaskDetail,
  generateGroupMembers,
  generateClassStudents,
  generatePendingItems,
  type UIComponentsOptions,
} from './ui-components.generator';

// Specialized Lists
export {
  generateServiceCallListToday as generateServiceCallListTodayIndustry,
  generateServiceCallListTodayPlumbing as generateServiceCallListTodayPlumbingIndustry,
  generateFittingListToday as generateFittingListTodayIndustry,
  generateLensOrderListPending,
  generatePrescriptionListPending,
  generateRepairListPending as generateRepairListPendingIndustry,
  generatePlantListFeatured,
  generateCustomOrderList,
  generateEventRegistrations,
  generateExpiringRentals,
  type SpecializedListsOptions,
} from './specialized-lists.generator';

// Remaining Components
export {
  generateCustomerBoats,
  generateCustomerEquipmentHvac as generateCustomerEquipmentHvacIndustry,
  generateCustomerPrescriptions,
  generateCustomerPrescriptionsOptician,
  generateIngredientList,
  generateLibraryActivity,
  generateLibraryTabs,
  generateLiveAuction,
  generateLoanFilters,
  generateMealPlanner,
  generateMedicalRecordsVet,
  generateMedicationScheduleToday,
  generateMovementHistory,
  generateNutritionInfo,
  generateProductDetailCard,
  generateProductFilters,
  generateProductFiltersDesign,
  generateProjectContent,
  generateProjectFilters,
  generateProjectFiltersDesign,
  generateProjectGallery,
  generateProjectHero,
  generateProjectTestimonial,
  generatePurchaseOrderDetail,
  generateQuoteRequests,
  generateRecipeHeader,
  generateRecipeSteps,
  generateRentalFilters,
  generateTaxReturnFilters,
  type RemainingComponentsOptions,
} from './remaining-components.generator';
