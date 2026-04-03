/**
 * Social Components (React Native)
 *
 * This module exports all social component generators for React Native apps.
 */

// Profile components
export {
  generateProfileHeader,
  generateProfileTabs,
  generateUserGrid,
  type ProfileOptions,
} from './profile.generator';

// Posts components
export {
  generatePostComposer,
  generatePostFeed,
  generateCommentSection,
  type PostsOptions,
} from './posts.generator';

// Messaging components
export {
  generateMessageList,
  generateChatInterface,
  generateNotificationList,
  type MessagingOptions,
} from './messaging.generator';
