import { Injectable, Logger } from '@nestjs/common';
import { AiService, TextGenerationOptions } from './ai.service';

// Content type definitions for all 50 writing use cases
export type ContentType =
  // Writing & Content (1-50)
  | 'email'
  | 'essay'
  | 'blog-post'
  | 'social-caption'
  | 'product-description'
  | 'resume'
  | 'cover-letter'
  | 'linkedin-post'
  | 'tweet'
  | 'youtube-description'
  | 'ad-copy'
  | 'headline'
  | 'slogan'
  | 'tagline'
  | 'bio'
  | 'thank-you-note'
  | 'apology-letter'
  | 'invitation'
  | 'announcement'
  | 'press-release'
  | 'newsletter'
  | 'speech'
  | 'presentation-script'
  | 'video-script'
  | 'podcast-script'
  | 'story'
  | 'poetry'
  | 'song-lyrics'
  | 'book-summary'
  | 'article-summary'
  | 'meeting-notes'
  | 'report'
  | 'proposal'
  | 'contract'
  | 'terms-of-service'
  | 'privacy-policy'
  | 'faq'
  | 'how-to-guide'
  | 'tutorial'
  | 'recipe'
  | 'review'
  | 'testimonial'
  | 'case-study'
  | 'white-paper'
  | 'ebook-outline'
  | 'course-content'
  | 'quiz-questions'
  | 'survey-questions'
  | 'interview-questions'
  | 'conversation-starters'
  // Additional content types
  | 'paraphrase'
  | 'translate'
  | 'grammar-check'
  | 'joke'
  | 'business-plan';

export interface ContentGenerationRequest {
  type: ContentType;
  prompt: string;
  parameters?: Record<string, any>;
}

export interface ContentGenerationResponse {
  content: string;
  type: ContentType;
  metadata?: Record<string, any>;
}

// System prompts for each content type
const SYSTEM_PROMPTS: Record<ContentType, string> = {
  // Writing & Communication
  'email': 'You are an expert email writer who creates clear, professional, and effective emails. Write emails that are appropriate for the tone and recipient specified.',
  'essay': 'You are an expert academic and essay writer. Write well-structured essays with clear thesis statements, supporting arguments, and logical conclusions.',
  'blog-post': 'You are an expert blog writer and content strategist. Create engaging, SEO-optimized blog posts with compelling headlines and structured content.',
  'social-caption': 'You are a social media expert who creates engaging, platform-optimized captions. Include relevant hashtags and calls-to-action when appropriate.',
  'product-description': 'You are an e-commerce copywriter who creates compelling product descriptions that drive conversions. Highlight benefits, features, and unique selling points.',
  'resume': 'You are a professional resume writer. Create ATS-friendly resumes that highlight achievements and skills effectively.',
  'cover-letter': 'You are an expert at writing compelling cover letters that showcase candidates\' qualifications and enthusiasm for the role.',
  'linkedin-post': 'You are a LinkedIn content strategist. Create professional, engaging posts that drive engagement and establish thought leadership.',
  'tweet': 'You are a Twitter/X content expert. Create concise, engaging tweets that maximize engagement within character limits.',
  'youtube-description': 'You are a YouTube SEO expert. Write optimized video descriptions with keywords, timestamps, and calls-to-action.',
  'ad-copy': 'You are an advertising copywriter. Create compelling ad copy that drives clicks and conversions across different platforms.',
  'headline': 'You are a headline specialist. Create attention-grabbing headlines that drive clicks while accurately representing content.',
  'slogan': 'You are a brand strategist specializing in slogans. Create memorable, impactful slogans that capture brand essence.',
  'tagline': 'You are a brand messaging expert. Create concise, memorable taglines that communicate brand value propositions.',
  'bio': 'You are a professional bio writer. Create compelling bios that highlight achievements and personality appropriately for the context.',
  'thank-you-note': 'You are an expert at writing sincere, thoughtful thank you notes that leave lasting positive impressions.',
  'apology-letter': 'You are skilled at writing sincere apology letters that acknowledge mistakes and propose solutions.',
  'invitation': 'You are an expert at creating warm, engaging invitations for various events and occasions.',
  'announcement': 'You are a communications specialist. Create clear, engaging announcements that effectively convey important information.',
  'press-release': 'You are a PR professional. Write newsworthy press releases following AP style and industry best practices.',
  'newsletter': 'You are a newsletter specialist. Create engaging newsletters with compelling subject lines and valuable content.',
  'speech': 'You are a speechwriter. Create compelling speeches with strong openings, clear messages, and memorable closings.',
  'presentation-script': 'You are a presentation expert. Create engaging scripts that work well with visual slides and maintain audience attention.',
  'video-script': 'You are a video script writer. Create engaging scripts optimized for video format with clear pacing and hooks.',
  'podcast-script': 'You are a podcast script writer. Create conversational, engaging scripts suitable for audio format.',

  // Creative Writing
  'story': 'You are a creative fiction writer. Create engaging stories with compelling characters, plots, and settings.',
  'poetry': 'You are a poet skilled in various forms and styles. Create evocative poetry that resonates emotionally.',
  'song-lyrics': 'You are a songwriter. Create lyrics with strong rhythm, rhyme, and emotional resonance.',
  'joke': 'You are a comedy writer. Create clever, appropriate jokes that land well with the intended audience.',

  // Summarization & Analysis
  'book-summary': 'You are an expert at summarizing books. Create concise summaries that capture key themes, arguments, and insights.',
  'article-summary': 'You are skilled at summarizing articles. Create clear, concise summaries that capture essential information.',
  'meeting-notes': 'You are an expert at organizing meeting notes. Transform raw notes into clear, actionable summaries with key decisions and action items.',

  // Business Documents
  'report': 'You are a business report writer. Create clear, professional reports with executive summaries and detailed analysis.',
  'proposal': 'You are a proposal writer. Create compelling business proposals that clearly communicate value propositions.',
  'contract': 'You are a legal document specialist. Draft clear, comprehensive contract language. Note: Always recommend legal review.',
  'terms-of-service': 'You are a legal document specialist. Create comprehensive terms of service. Note: Always recommend legal review.',
  'privacy-policy': 'You are a privacy policy specialist. Create comprehensive, compliant privacy policies. Note: Always recommend legal review.',
  'business-plan': 'You are a business planning expert. Create comprehensive business plans with market analysis and financial projections.',
  'case-study': 'You are a case study writer. Create compelling case studies that demonstrate value through real-world results.',
  'white-paper': 'You are a technical writer. Create authoritative white papers that establish thought leadership.',

  // Educational Content
  'faq': 'You are an FAQ specialist. Create clear, comprehensive FAQs that anticipate and answer common questions.',
  'how-to-guide': 'You are a technical writer. Create clear, step-by-step guides that help users accomplish tasks.',
  'tutorial': 'You are an educational content creator. Create engaging tutorials with clear instructions and examples.',
  'recipe': 'You are a recipe writer. Create clear, detailed recipes with ingredients, instructions, and helpful tips.',
  'ebook-outline': 'You are an ebook strategist. Create comprehensive outlines with chapters, sections, and key points.',
  'course-content': 'You are an instructional designer. Create engaging educational content with clear learning objectives.',
  'quiz-questions': 'You are an assessment designer. Create clear, effective quiz questions that test understanding.',
  'survey-questions': 'You are a survey designer. Create unbiased, effective survey questions that gather useful data.',
  'interview-questions': 'You are an HR specialist. Create insightful interview questions that evaluate candidates effectively.',
  'conversation-starters': 'You are a communication expert. Create engaging conversation starters for various social contexts.',

  // Reviews & Testimonials
  'review': 'You are a review writer. Create honest, detailed reviews that help others make informed decisions.',
  'testimonial': 'You are skilled at crafting compelling testimonials that authentically communicate customer experiences.',

  // Text Transformation
  'paraphrase': 'You are an expert at paraphrasing text while maintaining meaning and improving clarity.',
  'translate': 'You are a professional translator. Provide accurate translations that preserve meaning and context.',
  'grammar-check': 'You are a grammar and style editor. Identify and correct errors while improving readability.',
};

// Template prompts for each content type
const PROMPT_TEMPLATES: Record<ContentType, (params: Record<string, any>) => string> = {
  'email': (p) => `Write an email with the following details:
Subject: ${p.subject || 'Not specified'}
Recipient Type: ${p.recipientType || 'colleague'}
Tone: ${p.tone || 'professional'}
Purpose: ${p.purpose || p.prompt}
${p.keyPoints ? `Key Points:\n${p.keyPoints}` : ''}

Write a complete email including greeting, body, and closing.`,

  'essay': (p) => `Write an essay on the following topic:
Topic: ${p.topic || p.prompt}
Type: ${p.essayType || 'argumentative'}
Length: ${p.length || 'medium (500-800 words)'}
${p.thesis ? `Thesis: ${p.thesis}` : ''}
${p.requirements ? `Requirements:\n${p.requirements}` : ''}

Write a well-structured essay with introduction, body paragraphs, and conclusion.`,

  'blog-post': (p) => `Write a blog post with the following specifications:
Title/Topic: ${p.title || p.prompt}
Target Audience: ${p.targetAudience || 'general'}
Writing Style: ${p.writingStyle || 'informative'}
${p.keywords ? `Keywords: ${p.keywords}` : ''}
${p.seoFocus ? `SEO Focus: ${p.seoFocus}` : ''}

Create a complete, engaging blog post with introduction, body sections, and conclusion.`,

  'social-caption': (p) => `Create a social media caption for:
Platform: ${p.platform || 'instagram'}
Topic/Content: ${p.prompt}
Tone: ${p.tone || 'engaging'}
${p.hashtags ? `Include hashtags: Yes` : ''}
${p.cta ? `Call-to-action: ${p.cta}` : ''}`,

  'product-description': (p) => `Write a product description:
Product Name: ${p.productName || p.prompt}
Product Type: ${p.productType || 'Not specified'}
Key Features: ${p.keyFeatures || 'Not specified'}
Target Audience: ${p.targetAudience || 'general consumers'}
Tone: ${p.tone || 'professional'}
Platform: ${p.platform || 'e-commerce'}
Length: ${p.length || 'medium'}`,

  'resume': (p) => `Create a resume section or full resume:
${p.prompt}
${p.experience ? `Experience:\n${p.experience}` : ''}
${p.skills ? `Skills: ${p.skills}` : ''}
${p.education ? `Education: ${p.education}` : ''}
Format: ${p.format || 'professional'}`,

  'cover-letter': (p) => `Write a cover letter:
Position: ${p.position || 'Not specified'}
Company: ${p.company || 'Not specified'}
${p.qualifications ? `Key Qualifications:\n${p.qualifications}` : ''}
${p.prompt}
Tone: ${p.tone || 'professional'}`,

  'linkedin-post': (p) => `Create a LinkedIn post:
Topic: ${p.prompt}
Goal: ${p.goal || 'engagement'}
Tone: ${p.tone || 'professional'}
${p.includeHashtags ? 'Include relevant hashtags' : ''}`,

  'tweet': (p) => `Create a tweet/X post:
Topic: ${p.prompt}
Tone: ${p.tone || 'engaging'}
${p.thread ? 'Format as a thread' : 'Single tweet (max 280 characters)'}`,

  'youtube-description': (p) => `Write a YouTube video description:
Video Title: ${p.title || p.prompt}
Video Topic: ${p.topic || p.prompt}
${p.timestamps ? `Include timestamps: Yes` : ''}
${p.links ? `Links to include: ${p.links}` : ''}
Optimize for SEO with keywords.`,

  'ad-copy': (p) => `Create ad copy:
Product/Service: ${p.productName || p.prompt}
Platform: ${p.platform || 'facebook'}
Target Audience: ${p.targetAudience || 'Not specified'}
Tone: ${p.tone || 'persuasive'}
CTA: ${p.cta || 'Learn More'}
${p.variations ? `Number of variations: ${p.variations}` : ''}`,

  'headline': (p) => `Generate headlines for:
Topic: ${p.prompt}
Type: ${p.headlineType || 'blog'}
Tone: ${p.tone || 'intriguing'}
Number of headlines: ${p.count || 10}

Create unique, compelling headlines optimized for engagement.`,

  'slogan': (p) => `Create slogans for:
Brand/Product: ${p.brandName || p.prompt}
Industry: ${p.industry || 'Not specified'}
Brand Values: ${p.brandValues || 'Not specified'}
Target Emotion: ${p.targetEmotion || 'trust'}
Number of slogans: ${p.count || 8}`,

  'tagline': (p) => `Create taglines for:
Brand/Product: ${p.brandName || p.prompt}
Value Proposition: ${p.valueProposition || 'Not specified'}
Target Audience: ${p.targetAudience || 'general'}
Number of taglines: ${p.count || 5}`,

  'bio': (p) => `Write a professional bio:
Name: ${p.name || 'Not specified'}
Role/Title: ${p.role || 'Not specified'}
${p.achievements ? `Key Achievements: ${p.achievements}` : ''}
Platform: ${p.platform || 'general'}
Tone: ${p.tone || 'professional'}
Length: ${p.length || 'medium'}`,

  'thank-you-note': (p) => `Write a thank you note:
Recipient: ${p.recipientName || 'Not specified'}
Occasion: ${p.occasion || 'general'}
What to thank for: ${p.prompt}
Tone: ${p.tone || 'warm'}`,

  'apology-letter': (p) => `Write an apology letter:
Recipient: ${p.recipientName || 'Not specified'}
Situation: ${p.prompt}
Tone: ${p.tone || 'sincere'}
${p.resolution ? `Proposed resolution: ${p.resolution}` : ''}`,

  'invitation': (p) => `Create an invitation:
Event: ${p.eventName || p.prompt}
Date: ${p.date || 'TBD'}
Location: ${p.location || 'TBD'}
Tone: ${p.tone || 'warm'}
${p.dresscode ? `Dress code: ${p.dresscode}` : ''}`,

  'announcement': (p) => `Write an announcement:
Topic: ${p.prompt}
Audience: ${p.audience || 'general'}
Tone: ${p.tone || 'professional'}
${p.callToAction ? `Call-to-action: ${p.callToAction}` : ''}`,

  'press-release': (p) => `Write a press release:
Headline: ${p.headline || p.prompt}
Company: ${p.company || 'Not specified'}
${p.quote ? `Include quote from: ${p.quote}` : ''}
${p.contactInfo ? `Contact: ${p.contactInfo}` : ''}

Follow AP style and include all standard press release elements.`,

  'newsletter': (p) => `Create a newsletter:
Topic: ${p.prompt}
Subject Line: ${p.subjectLine || 'Generate one'}
Audience: ${p.audience || 'subscribers'}
Tone: ${p.tone || 'friendly'}
${p.sections ? `Sections: ${p.sections}` : ''}`,

  'speech': (p) => `Write a speech:
Occasion: ${p.occasion || p.prompt}
Audience: ${p.audience || 'general'}
Duration: ${p.duration || '5-10 minutes'}
Tone: ${p.tone || 'inspiring'}
${p.keyMessages ? `Key messages: ${p.keyMessages}` : ''}`,

  'presentation-script': (p) => `Create a presentation script:
Topic: ${p.prompt}
Number of slides: ${p.slides || '10-15'}
Duration: ${p.duration || '15 minutes'}
Audience: ${p.audience || 'professional'}
${p.keyPoints ? `Key points: ${p.keyPoints}` : ''}`,

  'video-script': (p) => `Write a video script:
Topic: ${p.prompt}
Platform: ${p.platform || 'youtube'}
Duration: ${p.duration || '5-10 minutes'}
Style: ${p.style || 'educational'}
${p.hook ? `Opening hook idea: ${p.hook}` : ''}`,

  'podcast-script': (p) => `Create a podcast script:
Topic: ${p.prompt}
Format: ${p.format || 'solo'}
Duration: ${p.duration || '30 minutes'}
Tone: ${p.tone || 'conversational'}
${p.segments ? `Segments: ${p.segments}` : ''}`,

  'story': (p) => `Write a story:
Genre: ${p.genre || 'general fiction'}
Theme: ${p.prompt}
Length: ${p.length || 'short story'}
${p.characters ? `Characters: ${p.characters}` : ''}
${p.setting ? `Setting: ${p.setting}` : ''}`,

  'poetry': (p) => `Write a poem:
Theme: ${p.prompt}
Style: ${p.style || 'free verse'}
Mood: ${p.mood || 'reflective'}
${p.length ? `Length: ${p.length}` : ''}`,

  'song-lyrics': (p) => `Write song lyrics:
Theme: ${p.prompt}
Genre: ${p.genre || 'pop'}
Mood: ${p.mood || 'upbeat'}
${p.structure ? `Structure: ${p.structure}` : 'Include verses, chorus, and bridge'}`,

  'joke': (p) => `Create jokes about:
Topic: ${p.prompt}
Style: ${p.style || 'witty'}
Audience: ${p.audience || 'general'}
Number of jokes: ${p.count || 5}`,

  'book-summary': (p) => `Summarize the book:
Title: ${p.title || p.prompt}
${p.author ? `Author: ${p.author}` : ''}
Length: ${p.length || 'comprehensive'}
Include key themes, main arguments, and important quotes.`,

  'article-summary': (p) => `Summarize the following article/content:
${p.prompt}
Length: ${p.length || 'concise'}
Focus on: ${p.focus || 'key points and takeaways'}`,

  'meeting-notes': (p) => `Organize these meeting notes:
${p.meetingTitle ? `Meeting: ${p.meetingTitle}` : ''}
${p.attendees ? `Attendees: ${p.attendees}` : ''}
Raw notes:
${p.prompt}

Format: ${p.format || 'executive summary'}
Include action items and key decisions.`,

  'report': (p) => `Write a report on:
Topic: ${p.prompt}
Type: ${p.reportType || 'business'}
Audience: ${p.audience || 'stakeholders'}
${p.data ? `Data/findings: ${p.data}` : ''}`,

  'proposal': (p) => `Write a proposal:
Project/Idea: ${p.prompt}
Audience: ${p.audience || 'decision makers'}
${p.budget ? `Budget: ${p.budget}` : ''}
${p.timeline ? `Timeline: ${p.timeline}` : ''}`,

  'contract': (p) => `Draft contract language for:
Agreement Type: ${p.contractType || p.prompt}
Parties: ${p.parties || 'Not specified'}
${p.terms ? `Key terms: ${p.terms}` : ''}

Note: This is a draft. Professional legal review is recommended.`,

  'terms-of-service': (p) => `Draft terms of service for:
Business/App: ${p.businessName || p.prompt}
Type: ${p.businessType || 'online service'}
${p.keyTerms ? `Key terms to include: ${p.keyTerms}` : ''}

Note: This is a draft. Professional legal review is recommended.`,

  'privacy-policy': (p) => `Draft a privacy policy for:
Business/App: ${p.businessName || p.prompt}
Data collected: ${p.dataCollected || 'standard website data'}
${p.jurisdiction ? `Jurisdiction: ${p.jurisdiction}` : ''}

Note: This is a draft. Professional legal review is recommended.`,

  'business-plan': (p) => `Create a business plan for:
Business Idea: ${p.prompt}
Industry: ${p.industry || 'Not specified'}
${p.sections ? `Sections: ${p.sections}` : 'Include executive summary, market analysis, and financial projections'}`,

  'case-study': (p) => `Write a case study:
Subject: ${p.prompt}
Industry: ${p.industry || 'Not specified'}
${p.results ? `Results/metrics: ${p.results}` : ''}
${p.challenge ? `Challenge: ${p.challenge}` : ''}`,

  'white-paper': (p) => `Write a white paper on:
Topic: ${p.prompt}
Industry: ${p.industry || 'technology'}
Audience: ${p.audience || 'industry professionals'}
${p.sections ? `Sections: ${p.sections}` : ''}`,

  'faq': (p) => `Create FAQ content for:
Product/Service: ${p.prompt}
Number of questions: ${p.count || 10}
${p.topics ? `Topics to cover: ${p.topics}` : ''}`,

  'how-to-guide': (p) => `Create a how-to guide:
Topic: ${p.prompt}
Skill level: ${p.skillLevel || 'beginner'}
${p.tools ? `Tools needed: ${p.tools}` : ''}`,

  'tutorial': (p) => `Write a tutorial:
Topic: ${p.prompt}
Format: ${p.format || 'step-by-step'}
Audience: ${p.audience || 'beginners'}
${p.prerequisites ? `Prerequisites: ${p.prerequisites}` : ''}`,

  'recipe': (p) => `Write a recipe for:
Dish: ${p.prompt}
Cuisine: ${p.cuisine || 'Not specified'}
Difficulty: ${p.difficulty || 'medium'}
Servings: ${p.servings || '4'}
${p.dietary ? `Dietary notes: ${p.dietary}` : ''}`,

  'review': (p) => `Write a review for:
Product/Service: ${p.prompt}
Rating: ${p.rating || 'positive'}
${p.pros ? `Pros: ${p.pros}` : ''}
${p.cons ? `Cons: ${p.cons}` : ''}`,

  'testimonial': (p) => `Write a testimonial for:
Product/Service: ${p.prompt}
Customer perspective: ${p.perspective || 'satisfied customer'}
${p.benefits ? `Key benefits experienced: ${p.benefits}` : ''}`,

  'ebook-outline': (p) => `Create an ebook outline:
Topic: ${p.prompt}
Target audience: ${p.audience || 'general'}
Number of chapters: ${p.chapters || '10-12'}`,

  'course-content': (p) => `Create course content:
Topic: ${p.prompt}
Level: ${p.level || 'beginner'}
Format: ${p.format || 'module outline'}
${p.learningObjectives ? `Learning objectives: ${p.learningObjectives}` : ''}`,

  'quiz-questions': (p) => `Create quiz questions:
Topic: ${p.prompt}
Number of questions: ${p.count || 10}
Difficulty: ${p.difficulty || 'medium'}
Format: ${p.format || 'multiple choice'}`,

  'survey-questions': (p) => `Create survey questions:
Purpose: ${p.prompt}
Number of questions: ${p.count || 10}
Type: ${p.surveyType || 'customer feedback'}`,

  'interview-questions': (p) => `Create interview questions:
Position: ${p.position || p.prompt}
Type: ${p.interviewType || 'behavioral'}
Number of questions: ${p.count || 10}`,

  'conversation-starters': (p) => `Create conversation starters:
Context: ${p.prompt}
Relationship: ${p.relationship || 'professional'}
Tone: ${p.tone || 'friendly'}
Number of starters: ${p.count || 10}`,

  'paraphrase': (p) => `Paraphrase the following text:
${p.prompt}
Style: ${p.style || 'clearer'}
${p.targetAudience ? `For audience: ${p.targetAudience}` : ''}`,

  'translate': (p) => `Translate the following:
${p.prompt}
From: ${p.fromLanguage || 'auto-detect'}
To: ${p.toLanguage || 'English'}
Style: ${p.style || 'natural'}`,

  'grammar-check': (p) => `Check and correct grammar in:
${p.prompt}
Also suggest style improvements if applicable.`,
};

@Injectable()
export class TextAIService {
  private readonly logger = new Logger(TextAIService.name);

  constructor(private readonly aiService: AiService) {}

  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const { type, prompt, parameters = {} } = request;

    // Get system prompt for content type
    const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS['email'];

    // Get formatted prompt template
    const templateFn = PROMPT_TEMPLATES[type];
    const formattedPrompt = templateFn
      ? templateFn({ prompt, ...parameters })
      : prompt;

    // Generate content
    const options: TextGenerationOptions = {
      systemMessage: systemPrompt,
      temperature: parameters.temperature ?? this.getDefaultTemperature(type),
      maxTokens: parameters.maxTokens ?? this.getDefaultMaxTokens(type),
    };

    try {
      const content = await this.aiService.generateText(formattedPrompt, options);

      return {
        content,
        type,
        metadata: {
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          parameters,
        },
      };
    } catch (error) {
      this.logger.error(`Content generation failed for type ${type}:`, error.message);
      throw error;
    }
  }

  // Get default temperature based on content type
  private getDefaultTemperature(type: ContentType): number {
    // Creative content needs higher temperature
    const creativeTypes: ContentType[] = [
      'story', 'poetry', 'song-lyrics', 'joke', 'slogan', 'tagline', 'headline'
    ];

    // Precise content needs lower temperature
    const preciseTypes: ContentType[] = [
      'contract', 'terms-of-service', 'privacy-policy', 'report', 'meeting-notes',
      'grammar-check', 'translate'
    ];

    if (creativeTypes.includes(type)) return 0.9;
    if (preciseTypes.includes(type)) return 0.3;
    return 0.7; // Default
  }

  // Get default max tokens based on content type
  private getDefaultMaxTokens(type: ContentType): number {
    // Long-form content
    const longFormTypes: ContentType[] = [
      'essay', 'blog-post', 'white-paper', 'case-study', 'story', 'business-plan',
      'ebook-outline', 'course-content', 'terms-of-service', 'privacy-policy'
    ];

    // Short-form content
    const shortFormTypes: ContentType[] = [
      'tweet', 'headline', 'slogan', 'tagline', 'social-caption', 'joke'
    ];

    if (longFormTypes.includes(type)) return 4000;
    if (shortFormTypes.includes(type)) return 500;
    return 2000; // Default
  }

  // Convenience method for quick generation
  async quickGenerate(type: ContentType, prompt: string): Promise<string> {
    const response = await this.generateContent({ type, prompt });
    return response.content;
  }

  // Get all available content types
  getAvailableContentTypes(): ContentType[] {
    return Object.keys(SYSTEM_PROMPTS) as ContentType[];
  }

  // Get content type info
  getContentTypeInfo(type: ContentType): { systemPrompt: string; defaultTemp: number; defaultTokens: number } {
    return {
      systemPrompt: SYSTEM_PROMPTS[type] || '',
      defaultTemp: this.getDefaultTemperature(type),
      defaultTokens: this.getDefaultMaxTokens(type),
    };
  }
}
