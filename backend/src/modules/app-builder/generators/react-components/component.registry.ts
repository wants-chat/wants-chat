/**
 * Component Registry
 *
 * Type-safe registry mapping ComponentType enum values to their generator functions.
 * This ensures that:
 * 1. All component types have corresponding generators
 * 2. Type mismatches are caught at compile time
 * 3. Easy to discover available components
 */

import { ComponentType } from '../../interfaces/component-types.enum';
import { ResolvedComponent } from './types/resolved-component.interface';

// Import ALL category generators
import * as blogGenerators from './ui/react/blog';
import * as userGenerators from './ui/react/user';
import * as authGenerators from './ui/react/auth';
import * as errorGenerators from './ui/react/error';
import * as helpGenerators from './ui/react/help';
import * as legalGenerators from './ui/react/legal';
import * as formsGenerators from './ui/react/forms';
import * as tablesGenerators from './ui/react/tables';
import * as chartsGenerators from './ui/react/charts';
import * as navigationGenerators from './ui/react/navigation';
import * as ecommerceGenerators from './ui/react/ecommerce';
import * as foodGenerators from './ui/react/food';
import * as socialGenerators from './ui/react/social';
import * as mediaGenerators from './ui/react/media';
import * as modalsGenerators from './ui/react/modals';
import * as calendarGenerators from './ui/react/calendar';
import * as fitnessGenerators from './ui/react/fitness';
import * as widgetsGenerators from './ui/react/widgets';
import * as commonGenerators from './ui/react/common';
import * as shadcnGenerators from './ui/react/shadcn';
import * as detailGenerators from './ui/react/detail';
import * as travelGenerators from './ui/react/travel';
import * as eventGenerators from './ui/react/events';

// Industry-specific generators
import * as healthcareGenerators from './ui/react/healthcare';
import * as realEstateGenerators from './ui/react/real-estate';
import * as automotiveGenerators from './ui/react/automotive';
import * as bookingGenerators from './ui/react/booking';
import * as petsGenerators from './ui/react/pets';

/**
 * Component generator function signature
 */
export type ComponentGenerator = (resolved: ResolvedComponent, variant?: string) => string;

/**
 * Component Registry Map
 *
 * Maps each ComponentType to its generator function.
 * TypeScript will enforce that all enum values are covered.
 */
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentGenerator> = {
  // ============================================================================
  // DATA DISPLAY & TABLES
  // ============================================================================
  [ComponentType.DATA_TABLE]: tablesGenerators.generateDataTable,
  [ComponentType.TABLE]: shadcnGenerators.generateTable,
  [ComponentType.DETAIL_VIEW]: tablesGenerators.generateDetailView,
  [ComponentType.ENTITY_DETAIL_WITH_HEADER]: detailGenerators.generateEntityDetailWithHeader,
  [ComponentType.PRODUCT_LIST_VIEW]: tablesGenerators.generateProductListView,
  [ComponentType.TRANSACTION_HISTORY_TABLE]: tablesGenerators.generateTransactionHistoryTable,
  [ComponentType.USER_MANAGEMENT_TABLE]: userGenerators.generateUserManagementTable,
  [ComponentType.ORDER_HISTORY_LIST]: tablesGenerators.generateOrderHistoryList,

  // ============================================================================
  // FORMS & INPUTS
  // ============================================================================
  [ComponentType.FORM]: formsGenerators.generateForm,
  [ComponentType.FORM_COMPONENTS]: formsGenerators.generateFormComponents,
  [ComponentType.LOGIN_FORM]: authGenerators.generateLoginForm,
  [ComponentType.REGISTER_FORM]: authGenerators.generateRegisterForm,
  [ComponentType.CONTACT_FORM]: legalGenerators.generateContactForm,
  [ComponentType.BASIC_CONTACT_FORM]: legalGenerators.generateBasicContactForm,
  [ComponentType.FEEDBACK_FORM]: formsGenerators.generateFeedbackForm,
  [ComponentType.SURVEY_FORM]: formsGenerators.generateSurveyForm,
  [ComponentType.APPLICATION_FORM]: formsGenerators.generateApplicationForm,
  [ComponentType.BOOKING_RESERVATION_FORM]: formsGenerators.generateBookingReservationForm,
  [ComponentType.CHECKOUT_FORM]: formsGenerators.generateCheckoutForm,
  [ComponentType.CREDIT_CARD_FORM]: formsGenerators.generateCreditCardForm,
  [ComponentType.SHIPPING_ADDRESS_FORM]: formsGenerators.generateShippingAddressForm,
  [ComponentType.PASSWORD_CHANGE_FORM]: authGenerators.generatePasswordChangeForm,
  [ComponentType.PROFILE_EDIT_FORM]: userGenerators.generateProfileEditForm,
  [ComponentType.RESET_PASSWORD_FORM]: userGenerators.generateResetPasswordForm,
  [ComponentType.FORGOT_PASSWORD_FORM]: authGenerators.generateForgotPasswordForm,
  [ComponentType.WRITE_REVIEW_FORM]: formsGenerators.generateWriteReviewForm,
  [ComponentType.SUPPORT_TICKET_FORM]: helpGenerators.generateSupportTicketForm,
  [ComponentType.COMMENT_FORM]: blogGenerators.generateCommentForm,
  [ComponentType.COMMENT_REPLY_FORM]: blogGenerators.generateCommentReplyForm,
  [ComponentType.FORUM_POST_EDITOR]: blogGenerators.generateForumPostEditor,
  [ComponentType.NEWSLETTER_SIGNUP]: userGenerators.generateNewsletterSignup,
  [ComponentType.WIZARD_FORM]: formsGenerators.generateWizardForm,
  [ComponentType.MULTI_COLUMN_FORM]: formsGenerators.generateMultiColumnForm,
  [ComponentType.INLINE_FORM]: formsGenerators.generateInlineForm,
  [ComponentType.REGISTRATION_MULTI_STEP]: authGenerators.generateRegistrationMultiStep,
  [ComponentType.VERIFY_EMAIL_FORM]: authGenerators.generateVerifyEmailForm,

  // Form Fields
  [ComponentType.FORM_FIELD_EMAIL]: formsGenerators.generateFormFieldEmail,
  [ComponentType.FORM_FIELD_PASSWORD]: formsGenerators.generateFormFieldPassword,
  [ComponentType.FORM_FIELD_TEXT]: formsGenerators.generateFormFieldText,
  [ComponentType.INPUT]: shadcnGenerators.generateInput,
  [ComponentType.TEXTAREA]: shadcnGenerators.generateTextarea,
  [ComponentType.BUTTON]: shadcnGenerators.generateButton,
  [ComponentType.LABEL]: shadcnGenerators.generateLabel,

  // Advanced Form Inputs
  [ComponentType.DATE_PICKER_SINGLE]: formsGenerators.generateDatePickerSingle,
  [ComponentType.DATE_PICKER_RANGE]: formsGenerators.generateDatePickerRange,
  [ComponentType.DATETIME_PICKER]: formsGenerators.generateDatetimePicker,
  [ComponentType.TIME_PICKER]: formsGenerators.generateTimePicker,
  [ComponentType.COLOR_PICKER]: formsGenerators.generateColorPicker,
  [ComponentType.FILE_UPLOAD_SINGLE]: formsGenerators.generateFileUploadSingle,
  [ComponentType.FILE_UPLOAD_MULTIPLE]: formsGenerators.generateFileUploadMultiple,
  [ComponentType.DRAG_DROP_UPLOADER]: formsGenerators.generateDragDropUploader,
  [ComponentType.IMAGE_UPLOAD_PREVIEW]: mediaGenerators.generateImageUploadPreview,
  [ComponentType.MEDIA_UPLOAD_PREVIEW]: mediaGenerators.generateMediaUploadPreview,
  [ComponentType.AUTOCOMPLETE_INPUT]: formsGenerators.generateAutocompleteInput,
  [ComponentType.ADDRESS_AUTOCOMPLETE]: formsGenerators.generateAddressAutocomplete,
  [ComponentType.PHONE_NUMBER_INPUT]: formsGenerators.generatePhoneNumberInput,
  [ComponentType.CREDIT_CARD_INPUT]: formsGenerators.generateCreditCardInput,
  [ComponentType.CURRENCY_SELECTOR]: formsGenerators.generateCurrencySelector,
  [ComponentType.LANGUAGE_SELECTOR]: formsGenerators.generateLanguageSelector,
  [ComponentType.SHIPPING_METHOD_SELECTOR]: formsGenerators.generateShippingMethodSelector,
  [ComponentType.SIZE_VARIANT_SELECTOR]: formsGenerators.generateSizeVariantSelector,
  [ComponentType.RATING_INPUT_STARS]: formsGenerators.generateRatingInputStars,
  [ComponentType.RATING_INPUT_NUMBERS]: formsGenerators.generateRatingInputNumbers,
  [ComponentType.SLIDER_RANGE]: mediaGenerators.generateSliderRange,
  [ComponentType.PRICE_RANGE_SLIDER]: mediaGenerators.generatePriceRangeSlider,
  [ComponentType.TAG_INPUT]: blogGenerators.generateTagInput,
  [ComponentType.EMOJI_PICKER]: formsGenerators.generateEmojiPicker,
  [ComponentType.RICH_TEXT_EDITOR]: formsGenerators.generateRichTextEditor,
  [ComponentType.MARKDOWN_EDITOR]: formsGenerators.generateMarkdownEditor,
  [ComponentType.CODE_EDITOR]: formsGenerators.generateCodeEditor,
  [ComponentType.SIGNATURE_PAD]: formsGenerators.generateSignaturePad,
  [ComponentType.SIGNATURE_PAD_DIGITAL]: formsGenerators.generateSignaturePadDigital,
  [ComponentType.PROMO_CODE_INPUT]: formsGenerators.generatePromoCodeInput,
  [ComponentType.CAPTCHA_INTEGRATION]: formsGenerators.generateCaptchaIntegration,
  [ComponentType.FORM_PROGRESS_INDICATOR]: formsGenerators.generateFormProgressIndicator,
  [ComponentType.FORM_VALIDATION_MESSAGES]: formsGenerators.generateFormValidationMessages,
  [ComponentType.BULK_ACTIONS_TOOLBAR]: formsGenerators.generateBulkActionsToolbar,

  // ============================================================================
  // CHARTS & ANALYTICS
  // ============================================================================
  [ComponentType.CHART]: chartsGenerators.generateChart,
  [ComponentType.CHART_WIDGET]: chartsGenerators.generateChartWidget,
  [ComponentType.DATA_VIZ_LINE_CHART]: chartsGenerators.generateDataVizLineChart,
  [ComponentType.DATA_VIZ_BAR_CHART]: chartsGenerators.generateDataVizBarChart,
  [ComponentType.DATA_VIZ_PIE_CHART]: chartsGenerators.generateDataVizPieChart,
  [ComponentType.DATA_VIZ_AREA_CHART]: chartsGenerators.generateDataVizAreaChart,
  [ComponentType.COMPARISON_CHART]: chartsGenerators.generateComparisonChart,
  [ComponentType.ANALYTICS_CARD]: chartsGenerators.generateAnalyticsCard,
  [ComponentType.ANALYTICS_OVERVIEW_CARDS]: chartsGenerators.generateAnalyticsOverviewCards,
  [ComponentType.KPI_CARD]: chartsGenerators.generateKpiCard,
  [ComponentType.STATS_WIDGET]: chartsGenerators.generateStatsWidget,
  [ComponentType.STAT_CARD]: chartsGenerators.generateStatCard,
  [ComponentType.STATISTICS_CARDS]: chartsGenerators.generateStatisticsCards,
  [ComponentType.STATISTICS_NUMBERS_SECTION]: widgetsGenerators.generateStatisticsNumbersSection,
  [ComponentType.DASHBOARD]: chartsGenerators.generateDashboard,
  [ComponentType.ACTIVITY_FEED_DASHBOARD]: chartsGenerators.generateActivityFeedDashboard,
  [ComponentType.BILLING_DASHBOARD]: chartsGenerators.generateBillingDashboard,

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  [ComponentType.NAVBAR]: navigationGenerators.generateNavbar,
  [ComponentType.HEADER_STICKY]: navigationGenerators.generateHeaderSticky,
  [ComponentType.HEADER_TRANSPARENT]: navigationGenerators.generateHeaderTransparent,
  [ComponentType.HEADER_MEGA_MENU]: navigationGenerators.generateHeaderMegaMenu,
  [ComponentType.FOOTER]: commonGenerators.generateFooter,
  [ComponentType.FOOTER_MINIMAL]: commonGenerators.generateFooterMinimal,
  [ComponentType.FOOTER_MULTI_COLUMN]: commonGenerators.generateFooterMultiColumn,
  [ComponentType.SIDEBAR]: navigationGenerators.generateSidebar,
  [ComponentType.SIDEBAR_NAVIGATION]: navigationGenerators.generateSidebarNavigation,
  [ComponentType.BREADCRUMB_NAVIGATION]: navigationGenerators.generateBreadcrumbNavigation,
  [ComponentType.PAGINATION]: navigationGenerators.generatePagination,
  [ComponentType.TABS_NAVIGATION]: navigationGenerators.generateTabsNavigation,
  [ComponentType.HAMBURGER_MENU]: navigationGenerators.generateHamburgerMenu,
  [ComponentType.DROPDOWN_MENU]: shadcnGenerators.generateDropdownMenu,
  [ComponentType.MEGA_MENU_DROPDOWN]: navigationGenerators.generateMegaMenuDropdown,
  [ComponentType.MOBILE_BOTTOM_NAV]: navigationGenerators.generateMobileBottomNav,
  [ComponentType.ACCORDION_MENU]: navigationGenerators.generateAccordionMenu,
  [ComponentType.ACCORDION]: navigationGenerators.generateNavigationAccordion,

  // ============================================================================
  // E-COMMERCE
  // ============================================================================
  [ComponentType.PRODUCT_CARD]: ecommerceGenerators.generateProductCard,
  [ComponentType.PRODUCT_CARD_COMPACT]: ecommerceGenerators.generateProductCardCompact,
  [ComponentType.PRODUCT_CARD_DETAILED]: ecommerceGenerators.generateProductCardDetailed,
  [ComponentType.PRODUCT_GRID]: ecommerceGenerators.generateProductGrid,
  [ComponentType.CATEGORY_GRID]: ecommerceGenerators.generateCategoryGrid,
  [ComponentType.PRODUCT_GRID_TWO_COLUMN]: ecommerceGenerators.generateProductGridTwoColumn,
  [ComponentType.PRODUCT_GRID_THREE_COLUMN]: ecommerceGenerators.generateProductGridThreeColumn,
  [ComponentType.PRODUCT_GRID_FOUR_COLUMN]: ecommerceGenerators.generateProductGridFourColumn,
  [ComponentType.PRODUCT_DETAIL_PAGE]: ecommerceGenerators.generateProductDetailPage,
  [ComponentType.JOB_DETAIL_PAGE]: ecommerceGenerators.generateJobDetailPage,
  [ComponentType.COMPANY_CARD_GRID]: ecommerceGenerators.generateCompanyCardGrid,
  [ComponentType.COMPANY_DETAIL_PAGE]: ecommerceGenerators.generateCompanyDetailPage,
  [ComponentType.PRODUCT_IMAGE_GALLERY]: ecommerceGenerators.generateProductImageGallery,
  [ComponentType.PRODUCT_CAROUSEL]: ecommerceGenerators.generateProductCarousel,
  [ComponentType.PRODUCT_FILTER]: navigationGenerators.generateProductFilter,
  [ComponentType.PRODUCT_FILTER_SIDEBAR]: navigationGenerators.generateProductFilterSidebar,
  [ComponentType.PRODUCT_COMPARISON_TABLE]: tablesGenerators.generateProductComparisonTable,
  [ComponentType.PRODUCT_QUICK_VIEW]: ecommerceGenerators.generateProductQuickView,
  [ComponentType.PRODUCT_REVIEWS_LIST]: tablesGenerators.generateProductReviewsList,
  [ComponentType.PRODUCT_CONFIGURATOR]: ecommerceGenerators.generateProductConfigurator,
  [ComponentType.PRODUCT_360_VIEWER]: ecommerceGenerators.generateProduct360Viewer,
  [ComponentType.PRODUCT_3D_VIEWER]: ecommerceGenerators.generateProduct3DViewer,
  [ComponentType.AR_PREVIEW_INTERFACE]: ecommerceGenerators.generateARPreviewInterface,
  [ComponentType.SHOPPING_CART]: ecommerceGenerators.generateShoppingCart,
  [ComponentType.CART_FULL_PAGE]: ecommerceGenerators.generateCartFullPage,
  [ComponentType.CART_MINI_DROPDOWN]: navigationGenerators.generateCartMiniDropdown,
  [ComponentType.CART_SUMMARY_SIDEBAR]: ecommerceGenerators.generateCartSummarySidebar,
  [ComponentType.CART_ITEM_ROW]: tablesGenerators.generateCartItemRow,
  [ComponentType.EMPTY_CART_STATE]: ecommerceGenerators.generateEmptyCartState,
  [ComponentType.CHECKOUT_STEPS]: ecommerceGenerators.generateCheckoutSteps,
  [ComponentType.ORDER_SUMMARY]: ecommerceGenerators.generateOrderSummary,
  [ComponentType.ORDER_CONFIRMATION]: ecommerceGenerators.generateOrderConfirmation,
  [ComponentType.ORDER_TRACKING]: ecommerceGenerators.generateOrderTracking,
  [ComponentType.ORDER_DETAILS_VIEW]: ecommerceGenerators.generateOrderDetailsView,
  [ComponentType.ORDER_REVIEW]: ecommerceGenerators.generateOrderReview,
  [ComponentType.WISHLIST]: tablesGenerators.generateWishlist,
  [ComponentType.RECENTLY_VIEWED]: ecommerceGenerators.generateRecentlyViewed,
  [ComponentType.RELATED_PRODUCTS_SECTION]: ecommerceGenerators.generateRelatedProductsSection,
  [ComponentType.INVENTORY_STATUS]: ecommerceGenerators.generateInventoryStatus,
  [ComponentType.PRICING_TABLE_TWO]: tablesGenerators.generatePricingTableTwo,
  [ComponentType.PRICING_TABLE_THREE]: tablesGenerators.generatePricingTableThree,
  [ComponentType.PRICING_TABLE_MULTI]: tablesGenerators.generatePricingTableMulti,
  [ComponentType.PAYMENT_METHOD]: ecommerceGenerators.generatePaymentMethod,
  [ComponentType.PAYMENT_HISTORY]: ecommerceGenerators.generatePaymentHistory,
  [ComponentType.INVOICE_DISPLAY]: ecommerceGenerators.generateInvoiceDisplay,
  [ComponentType.RECEIPT_GENERATOR]: ecommerceGenerators.generateReceiptGenerator,
  [ComponentType.REVIEW_SUMMARY]: ecommerceGenerators.generateReviewSummary,
  [ComponentType.CUSTOMER_REVIEWS_CAROUSEL]: mediaGenerators.generateCustomerReviewsCarousel,
  [ComponentType.TRUST_BADGES_SECTION]: ecommerceGenerators.generateTrustBadgesSection,

  // ============================================================================
  // FOOD & RESTAURANT
  // ============================================================================
  [ComponentType.RESTAURANT_DETAIL_HEADER]: foodGenerators.generateRestaurantDetailHeader,

  // ============================================================================
  // BLOG & CONTENT
  // ============================================================================
  [ComponentType.BLOG_LIST]: blogGenerators.generateBlogList,
  [ComponentType.BLOG_GRID]: blogGenerators.generateBlogGridLayout,
  [ComponentType.BLOG_GRID_LAYOUT]: blogGenerators.generateBlogGridLayout,
  [ComponentType.BLOG_LIST_LAYOUT]: blogGenerators.generateBlogListLayout,
  [ComponentType.BLOG_MASONRY_LAYOUT]: blogGenerators.generateBlogMasonryLayout,
  [ComponentType.BLOG_POST_CONTENT]: blogGenerators.generateBlogPostContent,
  [ComponentType.BLOG_POST_HEADER]: blogGenerators.generateBlogPostHeader,
  [ComponentType.DETAIL_PAGE_HEADER]: blogGenerators.generateDetailPageHeader,
  [ComponentType.BLOG_CARD]: blogGenerators.generateBlogCard,
  [ComponentType.FEATURED_BLOG_POST]: blogGenerators.generateFeaturedBlogPost,
  [ComponentType.BLOG_SIDEBAR]: blogGenerators.generateBlogSidebar,
  [ComponentType.BLOG_TABLE_OF_CONTENTS]: blogGenerators.generateBlogTableOfContents,
  [ComponentType.BLOG_SEARCH_BAR]: blogGenerators.generateBlogSearchBar,
  [ComponentType.AUTHOR_BIO]: blogGenerators.generateAuthorBio,
  [ComponentType.RELATED_ARTICLES]: blogGenerators.generateRelatedArticles,
  [ComponentType.ARTICLE_PAGINATION]: blogGenerators.generateArticlePagination,
  [ComponentType.CATEGORIES_WIDGET]: blogGenerators.generateCategoriesWidget,
  [ComponentType.TAG_CLOUD_WIDGET]: blogGenerators.generateTagCloudWidget,
  [ComponentType.POPULAR_POSTS_WIDGET]: widgetsGenerators.generatePopularPostsWidget,
  [ComponentType.READING_PROGRESS_BAR]: widgetsGenerators.generateReadingProgressBar,
  [ComponentType.COMMENT_SECTION]: blogGenerators.generateCommentSection,
  [ComponentType.COMMENT_THREAD]: blogGenerators.generateCommentThread,
  [ComponentType.ARCHIVE_WIDGET]: widgetsGenerators.generateArchiveWidget,

  // ============================================================================
  // SOCIAL MEDIA
  // ============================================================================
  [ComponentType.POST_COMPOSER]: blogGenerators.generatePostComposer,
  [ComponentType.SOCIAL_POST_CARD]: blogGenerators.generateSocialPostCard,
  [ComponentType.SOCIAL_MEDIA_FEED]: socialGenerators.generateSocialMediaFeed,
  [ComponentType.ACTIVITY_FEED]: socialGenerators.generateActivityFeed,
  [ComponentType.ACTIVITY_TIMELINE_SOCIAL]: socialGenerators.generateActivityTimelineSocial,
  [ComponentType.LIKE_REACTION_BUTTONS]: socialGenerators.generateLikeReactionButtons,
  [ComponentType.SHARE_BUTTONS]: socialGenerators.generateShareButtons,
  [ComponentType.SHARE_MODAL_SOCIAL]: socialGenerators.generateShareModalSocial,
  [ComponentType.FOLLOW_UNFOLLOW_BUTTON]: socialGenerators.generateFollowUnfollowButton,
  [ComponentType.FRIEND_CONNECTION_LIST]: tablesGenerators.generateFriendConnectionList,
  [ComponentType.NOTIFICATION_DROPDOWN_SOCIAL]: navigationGenerators.generateNotificationDropdownSocial,
  [ComponentType.DIRECT_MESSAGING_LIST]: tablesGenerators.generateDirectMessagingList,
  [ComponentType.DIRECT_MESSAGING_THREAD]: socialGenerators.generateDirectMessagingThread,
  [ComponentType.GROUP_CHAT_INTERFACE]: socialGenerators.generateGroupChatInterface,
  [ComponentType.MENTIONS_TAGS_SYSTEM]: socialGenerators.generateMentionsTagsSystem,
  [ComponentType.HASHTAG_DISPLAY]: socialGenerators.generateHashtagDisplay,

  // ============================================================================
  // USER & PROFILE
  // ============================================================================
  [ComponentType.USER_PROFILE]: userGenerators.generateUserProfile,
  [ComponentType.USER_PROFILE_VIEW]: userGenerators.generateUserProfileView,
  [ComponentType.RESUME_MANAGER]: userGenerators.generateResumeManager,
  [ComponentType.USER_PROFILE_CARD_MINI]: userGenerators.generateUserProfileCardMini,
  [ComponentType.PROFILE_CARD]: userGenerators.generateProfileCard,
  [ComponentType.ACCOUNT_SETTINGS]: userGenerators.generateAccountSettings,
  [ComponentType.AVATAR_UPLOAD]: userGenerators.generateAvatarUpload,
  [ComponentType.TEAM_MEMBERS_GRID]: userGenerators.generateTeamMembersGrid,
  [ComponentType.ROLE_MANAGEMENT]: userGenerators.generateRoleManagement,
  [ComponentType.API_KEY_MANAGEMENT]: userGenerators.generateApiKeyManagement,
  [ComponentType.USAGE_METRICS_DISPLAY]: userGenerators.generateUsageMetricsDisplay,
  [ComponentType.VERSION_HISTORY]: userGenerators.generateVersionHistory,
  [ComponentType.SETTINGS_PANEL_ADMIN]: userGenerators.generateSettingsPanelAdmin,
  [ComponentType.SYSTEM_NOTIFICATIONS_USER]: userGenerators.generateSystemNotificationsUser,
  [ComponentType.DELETE_ACCOUNT_CONFIRMATION]: authGenerators.generateDeleteAccountConfirmation,

  // ============================================================================
  // AUTH & SECURITY
  // ============================================================================
  [ComponentType.LOGIN_MODAL]: authGenerators.generateLoginModal,
  [ComponentType.SOCIAL_LOGIN]: authGenerators.generateSocialLogin,
  [ComponentType.PASSWORD_RESET]: authGenerators.generatePasswordReset,
  [ComponentType.EMAIL_VERIFICATION]: authGenerators.generateEmailVerification,
  [ComponentType.TWO_FACTOR_AUTH]: authGenerators.generateTwoFactorAuth,
  [ComponentType.SESSION_TIMEOUT_WARNING]: calendarGenerators.generateSessionTimeoutWarning,
  [ComponentType.ACCESS_DENIED_PAGE]: errorGenerators.generateAccessDeniedPage,
  [ComponentType.AGE_VERIFICATION_MODAL]: modalsGenerators.generateAgeVerificationModal,

  // ============================================================================
  // MODALS & DIALOGS
  // ============================================================================
  [ComponentType.MODAL_DIALOG]: modalsGenerators.generateModalDialog,
  [ComponentType.CONFIRMATION_DIALOG]: modalsGenerators.generateConfirmationDialog,
  [ComponentType.LIGHTBOX_MODAL_VIEWER]: modalsGenerators.generateLightboxModalViewer,
  [ComponentType.EXIT_INTENT_POPUP]: modalsGenerators.generateExitIntentPopup,

  // ============================================================================
  // NOTIFICATIONS & ALERTS
  // ============================================================================
  [ComponentType.TOAST_NOTIFICATION]: modalsGenerators.generateToastNotification,
  [ComponentType.NOTIFICATION_LIST]: tablesGenerators.generateNotificationList,
  [ComponentType.NOTIFICATION_CENTER_PANEL]: socialGenerators.generateNotificationCenterPanel,
  [ComponentType.ALERT_BANNER]: modalsGenerators.generateAlertBanner,
  [ComponentType.ANNOUNCEMENT_BAR]: navigationGenerators.generateAnnouncementBar,
  [ComponentType.SYSTEM_NOTIFICATIONS]: commonGenerators.generateSystemNotifications,
  [ComponentType.PUSH_NOTIFICATION_PROMPT]: widgetsGenerators.generatePushNotificationPrompt,

  // ============================================================================
  // MEDIA
  // ============================================================================
  [ComponentType.IMAGE_GALLERY_GRID]: mediaGenerators.generateImageGalleryGrid,
  [ComponentType.IMAGE_GALLERY_MASONRY]: mediaGenerators.generateImageGalleryMasonry,
  [ComponentType.THUMBNAIL_GALLERY]: mediaGenerators.generateThumbnailGallery,
  [ComponentType.IMAGE_ZOOM_HOVER]: mediaGenerators.generateImageZoomHover,
  [ComponentType.IMAGE_ZOOM_CLICK]: mediaGenerators.generateImageZoomClick,
  [ComponentType.BEFORE_AFTER_SLIDER]: mediaGenerators.generateBeforeAfterSlider,
  [ComponentType.MEDIA_CAROUSEL]: mediaGenerators.generateMediaCarousel,
  [ComponentType.VIDEO_PLAYER_EMBEDDED]: mediaGenerators.generateVideoPlayerEmbedded,
  [ComponentType.VIDEO_PLAYER_CUSTOM]: mediaGenerators.generateVideoPlayerCustom,
  [ComponentType.VIDEO_THUMBNAIL_GRID]: mediaGenerators.generateVideoThumbnailGrid,
  [ComponentType.AUDIO_PLAYER]: mediaGenerators.generateAudioPlayer,
  [ComponentType.TRACK_DETAIL_PAGE]: mediaGenerators.generateTrackDetailPage,
  [ComponentType.PLAYLIST_INTERFACE]: tablesGenerators.generatePlaylistInterface,

  // ============================================================================
  // FITNESS & GYM
  // ============================================================================
  [ComponentType.TRAINER_GRID]: fitnessGenerators.generateTrainerGrid,
  [ComponentType.TRAINER_DETAIL_VIEW]: fitnessGenerators.generateTrainerDetailView,
  [ComponentType.CLASS_DETAIL_VIEW]: fitnessGenerators.generateClassDetailView,

  // ============================================================================
  // EDUCATION & LEARNING
  // ============================================================================
  [ComponentType.COURSE_MODULES_LIST]: tablesGenerators.generateCourseModulesList,

  // ============================================================================
  // CALENDAR & EVENTS
  // ============================================================================
  [ComponentType.CALENDAR]: calendarGenerators.generateCalendar,
  [ComponentType.CALENDAR_EVENT]: calendarGenerators.generateCalendar, // Alias for calendar component
  [ComponentType.CLASS_SCHEDULE_GRID]: calendarGenerators.generateClassScheduleGrid,
  [ComponentType.COUNTDOWN_TIMER_EVENT]: calendarGenerators.generateCountdownTimerEvent,
  [ComponentType.COUNTDOWN_TIMER_OFFER]: calendarGenerators.generateCountdownTimerOffer,

  // ============================================================================
  // EVENT TICKETING
  // ============================================================================
  [ComponentType.EVENT_GRID]: eventGenerators.generateEventGrid,
  [ComponentType.EVENT_CARD]: eventGenerators.generateEventCard,
  [ComponentType.EVENT_DETAIL_PAGE]: eventGenerators.generateEventDetailPage,
  [ComponentType.TICKET_SELECTOR]: eventGenerators.generateTicketSelector,
  [ComponentType.TICKET_LIST]: tablesGenerators.generateDataTable,
  [ComponentType.TICKET_DETAIL_VIEW]: tablesGenerators.generateDetailView,
  [ComponentType.TICKET_CARD]: eventGenerators.generateEventCard, // Reuse event card for ticket display
  [ComponentType.QR_SCANNER]: widgetsGenerators.generateQRCodeScanner,

  // ============================================================================
  // HELP & SUPPORT
  // ============================================================================
  [ComponentType.HELP_CENTER_HOME]: helpGenerators.generateHelpCenterHome,
  [ComponentType.HELP_ARTICLE_PAGE]: helpGenerators.generateHelpArticlePage,
  [ComponentType.ARTICLE_SEARCH_HELP]: helpGenerators.generateArticleSearchHelp,
  [ComponentType.FAQ_ACCORDION_SIMPLE]: helpGenerators.generateFaqAccordionSimple,
  [ComponentType.FAQ_ACCORDION_CATEGORIZED]: helpGenerators.generateFaqAccordionCategorized,
  [ComponentType.FAQ_SEARCH]: helpGenerators.generateFaqSearch,
  [ComponentType.KNOWLEDGE_BASE_CATEGORIES]: helpGenerators.generateKnowledgeBaseCategories,
  [ComponentType.DOCUMENTATION_VIEWER]: helpGenerators.generateDocumentationViewer,
  [ComponentType.VIDEO_TUTORIALS_GALLERY]: helpGenerators.generateVideoTutorialsGallery,
  [ComponentType.TUTORIAL_WALKTHROUGH]: helpGenerators.generateTutorialWalkthrough,
  [ComponentType.GUIDED_TOUR_WALKTHROUGH]: helpGenerators.generateGuidedTourWalkthrough,
  [ComponentType.TROUBLESHOOTING_WIZARD]: helpGenerators.generateTroubleshootingWizard,
  [ComponentType.SUPPORT_TICKET_LIST_HELP]: helpGenerators.generateSupportTicketListHelp,
  [ComponentType.SUPPORT_TICKET_DETAIL_HELP]: helpGenerators.generateSupportTicketDetailHelp,
  [ComponentType.LIVE_CHAT_WIDGET_HELP]: helpGenerators.generateLiveChatWidgetHelp,
  [ComponentType.CHATBOT_SUPPORT]: helpGenerators.generateChatbotSupport,
  [ComponentType.REVIEW_HELPFUL_VOTING]: helpGenerators.generateReviewHelpfulVoting,
  [ComponentType.HELP_SIDEBAR_CONTEXTUAL]: helpGenerators.generateHelpSidebarContextual,
  [ComponentType.CHANGELOG_DISPLAY]: helpGenerators.generateChangelogDisplay,

  // ============================================================================
  // ERROR PAGES
  // ============================================================================
  [ComponentType.ERROR_404]: errorGenerators.generateError404Page,
  [ComponentType.ERROR_404_PAGE]: errorGenerators.generateError404Page,
  [ComponentType.ERROR_500]: errorGenerators.generateError500Page,
  [ComponentType.ERROR_500_PAGE]: errorGenerators.generateError500Page,
  [ComponentType.ERROR_MESSAGE]: errorGenerators.generateErrorMessage,
  [ComponentType.COMING_SOON_PAGE]: errorGenerators.generateComingSoonPage,
  [ComponentType.MAINTENANCE_MODE_PAGE]: errorGenerators.generateMaintenanceModePage,

  // ============================================================================
  // CONTENT PAGES
  // ============================================================================
  [ComponentType.ABOUT_PAGE]: blogGenerators.generateAboutPageContent,
  [ComponentType.ABOUT_PAGE_CONTENT]: blogGenerators.generateAboutPageContent,
  [ComponentType.CONTACT_PAGE]: legalGenerators.generateContactPageContent,
  [ComponentType.CONTACT_PAGE_CONTENT]: legalGenerators.generateContactPageContent,
  [ComponentType.LEGAL_PAGE]: legalGenerators.generateLegalPageContent,
  [ComponentType.LEGAL_PAGE_CONTENT]: legalGenerators.generateLegalPageContent,
  [ComponentType.SITEMAP_CONTENT]: blogGenerators.generateSitemapContent,

  // ============================================================================
  // HERO & LANDING
  // ============================================================================
  [ComponentType.HERO_SECTION]: commonGenerators.generateHeroSection,
  [ComponentType.HERO_FULL_WIDTH]: commonGenerators.generateHeroFullWidth,
  [ComponentType.HERO_CENTERED]: commonGenerators.generateHeroCentered,
  [ComponentType.HERO_SPLIT]: commonGenerators.generateHeroSplitLayout, // Alias for HERO_SPLIT_LAYOUT
  [ComponentType.HERO_SPLIT_LAYOUT]: commonGenerators.generateHeroSplitLayout,
  [ComponentType.HERO_VIDEO_BG]: commonGenerators.generateHeroSection, // Fallback to hero section
  [ComponentType.CTA_BLOCK]: widgetsGenerators.generateCtaBlock,
  [ComponentType.CTA_SECTION_CENTERED]: widgetsGenerators.generateCtaBlock, // Alias
  [ComponentType.CTA_SECTION_WITH_IMAGE]: widgetsGenerators.generateCtaBlock, // Alias
  [ComponentType.FEATURE_SHOWCASE_GRID]: widgetsGenerators.generateFeatureShowcaseGrid,
  [ComponentType.FEATURE_SHOWCASE_ALTERNATING]: widgetsGenerators.generateFeatureShowcaseAlternating,
  [ComponentType.TESTIMONIAL_SLIDER]: mediaGenerators.generateTestimonialSlider,
  [ComponentType.TESTIMONIAL_GRID]: widgetsGenerators.generateTestimonialGrid,
  [ComponentType.PARTNER_CLIENT_LOGOS]: widgetsGenerators.generatePartnerClientLogos,
  [ComponentType.PRESS_MENTIONS]: widgetsGenerators.generatePressMentions,
  [ComponentType.AWARDS_SHOWCASE]: widgetsGenerators.generateAwardsShowcase,
  [ComponentType.CASE_STUDY_CARDS]: widgetsGenerators.generateCaseStudyCards,
  [ComponentType.PROMOTIONAL_BANNER_TOP]: widgetsGenerators.generatePromotionalBannerTop,

  // ============================================================================
  // WIDGETS & UTILITIES
  // ============================================================================
  [ComponentType.KANBAN_BOARD]: widgetsGenerators.generateKanbanBoard,
  [ComponentType.WHITEBOARD_INTERFACE]: widgetsGenerators.generateWhiteboardInterface,
  [ComponentType.DRAWING_CANVAS]: widgetsGenerators.generateDrawingCanvas,
  [ComponentType.INTERACTIVE_DEMO]: widgetsGenerators.generateInteractiveDemo,
  [ComponentType.QR_CODE_GENERATOR]: widgetsGenerators.generateQRCodeGenerator,
  [ComponentType.QR_CODE_SCANNER]: widgetsGenerators.generateQRCodeScanner,
  [ComponentType.PROGRESS_INDICATOR_LINEAR]: widgetsGenerators.generateProgressIndicatorLinear,
  [ComponentType.PROGRESS_INDICATOR_CIRCULAR]: widgetsGenerators.generateProgressIndicatorCircular,
  [ComponentType.ROADMAP_TIMELINE]: calendarGenerators.generateRoadmapTimeline,
  [ComponentType.STATUS_BADGE]: widgetsGenerators.generateStatusBadge,
  [ComponentType.CARD]: widgetsGenerators.generateCardWidget,
  [ComponentType.TOOLTIP_SYSTEM]: modalsGenerators.generateTooltipSystem,
  [ComponentType.SKELETON_SCREEN]: commonGenerators.generateSkeletonScreen,
  [ComponentType.LOADING_STATE_SPINNER]: commonGenerators.generateLoadingStateSpinner,
  [ComponentType.EMPTY_STATE_NO_DATA]: tablesGenerators.generateEmptyStateNoData,
  [ComponentType.SEARCH_BAR]: formsGenerators.generateSearchBar,
  [ComponentType.SEARCH_RESULTS_PAGE]: formsGenerators.generateSearchResultsPage,
  [ComponentType.THEME_TOGGLE]: commonGenerators.generateThemeToggle,
  [ComponentType.COOKIE_CONSENT_SIMPLE]: commonGenerators.generateCookieConsentSimple,
  [ComponentType.COOKIE_CONSENT_DETAILED]: commonGenerators.generateCookieConsentDetailed,
  [ComponentType.ACCESSIBILITY_MENU]: navigationGenerators.generateAccessibilityMenu,
  [ComponentType.FONT_SIZE_ADJUSTER]: commonGenerators.generateFontSizeAdjuster,
  [ComponentType.HIGH_CONTRAST_MODE]: commonGenerators.generateHighContrastMode,
  [ComponentType.SCREEN_READER_ANNOUNCEMENTS]: commonGenerators.generateScreenReaderAnnouncements,
  [ComponentType.SKIP_NAVIGATION]: commonGenerators.generateSkipNavigation,
  [ComponentType.CONNECTION_LOST_BANNER]: commonGenerators.generateConnectionLostBanner,
  [ComponentType.OFFLINE_MODE_INTERFACE]: commonGenerators.generateOfflineModeInterface,
  [ComponentType.STATUS_PAGE_SERVICE]: commonGenerators.generateStatusPageService,
  [ComponentType.SUCCESS_MESSAGE]: commonGenerators.generateSuccessMessage,
  [ComponentType.NO_RESULTS_FOUND]: commonGenerators.generateNoResultsFound,
  [ComponentType.ONBOARDING_FLOW]: commonGenerators.generateOnboardingFlow,
  [ComponentType.EXPORT_DATA_INTERFACE]: tablesGenerators.generateExportDataInterface,
  [ComponentType.DATABASE_MANAGEMENT]: tablesGenerators.generateDatabaseManagement,
  [ComponentType.LOGS_VIEWER]: userGenerators.generateLogsViewer,

  // ============================================================================
  // BUDGET & EXPENSE TRACKING (Primarily for React Native)
  // ============================================================================
  [ComponentType.EXPENSE_CARD]: tablesGenerators.generateDataTable, // Fallback to data table for web
  [ComponentType.BUDGET_PROGRESS_CARD]: chartsGenerators.generateKpiCard, // Use KPI card for budget progress
  [ComponentType.FINANCIAL_GOAL_CARD]: chartsGenerators.generateKpiCard, // Use KPI card for goals
  [ComponentType.EXPENSE_LIST]: tablesGenerators.generateDataTable, // Use data table for expense list
  [ComponentType.BUDGET_OVERVIEW]: chartsGenerators.generateKpiCard, // Use KPI card for overview
  [ComponentType.CATEGORY_SPENDING]: chartsGenerators.generateKpiCard, // Use KPI card for category spending
  [ComponentType.TRANSACTION_HISTORY]: tablesGenerators.generateDataTable, // Use data table for transaction history

  // ============================================================================
  // TRAVEL & BOOKING
  // ============================================================================
  [ComponentType.TRAVEL_HERO]: travelGenerators.generateTravelHero,
  [ComponentType.TRAVEL_DESTINATIONS_GRID]: travelGenerators.generateTravelDestinationsGrid,
  [ComponentType.TRAVEL_DESTINATION_DETAIL_PAGE]: travelGenerators.generateTravelDestinationDetailPage,
  [ComponentType.TRAVEL_HOTELS_GRID]: travelGenerators.generateTravelHotelsGrid,
  [ComponentType.TRAVEL_HOTEL_DETAIL_PAGE]: travelGenerators.generateTravelHotelDetailPage,
  [ComponentType.TRAVEL_FLIGHTS_LIST]: tablesGenerators.generateDataTable, // Fallback to data table
  [ComponentType.TRAVEL_FLIGHTS_GRID]: travelGenerators.generateTravelFlightsGrid,
  [ComponentType.TRAVEL_FLIGHT_DETAIL_PAGE]: travelGenerators.generateTravelFlightDetailPage,
  [ComponentType.TRAVEL_TOUR_PACKAGES_GRID]: travelGenerators.generateTravelTourPackagesGrid,
  [ComponentType.TRAVEL_TOUR_DETAIL_PAGE]: travelGenerators.generateTravelTourDetailPage,
  [ComponentType.TRAVEL_TRIP_CARD]: ecommerceGenerators.generateProductCard, // Use product card for trips
  [ComponentType.TRAVEL_BOOKING_CARD]: ecommerceGenerators.generateProductCard, // Use product card for bookings
  [ComponentType.TRAVEL_SEARCH_BAR]: formsGenerators.generateSearchBar, // Use search bar
  [ComponentType.TRAVEL_FLIGHT_CARD]: ecommerceGenerators.generateProductCard, // Use product card for flights
  [ComponentType.TRAVEL_HOTEL_CARD]: ecommerceGenerators.generateProductCard, // Use product card for hotels
  [ComponentType.TRAVEL_DESTINATION_CARD]: ecommerceGenerators.generateProductCard, // Use product card for destinations
  [ComponentType.TRAVEL_DASHBOARD_PAGE]: chartsGenerators.generateDashboard, // Use dashboard component
  [ComponentType.TRAVEL_BOOKING_CONFIRMATION_PAGE]: travelGenerators.generateTravelBookingConfirmationPage,

  // ============================================================================
  // HEALTHCARE & MEDICAL
  // ============================================================================
  [ComponentType.PATIENT_CARD]: healthcareGenerators.generatePatientCard,
  [ComponentType.APPOINTMENT_SCHEDULER]: healthcareGenerators.generateAppointmentScheduler,
  [ComponentType.MEDICAL_RECORD_VIEW]: healthcareGenerators.generateMedicalRecordView,
  [ComponentType.PRESCRIPTION_LIST]: healthcareGenerators.generatePrescriptionList,

  // ============================================================================
  // REAL ESTATE & PROPERTY
  // ============================================================================
  [ComponentType.PROPERTY_CARD]: realEstateGenerators.generatePropertyCard,
  [ComponentType.PROPERTY_SEARCH]: realEstateGenerators.generatePropertySearch,

  // ============================================================================
  // AUTOMOTIVE
  // ============================================================================
  [ComponentType.VEHICLE_CARD]: automotiveGenerators.generateVehicleCard,
  [ComponentType.SERVICE_BOOKING]: automotiveGenerators.generateServiceBooking,

  // ============================================================================
  // BOOKING & SCHEDULING
  // ============================================================================
  [ComponentType.TIME_SLOT_PICKER]: bookingGenerators.generateTimeSlotPicker,
  [ComponentType.BOOKING_SUMMARY]: bookingGenerators.generateBookingSummary,

  // ============================================================================
  // PET CARE
  // ============================================================================
  [ComponentType.PET_PROFILE_CARD]: petsGenerators.generatePetProfileCard,
  [ComponentType.PET_SERVICE_CARD]: petsGenerators.generatePetServiceCard,
};

/**
 * Component Metadata for special prop handling
 * Defines how components receive data from page-level queries
 */
export interface ComponentMetadata {
  // Props that need data from related entities on the same page
  relatedEntityProps?: {
    propName: string;           // The prop name to pass (e.g., 'event')
    sourceEntity: string;       // The entity to get data from (e.g., 'events')
    isArray?: boolean;          // Whether to wrap in Array check
  }[];
  // Props that receive the primary entity data
  primaryDataProp?: {
    propName: string;           // The prop name (e.g., 'ticketTypes')
    isArray?: boolean;          // Whether data should be array
  };
  // Additional static props to include
  staticProps?: Record<string, any>;
}

/**
 * Component Metadata Registry
 * Maps component types to their special prop requirements
 */
export const COMPONENT_METADATA: Partial<Record<ComponentType, ComponentMetadata>> = {
  [ComponentType.TICKET_SELECTOR]: {
    relatedEntityProps: [
      { propName: 'event', sourceEntity: 'events', isArray: false },
    ],
    primaryDataProp: { propName: 'ticketTypes', isArray: true },
    staticProps: { showDescription: true, showAvailability: true },
  },
  // Add more components with special prop requirements here as needed
};

/**
 * Get metadata for a component type
 */
export function getComponentMetadata(type: ComponentType): ComponentMetadata | null {
  return COMPONENT_METADATA[type] || null;
}

/**
 * Get generator function for a component type
 */
export function getComponentGenerator(type: ComponentType): ComponentGenerator | null {
  return COMPONENT_REGISTRY[type] || null;
}

/**
 * Check if a component type has a registered generator
 */
export function hasComponentGenerator(type: ComponentType): boolean {
  return type in COMPONENT_REGISTRY;
}
