/**
 * Support Component Generators Index
 */

export { generateKnowledgeBase, generateArticleList, generateArticleDetail, type KnowledgeBaseOptions } from './knowledge-base.generator';
export { generateTicketList, generateTicketDetail, generateTicketForm, type TicketOptions as SupportTicketOptions } from './ticket.generator';
export { generateFaqSection, generateFaqCategories, type FaqOptions } from './faq.generator';
export { generateLiveChat, generateChatWidget, type LiveChatOptions } from './live-chat.generator';

// Article components
export {
  generateArticleContent,
  generateArticleFeedback,
  generateArticleSidebar,
  generateRelatedArticles,
  type ArticleOptions,
} from './article.generator';

// Knowledge Base components
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
