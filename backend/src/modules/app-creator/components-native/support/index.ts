/**
 * Support Components (React Native)
 *
 * This module exports all support component generators for React Native apps.
 */

// Knowledge Base components
export {
  generateKnowledgeBase,
  generateArticleList,
  generateArticleDetail,
  type KnowledgeBaseOptions,
} from './knowledge-base.generator';

// Ticket components
export {
  generateTicketList,
  generateTicketDetail,
  generateTicketForm,
  type TicketOptions,
} from './ticket.generator';

// FAQ components
export {
  generateFaqSection,
  generateFaqCategories,
  type FaqOptions,
} from './faq.generator';

// Live Chat components
export {
  generateLiveChat,
  generateChatWidget,
  type LiveChatOptions,
} from './live-chat.generator';

// Article components
export {
  generateArticleContent,
  generateArticleFeedback,
  generateArticleSidebar,
  generateRelatedArticles,
  type ArticleOptions,
} from './article.generator';

// KB components
export {
  generateKBSearch,
  generateKBCategories,
  generateKBSidebar,
  type KBOptions,
} from './kb.generator';

// Ticket Agent components
export {
  generateTicketFilters,
  generateTicketInfo,
  generateTicketConversation,
  generateAgentReplyForm,
  generateTicketReplies,
  generateReplyForm,
  type TicketAgentOptions,
} from './ticket-agent.generator';
