import {
  GeneratedFile,
  DatabaseSchema,
  EnhancedAppAnalysis,
  EnhancedEntityDefinition,
} from '../dto/create-app.dto';
import { snakeCase, camelCase, pascalCase, kebabCase } from 'change-case';
import * as pluralize from 'pluralize';

// Import blueprints
import { getBlueprint, Blueprint, PageDefinition } from '../blueprints';

// Import component generators
import {
  // Common
  generateHero,
  generateHeroWithStats,
  generateFilters,
  generateDataTable,
  generateNavbar,
  generateSidebar,
  // Ecommerce
  generateProductGrid,
  generateFeaturedProducts,
  generateCart,
  generateMiniCart,
  generateCheckout,
  generateOrderSummary,
  generateProductDetail,
  // Blog
  generateBlogList,
  generateFeaturedPosts,
  // Dashboard
  generateDataGrid,
  generateActivityFeed,
  generateActivityTimeline,
  generateAnalyticsCharts,
  // CRM
  generateKanbanBoard,
  generatePipelineOverview,
  generateContactProfile,
  generateCompanyProfile,
  generateDealCard,
  generateTaskList,
  generateNotesList,
  // Social
  generateProfileHeader,
  generateProfileTabs,
  generateUserGrid,
  generatePostComposer,
  generatePostFeed,
  generateCommentSection,
  generateMessageList,
  generateChatInterface,
  generateNotificationList,
  // Booking
  generateServiceGrid,
  generateStaffGrid,
  generateBookingWizard,
  generateAppointmentList,
  generateBookingConfirmation,
  generateDatePicker,
  generateTimeSlots,
  generateBookingCalendarEscape,
  generateBookingFiltersRental,
  generateBookingFiltersTravel,
  generateBookingListTodayEscape,
  generateBookingListTravel,
  // Project Management
  generateProjectGrid,
  generateProjectHeader,
  generateMilestoneTracker,
  generateTeamMembers,
  // LMS
  generateCourseGrid,
  generateCourseFilters,
  generateEnrolledCourses,
  generateCourseHeader,
  generateCurriculumList,
  generateProgressTracker,
  generateLessonPlayer,
  generateLessonSidebar,
  generateQuizPlayer,
  generateCertificateGrid,
  // Healthcare
  generatePatientProfile,
  generateMedicalHistory,
  generateAppointmentCalendar,
  generateAppointmentForm,
  generateDoctorGrid,
  generateDoctorProfile,
  generateDoctorSchedule,
  // Healthcare Specialties
  generateChiropractorStats,
  generateSpineAssessment,
  generateAdjustmentHistory,
  generateDermatologyStats,
  generateSkinConditionTracker,
  generateBiopsyTracker,
  generatePediatricsStats,
  generateGrowthChart,
  generateVaccinationSchedule,
  generateMentalHealthStats,
  generateTherapySessionNotes,
  generateMoodTracker,
  generateRadiologyStats,
  generateImagingQueue,
  generateScanViewer,
  generateHomeCareStats,
  generateVisitScheduleMap,
  generateCaregiverAssignment,
  generateLabStats,
  generateLabResults,
  generateTestOrderForm,
  // Fitness
  generateMembershipPlans,
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
  // Real Estate
  generatePropertySearch,
  generatePropertyGrid,
  generatePropertyFilters,
  generatePropertyGallery,
  generatePropertyDetails,
  generateInquiryForm,
  generateAgentGrid,
  generateAgentProfile,
  // Food
  generateMenuGrid,
  generateMenuCategories,
  generateCartPreview,
  generateCheckoutForm,
  generateOrderConfirmation,
  generateOrderTracking,
  generateOrderList,
  generateOrderQueue,
  generateReservationForm,
  generateRestaurantInfo,
  // Job Board
  generateJobSearch,
  generateJobList,
  generateJobFilters,
  generateJobDetail,
  generateApplyCard,
  generateCompanyCard,
  generateCompanyGrid,
  generateApplicationForm,
  generateApplicationList,
  generateCandidateProfile,
  // Events
  generateEventGrid,
  generateEventFilters,
  generateEventHeader,
  generateEventSchedule,
  generateVenueInfo,
  generateTicketSelector,
  generateTicketList,
  generateTicketDetail,
  generateSpeakerGrid,
  generateSponsorGrid,
  // Finance
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
  // Banking
  generateAccountBalanceCards,
  generateAccountDetail,
  generateAccountList,
  generateCardDetail,
  generateCardList,
  generateBillList,
  generateBillPaymentForm,
  generateTransferForm,
  generateTransferHistory,
  generateBeneficiaryList,
  generateTransactionTable,
  generateTransactionFilters,
  generateBudgetForm,
  generateBudgetOverview,
  // Support
  generateKnowledgeBase,
  generateArticleList,
  generateArticleDetail,
  generateSupportTicketList,
  generateSupportTicketDetail,
  generateSupportTicketForm,
  generateFaqSection,
  generateFaqCategories,
  generateLiveChat,
  generateChatWidget,
  // Media
  generateVideoPlayer,
  generatePlaylist,
  generateVideoGrid,
  generateAudioPlayer,
  generateTrackList,
  generateAlbumGrid,
  generateGallery,
  generateLightbox,
  generateImageUpload,
  generatePodcastPlayer,
  generateEpisodeList,
  generatePodcastGrid,
  // Forum
  generateForumCategories,
  generateCategoryCard,
  generateThreadList,
  generateThreadDetail,
  generateCreateThread,
  generatePostList,
  generatePostEditor,
  generatePostReply,
  generateMemberList,
  generateMemberProfile,
  generateLeaderboard,
  // Survey
  generateSurveyBuilder,
  generateSurveyFilters,
  generateSurveyForm,
  generateSurveyHeader,
  generateSurveyStats,
  generateResponseChart,
  generateResponseSummary,
  generateQuestionAnalytics,
  // Beauty/Salon/Spa
  generateAppointmentCalendarSalon,
  generateSalonStats,
  generateStylistProfile,
  generateStylistSchedule,
  generateClientProfileSalon,
  generateAppointmentCalendarSpa,
  generateSpaStats,
  generateSpaSchedule,
  generateTherapistProfileSpa,
  generateClientProfileSpa,
  // Wedding
  generateWeddingStats,
  generateWeddingCountdown,
  generateWeddingTimeline,
  generateBudgetSummaryWedding,
  generateTaskBoardWedding,
  generateTaskListWedding,
  generateVenueCalendar,
  generateVenueStats,
  generateBookingFiltersVenue,
  generateClientProfileVenue,
  // Nonprofit
  generateChurchStats,
  generateSermonList,
  generateSermonNotes,
  generateSermonPlayer,
  generatePrayerList,
  generateDonationStats,
  generateDonationChart,
  generateDonationFiltersNonprofit,
  generateDonationSummary,
  generateDonorProfile,
  generateMemberDonations,
  generateCampaignListNonprofit,
  generateCampaignProgressNonprofit,
  generateFundingProgress,
  generateFuneralStats,
  generateArrangementList,
  generateArrangementListUpcoming,
  generateObituaryListRecent,
  // Logistics
  generateShipmentMap,
  generateShipmentFilters,
  generateShipmentTimeline,
  generateShipmentFiltersWarehouse,
  generateWarehouseStats,
  generateOrderListWarehouse,
  generateStockLevels,
  generateReceivingForm,
  generateReceivingList,
  generateDeliverySchedule,
  generateDeliveryTracker,
  generateRoutePlanner,
  generateTruckSchedule,
  generatePickList,
  generatePickQueue,
  generateLogisticsStats,
  // Insurance
  generatePolicyList,
  generatePolicyDetail,
  generatePolicyFilters,
  generatePolicyForm,
  generateClaimsList,
  generateClaimsStats,
  generateClaimForm,
  generateClaimTimeline,
  generateQuoteList,
  generateQuoteWizard,
  generateInsuranceCustomerProfile,
  generateDocumentList,
  generateInsuranceStats,
  // Creative
  generateGalleryStats,
  generateSalesStatsGallery,
  generateArtworkFilters,
  generatePhotoGallery,
  generateArtistProfileGallery,
  generatePhotoStats,
  generateBookingCalendarPhoto,
  generateClientProfilePhoto,
  generateDesignStats,
  generateClientProfileDesign,
  // Pets
  generatePetboardingStats,
  generateCalendarPetboarding,
  generateStaffScheduleBoarding,
  generatePetProfileBoarding,
  generateCurrentPets,
  generatePetActivities,
  generateFeedingSchedule,
  generateDaycareStats,
  generateActivityCalendarDaycare,
  generateCheckinListToday,
  generateChildProfile,
  generatePetProfile,
  generateOwnerProfile,
  // Marketing
  generateCampaignFilters,
  generateCampaignFiltersMarketing,
  generateCampaignHeader,
  generateCampaignListActive,
  generateCampaignPerformance,
  generateCampaignStats,
  generateCampaignStory,
  generateAffiliateLeaderboard,
  generateAffiliateStats,
  generateLinkGenerator,
  generatePayoutBalance,
  generateCommissionSummary,
  generateCampaignStatsReferral,
  generateRewardTiers,
  generateReferralFilters,
  generateSubscriberChart,
  generateSubscriberProfile,
  generateChurnMetrics,
  generateMrrStats,
  generatePlanDistribution,
  generateClientHeaderMarketing,
  generateClientPerformanceMarketing,
  generateProjectBoardMarketing,
  generateTaskListMarketing,
  // Hospitality
  generateHotelStats,
  generateRoomFiltersHotel,
  generateRoomCalendar,
  generateRoomStatusOverview,
  generateGuestProfileHotel,
  generateGuestStats,
  generateHousekeepingBoard,
  generateOccupancyChart,
  generateCampgroundStats,
  generateReservationCalendarCampground,
  generateActivityCalendarCampground,
  generateSiteAvailability,
  generateSiteSchedule,
  generateMarinaStats,
  generateReservationCalendarMarina,
  generateReservationListTodayMarina,
  generateSlipAvailability,
  generateCustomerProfileMarina,
  generateParkingStats,
  generateOccupancyOverviewParking,
  generateReservationFiltersParking,
  generateCustomerProfileParking,
  generateCoworkingStats,
  generateBookingCalendarCoworking,
  generateBookingListCoworking,
  generateMemberProfileCoworking,
  generateSpaceCalendar,
  // Generic UI
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
  // Travel
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
  // Forum Extended
  generateForumHeader,
  generateSearchFilters,
  // Dating
  generateDatingProfile,
  generateProfilePreview,
  generateProfileStats,
  generateAthleteProfile,
  generateArtistProfile,
  generateSwipeCards,
  generateMatchCard,
  generateDiscoveryFilters,
  generateIcebreakers,
  generateChatWindowDating,
  // Education
  generateStudentProfile,
  generateStudentFilters,
  generateStudentAttendance,
  generateStudentGrades,
  generateStudentProgress,
  generateTeacherProfile,
  generateTeacherClasses,
  generateGradebook,
  generateGradeFilters,
  generateReportCardGenerator,
  generateAttendanceForm,
  generateAttendanceDatePicker,
  generateAttendanceSummary,
  generateSchoolStats,
  generateSchoolEvents,
  generateTutorProfile,
  generateTutorFilters,
  generateTutorSchedule,
  generateTutoringStats,
  generateStudentProfileTutoring,
  generateInstructorProfileMusic,
  generateInstructorScheduleMusic,
  generateStudentProfileMusic,
  generateStudentProgressMusic,
  generateMusicSchoolStats,
  generateSearchResultsMusic,
  generateLessonCalendarDriving,
  generateStudentProfileDriving,
  generateDrivingStats,
  generateFlightCalendar,
  generateFlightStats,
  generateStudentProfileFlight,
  generateAircraftStatusOverview,
  // Services
  generateAutorepairStats,
  generateCustomerProfileAutorepair,
  generateVehicleProfile,
  generateVehicleHistory,
  generateCleaningStats,
  generateBookingCalendarCleaning,
  generateCleanerProfile,
  generateCleanerSchedule,
  generateCustomerProfileCleaning,
  generateMovingStats,
  generateMoveCalendar,
  generateCustomerProfileMoving,
  generateLaundryStats,
  generateOrderFiltersLaundry,
  generateCustomerProfileLaundry,
  generateTailorStats,
  generateFittingCalendar,
  generateCustomerProfileTailor,
  generatePrintshopStats,
  generateCustomerProfilePrintshop,
  generateUnitAvailability,
  generateUnitFilters,
  generateCustomerProfileStorage,
  generateRenewalList,
  generateHvacStats,
  generatePlumbingStats,
  generateCustomerDetailHvac,
  generateCustomerDetailPlumbing,
  // Legal
  generateCaseFilters,
  generateCaseHeader,
  generateCaseListActive,
  generateCaseStats,
  generateCaseTimeline,
  generateAttorneyProfile,
  generateClientProfileLawfirm,
  generateClientProfileLegal,
  generateLawfirmStats,
  // Recruitment
  generateActiveJobsRecruitment,
  generateJobFiltersRecruitment,
  generateJobTimeline,
  generateCandidateFilters,
  generatePlacementPipeline,
  generateInterviewSchedule,
  generateClientProfileRecruitment,
  generateRecruitmentStats,
  // Leisure
  generateGolfStats,
  generateTeeTimeCalendar,
  generateMemberProfileGolf,
  generateSkiResortStats,
  generateLessonCalendarSki,
  generateTrailStatusOverview,
  // Business/Industry Stats
  generateAccountingStats,
  generateArcadeStats,
  generateBakeryStats,
  generateBreweryStats,
  generateCateringStats,
  generateCinemaStats,
  generateConsultingStats,
  generateCrossfitStats,
  generateDanceStudioStats,
  generateDentalStats,
  generateEscapeRoomStats,
  generateFloristStats,
  generateFoodtruckStats,
  generateFreelanceStats,
  generateJewelerStats,
  generateLibraryStats,
  generateLotStats,
  generateMarketingStats,
  generateMembershipStats,
  generateNurseryStats,
  generateOpticianStats,
  generatePharmacyStats,
  generateRehabStats,
  generateRentalStats,
  generateSecurityStats,
  generateSeniorStats,
  generateSkiResortStats as generateSkiResortStatsNew,
  generateTicketStats,
  generateTravelagencyStats,
  generateVetClinicStats,
  generateYogaStats,
  generateBillingStatsDental,
  generateBillingStatsVet,
  generateInvoiceStatsConsulting,
  generateStatsSection,
  // Content/Article
  generateArticleContent,
  generateArticleFeedback,
  generateArticleSidebar,
  generateAuthorCard,
  generateAuthorProfile,
  generateBlogAuthor,
  generateBlogSidebar,
  generateFeaturedArticle,
  generateRelatedArticles,
  generateAboutStory,
  generateCTASection,
  // Activity/Calendar
  generateActivityCalendarSenior,
  generateActivityListToday,
  generateActivityListTodaySenior,
  generateCalendarAccounting,
  generateAppointmentCalendarDental,
  generateAppointmentCalendarVet,
  generateAppointmentDetail,
  generateAppointmentListTodayRehab,
  generateEventCalendar,
  generateSessionCalendar,
  generateScheduleCalendar,
  // Professional
  generateActiveJobs,
  generateActiveWorkOrders,
  generateAgentReplyForm,
  generateAnnouncementList,
  generateAssignmentList,
  generateAttendanceToday,
  generateBillingOverview,
  generateBillingSummary,
  generateBookSearch,
  // Customer/Client Profiles
  generateCustomerProfileBakery,
  generateCustomerProfileFlorist,
  generateCustomerProfileOptician,
  generateCustomerProfilePharmacy,
  generateCustomerProfileRental,
  generateClientProfileAccounting,
  // Delivery & Logistics
  generateDeliveryListFlorist,
  generateDeliveryScheduleGeneric,
  generateDeliveryScheduleFlorist,
  generateEarningsChart,
  generateEarningsSummary,
  // Misc
  generateAppointmentDetailView,
  generateContactInfo,
  generateClientLogos,
  generateContractRenewalDue,
  generateDentistSchedule,
  generateEventCalendarView,
  // Industry - Fitness/Yoga/Dance
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
  // Industry - Security
  generateGuardFilters,
  generateGuardListActive,
  generateGuardProfile,
  generateGuardSchedule,
  generateIncidentFilters,
  generateIncidentListRecent,
  generateScheduleCalendarSecurity,
  // Industry - Medical
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
  // Industry - CrossFit
  generateWodCalendar,
  generateWodToday,
  generatePublicWod,
  generateLeaderboardPreview,
  generateWorkshopListUpcoming,
  // Industry - Orders & Inventory
  generateOrderFilters,
  generateOrderFiltersBakery,
  generateOrderFiltersFlorist,
  generateOrderHeader,
  generateOrderItems,
  generateOrderListReady,
  generateInventoryFilters,
  generateLowStockAlert,
  generateTodaysOrders,
  // Industry - Entertainment & Media
  generateVideoCard,
  generateVideoComments,
  generateMusicPlayer,
  generateNowPlaying,
  generatePodcastSearch,
  generateEpisodeCard,
  generateMovieFilters,
  generateGameListPopular,
  generateGenreGrid,
  // Industry - Professional Services
  generateTimeTracker,
  generateTimeTrackerConsulting,
  generateFreelancerProfile,
  generateClientHeaderConsulting,
  generateProjectFiltersConsulting,
  generateProjectTimelineConsulting,
  generateRevenueReportConsulting,
  // Industry - Schedule & Calendar
  generateTodaySchedule,
  generateSessionListActive,
  generateTherapistSchedule,
  generateTechnicianSchedule,
  // Industry - Client Profiles (Recruitment already imported in Recruitment section above)
  generateClientProfileFreelance,
  generateClientProfileCatering,
  generateClientProfileSecurity,
  generateClientProfileTravel,
  // Industry - Auction
  generateAuctionFilters,
  generateAuctionTimer,
  generateBidForm,
  generateBidHistory,
  generateAuctionCard,
  // Industry - Event & Calendar (generateVenueCalendar already imported in Wedding section above)
  generateEventCalendarBrewery,
  generateEventCalendarCatering,
  generateEventListUpcoming,
  generateCampaignFilters as generateCampaignFiltersIndustry,
  generateCampaignHeader as generateCampaignHeaderIndustry,
  generateReservationCalendar,
  // Industry - Customer & Staff (Hvac, Plumbing, Boarding already imported from services/pets above)
  generateDriverProfile,
  generateTechnicianProfile,
  // Industry - Ticketing & Support
  generateTicketFilters,
  generateTicketConversation,
  generateTicketInfo,
  generateTicketReplies,
  generateTicketSalesToday,
  generateTicketSalesRecent,
  // Industry - Venue
  generateVenueCard,
  generateVenueFilters,
  generateVenueDetail,
  generateVenueBookingForm,
  // Industry - Vendor
  generateVendorCard,
  generateVendorHeader,
  generateVendorList,
  generateVendorFilters,
  generateSupplierProfile,
  // Industry - Vehicle & Fleet
  generateVehicleFilters,
  generateVehicleCard,
  generateVehicleDetail,
  generateFleetStats,
  // Industry - Work Order
  generateWorkOrderFilters,
  generateWorkOrderTimeline,
  generateWorkFilters,
  generateWorkOrderCard,
  generateWorkOrderDetail,
  // Industry - Trip & Travel
  generateTripFilters,
  generateTripItinerary,
  generateTripCard,
  generateTrackingInfo,
  generateUpcomingMoves,
  generateUpcomingDepartures,
  // Industry - Miscellaneous
  generateTestimonialSlider,
  generateSkillList,
  generateTeamMemberProfile,
  generateValuesSection,
  generateServiceFeatures,
  generateServiceContent,
  generateServiceCTA,
  generateSubscriptionCard,
  generateSearchResults,
  generateShoppingList,
  // Industry - Reports & Analytics
  generateSalesChart,
  generateRevenueChart,
  generateUtilizationReport,
  generateFulfillmentReport,
  generateStockByWarehouse,
  // Industry - Specialized
  generateVetSearch,
  generateTourListToday,
  generateTeeTimeListToday,
  generateTournamentListUpcoming,
  generateTestListUpcoming,
  generateResidentProfile,
  // Industry - Filters
  generateCaseFiltersLawfirm,
  generateEstimateFilters,
  generateIncidentFiltersComponent,
  generateReservationFilters,
  // Industry - Lists & Timelines
  generateCaseTimelineLawfirm,
  generateDeadlineListAccounting,
  generateDeadlineListLawfirm,
  generateEstimateListPending,
  generateLessonListTodayDriving,
  generateFlightListToday,
  generateExamListToday,
  // Industry - Headers & UI
  generateCampaignHeaderMarketing,
  generateCategoryHeader,
  generateCategoryPills,
  generateChannelHeader,
  generateChannelTabs,
  generateClassHeader,
  generateForumSidebar,
  // Industry - Calendars
  generateEventCalendarClub,
  generateExamCalendar,
  generateLessonCalendarGolf,
  generateLessonCalendarMusic,
  // Industry - Knowledge Base
  generateKBCategories,
  generateKBSearch,
  generateKBSidebar,
  // Industry - Member Components
  generateMemberFilters,
  generateMemberFiltersClub,
  generateMemberGroups,
  generateMemberGrowthChart,
  generateMemberProfileBrewery,
  generateMemberProfileClub,
  generateMemberProfileLibrary,
  generateMemberSearch,
  // Industry - Order & Inventory
  generateOrderListRecentBrewery,
  generateOrderListRecentNursery,
  generateOrderQueueFoodtruck,
  generateOrderTimelineLaundry,
  generatePendingOrdersFlorist,
  generateLowStockAlerts,
  generateStockAdjustmentForm,
  generateInventoryReport,
  // Industry - Schedule Components
  generateScheduleCalendarFoodtruck,
  generatePartyCalendarArcade,
  generatePartyListToday,
  generateTourCalendarBrewery,
  generateRoomScheduleEscape,
  generateScreeningCalendar,
  generateScreeningListToday,
  generateSessionList,
  generateSiteScheduleComponent,
  // Industry - UI Components
  generateAssetBrowser,
  generateBadgeList,
  generateLocationMap,
  generateMapSection,
  generatePageHeader,
  generateProcessSection,
  generateReplyForm,
  generateReportList,
  generateSubforumList,
  generateTaskDetail,
  generateGroupMembers,
  generateClassStudents,
  generatePendingItems,
  // Industry - Specialized Lists
  generateServiceCallListToday,
  generateServiceCallListTodayPlumbing,
  generateFittingListToday,
  generateLensOrderListPending,
  generatePrescriptionListPending,
  generateRepairListPending,
  generatePlantListFeatured,
  generateCustomOrderList,
  generateEventRegistrations,
  generateExpiringRentals,
  // Industry - Remaining Components
  generateCustomerBoats,
  generateCustomerEquipmentHvac,
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
  // Auth Components
  generateAuthContext,
  generateAuthTypes,
  generateProtectedRoute,
  generateLoginPage,
  generateSignupPage,
  generateForgotPasswordPage,
  generateResetPasswordPage,
  generateVerifyEmailPage,
  generateChangePasswordComponent,
  generateProfilePage,
} from '../components';

export class ReactTemplateGenerator {
  private blueprint: Blueprint | undefined;

  generate(
    analysis: EnhancedAppAnalysis,
    schema: DatabaseSchema,
    appName: string,
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const requiresAuth = analysis.requiresAuth;

    // Get blueprint for this app type
    this.blueprint = getBlueprint(analysis.appType);

    // Core files
    files.push(this.generatePackageJson(appName));
    files.push(this.generateViteConfig());
    files.push(this.generateEnvFile(appName));
    files.push(this.generateEnvProduction(appName));
    files.push(this.generateTailwindConfig());
    files.push(this.generatePostcssConfig());
    files.push(this.generateTsConfig());
    files.push(this.generateTsConfigNode());
    files.push(this.generateGitignore());
    files.push(this.generateIndexHtml(appName));
    files.push(this.generateCloudflareHeaders());
    files.push(this.generateMainTsx(requiresAuth));
    files.push(this.generateAppTsx(analysis, requiresAuth));
    files.push(this.generateIndexCss());

    // API client and utilities
    files.push(this.generateApiClient());
    files.push(this.generateUtils());

    // Types from schema
    files.push(this.generateTypes(analysis, schema));

    // Auth components (when auth is required)
    if (requiresAuth) {
      files.push({ path: 'src/contexts/AuthContext.tsx', content: generateAuthContext({}), language: 'typescript' });
      files.push({ path: 'src/types/auth.ts', content: generateAuthTypes({}), language: 'typescript' });
      files.push({ path: 'src/components/ProtectedRoute.tsx', content: generateProtectedRoute({}), language: 'typescript' });
      files.push({ path: 'src/pages/LoginPage.tsx', content: generateLoginPage({}), language: 'typescript' });
      files.push({ path: 'src/pages/SignupPage.tsx', content: generateSignupPage({}), language: 'typescript' });
      files.push({ path: 'src/pages/ForgotPasswordPage.tsx', content: generateForgotPasswordPage({}), language: 'typescript' });
      files.push({ path: 'src/pages/ResetPasswordPage.tsx', content: generateResetPasswordPage({}), language: 'typescript' });
      files.push({ path: 'src/pages/VerifyEmailPage.tsx', content: generateVerifyEmailPage({}), language: 'typescript' });
      files.push({ path: 'src/pages/ProfilePage.tsx', content: generateProfilePage({}), language: 'typescript' });
    }

    // Layout components
    files.push(this.generateNavbar(appName, analysis, requiresAuth));
    files.push(this.generateLayout());

    // Generate pages and components based on blueprint - NO FALLBACKS
    if (!this.blueprint?.pages) {
      throw new Error(
        `Blueprint missing or has no pages defined for app type "${analysis.appType}". ` +
        `Cannot generate React app without blueprint pages.`
      );
    }

    // Generate shared components used by blueprint pages
    files.push(...this.generateBlueprintComponents(analysis));

    // Generate pages from blueprint
    files.push(...this.generateBlueprintPages(appName, analysis, requiresAuth));

    return files;
  }

  private generatePackageJson(appName: string): GeneratedFile {
    const slug = this.toSlug(appName);
    const pkg = {
      name: slug,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'npx vite',
        build: 'npx vite build',
        'build:check': 'npx tsc && npx vite build',
        preview: 'npx vite preview',
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^6.22.0',
        '@tanstack/react-query': '^5.17.0',
        clsx: '^2.1.0',
        'tailwind-merge': '^2.2.0',
        'lucide-react': '^0.312.0',
        sonner: '^1.4.0',
      },
      devDependencies: {
        '@types/node': '^20.11.0',
        '@types/react': '^18.3.1',
        '@types/react-dom': '^18.3.1',
        '@vitejs/plugin-react': '^4.2.1',
        autoprefixer: '^10.4.17',
        postcss: '^8.4.35',
        tailwindcss: '^3.4.1',
        typescript: '^5.3.3',
        vite: '^5.1.0',
      },
    };

    return {
      path: 'package.json',
      content: JSON.stringify(pkg, null, 2),
      language: 'json',
    };
  }

  private generateViteConfig(): GeneratedFile {
    return {
      path: 'vite.config.js',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
`,
      language: 'javascript',
    };
  }

  private generateEnvFile(appName: string): GeneratedFile {
    const slug = this.toSlug(appName);
    return {
      path: '.env',
      content: `# API Configuration
VITE_API_URL=http://localhost:4000/api

# App Configuration
VITE_APP_NAME=${slug}
`,
      language: 'env',
    };
  }

  private generateEnvProduction(appName: string): GeneratedFile {
    const slug = this.toSlug(appName);
    // Production API URL will be updated by deployment service
    return {
      path: '.env.production',
      content: `# Production API Configuration
# This will be updated by the deployment service with the correct API URL
VITE_API_URL=https://${slug}-api.fluxez.workers.dev/api

# App Configuration
VITE_APP_NAME=${slug}
`,
      language: 'env',
    };
  }

  private generateTailwindConfig(): GeneratedFile {
    return {
      path: 'tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`,
      language: 'javascript',
    };
  }

  private generatePostcssConfig(): GeneratedFile {
    return {
      path: 'postcss.config.js',
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
      language: 'javascript',
    };
  }

  private generateTsConfig(): GeneratedFile {
    const config = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
        },
        types: ['node'],
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }],
    };

    return {
      path: 'tsconfig.json',
      content: JSON.stringify(config, null, 2),
      language: 'json',
    };
  }

  private generateTsConfigNode(): GeneratedFile {
    const config = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
        strict: true,
      },
      include: ['vite.config.js'],
    };

    return {
      path: 'tsconfig.node.json',
      content: JSON.stringify(config, null, 2),
      language: 'json',
    };
  }

  private generateGitignore(): GeneratedFile {
    return {
      path: '.gitignore',
      content: `# Dependencies
node_modules/

# Build output
dist/

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Vite
.vite/
`,
      language: 'gitignore',
    };
  }

  private generateIndexHtml(appName: string): GeneratedFile {
    return {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      language: 'html',
    };
  }

  /**
   * Generate Cloudflare Pages _headers file to allow iframe embedding
   * This file goes in the public folder and gets copied to dist during build
   */
  private generateCloudflareHeaders(): GeneratedFile {
    return {
      path: 'public/_headers',
      content: `/*
  X-Frame-Options: ALLOWALL
  Content-Security-Policy: frame-ancestors *
  Access-Control-Allow-Origin: *
`,
      language: 'text',
    };
  }

  private generateMainTsx(requiresAuth: boolean): GeneratedFile {
    const authImport = requiresAuth ? `import { AuthProvider } from './contexts/AuthContext';\n` : '';
    const authWrapper = requiresAuth
      ? `      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>`
      : `      <HashRouter>
        <App />
      </HashRouter>`;

    return {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
${authImport}import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
${authWrapper}
    </QueryClientProvider>
  </React.StrictMode>
);
`,
      language: 'typescript',
    };
  }

  private generateAppTsx(analysis: EnhancedAppAnalysis, requiresAuth: boolean): GeneratedFile {
    if (!this.blueprint?.pages) {
      throw new Error('Blueprint pages not defined - cannot generate App.tsx routing');
    }

    // Generate routes from blueprint pages
    const pageImports: string[] = [];
    const routes: string[] = [];

    for (const page of this.blueprint.pages) {
      const pageName = this.getPageComponentName(page.path);
      pageImports.push(`import ${pageName} from './pages/${pageName}';`);

      // Determine if this route needs auth protection
      const needsProtection = requiresAuth && page.requiresAuth;

      // Handle dynamic routes (convert :id to :id for React Router)
      const routePath = page.path;

      if (needsProtection) {
        routes.push(`        <Route path="${routePath}" element={<ProtectedRoute><${pageName} /></ProtectedRoute>} />`);
      } else {
        routes.push(`        <Route path="${routePath}" element={<${pageName} />} />`);
      }
    }

    const authImports = requiresAuth
      ? `import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';`
      : '';

    const authRoutes = requiresAuth
      ? `        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />`
      : '';

    return {
      path: 'src/App.tsx',
      content: `import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
${authImports}
${pageImports.join('\n')}

export default function App() {
  return (
    <Layout>
      <Routes>
${authRoutes}
${routes.join('\n')}
      </Routes>
    </Layout>
  );
}
`,
      language: 'typescript',
    };
  }

  private generateIndexCss(): GeneratedFile {
    return {
      path: 'src/index.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900 antialiased;
}
`,
      language: 'css',
    };
  }

  private generateApiClient(): GeneratedFile {
    return {
      path: 'src/lib/api.ts',
      content: `const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = \`\${API_BASE}\${endpoint}\`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    (headers as Record<string, string>)['Authorization'] = \`Bearer \${token}\`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
`,
      language: 'typescript',
    };
  }

  private generateUtils(): GeneratedFile {
    return {
      path: 'src/lib/utils.ts',
      content: `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
      language: 'typescript',
    };
  }

  private generateTypes(analysis: EnhancedAppAnalysis, schema: DatabaseSchema): GeneratedFile {
    // Reserved fields that are hardcoded in the interface
    const reservedFields = new Set(['id', 'userId', 'createdAt', 'updatedAt', 'deletedAt']);

    const types = analysis.entities
      .map((entity) => {
        // Check if entity has user ownership
        const hasUserOwnership = entity.userOwnership !== false;

        // Filter out reserved fields since they're hardcoded
        const filteredFields = entity.fields.filter((f) => !reservedFields.has(camelCase(f.name)));

        const fields = filteredFields
          .map((f) => `  ${f.name}${f.required ? '' : '?'}: ${this.mapFieldTypeToTs(f.type)};`)
          .join('\n');

        const createFields = filteredFields
          .map((f) => `  ${f.name}${f.required ? '' : '?'}: ${this.mapFieldTypeToTs(f.type)};`)
          .join('\n');

        // Add FK fields for belongsTo relationships (excluding user_id)
        let fkFields = '';
        if (entity.relationships) {
          const belongsToRels = entity.relationships.filter(r => r.type === 'belongsTo');
          if (belongsToRels.length > 0) {
            const fkFieldsList = belongsToRels
              .filter(rel => {
                const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
                return fkColumn !== 'user_id'; // Skip user_id - handled separately
              })
              .map(rel => {
                const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
                const fkField = camelCase(fkColumn);
                return `  ${fkField}?: string;`;
              });
            if (fkFieldsList.length > 0) {
              fkFields = '\n' + fkFieldsList.join('\n');
            }
          }
        }

        // Only include userId field if entity has user ownership
        const userIdField = hasUserOwnership ? '\n  userId: string;' : '';

        return `export interface ${entity.name} {
  id: string;
${fields}${fkFields}${userIdField}
  createdAt: string;
  updatedAt: string;
}

export interface Create${entity.name}Input {
${createFields}
}`;
      })
      .join('\n\n');

    return {
      path: 'src/types/index.ts',
      content: types,
      language: 'typescript',
    };
  }


  private generateNavbar(appName: string, analysis: EnhancedAppAnalysis, requiresAuth: boolean): GeneratedFile {
    if (!this.blueprint?.pages) {
      throw new Error('Blueprint pages not defined - cannot generate Navbar');
    }

    // Get public navigation pages from blueprint (exclude detail pages, admin pages)
    const navPages = this.blueprint.pages.filter(page =>
      !page.path.includes(':') &&        // No dynamic routes
      !page.path.startsWith('/admin') && // No admin pages
      page.path !== '/'                  // Exclude home (shown as logo link)
    );

    const links = navPages
      .map(page => `            <a href="${page.path}" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">${page.name}</a>`)
      .join('\n');

    // Add cart link for ecommerce
    const cartLink = this.blueprint.appType === 'ecommerce'
      ? `            <a href="/cart" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Cart</a>`
      : '';

    const allLinks = [links, cartLink].filter(Boolean).join('\n');

    if (!requiresAuth) {
      return {
        path: 'src/components/Navbar.tsx',
        content: `import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
            ${appName}
          </Link>
          <div className="flex items-center gap-6">
${allLinks}
          </div>
        </div>
      </div>
    </nav>
  );
}
`,
        language: 'typescript',
      };
    }

    return {
      path: 'src/components/Navbar.tsx',
      content: `import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
            ${appName}
          </Link>
          <div className="flex items-center gap-6">
${allLinks}
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
`,
      language: 'typescript',
    };
  }

  private generateLayout(): GeneratedFile {
    return {
      path: 'src/components/Layout.tsx',
      content: `import { ReactNode } from 'react';
import Navbar from './Navbar';
import { Toaster } from 'sonner';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main>
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
`,
      language: 'typescript',
    };
  }

  // ============================================
  // BLUEPRINT-BASED PAGE & COMPONENT GENERATION
  // ============================================

  /**
   * Generate shared components used by blueprint pages
   */
  private generateBlueprintComponents(analysis: EnhancedAppAnalysis): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (!this.blueprint?.pages) {
      throw new Error('Blueprint pages not defined');
    }

    // Collect all unique component types used in pages
    const componentTypes = new Set<string>();
    for (const page of this.blueprint.pages) {
      for (const section of page.sections) {
        componentTypes.add(section.component);
      }
    }

    // Generate each component based on type
    for (const componentType of componentTypes) {
      const file = this.generateComponentByType(componentType, analysis);
      if (file) {
        files.push(file);
      }
    }

    return files;
  }

  /**
   * Generate a component file based on component type
   */
  private generateComponentByType(
    componentType: string,
    analysis: EnhancedAppAnalysis
  ): GeneratedFile | null {
    switch (componentType) {
      case 'hero':
        return {
          path: 'src/components/Hero.tsx',
          content: generateHero({
            title: 'Welcome to Our Store',
            subtitle: 'Discover amazing products at great prices',
            primaryCTA: 'Shop Now',
            primaryCTALink: '/products',
          }),
          language: 'typescript',
        };

      case 'product-grid':
        return {
          path: 'src/components/ProductGrid.tsx',
          content: generateProductGrid({
            entity: 'product',
            showAddToCart: true,
            showRatings: true,
            columns: 4,
          }),
          language: 'typescript',
        };

      case 'blog-list':
      case 'post-list':
        return {
          path: 'src/components/PostList.tsx',
          content: generateBlogList({
            entity: 'post',
            layout: 'grid',
            columns: 3,
          }),
          language: 'typescript',
        };

      case 'data-grid':
        return {
          path: 'src/components/DataGrid.tsx',
          content: generateDataGrid({}),
          language: 'typescript',
        };

      case 'data-table':
        return {
          path: 'src/components/DataTable.tsx',
          content: generateDataTable({ name: 'item', fields: [] } as any),
          language: 'typescript',
        };

      case 'cart':
        return {
          path: 'src/components/Cart.tsx',
          content: generateCart({}),
          language: 'typescript',
        };

      case 'checkout':
        return {
          path: 'src/components/Checkout.tsx',
          content: generateCheckout({}),
          language: 'typescript',
        };

      case 'order-summary':
        return {
          path: 'src/components/OrderSummary.tsx',
          content: generateOrderSummary({}),
          language: 'typescript',
        };

      case 'product-detail':
        return {
          path: 'src/components/ProductDetail.tsx',
          content: generateProductDetail({}),
          language: 'typescript',
        };

      case 'filter-form':
        return {
          path: 'src/components/FilterForm.tsx',
          content: generateFilters({ filters: [] }),
          language: 'typescript',
        };

      case 'comment-section':
        return {
          path: 'src/components/CommentSection.tsx',
          content: generateCommentSection({}),
          language: 'typescript',
        };

      case 'detail-view':
        return {
          path: 'src/components/DetailView.tsx',
          content: generateDetailView({}),
          language: 'typescript',
        };

      case 'data-list':
        return {
          path: 'src/components/DataList.tsx',
          content: generateDataList({}),
          language: 'typescript',
        };

      case 'sidebar':
        return {
          path: 'src/components/Sidebar.tsx',
          content: generateSidebar({ sections: [] }),
          language: 'typescript',
        };

      // ========== DASHBOARD COMPONENTS ==========
      case 'stats-cards':
        return {
          path: 'src/components/StatsCards.tsx',
          content: generateStatsCards({}),
          language: 'typescript',
        };

      case 'activity-feed':
        return {
          path: 'src/components/ActivityFeed.tsx',
          content: generateActivityFeed({}),
          language: 'typescript',
        };

      case 'analytics-charts':
        return {
          path: 'src/components/AnalyticsCharts.tsx',
          content: generateAnalyticsCharts({}),
          language: 'typescript',
        };

      case 'team-list':
        return {
          path: 'src/components/TeamList.tsx',
          content: generateTeamList({}),
          language: 'typescript',
        };

      case 'subscription-card':
        return {
          path: 'src/components/SubscriptionCard.tsx',
          content: generateSubscriptionCard({}),
          language: 'typescript',
        };

      // ========== CRM COMPONENTS ==========
      case 'pipeline-overview':
        return {
          path: 'src/components/PipelineOverview.tsx',
          content: generatePipelineOverview({}),
          language: 'typescript',
        };

      case 'kanban-board':
        return {
          path: 'src/components/KanbanBoard.tsx',
          content: generateKanbanBoard({}),
          language: 'typescript',
        };

      case 'contact-profile':
        return {
          path: 'src/components/ContactProfile.tsx',
          content: generateContactProfile({}),
          language: 'typescript',
        };

      case 'company-profile':
        return {
          path: 'src/components/CompanyProfile.tsx',
          content: generateCompanyProfile({}),
          language: 'typescript',
        };

      case 'task-list':
        return {
          path: 'src/components/TaskList.tsx',
          content: generateTaskList({}),
          language: 'typescript',
        };

      case 'activity-timeline':
      case 'quick-actions':
        return {
          path: 'src/components/ActivityTimeline.tsx',
          content: generateActivityTimeline({}),
          language: 'typescript',
        };

      case 'notes-list':
        return {
          path: 'src/components/NotesList.tsx',
          content: generateNotesList({}),
          language: 'typescript',
        };

      case 'deal-card':
        return {
          path: 'src/components/DealCard.tsx',
          content: generateDealCard({}),
          language: 'typescript',
        };

      // ========== PROJECT MANAGEMENT COMPONENTS ==========
      case 'project-grid':
        return {
          path: 'src/components/ProjectGrid.tsx',
          content: generateProjectGrid({}),
          language: 'typescript',
        };

      case 'project-header':
        return {
          path: 'src/components/ProjectHeader.tsx',
          content: generateProjectHeader({}),
          language: 'typescript',
        };

      case 'milestone-tracker':
        return {
          path: 'src/components/MilestoneTracker.tsx',
          content: generateMilestoneTracker({}),
          language: 'typescript',
        };

      case 'team-members':
        return {
          path: 'src/components/TeamMembers.tsx',
          content: generateTeamMembers({}),
          language: 'typescript',
        };

      // ========== SOCIAL COMPONENTS ==========
      case 'profile-header':
        return {
          path: 'src/components/ProfileHeader.tsx',
          content: generateProfileHeader({}),
          language: 'typescript',
        };

      case 'profile-tabs':
        return {
          path: 'src/components/ProfileTabs.tsx',
          content: generateProfileTabs({}),
          language: 'typescript',
        };

      case 'post-composer':
        return {
          path: 'src/components/PostComposer.tsx',
          content: generatePostComposer({}),
          language: 'typescript',
        };

      case 'post-feed':
        return {
          path: 'src/components/PostFeed.tsx',
          content: generatePostFeed({}),
          language: 'typescript',
        };

      case 'user-grid':
      case 'user-suggestions':
        return {
          path: 'src/components/UserGrid.tsx',
          content: generateUserGrid({}),
          language: 'typescript',
        };

      case 'message-list':
      case 'conversation-list':
        return {
          path: 'src/components/MessageList.tsx',
          content: generateMessageList({}),
          language: 'typescript',
        };

      case 'chat-interface':
      case 'chat-window':
        return {
          path: 'src/components/ChatInterface.tsx',
          content: generateChatInterface({}),
          language: 'typescript',
        };

      case 'notification-list':
        return {
          path: 'src/components/NotificationList.tsx',
          content: generateNotificationList({}),
          language: 'typescript',
        };

      // ========== BOOKING COMPONENTS ==========
      case 'service-grid':
        return {
          path: 'src/components/ServiceGrid.tsx',
          content: generateServiceGrid({}),
          language: 'typescript',
        };

      case 'staff-grid':
        return {
          path: 'src/components/StaffGrid.tsx',
          content: generateStaffGrid({}),
          language: 'typescript',
        };

      case 'booking-wizard':
        return {
          path: 'src/components/BookingWizard.tsx',
          content: generateBookingWizard({}),
          language: 'typescript',
        };

      case 'date-picker':
        return {
          path: 'src/components/DatePicker.tsx',
          content: generateDatePicker({}),
          language: 'typescript',
        };

      case 'time-slots':
        return {
          path: 'src/components/TimeSlots.tsx',
          content: generateTimeSlots({}),
          language: 'typescript',
        };

      case 'appointment-list':
        return {
          path: 'src/components/AppointmentList.tsx',
          content: generateAppointmentList({}),
          language: 'typescript',
        };

      case 'booking-confirmation':
        return {
          path: 'src/components/BookingConfirmation.tsx',
          content: generateBookingConfirmation({}),
          language: 'typescript',
        };

      // ========== LMS COMPONENTS ==========
      case 'course-grid':
        return {
          path: 'src/components/CourseGrid.tsx',
          content: generateCourseGrid({}),
          language: 'typescript',
        };

      case 'course-filters':
        return {
          path: 'src/components/CourseFilters.tsx',
          content: generateCourseFilters({}),
          language: 'typescript',
        };

      case 'course-header':
        return {
          path: 'src/components/CourseHeader.tsx',
          content: generateCourseHeader({}),
          language: 'typescript',
        };

      case 'curriculum-list':
        return {
          path: 'src/components/CurriculumList.tsx',
          content: generateCurriculumList({}),
          language: 'typescript',
        };

      case 'lesson-player':
        return {
          path: 'src/components/LessonPlayer.tsx',
          content: generateLessonPlayer({}),
          language: 'typescript',
        };

      case 'lesson-sidebar':
        return {
          path: 'src/components/LessonSidebar.tsx',
          content: generateLessonSidebar({}),
          language: 'typescript',
        };

      case 'progress-tracker':
        return {
          path: 'src/components/ProgressTracker.tsx',
          content: generateProgressTracker({}),
          language: 'typescript',
        };

      case 'enrolled-courses':
        return {
          path: 'src/components/EnrolledCourses.tsx',
          content: generateEnrolledCourses({}),
          language: 'typescript',
        };

      case 'certificate-grid':
        return {
          path: 'src/components/CertificateGrid.tsx',
          content: generateCertificateGrid({}),
          language: 'typescript',
        };

      case 'quiz-player':
        return {
          path: 'src/components/QuizPlayer.tsx',
          content: generateQuizPlayer({}),
          language: 'typescript',
        };

      // ========== REAL ESTATE COMPONENTS ==========
      case 'property-search':
        return {
          path: 'src/components/PropertySearch.tsx',
          content: generatePropertySearch({}),
          language: 'typescript',
        };

      case 'property-grid':
        return {
          path: 'src/components/PropertyGrid.tsx',
          content: generatePropertyGrid({}),
          language: 'typescript',
        };

      case 'property-filters':
        return {
          path: 'src/components/PropertyFilters.tsx',
          content: generatePropertyFilters({}),
          language: 'typescript',
        };

      case 'property-gallery':
        return {
          path: 'src/components/PropertyGallery.tsx',
          content: generatePropertyGallery({}),
          language: 'typescript',
        };

      case 'property-details':
        return {
          path: 'src/components/PropertyDetails.tsx',
          content: generatePropertyDetails({}),
          language: 'typescript',
        };

      case 'inquiry-form':
        return {
          path: 'src/components/InquiryForm.tsx',
          content: generateInquiryForm({}),
          language: 'typescript',
        };

      case 'agent-grid':
        return {
          path: 'src/components/AgentGrid.tsx',
          content: generateAgentGrid({}),
          language: 'typescript',
        };

      case 'agent-profile':
      case 'agent-card':
        return {
          path: 'src/components/AgentProfile.tsx',
          content: generateAgentProfile({}),
          language: 'typescript',
        };

      // ========== RESTAURANT COMPONENTS ==========
      case 'menu-grid':
        return {
          path: 'src/components/MenuGrid.tsx',
          content: generateMenuGrid({}),
          language: 'typescript',
        };

      case 'menu-categories':
        return {
          path: 'src/components/MenuCategories.tsx',
          content: generateMenuCategories({}),
          language: 'typescript',
        };

      case 'cart-preview':
        return {
          path: 'src/components/CartPreview.tsx',
          content: generateCartPreview({}),
          language: 'typescript',
        };

      case 'checkout-form':
        return {
          path: 'src/components/CheckoutForm.tsx',
          content: generateCheckoutForm({}),
          language: 'typescript',
        };

      case 'order-confirmation':
        return {
          path: 'src/components/OrderConfirmation.tsx',
          content: generateOrderConfirmation({}),
          language: 'typescript',
        };

      case 'order-tracking':
        return {
          path: 'src/components/OrderTracking.tsx',
          content: generateOrderTracking({}),
          language: 'typescript',
        };

      case 'order-list':
        return {
          path: 'src/components/OrderList.tsx',
          content: generateOrderList({}),
          language: 'typescript',
        };

      case 'reservation-form':
        return {
          path: 'src/components/ReservationForm.tsx',
          content: generateReservationForm({}),
          language: 'typescript',
        };

      case 'restaurant-info':
        return {
          path: 'src/components/RestaurantInfo.tsx',
          content: generateRestaurantInfo({}),
          language: 'typescript',
        };

      case 'order-queue':
        return {
          path: 'src/components/OrderQueue.tsx',
          content: generateOrderQueue({}),
          language: 'typescript',
        };

      // ========== JOB BOARD COMPONENTS ==========
      case 'job-search':
        return {
          path: 'src/components/JobSearch.tsx',
          content: generateJobSearch({}),
          language: 'typescript',
        };

      case 'job-list':
        return {
          path: 'src/components/JobList.tsx',
          content: generateJobList({}),
          language: 'typescript',
        };

      case 'job-filters':
        return {
          path: 'src/components/JobFilters.tsx',
          content: generateJobFilters({}),
          language: 'typescript',
        };

      case 'job-detail':
        return {
          path: 'src/components/JobDetail.tsx',
          content: generateJobDetail({}),
          language: 'typescript',
        };

      case 'apply-card':
        return {
          path: 'src/components/ApplyCard.tsx',
          content: generateApplyCard({}),
          language: 'typescript',
        };

      case 'company-card':
        return {
          path: 'src/components/CompanyCard.tsx',
          content: generateCompanyCard({}),
          language: 'typescript',
        };

      case 'company-grid':
        return {
          path: 'src/components/CompanyGrid.tsx',
          content: generateCompanyGrid({}),
          language: 'typescript',
        };

      case 'application-form':
        return {
          path: 'src/components/ApplicationForm.tsx',
          content: generateApplicationForm({}),
          language: 'typescript',
        };

      case 'application-list':
        return {
          path: 'src/components/ApplicationList.tsx',
          content: generateApplicationList({}),
          language: 'typescript',
        };

      case 'candidate-profile':
      case 'candidate-profile-form':
        return {
          path: 'src/components/CandidateProfile.tsx',
          content: generateCandidateProfile({}),
          language: 'typescript',
        };

      // ========== INVENTORY COMPONENTS ==========
      case 'low-stock-alert':
        return {
          path: 'src/components/LowStockAlert.tsx',
          content: generateLowStockAlert({}),
          language: 'typescript',
        };

      case 'stock-by-warehouse':
        return {
          path: 'src/components/StockByWarehouse.tsx',
          content: generateStockByWarehouse({}),
          language: 'typescript',
        };

      case 'stock-adjustment-form':
        return {
          path: 'src/components/StockAdjustmentForm.tsx',
          content: generateStockAdjustmentForm({}),
          language: 'typescript',
        };

      case 'product-detail-card':
        return {
          path: 'src/components/ProductDetailCard.tsx',
          content: generateProductDetailCard({}),
          language: 'typescript',
        };

      case 'purchase-order-detail':
        return {
          path: 'src/components/PurchaseOrderDetail.tsx',
          content: generatePurchaseOrderDetail({}),
          language: 'typescript',
        };

      case 'report-list':
        return {
          path: 'src/components/ReportList.tsx',
          content: generateReportList({}),
          language: 'typescript',
        };

      // ========== ADDITIONAL MISSING COMPONENTS ==========
      case 'appointment-detail':
        return {
          path: 'src/components/AppointmentDetail.tsx',
          content: generateAppointmentDetail({}),
          language: 'typescript',
        };

      case 'blog-detail':
        return {
          path: 'src/components/BlogDetail.tsx',
          content: generateBlogDetail({}),
          language: 'typescript',
        };

      case 'calendar-view':
        return {
          path: 'src/components/CalendarView.tsx',
          content: generateCalendarView({}),
          language: 'typescript',
        };

      case 'contact-form':
        return {
          path: 'src/components/ContactForm.tsx',
          content: generateContactForm({}),
          language: 'typescript',
        };

      case 'create-form':
        return {
          path: 'src/components/CreateForm.tsx',
          content: generateCreateForm({}),
          language: 'typescript',
        };

      case 'create-post':
        return {
          path: 'src/components/CreatePost.tsx',
          content: generateCreatePost({}),
          language: 'typescript',
        };

      case 'edit-form':
        return {
          path: 'src/components/EditForm.tsx',
          content: generateEditForm({}),
          language: 'typescript',
        };

      case 'post-detail':
        return {
          path: 'src/components/PostDetail.tsx',
          content: generatePostDetail({}),
          language: 'typescript',
        };

      case 'profile-view':
        return {
          path: 'src/components/ProfileView.tsx',
          content: generateProfileView({}),
          language: 'typescript',
        };

      case 'search-bar':
        return {
          path: 'src/components/SearchBar.tsx',
          content: generateSearchBar({}),
          language: 'typescript',
        };

      case 'settings-form':
        return {
          path: 'src/components/SettingsForm.tsx',
          content: generateSettingsForm({}),
          language: 'typescript',
        };

      case 'task-detail':
        return {
          path: 'src/components/TaskDetail.tsx',
          content: generateTaskDetail({}),
          language: 'typescript',
        };

      case 'trending-topics':
        return {
          path: 'src/components/TrendingTopics.tsx',
          content: generateTrendingTopics({}),
          language: 'typescript',
        };

      // Healthcare Components
      case 'patient-profile':
        return {
          path: 'src/components/PatientProfile.tsx',
          content: generatePatientProfile({}),
          language: 'typescript',
        };
      case 'medical-history':
        return {
          path: 'src/components/MedicalHistory.tsx',
          content: generateMedicalHistory({}),
          language: 'typescript',
        };
      case 'appointment-calendar':
        return {
          path: 'src/components/AppointmentCalendar.tsx',
          content: generateAppointmentCalendar({}),
          language: 'typescript',
        };
      case 'appointment-form':
        return {
          path: 'src/components/AppointmentForm.tsx',
          content: generateAppointmentForm({}),
          language: 'typescript',
        };
      case 'doctor-grid':
        return {
          path: 'src/components/DoctorGrid.tsx',
          content: generateDoctorGrid({}),
          language: 'typescript',
        };
      case 'doctor-profile':
        return {
          path: 'src/components/DoctorProfile.tsx',
          content: generateDoctorProfile({}),
          language: 'typescript',
        };
      case 'doctor-schedule':
        return {
          path: 'src/components/DoctorSchedule.tsx',
          content: generateDoctorSchedule({}),
          language: 'typescript',
        };

      // Healthcare Specialties
      case 'chiropractor-stats':
        return {
          path: 'src/components/ChiropractorStats.tsx',
          content: generateChiropractorStats({}),
          language: 'typescript',
        };
      case 'spine-assessment':
        return {
          path: 'src/components/SpineAssessment.tsx',
          content: generateSpineAssessment({}),
          language: 'typescript',
        };
      case 'adjustment-history':
        return {
          path: 'src/components/AdjustmentHistory.tsx',
          content: generateAdjustmentHistory({}),
          language: 'typescript',
        };
      case 'dermatology-stats':
        return {
          path: 'src/components/DermatologyStats.tsx',
          content: generateDermatologyStats({}),
          language: 'typescript',
        };
      case 'skin-condition-tracker':
        return {
          path: 'src/components/SkinConditionTracker.tsx',
          content: generateSkinConditionTracker({}),
          language: 'typescript',
        };
      case 'biopsy-tracker':
        return {
          path: 'src/components/BiopsyTracker.tsx',
          content: generateBiopsyTracker({}),
          language: 'typescript',
        };
      case 'pediatrics-stats':
        return {
          path: 'src/components/PediatricsStats.tsx',
          content: generatePediatricsStats({}),
          language: 'typescript',
        };
      case 'growth-chart':
        return {
          path: 'src/components/GrowthChart.tsx',
          content: generateGrowthChart({}),
          language: 'typescript',
        };
      case 'vaccination-schedule':
        return {
          path: 'src/components/VaccinationSchedule.tsx',
          content: generateVaccinationSchedule({}),
          language: 'typescript',
        };
      case 'mental-health-stats':
        return {
          path: 'src/components/MentalHealthStats.tsx',
          content: generateMentalHealthStats({}),
          language: 'typescript',
        };
      case 'therapy-session-notes':
        return {
          path: 'src/components/TherapySessionNotes.tsx',
          content: generateTherapySessionNotes({}),
          language: 'typescript',
        };
      case 'mood-tracker':
        return {
          path: 'src/components/MoodTracker.tsx',
          content: generateMoodTracker({}),
          language: 'typescript',
        };
      case 'radiology-stats':
        return {
          path: 'src/components/RadiologyStats.tsx',
          content: generateRadiologyStats({}),
          language: 'typescript',
        };
      case 'imaging-queue':
        return {
          path: 'src/components/ImagingQueue.tsx',
          content: generateImagingQueue({}),
          language: 'typescript',
        };
      case 'scan-viewer':
        return {
          path: 'src/components/ScanViewer.tsx',
          content: generateScanViewer({}),
          language: 'typescript',
        };
      case 'home-care-stats':
        return {
          path: 'src/components/HomeCareStats.tsx',
          content: generateHomeCareStats({}),
          language: 'typescript',
        };
      case 'visit-schedule-map':
        return {
          path: 'src/components/VisitScheduleMap.tsx',
          content: generateVisitScheduleMap({}),
          language: 'typescript',
        };
      case 'caregiver-assignment':
        return {
          path: 'src/components/CaregiverAssignment.tsx',
          content: generateCaregiverAssignment({}),
          language: 'typescript',
        };
      case 'lab-stats':
        return {
          path: 'src/components/LabStats.tsx',
          content: generateLabStats({}),
          language: 'typescript',
        };
      case 'lab-results':
        return {
          path: 'src/components/LabResults.tsx',
          content: generateLabResults({}),
          language: 'typescript',
        };
      case 'test-order-form':
        return {
          path: 'src/components/TestOrderForm.tsx',
          content: generateTestOrderForm({}),
          language: 'typescript',
        };

      // Fitness Components
      case 'membership-plans':
        return {
          path: 'src/components/MembershipPlans.tsx',
          content: generateMembershipPlans({}),
          language: 'typescript',
        };
      case 'class-grid':
        return {
          path: 'src/components/ClassGrid.tsx',
          content: generateClassGrid({}),
          language: 'typescript',
        };
      case 'class-schedule':
        return {
          path: 'src/components/ClassSchedule.tsx',
          content: generateClassSchedule({}),
          language: 'typescript',
        };
      case 'class-detail':
        return {
          path: 'src/components/ClassDetail.tsx',
          content: generateClassDetail({}),
          language: 'typescript',
        };
      case 'class-filters':
        return {
          path: 'src/components/ClassFilters.tsx',
          content: generateClassFilters({}),
          language: 'typescript',
        };
      case 'trainer-grid':
        return {
          path: 'src/components/TrainerGrid.tsx',
          content: generateTrainerGrid({}),
          language: 'typescript',
        };
      case 'trainer-profile':
        return {
          path: 'src/components/TrainerProfile.tsx',
          content: generateTrainerProfile({}),
          language: 'typescript',
        };
      case 'workout-stats':
        return {
          path: 'src/components/WorkoutStats.tsx',
          content: generateWorkoutStats({}),
          language: 'typescript',
        };
      case 'workout-list':
        return {
          path: 'src/components/WorkoutList.tsx',
          content: generateWorkoutList({}),
          language: 'typescript',
        };
      case 'workout-form':
        return {
          path: 'src/components/WorkoutForm.tsx',
          content: generateWorkoutForm({}),
          language: 'typescript',
        };
      case 'progress-charts':
        return {
          path: 'src/components/ProgressCharts.tsx',
          content: generateProgressCharts({}),
          language: 'typescript',
        };
      // Travel Components
      case 'travel-search':
        return {
          path: 'src/components/TravelSearch.tsx',
          content: generateTravelSearch({}),
          language: 'typescript',
        };
      case 'destination-grid':
        return {
          path: 'src/components/DestinationGrid.tsx',
          content: generateDestinationGrid({}),
          language: 'typescript',
        };
      case 'destination-filters':
        return {
          path: 'src/components/DestinationFilters.tsx',
          content: generateDestinationFilters({}),
          language: 'typescript',
        };
      case 'destination-header':
        return {
          path: 'src/components/DestinationHeader.tsx',
          content: generateDestinationHeader({}),
          language: 'typescript',
        };
      case 'hotel-grid':
        return {
          path: 'src/components/HotelGrid.tsx',
          content: generateHotelGrid({}),
          language: 'typescript',
        };
      case 'hotel-filters':
        return {
          path: 'src/components/HotelFilters.tsx',
          content: generateHotelFilters({}),
          language: 'typescript',
        };
      case 'hotel-detail':
        return {
          path: 'src/components/HotelDetail.tsx',
          content: generateHotelDetail({}),
          language: 'typescript',
        };
      case 'room-selector':
        return {
          path: 'src/components/RoomSelector.tsx',
          content: generateRoomSelector({}),
          language: 'typescript',
        };
      case 'flight-search':
        return {
          path: 'src/components/FlightSearch.tsx',
          content: generateFlightSearch({}),
          language: 'typescript',
        };
      case 'flight-list':
        return {
          path: 'src/components/FlightList.tsx',
          content: this.generateEntityTableComponent('FlightList', 'flight', [
            { key: 'airline', label: 'Airline' },
            { key: 'flight_number', label: 'Flight' },
            { key: 'departure_airport', label: 'From' },
            { key: 'arrival_airport', label: 'To' },
            { key: 'departure_time', label: 'Depart', type: 'time' },
            { key: 'arrival_time', label: 'Arrive', type: 'time' },
            { key: 'duration', label: 'Duration' },
            { key: 'price', label: 'Price', type: 'currency' },
          ], 'flights'),
          language: 'typescript',
        };
      case 'tour-grid':
        return {
          path: 'src/components/TourGrid.tsx',
          content: this.generateEntityGridComponent('TourGrid', 'tour', { title: 'name', subtitle: 'destination', badge: 'duration', image: 'image' }, 'tours'),
          language: 'typescript',
        };
      case 'tour-filters':
        return {
          path: 'src/components/TourFilters.tsx',
          content: generateTourFilters({}),
          language: 'typescript',
        };
      case 'tour-detail':
        return {
          path: 'src/components/TourDetail.tsx',
          content: this.generateEntityDetailComponent('TourDetail', 'tour', [
            { key: 'name', label: 'Tour Name', type: 'text', icon: 'Map' },
            { key: 'destination', label: 'Destination', type: 'text', icon: 'MapPin' },
            { key: 'duration', label: 'Duration', type: 'text', icon: 'Clock' },
            { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
            { key: 'group_size', label: 'Group Size', type: 'text', icon: 'Users' },
            { key: 'difficulty', label: 'Difficulty', type: 'badge', icon: 'Activity' },
            { key: 'highlights', label: 'Highlights', type: 'list', icon: 'Star' },
            { key: 'description', label: 'Description', type: 'text', icon: 'FileText' },
          ], 'tours'),
          language: 'typescript',
        };
      case 'tour-itinerary':
        return {
          path: 'src/components/TourItinerary.tsx',
          content: generateTourItinerary({}),
          language: 'typescript',
        };
      case 'tour-booking-form':
        return {
          path: 'src/components/TourBookingForm.tsx',
          content: this.generatePublicFormComponent('TourBookingForm', 'booking', [
            { key: 'tour_date', label: 'Tour Date', type: 'date', required: true },
            { key: 'num_adults', label: 'Number of Adults', type: 'number', required: true },
            { key: 'num_children', label: 'Number of Children', type: 'number', required: false },
            { key: 'contact_name', label: 'Full Name', type: 'text', required: true },
            { key: 'contact_email', label: 'Email', type: 'email', required: true },
            { key: 'contact_phone', label: 'Phone', type: 'tel', required: true },
            { key: 'special_requests', label: 'Special Requests', type: 'textarea', required: false },
          ], 'bookings'),
          language: 'typescript',
        };
      case 'booking-list':
        return {
          path: 'src/components/BookingList.tsx',
          content: this.generateEntityTableComponent('BookingList', 'booking', [
            { key: 'booking_number', label: 'Booking #' },
            { key: 'type', label: 'Type' },
            { key: 'destination', label: 'Destination' },
            { key: 'check_in', label: 'Check In', type: 'date' },
            { key: 'check_out', label: 'Check Out', type: 'date' },
            { key: 'total', label: 'Total', type: 'currency' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'bookings'),
          language: 'typescript',
        };
      case 'booking-detail':
        return {
          path: 'src/components/BookingDetail.tsx',
          content: this.generateEntityDetailComponent('BookingDetail', 'booking', [
            { key: 'booking_number', label: 'Booking Number', type: 'text', icon: 'Hash' },
            { key: 'type', label: 'Booking Type', type: 'badge', icon: 'Tag' },
            { key: 'destination', label: 'Destination', type: 'text', icon: 'MapPin' },
            { key: 'check_in', label: 'Check In', type: 'date', icon: 'Calendar' },
            { key: 'check_out', label: 'Check Out', type: 'date', icon: 'Calendar' },
            { key: 'guests', label: 'Guests', type: 'number', icon: 'Users' },
            { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
            { key: 'status', label: 'Status', type: 'status', icon: 'CheckCircle' },
          ], 'bookings'),
          language: 'typescript',
        };

      // Event Components
      case 'event-grid':
        return {
          path: 'src/components/EventGrid.tsx',
          content: generateEventGrid({}),
          language: 'typescript',
        };
      case 'event-filters':
        return {
          path: 'src/components/EventFilters.tsx',
          content: generateEventFilters({}),
          language: 'typescript',
        };
      case 'event-header':
        return {
          path: 'src/components/EventHeader.tsx',
          content: generateEventHeader({}),
          language: 'typescript',
        };
      case 'event-schedule':
        return {
          path: 'src/components/EventSchedule.tsx',
          content: generateEventSchedule({}),
          language: 'typescript',
        };
      case 'speaker-grid':
        return {
          path: 'src/components/SpeakerGrid.tsx',
          content: generateSpeakerGrid({}),
          language: 'typescript',
        };
      case 'ticket-selector':
        return {
          path: 'src/components/TicketSelector.tsx',
          content: generateTicketSelector({}),
          language: 'typescript',
        };
      case 'venue-info':
        return {
          path: 'src/components/VenueInfo.tsx',
          content: generateVenueInfo({}),
          language: 'typescript',
        };
      case 'sponsor-grid':
        return {
          path: 'src/components/SponsorGrid.tsx',
          content: generateSponsorGrid({}),
          language: 'typescript',
        };
      case 'ticket-list':
        return {
          path: 'src/components/TicketList.tsx',
          content: generateTicketList({}),
          language: 'typescript',
        };
      case 'ticket-detail':
        return {
          path: 'src/components/TicketDetail.tsx',
          content: generateTicketDetail({}),
          language: 'typescript',
        };
      // Helpdesk Components
      case 'kb-search':
        return {
          path: 'src/components/KBSearch.tsx',
          content: generateKBSearch({}),
          language: 'typescript',
        };
      case 'article-grid':
        return {
          path: 'src/components/ArticleGrid.tsx',
          content: this.generateEntityGridComponent('ArticleGrid', 'article', { title: 'title', subtitle: 'category', badge: 'type', image: 'thumbnail' }, 'articles'),
          language: 'typescript',
        };
      case 'kb-categories':
        return {
          path: 'src/components/KBCategories.tsx',
          content: generateKBCategories({}),
          language: 'typescript',
        };
      case 'kb-sidebar':
        return {
          path: 'src/components/KBSidebar.tsx',
          content: generateKBSidebar({}),
          language: 'typescript',
        };
      case 'article-list':
        return {
          path: 'src/components/ArticleList.tsx',
          content: generateArticleList({}),
          language: 'typescript',
        };
      case 'article-detail':
        return {
          path: 'src/components/ArticleDetail.tsx',
          content: generateArticleDetail({}),
          language: 'typescript',
        };
      case 'article-feedback':
        return {
          path: 'src/components/ArticleFeedback.tsx',
          content: generateArticleFeedback({}),
          language: 'typescript',
        };
      case 'related-articles':
        return {
          path: 'src/components/RelatedArticles.tsx',
          content: generateRelatedArticles({}),
          language: 'typescript',
        };
      case 'article-sidebar':
        return {
          path: 'src/components/ArticleSidebar.tsx',
          content: generateArticleSidebar({}),
          language: 'typescript',
        };
      case 'ticket-form':
        return {
          path: 'src/components/TicketForm.tsx',
          content: this.generatePublicFormComponent('TicketForm', 'ticket', [
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true },
      { key: 'priority', label: 'Priority', type: 'select', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'email', label: 'Your Email', type: 'email', required: true },
    ], 'tickets'),
          language: 'typescript',
        };
      case 'customer-tickets':
        return {
          path: 'src/components/CustomerTickets.tsx',
          content: this.generateEntityTableComponent('CustomerTickets', 'ticket', [
      { key: 'ticket_number', label: 'Ticket #' },
      { key: 'subject', label: 'Subject' },
      { key: 'category', label: 'Category' },
      { key: 'priority', label: 'Priority', type: 'status' },
      { key: 'created_at', label: 'Created', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'tickets/my'),
          language: 'typescript',
        };
      case 'ticket-replies':
        return {
          path: 'src/components/TicketReplies.tsx',
          content: generateTicketReplies({}),
          language: 'typescript',
        };
      case 'reply-form':
        return {
          path: 'src/components/ReplyForm.tsx',
          content: generateReplyForm({}),
          language: 'typescript',
        };
      case 'ticket-queue':
        return {
          path: 'src/components/TicketQueue.tsx',
          content: this.generateEntityTableComponent('TicketQueue', 'ticket', [
      { key: 'ticket_number', label: 'Ticket #' },
      { key: 'subject', label: 'Subject' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'priority', label: 'Priority', type: 'status' },
      { key: 'created_at', label: 'Created', type: 'date' },
      { key: 'last_reply', label: 'Last Reply', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'tickets/queue'),
          language: 'typescript',
        };
      case 'ticket-filters':
        return {
          path: 'src/components/TicketFilters.tsx',
          content: generateTicketFilters({}),
          language: 'typescript',
        };
      case 'ticket-header':
        return {
          path: 'src/components/TicketHeader.tsx',
          content: this.generateEntityDetailComponent('TicketHeader', 'ticket', [
      { key: 'ticket_number', label: 'Ticket Number', type: 'text', icon: 'Hash' },
      { key: 'subject', label: 'Subject', type: 'text', icon: 'FileText' },
      { key: 'status', label: 'Status', type: 'status', icon: 'CheckCircle' },
      { key: 'priority', label: 'Priority', type: 'status', icon: 'AlertTriangle' },
      { key: 'category', label: 'Category', type: 'badge', icon: 'Tag' },
      { key: 'created_at', label: 'Created', type: 'date', icon: 'Calendar' },
    ], 'tickets'),
          language: 'typescript',
        };
      case 'ticket-info':
        return {
          path: 'src/components/TicketInfo.tsx',
          content: generateTicketInfo({}),
          language: 'typescript',
        };
      case 'ticket-conversation':
        return {
          path: 'src/components/TicketConversation.tsx',
          content: generateTicketConversation({}),
          language: 'typescript',
        };
      case 'agent-reply-form':
        return {
          path: 'src/components/AgentReplyForm.tsx',
          content: generateAgentReplyForm({}),
          language: 'typescript',
        };
      case 'article-form':
        return {
          path: 'src/components/ArticleForm.tsx',
          content: this.generatePublicFormComponent('ArticleForm', 'article', [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category_id', label: 'Category', type: 'select', required: true },
      { key: 'content', label: 'Content', type: 'richtext', required: true },
      { key: 'tags', label: 'Tags', type: 'text', required: false },
      { key: 'status', label: 'Status', type: 'select', required: true },
    ], 'articles'),
          language: 'typescript',
        };

      // Marketplace Components
      case 'vendor-grid':
        return {
          path: 'src/components/VendorGrid.tsx',
          content: this.generateEntityGridComponent('VendorGrid', 'vendor', { title: 'store_name', subtitle: 'category', badge: 'rating', image: 'logo' }, 'vendors'),
          language: 'typescript',
        };
      case 'product-filters':
        return {
          path: 'src/components/ProductFilters.tsx',
          content: generateProductFilters({}),
          language: 'typescript',
        };
      case 'category-header':
        return {
          path: 'src/components/CategoryHeader.tsx',
          content: generateCategoryHeader({}),
          language: 'typescript',
        };
      case 'vendor-card':
        return {
          path: 'src/components/VendorCard.tsx',
          content: generateVendorCard({}),
          language: 'typescript',
        };
      case 'vendor-header':
        return {
          path: 'src/components/VendorHeader.tsx',
          content: generateVendorHeader({}),
          language: 'typescript',
        };
      case 'vendor-signup':
        return {
          path: 'src/components/VendorSignup.tsx',
          content: this.generatePublicFormComponent('VendorSignup', 'vendor', [
      { key: 'store_name', label: 'Store Name', type: 'text', required: true },
      { key: 'email', label: 'Email Address', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
      { key: 'category', label: 'Business Category', type: 'select', required: true },
      { key: 'description', label: 'Store Description', type: 'textarea', required: true },
      { key: 'address', label: 'Business Address', type: 'text', required: true },
    ], 'vendors'),
          language: 'typescript',
        };
      case 'seller-orders':
        return {
          path: 'src/components/SellerOrders.tsx',
          content: this.generateEntityTableComponent('SellerOrders', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'items_count', label: 'Items' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'created_at', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'seller/orders'),
          language: 'typescript',
        };
      case 'sales-chart':
        return {
          path: 'src/components/SalesChart.tsx',
          content: generateSalesChart({}),
          language: 'typescript',
        };
      case 'product-form':
        return {
          path: 'src/components/ProductForm.tsx',
          content: this.generatePublicFormComponent('ProductForm', 'product', [
      { key: 'name', label: 'Product Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true },
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'sku', label: 'SKU', type: 'text', required: false },
      { key: 'stock', label: 'Stock Quantity', type: 'number', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'images', label: 'Product Images', type: 'file', required: false },
    ], 'products'),
          language: 'typescript',
        };
      case 'earnings-summary':
        return {
          path: 'src/components/EarningsSummary.tsx',
          content: generateEarningsSummary({}),
          language: 'typescript',
        };
      case 'marketplace-transaction-list':
        return {
          path: 'src/components/TransactionList.tsx',
          content: generateTransactionList({}),
          language: 'typescript',
        };
      case 'order-detail':
        return {
          path: 'src/components/OrderDetail.tsx',
          content: this.generateEntityDetailComponent('OrderDetail', 'order', [
      { key: 'order_number', label: 'Order Number', type: 'text', icon: 'Hash' },
      { key: 'customer_name', label: 'Customer', type: 'text', icon: 'User' },
      { key: 'customer_email', label: 'Email', type: 'email', icon: 'Mail' },
      { key: 'shipping_address', label: 'Shipping Address', type: 'text', icon: 'MapPin' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency', icon: 'DollarSign' },
      { key: 'shipping', label: 'Shipping', type: 'currency', icon: 'Truck' },
      { key: 'tax', label: 'Tax', type: 'currency', icon: 'Percent' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', type: 'status', icon: 'CheckCircle' },
    ], 'orders'),
          language: 'typescript',
        };

      // Portfolio Components
      case 'cta-section':
        return {
          path: 'src/components/CTASection.tsx',
          content: generateCTASection({}),
          language: 'typescript',
        };
      case 'client-logos':
        return {
          path: 'src/components/ClientLogos.tsx',
          content: generateClientLogos({}),
          language: 'typescript',
        };
      case 'testimonial-slider':
        return {
          path: 'src/components/TestimonialSlider.tsx',
          content: generateTestimonialSlider({}),
          language: 'typescript',
        };
      case 'page-header':
        return {
          path: 'src/components/PageHeader.tsx',
          content: generatePageHeader({}),
          language: 'typescript',
        };
      case 'work-filters':
        return {
          path: 'src/components/WorkFilters.tsx',
          content: generateWorkFilters({}),
          language: 'typescript',
        };
      case 'project-hero':
        return {
          path: 'src/components/ProjectHero.tsx',
          content: generateProjectHero({}),
          language: 'typescript',
        };
      case 'project-content':
        return {
          path: 'src/components/ProjectContent.tsx',
          content: generateProjectContent({}),
          language: 'typescript',
        };
      case 'project-gallery':
        return {
          path: 'src/components/ProjectGallery.tsx',
          content: generateProjectGallery({}),
          language: 'typescript',
        };
      case 'project-testimonial':
        return {
          path: 'src/components/ProjectTestimonial.tsx',
          content: generateProjectTestimonial({}),
          language: 'typescript',
        };
      case 'service-list':
        return {
          path: 'src/components/ServiceList.tsx',
          content: this.generateEntityGridComponent('ServiceList', 'service', { title: 'name', subtitle: 'description', badge: 'category', image: 'icon' }, 'services'),
          language: 'typescript',
        };
      case 'process-section':
        return {
          path: 'src/components/ProcessSection.tsx',
          content: generateProcessSection({}),
          language: 'typescript',
        };
      case 'service-header':
        return {
          path: 'src/components/ServiceHeader.tsx',
          content: this.generateEntityDetailComponent('ServiceHeader', 'service', [
      { key: 'name', label: 'Service Name', type: 'text', icon: 'Briefcase' },
      { key: 'category', label: 'Category', type: 'badge', icon: 'Tag' },
      { key: 'price_from', label: 'Starting From', type: 'currency', icon: 'DollarSign' },
      { key: 'duration', label: 'Duration', type: 'text', icon: 'Clock' },
    ], 'services'),
          language: 'typescript',
        };
      case 'service-content':
        return {
          path: 'src/components/ServiceContent.tsx',
          content: generateServiceContent({}),
          language: 'typescript',
        };
      case 'service-features':
        return {
          path: 'src/components/ServiceFeatures.tsx',
          content: generateServiceFeatures({}),
          language: 'typescript',
        };
      case 'service-cta':
        return {
          path: 'src/components/ServiceCTA.tsx',
          content: generateServiceCTA({}),
          language: 'typescript',
        };
      case 'about-story':
        return {
          path: 'src/components/AboutStory.tsx',
          content: generateAboutStory({}),
          language: 'typescript',
        };
      case 'stats-section':
        return {
          path: 'src/components/StatsSection.tsx',
          content: generateStatsSection({}),
          language: 'typescript',
        };
      case 'team-grid':
        return {
          path: 'src/components/TeamGrid.tsx',
          content: this.generateEntityGridComponent('TeamGrid', 'team_member', { title: 'name', subtitle: 'title', badge: 'department', image: 'photo' }, 'team'),
          language: 'typescript',
        };
      case 'team-member-profile':
        return {
          path: 'src/components/TeamMemberProfile.tsx',
          content: generateTeamMemberProfile({}),
          language: 'typescript',
        };
      case 'values-section':
        return {
          path: 'src/components/ValuesSection.tsx',
          content: generateValuesSection({}),
          language: 'typescript',
        };
      case 'contact-info':
        return {
          path: 'src/components/ContactInfo.tsx',
          content: generateContactInfo({}),
          language: 'typescript',
        };
      case 'map-section':
        return {
          path: 'src/components/MapSection.tsx',
          content: generateMapSection({}),
          language: 'typescript',
        };
      case 'inquiry-list':
        return {
          path: 'src/components/InquiryList.tsx',
          content: this.generateEntityTableComponent('InquiryList', 'inquiry', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'subject', label: 'Subject' },
      { key: 'created_at', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'inquiries'),
          language: 'typescript',
        };
      case 'blog-sidebar':
        return {
          path: 'src/components/BlogSidebar.tsx',
          content: generateBlogSidebar({}),
          language: 'typescript',
        };
      case 'blog-author':
        return {
          path: 'src/components/BlogAuthor.tsx',
          content: generateBlogAuthor({}),
          language: 'typescript',
        };

      // ========== FINANCE COMPONENTS (Modularized) ==========
      case 'account-overview':
        return {
          path: 'src/components/AccountOverview.tsx',
          content: generateAccountOverview({}),
          language: 'typescript',
        };
      case 'account-cards':
        return {
          path: 'src/components/AccountCards.tsx',
          content: generateAccountCards({}),
          language: 'typescript',
        };
      case 'budget-tracker':
        return {
          path: 'src/components/BudgetTracker.tsx',
          content: generateBudgetTracker({}),
          language: 'typescript',
        };
      case 'spending-chart':
        return {
          path: 'src/components/SpendingChart.tsx',
          content: generateSpendingChart({}),
          language: 'typescript',
        };
      case 'invoice-list':
        return {
          path: 'src/components/InvoiceList.tsx',
          content: generateInvoiceList({}),
          language: 'typescript',
        };
      case 'invoice-detail':
        return {
          path: 'src/components/InvoiceDetail.tsx',
          content: generateInvoiceDetail({}),
          language: 'typescript',
        };
      case 'invoice-form':
        return {
          path: 'src/components/InvoiceForm.tsx',
          content: generateInvoiceForm({}),
          language: 'typescript',
        };
      case 'payment-form':
        return {
          path: 'src/components/PaymentForm.tsx',
          content: generatePaymentForm({}),
          language: 'typescript',
        };
      case 'payment-methods':
        return {
          path: 'src/components/PaymentMethods.tsx',
          content: generatePaymentMethods({}),
          language: 'typescript',
        };
      case 'payment-history':
        return {
          path: 'src/components/PaymentHistory.tsx',
          content: generatePaymentHistory({}),
          language: 'typescript',
        };

      // ========== SUPPORT COMPONENTS (Modularized) ==========
      case 'knowledge-base':
        return {
          path: 'src/components/KnowledgeBase.tsx',
          content: generateKnowledgeBase({}),
          language: 'typescript',
        };
      case 'support-article-list':
        return {
          path: 'src/components/SupportArticleList.tsx',
          content: generateArticleList({}),
          language: 'typescript',
        };
      case 'support-article-detail':
        return {
          path: 'src/components/SupportArticleDetail.tsx',
          content: generateArticleDetail({}),
          language: 'typescript',
        };
      case 'support-ticket-list':
        return {
          path: 'src/components/SupportTicketList.tsx',
          content: generateSupportTicketList({}),
          language: 'typescript',
        };
      case 'support-ticket-detail':
        return {
          path: 'src/components/SupportTicketDetail.tsx',
          content: generateSupportTicketDetail({}),
          language: 'typescript',
        };
      case 'support-ticket-form':
        return {
          path: 'src/components/SupportTicketForm.tsx',
          content: generateSupportTicketForm({}),
          language: 'typescript',
        };
      case 'faq-section':
        return {
          path: 'src/components/FaqSection.tsx',
          content: generateFaqSection({}),
          language: 'typescript',
        };
      case 'faq-categories':
        return {
          path: 'src/components/FaqCategories.tsx',
          content: generateFaqCategories({}),
          language: 'typescript',
        };
      case 'live-chat':
        return {
          path: 'src/components/LiveChat.tsx',
          content: generateLiveChat({}),
          language: 'typescript',
        };
      case 'chat-widget':
        return {
          path: 'src/components/ChatWidget.tsx',
          content: generateChatWidget({}),
          language: 'typescript',
        };

      // ========== MEDIA COMPONENTS (Modularized) ==========
      case 'video-player':
        return {
          path: 'src/components/VideoPlayer.tsx',
          content: generateVideoPlayer({}),
          language: 'typescript',
        };
      case 'playlist':
        return {
          path: 'src/components/Playlist.tsx',
          content: generatePlaylist({}),
          language: 'typescript',
        };
      case 'video-grid':
        return {
          path: 'src/components/VideoGrid.tsx',
          content: generateVideoGrid({}),
          language: 'typescript',
        };
      case 'audio-player':
        return {
          path: 'src/components/AudioPlayer.tsx',
          content: generateAudioPlayer({}),
          language: 'typescript',
        };
      case 'track-list':
        return {
          path: 'src/components/TrackList.tsx',
          content: generateTrackList({}),
          language: 'typescript',
        };
      case 'album-grid':
        return {
          path: 'src/components/AlbumGrid.tsx',
          content: generateAlbumGrid({}),
          language: 'typescript',
        };
      case 'gallery':
        return {
          path: 'src/components/Gallery.tsx',
          content: generateGallery({}),
          language: 'typescript',
        };
      case 'lightbox':
        return {
          path: 'src/components/Lightbox.tsx',
          content: generateLightbox({}),
          language: 'typescript',
        };
      case 'image-upload':
        return {
          path: 'src/components/ImageUpload.tsx',
          content: generateImageUpload({}),
          language: 'typescript',
        };
      case 'podcast-player':
        return {
          path: 'src/components/PodcastPlayer.tsx',
          content: generatePodcastPlayer({}),
          language: 'typescript',
        };
      case 'episode-list':
        return {
          path: 'src/components/EpisodeList.tsx',
          content: generateEpisodeList({}),
          language: 'typescript',
        };
      case 'podcast-grid':
        return {
          path: 'src/components/PodcastGrid.tsx',
          content: generatePodcastGrid({}),
          language: 'typescript',
        };

      // ========== FORUM COMPONENTS (Modularized) ==========
      case 'forum-categories':
        return {
          path: 'src/components/ForumCategories.tsx',
          content: generateForumCategories({}),
          language: 'typescript',
        };
      case 'forum-category-card':
        return {
          path: 'src/components/ForumCategoryCard.tsx',
          content: generateCategoryCard({}),
          language: 'typescript',
        };
      case 'thread-list':
        return {
          path: 'src/components/ThreadList.tsx',
          content: generateThreadList({}),
          language: 'typescript',
        };
      case 'thread-detail':
        return {
          path: 'src/components/ThreadDetail.tsx',
          content: generateThreadDetail({}),
          language: 'typescript',
        };
      case 'create-thread':
        return {
          path: 'src/components/CreateThread.tsx',
          content: generateCreateThread({}),
          language: 'typescript',
        };
      case 'forum-post-list':
        return {
          path: 'src/components/ForumPostList.tsx',
          content: generatePostList({}),
          language: 'typescript',
        };
      case 'post-editor':
        return {
          path: 'src/components/PostEditor.tsx',
          content: generatePostEditor({}),
          language: 'typescript',
        };
      case 'post-reply':
        return {
          path: 'src/components/PostReply.tsx',
          content: generatePostReply({}),
          language: 'typescript',
        };
      case 'member-list':
        return {
          path: 'src/components/MemberList.tsx',
          content: generateMemberList({}),
          language: 'typescript',
        };
      case 'member-profile':
        return {
          path: 'src/components/MemberProfile.tsx',
          content: generateMemberProfile({}),
          language: 'typescript',
        };
      case 'leaderboard':
        return {
          path: 'src/components/Leaderboard.tsx',
          content: generateLeaderboard({}),
          language: 'typescript',
        };

      // Forum Components (Legacy)
      case 'forum-sidebar':
        return {
          path: 'src/components/ForumSidebar.tsx',
          content: generateForumSidebar({}),
          language: 'typescript',
        };
      case 'announcement-list':
        return {
          path: 'src/components/AnnouncementList.tsx',
          content: generateAnnouncementList({}),
          language: 'typescript',
        };
      case 'category-list':
        return {
          path: 'src/components/CategoryList.tsx',
          content: this.generateEntityGridComponent('CategoryList', 'category', { title: 'name', subtitle: 'description', badge: 'topic_count', image: 'icon' }, 'forum/categories'),
          language: 'typescript',
        };
      case 'topic-list':
        return {
          path: 'src/components/TopicList.tsx',
          content: this.generateEntityTableComponent('TopicList', 'topic', [
      { key: 'title', label: 'Topic' },
      { key: 'author_name', label: 'Author' },
      { key: 'replies_count', label: 'Replies' },
      { key: 'views', label: 'Views' },
      { key: 'last_reply_at', label: 'Last Activity', type: 'date' },
    ], 'forum/topics'),
          language: 'typescript',
        };
      case 'forum-header':
        return {
          path: 'src/components/ForumHeader.tsx',
          content: generateForumHeader({}),
          language: 'typescript',
        };
      case 'subforum-list':
        return {
          path: 'src/components/SubforumList.tsx',
          content: generateSubforumList({}),
          language: 'typescript',
        };
      case 'topic-header':
        return {
          path: 'src/components/TopicHeader.tsx',
          content: this.generateEntityDetailComponent('TopicHeader', 'topic', [
      { key: 'title', label: 'Title', type: 'text', icon: 'MessageSquare' },
      { key: 'author_name', label: 'Author', type: 'text', icon: 'User' },
      { key: 'created_at', label: 'Created', type: 'date', icon: 'Calendar' },
      { key: 'replies_count', label: 'Replies', type: 'number', icon: 'MessageCircle' },
      { key: 'views', label: 'Views', type: 'number', icon: 'Eye' },
    ], 'forum/topics'),
          language: 'typescript',
        };
      case 'topic-form':
        return {
          path: 'src/components/TopicForm.tsx',
          content: this.generatePublicFormComponent('TopicForm', 'topic', [
      { key: 'title', label: 'Topic Title', type: 'text', required: true },
      { key: 'category_id', label: 'Category', type: 'select', required: true },
      { key: 'content', label: 'Content', type: 'richtext', required: true },
      { key: 'tags', label: 'Tags', type: 'text', required: false },
    ], 'forum/topics'),
          language: 'typescript',
        };
      case 'search-filters':
        return {
          path: 'src/components/SearchFilters.tsx',
          content: generateSearchFilters({}),
          language: 'typescript',
        };
      case 'search-results':
        return {
          path: 'src/components/SearchResults.tsx',
          content: generateSearchResults({}),
          language: 'typescript',
        };
      case 'member-search':
        return {
          path: 'src/components/MemberSearch.tsx',
          content: generateMemberSearch({}),
          language: 'typescript',
        };
      case 'member-grid':
        return {
          path: 'src/components/MemberGrid.tsx',
          content: this.generateEntityGridComponent('MemberGrid', 'member', { title: 'username', subtitle: 'role', badge: 'post_count', image: 'avatar' }, 'forum/members'),
          language: 'typescript',
        };
      case 'profile-stats':
        return {
          path: 'src/components/ProfileStats.tsx',
          content: generateProfileStats({}),
          language: 'typescript',
        };
      case 'badge-list':
        return {
          path: 'src/components/BadgeList.tsx',
          content: generateBadgeList({}),
          language: 'typescript',
        };

      // Banking/Finance Components
      case 'account-balance-cards':
        return {
          path: 'src/components/AccountBalanceCards.tsx',
          content: generateAccountBalanceCards({}),
          language: 'typescript',
        };
      case 'account-list':
        return {
          path: 'src/components/AccountList.tsx',
          content: generateAccountList({}),
          language: 'typescript',
        };
      case 'account-detail':
        return {
          path: 'src/components/AccountDetail.tsx',
          content: generateAccountDetail({}),
          language: 'typescript',
        };
      case 'transaction-list':
        return {
          path: 'src/components/TransactionList.tsx',
          content: generateTransactionList({}),
          language: 'typescript',
        };
      case 'transaction-table':
        return {
          path: 'src/components/TransactionTable.tsx',
          content: generateTransactionTable({}),
          language: 'typescript',
        };
      case 'transaction-filters':
        return {
          path: 'src/components/TransactionFilters.tsx',
          content: generateTransactionFilters({}),
          language: 'typescript',
        };
      case 'transfer-form':
        return {
          path: 'src/components/TransferForm.tsx',
          content: generateTransferForm({}),
          language: 'typescript',
        };
      case 'transfer-history':
        return {
          path: 'src/components/TransferHistory.tsx',
          content: generateTransferHistory({}),
          language: 'typescript',
        };
      case 'beneficiary-list':
        return {
          path: 'src/components/BeneficiaryList.tsx',
          content: generateBeneficiaryList({}),
          language: 'typescript',
        };
      case 'card-list':
        return {
          path: 'src/components/CardList.tsx',
          content: generateCardList({}),
          language: 'typescript',
        };
      case 'card-detail':
        return {
          path: 'src/components/CardDetail.tsx',
          content: generateCardDetail({}),
          language: 'typescript',
        };
      case 'bill-list':
        return {
          path: 'src/components/BillList.tsx',
          content: generateBillList({}),
          language: 'typescript',
        };
      case 'bill-payment-form':
        return {
          path: 'src/components/BillPaymentForm.tsx',
          content: generateBillPaymentForm({}),
          language: 'typescript',
        };
      case 'budget-overview':
        return {
          path: 'src/components/BudgetOverview.tsx',
          content: generateBudgetOverview({}),
          language: 'typescript',
        };
      case 'budget-categories':
        return {
          path: 'src/components/BudgetCategories.tsx',
          content: generateBudgetCategories({}),
          language: 'typescript',
        };
      case 'budget-form':
        return {
          path: 'src/components/BudgetForm.tsx',
          content: generateBudgetForm({}),
          language: 'typescript',
        };
      // Insurance Components
      case 'insurance-stats':
        return {
          path: 'src/components/InsuranceStats.tsx',
          content: generateInsuranceStats({}),
          language: 'typescript',
        };
      case 'policy-list':
        return {
          path: 'src/components/PolicyList.tsx',
          content: generatePolicyList({}),
          language: 'typescript',
        };
      case 'policy-table':
        return {
          path: 'src/components/PolicyTable.tsx',
          content: this.generateEntityTableComponent('PolicyTable', 'policy', [
      { key: 'policy_number', label: 'Policy #' },
      { key: 'type', label: 'Type' },
      { key: 'holder_name', label: 'Holder' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'premium', label: 'Premium', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'policy-detail':
        return {
          path: 'src/components/PolicyDetail.tsx',
          content: generatePolicyDetail({}),
          language: 'typescript',
        };
      case 'policy-filters':
        return {
          path: 'src/components/PolicyFilters.tsx',
          content: generatePolicyFilters({}),
          language: 'typescript',
        };
      case 'policy-form':
        return {
          path: 'src/components/PolicyForm.tsx',
          content: generatePolicyForm({}),
          language: 'typescript',
        };
      case 'claims-list':
        return {
          path: 'src/components/ClaimsList.tsx',
          content: generateClaimsList({}),
          language: 'typescript',
        };
      case 'claims-table':
        return {
          path: 'src/components/ClaimsTable.tsx',
          content: this.generateEntityTableComponent('ClaimsTable', 'claim', [
      { key: 'claim_number', label: 'Claim #' },
      { key: 'policy_number', label: 'Policy #' },
      { key: 'type', label: 'Type' },
      { key: 'filed_date', label: 'Filed', type: 'date' },
      { key: 'amount_claimed', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'claims-stats':
        return {
          path: 'src/components/ClaimsStats.tsx',
          content: generateClaimsStats({}),
          language: 'typescript',
        };
      case 'claim-detail':
        return {
          path: 'src/components/ClaimDetail.tsx',
          content: this.generateEntityDetailComponent('ClaimDetail', 'claim', [
      { key: 'claim_number', label: 'Claim Number' },
      { key: 'policy_number', label: 'Policy Number' },
      { key: 'type', label: 'Claim Type' },
      { key: 'filed_date', label: 'Filed Date', type: 'date' },
      { key: 'incident_date', label: 'Incident Date', type: 'date' },
      { key: 'amount_claimed', label: 'Amount Claimed', type: 'currency' },
      { key: 'amount_approved', label: 'Amount Approved', type: 'currency' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'claim-timeline':
        return {
          path: 'src/components/ClaimTimeline.tsx',
          content: generateClaimTimeline({}),
          language: 'typescript',
        };
      case 'claim-form':
        return {
          path: 'src/components/ClaimForm.tsx',
          content: generateClaimForm({}),
          language: 'typescript',
        };
      case 'quote-list':
        return {
          path: 'src/components/QuoteList.tsx',
          content: generateQuoteList({}),
          language: 'typescript',
        };
      case 'quote-wizard':
        return {
          path: 'src/components/QuoteWizard.tsx',
          content: generateQuoteWizard({}),
          language: 'typescript',
        };
      case 'customer-profile':
        return {
          path: 'src/components/CustomerProfile.tsx',
          content: generateInsuranceCustomerProfile({}),
          language: 'typescript',
        };
      case 'document-list':
        return {
          path: 'src/components/DocumentList.tsx',
          content: generateDocumentList({}),
          language: 'typescript',
        };
      case 'payment-table':
        return {
          path: 'src/components/PaymentTable.tsx',
          content: this.generateEntityTableComponent('PaymentTable', 'payment', [
      { key: 'payment_date', label: 'Date', type: 'date' },
      { key: 'reference', label: 'Reference' },
      { key: 'policy_number', label: 'Policy' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'method', label: 'Method' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };

      // Logistics/Shipping
      case 'logistics-stats':
        return {
          path: 'src/components/LogisticsStats.tsx',
          content: generateLogisticsStats({}),
          language: 'typescript',
        };
      case 'shipment-map':
        return {
          path: 'src/components/ShipmentMap.tsx',
          content: generateShipmentMap({}),
          language: 'typescript',
        };
      case 'shipment-list':
        return {
          path: 'src/components/ShipmentList.tsx',
          content: this.generateEntityTableComponent('ShipmentList', 'shipment', [
      { key: 'tracking_number', label: 'Tracking #' },
      { key: 'origin', label: 'Origin' },
      { key: 'destination', label: 'Destination' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'shipment-table':
        return {
          path: 'src/components/ShipmentTable.tsx',
          content: this.generateEntityTableComponent('ShipmentTable', 'shipment', [
      { key: 'tracking_number', label: 'Tracking #' },
      { key: 'origin', label: 'Origin' },
      { key: 'destination', label: 'Destination' },
      { key: 'carrier', label: 'Carrier' },
      { key: 'estimated_delivery', label: 'Est. Delivery', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'shipment-filters':
        return {
          path: 'src/components/ShipmentFilters.tsx',
          content: generateShipmentFilters({}),
          language: 'typescript',
        };
      case 'shipment-detail':
        return {
          path: 'src/components/ShipmentDetail.tsx',
          content: this.generateEntityDetailComponent('ShipmentDetail', 'shipment', [
      { key: 'tracking_number', label: 'Tracking Number', icon: 'Hash' },
      { key: 'origin', label: 'Origin', icon: 'MapPin' },
      { key: 'destination', label: 'Destination', icon: 'Navigation' },
      { key: 'carrier', label: 'Carrier', icon: 'Truck' },
      { key: 'weight', label: 'Weight', icon: 'Scale' },
      { key: 'estimated_delivery', label: 'Est. Delivery', type: 'date', icon: 'Calendar' },
      { key: 'status', label: 'Status', type: 'status', icon: 'Activity' },
    ]),
          language: 'typescript',
        };
      case 'shipment-timeline':
        return {
          path: 'src/components/ShipmentTimeline.tsx',
          content: generateShipmentTimeline({}),
          language: 'typescript',
        };
      case 'shipment-form':
        return {
          path: 'src/components/ShipmentForm.tsx',
          content: this.generatePublicFormComponent('ShipmentForm', 'shipment', [
      { key: 'origin', label: 'Origin Address', type: 'text', required: true },
      { key: 'destination', label: 'Destination Address', type: 'text', required: true },
      { key: 'weight', label: 'Weight (kg)', type: 'number', required: true },
      { key: 'dimensions', label: 'Dimensions', type: 'text' },
      { key: 'carrier', label: 'Carrier', type: 'select' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]),
          language: 'typescript',
        };
      case 'driver-list':
        return {
          path: 'src/components/DriverList.tsx',
          content: this.generateEntityTableComponent('DriverList', 'driver', [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'driver-profile':
        return {
          path: 'src/components/DriverProfile.tsx',
          content: generateDriverProfile({}),
          language: 'typescript',
        };
      case 'driver-form':
        return {
          path: 'src/components/DriverForm.tsx',
          content: this.generatePublicFormComponent('DriverForm', 'driver', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'license_number', label: 'License Number', type: 'text', required: true },
      { key: 'vehicle', label: 'Vehicle', type: 'text' },
    ]),
          language: 'typescript',
        };
      case 'vehicle-list':
        return {
          path: 'src/components/VehicleList.tsx',
          content: this.generateEntityTableComponent('VehicleList', 'vehicle', [
      { key: 'plate_number', label: 'Plate' },
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'vehicle-detail':
        return {
          path: 'src/components/VehicleDetail.tsx',
          content: this.generateEntityDetailComponent('VehicleDetail', 'vehicle', [
      { key: 'plate_number', label: 'Plate Number', icon: 'CreditCard' },
      { key: 'make', label: 'Make', icon: 'Car' },
      { key: 'model', label: 'Model', icon: 'Tag' },
      { key: 'year', label: 'Year', icon: 'Calendar' },
      { key: 'capacity', label: 'Capacity', icon: 'Package' },
      { key: 'last_service', label: 'Last Service', type: 'date', icon: 'Wrench' },
      { key: 'status', label: 'Status', type: 'status', icon: 'Activity' },
    ]),
          language: 'typescript',
        };
      case 'route-list':
        return {
          path: 'src/components/RouteList.tsx',
          content: this.generateEntityTableComponent('RouteList', 'route', [
      { key: 'name', label: 'Route Name' },
      { key: 'stops', label: 'Stops' },
      { key: 'distance', label: 'Distance' },
      { key: 'estimated_time', label: 'Est. Time' },
    ]),
          language: 'typescript',
        };
      case 'route-planner':
        return {
          path: 'src/components/RoutePlanner.tsx',
          content: generateRoutePlanner({}),
          language: 'typescript',
        };
      case 'delivery-tracker':
        return {
          path: 'src/components/DeliveryTracker.tsx',
          content: generateDeliveryTracker({}),
          language: 'typescript',
        };
      case 'carrier-list':
        return {
          path: 'src/components/CarrierList.tsx',
          content: this.generateEntityTableComponent('CarrierList', 'carrier', [
      { key: 'name', label: 'Carrier Name' },
      { key: 'type', label: 'Type' },
      { key: 'contact', label: 'Contact' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };

      // Music Streaming
      case 'music-player':
        return {
          path: 'src/components/MusicPlayer.tsx',
          content: generateMusicPlayer({}),
          language: 'typescript',
        };
      case 'now-playing':
        return {
          path: 'src/components/NowPlaying.tsx',
          content: generateNowPlaying({}),
          language: 'typescript',
        };
      case 'playlist-grid':
        return {
          path: 'src/components/PlaylistGrid.tsx',
          content: this.generateEntityTableComponent('PlaylistGrid', 'playlist', [
      { key: 'name', label: 'Playlist' },
      { key: 'track_count', label: 'Tracks' },
      { key: 'duration', label: 'Duration' },
    ]),
          language: 'typescript',
        };
      case 'playlist-detail':
        return {
          path: 'src/components/PlaylistDetail.tsx',
          content: this.generateEntityDetailComponent('PlaylistDetail', 'playlist', [
      { key: 'name', label: 'Playlist Name', icon: 'Music' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'track_count', label: 'Tracks', icon: 'List' },
      { key: 'total_duration', label: 'Duration', icon: 'Clock' },
      { key: 'created_at', label: 'Created', type: 'date', icon: 'Calendar' },
    ]),
          language: 'typescript',
        };
      case 'playlist-form':
        return {
          path: 'src/components/PlaylistForm.tsx',
          content: this.generatePublicFormComponent('PlaylistForm', 'playlist', [
      { key: 'name', label: 'Playlist Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'is_public', label: 'Public', type: 'select' },
    ]),
          language: 'typescript',
        };
      case 'album-detail':
        return {
          path: 'src/components/AlbumDetail.tsx',
          content: this.generateEntityDetailComponent('AlbumDetail', 'album', [
      { key: 'title', label: 'Album Title', icon: 'Disc' },
      { key: 'artist', label: 'Artist', icon: 'User' },
      { key: 'year', label: 'Year', icon: 'Calendar' },
      { key: 'genre', label: 'Genre', icon: 'Music' },
      { key: 'track_count', label: 'Tracks', icon: 'List' },
      { key: 'duration', label: 'Duration', icon: 'Clock' },
    ]),
          language: 'typescript',
        };
      case 'artist-grid':
        return {
          path: 'src/components/ArtistGrid.tsx',
          content: this.generateEntityTableComponent('ArtistGrid', 'artist', [
      { key: 'name', label: 'Artist' },
      { key: 'genre', label: 'Genre' },
      { key: 'followers', label: 'Followers' },
    ]),
          language: 'typescript',
        };
      case 'artist-profile':
        return {
          path: 'src/components/ArtistProfile.tsx',
          content: generateArtistProfile({}),
          language: 'typescript',
        };
      case 'search-results-music':
        return {
          path: 'src/components/SearchResultsMusic.tsx',
          content: generateSearchResultsMusic({}),
          language: 'typescript',
        };
      case 'genre-grid':
        return {
          path: 'src/components/GenreGrid.tsx',
          content: generateGenreGrid({}),
          language: 'typescript',
        };
      case 'library-tabs':
        return {
          path: 'src/components/LibraryTabs.tsx',
          content: generateLibraryTabs({}),
          language: 'typescript',
        };
      case 'queue-list':
        return {
          path: 'src/components/QueueList.tsx',
          content: this.generateEntityTableComponent('QueueList', 'queue_track', [
      { key: 'title', label: 'Track' },
      { key: 'artist', label: 'Artist' },
      { key: 'duration', label: 'Duration' },
    ]),
          language: 'typescript',
        };

      // Video Streaming (additional components)
      case 'video-card':
        return {
          path: 'src/components/VideoCard.tsx',
          content: generateVideoCard({}),
          language: 'typescript',
        };
      case 'video-detail':
        return {
          path: 'src/components/VideoDetail.tsx',
          content: this.generateEntityDetailComponent('VideoDetail', 'video', [
      { key: 'title', label: 'Title', icon: 'Film' },
      { key: 'channel', label: 'Channel', icon: 'User' },
      { key: 'views', label: 'Views', icon: 'Eye' },
      { key: 'likes', label: 'Likes', icon: 'ThumbsUp' },
      { key: 'uploaded_at', label: 'Uploaded', type: 'date', icon: 'Calendar' },
    ]),
          language: 'typescript',
        };
      case 'channel-header':
        return {
          path: 'src/components/ChannelHeader.tsx',
          content: generateChannelHeader({}),
          language: 'typescript',
        };
      case 'channel-grid':
        return {
          path: 'src/components/ChannelGrid.tsx',
          content: this.generateEntityTableComponent('ChannelGrid', 'channel', [
      { key: 'name', label: 'Channel' },
      { key: 'subscribers', label: 'Subscribers' },
      { key: 'video_count', label: 'Videos' },
    ]),
          language: 'typescript',
        };
      case 'channel-tabs':
        return {
          path: 'src/components/ChannelTabs.tsx',
          content: generateChannelTabs({}),
          language: 'typescript',
        };
      case 'video-upload-form':
        return {
          path: 'src/components/VideoUploadForm.tsx',
          content: this.generatePublicFormComponent('VideoUploadForm', 'video', [
      { key: 'title', label: 'Video Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tags', label: 'Tags', type: 'text' },
      { key: 'visibility', label: 'Visibility', type: 'select' },
    ]),
          language: 'typescript',
        };
      case 'video-comments':
        return {
          path: 'src/components/VideoComments.tsx',
          content: generateVideoComments({}),
          language: 'typescript',
        };
      case 'video-recommendations':
        return {
          path: 'src/components/VideoRecommendations.tsx',
          content: this.generateEntityTableComponent('VideoRecommendations', 'video', [
      { key: 'title', label: 'Title' },
      { key: 'channel', label: 'Channel' },
      { key: 'views', label: 'Views' },
    ]),
          language: 'typescript',
        };
      case 'subscription-list':
        return {
          path: 'src/components/SubscriptionList.tsx',
          content: this.generateEntityTableComponent('SubscriptionList', 'subscription', [
      { key: 'channel_name', label: 'Channel' },
      { key: 'subscribers', label: 'Subscribers' },
      { key: 'last_video', label: 'Last Video' },
    ]),
          language: 'typescript',
        };
      case 'watch-history':
        return {
          path: 'src/components/WatchHistory.tsx',
          content: this.generateEntityTableComponent('WatchHistory', 'watch_history', [
      { key: 'title', label: 'Video' },
      { key: 'channel', label: 'Channel' },
      { key: 'watched_at', label: 'Watched', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'trending-videos':
        return {
          path: 'src/components/TrendingVideos.tsx',
          content: this.generateEntityTableComponent('TrendingVideos', 'video', [
      { key: 'title', label: 'Title' },
      { key: 'channel', label: 'Channel' },
      { key: 'views', label: 'Views' },
    ]),
          language: 'typescript',
        };

      // Podcast (additional components)
      case 'show-grid':
        return {
          path: 'src/components/ShowGrid.tsx',
          content: this.generateEntityTableComponent('ShowGrid', 'show', [
      { key: 'title', label: 'Show' },
      { key: 'host', label: 'Host' },
      { key: 'episode_count', label: 'Episodes' },
      { key: 'category', label: 'Category' },
    ]),
          language: 'typescript',
        };
      case 'show-detail':
        return {
          path: 'src/components/ShowDetail.tsx',
          content: this.generateEntityDetailComponent('ShowDetail', 'show', [
      { key: 'title', label: 'Show Title', icon: 'Mic' },
      { key: 'host', label: 'Host', icon: 'User' },
      { key: 'category', label: 'Category', icon: 'Tag' },
      { key: 'episode_count', label: 'Episodes', icon: 'List' },
      { key: 'subscribers', label: 'Subscribers', icon: 'Users' },
    ]),
          language: 'typescript',
        };
      case 'episode-card':
        return {
          path: 'src/components/EpisodeCard.tsx',
          content: generateEpisodeCard({}),
          language: 'typescript',
        };
      case 'episode-player':
        return {
          path: 'src/components/EpisodePlayer.tsx',
          content: this.generateEntityDetailComponent('EpisodePlayer', 'episode', [
      { key: 'title', label: 'Episode', icon: 'Mic' },
      { key: 'show', label: 'Show', icon: 'Radio' },
      { key: 'duration', label: 'Duration', icon: 'Clock' },
      { key: 'published_at', label: 'Published', type: 'date', icon: 'Calendar' },
    ]),
          language: 'typescript',
        };
      case 'podcast-search':
        return {
          path: 'src/components/PodcastSearch.tsx',
          content: generatePodcastSearch({}),
          language: 'typescript',
        };
      case 'category-pills':
        return {
          path: 'src/components/CategoryPills.tsx',
          content: generateCategoryPills({}),
          language: 'typescript',
        };
      case 'listening-history':
        return {
          path: 'src/components/ListeningHistory.tsx',
          content: this.generateEntityTableComponent('ListeningHistory', 'listening_history', [
      { key: 'episode_title', label: 'Episode' },
      { key: 'show', label: 'Show' },
      { key: 'listened_at', label: 'Listened', type: 'date' },
      { key: 'progress', label: 'Progress' },
    ]),
          language: 'typescript',
        };
      case 'podcast-subscriptions':
        return {
          path: 'src/components/PodcastSubscriptions.tsx',
          content: this.generateEntityTableComponent('PodcastSubscriptions', 'podcast_subscription', [
      { key: 'show_title', label: 'Show' },
      { key: 'host', label: 'Host' },
      { key: 'new_episodes', label: 'New Episodes' },
    ]),
          language: 'typescript',
        };
      case 'episode-queue':
        return {
          path: 'src/components/EpisodeQueue.tsx',
          content: this.generateEntityTableComponent('EpisodeQueue', 'queue_episode', [
      { key: 'title', label: 'Episode' },
      { key: 'show', label: 'Show' },
      { key: 'duration', label: 'Duration' },
    ]),
          language: 'typescript',
        };
      case 'show-form':
        return {
          path: 'src/components/ShowForm.tsx',
          content: this.generatePublicFormComponent('ShowForm', 'show', [
      { key: 'title', label: 'Show Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select' },
      { key: 'language', label: 'Language', type: 'select' },
      { key: 'explicit', label: 'Explicit Content', type: 'select' },
    ]),
          language: 'typescript',
        };

      // Dating
      case 'dating-profile':
        return {
          path: 'src/components/DatingProfile.tsx',
          content: generateDatingProfile({}),
          language: 'typescript',
        };
      case 'profile-editor':
        return {
          path: 'src/components/ProfileEditor.tsx',
          content: this.generatePublicFormComponent('ProfileEditor', 'profile', [
      { key: 'bio', label: 'About Me', type: 'textarea', required: true },
      { key: 'occupation', label: 'Occupation', type: 'text' },
      { key: 'education', label: 'Education', type: 'text' },
      { key: 'height', label: 'Height', type: 'text' },
      { key: 'interests', label: 'Interests', type: 'text' },
    ]),
          language: 'typescript',
        };
      case 'photo-gallery':
        return {
          path: 'src/components/PhotoGallery.tsx',
          content: generatePhotoGallery({}),
          language: 'typescript',
        };
      case 'swipe-cards':
        return {
          path: 'src/components/SwipeCards.tsx',
          content: generateSwipeCards({}),
          language: 'typescript',
        };
      case 'match-list':
        return {
          path: 'src/components/MatchList.tsx',
          content: this.generateEntityTableComponent('MatchList', 'match', [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
      { key: 'matched_at', label: 'Matched', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'match-card':
        return {
          path: 'src/components/MatchCard.tsx',
          content: generateMatchCard({}),
          language: 'typescript',
        };
      case 'chat-list-dating':
        return {
          path: 'src/components/ChatListDating.tsx',
          content: this.generateEntityTableComponent('ChatListDating', 'conversation', [
      { key: 'match_name', label: 'Match' },
      { key: 'last_message', label: 'Last Message' },
      { key: 'updated_at', label: 'Time', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'chat-window-dating':
        return {
          path: 'src/components/ChatWindowDating.tsx',
          content: generateChatWindowDating({}),
          language: 'typescript',
        };
      case 'discovery-filters':
        return {
          path: 'src/components/DiscoveryFilters.tsx',
          content: generateDiscoveryFilters({}),
          language: 'typescript',
        };
      case 'preferences-form':
        return {
          path: 'src/components/PreferencesForm.tsx',
          content: this.generatePublicFormComponent('PreferencesForm', 'preference', [
      { key: 'min_age', label: 'Minimum Age', type: 'number' },
      { key: 'max_age', label: 'Maximum Age', type: 'number' },
      { key: 'max_distance', label: 'Max Distance (km)', type: 'number' },
      { key: 'show_me', label: 'Show Me', type: 'select' },
    ]),
          language: 'typescript',
        };
      case 'profile-preview':
        return {
          path: 'src/components/ProfilePreview.tsx',
          content: generateProfilePreview({}),
          language: 'typescript',
        };
      case 'icebreakers':
        return {
          path: 'src/components/Icebreakers.tsx',
          content: generateIcebreakers({}),
          language: 'typescript',
        };

      // Freelance
      case 'freelance-stats':
        return {
          path: 'src/components/FreelanceStats.tsx',
          content: generateFreelanceStats({}),
          language: 'typescript',
        };
      case 'project-grid-freelance':
        return {
          path: 'src/components/ProjectGridFreelance.tsx',
          content: this.generateEntityTableComponent('ProjectGridFreelance', 'project', [
      { key: 'title', label: 'Project' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'skills', label: 'Skills' },
      { key: 'proposals_count', label: 'Proposals' },
    ]),
          language: 'typescript',
        };
      case 'project-filters':
        return {
          path: 'src/components/ProjectFilters.tsx',
          content: generateProjectFilters({}),
          language: 'typescript',
        };
      case 'project-detail-freelance':
        return {
          path: 'src/components/ProjectDetailFreelance.tsx',
          content: this.generateEntityDetailComponent('ProjectDetailFreelance', 'project', [
      { key: 'title', label: 'Project Title', icon: 'Briefcase' },
      { key: 'budget', label: 'Budget', type: 'currency', icon: 'DollarSign' },
      { key: 'duration', label: 'Duration', icon: 'Clock' },
      { key: 'experience_level', label: 'Experience', icon: 'Award' },
      { key: 'proposals_count', label: 'Proposals', icon: 'Users' },
      { key: 'posted_at', label: 'Posted', type: 'date', icon: 'Calendar' },
    ]),
          language: 'typescript',
        };
      case 'project-form-freelance':
        return {
          path: 'src/components/ProjectFormFreelance.tsx',
          content: this.generatePublicFormComponent('ProjectFormFreelance', 'project', [
      { key: 'title', label: 'Project Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true },
      { key: 'budget_min', label: 'Min Budget', type: 'number', required: true },
      { key: 'budget_max', label: 'Max Budget', type: 'number', required: true },
      { key: 'skills', label: 'Required Skills', type: 'text', required: true },
      { key: 'duration', label: 'Duration', type: 'select' },
    ]),
          language: 'typescript',
        };
      case 'proposal-form':
        return {
          path: 'src/components/ProposalForm.tsx',
          content: this.generatePublicFormComponent('ProposalForm', 'proposal', [
      { key: 'cover_letter', label: 'Cover Letter', type: 'textarea', required: true },
      { key: 'bid_amount', label: 'Your Bid ($)', type: 'number', required: true },
      { key: 'delivery_time', label: 'Delivery Time (days)', type: 'number', required: true },
      { key: 'milestones', label: 'Milestones', type: 'textarea' },
    ]),
          language: 'typescript',
        };
      case 'proposal-list':
        return {
          path: 'src/components/ProposalList.tsx',
          content: this.generateEntityTableComponent('ProposalList', 'proposal', [
      { key: 'freelancer_name', label: 'Freelancer' },
      { key: 'bid_amount', label: 'Bid', type: 'currency' },
      { key: 'delivery_time', label: 'Delivery' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'contract-detail':
        return {
          path: 'src/components/ContractDetail.tsx',
          content: this.generateEntityDetailComponent('ContractDetail', 'contract', [
      { key: 'project_title', label: 'Project', icon: 'Briefcase' },
      { key: 'client_name', label: 'Client', icon: 'User' },
      { key: 'amount', label: 'Amount', type: 'currency', icon: 'DollarSign' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'end_date', label: 'End Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'status', label: 'Status', type: 'status', icon: 'Activity' },
    ]),
          language: 'typescript',
        };
      case 'contract-form':
        return {
          path: 'src/components/ContractForm.tsx',
          content: this.generatePublicFormComponent('ContractForm', 'contract', [
      { key: 'title', label: 'Contract Title', type: 'text', required: true },
      { key: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'terms', label: 'Terms & Conditions', type: 'textarea', required: true },
    ]),
          language: 'typescript',
        };
      case 'milestone-list':
        return {
          path: 'src/components/MilestoneList.tsx',
          content: this.generateEntityTableComponent('MilestoneList', 'milestone', [
      { key: 'title', label: 'Milestone' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'time-tracker':
        return {
          path: 'src/components/TimeTracker.tsx',
          content: generateTimeTracker({}),
          language: 'typescript',
        };
      case 'invoice-list-freelance':
        return {
          path: 'src/components/InvoiceListFreelance.tsx',
          content: this.generateEntityTableComponent('InvoiceListFreelance', 'invoice', [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'client_name', label: 'Client' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'freelancer-profile':
        return {
          path: 'src/components/FreelancerProfile.tsx',
          content: generateFreelancerProfile({}),
          language: 'typescript',
        };
      case 'client-profile-freelance':
        return {
          path: 'src/components/ClientProfileFreelance.tsx',
          content: generateClientProfileFreelance({}),
          language: 'typescript',
        };
      case 'skill-list':
        return {
          path: 'src/components/SkillList.tsx',
          content: generateSkillList({}),
          language: 'typescript',
        };

      // Auction
      case 'auction-grid':
        return {
          path: 'src/components/AuctionGrid.tsx',
          content: this.generateEntityTableComponent('AuctionGrid', 'auction', [
      { key: 'title', label: 'Item' },
      { key: 'current_bid', label: 'Current Bid', type: 'currency' },
      { key: 'bids_count', label: 'Bids' },
      { key: 'ends_at', label: 'Ends', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'auction-filters':
        return {
          path: 'src/components/AuctionFilters.tsx',
          content: generateAuctionFilters({}),
          language: 'typescript',
        };
      case 'auction-detail':
        return {
          path: 'src/components/AuctionDetail.tsx',
          content: this.generateEntityDetailComponent('AuctionDetail', 'auction', [
      { key: 'title', label: 'Item', icon: 'Package' },
      { key: 'starting_price', label: 'Starting Price', type: 'currency', icon: 'Tag' },
      { key: 'current_bid', label: 'Current Bid', type: 'currency', icon: 'DollarSign' },
      { key: 'bids_count', label: 'Total Bids', icon: 'Users' },
      { key: 'ends_at', label: 'Ends At', type: 'date', icon: 'Clock' },
      { key: 'seller', label: 'Seller', icon: 'User' },
    ]),
          language: 'typescript',
        };
      case 'bid-form':
        return {
          path: 'src/components/BidForm.tsx',
          content: generateBidForm({}),
          language: 'typescript',
        };
      case 'bid-history':
        return {
          path: 'src/components/BidHistory.tsx',
          content: this.generateEntityTableComponent('BidHistory', 'bid', [
      { key: 'bidder', label: 'Bidder' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'placed_at', label: 'Time', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'auction-timer':
        return {
          path: 'src/components/AuctionTimer.tsx',
          content: generateAuctionTimer({}),
          language: 'typescript',
        };
      case 'auction-form':
        return {
          path: 'src/components/AuctionForm.tsx',
          content: this.generatePublicFormComponent('AuctionForm', 'auction', [
      { key: 'title', label: 'Item Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true },
      { key: 'starting_price', label: 'Starting Price ($)', type: 'number', required: true },
      { key: 'reserve_price', label: 'Reserve Price ($)', type: 'number' },
      { key: 'duration', label: 'Duration (days)', type: 'select', required: true },
    ]),
          language: 'typescript',
        };
      case 'my-bids':
        return {
          path: 'src/components/MyBids.tsx',
          content: this.generateEntityTableComponent('MyBids', 'bid', [
      { key: 'auction_title', label: 'Auction' },
      { key: 'amount', label: 'Your Bid', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'ends_at', label: 'Ends', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'won-auctions':
        return {
          path: 'src/components/WonAuctions.tsx',
          content: this.generateEntityTableComponent('WonAuctions', 'auction', [
      { key: 'title', label: 'Item' },
      { key: 'winning_bid', label: 'Won At', type: 'currency' },
      { key: 'won_at', label: 'Date', type: 'date' },
      { key: 'payment_status', label: 'Payment', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'seller-auctions':
        return {
          path: 'src/components/SellerAuctions.tsx',
          content: this.generateEntityTableComponent('SellerAuctions', 'auction', [
      { key: 'title', label: 'Item' },
      { key: 'current_bid', label: 'Current Bid', type: 'currency' },
      { key: 'bids_count', label: 'Bids' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'watchlist':
        return {
          path: 'src/components/Watchlist.tsx',
          content: this.generateEntityTableComponent('Watchlist', 'watchlist_item', [
      { key: 'title', label: 'Item' },
      { key: 'current_bid', label: 'Current Bid', type: 'currency' },
      { key: 'ends_at', label: 'Ends', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'live-auction':
        return {
          path: 'src/components/LiveAuction.tsx',
          content: generateLiveAuction({}),
          language: 'typescript',
        };

      // Crowdfunding
      case 'campaign-grid':
        return {
          path: 'src/components/CampaignGrid.tsx',
          content: this.generateEntityTableComponent('CampaignGrid', 'campaign', [
      { key: 'title', label: 'Campaign' },
      { key: 'raised', label: 'Raised', type: 'currency' },
      { key: 'goal', label: 'Goal', type: 'currency' },
      { key: 'backers', label: 'Backers' },
    ]),
          language: 'typescript',
        };
      case 'campaign-filters':
        return {
          path: 'src/components/CampaignFilters.tsx',
          content: generateCampaignFilters({}),
          language: 'typescript',
        };
      case 'campaign-header':
        return {
          path: 'src/components/CampaignHeader.tsx',
          content: generateCampaignHeader({}),
          language: 'typescript',
        };
      case 'campaign-story':
        return {
          path: 'src/components/CampaignStory.tsx',
          content: generateCampaignStory({}),
          language: 'typescript',
        };
      case 'reward-tiers':
        return {
          path: 'src/components/RewardTiers.tsx',
          content: generateRewardTiers({}),
          language: 'typescript',
        };
      case 'backer-list':
        return {
          path: 'src/components/BackerList.tsx',
          content: this.generateEntityTableComponent('BackerList', 'backer', [
      { key: 'name', label: 'Backer' },
      { key: 'amount', label: 'Pledged', type: 'currency' },
      { key: 'backed_at', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'funding-progress':
        return {
          path: 'src/components/FundingProgress.tsx',
          content: generateFundingProgress({}),
          language: 'typescript',
        };
      case 'campaign-updates':
        return {
          path: 'src/components/CampaignUpdates.tsx',
          content: this.generateEntityTableComponent('CampaignUpdates', 'update', [
      { key: 'title', label: 'Update' },
      { key: 'posted_at', label: 'Posted', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'pledge-form':
        return {
          path: 'src/components/PledgeForm.tsx',
          content: this.generatePublicFormComponent('PledgeForm', 'pledge', [
      { key: 'amount', label: 'Pledge Amount ($)', type: 'number', required: true },
      { key: 'reward_id', label: 'Reward Tier', type: 'select' },
      { key: 'message', label: 'Message (optional)', type: 'textarea' },
      { key: 'anonymous', label: 'Make pledge anonymous', type: 'select' },
    ]),
          language: 'typescript',
        };
      case 'campaign-form':
        return {
          path: 'src/components/CampaignForm.tsx',
          content: this.generatePublicFormComponent('CampaignForm', 'campaign', [
      { key: 'title', label: 'Campaign Title', type: 'text', required: true },
      { key: 'short_description', label: 'Short Description', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true },
      { key: 'goal', label: 'Funding Goal ($)', type: 'number', required: true },
      { key: 'duration', label: 'Duration (days)', type: 'select', required: true },
      { key: 'story', label: 'Campaign Story', type: 'textarea', required: true },
    ]),
          language: 'typescript',
        };
      case 'my-campaigns':
        return {
          path: 'src/components/MyCampaigns.tsx',
          content: this.generateEntityTableComponent('MyCampaigns', 'campaign', [
      { key: 'title', label: 'Campaign' },
      { key: 'raised', label: 'Raised', type: 'currency' },
      { key: 'goal', label: 'Goal', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'backed-projects':
        return {
          path: 'src/components/BackedProjects.tsx',
          content: this.generateEntityTableComponent('BackedProjects', 'backed_project', [
      { key: 'campaign_title', label: 'Campaign' },
      { key: 'amount', label: 'Pledged', type: 'currency' },
      { key: 'reward', label: 'Reward' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'campaign-stats':
        return {
          path: 'src/components/CampaignStats.tsx',
          content: generateCampaignStats({}),
          language: 'typescript',
        };

      // News/Magazine
      case 'featured-article':
        return {
          path: 'src/components/FeaturedArticle.tsx',
          content: generateFeaturedArticle({}),
          language: 'typescript',
        };
      case 'article-content':
        return {
          path: 'src/components/ArticleContent.tsx',
          content: generateArticleContent({}),
          language: 'typescript',
        };
      case 'author-card':
        return {
          path: 'src/components/AuthorCard.tsx',
          content: generateAuthorCard({}),
          language: 'typescript',
        };
      case 'author-profile':
        return {
          path: 'src/components/AuthorProfile.tsx',
          content: generateAuthorProfile({}),
          language: 'typescript',
        };

      // Recipe
      case 'featured-recipes':
        return {
          path: 'src/components/FeaturedRecipes.tsx',
          content: this.generateEntityTableComponent('FeaturedRecipes', 'recipe', [
      { key: 'title', label: 'Recipe' },
      { key: 'cuisine', label: 'Cuisine' },
      { key: 'prep_time', label: 'Prep Time' },
      { key: 'rating', label: 'Rating' },
    ]),
          language: 'typescript',
        };
      case 'recipe-grid':
        return {
          path: 'src/components/RecipeGrid.tsx',
          content: this.generateEntityTableComponent('RecipeGrid', 'recipe', [
      { key: 'title', label: 'Recipe' },
      { key: 'category', label: 'Category' },
      { key: 'cook_time', label: 'Cook Time' },
      { key: 'difficulty', label: 'Difficulty' },
    ]),
          language: 'typescript',
        };
      case 'recipe-header':
        return {
          path: 'src/components/RecipeHeader.tsx',
          content: generateRecipeHeader({}),
          language: 'typescript',
        };
      case 'ingredient-list':
        return {
          path: 'src/components/IngredientList.tsx',
          content: generateIngredientList({}),
          language: 'typescript',
        };
      case 'recipe-steps':
        return {
          path: 'src/components/RecipeSteps.tsx',
          content: generateRecipeSteps({}),
          language: 'typescript',
        };
      case 'nutrition-info':
        return {
          path: 'src/components/NutritionInfo.tsx',
          content: generateNutritionInfo({}),
          language: 'typescript',
        };
      case 'review-list-recipe':
        return {
          path: 'src/components/ReviewListRecipe.tsx',
          content: this.generateEntityTableComponent('ReviewListRecipe', 'review', [
      { key: 'author', label: 'Reviewer' },
      { key: 'rating', label: 'Rating' },
      { key: 'comment', label: 'Review' },
      { key: 'created_at', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'recipe-form':
        return {
          path: 'src/components/RecipeForm.tsx',
          content: this.generatePublicFormComponent('RecipeForm', 'recipe', [
      { key: 'title', label: 'Recipe Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true },
      { key: 'cuisine', label: 'Cuisine', type: 'select' },
      { key: 'prep_time', label: 'Prep Time (e.g., 15 mins)', type: 'text' },
      { key: 'cook_time', label: 'Cook Time (e.g., 30 mins)', type: 'text' },
      { key: 'servings', label: 'Servings', type: 'number' },
      { key: 'difficulty', label: 'Difficulty', type: 'select' },
    ]),
          language: 'typescript',
        };
      case 'meal-planner':
        return {
          path: 'src/components/MealPlanner.tsx',
          content: generateMealPlanner({}),
          language: 'typescript',
        };
      case 'shopping-list':
        return {
          path: 'src/components/ShoppingList.tsx',
          content: generateShoppingList({}),
          language: 'typescript',
        };

      // Pet/Veterinary
      case 'pet-cards':
        return {
          path: 'src/components/PetCards.tsx',
          content: this.generateEntityTableComponent('PetCards', 'pet', [
      { key: 'name', label: 'Name' },
      { key: 'species', label: 'Species' },
      { key: 'breed', label: 'Breed' },
      { key: 'age', label: 'Age' },
    ]),
          language: 'typescript',
        };
      case 'pet-grid':
        return {
          path: 'src/components/PetGrid.tsx',
          content: this.generateEntityTableComponent('PetGrid', 'pet', [
      { key: 'name', label: 'Pet' },
      { key: 'type', label: 'Type' },
      { key: 'owner', label: 'Owner' },
      { key: 'last_visit', label: 'Last Visit', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'pet-profile':
        return {
          path: 'src/components/PetProfile.tsx',
          content: generatePetProfile({}),
          language: 'typescript',
        };
      case 'pet-form':
        return {
          path: 'src/components/PetForm.tsx',
          content: this.generatePublicFormComponent('PetForm', 'pet', [
      { key: 'name', label: 'Pet Name', type: 'text', required: true },
      { key: 'species', label: 'Species', type: 'select', required: true },
      { key: 'breed', label: 'Breed', type: 'text' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { key: 'gender', label: 'Gender', type: 'select' },
      { key: 'weight', label: 'Weight (kg)', type: 'number' },
      { key: 'microchip', label: 'Microchip Number', type: 'text' },
      { key: 'notes', label: 'Special Notes', type: 'textarea' },
    ]),
          language: 'typescript',
        };
      case 'vaccination-list':
        return {
          path: 'src/components/VaccinationList.tsx',
          content: this.generateEntityTableComponent('VaccinationList', 'vaccination', [
      { key: 'vaccine', label: 'Vaccine' },
      { key: 'date_given', label: 'Date Given', type: 'date' },
      { key: 'next_due', label: 'Next Due', type: 'date' },
      { key: 'veterinarian', label: 'Vet' },
    ]),
          language: 'typescript',
        };
      case 'vaccination-reminders':
        return {
          path: 'src/components/VaccinationReminders.tsx',
          content: this.generateEntityTableComponent('VaccinationReminders', 'vaccination', [
      { key: 'pet_name', label: 'Pet' },
      { key: 'vaccine', label: 'Vaccine' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'medical-history-pet':
        return {
          path: 'src/components/MedicalHistoryPet.tsx',
          content: this.generateEntityTableComponent('MedicalHistoryPet', 'medical_record', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'type', label: 'Type' },
      { key: 'diagnosis', label: 'Diagnosis' },
      { key: 'veterinarian', label: 'Vet' },
    ]),
          language: 'typescript',
        };
      case 'vet-search':
        return {
          path: 'src/components/VetSearch.tsx',
          content: generateVetSearch({}),
          language: 'typescript',
        };
      case 'vet-list':
        return {
          path: 'src/components/VetList.tsx',
          content: this.generateEntityTableComponent('VetList', 'veterinarian', [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'clinic', label: 'Clinic' },
      { key: 'rating', label: 'Rating' },
    ]),
          language: 'typescript',
        };

      // Legal/Law Firm
      case 'case-stats':
        return {
          path: 'src/components/CaseStats.tsx',
          content: generateCaseStats({}),
          language: 'typescript',
        };
      case 'case-list':
        return {
          path: 'src/components/CaseList.tsx',
          content: this.generateEntityTableComponent('CaseList', 'case', [
      { key: 'case_number', label: 'Case #' },
      { key: 'title', label: 'Case Title' },
      { key: 'client', label: 'Client' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'deadline-list':
        return {
          path: 'src/components/DeadlineList.tsx',
          content: this.generateEntityTableComponent('DeadlineList', 'deadline', [
      { key: 'case_title', label: 'Case' },
      { key: 'description', label: 'Deadline' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'case-table':
        return {
          path: 'src/components/CaseTable.tsx',
          content: this.generateEntityTableComponent('CaseTable', 'case', [
      { key: 'case_number', label: 'Case #' },
      { key: 'title', label: 'Title' },
      { key: 'client', label: 'Client' },
      { key: 'type', label: 'Type' },
      { key: 'assigned_to', label: 'Attorney' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'case-filters':
        return {
          path: 'src/components/CaseFilters.tsx',
          content: generateCaseFilters({}),
          language: 'typescript',
        };
      case 'case-header':
        return {
          path: 'src/components/CaseHeader.tsx',
          content: generateCaseHeader({}),
          language: 'typescript',
        };
      case 'case-timeline':
        return {
          path: 'src/components/CaseTimeline.tsx',
          content: generateCaseTimeline({}),
          language: 'typescript',
        };
      case 'time-entry-list':
        return {
          path: 'src/components/TimeEntryList.tsx',
          content: this.generateEntityTableComponent('TimeEntryList', 'time_entry', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'description', label: 'Description' },
      { key: 'hours', label: 'Hours' },
      { key: 'attorney', label: 'Attorney' },
    ]),
          language: 'typescript',
        };
      case 'client-profile-legal':
        return {
          path: 'src/components/ClientProfileLegal.tsx',
          content: generateClientProfileLegal({}),
          language: 'typescript',
        };
      case 'billing-summary':
        return {
          path: 'src/components/BillingSummary.tsx',
          content: generateBillingSummary({}),
          language: 'typescript',
        };
      case 'invoice-list-legal':
        return {
          path: 'src/components/InvoiceListLegal.tsx',
          content: this.generateEntityTableComponent('InvoiceListLegal', 'invoice', [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'client', label: 'Client' },
      { key: 'case_title', label: 'Case' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };

      // Subscription Billing
      case 'mrr-stats':
        return {
          path: 'src/components/MrrStats.tsx',
          content: generateMrrStats({}),
          language: 'typescript',
        };
      case 'subscriber-chart':
        return {
          path: 'src/components/SubscriberChart.tsx',
          content: generateSubscriberChart({}),
          language: 'typescript',
        };
      case 'subscription-activity':
        return {
          path: 'src/components/SubscriptionActivity.tsx',
          content: this.generateEntityTableComponent('SubscriptionActivity', 'subscription_activity', [
      { key: 'subscriber', label: 'Subscriber' },
      { key: 'action', label: 'Action' },
      { key: 'plan', label: 'Plan' },
      { key: 'date', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'plan-grid':
        return {
          path: 'src/components/PlanGrid.tsx',
          content: this.generateEntityTableComponent('PlanGrid', 'plan', [
      { key: 'name', label: 'Plan' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'interval', label: 'Interval' },
      { key: 'subscribers', label: 'Subscribers' },
    ]),
          language: 'typescript',
        };
      case 'plan-form':
        return {
          path: 'src/components/PlanForm.tsx',
          content: this.generatePublicFormComponent('PlanForm', 'plan', [
      { key: 'name', label: 'Plan Name', type: 'text', required: true },
      { key: 'price', label: 'Price ($)', type: 'number', required: true },
      { key: 'interval', label: 'Billing Interval', type: 'select', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'features', label: 'Features (comma separated)', type: 'textarea' },
      { key: 'trial_days', label: 'Trial Days', type: 'number' },
    ]),
          language: 'typescript',
        };
      case 'subscriber-table':
        return {
          path: 'src/components/SubscriberTable.tsx',
          content: this.generateEntityTableComponent('SubscriberTable', 'subscriber', [
      { key: 'email', label: 'Email' },
      { key: 'plan', label: 'Plan' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'mrr', label: 'MRR', type: 'currency' },
      { key: 'subscribed_at', label: 'Subscribed', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'subscriber-profile':
        return {
          path: 'src/components/SubscriberProfile.tsx',
          content: generateSubscriberProfile({}),
          language: 'typescript',
        };
      case 'subscription-history':
        return {
          path: 'src/components/SubscriptionHistory.tsx',
          content: this.generateEntityTableComponent('SubscriptionHistory', 'subscription_event', [
      { key: 'event', label: 'Event' },
      { key: 'plan', label: 'Plan' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'date', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'invoice-list-subscription':
        return {
          path: 'src/components/InvoiceListSubscription.tsx',
          content: this.generateEntityTableComponent('InvoiceListSubscription', 'invoice', [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'subscriber', label: 'Subscriber' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'invoice-table':
        return {
          path: 'src/components/InvoiceTable.tsx',
          content: this.generateEntityTableComponent('InvoiceTable', 'invoice', [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'subscriber', label: 'Subscriber' },
      { key: 'plan', label: 'Plan' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'date', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'revenue-chart':
        return {
          path: 'src/components/RevenueChart.tsx',
          content: generateRevenueChart({}),
          language: 'typescript',
        };
      case 'churn-metrics':
        return {
          path: 'src/components/ChurnMetrics.tsx',
          content: generateChurnMetrics({}),
          language: 'typescript',
        };
      case 'plan-distribution':
        return {
          path: 'src/components/PlanDistribution.tsx',
          content: generatePlanDistribution({}),
          language: 'typescript',
        };

      // Survey/Poll
      case 'survey-stats':
        return {
          path: 'src/components/SurveyStats.tsx',
          content: generateSurveyStats({}),
          language: 'typescript',
        };
      case 'survey-list':
        return {
          path: 'src/components/SurveyList.tsx',
          content: this.generateEntityTableComponent('SurveyList', 'survey', [
      { key: 'title', label: 'Survey' },
      { key: 'responses', label: 'Responses' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'created_at', label: 'Created', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'survey-filters':
        return {
          path: 'src/components/SurveyFilters.tsx',
          content: generateSurveyFilters({}),
          language: 'typescript',
        };
      case 'survey-grid':
        return {
          path: 'src/components/SurveyGrid.tsx',
          content: this.generateEntityTableComponent('SurveyGrid', 'survey', [
      { key: 'title', label: 'Survey' },
      { key: 'questions', label: 'Questions' },
      { key: 'responses', label: 'Responses' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'survey-builder':
        return {
          path: 'src/components/SurveyBuilder.tsx',
          content: generateSurveyBuilder({}),
          language: 'typescript',
        };
      case 'survey-header':
        return {
          path: 'src/components/SurveyHeader.tsx',
          content: generateSurveyHeader({}),
          language: 'typescript',
        };
      case 'question-list':
        return {
          path: 'src/components/QuestionList.tsx',
          content: this.generateEntityTableComponent('QuestionList', 'question', [
      { key: 'text', label: 'Question' },
      { key: 'type', label: 'Type' },
      { key: 'required', label: 'Required' },
    ]),
          language: 'typescript',
        };
      case 'survey-settings':
        return {
          path: 'src/components/SurveySettings.tsx',
          content: this.generatePublicFormComponent('SurveySettings', 'survey_settings', [
      { key: 'allow_anonymous', label: 'Allow Anonymous Responses', type: 'select' },
      { key: 'multiple_responses', label: 'Allow Multiple Responses', type: 'select' },
      { key: 'show_progress', label: 'Show Progress Bar', type: 'select' },
      { key: 'randomize_questions', label: 'Randomize Questions', type: 'select' },
      { key: 'close_date', label: 'Close Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'survey-editor':
        return {
          path: 'src/components/SurveyEditor.tsx',
          content: this.generatePublicFormComponent('SurveyEditor', 'survey', [
      { key: 'title', label: 'Survey Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'welcome_message', label: 'Welcome Message', type: 'textarea' },
      { key: 'thank_you_message', label: 'Thank You Message', type: 'textarea' },
    ]),
          language: 'typescript',
        };
      case 'response-table':
        return {
          path: 'src/components/ResponseTable.tsx',
          content: this.generateEntityTableComponent('ResponseTable', 'response', [
      { key: 'respondent', label: 'Respondent' },
      { key: 'completed_at', label: 'Completed', type: 'date' },
      { key: 'completion_time', label: 'Time' },
      { key: 'score', label: 'Score' },
    ]),
          language: 'typescript',
        };
      case 'response-summary':
        return {
          path: 'src/components/ResponseSummary.tsx',
          content: generateResponseSummary({}),
          language: 'typescript',
        };
      case 'survey-form':
        return {
          path: 'src/components/SurveyForm.tsx',
          content: generateSurveyForm({}),
          language: 'typescript',
        };
      case 'analytics-overview':
        return {
          path: 'src/components/AnalyticsOverview.tsx',
          content: generateAnalyticsCharts({}),
          language: 'typescript',
        };
      case 'question-analytics':
        return {
          path: 'src/components/QuestionAnalytics.tsx',
          content: generateQuestionAnalytics({}),
          language: 'typescript',
        };
      case 'response-chart':
        return {
          path: 'src/components/ResponseChart.tsx',
          content: generateResponseChart({}),
          language: 'typescript',
        };

      // Referral/Affiliate
      case 'affiliate-stats':
        return {
          path: 'src/components/AffiliateStats.tsx',
          content: generateAffiliateStats({}),
          language: 'typescript',
        };
      case 'earnings-chart':
        return {
          path: 'src/components/EarningsChart.tsx',
          content: generateEarningsChart({}),
          language: 'typescript',
        };
      case 'referral-list':
        return {
          path: 'src/components/ReferralList.tsx',
          content: this.generateEntityTableComponent('ReferralList', 'referral', [
      { key: 'referred', label: 'Referred' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'commission', label: 'Commission', type: 'currency' },
      { key: 'date', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'referral-filters':
        return {
          path: 'src/components/ReferralFilters.tsx',
          content: generateReferralFilters({}),
          language: 'typescript',
        };
      case 'referral-table':
        return {
          path: 'src/components/ReferralTable.tsx',
          content: this.generateEntityTableComponent('ReferralTable', 'referral', [
      { key: 'referred_email', label: 'Referred' },
      { key: 'source', label: 'Source' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'commission', label: 'Commission', type: 'currency' },
      { key: 'created_at', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'commission-summary':
        return {
          path: 'src/components/CommissionSummary.tsx',
          content: generateCommissionSummary({}),
          language: 'typescript',
        };
      case 'commission-table':
        return {
          path: 'src/components/CommissionTable.tsx',
          content: this.generateEntityTableComponent('CommissionTable', 'commission', [
      { key: 'referral', label: 'Referral' },
      { key: 'type', label: 'Type' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'date', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'link-generator':
        return {
          path: 'src/components/LinkGenerator.tsx',
          content: generateLinkGenerator({}),
          language: 'typescript',
        };
      case 'link-list':
        return {
          path: 'src/components/LinkList.tsx',
          content: this.generateEntityTableComponent('LinkList', 'referral_link', [
      { key: 'name', label: 'Link Name' },
      { key: 'clicks', label: 'Clicks' },
      { key: 'conversions', label: 'Conversions' },
      { key: 'created_at', label: 'Created', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'payout-balance':
        return {
          path: 'src/components/PayoutBalance.tsx',
          content: generatePayoutBalance({}),
          language: 'typescript',
        };
      case 'payout-history':
        return {
          path: 'src/components/PayoutHistory.tsx',
          content: this.generateEntityTableComponent('PayoutHistory', 'payout', [
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'method', label: 'Method' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'date', label: 'Date', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'payout-request':
        return {
          path: 'src/components/PayoutRequest.tsx',
          content: this.generatePublicFormComponent('PayoutRequest', 'payout_request', [
      { key: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { key: 'method', label: 'Payment Method', type: 'select', required: true },
      { key: 'account', label: 'Account Details', type: 'text', required: true },
    ]),
          language: 'typescript',
        };
      case 'campaign-list-referral':
        return {
          path: 'src/components/CampaignListReferral.tsx',
          content: this.generateEntityTableComponent('CampaignListReferral', 'affiliate_campaign', [
      { key: 'name', label: 'Campaign' },
      { key: 'commission_rate', label: 'Commission' },
      { key: 'conversions', label: 'Conversions' },
      { key: 'earnings', label: 'Earnings', type: 'currency' },
    ]),
          language: 'typescript',
        };
      case 'campaign-detail-referral':
        return {
          path: 'src/components/CampaignDetailReferral.tsx',
          content: this.generateEntityDetailComponent('CampaignDetailReferral', 'affiliate_campaign', [
      { key: 'name', label: 'Campaign Name', icon: 'Target' },
      { key: 'commission_rate', label: 'Commission Rate', icon: 'Percent' },
      { key: 'cookie_duration', label: 'Cookie Duration', icon: 'Clock' },
      { key: 'total_clicks', label: 'Total Clicks', icon: 'MousePointer' },
      { key: 'conversions', label: 'Conversions', icon: 'CheckCircle' },
      { key: 'earnings', label: 'Total Earnings', type: 'currency', icon: 'DollarSign' },
    ]),
          language: 'typescript',
        };
      case 'campaign-stats-referral':
        return {
          path: 'src/components/CampaignStatsReferral.tsx',
          content: generateCampaignStatsReferral({}),
          language: 'typescript',
        };
      case 'affiliate-leaderboard':
        return {
          path: 'src/components/AffiliateLeaderboard.tsx',
          content: generateAffiliateLeaderboard({}),
          language: 'typescript',
        };

      // Church/Religious
      case 'church-stats':
        return {
          path: 'src/components/ChurchStats.tsx',
          content: generateChurchStats({}),
          language: 'typescript',
        };
      case 'donation-summary':
        return {
          path: 'src/components/DonationSummary.tsx',
          content: generateDonationSummary({}),
          language: 'typescript',
        };
      case 'member-filters':
        return {
          path: 'src/components/MemberFilters.tsx',
          content: generateMemberFilters({}),
          language: 'typescript',
        };
      case 'member-table':
        return {
          path: 'src/components/MemberTable.tsx',
          content: this.generateEntityTableComponent('MemberTable', 'member', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'joined_date', label: 'Joined', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'member-groups':
        return {
          path: 'src/components/MemberGroups.tsx',
          content: generateMemberGroups({}),
          language: 'typescript',
        };
      case 'member-donations':
        return {
          path: 'src/components/MemberDonations.tsx',
          content: generateMemberDonations({}),
          language: 'typescript',
        };
      case 'event-calendar':
        return {
          path: 'src/components/EventCalendar.tsx',
          content: generateEventCalendarView({}),
          language: 'typescript',
        };
      case 'event-detail-church':
        return {
          path: 'src/components/EventDetailChurch.tsx',
          content: this.generateEntityDetailComponent('EventDetailChurch', 'event', [
      { key: 'name', label: 'Event Name' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'location', label: 'Location' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'registered', label: 'Registered' },
    ]),
          language: 'typescript',
        };
      case 'event-registrations':
        return {
          path: 'src/components/EventRegistrations.tsx',
          content: generateEventRegistrations({}),
          language: 'typescript',
        };
      case 'donation-stats':
        return {
          path: 'src/components/DonationStats.tsx',
          content: generateDonationStats({}),
          language: 'typescript',
        };
      case 'donation-table':
        return {
          path: 'src/components/DonationTable.tsx',
          content: this.generateEntityTableComponent('DonationTable', 'donation', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'donor_name', label: 'Donor' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'fund', label: 'Fund' },
      { key: 'method', label: 'Method' },
    ]),
          language: 'typescript',
        };
      case 'donation-form':
        return {
          path: 'src/components/DonationForm.tsx',
          content: this.generatePublicFormComponent('DonationForm', 'donation', [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'fund', label: 'Designate Fund', type: 'select', options: ['General Fund', 'Building Fund', 'Missions', 'Youth Ministry'] },
      { name: 'recurring', label: 'Make this recurring?', type: 'checkbox' },
    ], 'Donate Now', 'Thank you for your generous donation!'),
          language: 'typescript',
        };
      case 'group-grid':
        return {
          path: 'src/components/GroupGrid.tsx',
          content: this.generateEntityTableComponent('GroupGrid', 'group', [
      { key: 'name', label: 'Group Name' },
      { key: 'leader', label: 'Leader' },
      { key: 'member_count', label: 'Members' },
      { key: 'meeting_time', label: 'Meets' },
    ]),
          language: 'typescript',
        };
      case 'group-detail':
        return {
          path: 'src/components/GroupDetail.tsx',
          content: this.generateEntityDetailComponent('GroupDetail', 'group', [
      { key: 'name', label: 'Group Name' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'leader', label: 'Leader' },
      { key: 'meeting_time', label: 'Meeting Time' },
      { key: 'location', label: 'Location' },
      { key: 'member_count', label: 'Members' },
    ]),
          language: 'typescript',
        };
      case 'group-members':
        return {
          path: 'src/components/GroupMembers.tsx',
          content: generateGroupMembers({}),
          language: 'typescript',
        };
      case 'sermon-list':
        return {
          path: 'src/components/SermonList.tsx',
          content: generateSermonList({}),
          language: 'typescript',
        };
      case 'sermon-player':
        return {
          path: 'src/components/SermonPlayer.tsx',
          content: generateSermonPlayer({}),
          language: 'typescript',
        };
      case 'sermon-notes':
        return {
          path: 'src/components/SermonNotes.tsx',
          content: generateSermonNotes({}),
          language: 'typescript',
        };
      case 'prayer-list':
        return {
          path: 'src/components/PrayerList.tsx',
          content: generatePrayerList({}),
          language: 'typescript',
        };
      case 'prayer-form':
        return {
          path: 'src/components/PrayerForm.tsx',
          content: this.generatePublicFormComponent('PrayerForm', 'prayer', [
      { name: 'name', label: 'Your Name (optional)', type: 'text', required: false },
      { name: 'email', label: 'Email (optional)', type: 'email', required: false },
      { name: 'request', label: 'Prayer Request', type: 'textarea', required: true },
      { name: 'is_private', label: 'Keep this request private', type: 'checkbox' },
    ], 'Submit Prayer Request', 'Your prayer request has been submitted. We are praying with you.'),
          language: 'typescript',
        };

      // School Admin
      case 'school-stats':
        return {
          path: 'src/components/SchoolStats.tsx',
          content: generateSchoolStats({}),
          language: 'typescript',
        };
      case 'attendance-summary':
        return {
          path: 'src/components/AttendanceSummary.tsx',
          content: generateAttendanceSummary({}),
          language: 'typescript',
        };
      case 'school-events':
        return {
          path: 'src/components/SchoolEvents.tsx',
          content: generateSchoolEvents({}),
          language: 'typescript',
        };
      case 'student-filters':
        return {
          path: 'src/components/StudentFilters.tsx',
          content: generateStudentFilters({}),
          language: 'typescript',
        };
      case 'student-table':
        return {
          path: 'src/components/StudentTable.tsx',
          content: this.generateEntityTableComponent('StudentTable', 'student', [
      { key: 'student_id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'grade', label: 'Grade' },
      { key: 'class_name', label: 'Class' },
      { key: 'parent_name', label: 'Parent/Guardian' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'student-profile':
        return {
          path: 'src/components/StudentProfile.tsx',
          content: generateStudentProfile({}),
          language: 'typescript',
        };
      case 'student-grades':
        return {
          path: 'src/components/StudentGrades.tsx',
          content: generateStudentGrades({}),
          language: 'typescript',
        };
      case 'student-attendance':
        return {
          path: 'src/components/StudentAttendance.tsx',
          content: generateStudentAttendance({}),
          language: 'typescript',
        };
      case 'teacher-table':
        return {
          path: 'src/components/TeacherTable.tsx',
          content: this.generateEntityTableComponent('TeacherTable', 'teacher', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'department', label: 'Department' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'teacher-profile':
        return {
          path: 'src/components/TeacherProfile.tsx',
          content: generateTeacherProfile({}),
          language: 'typescript',
        };
      case 'teacher-classes':
        return {
          path: 'src/components/TeacherClasses.tsx',
          content: generateTeacherClasses({}),
          language: 'typescript',
        };
      case 'class-header':
        return {
          path: 'src/components/ClassHeader.tsx',
          content: generateClassHeader({}),
          language: 'typescript',
        };
      case 'class-students':
        return {
          path: 'src/components/ClassStudents.tsx',
          content: generateClassStudents({}),
          language: 'typescript',
        };
      case 'assignment-list':
        return {
          path: 'src/components/AssignmentList.tsx',
          content: generateAssignmentList({}),
          language: 'typescript',
        };
      case 'grade-filters':
        return {
          path: 'src/components/GradeFilters.tsx',
          content: generateGradeFilters({}),
          language: 'typescript',
        };
      case 'gradebook':
        return {
          path: 'src/components/Gradebook.tsx',
          content: generateGradebook({}),
          language: 'typescript',
        };
      case 'attendance-date-picker':
        return {
          path: 'src/components/AttendanceDatePicker.tsx',
          content: generateAttendanceDatePicker({}),
          language: 'typescript',
        };
      case 'attendance-form':
        return {
          path: 'src/components/AttendanceForm.tsx',
          content: generateAttendanceForm({}),
          language: 'typescript',
        };
      case 'schedule-calendar':
        return {
          path: 'src/components/ScheduleCalendar.tsx',
          content: generateScheduleCalendar({}),
          language: 'typescript',
        };
      case 'report-card-generator':
        return {
          path: 'src/components/ReportCardGenerator.tsx',
          content: generateReportCardGenerator({}),
          language: 'typescript',
        };

      // Warehouse/3PL
      case 'warehouse-stats':
        return {
          path: 'src/components/WarehouseStats.tsx',
          content: generateWarehouseStats({}),
          language: 'typescript',
        };
      case 'order-list-warehouse':
        return {
          path: 'src/components/OrderListWarehouse.tsx',
          content: generateOrderListWarehouse({}),
          language: 'typescript',
        };
      case 'low-stock-alerts':
        return {
          path: 'src/components/LowStockAlerts.tsx',
          content: generateLowStockAlerts({}),
          language: 'typescript',
        };
      case 'inventory-filters':
        return {
          path: 'src/components/InventoryFilters.tsx',
          content: generateInventoryFilters({}),
          language: 'typescript',
        };
      case 'inventory-table':
        return {
          path: 'src/components/InventoryTable.tsx',
          content: this.generateEntityTableComponent('InventoryTable', 'inventory', [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Product' },
      { key: 'location', label: 'Location' },
      { key: 'quantity', label: 'Qty' },
      { key: 'reorder_point', label: 'Reorder Point' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'product-detail-warehouse':
        return {
          path: 'src/components/ProductDetailWarehouse.tsx',
          content: this.generateEntityDetailComponent('ProductDetailWarehouse', 'inventory', [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'location', label: 'Warehouse Location' },
      { key: 'quantity', label: 'Current Stock' },
      { key: 'reorder_point', label: 'Reorder Point' },
      { key: 'unit_cost', label: 'Unit Cost', type: 'currency' },
      { key: 'last_received', label: 'Last Received', type: 'date' },
    ]),
          language: 'typescript',
        };
      case 'stock-levels':
        return {
          path: 'src/components/StockLevels.tsx',
          content: generateStockLevels({}),
          language: 'typescript',
        };
      case 'movement-history':
        return {
          path: 'src/components/MovementHistory.tsx',
          content: generateMovementHistory({}),
          language: 'typescript',
        };
      case 'order-filters':
        return {
          path: 'src/components/OrderFilters.tsx',
          content: generateOrderFilters({}),
          language: 'typescript',
        };
      case 'order-table':
        return {
          path: 'src/components/OrderTable.tsx',
          content: this.generateEntityTableComponent('OrderTable', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer', label: 'Customer' },
      { key: 'items_count', label: 'Items' },
      { key: 'created_at', label: 'Date', type: 'date' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'order-header':
        return {
          path: 'src/components/OrderHeader.tsx',
          content: generateOrderHeader({}),
          language: 'typescript',
        };
      case 'order-items':
        return {
          path: 'src/components/OrderItems.tsx',
          content: generateOrderItems({}),
          language: 'typescript',
        };
      case 'pick-list':
        return {
          path: 'src/components/PickList.tsx',
          content: generatePickList({}),
          language: 'typescript',
        };
      case 'receiving-list':
        return {
          path: 'src/components/ReceivingList.tsx',
          content: generateReceivingList({}),
          language: 'typescript',
        };
      case 'receiving-form':
        return {
          path: 'src/components/ReceivingForm.tsx',
          content: generateReceivingForm({}),
          language: 'typescript',
        };
      case 'shipment-filters-warehouse':
        return {
          path: 'src/components/ShipmentFiltersWarehouse.tsx',
          content: generateShipmentFiltersWarehouse({}),
          language: 'typescript',
        };
      case 'shipment-table-warehouse':
        return {
          path: 'src/components/ShipmentTableWarehouse.tsx',
          content: this.generateEntityTableComponent('ShipmentTableWarehouse', 'shipment', [
      { key: 'tracking_number', label: 'Tracking #' },
      { key: 'order_number', label: 'Order #' },
      { key: 'carrier', label: 'Carrier' },
      { key: 'ship_date', label: 'Ship Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'shipment-detail-warehouse':
        return {
          path: 'src/components/ShipmentDetailWarehouse.tsx',
          content: this.generateEntityDetailComponent('ShipmentDetailWarehouse', 'shipment', [
      { key: 'tracking_number', label: 'Tracking Number' },
      { key: 'order_number', label: 'Order Number' },
      { key: 'carrier', label: 'Carrier' },
      { key: 'service', label: 'Service Level' },
      { key: 'ship_date', label: 'Ship Date', type: 'date' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { key: 'weight', label: 'Weight' },
      { key: 'status', label: 'Status', type: 'status' },
    ]),
          language: 'typescript',
        };
      case 'tracking-info':
        return {
          path: 'src/components/TrackingInfo.tsx',
          content: generateTrackingInfo({}),
          language: 'typescript',
        };
      case 'location-map':
        return {
          path: 'src/components/LocationMap.tsx',
          content: generateLocationMap({}),
          language: 'typescript',
        };
      case 'location-list':
        return {
          path: 'src/components/LocationList.tsx',
          content: this.generateEntityTableComponent('LocationList', 'location', [
      { key: 'code', label: 'Location Code' },
      { key: 'zone', label: 'Zone' },
      { key: 'aisle', label: 'Aisle' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'occupied', label: 'Status' },
    ]),
          language: 'typescript',
        };
      case 'pick-queue':
        return {
          path: 'src/components/PickQueue.tsx',
          content: generatePickQueue({}),
          language: 'typescript',
        };
      case 'inventory-report':
        return {
          path: 'src/components/InventoryReport.tsx',
          content: generateInventoryReport({}),
          language: 'typescript',
        };
      case 'fulfillment-report':
        return {
          path: 'src/components/FulfillmentReport.tsx',
          content: generateFulfillmentReport({}),
          language: 'typescript',
        };

      // Nonprofit/Charity Components
      case 'nonprofit-stats':
        return { path: 'src/components/NonprofitStats.tsx', content: generateDonationStats({}), language: 'typescript' };
      case 'donation-chart':
        return { path: 'src/components/DonationChart.tsx', content: generateDonationChart({}), language: 'typescript' };
      case 'campaign-list-nonprofit':
        return { path: 'src/components/CampaignListNonprofit.tsx', content: generateCampaignListNonprofit({}), language: 'typescript' };
      case 'donation-filters-nonprofit':
        return { path: 'src/components/DonationFiltersNonprofit.tsx', content: generateDonationFiltersNonprofit({}), language: 'typescript' };
      case 'donation-table-nonprofit':
        return { path: 'src/components/DonationTableNonprofit.tsx', content: this.generateEntityTableComponent('DonationTableNonprofit', 'donation', [
      { key: 'donor_name', label: 'Donor' },
      { key: 'campaign', label: 'Campaign' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'payment_method', label: 'Method' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'donations'), language: 'typescript' };
      case 'donor-table':
        return { path: 'src/components/DonorTable.tsx', content: this.generateEntityTableComponent('DonorTable', 'donor', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'total_donated', label: 'Total Donated', type: 'currency' },
      { key: 'donations_count', label: 'Donations' },
      { key: 'last_donation', label: 'Last Donation', type: 'date' },
    ], 'donors'), language: 'typescript' };
      case 'donor-profile':
        return { path: 'src/components/DonorProfile.tsx', content: generateDonorProfile({}), language: 'typescript' };
      case 'donor-history':
        return { path: 'src/components/DonorHistory.tsx', content: this.generateEntityTableComponent('DonorHistory', 'donation', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'campaign', label: 'Campaign' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'payment_method', label: 'Method' },
    ], 'donors/:id/donations'), language: 'typescript' };
      case 'campaign-grid-nonprofit':
        return { path: 'src/components/CampaignGridNonprofit.tsx', content: this.generateEntityGridComponent('CampaignGridNonprofit', 'campaign', { title: 'name', subtitle: 'description', badge: 'status', image: 'image' }, 'campaigns'), language: 'typescript' };
      case 'campaign-header-nonprofit':
        return { path: 'src/components/CampaignHeaderNonprofit.tsx', content: this.generateEntityDetailComponent('CampaignHeaderNonprofit', 'campaign', [
      { key: 'name', label: 'Campaign Name', type: 'text', icon: 'Target' },
      { key: 'goal', label: 'Goal', type: 'currency', icon: 'DollarSign' },
      { key: 'raised', label: 'Raised', type: 'currency', icon: 'TrendingUp' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'end_date', label: 'End Date', type: 'date', icon: 'Calendar' },
      { key: 'status', label: 'Status', type: 'status', icon: 'CheckCircle' },
    ], 'campaigns'), language: 'typescript' };
      case 'campaign-progress-nonprofit':
        return { path: 'src/components/CampaignProgressNonprofit.tsx', content: generateCampaignProgressNonprofit({}), language: 'typescript' };
      case 'campaign-donors':
        return { path: 'src/components/CampaignDonors.tsx', content: this.generateEntityTableComponent('CampaignDonors', 'donor', [
      { key: 'name', label: 'Donor' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'date', label: 'Date', type: 'date' },
    ], 'campaigns/:id/donors'), language: 'typescript' };
      case 'volunteer-table':
        return { path: 'src/components/VolunteerTable.tsx', content: this.generateEntityTableComponent('VolunteerTable', 'volunteer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'skills', label: 'Skills' },
      { key: 'hours_logged', label: 'Hours' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'volunteers'), language: 'typescript' };
      case 'donate-form':
        return { path: 'src/components/DonateForm.tsx', content: this.generatePublicFormComponent('DonateForm', 'donation', [
      { key: 'amount', label: 'Donation Amount', type: 'number', required: true },
      { key: 'campaign_id', label: 'Campaign', type: 'select', required: false },
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'message', label: 'Message (Optional)', type: 'textarea', required: false },
    ], 'donations'), language: 'typescript' };

      // Membership/Club Components
      case 'membership-stats':
        return { path: 'src/components/MembershipStats.tsx', content: generateMembershipStats({}), language: 'typescript' };
      case 'member-growth-chart':
        return { path: 'src/components/MemberGrowthChart.tsx', content: generateMemberGrowthChart({}), language: 'typescript' };
      case 'renewal-list':
        return { path: 'src/components/RenewalList.tsx', content: generateRenewalList({}), language: 'typescript' };
      case 'member-filters-club':
        return { path: 'src/components/MemberFiltersClub.tsx', content: generateMemberFiltersClub({}), language: 'typescript' };
      case 'member-table-club':
        return { path: 'src/components/MemberTableClub.tsx', content: this.generateEntityTableComponent('MemberTableClub', 'member', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'plan', label: 'Plan' },
      { key: 'join_date', label: 'Joined', type: 'date' },
      { key: 'renewal_date', label: 'Renewal', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'members'), language: 'typescript' };
      case 'member-profile-club':
        return { path: 'src/components/MemberProfileClub.tsx', content: generateMemberProfileClub({}), language: 'typescript' };
      case 'member-payments':
        return { path: 'src/components/MemberPayments.tsx', content: this.generateEntityTableComponent('MemberPayments', 'payment', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'members/:id/payments'), language: 'typescript' };
      case 'member-activity':
        return { path: 'src/components/MemberActivity.tsx', content: this.generateEntityTableComponent('MemberActivity', 'activity', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
    ], 'members/:id/activity'), language: 'typescript' };
      case 'membership-plan-grid':
        return { path: 'src/components/MembershipPlanGrid.tsx', content: this.generateEntityGridComponent('MembershipPlanGrid', 'plan', { title: 'name', subtitle: 'description', badge: 'price', image: 'icon' }, 'plans'), language: 'typescript' };
      case 'payment-table-club':
        return { path: 'src/components/PaymentTableClub.tsx', content: this.generateEntityTableComponent('PaymentTableClub', 'payment', [
      { key: 'member_name', label: 'Member' },
      { key: 'plan', label: 'Plan' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'payments'), language: 'typescript' };
      case 'event-calendar-club':
        return { path: 'src/components/EventCalendarClub.tsx', content: generateEventCalendarClub({}), language: 'typescript' };
      case 'join-form':
        return { path: 'src/components/JoinForm.tsx', content: this.generatePublicFormComponent('JoinForm', 'member', [
      { key: 'name', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'plan_id', label: 'Membership Plan', type: 'select', required: true },
    ], 'members'), language: 'typescript' };

      // Coworking Space Components
      case 'coworking-stats':
        return { path: 'src/components/CoworkingStats.tsx', content: generateCoworkingStats({}), language: 'typescript' };
      case 'occupancy-chart':
        return { path: 'src/components/OccupancyChart.tsx', content: generateOccupancyChart({}), language: 'typescript' };
      case 'booking-list-coworking':
        return { path: 'src/components/BookingListCoworking.tsx', content: generateBookingListCoworking({}), language: 'typescript' };
      case 'space-grid':
        return { path: 'src/components/SpaceGrid.tsx', content: this.generateEntityGridComponent('SpaceGrid', 'space', { title: 'name', subtitle: 'type', badge: 'capacity', image: 'image' }, 'spaces'), language: 'typescript' };
      case 'space-detail':
        return { path: 'src/components/SpaceDetail.tsx', content: this.generateEntityDetailComponent('SpaceDetail', 'space', [
      { key: 'name', label: 'Space Name', type: 'text', icon: 'Square' },
      { key: 'type', label: 'Type', type: 'badge', icon: 'Tag' },
      { key: 'capacity', label: 'Capacity', type: 'number', icon: 'Users' },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'amenities', label: 'Amenities', type: 'tags', icon: 'Check' },
      { key: 'description', label: 'Description', type: 'text', icon: 'FileText' },
    ], 'spaces'), language: 'typescript' };
      case 'space-calendar':
        return { path: 'src/components/SpaceCalendar.tsx', content: generateSpaceCalendar({}), language: 'typescript' };
      case 'booking-calendar-coworking':
        return { path: 'src/components/BookingCalendarCoworking.tsx', content: generateBookingCalendarCoworking({}), language: 'typescript' };
      case 'booking-form-coworking':
        return { path: 'src/components/BookingFormCoworking.tsx', content: this.generatePublicFormComponent('BookingFormCoworking', 'booking', [
      { key: 'space_id', label: 'Space', type: 'select', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'start_time', label: 'Start Time', type: 'time', required: true },
      { key: 'end_time', label: 'End Time', type: 'time', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false },
    ], 'bookings'), language: 'typescript' };
      case 'member-table-coworking':
        return { path: 'src/components/MemberTableCoworking.tsx', content: this.generateEntityTableComponent('MemberTableCoworking', 'member', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'plan', label: 'Plan' },
      { key: 'company', label: 'Company' },
      { key: 'join_date', label: 'Joined', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'members'), language: 'typescript' };
      case 'member-profile-coworking':
        return { path: 'src/components/MemberProfileCoworking.tsx', content: generateMemberProfileCoworking({}), language: 'typescript' };
      case 'member-bookings':
        return { path: 'src/components/MemberBookings.tsx', content: this.generateEntityTableComponent('MemberBookings', 'booking', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'space_name', label: 'Space' },
      { key: 'time_slot', label: 'Time' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'members/:id/bookings'), language: 'typescript' };
      case 'coworking-plan-grid':
        return { path: 'src/components/CoworkingPlanGrid.tsx', content: this.generateEntityGridComponent('CoworkingPlanGrid', 'plan', { title: 'name', subtitle: 'description', badge: 'price', image: 'icon' }, 'plans'), language: 'typescript' };
      case 'space-browser':
        return { path: 'src/components/SpaceBrowser.tsx', content: this.generateEntityGridComponent('SpaceBrowser', 'space', { title: 'name', subtitle: 'type', badge: 'hourly_rate', image: 'image' }, 'spaces/available'), language: 'typescript' };

      // Photography/Studio Components
      case 'photo-stats':
        return { path: 'src/components/PhotoStats.tsx', content: generatePhotoStats({}), language: 'typescript' };
      case 'session-list':
        return { path: 'src/components/SessionList.tsx', content: generateSessionList({}), language: 'typescript' };
      case 'gallery-preview':
        return { path: 'src/components/GalleryPreview.tsx', content: this.generateEntityGridComponent('GalleryPreview', 'gallery', { title: 'name', subtitle: 'photo_count', badge: 'status', image: 'cover' }, 'galleries/recent'), language: 'typescript' };
      case 'booking-calendar-photo':
        return { path: 'src/components/BookingCalendarPhoto.tsx', content: generateBookingCalendarPhoto({}), language: 'typescript' };
      case 'session-detail':
        return { path: 'src/components/SessionDetail.tsx', content: this.generateEntityDetailComponent('SessionDetail', 'session', [
      { key: 'client_name', label: 'Client', type: 'text', icon: 'User' },
      { key: 'type', label: 'Session Type', type: 'badge', icon: 'Camera' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', type: 'time', icon: 'Clock' },
      { key: 'location', label: 'Location', type: 'text', icon: 'MapPin' },
      { key: 'package', label: 'Package', type: 'text', icon: 'Package' },
      { key: 'status', label: 'Status', type: 'status', icon: 'CheckCircle' },
    ], 'sessions'), language: 'typescript' };
      case 'session-gallery':
        return { path: 'src/components/SessionGallery.tsx', content: this.generateEntityGridComponent('SessionGallery', 'photo', { title: 'filename', subtitle: 'uploaded_at', badge: 'status', image: 'url' }, 'sessions/:id/photos'), language: 'typescript' };
      case 'gallery-grid-photo':
        return { path: 'src/components/GalleryGridPhoto.tsx', content: this.generateEntityGridComponent('GalleryGridPhoto', 'gallery', { title: 'name', subtitle: 'client_name', badge: 'photo_count', image: 'cover' }, 'galleries'), language: 'typescript' };
      case 'gallery-viewer':
        return { path: 'src/components/GalleryViewer.tsx', content: this.generateEntityGridComponent('GalleryViewer', 'photo', { title: 'filename', subtitle: 'uploaded_at', badge: 'size', image: 'url' }, 'galleries/:id/photos'), language: 'typescript' };
      case 'client-table-photo':
        return { path: 'src/components/ClientTablePhoto.tsx', content: this.generateEntityTableComponent('ClientTablePhoto', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'sessions_count', label: 'Sessions' },
      { key: 'last_session', label: 'Last Session', type: 'date' },
    ], 'clients'), language: 'typescript' };
      case 'client-profile-photo':
        return { path: 'src/components/ClientProfilePhoto.tsx', content: generateClientProfilePhoto({}), language: 'typescript' };
      case 'client-sessions':
        return { path: 'src/components/ClientSessions.tsx', content: this.generateEntityTableComponent('ClientSessions', 'session', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'type', label: 'Type' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'clients/:id/sessions'), language: 'typescript' };
      case 'client-galleries':
        return { path: 'src/components/ClientGalleries.tsx', content: this.generateEntityGridComponent('ClientGalleries', 'gallery', { title: 'name', subtitle: 'date', badge: 'photo_count', image: 'cover' }, 'clients/:id/galleries'), language: 'typescript' };
      case 'package-grid-photo':
        return { path: 'src/components/PackageGridPhoto.tsx', content: this.generateEntityGridComponent('PackageGridPhoto', 'package', { title: 'name', subtitle: 'description', badge: 'price', image: 'image' }, 'packages'), language: 'typescript' };
      case 'booking-wizard-photo':
        return { path: 'src/components/BookingWizardPhoto.tsx', content: this.generatePublicFormComponent('BookingWizardPhoto', 'session', [
      { key: 'type', label: 'Session Type', type: 'select', required: true },
      { key: 'package_id', label: 'Package', type: 'select', required: true },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'notes', label: 'Special Requests', type: 'textarea', required: false },
    ], 'sessions'), language: 'typescript' };

      // Wedding Planning Components
      case 'wedding-countdown':
        return { path: 'src/components/WeddingCountdown.tsx', content: generateWeddingCountdown({}), language: 'typescript' };
      case 'wedding-stats':
        return { path: 'src/components/WeddingStats.tsx', content: generateWeddingStats({}), language: 'typescript' };
      case 'task-list-wedding':
        return { path: 'src/components/TaskListWedding.tsx', content: generateTaskListWedding({}), language: 'typescript' };
      case 'guest-stats':
        return { path: 'src/components/GuestStats.tsx', content: generateGuestStats({}), language: 'typescript' };
      case 'guest-table':
        return { path: 'src/components/GuestTable.tsx', content: this.generateEntityTableComponent('GuestTable', 'guest', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'party_size', label: 'Party Size' },
      { key: 'dietary', label: 'Dietary' },
      { key: 'table', label: 'Table' },
      { key: 'rsvp_status', label: 'RSVP', type: 'status' },
    ], 'guests'), language: 'typescript' };
      case 'guest-form':
        return { path: 'src/components/GuestForm.tsx', content: this.generatePublicFormComponent('GuestForm', 'guest', [
      { key: 'name', label: 'Guest Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'party_size', label: 'Party Size', type: 'number', required: true },
      { key: 'side', label: 'Side', type: 'select', required: true },
      { key: 'dietary', label: 'Dietary Restrictions', type: 'text', required: false },
    ], 'guests'), language: 'typescript' };
      case 'vendor-grid-wedding':
        return { path: 'src/components/VendorGridWedding.tsx', content: this.generateEntityGridComponent('VendorGridWedding', 'vendor', { title: 'name', subtitle: 'category', badge: 'price', image: 'image' }, 'vendors'), language: 'typescript' };
      case 'vendor-detail-wedding':
        return { path: 'src/components/VendorDetailWedding.tsx', content: this.generateEntityDetailComponent('VendorDetailWedding', 'vendor', [
      { key: 'name', label: 'Vendor Name', type: 'text', icon: 'Building' },
      { key: 'category', label: 'Category', type: 'badge', icon: 'Tag' },
      { key: 'contact_name', label: 'Contact', type: 'text', icon: 'User' },
      { key: 'phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'email', label: 'Email', type: 'email', icon: 'Mail' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', type: 'status', icon: 'CheckCircle' },
    ], 'vendors'), language: 'typescript' };
      case 'task-board-wedding':
        return { path: 'src/components/TaskBoardWedding.tsx', content: generateTaskBoardWedding({}), language: 'typescript' };
      case 'budget-summary-wedding':
        return { path: 'src/components/BudgetSummaryWedding.tsx', content: generateBudgetSummaryWedding({}), language: 'typescript' };
      case 'budget-table-wedding':
        return { path: 'src/components/BudgetTableWedding.tsx', content: this.generateEntityTableComponent('BudgetTableWedding', 'budget_item', [
      { key: 'category', label: 'Category' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'estimated', label: 'Estimated', type: 'currency' },
      { key: 'actual', label: 'Actual', type: 'currency' },
      { key: 'paid', label: 'Paid', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'budget'), language: 'typescript' };
      case 'wedding-timeline':
        return { path: 'src/components/WeddingTimeline.tsx', content: generateWeddingTimeline({}), language: 'typescript' };
      case 'seating-chart':
        return { path: 'src/components/SeatingChart.tsx', content: this.generateEntityGridComponent('SeatingChart', 'table', { title: 'name', subtitle: 'guests', badge: 'capacity', image: 'layout' }, 'tables'), language: 'typescript' };
      case 'rsvp-form':
        return { path: 'src/components/RsvpForm.tsx', content: this.generatePublicFormComponent('RsvpForm', 'rsvp', [
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'attending', label: 'Will You Attend?', type: 'select', required: true },
      { key: 'party_size', label: 'Number of Guests', type: 'number', required: true },
      { key: 'dietary', label: 'Dietary Restrictions', type: 'text', required: false },
      { key: 'message', label: 'Message to the Couple', type: 'textarea', required: false },
    ], 'rsvp'), language: 'typescript' };

      // Car Rental Components
      case 'rental-stats':
        return { path: 'src/components/RentalStats.tsx', content: generateRentalStats({}), language: 'typescript' };
      case 'fleet-status':
        return { path: 'src/components/FleetStatus.tsx', content: this.generateEntityTableComponent('FleetStatus', 'vehicle', [
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'license_plate', label: 'License Plate' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Fleet Status', showStatus: true }), language: 'typescript' };
      case 'active-rentals':
        return { path: 'src/components/ActiveRentals.tsx', content: this.generateEntityTableComponent('ActiveRentals', 'rental', [
      { key: 'customer_name', label: 'Customer' },
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
    ], { title: 'Active Rentals', emptyMessage: 'No active rentals', filterStatus: 'active' }), language: 'typescript' };
      case 'vehicle-filters':
        return { path: 'src/components/VehicleFilters.tsx', content: generateVehicleFilters({}), language: 'typescript' };
      case 'vehicle-grid-rental':
        return { path: 'src/components/VehicleGridRental.tsx', content: this.generateEntityTableComponent('VehicleGridRental', 'vehicle', [
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'year', label: 'Year' },
      { key: 'daily_rate', label: 'Daily Rate', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Vehicles', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'vehicle-detail-rental':
        return { path: 'src/components/VehicleDetailRental.tsx', content: this.generateEntityDetailComponent('VehicleDetailRental', 'vehicle', [
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'year', label: 'Year' },
      { key: 'license_plate', label: 'License Plate' },
      { key: 'vin', label: 'VIN' },
      { key: 'color', label: 'Color' },
      { key: 'mileage', label: 'Mileage' },
      { key: 'fuel_type', label: 'Fuel Type' },
      { key: 'transmission', label: 'Transmission' },
      { key: 'daily_rate', label: 'Daily Rate', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'vehicle-history':
        return { path: 'src/components/VehicleHistory.tsx', content: generateVehicleHistory({}), language: 'typescript' };
      case 'booking-filters-rental':
        return { path: 'src/components/BookingFiltersRental.tsx', content: generateBookingFiltersRental({}), language: 'typescript' };
      case 'booking-table-rental':
        return { path: 'src/components/BookingTableRental.tsx', content: this.generateEntityTableComponent('BookingTableRental', 'booking', [
      { key: 'booking_number', label: 'Booking #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'pickup_date', label: 'Pickup', type: 'date' },
      { key: 'return_date', label: 'Return', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'booking-detail-rental':
        return { path: 'src/components/BookingDetailRental.tsx', content: this.generateEntityDetailComponent('BookingDetailRental', 'booking', [
      { key: 'booking_number', label: 'Booking Number' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'customer_phone', label: 'Phone' },
      { key: 'customer_email', label: 'Email' },
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'pickup_location', label: 'Pickup Location' },
      { key: 'return_location', label: 'Return Location' },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date' },
      { key: 'return_date', label: 'Return Date', type: 'date' },
      { key: 'daily_rate', label: 'Daily Rate', type: 'currency' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'customer-table-rental':
        return { path: 'src/components/CustomerTableRental.tsx', content: this.generateEntityTableComponent('CustomerTableRental', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'license_number', label: 'License #' },
      { key: 'total_rentals', label: 'Total Rentals' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'customer-profile-rental':
        return { path: 'src/components/CustomerProfileRental.tsx', content: generateCustomerProfileRental({}), language: 'typescript' };
      case 'customer-rentals':
        return { path: 'src/components/CustomerRentals.tsx', content: this.generateEntityTableComponent('CustomerRentals', 'rental', [
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Rental History', emptyMessage: 'No rentals found' }), language: 'typescript' };
      case 'location-grid-rental':
        return { path: 'src/components/LocationGridRental.tsx', content: this.generateEntityTableComponent('LocationGridRental', 'location', [
      { key: 'name', label: 'Location Name' },
      { key: 'address', label: 'Address' },
      { key: 'phone', label: 'Phone' },
      { key: 'hours', label: 'Hours' },
      { key: 'vehicle_count', label: 'Vehicles' },
    ], { title: 'Rental Locations' }), language: 'typescript' };
      case 'rental-search':
        return { path: 'src/components/RentalSearch.tsx', content: this.generatePublicFormComponent('RentalSearch', 'search', [
      { key: 'pickup_location', label: 'Pickup Location', type: 'text', required: true },
      { key: 'return_location', label: 'Return Location', type: 'text', required: false },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date', required: true },
      { key: 'pickup_time', label: 'Pickup Time', type: 'time', required: true },
      { key: 'return_date', label: 'Return Date', type: 'date', required: true },
      { key: 'return_time', label: 'Return Time', type: 'time', required: true },
      { key: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['any', 'sedan', 'suv', 'truck', 'van', 'convertible', 'luxury'], required: false },
    ], 'search'), language: 'typescript' };
      case 'available-vehicles':
        return { path: 'src/components/AvailableVehicles.tsx', content: this.generateEntityTableComponent('AvailableVehicles', 'vehicle', [
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'year', label: 'Year' },
      { key: 'seats', label: 'Seats' },
      { key: 'transmission', label: 'Transmission' },
      { key: 'daily_rate', label: 'Daily Rate', type: 'currency' },
    ], { title: 'Available Vehicles', showImage: true, imageKey: 'image', filterStatus: 'available' }), language: 'typescript' };

      // Hotel Management Components
      case 'hotel-stats':
        return { path: 'src/components/HotelStats.tsx', content: generateHotelStats({}), language: 'typescript' };
      case 'room-status-grid':
        return { path: 'src/components/RoomStatusGrid.tsx', content: this.generateEntityTableComponent('RoomStatusGrid', 'room', [
      { key: 'room_number', label: 'Room' },
      { key: 'type', label: 'Type' },
      { key: 'floor', label: 'Floor' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Room Status', showStatus: true, gridCols: 4 }), language: 'typescript' };
      case 'arrivals-list':
        return { path: 'src/components/ArrivalsList.tsx', content: this.generateEntityTableComponent('ArrivalsList', 'reservation', [
      { key: 'guest_name', label: 'Guest' },
      { key: 'room_number', label: 'Room' },
      { key: 'check_in_time', label: 'Check-in Time' },
      { key: 'nights', label: 'Nights' },
    ], { title: 'Today\'s Arrivals', emptyMessage: 'No arrivals today', filterDate: 'today' }), language: 'typescript' };
      case 'room-filters-hotel':
        return { path: 'src/components/RoomFiltersHotel.tsx', content: generateRoomFiltersHotel({}), language: 'typescript' };
      case 'room-grid-hotel':
        return { path: 'src/components/RoomGridHotel.tsx', content: this.generateEntityTableComponent('RoomGridHotel', 'room', [
      { key: 'room_number', label: 'Room #' },
      { key: 'type', label: 'Type' },
      { key: 'beds', label: 'Beds' },
      { key: 'max_occupancy', label: 'Max Guests' },
      { key: 'rate', label: 'Rate/Night', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Hotel Rooms', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'room-detail-hotel':
        return { path: 'src/components/RoomDetailHotel.tsx', content: this.generateEntityDetailComponent('RoomDetailHotel', 'room', [
      { key: 'room_number', label: 'Room Number' },
      { key: 'type', label: 'Room Type' },
      { key: 'floor', label: 'Floor' },
      { key: 'beds', label: 'Bed Configuration' },
      { key: 'max_occupancy', label: 'Max Occupancy' },
      { key: 'amenities', label: 'Amenities' },
      { key: 'rate', label: 'Nightly Rate', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'room-calendar':
        return { path: 'src/components/RoomCalendar.tsx', content: generateRoomCalendar({}), language: 'typescript' };
      case 'reservation-calendar':
        return { path: 'src/components/ReservationCalendar.tsx', content: generateReservationCalendar({}), language: 'typescript' };
      case 'reservation-form-hotel':
        return { path: 'src/components/ReservationFormHotel.tsx', content: this.generatePublicFormComponent('ReservationFormHotel', 'reservation', [
      { key: 'guest_name', label: 'Guest Name', type: 'text', required: true },
      { key: 'guest_email', label: 'Email', type: 'email', required: true },
      { key: 'guest_phone', label: 'Phone', type: 'tel', required: true },
      { key: 'room_type', label: 'Room Type', type: 'select', options: ['standard', 'deluxe', 'suite'], required: true },
      { key: 'check_in', label: 'Check-in Date', type: 'date', required: true },
      { key: 'check_out', label: 'Check-out Date', type: 'date', required: true },
      { key: 'guests', label: 'Number of Guests', type: 'number', required: true },
      { key: 'special_requests', label: 'Special Requests', type: 'textarea', required: false },
    ], 'reservation'), language: 'typescript' };
      case 'reservation-detail-hotel':
        return { path: 'src/components/ReservationDetailHotel.tsx', content: this.generateEntityDetailComponent('ReservationDetailHotel', 'reservation', [
      { key: 'confirmation_number', label: 'Confirmation #' },
      { key: 'guest_name', label: 'Guest Name' },
      { key: 'guest_email', label: 'Email' },
      { key: 'guest_phone', label: 'Phone' },
      { key: 'room_number', label: 'Room' },
      { key: 'room_type', label: 'Room Type' },
      { key: 'check_in', label: 'Check-in', type: 'date' },
      { key: 'check_out', label: 'Check-out', type: 'date' },
      { key: 'guests', label: 'Guests' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'guest-table-hotel':
        return { path: 'src/components/GuestTableHotel.tsx', content: this.generateEntityTableComponent('GuestTableHotel', 'guest', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_stays', label: 'Total Stays' },
      { key: 'loyalty_tier', label: 'Loyalty Tier' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'guest-profile-hotel':
        return { path: 'src/components/GuestProfileHotel.tsx', content: generateGuestProfileHotel({}), language: 'typescript' };
      case 'guest-reservations':
        return { path: 'src/components/GuestReservations.tsx', content: this.generateEntityTableComponent('GuestReservations', 'reservation', [
      { key: 'confirmation_number', label: 'Confirmation #' },
      { key: 'room_number', label: 'Room' },
      { key: 'check_in', label: 'Check-in', type: 'date' },
      { key: 'check_out', label: 'Check-out', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Reservation History', emptyMessage: 'No reservations found' }), language: 'typescript' };
      case 'housekeeping-board':
        return { path: 'src/components/HousekeepingBoard.tsx', content: generateHousekeepingBoard({}), language: 'typescript' };
      case 'hotel-booking-search':
        return { path: 'src/components/HotelBookingSearch.tsx', content: this.generatePublicFormComponent('HotelBookingSearch', 'search', [
      { key: 'check_in', label: 'Check-in Date', type: 'date', required: true },
      { key: 'check_out', label: 'Check-out Date', type: 'date', required: true },
      { key: 'guests', label: 'Guests', type: 'number', required: true },
      { key: 'rooms', label: 'Rooms', type: 'number', required: true },
      { key: 'room_type', label: 'Room Type', type: 'select', options: ['any', 'standard', 'deluxe', 'suite'], required: false },
    ], 'search'), language: 'typescript' };
      case 'available-rooms':
        return { path: 'src/components/AvailableRooms.tsx', content: this.generateEntityTableComponent('AvailableRooms', 'room', [
      { key: 'type', label: 'Room Type' },
      { key: 'beds', label: 'Beds' },
      { key: 'max_occupancy', label: 'Max Guests' },
      { key: 'amenities', label: 'Amenities' },
      { key: 'rate', label: 'Rate/Night', type: 'currency' },
    ], { title: 'Available Rooms', showImage: true, imageKey: 'image', filterStatus: 'available' }), language: 'typescript' };

      // Spa/Wellness Components
      case 'spa-stats':
        return { path: 'src/components/SpaStats.tsx', content: generateSpaStats({}), language: 'typescript' };
      case 'spa-schedule':
        return { path: 'src/components/SpaSchedule.tsx', content: generateSpaSchedule({}), language: 'typescript' };
      case 'therapist-availability':
        return { path: 'src/components/TherapistAvailability.tsx', content: this.generateEntityTableComponent('TherapistAvailability', 'therapist', [
      { key: 'name', label: 'Therapist' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'next_available', label: 'Next Available' },
    ], { title: 'Therapist Availability', showStatus: true }), language: 'typescript' };
      case 'appointment-calendar-spa':
        return { path: 'src/components/AppointmentCalendarSpa.tsx', content: generateAppointmentCalendarSpa({}), language: 'typescript' };
      case 'appointment-form-spa':
        return { path: 'src/components/AppointmentFormSpa.tsx', content: this.generatePublicFormComponent('AppointmentFormSpa', 'appointment', [
      { key: 'client_name', label: 'Your Name', type: 'text', required: true },
      { key: 'client_email', label: 'Email', type: 'email', required: true },
      { key: 'client_phone', label: 'Phone', type: 'tel', required: true },
      { key: 'service', label: 'Service', type: 'select', options: ['massage', 'facial', 'body_treatment', 'manicure', 'pedicure'], required: true },
      { key: 'therapist', label: 'Preferred Therapist', type: 'select', options: ['any', 'therapist1', 'therapist2'], required: false },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'time', label: 'Preferred Time', type: 'time', required: true },
      { key: 'notes', label: 'Special Requests', type: 'textarea', required: false },
    ], 'appointment'), language: 'typescript' };
      case 'service-grid-spa':
        return { path: 'src/components/ServiceGridSpa.tsx', content: this.generateEntityTableComponent('ServiceGridSpa', 'service', [
      { key: 'name', label: 'Service' },
      { key: 'category', label: 'Category' },
      { key: 'duration', label: 'Duration' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Spa Services', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'therapist-grid-spa':
        return { path: 'src/components/TherapistGridSpa.tsx', content: this.generateEntityTableComponent('TherapistGridSpa', 'therapist', [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'experience', label: 'Experience' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Our Therapists', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'therapist-profile-spa':
        return { path: 'src/components/TherapistProfileSpa.tsx', content: generateTherapistProfileSpa({}), language: 'typescript' };
      case 'therapist-schedule':
        return { path: 'src/components/TherapistSchedule.tsx', content: generateTherapistSchedule({}), language: 'typescript' };
      case 'client-table-spa':
        return { path: 'src/components/ClientTableSpa.tsx', content: this.generateEntityTableComponent('ClientTableSpa', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_visits', label: 'Total Visits' },
      { key: 'last_visit', label: 'Last Visit', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'client-profile-spa':
        return { path: 'src/components/ClientProfileSpa.tsx', content: generateClientProfileSpa({}), language: 'typescript' };
      case 'client-history-spa':
        return { path: 'src/components/ClientHistorySpa.tsx', content: this.generateEntityTableComponent('ClientHistorySpa', 'appointment', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'service', label: 'Service' },
      { key: 'therapist', label: 'Therapist' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Visit History', emptyMessage: 'No visit history' }), language: 'typescript' };
      case 'package-grid-spa':
        return { path: 'src/components/PackageGridSpa.tsx', content: this.generateEntityTableComponent('PackageGridSpa', 'package', [
      { key: 'name', label: 'Package Name' },
      { key: 'services', label: 'Includes' },
      { key: 'duration', label: 'Total Duration' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'savings', label: 'Savings', type: 'currency' },
    ], { title: 'Spa Packages', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'service-menu':
        return { path: 'src/components/ServiceMenu.tsx', content: this.generateEntityTableComponent('ServiceMenu', 'service', [
      { key: 'name', label: 'Service' },
      { key: 'description', label: 'Description' },
      { key: 'duration', label: 'Duration' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Our Services', showImage: true, imageKey: 'image', groupBy: 'category' }), language: 'typescript' };
      case 'spa-booking-form':
        return { path: 'src/components/SpaBookingForm.tsx', content: this.generatePublicFormComponent('SpaBookingForm', 'booking', [
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'service', label: 'Service', type: 'select', options: ['massage', 'facial', 'body_wrap', 'manicure', 'pedicure', 'package'], required: true },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'time', label: 'Preferred Time', type: 'select', options: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'], required: true },
      { key: 'notes', label: 'Special Requests', type: 'textarea', required: false },
    ], 'booking'), language: 'typescript' };

      // Dental/Clinic Components
      case 'dental-stats':
        return { path: 'src/components/DentalStats.tsx', content: generateDentalStats({}), language: 'typescript' };
      case 'appointment-list-dental':
        return { path: 'src/components/AppointmentListDental.tsx', content: this.generateEntityTableComponent('AppointmentListDental', 'appointment', [
      { key: 'patient_name', label: 'Patient' },
      { key: 'time', label: 'Time' },
      { key: 'treatment', label: 'Treatment' },
      { key: 'dentist', label: 'Dentist' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Today\'s Appointments', emptyMessage: 'No appointments today' }), language: 'typescript' };
      case 'dentist-schedule-overview':
        return { path: 'src/components/DentistScheduleOverview.tsx', content: this.generateEntityTableComponent('DentistScheduleOverview', 'dentist', [
      { key: 'name', label: 'Dentist' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'appointments_today', label: 'Today' },
      { key: 'next_available', label: 'Next Slot' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Dentist Schedule', showStatus: true }), language: 'typescript' };
      case 'appointment-calendar-dental':
        return { path: 'src/components/AppointmentCalendarDental.tsx', content: generateAppointmentCalendarDental({}), language: 'typescript' };
      case 'appointment-form-dental':
        return { path: 'src/components/AppointmentFormDental.tsx', content: this.generatePublicFormComponent('AppointmentFormDental', 'appointment', [
      { key: 'patient_name', label: 'Patient Name', type: 'text', required: true },
      { key: 'patient_email', label: 'Email', type: 'email', required: true },
      { key: 'patient_phone', label: 'Phone', type: 'tel', required: true },
      { key: 'treatment', label: 'Treatment Type', type: 'select', options: ['checkup', 'cleaning', 'filling', 'extraction', 'root_canal', 'crown', 'other'], required: true },
      { key: 'dentist', label: 'Preferred Dentist', type: 'select', options: ['any', 'dr_smith', 'dr_jones'], required: false },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'time', label: 'Preferred Time', type: 'time', required: true },
      { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
    ], 'appointment'), language: 'typescript' };
      case 'patient-filters':
        return { path: 'src/components/PatientFilters.tsx', content: generatePatientFilters({}), language: 'typescript' };
      case 'patient-table-dental':
        return { path: 'src/components/PatientTableDental.tsx', content: this.generateEntityTableComponent('PatientTableDental', 'patient', [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'last_visit', label: 'Last Visit', type: 'date' },
      { key: 'next_appointment', label: 'Next Appt', type: 'date' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'patient-profile-dental':
        return { path: 'src/components/PatientProfileDental.tsx', content: generatePatientProfileDental({}), language: 'typescript' };
      case 'dental-chart':
        return { path: 'src/components/DentalChart.tsx', content: this.generateEntityDetailComponent('DentalChart', 'chart', [
      { key: 'patient_name', label: 'Patient' },
      { key: 'last_updated', label: 'Last Updated', type: 'date' },
      { key: 'teeth_status', label: 'Teeth Status' },
      { key: 'notes', label: 'Clinical Notes' },
    ]), language: 'typescript' };
      case 'treatment-history':
        return { path: 'src/components/TreatmentHistory.tsx', content: generateTreatmentHistory({}), language: 'typescript' };
      case 'treatment-catalog':
        return { path: 'src/components/TreatmentCatalog.tsx', content: this.generateEntityTableComponent('TreatmentCatalog', 'treatment', [
      { key: 'name', label: 'Treatment' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'duration', label: 'Duration' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Treatment Catalog', groupBy: 'category' }), language: 'typescript' };
      case 'dentist-grid':
        return { path: 'src/components/DentistGrid.tsx', content: this.generateEntityTableComponent('DentistGrid', 'dentist', [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'experience', label: 'Experience' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Our Dentists', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'dentist-profile':
        return { path: 'src/components/DentistProfile.tsx', content: generateDentistProfile({}), language: 'typescript' };
      case 'dentist-schedule':
        return { path: 'src/components/DentistSchedule.tsx', content: generateDentistSchedule({}), language: 'typescript' };
      case 'billing-stats-dental':
        return { path: 'src/components/BillingStatsDental.tsx', content: generateBillingStatsDental({}), language: 'typescript' };
      case 'invoice-table-dental':
        return { path: 'src/components/InvoiceTableDental.tsx', content: this.generateEntityTableComponent('InvoiceTableDental', 'invoice', [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'patient_name', label: 'Patient' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'treatment', label: 'Treatment' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'insurance_portion', label: 'Insurance', type: 'currency' },
      { key: 'patient_portion', label: 'Patient Due', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'online-booking-dental':
        return { path: 'src/components/OnlineBookingDental.tsx', content: this.generatePublicFormComponent('OnlineBookingDental', 'appointment', [
      { key: 'name', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
      { key: 'is_new_patient', label: 'Are you a new patient?', type: 'select', options: ['yes', 'no'], required: true },
      { key: 'reason', label: 'Reason for Visit', type: 'select', options: ['checkup', 'cleaning', 'pain', 'cosmetic', 'emergency', 'other'], required: true },
      { key: 'preferred_date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'preferred_time', label: 'Preferred Time', type: 'select', options: ['morning', 'afternoon', 'evening'], required: true },
      { key: 'insurance', label: 'Insurance Provider', type: 'text', required: false },
      { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
    ], 'booking'), language: 'typescript' };

      // Tutoring Components
      case 'tutoring-stats':
        return { path: 'src/components/TutoringStats.tsx', content: generateTutoringStats({}), language: 'typescript' };
      case 'session-list-tutoring':
        return { path: 'src/components/SessionListTutoring.tsx', content: this.generateEntityTableComponent('SessionListTutoring', 'session', [
      { key: 'student_name', label: 'Student' },
      { key: 'subject', label: 'Subject' },
      { key: 'time', label: 'Time' },
      { key: 'duration', label: 'Duration' },
      { key: 'tutor', label: 'Tutor' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Today\'s Sessions', emptyMessage: 'No sessions scheduled' }), language: 'typescript' };
      case 'tutor-availability-overview':
        return { path: 'src/components/TutorAvailabilityOverview.tsx', content: this.generateEntityTableComponent('TutorAvailabilityOverview', 'tutor', [
      { key: 'name', label: 'Tutor' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'next_available', label: 'Next Available' },
    ], { title: 'Tutor Availability', showStatus: true }), language: 'typescript' };
      case 'session-calendar':
        return { path: 'src/components/SessionCalendar.tsx', content: generateSessionCalendar({}), language: 'typescript' };
      case 'session-detail-tutoring':
        return { path: 'src/components/SessionDetailTutoring.tsx', content: this.generateEntityDetailComponent('SessionDetailTutoring', 'session', [
      { key: 'student_name', label: 'Student' },
      { key: 'tutor_name', label: 'Tutor' },
      { key: 'subject', label: 'Subject' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'duration', label: 'Duration' },
      { key: 'location', label: 'Location' },
      { key: 'notes', label: 'Session Notes' },
      { key: 'homework', label: 'Homework Assigned' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'tutor-filters':
        return { path: 'src/components/TutorFilters.tsx', content: generateTutorFilters({}), language: 'typescript' };
      case 'tutor-grid':
        return { path: 'src/components/TutorGrid.tsx', content: this.generateEntityTableComponent('TutorGrid', 'tutor', [
      { key: 'name', label: 'Name' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'rating', label: 'Rating' },
      { key: 'hourly_rate', label: 'Rate/Hour', type: 'currency' },
      { key: 'sessions_completed', label: 'Sessions' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Our Tutors', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'tutor-profile':
        return { path: 'src/components/TutorProfile.tsx', content: generateTutorProfile({}), language: 'typescript' };
      case 'tutor-reviews':
        return { path: 'src/components/TutorReviews.tsx', content: this.generateEntityTableComponent('TutorReviews', 'review', [
      { key: 'student_name', label: 'Student' },
      { key: 'rating', label: 'Rating' },
      { key: 'comment', label: 'Review' },
      { key: 'date', label: 'Date', type: 'date' },
    ], { title: 'Reviews', emptyMessage: 'No reviews yet' }), language: 'typescript' };
      case 'tutor-schedule':
        return { path: 'src/components/TutorSchedule.tsx', content: generateTutorSchedule({}), language: 'typescript' };
      case 'student-table-tutoring':
        return { path: 'src/components/StudentTableTutoring.tsx', content: this.generateEntityTableComponent('StudentTableTutoring', 'student', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'tutor', label: 'Primary Tutor' },
      { key: 'sessions_completed', label: 'Sessions' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'student-profile-tutoring':
        return { path: 'src/components/StudentProfileTutoring.tsx', content: generateStudentProfileTutoring({}), language: 'typescript' };
      case 'student-progress':
        return { path: 'src/components/StudentProgress.tsx', content: generateStudentProgress({}), language: 'typescript' };
      case 'subject-grid':
        return { path: 'src/components/SubjectGrid.tsx', content: this.generateEntityTableComponent('SubjectGrid', 'subject', [
      { key: 'name', label: 'Subject' },
      { key: 'category', label: 'Category' },
      { key: 'tutors_available', label: 'Tutors Available' },
      { key: 'starting_rate', label: 'Starting Rate', type: 'currency' },
    ], { title: 'Subjects', showImage: true, imageKey: 'icon' }), language: 'typescript' };
      case 'tutor-search':
        return { path: 'src/components/TutorSearch.tsx', content: this.generatePublicFormComponent('TutorSearch', 'search', [
      { key: 'subject', label: 'Subject', type: 'select', options: ['math', 'science', 'english', 'history', 'language', 'test_prep', 'other'], required: true },
      { key: 'level', label: 'Grade Level', type: 'select', options: ['elementary', 'middle_school', 'high_school', 'college'], required: true },
      { key: 'availability', label: 'Preferred Time', type: 'select', options: ['weekday_morning', 'weekday_afternoon', 'weekday_evening', 'weekend'], required: false },
      { key: 'format', label: 'Session Format', type: 'select', options: ['in_person', 'online', 'both'], required: false },
    ], 'search'), language: 'typescript' };
      case 'tutor-results':
        return { path: 'src/components/TutorResults.tsx', content: this.generateEntityTableComponent('TutorResults', 'tutor', [
      { key: 'name', label: 'Name' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'rating', label: 'Rating' },
      { key: 'reviews_count', label: 'Reviews' },
      { key: 'hourly_rate', label: 'Rate/Hour', type: 'currency' },
      { key: 'availability', label: 'Availability' },
    ], { title: 'Available Tutors', showImage: true, imageKey: 'photo' }), language: 'typescript' };

      // Music School Components
      case 'music-school-stats':
        return { path: 'src/components/MusicSchoolStats.tsx', content: generateMusicSchoolStats({}), language: 'typescript' };
      case 'lesson-list-music':
        return { path: 'src/components/LessonListMusic.tsx', content: this.generateEntityTableComponent('LessonListMusic', 'lesson', [
      { key: 'student_name', label: 'Student' },
      { key: 'instrument', label: 'Instrument' },
      { key: 'time', label: 'Time' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Today\'s Lessons', emptyMessage: 'No lessons scheduled' }), language: 'typescript' };
      case 'recital-list':
        return { path: 'src/components/RecitalList.tsx', content: this.generateEntityTableComponent('RecitalList', 'recital', [
      { key: 'name', label: 'Recital' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'venue', label: 'Venue' },
      { key: 'performers', label: 'Performers' },
    ], { title: 'Upcoming Recitals', emptyMessage: 'No upcoming recitals' }), language: 'typescript' };
      case 'student-table-music':
        return { path: 'src/components/StudentTableMusic.tsx', content: this.generateEntityTableComponent('StudentTableMusic', 'student', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'instrument', label: 'Instrument' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'level', label: 'Level' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'student-profile-music':
        return { path: 'src/components/StudentProfileMusic.tsx', content: generateStudentProfileMusic({}), language: 'typescript' };
      case 'student-lessons':
        return { path: 'src/components/StudentLessons.tsx', content: this.generateEntityTableComponent('StudentLessons', 'lesson', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'duration', label: 'Duration' },
      { key: 'topic', label: 'Topic Covered' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Lesson History', emptyMessage: 'No lessons yet' }), language: 'typescript' };
      case 'student-progress-music':
        return { path: 'src/components/StudentProgressMusic.tsx', content: generateStudentProgressMusic({}), language: 'typescript' };
      case 'instructor-grid-music':
        return { path: 'src/components/InstructorGridMusic.tsx', content: this.generateEntityTableComponent('InstructorGridMusic', 'instructor', [
      { key: 'name', label: 'Name' },
      { key: 'instruments', label: 'Instruments' },
      { key: 'experience', label: 'Experience' },
      { key: 'students', label: 'Students' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Our Instructors', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'instructor-profile-music':
        return { path: 'src/components/InstructorProfileMusic.tsx', content: generateInstructorProfileMusic({}), language: 'typescript' };
      case 'instructor-schedule-music':
        return { path: 'src/components/InstructorScheduleMusic.tsx', content: generateInstructorScheduleMusic({}), language: 'typescript' };
      case 'lesson-calendar-music':
        return { path: 'src/components/LessonCalendarMusic.tsx', content: generateLessonCalendarMusic({}), language: 'typescript' };
      case 'instrument-grid':
        return { path: 'src/components/InstrumentGrid.tsx', content: this.generateEntityTableComponent('InstrumentGrid', 'instrument', [
      { key: 'name', label: 'Instrument' },
      { key: 'category', label: 'Category' },
      { key: 'instructors', label: 'Instructors' },
      { key: 'students', label: 'Students' },
    ], { title: 'Instruments', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'recital-list-full':
        return { path: 'src/components/RecitalListFull.tsx', content: this.generateEntityTableComponent('RecitalListFull', 'recital', [
      { key: 'name', label: 'Recital Name' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'venue', label: 'Venue' },
      { key: 'performers', label: 'Performers' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'recital-detail':
        return { path: 'src/components/RecitalDetail.tsx', content: this.generateEntityDetailComponent('RecitalDetail', 'recital', [
      { key: 'name', label: 'Recital Name' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'venue', label: 'Venue' },
      { key: 'description', label: 'Description' },
      { key: 'dress_code', label: 'Dress Code' },
      { key: 'admission', label: 'Admission' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'recital-performers':
        return { path: 'src/components/RecitalPerformers.tsx', content: this.generateEntityTableComponent('RecitalPerformers', 'performer', [
      { key: 'student_name', label: 'Performer' },
      { key: 'instrument', label: 'Instrument' },
      { key: 'piece', label: 'Musical Piece' },
      { key: 'order', label: 'Order' },
    ], { title: 'Performance Lineup', emptyMessage: 'No performers assigned' }), language: 'typescript' };
      case 'enrollment-form-music':
        return { path: 'src/components/EnrollmentFormMusic.tsx', content: this.generatePublicFormComponent('EnrollmentFormMusic', 'enrollment', [
      { key: 'student_name', label: 'Student Name', type: 'text', required: true },
      { key: 'student_age', label: 'Age', type: 'number', required: true },
      { key: 'parent_name', label: 'Parent/Guardian Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'instrument', label: 'Instrument', type: 'select', options: ['piano', 'guitar', 'violin', 'drums', 'voice', 'other'], required: true },
      { key: 'experience', label: 'Prior Experience', type: 'select', options: ['none', 'beginner', 'intermediate', 'advanced'], required: true },
      { key: 'preferred_day', label: 'Preferred Day', type: 'select', options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], required: true },
      { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
    ], 'enrollment'), language: 'typescript' };

      // Dance Studio Components
      case 'dance-studio-stats':
        return { path: 'src/components/DanceStudioStats.tsx', content: generateDanceStudioStatsView({}), language: 'typescript' };
      case 'class-list-dance':
        return { path: 'src/components/ClassListDance.tsx', content: this.generateEntityTableComponent('ClassListDance', 'class', [
      { key: 'name', label: 'Class' },
      { key: 'style', label: 'Style' },
      { key: 'time', label: 'Time' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'enrolled', label: 'Enrolled' },
    ], { title: 'Today\'s Classes', emptyMessage: 'No classes today' }), language: 'typescript' };
      case 'performance-list':
        return { path: 'src/components/PerformanceList.tsx', content: this.generateEntityTableComponent('PerformanceList', 'performance', [
      { key: 'name', label: 'Performance' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'venue', label: 'Venue' },
      { key: 'style', label: 'Style' },
    ], { title: 'Upcoming Performances', emptyMessage: 'No upcoming performances' }), language: 'typescript' };
      case 'class-filters-dance':
        return { path: 'src/components/ClassFiltersDance.tsx', content: generateClassFiltersDance({}), language: 'typescript' };
      case 'class-grid-dance':
        return { path: 'src/components/ClassGridDance.tsx', content: this.generateEntityTableComponent('ClassGridDance', 'class', [
      { key: 'name', label: 'Class Name' },
      { key: 'style', label: 'Style' },
      { key: 'level', label: 'Level' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'spots_available', label: 'Spots' },
    ], { title: 'Dance Classes', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'class-detail-dance':
        return { path: 'src/components/ClassDetailDance.tsx', content: this.generateEntityDetailComponent('ClassDetailDance', 'class', [
      { key: 'name', label: 'Class Name' },
      { key: 'style', label: 'Dance Style' },
      { key: 'level', label: 'Level' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'duration', label: 'Duration' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'description', label: 'Description' },
      { key: 'requirements', label: 'Requirements' },
    ]), language: 'typescript' };
      case 'class-roster':
        return { path: 'src/components/ClassRoster.tsx', content: this.generateEntityTableComponent('ClassRoster', 'enrollment', [
      { key: 'student_name', label: 'Student' },
      { key: 'enrolled_date', label: 'Enrolled', type: 'date' },
      { key: 'attendance', label: 'Attendance' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Class Roster', emptyMessage: 'No students enrolled' }), language: 'typescript' };
      case 'schedule-calendar-dance':
        return { path: 'src/components/ScheduleCalendarDance.tsx', content: generateScheduleCalendarDance({}), language: 'typescript' };
      case 'student-table-dance':
        return { path: 'src/components/StudentTableDance.tsx', content: this.generateEntityTableComponent('StudentTableDance', 'student', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'classes', label: 'Classes' },
      { key: 'level', label: 'Level' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'student-profile-dance':
        return { path: 'src/components/StudentProfileDance.tsx', content: generateStudentProfileDance({}), language: 'typescript' };
      case 'student-enrollments':
        return { path: 'src/components/StudentEnrollments.tsx', content: this.generateEntityTableComponent('StudentEnrollments', 'enrollment', [
      { key: 'class_name', label: 'Class' },
      { key: 'style', label: 'Style' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Enrolled Classes', emptyMessage: 'No enrollments' }), language: 'typescript' };
      case 'instructor-grid-dance':
        return { path: 'src/components/InstructorGridDance.tsx', content: this.generateEntityTableComponent('InstructorGridDance', 'instructor', [
      { key: 'name', label: 'Name' },
      { key: 'styles', label: 'Dance Styles' },
      { key: 'experience', label: 'Experience' },
      { key: 'classes', label: 'Classes' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Our Instructors', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'instructor-profile-dance':
        return { path: 'src/components/InstructorProfileDance.tsx', content: generateInstructorProfileDance({}), language: 'typescript' };
      case 'instructor-classes-dance':
        return { path: 'src/components/InstructorClassesDance.tsx', content: this.generateEntityTableComponent('InstructorClassesDance', 'class', [
      { key: 'name', label: 'Class' },
      { key: 'style', label: 'Style' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'enrolled', label: 'Enrolled' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'My Classes', emptyMessage: 'No classes assigned' }), language: 'typescript' };
      case 'performance-list-full':
        return { path: 'src/components/PerformanceListFull.tsx', content: this.generateEntityTableComponent('PerformanceListFull', 'performance', [
      { key: 'name', label: 'Performance' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'venue', label: 'Venue' },
      { key: 'style', label: 'Style' },
      { key: 'participants', label: 'Participants' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'class-browser-dance':
        return { path: 'src/components/ClassBrowserDance.tsx', content: this.generateEntityTableComponent('ClassBrowserDance', 'class', [
      { key: 'name', label: 'Class' },
      { key: 'style', label: 'Style' },
      { key: 'level', label: 'Level' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Browse Classes', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'registration-form-dance':
        return { path: 'src/components/RegistrationFormDance.tsx', content: this.generatePublicFormComponent('RegistrationFormDance', 'registration', [
      { key: 'student_name', label: 'Student Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'class_id', label: 'Class', type: 'select', options: ['ballet_beginner', 'jazz_intermediate', 'hip_hop_all'], required: true },
      { key: 'experience', label: 'Dance Experience', type: 'select', options: ['none', 'some', 'experienced'], required: true },
      { key: 'medical_notes', label: 'Medical Notes', type: 'textarea', required: false },
    ], 'registration'), language: 'typescript' };

      // Art Gallery Components
      case 'gallery-stats':
        return { path: 'src/components/GalleryStats.tsx', content: generateGalleryStats({}), language: 'typescript' };
      case 'exhibition-list':
        return { path: 'src/components/ExhibitionList.tsx', content: this.generateEntityTableComponent('ExhibitionList', 'exhibition', [
      { key: 'name', label: 'Exhibition' },
      { key: 'artist', label: 'Featured Artist' },
      { key: 'start_date', label: 'Opens', type: 'date' },
      { key: 'end_date', label: 'Closes', type: 'date' },
    ], { title: 'Current Exhibitions', emptyMessage: 'No current exhibitions' }), language: 'typescript' };
      case 'sales-list':
        return { path: 'src/components/SalesList.tsx', content: this.generateEntityTableComponent('SalesList', 'sale', [
      { key: 'artwork', label: 'Artwork' },
      { key: 'artist', label: 'Artist' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'date', label: 'Date', type: 'date' },
    ], { title: 'Recent Sales', emptyMessage: 'No recent sales' }), language: 'typescript' };
      case 'artwork-filters':
        return { path: 'src/components/ArtworkFilters.tsx', content: generateArtworkFilters({}), language: 'typescript' };
      case 'artwork-grid':
        return { path: 'src/components/ArtworkGrid.tsx', content: this.generateEntityTableComponent('ArtworkGrid', 'artwork', [
      { key: 'title', label: 'Title' },
      { key: 'artist', label: 'Artist' },
      { key: 'medium', label: 'Medium' },
      { key: 'year', label: 'Year' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Artworks', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'artwork-detail':
        return { path: 'src/components/ArtworkDetail.tsx', content: this.generateEntityDetailComponent('ArtworkDetail', 'artwork', [
      { key: 'title', label: 'Title' },
      { key: 'artist', label: 'Artist' },
      { key: 'year', label: 'Year' },
      { key: 'medium', label: 'Medium' },
      { key: 'dimensions', label: 'Dimensions' },
      { key: 'edition', label: 'Edition' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'description', label: 'Description' },
      { key: 'provenance', label: 'Provenance' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'artist-grid-gallery':
        return { path: 'src/components/ArtistGridGallery.tsx', content: this.generateEntityTableComponent('ArtistGridGallery', 'artist', [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'artworks', label: 'Artworks' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Gallery Artists', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'artist-profile-gallery':
        return { path: 'src/components/ArtistProfileGallery.tsx', content: generateArtistProfileGallery({}), language: 'typescript' };
      case 'artist-works':
        return { path: 'src/components/ArtistWorks.tsx', content: this.generateEntityTableComponent('ArtistWorks', 'artwork', [
      { key: 'title', label: 'Title' },
      { key: 'year', label: 'Year' },
      { key: 'medium', label: 'Medium' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Artworks', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'exhibition-grid':
        return { path: 'src/components/ExhibitionGrid.tsx', content: this.generateEntityTableComponent('ExhibitionGrid', 'exhibition', [
      { key: 'name', label: 'Exhibition' },
      { key: 'artist', label: 'Artist' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Exhibitions', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'exhibition-header':
        return { path: 'src/components/ExhibitionHeader.tsx', content: this.generateEntityDetailComponent('ExhibitionHeader', 'exhibition', [
      { key: 'name', label: 'Exhibition Name' },
      { key: 'artist', label: 'Featured Artist' },
      { key: 'start_date', label: 'Opening Date', type: 'date' },
      { key: 'end_date', label: 'Closing Date', type: 'date' },
      { key: 'description', label: 'Description' },
      { key: 'curator', label: 'Curator' },
    ]), language: 'typescript' };
      case 'exhibition-artworks':
        return { path: 'src/components/ExhibitionArtworks.tsx', content: this.generateEntityTableComponent('ExhibitionArtworks', 'artwork', [
      { key: 'title', label: 'Title' },
      { key: 'artist', label: 'Artist' },
      { key: 'medium', label: 'Medium' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Featured Works', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'sales-stats-gallery':
        return { path: 'src/components/SalesStatsGallery.tsx', content: generateSalesStatsGallery({}), language: 'typescript' };
      case 'sales-table':
        return { path: 'src/components/SalesTable.tsx', content: this.generateEntityTableComponent('SalesTable', 'sale', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'artwork', label: 'Artwork' },
      { key: 'artist', label: 'Artist' },
      { key: 'buyer', label: 'Buyer' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'commission', label: 'Commission', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'collection-grid':
        return { path: 'src/components/CollectionGrid.tsx', content: this.generateEntityTableComponent('CollectionGrid', 'collection', [
      { key: 'name', label: 'Collection' },
      { key: 'artist', label: 'Artist' },
      { key: 'artworks', label: 'Artworks' },
      { key: 'year', label: 'Year' },
    ], { title: 'Collections', showImage: true, imageKey: 'cover_image' }), language: 'typescript' };
      case 'public-gallery':
        return { path: 'src/components/PublicGallery.tsx', content: this.generateEntityTableComponent('PublicGallery', 'artwork', [
      { key: 'title', label: 'Title' },
      { key: 'artist', label: 'Artist' },
      { key: 'medium', label: 'Medium' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Gallery', showImage: true, imageKey: 'image', filterStatus: 'available' }), language: 'typescript' };

      // Library Components
      case 'library-stats':
        return { path: 'src/components/LibraryStats.tsx', content: generateLibraryStats({}), language: 'typescript' };
      case 'overdue-loans':
        return { path: 'src/components/OverdueLoans.tsx', content: this.generateEntityTableComponent('OverdueLoans', 'loan', [
      { key: 'book_title', label: 'Book' },
      { key: 'member_name', label: 'Member' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'days_overdue', label: 'Days Overdue' },
    ], { title: 'Overdue Items', emptyMessage: 'No overdue items', filterStatus: 'overdue' }), language: 'typescript' };
      case 'library-activity':
        return { path: 'src/components/LibraryActivity.tsx', content: generateLibraryActivity({}), language: 'typescript' };
      case 'book-search':
        return { path: 'src/components/BookSearch.tsx', content: generateBookSearch({}), language: 'typescript' };
      case 'book-grid':
        return { path: 'src/components/BookGrid.tsx', content: this.generateEntityTableComponent('BookGrid', 'book', [
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'category', label: 'Category' },
      { key: 'available_copies', label: 'Available' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Books', showImage: true, imageKey: 'cover' }), language: 'typescript' };
      case 'book-detail-library':
        return { path: 'src/components/BookDetailLibrary.tsx', content: this.generateEntityDetailComponent('BookDetailLibrary', 'book', [
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'isbn', label: 'ISBN' },
      { key: 'publisher', label: 'Publisher' },
      { key: 'year', label: 'Publication Year' },
      { key: 'category', label: 'Category' },
      { key: 'pages', label: 'Pages' },
      { key: 'description', label: 'Description' },
      { key: 'total_copies', label: 'Total Copies' },
      { key: 'available_copies', label: 'Available Copies' },
    ]), language: 'typescript' };
      case 'book-copies':
        return { path: 'src/components/BookCopies.tsx', content: this.generateEntityTableComponent('BookCopies', 'copy', [
      { key: 'copy_number', label: 'Copy #' },
      { key: 'condition', label: 'Condition' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Copies', emptyMessage: 'No copies available' }), language: 'typescript' };
      case 'member-table-library':
        return { path: 'src/components/MemberTableLibrary.tsx', content: this.generateEntityTableComponent('MemberTableLibrary', 'member', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'member_id', label: 'Member ID' },
      { key: 'active_loans', label: 'Active Loans' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'member-profile-library':
        return { path: 'src/components/MemberProfileLibrary.tsx', content: generateMemberProfileLibrary({}), language: 'typescript' };
      case 'member-loans':
        return { path: 'src/components/MemberLoans.tsx', content: this.generateEntityTableComponent('MemberLoans', 'loan', [
      { key: 'book_title', label: 'Book' },
      { key: 'checkout_date', label: 'Checked Out', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'return_date', label: 'Returned', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Loan History', emptyMessage: 'No loan history' }), language: 'typescript' };
      case 'loan-filters':
        return { path: 'src/components/LoanFilters.tsx', content: generateLoanFilters({}), language: 'typescript' };
      case 'loan-table':
        return { path: 'src/components/LoanTable.tsx', content: this.generateEntityTableComponent('LoanTable', 'loan', [
      { key: 'book_title', label: 'Book' },
      { key: 'member_name', label: 'Member' },
      { key: 'checkout_date', label: 'Checked Out', type: 'date' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'return_date', label: 'Returned', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'checkout-form-library':
        return { path: 'src/components/CheckoutFormLibrary.tsx', content: this.generatePublicFormComponent('CheckoutFormLibrary', 'checkout', [
      { key: 'member_id', label: 'Member ID', type: 'text', required: true },
      { key: 'book_barcode', label: 'Book Barcode', type: 'text', required: true },
      { key: 'due_date', label: 'Due Date', type: 'date', required: true },
    ], 'checkout'), language: 'typescript' };
      case 'return-form':
        return { path: 'src/components/ReturnForm.tsx', content: this.generatePublicFormComponent('ReturnForm', 'return', [
      { key: 'book_barcode', label: 'Book Barcode', type: 'text', required: true },
      { key: 'condition', label: 'Condition', type: 'select', options: ['good', 'damaged', 'lost'], required: true },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false },
    ], 'return'), language: 'typescript' };
      case 'reservation-table':
        return { path: 'src/components/ReservationTable.tsx', content: this.generateEntityTableComponent('ReservationTable', 'reservation', [
      { key: 'book_title', label: 'Book' },
      { key: 'member_name', label: 'Member' },
      { key: 'reserved_date', label: 'Reserved', type: 'date' },
      { key: 'expires', label: 'Expires', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'public-catalog':
        return { path: 'src/components/PublicCatalog.tsx', content: this.generateEntityTableComponent('PublicCatalog', 'book', [
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'category', label: 'Category' },
      { key: 'available', label: 'Available' },
    ], { title: 'Library Catalog', showImage: true, imageKey: 'cover' }), language: 'typescript' };

      // Laundry Service Components
      case 'laundry-stats':
        return { path: 'src/components/LaundryStats.tsx', content: generateLaundryStats({}), language: 'typescript' };
      case 'order-list-laundry':
        return { path: 'src/components/OrderListLaundry.tsx', content: this.generateEntityTableComponent('OrderListLaundry', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer', label: 'Customer' },
      { key: 'items', label: 'Items' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Active Orders', emptyMessage: 'No active orders' }), language: 'typescript' };
      case 'delivery-schedule':
        return { path: 'src/components/DeliverySchedule.tsx', content: generateDeliveryScheduleGeneric({}), language: 'typescript' };
      case 'order-filters-laundry':
        return { path: 'src/components/OrderFiltersLaundry.tsx', content: generateOrderFiltersLaundry({}), language: 'typescript' };
      case 'order-table-laundry':
        return { path: 'src/components/OrderTableLaundry.tsx', content: this.generateEntityTableComponent('OrderTableLaundry', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer', label: 'Customer' },
      { key: 'service', label: 'Service' },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'pickup_date', label: 'Pickup', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'order-detail-laundry':
        return { path: 'src/components/OrderDetailLaundry.tsx', content: this.generateEntityDetailComponent('OrderDetailLaundry', 'order', [
      { key: 'order_number', label: 'Order Number' },
      { key: 'customer', label: 'Customer' },
      { key: 'phone', label: 'Phone' },
      { key: 'service', label: 'Service Type' },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { key: 'notes', label: 'Special Instructions' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'order-timeline-laundry':
        return { path: 'src/components/OrderTimelineLaundry.tsx', content: generateOrderTimelineLaundry({}), language: 'typescript' };
      case 'order-form-laundry':
        return { path: 'src/components/OrderFormLaundry.tsx', content: this.generatePublicFormComponent('OrderFormLaundry', 'order', [
      { key: 'customer_name', label: 'Name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'service', label: 'Service', type: 'select', options: ['wash_fold', 'dry_clean', 'ironing', 'express'], required: true },
      { key: 'items', label: 'Items Description', type: 'textarea', required: true },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date', required: true },
      { key: 'pickup_time', label: 'Pickup Time', type: 'select', options: ['morning', 'afternoon', 'evening'], required: true },
      { key: 'notes', label: 'Special Instructions', type: 'textarea', required: false },
    ], 'order'), language: 'typescript' };
      case 'pickup-list':
        return { path: 'src/components/PickupList.tsx', content: this.generateEntityTableComponent('PickupList', 'pickup', [
      { key: 'time', label: 'Time' },
      { key: 'customer', label: 'Customer' },
      { key: 'address', label: 'Address' },
      { key: 'items', label: 'Items' },
    ], { title: 'Scheduled Pickups', emptyMessage: 'No pickups scheduled' }), language: 'typescript' };
      case 'delivery-list-laundry':
        return { path: 'src/components/DeliveryListLaundry.tsx', content: this.generateEntityTableComponent('DeliveryListLaundry', 'delivery', [
      { key: 'time', label: 'Time' },
      { key: 'customer', label: 'Customer' },
      { key: 'address', label: 'Address' },
      { key: 'order_number', label: 'Order #' },
    ], { title: 'Scheduled Deliveries', emptyMessage: 'No deliveries scheduled' }), language: 'typescript' };
      case 'customer-table-laundry':
        return { path: 'src/components/CustomerTableLaundry.tsx', content: this.generateEntityTableComponent('CustomerTableLaundry', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'total_orders', label: 'Total Orders' },
      { key: 'last_order', label: 'Last Order', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'customer-profile-laundry':
        return { path: 'src/components/CustomerProfileLaundry.tsx', content: generateCustomerProfileLaundry({}), language: 'typescript' };
      case 'customer-orders-laundry':
        return { path: 'src/components/CustomerOrdersLaundry.tsx', content: this.generateEntityTableComponent('CustomerOrdersLaundry', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'service', label: 'Service' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Order History', emptyMessage: 'No orders yet' }), language: 'typescript' };
      case 'pricing-table-laundry':
        return { path: 'src/components/PricingTableLaundry.tsx', content: this.generateEntityTableComponent('PricingTableLaundry', 'service', [
      { key: 'name', label: 'Service' },
      { key: 'description', label: 'Description' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'turnaround', label: 'Turnaround' },
    ], { title: 'Our Services' }), language: 'typescript' };
      case 'booking-form-laundry':
        return { path: 'src/components/BookingFormLaundry.tsx', content: this.generatePublicFormComponent('BookingFormLaundry', 'booking', [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'address', label: 'Pickup Address', type: 'textarea', required: true },
      { key: 'service', label: 'Service', type: 'select', options: ['wash_fold', 'dry_clean', 'ironing', 'express'], required: true },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date', required: true },
      { key: 'notes', label: 'Special Instructions', type: 'textarea', required: false },
    ], 'booking'), language: 'typescript' };

      // Food Truck Components
      case 'foodtruck-stats':
        return { path: 'src/components/FoodtruckStats.tsx', content: generateFoodtruckStats({}), language: 'typescript' };
      case 'active-orders-foodtruck':
        return { path: 'src/components/ActiveOrdersFoodtruck.tsx', content: this.generateEntityTableComponent('ActiveOrdersFoodtruck', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'time', label: 'Time' },
    ], { title: 'Active Orders', emptyMessage: 'No active orders' }), language: 'typescript' };
      case 'today-location':
        return { path: 'src/components/TodayLocation.tsx', content: this.generateEntityDetailComponent('TodayLocation', 'location', [
      { key: 'name', label: 'Location' },
      { key: 'address', label: 'Address' },
      { key: 'hours', label: 'Hours' },
      { key: 'notes', label: 'Notes' },
    ]), language: 'typescript' };
      case 'menu-grid-foodtruck':
        return { path: 'src/components/MenuGridFoodtruck.tsx', content: this.generateEntityTableComponent('MenuGridFoodtruck', 'item', [
      { key: 'name', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'available', label: 'Available' },
    ], { title: 'Menu Items', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'menu-item-detail-foodtruck':
        return { path: 'src/components/MenuItemDetailFoodtruck.tsx', content: this.generateEntityDetailComponent('MenuItemDetailFoodtruck', 'item', [
      { key: 'name', label: 'Item Name' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'ingredients', label: 'Ingredients' },
      { key: 'allergens', label: 'Allergens' },
      { key: 'calories', label: 'Calories' },
    ]), language: 'typescript' };
      case 'menu-item-form':
        return { path: 'src/components/MenuItemForm.tsx', content: this.generatePublicFormComponent('MenuItemForm', 'item', [
      { key: 'name', label: 'Item Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['main', 'side', 'drink', 'dessert'], required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'ingredients', label: 'Ingredients', type: 'textarea', required: false },
      { key: 'allergens', label: 'Allergens', type: 'text', required: false },
    ], 'item'), language: 'typescript' };
      case 'order-queue-foodtruck':
        return { path: 'src/components/OrderQueueFoodtruck.tsx', content: generateOrderQueueFoodtruck({}), language: 'typescript' };
      case 'order-detail-foodtruck':
        return { path: 'src/components/OrderDetailFoodtruck.tsx', content: this.generateEntityDetailComponent('OrderDetailFoodtruck', 'order', [
      { key: 'order_number', label: 'Order Number' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'payment_method', label: 'Payment' },
      { key: 'notes', label: 'Notes' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'schedule-calendar-foodtruck':
        return { path: 'src/components/ScheduleCalendarFoodtruck.tsx', content: generateScheduleCalendarFoodtruck({}), language: 'typescript' };
      case 'location-list-foodtruck':
        return { path: 'src/components/LocationListFoodtruck.tsx', content: this.generateEntityTableComponent('LocationListFoodtruck', 'location', [
      { key: 'name', label: 'Location' },
      { key: 'address', label: 'Address' },
      { key: 'day', label: 'Day' },
      { key: 'hours', label: 'Hours' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'truck-location':
        return { path: 'src/components/TruckLocation.tsx', content: this.generateEntityDetailComponent('TruckLocation', 'location', [
      { key: 'name', label: 'Current Location' },
      { key: 'address', label: 'Address' },
      { key: 'hours', label: 'Hours Today' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'public-menu-foodtruck':
        return { path: 'src/components/PublicMenuFoodtruck.tsx', content: this.generateEntityTableComponent('PublicMenuFoodtruck', 'item', [
      { key: 'name', label: 'Item' },
      { key: 'description', label: 'Description' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Our Menu', showImage: true, imageKey: 'image', groupBy: 'category' }), language: 'typescript' };
      case 'order-form-foodtruck':
        return { path: 'src/components/OrderFormFoodtruck.tsx', content: this.generatePublicFormComponent('OrderFormFoodtruck', 'order', [
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'items', label: 'Order Items', type: 'textarea', required: true },
      { key: 'notes', label: 'Special Requests', type: 'textarea', required: false },
    ], 'order'), language: 'typescript' };

      // Catering Components
      case 'catering-stats':
        return { path: 'src/components/CateringStats.tsx', content: generateCateringStats({}), language: 'typescript' };
      case 'event-list-catering':
        return { path: 'src/components/EventListCatering.tsx', content: this.generateEntityTableComponent('EventListCatering', 'event', [
      { key: 'name', label: 'Event' },
      { key: 'client', label: 'Client' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'guests', label: 'Guests' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Upcoming Events', emptyMessage: 'No upcoming events' }), language: 'typescript' };
      case 'quote-list-catering':
        return { path: 'src/components/QuoteListCatering.tsx', content: this.generateEntityTableComponent('QuoteListCatering', 'quote', [
      { key: 'client', label: 'Client' },
      { key: 'event_type', label: 'Event Type' },
      { key: 'date', label: 'Event Date', type: 'date' },
      { key: 'total', label: 'Quote', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Recent Quotes', emptyMessage: 'No quotes' }), language: 'typescript' };
      case 'event-calendar-catering':
        return { path: 'src/components/EventCalendarCatering.tsx', content: generateEventCalendarCatering({}), language: 'typescript' };
      case 'event-detail-catering':
        return { path: 'src/components/EventDetailCatering.tsx', content: this.generateEntityDetailComponent('EventDetailCatering', 'event', [
      { key: 'name', label: 'Event Name' },
      { key: 'client', label: 'Client' },
      { key: 'event_type', label: 'Event Type' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'venue', label: 'Venue' },
      { key: 'guests', label: 'Expected Guests' },
      { key: 'menu', label: 'Menu Selected' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'notes', label: 'Special Requirements' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'event-menu':
        return { path: 'src/components/EventMenu.tsx', content: this.generateEntityTableComponent('EventMenu', 'item', [
      { key: 'name', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Selected Menu Items', emptyMessage: 'No items selected' }), language: 'typescript' };
      case 'event-form-catering':
        return { path: 'src/components/EventFormCatering.tsx', content: this.generatePublicFormComponent('EventFormCatering', 'event', [
      { key: 'event_name', label: 'Event Name', type: 'text', required: true },
      { key: 'event_type', label: 'Event Type', type: 'select', options: ['wedding', 'corporate', 'birthday', 'graduation', 'other'], required: true },
      { key: 'date', label: 'Event Date', type: 'date', required: true },
      { key: 'guests', label: 'Expected Guests', type: 'number', required: true },
      { key: 'venue', label: 'Venue', type: 'text', required: true },
      { key: 'menu', label: 'Preferred Menu', type: 'select', options: ['buffet', 'plated', 'cocktail', 'custom'], required: true },
      { key: 'budget', label: 'Budget', type: 'number', required: false },
      { key: 'notes', label: 'Special Requirements', type: 'textarea', required: false },
    ], 'event'), language: 'typescript' };
      case 'menu-grid-catering':
        return { path: 'src/components/MenuGridCatering.tsx', content: this.generateEntityTableComponent('MenuGridCatering', 'menu', [
      { key: 'name', label: 'Menu Name' },
      { key: 'type', label: 'Type' },
      { key: 'items', label: 'Items' },
      { key: 'price_per_person', label: 'Per Person', type: 'currency' },
    ], { title: 'Catering Menus', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'menu-detail-catering':
        return { path: 'src/components/MenuDetailCatering.tsx', content: this.generateEntityDetailComponent('MenuDetailCatering', 'menu', [
      { key: 'name', label: 'Menu Name' },
      { key: 'type', label: 'Menu Type' },
      { key: 'description', label: 'Description' },
      { key: 'price_per_person', label: 'Price Per Person', type: 'currency' },
      { key: 'minimum_guests', label: 'Minimum Guests' },
    ]), language: 'typescript' };
      case 'menu-items-catering':
        return { path: 'src/components/MenuItemsCatering.tsx', content: this.generateEntityTableComponent('MenuItemsCatering', 'item', [
      { key: 'name', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
    ], { title: 'Menu Items', emptyMessage: 'No items in menu', groupBy: 'category' }), language: 'typescript' };
      case 'quote-table-catering':
        return { path: 'src/components/QuoteTableCatering.tsx', content: this.generateEntityTableComponent('QuoteTableCatering', 'quote', [
      { key: 'quote_number', label: 'Quote #' },
      { key: 'client', label: 'Client' },
      { key: 'event_type', label: 'Event Type' },
      { key: 'event_date', label: 'Event Date', type: 'date' },
      { key: 'guests', label: 'Guests' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'quote-detail-catering':
        return { path: 'src/components/QuoteDetailCatering.tsx', content: this.generateEntityDetailComponent('QuoteDetailCatering', 'quote', [
      { key: 'quote_number', label: 'Quote Number' },
      { key: 'client', label: 'Client' },
      { key: 'event_type', label: 'Event Type' },
      { key: 'event_date', label: 'Event Date', type: 'date' },
      { key: 'venue', label: 'Venue' },
      { key: 'guests', label: 'Guests' },
      { key: 'menu', label: 'Menu' },
      { key: 'food_total', label: 'Food Total', type: 'currency' },
      { key: 'service_fee', label: 'Service Fee', type: 'currency' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'valid_until', label: 'Valid Until', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'order-table-catering':
        return { path: 'src/components/OrderTableCatering.tsx', content: this.generateEntityTableComponent('OrderTableCatering', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'client', label: 'Client' },
      { key: 'event_date', label: 'Event Date', type: 'date' },
      { key: 'guests', label: 'Guests' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'payment_status', label: 'Payment', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'client-table-catering':
        return { path: 'src/components/ClientTableCatering.tsx', content: this.generateEntityTableComponent('ClientTableCatering', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_events', label: 'Total Events' },
      { key: 'total_spent', label: 'Total Spent', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'client-profile-catering':
        return { path: 'src/components/ClientProfileCatering.tsx', content: generateClientProfileCatering({}), language: 'typescript' };
      case 'client-events':
        return { path: 'src/components/ClientEvents.tsx', content: this.generateEntityTableComponent('ClientEvents', 'event', [
      { key: 'name', label: 'Event' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'guests', label: 'Guests' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Event History', emptyMessage: 'No events' }), language: 'typescript' };
      case 'quote-request-form':
        return { path: 'src/components/QuoteRequestForm.tsx', content: this.generatePublicFormComponent('QuoteRequestForm', 'quote', [
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'event_type', label: 'Event Type', type: 'select', options: ['wedding', 'corporate', 'birthday', 'graduation', 'other'], required: true },
      { key: 'event_date', label: 'Event Date', type: 'date', required: true },
      { key: 'guests', label: 'Expected Guests', type: 'number', required: true },
      { key: 'venue', label: 'Venue Address', type: 'textarea', required: true },
      { key: 'menu_preference', label: 'Menu Preference', type: 'select', options: ['buffet', 'plated', 'cocktail', 'custom'], required: true },
      { key: 'budget', label: 'Budget Range', type: 'select', options: ['under_1000', '1000_3000', '3000_5000', 'over_5000'], required: false },
      { key: 'details', label: 'Additional Details', type: 'textarea', required: false },
    ], 'quote'), language: 'typescript' };

      // Interior Design Components
      case 'design-stats':
        return { path: 'src/components/DesignStats.tsx', content: generateDesignStats({}), language: 'typescript' };
      case 'project-list-design':
        return { path: 'src/components/ProjectListDesign.tsx', content: this.generateEntityTableComponent('ProjectListDesign', 'project', [
      { key: 'name', label: 'Project' },
      { key: 'client', label: 'Client' },
      { key: 'type', label: 'Type' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Active Projects', emptyMessage: 'No active projects' }), language: 'typescript' };
      case 'quote-list-design':
        return { path: 'src/components/QuoteListDesign.tsx', content: this.generateEntityTableComponent('QuoteListDesign', 'quote', [
      { key: 'client', label: 'Client' },
      { key: 'project_type', label: 'Project Type' },
      { key: 'total', label: 'Quote', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Pending Quotes', emptyMessage: 'No pending quotes' }), language: 'typescript' };
      case 'project-filters-design':
        return { path: 'src/components/ProjectFiltersDesign.tsx', content: generateProjectFiltersDesign({}), language: 'typescript' };
      case 'project-grid-design':
        return { path: 'src/components/ProjectGridDesign.tsx', content: this.generateEntityTableComponent('ProjectGridDesign', 'project', [
      { key: 'name', label: 'Project' },
      { key: 'client', label: 'Client' },
      { key: 'type', label: 'Type' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Design Projects', showImage: true, imageKey: 'cover_image' }), language: 'typescript' };
      case 'project-header-design':
        return { path: 'src/components/ProjectHeaderDesign.tsx', content: this.generateEntityDetailComponent('ProjectHeaderDesign', 'project', [
      { key: 'name', label: 'Project Name' },
      { key: 'client', label: 'Client' },
      { key: 'type', label: 'Project Type' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'project-rooms':
        return { path: 'src/components/ProjectRooms.tsx', content: this.generateEntityTableComponent('ProjectRooms', 'room', [
      { key: 'name', label: 'Room' },
      { key: 'style', label: 'Style' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Project Rooms', emptyMessage: 'No rooms added' }), language: 'typescript' };
      case 'project-products':
        return { path: 'src/components/ProjectProducts.tsx', content: this.generateEntityTableComponent('ProjectProducts', 'product', [
      { key: 'name', label: 'Product' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Qty' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Product Selections', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'project-form-design':
        return { path: 'src/components/ProjectFormDesign.tsx', content: this.generatePublicFormComponent('ProjectFormDesign', 'project', [
      { key: 'name', label: 'Project Name', type: 'text', required: true },
      { key: 'client', label: 'Client', type: 'text', required: true },
      { key: 'type', label: 'Project Type', type: 'select', options: ['residential', 'commercial', 'hospitality', 'retail'], required: true },
      { key: 'address', label: 'Property Address', type: 'textarea', required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'deadline', label: 'Deadline', type: 'date', required: false },
      { key: 'budget', label: 'Budget', type: 'number', required: true },
      { key: 'description', label: 'Project Description', type: 'textarea', required: false },
    ], 'project'), language: 'typescript' };
      case 'client-table-design':
        return { path: 'src/components/ClientTableDesign.tsx', content: this.generateEntityTableComponent('ClientTableDesign', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_projects', label: 'Projects' },
      { key: 'total_spent', label: 'Total Spent', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'client-profile-design':
        return { path: 'src/components/ClientProfileDesign.tsx', content: generateClientProfileDesign({}), language: 'typescript' };
      case 'client-projects-design':
        return { path: 'src/components/ClientProjectsDesign.tsx', content: this.generateEntityTableComponent('ClientProjectsDesign', 'project', [
      { key: 'name', label: 'Project' },
      { key: 'type', label: 'Type' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Projects', emptyMessage: 'No projects' }), language: 'typescript' };
      case 'product-filters-design':
        return { path: 'src/components/ProductFiltersDesign.tsx', content: generateProductFiltersDesign({}), language: 'typescript' };
      case 'product-grid-design':
        return { path: 'src/components/ProductGridDesign.tsx', content: this.generateEntityTableComponent('ProductGridDesign', 'product', [
      { key: 'name', label: 'Product' },
      { key: 'category', label: 'Category' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Product Catalog', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'mood-board-grid':
        return { path: 'src/components/MoodBoardGrid.tsx', content: this.generateEntityGridComponent('MoodBoardGrid', 'moodboard', { title: 'name', subtitle: 'project', badge: 'status', image: 'thumbnail' }, 'moodboards'), language: 'typescript' };
      case 'mood-board-viewer':
        return { path: 'src/components/MoodBoardViewer.tsx', content: this.generateEntityDetailComponent('MoodBoardViewer', 'moodboard', [
      { key: 'name', label: 'Name', icon: 'Palette' },
      { key: 'project', label: 'Project', icon: 'FolderOpen' },
      { key: 'style', label: 'Style', icon: 'Sparkles' },
      { key: 'colors', label: 'Color Palette', icon: 'Droplets' },
      { key: 'materials', label: 'Materials', icon: 'Layers' },
      { key: 'notes', label: 'Notes', icon: 'FileText' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'moodboards'), language: 'typescript' };
      case 'quote-table-design':
        return { path: 'src/components/QuoteTableDesign.tsx', content: this.generateEntityTableComponent('QuoteTableDesign', 'quote', [
      { key: 'quote_number', label: 'Quote #' },
      { key: 'client_name', label: 'Client' },
      { key: 'project', label: 'Project' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'valid_until', label: 'Valid Until', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'quotes'), language: 'typescript' };
      case 'public-portfolio-design':
        return { path: 'src/components/PublicPortfolioDesign.tsx', content: this.generateEntityGridComponent('PublicPortfolioDesign', 'project', { title: 'name', subtitle: 'style', badge: 'type', image: 'featured_image' }, 'projects'), language: 'typescript' };

      // Consulting Components
      case 'consulting-stats':
        return { path: 'src/components/ConsultingStats.tsx', content: generateConsultingStats({}), language: 'typescript' };
      case 'project-list-consulting':
        return { path: 'src/components/ProjectListConsulting.tsx', content: this.generateEntityTableComponent('ProjectListConsulting', 'project', [
      { key: 'name', label: 'Project' },
      { key: 'client', label: 'Client' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Active Projects', emptyMessage: 'No active projects' }), language: 'typescript' };
      case 'recent-time-entries':
        return { path: 'src/components/RecentTimeEntries.tsx', content: this.generateEntityTableComponent('RecentTimeEntries', 'time_entry', [
      { key: 'project', label: 'Project' },
      { key: 'hours', label: 'Hours' },
      { key: 'description', label: 'Description' },
      { key: 'date', label: 'Date', type: 'date' },
    ], { title: 'Recent Time Entries', emptyMessage: 'No time entries' }), language: 'typescript' };
      case 'client-table-consulting':
        return { path: 'src/components/ClientTableConsulting.tsx', content: this.generateEntityTableComponent('ClientTableConsulting', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'company', label: 'Company' },
      { key: 'email', label: 'Email' },
      { key: 'projects', label: 'Projects' },
      { key: 'total_billed', label: 'Total Billed', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'client-header-consulting':
        return { path: 'src/components/ClientHeaderConsulting.tsx', content: generateClientHeaderConsulting({}), language: 'typescript' };
      case 'client-projects-consulting':
        return { path: 'src/components/ClientProjectsConsulting.tsx', content: this.generateEntityTableComponent('ClientProjectsConsulting', 'project', [
      { key: 'name', label: 'Project' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Projects', emptyMessage: 'No projects' }), language: 'typescript' };
      case 'client-invoices':
        return { path: 'src/components/ClientInvoices.tsx', content: this.generateEntityTableComponent('ClientInvoices', 'invoice', [
      { key: 'number', label: 'Invoice #' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Invoices', emptyMessage: 'No invoices' }), language: 'typescript' };
      case 'client-form-consulting':
        return { path: 'src/components/ClientFormConsulting.tsx', content: this.generatePublicFormComponent('ClientFormConsulting', 'client', [
      { key: 'name', label: 'Contact Name', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'address', label: 'Address', type: 'textarea', required: false },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false },
    ], 'client'), language: 'typescript' };
      case 'project-filters-consulting':
        return { path: 'src/components/ProjectFiltersConsulting.tsx', content: generateProjectFiltersConsulting({}), language: 'typescript' };
      case 'project-table-consulting':
        return { path: 'src/components/ProjectTableConsulting.tsx', content: this.generateEntityTableComponent('ProjectTableConsulting', 'project', [
      { key: 'name', label: 'Project' },
      { key: 'client', label: 'Client' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'hours_logged', label: 'Hours' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'project-header-consulting':
        return { path: 'src/components/ProjectHeaderConsulting.tsx', content: this.generateEntityDetailComponent('ProjectHeaderConsulting', 'project', [
      { key: 'name', label: 'Project Name' },
      { key: 'client', label: 'Client' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'hours_logged', label: 'Hours Logged' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'project-timeline-consulting':
        return { path: 'src/components/ProjectTimelineConsulting.tsx', content: generateProjectTimelineConsulting({}), language: 'typescript' };
      case 'project-time-entries':
        return { path: 'src/components/ProjectTimeEntries.tsx', content: this.generateEntityTableComponent('ProjectTimeEntries', 'time_entry', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'user', label: 'User' },
      { key: 'hours', label: 'Hours' },
      { key: 'description', label: 'Description' },
    ], { title: 'Time Entries', emptyMessage: 'No time entries' }), language: 'typescript' };
      case 'time-tracker-consulting':
        return { path: 'src/components/TimeTrackerConsulting.tsx', content: generateTimeTrackerConsulting({}), language: 'typescript' };
      case 'time-entry-table':
        return { path: 'src/components/TimeEntryTable.tsx', content: this.generateEntityTableComponent('TimeEntryTable', 'time_entry', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'project', label: 'Project' },
      { key: 'user', label: 'User' },
      { key: 'hours', label: 'Hours' },
      { key: 'billable', label: 'Billable' },
      { key: 'description', label: 'Description' },
    ]), language: 'typescript' };
      case 'invoice-stats-consulting':
        return { path: 'src/components/InvoiceStatsConsulting.tsx', content: generateInvoiceStatsConsulting({}), language: 'typescript' };
      case 'invoice-table-consulting':
        return { path: 'src/components/InvoiceTableConsulting.tsx', content: this.generateEntityTableComponent('InvoiceTableConsulting', 'invoice', [
      { key: 'number', label: 'Invoice #' },
      { key: 'client', label: 'Client' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'invoice-detail-consulting':
        return { path: 'src/components/InvoiceDetailConsulting.tsx', content: this.generateEntityDetailComponent('InvoiceDetailConsulting', 'invoice', [
      { key: 'number', label: 'Invoice Number' },
      { key: 'client', label: 'Client' },
      { key: 'project', label: 'Project' },
      { key: 'date', label: 'Invoice Date', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency' },
      { key: 'tax', label: 'Tax', type: 'currency' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'invoice-form-consulting':
        return { path: 'src/components/InvoiceFormConsulting.tsx', content: this.generatePublicFormComponent('InvoiceFormConsulting', 'invoice', [
      { key: 'client', label: 'Client', type: 'text', required: true },
      { key: 'project', label: 'Project', type: 'text', required: true },
      { key: 'date', label: 'Invoice Date', type: 'date', required: true },
      { key: 'due_date', label: 'Due Date', type: 'date', required: true },
      { key: 'items', label: 'Line Items', type: 'textarea', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false },
    ], 'invoice'), language: 'typescript' };
      case 'revenue-report-consulting':
        return { path: 'src/components/RevenueReportConsulting.tsx', content: generateRevenueReportConsulting({}), language: 'typescript' };
      case 'utilization-report':
        return { path: 'src/components/UtilizationReport.tsx', content: generateUtilizationReport({}), language: 'typescript' };

      // Veterinary Clinic Components
      case 'vet-clinic-stats':
        return { path: 'src/components/VetClinicStats.tsx', content: generateVetClinicStats({}), language: 'typescript' };
      case 'appointment-list-vet':
        return { path: 'src/components/AppointmentListVet.tsx', content: this.generateEntityTableComponent('AppointmentListVet', 'appointment', [
      { key: 'pet_name', label: 'Pet' },
      { key: 'owner', label: 'Owner' },
      { key: 'time', label: 'Time' },
      { key: 'reason', label: 'Reason' },
      { key: 'vet', label: 'Vet' },
    ], { title: 'Today\'s Appointments', emptyMessage: 'No appointments' }), language: 'typescript' };
      case 'vet-schedule-overview':
        return { path: 'src/components/VetScheduleOverview.tsx', content: this.generateEntityTableComponent('VetScheduleOverview', 'vet', [
      { key: 'name', label: 'Veterinarian' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'appointments_today', label: 'Today' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Vet Schedule', showStatus: true }), language: 'typescript' };
      case 'appointment-calendar-vet':
        return { path: 'src/components/AppointmentCalendarVet.tsx', content: generateAppointmentCalendarVet({}), language: 'typescript' };
      case 'appointment-form-vet':
        return { path: 'src/components/AppointmentFormVet.tsx', content: this.generatePublicFormComponent('AppointmentFormVet', 'appointment', [
      { key: 'pet_name', label: 'Pet Name', type: 'text', required: true },
      { key: 'species', label: 'Species', type: 'select', options: ['dog', 'cat', 'bird', 'rabbit', 'other'], required: true },
      { key: 'owner_name', label: 'Owner Name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'reason', label: 'Reason for Visit', type: 'select', options: ['checkup', 'vaccination', 'illness', 'injury', 'surgery', 'other'], required: true },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'time', label: 'Preferred Time', type: 'time', required: true },
      { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
    ], 'appointment'), language: 'typescript' };
      case 'appointment-detail-vet':
        return { path: 'src/components/AppointmentDetailVet.tsx', content: this.generateEntityDetailComponent('AppointmentDetailVet', 'appointment', [
      { key: 'pet_name', label: 'Pet' },
      { key: 'species', label: 'Species' },
      { key: 'owner', label: 'Owner' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'vet', label: 'Veterinarian' },
      { key: 'reason', label: 'Reason' },
      { key: 'diagnosis', label: 'Diagnosis' },
      { key: 'treatment', label: 'Treatment' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'patient-filters-vet':
        return { path: 'src/components/PatientFiltersVet.tsx', content: generatePatientFiltersVet({}), language: 'typescript' };
      case 'patient-table-vet':
        return { path: 'src/components/PatientTableVet.tsx', content: this.generateEntityTableComponent('PatientTableVet', 'patient', [
      { key: 'name', label: 'Pet Name' },
      { key: 'species', label: 'Species' },
      { key: 'breed', label: 'Breed' },
      { key: 'owner', label: 'Owner' },
      { key: 'last_visit', label: 'Last Visit', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'patient-profile-vet':
        return { path: 'src/components/PatientProfileVet.tsx', content: generatePatientProfileVet({}), language: 'typescript' };
      case 'medical-records-vet':
        return { path: 'src/components/MedicalRecordsVet.tsx', content: generateMedicalRecordsVet({}), language: 'typescript' };
      case 'vaccination-records':
        return { path: 'src/components/VaccinationRecords.tsx', content: this.generateEntityTableComponent('VaccinationRecords', 'vaccination', [
      { key: 'vaccine', label: 'Vaccine' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'next_due', label: 'Next Due', type: 'date' },
      { key: 'vet', label: 'Vet' },
    ], { title: 'Vaccination Records', emptyMessage: 'No vaccinations' }), language: 'typescript' };
      case 'owner-table':
        return { path: 'src/components/OwnerTable.tsx', content: this.generateEntityTableComponent('OwnerTable', 'owner', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'pets', label: 'Pets' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'owner-profile':
        return { path: 'src/components/OwnerProfile.tsx', content: generateOwnerProfile({}), language: 'typescript' };
      case 'owner-pets':
        return { path: 'src/components/OwnerPets.tsx', content: this.generateEntityTableComponent('OwnerPets', 'pet', [
      { key: 'name', label: 'Name' },
      { key: 'species', label: 'Species' },
      { key: 'breed', label: 'Breed' },
      { key: 'age', label: 'Age' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Pets', emptyMessage: 'No pets registered' }), language: 'typescript' };
      case 'vet-grid':
        return { path: 'src/components/VetGrid.tsx', content: this.generateEntityTableComponent('VetGrid', 'vet', [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'experience', label: 'Experience' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Our Veterinarians', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'vet-profile':
        return { path: 'src/components/VetProfile.tsx', content: generateVetProfile({}), language: 'typescript' };
      case 'vet-schedule':
        return { path: 'src/components/VetSchedule.tsx', content: generateVetSchedule({}), language: 'typescript' };
      case 'billing-stats-vet':
        return { path: 'src/components/BillingStatsVet.tsx', content: generateBillingStatsVet({}), language: 'typescript' };
      case 'invoice-table-vet':
        return { path: 'src/components/InvoiceTableVet.tsx', content: this.generateEntityTableComponent('InvoiceTableVet', 'invoice', [
      { key: 'number', label: 'Invoice #' },
      { key: 'owner', label: 'Owner' },
      { key: 'pet', label: 'Pet' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'online-booking-vet':
        return { path: 'src/components/OnlineBookingVet.tsx', content: this.generatePublicFormComponent('OnlineBookingVet', 'booking', [
      { key: 'pet_name', label: 'Pet Name', type: 'text', required: true },
      { key: 'species', label: 'Species', type: 'select', options: ['dog', 'cat', 'bird', 'rabbit', 'other'], required: true },
      { key: 'owner_name', label: 'Your Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'reason', label: 'Reason for Visit', type: 'select', options: ['wellness_exam', 'vaccination', 'sick_visit', 'follow_up', 'other'], required: true },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'time', label: 'Preferred Time', type: 'select', options: ['morning', 'afternoon'], required: true },
      { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
    ], 'booking'), language: 'typescript' };

      // ===== Hair Salon/Barbershop =====
      case 'salon-stats':
        return { path: 'src/components/SalonStats.tsx', content: generateSalonStats({}), language: 'typescript' };
      case 'today-appointments':
        return { path: 'src/components/TodayAppointments.tsx', content: this.generateEntityTableComponent('TodayAppointments', 'appointment', [
      { key: 'client', label: 'Client' },
      { key: 'service', label: 'Service' },
      { key: 'time', label: 'Time' },
      { key: 'stylist', label: 'Stylist' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Today\'s Appointments', emptyMessage: 'No appointments' }), language: 'typescript' };
      case 'stylist-availability':
        return { path: 'src/components/StylistAvailability.tsx', content: this.generateEntityTableComponent('StylistAvailability', 'stylist', [
      { key: 'name', label: 'Stylist' },
      { key: 'next_available', label: 'Next Available' },
      { key: 'appointments_today', label: 'Today' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Stylist Availability', showStatus: true }), language: 'typescript' };
      case 'appointment-calendar-salon':
        return { path: 'src/components/AppointmentCalendarSalon.tsx', content: generateAppointmentCalendarSalon({}), language: 'typescript' };
      case 'appointment-form-salon':
        return { path: 'src/components/AppointmentFormSalon.tsx', content: this.generatePublicFormComponent('AppointmentFormSalon', 'appointment', [
      { key: 'client_name', label: 'Your Name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'email', label: 'Email', type: 'email', required: false },
      { key: 'service', label: 'Service', type: 'select', options: ['haircut', 'color', 'highlights', 'styling', 'treatment', 'other'], required: true },
      { key: 'stylist', label: 'Preferred Stylist', type: 'select', options: ['any', 'stylist1', 'stylist2'], required: false },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'time', label: 'Time', type: 'time', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false },
    ], 'appointment'), language: 'typescript' };
      case 'appointment-detail-salon':
        return { path: 'src/components/AppointmentDetailSalon.tsx', content: this.generateEntityDetailComponent('AppointmentDetailSalon', 'appointment', [
      { key: 'client', label: 'Client' },
      { key: 'phone', label: 'Phone' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'service', label: 'Service' },
      { key: 'stylist', label: 'Stylist' },
      { key: 'duration', label: 'Duration' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'notes', label: 'Notes' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'stylist-grid':
        return { path: 'src/components/StylistGrid.tsx', content: this.generateEntityTableComponent('StylistGrid', 'stylist', [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'experience', label: 'Experience' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status', type: 'status' },
    ], { title: 'Our Stylists', showImage: true, imageKey: 'photo' }), language: 'typescript' };
      case 'stylist-profile':
        return { path: 'src/components/StylistProfile.tsx', content: generateStylistProfile({}), language: 'typescript' };
      case 'stylist-schedule':
        return { path: 'src/components/StylistSchedule.tsx', content: generateStylistSchedule({}), language: 'typescript' };
      case 'client-table-salon':
        return { path: 'src/components/ClientTableSalon.tsx', content: this.generateEntityTableComponent('ClientTableSalon', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'total_visits', label: 'Visits' },
      { key: 'last_visit', label: 'Last Visit', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ]), language: 'typescript' };
      case 'client-profile-salon':
        return { path: 'src/components/ClientProfileSalon.tsx', content: generateClientProfileSalon({}), language: 'typescript' };
      case 'client-history-salon':
        return { path: 'src/components/ClientHistorySalon.tsx', content: this.generateEntityTableComponent('ClientHistorySalon', 'appointment', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'service', label: 'Service' },
      { key: 'stylist', label: 'Stylist' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Visit History', emptyMessage: 'No visit history' }), language: 'typescript' };
      case 'service-menu-salon':
        return { path: 'src/components/ServiceMenuSalon.tsx', content: this.generateEntityTableComponent('ServiceMenuSalon', 'service', [
      { key: 'name', label: 'Service' },
      { key: 'description', label: 'Description' },
      { key: 'duration', label: 'Duration' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], { title: 'Services', groupBy: 'category' }), language: 'typescript' };
      case 'product-grid-salon':
        return { path: 'src/components/ProductGridSalon.tsx', content: this.generateEntityTableComponent('ProductGridSalon', 'product', [
      { key: 'name', label: 'Product' },
      { key: 'brand', label: 'Brand' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'in_stock', label: 'In Stock' },
    ], { title: 'Products', showImage: true, imageKey: 'image' }), language: 'typescript' };
      case 'public-booking-salon':
        return { path: 'src/components/PublicBookingSalon.tsx', content: this.generatePublicFormComponent('PublicBookingSalon', 'booking', [
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'email', label: 'Email', type: 'email', required: false },
      { key: 'service', label: 'Service', type: 'select', options: ['haircut', 'color', 'highlights', 'styling', 'treatment'], required: true },
      { key: 'stylist', label: 'Preferred Stylist', type: 'select', options: ['no_preference', 'stylist1', 'stylist2'], required: false },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'time', label: 'Time', type: 'select', options: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'], required: true },
    ], 'booking'), language: 'typescript' };

      // ===== Pet Boarding/Daycare =====
      case 'petboarding-stats':
        return { path: 'src/components/PetboardingStats.tsx', content: generatePetboardingStats({}), language: 'typescript' };
      case 'current-pets':
        return { path: 'src/components/CurrentPets.tsx', content: generateCurrentPets({}), language: 'typescript' };
      case 'feeding-schedule':
        return { path: 'src/components/FeedingSchedule.tsx', content: generateFeedingSchedule({}), language: 'typescript' };
      case 'calendar-petboarding':
        return { path: 'src/components/CalendarPetboarding.tsx', content: generateCalendarPetboarding({}), language: 'typescript' };
      case 'reservation-detail':
        return { path: 'src/components/ReservationDetail.tsx', content: this.generateEntityDetailComponent('ReservationDetail', 'reservation', [
      { key: 'pet_name', label: 'Pet Name', icon: 'PawPrint' },
      { key: 'owner_name', label: 'Owner', icon: 'User' },
      { key: 'check_in_date', label: 'Check In', type: 'date', icon: 'LogIn' },
      { key: 'check_out_date', label: 'Check Out', type: 'date', icon: 'LogOut' },
      { key: 'kennel_number', label: 'Kennel', icon: 'Home' },
      { key: 'services', label: 'Services', icon: 'Sparkles' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'special_instructions', label: 'Special Instructions', icon: 'Info' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'reservations'), language: 'typescript' };
      case 'pet-info-card':
        return { path: 'src/components/PetInfoCard.tsx', content: this.generateEntityGridComponent('PetInfoCard', 'pet', { title: 'name', subtitle: 'breed', badge: 'status', image: 'photo' }, 'pets'), language: 'typescript' };
      case 'pet-table':
        return { path: 'src/components/PetTable.tsx', content: this.generateEntityTableComponent('PetTable', 'pet', [
      { key: 'name', label: 'Name' },
      { key: 'breed', label: 'Breed' },
      { key: 'species', label: 'Species' },
      { key: 'age', label: 'Age' },
      { key: 'owner_name', label: 'Owner' },
      { key: 'last_visit', label: 'Last Visit', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'pets'), language: 'typescript' };
      case 'pet-profile-boarding':
        return { path: 'src/components/PetProfileBoarding.tsx', content: generatePetProfileBoarding({}), language: 'typescript' };
      case 'pet-medical-info':
        return { path: 'src/components/PetMedicalInfo.tsx', content: this.generateEntityDetailComponent('PetMedicalInfo', 'pet', [
      { key: 'vaccinations', label: 'Vaccinations', icon: 'Syringe' },
      { key: 'rabies_expiry', label: 'Rabies Expiry', type: 'date', icon: 'Calendar' },
      { key: 'allergies', label: 'Allergies', icon: 'AlertTriangle' },
      { key: 'medications', label: 'Medications', icon: 'Pill' },
      { key: 'special_needs', label: 'Special Needs', icon: 'Heart' },
      { key: 'feeding_instructions', label: 'Feeding Instructions', icon: 'Utensils' },
    ], 'pets'), language: 'typescript' };
      case 'pet-activities':
        return { path: 'src/components/PetActivities.tsx', content: generatePetActivities({}), language: 'typescript' };
      case 'pet-form-boarding':
        return { path: 'src/components/PetFormBoarding.tsx', content: this.generatePublicFormComponent('PetFormBoarding', 'pet', [
      { name: 'name', label: 'Pet Name', type: 'text', required: true },
      { name: 'species', label: 'Species', type: 'select', options: ['Dog', 'Cat', 'Bird', 'Other'], required: true },
      { name: 'breed', label: 'Breed', type: 'text', required: true },
      { name: 'age', label: 'Age', type: 'number' },
      { name: 'weight', label: 'Weight (lbs)', type: 'number' },
      { name: 'color', label: 'Color', type: 'text' },
      { name: 'owner_name', label: 'Owner Name', type: 'text', required: true },
      { name: 'owner_phone', label: 'Owner Phone', type: 'tel', required: true },
      { name: 'owner_email', label: 'Owner Email', type: 'email', required: true },
      { name: 'special_needs', label: 'Special Needs', type: 'textarea' },
    ], 'pets'), language: 'typescript' };
      case 'reservation-filters':
        return { path: 'src/components/ReservationFilters.tsx', content: generateReservationFilters({}), language: 'typescript' };
      case 'reservation-table-boarding':
        return { path: 'src/components/ReservationTableBoarding.tsx', content: this.generateEntityTableComponent('ReservationTableBoarding', 'reservation', [
      { key: 'pet_name', label: 'Pet' },
      { key: 'owner_name', label: 'Owner' },
      { key: 'check_in_date', label: 'Check In', type: 'date' },
      { key: 'check_out_date', label: 'Check Out', type: 'date' },
      { key: 'kennel_number', label: 'Kennel' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'reservations'), language: 'typescript' };
      case 'staff-grid-boarding':
        return { path: 'src/components/StaffGridBoarding.tsx', content: this.generateEntityGridComponent('StaffGridBoarding', 'staff', { title: 'name', subtitle: 'role', badge: 'status', image: 'photo' }, 'staff'), language: 'typescript' };
      case 'staff-schedule-boarding':
        return { path: 'src/components/StaffScheduleBoarding.tsx', content: generateStaffScheduleBoarding({}), language: 'typescript' };
      case 'booking-wizard-boarding':
        return { path: 'src/components/BookingWizardBoarding.tsx', content: this.generatePublicFormComponent('BookingWizardBoarding', 'reservation', [
      { name: 'pet_name', label: 'Pet Name', type: 'text', required: true },
      { name: 'species', label: 'Species', type: 'select', options: ['Dog', 'Cat', 'Bird', 'Other'], required: true },
      { name: 'breed', label: 'Breed', type: 'text', required: true },
      { name: 'check_in_date', label: 'Check-in Date', type: 'date', required: true },
      { name: 'check_out_date', label: 'Check-out Date', type: 'date', required: true },
      { name: 'services', label: 'Additional Services', type: 'checkbox', options: ['Grooming', 'Training', 'Playtime', 'Medication'] },
      { name: 'owner_name', label: 'Your Name', type: 'text', required: true },
      { name: 'owner_phone', label: 'Phone', type: 'tel', required: true },
      { name: 'owner_email', label: 'Email', type: 'email', required: true },
      { name: 'special_instructions', label: 'Special Instructions', type: 'textarea' },
    ], 'reservations'), language: 'typescript' };

      // ===== Florist/Flower Shop =====
      case 'florist-stats':
        return { path: 'src/components/FloristStats.tsx', content: generateFloristStats({}), language: 'typescript' };
      case 'pending-orders-florist':
        return { path: 'src/components/PendingOrdersFlorist.tsx', content: generatePendingOrdersFlorist({}), language: 'typescript' };
      case 'arrangement-list':
        return { path: 'src/components/ArrangementList.tsx', content: generateArrangementList({}), language: 'typescript' };
      case 'arrangement-grid':
        return { path: 'src/components/ArrangementGrid.tsx', content: this.generateEntityGridComponent('ArrangementGrid', 'arrangement', { title: 'name', subtitle: 'category', badge: 'price', image: 'image' }, 'arrangements'), language: 'typescript' };
      case 'arrangement-detail':
        return { path: 'src/components/ArrangementDetail.tsx', content: this.generateEntityDetailComponent('ArrangementDetail', 'arrangement', [
      { key: 'name', label: 'Name', icon: 'Flower2' },
      { key: 'category', label: 'Category', icon: 'Tag' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'flowers_used', label: 'Flowers Used', icon: 'Leaf' },
      { key: 'occasion', label: 'Occasion', icon: 'Gift' },
      { key: 'size', label: 'Size', icon: 'Maximize' },
      { key: 'availability', label: 'Availability', icon: 'CheckCircle' },
    ], 'arrangements'), language: 'typescript' };
      case 'arrangement-form':
        return { path: 'src/components/ArrangementForm.tsx', content: this.generatePublicFormComponent('ArrangementForm', 'arrangement', [
      { name: 'name', label: 'Arrangement Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Bouquet', 'Centerpiece', 'Corsage', 'Wreath', 'Custom'], required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'flowers_used', label: 'Flowers Used', type: 'textarea' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'occasion', label: 'Occasion', type: 'select', options: ['Wedding', 'Birthday', 'Anniversary', 'Sympathy', 'General'] },
    ], 'arrangements'), language: 'typescript' };
      case 'order-filters-florist':
        return { path: 'src/components/OrderFiltersFlorist.tsx', content: generateOrderFiltersFlorist({}), language: 'typescript' };
      case 'order-table-florist':
        return { path: 'src/components/OrderTableFlorist.tsx', content: this.generateEntityTableComponent('OrderTableFlorist', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'arrangement', label: 'Arrangement' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { key: 'delivery_time', label: 'Time' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'orders'), language: 'typescript' };
      case 'order-detail-florist':
        return { path: 'src/components/OrderDetailFlorist.tsx', content: this.generateEntityDetailComponent('OrderDetailFlorist', 'order', [
      { key: 'order_number', label: 'Order Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'arrangement', label: 'Arrangement', icon: 'Flower2' },
      { key: 'quantity', label: 'Quantity', icon: 'Package' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date', icon: 'Calendar' },
      { key: 'delivery_time', label: 'Delivery Time', icon: 'Clock' },
      { key: 'delivery_address', label: 'Delivery Address', icon: 'MapPin' },
      { key: 'card_message', label: 'Card Message', icon: 'MessageSquare' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'orders'), language: 'typescript' };
      case 'order-form-florist':
        return { path: 'src/components/OrderFormFlorist.tsx', content: this.generatePublicFormComponent('OrderFormFlorist', 'order', [
      { name: 'customer_name', label: 'Your Name', type: 'text', required: true },
      { name: 'customer_phone', label: 'Phone', type: 'tel', required: true },
      { name: 'customer_email', label: 'Email', type: 'email', required: true },
      { name: 'arrangement_id', label: 'Arrangement', type: 'select', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'delivery_type', label: 'Delivery Type', type: 'select', options: ['Pickup', 'Delivery'], required: true },
      { name: 'delivery_date', label: 'Date Needed', type: 'date', required: true },
      { name: 'delivery_time', label: 'Time Preferred', type: 'time' },
      { name: 'delivery_address', label: 'Delivery Address', type: 'textarea' },
      { name: 'card_message', label: 'Card Message', type: 'textarea' },
    ], 'orders'), language: 'typescript' };
      case 'customer-table-florist':
        return { path: 'src/components/CustomerTableFlorist.tsx', content: this.generateEntityTableComponent('CustomerTableFlorist', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_orders', label: 'Total Orders' },
      { key: 'last_order', label: 'Last Order', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-florist':
        return { path: 'src/components/CustomerProfileFlorist.tsx', content: generateCustomerProfileFlorist({}), language: 'typescript' };
      case 'customer-orders-florist':
        return { path: 'src/components/CustomerOrdersFlorist.tsx', content: this.generateEntityTableComponent('CustomerOrdersFlorist', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'arrangement', label: 'Arrangement' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'orders'), language: 'typescript' };
      case 'delivery-schedule-florist':
        return { path: 'src/components/DeliveryScheduleFlorist.tsx', content: generateDeliveryScheduleFlorist({}), language: 'typescript' };
      case 'delivery-list-florist':
        return { path: 'src/components/DeliveryListFlorist.tsx', content: generateDeliveryListFlorist({}), language: 'typescript' };
      case 'inventory-table-florist':
        return { path: 'src/components/InventoryTableFlorist.tsx', content: this.generateEntityTableComponent('InventoryTableFlorist', 'flower', [
      { key: 'name', label: 'Flower' },
      { key: 'color', label: 'Color' },
      { key: 'quantity', label: 'In Stock' },
      { key: 'unit_cost', label: 'Cost', type: 'currency' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'expiry_date', label: 'Expiry', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'flowers'), language: 'typescript' };
      case 'public-catalog-florist':
        return { path: 'src/components/PublicCatalogFlorist.tsx', content: this.generateEntityGridComponent('PublicCatalogFlorist', 'arrangement', { title: 'name', subtitle: 'category', badge: 'price', image: 'image' }, 'arrangements'), language: 'typescript' };
      case 'custom-order-form-florist':
        return { path: 'src/components/CustomOrderFormFlorist.tsx', content: this.generatePublicFormComponent('CustomOrderFormFlorist', 'order', [
      { name: 'customer_name', label: 'Your Name', type: 'text', required: true },
      { name: 'customer_phone', label: 'Phone', type: 'tel', required: true },
      { name: 'customer_email', label: 'Email', type: 'email', required: true },
      { name: 'occasion', label: 'Occasion', type: 'select', options: ['Wedding', 'Birthday', 'Anniversary', 'Sympathy', 'Corporate', 'Other'], required: true },
      { name: 'preferred_colors', label: 'Preferred Colors', type: 'text' },
      { name: 'preferred_flowers', label: 'Preferred Flowers', type: 'text' },
      { name: 'budget', label: 'Budget', type: 'number' },
      { name: 'delivery_date', label: 'Date Needed', type: 'date', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
    ], 'orders'), language: 'typescript' };

      // ===== Bakery =====
      case 'bakery-stats':
        return { path: 'src/components/BakeryStats.tsx', content: generateBakeryStats({}), language: 'typescript' };
      case 'todays-orders':
        return { path: 'src/components/TodaysOrders.tsx', content: generateTodaysOrders({}), language: 'typescript' };
      case 'custom-order-list':
        return { path: 'src/components/CustomOrderList.tsx', content: generateCustomOrderList({}), language: 'typescript' };
      case 'product-grid-bakery':
        return { path: 'src/components/ProductGridBakery.tsx', content: this.generateEntityGridComponent('ProductGridBakery', 'product', { title: 'name', subtitle: 'category', badge: 'price', image: 'image' }, 'products'), language: 'typescript' };
      case 'product-detail-bakery':
        return { path: 'src/components/ProductDetailBakery.tsx', content: this.generateEntityDetailComponent('ProductDetailBakery', 'product', [
      { key: 'name', label: 'Name', icon: 'Cake' },
      { key: 'category', label: 'Category', icon: 'Tag' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'ingredients', label: 'Ingredients', icon: 'Wheat' },
      { key: 'allergens', label: 'Allergens', icon: 'AlertTriangle' },
      { key: 'availability', label: 'Availability', icon: 'CheckCircle' },
    ], 'products'), language: 'typescript' };
      case 'product-form-bakery':
        return { path: 'src/components/ProductFormBakery.tsx', content: this.generatePublicFormComponent('ProductFormBakery', 'product', [
      { name: 'name', label: 'Product Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Bread', 'Pastries', 'Cakes', 'Cookies', 'Pies', 'Custom'], required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'ingredients', label: 'Ingredients', type: 'textarea' },
      { name: 'allergens', label: 'Allergens', type: 'text' },
    ], 'products'), language: 'typescript' };
      case 'order-filters-bakery':
        return { path: 'src/components/OrderFiltersBakery.tsx', content: generateOrderFiltersBakery({}), language: 'typescript' };
      case 'order-table-bakery':
        return { path: 'src/components/OrderTableBakery.tsx', content: this.generateEntityTableComponent('OrderTableBakery', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'items', label: 'Items' },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date' },
      { key: 'pickup_time', label: 'Time' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'orders'), language: 'typescript' };
      case 'order-detail-bakery':
        return { path: 'src/components/OrderDetailBakery.tsx', content: this.generateEntityDetailComponent('OrderDetailBakery', 'order', [
      { key: 'order_number', label: 'Order Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'items', label: 'Items', icon: 'ShoppingBag' },
      { key: 'quantity', label: 'Quantity', icon: 'Package' },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date', icon: 'Calendar' },
      { key: 'pickup_time', label: 'Pickup Time', icon: 'Clock' },
      { key: 'special_instructions', label: 'Special Instructions', icon: 'Info' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'orders'), language: 'typescript' };
      case 'order-form-bakery':
        return { path: 'src/components/OrderFormBakery.tsx', content: this.generatePublicFormComponent('OrderFormBakery', 'order', [
      { name: 'customer_name', label: 'Your Name', type: 'text', required: true },
      { name: 'customer_phone', label: 'Phone', type: 'tel', required: true },
      { name: 'customer_email', label: 'Email', type: 'email', required: true },
      { name: 'items', label: 'Items', type: 'select', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'pickup_date', label: 'Pickup Date', type: 'date', required: true },
      { name: 'pickup_time', label: 'Pickup Time', type: 'time', required: true },
      { name: 'special_instructions', label: 'Special Instructions', type: 'textarea' },
    ], 'orders'), language: 'typescript' };
      case 'custom-order-detail':
        return { path: 'src/components/CustomOrderDetail.tsx', content: this.generateEntityDetailComponent('CustomOrderDetail', 'order', [
      { key: 'order_number', label: 'Order Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'cake_type', label: 'Cake Type', icon: 'Cake' },
      { key: 'size', label: 'Size', icon: 'Maximize' },
      { key: 'flavor', label: 'Flavor', icon: 'Cookie' },
      { key: 'frosting', label: 'Frosting', icon: 'Sparkles' },
      { key: 'decoration', label: 'Decoration', icon: 'Gift' },
      { key: 'message', label: 'Message', icon: 'MessageSquare' },
      { key: 'pickup_date', label: 'Pickup Date', type: 'date', icon: 'Calendar' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'orders'), language: 'typescript' };
      case 'custom-order-form':
        return { path: 'src/components/CustomOrderForm.tsx', content: this.generatePublicFormComponent('CustomOrderForm', 'order', [
      { name: 'customer_name', label: 'Your Name', type: 'text', required: true },
      { name: 'customer_phone', label: 'Phone', type: 'tel', required: true },
      { name: 'customer_email', label: 'Email', type: 'email', required: true },
      { name: 'cake_type', label: 'Cake Type', type: 'select', options: ['Birthday', 'Wedding', 'Anniversary', 'Baby Shower', 'Custom'], required: true },
      { name: 'size', label: 'Size', type: 'select', options: ['6 inch', '8 inch', '10 inch', '12 inch', 'Tiered'], required: true },
      { name: 'flavor', label: 'Flavor', type: 'select', options: ['Vanilla', 'Chocolate', 'Red Velvet', 'Carrot', 'Lemon'], required: true },
      { name: 'frosting', label: 'Frosting', type: 'select', options: ['Buttercream', 'Fondant', 'Cream Cheese', 'Whipped Cream'], required: true },
      { name: 'decoration', label: 'Decoration Description', type: 'textarea', required: true },
      { name: 'message', label: 'Cake Message', type: 'text' },
      { name: 'pickup_date', label: 'Pickup Date', type: 'date', required: true },
    ], 'orders'), language: 'typescript' };
      case 'customer-table-bakery':
        return { path: 'src/components/CustomerTableBakery.tsx', content: this.generateEntityTableComponent('CustomerTableBakery', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_orders', label: 'Total Orders' },
      { key: 'last_order', label: 'Last Order', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-bakery':
        return { path: 'src/components/CustomerProfileBakery.tsx', content: generateCustomerProfileBakery({}), language: 'typescript' };
      case 'inventory-table-bakery':
        return { path: 'src/components/InventoryTableBakery.tsx', content: this.generateEntityTableComponent('InventoryTableBakery', 'ingredient', [
      { key: 'name', label: 'Ingredient' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'In Stock' },
      { key: 'unit', label: 'Unit' },
      { key: 'reorder_level', label: 'Reorder Level' },
      { key: 'unit_cost', label: 'Cost', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'ingredients'), language: 'typescript' };
      case 'ingredient-usage':
        return { path: 'src/components/IngredientUsage.tsx', content: this.generateEntityTableComponent('IngredientUsage', 'usage', [
      { key: 'ingredient', label: 'Ingredient' },
      { key: 'product', label: 'Product' },
      { key: 'quantity_used', label: 'Used' },
      { key: 'date', label: 'Date', type: 'date' },
    ], 'usage'), language: 'typescript' };
      case 'public-menu-bakery':
        return { path: 'src/components/PublicMenuBakery.tsx', content: this.generateEntityGridComponent('PublicMenuBakery', 'product', { title: 'name', subtitle: 'category', badge: 'price', image: 'image' }, 'products'), language: 'typescript' };
      case 'order-form-public-bakery':
        return { path: 'src/components/OrderFormPublicBakery.tsx', content: this.generatePublicFormComponent('OrderFormPublicBakery', 'order', [
      { name: 'customer_name', label: 'Your Name', type: 'text', required: true },
      { name: 'customer_phone', label: 'Phone', type: 'tel', required: true },
      { name: 'customer_email', label: 'Email', type: 'email', required: true },
      { name: 'items', label: 'Items', type: 'textarea', required: true },
      { name: 'pickup_date', label: 'Pickup Date', type: 'date', required: true },
      { name: 'pickup_time', label: 'Pickup Time', type: 'time', required: true },
      { name: 'special_instructions', label: 'Special Instructions', type: 'textarea' },
    ], 'orders'), language: 'typescript' };

      // ===== Print Shop =====
      case 'printshop-stats':
        return { path: 'src/components/PrintshopStats.tsx', content: generatePrintshopStats({}), language: 'typescript' };
      case 'active-jobs':
        return { path: 'src/components/ActiveJobs.tsx', content: generateActiveJobs({}), language: 'typescript' };
      case 'quote-requests':
        return { path: 'src/components/QuoteRequests.tsx', content: generateQuoteRequests({}), language: 'typescript' };
      case 'job-table':
        return { path: 'src/components/JobTable.tsx', content: this.generateEntityTableComponent('JobTable', 'job', [
      { key: 'job_number', label: 'Job #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'product', label: 'Product' },
      { key: 'quantity', label: 'Qty' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'jobs'), language: 'typescript' };
      case 'job-timeline':
        return { path: 'src/components/JobTimeline.tsx', content: generateJobTimeline({}), language: 'typescript' };
      case 'job-form':
        return { path: 'src/components/JobForm.tsx', content: this.generatePublicFormComponent('JobForm', 'job', [
      { name: 'customer_id', label: 'Customer', type: 'select', required: true },
      { name: 'product', label: 'Product', type: 'select', options: ['Business Cards', 'Flyers', 'Brochures', 'Posters', 'Banners', 'Booklets', 'Custom'], required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'paper_stock', label: 'Paper Stock', type: 'select', options: ['Matte', 'Gloss', 'Uncoated', 'Cardstock', 'Premium'] },
      { name: 'finish', label: 'Finish', type: 'select', options: ['None', 'Gloss Laminate', 'Matte Laminate', 'UV Coating', 'Emboss'] },
      { name: 'specifications', label: 'Specifications', type: 'textarea' },
      { name: 'due_date', label: 'Due Date', type: 'date', required: true },
    ], 'jobs'), language: 'typescript' };
      case 'customer-table-printshop':
        return { path: 'src/components/CustomerTablePrintshop.tsx', content: this.generateEntityTableComponent('CustomerTablePrintshop', 'customer', [
      { key: 'company_name', label: 'Company' },
      { key: 'contact_name', label: 'Contact' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_jobs', label: 'Total Jobs' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-printshop':
        return { path: 'src/components/CustomerProfilePrintshop.tsx', content: generateCustomerProfilePrintshop({}), language: 'typescript' };
      case 'customer-jobs':
        return { path: 'src/components/CustomerJobs.tsx', content: this.generateEntityTableComponent('CustomerJobs', 'job', [
      { key: 'job_number', label: 'Job #' },
      { key: 'product', label: 'Product' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'jobs'), language: 'typescript' };
      case 'product-grid-printshop':
        return { path: 'src/components/ProductGridPrintshop.tsx', content: this.generateEntityGridComponent('ProductGridPrintshop', 'product', { title: 'name', subtitle: 'category', badge: 'base_price', image: 'image' }, 'products'), language: 'typescript' };
      case 'product-detail-printshop':
        return { path: 'src/components/ProductDetailPrintshop.tsx', content: this.generateEntityDetailComponent('ProductDetailPrintshop', 'product', [
      { key: 'name', label: 'Name', icon: 'Printer' },
      { key: 'category', label: 'Category', icon: 'Tag' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'base_price', label: 'Base Price', type: 'currency', icon: 'DollarSign' },
      { key: 'sizes_available', label: 'Sizes', icon: 'Maximize' },
      { key: 'paper_options', label: 'Paper Options', icon: 'Layers' },
      { key: 'turnaround_time', label: 'Turnaround', icon: 'Clock' },
    ], 'products'), language: 'typescript' };
      case 'equipment-grid':
        return { path: 'src/components/EquipmentGrid.tsx', content: this.generateEntityGridComponent('EquipmentGrid', 'equipment', { title: 'name', subtitle: 'type', badge: 'status', image: 'image' }, 'equipment'), language: 'typescript' };
      case 'equipment-detail':
        return { path: 'src/components/EquipmentDetail.tsx', content: this.generateEntityDetailComponent('EquipmentDetail', 'equipment', [
      { key: 'name', label: 'Name', icon: 'Printer' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'model', label: 'Model', icon: 'Info' },
      { key: 'serial_number', label: 'Serial Number', icon: 'Hash' },
      { key: 'last_maintenance', label: 'Last Maintenance', type: 'date', icon: 'Wrench' },
      { key: 'next_maintenance', label: 'Next Maintenance', type: 'date', icon: 'Calendar' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'equipment'), language: 'typescript' };
      case 'quote-table-printshop':
        return { path: 'src/components/QuoteTablePrintshop.tsx', content: this.generateEntityTableComponent('QuoteTablePrintshop', 'quote', [
      { key: 'quote_number', label: 'Quote #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'product', label: 'Product' },
      { key: 'quantity', label: 'Qty' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'valid_until', label: 'Valid Until', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'quotes'), language: 'typescript' };
      case 'quote-form':
        return { path: 'src/components/QuoteForm.tsx', content: this.generatePublicFormComponent('QuoteForm', 'quote', [
      { name: 'customer_id', label: 'Customer', type: 'select', required: true },
      { name: 'product', label: 'Product', type: 'select', options: ['Business Cards', 'Flyers', 'Brochures', 'Posters', 'Banners', 'Custom'], required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'specifications', label: 'Specifications', type: 'textarea' },
      { name: 'valid_until', label: 'Valid Until', type: 'date' },
    ], 'quotes'), language: 'typescript' };
      case 'public-products-printshop':
        return { path: 'src/components/PublicProductsPrintshop.tsx', content: this.generateEntityGridComponent('PublicProductsPrintshop', 'product', { title: 'name', subtitle: 'category', badge: 'base_price', image: 'image' }, 'products'), language: 'typescript' };
      case 'quote-request-form-printshop':
        return { path: 'src/components/QuoteRequestFormPrintshop.tsx', content: this.generatePublicFormComponent('QuoteRequestFormPrintshop', 'quote', [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'product', label: 'Product', type: 'select', options: ['Business Cards', 'Flyers', 'Brochures', 'Posters', 'Banners', 'Custom'], required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'specifications', label: 'Project Details', type: 'textarea', required: true },
      { name: 'deadline', label: 'Needed By', type: 'date' },
    ], 'quotes'), language: 'typescript' };

      // ===== Auto Repair =====
      case 'autorepair-stats':
        return { path: 'src/components/AutorepairStats.tsx', content: generateAutorepairStats({}), language: 'typescript' };
      case 'active-work-orders':
        return { path: 'src/components/ActiveWorkOrders.tsx', content: generateActiveWorkOrders({}), language: 'typescript' };
      case 'service-bay-status':
        return { path: 'src/components/ServiceBayStatus.tsx', content: this.generateEntityGridComponent('ServiceBayStatus', 'bay', { title: 'bay_number', subtitle: 'vehicle', badge: 'status' }, 'bays'), language: 'typescript' };
      case 'work-order-filters':
        return { path: 'src/components/WorkOrderFilters.tsx', content: generateWorkOrderFilters({}), language: 'typescript' };
      case 'work-order-table':
        return { path: 'src/components/WorkOrderTable.tsx', content: this.generateEntityTableComponent('WorkOrderTable', 'work_order', [
      { key: 'order_number', label: 'WO #' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'service_type', label: 'Service' },
      { key: 'technician', label: 'Technician' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'work_orders'), language: 'typescript' };
      case 'work-order-detail':
        return { path: 'src/components/WorkOrderDetail.tsx', content: this.generateEntityDetailComponent('WorkOrderDetail', 'work_order', [
      { key: 'order_number', label: 'Work Order #', icon: 'FileText' },
      { key: 'vehicle', label: 'Vehicle', icon: 'Car' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'service_type', label: 'Service Type', icon: 'Wrench' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'technician', label: 'Technician', icon: 'UserCog' },
      { key: 'parts_used', label: 'Parts Used', icon: 'Package' },
      { key: 'labor_hours', label: 'Labor Hours', icon: 'Clock' },
      { key: 'parts_cost', label: 'Parts Cost', type: 'currency', icon: 'DollarSign' },
      { key: 'labor_cost', label: 'Labor Cost', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'work_orders'), language: 'typescript' };
      case 'work-order-timeline':
        return { path: 'src/components/WorkOrderTimeline.tsx', content: generateWorkOrderTimeline({}), language: 'typescript' };
      case 'work-order-form':
        return { path: 'src/components/WorkOrderForm.tsx', content: this.generatePublicFormComponent('WorkOrderForm', 'work_order', [
      { name: 'vehicle_id', label: 'Vehicle', type: 'select', required: true },
      { name: 'service_type', label: 'Service Type', type: 'select', options: ['Oil Change', 'Brake Service', 'Engine Repair', 'Transmission', 'Tire Service', 'General Maintenance', 'Diagnostics'], required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'technician_id', label: 'Assign Technician', type: 'select' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Normal', 'High', 'Urgent'] },
    ], 'work_orders'), language: 'typescript' };
      case 'vehicle-table':
        return { path: 'src/components/VehicleTable.tsx', content: this.generateEntityTableComponent('VehicleTable', 'vehicle', [
      { key: 'year', label: 'Year' },
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'license_plate', label: 'Plate' },
      { key: 'owner_name', label: 'Owner' },
      { key: 'last_service', label: 'Last Service', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'vehicles'), language: 'typescript' };
      case 'vehicle-profile':
        return { path: 'src/components/VehicleProfile.tsx', content: generateVehicleProfile({}), language: 'typescript' };
      case 'vehicle-form':
        return { path: 'src/components/VehicleForm.tsx', content: this.generatePublicFormComponent('VehicleForm', 'vehicle', [
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'make', label: 'Make', type: 'text', required: true },
      { name: 'model', label: 'Model', type: 'text', required: true },
      { name: 'vin', label: 'VIN', type: 'text' },
      { name: 'license_plate', label: 'License Plate', type: 'text', required: true },
      { name: 'color', label: 'Color', type: 'text' },
      { name: 'mileage', label: 'Current Mileage', type: 'number' },
      { name: 'owner_id', label: 'Owner', type: 'select', required: true },
    ], 'vehicles'), language: 'typescript' };
      case 'customer-table-autorepair':
        return { path: 'src/components/CustomerTableAutorepair.tsx', content: this.generateEntityTableComponent('CustomerTableAutorepair', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'vehicles_count', label: 'Vehicles' },
      { key: 'total_spent', label: 'Total Spent', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-autorepair':
        return { path: 'src/components/CustomerProfileAutorepair.tsx', content: generateCustomerProfileAutorepair({}), language: 'typescript' };
      case 'customer-vehicles':
        return { path: 'src/components/CustomerVehicles.tsx', content: this.generateEntityTableComponent('CustomerVehicles', 'vehicle', [
      { key: 'year', label: 'Year' },
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'license_plate', label: 'Plate' },
      { key: 'last_service', label: 'Last Service', type: 'date' },
    ], 'vehicles'), language: 'typescript' };
      case 'technician-grid':
        return { path: 'src/components/TechnicianGrid.tsx', content: this.generateEntityGridComponent('TechnicianGrid', 'technician', { title: 'name', subtitle: 'specialization', badge: 'status', image: 'photo' }, 'technicians'), language: 'typescript' };
      case 'technician-profile':
        return { path: 'src/components/TechnicianProfile.tsx', content: generateTechnicianProfile({}), language: 'typescript' };
      case 'technician-schedule':
        return { path: 'src/components/TechnicianSchedule.tsx', content: generateTechnicianSchedule({}), language: 'typescript' };
      case 'parts-inventory':
        return { path: 'src/components/PartsInventory.tsx', content: this.generateEntityTableComponent('PartsInventory', 'part', [
      { key: 'part_number', label: 'Part #' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'In Stock' },
      { key: 'cost', label: 'Cost', type: 'currency' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'parts'), language: 'typescript' };
      case 'appointment-form-autorepair':
        return { path: 'src/components/AppointmentFormAutorepair.tsx', content: this.generatePublicFormComponent('AppointmentFormAutorepair', 'appointment', [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'vehicle_year', label: 'Vehicle Year', type: 'number', required: true },
      { name: 'vehicle_make', label: 'Vehicle Make', type: 'text', required: true },
      { name: 'vehicle_model', label: 'Vehicle Model', type: 'text', required: true },
      { name: 'service_type', label: 'Service Needed', type: 'select', options: ['Oil Change', 'Brake Service', 'Engine Repair', 'Tire Service', 'General Maintenance', 'Diagnostics', 'Other'], required: true },
      { name: 'preferred_time', label: 'Preferred Time', type: 'time' },
    ], 'appointments'), language: 'typescript' };

      // ===== House Cleaning Service =====
      case 'cleaning-stats':
        return { path: 'src/components/CleaningStats.tsx', content: generateCleaningStats({}), language: 'typescript' };
      case 'today-schedule':
        return { path: 'src/components/TodaySchedule.tsx', content: generateTodaySchedule({}), language: 'typescript' };
      case 'cleaner-availability':
        return { path: 'src/components/CleanerAvailability.tsx', content: this.generateEntityGridComponent('CleanerAvailability', 'cleaner', { title: 'name', subtitle: 'current_job', badge: 'status', image: 'photo' }, 'cleaners'), language: 'typescript' };
      case 'booking-calendar-cleaning':
        return { path: 'src/components/BookingCalendarCleaning.tsx', content: generateBookingCalendarCleaning({}), language: 'typescript' };
      case 'booking-detail-cleaning':
        return { path: 'src/components/BookingDetailCleaning.tsx', content: this.generateEntityDetailComponent('BookingDetailCleaning', 'booking', [
      { key: 'booking_number', label: 'Booking #', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'address', label: 'Address', icon: 'MapPin' },
      { key: 'service_type', label: 'Service Type', icon: 'Sparkles' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'duration', label: 'Duration', icon: 'Timer' },
      { key: 'cleaner', label: 'Cleaner', icon: 'UserCheck' },
      { key: 'special_instructions', label: 'Instructions', icon: 'Info' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'bookings'), language: 'typescript' };
      case 'booking-form-cleaning':
        return { path: 'src/components/BookingFormCleaning.tsx', content: this.generatePublicFormComponent('BookingFormCleaning', 'booking', [
      { name: 'customer_id', label: 'Customer', type: 'select', required: true },
      { name: 'service_type', label: 'Service Type', type: 'select', options: ['Standard Clean', 'Deep Clean', 'Move-In/Out', 'Post-Construction', 'Office Clean'], required: true },
      { name: 'address', label: 'Address', type: 'textarea', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'time', required: true },
      { name: 'cleaner_id', label: 'Assign Cleaner', type: 'select' },
      { name: 'special_instructions', label: 'Special Instructions', type: 'textarea' },
    ], 'bookings'), language: 'typescript' };
      case 'customer-table-cleaning':
        return { path: 'src/components/CustomerTableCleaning.tsx', content: this.generateEntityTableComponent('CustomerTableCleaning', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'total_bookings', label: 'Bookings' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-cleaning':
        return { path: 'src/components/CustomerProfileCleaning.tsx', content: generateCustomerProfileCleaning({}), language: 'typescript' };
      case 'customer-bookings-cleaning':
        return { path: 'src/components/CustomerBookingsCleaning.tsx', content: this.generateEntityTableComponent('CustomerBookingsCleaning', 'booking', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'service_type', label: 'Service' },
      { key: 'cleaner', label: 'Cleaner' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'bookings'), language: 'typescript' };
      case 'recurring-schedule':
        return { path: 'src/components/RecurringSchedule.tsx', content: this.generateEntityTableComponent('RecurringSchedule', 'schedule', [
      { key: 'customer_name', label: 'Customer' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'day_of_week', label: 'Day' },
      { key: 'time', label: 'Time' },
      { key: 'service_type', label: 'Service' },
      { key: 'next_date', label: 'Next Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'schedules'), language: 'typescript' };
      case 'cleaner-grid':
        return { path: 'src/components/CleanerGrid.tsx', content: this.generateEntityGridComponent('CleanerGrid', 'cleaner', { title: 'name', subtitle: 'specialization', badge: 'status', image: 'photo' }, 'cleaners'), language: 'typescript' };
      case 'cleaner-profile':
        return { path: 'src/components/CleanerProfile.tsx', content: generateCleanerProfile({}), language: 'typescript' };
      case 'cleaner-schedule':
        return { path: 'src/components/CleanerSchedule.tsx', content: generateCleanerSchedule({}), language: 'typescript' };
      case 'service-grid-cleaning':
        return { path: 'src/components/ServiceGridCleaning.tsx', content: this.generateEntityGridComponent('ServiceGridCleaning', 'service', { title: 'name', subtitle: 'description', badge: 'price' }, 'services'), language: 'typescript' };
      case 'booking-form-public-cleaning':
        return { path: 'src/components/BookingFormPublicCleaning.tsx', content: this.generatePublicFormComponent('BookingFormPublicCleaning', 'booking', [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'address', label: 'Address', type: 'textarea', required: true },
      { name: 'property_type', label: 'Property Type', type: 'select', options: ['House', 'Apartment', 'Office', 'Other'], required: true },
      { name: 'property_size', label: 'Size (sq ft)', type: 'number' },
      { name: 'service_type', label: 'Service Type', type: 'select', options: ['Standard Clean', 'Deep Clean', 'Move-In/Out', 'Post-Construction'], required: true },
      { name: 'preferred_date', label: 'Preferred Date', type: 'date', required: true },
      { name: 'preferred_time', label: 'Preferred Time', type: 'time' },
      { name: 'special_instructions', label: 'Special Instructions', type: 'textarea' },
    ], 'bookings'), language: 'typescript' };

      // ===== Moving Company =====
      case 'moving-stats':
        return { path: 'src/components/MovingStats.tsx', content: generateMovingStats({}), language: 'typescript' };
      case 'upcoming-moves':
        return { path: 'src/components/UpcomingMoves.tsx', content: generateUpcomingMoves({}), language: 'typescript' };
      case 'crew-availability':
        return { path: 'src/components/CrewAvailability.tsx', content: this.generateEntityGridComponent('CrewAvailability', 'crew', { title: 'name', subtitle: 'current_job', badge: 'status' }, 'crews'), language: 'typescript' };
      case 'estimate-filters':
        return { path: 'src/components/EstimateFilters.tsx', content: generateEstimateFilters({}), language: 'typescript' };
      case 'estimate-table':
        return { path: 'src/components/EstimateTable.tsx', content: this.generateEntityTableComponent('EstimateTable', 'estimate', [
      { key: 'estimate_number', label: 'Estimate #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'move_type', label: 'Type' },
      { key: 'move_date', label: 'Move Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'estimates'), language: 'typescript' };
      case 'estimate-detail':
        return { path: 'src/components/EstimateDetail.tsx', content: this.generateEntityDetailComponent('EstimateDetail', 'estimate', [
      { key: 'estimate_number', label: 'Estimate #', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'move_type', label: 'Move Type', icon: 'Truck' },
      { key: 'origin_address', label: 'From', icon: 'MapPin' },
      { key: 'destination_address', label: 'To', icon: 'MapPin' },
      { key: 'move_date', label: 'Move Date', type: 'date', icon: 'Calendar' },
      { key: 'inventory', label: 'Inventory', icon: 'Package' },
      { key: 'labor_cost', label: 'Labor', type: 'currency', icon: 'DollarSign' },
      { key: 'materials_cost', label: 'Materials', type: 'currency', icon: 'DollarSign' },
      { key: 'travel_cost', label: 'Travel', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'estimates'), language: 'typescript' };
      case 'estimate-form':
        return { path: 'src/components/EstimateForm.tsx', content: this.generatePublicFormComponent('EstimateForm', 'estimate', [
      { name: 'customer_id', label: 'Customer', type: 'select', required: true },
      { name: 'move_type', label: 'Move Type', type: 'select', options: ['Local', 'Long Distance', 'Commercial', 'International'], required: true },
      { name: 'origin_address', label: 'Origin Address', type: 'textarea', required: true },
      { name: 'destination_address', label: 'Destination Address', type: 'textarea', required: true },
      { name: 'move_date', label: 'Move Date', type: 'date', required: true },
      { name: 'inventory', label: 'Inventory Description', type: 'textarea' },
      { name: 'labor_cost', label: 'Labor Cost', type: 'number' },
      { name: 'materials_cost', label: 'Materials Cost', type: 'number' },
      { name: 'travel_cost', label: 'Travel Cost', type: 'number' },
    ], 'estimates'), language: 'typescript' };
      case 'move-calendar':
        return { path: 'src/components/MoveCalendar.tsx', content: generateMoveCalendar({}), language: 'typescript' };
      case 'move-detail':
        return {
          path: 'src/components/MoveDetail.tsx',
          content: this.generateEntityDetailComponent('MoveDetail', 'move', [
            { key: 'move_number', label: 'Move' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'start_time', label: 'Start' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'moves'),
          language: 'typescript',
        };
      case 'customer-table-moving':
        return { path: 'src/components/CustomerTableMoving.tsx', content: this.generateEntityTableComponent('CustomerTableMoving', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_moves', label: 'Moves' },
      { key: 'total_spent', label: 'Total Spent', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-moving':
        return { path: 'src/components/CustomerProfileMoving.tsx', content: generateCustomerProfileMoving({}), language: 'typescript' };
      case 'customer-moves':
        return { path: 'src/components/CustomerMoves.tsx', content: this.generateEntityTableComponent('CustomerMoves', 'move', [
      { key: 'move_date', label: 'Date', type: 'date' },
      { key: 'move_type', label: 'Type' },
      { key: 'origin', label: 'From' },
      { key: 'destination', label: 'To' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'moves'), language: 'typescript' };
      case 'truck-grid':
        return { path: 'src/components/TruckGrid.tsx', content: this.generateEntityGridComponent('TruckGrid', 'truck', { title: 'name', subtitle: 'type', badge: 'status', image: 'image' }, 'trucks'), language: 'typescript' };
      case 'truck-detail':
        return { path: 'src/components/TruckDetail.tsx', content: this.generateEntityDetailComponent('TruckDetail', 'truck', [
      { key: 'name', label: 'Name', icon: 'Truck' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'license_plate', label: 'License Plate', icon: 'CreditCard' },
      { key: 'capacity', label: 'Capacity', icon: 'Package' },
      { key: 'year', label: 'Year', icon: 'Calendar' },
      { key: 'last_maintenance', label: 'Last Maintenance', type: 'date', icon: 'Wrench' },
      { key: 'mileage', label: 'Mileage', icon: 'Gauge' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'trucks'), language: 'typescript' };
      case 'truck-schedule':
        return { path: 'src/components/TruckSchedule.tsx', content: generateTruckSchedule({}), language: 'typescript' };
      case 'inventory-list-moving':
        return { path: 'src/components/InventoryListMoving.tsx', content: this.generateEntityTableComponent('InventoryListMoving', 'item', [
      { key: 'name', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Qty' },
      { key: 'weight', label: 'Weight' },
      { key: 'fragile', label: 'Fragile', type: 'boolean' },
      { key: 'notes', label: 'Notes' },
    ], 'items'), language: 'typescript' };
      case 'estimate-request-form':
        return { path: 'src/components/EstimateRequestForm.tsx', content: this.generatePublicFormComponent('EstimateRequestForm', 'estimate', [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'move_type', label: 'Move Type', type: 'select', options: ['Local', 'Long Distance', 'Commercial', 'International'], required: true },
      { name: 'origin_address', label: 'Moving From', type: 'textarea', required: true },
      { name: 'destination_address', label: 'Moving To', type: 'textarea', required: true },
      { name: 'move_date', label: 'Preferred Move Date', type: 'date', required: true },
      { name: 'property_size', label: 'Property Size', type: 'select', options: ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom', 'Office'], required: true },
      { name: 'special_items', label: 'Special Items (piano, safe, etc.)', type: 'textarea' },
      { name: 'additional_services', label: 'Additional Services', type: 'textarea' },
    ], 'estimates'), language: 'typescript' };
      case 'expiring-rentals':
        return { path: 'src/components/ExpiringRentals.tsx', content: generateExpiringRentals({}), language: 'typescript' };
      case 'unit-filters':
        return { path: 'src/components/UnitFilters.tsx', content: generateUnitFilters({}), language: 'typescript' };
      case 'unit-grid':
        return { path: 'src/components/UnitGrid.tsx', content: this.generateEntityGridComponent('UnitGrid', 'unit', { title: 'unit_number', subtitle: 'size', badge: 'status' }, 'units'), language: 'typescript' };
      case 'unit-detail':
        return { path: 'src/components/UnitDetail.tsx', content: this.generateEntityDetailComponent('UnitDetail', 'unit', [
      { key: 'unit_number', label: 'Unit Number', icon: 'Hash' },
      { key: 'size', label: 'Size', icon: 'Maximize' },
      { key: 'floor', label: 'Floor', icon: 'Layers' },
      { key: 'climate_control', label: 'Climate Control', icon: 'Thermometer' },
      { key: 'monthly_rate', label: 'Monthly Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'current_tenant', label: 'Current Tenant', icon: 'User' },
      { key: 'lease_start', label: 'Lease Start', type: 'date', icon: 'Calendar' },
      { key: 'lease_end', label: 'Lease End', type: 'date', icon: 'Calendar' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'units'), language: 'typescript' };
      case 'unit-availability':
        return { path: 'src/components/UnitAvailability.tsx', content: generateUnitAvailability({}), language: 'typescript' };
      case 'rental-filters':
        return { path: 'src/components/RentalFilters.tsx', content: generateRentalFilters({}), language: 'typescript' };
      case 'rental-table':
        return { path: 'src/components/RentalTable.tsx', content: this.generateEntityTableComponent('RentalTable', 'rental', [
      { key: 'unit_number', label: 'Unit' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'monthly_rate', label: 'Rate', type: 'currency' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'rentals'), language: 'typescript' };
      case 'rental-detail':
        return { path: 'src/components/RentalDetail.tsx', content: this.generateEntityDetailComponent('RentalDetail', 'rental', [
      { key: 'rental_number', label: 'Rental #', icon: 'FileText' },
      { key: 'unit_number', label: 'Unit', icon: 'Warehouse' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'end_date', label: 'End Date', type: 'date', icon: 'Calendar' },
      { key: 'monthly_rate', label: 'Monthly Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'deposit', label: 'Deposit', type: 'currency', icon: 'DollarSign' },
      { key: 'balance', label: 'Balance Due', type: 'currency', icon: 'DollarSign' },
      { key: 'access_code', label: 'Monthly Rate', type: 'number', required: true },
      { name: 'deposit', label: 'Deposit', type: 'number' },
      { name: 'auto_renew', label: 'Auto Renew', type: 'checkbox' },
    ], 'rentals'), language: 'typescript' };
      case 'customer-table-storage':
        return { path: 'src/components/CustomerTableStorage.tsx', content: this.generateEntityTableComponent('CustomerTableStorage', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'units_rented', label: 'Units' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-storage':
        return { path: 'src/components/CustomerProfileStorage.tsx', content: generateCustomerProfileStorage({}), language: 'typescript' };
      case 'customer-units':
        return { path: 'src/components/CustomerUnits.tsx', content: this.generateEntityTableComponent('CustomerUnits', 'rental', [
      { key: 'unit_number', label: 'Unit' },
      { key: 'size', label: 'Size' },
      { key: 'monthly_rate', label: 'Rate', type: 'currency' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'rentals'), language: 'typescript' };
      case 'payment-table-storage':
        return { path: 'src/components/PaymentTableStorage.tsx', content: this.generateEntityTableComponent('PaymentTableStorage', 'payment', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'unit_number', label: 'Unit' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'method', label: 'Method' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'payments'), language: 'typescript' };
      case 'unit-browser-public':
        return { path: 'src/components/UnitBrowserPublic.tsx', content: this.generateEntityGridComponent('UnitBrowserPublic', 'unit', { title: 'size', subtitle: 'features', badge: 'monthly_rate' }, 'units'), language: 'typescript' };
      case 'rental-form-public':
        return { path: 'src/components/RentalFormPublic.tsx', content: this.generatePublicFormComponent('RentalFormPublic', 'rental', [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'unit_size', label: 'Unit Size', type: 'select', options: ['Small (5x5)', 'Medium (10x10)', 'Large (10x20)', 'Extra Large (10x30)'], required: true },
      { name: 'climate_control', label: 'Climate Control', type: 'checkbox' },
      { name: 'start_date', label: 'Move-in Date', type: 'date', required: true },
      { name: 'rental_duration', label: 'Expected Duration', type: 'select', options: ['1-3 months', '3-6 months', '6-12 months', '1+ year'] },
      { name: 'items_storing', label: 'What are you storing?', type: 'textarea' },
    ], 'rentals'), language: 'typescript' };

      // ===== Law Firm =====
      case 'lawfirm-stats':
        return { path: 'src/components/LawfirmStats.tsx', content: generateLawfirmStats({}), language: 'typescript' };
      case 'case-list-active':
        return { path: 'src/components/CaseListActive.tsx', content: generateCaseListActive({}), language: 'typescript' };
      case 'deadline-list-lawfirm':
        return { path: 'src/components/DeadlineListLawfirm.tsx', content: generateDeadlineListLawfirm({}), language: 'typescript' };
      case 'case-filters-lawfirm':
        return { path: 'src/components/CaseFiltersLawfirm.tsx', content: generateCaseFiltersLawfirm({}), language: 'typescript' };
      case 'case-table-lawfirm':
        return { path: 'src/components/CaseTableLawfirm.tsx', content: this.generateEntityTableComponent('CaseTableLawfirm', 'case', [
      { key: 'case_number', label: 'Case #' },
      { key: 'client_name', label: 'Client' },
      { key: 'practice_area', label: 'Practice Area' },
      { key: 'attorney', label: 'Attorney' },
      { key: 'open_date', label: 'Opened', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'cases'), language: 'typescript' };
      case 'case-header-lawfirm':
        return { path: 'src/components/CaseHeaderLawfirm.tsx', content: this.generateEntityDetailComponent('CaseHeaderLawfirm', 'case', [
      { key: 'case_number', label: 'Case Number', icon: 'FileText' },
      { key: 'title', label: 'Title', icon: 'Scale' },
      { key: 'client_name', label: 'Client', icon: 'User' },
      { key: 'practice_area', label: 'Practice Area', icon: 'Briefcase' },
      { key: 'attorney', label: 'Lead Attorney', icon: 'UserCheck' },
      { key: 'open_date', label: 'Opened', type: 'date', icon: 'Calendar' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'cases'), language: 'typescript' };
      case 'case-timeline-lawfirm':
        return { path: 'src/components/CaseTimelineLawfirm.tsx', content: generateCaseTimelineLawfirm({}), language: 'typescript' };
      case 'case-documents':
        return { path: 'src/components/CaseDocuments.tsx', content: this.generateEntityTableComponent('CaseDocuments', 'document', [
      { key: 'name', label: 'Document' },
      { key: 'type', label: 'Type' },
      { key: 'uploaded_by', label: 'Uploaded By' },
      { key: 'date', label: 'Date', type: 'date' },
    ], 'documents'), language: 'typescript' };
      case 'case-time-entries':
        return { path: 'src/components/CaseTimeEntries.tsx', content: this.generateEntityTableComponent('CaseTimeEntries', 'time_entry', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'attorney', label: 'Attorney' },
      { key: 'description', label: 'Description' },
      { key: 'hours', label: 'Hours' },
      { key: 'rate', label: 'Rate', type: 'currency' },
      { key: 'total', label: 'Total', type: 'currency' },
    ], 'time_entries'), language: 'typescript' };
      case 'client-table-lawfirm':
        return { path: 'src/components/ClientTableLawfirm.tsx', content: this.generateEntityTableComponent('ClientTableLawfirm', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'active_cases', label: 'Cases' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'clients'), language: 'typescript' };
      case 'client-profile-lawfirm':
        return { path: 'src/components/ClientProfileLawfirm.tsx', content: generateClientProfileLawfirm({}), language: 'typescript' };
      case 'client-cases':
        return { path: 'src/components/ClientCases.tsx', content: this.generateEntityTableComponent('ClientCases', 'case', [
      { key: 'case_number', label: 'Case #' },
      { key: 'title', label: 'Title' },
      { key: 'attorney', label: 'Attorney' },
      { key: 'open_date', label: 'Opened', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'cases'), language: 'typescript' };
      case 'client-billing':
        return { path: 'src/components/ClientBilling.tsx', content: this.generateEntityTableComponent('ClientBilling', 'invoice', [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'paid', label: 'Paid', type: 'currency' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'invoices'), language: 'typescript' };
      case 'matter-table':
        return {
          path: 'src/components/MatterTable.tsx',
          content: this.generateEntityTableComponent('MatterTable', 'matter', [
            { key: 'matter_number', label: 'Matter #' },
            { key: 'name', label: 'Name' },
            { key: 'client_name', label: 'Client' },
            { key: 'open_date', label: 'Opened', type: 'date' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'matters'),
          language: 'typescript',
        };
      case 'attorney-grid':
        return { path: 'src/components/AttorneyGrid.tsx', content: this.generateEntityGridComponent('AttorneyGrid', 'attorney', { title: 'name', subtitle: 'practice_area', badge: 'status', image: 'photo' }, 'attorneys'), language: 'typescript' };
      case 'attorney-profile':
        return { path: 'src/components/AttorneyProfile.tsx', content: generateAttorneyProfile({}), language: 'typescript' };
      case 'attorney-cases':
        return { path: 'src/components/AttorneyCases.tsx', content: this.generateEntityTableComponent('AttorneyCases', 'case', [
      { key: 'case_number', label: 'Case #' },
      { key: 'client', label: 'Client' },
      { key: 'practice_area', label: 'Practice Area' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'cases'), language: 'typescript' };
      case 'time-entry-table-lawfirm':
        return { path: 'src/components/TimeEntryTableLawfirm.tsx', content: this.generateEntityTableComponent('TimeEntryTableLawfirm', 'time_entry', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'case', label: 'Case' },
      { key: 'attorney', label: 'Attorney' },
      { key: 'description', label: 'Description' },
      { key: 'hours', label: 'Hours' },
      { key: 'billable', label: 'Billable', type: 'boolean' },
    ], 'time_entries'), language: 'typescript' };
      case 'time-entry-form':
        return { path: 'src/components/TimeEntryForm.tsx', content: this.generatePublicFormComponent('TimeEntryForm', 'time_entry', [
      { name: 'case_id', label: 'Case', type: 'select', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'hours', label: 'Hours', type: 'number', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'billable', label: 'Billable', type: 'checkbox' },
    ], 'time_entries'), language: 'typescript' };
      case 'billing-overview':
        return { path: 'src/components/BillingOverview.tsx', content: generateBillingOverview({}), language: 'typescript' };
      case 'invoice-table-lawfirm':
        return { path: 'src/components/InvoiceTableLawfirm.tsx', content: this.generateEntityTableComponent('InvoiceTableLawfirm', 'invoice', [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'client', label: 'Client' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'invoices'), language: 'typescript' };

      // ===== Accounting Firm =====
      case 'accounting-stats':
        return { path: 'src/components/AccountingStats.tsx', content: generateAccountingStats({}), language: 'typescript' };
      case 'deadline-list-accounting':
        return { path: 'src/components/DeadlineListAccounting.tsx', content: generateDeadlineListAccounting({}), language: 'typescript' };
      case 'pending-items':
        return { path: 'src/components/PendingItems.tsx', content: generatePendingItems({}), language: 'typescript' };
      case 'client-table-accounting':
        return { path: 'src/components/ClientTableAccounting.tsx', content: this.generateEntityTableComponent('ClientTableAccounting', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'services', label: 'Services' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'clients'), language: 'typescript' };
      case 'client-profile-accounting':
        return { path: 'src/components/ClientProfileAccounting.tsx', content: generateClientProfileAccounting({}), language: 'typescript' };
      case 'client-services':
        return { path: 'src/components/ClientServices.tsx', content: this.generateEntityTableComponent('ClientServices', 'service', [
      { key: 'service_type', label: 'Service' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'fee', label: 'Fee', type: 'currency' },
      { key: 'last_completed', label: 'Last Completed', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'services'), language: 'typescript' };
      case 'client-documents':
        return { path: 'src/components/ClientDocuments.tsx', content: this.generateEntityTableComponent('ClientDocuments', 'document', [
      { key: 'name', label: 'Document' },
      { key: 'type', label: 'Type' },
      { key: 'year', label: 'Year' },
      { key: 'uploaded_date', label: 'Uploaded', type: 'date' },
    ], 'documents'), language: 'typescript' };
      case 'client-form-accounting':
        return { path: 'src/components/ClientFormAccounting.tsx', content: this.generatePublicFormComponent('ClientFormAccounting', 'client', [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Individual', 'Corporation', 'Partnership', 'LLC', 'Non-Profit'], required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'tax_id', label: 'Tax ID / SSN', type: 'text' },
      { name: 'fiscal_year_end', label: 'Fiscal Year End', type: 'date' },
    ], 'clients'), language: 'typescript' };
      case 'tax-return-filters':
        return { path: 'src/components/TaxReturnFilters.tsx', content: generateTaxReturnFilters({}), language: 'typescript' };
      case 'tax-return-table':
        return { path: 'src/components/TaxReturnTable.tsx', content: this.generateEntityTableComponent('TaxReturnTable', 'tax_return', [
      { key: 'client_name', label: 'Client' },
      { key: 'return_type', label: 'Type' },
      { key: 'tax_year', label: 'Year' },
      { key: 'preparer', label: 'Preparer' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'tax_returns'), language: 'typescript' };
      case 'tax-return-detail':
        return { path: 'src/components/TaxReturnDetail.tsx', content: this.generateEntityDetailComponent('TaxReturnDetail', 'tax_return', [
      { key: 'client_name', label: 'Client', icon: 'User' },
      { key: 'return_type', label: 'Return Type', icon: 'FileText' },
      { key: 'tax_year', label: 'Tax Year', icon: 'Calendar' },
      { key: 'preparer', label: 'Preparer', icon: 'UserCheck' },
      { key: 'reviewer', label: 'Reviewer', icon: 'UserCheck' },
      { key: 'due_date', label: 'Due Date', type: 'date', icon: 'AlertCircle' },
      { key: 'extended_date', label: 'Extended Date', type: 'date', icon: 'Calendar' },
      { key: 'fee', label: 'Fee', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'tax_returns'), language: 'typescript' };
      case 'tax-return-form':
        return { path: 'src/components/TaxReturnForm.tsx', content: this.generatePublicFormComponent('TaxReturnForm', 'tax_return', [
      { name: 'client_id', label: 'Client', type: 'select', required: true },
      { name: 'return_type', label: 'Return Type', type: 'select', options: ['1040', '1120', '1120S', '1065', '990', '1041'], required: true },
      { name: 'tax_year', label: 'Tax Year', type: 'number', required: true },
      { name: 'preparer_id', label: 'Preparer', type: 'select', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date', required: true },
      { name: 'fee', label: 'Fee', type: 'number' },
    ], 'tax_returns'), language: 'typescript' };
      case 'payroll-client-list':
        return { path: 'src/components/PayrollClientList.tsx', content: this.generateEntityTableComponent('PayrollClientList', 'client', [
      { key: 'name', label: 'Client' },
      { key: 'employees', label: 'Employees' },
      { key: 'frequency', label: 'Pay Frequency' },
      { key: 'next_payroll', label: 'Next Payroll', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'clients'), language: 'typescript' };
      case 'payroll-detail':
        return { path: 'src/components/PayrollDetail.tsx', content: this.generateEntityDetailComponent('PayrollDetail', 'payroll', [
      { key: 'client_name', label: 'Client', icon: 'Building' },
      { key: 'pay_period', label: 'Pay Period', icon: 'Calendar' },
      { key: 'employees', label: 'Employees', icon: 'Users' },
      { key: 'gross_wages', label: 'Gross Wages', type: 'currency', icon: 'DollarSign' },
      { key: 'taxes', label: 'Taxes', type: 'currency', icon: 'DollarSign' },
      { key: 'net_pay', label: 'Net Pay', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'payrolls'), language: 'typescript' };
      case 'engagement-table':
        return { path: 'src/components/EngagementTable.tsx', content: this.generateEntityTableComponent('EngagementTable', 'engagement', [
      { key: 'client_name', label: 'Client' },
      { key: 'service', label: 'Service' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'fee', label: 'Fee', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'engagements'), language: 'typescript' };
      case 'engagement-detail':
        return {
          path: 'src/components/EngagementDetail.tsx',
          content: this.generateEntityDetailComponent('EngagementDetail', 'engagement', [
            { key: 'service_type', label: 'Service Type', type: 'text', icon: 'Briefcase' },
            { key: 'client_name', label: 'Client', type: 'text', icon: 'User' },
            { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
            { key: 'end_date', label: 'End Date', type: 'date', icon: 'Calendar' },
            { key: 'fee', label: 'Fee', type: 'currency', icon: 'DollarSign' },
            { key: 'status', label: 'Status', type: 'status', icon: 'CheckCircle' },
          ], 'engagements'),
          language: 'typescript',
        };
      case 'document-upload':
        return { path: 'src/components/DocumentUpload.tsx', content: this.generatePublicFormComponent('DocumentUpload', 'document', [
      { name: 'client_id', label: 'Client', type: 'select', required: true },
      { name: 'name', label: 'Document Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Tax Document', 'Financial Statement', 'Bank Statement', 'Receipt', 'Other'], required: true },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'file', label: 'File', type: 'file', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ], 'documents'), language: 'typescript' };
      case 'calendar-accounting':
        return { path: 'src/components/CalendarAccounting.tsx', content: generateCalendarAccounting({}), language: 'typescript' };
      case 'deadline-form':
        return { path: 'src/components/DeadlineForm.tsx', content: this.generatePublicFormComponent('DeadlineForm', 'deadline', [
      { name: 'client_id', label: 'Client', type: 'select' },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Tax Filing', 'Estimated Payment', 'Payroll', 'Other'], required: true },
      { name: 'reminder_days', label: 'Reminder Days Before', type: 'number' },
    ], 'deadlines'), language: 'typescript' };

      // ===== Travel Agency =====
      case 'travelagency-stats':
        return { path: 'src/components/TravelagencyStats.tsx', content: generateTravelagencyStats({}), language: 'typescript' };
      case 'booking-list-travel':
        return { path: 'src/components/BookingListTravel.tsx', content: generateBookingListTravel({}), language: 'typescript' };
      case 'upcoming-departures':
        return { path: 'src/components/UpcomingDepartures.tsx', content: generateUpcomingDepartures({}), language: 'typescript' };
      case 'trip-filters':
        return { path: 'src/components/TripFilters.tsx', content: generateTripFilters({}), language: 'typescript' };
      case 'trip-table':
        return {
          path: 'src/components/TripTable.tsx',
          content: this.generateEntityTableComponent('TripTable', 'trip', [
            { key: 'destination', label: 'Destination' },
            { key: 'departure_date', label: 'Departure', type: 'date' },
            { key: 'return_date', label: 'Return', type: 'date' },
            { key: 'price', label: 'Price', type: 'currency' },
            { key: 'travelers', label: 'Travelers' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'trips'),
          language: 'typescript',
        };
      case 'trip-itinerary':
        return { path: 'src/components/TripItinerary.tsx', content: generateTripItinerary({}), language: 'typescript' };
      case 'booking-filters-travel':
        return { path: 'src/components/BookingFiltersTravel.tsx', content: generateBookingFiltersTravel({}), language: 'typescript' };
      case 'booking-table-travel':
        return { path: 'src/components/BookingTableTravel.tsx', content: this.generateEntityTableComponent('BookingTableTravel', 'booking', [
      { key: 'booking_number', label: 'Booking #' },
      { key: 'client_name', label: 'Client' },
      { key: 'destination', label: 'Destination' },
      { key: 'departure_date', label: 'Departure', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'bookings'), language: 'typescript' };
      case 'booking-detail-travel':
        return { path: 'src/components/BookingDetailTravel.tsx', content: this.generateEntityDetailComponent('BookingDetailTravel', 'booking', [
      { key: 'booking_number', label: 'Booking #', icon: 'FileText' },
      { key: 'client_name', label: 'Client', icon: 'User' },
      { key: 'destination', label: 'Destination', icon: 'MapPin' },
      { key: 'departure_date', label: 'Departure', type: 'date', icon: 'Calendar' },
      { key: 'return_date', label: 'Return', type: 'date', icon: 'Calendar' },
      { key: 'travelers', label: 'Travelers', icon: 'Users' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'paid', label: 'Paid', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'bookings'), language: 'typescript' };
      case 'booking-form-travel':
        return { path: 'src/components/BookingFormTravel.tsx', content: this.generatePublicFormComponent('BookingFormTravel', 'booking', [
      { name: 'client_id', label: 'Client', type: 'select', required: true },
      { name: 'trip_id', label: 'Trip', type: 'select', required: true },
      { name: 'departure_date', label: 'Departure Date', type: 'date', required: true },
      { name: 'travelers', label: 'Number of Travelers', type: 'number', required: true },
      { name: 'special_requests', label: 'Special Requests', type: 'textarea' },
    ], 'bookings'), language: 'typescript' };
      case 'client-table-travel':
        return { path: 'src/components/ClientTableTravel.tsx', content: this.generateEntityTableComponent('ClientTableTravel', 'client', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'trips_booked', label: 'Trips' },
      { key: 'total_spent', label: 'Total Spent', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'clients'), language: 'typescript' };
      case 'client-profile-travel':
        return { path: 'src/components/ClientProfileTravel.tsx', content: generateClientProfileTravel({}), language: 'typescript' };
      case 'client-trips':
        return { path: 'src/components/ClientTrips.tsx', content: this.generateEntityTableComponent('ClientTrips', 'booking', [
      { key: 'destination', label: 'Destination' },
      { key: 'departure_date', label: 'Departure', type: 'date' },
      { key: 'return_date', label: 'Return', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'bookings'), language: 'typescript' };
      case 'supplier-table':
        return { path: 'src/components/SupplierTable.tsx', content: this.generateEntityTableComponent('SupplierTable', 'supplier', [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'contact', label: 'Contact' },
      { key: 'email', label: 'Email' },
      { key: 'commission', label: 'Commission' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'suppliers'), language: 'typescript' };
      case 'supplier-profile':
        return { path: 'src/components/SupplierProfile.tsx', content: generateSupplierProfile({}), language: 'typescript' };
      case 'trip-search-public':
        return { path: 'src/components/TripSearchPublic.tsx', content: this.generateEntityGridComponent('TripSearchPublic', 'trip', { title: 'name', subtitle: 'destination', badge: 'price', image: 'image' }, 'trips'), language: 'typescript' };
      case 'trip-inquiry-form':
        return { path: 'src/components/TripInquiryForm.tsx', content: this.generatePublicFormComponent('TripInquiryForm', 'inquiry', [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'destination', label: 'Destination of Interest', type: 'text', required: true },
      { name: 'travel_dates', label: 'Preferred Travel Dates', type: 'text' },
      { name: 'travelers', label: 'Number of Travelers', type: 'number' },
      { name: 'budget', label: 'Budget Range', type: 'select', options: ['Under content: 000', 'content: 000-$3000', '$3000-$5000', '$5000-content: 0000', 'Over content: 0000'] },
      { name: 'message', label: 'Additional Details', type: 'textarea' },
    ], 'inquiries'), language: 'typescript' };

      // ===== Recruitment/HR Agency =====
      case 'recruitment-stats':
        return { path: 'src/components/RecruitmentStats.tsx', content: generateRecruitmentStats({}), language: 'typescript' };
      case 'active-jobs-recruitment':
        return { path: 'src/components/ActiveJobsRecruitment.tsx', content: generateActiveJobsRecruitment({}), language: 'typescript' };
      case 'placement-pipeline':
        return { path: 'src/components/PlacementPipeline.tsx', content: generatePlacementPipeline({}), language: 'typescript' };
      case 'candidate-filters':
        return { path: 'src/components/CandidateFilters.tsx', content: generateCandidateFilters({}), language: 'typescript' };
      case 'candidate-table':
        return { path: 'src/components/CandidateTable.tsx', content: this.generateEntityTableComponent('CandidateTable', 'candidate', [
      { key: 'name', label: 'Name' },
      { key: 'title', label: 'Title' },
      { key: 'skills', label: 'Skills' },
      { key: 'experience', label: 'Experience' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'candidates'), language: 'typescript' };
      case 'candidate-resume':
        return { path: 'src/components/CandidateResume.tsx', content: this.generateEntityDetailComponent('CandidateResume', 'candidate', [
      { key: 'summary', label: 'Summary', icon: 'FileText' },
      { key: 'work_history', label: 'Work History', icon: 'Briefcase' },
      { key: 'education', label: 'Education', icon: 'GraduationCap' },
      { key: 'certifications', label: 'Certifications', icon: 'Award' },
      { key: 'skills', label: 'Skills', icon: 'Star' },
    ], 'candidates'), language: 'typescript' };
      case 'candidate-applications':
        return { path: 'src/components/CandidateApplications.tsx', content: this.generateEntityTableComponent('CandidateApplications', 'application', [
      { key: 'job_title', label: 'Position' },
      { key: 'client', label: 'Client' },
      { key: 'applied_date', label: 'Applied', type: 'date' },
      { key: 'stage', label: 'Stage' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'applications'), language: 'typescript' };
      case 'candidate-form':
        return { path: 'src/components/CandidateForm.tsx', content: this.generatePublicFormComponent('CandidateForm', 'candidate', [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'title', label: 'Current Title', type: 'text' },
      { name: 'skills', label: 'Skills', type: 'text' },
      { name: 'experience', label: 'Years of Experience', type: 'number' },
      { name: 'expected_salary', label: 'Expected Salary', type: 'number' },
      { name: 'resume', label: 'Resume', type: 'file' },
    ], 'candidates'), language: 'typescript' };
      case 'job-filters-recruitment':
        return { path: 'src/components/JobFiltersRecruitment.tsx', content: generateJobFiltersRecruitment({}), language: 'typescript' };
      case 'job-table-recruitment':
        return { path: 'src/components/JobTableRecruitment.tsx', content: this.generateEntityTableComponent('JobTableRecruitment', 'job', [
      { key: 'title', label: 'Title' },
      { key: 'client', label: 'Client' },
      { key: 'location', label: 'Location' },
      { key: 'salary_range', label: 'Salary' },
      { key: 'candidates', label: 'Candidates' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'jobs'), language: 'typescript' };
      case 'job-detail-recruitment':
        return { path: 'src/components/JobDetailRecruitment.tsx', content: this.generateEntityDetailComponent('JobDetailRecruitment', 'job', [
      { key: 'title', label: 'Title', icon: 'Briefcase' },
      { key: 'client', label: 'Client', icon: 'Building' },
      { key: 'location', label: 'Location', icon: 'MapPin' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'salary_range', label: 'Salary Range', icon: 'DollarSign' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'requirements', label: 'Requirements', icon: 'CheckCircle' },
      { key: 'fee', label: 'Placement Fee', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'Info' },
    ], 'jobs'), language: 'typescript' };
      case 'job-candidates':
        return { path: 'src/components/JobCandidates.tsx', content: this.generateEntityTableComponent('JobCandidates', 'candidate', [
      { key: 'name', label: 'Name' },
      { key: 'stage', label: 'Stage' },
      { key: 'applied_date', label: 'Applied', type: 'date' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'candidates'), language: 'typescript' };
      case 'client-table-recruitment':
        return { path: 'src/components/ClientTableRecruitment.tsx', content: this.generateEntityTableComponent('ClientTableRecruitment', 'client', [
      { key: 'name', label: 'Company' },
      { key: 'contact', label: 'Contact' },
      { key: 'email', label: 'Email' },
      { key: 'open_jobs', label: 'Open Jobs' },
      { key: 'placements', label: 'Placements' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'clients'), language: 'typescript' };
      case 'client-profile-recruitment':
        return { path: 'src/components/ClientProfileRecruitment.tsx', content: generateClientProfileRecruitment({}), language: 'typescript' };
      case 'client-jobs':
        return { path: 'src/components/ClientJobs.tsx', content: this.generateEntityTableComponent('ClientJobs', 'job', [
      { key: 'title', label: 'Title' },
      { key: 'location', label: 'Location' },
      { key: 'candidates', label: 'Candidates' },
      { key: 'posted_date', label: 'Posted', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'jobs'), language: 'typescript' };
      case 'placement-table':
        return { path: 'src/components/PlacementTable.tsx', content: this.generateEntityTableComponent('PlacementTable', 'placement', [
      { key: 'candidate', label: 'Candidate' },
      { key: 'job_title', label: 'Position' },
      { key: 'client', label: 'Client' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'fee', label: 'Fee', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'placements'), language: 'typescript' };
      case 'application-table':
        return { path: 'src/components/ApplicationTable.tsx', content: this.generateEntityTableComponent('ApplicationTable', 'application', [
      { key: 'candidate', label: 'Candidate' },
      { key: 'job_title', label: 'Position' },
      { key: 'client', label: 'Client' },
      { key: 'applied_date', label: 'Applied', type: 'date' },
      { key: 'stage', label: 'Stage' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'applications'), language: 'typescript' };
      case 'interview-schedule':
        return { path: 'src/components/InterviewSchedule.tsx', content: generateInterviewSchedule({}), language: 'typescript' };
      case 'public-jobs-recruitment':
        return { path: 'src/components/PublicJobsRecruitment.tsx', content: this.generateEntityGridComponent('PublicJobsRecruitment', 'job', { title: 'title', subtitle: 'location', badge: 'salary_range' }, 'jobs'), language: 'typescript' };
      case 'apply-form':
        return { path: 'src/components/ApplyForm.tsx', content: this.generatePublicFormComponent('ApplyForm', 'application', [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'current_title', label: 'Current Title', type: 'text' },
      { name: 'experience', label: 'Years of Experience', type: 'number' },
      { name: 'expected_salary', label: 'Expected Salary', type: 'number' },
      { name: 'resume', label: 'Resume', type: 'file', required: true },
      { name: 'cover_letter', label: 'Cover Letter', type: 'textarea' },
    ], 'applications'), language: 'typescript' };

      // ===== Marketing Agency =====
      case 'marketing-stats':
        return { path: 'src/components/MarketingStats.tsx', content: generateMarketingStats({}), language: 'typescript' };
      case 'campaign-list-active':
        return { path: 'src/components/CampaignListActive.tsx', content: generateCampaignListActive({}), language: 'typescript' };
      case 'task-list-marketing':
        return { path: 'src/components/TaskListMarketing.tsx', content: generateTaskListMarketing({}), language: 'typescript' };
      case 'campaign-filters-marketing':
        return { path: 'src/components/CampaignFiltersMarketing.tsx', content: generateCampaignFiltersMarketing({}), language: 'typescript' };
      case 'campaign-grid-marketing':
        return { path: 'src/components/CampaignGridMarketing.tsx', content: this.generateEntityGridComponent('CampaignGridMarketing', 'campaign', { title: 'name', subtitle: 'client_name', badge: 'status', image: 'thumbnail' }, 'campaigns'), language: 'typescript' };
      case 'campaign-header-marketing':
        return { path: 'src/components/CampaignHeaderMarketing.tsx', content: this.generateEntityDetailComponent('CampaignHeaderMarketing', 'campaign', [
      { key: 'name', label: 'Campaign Name', icon: 'Megaphone' },
      { key: 'client_name', label: 'Client', icon: 'Building' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'start_date', label: 'Start', type: 'date', icon: 'Calendar' },
      { key: 'end_date', label: 'End', type: 'date', icon: 'Calendar' },
      { key: 'budget', label: 'Budget', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'campaigns'), language: 'typescript' };
      case 'campaign-performance':
        return { path: 'src/components/CampaignPerformance.tsx', content: generateCampaignPerformance({}), language: 'typescript' };
      case 'campaign-assets':
        return { path: 'src/components/CampaignAssets.tsx', content: this.generateEntityGridComponent('CampaignAssets', 'asset', { title: 'name', subtitle: 'type', badge: 'status', image: 'thumbnail' }, 'assets'), language: 'typescript' };
      case 'campaign-form-marketing':
        return { path: 'src/components/CampaignFormMarketing.tsx', content: this.generatePublicFormComponent('CampaignFormMarketing', 'campaign', [
      { name: 'name', label: 'Campaign Name', type: 'text', required: true },
      { name: 'client_id', label: 'Client', type: 'select', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Social Media', 'PPC', 'Email', 'SEO', 'Content', 'Branding'], required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'budget', label: 'Budget', type: 'number' },
      { name: 'objectives', label: 'Objectives', type: 'textarea' },
    ], 'campaigns'), language: 'typescript' };
      case 'client-table-marketing':
        return {
          path: 'src/components/ClientTableMarketing.tsx',
          content: this.generateEntityTableComponent('ClientTableMarketing', 'client', [
            { key: 'name', label: 'Company' },
            { key: 'contact', label: 'Contact' },
            { key: 'email', label: 'Email' },
            { key: 'active_campaigns', label: 'Campaigns' },
            { key: 'monthly_retainer', label: 'Retainer', type: 'currency' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'clients'),
          language: 'typescript',
        };
      case 'client-header-marketing':
        return { path: 'src/components/ClientHeaderMarketing.tsx', content: generateClientHeaderMarketing({}), language: 'typescript' };
      case 'client-campaigns':
        return { path: 'src/components/ClientCampaigns.tsx', content: this.generateEntityTableComponent('ClientCampaigns', 'campaign', [
      { key: 'name', label: 'Campaign' },
      { key: 'type', label: 'Type' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'campaigns'), language: 'typescript' };
      case 'client-performance-marketing':
        return { path: 'src/components/ClientPerformanceMarketing.tsx', content: generateClientPerformanceMarketing({}), language: 'typescript' };
      case 'project-board-marketing':
        return { path: 'src/components/ProjectBoardMarketing.tsx', content: generateProjectBoardMarketing({}), language: 'typescript' };
      case 'project-header-marketing':
        return { path: 'src/components/ProjectHeaderMarketing.tsx', content: this.generateEntityDetailComponent('ProjectHeaderMarketing', 'project', [
      { key: 'name', label: 'Project Name', icon: 'FolderOpen' },
      { key: 'client_name', label: 'Client', icon: 'Building' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'deadline', label: 'Deadline', type: 'date', icon: 'Calendar' },
      { key: 'budget', label: 'Budget', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'projects'), language: 'typescript' };
      case 'project-tasks-marketing':
        return { path: 'src/components/ProjectTasksMarketing.tsx', content: this.generateEntityTableComponent('ProjectTasksMarketing', 'task', [
      { key: 'title', label: 'Task' },
      { key: 'assignee', label: 'Assignee' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'tasks'), language: 'typescript' };
      case 'asset-browser':
        return { path: 'src/components/AssetBrowser.tsx', content: generateAssetBrowser({}), language: 'typescript' };
      case 'report-form':
        return {
          path: 'src/components/ReportForm.tsx',
          content: this.generatePublicFormComponent('ReportForm', 'report', [
            { name: 'name', label: 'Report Name', type: 'text', required: true },
            { name: 'campaign_id', label: 'Campaign', type: 'select' },
            { name: 'report_type', label: 'Report Type', type: 'select', options: ['Performance', 'ROI', 'Social Media', 'SEO', 'Custom'], required: true },
            { name: 'date_range', label: 'Date Range', type: 'daterange', required: true },
            { name: 'metrics', label: 'Metrics to Include', type: 'checkbox', options: ['Impressions', 'Clicks', 'Conversions', 'Spend', 'ROI'] },
          ], 'reports'),
          language: 'typescript',
        };

      // ===== Event Venue =====
      case 'venue-stats':
        return { path: 'src/components/VenueStats.tsx', content: generateVenueStats({}), language: 'typescript' };
      case 'event-list-upcoming':
        return { path: 'src/components/EventListUpcoming.tsx', content: generateEventListUpcoming({}), language: 'typescript' };
      case 'venue-calendar':
        return { path: 'src/components/VenueCalendar.tsx', content: generateVenueCalendar({}), language: 'typescript' };
      case 'booking-filters-venue':
        return { path: 'src/components/BookingFiltersVenue.tsx', content: generateBookingFiltersVenue({}), language: 'typescript' };
      case 'booking-table-venue':
        return { path: 'src/components/BookingTableVenue.tsx', content: this.generateEntityTableComponent('BookingTableVenue', 'booking', [
      { key: 'event_name', label: 'Event' },
      { key: 'client_name', label: 'Client' },
      { key: 'venue', label: 'Venue' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'guests', label: 'Guests' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'bookings'), language: 'typescript' };
      case 'booking-header-venue':
        return { path: 'src/components/BookingHeaderVenue.tsx', content: this.generateEntityDetailComponent('BookingHeaderVenue', 'booking', [
      { key: 'event_name', label: 'Event', icon: 'PartyPopper' },
      { key: 'client_name', label: 'Client', icon: 'User' },
      { key: 'venue', label: 'Venue', icon: 'Building' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'guests', label: 'Guests', icon: 'Users' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'bookings'), language: 'typescript' };
      case 'event-details-venue':
        return { path: 'src/components/EventDetailsVenue.tsx', content: this.generateEntityDetailComponent('EventDetailsVenue', 'booking', [
      { key: 'event_type', label: 'Event Type', icon: 'Tag' },
      { key: 'package', label: 'Package', icon: 'Package' },
      { key: 'catering', label: 'Catering', icon: 'Utensils' },
      { key: 'decorations', label: 'Decorations', icon: 'Sparkles' },
      { key: 'av_equipment', label: 'A/V Equipment', icon: 'Mic' },
      { key: 'special_requests', label: 'Special Requests', icon: 'Info' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'deposit_paid', label: 'Deposit Paid', type: 'currency', icon: 'CreditCard' },
    ], 'bookings'), language: 'typescript' };
      case 'booking-form-venue':
        return { path: 'src/components/BookingFormVenue.tsx', content: this.generatePublicFormComponent('BookingFormVenue', 'booking', [
      { name: 'client_id', label: 'Client', type: 'select', required: true },
      { name: 'venue_id', label: 'Venue', type: 'select', required: true },
      { name: 'event_name', label: 'Event Name', type: 'text', required: true },
      { name: 'event_type', label: 'Event Type', type: 'select', options: ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Other'], required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'start_time', label: 'Start Time', type: 'time', required: true },
      { name: 'end_time', label: 'End Time', type: 'time', required: true },
      { name: 'guests', label: 'Expected Guests', type: 'number', required: true },
      { name: 'package_id', label: 'Package', type: 'select' },
      { name: 'special_requests', label: 'Special Requests', type: 'textarea' },
    ], 'bookings'), language: 'typescript' };
      case 'venue-grid':
        return { path: 'src/components/VenueGrid.tsx', content: this.generateEntityGridComponent('VenueGrid', 'venue', { title: 'name', subtitle: 'capacity', badge: 'status', image: 'image' }, 'venues'), language: 'typescript' };
      case 'venue-detail':
        return { path: 'src/components/VenueDetail.tsx', content: this.generateEntityDetailComponent('VenueDetail', 'venue', [
      { key: 'name', label: 'Name', icon: 'Building' },
      { key: 'capacity', label: 'Capacity', icon: 'Users' },
      { key: 'size', label: 'Size (sq ft)', icon: 'Maximize' },
      { key: 'amenities', label: 'Amenities', icon: 'Sparkles' },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'minimum_hours', label: 'Minimum Hours', icon: 'Clock' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'venues'), language: 'typescript' };
      case 'venue-bookings':
        return { path: 'src/components/VenueBookings.tsx', content: this.generateEntityTableComponent('VenueBookings', 'booking', [
      { key: 'event_name', label: 'Event' },
      { key: 'client_name', label: 'Client' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'guests', label: 'Guests' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'bookings'), language: 'typescript' };
      case 'client-table-venue':
        return {
          path: 'src/components/ClientTableVenue.tsx',
          content: this.generateEntityTableComponent('ClientTableVenue', 'client', [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'total_bookings', label: 'Bookings' },
            { key: 'total_spent', label: 'Total Spent', type: 'currency' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'clients'),
          language: 'typescript',
        };
      case 'client-profile-venue':
        return { path: 'src/components/ClientProfileVenue.tsx', content: generateClientProfileVenue({}), language: 'typescript' };
      case 'client-bookings-venue':
        return { path: 'src/components/ClientBookingsVenue.tsx', content: this.generateEntityTableComponent('ClientBookingsVenue', 'booking', [
      { key: 'event_name', label: 'Event' },
      { key: 'venue', label: 'Venue' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'bookings'), language: 'typescript' };
      case 'package-grid-venue':
        return { path: 'src/components/PackageGridVenue.tsx', content: this.generateEntityGridComponent('PackageGridVenue', 'package', { title: 'name', subtitle: 'description', badge: 'price' }, 'packages'), language: 'typescript' };
      case 'staff-grid-venue':
        return { path: 'src/components/StaffGridVenue.tsx', content: this.generateEntityGridComponent('StaffGridVenue', 'staff', { title: 'name', subtitle: 'role', badge: 'status', image: 'photo' }, 'staff'), language: 'typescript' };
      case 'public-venue-browser':
        return { path: 'src/components/PublicVenueBrowser.tsx', content: this.generateEntityGridComponent('PublicVenueBrowser', 'venue', { title: 'name', subtitle: 'capacity', badge: 'hourly_rate', image: 'image' }, 'venues'), language: 'typescript' };

      // ===== Cinema/Theater =====
      case 'cinema-stats':
        return { path: 'src/components/CinemaStats.tsx', content: generateCinemaStats({}), language: 'typescript' };
      case 'screening-list-today':
        return { path: 'src/components/ScreeningListToday.tsx', content: generateScreeningListToday({}), language: 'typescript' };
      case 'ticket-sales-recent':
        return { path: 'src/components/TicketSalesRecent.tsx', content: generateTicketSalesRecent({}), language: 'typescript' };
      case 'movie-filters':
        return { path: 'src/components/MovieFilters.tsx', content: generateMovieFilters({}), language: 'typescript' };
      case 'movie-grid-admin':
        return { path: 'src/components/MovieGridAdmin.tsx', content: this.generateEntityGridComponent('MovieGridAdmin', 'movie', { title: 'title', subtitle: 'genre', badge: 'status', image: 'poster' }, 'movies'), language: 'typescript' };
      case 'movie-header':
        return { path: 'src/components/MovieHeader.tsx', content: this.generateEntityDetailComponent('MovieHeader', 'movie', [
      { key: 'title', label: 'Title', icon: 'Film' },
      { key: 'genre', label: 'Genre', icon: 'Tag' },
      { key: 'duration', label: 'Duration', icon: 'Clock' },
      { key: 'rating', label: 'Rating', icon: 'Star' },
      { key: 'release_date', label: 'Release Date', type: 'date', icon: 'Calendar' },
      { key: 'director', label: 'Director', icon: 'User' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'movies'), language: 'typescript' };
      case 'movie-screenings':
        return { path: 'src/components/MovieScreenings.tsx', content: this.generateEntityTableComponent('MovieScreenings', 'screening', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'theater', label: 'Theater' },
      { key: 'seats_available', label: 'Available' },
      { key: 'tickets_sold', label: 'Sold' },
    ], 'screenings'), language: 'typescript' };
      case 'movie-form':
        return { path: 'src/components/MovieForm.tsx', content: this.generatePublicFormComponent('MovieForm', 'movie', [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'genre', label: 'Genre', type: 'select', options: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Animation', 'Documentary'], required: true },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true },
      { name: 'rating', label: 'Rating', type: 'select', options: ['G', 'PG', 'PG-13', 'R', 'NC-17'], required: true },
      { name: 'release_date', label: 'Release Date', type: 'date' },
      { name: 'director', label: 'Director', type: 'text' },
      { name: 'cast', label: 'Cast', type: 'textarea' },
      { name: 'synopsis', label: 'Synopsis', type: 'textarea' },
    ], 'movies'), language: 'typescript' };
      case 'screening-calendar':
        return { path: 'src/components/ScreeningCalendar.tsx', content: generateScreeningCalendar({}), language: 'typescript' };
      case 'screening-detail':
        return { path: 'src/components/ScreeningDetail.tsx', content: this.generateEntityDetailComponent('ScreeningDetail', 'screening', [
      { key: 'movie_title', label: 'Movie', icon: 'Film' },
      { key: 'theater', label: 'Theater', icon: 'Building' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'ticket_price', label: 'Ticket Price', type: 'currency', icon: 'DollarSign' },
      { key: 'seats_available', label: 'Seats Available', icon: 'Armchair' },
      { key: 'tickets_sold', label: 'Tickets Sold', icon: 'Ticket' },
    ], 'screenings'), language: 'typescript' };
      case 'seat-map-admin':
        return { path: 'src/components/SeatMapAdmin.tsx', content: this.generateEntityGridComponent('SeatMapAdmin', 'seat', { title: 'seat_number', subtitle: 'row', badge: 'status' }, 'seats'), language: 'typescript' };
      case 'theater-grid':
        return { path: 'src/components/TheaterGrid.tsx', content: this.generateEntityGridComponent('TheaterGrid', 'theater', { title: 'name', subtitle: 'capacity', badge: 'status', image: 'image' }, 'theaters'), language: 'typescript' };
      case 'theater-detail':
        return {
          path: 'src/components/TheaterDetail.tsx',
          content: this.generateEntityDetailComponent('TheaterDetail', 'theater', [
            { key: 'name', label: 'Name', icon: 'Building' },
            { key: 'capacity', label: 'Capacity', icon: 'Users' },
            { key: 'screen_size', label: 'Screen Size', icon: 'Monitor' },
            { key: 'sound_system', label: 'Sound System', icon: 'Volume2' },
            { key: 'features', label: 'Features', icon: 'List' },
          ], 'theaters'),
          language: 'typescript',
        };
      case 'ticket-stats':
        return { path: 'src/components/TicketStats.tsx', content: generateTicketStats({}), language: 'typescript' };
      case 'ticket-table':
        return { path: 'src/components/TicketTable.tsx', content: this.generateEntityTableComponent('TicketTable', 'ticket', [
      { key: 'ticket_number', label: 'Ticket #' },
      { key: 'movie', label: 'Movie' },
      { key: 'showtime', label: 'Showtime' },
      { key: 'seats', label: 'Seats' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'tickets'), language: 'typescript' };
      case 'concession-grid':
        return { path: 'src/components/ConcessionGrid.tsx', content: this.generateEntityGridComponent('ConcessionGrid', 'item', { title: 'name', subtitle: 'category', badge: 'price', image: 'image' }, 'items'), language: 'typescript' };
      case 'public-movie-grid':
        return { path: 'src/components/PublicMovieGrid.tsx', content: this.generateEntityGridComponent('PublicMovieGrid', 'movie', { title: 'title', subtitle: 'genre', badge: 'rating', image: 'poster' }, 'movies'), language: 'typescript' };
      case 'public-movie-detail':
        return { path: 'src/components/PublicMovieDetail.tsx', content: this.generateEntityDetailComponent('PublicMovieDetail', 'movie', [
      { key: 'title', label: 'Title', icon: 'Film' },
      { key: 'genre', label: 'Genre', icon: 'Tag' },
      { key: 'duration', label: 'Duration', icon: 'Clock' },
      { key: 'rating', label: 'Rating', icon: 'Star' },
      { key: 'director', label: 'Director', icon: 'User' },
      { key: 'cast', label: 'Cast', icon: 'Users' },
      { key: 'synopsis', label: 'Synopsis', icon: 'FileText' },
    ], 'movies'), language: 'typescript' };
      case 'public-showtimes':
        return { path: 'src/components/PublicShowtimes.tsx', content: this.generateEntityTableComponent('PublicShowtimes', 'screening', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'theater', label: 'Theater' },
      { key: 'format', label: 'Format' },
      { key: 'price', label: 'Price', type: 'currency' },
    ], 'screenings'), language: 'typescript' };
      case 'seat-selector':
        return { path: 'src/components/SeatSelector.tsx', content: this.generateEntityGridComponent('SeatSelector', 'seat', { title: 'seat_number', subtitle: 'row', badge: 'price' }, 'seats'), language: 'typescript' };
      case 'ticket-checkout':
        return { path: 'src/components/TicketCheckout.tsx', content: this.generatePublicFormComponent('TicketCheckout', 'order', [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'card_number', label: 'Card Number', type: 'text', required: true },
      { name: 'expiry', label: 'Expiry (MM/YY)', type: 'text', required: true },
      { name: 'cvv', label: 'CVV', type: 'text', required: true },
    ], 'orders'), language: 'typescript' };

      // ===== Parking Management =====
      case 'parking-stats':
        return { path: 'src/components/ParkingStats.tsx', content: generateParkingStats({}), language: 'typescript' };
      case 'occupancy-overview-parking':
        return { path: 'src/components/OccupancyOverviewParking.tsx', content: generateOccupancyOverviewParking({}), language: 'typescript' };
      case 'session-list-active':
        return { path: 'src/components/SessionListActive.tsx', content: generateSessionListActive({}), language: 'typescript' };
      case 'live-parking-map':
        return { path: 'src/components/LiveParkingMap.tsx', content: this.generateEntityGridComponent('LiveParkingMap', 'space', { title: 'space_number', subtitle: 'section', badge: 'status' }, 'spaces'), language: 'typescript' };
      case 'reservation-filters-parking':
        return { path: 'src/components/ReservationFiltersParking.tsx', content: generateReservationFiltersParking({}), language: 'typescript' };
      case 'reservation-table-parking':
        return { path: 'src/components/ReservationTableParking.tsx', content: this.generateEntityTableComponent('ReservationTableParking', 'reservation', [
      { key: 'reservation_number', label: 'Reservation #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'license_plate', label: 'Plate' },
      { key: 'lot', label: 'Lot' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'reservations'), language: 'typescript' };
      case 'reservation-detail-parking':
        return { path: 'src/components/ReservationDetailParking.tsx', content: this.generateEntityDetailComponent('ReservationDetailParking', 'reservation', [
      { key: 'reservation_number', label: 'Reservation #', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'license_plate', label: 'License Plate', icon: 'Car' },
      { key: 'lot', label: 'Lot', icon: 'ParkingCircle' },
      { key: 'space', label: 'Space', icon: 'MapPin' },
      { key: 'start_time', label: 'Start', icon: 'Clock' },
      { key: 'end_time', label: 'End', icon: 'Clock' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'reservations'), language: 'typescript' };
      case 'lot-grid':
        return { path: 'src/components/LotGrid.tsx', content: this.generateEntityGridComponent('LotGrid', 'lot', { title: 'name', subtitle: 'location', badge: 'occupancy', image: 'image' }, 'lots'), language: 'typescript' };
      case 'lot-header':
        return { path: 'src/components/LotHeader.tsx', content: this.generateEntityDetailComponent('LotHeader', 'lot', [
      { key: 'name', label: 'Name', icon: 'ParkingCircle' },
      { key: 'location', label: 'Location', icon: 'MapPin' },
      { key: 'total_spaces', label: 'Total Spaces', icon: 'Hash' },
      { key: 'available_spaces', label: 'Available', icon: 'CircleCheck' },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'lots'), language: 'typescript' };
      case 'lot-space-map':
        return { path: 'src/components/LotSpaceMap.tsx', content: this.generateEntityGridComponent('LotSpaceMap', 'space', { title: 'space_number', subtitle: 'type', badge: 'status' }, 'spaces'), language: 'typescript' };
      case 'lot-stats':
        return { path: 'src/components/LotStats.tsx', content: generateLotStats({}), language: 'typescript' };
      case 'customer-table-parking':
        return { path: 'src/components/CustomerTableParking.tsx', content: this.generateEntityTableComponent('CustomerTableParking', 'customer', [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'vehicles', label: 'Vehicles' },
      { key: 'total_spent', label: 'Total Spent', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-parking':
        return { path: 'src/components/CustomerProfileParking.tsx', content: generateCustomerProfileParking({}), language: 'typescript' };
      case 'customer-parking-history':
        return { path: 'src/components/CustomerParkingHistory.tsx', content: this.generateEntityTableComponent('CustomerParkingHistory', 'session', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'lot', label: 'Lot' },
      { key: 'entry_time', label: 'Entry' },
      { key: 'exit_time', label: 'Exit' },
      { key: 'duration', label: 'Duration' },
      { key: 'amount', label: 'Amount', type: 'currency' },
    ], 'sessions'), language: 'typescript' };
      case 'payment-table-parking':
        return {
          path: 'src/components/PaymentTableParking.tsx',
          content: this.generateEntityTableComponent('PaymentTableParking', 'payment', [
            { key: 'payment_id', label: 'Payment #' },
            { key: 'customer_name', label: 'Customer' },
            { key: 'amount', label: 'Amount', type: 'currency' },
            { key: 'payment_method', label: 'Method' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'payments'),
          language: 'typescript',
        };
      case 'parking-finder':
        return { path: 'src/components/ParkingFinder.tsx', content: this.generateEntityGridComponent('ParkingFinder', 'lot', { title: 'name', subtitle: 'available_spaces', badge: 'hourly_rate', image: 'image' }, 'lots'), language: 'typescript' };
      case 'public-reservation-parking':
        return { path: 'src/components/PublicReservationParking.tsx', content: this.generatePublicFormComponent('PublicReservationParking', 'reservation', [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'license_plate', label: 'License Plate', type: 'text', required: true },
      { name: 'lot_id', label: 'Parking Lot', type: 'select', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'start_time', label: 'Start Time', type: 'time', required: true },
      { name: 'end_time', label: 'End Time', type: 'time', required: true },
    ], 'reservations'), language: 'typescript' };

      // ===== Security Company =====
      case 'security-stats':
        return { path: 'src/components/SecurityStats.tsx', content: generateSecurityStats({}), language: 'typescript' };
      case 'guard-list-active':
        return { path: 'src/components/GuardListActive.tsx', content: generateGuardListActive({}), language: 'typescript' };
      case 'incident-list-recent':
        return { path: 'src/components/IncidentListRecent.tsx', content: generateIncidentListRecent({}), language: 'typescript' };
      case 'guard-filters':
        return { path: 'src/components/GuardFilters.tsx', content: generateGuardFilters({}), language: 'typescript' };
      case 'guard-table':
        return { path: 'src/components/GuardTable.tsx', content: this.generateEntityTableComponent('GuardTable', 'guard', [
      { key: 'name', label: 'Name' },
      { key: 'badge_number', label: 'Badge #' },
      { key: 'certification', label: 'Certification' },
      { key: 'current_site', label: 'Current Site' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'guards'), language: 'typescript' };
      case 'guard-profile':
        return { path: 'src/components/GuardProfile.tsx', content: generateGuardProfile({}), language: 'typescript' };
      case 'guard-schedule':
        return { path: 'src/components/GuardSchedule.tsx', content: generateGuardSchedule({}), language: 'typescript' };
      case 'guard-incidents':
        return { path: 'src/components/GuardIncidents.tsx', content: this.generateEntityTableComponent('GuardIncidents', 'incident', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'site', label: 'Site' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'incidents'), language: 'typescript' };
      case 'guard-form':
        return {
          path: 'src/components/GuardForm.tsx',
          content: this.generatePublicFormComponent('GuardForm', 'guard', [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'tel', required: true },
            { name: 'license_number', label: 'License Number', type: 'text', required: true },
            { name: 'experience', label: 'Years of Experience', type: 'number' },
          ], 'guards'),
          language: 'typescript',
        };
      case 'site-header':
        return {
          path: 'src/components/SiteHeader.tsx',
          content: this.generateEntityDetailComponent('SiteHeader', 'site', [
            { key: 'name', label: 'Site Name', icon: 'Building' },
            { key: 'address', label: 'Address', icon: 'MapPin' },
            { key: 'client_name', label: 'Client', icon: 'User' },
            { key: 'type', label: 'Type', icon: 'Tag' },
            { key: 'guards_required', label: 'Guards Required', icon: 'Users' },
            { key: 'contract_value', label: 'Contract Value', type: 'currency', icon: 'DollarSign' },
            { key: 'status', label: 'Status', icon: 'CheckCircle' },
          ], 'sites'),
          language: 'typescript',
        };
      case 'site-patrol-map':
        return { path: 'src/components/SitePatrolMap.tsx', content: this.generateEntityGridComponent('SitePatrolMap', 'checkpoint', { title: 'name', subtitle: 'last_scanned', badge: 'status' }, 'checkpoints'), language: 'typescript' };
      case 'site-schedule':
        return { path: 'src/components/SiteSchedule.tsx', content: generateSiteScheduleComponent({}), language: 'typescript' };
      case 'patrol-live-view':
        return { path: 'src/components/PatrolLiveView.tsx', content: this.generateEntityGridComponent('PatrolLiveView', 'guard', { title: 'name', subtitle: 'last_checkpoint', badge: 'status', image: 'photo' }, 'guards'), language: 'typescript' };
      case 'patrol-history':
        return { path: 'src/components/PatrolHistory.tsx', content: this.generateEntityTableComponent('PatrolHistory', 'patrol', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'guard', label: 'Guard' },
      { key: 'start_time', label: 'Start' },
      { key: 'end_time', label: 'End' },
      { key: 'checkpoints', label: 'Checkpoints' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'patrols'), language: 'typescript' };
      case 'patrol-detail':
        return { path: 'src/components/PatrolDetail.tsx', content: this.generateEntityDetailComponent('PatrolDetail', 'patrol', [
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'guard', label: 'Guard', icon: 'User' },
      { key: 'site', label: 'Site', icon: 'Building' },
      { key: 'start_time', label: 'Start Time', icon: 'Clock' },
      { key: 'end_time', label: 'End Time', icon: 'Clock' },
      { key: 'checkpoints_scanned', label: 'Checkpoints Scanned', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'FileText' },
      { key: 'status', label: 'Status', icon: 'Info' },
    ], 'patrols'), language: 'typescript' };
      case 'incident-filters':
        return { path: 'src/components/IncidentFilters.tsx', content: generateIncidentFiltersComponent({}), language: 'typescript' };
      case 'incident-table':
        return { path: 'src/components/IncidentTable.tsx', content: this.generateEntityTableComponent('IncidentTable', 'incident', [
      { key: 'incident_number', label: 'Incident #' },
      { key: 'title', label: 'Title' },
      { key: 'site', label: 'Site' },
      { key: 'severity', label: 'Severity' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'reported_by', label: 'Reported By' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'incidents'), language: 'typescript' };
      case 'incident-detail':
        return { path: 'src/components/IncidentDetail.tsx', content: this.generateEntityDetailComponent('IncidentDetail', 'incident', [
      { key: 'incident_number', label: 'Incident #', icon: 'FileText' },
      { key: 'title', label: 'Title', icon: 'AlertTriangle' },
      { key: 'site', label: 'Site', icon: 'Building' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'severity', label: 'Severity', icon: 'AlertCircle' },
      { key: 'reported_by', label: 'Reported By', icon: 'User' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'actions_taken', label: 'Actions Taken', icon: 'CheckCircle' },
      { key: 'status', label: 'Status', icon: 'Info' },
    ], 'incidents'), language: 'typescript' };
      case 'incident-form':
        return { path: 'src/components/IncidentForm.tsx', content: this.generatePublicFormComponent('IncidentForm', 'incident', [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'site_id', label: 'Site', type: 'select', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'time', required: true },
      { name: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Theft', 'Vandalism', 'Trespassing', 'Medical', 'Fire', 'Other'], required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'actions_taken', label: 'Actions Taken', type: 'textarea' },
      { name: 'witnesses', label: 'Witnesses', type: 'textarea' },
    ], 'incidents'), language: 'typescript' };
      case 'schedule-calendar-security':
        return { path: 'src/components/ScheduleCalendarSecurity.tsx', content: generateScheduleCalendarSecurity({}), language: 'typescript' };
      case 'client-table-security':
        return { path: 'src/components/ClientTableSecurity.tsx', content: this.generateEntityTableComponent('ClientTableSecurity', 'client', [
      { key: 'name', label: 'Company' },
      { key: 'contact', label: 'Contact' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'sites', label: 'Sites' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'clients'), language: 'typescript' };
      case 'client-profile-security':
        return { path: 'src/components/ClientProfileSecurity.tsx', content: generateClientProfileSecurity({}), language: 'typescript' };
      case 'client-sites':
        return { path: 'src/components/ClientSites.tsx', content: this.generateEntityTableComponent('ClientSites', 'site', [
      { key: 'name', label: 'Site' },
      { key: 'address', label: 'Address' },
      { key: 'guards', label: 'Guards' },
      { key: 'contract_value', label: 'Value', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'sites'), language: 'typescript' };

      // ===== Pharmacy =====
      case 'pharmacy-stats':
        return { path: 'src/components/PharmacyStats.tsx', content: generatePharmacyStats({}), language: 'typescript' };
      case 'prescription-list-pending':
        return { path: 'src/components/PrescriptionListPending.tsx', content: generatePrescriptionListPending({}), language: 'typescript' };
      case 'prescription-table':
        return { path: 'src/components/PrescriptionTable.tsx', content: this.generateEntityTableComponent('PrescriptionTable', 'prescription', [
      { key: 'prescription_number', label: 'Rx Number' },
      { key: 'patient_name', label: 'Patient' },
      { key: 'medication_name', label: 'Medication' },
      { key: 'dosage', label: 'Dosage' },
      { key: 'quantity', label: 'Qty' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'prescriptions'), language: 'typescript' };
      case 'prescription-detail':
        return {
          path: 'src/components/PrescriptionDetail.tsx',
          content: this.generateEntityDetailComponent('PrescriptionDetail', 'prescription', [
            { key: 'patient_name', label: 'Patient', icon: 'User' },
            { key: 'medication_name', label: 'Medication', icon: 'Pill' },
            { key: 'dosage', label: 'Dosage', icon: 'Activity' },
            { key: 'quantity', label: 'Quantity', icon: 'Package' },
            { key: 'refills_remaining', label: 'Refills Remaining', icon: 'RefreshCw' },
            { key: 'prescriber', label: 'Prescriber', icon: 'Stethoscope' },
            { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
            { key: 'expiry_date', label: 'Expiry', type: 'date', icon: 'CalendarX' },
            { key: 'status', label: 'Status', icon: 'CheckCircle' },
            { key: 'instructions', label: 'Instructions', icon: 'Info' },
          ], 'prescriptions'),
          language: 'typescript',
        };
      case 'medication-grid':
        return { path: 'src/components/MedicationGrid.tsx', content: this.generateEntityGridComponent('MedicationGrid', 'medication', { title: 'name', subtitle: 'category', badge: 'status', image: 'image' }, 'medications'), language: 'typescript' };
      case 'medication-detail':
        return { path: 'src/components/MedicationDetail.tsx', content: this.generateEntityDetailComponent('MedicationDetail', 'medication', [
      { key: 'name', label: 'Name', icon: 'Pill' },
      { key: 'generic_name', label: 'Generic Name', icon: 'Tag' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'manufacturer', label: 'Manufacturer', icon: 'Building' },
      { key: 'ndc', label: 'NDC', icon: 'Barcode' },
      { key: 'strength', label: 'Strength', icon: 'Activity' },
      { key: 'form', label: 'Form', icon: 'Box' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'quantity', label: 'In Stock', icon: 'Package' },
      { key: 'reorder_level', label: 'Reorder Level', icon: 'AlertTriangle' },
    ], 'medications'), language: 'typescript' };
      case 'inventory-table-pharmacy':
        return { path: 'src/components/InventoryTablePharmacy.tsx', content: this.generateEntityTableComponent('InventoryTablePharmacy', 'medication', [
      { key: 'name', label: 'Medication' },
      { key: 'ndc', label: 'NDC' },
      { key: 'quantity', label: 'In Stock' },
      { key: 'reorder_level', label: 'Reorder Level' },
      { key: 'unit_cost', label: 'Unit Cost', type: 'currency' },
      { key: 'expiry_date', label: 'Expiry', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'medications'), language: 'typescript' };
      case 'customer-table-pharmacy':
        return { path: 'src/components/CustomerTablePharmacy.tsx', content: this.generateEntityTableComponent('CustomerTablePharmacy', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'date_of_birth', label: 'DOB', type: 'date' },
      { key: 'phone', label: 'Phone' },
      { key: 'insurance_provider', label: 'Insurance' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-pharmacy':
        return { path: 'src/components/CustomerProfilePharmacy.tsx', content: generateCustomerProfilePharmacy({}), language: 'typescript' };
      case 'customer-prescriptions':
        return { path: 'src/components/CustomerPrescriptions.tsx', content: generateCustomerPrescriptions({}), language: 'typescript' };
      case 'pharmacist-table':
        return { path: 'src/components/PharmacistTable.tsx', content: this.generateEntityTableComponent('PharmacistTable', 'pharmacist', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'license_number', label: 'License #' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'pharmacists'), language: 'typescript' };
      case 'order-table-pharmacy':
        return { path: 'src/components/OrderTablePharmacy.tsx', content: this.generateEntityTableComponent('OrderTablePharmacy', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'supplier_name', label: 'Supplier' },
      { key: 'order_date', label: 'Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'orders'), language: 'typescript' };
      case 'refill-request-form':
        return { path: 'src/components/RefillRequestForm.tsx', content: this.generatePublicFormComponent('RefillRequestForm', 'prescription', [
      { key: 'prescription_number', label: 'Prescription Number', type: 'text', required: true },
      { key: 'patient_name', label: 'Patient Name', type: 'text', required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'phone', label: 'Phone Number', type: 'phone', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'preferred_pickup_date', label: 'Preferred Pickup Date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ], 'refill-requests'), language: 'typescript' };

      // ===== Nursery/Garden Center =====
      case 'nursery-stats':
        return { path: 'src/components/NurseryStats.tsx', content: generateNurseryStats({}), language: 'typescript' };
      case 'plant-list-featured':
        return { path: 'src/components/PlantListFeatured.tsx', content: generatePlantListFeatured({}), language: 'typescript' };
      case 'order-list-recent-nursery':
        return { path: 'src/components/OrderListRecentNursery.tsx', content: generateOrderListRecentNursery({}), language: 'typescript' };
      case 'plant-grid':
        return { path: 'src/components/PlantGrid.tsx', content: this.generateEntityGridComponent('PlantGrid', 'plant', { title: 'name', subtitle: 'category', badge: 'status', image: 'image' }, 'plants'), language: 'typescript' };
      case 'plant-detail':
        return { path: 'src/components/PlantDetail.tsx', content: this.generateEntityDetailComponent('PlantDetail', 'plant', [
      { key: 'name', label: 'Plant Name', icon: 'Leaf' },
      { key: 'scientific_name', label: 'Scientific Name', icon: 'BookOpen' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'size', label: 'Size', icon: 'Ruler' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'quantity', label: 'In Stock', icon: 'Package' },
      { key: 'sunlight', label: 'Sunlight', icon: 'Sun' },
      { key: 'water', label: 'Water Needs', icon: 'Droplets' },
      { key: 'zone', label: 'Hardiness Zone', icon: 'MapPin' },
      { key: 'care_level', label: 'Care Level', icon: 'Heart' },
    ], 'plants'), language: 'typescript' };
      case 'plant-care-info':
        return { path: 'src/components/PlantCareInfo.tsx', content: this.generateEntityDetailComponent('PlantCareInfo', 'plant', [
      { key: 'sunlight', label: 'Sunlight Requirements', icon: 'Sun' },
      { key: 'water', label: 'Water Needs', icon: 'Droplets' },
      { key: 'soil', label: 'Soil Type', icon: 'Mountain' },
      { key: 'fertilizer', label: 'Fertilizer', icon: 'Sparkles' },
      { key: 'pruning', label: 'Pruning', icon: 'Scissors' },
      { key: 'pest_control', label: 'Pest Control', icon: 'Bug' },
      { key: 'care_instructions', label: 'Care Instructions', icon: 'FileText' },
    ], 'plants'), language: 'typescript' };
      case 'inventory-table-nursery':
        return { path: 'src/components/InventoryTableNursery.tsx', content: this.generateEntityTableComponent('InventoryTableNursery', 'plant', [
      { key: 'name', label: 'Plant' },
      { key: 'sku', label: 'SKU' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'In Stock' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'plants'), language: 'typescript' };
      case 'order-table-nursery':
        return { path: 'src/components/OrderTableNursery.tsx', content: this.generateEntityTableComponent('OrderTableNursery', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'order_date', label: 'Date', type: 'date' },
      { key: 'items_count', label: 'Items' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'orders'), language: 'typescript' };
      case 'order-detail-nursery':
        return { path: 'src/components/OrderDetailNursery.tsx', content: this.generateEntityDetailComponent('OrderDetailNursery', 'order', [
      { key: 'order_number', label: 'Order Number', icon: 'ShoppingCart' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'order_date', label: 'Order Date', type: 'date', icon: 'Calendar' },
      { key: 'delivery_method', label: 'Delivery Method', icon: 'Truck' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency', icon: 'DollarSign' },
      { key: 'tax', label: 'Tax', type: 'currency', icon: 'Receipt' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'CreditCard' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'FileText' },
    ], 'orders'), language: 'typescript' };
      case 'customer-table-nursery':
        return { path: 'src/components/CustomerTableNursery.tsx', content: this.generateEntityTableComponent('CustomerTableNursery', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_orders', label: 'Orders' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'landscaping-table':
        return { path: 'src/components/LandscapingTable.tsx', content: this.generateEntityTableComponent('LandscapingTable', 'landscaping', [
      { key: 'project_name', label: 'Project' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'budget', label: 'Budget', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'landscaping-projects'), language: 'typescript' };
      case 'landscaping-detail':
        return { path: 'src/components/LandscapingDetail.tsx', content: this.generateEntityDetailComponent('LandscapingDetail', 'landscaping', [
      { key: 'project_name', label: 'Project Name', icon: 'TreePine' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'end_date', label: 'End Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'budget', label: 'Budget', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'landscaping-projects'), language: 'typescript' };
      case 'public-shop-nursery':
        return { path: 'src/components/PublicShopNursery.tsx', content: this.generateEntityGridComponent('PublicShopNursery', 'plant', { title: 'name', subtitle: 'price', badge: 'category', image: 'image' }, 'plants'), language: 'typescript' };

      // ===== Funeral Home =====
      case 'funeral-stats':
        return { path: 'src/components/FuneralStats.tsx', content: generateFuneralStats({}), language: 'typescript' };
      case 'arrangement-list-upcoming':
        return { path: 'src/components/ArrangementListUpcoming.tsx', content: generateArrangementListUpcoming({}), language: 'typescript' };
      case 'obituary-list-recent':
        return { path: 'src/components/ObituaryListRecent.tsx', content: generateObituaryListRecent({}), language: 'typescript' };
      case 'arrangement-table':
        return { path: 'src/components/ArrangementTable.tsx', content: this.generateEntityTableComponent('ArrangementTable', 'arrangement', [
      { key: 'arrangement_number', label: 'Arrangement #' },
      { key: 'deceased_name', label: 'Deceased' },
      { key: 'family_contact', label: 'Family Contact' },
      { key: 'service_date', label: 'Service Date', type: 'date' },
      { key: 'service_type', label: 'Type' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'arrangements'), language: 'typescript' };
      case 'service-grid-funeral':
        return { path: 'src/components/ServiceGridFuneral.tsx', content: this.generateEntityGridComponent('ServiceGridFuneral', 'service', { title: 'name', subtitle: 'description', badge: 'category', image: 'image' }, 'services'), language: 'typescript' };
      case 'service-detail-funeral':
        return { path: 'src/components/ServiceDetailFuneral.tsx', content: this.generateEntityDetailComponent('ServiceDetailFuneral', 'service', [
      { key: 'name', label: 'Service Name', icon: 'Heart' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'duration', label: 'Duration', icon: 'Clock' },
      { key: 'included_items', label: 'Included Items', icon: 'List' },
    ], 'services'), language: 'typescript' };
      case 'obituary-grid':
        return { path: 'src/components/ObituaryGrid.tsx', content: this.generateEntityGridComponent('ObituaryGrid', 'obituary', { title: 'name', subtitle: 'life_dates', badge: 'status', image: 'photo' }, 'obituaries'), language: 'typescript' };
      case 'obituary-detail':
        return { path: 'src/components/ObituaryDetail.tsx', content: this.generateEntityDetailComponent('ObituaryDetail', 'obituary', [
      { key: 'name', label: 'Name', icon: 'User' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', icon: 'Calendar' },
      { key: 'date_of_death', label: 'Date of Death', type: 'date', icon: 'Calendar' },
      { key: 'biography', label: 'Biography', icon: 'BookOpen' },
      { key: 'service_info', label: 'Service Information', icon: 'Heart' },
      { key: 'published_date', label: 'Published', type: 'date', icon: 'Globe' },
    ], 'obituaries'), language: 'typescript' };
      case 'preplanning-table':
        return { path: 'src/components/PreplanningTable.tsx', content: this.generateEntityTableComponent('PreplanningTable', 'preplanning', [
      { key: 'plan_number', label: 'Plan #' },
      { key: 'client_name', label: 'Client' },
      { key: 'plan_type', label: 'Type' },
      { key: 'created_date', label: 'Created', type: 'date' },
      { key: 'payment_status', label: 'Payment', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'preplannings'), language: 'typescript' };
      case 'preplanning-detail':
        return { path: 'src/components/PreplanningDetail.tsx', content: this.generateEntityDetailComponent('PreplanningDetail', 'preplanning', [
      { key: 'plan_number', label: 'Plan Number', icon: 'FileText' },
      { key: 'client_name', label: 'Client', icon: 'User' },
      { key: 'plan_type', label: 'Plan Type', icon: 'Heart' },
      { key: 'preferences', label: 'Preferences', icon: 'Settings' },
      { key: 'total_amount', label: 'Total Amount', type: 'currency', icon: 'DollarSign' },
      { key: 'amount_paid', label: 'Amount Paid', type: 'currency', icon: 'CreditCard' },
      { key: 'payment_status', label: 'Payment Status', icon: 'CheckCircle' },
      { key: 'created_date', label: 'Created', type: 'date', icon: 'Calendar' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'preplannings'), language: 'typescript' };
      case 'family-table':
        return { path: 'src/components/FamilyTable.tsx', content: this.generateEntityTableComponent('FamilyTable', 'family', [
      { key: 'family_name', label: 'Family Name' },
      { key: 'primary_contact', label: 'Primary Contact' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'arrangements_count', label: 'Arrangements' },
    ], 'families'), language: 'typescript' };
      case 'public-services-funeral':
        return { path: 'src/components/PublicServicesFuneral.tsx', content: this.generateEntityGridComponent('PublicServicesFuneral', 'service', { title: 'name', subtitle: 'description', badge: 'price' }, 'services'), language: 'typescript' };
      case 'public-preplanning':
        return { path: 'src/components/PublicPreplanning.tsx', content: this.generatePublicFormComponent('PublicPreplanning', 'preplanning', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'plan_type', label: 'Preferred Plan Type', type: 'select' },
      { key: 'message', label: 'Tell Us About Your Needs', type: 'textarea' },
    ], 'preplanning-inquiries'), language: 'typescript' };

      // ===== Jewelry Store =====
      case 'jeweler-stats':
        return { path: 'src/components/JewelerStats.tsx', content: generateJewelerStats({}), language: 'typescript' };
      case 'repair-list-pending':
        return { path: 'src/components/RepairListPending.tsx', content: generateRepairListPending({}), language: 'typescript' };
      case 'product-grid-jeweler':
        return { path: 'src/components/ProductGridJeweler.tsx', content: this.generateEntityGridComponent('ProductGridJeweler', 'product', { title: 'name', subtitle: 'price', badge: 'category', image: 'image' }, 'products'), language: 'typescript' };
      case 'product-detail-jeweler':
        return { path: 'src/components/ProductDetailJeweler.tsx', content: this.generateEntityDetailComponent('ProductDetailJeweler', 'product', [
      { key: 'name', label: 'Name', icon: 'Gem' },
      { key: 'sku', label: 'SKU', icon: 'Barcode' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'metal', label: 'Metal', icon: 'Circle' },
      { key: 'gemstone', label: 'Gemstone', icon: 'Diamond' },
      { key: 'carat', label: 'Carat Weight', icon: 'Scale' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'cost', label: 'Cost', type: 'currency', icon: 'Receipt' },
      { key: 'quantity', label: 'In Stock', icon: 'Package' },
      { key: 'certification', label: 'Certification', icon: 'Award' },
      { key: 'description', label: 'Description', icon: 'FileText' },
    ], 'products'), language: 'typescript' };
      case 'repair-table':
        return { path: 'src/components/RepairTable.tsx', content: this.generateEntityTableComponent('RepairTable', 'repair', [
      { key: 'repair_number', label: 'Repair #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'item_description', label: 'Item' },
      { key: 'repair_type', label: 'Type' },
      { key: 'date_received', label: 'Received', type: 'date' },
      { key: 'estimated_cost', label: 'Est. Cost', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'repairs'), language: 'typescript' };
      case 'repair-detail':
        return { path: 'src/components/RepairDetail.tsx', content: this.generateEntityDetailComponent('RepairDetail', 'repair', [
      { key: 'repair_number', label: 'Repair Number', icon: 'Wrench' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'customer_phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'item_description', label: 'Item Description', icon: 'Gem' },
      { key: 'repair_type', label: 'Repair Type', icon: 'Settings' },
      { key: 'issue_description', label: 'Issue', icon: 'AlertCircle' },
      { key: 'date_received', label: 'Date Received', type: 'date', icon: 'Calendar' },
      { key: 'estimated_completion', label: 'Est. Completion', type: 'date', icon: 'CalendarCheck' },
      { key: 'estimated_cost', label: 'Estimated Cost', type: 'currency', icon: 'DollarSign' },
      { key: 'final_cost', label: 'Final Cost', type: 'currency', icon: 'Receipt' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'FileText' },
    ], 'repairs'), language: 'typescript' };
      case 'custom-order-table':
        return { path: 'src/components/CustomOrderTable.tsx', content: this.generateEntityTableComponent('CustomOrderTable', 'custom_order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'design_type', label: 'Design' },
      { key: 'order_date', label: 'Date', type: 'date' },
      { key: 'estimated_total', label: 'Est. Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'custom-orders'), language: 'typescript' };
      case 'appraisal-table':
        return { path: 'src/components/AppraisalTable.tsx', content: this.generateEntityTableComponent('AppraisalTable', 'appraisal', [
      { key: 'appraisal_number', label: 'Appraisal #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'item_description', label: 'Item' },
      { key: 'appraisal_date', label: 'Date', type: 'date' },
      { key: 'appraised_value', label: 'Value', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'appraisals'), language: 'typescript' };
      case 'appraisal-detail':
        return { path: 'src/components/AppraisalDetail.tsx', content: this.generateEntityDetailComponent('AppraisalDetail', 'appraisal', [
      { key: 'appraisal_number', label: 'Appraisal Number', icon: 'FileCheck' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'item_description', label: 'Item Description', icon: 'Gem' },
      { key: 'purpose', label: 'Purpose', icon: 'Target' },
      { key: 'metal', label: 'Metal', icon: 'Circle' },
      { key: 'gemstones', label: 'Gemstones', icon: 'Diamond' },
      { key: 'appraisal_date', label: 'Appraisal Date', type: 'date', icon: 'Calendar' },
      { key: 'appraised_value', label: 'Appraised Value', type: 'currency', icon: 'DollarSign' },
      { key: 'fee', label: 'Fee', type: 'currency', icon: 'Receipt' },
      { key: 'appraiser', label: 'Appraiser', icon: 'UserCheck' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'appraisals'), language: 'typescript' };
      case 'customer-table-jeweler':
        return { path: 'src/components/CustomerTableJeweler.tsx', content: this.generateEntityTableComponent('CustomerTableJeweler', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_purchases', label: 'Purchases', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'public-shop-jeweler':
        return { path: 'src/components/PublicShopJeweler.tsx', content: this.generateEntityGridComponent('PublicShopJeweler', 'product', { title: 'name', subtitle: 'price', badge: 'category', image: 'image' }, 'products'), language: 'typescript' };

      // ===== Tailor/Alterations =====
      case 'tailor-stats':
        return { path: 'src/components/TailorStats.tsx', content: generateTailorStats({}), language: 'typescript' };
      case 'order-list-ready':
        return { path: 'src/components/OrderListReady.tsx', content: generateOrderListReady({}), language: 'typescript' };
      case 'fitting-list-today':
        return { path: 'src/components/FittingListToday.tsx', content: generateFittingListToday({}), language: 'typescript' };
      case 'order-table-tailor':
        return { path: 'src/components/OrderTableTailor.tsx', content: this.generateEntityTableComponent('OrderTableTailor', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'service_type', label: 'Service' },
      { key: 'garment_type', label: 'Garment' },
      { key: 'order_date', label: 'Date', type: 'date' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'orders'), language: 'typescript' };
      case 'order-detail-tailor':
        return { path: 'src/components/OrderDetailTailor.tsx', content: this.generateEntityDetailComponent('OrderDetailTailor', 'order', [
      { key: 'order_number', label: 'Order Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'customer_phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'service_type', label: 'Service Type', icon: 'Scissors' },
      { key: 'garment_type', label: 'Garment Type', icon: 'Shirt' },
      { key: 'alterations', label: 'Alterations', icon: 'List' },
      { key: 'fabric', label: 'Fabric', icon: 'Palette' },
      { key: 'order_date', label: 'Order Date', type: 'date', icon: 'Calendar' },
      { key: 'due_date', label: 'Due Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'fitting_date', label: 'Fitting Date', type: 'date', icon: 'CalendarClock' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'orders'), language: 'typescript' };
      case 'customer-table-tailor':
        return { path: 'src/components/CustomerTableTailor.tsx', content: this.generateEntityTableComponent('CustomerTableTailor', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'total_orders', label: 'Orders' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-tailor':
        return { path: 'src/components/CustomerProfileTailor.tsx', content: generateCustomerProfileTailor({}), language: 'typescript' };
      case 'customer-measurements':
        return { path: 'src/components/CustomerMeasurements.tsx', content: this.generateEntityDetailComponent('CustomerMeasurements', 'customer', [
      { key: 'chest', label: 'Chest', icon: 'Ruler' },
      { key: 'waist', label: 'Waist', icon: 'Ruler' },
      { key: 'hips', label: 'Hips', icon: 'Ruler' },
      { key: 'shoulder', label: 'Shoulder', icon: 'Ruler' },
      { key: 'sleeve', label: 'Sleeve', icon: 'Ruler' },
      { key: 'inseam', label: 'Inseam', icon: 'Ruler' },
      { key: 'neck', label: 'Neck', icon: 'Ruler' },
      { key: 'back_length', label: 'Back Length', icon: 'Ruler' },
    ], 'customers'), language: 'typescript' };
      case 'fitting-calendar':
        return { path: 'src/components/FittingCalendar.tsx', content: generateFittingCalendar({}), language: 'typescript' };
      case 'fabric-grid':
        return { path: 'src/components/FabricGrid.tsx', content: this.generateEntityGridComponent('FabricGrid', 'fabric', { title: 'name', subtitle: 'type', badge: 'price', image: 'image' }, 'fabrics'), language: 'typescript' };
      case 'service-grid-tailor':
        return { path: 'src/components/ServiceGridTailor.tsx', content: this.generateEntityGridComponent('ServiceGridTailor', 'service', { title: 'name', subtitle: 'price', badge: 'category' }, 'services'), language: 'typescript' };
      case 'public-services-tailor':
        return { path: 'src/components/PublicServicesTailor.tsx', content: this.generateEntityGridComponent('PublicServicesTailor', 'service', { title: 'name', subtitle: 'description', badge: 'price' }, 'services'), language: 'typescript' };

      // ===== Optician/Optical =====
      case 'optician-stats':
        return { path: 'src/components/OpticianStats.tsx', content: generateOpticianStats({}), language: 'typescript' };
      case 'exam-list-today':
        return { path: 'src/components/ExamListToday.tsx', content: generateExamListToday({}), language: 'typescript' };
      case 'lens-order-list-pending':
        return { path: 'src/components/LensOrderListPending.tsx', content: generateLensOrderListPending({}), language: 'typescript' };
      case 'eyewear-grid':
        return { path: 'src/components/EyewearGrid.tsx', content: this.generateEntityGridComponent('EyewearGrid', 'eyewear', { title: 'name', subtitle: 'brand', badge: 'price', image: 'image' }, 'eyewear'), language: 'typescript' };
      case 'eyewear-detail':
        return { path: 'src/components/EyewearDetail.tsx', content: this.generateEntityDetailComponent('EyewearDetail', 'eyewear', [
      { key: 'name', label: 'Name', icon: 'Glasses' },
      { key: 'brand', label: 'Brand', icon: 'Tag' },
      { key: 'sku', label: 'SKU', icon: 'Barcode' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'frame_type', label: 'Frame Type', icon: 'Square' },
      { key: 'frame_material', label: 'Frame Material', icon: 'Box' },
      { key: 'frame_color', label: 'Frame Color', icon: 'Palette' },
      { key: 'lens_width', label: 'Lens Width', icon: 'Ruler' },
      { key: 'bridge_width', label: 'Bridge Width', icon: 'Ruler' },
      { key: 'temple_length', label: 'Temple Length', icon: 'Ruler' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'quantity', label: 'In Stock', icon: 'Package' },
    ], 'eyewear'), language: 'typescript' };
      case 'exam-calendar':
        return { path: 'src/components/ExamCalendar.tsx', content: generateExamCalendar({}), language: 'typescript' };
      case 'exam-detail':
        return { path: 'src/components/ExamDetail.tsx', content: this.generateEntityDetailComponent('ExamDetail', 'exam', [
      { key: 'exam_number', label: 'Exam Number', icon: 'Eye' },
      { key: 'patient_name', label: 'Patient', icon: 'User' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'exam_type', label: 'Exam Type', icon: 'FileText' },
      { key: 'optometrist', label: 'Optometrist', icon: 'UserCheck' },
      { key: 'visual_acuity_right', label: 'VA Right', icon: 'Eye' },
      { key: 'visual_acuity_left', label: 'VA Left', icon: 'Eye' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'exams'), language: 'typescript' };
      case 'prescription-table-optical':
        return { path: 'src/components/PrescriptionTableOptical.tsx', content: this.generateEntityTableComponent('PrescriptionTableOptical', 'prescription', [
      { key: 'prescription_number', label: 'Rx #' },
      { key: 'patient_name', label: 'Patient' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'sphere_right', label: 'SPH (R)' },
      { key: 'sphere_left', label: 'SPH (L)' },
      { key: 'expiry_date', label: 'Expires', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'prescriptions'), language: 'typescript' };
      case 'lens-order-table':
        return { path: 'src/components/LensOrderTable.tsx', content: this.generateEntityTableComponent('LensOrderTable', 'lens_order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'frame', label: 'Frame' },
      { key: 'lens_type', label: 'Lens Type' },
      { key: 'order_date', label: 'Ordered', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'lens-orders'), language: 'typescript' };
      case 'lens-order-detail':
        return { path: 'src/components/LensOrderDetail.tsx', content: this.generateEntityDetailComponent('LensOrderDetail', 'lens_order', [
      { key: 'order_number', label: 'Order Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'frame', label: 'Frame', icon: 'Glasses' },
      { key: 'lens_type', label: 'Lens Type', icon: 'Circle' },
      { key: 'lens_material', label: 'Lens Material', icon: 'Box' },
      { key: 'coatings', label: 'Coatings', icon: 'Layers' },
      { key: 'prescription', label: 'Prescription', icon: 'FileText' },
      { key: 'order_date', label: 'Order Date', type: 'date', icon: 'Calendar' },
      { key: 'estimated_ready', label: 'Est. Ready', type: 'date', icon: 'CalendarCheck' },
      { key: 'frame_cost', label: 'Frame Cost', type: 'currency', icon: 'DollarSign' },
      { key: 'lens_cost', label: 'Lens Cost', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'lens-orders'), language: 'typescript' };
      case 'customer-table-optician':
        return { path: 'src/components/CustomerTableOptician.tsx', content: this.generateEntityTableComponent('CustomerTableOptician', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'date_of_birth', label: 'DOB', type: 'date' },
      { key: 'phone', label: 'Phone' },
      { key: 'last_exam', label: 'Last Exam', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-optician':
        return { path: 'src/components/CustomerProfileOptician.tsx', content: generateCustomerProfileOptician({}), language: 'typescript' };
      case 'customer-prescriptions-optician':
        return { path: 'src/components/CustomerPrescriptionsOptician.tsx', content: generateCustomerPrescriptionsOptician({}), language: 'typescript' };
      case 'public-booking-optician':
        return { path: 'src/components/PublicBookingOptician.tsx', content: this.generatePublicFormComponent('PublicBookingOptician', 'exam', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'preferred_date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'exam_type', label: 'Exam Type', type: 'select' },
      { key: 'insurance_provider', label: 'Insurance Provider', type: 'text' },
      { key: 'notes', label: 'Additional Notes', type: 'textarea' },
    ], 'exam-bookings'), language: 'typescript' };

      // ===== Yoga Studio =====
      case 'yoga-stats':
        return { path: 'src/components/YogaStats.tsx', content: generateYogaStats({}), language: 'typescript' };
      case 'class-list-today-yoga':
        return { path: 'src/components/ClassListTodayYoga.tsx', content: generateClassListTodayYoga({}), language: 'typescript' };
      case 'workshop-list-upcoming':
        return { path: 'src/components/WorkshopListUpcoming.tsx', content: generateWorkshopListUpcoming({}), language: 'typescript' };
      case 'class-calendar-yoga':
        return { path: 'src/components/ClassCalendarYoga.tsx', content: generateClassCalendarYoga({}), language: 'typescript' };
      case 'class-detail-yoga':
        return { path: 'src/components/ClassDetailYoga.tsx', content: this.generateEntityDetailComponent('ClassDetailYoga', 'class', [
      { key: 'name', label: 'Class Name', icon: 'Flower2' },
      { key: 'style', label: 'Style', icon: 'Tag' },
      { key: 'level', label: 'Level', icon: 'BarChart2' },
      { key: 'instructor_name', label: 'Instructor', icon: 'User' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'duration', label: 'Duration', icon: 'Timer' },
      { key: 'room', label: 'Room', icon: 'DoorOpen' },
      { key: 'capacity', label: 'Capacity', icon: 'Users' },
      { key: 'enrolled', label: 'Enrolled', icon: 'UserCheck' },
      { key: 'description', label: 'Description', icon: 'FileText' },
    ], 'classes'), language: 'typescript' };
      case 'class-roster-yoga':
        return { path: 'src/components/ClassRosterYoga.tsx', content: this.generateEntityTableComponent('ClassRosterYoga', 'attendance', [
      { key: 'member_name', label: 'Member' },
      { key: 'membership_type', label: 'Membership' },
      { key: 'check_in_time', label: 'Check In' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'class-attendance'), language: 'typescript' };
      case 'instructor-grid-yoga':
        return { path: 'src/components/InstructorGridYoga.tsx', content: this.generateEntityGridComponent('InstructorGridYoga', 'instructor', { title: 'name', subtitle: 'specialties', badge: 'status', image: 'photo' }, 'instructors'), language: 'typescript' };
      case 'instructor-profile-yoga':
        return { path: 'src/components/InstructorProfileYoga.tsx', content: generateInstructorProfileYoga({}), language: 'typescript' };
      case 'instructor-schedule-yoga':
        return { path: 'src/components/InstructorScheduleYoga.tsx', content: generateInstructorScheduleYoga({}), language: 'typescript' };
      case 'member-table-yoga':
        return { path: 'src/components/MemberTableYoga.tsx', content: this.generateEntityTableComponent('MemberTableYoga', 'member', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'membership_type', label: 'Membership' },
      { key: 'join_date', label: 'Joined', type: 'date' },
      { key: 'expiry_date', label: 'Expires', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'members'), language: 'typescript' };
      case 'member-profile-yoga':
        return { path: 'src/components/MemberProfileYoga.tsx', content: generateMemberProfileYoga({}), language: 'typescript' };
      case 'member-attendance-yoga':
        return { path: 'src/components/MemberAttendanceYoga.tsx', content: this.generateEntityTableComponent('MemberAttendanceYoga', 'attendance', [
      { key: 'class_name', label: 'Class' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'instructor_name', label: 'Instructor' },
    ], 'member-attendance'), language: 'typescript' };
      case 'workshop-grid':
        return { path: 'src/components/WorkshopGrid.tsx', content: this.generateEntityGridComponent('WorkshopGrid', 'workshop', { title: 'name', subtitle: 'instructor_name', badge: 'price', image: 'image' }, 'workshops'), language: 'typescript' };
      case 'workshop-detail':
        return { path: 'src/components/WorkshopDetail.tsx', content: this.generateEntityDetailComponent('WorkshopDetail', 'workshop', [
      { key: 'name', label: 'Workshop Name', icon: 'Sparkles' },
      { key: 'instructor_name', label: 'Instructor', icon: 'User' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'duration', label: 'Duration', icon: 'Timer' },
      { key: 'location', label: 'Location', icon: 'MapPin' },
      { key: 'capacity', label: 'Capacity', icon: 'Users' },
      { key: 'enrolled', label: 'Enrolled', icon: 'UserCheck' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'description', label: 'Description', icon: 'FileText' },
    ], 'workshops'), language: 'typescript' };
      case 'public-schedule-yoga':
        return { path: 'src/components/PublicScheduleYoga.tsx', content: generatePublicScheduleYoga({}), language: 'typescript' };
      case 'public-booking-yoga':
        return { path: 'src/components/PublicBookingYoga.tsx', content: this.generatePublicFormComponent('PublicBookingYoga', 'member', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'membership_type', label: 'Membership Interest', type: 'select' },
      { key: 'experience_level', label: 'Experience Level', type: 'select' },
      { key: 'message', label: 'Message', type: 'textarea' },
    ], 'membership-inquiries'), language: 'typescript' };

      // ===== CrossFit Gym =====
      case 'crossfit-stats':
        return { path: 'src/components/CrossfitStats.tsx', content: generateCrossfitStats({}), language: 'typescript' };
      case 'wod-today':
        return { path: 'src/components/WodToday.tsx', content: generateWodToday({}), language: 'typescript' };
      case 'leaderboard-preview':
        return { path: 'src/components/LeaderboardPreview.tsx', content: generateLeaderboardPreview({}), language: 'typescript' };
      case 'wod-calendar':
        return { path: 'src/components/WodCalendar.tsx', content: generateWodCalendar({}), language: 'typescript' };
      case 'wod-detail':
        return { path: 'src/components/WodDetail.tsx', content: this.generateEntityDetailComponent('WodDetail', 'wod', [
      { key: 'name', label: 'WOD Name', icon: 'Flame' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'time_cap', label: 'Time Cap', icon: 'Timer' },
      { key: 'movements', label: 'Movements', icon: 'List' },
      { key: 'rounds', label: 'Rounds', icon: 'RefreshCw' },
      { key: 'scaling_options', label: 'Scaling', icon: 'BarChart2' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'coach_notes', label: 'Coach Notes', icon: 'StickyNote' },
    ], 'wods'), language: 'typescript' };
      case 'wod-results':
        return { path: 'src/components/WodResults.tsx', content: this.generateEntityTableComponent('WodResults', 'result', [
      { key: 'rank', label: 'Rank' },
      { key: 'athlete_name', label: 'Athlete' },
      { key: 'score', label: 'Score' },
      { key: 'rx', label: 'Rx' },
      { key: 'notes', label: 'Notes' },
    ], 'wod-results'), language: 'typescript' };
      case 'athlete-table':
        return { path: 'src/components/AthleteTable.tsx', content: this.generateEntityTableComponent('AthleteTable', 'athlete', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'membership_type', label: 'Membership' },
      { key: 'join_date', label: 'Joined', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'athletes'), language: 'typescript' };
      case 'athlete-profile':
        return { path: 'src/components/AthleteProfile.tsx', content: generateAthleteProfile({}), language: 'typescript' };
      case 'athlete-performance':
        return { path: 'src/components/AthletePerformance.tsx', content: this.generateEntityTableComponent('AthletePerformance', 'benchmark_score', [
      { key: 'benchmark_name', label: 'Benchmark' },
      { key: 'score', label: 'Score' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'is_pr', label: 'PR' },
    ], 'athlete-performance'), language: 'typescript' };
      case 'benchmark-table':
        return { path: 'src/components/BenchmarkTable.tsx', content: this.generateEntityTableComponent('BenchmarkTable', 'benchmark', [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
    ], 'benchmarks'), language: 'typescript' };
      case 'benchmark-detail':
        return { path: 'src/components/BenchmarkDetail.tsx', content: this.generateEntityDetailComponent('BenchmarkDetail', 'benchmark', [
      { key: 'name', label: 'Name', icon: 'Target' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'movements', label: 'Movements', icon: 'List' },
      { key: 'time_cap', label: 'Time Cap', icon: 'Timer' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'standards', label: 'Standards', icon: 'CheckSquare' },
    ], 'benchmarks'), language: 'typescript' };
      case 'benchmark-leaderboard':
        return { path: 'src/components/BenchmarkLeaderboard.tsx', content: this.generateEntityTableComponent('BenchmarkLeaderboard', 'benchmark_score', [
      { key: 'rank', label: 'Rank' },
      { key: 'athlete_name', label: 'Athlete' },
      { key: 'score', label: 'Score' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'rx', label: 'Rx' },
    ], 'benchmark-leaderboard'), language: 'typescript' };
      case 'competition-grid':
        return { path: 'src/components/CompetitionGrid.tsx', content: this.generateEntityGridComponent('CompetitionGrid', 'competition', { title: 'name', subtitle: 'date', badge: 'status', image: 'image' }, 'competitions'), language: 'typescript' };
      case 'competition-detail':
        return { path: 'src/components/CompetitionDetail.tsx', content: this.generateEntityDetailComponent('CompetitionDetail', 'competition', [
      { key: 'name', label: 'Competition Name', icon: 'Trophy' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'location', label: 'Location', icon: 'MapPin' },
      { key: 'divisions', label: 'Divisions', icon: 'Users' },
      { key: 'events', label: 'Events', icon: 'List' },
      { key: 'registration_deadline', label: 'Registration Deadline', type: 'date', icon: 'CalendarX' },
      { key: 'entry_fee', label: 'Entry Fee', type: 'currency', icon: 'DollarSign' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'competitions'), language: 'typescript' };
      case 'public-wod':
        return { path: 'src/components/PublicWod.tsx', content: generatePublicWod({}), language: 'typescript' };
      case 'public-signup-crossfit':
        return { path: 'src/components/PublicSignupCrossfit.tsx', content: this.generatePublicFormComponent('PublicSignupCrossfit', 'athlete', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'experience_level', label: 'CrossFit Experience', type: 'select' },
      { key: 'goals', label: 'Fitness Goals', type: 'textarea' },
      { key: 'emergency_contact', label: 'Emergency Contact', type: 'text', required: true },
      { key: 'emergency_phone', label: 'Emergency Phone', type: 'phone', required: true },
    ], 'membership-signup'), language: 'typescript' };

      // ===== Marina =====
      case 'marina-stats':
        return { path: 'src/components/MarinaStats.tsx', content: generateMarinaStats({}), language: 'typescript' };
      case 'slip-availability':
        return { path: 'src/components/SlipAvailability.tsx', content: generateSlipAvailability({}), language: 'typescript' };
      case 'reservation-list-today-marina':
        return { path: 'src/components/ReservationListTodayMarina.tsx', content: generateReservationListTodayMarina({}), language: 'typescript' };
      case 'slip-grid':
        return { path: 'src/components/SlipGrid.tsx', content: this.generateEntityGridComponent('SlipGrid', 'slip', { title: 'slip_number', subtitle: 'size', badge: 'status', image: 'image' }, 'slips'), language: 'typescript' };
      case 'slip-detail':
        return { path: 'src/components/SlipDetail.tsx', content: this.generateEntityDetailComponent('SlipDetail', 'slip', [
      { key: 'slip_number', label: 'Slip Number', icon: 'Anchor' },
      { key: 'dock', label: 'Dock', icon: 'MapPin' },
      { key: 'size', label: 'Size', icon: 'Ruler' },
      { key: 'max_length', label: 'Max Length', icon: 'Maximize2' },
      { key: 'max_beam', label: 'Max Beam', icon: 'ArrowLeftRight' },
      { key: 'depth', label: 'Depth', icon: 'Anchor' },
      { key: 'power', label: 'Power', icon: 'Zap' },
      { key: 'water', label: 'Water', icon: 'Droplets' },
      { key: 'daily_rate', label: 'Daily Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'monthly_rate', label: 'Monthly Rate', type: 'currency', icon: 'Calendar' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'slips'), language: 'typescript' };
      case 'slip-reservations':
        return { path: 'src/components/SlipReservations.tsx', content: this.generateEntityTableComponent('SlipReservations', 'reservation', [
      { key: 'customer_name', label: 'Customer' },
      { key: 'boat_name', label: 'Boat' },
      { key: 'arrival_date', label: 'Arrival', type: 'date' },
      { key: 'departure_date', label: 'Departure', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'slip-reservations'), language: 'typescript' };
      case 'boat-table':
        return { path: 'src/components/BoatTable.tsx', content: this.generateEntityTableComponent('BoatTable', 'boat', [
      { key: 'name', label: 'Boat Name' },
      { key: 'type', label: 'Type' },
      { key: 'length', label: 'Length' },
      { key: 'owner_name', label: 'Owner' },
      { key: 'registration', label: 'Registration' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'boats'), language: 'typescript' };
      case 'boat-detail':
        return { path: 'src/components/BoatDetail.tsx', content: this.generateEntityDetailComponent('BoatDetail', 'boat', [
      { key: 'name', label: 'Boat Name', icon: 'Ship' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'make', label: 'Make', icon: 'Building' },
      { key: 'model', label: 'Model', icon: 'FileText' },
      { key: 'year', label: 'Year', icon: 'Calendar' },
      { key: 'length', label: 'Length', icon: 'Ruler' },
      { key: 'beam', label: 'Beam', icon: 'ArrowLeftRight' },
      { key: 'draft', label: 'Draft', icon: 'Anchor' },
      { key: 'registration', label: 'Registration', icon: 'FileCheck' },
      { key: 'hull_id', label: 'Hull ID', icon: 'Hash' },
      { key: 'owner_name', label: 'Owner', icon: 'User' },
      { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date', icon: 'Shield' },
    ], 'boats'), language: 'typescript' };
      case 'reservation-calendar-marina':
        return { path: 'src/components/ReservationCalendarMarina.tsx', content: generateReservationCalendarMarina({}), language: 'typescript' };
      case 'reservation-detail-marina':
        return { path: 'src/components/ReservationDetailMarina.tsx', content: this.generateEntityDetailComponent('ReservationDetailMarina', 'reservation', [
      { key: 'reservation_number', label: 'Reservation #', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'boat_name', label: 'Boat', icon: 'Ship' },
      { key: 'slip_number', label: 'Slip', icon: 'Anchor' },
      { key: 'arrival_date', label: 'Arrival', type: 'date', icon: 'Calendar' },
      { key: 'departure_date', label: 'Departure', type: 'date', icon: 'CalendarCheck' },
      { key: 'nights', label: 'Nights', icon: 'Moon' },
      { key: 'rate_per_night', label: 'Rate/Night', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'reservations'), language: 'typescript' };
      case 'service-table-marina':
        return { path: 'src/components/ServiceTableMarina.tsx', content: this.generateEntityTableComponent('ServiceTableMarina', 'service', [
      { key: 'service_number', label: 'Service #' },
      { key: 'boat_name', label: 'Boat' },
      { key: 'service_type', label: 'Type' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'services'), language: 'typescript' };
      case 'customer-table-marina':
        return { path: 'src/components/CustomerTableMarina.tsx', content: this.generateEntityTableComponent('CustomerTableMarina', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'boats_count', label: 'Boats' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-profile-marina':
        return { path: 'src/components/CustomerProfileMarina.tsx', content: generateCustomerProfileMarina({}), language: 'typescript' };
      case 'customer-boats':
        return { path: 'src/components/CustomerBoats.tsx', content: generateCustomerBoats({}), language: 'typescript' };
      case 'public-slip-booking':
        return { path: 'src/components/PublicSlipBooking.tsx', content: this.generatePublicFormComponent('PublicSlipBooking', 'reservation', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'boat_name', label: 'Boat Name', type: 'text', required: true },
      { key: 'boat_length', label: 'Boat Length (ft)', type: 'number', required: true },
      { key: 'arrival_date', label: 'Arrival Date', type: 'date', required: true },
      { key: 'departure_date', label: 'Departure Date', type: 'date', required: true },
      { key: 'special_requests', label: 'Special Requests', type: 'textarea' },
    ], 'slip-reservations'), language: 'typescript' };

      // ===== Campground/RV Park =====
      case 'campground-stats':
        return { path: 'src/components/CampgroundStats.tsx', content: generateCampgroundStats({}), language: 'typescript' };
      case 'site-availability':
        return { path: 'src/components/SiteAvailability.tsx', content: generateSiteAvailability({}), language: 'typescript' };
      case 'checkin-list-today':
        return { path: 'src/components/CheckinListToday.tsx', content: generateCheckinListToday({}), language: 'typescript' };
      case 'site-map-campground':
        return { path: 'src/components/SiteMapCampground.tsx', content: this.generateEntityGridComponent('SiteMapCampground', 'site', { title: 'site_number', subtitle: 'type', badge: 'status' }, 'sites'), language: 'typescript' };
      case 'site-detail-campground':
        return { path: 'src/components/SiteDetailCampground.tsx', content: this.generateEntityDetailComponent('SiteDetailCampground', 'site', [
      { key: 'site_number', label: 'Site Number', icon: 'Tent' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'area', label: 'Area', icon: 'MapPin' },
      { key: 'max_length', label: 'Max Length', icon: 'Ruler' },
      { key: 'hookups', label: 'Hookups', icon: 'Plug' },
      { key: 'amp_service', label: 'Amp Service', icon: 'Zap' },
      { key: 'water', label: 'Water', icon: 'Droplets' },
      { key: 'sewer', label: 'Sewer', icon: 'PipeFill' },
      { key: 'wifi', label: 'WiFi', icon: 'Wifi' },
      { key: 'nightly_rate', label: 'Nightly Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'weekly_rate', label: 'Weekly Rate', type: 'currency', icon: 'Calendar' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'sites'), language: 'typescript' };
      case 'site-reservations':
        return { path: 'src/components/SiteReservations.tsx', content: this.generateEntityTableComponent('SiteReservations', 'reservation', [
      { key: 'guest_name', label: 'Guest' },
      { key: 'check_in_date', label: 'Check In', type: 'date' },
      { key: 'check_out_date', label: 'Check Out', type: 'date' },
      { key: 'nights', label: 'Nights' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'site-reservations'), language: 'typescript' };
      case 'reservation-calendar-campground':
        return { path: 'src/components/ReservationCalendarCampground.tsx', content: generateReservationCalendarCampground({}), language: 'typescript' };
      case 'reservation-detail-campground':
        return { path: 'src/components/ReservationDetailCampground.tsx', content: this.generateEntityDetailComponent('ReservationDetailCampground', 'reservation', [
      { key: 'reservation_number', label: 'Reservation #', icon: 'FileText' },
      { key: 'guest_name', label: 'Guest', icon: 'User' },
      { key: 'site_number', label: 'Site', icon: 'Tent' },
      { key: 'check_in_date', label: 'Check In', type: 'date', icon: 'Calendar' },
      { key: 'check_out_date', label: 'Check Out', type: 'date', icon: 'CalendarCheck' },
      { key: 'nights', label: 'Nights', icon: 'Moon' },
      { key: 'adults', label: 'Adults', icon: 'Users' },
      { key: 'children', label: 'Children', icon: 'Baby' },
      { key: 'vehicles', label: 'Vehicles', icon: 'Car' },
      { key: 'rate_per_night', label: 'Rate/Night', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'reservations'), language: 'typescript' };
      case 'activity-calendar-campground':
        return { path: 'src/components/ActivityCalendarCampground.tsx', content: generateActivityCalendarCampground({}), language: 'typescript' };
      case 'rate-table':
        return { path: 'src/components/RateTable.tsx', content: this.generateEntityTableComponent('RateTable', 'rate', [
      { key: 'name', label: 'Rate Name' },
      { key: 'site_type', label: 'Site Type' },
      { key: 'season', label: 'Season' },
      { key: 'nightly_rate', label: 'Nightly', type: 'currency' },
      { key: 'weekly_rate', label: 'Weekly', type: 'currency' },
      { key: 'monthly_rate', label: 'Monthly', type: 'currency' },
    ], 'rates'), language: 'typescript' };
      case 'customer-table-campground':
        return { path: 'src/components/CustomerTableCampground.tsx', content: this.generateEntityTableComponent('CustomerTableCampground', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'visits', label: 'Visits' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'public-site-booking':
        return { path: 'src/components/PublicSiteBooking.tsx', content: this.generatePublicFormComponent('PublicSiteBooking', 'reservation', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'site_type', label: 'Site Type', type: 'select', required: true },
      { key: 'check_in_date', label: 'Check In Date', type: 'date', required: true },
      { key: 'check_out_date', label: 'Check Out Date', type: 'date', required: true },
      { key: 'adults', label: 'Number of Adults', type: 'number', required: true },
      { key: 'children', label: 'Number of Children', type: 'number' },
      { key: 'rig_length', label: 'RV/Trailer Length (ft)', type: 'number' },
      { key: 'special_requests', label: 'Special Requests', type: 'textarea' },
    ], 'reservations'), language: 'typescript' };

      // ===== Golf Course =====
      case 'golf-stats':
        return { path: 'src/components/GolfStats.tsx', content: generateGolfStats({}), language: 'typescript' };
      case 'tee-time-list-today':
        return { path: 'src/components/TeeTimeListToday.tsx', content: generateTeeTimeListToday({}), language: 'typescript' };
      case 'tournament-list-upcoming':
        return { path: 'src/components/TournamentListUpcoming.tsx', content: generateTournamentListUpcoming({}), language: 'typescript' };
      case 'tee-time-calendar':
        return { path: 'src/components/TeeTimeCalendar.tsx', content: generateTeeTimeCalendar({}), language: 'typescript' };
      case 'tee-time-detail':
        return { path: 'src/components/TeeTimeDetail.tsx', content: this.generateEntityDetailComponent('TeeTimeDetail', 'tee_time', [
      { key: 'confirmation_number', label: 'Confirmation #', icon: 'FileText' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Tee Time', icon: 'Clock' },
      { key: 'player_name', label: 'Player', icon: 'User' },
      { key: 'players_count', label: 'Players', icon: 'Users' },
      { key: 'holes', label: 'Holes', icon: 'Flag' },
      { key: 'cart', label: 'Cart', icon: 'Car' },
      { key: 'green_fee', label: 'Green Fee', type: 'currency', icon: 'DollarSign' },
      { key: 'cart_fee', label: 'Cart Fee', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'tee-times'), language: 'typescript' };
      case 'member-table-golf':
        return { path: 'src/components/MemberTableGolf.tsx', content: this.generateEntityTableComponent('MemberTableGolf', 'member', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'membership_type', label: 'Membership' },
      { key: 'handicap', label: 'Handicap' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'members'), language: 'typescript' };
      case 'member-profile-golf':
        return { path: 'src/components/MemberProfileGolf.tsx', content: generateMemberProfileGolf({}), language: 'typescript' };
      case 'member-handicap':
        return {
          path: 'src/components/MemberHandicap.tsx',
          content: this.generateEntityTableComponent('MemberHandicap', 'handicap', [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'course', label: 'Course' },
            { key: 'score', label: 'Score' },
            { key: 'handicap_index', label: 'Index' },
          ], 'handicaps'),
          language: 'typescript',
        };
      case 'tournament-detail':
        return { path: 'src/components/TournamentDetail.tsx', content: this.generateEntityDetailComponent('TournamentDetail', 'tournament', [
      { key: 'name', label: 'Tournament Name', icon: 'Trophy' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'format', label: 'Format', icon: 'Tag' },
      { key: 'entry_fee', label: 'Entry Fee', type: 'currency', icon: 'DollarSign' },
      { key: 'max_players', label: 'Max Players', icon: 'Users' },
      { key: 'current_entries', label: 'Current Entries', icon: 'UserCheck' },
      { key: 'registration_deadline', label: 'Registration Deadline', type: 'date', icon: 'CalendarX' },
      { key: 'prizes', label: 'Prizes', icon: 'Gift' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'tournaments'), language: 'typescript' };
      case 'tournament-leaderboard':
        return { path: 'src/components/TournamentLeaderboard.tsx', content: this.generateEntityTableComponent('TournamentLeaderboard', 'score', [
      { key: 'position', label: 'Pos' },
      { key: 'player_name', label: 'Player' },
      { key: 'score', label: 'Score' },
      { key: 'thru', label: 'Thru' },
      { key: 'to_par', label: 'To Par' },
    ], 'tournament-scores'), language: 'typescript' };
      case 'proshop-grid':
        return { path: 'src/components/ProshopGrid.tsx', content: this.generateEntityGridComponent('ProshopGrid', 'product', { title: 'name', subtitle: 'price', badge: 'category', image: 'image' }, 'products'), language: 'typescript' };
      case 'lesson-calendar-golf':
        return { path: 'src/components/LessonCalendarGolf.tsx', content: generateLessonCalendarGolf({}), language: 'typescript' };
      case 'public-booking-golf':
        return { path: 'src/components/PublicBookingGolf.tsx', content: this.generatePublicFormComponent('PublicBookingGolf', 'tee_time', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'preferred_time', label: 'Preferred Time', type: 'select', required: true },
      { key: 'players', label: 'Number of Players', type: 'number', required: true },
      { key: 'holes', label: 'Holes (9 or 18)', type: 'select', required: true },
      { key: 'cart_needed', label: 'Cart Needed', type: 'select' },
      { key: 'notes', label: 'Special Requests', type: 'textarea' },
    ], 'tee-time-bookings'), language: 'typescript' };

      // ===== Ski Resort =====
      case 'skiresort-stats':
        return { path: 'src/components/SkiResortStats.tsx', content: generateSkiResortStats({}), language: 'typescript' };
      case 'trail-status-overview':
        return { path: 'src/components/TrailStatusOverview.tsx', content: generateTrailStatusOverview({}), language: 'typescript' };
      case 'ticket-sales-today':
        return { path: 'src/components/TicketSalesToday.tsx', content: generateTicketSalesToday({}), language: 'typescript' };
      case 'ticket-sales-ski':
        return { path: 'src/components/TicketSalesSki.tsx', content: this.generateEntityTableComponent('TicketSalesSki', 'ticket', [
      { key: 'ticket_number', label: 'Ticket #' },
      { key: 'type', label: 'Type' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'valid_date', label: 'Valid Date', type: 'date' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'tickets'), language: 'typescript' };
      case 'rental-table-ski':
        return { path: 'src/components/RentalTableSki.tsx', content: this.generateEntityTableComponent('RentalTableSki', 'rental', [
      { key: 'rental_number', label: 'Rental #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'equipment_type', label: 'Equipment' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'rentals'), language: 'typescript' };
      case 'rental-detail-ski':
        return { path: 'src/components/RentalDetailSki.tsx', content: this.generateEntityDetailComponent('RentalDetailSki', 'rental', [
      { key: 'rental_number', label: 'Rental Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'customer_phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'equipment_type', label: 'Equipment Type', icon: 'Package' },
      { key: 'skill_level', label: 'Skill Level', icon: 'BarChart2' },
      { key: 'boot_size', label: 'Boot Size', icon: 'Footprints' },
      { key: 'height', label: 'Height', icon: 'Ruler' },
      { key: 'weight', label: 'Weight', icon: 'Scale' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'end_date', label: 'End Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'daily_rate', label: 'Daily Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'rentals'), language: 'typescript' };
      case 'lesson-calendar-ski':
        return { path: 'src/components/LessonCalendarSki.tsx', content: generateLessonCalendarSki({}), language: 'typescript' };
      case 'trail-map':
        return { path: 'src/components/TrailMap.tsx', content: this.generateEntityGridComponent('TrailMap', 'trail', { title: 'name', subtitle: 'difficulty', badge: 'status' }, 'trails'), language: 'typescript' };
      case 'trail-conditions':
        return { path: 'src/components/TrailConditions.tsx', content: this.generateEntityTableComponent('TrailConditions', 'trail', [
      { key: 'name', label: 'Trail' },
      { key: 'difficulty', label: 'Difficulty' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'groomed', label: 'Groomed' },
      { key: 'snow_depth', label: 'Snow Depth' },
      { key: 'last_updated', label: 'Updated', type: 'datetime' },
    ], 'trails'), language: 'typescript' };
      case 'pass-table':
        return { path: 'src/components/PassTable.tsx', content: this.generateEntityTableComponent('PassTable', 'pass', [
      { key: 'pass_number', label: 'Pass #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'pass_type', label: 'Type' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'visits_used', label: 'Visits Used' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'passes'), language: 'typescript' };
      case 'customer-table-ski':
        return { path: 'src/components/CustomerTableSki.tsx', content: this.generateEntityTableComponent('CustomerTableSki', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'pass_type', label: 'Pass' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'public-tickets-ski':
        return { path: 'src/components/PublicTicketsSki.tsx', content: this.generatePublicFormComponent('PublicTicketsSki', 'ticket', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone' },
      { key: 'ticket_type', label: 'Ticket Type', type: 'select', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'quantity', label: 'Quantity', type: 'number', required: true },
    ], 'ticket-purchases'), language: 'typescript' };
      case 'public-conditions-ski':
        return { path: 'src/components/PublicConditionsSki.tsx', content: this.generateEntityTableComponent('PublicConditionsSki', 'trail', [
      { key: 'name', label: 'Trail' },
      { key: 'difficulty', label: 'Difficulty' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'groomed', label: 'Groomed' },
      { key: 'snow_depth', label: 'Snow' },
    ], 'trails'), language: 'typescript' };

      // ===== Brewery/Winery =====
      case 'brewery-stats':
        return { path: 'src/components/BreweryStats.tsx', content: generateBreweryStats({}), language: 'typescript' };
      case 'tour-list-today':
        return { path: 'src/components/TourListToday.tsx', content: generateTourListToday({}), language: 'typescript' };
      case 'order-list-recent-brewery':
        return { path: 'src/components/OrderListRecentBrewery.tsx', content: generateOrderListRecentBrewery({}), language: 'typescript' };
      case 'product-grid-brewery':
        return { path: 'src/components/ProductGridBrewery.tsx', content: this.generateEntityGridComponent('ProductGridBrewery', 'product', { title: 'name', subtitle: 'style', badge: 'abv', image: 'image' }, 'products'), language: 'typescript' };
      case 'product-detail-brewery':
        return { path: 'src/components/ProductDetailBrewery.tsx', content: this.generateEntityDetailComponent('ProductDetailBrewery', 'product', [
      { key: 'name', label: 'Name', icon: 'Beer' },
      { key: 'style', label: 'Style', icon: 'Tag' },
      { key: 'abv', label: 'ABV', icon: 'Percent' },
      { key: 'ibu', label: 'IBU', icon: 'BarChart2' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'tasting_notes', label: 'Tasting Notes', icon: 'Sparkles' },
      { key: 'food_pairing', label: 'Food Pairing', icon: 'UtensilsCrossed' },
      { key: 'price_pint', label: 'Price/Pint', type: 'currency', icon: 'DollarSign' },
      { key: 'price_growler', label: 'Price/Growler', type: 'currency', icon: 'DollarSign' },
      { key: 'availability', label: 'Availability', icon: 'CheckCircle' },
    ], 'products'), language: 'typescript' };
      case 'tour-calendar-brewery':
        return { path: 'src/components/TourCalendarBrewery.tsx', content: generateTourCalendarBrewery({}), language: 'typescript' };
      case 'tour-detail-brewery':
        return { path: 'src/components/TourDetailBrewery.tsx', content: this.generateEntityDetailComponent('TourDetailBrewery', 'tour', [
      { key: 'tour_number', label: 'Tour Number', icon: 'FileText' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'group_name', label: 'Group/Customer', icon: 'Users' },
      { key: 'party_size', label: 'Party Size', icon: 'Hash' },
      { key: 'tour_type', label: 'Tour Type', icon: 'Tag' },
      { key: 'guide', label: 'Guide', icon: 'User' },
      { key: 'price_per_person', label: 'Price/Person', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'tours'), language: 'typescript' };
      case 'tasting-table':
        return { path: 'src/components/TastingTable.tsx', content: this.generateEntityTableComponent('TastingTable', 'tasting', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'flight_type', label: 'Flight' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'tastings'), language: 'typescript' };
      case 'event-calendar-brewery':
        return { path: 'src/components/EventCalendarBrewery.tsx', content: generateEventCalendarBrewery({}), language: 'typescript' };
      case 'member-table-brewery':
        return { path: 'src/components/MemberTableBrewery.tsx', content: this.generateEntityTableComponent('MemberTableBrewery', 'member', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'membership_tier', label: 'Tier' },
      { key: 'join_date', label: 'Joined', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'members'), language: 'typescript' };
      case 'member-profile-brewery':
        return { path: 'src/components/MemberProfileBrewery.tsx', content: generateMemberProfileBrewery({}), language: 'typescript' };
      case 'member-orders-brewery':
        return { path: 'src/components/MemberOrdersBrewery.tsx', content: this.generateEntityTableComponent('MemberOrdersBrewery', 'order', [
      { key: 'order_number', label: 'Order #' },
      { key: 'order_date', label: 'Date', type: 'date' },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'member-orders'), language: 'typescript' };
      case 'public-visit-brewery':
        return { path: 'src/components/PublicVisitBrewery.tsx', content: this.generatePublicFormComponent('PublicVisitBrewery', 'tour', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'time', label: 'Preferred Time', type: 'select', required: true },
      { key: 'party_size', label: 'Party Size', type: 'number', required: true },
      { key: 'tour_type', label: 'Tour Type', type: 'select' },
      { key: 'special_requests', label: 'Special Requests', type: 'textarea' },
    ], 'tour-bookings'), language: 'typescript' };
      case 'public-shop-brewery':
        return { path: 'src/components/PublicShopBrewery.tsx', content: this.generateEntityGridComponent('PublicShopBrewery', 'product', { title: 'name', subtitle: 'price', badge: 'style', image: 'image' }, 'products'), language: 'typescript' };

      // ===== Escape Room =====
      case 'escaperoom-stats':
        return { path: 'src/components/EscapeRoomStats.tsx', content: generateEscapeRoomStats({}), language: 'typescript' };
      case 'booking-list-today-escape':
        return { path: 'src/components/BookingListTodayEscape.tsx', content: generateBookingListTodayEscape({}), language: 'typescript' };
      case 'room-status-overview':
        return { path: 'src/components/RoomStatusOverview.tsx', content: generateRoomStatusOverview({}), language: 'typescript' };
      case 'room-grid-escape':
        return { path: 'src/components/RoomGridEscape.tsx', content: this.generateEntityGridComponent('RoomGridEscape', 'room', { title: 'name', subtitle: 'theme', badge: 'difficulty', image: 'image' }, 'rooms'), language: 'typescript' };
      case 'room-detail-escape':
        return { path: 'src/components/RoomDetailEscape.tsx', content: this.generateEntityDetailComponent('RoomDetailEscape', 'room', [
      { key: 'name', label: 'Room Name', icon: 'Key' },
      { key: 'theme', label: 'Theme', icon: 'Sparkles' },
      { key: 'difficulty', label: 'Difficulty', icon: 'BarChart2' },
      { key: 'duration', label: 'Duration', icon: 'Clock' },
      { key: 'min_players', label: 'Min Players', icon: 'Users' },
      { key: 'max_players', label: 'Max Players', icon: 'Users' },
      { key: 'success_rate', label: 'Success Rate', icon: 'Trophy' },
      { key: 'record_time', label: 'Record Time', icon: 'Timer' },
      { key: 'price', label: 'Price', type: 'currency', icon: 'DollarSign' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'rooms'), language: 'typescript' };
      case 'room-schedule-escape':
        return { path: 'src/components/RoomScheduleEscape.tsx', content: generateRoomScheduleEscape({}), language: 'typescript' };
      case 'booking-calendar-escape':
        return { path: 'src/components/BookingCalendarEscape.tsx', content: generateBookingCalendarEscape({}), language: 'typescript' };
      case 'booking-detail-escape':
        return { path: 'src/components/BookingDetailEscape.tsx', content: this.generateEntityDetailComponent('BookingDetailEscape', 'booking', [
      { key: 'booking_number', label: 'Booking Number', icon: 'FileText' },
      { key: 'room_name', label: 'Room', icon: 'Key' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'group_name', label: 'Group Name', icon: 'Users' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'customer_email', label: 'Email', type: 'email', icon: 'Mail' },
      { key: 'customer_phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'party_size', label: 'Party Size', icon: 'Hash' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'bookings'), language: 'typescript' };
      case 'session-table-escape':
        return { path: 'src/components/SessionTableEscape.tsx', content: this.generateEntityTableComponent('SessionTableEscape', 'session', [
      { key: 'room_name', label: 'Room' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'group_name', label: 'Group' },
      { key: 'escaped', label: 'Escaped' },
      { key: 'completion_time', label: 'Time' },
    ], 'sessions'), language: 'typescript' };
      case 'session-detail-escape':
        return { path: 'src/components/SessionDetailEscape.tsx', content: this.generateEntityDetailComponent('SessionDetailEscape', 'session', [
      { key: 'room_name', label: 'Room', icon: 'Key' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'start_time', label: 'Start Time', icon: 'Clock' },
      { key: 'end_time', label: 'End Time', icon: 'Clock' },
      { key: 'group_name', label: 'Group', icon: 'Users' },
      { key: 'party_size', label: 'Party Size', icon: 'Hash' },
      { key: 'escaped', label: 'Escaped', icon: 'Trophy' },
      { key: 'completion_time', label: 'Completion Time', icon: 'Timer' },
      { key: 'hints_used', label: 'Hints Used', icon: 'HelpCircle' },
      { key: 'game_master', label: 'Game Master', icon: 'User' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
    ], 'sessions'), language: 'typescript' };
      case 'leaderboard-escape':
        return { path: 'src/components/LeaderboardEscape.tsx', content: this.generateEntityTableComponent('LeaderboardEscape', 'session', [
      { key: 'rank', label: 'Rank' },
      { key: 'group_name', label: 'Team' },
      { key: 'completion_time', label: 'Time' },
      { key: 'hints_used', label: 'Hints' },
      { key: 'date', label: 'Date', type: 'date' },
    ], 'room-leaderboard'), language: 'typescript' };
      case 'customer-table-escape':
        return {
          path: 'src/components/CustomerTableEscape.tsx',
          content: this.generateEntityTableComponent('CustomerTableEscape', 'customer', [
            { key: 'first_name', label: 'First Name' },
            { key: 'last_name', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'bookings', label: 'Bookings' },
            { key: 'status', label: 'Status', type: 'status' },
          ], 'customers'),
          language: 'typescript',
        };
      case 'public-booking-escape':
        return {
          path: 'src/components/PublicBookingEscape.tsx',
          content: this.generatePublicFormComponent('PublicBookingEscape', 'booking', [
            { name: 'room', label: 'Select Room', type: 'select', required: true },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'time', label: 'Time Slot', type: 'select', required: true },
            { name: 'group_size', label: 'Group Size', type: 'number', required: true },
            { name: 'name', label: 'Your Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'tel', required: true },
          ], 'bookings'),
          language: 'typescript',
        };
      case 'arcade-stats':
        return { path: 'src/components/ArcadeStats.tsx', content: generateArcadeStats({}), language: 'typescript' };
      case 'party-list-today':
        return { path: 'src/components/PartyListToday.tsx', content: generatePartyListToday({}), language: 'typescript' };
      case 'game-list-popular':
        return { path: 'src/components/GameListPopular.tsx', content: generateGameListPopular({}), language: 'typescript' };
      case 'game-grid-arcade':
        return { path: 'src/components/GameGridArcade.tsx', content: this.generateEntityGridComponent('GameGridArcade', 'game', { title: 'name', subtitle: 'category', badge: 'status', image: 'image' }, 'games'), language: 'typescript' };
      case 'game-detail-arcade':
        return { path: 'src/components/GameDetailArcade.tsx', content: this.generateEntityDetailComponent('GameDetailArcade', 'game', [
      { key: 'name', label: 'Game Name', icon: 'Gamepad2' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'manufacturer', label: 'Manufacturer', icon: 'Building' },
      { key: 'location', label: 'Location', icon: 'MapPin' },
      { key: 'credits_per_play', label: 'Credits/Play', icon: 'Coins' },
      { key: 'tickets_awarded', label: 'Tickets Awarded', icon: 'Ticket' },
      { key: 'last_maintenance', label: 'Last Maintenance', type: 'date', icon: 'Wrench' },
      { key: 'total_plays', label: 'Total Plays', icon: 'BarChart2' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'games'), language: 'typescript' };
      case 'game-stats-arcade':
        return { path: 'src/components/GameStatsArcade.tsx', content: this.generateEntityTableComponent('GameStatsArcade', 'game_stats', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'plays', label: 'Plays' },
      { key: 'credits_used', label: 'Credits' },
      { key: 'tickets_paid', label: 'Tickets' },
      { key: 'revenue', label: 'Revenue', type: 'currency' },
    ], 'game-stats'), language: 'typescript' };
      case 'card-table-arcade':
        return { path: 'src/components/CardTableArcade.tsx', content: this.generateEntityTableComponent('CardTableArcade', 'card', [
      { key: 'card_number', label: 'Card #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'credits', label: 'Credits' },
      { key: 'tickets', label: 'Tickets' },
      { key: 'last_used', label: 'Last Used', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'cards'), language: 'typescript' };
      case 'card-detail-arcade':
        return { path: 'src/components/CardDetailArcade.tsx', content: this.generateEntityDetailComponent('CardDetailArcade', 'card', [
      { key: 'card_number', label: 'Card Number', icon: 'CreditCard' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'credits', label: 'Credits Balance', icon: 'Coins' },
      { key: 'tickets', label: 'Tickets Balance', icon: 'Ticket' },
      { key: 'total_credits_purchased', label: 'Total Credits Purchased', icon: 'Plus' },
      { key: 'total_credits_used', label: 'Total Credits Used', icon: 'Minus' },
      { key: 'total_tickets_earned', label: 'Total Tickets Earned', icon: 'Award' },
      { key: 'total_tickets_redeemed', label: 'Total Tickets Redeemed', icon: 'Gift' },
      { key: 'created_date', label: 'Created', type: 'date', icon: 'Calendar' },
      { key: 'last_used', label: 'Last Used', type: 'date', icon: 'Clock' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'cards'), language: 'typescript' };
      case 'card-history-arcade':
        return { path: 'src/components/CardHistoryArcade.tsx', content: this.generateEntityTableComponent('CardHistoryArcade', 'transaction', [
      { key: 'date', label: 'Date', type: 'datetime' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
      { key: 'credits', label: 'Credits' },
      { key: 'tickets', label: 'Tickets' },
    ], 'card-transactions'), language: 'typescript' };
      case 'party-calendar-arcade':
        return { path: 'src/components/PartyCalendarArcade.tsx', content: generatePartyCalendarArcade({}), language: 'typescript' };
      case 'party-detail-arcade':
        return { path: 'src/components/PartyDetailArcade.tsx', content: this.generateEntityDetailComponent('PartyDetailArcade', 'party', [
      { key: 'booking_number', label: 'Booking Number', icon: 'FileText' },
      { key: 'child_name', label: 'Birthday Child', icon: 'User' },
      { key: 'child_age', label: 'Age', icon: 'Cake' },
      { key: 'parent_name', label: 'Parent', icon: 'Users' },
      { key: 'phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'email', label: 'Email', type: 'email', icon: 'Mail' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'package', label: 'Package', icon: 'Package' },
      { key: 'guests', label: 'Guests', icon: 'Hash' },
      { key: 'room', label: 'Party Room', icon: 'DoorOpen' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'DollarSign' },
      { key: 'deposit_paid', label: 'Deposit', type: 'currency', icon: 'CreditCard' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
      { key: 'notes', label: 'Special Requests', icon: 'StickyNote' },
    ], 'parties'), language: 'typescript' };
      case 'prize-grid':
        return { path: 'src/components/PrizeGrid.tsx', content: this.generateEntityGridComponent('PrizeGrid', 'prize', { title: 'name', subtitle: 'tickets_required', badge: 'category', image: 'image' }, 'prizes'), language: 'typescript' };
      case 'customer-table-arcade':
        return { path: 'src/components/CustomerTableArcade.tsx', content: this.generateEntityTableComponent('CustomerTableArcade', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'cards_count', label: 'Cards' },
      { key: 'total_spent', label: 'Total Spent', type: 'currency' },
    ], 'customers'), language: 'typescript' };
      case 'public-party-booking-arcade':
        return { path: 'src/components/PublicPartyBookingArcade.tsx', content: this.generatePublicFormComponent('PublicPartyBookingArcade', 'party', [
      { key: 'child_name', label: "Birthday Child's Name", type: 'text', required: true },
      { key: 'child_age', label: 'Age Turning', type: 'number', required: true },
      { key: 'parent_name', label: 'Parent/Guardian Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'time', label: 'Preferred Time', type: 'select', required: true },
      { key: 'package', label: 'Party Package', type: 'select', required: true },
      { key: 'guests', label: 'Number of Guests', type: 'number', required: true },
      { key: 'special_requests', label: 'Special Requests', type: 'textarea' },
    ], 'party-bookings'), language: 'typescript' };

      // ===== Daycare/Childcare =====
      case 'daycare-stats':
        return { path: 'src/components/DaycareStats.tsx', content: generateDaycareStats({}), language: 'typescript' };
      case 'attendance-today':
        return { path: 'src/components/AttendanceToday.tsx', content: generateAttendanceToday({}), language: 'typescript' };
      case 'activity-list-today':
        return { path: 'src/components/ActivityListToday.tsx', content: generateActivityListToday({}), language: 'typescript' };
      case 'child-grid':
        return { path: 'src/components/ChildGrid.tsx', content: this.generateEntityGridComponent('ChildGrid', 'child', { title: 'first_name', subtitle: 'classroom', badge: 'status', image: 'photo' }, 'children'), language: 'typescript' };
      case 'child-profile':
        return { path: 'src/components/ChildProfile.tsx', content: generateChildProfile({}), language: 'typescript' };
      case 'child-attendance-history':
        return { path: 'src/components/ChildAttendanceHistory.tsx', content: this.generateEntityTableComponent('ChildAttendanceHistory', 'attendance', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'check_in_time', label: 'Check In' },
      { key: 'check_out_time', label: 'Check Out' },
      { key: 'checked_in_by', label: 'Checked In By' },
      { key: 'checked_out_by', label: 'Checked Out By' },
    ], 'child-attendance'), language: 'typescript' };
      case 'attendance-tracker':
        return { path: 'src/components/AttendanceTracker.tsx', content: this.generateEntityTableComponent('AttendanceTracker', 'child', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'classroom', label: 'Classroom' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'check_in_time', label: 'Check In' },
    ], 'attendance-tracker'), language: 'typescript' };
      case 'activity-calendar-daycare':
        return { path: 'src/components/ActivityCalendarDaycare.tsx', content: generateActivityCalendarDaycare({}), language: 'typescript' };
      case 'parent-table':
        return { path: 'src/components/ParentTable.tsx', content: this.generateEntityTableComponent('ParentTable', 'parent', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'children', label: 'Children' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'parents'), language: 'typescript' };
      case 'staff-table-daycare':
        return { path: 'src/components/StaffTableDaycare.tsx', content: this.generateEntityTableComponent('StaffTableDaycare', 'staff', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'role', label: 'Role' },
      { key: 'classroom', label: 'Classroom' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'staff'), language: 'typescript' };
      case 'public-enrollment-daycare':
        return { path: 'src/components/PublicEnrollmentDaycare.tsx', content: this.generatePublicFormComponent('PublicEnrollmentDaycare', 'enrollment', [
      { key: 'child_first_name', label: "Child's First Name", type: 'text', required: true },
      { key: 'child_last_name', label: "Child's Last Name", type: 'text', required: true },
      { key: 'child_dob', label: "Child's Date of Birth", type: 'date', required: true },
      { key: 'parent_first_name', label: 'Parent First Name', type: 'text', required: true },
      { key: 'parent_last_name', label: 'Parent Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'address', label: 'Address', type: 'text', required: true },
      { key: 'preferred_start_date', label: 'Preferred Start Date', type: 'date' },
      { key: 'schedule', label: 'Schedule Needed', type: 'select' },
      { key: 'allergies', label: 'Allergies/Medical Conditions', type: 'textarea' },
      { key: 'additional_info', label: 'Additional Information', type: 'textarea' },
    ], 'enrollment-applications'), language: 'typescript' };

      // ===== Senior Care/Assisted Living =====
      case 'senior-stats':
        return { path: 'src/components/SeniorStats.tsx', content: generateSeniorStats({}), language: 'typescript' };
      case 'medication-schedule-today':
        return { path: 'src/components/MedicationScheduleToday.tsx', content: generateMedicationScheduleToday({}), language: 'typescript' };
      case 'activity-list-today-senior':
        return { path: 'src/components/ActivityListTodaySenior.tsx', content: generateActivityListTodaySenior({}), language: 'typescript' };
      case 'resident-grid':
        return { path: 'src/components/ResidentGrid.tsx', content: this.generateEntityGridComponent('ResidentGrid', 'resident', { title: 'first_name', subtitle: 'room_number', badge: 'care_level', image: 'photo' }, 'residents'), language: 'typescript' };
      case 'resident-profile':
        return { path: 'src/components/ResidentProfile.tsx', content: generateResidentProfile({}), language: 'typescript' };
      case 'resident-care-summary':
        return { path: 'src/components/ResidentCareSummary.tsx', content: this.generateEntityDetailComponent('ResidentCareSummary', 'resident', [
      { key: 'care_level', label: 'Care Level', icon: 'Heart' },
      { key: 'mobility_status', label: 'Mobility', icon: 'Activity' },
      { key: 'cognitive_status', label: 'Cognitive Status', icon: 'Brain' },
      { key: 'dietary_needs', label: 'Dietary Needs', icon: 'UtensilsCrossed' },
      { key: 'assistance_needed', label: 'Assistance Needed', icon: 'HelpCircle' },
      { key: 'special_instructions', label: 'Special Instructions', icon: 'FileText' },
      { key: 'last_assessment', label: 'Last Assessment', type: 'date', icon: 'ClipboardCheck' },
    ], 'residents'), language: 'typescript' };
      case 'care-plan-table':
        return { path: 'src/components/CarePlanTable.tsx', content: this.generateEntityTableComponent('CarePlanTable', 'care_plan', [
      { key: 'resident_name', label: 'Resident' },
      { key: 'plan_type', label: 'Type' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'review_date', label: 'Review', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'care-plans'), language: 'typescript' };
      case 'care-plan-detail':
        return { path: 'src/components/CarePlanDetail.tsx', content: this.generateEntityDetailComponent('CarePlanDetail', 'care_plan', [
      { key: 'resident_name', label: 'Resident', icon: 'User' },
      { key: 'plan_type', label: 'Plan Type', icon: 'FileText' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'review_date', label: 'Review Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'goals', label: 'Goals', icon: 'Target' },
      { key: 'interventions', label: 'Interventions', icon: 'Activity' },
      { key: 'responsible_staff', label: 'Responsible Staff', icon: 'UserCheck' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'care-plans'), language: 'typescript' };
      case 'activity-calendar-senior':
        return { path: 'src/components/ActivityCalendarSenior.tsx', content: generateActivityCalendarSenior({}), language: 'typescript' };
      case 'medication-table-senior':
        return { path: 'src/components/MedicationTableSenior.tsx', content: this.generateEntityTableComponent('MedicationTableSenior', 'medication', [
      { key: 'resident_name', label: 'Resident' },
      { key: 'medication_name', label: 'Medication' },
      { key: 'dosage', label: 'Dosage' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'time', label: 'Time' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'medications'), language: 'typescript' };
      case 'staff-table-senior':
        return { path: 'src/components/StaffTableSenior.tsx', content: this.generateEntityTableComponent('StaffTableSenior', 'staff', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'role', label: 'Role' },
      { key: 'certification', label: 'Certification' },
      { key: 'shift', label: 'Shift' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'staff'), language: 'typescript' };
      case 'family-portal-senior':
        return { path: 'src/components/FamilyPortalSenior.tsx', content: this.generateEntityDetailComponent('FamilyPortalSenior', 'resident', [
      { key: 'first_name', label: 'Resident Name', icon: 'User' },
      { key: 'room_number', label: 'Room', icon: 'DoorOpen' },
      { key: 'care_level', label: 'Care Level', icon: 'Heart' },
      { key: 'recent_activities', label: 'Recent Activities', icon: 'Calendar' },
      { key: 'health_summary', label: 'Health Summary', icon: 'Activity' },
      { key: 'upcoming_appointments', label: 'Upcoming Appointments', icon: 'CalendarClock' },
    ], 'family-portal'), language: 'typescript' };

      // ===== Physical Therapy/Rehab =====
      case 'rehab-stats':
        return { path: 'src/components/RehabStats.tsx', content: generateRehabStats({}), language: 'typescript' };
      case 'appointment-list-today-rehab':
        return { path: 'src/components/AppointmentListTodayRehab.tsx', content: generateAppointmentListTodayRehab({}), language: 'typescript' };
      case 'patient-progress-overview':
        return { path: 'src/components/PatientProgressOverview.tsx', content: generatePatientProgressOverview({}), language: 'typescript' };
      case 'patient-table-rehab':
        return { path: 'src/components/PatientTableRehab.tsx', content: this.generateEntityTableComponent('PatientTableRehab', 'patient', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'condition', label: 'Condition' },
      { key: 'therapist_name', label: 'Therapist' },
      { key: 'start_date', label: 'Started', type: 'date' },
      { key: 'progress', label: 'Progress' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'patients'), language: 'typescript' };
      case 'patient-profile-rehab':
        return { path: 'src/components/PatientProfileRehab.tsx', content: generatePatientProfileRehab({}), language: 'typescript' };
      case 'patient-treatment-summary':
        return { path: 'src/components/PatientTreatmentSummary.tsx', content: this.generateEntityDetailComponent('PatientTreatmentSummary', 'patient', [
      { key: 'condition', label: 'Diagnosis', icon: 'FileText' },
      { key: 'treatment_goals', label: 'Treatment Goals', icon: 'Target' },
      { key: 'total_sessions', label: 'Total Sessions', icon: 'Hash' },
      { key: 'sessions_completed', label: 'Sessions Completed', icon: 'CheckCircle' },
      { key: 'progress_percentage', label: 'Progress', icon: 'TrendingUp' },
      { key: 'current_exercises', label: 'Current Exercises', icon: 'Activity' },
      { key: 'notes', label: 'Treatment Notes', icon: 'StickyNote' },
    ], 'patients'), language: 'typescript' };
      case 'patient-progress-chart':
        return {
          path: 'src/components/PatientProgressChart.tsx',
          content: this.generateEntityTableComponent('PatientProgressChart', 'progress_record', [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'exercise', label: 'Exercise' },
            { key: 'score', label: 'Score' },
            { key: 'notes', label: 'Notes' },
          ], 'progress'),
          language: 'typescript',
        };
      case 'treatment-table':
        return { path: 'src/components/TreatmentTable.tsx', content: this.generateEntityTableComponent('TreatmentTable', 'treatment', [
      { key: 'patient_name', label: 'Patient' },
      { key: 'treatment_type', label: 'Type' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'therapist_name', label: 'Therapist' },
      { key: 'duration', label: 'Duration' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'treatments'), language: 'typescript' };
      case 'treatment-detail':
        return { path: 'src/components/TreatmentDetail.tsx', content: this.generateEntityDetailComponent('TreatmentDetail', 'treatment', [
      { key: 'patient_name', label: 'Patient', icon: 'User' },
      { key: 'treatment_type', label: 'Treatment Type', icon: 'Activity' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time', label: 'Time', icon: 'Clock' },
      { key: 'duration', label: 'Duration', icon: 'Timer' },
      { key: 'therapist_name', label: 'Therapist', icon: 'UserCheck' },
      { key: 'exercises_performed', label: 'Exercises Performed', icon: 'List' },
      { key: 'patient_response', label: 'Patient Response', icon: 'Heart' },
      { key: 'pain_level', label: 'Pain Level', icon: 'AlertCircle' },
      { key: 'notes', label: 'Notes', icon: 'StickyNote' },
      { key: 'next_session_plan', label: 'Next Session Plan', icon: 'ArrowRight' },
    ], 'treatments'), language: 'typescript' };
      case 'exercise-grid':
        return { path: 'src/components/ExerciseGrid.tsx', content: this.generateEntityGridComponent('ExerciseGrid', 'exercise', { title: 'name', subtitle: 'category', badge: 'difficulty', image: 'image' }, 'exercises'), language: 'typescript' };
      case 'therapist-grid':
        return { path: 'src/components/TherapistGrid.tsx', content: this.generateEntityGridComponent('TherapistGrid', 'therapist', { title: 'name', subtitle: 'specialization', badge: 'status', image: 'photo' }, 'therapists'), language: 'typescript' };
      case 'public-booking-rehab':
        return { path: 'src/components/PublicBookingRehab.tsx', content: this.generatePublicFormComponent('PublicBookingRehab', 'appointment', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'condition', label: 'Condition/Reason for Visit', type: 'text', required: true },
      { key: 'referring_physician', label: 'Referring Physician', type: 'text' },
      { key: 'insurance', label: 'Insurance Provider', type: 'text' },
      { key: 'preferred_date', label: 'Preferred Date', type: 'date', required: true },
      { key: 'preferred_time', label: 'Preferred Time', type: 'select' },
      { key: 'notes', label: 'Additional Notes', type: 'textarea' },
    ], 'appointment-requests'), language: 'typescript' };

      // ===== Driving School =====
      case 'driving-stats':
        return { path: 'src/components/DrivingStats.tsx', content: generateDrivingStats({}), language: 'typescript' };
      case 'lesson-list-today-driving':
        return { path: 'src/components/LessonListTodayDriving.tsx', content: generateLessonListTodayDriving({}), language: 'typescript' };
      case 'test-list-upcoming':
        return { path: 'src/components/TestListUpcoming.tsx', content: generateTestListUpcoming({}), language: 'typescript' };
      case 'student-table-driving':
        return { path: 'src/components/StudentTableDriving.tsx', content: this.generateEntityTableComponent('StudentTableDriving', 'student', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'package', label: 'Package' },
      { key: 'lessons_completed', label: 'Lessons' },
      { key: 'permit_status', label: 'Permit', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'students'), language: 'typescript' };
      case 'student-profile-driving':
        return { path: 'src/components/StudentProfileDriving.tsx', content: generateStudentProfileDriving({}), language: 'typescript' };
      case 'student-progress-driving':
        return { path: 'src/components/StudentProgressDriving.tsx', content: this.generateEntityDetailComponent('StudentProgressDriving', 'student', [
      { key: 'lessons_completed', label: 'Lessons Completed', icon: 'CheckCircle' },
      { key: 'lessons_remaining', label: 'Lessons Remaining', icon: 'Clock' },
      { key: 'road_hours', label: 'Road Hours', icon: 'Car' },
      { key: 'highway_hours', label: 'Highway Hours', icon: 'Route' },
      { key: 'night_hours', label: 'Night Hours', icon: 'Moon' },
      { key: 'skills_mastered', label: 'Skills Mastered', icon: 'Award' },
      { key: 'areas_to_improve', label: 'Areas to Improve', icon: 'Target' },
      { key: 'test_ready', label: 'Test Ready', icon: 'ThumbsUp' },
    ], 'students'), language: 'typescript' };
      case 'lesson-calendar-driving':
        return { path: 'src/components/LessonCalendarDriving.tsx', content: generateLessonCalendarDriving({}), language: 'typescript' };
      case 'instructor-grid-driving':
        return { path: 'src/components/InstructorGridDriving.tsx', content: this.generateEntityGridComponent('InstructorGridDriving', 'instructor', { title: 'name', subtitle: 'specialization', badge: 'status', image: 'photo' }, 'instructors'), language: 'typescript' };
      case 'vehicle-grid-driving':
        return { path: 'src/components/VehicleGridDriving.tsx', content: this.generateEntityGridComponent('VehicleGridDriving', 'vehicle', { title: 'name', subtitle: 'type', badge: 'status', image: 'image' }, 'vehicles'), language: 'typescript' };
      case 'package-grid-driving':
        return { path: 'src/components/PackageGridDriving.tsx', content: this.generateEntityGridComponent('PackageGridDriving', 'package', { title: 'name', subtitle: 'lessons_included', badge: 'price' }, 'packages'), language: 'typescript' };
      case 'test-table-driving':
        return { path: 'src/components/TestTableDriving.tsx', content: this.generateEntityTableComponent('TestTableDriving', 'test', [
      { key: 'student_name', label: 'Student' },
      { key: 'test_type', label: 'Test Type' },
      { key: 'test_date', label: 'Date', type: 'date' },
      { key: 'test_time', label: 'Time' },
      { key: 'location', label: 'Location' },
      { key: 'result', label: 'Result', type: 'status' },
    ], 'tests'), language: 'typescript' };
      case 'public-enrollment-driving':
        return { path: 'src/components/PublicEnrollmentDriving.tsx', content: this.generatePublicFormComponent('PublicEnrollmentDriving', 'enrollment', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'address', label: 'Address', type: 'text', required: true },
      { key: 'permit_status', label: 'Do you have a learner permit?', type: 'select', required: true },
      { key: 'package', label: 'Select Package', type: 'select', required: true },
      { key: 'preferred_schedule', label: 'Preferred Schedule', type: 'select' },
      { key: 'transmission_type', label: 'Transmission Type', type: 'select' },
      { key: 'notes', label: 'Additional Notes', type: 'textarea' },
    ], 'enrollments'), language: 'typescript' };

      // ===== Flight School =====
      case 'flight-stats':
        return { path: 'src/components/FlightStats.tsx', content: generateFlightStats({}), language: 'typescript' };
      case 'flight-list-today':
        return { path: 'src/components/FlightListToday.tsx', content: generateFlightListToday({}), language: 'typescript' };
      case 'aircraft-status-overview':
        return { path: 'src/components/AircraftStatusOverview.tsx', content: generateAircraftStatusOverview({}), language: 'typescript' };
      case 'student-table-flight':
        return { path: 'src/components/StudentTableFlight.tsx', content: this.generateEntityTableComponent('StudentTableFlight', 'student', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'total_flight_hours', label: 'Total Hours' },
      { key: 'medical_class', label: 'Medical' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'students'), language: 'typescript' };
      case 'student-profile-flight':
        return { path: 'src/components/StudentProfileFlight.tsx', content: generateStudentProfileFlight({}), language: 'typescript' };
      case 'student-logbook':
        return { path: 'src/components/StudentLogbook.tsx', content: this.generateEntityTableComponent('StudentLogbook', 'flight', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'aircraft', label: 'Aircraft' },
      { key: 'route', label: 'Route' },
      { key: 'flight_time', label: 'Flight Time' },
      { key: 'landings', label: 'Landings' },
      { key: 'type', label: 'Type' },
    ], 'student-flights'), language: 'typescript' };
      case 'student-certifications':
        return { path: 'src/components/StudentCertifications.tsx', content: this.generateEntityTableComponent('StudentCertifications', 'certification', [
      { key: 'type', label: 'Type' },
      { key: 'certificate_number', label: 'Certificate #' },
      { key: 'issue_date', label: 'Issued', type: 'date' },
      { key: 'expiry_date', label: 'Expires', type: 'date' },
      { key: 'ratings', label: 'Ratings' },
    ], 'student-certifications'), language: 'typescript' };
      case 'flight-calendar':
        return { path: 'src/components/FlightCalendar.tsx', content: generateFlightCalendar({}), language: 'typescript' };
      case 'flight-detail':
        return { path: 'src/components/FlightDetail.tsx', content: this.generateEntityDetailComponent('FlightDetail', 'flight', [
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'departure_time', label: 'Departure', icon: 'Clock' },
      { key: 'arrival_time', label: 'Arrival', icon: 'Clock' },
      { key: 'flight_time', label: 'Flight Time', icon: 'Timer' },
      { key: 'type', label: 'Type', icon: 'Tag' },
      { key: 'student_name', label: 'Student', icon: 'User' },
      { key: 'instructor_name', label: 'Instructor', icon: 'UserCheck' },
      { key: 'aircraft', label: 'Aircraft', icon: 'Plane' },
      { key: 'departure_airport', label: 'From', icon: 'MapPin' },
      { key: 'arrival_airport', label: 'To', icon: 'MapPin' },
      { key: 'route', label: 'Route', icon: 'Route' },
      { key: 'maneuvers', label: 'Maneuvers', icon: 'List' },
      { key: 'landings', label: 'Landings', icon: 'ArrowDown' },
      { key: 'instructor_notes', label: 'Instructor Notes', icon: 'StickyNote' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'flights'), language: 'typescript' };
      case 'aircraft-grid':
        return { path: 'src/components/AircraftGrid.tsx', content: this.generateEntityGridComponent('AircraftGrid', 'aircraft', { title: 'tail_number', subtitle: 'make_model', badge: 'status', image: 'image' }, 'aircraft'), language: 'typescript' };
      case 'aircraft-detail':
        return { path: 'src/components/AircraftDetail.tsx', content: this.generateEntityDetailComponent('AircraftDetail', 'aircraft', [
      { key: 'tail_number', label: 'Tail Number', icon: 'Plane' },
      { key: 'make', label: 'Make', icon: 'Building' },
      { key: 'model', label: 'Model', icon: 'Tag' },
      { key: 'year', label: 'Year', icon: 'Calendar' },
      { key: 'category', label: 'Category', icon: 'Folder' },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'currency', icon: 'DollarSign' },
      { key: 'hobbs_time', label: 'Hobbs Time', icon: 'Clock' },
      { key: 'tach_time', label: 'Tach Time', icon: 'Gauge' },
      { key: 'annual_due', label: 'Annual Due', type: 'date', icon: 'CalendarCheck' },
      { key: 'next_100hr', label: 'Next 100hr', icon: 'Wrench' },
      { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date', icon: 'Shield' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'aircraft'), language: 'typescript' };
      case 'aircraft-maintenance-log':
        return { path: 'src/components/AircraftMaintenanceLog.tsx', content: this.generateEntityTableComponent('AircraftMaintenanceLog', 'maintenance', [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
      { key: 'hobbs_time', label: 'Hobbs' },
      { key: 'mechanic', label: 'Mechanic' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'aircraft-maintenance'), language: 'typescript' };
      case 'instructor-grid-flight':
        return { path: 'src/components/InstructorGridFlight.tsx', content: this.generateEntityGridComponent('InstructorGridFlight', 'instructor', { title: 'name', subtitle: 'ratings', badge: 'status', image: 'photo' }, 'instructors'), language: 'typescript' };
      case 'ground-school-table':
        return { path: 'src/components/GroundSchoolTable.tsx', content: this.generateEntityTableComponent('GroundSchoolTable', 'ground_school', [
      { key: 'course_name', label: 'Course' },
      { key: 'type', label: 'Type' },
      { key: 'instructor_name', label: 'Instructor' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'current_students', label: 'Students' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'ground-school'), language: 'typescript' };
      case 'public-enrollment-flight':
        return { path: 'src/components/PublicEnrollmentFlight.tsx', content: this.generatePublicFormComponent('PublicEnrollmentFlight', 'enrollment', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'address', label: 'Address', type: 'text', required: true },
      { key: 'training_goal', label: 'Training Goal', type: 'select', required: true },
      { key: 'prior_experience', label: 'Prior Flight Experience', type: 'select' },
      { key: 'medical_class', label: 'Medical Certificate (if any)', type: 'select' },
      { key: 'preferred_schedule', label: 'Preferred Schedule', type: 'select' },
      { key: 'notes', label: 'Additional Notes', type: 'textarea' },
    ], 'enrollments'), language: 'typescript' };

      // ===== HVAC Company =====
      case 'hvac-stats':
        return { path: 'src/components/HvacStats.tsx', content: generateHvacStats({}), language: 'typescript' };
      case 'service-call-list-today':
        return { path: 'src/components/ServiceCallListToday.tsx', content: generateServiceCallListToday({}), language: 'typescript' };
      case 'contract-renewal-due':
        return { path: 'src/components/ContractRenewalDue.tsx', content: generateContractRenewalDue({}), language: 'typescript' };
      case 'service-call-table':
        return { path: 'src/components/ServiceCallTable.tsx', content: this.generateEntityTableComponent('ServiceCallTable', 'service_call', [
      { key: 'call_number', label: 'Call #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time_slot', label: 'Time' },
      { key: 'priority', label: 'Priority' },
      { key: 'technician_name', label: 'Technician' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'service-calls'), language: 'typescript' };
      case 'service-call-detail':
        return { path: 'src/components/ServiceCallDetail.tsx', content: this.generateEntityDetailComponent('ServiceCallDetail', 'service_call', [
      { key: 'call_number', label: 'Call Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'customer_phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'address', label: 'Address', icon: 'MapPin' },
      { key: 'type', label: 'Service Type', icon: 'Tag' },
      { key: 'priority', label: 'Priority', icon: 'AlertCircle' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time_slot', label: 'Time Slot', icon: 'Clock' },
      { key: 'equipment_type', label: 'Equipment', icon: 'HardDrive' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'diagnosis', label: 'Diagnosis', icon: 'Search' },
      { key: 'work_performed', label: 'Work Performed', icon: 'Wrench' },
      { key: 'parts_used', label: 'Parts Used', icon: 'Package' },
      { key: 'labor_cost', label: 'Labor', type: 'currency', icon: 'DollarSign' },
      { key: 'parts_cost', label: 'Parts', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'technician_name', label: 'Technician', icon: 'UserCheck' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'service-calls'), language: 'typescript' };
      case 'installation-table':
        return { path: 'src/components/InstallationTable.tsx', content: this.generateEntityTableComponent('InstallationTable', 'installation', [
      { key: 'job_number', label: 'Job #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'type', label: 'Type' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'total', label: 'Total', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'installations'), language: 'typescript' };
      case 'installation-detail':
        return { path: 'src/components/InstallationDetail.tsx', content: this.generateEntityDetailComponent('InstallationDetail', 'installation', [
      { key: 'job_number', label: 'Job Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'address', label: 'Address', icon: 'MapPin' },
      { key: 'type', label: 'Installation Type', icon: 'HardDrive' },
      { key: 'equipment_details', label: 'Equipment', icon: 'Package' },
      { key: 'scope_of_work', label: 'Scope of Work', icon: 'FileText' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'completion_date', label: 'Completion Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'permit_number', label: 'Permit #', icon: 'FileCheck' },
      { key: 'inspection_date', label: 'Inspection Date', type: 'date', icon: 'ClipboardCheck' },
      { key: 'labor_cost', label: 'Labor', type: 'currency', icon: 'DollarSign' },
      { key: 'equipment_cost', label: 'Equipment', type: 'currency', icon: 'DollarSign' },
      { key: 'total', label: 'Total', type: 'currency', icon: 'Receipt' },
      { key: 'warranty_expiry', label: 'Warranty Expiry', type: 'date', icon: 'Shield' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'installations'), language: 'typescript' };
      case 'contract-table-hvac':
        return { path: 'src/components/ContractTableHvac.tsx', content: this.generateEntityTableComponent('ContractTableHvac', 'contract', [
      { key: 'contract_number', label: 'Contract #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'type', label: 'Type' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'end_date', label: 'End', type: 'date' },
      { key: 'annual_cost', label: 'Annual', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'contracts'), language: 'typescript' };
      case 'equipment-table-hvac':
        return { path: 'src/components/EquipmentTableHvac.tsx', content: this.generateEntityTableComponent('EquipmentTableHvac', 'equipment', [
      { key: 'type', label: 'Type' },
      { key: 'brand', label: 'Brand' },
      { key: 'model', label: 'Model' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'install_date', label: 'Installed', type: 'date' },
      { key: 'last_service_date', label: 'Last Service', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'equipment'), language: 'typescript' };
      case 'customer-table-hvac':
        return { path: 'src/components/CustomerTableHvac.tsx', content: this.generateEntityTableComponent('CustomerTableHvac', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'company_name', label: 'Company' },
      { key: 'phone', label: 'Phone' },
      { key: 'customer_type', label: 'Type' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-detail-hvac':
        return { path: 'src/components/CustomerDetailHvac.tsx', content: generateCustomerDetailHvac({}), language: 'typescript' };
      case 'customer-equipment-hvac':
        return { path: 'src/components/CustomerEquipmentHvac.tsx', content: generateCustomerEquipmentHvac({}), language: 'typescript' };
      case 'public-service-request-hvac':
        return { path: 'src/components/PublicServiceRequestHvac.tsx', content: this.generatePublicFormComponent('PublicServiceRequestHvac', 'service_call', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'address', label: 'Service Address', type: 'text', required: true },
      { key: 'service_type', label: 'Service Type', type: 'select', required: true },
      { key: 'equipment_type', label: 'Equipment Type', type: 'select' },
      { key: 'priority', label: 'Priority', type: 'select', required: true },
      { key: 'preferred_date', label: 'Preferred Date', type: 'date' },
      { key: 'preferred_time', label: 'Preferred Time', type: 'select' },
      { key: 'description', label: 'Problem Description', type: 'textarea', required: true },
    ], 'service-requests'), language: 'typescript' };

      // ===== Plumbing Company =====
      case 'plumbing-stats':
        return { path: 'src/components/PlumbingStats.tsx', content: generatePlumbingStats({}), language: 'typescript' };
      case 'service-call-list-today-plumbing':
        return { path: 'src/components/ServiceCallListTodayPlumbing.tsx', content: generateServiceCallListTodayPlumbing({}), language: 'typescript' };
      case 'estimate-list-pending':
        return { path: 'src/components/EstimateListPending.tsx', content: generateEstimateListPending({}), language: 'typescript' };
      case 'service-call-table-plumbing':
        return { path: 'src/components/ServiceCallTablePlumbing.tsx', content: this.generateEntityTableComponent('ServiceCallTablePlumbing', 'service_call', [
      { key: 'call_number', label: 'Call #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time_slot', label: 'Time' },
      { key: 'priority', label: 'Priority' },
      { key: 'technician_name', label: 'Technician' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'service-calls'), language: 'typescript' };
      case 'service-call-detail-plumbing':
        return { path: 'src/components/ServiceCallDetailPlumbing.tsx', content: this.generateEntityDetailComponent('ServiceCallDetailPlumbing', 'service_call', [
      { key: 'call_number', label: 'Call Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'customer_phone', label: 'Phone', type: 'phone', icon: 'Phone' },
      { key: 'address', label: 'Address', icon: 'MapPin' },
      { key: 'type', label: 'Service Type', icon: 'Tag' },
      { key: 'priority', label: 'Priority', icon: 'AlertCircle' },
      { key: 'date', label: 'Date', type: 'date', icon: 'Calendar' },
      { key: 'time_slot', label: 'Time Slot', icon: 'Clock' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'location_details', label: 'Location Details', icon: 'MapPin' },
      { key: 'access_instructions', label: 'Access Instructions', icon: 'Key' },
      { key: 'technician_name', label: 'Technician', icon: 'UserCheck' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'service-calls'), language: 'typescript' };
      case 'job-table-plumbing':
        return { path: 'src/components/JobTablePlumbing.tsx', content: this.generateEntityTableComponent('JobTablePlumbing', 'job', [
      { key: 'job_number', label: 'Job #' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'type', label: 'Type' },
      { key: 'start_date', label: 'Start', type: 'date' },
      { key: 'technician_name', label: 'Technician' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'jobs'), language: 'typescript' };
      case 'job-detail-plumbing':
        return { path: 'src/components/JobDetailPlumbing.tsx', content: this.generateEntityDetailComponent('JobDetailPlumbing', 'job', [
      { key: 'job_number', label: 'Job Number', icon: 'FileText' },
      { key: 'customer_name', label: 'Customer', icon: 'User' },
      { key: 'address', label: 'Address', icon: 'MapPin' },
      { key: 'type', label: 'Job Type', icon: 'Tag' },
      { key: 'start_date', label: 'Start Date', type: 'date', icon: 'Calendar' },
      { key: 'completion_date', label: 'Completion Date', type: 'date', icon: 'CalendarCheck' },
      { key: 'description', label: 'Description', icon: 'FileText' },
      { key: 'work_performed', label: 'Work Performed', icon: 'Wrench' },
      { key: 'materials_used', label: 'Materials Used', icon: 'Package' },
      { key: 'labor_hours', label: 'Labor Hours', icon: 'Clock' },
      { key: 'permit_number', label: 'Permit #', icon: 'FileCheck' },
      { key: 'inspection_date', label: 'Inspection Date', type: 'date', icon: 'ClipboardCheck' },
      { key: 'inspection_status', label: 'Inspection Status', icon: 'CheckSquare' },
      { key: 'technician_name', label: 'Technician', icon: 'UserCheck' },
      { key: 'status', label: 'Status', icon: 'CheckCircle' },
    ], 'jobs'), language: 'typescript' };
      case 'customer-table-plumbing':
        return { path: 'src/components/CustomerTablePlumbing.tsx', content: this.generateEntityTableComponent('CustomerTablePlumbing', 'customer', [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'company_name', label: 'Company' },
      { key: 'phone', label: 'Phone' },
      { key: 'customer_type', label: 'Type' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customers'), language: 'typescript' };
      case 'customer-detail-plumbing':
        return { path: 'src/components/CustomerDetailPlumbing.tsx', content: generateCustomerDetailPlumbing({}), language: 'typescript' };
      case 'customer-service-history':
        return { path: 'src/components/CustomerServiceHistory.tsx', content: this.generateEntityTableComponent('CustomerServiceHistory', 'job', [
      { key: 'job_number', label: 'Job #' },
      { key: 'type', label: 'Type' },
      { key: 'start_date', label: 'Date', type: 'date' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' },
    ], 'customer-jobs'), language: 'typescript' };
      case 'technician-grid-plumbing':
        return { path: 'src/components/TechnicianGridPlumbing.tsx', content: this.generateEntityGridComponent('TechnicianGridPlumbing', 'technician', { title: 'name', subtitle: 'specialties', badge: 'status', image: 'photo' }, 'technicians'), language: 'typescript' };
      case 'public-service-request-plumbing':
        return { path: 'src/components/PublicServiceRequestPlumbing.tsx', content: this.generatePublicFormComponent('PublicServiceRequestPlumbing', 'service_call', [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone', required: true },
      { key: 'address', label: 'Service Address', type: 'text', required: true },
      { key: 'service_type', label: 'Service Type', type: 'select', required: true },
      { key: 'priority', label: 'Priority', type: 'select', required: true },
      { key: 'preferred_date', label: 'Preferred Date', type: 'date' },
      { key: 'preferred_time', label: 'Preferred Time', type: 'select' },
      { key: 'description', label: 'Problem Description', type: 'textarea', required: true },
    ], 'service-requests'), language: 'typescript' };

      // ========== ADDITIONAL INDUSTRY COMPONENTS ==========
      case 'auction-card':
        return { path: 'src/components/AuctionCard.tsx', content: generateAuctionCard({}), language: 'typescript' };
      case 'bid-history':
        return { path: 'src/components/BidHistory.tsx', content: generateBidHistory({}), language: 'typescript' };
      case 'trip-card':
        return { path: 'src/components/TripCard.tsx', content: generateTripCard({}), language: 'typescript' };
      case 'vehicle-card':
        return { path: 'src/components/VehicleCard.tsx', content: generateVehicleCard({}), language: 'typescript' };
      case 'vehicle-detail':
        return { path: 'src/components/VehicleDetail.tsx', content: generateVehicleDetail({}), language: 'typescript' };
      case 'fleet-stats':
        return { path: 'src/components/FleetStats.tsx', content: generateFleetStats({}), language: 'typescript' };
      case 'venue-card':
        return { path: 'src/components/VenueCard.tsx', content: generateVenueCard({}), language: 'typescript' };
      case 'venue-detail':
        return { path: 'src/components/VenueDetail.tsx', content: generateVenueDetail({}), language: 'typescript' };
      case 'venue-filters':
        return { path: 'src/components/VenueFilters.tsx', content: generateVenueFilters({}), language: 'typescript' };
      case 'venue-booking-form':
        return { path: 'src/components/VenueBookingForm.tsx', content: generateVenueBookingForm({}), language: 'typescript' };
      case 'vendor-list':
        return { path: 'src/components/VendorList.tsx', content: generateVendorList({}), language: 'typescript' };
      case 'vendor-filters':
        return { path: 'src/components/VendorFilters.tsx', content: generateVendorFilters({}), language: 'typescript' };
      case 'work-order-card':
        return { path: 'src/components/WorkOrderCard.tsx', content: generateWorkOrderCard({}), language: 'typescript' };
      case 'work-order-detail':
        return { path: 'src/components/WorkOrderDetail.tsx', content: generateWorkOrderDetail({}), language: 'typescript' };
      case 'incident-filters':
        return { path: 'src/components/IncidentFilters.tsx', content: generateIncidentFilters({}), language: 'typescript' };
      case 'delivery-schedule':
        return { path: 'src/components/DeliverySchedule.tsx', content: generateDeliverySchedule({}), language: 'typescript' };
      case 'site-schedule':
        return { path: 'src/components/SiteSchedule.tsx', content: generateSiteSchedule({}), language: 'typescript' };

      // ========== GENERIC/COMMON COMPONENTS ==========
      case 'mini-cart':
        return { path: 'src/components/MiniCart.tsx', content: generateMiniCart({}), language: 'typescript' };
      case 'featured-posts':
        return { path: 'src/components/FeaturedPosts.tsx', content: generateFeaturedPosts({}), language: 'typescript' };
      case 'featured-products':
        return { path: 'src/components/FeaturedProducts.tsx', content: generateFeaturedProducts({}), language: 'typescript' };
      case 'hero-with-stats':
        return { path: 'src/components/HeroWithStats.tsx', content: generateHeroWithStats({ title: 'Welcome', stats: [{ value: '100+', label: 'Users' }] }), language: 'typescript' };
      case 'user-suggestions':
        return { path: 'src/components/UserSuggestions.tsx', content: generateUserSuggestions({}), language: 'typescript' };
      case 'event-calendar':
        return { path: 'src/components/EventCalendar.tsx', content: generateEventCalendar({}), language: 'typescript' };
      case 'dance-studio-stats':
        return { path: 'src/components/DanceStudioStats.tsx', content: generateDanceStudioStats({}), language: 'typescript' };
      case 'ski-resort-stats-leisure':
        return { path: 'src/components/SkiResortStatsLeisure.tsx', content: generateSkiResortStatsNew({}), language: 'typescript' };

      // ========== MEDICAL/HEALTHCARE COMPONENTS ==========
      case 'appointment-detail-medical':
        return { path: 'src/components/AppointmentDetailMedical.tsx', content: generateAppointmentDetailMedical({}), language: 'typescript' };
      case 'appointment-detail-view':
        return { path: 'src/components/AppointmentDetailView.tsx', content: generateAppointmentDetailView({}), language: 'typescript' };

      // ========== MARKETING COMPONENTS ==========
      case 'campaign-filters-industry':
        return { path: 'src/components/CampaignFiltersIndustry.tsx', content: generateCampaignFiltersIndustry({}), language: 'typescript' };
      case 'campaign-header-industry':
        return { path: 'src/components/CampaignHeaderIndustry.tsx', content: generateCampaignHeaderIndustry({}), language: 'typescript' };
      case 'campaign-header-marketing':
        return { path: 'src/components/CampaignHeaderMarketing.tsx', content: generateCampaignHeaderMarketing({}), language: 'typescript' };

      // ========== MISSING BLUEPRINT COMPONENT MAPPINGS ==========
      // Access & Security
      case 'access-log-table':
        return { path: 'src/components/AccessLogTable.tsx', content: generateDataTable({ name: 'accessLog', fields: [] } as any), language: 'typescript' };

      // Applications
      case 'application-detail':
        return { path: 'src/components/ApplicationDetail.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'application-pipeline':
        return { path: 'src/components/ApplicationPipeline.tsx', content: generatePipelineOverview({}), language: 'typescript' };

      // Appointments - Optician/Rehab/Salon
      case 'appointment-calendar-optician':
        return { path: 'src/components/AppointmentCalendarOptician.tsx', content: generateAppointmentCalendar({}), language: 'typescript' };
      case 'appointment-calendar-rehab':
        return { path: 'src/components/AppointmentCalendarRehab.tsx', content: generateAppointmentCalendar({}), language: 'typescript' };
      case 'appointment-list-salon':
        return { path: 'src/components/AppointmentListSalon.tsx', content: generateAppointmentList({}), language: 'typescript' };
      case 'appointment-list-today-optician':
        return { path: 'src/components/AppointmentListTodayOptician.tsx', content: generateAppointmentList({}), language: 'typescript' };

      // Arrangements
      case 'arrangement-billing':
        return { path: 'src/components/ArrangementBilling.tsx', content: generateBillingSummary({}), language: 'typescript' };
      case 'arrangement-filters':
        return { path: 'src/components/ArrangementFilters.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'arrangement-header':
        return { path: 'src/components/ArrangementHeader.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'arrangement-list-recent':
        return { path: 'src/components/ArrangementListRecent.tsx', content: generateArrangementList({}), language: 'typescript' };
      case 'arrangement-services':
        return { path: 'src/components/ArrangementServices.tsx', content: generateServiceGrid({}), language: 'typescript' };

      // Arrivals
      case 'arrivals-departures':
        return { path: 'src/components/ArrivalsDepartures.tsx', content: generateDataList({}), language: 'typescript' };
      case 'arrivals-today-campground':
        return { path: 'src/components/ArrivalsTodayCampground.tsx', content: generateDataList({}), language: 'typescript' };

      // Artists & Athletes
      case 'artist-header':
        return { path: 'src/components/ArtistHeader.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'athlete-history':
        return { path: 'src/components/AthleteHistory.tsx', content: generateActivityTimeline({}), language: 'typescript' };
      case 'athlete-prs':
        return { path: 'src/components/AthletePRs.tsx', content: generateDataList({}), language: 'typescript' };

      // Attendees
      case 'attendee-events':
        return { path: 'src/components/AttendeeEvents.tsx', content: generateEventGrid({}), language: 'typescript' };
      case 'attendee-list':
        return { path: 'src/components/AttendeeList.tsx', content: generateDataList({}), language: 'typescript' };

      // Billing & Stats
      case 'billing-stats-accounting':
        return { path: 'src/components/BillingStatsAccounting.tsx', content: generateStatsCards({}), language: 'typescript' };
      case 'billing-stats-law':
        return { path: 'src/components/BillingStatsLaw.tsx', content: generateStatsCards({}), language: 'typescript' };

      // Boarding
      case 'boarding-stats':
        return { path: 'src/components/BoardingStats.tsx', content: generatePetboardingStats({}), language: 'typescript' };

      // Booking
      case 'book-class-form':
        return { path: 'src/components/BookClassForm.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'booking-documents':
        return { path: 'src/components/BookingDocuments.tsx', content: generateDocumentList({}), language: 'typescript' };
      case 'booking-filters-agency':
        return { path: 'src/components/BookingFiltersAgency.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'booking-form-agency':
        return { path: 'src/components/BookingFormAgency.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'booking-header-agency':
        return { path: 'src/components/BookingHeaderAgency.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'booking-itinerary':
        return { path: 'src/components/BookingItinerary.tsx', content: generateTourItinerary({}), language: 'typescript' };
      case 'booking-list-cleaning':
        return { path: 'src/components/BookingListCleaning.tsx', content: generateDataList({}), language: 'typescript' };
      case 'booking-list-recent':
        return { path: 'src/components/BookingListRecent.tsx', content: generateDataList({}), language: 'typescript' };
      case 'booking-list-recent-yoga':
        return { path: 'src/components/BookingListRecentYoga.tsx', content: generateDataList({}), language: 'typescript' };
      case 'booking-table-agency':
        return { path: 'src/components/BookingTableAgency.tsx', content: generateDataTable({ name: 'booking', fields: [] } as any), language: 'typescript' };

      // Campaign
      case 'campaign-content':
        return { path: 'src/components/CampaignContent.tsx', content: generateCampaignStory({}), language: 'typescript' };
      case 'campaign-detail':
        return { path: 'src/components/CampaignDetail.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'campaign-list':
        return { path: 'src/components/CampaignList.tsx', content: generateCampaignListActive({}), language: 'typescript' };
      case 'campaign-wizard':
        return { path: 'src/components/CampaignWizard.tsx', content: generateBookingWizard({}), language: 'typescript' };

      // Case - Law
      case 'case-filters-law':
        return { path: 'src/components/CaseFiltersLaw.tsx', content: generateCaseFilters({}), language: 'typescript' };
      case 'case-form-law':
        return { path: 'src/components/CaseFormLaw.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'case-header-law':
        return { path: 'src/components/CaseHeaderLaw.tsx', content: generateCaseHeader({}), language: 'typescript' };
      case 'case-table-law':
        return { path: 'src/components/CaseTableLaw.tsx', content: generateDataTable({ name: 'case', fields: [] } as any), language: 'typescript' };

      // Category
      case 'category-grid':
        return { path: 'src/components/CategoryGrid.tsx', content: generateDataGrid({}), language: 'typescript' };

      // Checkin
      case 'checkin-list':
        return { path: 'src/components/CheckinList.tsx', content: generateCheckinListToday({}), language: 'typescript' };

      // Class - Yoga
      case 'class-attendees':
        return { path: 'src/components/ClassAttendees.tsx', content: generateClassStudents({}), language: 'typescript' };
      case 'class-grid-yoga':
        return { path: 'src/components/ClassGridYoga.tsx', content: generateClassGrid({}), language: 'typescript' };

      // Client - Various industries
      case 'client-documents-accounting':
        return { path: 'src/components/ClientDocumentsAccounting.tsx', content: generateDocumentList({}), language: 'typescript' };
      case 'client-engagements':
        return { path: 'src/components/ClientEngagements.tsx', content: generateDataList({}), language: 'typescript' };
      case 'client-filters-accounting':
        return { path: 'src/components/ClientFiltersAccounting.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'client-invoices-law':
        return { path: 'src/components/ClientInvoicesLaw.tsx', content: generateInvoiceList({}), language: 'typescript' };
      case 'client-portal-accounting':
        return { path: 'src/components/ClientPortalAccounting.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'client-profile':
        return { path: 'src/components/ClientProfile.tsx', content: generateContactProfile({}), language: 'typescript' };
      case 'client-profile-agency':
        return { path: 'src/components/ClientProfileAgency.tsx', content: generateContactProfile({}), language: 'typescript' };
      case 'client-profile-law':
        return { path: 'src/components/ClientProfileLaw.tsx', content: generateClientProfileLawfirm({}), language: 'typescript' };
      case 'client-table-agency':
        return { path: 'src/components/ClientTableAgency.tsx', content: generateDataTable({ name: 'client', fields: [] } as any), language: 'typescript' };
      case 'client-table-law':
        return { path: 'src/components/ClientTableLaw.tsx', content: generateDataTable({ name: 'client', fields: [] } as any), language: 'typescript' };

      // Coach
      case 'coach-grid':
        return { path: 'src/components/CoachGrid.tsx', content: generateTrainerGrid({}), language: 'typescript' };

      // Competition
      case 'competition-results':
        return { path: 'src/components/CompetitionResults.tsx', content: generateLeaderboard({}), language: 'typescript' };

      // Consultation
      case 'consultation-form':
        return { path: 'src/components/ConsultationForm.tsx', content: generateInquiryForm({}), language: 'typescript' };

      // Continue/Recently
      case 'continue-listening':
        return { path: 'src/components/ContinueListening.tsx', content: generatePlaylist({}), language: 'typescript' };

      // Contract
      case 'contract-list':
        return { path: 'src/components/ContractList.tsx', content: generateDataList({}), language: 'typescript' };

      // Crew
      case 'crew-grid':
        return { path: 'src/components/CrewGrid.tsx', content: generateStaffGrid({}), language: 'typescript' };
      case 'crew-schedule-moving':
        return { path: 'src/components/CrewScheduleMoving.tsx', content: generateScheduleCalendar({}), language: 'typescript' };

      // Custom
      case 'custom-cake-form':
        return { path: 'src/components/CustomCakeForm.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'custom-order-detail-jeweler':
        return { path: 'src/components/CustomOrderDetailJeweler.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'custom-order-list-progress':
        return { path: 'src/components/CustomOrderListProgress.tsx', content: generateCustomOrderList({}), language: 'typescript' };
      case 'custom-order-table-jeweler':
        return { path: 'src/components/CustomOrderTableJeweler.tsx', content: generateDataTable({ name: 'customOrder', fields: [] } as any), language: 'typescript' };

      // Customer - Various industries
      case 'customer-jobs-moving':
        return { path: 'src/components/CustomerJobsMoving.tsx', content: generateDataList({}), language: 'typescript' };
      case 'customer-orders-optician':
        return { path: 'src/components/CustomerOrdersOptician.tsx', content: generateOrderList({}), language: 'typescript' };
      case 'customer-orders-tailor':
        return { path: 'src/components/CustomerOrdersTailor.tsx', content: generateOrderList({}), language: 'typescript' };
      case 'customer-profile-repair':
        return { path: 'src/components/CustomerProfileRepair.tsx', content: generateCustomerProfileAutorepair({}), language: 'typescript' };
      case 'customer-properties':
        return { path: 'src/components/CustomerProperties.tsx', content: generateDataList({}), language: 'typescript' };
      case 'customer-rentals-storage':
        return { path: 'src/components/CustomerRentalsStorage.tsx', content: generateDataList({}), language: 'typescript' };
      case 'customer-table-repair':
        return { path: 'src/components/CustomerTableRepair.tsx', content: generateDataTable({ name: 'customer', fields: [] } as any), language: 'typescript' };

      // Dating
      case 'dating-profile-edit':
        return { path: 'src/components/DatingProfileEdit.tsx', content: generateEditForm({}), language: 'typescript' };
      case 'dating-profile-view':
        return { path: 'src/components/DatingProfileView.tsx', content: generateDatingProfile({}), language: 'typescript' };

      // Delivery
      case 'delivery-calendar-florist':
        return { path: 'src/components/DeliveryCalendarFlorist.tsx', content: generateDeliveryScheduleFlorist({}), language: 'typescript' };
      case 'delivery-list':
        return { path: 'src/components/DeliveryList.tsx', content: generateDataList({}), language: 'typescript' };

      // Destination
      case 'destination-browser':
        return { path: 'src/components/DestinationBrowser.tsx', content: generateDestinationGrid({}), language: 'typescript' };

      // Document
      case 'document-browser-accounting':
        return { path: 'src/components/DocumentBrowserAccounting.tsx', content: generateDocumentList({}), language: 'typescript' };
      case 'document-browser-law':
        return { path: 'src/components/DocumentBrowserLaw.tsx', content: generateDocumentList({}), language: 'typescript' };

      // Engagement
      case 'engagement-filters':
        return { path: 'src/components/EngagementFilters.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'engagement-header':
        return { path: 'src/components/EngagementHeader.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'engagement-tasks':
        return { path: 'src/components/EngagementTasks.tsx', content: generateTaskList({}), language: 'typescript' };

      // Episode
      case 'episode-notes':
        return { path: 'src/components/EpisodeNotes.tsx', content: generateDetailView({}), language: 'typescript' };

      // Estimate
      case 'estimate-detail-repair':
        return { path: 'src/components/EstimateDetailRepair.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'estimate-table-repair':
        return { path: 'src/components/EstimateTableRepair.tsx', content: generateDataTable({ name: 'estimate', fields: [] } as any), language: 'typescript' };

      // Event
      case 'event-detail':
        return { path: 'src/components/EventDetail.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'event-form':
        return { path: 'src/components/EventForm.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'event-list':
        return { path: 'src/components/EventList.tsx', content: generateEventListUpcoming({}), language: 'typescript' };
      case 'event-stats':
        return { path: 'src/components/EventStats.tsx', content: generateStatsCards({}), language: 'typescript' };
      case 'event-table-florist':
        return { path: 'src/components/EventTableFlorist.tsx', content: generateDataTable({ name: 'event', fields: [] } as any), language: 'typescript' };

      // Exam
      case 'exam-table':
        return { path: 'src/components/ExamTable.tsx', content: generateDataTable({ name: 'exam', fields: [] } as any), language: 'typescript' };

      // Eyewear
      case 'eyewear-filters':
        return { path: 'src/components/EyewearFilters.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };

      // Featured
      case 'featured-albums':
        return { path: 'src/components/FeaturedAlbums.tsx', content: generateAlbumGrid({}), language: 'typescript' };
      case 'featured-auctions':
        return { path: 'src/components/FeaturedAuctions.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'featured-campaigns':
        return { path: 'src/components/FeaturedCampaigns.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'featured-shows':
        return { path: 'src/components/FeaturedShows.tsx', content: generatePodcastGrid({}), language: 'typescript' };

      // Fitting
      case 'fitting-list-upcoming':
        return { path: 'src/components/FittingListUpcoming.tsx', content: generateFittingListToday({}), language: 'typescript' };

      // Gig
      case 'gig-detail':
        return { path: 'src/components/GigDetail.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'gig-filters':
        return { path: 'src/components/GigFilters.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'gig-list':
        return { path: 'src/components/GigList.tsx', content: generateDataList({}), language: 'typescript' };

      // Guest - Campground
      case 'guest-profile-campground':
        return { path: 'src/components/GuestProfileCampground.tsx', content: generateGuestProfileHotel({}), language: 'typescript' };
      case 'guest-reservations-campground':
        return { path: 'src/components/GuestReservationsCampground.tsx', content: generateDataList({}), language: 'typescript' };
      case 'guest-table-campground':
        return { path: 'src/components/GuestTableCampground.tsx', content: generateDataTable({ name: 'guest', fields: [] } as any), language: 'typescript' };

      // Interview
      case 'interview-calendar':
        return { path: 'src/components/InterviewCalendar.tsx', content: generateInterviewSchedule({}), language: 'typescript' };
      case 'interview-list-upcoming':
        return { path: 'src/components/InterviewListUpcoming.tsx', content: generateDataList({}), language: 'typescript' };

      // Invoice - Various industries
      case 'invoice-table-accounting':
        return { path: 'src/components/InvoiceTableAccounting.tsx', content: generateDataTable({ name: 'invoice', fields: [] } as any), language: 'typescript' };
      case 'invoice-table-cleaning':
        return { path: 'src/components/InvoiceTableCleaning.tsx', content: generateDataTable({ name: 'invoice', fields: [] } as any), language: 'typescript' };
      case 'invoice-table-law':
        return { path: 'src/components/InvoiceTableLaw.tsx', content: generateDataTable({ name: 'invoice', fields: [] } as any), language: 'typescript' };
      case 'invoice-table-printshop':
        return { path: 'src/components/InvoiceTablePrintshop.tsx', content: generateDataTable({ name: 'invoice', fields: [] } as any), language: 'typescript' };

      // Job - Various industries
      case 'job-detail-printshop':
        return { path: 'src/components/JobDetailPrintshop.tsx', content: generateJobDetail({}), language: 'typescript' };
      case 'job-files':
        return { path: 'src/components/JobFiles.tsx', content: generateDocumentList({}), language: 'typescript' };
      case 'job-filters-moving':
        return { path: 'src/components/JobFiltersMoving.tsx', content: generateJobFilters({}), language: 'typescript' };
      case 'job-filters-printshop':
        return { path: 'src/components/JobFiltersPrintshop.tsx', content: generateJobFilters({}), language: 'typescript' };
      case 'job-form-moving':
        return { path: 'src/components/JobFormMoving.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'job-form-printshop':
        return { path: 'src/components/JobFormPrintshop.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'job-form-recruitment':
        return { path: 'src/components/JobFormRecruitment.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'job-header-moving':
        return { path: 'src/components/JobHeaderMoving.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'job-header-recruitment':
        return { path: 'src/components/JobHeaderRecruitment.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'job-inventory':
        return { path: 'src/components/JobInventory.tsx', content: generateDataList({}), language: 'typescript' };
      case 'job-list-moving':
        return { path: 'src/components/JobListMoving.tsx', content: generateJobList({}), language: 'typescript' };
      case 'job-list-printshop':
        return { path: 'src/components/JobListPrintshop.tsx', content: generateJobList({}), language: 'typescript' };
      case 'job-pipeline':
        return { path: 'src/components/JobPipeline.tsx', content: generatePipelineOverview({}), language: 'typescript' };
      case 'job-table-moving':
        return { path: 'src/components/JobTableMoving.tsx', content: generateDataTable({ name: 'job', fields: [] } as any), language: 'typescript' };
      case 'job-table-printshop':
        return { path: 'src/components/JobTablePrintshop.tsx', content: generateDataTable({ name: 'job', fields: [] } as any), language: 'typescript' };

      // Kennel
      case 'kennel-grid':
        return { path: 'src/components/KennelGrid.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'kennel-status-grid':
        return { path: 'src/components/KennelStatusGrid.tsx', content: generateDataGrid({}), language: 'typescript' };

      // Law
      case 'law-stats':
        return { path: 'src/components/LawStats.tsx', content: generateLawfirmStats({}), language: 'typescript' };

      // Leaderboard
      case 'leaderboard-crossfit':
        return { path: 'src/components/LeaderboardCrossfit.tsx', content: generateLeaderboard({}), language: 'typescript' };

      // Legal
      case 'legal-calendar':
        return { path: 'src/components/LegalCalendar.tsx', content: generateCalendarView({}), language: 'typescript' };

      // Listing
      case 'listing-form':
        return { path: 'src/components/ListingForm.tsx', content: generateCreateForm({}), language: 'typescript' };

      // Map
      case 'map-list-toggle':
        return { path: 'src/components/MapListToggle.tsx', content: generateLocationMap({}), language: 'typescript' };

      // Match
      case 'match-grid':
        return { path: 'src/components/MatchGrid.tsx', content: generateDataGrid({}), language: 'typescript' };

      // Medication
      case 'medication-inventory':
        return { path: 'src/components/MedicationInventory.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'medication-low-stock':
        return { path: 'src/components/MedicationLowStock.tsx', content: generateLowStockAlert({}), language: 'typescript' };
      case 'medication-search':
        return { path: 'src/components/MedicationSearch.tsx', content: generateSearchBar({}), language: 'typescript' };

      // Member - Yoga
      case 'member-bookings-yoga':
        return { path: 'src/components/MemberBookingsYoga.tsx', content: generateDataList({}), language: 'typescript' };

      // My Bids
      case 'my-bids-list':
        return { path: 'src/components/MyBidsList.tsx', content: generateBidHistory({}), language: 'typescript' };

      // Obituary
      case 'obituary-list':
        return { path: 'src/components/ObituaryList.tsx', content: generateObituaryListRecent({}), language: 'typescript' };

      // Occupancy
      case 'occupancy-overview':
        return { path: 'src/components/OccupancyOverview.tsx', content: generateOccupancyChart({}), language: 'typescript' };

      // Online Booking
      case 'online-booking-boarding':
        return { path: 'src/components/OnlineBookingBoarding.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'online-booking-salon':
        return { path: 'src/components/OnlineBookingSalon.tsx', content: generateBookingWizard({}), language: 'typescript' };

      // Order - Various industries
      case 'order-detail-optician':
        return { path: 'src/components/OrderDetailOptician.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'order-filters-nursery':
        return { path: 'src/components/OrderFiltersNursery.tsx', content: generateOrderFilters({}), language: 'typescript' };
      case 'order-filters-optician':
        return { path: 'src/components/OrderFiltersOptician.tsx', content: generateOrderFilters({}), language: 'typescript' };
      case 'order-filters-tailor':
        return { path: 'src/components/OrderFiltersTailor.tsx', content: generateOrderFilters({}), language: 'typescript' };
      case 'order-fittings':
        return { path: 'src/components/OrderFittings.tsx', content: generateDataList({}), language: 'typescript' };
      case 'order-form-tailor':
        return { path: 'src/components/OrderFormTailor.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'order-garments':
        return { path: 'src/components/OrderGarments.tsx', content: generateDataList({}), language: 'typescript' };
      case 'order-header-tailor':
        return { path: 'src/components/OrderHeaderTailor.tsx', content: generateOrderHeader({}), language: 'typescript' };
      case 'order-list-bakery':
        return { path: 'src/components/OrderListBakery.tsx', content: generateOrderList({}), language: 'typescript' };
      case 'order-list-florist':
        return { path: 'src/components/OrderListFlorist.tsx', content: generateOrderList({}), language: 'typescript' };
      case 'order-list-pending-optician':
        return { path: 'src/components/OrderListPendingOptician.tsx', content: generateOrderList({}), language: 'typescript' };
      case 'order-list-progress-tailor':
        return { path: 'src/components/OrderListProgressTailor.tsx', content: generateOrderList({}), language: 'typescript' };
      case 'order-table-optician':
        return { path: 'src/components/OrderTableOptician.tsx', content: generateDataTable({ name: 'order', fields: [] } as any), language: 'typescript' };

      // Organizer
      case 'organizer-events':
        return { path: 'src/components/OrganizerEvents.tsx', content: generateEventGrid({}), language: 'typescript' };

      // Overdue
      case 'overdue-rentals':
        return { path: 'src/components/OverdueRentals.tsx', content: generateExpiringRentals({}), language: 'typescript' };

      // Owner - Boarding
      case 'owner-pets-boarding':
        return { path: 'src/components/OwnerPetsBoarding.tsx', content: generateDataList({}), language: 'typescript' };
      case 'owner-profile-boarding':
        return { path: 'src/components/OwnerProfileBoarding.tsx', content: generateOwnerProfile({}), language: 'typescript' };
      case 'owner-table-boarding':
        return { path: 'src/components/OwnerTableBoarding.tsx', content: generateDataTable({ name: 'owner', fields: [] } as any), language: 'typescript' };

      // Parts
      case 'parts-table':
        return { path: 'src/components/PartsTable.tsx', content: generateDataTable({ name: 'part', fields: [] } as any), language: 'typescript' };

      // Payment
      case 'payment-stats-parking':
        return { path: 'src/components/PaymentStatsParking.tsx', content: generateStatsCards({}), language: 'typescript' };
      case 'payment-table-agency':
        return { path: 'src/components/PaymentTableAgency.tsx', content: generatePaymentHistory({}), language: 'typescript' };

      // Pet
      case 'pet-activity-log':
        return { path: 'src/components/PetActivityLog.tsx', content: generatePetActivities({}), language: 'typescript' };
      case 'pet-reservation-history':
        return { path: 'src/components/PetReservationHistory.tsx', content: generateDataList({}), language: 'typescript' };
      case 'pet-table-boarding':
        return { path: 'src/components/PetTableBoarding.tsx', content: generateDataTable({ name: 'pet', fields: [] } as any), language: 'typescript' };

      // Plant
      case 'plant-filters':
        return { path: 'src/components/PlantFilters.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'plant-form':
        return { path: 'src/components/PlantForm.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'plant-low-stock':
        return { path: 'src/components/PlantLowStock.tsx', content: generateLowStockAlert({}), language: 'typescript' };

      // Pledge
      case 'pledge-list':
        return { path: 'src/components/PledgeList.tsx', content: generateDataList({}), language: 'typescript' };

      // Portfolio
      case 'portfolio-grid':
        return { path: 'src/components/PortfolioGrid.tsx', content: generateProjectGrid({}), language: 'typescript' };

      // Preplan
      case 'preplan-table':
        return { path: 'src/components/PreplanTable.tsx', content: generateDataTable({ name: 'preplan', fields: [] } as any), language: 'typescript' };

      // Prescription
      case 'prescription-filters':
        return { path: 'src/components/PrescriptionFilters.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'prescription-form-optician':
        return { path: 'src/components/PrescriptionFormOptician.tsx', content: generateCreateForm({}), language: 'typescript' };

      // Product
      case 'product-filters-jeweler':
        return { path: 'src/components/ProductFiltersJeweler.tsx', content: generateProductFilters({}), language: 'typescript' };

      // Progress
      case 'progress-log':
        return { path: 'src/components/ProgressLog.tsx', content: generateActivityTimeline({}), language: 'typescript' };

      // Public - Various
      case 'public-booking-campground':
        return { path: 'src/components/PublicBookingCampground.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'public-booking-cleaning':
        return { path: 'src/components/PublicBookingCleaning.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'public-booking-marina':
        return { path: 'src/components/PublicBookingMarina.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'public-booking-tailor':
        return { path: 'src/components/PublicBookingTailor.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'public-catalog-nursery':
        return { path: 'src/components/PublicCatalogNursery.tsx', content: generateProductGrid({}), language: 'typescript' };
      case 'public-job-board':
        return { path: 'src/components/PublicJobBoard.tsx', content: generateJobList({}), language: 'typescript' };
      case 'public-memorial':
        return { path: 'src/components/PublicMemorial.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'public-rooms-escape':
        return { path: 'src/components/PublicRoomsEscape.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'public-shop-bakery':
        return { path: 'src/components/PublicShopBakery.tsx', content: generateProductGrid({}), language: 'typescript' };
      case 'public-shop-florist':
        return { path: 'src/components/PublicShopFlorist.tsx', content: generateProductGrid({}), language: 'typescript' };
      case 'public-wod-today':
        return { path: 'src/components/PublicWodToday.tsx', content: generatePublicWod({}), language: 'typescript' };

      // Quote - Various
      case 'quote-detail-moving':
        return { path: 'src/components/QuoteDetailMoving.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'quote-detail-printshop':
        return { path: 'src/components/QuoteDetailPrintshop.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'quote-list-printshop':
        return { path: 'src/components/QuoteListPrintshop.tsx', content: generateQuoteList({}), language: 'typescript' };
      case 'quote-request-moving':
        return { path: 'src/components/QuoteRequestMoving.tsx', content: generateQuoteRequests({}), language: 'typescript' };
      case 'quote-request-printshop':
        return { path: 'src/components/QuoteRequestPrintshop.tsx', content: generateQuoteRequests({}), language: 'typescript' };
      case 'quote-table-moving':
        return { path: 'src/components/QuoteTableMoving.tsx', content: generateDataTable({ name: 'quote', fields: [] } as any), language: 'typescript' };

      // Rate
      case 'rate-table-campground':
        return { path: 'src/components/RateTableCampground.tsx', content: generateDataTable({ name: 'rate', fields: [] } as any), language: 'typescript' };

      // Recently
      case 'recently-played':
        return { path: 'src/components/RecentlyPlayed.tsx', content: generateTrackList({}), language: 'typescript' };

      // Related
      case 'related-videos':
        return { path: 'src/components/RelatedVideos.tsx', content: generateVideoGrid({}), language: 'typescript' };

      // Rental - Storage
      case 'rental-detail-storage':
        return { path: 'src/components/RentalDetailStorage.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'rental-filters-storage':
        return { path: 'src/components/RentalFiltersStorage.tsx', content: generateRentalFilters({}), language: 'typescript' };
      case 'rental-form-storage':
        return { path: 'src/components/RentalFormStorage.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'rental-table-storage':
        return { path: 'src/components/RentalTableStorage.tsx', content: generateDataTable({ name: 'rental', fields: [] } as any), language: 'typescript' };

      // Repair
      case 'repair-filters':
        return { path: 'src/components/RepairFilters.tsx', content: generateFilters({ filters: [] }), language: 'typescript' };
      case 'repair-form':
        return { path: 'src/components/RepairForm.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'repair-stats':
        return { path: 'src/components/RepairStats.tsx', content: generateAutorepairStats({}), language: 'typescript' };

      // Report
      case 'report-generator':
        return { path: 'src/components/ReportGenerator.tsx', content: generateReportList({}), language: 'typescript' };

      // Reservation - Various
      case 'reservation-calendar-boarding':
        return { path: 'src/components/ReservationCalendarBoarding.tsx', content: generateReservationCalendar({}), language: 'typescript' };
      case 'reservation-detail-boarding':
        return { path: 'src/components/ReservationDetailBoarding.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'reservation-filters-campground':
        return { path: 'src/components/ReservationFiltersCampground.tsx', content: generateReservationFilters({}), language: 'typescript' };
      case 'reservation-form-boarding':
        return { path: 'src/components/ReservationFormBoarding.tsx', content: generateReservationForm({}), language: 'typescript' };
      case 'reservation-form-campground':
        return { path: 'src/components/ReservationFormCampground.tsx', content: generateReservationForm({}), language: 'typescript' };
      case 'reservation-table-campground':
        return { path: 'src/components/ReservationTableCampground.tsx', content: generateDataTable({ name: 'reservation', fields: [] } as any), language: 'typescript' };

      // Result
      case 'result-list-recent':
        return { path: 'src/components/ResultListRecent.tsx', content: generateDataList({}), language: 'typescript' };

      // Review
      case 'review-carousel':
        return { path: 'src/components/ReviewCarousel.tsx', content: generateTestimonialSlider({}), language: 'typescript' };
      case 'review-list':
        return { path: 'src/components/ReviewList.tsx', content: generateDataList({}), language: 'typescript' };

      // Reward
      case 'reward-list':
        return { path: 'src/components/RewardList.tsx', content: generateRewardTiers({}), language: 'typescript' };

      // Schedule - Yoga
      case 'schedule-calendar-yoga':
        return { path: 'src/components/ScheduleCalendarYoga.tsx', content: generateClassCalendarYoga({}), language: 'typescript' };

      // Service - Various
      case 'service-booking-repair':
        return { path: 'src/components/ServiceBookingRepair.tsx', content: generateBookingWizard({}), language: 'typescript' };
      case 'service-calendar-funeral':
        return { path: 'src/components/ServiceCalendarFuneral.tsx', content: generateCalendarView({}), language: 'typescript' };
      case 'service-grid-boarding':
        return { path: 'src/components/ServiceGridBoarding.tsx', content: generateServiceGrid({}), language: 'typescript' };
      case 'service-grid-marina':
        return { path: 'src/components/ServiceGridMarina.tsx', content: generateServiceGrid({}), language: 'typescript' };
      case 'service-grid-nursery':
        return { path: 'src/components/ServiceGridNursery.tsx', content: generateServiceGrid({}), language: 'typescript' };
      case 'service-grid-salon':
        return { path: 'src/components/ServiceGridSalon.tsx', content: generateServiceGrid({}), language: 'typescript' };
      case 'service-list-upcoming-funeral':
        return { path: 'src/components/ServiceListUpcomingFuneral.tsx', content: generateDataList({}), language: 'typescript' };

      // Show
      case 'show-header':
        return { path: 'src/components/ShowHeader.tsx', content: generatePageHeader({}), language: 'typescript' };

      // Site
      case 'site-availability-overview':
        return { path: 'src/components/SiteAvailabilityOverview.tsx', content: generateSiteAvailability({}), language: 'typescript' };
      case 'site-calendar-campground':
        return { path: 'src/components/SiteCalendarCampground.tsx', content: generateSiteSchedule({}), language: 'typescript' };
      case 'site-grid':
        return { path: 'src/components/SiteGrid.tsx', content: generateDataGrid({}), language: 'typescript' };

      // Slip
      case 'slip-availability-overview':
        return { path: 'src/components/SlipAvailabilityOverview.tsx', content: generateSlipAvailability({}), language: 'typescript' };
      case 'slip-map':
        return { path: 'src/components/SlipMap.tsx', content: generateLocationMap({}), language: 'typescript' };

      // Staff
      case 'staff-grid-funeral':
        return { path: 'src/components/StaffGridFuneral.tsx', content: generateStaffGrid({}), language: 'typescript' };

      // Storage
      case 'storage-stats':
        return { path: 'src/components/StorageStats.tsx', content: generateStatsCards({}), language: 'typescript' };

      // Stylist
      case 'stylist-schedule-overview':
        return { path: 'src/components/StylistScheduleOverview.tsx', content: generateStylistSchedule({}), language: 'typescript' };

      // Task
      case 'task-board-accounting':
        return { path: 'src/components/TaskBoardAccounting.tsx', content: generateKanbanBoard({}), language: 'typescript' };
      case 'task-list-accounting':
        return { path: 'src/components/TaskListAccounting.tsx', content: generateTaskList({}), language: 'typescript' };

      // Team
      case 'team-schedule-cleaning':
        return { path: 'src/components/TeamScheduleCleaning.tsx', content: generateScheduleCalendar({}), language: 'typescript' };

      // Technician
      case 'technician-workload':
        return { path: 'src/components/TechnicianWorkload.tsx', content: generateStatsCards({}), language: 'typescript' };

      // Theater
      case 'theater-layout':
        return { path: 'src/components/TheaterLayout.tsx', content: generateDetailView({}), language: 'typescript' };

      // Ticket - Repair
      case 'ticket-filters-repair':
        return { path: 'src/components/TicketFiltersRepair.tsx', content: generateTicketFilters({}), language: 'typescript' };
      case 'ticket-form-repair':
        return { path: 'src/components/TicketFormRepair.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'ticket-header-repair':
        return { path: 'src/components/TicketHeaderRepair.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'ticket-list-active':
        return { path: 'src/components/TicketListActive.tsx', content: generateTicketList({}), language: 'typescript' };
      case 'ticket-parts':
        return { path: 'src/components/TicketParts.tsx', content: generateDataList({}), language: 'typescript' };
      case 'ticket-services':
        return { path: 'src/components/TicketServices.tsx', content: generateDataList({}), language: 'typescript' };
      case 'ticket-table-repair':
        return { path: 'src/components/TicketTableRepair.tsx', content: generateDataTable({ name: 'ticket', fields: [] } as any), language: 'typescript' };

      // Time Tracker
      case 'time-tracker-law':
        return { path: 'src/components/TimeTrackerLaw.tsx', content: generateTimeTracker({}), language: 'typescript' };

      // Tournament
      case 'tournament-grid':
        return { path: 'src/components/TournamentGrid.tsx', content: generateEventGrid({}), language: 'typescript' };

      // Tracking
      case 'tracking-map':
        return { path: 'src/components/TrackingMap.tsx', content: generateShipmentMap({}), language: 'typescript' };

      // Travel
      case 'travel-stats':
        return { path: 'src/components/TravelStats.tsx', content: generateTravelagencyStats({}), language: 'typescript' };

      // Trending
      case 'trending-episodes':
        return { path: 'src/components/TrendingEpisodes.tsx', content: generateEpisodeList({}), language: 'typescript' };

      // Trip - Agency
      case 'trip-filters-agency':
        return { path: 'src/components/TripFiltersAgency.tsx', content: generateTripFilters({}), language: 'typescript' };
      case 'trip-form-agency':
        return { path: 'src/components/TripFormAgency.tsx', content: generateCreateForm({}), language: 'typescript' };
      case 'trip-grid-agency':
        return { path: 'src/components/TripGridAgency.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'trip-header-agency':
        return { path: 'src/components/TripHeaderAgency.tsx', content: generatePageHeader({}), language: 'typescript' };
      case 'trip-list-upcoming':
        return { path: 'src/components/TripListUpcoming.tsx', content: generateDataList({}), language: 'typescript' };

      // Unit - Storage
      case 'unit-browser':
        return { path: 'src/components/UnitBrowser.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'unit-detail-storage':
        return { path: 'src/components/UnitDetailStorage.tsx', content: generateDetailView({}), language: 'typescript' };
      case 'unit-filters-storage':
        return { path: 'src/components/UnitFiltersStorage.tsx', content: generateUnitFilters({}), language: 'typescript' };
      case 'unit-grid-storage':
        return { path: 'src/components/UnitGridStorage.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'unit-rental-history':
        return { path: 'src/components/UnitRentalHistory.tsx', content: generateDataList({}), language: 'typescript' };

      // Upcoming
      case 'upcoming-classes':
        return { path: 'src/components/UpcomingClasses.tsx', content: generateClassGrid({}), language: 'typescript' };

      // Update
      case 'update-list':
        return { path: 'src/components/UpdateList.tsx', content: generateDataList({}), language: 'typescript' };

      // Vehicle
      case 'vehicle-grid':
        return { path: 'src/components/VehicleGrid.tsx', content: generateDataGrid({}), language: 'typescript' };
      case 'vehicle-service-history':
        return { path: 'src/components/VehicleServiceHistory.tsx', content: generateVehicleHistory({}), language: 'typescript' };
      case 'vehicle-table-repair':
        return { path: 'src/components/VehicleTableRepair.tsx', content: generateDataTable({ name: 'vehicle', fields: [] } as any), language: 'typescript' };

      // Video
      case 'video-feed':
        return { path: 'src/components/VideoFeed.tsx', content: generateVideoGrid({}), language: 'typescript' };
      case 'video-info':
        return { path: 'src/components/VideoInfo.tsx', content: generateDetailView({}), language: 'typescript' };

      // WOD
      case 'wod-form':
        return { path: 'src/components/WodForm.tsx', content: generateCreateForm({}), language: 'typescript' };

      default:
        // Component type not implemented - throw error
        throw new Error(
          `Component generator not implemented for type "${componentType}". ` +
          `Add a case in generateComponentByType() for this component.`
        );
    }
  }

  /**
   * Generate pages from blueprint page definitions
   */
  private generateBlueprintPages(
    appName: string,
    analysis: EnhancedAppAnalysis,
    requiresAuth: boolean
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (!this.blueprint?.pages) {
      throw new Error('Blueprint pages not defined');
    }

    for (const page of this.blueprint.pages) {
      const file = this.generatePageFromDefinition(page, appName, analysis);
      files.push(file);
    }

    return files;
  }

  /**
   * Generate a page component from PageDefinition
   */
  private generatePageFromDefinition(
    page: PageDefinition,
    appName: string,
    analysis: EnhancedAppAnalysis
  ): GeneratedFile {
    const pageName = this.getPageComponentName(page.path);
    const imports: string[] = [];
    const sectionComponents: string[] = [];

    // Check if this is a dynamic route (has :id or similar params)
    const isDynamicRoute = page.path.includes(':');
    const hasUseParams = isDynamicRoute;

    // Generate imports and JSX for each section
    for (const section of page.sections) {
      const componentName = this.getComponentName(section.component);

      // Add import if not already added
      if (!imports.includes(componentName)) {
        imports.push(componentName);
      }

      // Generate JSX for this section with props
      const propsEntries = section.props ? Object.entries(section.props) : [];

      // If filterByCategory is true and we're on a dynamic category page, pass categoryId
      if (section.props?.filterByCategory && isDynamicRoute) {
        propsEntries.push(['categoryId', '{id}']);
      }

      const propsString = propsEntries
        .map(([key, value]) => {
          // Handle special dynamic values like {id}
          if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            return `${key}=${value}`;
          } else if (typeof value === 'string') {
            return `${key}="${value}"`;
          } else if (typeof value === 'boolean') {
            return value ? key : `${key}={false}`;
          } else if (typeof value === 'number') {
            return `${key}={${value}}`;
          } else if (Array.isArray(value)) {
            return `${key}={${JSON.stringify(value)}}`;
          } else {
            return `${key}={${JSON.stringify(value)}}`;
          }
        })
        .join(' ');

      sectionComponents.push(
        `        <${componentName}${propsString ? ' ' + propsString : ''} />`
      );
    }

    const importsCode = imports
      .map(name => `import ${name} from '../components/${name}';`)
      .join('\n');

    // Determine layout class based on page.layout
    const layoutClass = this.getLayoutClass(page.layout);

    // Build the content with useParams if needed
    let content: string;
    if (hasUseParams) {
      content = `import { useParams } from 'react-router-dom';
${importsCode}

export default function ${pageName}() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="${layoutClass}">
${sectionComponents.join('\n')}
    </div>
  );
}
`;
    } else {
      content = `${importsCode}

export default function ${pageName}() {
  return (
    <div className="${layoutClass}">
${sectionComponents.join('\n')}
    </div>
  );
}
`;
    }

    return {
      path: `src/pages/${pageName}.tsx`,
      content,
      language: 'typescript',
    };
  }

  /**
   * Get page component name from path
   */
  private getPageComponentName(path: string): string {
    if (path === '/') return 'HomePage';

    // Handle dynamic routes like /products/:id
    const cleanPath = path
      .replace(/^\//, '')
      .replace(/\/:[^/]+/g, 'Detail')
      .replace(/\//g, '');

    return pascalCase(cleanPath) + 'Page';
  }

  /**
   * Get component name from component type
   */
  private getComponentName(componentType: string): string {
    const mapping: Record<string, string> = {
      // Common
      'hero': 'Hero',
      'sidebar': 'Sidebar',
      'data-grid': 'DataGrid',
      'data-table': 'DataTable',
      'data-list': 'DataList',
      'detail-view': 'DetailView',
      'filter-form': 'FilterForm',
      'search-bar': 'SearchBar',
      'stats-cards': 'StatsCards',
      'settings-form': 'SettingsForm',
      'comment-section': 'CommentSection',
      'review-list': 'ReviewList',
      'review-carousel': 'ReviewCarousel',
      'contact-form': 'ContactForm',
      'notification-list': 'NotificationList',
      'calendar-view': 'CalendarView',

      // Ecommerce
      'product-grid': 'ProductGrid',
      'product-detail': 'ProductDetail',
      'cart': 'Cart',
      'cart-preview': 'CartPreview',
      'checkout': 'Checkout',
      'checkout-form': 'CheckoutForm',
      'order-summary': 'OrderSummary',
      'order-confirmation': 'OrderConfirmation',
      'order-tracking': 'OrderTracking',
      'order-list': 'OrderList',
      'order-queue': 'OrderQueue',

      // Blog
      'blog-list': 'PostList',
      'post-list': 'PostList',
      'post-feed': 'PostFeed',
      'post-detail': 'PostDetail',
      'create-post': 'CreatePost',

      // SaaS
      'activity-feed': 'ActivityFeed',
      'analytics-charts': 'AnalyticsCharts',
      'team-list': 'TeamList',
      'subscription-card': 'SubscriptionCard',

      // CRM
      'pipeline-overview': 'PipelineOverview',
      'kanban-board': 'KanbanBoard',
      'contact-profile': 'ContactProfile',
      'company-profile': 'CompanyProfile',
      'notes-list': 'NotesList',
      'task-list': 'TaskList',
      'task-detail': 'TaskDetail',

      // Project Management
      'project-grid': 'ProjectGrid',
      'project-header': 'ProjectHeader',

      // Social
      'profile-header': 'ProfileHeader',
      'profile-tabs': 'ProfileTabs',
      'user-suggestions': 'UserSuggestions',
      'trending-topics': 'TrendingTopics',
      'conversation-list': 'ConversationList',
      'chat-window': 'ChatWindow',

      // Booking
      'service-grid': 'ServiceGrid',
      'staff-grid': 'StaffGrid',
      'booking-wizard': 'BookingWizard',
      'booking-confirmation': 'BookingConfirmation',
      'appointment-list': 'AppointmentList',
      'appointment-detail': 'AppointmentDetail',

      // LMS
      'course-grid': 'CourseGrid',
      'course-header': 'CourseHeader',
      'curriculum-list': 'CurriculumList',
      'lesson-player': 'LessonPlayer',
      'lesson-sidebar': 'LessonSidebar',
      'enrolled-courses': 'EnrolledCourses',
      'certificate-grid': 'CertificateGrid',
      'quiz-player': 'QuizPlayer',

      // Real Estate
      'property-search': 'PropertySearch',
      'property-grid': 'PropertyGrid',
      'property-filters': 'PropertyFilters',
      'property-gallery': 'PropertyGallery',
      'property-details': 'PropertyDetails',
      'inquiry-form': 'InquiryForm',
      'agent-grid': 'AgentGrid',
      'agent-profile': 'AgentProfile',
      'map-list-toggle': 'MapListToggle',

      // Restaurant
      'menu-grid': 'MenuGrid',
      'menu-categories': 'MenuCategories',
      'reservation-form': 'ReservationForm',
      'restaurant-info': 'RestaurantInfo',

      // Job Board
      'job-search': 'JobSearch',
      'job-list': 'JobList',
      'job-filters': 'JobFilters',
      'job-detail': 'JobDetail',
      'apply-card': 'ApplyCard',
      'company-card': 'CompanyCard',
      'company-grid': 'CompanyGrid',
      'application-form': 'ApplicationForm',
      'application-list': 'ApplicationList',
      'candidate-profile-form': 'CandidateProfileForm',
      'category-grid': 'CategoryGrid',

      // Inventory
      'low-stock-alert': 'LowStockAlert',
      'stock-by-warehouse': 'StockByWarehouse',
      'stock-adjustment-form': 'StockAdjustmentForm',
      'product-detail-card': 'ProductDetailCard',
      'purchase-order-detail': 'PurchaseOrderDetail',
      'report-list': 'ReportList',
    };

    const name = mapping[componentType];
    if (!name) {
      // Return PascalCase version of the component type as fallback
      return componentType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    }
    return name;
  }

  /**
   * Get Tailwind layout class based on layout type
   */
  private getLayoutClass(layout: string): string {
    switch (layout) {
      case 'landing':
        return 'min-h-screen';
      case 'single-column':
        return 'max-w-4xl mx-auto px-4 py-8';
      case 'two-column':
        return 'max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8';
      case 'dashboard':
        return 'max-w-7xl mx-auto px-4 py-8 flex gap-8';
      default:
        return 'max-w-7xl mx-auto px-4 py-8';
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private toSlug(str: string): string {
    return kebabCase(str);
  }

  private toKebabCase(str: string): string {
    return kebabCase(str);
  }

  private mapFieldTypeToTs(type: string): string {
    const mapping: Record<string, string> = {
      string: 'string',
      text: 'string',
      number: 'number',
      integer: 'number',
      decimal: 'number',
      boolean: 'boolean',
      date: 'string',
      datetime: 'string',
      email: 'string',
      url: 'string',
      phone: 'string',
      image: 'string',
      file: 'string',
      enum: 'string',
      json: 'Record<string, unknown>',
      array: 'unknown[]',
      object: 'Record<string, unknown>',
      uuid: 'string',
    };
    return mapping[type] || 'string';
  }

  private getInputType(fieldType: string): string {
    const mapping: Record<string, string> = {
      string: 'text',
      text: 'text',
      number: 'number',
      integer: 'number',
      decimal: 'number',
      boolean: 'checkbox',
      date: 'date',
      datetime: 'datetime-local',
      email: 'email',
      url: 'url',
      phone: 'tel',
      image: 'url',
      file: 'url',
      enum: 'text',
      json: 'text',
      array: 'text',
      object: 'text',
      uuid: 'text',
    };
    return mapping[fieldType] || 'text';
  }

  // ============================================
  // BASE ENTITY COMPONENT GENERATORS
  // ============================================

  private generateEntityTableComponent(componentName: string, entity: string, columns: any[], options?: any): string {
    // Create a minimal entity definition for the data table generator
    const entityDef = { name: entity, fields: columns.map((c: any) => ({ name: c.key || c.name, type: c.type || 'string', label: c.label })) };
    return generateDataTable(entityDef as any);
  }

  private generateEntityGridComponent(componentName: string, entity: string, displayFields: any, options?: any): string {
    return generateDataGrid({ componentName, entity });
  }

  private generateEntityDetailComponent(componentName: string, entity: string, fields: any[], options?: any): string {
    return generateDetailView({ componentName, endpoint: entity });
  }

  private generatePublicFormComponent(componentName: string, entity: string, fields: any[], options?: any, successMessage?: string): string {
    return generateCreateForm({ componentName, endpoint: entity });
  }

}
