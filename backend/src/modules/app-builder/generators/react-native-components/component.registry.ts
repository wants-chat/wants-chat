/**
 * React Native Component Registry
 *
 * Type-safe registry mapping ComponentType enum values to their generator functions.
 * This ensures that:
 * 1. All component types have corresponding generators
 * 2. Type mismatches are caught at compile time
 * 3. Easy to discover available components
 */

import { ComponentType } from '../../interfaces/component-types.enum';
import { ResolvedComponent } from '../react-components/types/resolved-component.interface';

// Import ALL category generators
import * as blogGenerators from './ui/react-native/blog';
import * as budgetGenerators from './ui/react-native/budget';
import * as chartsGenerators from './ui/react-native/charts';
import * as commonGenerators from './ui/react-native/common';
import * as detailGenerators from './ui/react-native/detail';
import * as ecommerceGenerators from './ui/react-native/ecommerce';
import * as foodGenerators from './ui/react-native/food';
import * as formsGenerators from './ui/react-native/forms';
import * as mediaGenerators from './ui/react-native/media';
import * as navigationGenerators from './ui/react-native/navigation';
import * as tablesGenerators from './ui/react-native/tables';
import * as userGenerators from './ui/react-native/user';

// New category imports for missing components
import * as authGenerators from './ui/react-native/auth';
import * as modalsGenerators from './ui/react-native/modals';
import * as socialGenerators from './ui/react-native/social';
import * as helpGenerators from './ui/react-native/help';
import * as errorGenerators from './ui/react-native/error';
import * as widgetsGenerators from './ui/react-native/widgets';
import * as travelGenerators from './ui/react-native/travel';
import * as healthcareGenerators from './ui/react-native/healthcare';
import * as legalGenerators from './ui/react-native/legal';
import * as fitnessGenerators from './ui/react-native/fitness';

/**
 * Component generator function signature for React Native
 */
export type RNComponentGenerator = (resolved: ResolvedComponent, variant?: string) => { code: string; imports: string[] };

/**
 * Helper to create a placeholder generator for unimplemented components
 */
function createPlaceholder(componentName: string): RNComponentGenerator {
  return (resolved: ResolvedComponent) => ({
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ${componentName}Props {
  data?: any;
  [key: string]: any;
}

export default function ${componentName}({ data, ...props }: ${componentName}Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${componentName}</Text>
      <Text style={styles.text}>Component ready for implementation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#6b7280',
  },
});`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet } from 'react-native';",
    ],
  });
}

/**
 * React Native Component Registry Map
 *
 * Maps each ComponentType to its generator function.
 */
export const RN_COMPONENT_REGISTRY: Partial<Record<ComponentType, RNComponentGenerator>> = {
  // ============================================================================
  // DATA DISPLAY & TABLES
  // ============================================================================
  [ComponentType.DATA_TABLE]: tablesGenerators.generateRNDataTable,
  [ComponentType.TABLE]: tablesGenerators.generateRNDataTable,
  [ComponentType.DETAIL_VIEW]: detailGenerators.generateRNEntityDetailWithHeader,
  [ComponentType.ENTITY_DETAIL_WITH_HEADER]: detailGenerators.generateRNEntityDetailWithHeader,
  [ComponentType.PRODUCT_LIST_VIEW]: tablesGenerators.generateRNDataTable,
  [ComponentType.TRANSACTION_HISTORY_TABLE]: tablesGenerators.generateRNDataTable,
  [ComponentType.USER_MANAGEMENT_TABLE]: tablesGenerators.generateRNDataTable,
  [ComponentType.ORDER_HISTORY_LIST]: ecommerceGenerators.generateRNOrderHistoryList,

  // ============================================================================
  // FORMS & INPUTS
  // ============================================================================
  [ComponentType.FORM]: formsGenerators.generateRNForm,
  [ComponentType.FORM_COMPONENTS]: formsGenerators.generateRNForm,
  [ComponentType.LOGIN_FORM]: formsGenerators.generateRNLoginForm,
  [ComponentType.REGISTER_FORM]: formsGenerators.generateRNRegisterForm,
  [ComponentType.CONTACT_FORM]: formsGenerators.generateRNContactForm,
  [ComponentType.BASIC_CONTACT_FORM]: formsGenerators.generateRNContactForm,
  [ComponentType.FEEDBACK_FORM]: formsGenerators.generateRNFeedbackForm,
  [ComponentType.SURVEY_FORM]: formsGenerators.generateRNSurveyForm,
  [ComponentType.APPLICATION_FORM]: formsGenerators.generateRNApplicationForm,
  [ComponentType.BOOKING_RESERVATION_FORM]: formsGenerators.generateRNBookingForm,
  [ComponentType.CHECKOUT_FORM]: ecommerceGenerators.generateRNCheckoutForm,
  [ComponentType.CHECKOUT_STEPS]: ecommerceGenerators.generateRNCheckoutSteps,
  [ComponentType.CREDIT_CARD_FORM]: formsGenerators.generateRNCreditCardForm,
  [ComponentType.SHIPPING_ADDRESS_FORM]: formsGenerators.generateRNShippingAddressForm,
  [ComponentType.PASSWORD_CHANGE_FORM]: authGenerators.generateRNPasswordChangeForm,
  [ComponentType.PROFILE_EDIT_FORM]: userGenerators.generateRNProfileEditForm,
  [ComponentType.RESET_PASSWORD_FORM]: authGenerators.generateRNResetPasswordForm,
  [ComponentType.FORGOT_PASSWORD_FORM]: authGenerators.generateRNForgotPasswordForm,
  [ComponentType.WRITE_REVIEW_FORM]: formsGenerators.generateRNWriteReviewForm,
  [ComponentType.SUPPORT_TICKET_FORM]: helpGenerators.generateRNSupportTicketForm,
  [ComponentType.COMMENT_FORM]: blogGenerators.generateRNCommentForm,
  [ComponentType.COMMENT_REPLY_FORM]: blogGenerators.generateRNCommentReplyForm,
  [ComponentType.FORUM_POST_EDITOR]: blogGenerators.generateRNForumPostEditor,
  [ComponentType.NEWSLETTER_SIGNUP]: formsGenerators.generateRNNewsletterSignup,
  [ComponentType.WIZARD_FORM]: formsGenerators.generateRNWizardForm,
  [ComponentType.MULTI_COLUMN_FORM]: formsGenerators.generateRNMultiColumnForm,
  [ComponentType.INLINE_FORM]: formsGenerators.generateRNInlineForm,
  [ComponentType.REGISTRATION_MULTI_STEP]: authGenerators.generateRNRegistrationMultiStep,
  [ComponentType.VERIFY_EMAIL_FORM]: authGenerators.generateRNVerifyEmailForm,

  // Form Fields
  [ComponentType.FORM_FIELD_EMAIL]: formsGenerators.generateRNFormFieldEmail,
  [ComponentType.FORM_FIELD_PASSWORD]: formsGenerators.generateRNFormFieldPassword,
  [ComponentType.FORM_FIELD_TEXT]: formsGenerators.generateRNFormFieldText,
  [ComponentType.INPUT]: formsGenerators.generateRNInput,
  [ComponentType.TEXTAREA]: formsGenerators.generateRNTextarea,
  [ComponentType.BUTTON]: formsGenerators.generateRNButton,
  [ComponentType.LABEL]: formsGenerators.generateRNLabel,

  // Advanced Form Inputs
  [ComponentType.DATE_PICKER_SINGLE]: formsGenerators.generateRNDatePickerSingle,
  [ComponentType.DATE_PICKER_RANGE]: formsGenerators.generateRNDatePickerRange,
  [ComponentType.DATETIME_PICKER]: formsGenerators.generateRNDatetimePicker,
  [ComponentType.TIME_PICKER]: formsGenerators.generateRNTimePicker,
  [ComponentType.COLOR_PICKER]: formsGenerators.generateRNColorPicker,
  [ComponentType.FILE_UPLOAD_SINGLE]: formsGenerators.generateRNFileUploadSingle,
  [ComponentType.FILE_UPLOAD_MULTIPLE]: formsGenerators.generateRNFileUploadMultiple,
  [ComponentType.DRAG_DROP_UPLOADER]: formsGenerators.generateRNFileUploadMultiple,
  [ComponentType.IMAGE_UPLOAD_PREVIEW]: formsGenerators.generateRNImageUploadPreview,
  [ComponentType.MEDIA_UPLOAD_PREVIEW]: formsGenerators.generateRNMediaUploadPreview,
  [ComponentType.AUTOCOMPLETE_INPUT]: formsGenerators.generateRNAutocompleteInput,
  [ComponentType.ADDRESS_AUTOCOMPLETE]: formsGenerators.generateRNAddressAutocomplete,
  [ComponentType.PHONE_NUMBER_INPUT]: formsGenerators.generateRNPhoneNumberInput,
  [ComponentType.CREDIT_CARD_INPUT]: formsGenerators.generateRNCreditCardInput,
  [ComponentType.CURRENCY_SELECTOR]: formsGenerators.generateRNCurrencySelector,
  [ComponentType.LANGUAGE_SELECTOR]: formsGenerators.generateRNLanguageSelector,
  [ComponentType.SHIPPING_METHOD_SELECTOR]: formsGenerators.generateRNShippingMethodSelector,
  [ComponentType.SIZE_VARIANT_SELECTOR]: formsGenerators.generateRNSizeVariantSelector,
  [ComponentType.RATING_INPUT_STARS]: formsGenerators.generateRNRatingInputStars,
  [ComponentType.RATING_INPUT_NUMBERS]: formsGenerators.generateRNRatingInputNumbers,
  [ComponentType.SLIDER_RANGE]: formsGenerators.generateRNSliderRange,
  [ComponentType.PRICE_RANGE_SLIDER]: formsGenerators.generateRNPriceRangeSlider,
  [ComponentType.TAG_INPUT]: formsGenerators.generateRNTagInput,
  [ComponentType.EMOJI_PICKER]: formsGenerators.generateRNEmojiPicker,
  [ComponentType.RICH_TEXT_EDITOR]: blogGenerators.generateRNRichTextEditor,
  [ComponentType.MARKDOWN_EDITOR]: formsGenerators.generateRNMarkdownEditor,
  [ComponentType.CODE_EDITOR]: formsGenerators.generateRNCodeEditor,
  [ComponentType.SIGNATURE_PAD]: formsGenerators.generateRNSignaturePad,
  [ComponentType.SIGNATURE_PAD_DIGITAL]: formsGenerators.generateRNSignaturePad,
  [ComponentType.PROMO_CODE_INPUT]: formsGenerators.generateRNPromoCodeInput,
  [ComponentType.CAPTCHA_INTEGRATION]: formsGenerators.generateRNCaptchaIntegration,
  [ComponentType.FORM_PROGRESS_INDICATOR]: formsGenerators.generateRNFormProgressIndicator,
  [ComponentType.FORM_VALIDATION_MESSAGES]: formsGenerators.generateRNFormValidationMessages,
  [ComponentType.BULK_ACTIONS_TOOLBAR]: formsGenerators.generateRNBulkActionsToolbar,

  // ============================================================================
  // CHARTS & ANALYTICS
  // ============================================================================
  [ComponentType.CHART]: chartsGenerators.generateRNDataVizBarChart,
  [ComponentType.CHART_WIDGET]: chartsGenerators.generateRNChartWidget,
  [ComponentType.DATA_VIZ_LINE_CHART]: chartsGenerators.generateRNDataVizLineChart,
  [ComponentType.DATA_VIZ_BAR_CHART]: chartsGenerators.generateRNDataVizBarChart,
  [ComponentType.DATA_VIZ_PIE_CHART]: chartsGenerators.generateRNDataVizPieChart,
  [ComponentType.DATA_VIZ_AREA_CHART]: chartsGenerators.generateRNDataVizAreaChart,
  [ComponentType.COMPARISON_CHART]: chartsGenerators.generateRNComparisonChart,
  [ComponentType.ANALYTICS_CARD]: chartsGenerators.generateRNAnalyticsCard,
  [ComponentType.ANALYTICS_OVERVIEW_CARDS]: chartsGenerators.generateRNAnalyticsOverviewCards,
  [ComponentType.KPI_CARD]: chartsGenerators.generateRNKpiCard,
  [ComponentType.STATS_WIDGET]: chartsGenerators.generateRNStatsWidget,
  [ComponentType.STAT_CARD]: chartsGenerators.generateRNStatCard,
  [ComponentType.STATISTICS_CARDS]: chartsGenerators.generateRNStatisticsCards,
  [ComponentType.STATISTICS_NUMBERS_SECTION]: chartsGenerators.generateRNStatisticsNumbersSection,
  [ComponentType.DASHBOARD]: chartsGenerators.generateRNDashboard,
  [ComponentType.ACTIVITY_FEED_DASHBOARD]: chartsGenerators.generateRNActivityFeedDashboard,
  [ComponentType.BILLING_DASHBOARD]: chartsGenerators.generateRNBillingDashboard,

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  [ComponentType.NAVBAR]: navigationGenerators.generateRNNavbar,
  [ComponentType.HEADER_STICKY]: navigationGenerators.generateRNHeaderSticky,
  [ComponentType.HEADER_TRANSPARENT]: navigationGenerators.generateRNHeaderTransparent,
  [ComponentType.HEADER_MEGA_MENU]: navigationGenerators.generateRNHeaderMegaMenu,
  [ComponentType.FOOTER]: navigationGenerators.generateRNFooter,
  [ComponentType.FOOTER_MINIMAL]: navigationGenerators.generateRNFooterMinimal,
  [ComponentType.FOOTER_MULTI_COLUMN]: navigationGenerators.generateRNFooterMultiColumn,
  [ComponentType.SIDEBAR]: navigationGenerators.generateRNSidebar,
  [ComponentType.SIDEBAR_NAVIGATION]: navigationGenerators.generateRNSidebarNavigation,
  [ComponentType.BREADCRUMB_NAVIGATION]: navigationGenerators.generateRNBreadcrumbNavigation,
  [ComponentType.PAGINATION]: navigationGenerators.generateRNPagination,
  [ComponentType.TABS_NAVIGATION]: navigationGenerators.generateRNTabsNavigation,
  [ComponentType.HAMBURGER_MENU]: navigationGenerators.generateRNHamburgerMenu,
  [ComponentType.DROPDOWN_MENU]: navigationGenerators.generateRNDropdownMenu,
  [ComponentType.MEGA_MENU_DROPDOWN]: navigationGenerators.generateRNMegaMenuDropdown,
  [ComponentType.MOBILE_BOTTOM_NAV]: navigationGenerators.generateRNMobileBottomNav,
  [ComponentType.ACCORDION_MENU]: navigationGenerators.generateRNAccordionMenu,
  [ComponentType.ACCORDION]: navigationGenerators.generateRNAccordion,

  // ============================================================================
  // E-COMMERCE
  // ============================================================================
  [ComponentType.PRODUCT_CARD]: ecommerceGenerators.generateRNProductCard,
  [ComponentType.PRODUCT_CARD_COMPACT]: ecommerceGenerators.generateRNProductCardCompact,
  [ComponentType.PRODUCT_CARD_DETAILED]: ecommerceGenerators.generateRNProductCardDetailed,
  [ComponentType.PRODUCT_GRID]: ecommerceGenerators.generateRNProductGrid,
  [ComponentType.CATEGORY_GRID]: ecommerceGenerators.generateRNCategoryGrid,
  [ComponentType.PRODUCT_GRID_TWO_COLUMN]: ecommerceGenerators.generateRNProductGridTwoColumn,
  [ComponentType.PRODUCT_GRID_THREE_COLUMN]: ecommerceGenerators.generateRNProductGridThreeColumn,
  [ComponentType.PRODUCT_GRID_FOUR_COLUMN]: ecommerceGenerators.generateRNProductGridFourColumn,
  [ComponentType.PRODUCT_DETAIL_PAGE]: ecommerceGenerators.generateRNProductDetailPage,
  [ComponentType.PRODUCT_IMAGE_GALLERY]: ecommerceGenerators.generateRNProductImageGallery,
  [ComponentType.PRODUCT_CAROUSEL]: ecommerceGenerators.generateRNProductCarousel,
  [ComponentType.PRODUCT_COMPARISON_TABLE]: ecommerceGenerators.generateRNProductComparisonTable,
  [ComponentType.PRODUCT_FILTER]: ecommerceGenerators.generateRNProductFilter,
  [ComponentType.PRODUCT_FILTER_SIDEBAR]: ecommerceGenerators.generateRNProductFilterSidebar,
  [ComponentType.PRODUCT_QUICK_VIEW]: ecommerceGenerators.generateRNProductQuickView,
  [ComponentType.PRODUCT_REVIEWS_LIST]: ecommerceGenerators.generateRNProductReviewsList,
  [ComponentType.PRODUCT_CONFIGURATOR]: ecommerceGenerators.generateRNProductConfigurator,
  [ComponentType.PRODUCT_360_VIEWER]: ecommerceGenerators.generateRNProduct360Viewer,
  [ComponentType.PRODUCT_3D_VIEWER]: ecommerceGenerators.generateRNProduct3DViewer,
  [ComponentType.AR_PREVIEW_INTERFACE]: ecommerceGenerators.generateRNArPreviewInterface,
  [ComponentType.SHOPPING_CART]: ecommerceGenerators.generateRNShoppingCart,
  [ComponentType.CART_FULL_PAGE]: ecommerceGenerators.generateRNCartFullPage,
  [ComponentType.CART_MINI_DROPDOWN]: ecommerceGenerators.generateRNCartMiniDropdown,
  [ComponentType.CART_ITEM_ROW]: ecommerceGenerators.generateRNCartItemRow,
  [ComponentType.CART_SUMMARY_SIDEBAR]: ecommerceGenerators.generateRNCartSummarySidebar,
  [ComponentType.EMPTY_CART_STATE]: ecommerceGenerators.generateRNEmptyCartState,
  [ComponentType.ORDER_SUMMARY]: ecommerceGenerators.generateRNOrderSummary,
  [ComponentType.ORDER_CONFIRMATION]: ecommerceGenerators.generateRNOrderConfirmation,
  [ComponentType.ORDER_TRACKING]: ecommerceGenerators.generateRNOrderTracking,
  [ComponentType.ORDER_REVIEW]: ecommerceGenerators.generateRNOrderReview,
  [ComponentType.ORDER_DETAILS_VIEW]: ecommerceGenerators.generateRNOrderDetailsView,
  [ComponentType.WISHLIST]: ecommerceGenerators.generateRNWishlist,
  [ComponentType.RECENTLY_VIEWED]: ecommerceGenerators.generateRNRecentlyViewed,
  [ComponentType.RELATED_PRODUCTS_SECTION]: ecommerceGenerators.generateRNRelatedProductsSection,
  [ComponentType.INVENTORY_STATUS]: ecommerceGenerators.generateRNInventoryStatus,
  [ComponentType.PRICING_TABLE_TWO]: ecommerceGenerators.generateRNPricingTableTwo,
  [ComponentType.PRICING_TABLE_THREE]: ecommerceGenerators.generateRNPricingTableThree,
  [ComponentType.PRICING_TABLE_MULTI]: ecommerceGenerators.generateRNPricingTableMulti,
  [ComponentType.PAYMENT_HISTORY]: ecommerceGenerators.generateRNPaymentHistory,
  [ComponentType.INVOICE_DISPLAY]: ecommerceGenerators.generateRNInvoiceDisplay,
  [ComponentType.RECEIPT_GENERATOR]: ecommerceGenerators.generateRNReceiptGenerator,
  [ComponentType.REVIEW_SUMMARY]: ecommerceGenerators.generateRNReviewSummary,
  [ComponentType.TRUST_BADGES_SECTION]: ecommerceGenerators.generateRNTrustBadgesSection,
  [ComponentType.COMPANY_CARD_GRID]: ecommerceGenerators.generateRNCompanyCardGrid,
  [ComponentType.COMPANY_DETAIL_PAGE]: ecommerceGenerators.generateRNCompanyDetailPage,
  [ComponentType.JOB_DETAIL_PAGE]: ecommerceGenerators.generateRNJobDetailPage,

  // ============================================================================
  // BLOG & CONTENT
  // ============================================================================
  [ComponentType.BLOG_CARD]: blogGenerators.generateRNBlogCard,
  [ComponentType.FEATURED_BLOG_POST]: blogGenerators.generateRNFeaturedBlogPost,
  [ComponentType.BLOG_GRID]: blogGenerators.generateRNBlogGrid,
  [ComponentType.BLOG_GRID_LAYOUT]: blogGenerators.generateRNBlogGridLayout,
  [ComponentType.BLOG_LIST]: blogGenerators.generateRNBlogList,
  [ComponentType.BLOG_LIST_LAYOUT]: blogGenerators.generateRNBlogListLayout,
  [ComponentType.BLOG_MASONRY_LAYOUT]: blogGenerators.generateRNBlogMasonryLayout,
  [ComponentType.BLOG_POST_CONTENT]: blogGenerators.generateRNBlogPostContent,
  [ComponentType.BLOG_POST_HEADER]: blogGenerators.generateRNBlogPostHeader,
  [ComponentType.BLOG_SIDEBAR]: blogGenerators.generateRNBlogSidebar,
  [ComponentType.BLOG_SEARCH_BAR]: blogGenerators.generateRNBlogSearchBar,
  [ComponentType.BLOG_TABLE_OF_CONTENTS]: blogGenerators.generateRNBlogTableOfContents,
  [ComponentType.COMMENT_SECTION]: blogGenerators.generateRNCommentSection,
  [ComponentType.COMMENT_THREAD]: blogGenerators.generateRNCommentThread,
  [ComponentType.RELATED_ARTICLES]: blogGenerators.generateRNRelatedArticles,
  [ComponentType.CATEGORIES_WIDGET]: blogGenerators.generateRNCategoriesWidget,
  [ComponentType.AUTHOR_BIO]: blogGenerators.generateRNAuthorBio,
  [ComponentType.ARTICLE_PAGINATION]: blogGenerators.generateRNArticlePagination,
  [ComponentType.TAG_CLOUD_WIDGET]: blogGenerators.generateRNTagCloudWidget,
  [ComponentType.POPULAR_POSTS_WIDGET]: blogGenerators.generateRNPopularPostsWidget,
  [ComponentType.READING_PROGRESS_BAR]: blogGenerators.generateRNReadingProgressBar,
  [ComponentType.ARCHIVE_WIDGET]: blogGenerators.generateRNArchiveWidget,

  // ============================================================================
  // COMMON / HERO / CTA
  // ============================================================================
  [ComponentType.HERO_SECTION]: commonGenerators.generateRNHeroSection,
  [ComponentType.HERO_CENTERED]: commonGenerators.generateRNHeroCentered,
  [ComponentType.HERO_SPLIT]: commonGenerators.generateRNHeroSplit,
  [ComponentType.HERO_VIDEO_BG]: commonGenerators.generateRNHeroVideoBg,
  [ComponentType.CTA_BLOCK]: commonGenerators.generateRNCtaBlock,
  [ComponentType.CTA_SECTION_CENTERED]: commonGenerators.generateRNCtaSectionCentered,
  [ComponentType.CTA_SECTION_WITH_IMAGE]: commonGenerators.generateRNCtaSectionWithImage,
  [ComponentType.CARD]: commonGenerators.generateRNCard,
  [ComponentType.FEATURE_SHOWCASE_GRID]: commonGenerators.generateRNFeatureShowcaseGrid,
  [ComponentType.FEATURE_SHOWCASE_ALTERNATING]: commonGenerators.generateRNFeatureShowcaseAlternating,
  [ComponentType.TESTIMONIAL_SLIDER]: commonGenerators.generateRNTestimonialSlider,
  [ComponentType.TESTIMONIAL_GRID]: commonGenerators.generateRNTestimonialGrid,
  [ComponentType.PARTNER_CLIENT_LOGOS]: commonGenerators.generateRNPartnerClientLogos,
  [ComponentType.PRESS_MENTIONS]: commonGenerators.generateRNPressMentions,
  [ComponentType.AWARDS_SHOWCASE]: commonGenerators.generateRNAwardsShowcase,
  [ComponentType.CASE_STUDY_CARDS]: commonGenerators.generateRNCaseStudyCards,
  [ComponentType.PROMOTIONAL_BANNER_TOP]: commonGenerators.generateRNPromotionalBannerTop,
  [ComponentType.ANNOUNCEMENT_BAR]: commonGenerators.generateRNAnnouncementBar,
  [ComponentType.DETAIL_PAGE_HEADER]: commonGenerators.generateRNDetailPageHeader,

  // ============================================================================
  // MEDIA
  // ============================================================================
  [ComponentType.IMAGE_GALLERY_GRID]: mediaGenerators.generateRNImageGalleryGrid,
  [ComponentType.IMAGE_GALLERY_MASONRY]: mediaGenerators.generateRNImageGalleryMasonry,
  [ComponentType.THUMBNAIL_GALLERY]: mediaGenerators.generateRNThumbnailGallery,
  [ComponentType.IMAGE_ZOOM_HOVER]: mediaGenerators.generateRNImageZoomHover,
  [ComponentType.IMAGE_ZOOM_CLICK]: mediaGenerators.generateRNImageZoomClick,
  [ComponentType.BEFORE_AFTER_SLIDER]: mediaGenerators.generateRNBeforeAfterSlider,
  [ComponentType.MEDIA_CAROUSEL]: mediaGenerators.generateRNMediaCarousel,
  [ComponentType.VIDEO_PLAYER_EMBEDDED]: mediaGenerators.generateRNVideoPlayerEmbedded,
  [ComponentType.VIDEO_PLAYER_CUSTOM]: mediaGenerators.generateRNVideoPlayerCustom,
  [ComponentType.AUDIO_PLAYER]: mediaGenerators.generateRNAudioPlayer,
  [ComponentType.VIDEO_THUMBNAIL_GRID]: mediaGenerators.generateRNVideoThumbnailGrid,
  [ComponentType.CUSTOMER_REVIEWS_CAROUSEL]: mediaGenerators.generateRNCustomerReviewsCarousel,
  [ComponentType.PLAYLIST_INTERFACE]: mediaGenerators.generateRNPlaylistInterface,
  [ComponentType.TRACK_DETAIL_PAGE]: mediaGenerators.generateRNTrackDetailPage,

  // ============================================================================
  // USER / PROFILE
  // ============================================================================
  [ComponentType.PROFILE_CARD]: userGenerators.generateRNProfileCard,
  [ComponentType.USER_PROFILE]: userGenerators.generateRNUserProfile,
  [ComponentType.USER_PROFILE_VIEW]: userGenerators.generateRNUserProfileView,
  [ComponentType.USER_PROFILE_CARD_MINI]: userGenerators.generateRNUserProfileCardMini,
  [ComponentType.ACCOUNT_SETTINGS]: userGenerators.generateRNAccountSettings,
  [ComponentType.AVATAR_UPLOAD]: userGenerators.generateRNAvatarUpload,
  [ComponentType.TEAM_MEMBERS_GRID]: userGenerators.generateRNTeamMembersGrid,
  [ComponentType.ROLE_MANAGEMENT]: userGenerators.generateRNRoleManagement,
  [ComponentType.API_KEY_MANAGEMENT]: userGenerators.generateRNApiKeyManagement,
  [ComponentType.USAGE_METRICS_DISPLAY]: userGenerators.generateRNUsageMetricsDisplay,
  [ComponentType.VERSION_HISTORY]: userGenerators.generateRNVersionHistory,
  [ComponentType.SETTINGS_PANEL_ADMIN]: userGenerators.generateRNSettingsPanelAdmin,
  [ComponentType.SYSTEM_NOTIFICATIONS_USER]: userGenerators.generateRNSystemNotificationsUser,
  [ComponentType.RESUME_MANAGER]: userGenerators.generateRNResumeManager,
  [ComponentType.LOGS_VIEWER]: userGenerators.generateRNLogsViewer,

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  [ComponentType.LOGIN_MODAL]: authGenerators.generateRNLoginModal,
  [ComponentType.SOCIAL_LOGIN]: authGenerators.generateRNSocialLogin,
  [ComponentType.PASSWORD_RESET]: authGenerators.generateRNPasswordReset,
  [ComponentType.EMAIL_VERIFICATION]: authGenerators.generateRNEmailVerification,
  [ComponentType.TWO_FACTOR_AUTH]: authGenerators.generateRNTwoFactorAuth,
  [ComponentType.SESSION_TIMEOUT_WARNING]: authGenerators.generateRNSessionTimeoutWarning,
  [ComponentType.ACCESS_DENIED_PAGE]: authGenerators.generateRNAccessDeniedPage,
  [ComponentType.AGE_VERIFICATION_MODAL]: authGenerators.generateRNAgeVerificationModal,
  [ComponentType.DELETE_ACCOUNT_CONFIRMATION]: authGenerators.generateRNDeleteAccountConfirmation,

  // ============================================================================
  // MODALS & DIALOGS
  // ============================================================================
  [ComponentType.MODAL_DIALOG]: modalsGenerators.generateRNModalDialog,
  [ComponentType.CONFIRMATION_DIALOG]: modalsGenerators.generateRNConfirmationDialog,
  [ComponentType.LIGHTBOX_MODAL_VIEWER]: modalsGenerators.generateRNLightboxModalViewer,
  [ComponentType.EXIT_INTENT_POPUP]: modalsGenerators.generateRNExitIntentPopup,

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  [ComponentType.TOAST_NOTIFICATION]: widgetsGenerators.generateRNToastNotification,
  [ComponentType.NOTIFICATION_LIST]: widgetsGenerators.generateRNNotificationList,
  [ComponentType.NOTIFICATION_CENTER_PANEL]: widgetsGenerators.generateRNNotificationCenterPanel,
  [ComponentType.ALERT_BANNER]: widgetsGenerators.generateRNAlertBanner,
  [ComponentType.SYSTEM_NOTIFICATIONS]: widgetsGenerators.generateRNSystemNotifications,
  [ComponentType.PUSH_NOTIFICATION_PROMPT]: widgetsGenerators.generateRNPushNotificationPrompt,
  [ComponentType.NOTIFICATION_DROPDOWN_SOCIAL]: socialGenerators.generateRNNotificationDropdownSocial,

  // ============================================================================
  // SOCIAL
  // ============================================================================
  [ComponentType.POST_COMPOSER]: socialGenerators.generateRNPostComposer,
  [ComponentType.SOCIAL_POST_CARD]: socialGenerators.generateRNSocialPostCard,
  [ComponentType.SOCIAL_MEDIA_FEED]: socialGenerators.generateRNSocialMediaFeed,
  [ComponentType.ACTIVITY_FEED]: socialGenerators.generateRNActivityFeed,
  [ComponentType.ACTIVITY_TIMELINE_SOCIAL]: socialGenerators.generateRNActivityTimelineSocial,
  [ComponentType.LIKE_REACTION_BUTTONS]: socialGenerators.generateRNLikeReactionButtons,
  [ComponentType.SHARE_BUTTONS]: socialGenerators.generateRNShareButtons,
  [ComponentType.SHARE_MODAL_SOCIAL]: socialGenerators.generateRNShareModalSocial,
  [ComponentType.FOLLOW_UNFOLLOW_BUTTON]: socialGenerators.generateRNFollowUnfollowButton,
  [ComponentType.FRIEND_CONNECTION_LIST]: socialGenerators.generateRNFriendConnectionList,
  [ComponentType.DIRECT_MESSAGING_LIST]: socialGenerators.generateRNDirectMessagingList,
  [ComponentType.DIRECT_MESSAGING_THREAD]: socialGenerators.generateRNDirectMessagingThread,
  [ComponentType.GROUP_CHAT_INTERFACE]: socialGenerators.generateRNGroupChatInterface,
  [ComponentType.MENTIONS_TAGS_SYSTEM]: socialGenerators.generateRNMentionsTagsSystem,
  [ComponentType.HASHTAG_DISPLAY]: socialGenerators.generateRNHashtagDisplay,

  // ============================================================================
  // HELP & SUPPORT
  // ============================================================================
  [ComponentType.HELP_CENTER_HOME]: helpGenerators.generateRNHelpCenterHome,
  [ComponentType.HELP_ARTICLE_PAGE]: helpGenerators.generateRNHelpArticlePage,
  [ComponentType.ARTICLE_SEARCH_HELP]: helpGenerators.generateRNArticleSearchHelp,
  [ComponentType.FAQ_ACCORDION_SIMPLE]: helpGenerators.generateRNFaqAccordionSimple,
  [ComponentType.FAQ_ACCORDION_CATEGORIZED]: helpGenerators.generateRNFaqAccordionCategorized,
  [ComponentType.FAQ_SEARCH]: helpGenerators.generateRNFaqSearch,
  [ComponentType.KNOWLEDGE_BASE_CATEGORIES]: helpGenerators.generateRNKnowledgeBaseCategories,
  [ComponentType.DOCUMENTATION_VIEWER]: helpGenerators.generateRNDocumentationViewer,
  [ComponentType.VIDEO_TUTORIALS_GALLERY]: helpGenerators.generateRNVideoTutorialsGallery,
  [ComponentType.TUTORIAL_WALKTHROUGH]: helpGenerators.generateRNTutorialWalkthrough,
  [ComponentType.GUIDED_TOUR_WALKTHROUGH]: helpGenerators.generateRNGuidedTourWalkthrough,
  [ComponentType.TROUBLESHOOTING_WIZARD]: helpGenerators.generateRNTroubleshootingWizard,
  [ComponentType.SUPPORT_TICKET_LIST_HELP]: helpGenerators.generateRNSupportTicketListHelp,
  [ComponentType.SUPPORT_TICKET_DETAIL_HELP]: helpGenerators.generateRNSupportTicketDetailHelp,
  [ComponentType.LIVE_CHAT_WIDGET_HELP]: helpGenerators.generateRNLiveChatWidgetHelp,
  [ComponentType.REVIEW_HELPFUL_VOTING]: helpGenerators.generateRNReviewHelpfulVoting,
  [ComponentType.HELP_SIDEBAR_CONTEXTUAL]: helpGenerators.generateRNHelpSidebarContextual,
  [ComponentType.CHANGELOG_DISPLAY]: helpGenerators.generateRNChangelogDisplay,

  // ============================================================================
  // ERROR PAGES
  // ============================================================================
  [ComponentType.ERROR_404]: errorGenerators.generateRNError404,
  [ComponentType.ERROR_404_PAGE]: errorGenerators.generateRNError404Page,
  [ComponentType.ERROR_500]: errorGenerators.generateRNError500,
  [ComponentType.ERROR_500_PAGE]: errorGenerators.generateRNError500Page,
  [ComponentType.ERROR_MESSAGE]: errorGenerators.generateRNErrorMessage,
  [ComponentType.COMING_SOON_PAGE]: errorGenerators.generateRNComingSoonPage,
  [ComponentType.MAINTENANCE_MODE_PAGE]: errorGenerators.generateRNMaintenanceModePage,

  // ============================================================================
  // LEGAL / CONTENT PAGES
  // ============================================================================
  [ComponentType.ABOUT_PAGE]: legalGenerators.generateRNAboutPage,
  [ComponentType.ABOUT_PAGE_CONTENT]: legalGenerators.generateRNAboutPageContent,
  [ComponentType.CONTACT_PAGE]: legalGenerators.generateRNContactPage,
  [ComponentType.CONTACT_PAGE_CONTENT]: legalGenerators.generateRNContactPageContent,
  [ComponentType.LEGAL_PAGE]: legalGenerators.generateRNLegalPage,
  [ComponentType.LEGAL_PAGE_CONTENT]: legalGenerators.generateRNLegalPageContent,
  [ComponentType.SITEMAP_CONTENT]: legalGenerators.generateRNSitemapContent,

  // ============================================================================
  // WIDGETS & UTILITIES
  // ============================================================================
  [ComponentType.CALENDAR]: widgetsGenerators.generateRNCalendar,
  [ComponentType.CALENDAR_EVENT]: widgetsGenerators.generateRNCalendarEvent,
  [ComponentType.KANBAN_BOARD]: widgetsGenerators.generateRNKanbanBoard,
  [ComponentType.WHITEBOARD_INTERFACE]: widgetsGenerators.generateRNWhiteboardInterface,
  [ComponentType.DRAWING_CANVAS]: widgetsGenerators.generateRNDrawingCanvas,
  [ComponentType.INTERACTIVE_DEMO]: widgetsGenerators.generateRNInteractiveDemo,
  [ComponentType.QR_CODE_GENERATOR]: widgetsGenerators.generateRNQrCodeGenerator,
  [ComponentType.QR_CODE_SCANNER]: widgetsGenerators.generateRNQrCodeScanner,
  [ComponentType.QR_SCANNER]: widgetsGenerators.generateRNQrScanner,
  [ComponentType.PROGRESS_INDICATOR_LINEAR]: widgetsGenerators.generateRNProgressIndicatorLinear,
  [ComponentType.PROGRESS_INDICATOR_CIRCULAR]: widgetsGenerators.generateRNProgressIndicatorCircular,
  [ComponentType.ROADMAP_TIMELINE]: widgetsGenerators.generateRNRoadmapTimeline,
  [ComponentType.STATUS_BADGE]: widgetsGenerators.generateRNStatusBadge,
  [ComponentType.TOOLTIP_SYSTEM]: widgetsGenerators.generateRNTooltipSystem,
  [ComponentType.SKELETON_SCREEN]: widgetsGenerators.generateRNSkeletonScreen,
  [ComponentType.LOADING_STATE_SPINNER]: widgetsGenerators.generateRNLoadingStateSpinner,
  [ComponentType.EMPTY_STATE_NO_DATA]: widgetsGenerators.generateRNEmptyStateNoData,
  [ComponentType.SEARCH_RESULTS_PAGE]: widgetsGenerators.generateRNSearchResultsPage,
  [ComponentType.SEARCH_BAR]: formsGenerators.generateRNSearchBar,
  [ComponentType.THEME_TOGGLE]: widgetsGenerators.generateRNThemeToggle,
  [ComponentType.COOKIE_CONSENT_SIMPLE]: widgetsGenerators.generateRNCookieConsentSimple,
  [ComponentType.COOKIE_CONSENT_DETAILED]: widgetsGenerators.generateRNCookieConsentDetailed,
  [ComponentType.FONT_SIZE_ADJUSTER]: widgetsGenerators.generateRNFontSizeAdjuster,
  [ComponentType.HIGH_CONTRAST_MODE]: widgetsGenerators.generateRNHighContrastMode,
  [ComponentType.SCREEN_READER_ANNOUNCEMENTS]: widgetsGenerators.generateRNScreenReaderAnnouncements,
  [ComponentType.SKIP_NAVIGATION]: widgetsGenerators.generateRNSkipNavigation,
  [ComponentType.ACCESSIBILITY_MENU]: widgetsGenerators.generateRNAccessibilityMenu,
  [ComponentType.CONNECTION_LOST_BANNER]: widgetsGenerators.generateRNConnectionLostBanner,
  [ComponentType.OFFLINE_MODE_INTERFACE]: widgetsGenerators.generateRNOfflineModeInterface,
  [ComponentType.STATUS_PAGE_SERVICE]: widgetsGenerators.generateRNStatusPageService,
  [ComponentType.SUCCESS_MESSAGE]: widgetsGenerators.generateRNSuccessMessage,
  [ComponentType.NO_RESULTS_FOUND]: widgetsGenerators.generateRNNoResultsFound,
  [ComponentType.ONBOARDING_FLOW]: widgetsGenerators.generateRNOnboardingFlow,
  [ComponentType.EXPORT_DATA_INTERFACE]: widgetsGenerators.generateRNExportDataInterface,
  [ComponentType.DATABASE_MANAGEMENT]: widgetsGenerators.generateRNDatabaseManagement,
  [ComponentType.CHATBOT_SUPPORT]: widgetsGenerators.generateRNChatbotSupport,
  [ComponentType.PAYMENT_METHOD]: ecommerceGenerators.generateRNPaymentMethod,

  // ============================================================================
  // TRAVEL
  // ============================================================================
  [ComponentType.TRAVEL_HERO]: travelGenerators.generateRNTravelHero,
  [ComponentType.TRAVEL_DESTINATIONS_GRID]: travelGenerators.generateRNTravelDestinationsGrid,
  [ComponentType.TRAVEL_DESTINATION_DETAIL_PAGE]: travelGenerators.generateRNTravelDestinationDetailPage,
  [ComponentType.TRAVEL_HOTELS_GRID]: travelGenerators.generateRNTravelHotelsGrid,
  [ComponentType.TRAVEL_HOTEL_DETAIL_PAGE]: travelGenerators.generateRNTravelHotelDetailPage,
  [ComponentType.TRAVEL_FLIGHTS_GRID]: travelGenerators.generateRNTravelFlightsGrid,
  [ComponentType.TRAVEL_FLIGHTS_LIST]: travelGenerators.generateRNTravelFlightsList,
  [ComponentType.TRAVEL_FLIGHT_DETAIL_PAGE]: travelGenerators.generateRNTravelFlightDetailPage,
  [ComponentType.TRAVEL_TOUR_PACKAGES_GRID]: travelGenerators.generateRNTravelTourPackagesGrid,
  [ComponentType.TRAVEL_TOUR_DETAIL_PAGE]: travelGenerators.generateRNTravelTourDetailPage,
  [ComponentType.TRAVEL_BOOKING_CONFIRMATION_PAGE]: travelGenerators.generateRNTravelBookingConfirmationPage,
  [ComponentType.TRAVEL_DASHBOARD_PAGE]: travelGenerators.generateRNTravelDashboardPage,
  [ComponentType.TRAVEL_SEARCH_BAR]: travelGenerators.generateRNTravelSearchBar,

  // ============================================================================
  // HEALTHCARE
  // ============================================================================
  [ComponentType.PATIENT_CARD]: healthcareGenerators.generateRNPatientCard,
  [ComponentType.APPOINTMENT_SCHEDULER]: healthcareGenerators.generateRNAppointmentScheduler,
  [ComponentType.MEDICAL_RECORD_VIEW]: healthcareGenerators.generateRNMedicalRecordView,
  [ComponentType.PRESCRIPTION_LIST]: healthcareGenerators.generateRNPrescriptionList,

  // ============================================================================
  // BUDGET & EXPENSE
  // ============================================================================
  [ComponentType.EXPENSE_LIST]: budgetGenerators.generateRNExpenseList,
  [ComponentType.EXPENSE_CARD]: budgetGenerators.generateRNExpenseCard,
  [ComponentType.TRANSACTION_HISTORY]: budgetGenerators.generateRNTransactionHistory,
  [ComponentType.CATEGORY_SPENDING]: budgetGenerators.generateRNCategorySpending,
  [ComponentType.BUDGET_PROGRESS_CARD]: budgetGenerators.generateRNBudgetProgressCard,
  [ComponentType.BUDGET_OVERVIEW]: budgetGenerators.generateRNBudgetOverview,
  [ComponentType.FINANCIAL_GOAL_CARD]: budgetGenerators.generateRNFinancialGoalCard,

  // ============================================================================
  // FOOD
  // ============================================================================
  [ComponentType.RESTAURANT_DETAIL_HEADER]: foodGenerators.generateRNRestaurantDetailHeader,

  // ============================================================================
  // EDUCATION & LEARNING
  // ============================================================================
  [ComponentType.COURSE_MODULES_LIST]: widgetsGenerators.generateRNCourseModulesList,

  // ============================================================================
  // FITNESS & GYM
  // ============================================================================
  [ComponentType.TRAINER_GRID]: widgetsGenerators.generateRNTrainerGrid,
  [ComponentType.CLASS_SCHEDULE_GRID]: widgetsGenerators.generateRNClassScheduleGrid,
  [ComponentType.CLASS_DETAIL_VIEW]: fitnessGenerators.generateRNClassDetailView,

  // ============================================================================
  // CALENDAR & EVENTS
  // ============================================================================
  [ComponentType.COUNTDOWN_TIMER_EVENT]: widgetsGenerators.generateRNCountdownTimerEvent,
  [ComponentType.COUNTDOWN_TIMER_OFFER]: widgetsGenerators.generateRNCountdownTimerOffer,

  // ============================================================================
  // EVENT TICKETING
  // ============================================================================
  [ComponentType.EVENT_GRID]: widgetsGenerators.generateRNEventGrid,
  [ComponentType.EVENT_CARD]: widgetsGenerators.generateRNEventCard,
  [ComponentType.EVENT_DETAIL_PAGE]: widgetsGenerators.generateRNEventDetailPage,
  [ComponentType.TICKET_SELECTOR]: widgetsGenerators.generateRNTicketSelector,
  [ComponentType.TICKET_LIST]: widgetsGenerators.generateRNTicketList,
  [ComponentType.TICKET_DETAIL_VIEW]: widgetsGenerators.generateRNTicketDetailView,
  [ComponentType.TICKET_CARD]: widgetsGenerators.generateRNTicketCard,

  // ============================================================================
  // HERO & LANDING (additional mappings)
  // ============================================================================
  [ComponentType.HERO_FULL_WIDTH]: widgetsGenerators.generateRNHeroFullWidth,
  [ComponentType.HERO_SPLIT_LAYOUT]: widgetsGenerators.generateRNHeroSplitLayout,

  // ============================================================================
  // REAL ESTATE & PROPERTY
  // ============================================================================
  [ComponentType.PROPERTY_CARD]: widgetsGenerators.generateRNPropertyCard,
  [ComponentType.PROPERTY_SEARCH]: widgetsGenerators.generateRNPropertySearch,

  // ============================================================================
  // AUTOMOTIVE
  // ============================================================================
  [ComponentType.VEHICLE_CARD]: widgetsGenerators.generateRNVehicleCard,
  [ComponentType.SERVICE_BOOKING]: widgetsGenerators.generateRNServiceBooking,

  // ============================================================================
  // BOOKING & SCHEDULING
  // ============================================================================
  [ComponentType.TIME_SLOT_PICKER]: widgetsGenerators.generateRNTimeSlotPicker,
  [ComponentType.BOOKING_SUMMARY]: widgetsGenerators.generateRNBookingSummary,

  // ============================================================================
  // PET CARE
  // ============================================================================
  [ComponentType.PET_PROFILE_CARD]: widgetsGenerators.generateRNPetProfileCard,
  [ComponentType.PET_SERVICE_CARD]: widgetsGenerators.generateRNPetServiceCard,
};

/**
 * Get a React Native component generator by type
 * Falls back to placeholder if not implemented
 */
export function getRNComponentGenerator(type: ComponentType): RNComponentGenerator {
  const generator = RN_COMPONENT_REGISTRY[type];
  if (generator) {
    return generator;
  }
  // Create a meaningful placeholder for unimplemented components
  const componentName = type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return createPlaceholder(componentName);
}

/**
 * Check if a component type has a React Native implementation
 */
export function hasRNImplementation(type: ComponentType): boolean {
  return RN_COMPONENT_REGISTRY[type] !== undefined;
}
