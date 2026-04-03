/**
 * TOOLS REGISTRY - SINGLE SOURCE OF TRUTH
 * ========================================
 * This file is the ONLY place where tools are defined.
 * All platforms (Web, Mobile, Flutter) consume this via API.
 *
 * DO NOT duplicate this data elsewhere!
 *
 * Used by:
 * - Backend API: GET /api/tools
 * - Qdrant seed script
 * - Frontend (via API)
 * - Mobile/Flutter (via API)
 *
 * Last updated: January 2025
 * Total tools: 1100+
 */

export interface ToolData {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  category: string;
}

export interface ToolWithMetadata extends ToolData {
  synonyms?: string[];
  useCases?: string[];
  multilingual?: Record<string, string[]>;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Tool Categories
export const toolCategories: ToolCategory[] = [
  { id: 'text-tools', name: 'Text Tools', icon: 'type', description: 'Text formatting and manipulation' },
  { id: 'encoding', name: 'Encoding', icon: 'lock', description: 'Encoding, decoding, and hashing' },
  { id: 'calculators', name: 'Calculators', icon: 'calculator', description: 'Math and financial calculators' },
  { id: 'converters', name: 'Converters', icon: 'repeat', description: 'Unit and format converters' },
  { id: 'generators', name: 'Generators', icon: 'sparkles', description: 'Generate various content' },
  { id: 'date-time', name: 'Date & Time', icon: 'clock', description: 'Time tracking and calculations' },
  { id: 'image-tools', name: 'Image Tools', icon: 'image', description: 'Image editing and generation' },
  { id: 'ai-writing', name: 'AI Writing', icon: 'pen-tool', description: 'AI-powered writing tools' },
  { id: 'ai-creative', name: 'AI Creative', icon: 'palette', description: 'Creative AI tools' },
  { id: 'ai-business', name: 'AI Business', icon: 'briefcase', description: 'Business document generation' },
  { id: 'ai-marketing', name: 'AI Marketing', icon: 'megaphone', description: 'Marketing content tools' },
  { id: 'developer', name: 'Developer', icon: 'code', description: 'Code and developer tools' },
  { id: 'health-wellness', name: 'Health & Wellness', icon: 'heart', description: 'Health tracking and calculators' },
  { id: 'fitness-sports', name: 'Fitness & Sports', icon: 'activity', description: 'Fitness and sports tools' },
  { id: 'finance', name: 'Finance', icon: 'dollar-sign', description: 'Financial planning tools' },
  { id: 'cooking', name: 'Cooking & Kitchen', icon: 'chef-hat', description: 'Cooking and recipe tools' },
  { id: 'home-diy', name: 'Home & DIY', icon: 'home', description: 'Home improvement calculators' },
  { id: 'gardening', name: 'Gardening', icon: 'flower', description: 'Gardening and outdoor tools' },
  { id: 'automotive', name: 'Automotive', icon: 'car', description: 'Vehicle maintenance tools' },
  { id: 'pet-care', name: 'Pet Care', icon: 'paw-print', description: 'Pet care and tracking' },
  { id: 'travel', name: 'Travel', icon: 'plane', description: 'Travel planning tools' },
  { id: 'lifestyle', name: 'Lifestyle', icon: 'star', description: 'Daily life tools' },
  { id: 'education', name: 'Education', icon: 'graduation-cap', description: 'Learning and study tools' },
  { id: 'music', name: 'Music & Audio', icon: 'music', description: 'Music and audio tools' },
  { id: 'crafts', name: 'Crafts & DIY', icon: 'scissors', description: 'Crafting and hobby tools' },
  { id: 'entertainment', name: 'Entertainment', icon: 'gamepad-2', description: 'Games and fun tools' },
  { id: 'productivity', name: 'Productivity', icon: 'check-square', description: 'Task and project tools' },
  { id: 'business', name: 'Business Tools', icon: 'building-2', description: 'Business management tools' },
  { id: 'professional', name: 'Professional', icon: 'user-check', description: 'Professional service tools' },
  { id: 'weather', name: 'Weather & Environment', icon: 'cloud', description: 'Weather and environment tools' },
  { id: 'healthcare', name: 'Healthcare & Medical', icon: 'stethoscope', description: 'Healthcare and medical practice tools' },
  { id: 'manufacturing', name: 'Manufacturing', icon: 'factory', description: 'Manufacturing and production management tools' },
  { id: 'logistics', name: 'Transportation & Logistics', icon: 'truck', description: 'Freight, shipping, and logistics management tools' },
  { id: 'energy-utilities', name: 'Energy & Utilities', icon: 'zap', description: 'Energy management, utility tracking, and sustainability tools' },
  { id: 'religious', name: 'Religious & Church', icon: 'church', description: 'Church, ministry, and religious organization management tools' },
  { id: 'childcare', name: 'Childcare & Daycare', icon: 'baby', description: 'Childcare, daycare, and early education management tools' },
];

// All Tools Data organized by category
export const allTools: ToolData[] = [
  // ============================================
  // TEXT TOOLS
  // ============================================
  { id: 'json-formatter', title: 'JSON Formatter', description: 'Format and beautify JSON data', icon: 'code', type: 'text-tool', category: 'text-tools' },
  { id: 'case-converter', title: 'Case Converter', description: 'Convert text between different cases', icon: 'type', type: 'text-tool', category: 'text-tools' },
  { id: 'word-counter', title: 'Word Counter', description: 'Count words, characters, and sentences', icon: 'hash', type: 'text-tool', category: 'text-tools' },
  { id: 'markdown-preview', title: 'Markdown Preview', description: 'Preview markdown content', icon: 'eye', type: 'text-tool', category: 'text-tools' },
  { id: 'regex-tester', title: 'Regex Tester', description: 'Test regular expressions', icon: 'regex', type: 'text-tool', category: 'text-tools' },
  { id: 'diff-checker', title: 'Diff Checker', description: 'Compare two texts', icon: 'git-compare', type: 'text-tool', category: 'text-tools' },
  { id: 'html-preview', title: 'HTML Preview', description: 'Preview HTML code', icon: 'code-2', type: 'text-tool', category: 'text-tools' },
  { id: 'csv-json-converter', title: 'CSV to JSON', description: 'Convert between CSV and JSON', icon: 'file-json', type: 'text-tool', category: 'text-tools' },
  { id: 'text-reverser', title: 'Text Reverser', description: 'Reverse text content', icon: 'flip-horizontal', type: 'text-tool', category: 'text-tools' },
  { id: 'text-sorter', title: 'Text Sorter', description: 'Sort lines of text', icon: 'sort-asc', type: 'text-tool', category: 'text-tools' },
  { id: 'find-replace', title: 'Find & Replace', description: 'Find and replace text', icon: 'replace', type: 'text-tool', category: 'text-tools' },
  { id: 'remove-duplicates', title: 'Remove Duplicates', description: 'Remove duplicate lines', icon: 'filter', type: 'text-tool', category: 'text-tools' },
  { id: 'text-compare', title: 'Text Compare', description: 'Compare text differences', icon: 'file-diff', type: 'text-tool', category: 'text-tools' },
  { id: 'text-diff', title: 'Text Diff', description: 'Show text differences', icon: 'git-compare', type: 'text-tool', category: 'text-tools' },

  // ============================================
  // ENCODING TOOLS
  // ============================================
  { id: 'base64', title: 'Base64 Encoder', description: 'Encode and decode Base64', icon: 'lock', type: 'encoder', category: 'encoding' },
  { id: 'url-encoder', title: 'URL Encoder', description: 'Encode and decode URLs', icon: 'link', type: 'encoder', category: 'encoding' },
  { id: 'hash-generator', title: 'Hash Generator', description: 'Generate MD5, SHA hashes', icon: 'shield', type: 'encoder', category: 'encoding' },
  { id: 'uuid-generator', title: 'UUID Generator', description: 'Generate unique UUIDs', icon: 'key', type: 'encoder', category: 'encoding' },
  { id: 'jwt-decoder', title: 'JWT Decoder', description: 'Decode JWT tokens', icon: 'key', type: 'encoder', category: 'encoding' },
  { id: 'binary-converter', title: 'Binary Converter', description: 'Convert binary data', icon: 'binary', type: 'encoder', category: 'encoding' },

  // ============================================
  // CALCULATORS
  // ============================================
  { id: 'bmi-calculator', title: 'BMI Calculator', description: 'Calculate Body Mass Index', icon: 'activity', type: 'calculator', category: 'calculators' },
  { id: 'percentage-calculator', title: 'Percentage Calculator', description: 'Calculate percentages', icon: 'percent', type: 'calculator', category: 'calculators' },
  { id: 'discount-calculator', title: 'Discount Calculator', description: 'Calculate discounts', icon: 'tag', type: 'calculator', category: 'calculators' },
  { id: 'age-calculator', title: 'Age Calculator', description: 'Calculate age from date', icon: 'calendar', type: 'calculator', category: 'calculators' },
  { id: 'tip-calculator', title: 'Tip Calculator', description: 'Calculate tips', icon: 'receipt', type: 'calculator', category: 'calculators' },
  { id: 'mortgage-calculator', title: 'Mortgage Calculator', description: 'Calculate mortgage payments', icon: 'home', type: 'calculator', category: 'calculators' },
  { id: 'loan-calculator', title: 'Loan Calculator', description: 'Calculate loan payments', icon: 'banknote', type: 'calculator', category: 'calculators' },
  { id: 'date-diff-calculator', title: 'Date Difference', description: 'Calculate days between dates', icon: 'calendar-range', type: 'calculator', category: 'calculators' },
  { id: 'statistics-calculator', title: 'Statistics Calculator', description: 'Statistical calculations', icon: 'bar-chart', type: 'calculator', category: 'calculators' },
  { id: 'equation-solver', title: 'Equation Solver', description: 'Solve mathematical equations', icon: 'function-square', type: 'calculator', category: 'calculators' },
  { id: 'roman-numerals', title: 'Roman Numerals', description: 'Convert Roman numerals', icon: 'landmark', type: 'calculator', category: 'calculators' },
  { id: 'gpa-calculator', title: 'GPA Calculator', description: 'Calculate grade point average', icon: 'graduation-cap', type: 'calculator', category: 'calculators' },
  { id: 'fraction-calculator', title: 'Fraction Calculator', description: 'Calculate fractions', icon: 'divide', type: 'calculator', category: 'calculators' },
  { id: 'aspect-ratio-calculator', title: 'Aspect Ratio', description: 'Calculate aspect ratios', icon: 'ratio', type: 'calculator', category: 'calculators' },

  // ============================================
  // CONVERTERS
  // ============================================
  { id: 'temperature-converter', title: 'Temperature Converter', description: 'Convert temperature units', icon: 'thermometer', type: 'converter', category: 'converters' },
  { id: 'length-converter', title: 'Length Converter', description: 'Convert length units', icon: 'ruler', type: 'converter', category: 'converters' },
  { id: 'weight-converter', title: 'Weight Converter', description: 'Convert weight units', icon: 'scale', type: 'converter', category: 'converters' },
  { id: 'time-converter', title: 'Time Converter', description: 'Convert time units', icon: 'clock', type: 'converter', category: 'converters' },
  { id: 'color-converter', title: 'Color Converter', description: 'Convert color formats', icon: 'palette', type: 'converter', category: 'converters' },
  { id: 'currency-converter', title: 'Currency Converter', description: 'Convert currencies', icon: 'dollar-sign', type: 'converter', category: 'converters' },
  { id: 'timestamp-converter', title: 'Timestamp Converter', description: 'Convert timestamps', icon: 'timer', type: 'converter', category: 'converters' },
  { id: 'number-base-converter', title: 'Number Base Converter', description: 'Convert number bases', icon: 'binary', type: 'converter', category: 'converters' },
  { id: 'shoe-size-converter', title: 'Shoe Size Converter', description: 'Convert shoe sizes', icon: 'footprints', type: 'converter', category: 'converters' },
  { id: 'data-storage-converter', title: 'Data Storage Converter', description: 'Convert storage units', icon: 'hard-drive', type: 'converter', category: 'converters' },
  { id: 'speed-converter', title: 'Speed Converter', description: 'Convert speed units', icon: 'gauge', type: 'converter', category: 'converters' },
  { id: 'cooking-conversions', title: 'Cooking Conversions', description: 'Convert cooking measurements', icon: 'chef-hat', type: 'converter', category: 'converters' },

  // ============================================
  // GENERATORS
  // ============================================
  { id: 'qr-generator', title: 'QR Code Generator', description: 'Generate QR codes', icon: 'qr-code', type: 'generator', category: 'generators' },
  { id: 'password-generator', title: 'Password Generator', description: 'Generate secure passwords', icon: 'lock', type: 'generator', category: 'generators' },
  { id: 'lorem-ipsum', title: 'Lorem Ipsum Generator', description: 'Generate placeholder text', icon: 'align-left', type: 'generator', category: 'generators' },
  { id: 'random-number', title: 'Random Number Generator', description: 'Generate random numbers', icon: 'hash', type: 'generator', category: 'generators' },
  { id: 'gradient-generator', title: 'Gradient Generator', description: 'Create CSS gradients', icon: 'palette', type: 'generator', category: 'generators' },
  { id: 'wifi-qr-generator', title: 'WiFi QR Generator', description: 'Generate WiFi QR codes', icon: 'wifi', type: 'generator', category: 'generators' },
  { id: 'barcode-generator', title: 'Barcode Generator', description: 'Generate barcodes', icon: 'barcode', type: 'generator', category: 'generators' },
  { id: 'color-palette-generator', title: 'Color Palette Generator', description: 'Generate color palettes', icon: 'palette', type: 'generator', category: 'generators' },
  { id: 'name-generator', title: 'Name Generator', description: 'Generate random names', icon: 'user', type: 'generator', category: 'generators' },
  { id: 'acronym-generator', title: 'Acronym Generator', description: 'Create acronyms', icon: 'text', type: 'generator', category: 'generators' },
  { id: 'slug-generator', title: 'Slug Generator', description: 'Generate URL slugs', icon: 'link', type: 'generator', category: 'generators' },
  { id: 'meta-tag-generator', title: 'Meta Tag Generator', description: 'Generate meta tags', icon: 'code', type: 'generator', category: 'generators' },
  { id: 'hashtag-generator', title: 'Hashtag Generator', description: 'Generate hashtags', icon: 'hash', type: 'generator', category: 'generators' },
  { id: 'bio-generator', title: 'Bio Generator', description: 'Generate social bios', icon: 'user', type: 'generator', category: 'generators' },
  { id: 'signature-generator', title: 'Signature Generator', description: 'Create digital signatures', icon: 'pen-tool', type: 'generator', category: 'generators' },

  // ============================================
  // DATE & TIME TOOLS
  // ============================================
  { id: 'stopwatch', title: 'Stopwatch', description: 'Track elapsed time', icon: 'timer', type: 'timer', category: 'date-time' },
  { id: 'countdown-timer', title: 'Countdown Timer', description: 'Count down to an event', icon: 'alarm-clock', type: 'timer', category: 'date-time' },
  { id: 'pomodoro-timer', title: 'Pomodoro Timer', description: 'Focus timer technique', icon: 'clock', type: 'timer', category: 'date-time' },
  { id: 'world-clock', title: 'World Clock', description: 'View multiple time zones', icon: 'globe', type: 'timer', category: 'date-time' },
  { id: 'weekday-finder', title: 'Weekday Finder', description: 'Find day of the week', icon: 'calendar', type: 'calculator', category: 'date-time' },
  { id: 'timezone-meeting', title: 'Timezone Meeting Planner', description: 'Plan meetings across timezones', icon: 'users', type: 'calculator', category: 'date-time' },
  { id: 'event-countdown', title: 'Event Countdown', description: 'Countdown to events', icon: 'calendar-check', type: 'timer', category: 'date-time' },
  { id: 'birthday-countdown', title: 'Birthday Countdown', description: 'Count days to birthday', icon: 'cake', type: 'timer', category: 'date-time' },

  // ============================================
  // IMAGE TOOLS
  // ============================================
  { id: 'image-resizer', title: 'Image Resizer', description: 'Resize images', icon: 'image', type: 'image-tool', category: 'image-tools' },
  { id: 'image-compressor', title: 'Image Compressor', description: 'Compress images', icon: 'file-minus', type: 'image-tool', category: 'image-tools' },
  { id: 'color-picker', title: 'Color Picker', description: 'Pick colors from images', icon: 'pipette', type: 'image-tool', category: 'image-tools' },
  { id: 'photo-enhancer', title: 'Photo Enhancer', description: 'Enhance photo quality', icon: 'wand-2', type: 'image-tool', category: 'image-tools' },
  { id: 'background-remover', title: 'Background Remover', description: 'Remove image backgrounds', icon: 'eraser', type: 'image-tool', category: 'image-tools' },
  { id: 'image-upscaler', title: 'Image Upscaler', description: 'Upscale image resolution', icon: 'maximize', type: 'image-tool', category: 'image-tools' },
  { id: 'color-mixer', title: 'Color Mixer', description: 'Mix colors together', icon: 'palette', type: 'image-tool', category: 'image-tools' },
  { id: 'color-blender', title: 'Color Blender', description: 'Blend colors', icon: 'droplets', type: 'image-tool', category: 'image-tools' },
  { id: 'watermark', title: 'Watermark Tool', description: 'Add watermarks to images', icon: 'stamp', type: 'image-tool', category: 'image-tools' },
  { id: 'style-transfer', title: 'Style Transfer', description: 'Apply artistic styles', icon: 'paintbrush', type: 'image-tool', category: 'image-tools' },
  { id: 'object-removal', title: 'Object Removal', description: 'Remove objects from images', icon: 'trash-2', type: 'image-tool', category: 'image-tools' },
  { id: 'image-restoration', title: 'Image Restoration', description: 'Restore old photos', icon: 'refresh-cw', type: 'image-tool', category: 'image-tools' },
  { id: 'colorization', title: 'Colorization', description: 'Colorize black & white photos', icon: 'droplet', type: 'image-tool', category: 'image-tools' },
  { id: 'gif-creator', title: 'GIF Creator', description: 'Create animated GIFs', icon: 'film', type: 'image-tool', category: 'image-tools' },
  { id: 'image-to-text', title: 'Image to Text (OCR)', description: 'Extract text from images', icon: 'scan', type: 'image-tool', category: 'image-tools' },

  // ============================================
  // AI WRITING TOOLS
  // ============================================
  { id: 'email-composer', title: 'Email Composer', description: 'Compose professional emails', icon: 'mail', type: 'ai-writing', category: 'ai-writing' },
  { id: 'essay-writer', title: 'Essay Writer', description: 'Write essays and articles', icon: 'book-open', type: 'ai-writing', category: 'ai-writing' },
  { id: 'blog-post-generator', title: 'Blog Post Generator', description: 'Generate blog posts', icon: 'newspaper', type: 'ai-writing', category: 'ai-writing' },
  { id: 'social-media-post', title: 'Social Media Post', description: 'Create social posts', icon: 'share-2', type: 'ai-writing', category: 'ai-writing' },
  { id: 'article-summarizer', title: 'Article Summarizer', description: 'Summarize long articles', icon: 'file-minus', type: 'ai-writing', category: 'ai-writing' },
  { id: 'paraphraser', title: 'Paraphraser', description: 'Rewrite text content', icon: 'repeat', type: 'ai-writing', category: 'ai-writing' },
  { id: 'translator', title: 'Translator', description: 'Translate between languages', icon: 'languages', type: 'ai-writing', category: 'ai-writing' },
  { id: 'grammar-checker', title: 'Grammar Checker', description: 'Check grammar and spelling', icon: 'spell-check', type: 'ai-writing', category: 'ai-writing' },
  { id: 'resume-builder', title: 'Resume Builder', description: 'Build professional resumes', icon: 'file-text', type: 'ai-writing', category: 'ai-writing' },
  { id: 'cover-letter', title: 'Cover Letter Generator', description: 'Generate cover letters', icon: 'mail', type: 'ai-writing', category: 'ai-writing' },
  { id: 'linkedin-bio', title: 'LinkedIn Bio Generator', description: 'Create LinkedIn profiles', icon: 'linkedin', type: 'ai-writing', category: 'ai-writing' },
  { id: 'thank-you-note', title: 'Thank You Note', description: 'Write thank you notes', icon: 'heart', type: 'ai-writing', category: 'ai-writing' },
  { id: 'meeting-notes', title: 'Meeting Notes', description: 'Summarize meeting notes', icon: 'file-text', type: 'ai-writing', category: 'ai-writing' },
  { id: 'speech-writer', title: 'Speech Writer', description: 'Write speeches', icon: 'mic', type: 'ai-writing', category: 'ai-writing' },
  { id: 'press-release', title: 'Press Release', description: 'Write press releases', icon: 'newspaper', type: 'ai-writing', category: 'ai-writing' },
  { id: 'tutorial-writer', title: 'Tutorial Writer', description: 'Write tutorials', icon: 'book', type: 'ai-writing', category: 'ai-writing' },
  { id: 'review-writer', title: 'Review Writer', description: 'Write product reviews', icon: 'star', type: 'ai-writing', category: 'ai-writing' },
  { id: 'testimonial-writer', title: 'Testimonial Writer', description: 'Write testimonials', icon: 'quote', type: 'ai-writing', category: 'ai-writing' },

  // ============================================
  // AI CREATIVE TOOLS
  // ============================================
  { id: 'ai-image-generator', title: 'AI Image Generator', description: 'Generate images with AI', icon: 'sparkles', type: 'ai-creative', category: 'ai-creative' },
  { id: 'ai-logo-generator', title: 'AI Logo Generator', description: 'Generate logos with AI', icon: 'hexagon', type: 'ai-creative', category: 'ai-creative' },
  { id: 'ai-video-generator', title: 'AI Video Generator', description: 'Generate videos with AI', icon: 'video', type: 'ai-creative', category: 'ai-creative' },
  { id: 'social-media-image', title: 'Social Media Image', description: 'Create social media graphics', icon: 'image', type: 'ai-creative', category: 'ai-creative' },
  { id: 'avatar-generator', title: 'Avatar Generator', description: 'Create custom avatars', icon: 'user-circle', type: 'ai-creative', category: 'ai-creative' },
  { id: 'banner-generator', title: 'Banner Generator', description: 'Create banners', icon: 'layout', type: 'ai-creative', category: 'ai-creative' },
  { id: 'business-card', title: 'Business Card Designer', description: 'Design business cards', icon: 'credit-card', type: 'ai-creative', category: 'ai-creative' },
  { id: 'poster-generator', title: 'Poster Generator', description: 'Create posters', icon: 'frame', type: 'ai-creative', category: 'ai-creative' },
  { id: 'flyer-designer', title: 'Flyer Designer', description: 'Design flyers', icon: 'file-image', type: 'ai-creative', category: 'ai-creative' },
  { id: 'thumbnail-generator', title: 'Thumbnail Generator', description: 'Create thumbnails', icon: 'image', type: 'ai-creative', category: 'ai-creative' },
  { id: 'video-script', title: 'Video Script Writer', description: 'Write video scripts', icon: 'clapperboard', type: 'ai-creative', category: 'ai-creative' },
  { id: 'story-generator', title: 'Story Generator', description: 'Generate creative stories', icon: 'book', type: 'ai-creative', category: 'ai-creative' },
  { id: 'poetry-generator', title: 'Poetry Generator', description: 'Generate poems', icon: 'feather', type: 'ai-creative', category: 'ai-creative' },
  { id: 'joke-generator', title: 'Joke Generator', description: 'Generate jokes', icon: 'smile', type: 'ai-creative', category: 'ai-creative' },
  { id: 'song-lyrics', title: 'Song Lyrics Generator', description: 'Write song lyrics', icon: 'music', type: 'ai-creative', category: 'ai-creative' },
  { id: 'meme-generator', title: 'Meme Generator', description: 'Create memes', icon: 'smile', type: 'ai-creative', category: 'ai-creative' },
  { id: 'book-cover', title: 'Book Cover Designer', description: 'Design book covers', icon: 'book', type: 'ai-creative', category: 'ai-creative' },
  { id: 'icon-generator', title: 'Icon Generator', description: 'Generate app icons', icon: 'box', type: 'ai-creative', category: 'ai-creative' },
  { id: 'album-cover', title: 'Album Cover Designer', description: 'Design album covers', icon: 'disc', type: 'ai-creative', category: 'ai-creative' },
  { id: 'wallpaper-generator', title: 'Wallpaper Generator', description: 'Create wallpapers', icon: 'monitor', type: 'ai-creative', category: 'ai-creative' },
  { id: 'sticker-generator', title: 'Sticker Generator', description: 'Create stickers', icon: 'sticker', type: 'ai-creative', category: 'ai-creative' },
  { id: 'pattern-generator', title: 'Pattern Generator', description: 'Create patterns', icon: 'grid', type: 'ai-creative', category: 'ai-creative' },
  { id: 'character-name-generator', title: 'Character Name Generator', description: 'Generate character names', icon: 'user', type: 'ai-creative', category: 'ai-creative' },
  { id: 'writing-prompt-generator', title: 'Writing Prompt Generator', description: 'Generate writing prompts', icon: 'pen-tool', type: 'ai-creative', category: 'ai-creative' },
  { id: 'plot-twist-generator', title: 'Plot Twist Generator', description: 'Generate plot twists', icon: 'shuffle', type: 'ai-creative', category: 'ai-creative' },

  // ============================================
  // AI BUSINESS TOOLS
  // ============================================
  { id: 'business-plan', title: 'Business Plan Generator', description: 'Generate business plans', icon: 'briefcase', type: 'ai-business', category: 'ai-business' },
  { id: 'faq-generator', title: 'FAQ Generator', description: 'Generate FAQ sections', icon: 'help-circle', type: 'ai-business', category: 'ai-business' },
  { id: 'how-to-guide', title: 'How-To Guide Generator', description: 'Create how-to guides', icon: 'list-ordered', type: 'ai-business', category: 'ai-business' },
  { id: 'newsletter', title: 'Newsletter Generator', description: 'Create newsletters', icon: 'mail-plus', type: 'ai-business', category: 'ai-business' },
  { id: 'product-description', title: 'Product Description', description: 'Write product descriptions', icon: 'shopping-bag', type: 'ai-business', category: 'ai-business' },
  { id: 'interview-questions', title: 'Interview Questions', description: 'Generate interview questions', icon: 'message-circle', type: 'ai-business', category: 'ai-business' },
  { id: 'survey-questions', title: 'Survey Questions', description: 'Create survey questions', icon: 'clipboard', type: 'ai-business', category: 'ai-business' },
  { id: 'quiz-questions', title: 'Quiz Questions', description: 'Generate quiz questions', icon: 'help-circle', type: 'ai-business', category: 'ai-business' },
  { id: 'proposal-generator', title: 'Proposal Generator', description: 'Create business proposals', icon: 'file-text', type: 'ai-business', category: 'ai-business' },
  { id: 'contract-generator', title: 'Contract Generator', description: 'Generate contracts', icon: 'file-check', type: 'ai-business', category: 'ai-business' },
  { id: 'invoice-generator', title: 'Invoice Generator', description: 'Create invoices', icon: 'receipt', type: 'ai-business', category: 'ai-business' },
  { id: 'expense-report', title: 'Expense Report', description: 'Generate expense reports', icon: 'file-spreadsheet', type: 'ai-business', category: 'ai-business' },

  // ============================================
  // AI MARKETING TOOLS
  // ============================================
  { id: 'headline-generator', title: 'Headline Generator', description: 'Generate headlines', icon: 'type', type: 'ai-marketing', category: 'ai-marketing' },
  { id: 'slogan-creator', title: 'Slogan Creator', description: 'Create slogans', icon: 'sparkles', type: 'ai-marketing', category: 'ai-marketing' },
  { id: 'ad-copy-generator', title: 'Ad Copy Generator', description: 'Write ad copy', icon: 'megaphone', type: 'ai-marketing', category: 'ai-marketing' },
  { id: 'youtube-description', title: 'YouTube Description', description: 'Write video descriptions', icon: 'youtube', type: 'ai-marketing', category: 'ai-marketing' },
  { id: 'tweet', title: 'Tweet Generator', description: 'Create engaging tweets', icon: 'twitter', type: 'ai-marketing', category: 'ai-marketing' },
  { id: 'hashtag-analyzer', title: 'Hashtag Analyzer', description: 'Analyze hashtag performance', icon: 'hash', type: 'ai-marketing', category: 'ai-marketing' },
  { id: 'podcast-script', title: 'Podcast Script', description: 'Write podcast scripts', icon: 'mic', type: 'ai-marketing', category: 'ai-marketing' },

  // ============================================
  // DEVELOPER TOOLS
  // ============================================
  { id: 'code-beautifier', title: 'Code Beautifier', description: 'Format and beautify code', icon: 'code', type: 'developer', category: 'developer' },
  { id: 'code-minifier', title: 'Code Minifier', description: 'Minify code', icon: 'minimize', type: 'developer', category: 'developer' },
  { id: 'sql-formatter', title: 'SQL Formatter', description: 'Format SQL queries', icon: 'database', type: 'developer', category: 'developer' },
  { id: 'regex-generator', title: 'Regex Generator', description: 'Generate regular expressions', icon: 'regex', type: 'developer', category: 'developer' },
  { id: 'json-path', title: 'JSON Path Tool', description: 'Query JSON with paths', icon: 'route', type: 'developer', category: 'developer' },
  { id: 'markdown-editor', title: 'Markdown Editor', description: 'Edit markdown files', icon: 'file-text', type: 'developer', category: 'developer' },
  { id: 'cron-builder', title: 'Cron Builder', description: 'Build cron expressions', icon: 'clock', type: 'developer', category: 'developer' },
  { id: 'chmod-calculator', title: 'Chmod Calculator', description: 'Calculate file permissions', icon: 'lock', type: 'developer', category: 'developer' },
  { id: 'git-command', title: 'Git Command Helper', description: 'Git command reference', icon: 'git-branch', type: 'developer', category: 'developer' },
  { id: 'regex-cheatsheet', title: 'Regex Cheatsheet', description: 'Regex quick reference', icon: 'book', type: 'developer', category: 'developer' },
  { id: 'css-gradient', title: 'CSS Gradient Generator', description: 'Create CSS gradients', icon: 'paintbrush', type: 'developer', category: 'developer' },
  { id: 'data-visualizer', title: 'Data Visualizer', description: 'Visualize data', icon: 'bar-chart', type: 'developer', category: 'developer' },

  // ============================================
  // HEALTH & WELLNESS
  // ============================================
  { id: 'calorie-calculator', title: 'Calorie Calculator', description: 'Calculate daily calories', icon: 'flame', type: 'calculator', category: 'health-wellness' },
  { id: 'sleep-calculator', title: 'Sleep Calculator', description: 'Calculate sleep cycles', icon: 'moon', type: 'calculator', category: 'health-wellness' },
  { id: 'sleep-cycle-calculator', title: 'Sleep Cycle Calculator', description: 'Optimize sleep timing', icon: 'moon', type: 'calculator', category: 'health-wellness' },
  { id: 'due-date-calculator', title: 'Due Date Calculator', description: 'Calculate pregnancy due date', icon: 'baby', type: 'calculator', category: 'health-wellness' },
  { id: 'water-intake', title: 'Water Intake Calculator', description: 'Calculate water needs', icon: 'droplet', type: 'calculator', category: 'health-wellness' },
  { id: 'drink-water-reminder', title: 'Water Reminder', description: 'Remind to drink water', icon: 'droplets', type: 'reminder', category: 'health-wellness' },
  { id: 'body-fat-calculator', title: 'Body Fat Calculator', description: 'Calculate body fat', icon: 'activity', type: 'calculator', category: 'health-wellness' },
  { id: 'ideal-weight', title: 'Ideal Weight Calculator', description: 'Calculate ideal weight', icon: 'scale', type: 'calculator', category: 'health-wellness' },
  { id: 'heart-rate-zone', title: 'Heart Rate Zones', description: 'Calculate heart rate zones', icon: 'heart-pulse', type: 'calculator', category: 'health-wellness' },
  { id: 'macro-calculator', title: 'Macro Calculator', description: 'Calculate macros', icon: 'pie-chart', type: 'calculator', category: 'health-wellness' },
  { id: 'caffeine-calculator', title: 'Caffeine Calculator', description: 'Track caffeine intake', icon: 'coffee', type: 'calculator', category: 'health-wellness' },
  { id: 'hydration-calculator', title: 'Hydration Calculator', description: 'Calculate hydration needs', icon: 'droplet', type: 'calculator', category: 'health-wellness' },
  { id: 'protein-calculator', title: 'Protein Calculator', description: 'Calculate protein needs', icon: 'beef', type: 'calculator', category: 'health-wellness' },
  { id: 'alcohol-calculator', title: 'Alcohol Calculator', description: 'Track alcohol consumption', icon: 'wine', type: 'calculator', category: 'health-wellness' },
  { id: 'calories-burned', title: 'Calories Burned', description: 'Calculate calories burned', icon: 'flame', type: 'calculator', category: 'health-wellness' },
  { id: 'medication-reminder', title: 'Medication Reminder', description: 'Track medications', icon: 'pill', type: 'reminder', category: 'health-wellness' },
  { id: 'vision-test', title: 'Vision Test', description: 'Basic vision screening', icon: 'eye', type: 'tool', category: 'health-wellness' },
  { id: 'posture-checker', title: 'Posture Checker', description: 'Check your posture', icon: 'person-standing', type: 'tool', category: 'health-wellness' },
  { id: 'breathing-exercise', title: 'Breathing Exercise', description: 'Guided breathing', icon: 'wind', type: 'tool', category: 'health-wellness' },
  { id: 'stretch-timer', title: 'Stretch Timer', description: 'Timed stretching exercises', icon: 'stretch-horizontal', type: 'timer', category: 'health-wellness' },
  { id: 'noise-exposure-calculator', title: 'Noise Exposure', description: 'Calculate noise exposure', icon: 'volume-2', type: 'calculator', category: 'health-wellness' },
  { id: 'blood-pressure-log', title: 'Blood Pressure Log', description: 'Track blood pressure', icon: 'heart', type: 'tracker', category: 'health-wellness' },
  { id: 'mood-tracker', title: 'Mood Tracker', description: 'Track daily mood', icon: 'smile', type: 'tracker', category: 'health-wellness' },
  { id: 'gratitude-journal', title: 'Gratitude Journal', description: 'Daily gratitude practice', icon: 'heart', type: 'tracker', category: 'health-wellness' },
  { id: 'screen-break-reminder', title: 'Screen Break Reminder', description: 'Take screen breaks', icon: 'monitor', type: 'reminder', category: 'health-wellness' },
  { id: 'blood-type-diet', title: 'Blood Type Diet', description: 'Diet by blood type', icon: 'droplet', type: 'guide', category: 'health-wellness' },
  { id: 'vitamin-tracker', title: 'Vitamin Tracker', description: 'Track vitamin intake', icon: 'pill', type: 'tracker', category: 'health-wellness' },
  { id: 'first-aid-guide', title: 'First Aid Guide', description: 'Emergency first aid', icon: 'cross', type: 'guide', category: 'health-wellness' },
  { id: 'sunscreen-calculator', title: 'Sunscreen Calculator', description: 'Calculate SPF needs', icon: 'sun', type: 'calculator', category: 'health-wellness' },
  { id: 'contact-lens-reminder', title: 'Contact Lens Reminder', description: 'Track lens schedule', icon: 'eye', type: 'reminder', category: 'health-wellness' },
  { id: 'allergy-scanner', title: 'Allergy Scanner', description: 'Check for allergens', icon: 'alert-circle', type: 'tool', category: 'health-wellness' },
  { id: 'emergency-contacts', title: 'Emergency Contacts', description: 'Store emergency info', icon: 'phone', type: 'tool', category: 'health-wellness' },
  { id: 'skin-care-routine', title: 'Skin Care Routine', description: 'Plan skin care', icon: 'droplet', type: 'planner', category: 'health-wellness' },
  { id: 'hair-care-guide', title: 'Hair Care Guide', description: 'Hair care tips', icon: 'scissors', type: 'guide', category: 'health-wellness' },
  { id: 'nail-art-designer', title: 'Nail Art Designer', description: 'Design nail art', icon: 'palette', type: 'designer', category: 'health-wellness' },

  // ============================================
  // FITNESS & SPORTS
  // ============================================
  { id: 'running-pace-calculator', title: 'Running Pace Calculator', description: 'Calculate running pace', icon: 'timer', type: 'calculator', category: 'fitness-sports' },
  { id: 'split-timer', title: 'Split Timer', description: 'Track lap times', icon: 'timer', type: 'timer', category: 'fitness-sports' },
  { id: 'interval-timer', title: 'Interval Timer', description: 'HIIT interval timing', icon: 'clock', type: 'timer', category: 'fitness-sports' },
  { id: 'rep-max-calculator', title: '1 Rep Max Calculator', description: 'Calculate 1RM', icon: 'dumbbell', type: 'calculator', category: 'fitness-sports' },
  { id: 'swim-pace-calculator', title: 'Swim Pace Calculator', description: 'Calculate swim pace', icon: 'waves', type: 'calculator', category: 'fitness-sports' },
  { id: 'cycling-power-calculator', title: 'Cycling Power', description: 'Calculate cycling power', icon: 'bike', type: 'calculator', category: 'fitness-sports' },
  { id: 'golf-handicap-calculator', title: 'Golf Handicap', description: 'Calculate golf handicap', icon: 'golf', type: 'calculator', category: 'fitness-sports' },
  { id: 'bowling-score-calculator', title: 'Bowling Score', description: 'Calculate bowling score', icon: 'circle', type: 'calculator', category: 'fitness-sports' },
  { id: 'archery-score', title: 'Archery Score', description: 'Track archery scores', icon: 'target', type: 'calculator', category: 'fitness-sports' },
  { id: 'darts-score', title: 'Darts Score', description: 'Track darts scores', icon: 'target', type: 'calculator', category: 'fitness-sports' },
  { id: 'workout-planner', title: 'Workout Planner', description: 'Plan workouts', icon: 'dumbbell', type: 'planner', category: 'fitness-sports' },
  { id: 'personal-trainer', title: 'Personal Trainer', description: 'Workout guidance', icon: 'user', type: 'guide', category: 'fitness-sports' },
  { id: 'fitness-instructor', title: 'Fitness Instructor', description: 'Exercise instructions', icon: 'activity', type: 'guide', category: 'fitness-sports' },
  { id: 'ski-wax', title: 'Ski Wax Guide', description: 'Ski wax recommendations', icon: 'snowflake', type: 'guide', category: 'fitness-sports' },
  { id: 'fishing-conditions', title: 'Fishing Conditions', description: 'Check fishing conditions', icon: 'fish', type: 'tool', category: 'fitness-sports' },
  { id: 'hiking-trail-planner', title: 'Hiking Trail Planner', description: 'Plan hiking trails', icon: 'mountain', type: 'planner', category: 'fitness-sports' },
  { id: 'bike-maintenance', title: 'Bike Maintenance', description: 'Bike maintenance guide', icon: 'bike', type: 'guide', category: 'fitness-sports' },
  { id: 'camping-checklist', title: 'Camping Checklist', description: 'Camping preparation list', icon: 'tent', type: 'checklist', category: 'fitness-sports' },

  // ============================================
  // FINANCE
  // ============================================
  { id: 'compound-interest', title: 'Compound Interest', description: 'Calculate compound interest', icon: 'trending-up', type: 'calculator', category: 'finance' },
  { id: 'savings-goal', title: 'Savings Goal', description: 'Track savings goals', icon: 'piggy-bank', type: 'calculator', category: 'finance' },
  { id: 'salary-calculator', title: 'Salary Calculator', description: 'Calculate salary breakdown', icon: 'banknote', type: 'calculator', category: 'finance' },
  { id: 'interest-calculator', title: 'Interest Calculator', description: 'Calculate interest', icon: 'percent', type: 'calculator', category: 'finance' },
  { id: 'meeting-cost', title: 'Meeting Cost Calculator', description: 'Calculate meeting costs', icon: 'users', type: 'calculator', category: 'finance' },
  { id: 'profit-margin', title: 'Profit Margin Calculator', description: 'Calculate profit margins', icon: 'trending-up', type: 'calculator', category: 'finance' },
  { id: 'roi-calculator', title: 'ROI Calculator', description: 'Calculate return on investment', icon: 'bar-chart', type: 'calculator', category: 'finance' },
  { id: 'break-even-calculator', title: 'Break Even Calculator', description: 'Calculate break even point', icon: 'target', type: 'calculator', category: 'finance' },
  { id: 'tax-estimator', title: 'Tax Estimator', description: 'Estimate taxes', icon: 'calculator', type: 'calculator', category: 'finance' },
  { id: 'rent-vs-buy', title: 'Rent vs Buy Calculator', description: 'Compare renting vs buying', icon: 'home', type: 'calculator', category: 'finance' },
  { id: 'split-bill', title: 'Split Bill', description: 'Split bills among friends', icon: 'users', type: 'calculator', category: 'finance' },
  { id: 'tip-split', title: 'Tip Split Calculator', description: 'Split tips', icon: 'receipt', type: 'calculator', category: 'finance' },
  { id: 'budget-planner', title: 'Budget Planner', description: 'Plan your budget', icon: 'wallet', type: 'planner', category: 'finance' },
  { id: 'budget-dashboard', title: 'Budget Dashboard', description: 'Track budget', icon: 'pie-chart', type: 'dashboard', category: 'finance' },
  { id: 'net-worth-calculator', title: 'Net Worth Calculator', description: 'Calculate net worth', icon: 'trending-up', type: 'calculator', category: 'finance' },
  { id: 'investment-growth', title: 'Investment Growth', description: 'Project investment growth', icon: 'line-chart', type: 'calculator', category: 'finance' },
  { id: 'discount-stacker', title: 'Discount Stacker', description: 'Stack multiple discounts', icon: 'percent', type: 'calculator', category: 'finance' },
  { id: 'price-comparator', title: 'Price Comparator', description: 'Compare prices', icon: 'shopping-cart', type: 'calculator', category: 'finance' },
  { id: 'unit-price', title: 'Unit Price Calculator', description: 'Calculate unit prices', icon: 'tag', type: 'calculator', category: 'finance' },
  { id: 'mileage-log', title: 'Mileage Log', description: 'Track mileage for taxes', icon: 'car', type: 'tracker', category: 'finance' },
  { id: 'electricity-cost', title: 'Electricity Cost', description: 'Calculate electricity costs', icon: 'zap', type: 'calculator', category: 'finance' },
  { id: 'mortgage-comparison', title: 'Mortgage Comparison', description: 'Compare mortgages', icon: 'home', type: 'calculator', category: 'finance' },
  { id: 'rental-yield-calculator', title: 'Rental Yield', description: 'Calculate rental yield', icon: 'building-2', type: 'calculator', category: 'finance' },
  { id: 'car-loan-calculator', title: 'Car Loan Calculator', description: 'Calculate car loans', icon: 'car', type: 'calculator', category: 'finance' },
  { id: 'wedding-budget', title: 'Wedding Budget', description: 'Plan wedding budget', icon: 'heart', type: 'planner', category: 'finance' },
  { id: 'allowance-calculator', title: 'Allowance Calculator', description: 'Calculate kids allowance', icon: 'coins', type: 'calculator', category: 'finance' },
  { id: 'gift-budget-planner', title: 'Gift Budget Planner', description: 'Plan gift spending', icon: 'gift', type: 'planner', category: 'finance' },

  // ============================================
  // COOKING & KITCHEN
  // ============================================
  { id: 'recipe-writer', title: 'Recipe Writer', description: 'Write recipes', icon: 'book', type: 'generator', category: 'cooking' },
  { id: 'recipe-scaler', title: 'Recipe Scaler', description: 'Scale recipe portions', icon: 'scale', type: 'calculator', category: 'cooking' },
  { id: 'brew-ratio', title: 'Coffee Brew Ratio', description: 'Calculate coffee ratios', icon: 'coffee', type: 'calculator', category: 'cooking' },
  { id: 'grilling-timer', title: 'Grilling Timer', description: 'Time your grilling', icon: 'flame', type: 'timer', category: 'cooking' },
  { id: 'meat-thawing', title: 'Meat Thawing Calculator', description: 'Calculate thaw time', icon: 'snowflake', type: 'calculator', category: 'cooking' },
  { id: 'turkey-thawing', title: 'Turkey Thawing', description: 'Calculate turkey thaw time', icon: 'bird', type: 'calculator', category: 'cooking' },
  { id: 'egg-boiling', title: 'Egg Boiling Timer', description: 'Perfect boiled eggs', icon: 'egg', type: 'timer', category: 'cooking' },
  { id: 'egg-timer', title: 'Egg Timer', description: 'Egg cooking times', icon: 'timer', type: 'timer', category: 'cooking' },
  { id: 'pasta-portion', title: 'Pasta Portion Calculator', description: 'Calculate pasta portions', icon: 'utensils', type: 'calculator', category: 'cooking' },
  { id: 'rice-water-ratio', title: 'Rice Water Ratio', description: 'Perfect rice ratios', icon: 'droplet', type: 'calculator', category: 'cooking' },
  { id: 'steak-doneness', title: 'Steak Doneness Guide', description: 'Cook perfect steaks', icon: 'beef', type: 'guide', category: 'cooking' },
  { id: 'baking-substitution', title: 'Baking Substitutions', description: 'Find ingredient substitutes', icon: 'cookie', type: 'guide', category: 'cooking' },
  { id: 'sourdough-starter', title: 'Sourdough Starter', description: 'Manage sourdough', icon: 'croissant', type: 'calculator', category: 'cooking' },
  { id: 'sourdough-calculator', title: 'Sourdough Calculator', description: 'Calculate sourdough', icon: 'croissant', type: 'calculator', category: 'cooking' },
  { id: 'pizza-dough', title: 'Pizza Dough Calculator', description: 'Perfect pizza dough', icon: 'pizza', type: 'calculator', category: 'cooking' },
  { id: 'pizza-dough-calculator', title: 'Pizza Dough', description: 'Calculate pizza dough', icon: 'pizza', type: 'calculator', category: 'cooking' },
  { id: 'canning-timer', title: 'Canning Timer', description: 'Canning processing times', icon: 'jar', type: 'timer', category: 'cooking' },
  { id: 'wine-serving', title: 'Wine Serving Guide', description: 'Wine serving tips', icon: 'wine', type: 'guide', category: 'cooking' },
  { id: 'cocktail-mixer', title: 'Cocktail Mixer', description: 'Mix cocktails', icon: 'martini', type: 'guide', category: 'cooking' },
  { id: 'home-brewing', title: 'Home Brewing', description: 'Home brew recipes', icon: 'beer', type: 'guide', category: 'cooking' },
  { id: 'meal-planner', title: 'Meal Planner', description: 'Plan weekly meals', icon: 'calendar', type: 'planner', category: 'cooking' },

  // ============================================
  // HOME & DIY
  // ============================================
  { id: 'paint-calculator', title: 'Paint Calculator', description: 'Calculate paint needed', icon: 'paint-bucket', type: 'calculator', category: 'home-diy' },
  { id: 'electricity-bill', title: 'Electricity Bill', description: 'Estimate electricity bill', icon: 'zap', type: 'calculator', category: 'home-diy' },
  { id: 'concrete-calculator', title: 'Concrete Calculator', description: 'Calculate concrete needed', icon: 'box', type: 'calculator', category: 'home-diy' },
  { id: 'fence-calculator', title: 'Fence Calculator', description: 'Calculate fence materials', icon: 'fence', type: 'calculator', category: 'home-diy' },
  { id: 'mulch-calculator', title: 'Mulch Calculator', description: 'Calculate mulch needed', icon: 'leaf', type: 'calculator', category: 'home-diy' },
  { id: 'pool-volume-calculator', title: 'Pool Volume', description: 'Calculate pool volume', icon: 'waves', type: 'calculator', category: 'home-diy' },
  { id: 'pool-volume', title: 'Pool Volume Tool', description: 'Pool capacity calculator', icon: 'waves', type: 'calculator', category: 'home-diy' },
  { id: 'deck-board-calculator', title: 'Deck Board Calculator', description: 'Calculate deck boards', icon: 'layout', type: 'calculator', category: 'home-diy' },
  { id: 'drywall-calculator', title: 'Drywall Calculator', description: 'Calculate drywall', icon: 'square', type: 'calculator', category: 'home-diy' },
  { id: 'tile-calculator', title: 'Tile Calculator', description: 'Calculate tiles needed', icon: 'grid', type: 'calculator', category: 'home-diy' },
  { id: 'wallpaper-calculator', title: 'Wallpaper Calculator', description: 'Calculate wallpaper', icon: 'scroll', type: 'calculator', category: 'home-diy' },
  { id: 'flooring-calculator', title: 'Flooring Calculator', description: 'Calculate flooring', icon: 'layout-grid', type: 'calculator', category: 'home-diy' },
  { id: 'insulation-calculator', title: 'Insulation Calculator', description: 'Calculate insulation', icon: 'thermometer', type: 'calculator', category: 'home-diy' },
  { id: 'roofing-calculator', title: 'Roofing Calculator', description: 'Calculate roofing', icon: 'home', type: 'calculator', category: 'home-diy' },
  { id: 'stair-calculator', title: 'Stair Calculator', description: 'Calculate stair dimensions', icon: 'steps', type: 'calculator', category: 'home-diy' },
  { id: 'sod-calculator', title: 'Sod Calculator', description: 'Calculate sod needed', icon: 'flower', type: 'calculator', category: 'home-diy' },
  { id: 'gravel-calculator', title: 'Gravel Calculator', description: 'Calculate gravel', icon: 'mountain', type: 'calculator', category: 'home-diy' },
  { id: 'retaining-wall-calculator', title: 'Retaining Wall', description: 'Calculate wall materials', icon: 'brick-wall', type: 'calculator', category: 'home-diy' },
  { id: 'plywood-calculator', title: 'Plywood Calculator', description: 'Calculate plywood', icon: 'layers', type: 'calculator', category: 'home-diy' },
  { id: 'crown-molding-calculator', title: 'Crown Molding', description: 'Calculate crown molding', icon: 'ruler', type: 'calculator', category: 'home-diy' },
  { id: 'ac-unit-sizer', title: 'AC Unit Sizer', description: 'Size AC units', icon: 'fan', type: 'calculator', category: 'home-diy' },
  { id: 'water-heater-sizer', title: 'Water Heater Sizer', description: 'Size water heaters', icon: 'droplet', type: 'calculator', category: 'home-diy' },
  { id: 'generator-sizer', title: 'Generator Sizer', description: 'Size generators', icon: 'zap', type: 'calculator', category: 'home-diy' },
  { id: 'solar-panel-calculator', title: 'Solar Panel Calculator', description: 'Calculate solar needs', icon: 'sun', type: 'calculator', category: 'home-diy' },
  { id: 'pool-chemical', title: 'Pool Chemical Calculator', description: 'Pool chemistry balance', icon: 'beaker', type: 'calculator', category: 'home-diy' },
  { id: 'hot-tub-maintenance', title: 'Hot Tub Maintenance', description: 'Hot tub care guide', icon: 'bath', type: 'guide', category: 'home-diy' },
  { id: 'laundry-calculator', title: 'Laundry Calculator', description: 'Laundry load calculator', icon: 'shirt', type: 'calculator', category: 'home-diy' },
  { id: 'dishwasher-loading', title: 'Dishwasher Loading', description: 'Optimize loading', icon: 'dish', type: 'guide', category: 'home-diy' },
  { id: 'ironing-guide', title: 'Ironing Guide', description: 'Fabric ironing guide', icon: 'iron', type: 'guide', category: 'home-diy' },
  { id: 'storage-unit-sizer', title: 'Storage Unit Sizer', description: 'Size storage units', icon: 'box', type: 'calculator', category: 'home-diy' },
  { id: 'closet-organizer', title: 'Closet Organizer', description: 'Organize closets', icon: 'layout', type: 'planner', category: 'home-diy' },
  { id: 'moving-cost-estimator', title: 'Moving Cost Estimator', description: 'Estimate moving costs', icon: 'truck', type: 'calculator', category: 'home-diy' },
  { id: 'home-inventory', title: 'Home Inventory', description: 'Track home items', icon: 'list', type: 'tracker', category: 'home-diy' },

  // ============================================
  // GARDENING
  // ============================================
  { id: 'plant-watering', title: 'Plant Watering Guide', description: 'Plant watering schedule', icon: 'flower', type: 'guide', category: 'gardening' },
  { id: 'plant-hardiness-zone', title: 'Plant Hardiness Zone', description: 'Find your zone', icon: 'map', type: 'tool', category: 'gardening' },
  { id: 'seed-starting', title: 'Seed Starting Guide', description: 'When to start seeds', icon: 'sprout', type: 'guide', category: 'gardening' },
  { id: 'compost-ratio', title: 'Compost Ratio', description: 'Compost green/brown ratio', icon: 'recycle', type: 'calculator', category: 'gardening' },
  { id: 'lawn-fertilizer', title: 'Lawn Fertilizer', description: 'Calculate fertilizer', icon: 'flower', type: 'calculator', category: 'gardening' },
  { id: 'sprinkler-calculator', title: 'Sprinkler Calculator', description: 'Plan sprinkler coverage', icon: 'droplet', type: 'calculator', category: 'gardening' },
  { id: 'raised-bed-calculator', title: 'Raised Bed Calculator', description: 'Calculate soil volume', icon: 'box', type: 'calculator', category: 'gardening' },
  { id: 'greenhouse-sizing', title: 'Greenhouse Sizing', description: 'Size your greenhouse', icon: 'home', type: 'calculator', category: 'gardening' },
  { id: 'chicken-coop-calculator', title: 'Chicken Coop Size', description: 'Size chicken coop', icon: 'bird', type: 'calculator', category: 'gardening' },
  { id: 'beehive-calculator', title: 'Beehive Calculator', description: 'Beekeeping calculations', icon: 'hexagon', type: 'calculator', category: 'gardening' },
  { id: 'garden-center', title: 'Garden Center', description: 'Garden management', icon: 'flower-2', type: 'tool', category: 'gardening' },

  // ============================================
  // AUTOMOTIVE
  // ============================================
  { id: 'gas-mileage-calculator', title: 'Gas Mileage', description: 'Calculate MPG', icon: 'gauge', type: 'calculator', category: 'automotive' },
  { id: 'fuel-cost-calculator', title: 'Fuel Cost Calculator', description: 'Calculate fuel costs', icon: 'fuel', type: 'calculator', category: 'automotive' },
  { id: 'fuel-cost', title: 'Fuel Cost', description: 'Estimate fuel costs', icon: 'fuel', type: 'calculator', category: 'automotive' },
  { id: 'tire-age-calculator', title: 'Tire Age Calculator', description: 'Calculate tire age', icon: 'circle', type: 'calculator', category: 'automotive' },
  { id: 'oil-change-reminder', title: 'Oil Change Reminder', description: 'Track oil changes', icon: 'droplet', type: 'reminder', category: 'automotive' },
  { id: 'tire-pressure-guide', title: 'Tire Pressure Guide', description: 'Tire pressure reference', icon: 'gauge', type: 'guide', category: 'automotive' },
  { id: 'vehicle-inspection', title: 'Vehicle Inspection', description: 'Inspection checklist', icon: 'check-circle', type: 'checklist', category: 'automotive' },
  { id: 'car-wash', title: 'Car Wash Tracker', description: 'Track car washes', icon: 'car', type: 'tracker', category: 'automotive' },
  { id: 'auto-detailing', title: 'Auto Detailing', description: 'Detailing guide', icon: 'sparkles', type: 'guide', category: 'automotive' },
  { id: 'parts-catalog', title: 'Parts Catalog', description: 'Auto parts inventory and catalog management', icon: 'package', type: 'tool', category: 'automotive' },
  { id: 'dealer-inventory', title: 'Dealer Inventory', description: 'Vehicle dealer inventory and sales management', icon: 'building', type: 'tool', category: 'automotive' },

  // ============================================
  // PET CARE
  // ============================================
  { id: 'pet-care', title: 'Pet Care Manager', description: 'Comprehensive pet care and health tracking', icon: 'paw-print', type: 'tracker', category: 'pet-care' },
  { id: 'pet-age', title: 'Pet Age Calculator', description: 'Calculate pet age in human years', icon: 'dog', type: 'calculator', category: 'pet-care' },
  { id: 'pet-food-calculator', title: 'Pet Food Calculator', description: 'Calculate food portions', icon: 'paw-print', type: 'calculator', category: 'pet-care' },
  { id: 'pet-medication-tracker', title: 'Pet Medication', description: 'Track pet medications', icon: 'pill', type: 'tracker', category: 'pet-care' },
  { id: 'dog-walking-timer', title: 'Dog Walking Timer', description: 'Time dog walks', icon: 'dog', type: 'timer', category: 'pet-care' },
  { id: 'aquarium-calculator', title: 'Aquarium Calculator', description: 'Aquarium calculations', icon: 'fish', type: 'calculator', category: 'pet-care' },
  { id: 'bird-feeding-guide', title: 'Bird Feeding Guide', description: 'Bird care guide', icon: 'bird', type: 'guide', category: 'pet-care' },
  { id: 'pet-grooming', title: 'Pet Grooming', description: 'Grooming schedule', icon: 'scissors', type: 'planner', category: 'pet-care' },
  { id: 'veterinary-records', title: 'Veterinary Records', description: 'Track vet visits', icon: 'clipboard', type: 'tracker', category: 'pet-care' },

  // ============================================
  // TRAVEL
  // ============================================
  { id: 'jet-lag-calculator', title: 'Jet Lag Calculator', description: 'Minimize jet lag', icon: 'plane', type: 'calculator', category: 'travel' },
  { id: 'packing-list', title: 'Packing List', description: 'Travel packing list', icon: 'luggage', type: 'checklist', category: 'travel' },
  { id: 'travel-vaccine-guide', title: 'Travel Vaccine Guide', description: 'Required vaccinations', icon: 'syringe', type: 'guide', category: 'travel' },
  { id: 'visa-requirements', title: 'Visa Requirements', description: 'Visa information', icon: 'file-text', type: 'guide', category: 'travel' },
  { id: 'luggage-weight', title: 'Luggage Weight', description: 'Luggage allowance checker', icon: 'scale', type: 'calculator', category: 'travel' },
  { id: 'cruise-planner', title: 'Cruise Planner', description: 'Plan cruise trips', icon: 'ship', type: 'planner', category: 'travel' },
  { id: 'road-trip-planner', title: 'Road Trip Planner', description: 'Plan road trips', icon: 'map', type: 'planner', category: 'travel' },
  { id: 'wardrobe-planner', title: 'Wardrobe Planner', description: 'Plan travel wardrobe', icon: 'shirt', type: 'planner', category: 'travel' },

  // ============================================
  // LIFESTYLE
  // ============================================
  { id: 'zodiac-compatibility', title: 'Zodiac Compatibility', description: 'Check zodiac match', icon: 'star', type: 'tool', category: 'lifestyle' },
  { id: 'chinese-zodiac', title: 'Chinese Zodiac', description: 'Find your zodiac animal', icon: 'star', type: 'tool', category: 'lifestyle' },
  { id: 'birthstone-finder', title: 'Birthstone Finder', description: 'Find your birthstone', icon: 'gem', type: 'tool', category: 'lifestyle' },
  { id: 'life-path-number', title: 'Life Path Number', description: 'Numerology calculator', icon: 'hash', type: 'calculator', category: 'lifestyle' },
  { id: 'lottery-odds', title: 'Lottery Odds Calculator', description: 'Calculate lottery odds', icon: 'ticket', type: 'calculator', category: 'lifestyle' },
  { id: 'ring-size-calculator', title: 'Ring Size Calculator', description: 'Find ring size', icon: 'circle', type: 'calculator', category: 'lifestyle' },
  { id: 'baby-name-generator', title: 'Baby Name Generator', description: 'Generate baby names', icon: 'baby', type: 'generator', category: 'lifestyle' },
  { id: 'chore-chart', title: 'Chore Chart', description: 'Family chore tracker', icon: 'check-square', type: 'tracker', category: 'lifestyle' },
  { id: 'conversation-starters', title: 'Conversation Starters', description: 'Icebreaker questions', icon: 'message-circle', type: 'generator', category: 'lifestyle' },
  { id: 'book-summary', title: 'Book Summary', description: 'Generate book summaries', icon: 'book', type: 'generator', category: 'lifestyle' },
  { id: 'habit-streak', title: 'Habit Streak Tracker', description: 'Track habits', icon: 'flame', type: 'tracker', category: 'lifestyle' },
  { id: 'party-planner', title: 'Party Planner', description: 'Plan parties', icon: 'party-popper', type: 'planner', category: 'lifestyle' },
  { id: 'wedding-planner', title: 'Wedding Planner', description: 'Plan weddings', icon: 'heart', type: 'planner', category: 'lifestyle' },

  // ============================================
  // EDUCATION
  // ============================================
  { id: 'flashcard', title: 'Flashcard Tool', description: 'Create flashcards', icon: 'cards', type: 'tool', category: 'education' },
  { id: 'citation-generator', title: 'Citation Generator', description: 'Generate citations', icon: 'quote', type: 'generator', category: 'education' },
  { id: 'grade-calculator', title: 'Grade Calculator', description: 'Calculate grades', icon: 'graduation-cap', type: 'calculator', category: 'education' },
  { id: 'reading-time-estimator', title: 'Reading Time Estimator', description: 'Estimate reading time', icon: 'book-open', type: 'calculator', category: 'education' },
  { id: 'reading-time', title: 'Reading Time', description: 'Calculate reading time', icon: 'clock', type: 'calculator', category: 'education' },
  { id: 'periodic-table', title: 'Periodic Table', description: 'Interactive periodic table', icon: 'atom', type: 'reference', category: 'education' },
  { id: 'study-timer', title: 'Study Timer', description: 'Focused study sessions', icon: 'clock', type: 'timer', category: 'education' },
  { id: 'typing-speed', title: 'Typing Speed Test', description: 'Test typing speed', icon: 'keyboard', type: 'tool', category: 'education' },
  { id: 'study-planner', title: 'Study Planner', description: 'Plan study sessions', icon: 'calendar', type: 'planner', category: 'education' },
  { id: 'spelling-bee-helper', title: 'Spelling Bee Helper', description: 'Practice spelling', icon: 'spell-check', type: 'tool', category: 'education' },
  { id: 'math-facts-practice', title: 'Math Facts Practice', description: 'Practice math facts', icon: 'calculator', type: 'tool', category: 'education' },
  { id: 'handwriting-practice', title: 'Handwriting Practice', description: 'Practice handwriting', icon: 'pen-tool', type: 'tool', category: 'education' },
  { id: 'word-of-the-day', title: 'Word of the Day', description: 'Daily vocabulary', icon: 'book', type: 'tool', category: 'education' },
  { id: 'language-phrasebook', title: 'Language Phrasebook', description: 'Common phrases', icon: 'languages', type: 'reference', category: 'education' },
  { id: 'tutoring-scheduler', title: 'Tutoring Scheduler', description: 'Schedule tutoring', icon: 'calendar', type: 'planner', category: 'education' },
  { id: 'student-progress', title: 'Student Progress', description: 'Track progress', icon: 'trending-up', type: 'tracker', category: 'education' },
  { id: 'student-enrollment', title: 'Student Enrollment', description: 'Student enrollment and registration management', icon: 'user-plus', type: 'tool', category: 'education' },
  { id: 'lesson-planner', title: 'Lesson Planner', description: 'Create and schedule lesson plans with activities', icon: 'book-open', type: 'planner', category: 'education' },
  { id: 'tuition-payment', title: 'Tuition Payment', description: 'Tuition and fee payment tracking and invoicing', icon: 'credit-card', type: 'tool', category: 'education' },

  // ============================================
  // MUSIC & AUDIO
  // ============================================
  { id: 'bpm-tapper', title: 'BPM Tapper', description: 'Tap tempo finder', icon: 'music', type: 'tool', category: 'music' },
  { id: 'metronome', title: 'Metronome', description: 'Digital metronome', icon: 'timer', type: 'tool', category: 'music' },
  { id: 'music-theory', title: 'Music Theory Tool', description: 'Learn music theory', icon: 'music', type: 'reference', category: 'music' },
  { id: 'chord-progression', title: 'Chord Progression', description: 'Generate chord progressions', icon: 'music', type: 'generator', category: 'music' },
  { id: 'guitar-tuner', title: 'Guitar Tuner', description: 'Tune your guitar', icon: 'music', type: 'tool', category: 'music' },
  { id: 'drum-pattern', title: 'Drum Pattern Generator', description: 'Create drum patterns', icon: 'drum', type: 'generator', category: 'music' },
  { id: 'white-noise', title: 'White Noise Generator', description: 'Focus sounds', icon: 'volume-2', type: 'tool', category: 'music' },
  { id: 'text-to-speech', title: 'Text to Speech', description: 'Convert text to audio', icon: 'volume', type: 'tool', category: 'music' },
  { id: 'audio-extractor', title: 'Audio Extractor', description: 'Extract audio from video', icon: 'music', type: 'tool', category: 'music' },
  { id: 'subtitle-generator', title: 'Subtitle Generator', description: 'Generate subtitles', icon: 'subtitles', type: 'generator', category: 'music' },
  { id: 'video-trimmer', title: 'Video Trimmer', description: 'Trim video clips', icon: 'scissors', type: 'tool', category: 'music' },
  { id: 'video-thumbnail', title: 'Video Thumbnail Maker', description: 'Create thumbnails', icon: 'image', type: 'tool', category: 'music' },
  { id: 'recording-studio', title: 'Recording Studio', description: 'Recording management', icon: 'mic', type: 'tool', category: 'music' },
  { id: 'music-venue', title: 'Music Venue Manager', description: 'Venue management', icon: 'music', type: 'tool', category: 'music' },
  { id: 'studio-booking', title: 'Studio Booking', description: 'Manage studio session bookings, rooms, and equipment', icon: 'calendar-check', type: 'tool', category: 'music' },
  { id: 'project-tracker-music', title: 'Music Project Tracker', description: 'Track albums, EPs, singles with phases and budgets', icon: 'album', type: 'tool', category: 'music' },
  { id: 'client-masters', title: 'Client Masters', description: 'Manage client masters, delivery formats, and approvals', icon: 'disc', type: 'tool', category: 'music' },
  { id: 'equipment-log-studio', title: 'Studio Equipment Log', description: 'Track studio equipment inventory and maintenance', icon: 'settings', type: 'tool', category: 'music' },
  { id: 'royalty-tracker', title: 'Royalty Tracker', description: 'Track music royalties, catalog earnings, and payments', icon: 'dollar-sign', type: 'tool', category: 'music' },

  // ============================================
  // CRAFTS & DIY HOBBIES
  // ============================================
  { id: 'knitting-row-counter', title: 'Knitting Row Counter', description: 'Count knitting rows', icon: 'hash', type: 'counter', category: 'crafts' },
  { id: 'sewing-pattern-sizer', title: 'Sewing Pattern Sizer', description: 'Size sewing patterns', icon: 'scissors', type: 'calculator', category: 'crafts' },
  { id: 'soap-making-calculator', title: 'Soap Making Calculator', description: 'Soap recipe calculator', icon: 'droplet', type: 'calculator', category: 'crafts' },
  { id: 'candle-making', title: 'Candle Making Guide', description: 'Candle making recipes', icon: 'flame', type: 'guide', category: 'crafts' },
  { id: 'resin-calculator', title: 'Resin Calculator', description: 'Calculate resin amounts', icon: 'box', type: 'calculator', category: 'crafts' },
  { id: 'paper-craft-sizer', title: 'Paper Craft Sizer', description: 'Paper dimensions', icon: 'file', type: 'calculator', category: 'crafts' },
  { id: 'frame-sizer', title: 'Frame Sizer', description: 'Picture frame sizes', icon: 'frame', type: 'calculator', category: 'crafts' },
  { id: 'pottery-studio', title: 'Pottery Studio', description: 'Pottery management', icon: 'cup-soda', type: 'tool', category: 'crafts' },
  { id: 'art-class', title: 'Art Class Manager', description: 'Art class management', icon: 'palette', type: 'tool', category: 'crafts' },
  { id: 'alterations', title: 'Alterations Calculator', description: 'Clothing alterations', icon: 'scissors', type: 'calculator', category: 'crafts' },
  { id: 'embroidery-shop', title: 'Embroidery Shop', description: 'Embroidery management', icon: 'needle', type: 'tool', category: 'crafts' },

  // ============================================
  // ENTERTAINMENT & GAMES
  // ============================================
  { id: 'dice-roller', title: 'Dice Roller', description: 'Roll virtual dice', icon: 'dice-1', type: 'tool', category: 'entertainment' },
  { id: 'coin-flipper', title: 'Coin Flipper', description: 'Flip a virtual coin', icon: 'circle', type: 'tool', category: 'entertainment' },
  { id: 'flip-coin', title: 'Flip Coin', description: 'Simple coin flip', icon: 'circle-dot', type: 'tool', category: 'entertainment' },
  { id: 'decision-maker', title: 'Decision Maker', description: 'Random decision helper', icon: 'shuffle', type: 'tool', category: 'entertainment' },
  { id: 'dice-probability', title: 'Dice Probability', description: 'Calculate dice odds', icon: 'dice-1', type: 'calculator', category: 'entertainment' },
  { id: 'photo-booth-props', title: 'Photo Booth Props', description: 'Photo booth ideas', icon: 'camera', type: 'generator', category: 'entertainment' },
  { id: 'escape-room-timer', title: 'Escape Room Timer', description: 'Escape room countdown', icon: 'clock', type: 'timer', category: 'entertainment' },
  { id: 'scavenger-hunt', title: 'Scavenger Hunt Generator', description: 'Create scavenger hunts', icon: 'map', type: 'generator', category: 'entertainment' },
  { id: 'trivia-scoreboard', title: 'Trivia Scoreboard', description: 'Track trivia scores', icon: 'trophy', type: 'tracker', category: 'entertainment' },
  { id: 'bingo-card-generator', title: 'Bingo Card Generator', description: 'Generate bingo cards', icon: 'grid', type: 'generator', category: 'entertainment' },
  { id: 'movie-night-picker', title: 'Movie Night Picker', description: 'Pick a movie', icon: 'film', type: 'tool', category: 'entertainment' },
  { id: 'book-club-tracker', title: 'Book Club Tracker', description: 'Track book club reads', icon: 'book', type: 'tracker', category: 'entertainment' },
  { id: 'podcast-tracker', title: 'Podcast Tracker', description: 'Track podcasts', icon: 'headphones', type: 'tracker', category: 'entertainment' },
  { id: 'gaming-session-log', title: 'Gaming Session Log', description: 'Log gaming sessions', icon: 'gamepad-2', type: 'tracker', category: 'entertainment' },
  { id: 'stream-deck-planner', title: 'Stream Deck Planner', description: 'Plan stream layout', icon: 'layout', type: 'planner', category: 'entertainment' },
  { id: 'tabletop-rpg', title: 'Tabletop RPG Tools', description: 'RPG game helpers', icon: 'dice-6', type: 'tool', category: 'entertainment' },
  { id: 'escape-room-business', title: 'Escape Room Business', description: 'Escape room management', icon: 'lock', type: 'tool', category: 'entertainment' },
  { id: 'bowling-alley', title: 'Bowling Alley Manager', description: 'Bowling alley management', icon: 'circle', type: 'tool', category: 'entertainment' },
  { id: 'arcade', title: 'Arcade Manager', description: 'Arcade management', icon: 'gamepad-2', type: 'tool', category: 'entertainment' },

  // ============================================
  // PRODUCTIVITY
  // ============================================
  { id: 'checklist', title: 'Checklist Tool', description: 'Create checklists', icon: 'check-square', type: 'tool', category: 'productivity' },
  { id: 'notepad', title: 'Quick Notepad', description: 'Simple note taking', icon: 'sticky-note', type: 'tool', category: 'productivity' },
  { id: 'goal-tracker', title: 'Goal Tracker', description: 'Track goals', icon: 'target', type: 'tracker', category: 'productivity' },
  { id: 'emoji-picker', title: 'Emoji Picker', description: 'Find and copy emojis', icon: 'smile', type: 'tool', category: 'productivity' },
  { id: 'kanban-board', title: 'Kanban Board', description: 'Task management', icon: 'columns', type: 'tool', category: 'productivity' },
  { id: 'project-manager', title: 'Project Manager', description: 'Manage projects', icon: 'folder', type: 'tool', category: 'productivity' },
  { id: 'project-timeline', title: 'Project Timeline', description: 'Project scheduling', icon: 'gantt-chart', type: 'planner', category: 'productivity' },
  { id: 'event-scheduler', title: 'Event Scheduler', description: 'Schedule events', icon: 'calendar', type: 'planner', category: 'productivity' },
  { id: 'timezone-meeting-planner', title: 'Timezone Meeting', description: 'Schedule across timezones', icon: 'globe', type: 'planner', category: 'productivity' },
  { id: 'freelance-timer', title: 'Freelance Timer', description: 'Track billable hours', icon: 'clock', type: 'timer', category: 'productivity' },
  { id: 'password-vault', title: 'Password Vault', description: 'Manage passwords', icon: 'lock', type: 'tool', category: 'productivity' },
  { id: 'password-strength', title: 'Password Strength', description: 'Check password strength', icon: 'shield', type: 'tool', category: 'productivity' },

  // ============================================
  // BUSINESS TOOLS
  // ============================================
  { id: 'client-portal', title: 'Client Portal', description: 'Client management', icon: 'users', type: 'tool', category: 'business' },
  { id: 'legal-case-manager', title: 'Legal Case Manager', description: 'Case management', icon: 'briefcase', type: 'tool', category: 'business' },
  { id: 'legal-billing', title: 'Legal Billing', description: 'Legal time billing', icon: 'receipt', type: 'tool', category: 'business' },
  { id: 'case-intake', title: 'Case Intake', description: 'Manage legal case intake and client screening', icon: 'clipboard-list', type: 'legal', category: 'legal' },
  { id: 'client-agreement', title: 'Client Agreement', description: 'Manage legal client engagement agreements and retainers', icon: 'file-text', type: 'legal', category: 'legal' },
  { id: 'court-calendar', title: 'Court Calendar', description: 'Manage court dates, hearings, and legal deadlines', icon: 'gavel', type: 'legal', category: 'legal' },
  { id: 'deposition-scheduler', title: 'Deposition Scheduler', description: 'Schedule and manage depositions and witness preparation', icon: 'users', type: 'legal', category: 'legal' },
  { id: 'document-review', title: 'Document Review', description: 'Manage legal document review and privilege logs', icon: 'file-search', type: 'legal', category: 'legal' },
  { id: 'matter-management', title: 'Matter Management', description: 'Legal matter and case management', icon: 'briefcase', type: 'tool', category: 'professional' },
  { id: 'time-entry', title: 'Time Entry', description: 'Attorney time tracking and billing entries', icon: 'clock', type: 'tool', category: 'professional' },
  { id: 'trust-account', title: 'Trust Account', description: 'IOLTA and trust account management', icon: 'landmark', type: 'tool', category: 'professional' },
  { id: 'conflict-check', title: 'Conflict Check', description: 'Conflict of interest checking', icon: 'shield-alert', type: 'tool', category: 'professional' },
  { id: 'witness-list', title: 'Witness List', description: 'Witness management and tracking', icon: 'users', type: 'tool', category: 'professional' },
  { id: 'pleading-drafter', title: 'Pleading Drafter', description: 'Draft legal pleading documents with party management and formatting', icon: 'scale', type: 'tool', category: 'professional' },
  { id: 'construction-bid', title: 'Construction Bid', description: 'Create construction bids', icon: 'hard-hat', type: 'tool', category: 'business' },
  { id: 'property-manager', title: 'Property Manager', description: 'Manage properties', icon: 'building-2', type: 'tool', category: 'business' },
  { id: 'menu-builder', title: 'Menu Builder', description: 'Create restaurant menus', icon: 'utensils', type: 'tool', category: 'business' },
  { id: 'table-reservation', title: 'Table Reservation', description: 'Restaurant reservations', icon: 'calendar', type: 'tool', category: 'business' },
  { id: 'kitchen-order', title: 'Kitchen Order System', description: 'Kitchen order management', icon: 'clipboard', type: 'tool', category: 'business' },
  { id: 'table-management', title: 'Table Management', description: 'Restaurant floor table management with status tracking', icon: 'layout-grid', type: 'tool', category: 'business' },
  { id: 'waitlist', title: 'Waitlist Manager', description: 'Customer waitlist and queue management', icon: 'users', type: 'tool', category: 'business' },
  { id: 'kitchen-display', title: 'Kitchen Display System', description: 'Kitchen order display and ticket management', icon: 'monitor', type: 'tool', category: 'business' },
  { id: 'menu-engineering', title: 'Menu Engineering', description: 'Menu item profitability analysis and optimization', icon: 'pie-chart', type: 'tool', category: 'business' },
  { id: 'food-cost-calculator', title: 'Food Cost Calculator', description: 'Calculate food cost percentages and pricing', icon: 'calculator', type: 'calculator', category: 'business' },
  { id: 'recipe-costing', title: 'Recipe Costing', description: 'Calculate recipe costs and suggested pricing', icon: 'utensils', type: 'calculator', category: 'business' },
  { id: 'temperature-log', title: 'Temperature Log', description: 'Food safety temperature logging and compliance', icon: 'thermometer', type: 'tracker', category: 'business' },
  { id: 'food-safety-checklist', title: 'Food Safety Checklist', description: 'Daily food safety inspection checklist', icon: 'clipboard-check', type: 'tool', category: 'business' },
  { id: 'tip-pool-calculator', title: 'Tip Pool Calculator', description: 'Calculate and distribute tip pools among staff', icon: 'coins', type: 'calculator', category: 'business' },
  { id: 'server-section', title: 'Server Section Assignment', description: 'Assign servers to floor sections and tables', icon: 'users', type: 'tool', category: 'business' },
  { id: 'salon-booking', title: 'Salon Booking', description: 'Salon appointments', icon: 'calendar', type: 'tool', category: 'business' },
  { id: 'salon-client-records', title: 'Salon Client Records', description: 'Client management', icon: 'users', type: 'tool', category: 'business' },
  { id: 'service-pricing', title: 'Service Pricing', description: 'Price services', icon: 'tag', type: 'calculator', category: 'business' },
  { id: 'salon-appointment', title: 'Salon Appointment', description: 'Manage salon appointments with client details, services, and stylist assignments', icon: 'calendar-check', type: 'tool', category: 'business' },
  { id: 'stylist-schedule', title: 'Stylist Schedule', description: 'Manage stylist work schedules, time off requests, and availability', icon: 'calendar-clock', type: 'tool', category: 'business' },
  { id: 'service-menu', title: 'Service Menu', description: 'Manage salon service menu with categories, pricing, and packages', icon: 'list', type: 'tool', category: 'business' },
  { id: 'client-history', title: 'Client History', description: 'Track client service history, preferences, notes, and membership status', icon: 'history', type: 'tool', category: 'business' },
  { id: 'product-inventory-salon', title: 'Salon Product Inventory', description: 'Manage salon product inventory, suppliers, and stock levels', icon: 'package', type: 'tool', category: 'business' },
  { id: 'photo-shoot-planner', title: 'Photo Shoot Planner', description: 'Plan photo shoots', icon: 'camera', type: 'planner', category: 'business' },
  { id: 'photo-editing-tracker', title: 'Photo Editing Tracker', description: 'Track editing projects', icon: 'image', type: 'tracker', category: 'business' },
  { id: 'event-vendor-manager', title: 'Event Vendor Manager', description: 'Manage vendors', icon: 'users', type: 'tool', category: 'business' },
  { id: 'event-timeline', title: 'Event Timeline', description: 'Plan event timeline', icon: 'clock', type: 'planner', category: 'business' },
  { id: 'guest-list-manager', title: 'Guest List Manager', description: 'Manage guest lists', icon: 'users', type: 'tool', category: 'business' },
  { id: 'cleaning-service', title: 'Cleaning Service', description: 'Cleaning business tools', icon: 'sparkles', type: 'tool', category: 'business' },
  { id: 'landscaping-estimate', title: 'Landscaping Estimate', description: 'Create estimates', icon: 'flower', type: 'calculator', category: 'business' },
  { id: 'bookkeeping', title: 'Bookkeeping Tool', description: 'Simple bookkeeping', icon: 'book', type: 'tool', category: 'business' },
  { id: 'customer-database', title: 'Customer Database', description: 'Manage customers and contacts', icon: 'users', type: 'tool', category: 'business' },
  { id: 'expense-tracker', title: 'Expense Tracker', description: 'Track business expenses', icon: 'receipt', type: 'tracker', category: 'business' },
  { id: 'inventory-manager', title: 'Inventory Manager', description: 'Track products and stock levels', icon: 'package', type: 'tool', category: 'business' },
  { id: 'invoice-manager', title: 'Invoice Manager', description: 'Create and manage invoices', icon: 'file-text', type: 'tool', category: 'business' },
  { id: 'time-tracker', title: 'Time Tracker', description: 'Track billable time by project', icon: 'clock', type: 'tracker', category: 'business' },
  { id: 'lead-tracker', title: 'Lead Tracker', description: 'Sales pipeline and lead management', icon: 'target', type: 'tracker', category: 'business' },
  { id: 'appointment-scheduler', title: 'Appointment Scheduler', description: 'Schedule and manage appointments', icon: 'calendar', type: 'planner', category: 'business' },
  { id: 'quote-builder', title: 'Quote Builder', description: 'Create quotes and estimates', icon: 'file-check', type: 'tool', category: 'business' },
  { id: 'project-manager-tool', title: 'Project Manager', description: 'Manage projects and tasks', icon: 'folder', type: 'tool', category: 'business' },
  { id: 'employee-database', title: 'Employee Database', description: 'HR and employee management', icon: 'users', type: 'tool', category: 'business' },
  { id: 'subscription-manager', title: 'Subscription Manager', description: 'Track subscriptions and renewals', icon: 'credit-card', type: 'tracker', category: 'finance' },
  { id: 'bill-payment-tracker', title: 'Bill Payment Tracker', description: 'Track bills and payments', icon: 'receipt', type: 'tracker', category: 'finance' },
  { id: 'patient-records', title: 'Patient Records', description: 'Healthcare patient management', icon: 'heart', type: 'tool', category: 'healthcare' },
  { id: 'property-manager-data', title: 'Property Manager', description: 'Real estate property management', icon: 'home', type: 'tool', category: 'real-estate' },
  { id: 'case-manager', title: 'Case Manager', description: 'Legal case management', icon: 'scale', type: 'tool', category: 'legal' },
  { id: 'student-database', title: 'Student Database', description: 'Education student management', icon: 'graduation-cap', type: 'tool', category: 'education' },
  { id: 'donor-manager', title: 'Donor Manager', description: 'Non-profit donor management', icon: 'heart', type: 'tool', category: 'non-profit' },
  // Phase 5: Additional Industry Tools
  { id: 'vehicle-service', title: 'Vehicle Service', description: 'Auto repair and service management', icon: 'car', type: 'tool', category: 'automotive' },
  { id: 'recipe-collection', title: 'Recipe Collection', description: 'Organize and manage recipes', icon: 'utensils', type: 'tool', category: 'food' },
  { id: 'volunteer-manager', title: 'Volunteer Manager', description: 'Non-profit volunteer coordination', icon: 'users', type: 'tool', category: 'non-profit' },
  { id: 'membership-manager', title: 'Membership Manager', description: 'Gym and club membership management', icon: 'id-card', type: 'tool', category: 'fitness' },
  // Phase 6: Mixed Industry Tools
  { id: 'gradebook', title: 'Grade Book', description: 'Track student grades and assignments', icon: 'book-open', type: 'tool', category: 'education' },
  { id: 'tenant-database', title: 'Tenant Database', description: 'Manage tenants, leases, and payments', icon: 'home', type: 'tool', category: 'real-estate' },
  { id: 'work-order', title: 'Work Order', description: 'Manufacturing and construction work orders', icon: 'clipboard-list', type: 'tool', category: 'manufacturing' },
  { id: 'fleet-manager', title: 'Fleet Manager', description: 'Vehicle fleet and driver management', icon: 'truck', type: 'tool', category: 'logistics' },
  { id: 'event-guestlist', title: 'Event Guest List', description: 'Event guest management and RSVPs', icon: 'users', type: 'tool', category: 'events' },
  { id: 'class-schedule', title: 'Class Schedule', description: 'Fitness or education class scheduling', icon: 'calendar', type: 'planner', category: 'fitness' },
  { id: 'crop-tracker', title: 'Crop Tracker', description: 'Agricultural crop and harvest tracking', icon: 'leaf', type: 'tracker', category: 'agriculture' },
  { id: 'order-management', title: 'Order Management', description: 'E-commerce order tracking', icon: 'shopping-cart', type: 'tool', category: 'ecommerce' },
  { id: 'content-calendar', title: 'Content Calendar', description: 'Plan and schedule content', icon: 'layout', type: 'planner', category: 'marketing' },
  { id: 'attendance-tracker', title: 'Attendance Tracker', description: 'Track member/student attendance', icon: 'check-square', type: 'tracker', category: 'education' },
  // Phase 7: Additional Industry Tools
  { id: 'livestock-tracker', title: 'Livestock Tracker', description: 'Farm animal inventory and health records', icon: 'activity', type: 'tracker', category: 'agriculture' },
  { id: 'room-booking', title: 'Room Booking', description: 'Hotel room reservations and availability', icon: 'bed', type: 'planner', category: 'hospitality' },
  { id: 'room-reservation', title: 'Room Reservation', description: 'Hotel room reservations', icon: 'bed', type: 'contextual-tool', category: 'hospitality' },
  { id: 'guest-check-in', title: 'Guest Check-In', description: 'Guest check-in management', icon: 'user-plus', type: 'contextual-tool', category: 'hospitality' },
  { id: 'guest-check-out', title: 'Guest Check-Out', description: 'Guest check-out management', icon: 'user-minus', type: 'contextual-tool', category: 'hospitality' },
  { id: 'housekeeping-schedule', title: 'Housekeeping Schedule', description: 'Housekeeping schedule tracker', icon: 'spray-can', type: 'contextual-tool', category: 'hospitality' },
  { id: 'room-status', title: 'Room Status', description: 'Room status tracker', icon: 'door-open', type: 'contextual-tool', category: 'hospitality' },
  { id: 'lost-and-found', title: 'Lost and Found', description: 'Lost and found log', icon: 'search', type: 'contextual-tool', category: 'hospitality' },
  { id: 'guest-request', title: 'Guest Request', description: 'Guest service requests', icon: 'bell', type: 'contextual-tool', category: 'hospitality' },
  { id: 'vip-guest', title: 'VIP Guest', description: 'VIP guest management', icon: 'crown', type: 'contextual-tool', category: 'hospitality' },
  { id: 'night-audit', title: 'Night Audit', description: 'Night audit reports', icon: 'moon', type: 'contextual-tool', category: 'hospitality' },
  { id: 'guest-feedback', title: 'Guest Feedback', description: 'Guest feedback tracker', icon: 'message-square', type: 'contextual-tool', category: 'hospitality' },
  { id: 'quality-control', title: 'Quality Control', description: 'Manufacturing QC inspection tracking', icon: 'check-circle', type: 'tracker', category: 'manufacturing' },
  { id: 'production-scheduler', title: 'Production Scheduler', description: 'Manufacturing production order scheduling and tracking', icon: 'calendar-clock', type: 'planner', category: 'manufacturing' },
  { id: 'bom-manager', title: 'BOM Manager', description: 'Bill of Materials management with components and costs', icon: 'layers', type: 'tool', category: 'manufacturing' },
  { id: 'quality-inspection', title: 'Quality Inspection', description: 'Product quality inspection records and checkpoints', icon: 'clipboard-check', type: 'tracker', category: 'manufacturing' },
  { id: 'machine-maintenance', title: 'Machine Maintenance', description: 'Manufacturing equipment maintenance scheduling and logs', icon: 'settings', type: 'tracker', category: 'manufacturing' },
  { id: 'downtime-log', title: 'Downtime Log', description: 'Production line downtime tracking and analysis', icon: 'alert-triangle', type: 'tracker', category: 'manufacturing' },
  { id: 'oee-calculator', title: 'OEE Calculator', description: 'Overall Equipment Effectiveness calculation and tracking', icon: 'gauge', type: 'calculator', category: 'manufacturing' },
  { id: 'first-article-inspection', title: 'First Article Inspection', description: 'First article inspection documentation and tracking', icon: 'file-check', type: 'tracker', category: 'manufacturing' },
  { id: 'calibration-log', title: 'Calibration Log', description: 'Equipment calibration tracking and scheduling', icon: 'ruler', type: 'tracker', category: 'manufacturing' },
  { id: 'tool-crib', title: 'Tool Crib', description: 'Tool inventory and checkout management system', icon: 'wrench', type: 'tool', category: 'manufacturing' },
  { id: 'shipment-tracker', title: 'Shipment Tracker', description: 'Package and shipment tracking', icon: 'package', type: 'tracker', category: 'logistics' },
  { id: 'job-site-manager', title: 'Job Site Manager', description: 'Construction site and crew management', icon: 'hard-hat', type: 'tool', category: 'construction' },
  { id: 'permit-tracker', title: 'Permit Tracker', description: 'Government permits and licenses tracking', icon: 'file-check', type: 'tracker', category: 'government' },
  { id: 'collection-inventory', title: 'Collection Inventory', description: 'Collectibles and hobby inventory', icon: 'archive', type: 'tracker', category: 'hobby' },
  { id: 'member-directory', title: 'Member Directory', description: 'Community or organization member database', icon: 'users', type: 'tool', category: 'community' },
  { id: 'child-checkin', title: 'Child Check-In', description: 'Childcare and daycare check-in system', icon: 'baby', type: 'tracker', category: 'childcare' },
  { id: 'experiment-log', title: 'Experiment Log', description: 'Scientific research and experiment tracking', icon: 'flask', type: 'tool', category: 'science' },

  // ============================================
  // PROFESSIONAL SERVICES
  // ============================================
  { id: 'medical-scheduler', title: 'Medical Scheduler', description: 'Medical appointments', icon: 'calendar', type: 'planner', category: 'professional' },
  { id: 'prescription-tracker', title: 'Prescription Tracker', description: 'Track prescriptions', icon: 'pill', type: 'tracker', category: 'professional' },
  { id: 'prescription-filling', title: 'Prescription Filling', description: 'Manage pharmacy prescription filling workflow with patient info, drug details, insurance, and status tracking', icon: 'pill', type: 'tool', category: 'professional' },
  { id: 'drug-interaction', title: 'Drug Interaction Checker', description: 'Check for potential drug-drug interactions and maintain interaction database', icon: 'alert-triangle', type: 'tool', category: 'professional' },
  { id: 'controlled-substance', title: 'Controlled Substance Log', description: 'DEA perpetual inventory tracking for Schedule II-V controlled substances', icon: 'shield-alert', type: 'tool', category: 'professional' },
  { id: 'compounding-log', title: 'Compounding Log', description: 'USP 795/797/800 compliant compounding documentation with ingredient tracking and quality checks', icon: 'beaker', type: 'tool', category: 'professional' },
  { id: 'pharmacy-inventory', title: 'Pharmacy Inventory', description: 'Drug inventory management with reorder alerts, expiration tracking, and purchase orders', icon: 'package', type: 'tool', category: 'professional' },
  { id: 'expiration-date', title: 'Expiration Tracking', description: 'Monitor drug expiration dates, manage quarantine, and document destruction of outdated inventory', icon: 'calendar-clock', type: 'tool', category: 'professional' },
  { id: 'patient-counseling', title: 'Patient Counseling', description: 'Document medication counseling sessions with topics, side effects, and patient understanding assessment', icon: 'message-circle', type: 'tool', category: 'professional' },
  { id: 'medication-sync', title: 'Medication Sync', description: 'Synchronize patient medications to a single monthly pickup date for improved adherence', icon: 'refresh-cw', type: 'tool', category: 'professional' },
  { id: 'transfer-rx', title: 'Prescription Transfer', description: 'Manage incoming and outgoing prescription transfers between pharmacies with full documentation', icon: 'arrow-left-right', type: 'tool', category: 'professional' },
  { id: 'prior-authorization', title: 'Prior Authorization', description: 'Submit and track insurance prior authorization requests with clinical justification', icon: 'file-check', type: 'tool', category: 'professional' },
  { id: 'mtm-service', title: 'MTM Services', description: 'Medication Therapy Management with comprehensive medication reviews, DRP tracking, and billing', icon: 'heart-pulse', type: 'tool', category: 'professional' },
  { id: 'refill-reminder', title: 'Refill Reminder', description: 'Manage patient medication refill reminders via phone, email, or SMS with templates', icon: 'bell', type: 'tool', category: 'professional' },
  { id: 'dental-chart', title: 'Dental Chart', description: 'Dental charting', icon: 'smile', type: 'tool', category: 'professional' },
  { id: 'treatment-plan', title: 'Treatment Plan', description: 'Create and manage dental treatment plans with CDT codes and cost estimates', icon: 'clipboard-list', type: 'tool', category: 'professional' },
  { id: 'dental-insurance', title: 'Dental Insurance', description: 'Verify dental insurance coverage and track claims', icon: 'shield-check', type: 'tool', category: 'professional' },
  { id: 'recall-scheduler', title: 'Recall Scheduler', description: 'Schedule and manage patient recall appointments', icon: 'calendar-clock', type: 'tool', category: 'professional' },
  { id: 'lab-case', title: 'Lab Case Tracker', description: 'Track dental lab cases from submission to delivery', icon: 'flask-conical', type: 'tool', category: 'professional' },
  { id: 'massage-therapy', title: 'Massage Therapy', description: 'Massage scheduling', icon: 'hand', type: 'tool', category: 'professional' },
  { id: 'plumbing-service', title: 'Plumbing Service', description: 'Plumbing job tracking', icon: 'wrench', type: 'tool', category: 'professional' },
  { id: 'electrical-service', title: 'Electrical Service', description: 'Electrical job tracking', icon: 'zap', type: 'tool', category: 'professional' },
  { id: 'insurance-quote', title: 'Insurance Quote', description: 'Generate quotes', icon: 'shield', type: 'calculator', category: 'professional' },
  { id: 'it-support', title: 'IT Support Tool', description: 'IT ticket management', icon: 'headset', type: 'tool', category: 'professional' },
  { id: 'translation-service', title: 'Translation Service', description: 'Translation management', icon: 'languages', type: 'tool', category: 'professional' },
  { id: 'phone-repair', title: 'Phone Repair', description: 'Phone repair tracking', icon: 'smartphone', type: 'tool', category: 'professional' },
  { id: 'roofing-contractor', title: 'Roofing Contractor', description: 'Roofing job management', icon: 'home', type: 'tool', category: 'professional' },
  { id: 'painting-contractor', title: 'Painting Contractor', description: 'Painting job management', icon: 'paintbrush', type: 'tool', category: 'professional' },
  { id: 'handyman', title: 'Handyman Tool', description: 'Handyman job tracking', icon: 'wrench', type: 'tool', category: 'professional' },
  { id: 'pest-control', title: 'Pest Control', description: 'Pest control management', icon: 'bug', type: 'tool', category: 'professional' },
  { id: 'appliance-repair', title: 'Appliance Repair', description: 'Appliance repair tracking', icon: 'wrench', type: 'tool', category: 'professional' },
  { id: 'locksmith', title: 'Locksmith Tool', description: 'Locksmith job tracking', icon: 'key', type: 'tool', category: 'professional' },
  { id: 'window-cleaning', title: 'Window Cleaning', description: 'Window cleaning management', icon: 'sparkles', type: 'tool', category: 'professional' },

  // ============================================
  // WEATHER & ENVIRONMENT
  // ============================================
  { id: 'wind-chill', title: 'Wind Chill Calculator', description: 'Calculate wind chill', icon: 'wind', type: 'calculator', category: 'weather' },
  { id: 'heat-index', title: 'Heat Index Calculator', description: 'Calculate heat index', icon: 'thermometer', type: 'calculator', category: 'weather' },
  { id: 'uv-index-calculator', title: 'UV Index Calculator', description: 'Check UV levels', icon: 'sun', type: 'calculator', category: 'weather' },
  { id: 'carbon-footprint', title: 'Carbon Footprint', description: 'Calculate carbon footprint', icon: 'leaf', type: 'calculator', category: 'weather' },
  { id: 'air-quality-index', title: 'Air Quality Index', description: 'Check air quality', icon: 'wind', type: 'tool', category: 'weather' },
  { id: 'dew-point-calculator', title: 'Dew Point Calculator', description: 'Calculate dew point', icon: 'droplet', type: 'calculator', category: 'weather' },
  { id: 'sun-angle-calculator', title: 'Sun Angle Calculator', description: 'Calculate sun angle', icon: 'sun', type: 'calculator', category: 'weather' },
  { id: 'snow-day-predictor', title: 'Snow Day Predictor', description: 'Predict snow days', icon: 'snowflake', type: 'tool', category: 'weather' },
  { id: 'lightning-distance', title: 'Lightning Distance', description: 'Calculate lightning distance', icon: 'cloud-lightning', type: 'calculator', category: 'weather' },
  { id: 'earthquake-magnitude', title: 'Earthquake Magnitude', description: 'Understand magnitudes', icon: 'activity', type: 'reference', category: 'weather' },
  { id: 'moon-phase', title: 'Moon Phase Calculator', description: 'Current moon phase', icon: 'moon', type: 'tool', category: 'weather' },

  // ============================================
  // PHOTOGRAPHY
  // ============================================
  { id: 'dof-calculator', title: 'Depth of Field Calculator', description: 'Calculate DoF', icon: 'camera', type: 'calculator', category: 'photography' },
  { id: 'exposure-calculator', title: 'Exposure Calculator', description: 'Calculate exposure', icon: 'aperture', type: 'calculator', category: 'photography' },

  // ============================================
  // MISSING TOOLS - Added Dec 2024
  // ============================================

  // Calculators & Utilities (Additional)
  { id: 'age-difference', title: 'Age Difference Calculator', description: 'Calculate age difference between two dates', icon: 'users', type: 'calculator', category: 'calculators' },
  { id: 'aspect-ratio', title: 'Aspect Ratio Calculator', description: 'Calculate aspect ratios', icon: 'maximize', type: 'calculator', category: 'calculators' },
  { id: 'battery-life-estimator', title: 'Battery Life Estimator', description: 'Estimate battery life', icon: 'battery', type: 'calculator', category: 'lifestyle' },
  { id: 'file-size-calculator', title: 'File Size Calculator', description: 'Calculate file sizes', icon: 'file', type: 'calculator', category: 'developer' },
  { id: 'lottery-odds-calculator', title: 'Lottery Odds Calculator', description: 'Calculate lottery odds', icon: 'ticket', type: 'calculator', category: 'entertainment' },
  { id: 'pricing-calculator', title: 'Pricing Calculator', description: 'Calculate product pricing', icon: 'dollar-sign', type: 'calculator', category: 'business' },
  { id: 'reading-time-calculator', title: 'Reading Time Calculator', description: 'Calculate reading time', icon: 'book-open', type: 'calculator', category: 'education' },
  { id: 'screen-resolution', title: 'Screen Resolution Tool', description: 'Check screen resolution', icon: 'monitor', type: 'tool', category: 'developer' },
  { id: 'sleep-cycle', title: 'Sleep Cycle Calculator', description: 'Calculate optimal sleep cycles', icon: 'moon', type: 'calculator', category: 'health-wellness' },

  // AI Writing Tools (Additional)
  { id: 'announcement', title: 'Announcement Writer', description: 'Write announcements', icon: 'megaphone', type: 'ai-writing', category: 'ai-writing' },
  { id: 'apology-letter', title: 'Apology Letter Generator', description: 'Generate apology letters', icon: 'heart', type: 'ai-writing', category: 'ai-writing' },
  { id: 'invitation', title: 'Invitation Writer', description: 'Write invitations', icon: 'mail', type: 'ai-writing', category: 'ai-writing' },

  // Business Tools
  { id: 'auction-house', title: 'Auction House Manager', description: 'Manage auction items', icon: 'gavel', type: 'business', category: 'business' },
  { id: 'business-card-designer', title: 'Business Card Designer', description: 'Design business cards', icon: 'credit-card', type: 'design', category: 'business' },
  { id: 'consignment-shop', title: 'Consignment Shop Manager', description: 'Manage consignment items', icon: 'store', type: 'business', category: 'business' },
  { id: 'copy-shop', title: 'Copy Shop Manager', description: 'Manage copy shop orders', icon: 'printer', type: 'business', category: 'business' },
  { id: 'funeral-home', title: 'Funeral Home Manager', description: 'Manage funeral services', icon: 'flower', type: 'business', category: 'professional' },
  { id: 'mailbox-store', title: 'Mailbox Store Manager', description: 'Manage mailbox rentals', icon: 'mail', type: 'business', category: 'business' },
  { id: 'moving-company', title: 'Moving Company Manager', description: 'Manage moving jobs', icon: 'truck', type: 'business', category: 'business' },
  { id: 'party-rental', title: 'Party Rental Manager', description: 'Manage party rentals', icon: 'party-popper', type: 'business', category: 'business' },
  { id: 'sales-tracker', title: 'Sales Tracker', description: 'Track sales', icon: 'trending-up', type: 'business', category: 'business' },
  { id: 'screen-printing', title: 'Screen Printing Manager', description: 'Manage screen printing orders', icon: 'printer', type: 'business', category: 'business' },
  { id: 'service-ticket', title: 'Service Ticket Manager', description: 'Manage service tickets', icon: 'ticket', type: 'business', category: 'business' },
  { id: 'trophy-shop', title: 'Trophy Shop Manager', description: 'Manage trophy orders', icon: 'trophy', type: 'business', category: 'business' },

  // Retail & Specialty Shops
  { id: 'bicycle-shop', title: 'Bicycle Shop Manager', description: 'Manage bicycle shop', icon: 'bike', type: 'business', category: 'business' },
  { id: 'brewery', title: 'Brewery Manager', description: 'Manage brewery operations', icon: 'beer', type: 'business', category: 'business' },
  { id: 'climbing-gym', title: 'Climbing Gym Manager', description: 'Manage climbing gym', icon: 'mountain', type: 'business', category: 'business' },
  { id: 'comic-book-store', title: 'Comic Book Store Manager', description: 'Manage comic inventory', icon: 'book', type: 'business', category: 'business' },
  { id: 'record-store', title: 'Record Store Manager', description: 'Manage record inventory', icon: 'disc', type: 'business', category: 'business' },
  { id: 'shoe-repair', title: 'Shoe Repair Manager', description: 'Manage shoe repairs', icon: 'footprints', type: 'business', category: 'business' },
  { id: 'shooting-range', title: 'Shooting Range Manager', description: 'Manage shooting range', icon: 'target', type: 'business', category: 'business' },
  { id: 'ski-shop', title: 'Ski Shop Manager', description: 'Manage ski equipment', icon: 'snowflake', type: 'business', category: 'business' },
  { id: 'tattoo-shop', title: 'Tattoo Shop Manager', description: 'Manage tattoo appointments', icon: 'pen-tool', type: 'business', category: 'business' },
  { id: 'upholstery', title: 'Upholstery Manager', description: 'Manage upholstery jobs', icon: 'sofa', type: 'business', category: 'business' },

  // Childcare & Education (Additional)
  { id: 'daycare-management', title: 'Daycare Management', description: 'Manage daycare operations', icon: 'baby', type: 'business', category: 'professional' },

  // Health & Wellness Trackers
  { id: 'habit-tracker', title: 'Habit Tracker', description: 'Track daily habits', icon: 'check-circle', type: 'tracker', category: 'productivity' },
  { id: 'sleep-tracker', title: 'Sleep Tracker', description: 'Track sleep patterns', icon: 'moon', type: 'tracker', category: 'health-wellness' },
  { id: 'weight-tracker', title: 'Weight Tracker', description: 'Track weight changes', icon: 'scale', type: 'tracker', category: 'health-wellness' },
  { id: 'workout-log', title: 'Workout Log', description: 'Log workout sessions', icon: 'dumbbell', type: 'tracker', category: 'fitness-sports' },

  // Personal Productivity
  { id: 'contact-manager', title: 'Contact Manager', description: 'Manage contacts', icon: 'users', type: 'productivity', category: 'productivity' },
  { id: 'journal', title: 'Journal', description: 'Daily journaling', icon: 'book-open', type: 'productivity', category: 'productivity' },
  { id: 'reading-list', title: 'Reading List', description: 'Track reading list', icon: 'book', type: 'productivity', category: 'productivity' },
  { id: 'shopping-list', title: 'Shopping List', description: 'Create shopping lists', icon: 'shopping-cart', type: 'productivity', category: 'productivity' },
  { id: 'task-manager', title: 'Task Manager', description: 'Manage tasks', icon: 'check-square', type: 'productivity', category: 'productivity' },
  { id: 'todo-list', title: 'Todo List', description: 'Create todo lists', icon: 'list', type: 'productivity', category: 'productivity' },

  // Event & Scheduling (Additional)
  { id: 'shift-scheduler', title: 'Shift Scheduler', description: 'Schedule work shifts', icon: 'calendar', type: 'business', category: 'business' },
  { id: 'social-media-scheduler', title: 'Social Media Scheduler', description: 'Schedule social posts', icon: 'share', type: 'marketing', category: 'ai-marketing' },

  // Finance & Tracking
  { id: 'portfolio-tracker', title: 'Portfolio Tracker', description: 'Track investments', icon: 'trending-up', type: 'finance', category: 'finance' },
  { id: 'receipt-tracker', title: 'Receipt Tracker', description: 'Track receipts', icon: 'receipt', type: 'finance', category: 'finance' },
  { id: 'rental-tracker', title: 'Rental Tracker', description: 'Track rentals', icon: 'home', type: 'finance', category: 'finance' },
  { id: 'travel-budget', title: 'Travel Budget Planner', description: 'Plan travel budget', icon: 'plane', type: 'finance', category: 'travel' },
  { id: 'warranty-tracker', title: 'Warranty Tracker', description: 'Track warranties', icon: 'shield', type: 'tracker', category: 'lifestyle' },

  // Maintenance & Repair
  { id: 'maintenance-scheduler', title: 'Maintenance Scheduler', description: 'Schedule maintenance', icon: 'wrench', type: 'tool', category: 'home-diy' },
  { id: 'repair-log', title: 'Repair Log', description: 'Log repairs', icon: 'tool', type: 'tracker', category: 'home-diy' },
  { id: 'vehicle-maintenance', title: 'Vehicle Maintenance Tracker', description: 'Track vehicle maintenance', icon: 'car', type: 'tracker', category: 'automotive' },

  // Media & Creative (Additional)
  { id: 'audio-video', title: 'Audio Video Manager', description: 'Manage AV equipment', icon: 'video', type: 'tool', category: 'entertainment' },
  { id: 'video-project', title: 'Video Project Manager', description: 'Manage video projects', icon: 'video', type: 'creative', category: 'entertainment' },

  // Career & Job
  { id: 'job-application', title: 'Job Application Tracker', description: 'Track job applications', icon: 'briefcase', type: 'tracker', category: 'productivity' },
  { id: 'team-roster', title: 'Team Roster', description: 'Manage team roster', icon: 'users', type: 'business', category: 'business' },

  // Plant & Garden
  { id: 'plant-care', title: 'Plant Care Tracker', description: 'Track plant care', icon: 'flower', type: 'tracker', category: 'gardening' },

  // ============================================
  // CONSTRUCTION TOOLS
  // ============================================
  { id: 'project-estimate', title: 'Project Estimate Tool', description: 'Create and manage construction project cost estimates', icon: 'calculator', type: 'contextual-tool', category: 'professional' },
  { id: 'material-takeoff', title: 'Material Takeoff Tool', description: 'Calculate material quantities with waste factors for construction projects', icon: 'clipboard-list', type: 'contextual-tool', category: 'professional' },
  { id: 'subcontractor-bid', title: 'Subcontractor Bid Manager', description: 'Track and compare subcontractor bids by trade', icon: 'users', type: 'contextual-tool', category: 'professional' },
  { id: 'daily-field-report', title: 'Daily Field Report Tool', description: 'Document daily construction site activities, weather, and crew', icon: 'file-text', type: 'contextual-tool', category: 'professional' },
  { id: 'safety-inspection', title: 'Safety Inspection Checklist', description: 'Conduct job site safety inspections with OSHA compliance', icon: 'shield-check', type: 'contextual-tool', category: 'professional' },
  { id: 'equipment-log', title: 'Equipment Log Tool', description: 'Track construction equipment usage, maintenance, and fuel', icon: 'truck', type: 'contextual-tool', category: 'professional' },
  { id: 'change-order', title: 'Change Order Manager', description: 'Create and track construction change orders with cost impacts', icon: 'file-diff', type: 'contextual-tool', category: 'professional' },
  { id: 'punch-list', title: 'Punch List Tracker', description: 'Track construction punch list items to project completion', icon: 'check-square', type: 'contextual-tool', category: 'professional' },
  { id: 'lien-waiver', title: 'Lien Waiver Tracker', description: 'Manage and track lien waivers from contractors and suppliers', icon: 'file-check', type: 'contextual-tool', category: 'professional' },
  { id: 'draw-schedule', title: 'Draw Schedule Manager', description: 'Track construction payment applications and draw requests', icon: 'wallet', type: 'contextual-tool', category: 'professional' },
  { id: 'project-bid', title: 'Project Bid Tool', description: 'Create and manage construction project bids with line items, markup, and cost summaries', icon: 'gavel', type: 'contextual-tool', category: 'professional' },
  { id: 'daily-log-construction', title: 'Daily Construction Log', description: 'Track daily construction activities, weather, crew, equipment, and incidents', icon: 'clipboard-list', type: 'contextual-tool', category: 'professional' },
  { id: 'subcontractor', title: 'Subcontractor Manager', description: 'Manage subcontractors, insurance, licenses, certifications, and performance reviews', icon: 'hard-hat', type: 'contextual-tool', category: 'professional' },

  // ============================================
  // REAL ESTATE TOOLS
  // ============================================
  { id: 'property-listing', title: 'Property Listing Manager', description: 'Manage property listings for sale or rent', icon: 'home', type: 'real-estate', category: 'business' },
  { id: 'rental-application', title: 'Rental Application Tracker', description: 'Track and manage rental applications', icon: 'file-text', type: 'real-estate', category: 'business' },
  { id: 'lease-agreement', title: 'Lease Agreement Generator', description: 'Create and manage lease agreements', icon: 'file-signature', type: 'real-estate', category: 'business' },
  { id: 'property-inspection', title: 'Property Inspection Checklist', description: 'Conduct property inspections with checklists', icon: 'clipboard-check', type: 'real-estate', category: 'business' },
  { id: 'home-valuation', title: 'Home Valuation Tool', description: 'Estimate property values with comparables', icon: 'trending-up', type: 'real-estate', category: 'business' },
  { id: 'open-house-scheduler', title: 'Open House Scheduler', description: 'Schedule and manage open house events', icon: 'calendar-days', type: 'real-estate', category: 'business' },
  { id: 'rent-roll', title: 'Rent Roll Tracker', description: 'Track rental income and tenant payments', icon: 'scroll-text', type: 'real-estate', category: 'business' },
  { id: 'maintenance-request', title: 'Maintenance Request Tracker', description: 'Track and manage maintenance requests', icon: 'wrench', type: 'real-estate', category: 'business' },
  { id: 'vacancy-tracker', title: 'Vacancy Tracker', description: 'Track vacant properties and lost revenue', icon: 'key', type: 'real-estate', category: 'business' },
  { id: 'rent-collection', title: 'Rent Collection Tool', description: 'Track and collect rent payments', icon: 'dollar-sign', type: 'real-estate', category: 'business' },
  { id: 'security-deposit', title: 'Security Deposit Tracker', description: 'Track and manage rental security deposits', icon: 'shield-check', type: 'real-estate', category: 'real-estate' },
  { id: 'mortgage-prequal', title: 'Mortgage Pre-Qualification', description: 'Calculate mortgage pre-qualification amounts', icon: 'home', type: 'real-estate', category: 'real-estate' },
  { id: 'eviction-notice', title: 'Eviction Notice Generator', description: 'Generate and track eviction notices', icon: 'file-warning', type: 'real-estate', category: 'real-estate' },

  // ============================================
  // HEALTHCARE & MEDICAL TOOLS
  // ============================================
  { id: 'patient-intake', title: 'Patient Intake', description: 'Patient registration and intake forms', icon: 'user-plus', type: 'healthcare', category: 'healthcare' },
  { id: 'medical-history', title: 'Medical History', description: 'Track patient medical history', icon: 'clipboard-list', type: 'healthcare', category: 'healthcare' },
  { id: 'allergy-tracker', title: 'Allergy Tracker', description: 'Track patient allergies and reactions', icon: 'alert-triangle', type: 'healthcare', category: 'healthcare' },
  { id: 'chemo-therapy', title: 'Chemotherapy Tracker', description: 'Track chemotherapy treatments, protocols, and side effects', icon: 'activity', type: 'healthcare', category: 'healthcare' },
  { id: 'immunization-record', title: 'Immunization Record', description: 'Vaccination records management', icon: 'syringe', type: 'healthcare', category: 'healthcare' },
  { id: 'lab-results', title: 'Lab Results', description: 'Lab test results tracking', icon: 'test-tube', type: 'healthcare', category: 'healthcare' },
  { id: 'referral-management', title: 'Referral Management', description: 'Patient referrals to specialists', icon: 'share-2', type: 'healthcare', category: 'healthcare' },
  { id: 'insurance-verification', title: 'Insurance Verification', description: 'Verify insurance coverage', icon: 'shield-check', type: 'healthcare', category: 'healthcare' },
  { id: 'medical-billing', title: 'Medical Billing', description: 'Medical billing and claims tracker', icon: 'receipt', type: 'healthcare', category: 'healthcare' },
  { id: 'physician-scheduler', title: 'Physician Scheduler', description: 'Doctor scheduling and appointments', icon: 'calendar', type: 'healthcare', category: 'healthcare' },
  { id: 'clinical-notes', title: 'Clinical Notes', description: 'Clinical documentation and SOAP notes', icon: 'file-text', type: 'healthcare', category: 'healthcare' },
  { id: 'appointment-scheduler-medical', title: 'Medical Appointment Scheduler', description: 'Schedule and manage medical appointments', icon: 'calendar-plus', type: 'healthcare', category: 'healthcare' },
  { id: 'er-triage', title: 'ER Triage', description: 'Emergency room patient triage system', icon: 'stethoscope', type: 'healthcare', category: 'healthcare' },
  { id: 'surgery-scheduler', title: 'Surgery Scheduler', description: 'Schedule and manage surgical procedures', icon: 'scissors', type: 'healthcare', category: 'healthcare' },
  { id: 'dialysis-scheduler', title: 'Dialysis Scheduler', description: 'Schedule and track dialysis treatments', icon: 'droplets', type: 'healthcare', category: 'healthcare' },
  { id: 'radiation-therapy', title: 'Radiation Therapy', description: 'Track radiation therapy treatments and planning', icon: 'radiation', type: 'healthcare', category: 'healthcare' },
  { id: 'home-health', title: 'Home Health Care', description: 'Track home health visits and care plans', icon: 'home', type: 'healthcare', category: 'healthcare' },
  { id: 'hospice-care', title: 'Hospice Care', description: 'Track hospice patient care and family support', icon: 'heart', type: 'healthcare', category: 'healthcare' },
  { id: 'patient-discharge', title: 'Patient Discharge', description: 'Track patient discharge planning and documentation', icon: 'user-check', type: 'healthcare', category: 'healthcare' },
  { id: 'staff-credentialing', title: 'Staff Credentialing', description: 'Manage healthcare staff credentials, licenses, and certifications', icon: 'badge-check', type: 'healthcare', category: 'healthcare' },
  { id: 'medical-device-tracker', title: 'Medical Device Tracker', description: 'Track medical devices, implants, and equipment maintenance', icon: 'cpu', type: 'healthcare', category: 'healthcare' },
  { id: 'clinical-trial', title: 'Clinical Trial Manager', description: 'Manage clinical trial enrollment and patient tracking', icon: 'flask-conical', type: 'healthcare', category: 'healthcare' },
  { id: 'infection-control', title: 'Infection Control', description: 'Track healthcare-associated infections and prevention measures', icon: 'shield-alert', type: 'healthcare', category: 'healthcare' },
  { id: 'medical-consent', title: 'Medical Consent Manager', description: 'Manage patient consent forms, signatures, and compliance tracking', icon: 'file-signature', type: 'healthcare', category: 'healthcare' },
  { id: 'cme-tracker', title: 'CME Tracker', description: 'Track continuing medical education credits and certifications', icon: 'graduation-cap', type: 'healthcare', category: 'healthcare' },
  { id: 'telehealth-scheduler', title: 'Telehealth Scheduler', description: 'Schedule and manage telehealth virtual visits', icon: 'video', type: 'healthcare', category: 'healthcare' },
  { id: 'on-call-scheduler', title: 'On-Call Scheduler', description: 'Manage on-call schedules and physician coverage', icon: 'phone-call', type: 'healthcare', category: 'healthcare' },
  { id: 'patient-portal', title: 'Patient Portal Manager', description: 'Manage patient portal accounts and communications', icon: 'layout-dashboard', type: 'healthcare', category: 'healthcare' },

  // ============================================
  // TRANSPORTATION & LOGISTICS TOOLS
  // ============================================
  { id: 'load-planner', title: 'Load Planner', description: 'Plan and optimize freight loads with equipment and rate calculations', icon: 'boxes', type: 'contextual-tool', category: 'logistics' },
  { id: 'route-optimizer', title: 'Route Optimizer', description: 'Optimize delivery routes with multiple stops and time windows', icon: 'route', type: 'contextual-tool', category: 'logistics' },
  { id: 'driver-log', title: 'Driver Log', description: 'Track driver hours and HOS compliance with duty status management', icon: 'clock', type: 'contextual-tool', category: 'logistics' },
  { id: 'eld-compliance', title: 'ELD Compliance', description: 'Electronic Logging Device compliance and FMCSA reporting', icon: 'tablet', type: 'contextual-tool', category: 'logistics' },
  { id: 'dot-inspection', title: 'DOT Inspection', description: 'DOT vehicle inspection records and compliance tracking', icon: 'clipboard-check', type: 'contextual-tool', category: 'logistics' },
  { id: 'fuel-card', title: 'Fuel Card', description: 'Fuel card transaction tracking and fleet fuel management', icon: 'fuel', type: 'contextual-tool', category: 'logistics' },
  { id: 'freight-broker', title: 'Freight Broker', description: 'Freight broker relationship and load management', icon: 'handshake', type: 'contextual-tool', category: 'logistics' },
  { id: 'shipment-bol', title: 'Shipment BOL', description: 'Bill of Lading generation and management', icon: 'file-text', type: 'contextual-tool', category: 'logistics' },
  { id: 'proof-of-delivery', title: 'Proof of Delivery', description: 'Delivery confirmation with signatures and photos', icon: 'clipboard-check', type: 'contextual-tool', category: 'logistics' },
  { id: 'warehouse-receiving', title: 'Warehouse Receiving', description: 'Inbound shipment receiving and quality control', icon: 'warehouse', type: 'contextual-tool', category: 'logistics' },

  // ============================================
  // BANKING/FINANCIAL SERVICES TOOLS
  // ============================================
  { id: 'account-opening', title: 'Account Opening', description: 'Bank account opening workflow and document management', icon: 'user-plus', type: 'banking', category: 'finance' },
  { id: 'loan-origination', title: 'Loan Origination', description: 'Loan application processing and pipeline management', icon: 'file-text', type: 'banking', category: 'finance' },
  { id: 'credit-application', title: 'Credit Application', description: 'Credit card and line of credit application tracker', icon: 'credit-card', type: 'banking', category: 'finance' },
  { id: 'underwriting', title: 'Underwriting Tool', description: 'Loan underwriting checklist and risk assessment', icon: 'clipboard-check', type: 'banking', category: 'finance' },
  { id: 'collateral-tracker', title: 'Collateral Tracker', description: 'Collateral management and valuation tracking', icon: 'shield', type: 'banking', category: 'finance' },
  { id: 'payment-scheduler', title: 'Payment Scheduler', description: 'Payment scheduling and recurring payment management', icon: 'calendar-clock', type: 'banking', category: 'finance' },
  { id: 'delinquency-tracker', title: 'Delinquency Tracker', description: 'Delinquent account tracking and collections management', icon: 'alert-triangle', type: 'banking', category: 'finance' },
  { id: 'wire-transfer', title: 'Wire Transfer', description: 'Wire transfer processing and tracking', icon: 'send', type: 'banking', category: 'finance' },
  { id: 'compliance-checklist', title: 'Compliance Checklist', description: 'Banking compliance requirements tracker', icon: 'clipboard-check', type: 'banking', category: 'finance' },
  { id: 'fraud-alert', title: 'Fraud Alert', description: 'Fraud detection and alert management system', icon: 'shield-alert', type: 'banking', category: 'finance' },

  // ============================================
  // AGRICULTURE & FARMING TOOLS
  // ============================================
  { id: 'field-mapping', title: 'Field Mapping', description: 'Map and track farm fields with zones and boundaries', icon: 'map', type: 'agriculture', category: 'agriculture' },
  { id: 'soil-testing', title: 'Soil Testing', description: 'Track soil test results, pH levels, and nutrient analysis', icon: 'test-tube', type: 'agriculture', category: 'agriculture' },
  { id: 'crop-rotation', title: 'Crop Rotation', description: 'Plan crop rotation schedules for optimal soil health', icon: 'repeat', type: 'agriculture', category: 'agriculture' },
  { id: 'irrigation-scheduler', title: 'Irrigation Scheduler', description: 'Schedule and track irrigation for farm fields', icon: 'droplet', type: 'agriculture', category: 'agriculture' },
  { id: 'pest-monitoring', title: 'Pest Monitoring', description: 'Track and manage pest issues and treatments', icon: 'bug', type: 'agriculture', category: 'agriculture' },
  { id: 'fertilizer-calculator', title: 'Fertilizer Calculator', description: 'Calculate fertilizer applications and track usage', icon: 'flask-conical', type: 'agriculture', category: 'agriculture' },
  { id: 'harvest-scheduler', title: 'Harvest Scheduler', description: 'Plan and schedule harvest operations', icon: 'calendar-check', type: 'agriculture', category: 'agriculture' },
  { id: 'yield-tracker', title: 'Yield Tracker', description: 'Track crop yields and profitability analysis', icon: 'trending-up', type: 'agriculture', category: 'agriculture' },
  { id: 'equipment-maintenance-farm', title: 'Farm Equipment Maintenance', description: 'Track farm equipment maintenance and repairs', icon: 'wrench', type: 'agriculture', category: 'agriculture' },
  { id: 'livestock-feed', title: 'Livestock Feed Schedule', description: 'Manage livestock feeding schedules and costs', icon: 'utensils', type: 'agriculture', category: 'agriculture' },

  // ============================================
  // HOSPITALITY TOOLS (Additional)
  // ============================================
  { id: 'reservation', title: 'Reservation Tool', description: 'Manage hotel, restaurant, spa, and event reservations', icon: 'calendar-check', type: 'contextual-tool', category: 'hospitality' },
  { id: 'menu-planner', title: 'Menu Planner Tool', description: 'Plan restaurant menus with pricing, dietary tags, and profit margins', icon: 'utensils', type: 'contextual-tool', category: 'hospitality' },
  { id: 'room-service', title: 'Room Service Tool', description: 'Track and manage hotel room service orders and delivery', icon: 'concierge-bell', type: 'contextual-tool', category: 'hospitality' },
  { id: 'housekeeping-tool', title: 'Housekeeping Tool', description: 'Manage housekeeping tasks, room cleaning schedules, and inspections', icon: 'spray-can', type: 'contextual-tool', category: 'hospitality' },

  // ============================================
  // LEGAL / LAW TOOLS
  // ============================================
  { id: 'case-management', title: 'Case Management Tool', description: 'Legal case tracking, client management, and case activities', icon: 'scale', type: 'contextual-tool', category: 'legal' },
  { id: 'billable-hours', title: 'Billable Hours Tool', description: 'Attorney billable hours tracking with timer and reporting', icon: 'clock', type: 'contextual-tool', category: 'legal' },
  { id: 'client-intake-legal', title: 'Client Intake Legal Tool', description: 'Legal client intake forms with conflict checking and document tracking', icon: 'clipboard-list', type: 'contextual-tool', category: 'legal' },
  { id: 'document-review-tool', title: 'Document Review Tool', description: 'Legal document review tracking and status management', icon: 'file-search', type: 'contextual-tool', category: 'legal' },
  { id: 'court-deadline', title: 'Court Deadline Tool', description: 'Court filing deadlines tracker with calendar and reminders', icon: 'calendar-clock', type: 'contextual-tool', category: 'legal' },
  { id: 'legal-research', title: 'Legal Research Tool', description: 'Manage research projects, case citations, statutes, and research memos', icon: 'scale', type: 'contextual-tool', category: 'legal' },

  // ============================================
  // TUTORING/LEARNING CENTER TOOLS
  // ============================================
  { id: 'session-notes', title: 'Session Notes Tool', description: 'Document tutoring sessions with topics, engagement ratings, and homework tracking', icon: 'file-text', type: 'contextual-tool', category: 'education' },
  { id: 'student-assessment', title: 'Assessment Tool', description: 'Track student assessments, grades, performance analysis, and skills evaluation', icon: 'clipboard-check', type: 'contextual-tool', category: 'education' },
  { id: 'tutoring-package', title: 'Tutoring Package Tool', description: 'Manage tutoring packages, session tracking, payments, and pricing', icon: 'package', type: 'contextual-tool', category: 'education' },

  // ============================================
  // HR / RECRUITMENT TOOLS
  // ============================================
  { id: 'job-posting', title: 'Job Posting Tool', description: 'Create and manage job listings with requirements, salary, and application tracking', icon: 'briefcase', type: 'contextual-tool', category: 'business' },
  { id: 'applicant-tracker', title: 'Applicant Tracker', description: 'Track job applicants through hiring pipeline with resume and interview notes', icon: 'users', type: 'contextual-tool', category: 'business' },
  { id: 'interview-scheduler', title: 'Interview Scheduler', description: 'Schedule and manage candidate interviews with feedback and ratings', icon: 'calendar-check', type: 'contextual-tool', category: 'business' },
  { id: 'onboarding-checklist', title: 'Onboarding Checklist', description: 'Track new hire onboarding tasks, documentation, and training progress', icon: 'clipboard-list', type: 'contextual-tool', category: 'business' },
  { id: 'performance-review', title: 'Performance Review Tool', description: 'Conduct employee performance reviews with goals, ratings, and feedback', icon: 'bar-chart-2', type: 'contextual-tool', category: 'business' },

  // ============================================
  // ENERGY & UTILITIES TOOLS
  // ============================================
  { id: 'meter-reading', title: 'Meter Reading Tool', description: 'Track utility meter readings for electric, gas, and water with usage calculations', icon: 'gauge', type: 'contextual-tool', category: 'energy-utilities' },
  { id: 'outage-tracker', title: 'Outage Tracker Tool', description: 'Report and track power outages, service interruptions, and restoration status', icon: 'zap-off', type: 'contextual-tool', category: 'energy-utilities' },
  { id: 'energy-audit', title: 'Energy Audit Tool', description: 'Conduct home energy audits to identify efficiency improvements and savings', icon: 'search', type: 'contextual-tool', category: 'energy-utilities' },
  { id: 'solar-panel', title: 'Solar Panel Tool', description: 'Monitor solar panel systems, production, maintenance, and energy savings', icon: 'sun', type: 'contextual-tool', category: 'energy-utilities' },
  { id: 'utility-bill', title: 'Utility Bill Tool', description: 'Track and manage utility bills, payments, and account information', icon: 'receipt', type: 'contextual-tool', category: 'energy-utilities' },

  // ============================================
  // PHOTOGRAPHY & MEDIA BUSINESS TOOLS
  // ============================================
  { id: 'photo-session', title: 'Photo Session Booking', description: 'Manage photography sessions, client bookings, and session details', icon: 'camera', type: 'contextual-tool', category: 'business' },
  { id: 'client-gallery', title: 'Client Gallery', description: 'Share and manage client photo galleries with selection and download options', icon: 'images', type: 'contextual-tool', category: 'business' },
  { id: 'equipment-tracker', title: 'Equipment Tracker', description: 'Track camera equipment, maintenance schedules, and rental inventory', icon: 'hard-drive', type: 'contextual-tool', category: 'business' },
  { id: 'print-order', title: 'Print Order', description: 'Manage photo print orders, sizes, finishes, and fulfillment tracking', icon: 'printer', type: 'contextual-tool', category: 'business' },
  { id: 'contract-signing', title: 'Contract Signing', description: 'Manage photography contracts, e-signatures, and client agreements', icon: 'file-signature', type: 'contextual-tool', category: 'business' },

  // ============================================
  // RELIGIOUS/CHURCH TOOLS
  // ============================================
  { id: 'tithing-record', title: 'Tithing Record', description: 'Track church tithes, offerings, contributions, and generate giving statements', icon: 'heart', type: 'contextual-tool', category: 'religious' },
  { id: 'prayer-request', title: 'Prayer Request', description: 'Manage prayer requests, prayer teams, and track answered prayers', icon: 'hand-heart', type: 'contextual-tool', category: 'religious' },
  { id: 'sermon-notes', title: 'Sermon Notes', description: 'Plan sermons, create outlines, manage sermon series, and archive messages', icon: 'book-open', type: 'contextual-tool', category: 'religious' },
  { id: 'volunteer-schedule', title: 'Volunteer Schedule', description: 'Schedule church volunteers, manage positions, and track service assignments', icon: 'users', type: 'contextual-tool', category: 'religious' },

  // ============================================
  // CHILDCARE/DAYCARE TOOLS
  // ============================================
  { id: 'daily-report', title: 'Daily Report', description: 'Track daily activities for children including meals, naps, diapers, and activities for parents', icon: 'clipboard-list', type: 'contextual-tool', category: 'childcare' },
  { id: 'child-profile', title: 'Child Profile', description: 'Manage child information, emergency contacts, allergies, medical info, and authorized pickups', icon: 'baby', type: 'contextual-tool', category: 'childcare' },
  { id: 'incident-report', title: 'Incident Report', description: 'Document accidents, injuries, behavioral incidents with severity levels and parent notifications', icon: 'alert-triangle', type: 'contextual-tool', category: 'childcare' },
  { id: 'tuition-tracker', title: 'Tuition Tracker', description: 'Manage tuition payments, fees, billing schedules, and generate collection reports', icon: 'dollar-sign', type: 'contextual-tool', category: 'childcare' },


  // ============================================
  // ADDITIONAL TOOLS (Auto-generated)
  // ============================================
  { id: 'access-control', title: 'Access Control', description: 'Access Control tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'access-system', title: 'Access System', description: 'Access System tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'acunit-sizer', title: 'Acunit Sizer', description: 'Acunit Sizer tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'affordability-calculator', title: 'Affordability Calculator', description: 'Affordability Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'aftercare-instruction', title: 'Aftercare Instruction', description: 'Aftercare Instruction tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'ai-bio-generator', title: 'AI Bio Generator', description: 'Generate professional bios with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-book-summary', title: 'AI Book Summary', description: 'Summarize books with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-essay-writer', title: 'AI Essay Writer', description: 'Write essays with AI assistance', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'aifaq-generator', title: 'AI FAQ Generator', description: 'Generate FAQs with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-flashcard-generator', title: 'AI Flashcard Generator', description: 'Create flashcards with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-interview-questions', title: 'AI Interview Questions', description: 'Generate interview questions with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-job-posting', title: 'AI Job Posting', description: 'Create job postings with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-lesson-plan', title: 'AI Lesson Plan', description: 'Generate lesson plans with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-linked-in-post', title: 'AI LinkedIn Post', description: 'Create LinkedIn posts with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-outline-generator', title: 'AI Outline Generator', description: 'Create outlines with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-poem-generator', title: 'AI Poem Generator', description: 'Create beautiful poetry with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-quiz-generator', title: 'AI Quiz Generator', description: 'Create quizzes with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-story-generator', title: 'AI Story Generator', description: 'Generate stories with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-study-guide', title: 'AI Study Guide', description: 'Create study guides with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-tagline-generator', title: 'AI Tagline Generator', description: 'Generate taglines with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-thesis-generator', title: 'AI Thesis Generator', description: 'Generate thesis statements with AI', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'ai-tik-tok-script', title: 'AI TikTok Script', description: 'Create TikTok scripts with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-twitter-thread', title: 'AI Twitter Thread', description: 'Create Twitter threads with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'ai-you-tube-description', title: 'AI YouTube Description', description: 'Create YouTube descriptions with AI', icon: 'pen-tool', type: 'contextual-tool', category: 'ai-writing' },
  { id: 'altitude-sickness', title: 'Altitude Sickness', description: 'Altitude Sickness tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'amortization-schedule', title: 'Amortization Schedule', description: 'Amortization Schedule tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'anagram-solver', title: 'Anagram Solver', description: 'Anagram Solver tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'anniversary-calculator', title: 'Anniversary Calculator', description: 'Anniversary Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'appliance-energy', title: 'Appliance Energy', description: 'Appliance Energy tool', icon: 'zap', type: 'contextual-tool', category: 'energy-utilities' },
  { id: 'appointment-tattoo', title: 'Appointment Tattoo', description: 'Appointment Tattoo tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'appraisal', title: 'Appraisal', description: 'Appraisal tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'ascii-art', title: 'ASCII Art', description: 'ASCII Art generator tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'assessment', title: 'Assessment', description: 'Assessment tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'baby-age-calculator', title: 'Baby Age Calculator', description: 'Baby Age Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'baby-feeding-calculator', title: 'Baby Feeding Calculator', description: 'Baby Feeding Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'baby-growth-chart', title: 'Baby Growth Chart', description: 'Baby Growth Chart tool', icon: 'baby', type: 'contextual-tool', category: 'childcare' },
  { id: 'baby-milestone-tracker', title: 'Baby Milestone Tracker', description: 'Baby Milestone Tracker tool', icon: 'baby', type: 'contextual-tool', category: 'childcare' },
  { id: 'bee-hive-calculator', title: 'Bee Hive Calculator', description: 'Bee Hive Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'bible-verse-finder', title: 'Bible Verse Finder', description: 'Bible Verse Finder tool', icon: 'church', type: 'contextual-tool', category: 'religious' },
  { id: 'billable-hours-calculator', title: 'Billable Hours Calculator', description: 'Billable Hours Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'biorhythm', title: 'Biorhythm', description: 'Biorhythm tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'bracket-generator', title: 'Bracket Generator', description: 'Bracket Generator tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'brick-calculator', title: 'Brick Calculator', description: 'Brick Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'bundle-discount-calculator', title: 'Bundle Discount Calculator', description: 'Bundle Discount Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'cap-rate-calculator', title: 'Cap Rate Calculator', description: 'Cap Rate Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'car-depreciation', title: 'Car Depreciation', description: 'Car Depreciation tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'car-insurance', title: 'Car Insurance', description: 'Car Insurance tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'car-lease', title: 'Car Lease', description: 'Car Lease tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'case-management-funeral', title: 'Case Management Funeral', description: 'Case Management Funeral tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'cash-flow-calculator', title: 'Cash Flow Calculator', description: 'Cash Flow Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'cashback-calculator', title: 'Cashback Calculator', description: 'Cashback Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'catering', title: 'Catering', description: 'Catering tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'catering-quote', title: 'Catering Quote', description: 'Catering Quote tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'cbm-calculator', title: 'CBM Calculator', description: 'Cubic meter calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'chemical-inventory', title: 'Chemical Inventory', description: 'Chemical Inventory tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'child-check-in', title: 'Child Check In', description: 'Child Check In tool', icon: 'baby', type: 'contextual-tool', category: 'childcare' },
  { id: 'child-enrollment', title: 'Child Enrollment', description: 'Child Enrollment tool', icon: 'baby', type: 'contextual-tool', category: 'childcare' },
  { id: 'child-height-predictor', title: 'Child Height Predictor', description: 'Child Height Predictor tool', icon: 'baby', type: 'contextual-tool', category: 'childcare' },
  { id: 'chore-wheel', title: 'Chore Wheel', description: 'Chore Wheel tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'circle-calculator', title: 'Circle Calculator', description: 'Circle Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'claims-processing', title: 'Claims Processing', description: 'Claims Processing tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'cleaning-checklist', title: 'Cleaning Checklist', description: 'Cleaning Checklist tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'cleaning-schedule', title: 'Cleaning Schedule', description: 'Cleaning Schedule tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'cleaning-time', title: 'Cleaning Time', description: 'Cleaning Time tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'client-property', title: 'Client Property', description: 'Client Property tool', icon: 'dollar-sign', type: 'contextual-tool', category: 'finance' },
  { id: 'closing-cost-calculator', title: 'Closing Cost Calculator', description: 'Closing Cost Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'clothing-size-converter', title: 'Clothing Size Converter', description: 'Clothing Size Converter tool', icon: 'repeat', type: 'contextual-tool', category: 'converters' },
  { id: 'cmetracker', title: 'Cmetracker', description: 'Cmetracker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'coin-flip', title: 'Coin Flip', description: 'Coin Flip tool', icon: 'gamepad-2', type: 'contextual-tool', category: 'entertainment' },
  { id: 'combination', title: 'Combination', description: 'Combination tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'compatibility-test', title: 'Compatibility Test', description: 'Compatibility Test tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'compost-calculator', title: 'Compost Calculator', description: 'Compost Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'conception-calculator', title: 'Conception Calculator', description: 'Conception Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'cone-calculator', title: 'Cone Calculator', description: 'Cone Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'consent-form', title: 'Consent Form', description: 'Consent Form tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'consultant-time', title: 'Consultant Time', description: 'Consultant Time tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'contact-lens-order', title: 'Contact Lens Order', description: 'Contact Lens Order tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'container-load-calculator', title: 'Container Load Calculator', description: 'Container Load Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'contract-template', title: 'Contract Template', description: 'Contract Template tool', icon: 'user-check', type: 'contextual-tool', category: 'professional' },
  { id: 'coupon-stack-calculator', title: 'Coupon Stack Calculator', description: 'Coupon Stack Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'cpc-calculator', title: 'CPC Calculator', description: 'Cost per click calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'cpm-calculator', title: 'CPM Calculator', description: 'Cost per mille calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'crew-schedule', title: 'Crew Schedule', description: 'Crew Schedule tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'cruise-cost', title: 'Cruise Cost', description: 'Cruise Cost tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'ctr-calculator', title: 'CTR Calculator', description: 'Click-through rate calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'custom-cake-order', title: 'Custom Cake Order', description: 'Custom Cake Order tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'custom-order-jewelry', title: 'Custom Order Jewelry', description: 'Custom Order Jewelry tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'customer-account-dry-clean', title: 'Customer Account Dry Clean', description: 'Customer Account Dry Clean tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'customer-artwork', title: 'Customer Artwork', description: 'Customer Artwork tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'customer-loyalty', title: 'Customer Loyalty', description: 'Customer Loyalty tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'customs-duty-calculator', title: 'Customs Duty Calculator', description: 'Customs Duty Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'cycle-time-calculator', title: 'Cycle Time Calculator', description: 'Cycle Time Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'cylinder-calculator', title: 'Cylinder Calculator', description: 'Cylinder Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'daily-horoscope', title: 'Daily Horoscope', description: 'Daily Horoscope tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'darts-scorer', title: 'Darts Scorer', description: 'Darts Scorer tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'declutter-calculator', title: 'Declutter Calculator', description: 'Declutter Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'deliverable-tracker', title: 'Deliverable Tracker', description: 'Deliverable Tracker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'delivery-schedule-florist', title: 'Delivery Schedule Florist', description: 'Delivery Schedule Florist tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'delivery-time-estimator', title: 'Delivery Time Estimator', description: 'Delivery Time Estimator tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'design-portfolio', title: 'Design Portfolio', description: 'Design Portfolio tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'design-proof', title: 'Design Proof', description: 'Design Proof tool', icon: 'home', type: 'contextual-tool', category: 'home-diy' },
  { id: 'detergent-calculator', title: 'Detergent Calculator', description: 'Detergent Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'diaper-calculator', title: 'Diaper Calculator', description: 'Diaper Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'dimensional-weight', title: 'Dimensional Weight', description: 'Dimensional Weight tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'donation-tracker', title: 'Donation Tracker', description: 'Donation Tracker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'down-payment-calculator', title: 'Down Payment Calculator', description: 'Down Payment Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'dream-interpreter', title: 'Dream Interpreter', description: 'Dream Interpreter tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'driver-payroll', title: 'Driver Payroll', description: 'Driver Payroll tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'dry-wall-calculator', title: 'Dry Wall Calculator', description: 'Dry Wall Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'drycleaning-cost', title: 'Drycleaning Cost', description: 'Drycleaning Cost tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'easter-date-calculator', title: 'Easter Date Calculator', description: 'Easter Date Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'electricity-usage-calculator', title: 'Electricity Usage Calculator', description: 'Electricity Usage Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'emergency-dispatch-lock', title: 'Emergency Dispatch Lock', description: 'Emergency Dispatch Lock tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'emoji-translator', title: 'Emoji Translator', description: 'Emoji Translator tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'encryption', title: 'Encryption', description: 'Encryption tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'engagement-letter', title: 'Engagement Letter', description: 'Engagement Letter tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'eoq-calculator', title: 'EOQ Calculator', description: 'Economic order quantity calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'equipment-maintenance-landscape', title: 'Equipment Maintenance Landscape', description: 'Equipment Maintenance Landscape tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'equipment-rental-catering', title: 'Equipment Rental Catering', description: 'Equipment Rental Catering tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'equipment-repair-pool', title: 'Equipment Repair Pool', description: 'Equipment Repair Pool tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'er-triage-tool', title: 'ER Triage Tool', description: 'Emergency room triage tool', icon: 'stethoscope', type: 'contextual-tool', category: 'healthcare' },
  { id: 'ev-charging-calculator', title: 'EV Charging Calculator', description: 'Electric vehicle charging calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'event-guest-list', title: 'Event Guest List', description: 'Event Guest List tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'event-menu', title: 'Event Menu', description: 'Event Menu tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'event-planner', title: 'Event Planner', description: 'Event Planner tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'ev-range-calculator', title: 'EV Range Calculator', description: 'Electric vehicle range calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'ev-savings', title: 'EV Savings', description: 'Electric vehicle savings calculator', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'exam-record', title: 'Exam Record', description: 'Exam Record tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'factorial-calculator', title: 'Factorial Calculator', description: 'Factorial Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'fancy-text', title: 'Fancy Text', description: 'Fancy Text tool', icon: 'type', type: 'contextual-tool', category: 'text-tools' },
  { id: 'fitness-class-schedule', title: 'Fitness Class Schedule', description: 'Fitness Class Schedule tool', icon: 'heart', type: 'contextual-tool', category: 'health-wellness' },
  { id: 'fleet-fuel-cost', title: 'Fleet Fuel Cost', description: 'Fleet Fuel Cost tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'flight-time', title: 'Flight Time', description: 'Flight Time tool', icon: 'plane', type: 'contextual-tool', category: 'travel' },
  { id: 'flower-arrangement', title: 'Flower Arrangement', description: 'Flower Arrangement tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'flower-order', title: 'Flower Order', description: 'Flower Order tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'follower-growth', title: 'Follower Growth', description: 'Follower Growth tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'fortune-cookie', title: 'Fortune Cookie', description: 'Fortune Cookie tool', icon: 'chef-hat', type: 'contextual-tool', category: 'cooking' },
  { id: 'frame-inventory', title: 'Frame Inventory', description: 'Frame Inventory tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'freight-calculator', title: 'Freight Calculator', description: 'Freight Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'frost-date', title: 'Frost Date', description: 'Frost Date tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'fundraiser', title: 'Fundraiser', description: 'Fundraiser tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'garment-ticket', title: 'Garment Ticket', description: 'Garment Ticket tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'gas-mileage', title: 'Gas Mileage', description: 'Gas Mileage tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'gcd-calculator', title: 'GCD Calculator', description: 'Greatest common divisor calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'gift-exchange', title: 'Gift Exchange', description: 'Gift Exchange tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'grade-book', title: 'Grade Book', description: 'Grade Book tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'grant-application', title: 'Grant Application', description: 'Grant Application tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'greenhouse-calculator', title: 'Greenhouse Calculator', description: 'Greenhouse Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'gst-calculator', title: 'GST Calculator', description: 'Goods and services tax calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'guard-schedule', title: 'Guard Schedule', description: 'Guard Schedule tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'guest-list', title: 'Guest List', description: 'Guest List tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'gutter-calculator', title: 'Gutter Calculator', description: 'Gutter Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'gym-membership', title: 'Gym Membership', description: 'Gym Membership tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'harvest-estimator', title: 'Harvest Estimator', description: 'Harvest Estimator tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'hebrew-date-converter', title: 'Hebrew Date Converter', description: 'Hebrew Date Converter tool', icon: 'repeat', type: 'contextual-tool', category: 'converters' },
  { id: 'heloc-calculator', title: 'Heloc Calculator', description: 'Heloc Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'hex-converter', title: 'Hex Converter', description: 'Hex Converter tool', icon: 'repeat', type: 'contextual-tool', category: 'converters' },
  { id: 'hijri-date-converter', title: 'Hijri Date Converter', description: 'Hijri Date Converter tool', icon: 'repeat', type: 'contextual-tool', category: 'converters' },
  { id: 'hiking-calories', title: 'Hiking Calories', description: 'Hiking Calories tool', icon: 'heart', type: 'contextual-tool', category: 'health-wellness' },
  { id: 'home-equity-calculator', title: 'Home Equity Calculator', description: 'Home Equity Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'honeymoon-budget', title: 'Honeymoon Budget', description: 'Honeymoon Budget tool', icon: 'dollar-sign', type: 'contextual-tool', category: 'finance' },
  { id: 'hotel-cost', title: 'Hotel Cost', description: 'Hotel Cost tool', icon: 'plane', type: 'contextual-tool', category: 'travel' },
  { id: 'housekeeping', title: 'Housekeeping', description: 'Housekeeping tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'housekeeping-cost', title: 'Housekeeping Cost', description: 'Housekeeping Cost tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'html-encoder', title: 'HTML Encoder', description: 'HTML encoding and decoding tool', icon: 'code', type: 'contextual-tool', category: 'developer' },
  { id: 'hvac-cost', title: 'HVAC Cost', description: 'HVAC cost estimator tool', icon: 'thermometer', type: 'contextual-tool', category: 'home-diy' },
  { id: 'hvac-maintenance', title: 'HVAC Maintenance', description: 'HVAC maintenance tracker', icon: 'thermometer', type: 'contextual-tool', category: 'home-diy' },
  { id: 'impound-log', title: 'Impound Log', description: 'Impound Log tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'influencer-rate', title: 'Influencer Rate', description: 'Influencer Rate tool', icon: 'megaphone', type: 'contextual-tool', category: 'ai-marketing' },
  { id: 'ingredient-inventory', title: 'Ingredient Inventory', description: 'Ingredient Inventory tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'instagram-engagement', title: 'Instagram Engagement', description: 'Instagram Engagement tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'inventory-list', title: 'Inventory List', description: 'Inventory List tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'inventory-turnover', title: 'Inventory Turnover', description: 'Inventory Turnover tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'irrigation-calculator', title: 'Irrigation Calculator', description: 'Irrigation Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'it-support-ticket', title: 'IT Support Ticket', description: 'IT support ticket management', icon: 'headset', type: 'contextual-tool', category: 'professional' },
  { id: 'key-inventory', title: 'Key Inventory', description: 'Key Inventory tool', icon: 'music', type: 'contextual-tool', category: 'music' },
  { id: 'landscape-design', title: 'Landscape Design', description: 'Landscape Design tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'laundry-cost', title: 'Laundry Cost', description: 'Laundry Cost tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'lawn-care', title: 'Lawn Care', description: 'Lawn Care tool', icon: 'flower', type: 'contextual-tool', category: 'gardening' },
  { id: 'lcm-calculator', title: 'LCM Calculator', description: 'Least common multiple calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'legal-deadline', title: 'Legal Deadline', description: 'Legal Deadline tool', icon: 'user-check', type: 'contextual-tool', category: 'professional' },
  { id: 'light-bulb-savings', title: 'Light Bulb Savings', description: 'Light Bulb Savings tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'linked-in-bio', title: 'Linked In Bio', description: 'Linked In Bio tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'logarithm-calculator', title: 'Logarithm Calculator', description: 'Logarithm Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'lorem-ipsum-generator', title: 'Lorem Ipsum Generator', description: 'Lorem Ipsum Generator tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'lottery-picker', title: 'Lottery Picker', description: 'Lottery Picker tool', icon: 'gamepad-2', type: 'contextual-tool', category: 'entertainment' },
  { id: 'love-calculator', title: 'Love Calculator', description: 'Love Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'lucky-number', title: 'Lucky Number', description: 'Lucky Number tool', icon: 'gamepad-2', type: 'contextual-tool', category: 'entertainment' },
  { id: 'luggage-size', title: 'Luggage Size', description: 'Luggage Size tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'lumber-calculator', title: 'Lumber Calculator', description: 'Lumber Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'machine-efficiency', title: 'Machine Efficiency', description: 'Machine Efficiency tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'magic-eight-ball', title: 'Magic Eight Ball', description: 'Magic Eight Ball tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'markup-calculator', title: 'Markup Calculator', description: 'Markup Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'material-calculator', title: 'Material Calculator', description: 'Material Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'meal-planning-daycare', title: 'Meal Planning Daycare', description: 'Meal Planning Daycare tool', icon: 'chef-hat', type: 'contextual-tool', category: 'cooking' },
  { id: 'membership-church', title: 'Membership Church', description: 'Membership Church tool', icon: 'church', type: 'contextual-tool', category: 'religious' },
  { id: 'morse-code', title: 'Morse Code', description: 'Morse Code tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'move-estimate', title: 'Move Estimate', description: 'Move Estimate tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'movie-picker', title: 'Movie Picker', description: 'Movie Picker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'moving-box-calculator', title: 'Moving Box Calculator', description: 'Moving Box Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'moving-cost-calculator', title: 'Moving Cost Calculator', description: 'Moving Cost Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'name-meaning', title: 'Name Meaning', description: 'Name Meaning tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'nda-generator', title: 'NDA Generator', description: 'Non-disclosure agreement generator', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'obituary-writer', title: 'Obituary Writer', description: 'Obituary Writer tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'oil-change', title: 'Oil Change', description: 'Oil Change tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'order-fulfillment', title: 'Order Fulfillment', description: 'Order Fulfillment tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'ovulation-calculator', title: 'Ovulation Calculator', description: 'Ovulation Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'palindrome-checker', title: 'Palindrome Checker', description: 'Palindrome Checker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'pallet-calculator', title: 'Pallet Calculator', description: 'Pallet Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'parent-communication', title: 'Parent Communication', description: 'Parent Communication tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'parking-cost', title: 'Parking Cost', description: 'Parking Cost tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'parts-lookup', title: 'Parts Lookup', description: 'Parts Lookup tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'parts-order', title: 'Parts Order', description: 'Parts Order tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'patrol-log', title: 'Patrol Log', description: 'Patrol Log tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'paver-calculator', title: 'Paver Calculator', description: 'Paver Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'permutation', title: 'Permutation', description: 'Permutation tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'personality-quiz', title: 'Personality Quiz', description: 'Personality Quiz tool', icon: 'gamepad-2', type: 'contextual-tool', category: 'entertainment' },
  { id: 'pet-boarding', title: 'Pet Boarding', description: 'Pet Boarding tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'pet-patient', title: 'Pet Patient', description: 'Pet Patient tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'pickup-authorization', title: 'Pickup Authorization', description: 'Pickup Authorization tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'pig-latin', title: 'Pig Latin', description: 'Pig Latin tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'plant-inventory', title: 'Plant Inventory', description: 'Plant Inventory tool', icon: 'flower', type: 'contextual-tool', category: 'gardening' },
  { id: 'planting-calendar', title: 'Planting Calendar', description: 'Planting Calendar tool', icon: 'flower', type: 'contextual-tool', category: 'gardening' },
  { id: 'pmi-calculator', title: 'Pmi Calculator', description: 'Pmi Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'policy-management', title: 'Policy Management', description: 'Policy Management tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'pool-heating-cost', title: 'Pool Heating Cost', description: 'Pool Heating Cost tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'pool-service-route', title: 'Pool Service Route', description: 'Pool Service Route tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'pos-transaction', title: 'POS Transaction', description: 'Point of sale transaction tool', icon: 'credit-card', type: 'contextual-tool', category: 'business' },
  { id: 'prayer-time-calculator', title: 'Prayer Time Calculator', description: 'Prayer Time Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'pre-need-contract', title: 'Pre Need Contract', description: 'Pre Need Contract tool', icon: 'user-check', type: 'contextual-tool', category: 'professional' },
  { id: 'prescription-fill', title: 'Prescription Fill', description: 'Prescription Fill tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'prime-checker', title: 'Prime Checker', description: 'Prime Checker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'print-job', title: 'Print Job', description: 'Print Job tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'print-size-calculator', title: 'Print Size Calculator', description: 'Print Size Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'privacy-policy-generator', title: 'Privacy Policy Generator', description: 'Privacy Policy Generator tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'privacy-score', title: 'Privacy Score', description: 'Privacy Score tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'product-catalog', title: 'Product Catalog', description: 'Product Catalog tool', icon: 'paw-print', type: 'contextual-tool', category: 'pet-care' },
  { id: 'production-queue', title: 'Production Queue', description: 'Production Queue tool', icon: 'factory', type: 'contextual-tool', category: 'manufacturing' },
  { id: 'production-rate-calculator', title: 'Production Rate Calculator', description: 'Production Rate Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'production-schedule-bakery', title: 'Production Schedule Bakery', description: 'Production Schedule Bakery tool', icon: 'factory', type: 'contextual-tool', category: 'manufacturing' },
  { id: 'project-scope', title: 'Project Scope', description: 'Project Scope tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'property-tax-calculator', title: 'Property Tax Calculator', description: 'Property Tax Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'pythagorean', title: 'Pythagorean', description: 'Pythagorean tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'qr-code-generator', title: 'Qr Code Generator', description: 'Qr Code Generator tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'quadratic-solver', title: 'Quadratic Solver', description: 'Quadratic Solver tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'quran-verse-finder', title: 'Quran Verse Finder', description: 'Quran Verse Finder tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'ramadan-calendar', title: 'Ramadan Calendar', description: 'Ramadan Calendar tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'random-number-generator', title: 'Random Number Generator', description: 'Random Number Generator tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'recipe-manager', title: 'Recipe Manager', description: 'Recipe Manager tool', icon: 'chef-hat', type: 'contextual-tool', category: 'cooking' },
  { id: 'refinance-calculator', title: 'Refinance Calculator', description: 'Refinance Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'renewal-tracker', title: 'Renewal Tracker', description: 'Renewal Tracker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'rent-increase-calculator', title: 'Rent Increase Calculator', description: 'Rent Increase Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'rental-roicalculator', title: 'Rental Roicalculator', description: 'Rental Roicalculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'reorder-point-calculator', title: 'Reorder Point Calculator', description: 'Reorder Point Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'repair-ticket-appliance', title: 'Repair Ticket Appliance', description: 'Repair Ticket Appliance tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'repair-ticket-jewelry', title: 'Repair Ticket Jewelry', description: 'Repair Ticket Jewelry tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'repmax-calculator', title: 'Repmax Calculator', description: 'Repmax Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'restaurant-picker', title: 'Restaurant Picker', description: 'Restaurant Picker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'ride-dispatch', title: 'Ride Dispatch', description: 'Ride Dispatch tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'road-trip-cost', title: 'Road Trip Cost', description: 'Road Trip Cost tool', icon: 'plane', type: 'contextual-tool', category: 'travel' },
  { id: 'roadside-call', title: 'Roadside Call', description: 'Roadside Call tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'roas-calculator', title: 'ROAS Calculator', description: 'Return on ad spend calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'roof-pitch-calculator', title: 'Roof Pitch Calculator', description: 'Roof Pitch Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'route-pickup', title: 'Route Pickup', description: 'Route Pickup tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'safety-stock-calculator', title: 'Safety Stock Calculator', description: 'Safety Stock Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'sales-tax-calculator', title: 'Sales Tax Calculator', description: 'Sales Tax Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'sand-calculator', title: 'Sand Calculator', description: 'Sand Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'scientific-notation', title: 'Scientific Notation', description: 'Scientific Notation tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'scrap-rate-calculator', title: 'Scrap Rate Calculator', description: 'Scrap Rate Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'seasonal-service', title: 'Seasonal Service', description: 'Seasonal Service tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'seating-chart', title: 'Seating Chart', description: 'Seating Chart tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'seed-spacing', title: 'Seed Spacing', description: 'Seed Spacing tool', icon: 'flower', type: 'contextual-tool', category: 'gardening' },
  { id: 'service-call', title: 'Service Call', description: 'Service Call tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'service-call-locksmith', title: 'Service Call Locksmith', description: 'Service Call Locksmith tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'service-planner-funeral', title: 'Service Planner Funeral', description: 'Service Planner Funeral tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'service-route-pest', title: 'Service Route Pest', description: 'Service Route Pest tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'shipping-cost-calculator', title: 'Shipping Cost Calculator', description: 'Shipping Cost Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'shipping-threshold', title: 'Shipping Threshold', description: 'Shipping Threshold tool', icon: 'truck', type: 'contextual-tool', category: 'logistics' },
  { id: 'ski-resort-cost', title: 'Ski Resort Cost', description: 'Ski Resort Cost tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'social-roi', title: 'Social Roi', description: 'Social Roi tool', icon: 'megaphone', type: 'contextual-tool', category: 'ai-marketing' },
  { id: 'speaking-time', title: 'Speaking Time', description: 'Speaking Time tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'special-care', title: 'Special Care', description: 'Special Care tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'speedometer-error', title: 'Speedometer Error', description: 'Speedometer Error tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'sphere-calculator', title: 'Sphere Calculator', description: 'Sphere Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'spin-wheel', title: 'Spin Wheel', description: 'Spin Wheel tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'spirit-animal', title: 'Spirit Animal', description: 'Spirit Animal tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'sports-league', title: 'Sports League', description: 'Sports League tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'spring-cleaning', title: 'Spring Cleaning', description: 'Spring Cleaning tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'square-footage-calculator', title: 'Square Footage Calculator', description: 'Square Footage Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'staff-assignment', title: 'Staff Assignment', description: 'Staff Assignment tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'storage-calculator', title: 'Storage Calculator', description: 'Storage Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'storage-unit', title: 'Storage Unit', description: 'Storage Unit tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'sunset-time-calculator', title: 'Sunset Time Calculator', description: 'Sunset Time Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'supply-inventory', title: 'Supply Inventory', description: 'Supply Inventory tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'table-top-rpg', title: 'Table Top Rpg', description: 'Table Top Rpg tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'tailoring-cost', title: 'Tailoring Cost', description: 'Tailoring Cost tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'takt-time-calculator', title: 'Takt Time Calculator', description: 'Takt Time Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'task-assigner', title: 'Task Assigner', description: 'Task Assigner tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'team-generator', title: 'Team Generator', description: 'Team Generator tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'tech-schedule-appliance', title: 'Tech Schedule Appliance', description: 'Tech Schedule Appliance tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'technician-route', title: 'Technician Route', description: 'Technician Route tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'terms-generator', title: 'Terms Generator', description: 'Terms Generator tool', icon: 'sparkles', type: 'contextual-tool', category: 'generators' },
  { id: 'tik-tok-earnings', title: 'Tik Tok Earnings', description: 'Tik Tok Earnings tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'tire-size', title: 'Tire Size', description: 'Tire Size tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'tithe-calculator', title: 'Tithe Calculator', description: 'Tithe Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'tithing-tracker', title: 'Tithing Tracker', description: 'Tithing Tracker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'tow-dispatch', title: 'Tow Dispatch', description: 'Tow Dispatch tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'trainer-booking', title: 'Trainer Booking', description: 'Trainer Booking tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'travel-adapter', title: 'Travel Adapter', description: 'Travel Adapter tool', icon: 'plane', type: 'contextual-tool', category: 'travel' },
  { id: 'travel-insurance', title: 'Travel Insurance', description: 'Travel Insurance tool', icon: 'plane', type: 'contextual-tool', category: 'travel' },
  { id: 'treatment-log', title: 'Treatment Log', description: 'Treatment Log tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'triangle-calculator', title: 'Triangle Calculator', description: 'Triangle Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'truck-load-calculator', title: 'Truck Load Calculator', description: 'Truck Load Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'truck-maintenance-tow', title: 'Truck Maintenance Tow', description: 'Truck Maintenance Tow tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'underwriting-review', title: 'Underwriting Review', description: 'Underwriting Review tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'unit-price-calculator', title: 'Unit Price Calculator', description: 'Unit Price Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'uvindex-calculator', title: 'Uvindex Calculator', description: 'Uvindex Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'vacancy-rate-calculator', title: 'Vacancy Rate Calculator', description: 'Vacancy Rate Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'vacation-budget', title: 'Vacation Budget', description: 'Vacation Budget tool', icon: 'dollar-sign', type: 'contextual-tool', category: 'finance' },
  { id: 'vaccination-record', title: 'Vaccination Record', description: 'Vaccination Record tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'vaccination-schedule', title: 'Vaccination Schedule', description: 'Vaccination Schedule tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'vat-calculator', title: 'VAT Calculator', description: 'Value added tax calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'vehicle-fleet', title: 'Vehicle Fleet', description: 'Vehicle Fleet tool', icon: 'car', type: 'contextual-tool', category: 'automotive' },
  { id: 'venue-booking', title: 'Venue Booking', description: 'Venue Booking tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'vet-appointment', title: 'Vet Appointment', description: 'Vet Appointment tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'vet-prescription', title: 'Vet Prescription', description: 'Vet Prescription tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'visa-checker', title: 'Visa Checker', description: 'Visa Checker tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'vision-insurance', title: 'Vision Insurance', description: 'Vision Insurance tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'visitor-log', title: 'Visitor Log', description: 'Visitor Log tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'volunteer-management', title: 'Volunteer Management', description: 'Volunteer Management tool', icon: 'clock', type: 'contextual-tool', category: 'date-time' },
  { id: 'vpn-speed-calculator', title: 'VPN Speed Calculator', description: 'VPN speed test calculator', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'wardrobe-capsule', title: 'Wardrobe Capsule', description: 'Wardrobe capsule planning tool', icon: 'shirt', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'warranty-claim-appliance', title: 'Warranty Claim Appliance', description: 'Warranty Claim Appliance tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'water-chemistry', title: 'Water Chemistry', description: 'Water Chemistry tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'water-usage-calculator', title: 'Water Usage Calculator', description: 'Water Usage Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'watering-schedule', title: 'Watering Schedule', description: 'Watering Schedule tool', icon: 'tool', type: 'contextual-tool', category: 'productivity' },
  { id: 'wedding-budget-calculator', title: 'Wedding Budget Calculator', description: 'Wedding Budget Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'wedding-florist', title: 'Wedding Florist', description: 'Wedding Florist tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'wedding-guest-list', title: 'Wedding Guest List', description: 'Wedding Guest List tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'wedding-registry', title: 'Wedding Registry', description: 'Wedding Registry tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'wedding-rsvp', title: 'Wedding Rsvp', description: 'Wedding Rsvp tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'wedding-seating', title: 'Wedding Seating', description: 'Wedding Seating tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'wedding-timeline', title: 'Wedding Timeline', description: 'Wedding Timeline tool', icon: 'star', type: 'contextual-tool', category: 'lifestyle' },
  { id: 'wholesale-price-calculator', title: 'Wholesale Price Calculator', description: 'Wholesale Price Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
  { id: 'wifi-qr-generator-tool', title: 'WiFi QR Generator', description: 'WiFi QR code generator', icon: 'wifi', type: 'contextual-tool', category: 'generators' },
  { id: 'youtube-earnings', title: 'YouTube Earnings', description: 'YouTube earnings calculator', icon: 'video', type: 'contextual-tool', category: 'calculators' },
  { id: 'zakat-calculator', title: 'Zakat Calculator', description: 'Zakat Calculator tool', icon: 'calculator', type: 'contextual-tool', category: 'calculators' },
];

// Get tools by category
export function getToolsByCategory(categoryId: string): ToolData[] {
  return allTools.filter(tool => tool.category === categoryId);
}

// Search tools
export function searchTools(query: string): ToolData[] {
  const lowerQuery = query.toLowerCase();
  return allTools.filter(tool =>
    tool.title.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.category.toLowerCase().includes(lowerQuery)
  );
}

// Get tool by ID
export function getToolById(toolId: string): ToolData | undefined {
  return allTools.find(tool => tool.id === toolId);
}

// Get total tools count
export function getTotalToolsCount(): number {
  return allTools.length;
}

// Check if tool exists
export function toolExists(toolId: string): boolean {
  return allTools.some(tool => tool.id === toolId);
}

// Get all tool IDs as a Set for quick lookup
export function getToolIdSet(): Set<string> {
  return new Set(allTools.map(tool => tool.id));
}

// ============================================
// SEARCH METADATA FOR QDRANT SEEDING
// ============================================

/**
 * Tool synonyms for better search matching
 * Only add synonyms that aren't already in title/description
 */
export const toolSynonyms: Record<string, string[]> = {
  // Image Tools
  'image-resizer': ['resize image', 'scale image', 'resize photo', 'image size', 'dimensions', 'pixels', 'shrink image', 'enlarge image'],
  'image-compressor': ['compress image', 'reduce size', 'optimize image', 'smaller image', 'compress photo', 'reduce file size'],
  'background-remover': ['remove background', 'transparent', 'cutout', 'background eraser', 'remove bg', 'isolate subject'],
  'photo-enhancer': ['enhance photo', 'improve image', 'photo quality', 'sharpen', 'brighten', 'contrast'],
  'image-upscaler': ['upscale image', 'increase resolution', 'enlarge photo', 'super resolution', 'enhance quality'],
  'image-restoration': ['restore photo', 'fix old photo', 'repair image', 'photo repair'],
  'image-to-text': ['ocr', 'extract text', 'text from image', 'scan text', 'read image'],
  'ai-image-generator': ['generate image', 'create image', 'ai art', 'text to image', 'dall-e', 'midjourney', 'stable diffusion'],

  // QR & Barcode
  'qr-generator': ['qr', 'qr code', 'barcode', 'scan', 'quick response', 'scannable', 'square code'],
  'barcode-generator': ['barcode', 'upc', 'ean', 'product code', 'scan code'],

  // Calculators
  'bmi-calculator': ['bmi', 'body mass index', 'weight', 'health', 'obesity', 'overweight', 'underweight', 'healthy weight'],
  'tip-calculator': ['tip', 'gratuity', 'restaurant', 'service charge', 'waiter', 'tipping', 'bill tip'],
  'mortgage-calculator': ['mortgage', 'home loan', 'house payment', 'monthly payment', 'interest rate', 'amortization'],
  'loan-calculator': ['loan', 'borrow', 'payment', 'interest', 'emi', 'installment', 'debt'],
  'age-calculator': ['age', 'birthday', 'birth date', 'how old', 'age in years', 'born'],
  'calorie-calculator': ['calorie', 'calories', 'nutrition', 'diet', 'weight loss', 'tdee', 'bmr'],
  'macro-calculator': ['macro', 'macros', 'protein', 'carbs', 'fat', 'nutrition', 'diet plan'],

  // Converters
  'currency-converter': ['currency', 'money', 'exchange rate', 'forex', 'dollars', 'euros', 'yen', 'usd', 'gbp'],
  'temperature-converter': ['temperature', 'celsius', 'fahrenheit', 'kelvin', 'degrees', 'heat', 'cold'],
  'length-converter': ['length', 'distance', 'meters', 'feet', 'inches', 'centimeters', 'miles', 'kilometers'],

  // Developer Tools
  'json-formatter': ['json', 'format json', 'beautify json', 'json viewer', 'parse json', 'json lint'],
  'regex-tester': ['regex', 'regular expression', 'pattern matching', 'regexp', 'match'],
  'code-beautifier': ['code', 'format code', 'beautify', 'prettify', 'indent', 'clean code'],
  'password-generator': ['password', 'secure password', 'random password', 'strong password', 'passphrase'],
  'uuid-generator': ['uuid', 'guid', 'unique id', 'random id', 'identifier'],

  // Writing Tools
  'email-composer': ['email', 'mail', 'letter', 'message', 'correspondence', 'compose', 'draft'],
  'blog-post-generator': ['blog', 'article', 'post', 'content', 'blogger', 'wordpress', 'medium', 'writing'],
  'ai-essay-writer': ['essay', 'write essay', 'academic writing', 'thesis', 'paper'],
  'grammar-checker': ['grammar', 'spelling', 'proofread', 'writing check', 'correct grammar'],

  // Data Visualization
  'data-visualizer': ['chart', 'graph', 'visualization', 'plot', 'data chart', 'bar chart', 'pie chart', 'line chart'],

  // Audio/Video
  'video-trimmer': ['trim video', 'cut video', 'edit video', 'shorten video'],
  'gif-creator': ['gif', 'animated gif', 'create gif', 'video to gif'],
  'audio-extractor': ['extract audio', 'audio from video', 'mp3 from video'],
  'text-to-speech': ['tts', 'speak text', 'voice', 'read aloud', 'audio from text'],
};

/**
 * Use cases for contextual matching
 */
export const toolUseCases: Record<string, string[]> = {
  'image-resizer': ['resize for social media', 'make thumbnail', 'resize for web', 'change image dimensions'],
  'image-compressor': ['reduce file size for email', 'optimize for web', 'compress for upload'],
  'background-remover': ['remove background for product photo', 'create transparent png', 'isolate person from photo'],
  'qr-generator': ['create qr code for website', 'qr code for wifi', 'qr for business card'],
  'bmi-calculator': ['check if overweight', 'calculate healthy weight', 'fitness assessment'],
  'currency-converter': ['convert dollars to euros', 'check exchange rate', 'travel money conversion'],
  'json-formatter': ['format api response', 'beautify json data', 'validate json'],
  'data-visualizer': ['create chart from data', 'visualize csv', 'make graph from spreadsheet'],
};

/**
 * Get category display name
 */
export const categoryNames: Record<string, string> = {};
toolCategories.forEach(cat => {
  categoryNames[cat.id] = cat.name;
});

/**
 * Get tool with search metadata for Qdrant seeding
 */
export function getToolWithMetadata(toolId: string): ToolWithMetadata | null {
  const tool = getToolById(toolId);
  if (!tool) return null;

  return {
    ...tool,
    synonyms: toolSynonyms[toolId] || [],
    useCases: toolUseCases[toolId] || [],
  };
}

/**
 * Get all tools with metadata for seeding
 */
export function getAllToolsWithMetadata(): ToolWithMetadata[] {
  return allTools.map(tool => ({
    ...tool,
    synonyms: toolSynonyms[tool.id] || [],
    useCases: toolUseCases[tool.id] || [],
  }));
}

/**
 * Auto-generate synonyms from tool title and description
 */
export function autoGenerateSynonyms(tool: ToolData): string[] {
  const words = new Set<string>();
  const stopWords = ['the', 'and', 'for', 'with', 'tool', 'generator', 'calculator', 'converter', 'from', 'your', 'this', 'that'];

  // Add words from title
  tool.title.toLowerCase().split(/\s+/).forEach(w => {
    if (w.length > 2 && !stopWords.includes(w)) {
      words.add(w);
    }
  });

  // Add words from description
  tool.description.toLowerCase().split(/\s+/).forEach(w => {
    if (w.length > 3 && !stopWords.includes(w)) {
      words.add(w);
    }
  });

  return Array.from(words);
}
