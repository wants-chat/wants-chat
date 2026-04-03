/**
 * Forum Components (React Native)
 *
 * This module exports all forum component generators for React Native apps.
 */

// Category components
export {
  generateForumCategories,
  generateCategoryCard,
  type ForumCategoryOptions,
} from './category.generator';

// Thread components
export {
  generateThreadList,
  generateThreadDetail,
  generateCreateThread,
  type ThreadOptions,
} from './thread.generator';

// Post components
export {
  generatePostList,
  generatePostEditor,
  generatePostReply,
  type PostOptions,
} from './post.generator';

// Member components
export {
  generateMemberList,
  generateMemberProfile,
  generateLeaderboard,
  type MemberOptions,
} from './member.generator';

// Header components
export {
  generateForumHeader,
  generateForumSidebar,
  generateSubforumList,
  generateAnnouncementList,
  type HeaderOptions,
} from './header.generator';

// Search components
export {
  generateSearchFilters,
  generateSearchResults,
  generateMemberSearch,
  type SearchOptions,
} from './search.generator';

// Profile components
export {
  generateProfileStats,
  generateBadgeList,
  generateMemberProfileCard,
  type ProfileOptions,
} from './profile.generator';

// Group components
export {
  generateGroupList,
  generateGroupCard,
  generateGroupDetail,
  type GroupOptions,
} from './group.generator';
