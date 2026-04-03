export interface App {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  link?: string;
  isAI?: boolean;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  apps: App[];
}

export const categories: Category[] = [
  // Life Management (Comprehensive Apps with Backend Support)
  {
    id: 'life-management',
    name: 'Life Management',
    description: 'Comprehensive apps for daily life tracking and wellness.',
    icon: '🌟',
    apps: [
      { id: 'habit-tracker', name: 'Habit Tracker', description: 'Daily habits & streaks', icon: '📊', link: '/habit-planner', color: '#E91E63' },
      { id: 'meditation', name: 'Meditation', description: 'Mindfulness & stress relief', icon: '🧘', link: '/meditation', color: '#9C27B0' },
      { id: 'fitness', name: 'Fitness', description: 'Workout plans & tracking', icon: '💪', link: '/fitness', color: '#FF5722' },
      { id: 'calories-tracker', name: 'Calories Tracker', description: 'Nutrition & meal tracking', icon: '🥗', link: '/calories-tracker', color: '#4CAF50' },
      { id: 'health-tracker', name: 'Health Tracker', description: 'Medical records & vitals', icon: '❤️', link: '/health', color: '#2196F3' },
      { id: 'recipe-builder', name: 'Recipe Builder', description: 'Create & organize recipes', icon: '👨‍🍳', link: '/recipe-builder', color: '#4ECDC4' },
      { id: 'expense-tracker', name: 'Expense Tracker', description: 'Budget & financial management', icon: '💳', link: '/expense-tracker', color: '#00BCD4' },
      { id: 'currency-converter', name: 'Currency Converter', description: 'Real-time exchange rates', icon: '💵', link: '/currency-exchange', color: '#009688' },
      { id: 'travel-planner', name: 'Travel Planner', description: 'AI-powered trip planning', icon: '🗺️', link: '/travel-planner', isAI: true, color: '#00ACC1' },
      { id: 'language-learner', name: 'Language Learning', description: 'Interactive language learning', icon: '🌐', link: '/language-learner', color: '#7C4DFF' },
      { id: 'blog', name: 'Blog & Writing', description: 'Content & community platform', icon: '📝', link: '/blog', color: '#FF5252' },
      { id: 'todo', name: 'Todo & Tasks', description: 'Task & project management', icon: '✅', link: '/todo', color: '#3F51B5' },
      { id: 'mood-tracker', name: 'Mood Tracker', description: 'Track daily emotions', icon: '😊', link: '/tools/mood-tracker', color: '#FF9800' },
      { id: 'gratitude-journal', name: 'Gratitude Journal', description: 'Daily gratitude practice', icon: '🙏', link: '/tools/gratitude-journal', color: '#8BC34A' },
      { id: 'habit-streak', name: 'Habit Streak', description: 'Track habit streaks', icon: '🔥', link: '/tools/habit-streak', color: '#F44336' },
      { id: 'goal-tracker', name: 'Goal Tracker', description: 'Set & achieve goals', icon: '🎯', link: '/tools/goal-tracker', color: '#673AB7' },
      { id: 'meal-planner', name: 'Meal Planner', description: 'Weekly meal planning & groceries', icon: '🍽️', link: '/tools/meal-planner', color: '#4CAF50' },
      { id: 'workout-planner', name: 'Workout Planner', description: 'Exercise routine builder', icon: '🏋️', link: '/tools/workout-planner', color: '#FF5722' },
      { id: 'study-planner', name: 'Study Planner', description: 'Academic planning & grades', icon: '📚', link: '/tools/study-planner', color: '#3F51B5' },
      { id: 'budget-dashboard', name: 'Budget Dashboard', description: 'Personal finance tracker', icon: '💰', link: '/tools/budget-dashboard', color: '#4CAF50' },
      { id: 'resume-builder', name: 'Resume Builder', description: 'Professional resume creator', icon: '📄', link: '/tools/resume-builder', color: '#2196F3' },
      { id: 'wedding-planner', name: 'Wedding Planner', description: 'Complete wedding planning', icon: '💒', link: '/tools/wedding-planner', color: '#E91E63' },
      { id: 'home-inventory', name: 'Home Inventory', description: 'Track household items', icon: '🏠', link: '/tools/home-inventory', color: '#795548' },
      { id: 'password-vault', name: 'Password Vault', description: 'Secure password manager', icon: '🔐', link: '/tools/password-vault', color: '#607D8B' },
    ]
  },

  // AI Tools
  {
    id: 'ai-tools',
    name: 'AI Tools',
    description: 'AI-powered tools for content creation and productivity.',
    icon: '🤖',
    apps: [
      { id: 'ai-image-generator', name: 'AI Image Generator', description: 'Generate images from text', icon: '🎨', link: '/ai-tools/image-generator', isAI: true, color: '#7C4DFF' },
      { id: 'ai-translator', name: 'AI Translator', description: 'Smart language translation', icon: '🌍', link: '/ai-tools/translator', isAI: true, color: '#00BCD4' },
      { id: 'ai-text-to-speech', name: 'AI Text to Speech', description: 'Convert text to audio', icon: '🔊', link: '/ai-tools/text-to-speech', isAI: true, color: '#9C27B0' },
      { id: 'ai-speech-to-text', name: 'AI Speech to Text', description: 'Transcribe audio to text', icon: '🎤', link: '/ai-tools/speech-to-text', isAI: true, color: '#D500F9' },
      { id: 'ai-resume-builder', name: 'AI Resume Builder', description: 'Create professional resumes', icon: '📄', link: '/ai-tools/resume-builder', isAI: true, color: '#5E35B1' },
      { id: 'ai-cover-letter', name: 'AI Cover Letter', description: 'Generate cover letters', icon: '📃', link: '/ai-tools/cover-letter', isAI: true, color: '#7E57C2' },
      { id: 'ai-email-composer', name: 'AI Email Composer', description: 'Compose professional emails', icon: '📧', link: '/ai-tools/email-composer', isAI: true, color: '#2196F3' },
      { id: 'ai-social-captions', name: 'AI Social Captions', description: 'Create engaging captions', icon: '💬', link: '/ai-tools/social-captions', isAI: true, color: '#E91E63' },
      { id: 'ai-hashtag-generator', name: 'AI Hashtag Generator', description: 'Generate trending hashtags', icon: '#️⃣', link: '/ai-tools/hashtag-generator', isAI: true, color: '#FF4081' },
      { id: 'ai-video-script', name: 'AI Video Script', description: 'Create video scripts', icon: '🎬', link: '/ai-tools/video-script', isAI: true, color: '#FF5722' },
      { id: 'ai-meeting-notes', name: 'AI Meeting Notes', description: 'Summarize meeting notes', icon: '📋', link: '/ai-tools/meeting-notes', isAI: true, color: '#00BCD4' },
      { id: 'ai-study-notes', name: 'AI Study Notes', description: 'Create study materials', icon: '📚', link: '/ai-tools/study-notes', isAI: true, color: '#4CAF50' },
      { id: 'ai-contract-analyzer', name: 'AI Contract Analyzer', description: 'Analyze legal contracts', icon: '⚖️', link: '/ai-tools/contract-analyzer', isAI: true, color: '#795548' },
      { id: 'ai-legal-document', name: 'AI Legal Document', description: 'Generate legal documents', icon: '📜', link: '/ai-tools/legal-document', isAI: true, color: '#607D8B' },
      { id: 'ai-tax-calculator', name: 'AI Tax Calculator', description: 'Calculate taxes smartly', icon: '🧮', link: '/ai-tools/tax-calculator', isAI: true, color: '#00897B' },
      { id: 'ai-investment-advisor', name: 'AI Investment Advisor', description: 'Get investment insights', icon: '📈', link: '/ai-tools/investment-advisor', isAI: true, color: '#1565C0' },
    ]
  },

  // Productivity
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Tools to boost your productivity and organization.',
    icon: '⚡',
    apps: [
      { id: 'notes', name: 'Notes', description: 'Rich text notes & folders', icon: '📝', link: '/notes', color: '#FFB74D' },
      { id: 'password-manager', name: 'Password Manager', description: 'Secure password storage', icon: '🔐', link: '/tools/password-manager', color: '#5C6BC0' },
      { id: 'ebook-reader', name: 'E-Book Reader', description: 'Read digital books', icon: '📖', link: '/tools/ebook-reader', color: '#8D6E63' },
      { id: 'billing-system', name: 'Billing System', description: 'Create invoices & estimates', icon: '🧾', link: '/billing-system', color: '#00897B' },
      { id: 'event-reminder', name: 'Event Reminder', description: 'Never miss an event', icon: '📅', link: '/tools/event-reminder', color: '#AB47BC' },
      { id: 'project-manager', name: 'Project Manager', description: 'Full project & task management', icon: '📊', link: '/tools/project-manager', color: '#3F51B5' },
      { id: 'kanban-board', name: 'Kanban Board', description: 'Visual task boards', icon: '📋', link: '/tools/kanban-board', color: '#009688' },
      { id: 'event-scheduler', name: 'Event Scheduler', description: 'Calendar & event planning', icon: '📆', link: '/tools/event-scheduler', color: '#E91E63' },
      { id: 'timezone-meeting-planner', name: 'Timezone Meeting Planner', description: 'Plan meetings across timezones', icon: '🌍', link: '/tools/timezone-meeting-planner', color: '#00BCD4' },
      { id: 'invoice-generator', name: 'Invoice Generator', description: 'Create professional invoices', icon: '🧾', link: '/tools/invoice-generator', color: '#4CAF50' },
      { id: 'expense-report', name: 'Expense Report', description: 'Generate expense reports', icon: '💳', link: '/tools/expense-report', color: '#FF9800' },
      { id: 'contract-generator', name: 'Contract Generator', description: 'Create legal contracts', icon: '📜', link: '/tools/contract-generator', color: '#795548' },
      { id: 'business-card-designer', name: 'Business Card Designer', description: 'Design business cards', icon: '💼', link: '/tools/business-card-designer', color: '#607D8B' },
    ]
  },

  // Developer Tools
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Tools for developers and power users.',
    icon: '🛠️',
    apps: [
      { id: 'text-tools', name: 'Text Tools', description: 'Text manipulation & formatting', icon: '🔤', link: '/tools/text', color: '#1976D2' },
      { id: 'encoding-tools', name: 'Encoding Tools', description: 'Encode & decode data', icon: '🔒', link: '/tools/encoding', color: '#388E3C' },
      { id: 'units-tools', name: 'Units Tools', description: 'Unit conversion tools', icon: '📐', link: '/tools/units', color: '#FF6F00' },
      { id: 'images-tools', name: 'Images Tools', description: 'Image manipulation', icon: '🖼️', link: '/tools/images', color: '#7B1FA2' },
      { id: 'qr-barcode', name: 'QR & Barcode', description: 'Generate & scan codes', icon: '📷', link: '/tools/qr-barcode', color: '#0288D1' },
      { id: 'docs-tools', name: 'Docs Tools', description: 'Document conversion', icon: '📑', link: '/tools/docs', color: '#D32F2F' },
      { id: 'media-tools', name: 'Media Tools', description: 'Audio & video tools', icon: '🎥', link: '/tools/media', color: '#00796B' },
    ]
  },

  // Utilities
  {
    id: 'utilities',
    name: 'Utilities',
    description: 'Handy utility apps for everyday use.',
    icon: '🔧',
    apps: [
      { id: 'internet-speed', name: 'Internet Speed', description: 'Test connection speed', icon: '🚀', link: '/utilities/internet-speed', color: '#5C6BC0' },
      { id: 'file-transfer', name: 'File Transfer', description: 'Transfer files easily', icon: '📁', link: '/utilities/file-transfer', color: '#42A5F5' },
      { id: 'compass-qibla', name: 'Compass & Qibla', description: 'Navigate & find Qibla', icon: '🧭', link: '/utilities/compass', color: '#EF5350' },
      { id: 'flashlight', name: 'Flashlight', description: 'Bright flashlight', icon: '🔦', link: '/utilities/flashlight', color: '#FFA726' },
      { id: 'receipt-scanner', name: 'Receipt Scanner', description: 'Scan & organize receipts', icon: '🧾', link: '/utilities/receipt-scanner', color: '#43A047' },
    ]
  },

  // Media & Entertainment
  {
    id: 'media-entertainment',
    name: 'Media & Entertainment',
    description: 'Apps for media consumption and entertainment.',
    icon: '🎬',
    apps: [
      { id: 'podcast-player', name: 'Podcast Player', description: 'Listen to podcasts', icon: '🎙️', link: '/media/podcast', color: '#8E24AA' },
      { id: 'photo-gallery', name: 'Photo Gallery', description: 'Organize your photos', icon: '🖼️', link: '/media/gallery', color: '#26A69A' },
      { id: 'music-player', name: 'Music Player', description: 'Play your music', icon: '🎵', link: '/media/music', color: '#E91E63' },
      { id: 'video-player', name: 'Video Player', description: 'Watch videos', icon: '📺', link: '/media/video', color: '#FF5722' },
      { id: 'audio-recorder', name: 'Audio Recorder', description: 'Record audio', icon: '🎤', link: '/media/recorder', color: '#FF7043' },
    ]
  },

  // Security & Privacy
  {
    id: 'security-privacy',
    name: 'Security & Privacy',
    description: 'Apps to protect your privacy and security.',
    icon: '🔒',
    apps: [
      { id: 'vpn', name: 'VPN', description: 'Secure connection', icon: '🌐', link: '/security/vpn', color: '#1E88E5' },
      { id: 'two-factor-auth', name: '2FA Authenticator', description: 'Two-factor authentication', icon: '🛡️', link: '/security/2fa', color: '#00897B' },
      { id: 'ciphertext', name: 'Ciphertext', description: 'Encrypt messages', icon: '🔐', link: '/security/cipher', color: '#795548' },
    ]
  },

  // Sensors & Detection
  {
    id: 'sensors-detection',
    name: 'Sensors & Detection',
    description: 'Apps that use device sensors.',
    icon: '📡',
    apps: [
      { id: 'pedometer', name: 'Pedometer', description: 'Count your steps', icon: '🚶', link: '/sensors/pedometer', color: '#4CAF50' },
      { id: 'magnifier', name: 'Magnifier', description: 'Zoom in on things', icon: '🔍', link: '/sensors/magnifier', color: '#607D8B' },
      { id: 'vibration-detector', name: 'Vibration Detector', description: 'Detect vibrations', icon: '📳', link: '/sensors/vibration', color: '#FF5722' },
      { id: 'light-detector', name: 'Light Detector', description: 'Measure light levels', icon: '💡', link: '/sensors/light', color: '#FFC107' },
      { id: 'color-detector', name: 'Color Detector', description: 'Identify colors', icon: '🎨', link: '/sensors/color', color: '#9C27B0' },
      { id: 'nfc-scanner', name: 'NFC Scanner', description: 'Read NFC tags', icon: '📶', link: '/sensors/nfc', color: '#2196F3' },
      { id: 'room-temperature', name: 'Room Temperature', description: 'Check temperature', icon: '🌡️', link: '/sensors/temperature', color: '#00BCD4' },
    ]
  },

  // Calculators & Tools
  {
    id: 'calculators-tools',
    name: 'Calculators & Tools',
    description: 'Specialized calculators and measurement tools.',
    icon: '🧮',
    apps: [
      { id: 'jewellery-calculator', name: 'Jewellery Calculator', description: 'Calculate gold & silver', icon: '💎', link: '/calculators/jewellery', color: '#FFD700' },
      { id: 'protractor', name: 'Protractor', description: 'Measure angles', icon: '📐', link: '/calculators/protractor', color: '#607D8B' },
      { id: 'resistor-codes', name: 'Resistor Codes', description: 'Decode resistor bands', icon: '⚡', link: '/calculators/resistor', color: '#795548' },
      { id: 'inductor-codes', name: 'Inductor Codes', description: 'Decode inductor values', icon: '🔌', link: '/calculators/inductor', color: '#4A5568' },
    ]
  },

  // Camera Utilities
  {
    id: 'camera-utilities',
    name: 'Camera Utilities',
    description: 'Camera-based utility apps.',
    icon: '📸',
    apps: [
      { id: 'night-mode-cam', name: 'Night Mode Cam', description: 'Low light photography', icon: '🌙', link: '/camera/night-mode', color: '#00FF00' },
      { id: 'blank-cam', name: 'Blank Cam', description: 'Stealth camera', icon: '📷', link: '/camera/blank', color: '#212121' },
    ]
  },

  // Home & Life
  {
    id: 'home-life',
    name: 'Home & Life',
    description: 'Apps for home management and daily life.',
    icon: '🏠',
    apps: [
      { id: 'home-repair', name: 'Home Repair', description: 'DIY repair guides', icon: '🔧', link: '/home/repair', color: '#8D6E63' },
      { id: 'pet-care', name: 'Pet Care', description: 'Manage pet health', icon: '🐕', link: '/home/pet-care', color: '#FF8A65' },
      { id: 'bill-reminder', name: 'Bill Reminder', description: 'Track bills & payments', icon: '📋', link: '/home/bills', color: '#26A69A' },
      { id: 'investment-tracker', name: 'Investment Tracker', description: 'Track investments', icon: '📊', link: '/home/investments', color: '#42A5F5' },
      { id: 'laundry-calculator', name: 'Laundry Calculator', description: 'Laundry load optimization', icon: '🧺', link: '/tools/laundry-calculator', color: '#00BCD4' },
      { id: 'dishwasher-loading', name: 'Dishwasher Loading', description: 'Efficient loading guide', icon: '🍽️', link: '/tools/dishwasher-loading', color: '#607D8B' },
      { id: 'ironing-guide', name: 'Ironing Guide', description: 'Fabric ironing tips', icon: '👔', link: '/tools/ironing-guide', color: '#795548' },
      { id: 'storage-unit-sizer', name: 'Storage Unit Sizer', description: 'Calculate storage needs', icon: '📦', link: '/tools/storage-unit-sizer', color: '#FF5722' },
      { id: 'closet-organizer', name: 'Closet Organizer', description: 'Organize your closet', icon: '👗', link: '/tools/closet-organizer', color: '#E91E63' },
      { id: 'moving-cost-estimator', name: 'Moving Cost Estimator', description: 'Estimate moving costs', icon: '🚚', link: '/tools/moving-cost-estimator', color: '#FF9800' },
    ]
  },

  // Calculators & Converters
  {
    id: 'calculators-converters',
    name: 'Calculators & Converters',
    description: 'Essential calculation and conversion tools.',
    icon: '🔢',
    apps: [
      { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Body mass index', icon: '⚖️', link: '/tools/bmi-calculator', color: '#4CAF50' },
      { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages', icon: '%', link: '/tools/percentage-calculator', color: '#2196F3' },
      { id: 'discount-calculator', name: 'Discount Calculator', description: 'Calculate discounts', icon: '🏷️', link: '/tools/discount-calculator', color: '#F44336' },
      { id: 'age-calculator', name: 'Age Calculator', description: 'Calculate exact age', icon: '🎂', link: '/tools/age-calculator', color: '#9C27B0' },
      { id: 'temperature-converter', name: 'Temperature Converter', description: 'Convert temperatures', icon: '🌡️', link: '/tools/temperature-converter', color: '#FF5722' },
      { id: 'length-converter', name: 'Length Converter', description: 'Convert lengths', icon: '📏', link: '/tools/length-converter', color: '#00BCD4' },
      { id: 'weight-converter', name: 'Weight Converter', description: 'Convert weights', icon: '⚖️', link: '/tools/weight-converter', color: '#795548' },
      { id: 'time-converter', name: 'Time Converter', description: 'Convert time units', icon: '⏰', link: '/tools/time-converter', color: '#3F51B5' },
      { id: 'currency-converter-tool', name: 'Currency Converter', description: 'Convert currencies', icon: '💱', link: '/tools/currency-converter', color: '#4CAF50' },
      { id: 'color-converter', name: 'Color Converter', description: 'Convert color formats', icon: '🎨', link: '/tools/color-converter', color: '#E91E63' },
      { id: 'timestamp-converter', name: 'Timestamp Converter', description: 'Convert timestamps', icon: '📅', link: '/tools/timestamp-converter', color: '#607D8B' },
      { id: 'number-base-converter', name: 'Number Base Converter', description: 'Convert number bases', icon: '🔢', link: '/tools/number-base-converter', color: '#673AB7' },
      { id: 'binary-converter', name: 'Binary Converter', description: 'Binary conversions', icon: '💻', link: '/tools/binary-converter', color: '#00897B' },
      { id: 'aspect-ratio-calculator', name: 'Aspect Ratio Calculator', description: 'Calculate ratios', icon: '📐', link: '/tools/aspect-ratio-calculator', color: '#FF9800' },
      { id: 'shoe-size-converter', name: 'Shoe Size Converter', description: 'Convert shoe sizes', icon: '👟', link: '/tools/shoe-size-converter', color: '#8D6E63' },
      { id: 'data-storage-converter', name: 'Data Storage Converter', description: 'Convert data units', icon: '💾', link: '/tools/data-storage-converter', color: '#1976D2' },
      { id: 'speed-converter', name: 'Speed Converter', description: 'Convert speed units', icon: '🚀', link: '/tools/speed-converter', color: '#F44336' },
      { id: 'roman-numerals', name: 'Roman Numerals', description: 'Roman numeral converter', icon: 'Ⅳ', link: '/tools/roman-numerals', color: '#8B4513' },
      { id: 'statistics-calculator', name: 'Statistics Calculator', description: 'Statistical calculations', icon: '📊', link: '/tools/statistics-calculator', color: '#3F51B5' },
      { id: 'equation-solver', name: 'Equation Solver', description: 'Solve equations', icon: '🔣', link: '/tools/equation-solver', color: '#9C27B0' },
      { id: 'fraction-calculator', name: 'Fraction Calculator', description: 'Fraction operations', icon: '½', link: '/tools/fraction-calculator', color: '#00BCD4' },
    ]
  },

  // Finance & Business
  {
    id: 'finance-business',
    name: 'Finance & Business',
    description: 'Financial planning and business tools.',
    icon: '💰',
    apps: [
      { id: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Calculate mortgage', icon: '🏠', link: '/tools/mortgage-calculator', color: '#4CAF50' },
      { id: 'loan-calculator', name: 'Loan Calculator', description: 'Calculate loans', icon: '💳', link: '/tools/loan-calculator', color: '#2196F3' },
      { id: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tips', icon: '💵', link: '/tools/tip-calculator', color: '#FF9800' },
      { id: 'compound-interest', name: 'Compound Interest', description: 'Calculate interest', icon: '📈', link: '/tools/compound-interest', color: '#4CAF50' },
      { id: 'savings-goal', name: 'Savings Goal', description: 'Plan savings goals', icon: '🎯', link: '/tools/savings-goal', color: '#00BCD4' },
      { id: 'salary-calculator', name: 'Salary Calculator', description: 'Calculate salary', icon: '💰', link: '/tools/salary-calculator', color: '#9C27B0' },
      { id: 'tax-estimator', name: 'Tax Estimator', description: 'Estimate taxes', icon: '📋', link: '/tools/tax-estimator', color: '#607D8B' },
      { id: 'rent-vs-buy', name: 'Rent vs Buy', description: 'Compare rent vs buy', icon: '🏘️', link: '/tools/rent-vs-buy', color: '#795548' },
      { id: 'wedding-budget', name: 'Wedding Budget', description: 'Plan wedding budget', icon: '💒', link: '/tools/wedding-budget', color: '#E91E63' },
      { id: 'break-even-calculator', name: 'Break Even Calculator', description: 'Calculate break even', icon: '📊', link: '/tools/break-even-calculator', color: '#3F51B5' },
      { id: 'profit-margin', name: 'Profit Margin', description: 'Calculate margins', icon: '💹', link: '/tools/profit-margin', color: '#4CAF50' },
      { id: 'roi-calculator', name: 'ROI Calculator', description: 'Return on investment', icon: '📈', link: '/tools/roi-calculator', color: '#FF5722' },
      { id: 'budget-planner', name: 'Budget Planner', description: 'Plan your budget', icon: '📝', link: '/tools/budget-planner', color: '#00BCD4' },
      { id: 'net-worth-calculator', name: 'Net Worth Calculator', description: 'Calculate net worth', icon: '💎', link: '/tools/net-worth-calculator', color: '#9C27B0' },
      { id: 'investment-growth', name: 'Investment Growth', description: 'Track investments', icon: '📈', link: '/tools/investment-growth', color: '#4CAF50' },
      { id: 'split-bill', name: 'Split Bill', description: 'Split bills easily', icon: '🍽️', link: '/tools/split-bill', color: '#FF9800' },
      { id: 'tip-split', name: 'Tip Split', description: 'Split tips & bills', icon: '💵', link: '/tools/tip-split', color: '#2196F3' },
      { id: 'mileage-log', name: 'Mileage Log', description: 'Track mileage', icon: '🚗', link: '/tools/mileage-log', color: '#795548' },
      { id: 'invoice-generator', name: 'Invoice Generator', description: 'Generate invoices', icon: '🧾', link: '/tools/invoice-generator', color: '#607D8B' },
      { id: 'unit-price', name: 'Unit Price Calculator', description: 'Compare unit prices', icon: '🏷️', link: '/tools/unit-price', color: '#F44336' },
      { id: 'discount-stacker', name: 'Discount Stacker', description: 'Stack discounts', icon: '🎁', link: '/tools/discount-stacker', color: '#E91E63' },
      { id: 'price-comparator', name: 'Price Comparator', description: 'Compare prices', icon: '⚖️', link: '/tools/price-comparator', color: '#00BCD4' },
      { id: 'car-loan-calculator', name: 'Car Loan Calculator', description: 'Calculate car loans', icon: '🚙', link: '/tools/car-loan-calculator', color: '#3F51B5' },
      { id: 'gift-budget-planner', name: 'Gift Budget Planner', description: 'Plan gift budgets', icon: '🎁', link: '/tools/gift-budget-planner', color: '#9C27B0' },
      { id: 'allowance-calculator', name: 'Allowance Calculator', description: 'Calculate allowances', icon: '🪙', link: '/tools/allowance-calculator', color: '#FF9800' },
    ]
  },

  // Date & Time Tools
  {
    id: 'date-time',
    name: 'Date & Time',
    description: 'Time management and date calculation tools.',
    icon: '⏰',
    apps: [
      { id: 'date-diff-calculator', name: 'Date Difference', description: 'Calculate date diff', icon: '📅', link: '/tools/date-diff-calculator', color: '#3F51B5' },
      { id: 'stopwatch', name: 'Stopwatch', description: 'Track time precisely', icon: '⏱️', link: '/tools/stopwatch', color: '#F44336' },
      { id: 'countdown-timer', name: 'Countdown Timer', description: 'Countdown to events', icon: '⏳', link: '/tools/countdown-timer', color: '#FF9800' },
      { id: 'pomodoro-timer', name: 'Pomodoro Timer', description: 'Productivity timer', icon: '🍅', link: '/tools/pomodoro-timer', color: '#E91E63' },
      { id: 'world-clock', name: 'World Clock', description: 'Global time zones', icon: '🌍', link: '/tools/world-clock', color: '#2196F3' },
      { id: 'timezone-meeting', name: 'Timezone Meeting', description: 'Schedule across timezones', icon: '🤝', link: '/tools/timezone-meeting', color: '#00BCD4' },
      { id: 'weekday-finder', name: 'Weekday Finder', description: 'Find weekdays', icon: '📆', link: '/tools/weekday-finder', color: '#9C27B0' },
      { id: 'event-countdown', name: 'Event Countdown', description: 'Countdown to events', icon: '🎉', link: '/tools/event-countdown', color: '#4CAF50' },
      { id: 'birthday-countdown', name: 'Birthday Countdown', description: 'Days to birthday', icon: '🎂', link: '/tools/birthday-countdown', color: '#FF5722' },
      { id: 'age-difference', name: 'Age Difference', description: 'Calculate age diff', icon: '👥', link: '/tools/age-difference', color: '#673AB7' },
      { id: 'due-date-calculator', name: 'Due Date Calculator', description: 'Pregnancy due date', icon: '🤰', link: '/tools/due-date-calculator', color: '#E91E63' },
      { id: 'jet-lag-calculator', name: 'Jet Lag Calculator', description: 'Calculate jet lag', icon: '✈️', link: '/tools/jet-lag-calculator', color: '#00BCD4' },
      { id: 'split-timer', name: 'Split Timer', description: 'Track lap times', icon: '🏃', link: '/tools/split-timer', color: '#FF9800' },
      { id: 'interval-timer', name: 'Interval Timer', description: 'Interval training', icon: '⏱️', link: '/tools/interval-timer', color: '#4CAF50' },
    ]
  },

  // Health & Wellness
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Health tracking and wellness tools.',
    icon: '❤️',
    apps: [
      { id: 'calorie-calculator', name: 'Calorie Calculator', description: 'Calculate calories', icon: '🔥', link: '/tools/calorie-calculator', color: '#FF5722' },
      { id: 'sleep-calculator', name: 'Sleep Calculator', description: 'Optimize sleep', icon: '😴', link: '/tools/sleep-calculator', color: '#673AB7' },
      { id: 'sleep-cycle', name: 'Sleep Cycle', description: 'Sleep cycle planner', icon: '🌙', link: '/tools/sleep-cycle', color: '#3F51B5' },
      { id: 'heart-rate-zone', name: 'Heart Rate Zone', description: 'Calculate HR zones', icon: '💓', link: '/tools/heart-rate-zone', color: '#F44336' },
      { id: 'body-fat-calculator', name: 'Body Fat Calculator', description: 'Calculate body fat', icon: '📊', link: '/tools/body-fat-calculator', color: '#FF9800' },
      { id: 'ideal-weight', name: 'Ideal Weight', description: 'Calculate ideal weight', icon: '⚖️', link: '/tools/ideal-weight', color: '#4CAF50' },
      { id: 'water-intake', name: 'Water Intake', description: 'Track hydration', icon: '💧', link: '/tools/water-intake', color: '#2196F3' },
      { id: 'blood-pressure-log', name: 'Blood Pressure Log', description: 'Track BP readings', icon: '🩺', link: '/tools/blood-pressure-log', color: '#E91E63' },
      { id: 'medication-reminder', name: 'Medication Reminder', description: 'Medicine reminders', icon: '💊', link: '/tools/medication-reminder', color: '#9C27B0' },
      { id: 'vision-test', name: 'Vision Test', description: 'Eye vision test', icon: '👁️', link: '/tools/vision-test', color: '#00BCD4' },
      { id: 'posture-checker', name: 'Posture Checker', description: 'Check posture', icon: '🧍', link: '/tools/posture-checker', color: '#795548' },
      { id: 'breathing-exercise', name: 'Breathing Exercise', description: 'Breathing exercises', icon: '🌬️', link: '/tools/breathing-exercise', color: '#4CAF50' },
      { id: 'stretch-timer', name: 'Stretch Timer', description: 'Stretching routines', icon: '🤸', link: '/tools/stretch-timer', color: '#FF5722' },
      { id: 'macro-calculator', name: 'Macro Calculator', description: 'Calculate macros', icon: '🥗', link: '/tools/macro-calculator', color: '#8BC34A' },
      { id: 'caffeine-calculator', name: 'Caffeine Calculator', description: 'Track caffeine', icon: '☕', link: '/tools/caffeine-calculator', color: '#795548' },
      { id: 'hydration-calculator', name: 'Hydration Calculator', description: 'Hydration needs', icon: '💧', link: '/tools/hydration-calculator', color: '#2196F3' },
      { id: 'protein-calculator', name: 'Protein Calculator', description: 'Protein needs', icon: '🥩', link: '/tools/protein-calculator', color: '#F44336' },
      { id: 'alcohol-calculator', name: 'Alcohol Calculator', description: 'BAC calculator', icon: '🍷', link: '/tools/alcohol-calculator', color: '#9C27B0' },
      { id: 'calories-burned', name: 'Calories Burned', description: 'Track calories burned', icon: '🔥', link: '/tools/calories-burned', color: '#FF9800' },
      { id: 'noise-exposure', name: 'Noise Exposure', description: 'Track noise levels', icon: '🔊', link: '/tools/noise-exposure-calculator', color: '#607D8B' },
      { id: 'screen-break-reminder', name: 'Screen Break Reminder', description: 'Eye break reminders', icon: '🖥️', link: '/tools/screen-break-reminder', color: '#00BCD4' },
      { id: 'drink-water-reminder', name: 'Drink Water Reminder', description: 'Hydration reminders', icon: '💧', link: '/tools/drink-water-reminder', color: '#2196F3' },
      { id: 'blood-type-diet', name: 'Blood Type Diet', description: 'Diet by blood type', icon: '🩸', link: '/tools/blood-type-diet', color: '#F44336' },
      { id: 'vitamin-tracker', name: 'Vitamin Tracker', description: 'Track vitamins', icon: '💊', link: '/tools/vitamin-tracker', color: '#FF9800' },
      { id: 'first-aid-guide', name: 'First Aid Guide', description: 'First aid tips', icon: '🏥', link: '/tools/first-aid-guide', color: '#E91E63' },
      { id: 'sunscreen-calculator', name: 'Sunscreen Calculator', description: 'SPF calculator', icon: '☀️', link: '/tools/sunscreen-calculator', color: '#FFC107' },
      { id: 'contact-lens-reminder', name: 'Contact Lens Reminder', description: 'Lens replacement', icon: '👓', link: '/tools/contact-lens-reminder', color: '#00BCD4' },
      { id: 'allergy-scanner', name: 'Allergy Scanner', description: 'Check allergens', icon: '🤧', link: '/tools/allergy-scanner', color: '#8BC34A' },
      { id: 'emergency-contacts', name: 'Emergency Contacts', description: 'Emergency numbers', icon: '🚨', link: '/tools/emergency-contacts', color: '#F44336' },
    ]
  },

  // Fitness & Sports
  {
    id: 'fitness-sports',
    name: 'Fitness & Sports',
    description: 'Workout and sports tracking tools.',
    icon: '🏋️',
    apps: [
      { id: 'running-pace', name: 'Running Pace', description: 'Calculate pace', icon: '🏃', link: '/tools/running-pace-calculator', color: '#4CAF50' },
      { id: 'swim-pace', name: 'Swim Pace', description: 'Swimming pace', icon: '🏊', link: '/tools/swim-pace-calculator', color: '#2196F3' },
      { id: 'cycling-power', name: 'Cycling Power', description: 'Cycling metrics', icon: '🚴', link: '/tools/cycling-power-calculator', color: '#FF9800' },
      { id: 'rep-max', name: '1 Rep Max', description: 'Calculate 1RM', icon: '🏋️', link: '/tools/rep-max-calculator', color: '#F44336' },
      { id: 'golf-handicap', name: 'Golf Handicap', description: 'Calculate handicap', icon: '⛳', link: '/tools/golf-handicap-calculator', color: '#4CAF50' },
      { id: 'bowling-score', name: 'Bowling Score', description: 'Track bowling', icon: '🎳', link: '/tools/bowling-score-calculator', color: '#9C27B0' },
      { id: 'archery-score', name: 'Archery Score', description: 'Track archery', icon: '🎯', link: '/tools/archery-score', color: '#FF5722' },
      { id: 'darts-score', name: 'Darts Score', description: 'Track darts', icon: '🎯', link: '/tools/darts-score', color: '#E91E63' },
      { id: 'ski-wax', name: 'Ski Wax Guide', description: 'Ski wax selection', icon: '⛷️', link: '/tools/ski-wax', color: '#00BCD4' },
      { id: 'fishing-conditions', name: 'Fishing Conditions', description: 'Fishing forecast', icon: '🎣', link: '/tools/fishing-conditions', color: '#3F51B5' },
      { id: 'hiking-trail-planner', name: 'Hiking Trail Planner', description: 'Plan hikes', icon: '🥾', link: '/tools/hiking-trail-planner', color: '#795548' },
      { id: 'bike-maintenance', name: 'Bike Maintenance', description: 'Bike service guide', icon: '🚲', link: '/tools/bike-maintenance', color: '#607D8B' },
    ]
  },

  // Cooking & Kitchen
  {
    id: 'cooking-kitchen',
    name: 'Cooking & Kitchen',
    description: 'Cooking calculators and kitchen tools.',
    icon: '👨‍🍳',
    apps: [
      { id: 'cooking-conversions', name: 'Cooking Conversions', description: 'Recipe conversions', icon: '📏', link: '/tools/cooking-conversions', color: '#FF9800' },
      { id: 'brew-ratio', name: 'Brew Ratio', description: 'Coffee brewing ratios', icon: '☕', link: '/tools/brew-ratio', color: '#795548' },
      { id: 'recipe-scaler', name: 'Recipe Scaler', description: 'Scale recipes', icon: '📐', link: '/tools/recipe-scaler', color: '#4CAF50' },
      { id: 'grilling-timer', name: 'Grilling Timer', description: 'Grill timing guide', icon: '🍖', link: '/tools/grilling-timer', color: '#F44336' },
      { id: 'meat-thawing', name: 'Meat Thawing', description: 'Thawing calculator', icon: '🥩', link: '/tools/meat-thawing', color: '#E91E63' },
      { id: 'turkey-thawing', name: 'Turkey Thawing', description: 'Turkey thaw time', icon: '🦃', link: '/tools/turkey-thawing', color: '#FF5722' },
      { id: 'egg-boiling', name: 'Egg Timer', description: 'Perfect egg timing', icon: '🥚', link: '/tools/egg-boiling', color: '#FFC107' },
      { id: 'pasta-portion', name: 'Pasta Portion', description: 'Pasta serving sizes', icon: '🍝', link: '/tools/pasta-portion', color: '#FF9800' },
      { id: 'rice-water-ratio', name: 'Rice Water Ratio', description: 'Perfect rice ratios', icon: '🍚', link: '/tools/rice-water-ratio', color: '#8BC34A' },
      { id: 'steak-doneness', name: 'Steak Doneness', description: 'Steak temperatures', icon: '🥩', link: '/tools/steak-doneness', color: '#F44336' },
      { id: 'baking-substitution', name: 'Baking Substitution', description: 'Ingredient swaps', icon: '🧁', link: '/tools/baking-substitution', color: '#E91E63' },
      { id: 'sourdough-starter', name: 'Sourdough Starter', description: 'Sourdough guide', icon: '🍞', link: '/tools/sourdough-starter', color: '#795548' },
      { id: 'pizza-dough', name: 'Pizza Dough', description: 'Pizza dough recipe', icon: '🍕', link: '/tools/pizza-dough', color: '#FF5722' },
      { id: 'canning-timer', name: 'Canning Timer', description: 'Canning times', icon: '🫙', link: '/tools/canning-timer', color: '#4CAF50' },
    ]
  },

  // Beverages & Drinks
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Drink preparation and brewing tools.',
    icon: '🍹',
    apps: [
      { id: 'wine-serving', name: 'Wine Serving', description: 'Wine serving guide', icon: '🍷', link: '/tools/wine-serving', color: '#9C27B0' },
      { id: 'cocktail-mixer', name: 'Cocktail Mixer', description: 'Cocktail recipes', icon: '🍸', link: '/tools/cocktail-mixer', color: '#E91E63' },
      { id: 'home-brewing', name: 'Home Brewing', description: 'Beer brewing guide', icon: '🍺', link: '/tools/home-brewing', color: '#FF9800' },
    ]
  },

  // Home Improvement & DIY
  {
    id: 'home-improvement',
    name: 'Home Improvement',
    description: 'DIY and construction calculators.',
    icon: '🔨',
    apps: [
      { id: 'paint-calculator', name: 'Paint Calculator', description: 'Calculate paint needs', icon: '🎨', link: '/tools/paint-calculator', color: '#2196F3' },
      { id: 'concrete-calculator', name: 'Concrete Calculator', description: 'Concrete estimation', icon: '🧱', link: '/tools/concrete-calculator', color: '#607D8B' },
      { id: 'tile-calculator', name: 'Tile Calculator', description: 'Tile estimation', icon: '🪟', link: '/tools/tile-calculator', color: '#00BCD4' },
      { id: 'flooring-calculator', name: 'Flooring Calculator', description: 'Flooring materials', icon: '🏠', link: '/tools/flooring-calculator', color: '#795548' },
      { id: 'wallpaper-calculator', name: 'Wallpaper Calculator', description: 'Wallpaper needs', icon: '🎨', link: '/tools/wallpaper-calculator', color: '#E91E63' },
      { id: 'drywall-calculator', name: 'Drywall Calculator', description: 'Drywall estimation', icon: '🔲', link: '/tools/drywall-calculator', color: '#9E9E9E' },
      { id: 'deck-board-calculator', name: 'Deck Board Calculator', description: 'Deck materials', icon: '🪵', link: '/tools/deck-board-calculator', color: '#8D6E63' },
      { id: 'fence-calculator', name: 'Fence Calculator', description: 'Fence materials', icon: '🏗️', link: '/tools/fence-calculator', color: '#795548' },
      { id: 'mulch-calculator', name: 'Mulch Calculator', description: 'Mulch volume', icon: '🌿', link: '/tools/mulch-calculator', color: '#4CAF50' },
      { id: 'gravel-calculator', name: 'Gravel Calculator', description: 'Gravel estimation', icon: '⚪', link: '/tools/gravel-calculator', color: '#9E9E9E' },
      { id: 'roofing-calculator', name: 'Roofing Calculator', description: 'Roofing materials', icon: '🏠', link: '/tools/roofing-calculator', color: '#F44336' },
      { id: 'insulation-calculator', name: 'Insulation Calculator', description: 'Insulation needs', icon: '🧶', link: '/tools/insulation-calculator', color: '#FF9800' },
      { id: 'stair-calculator', name: 'Stair Calculator', description: 'Stair dimensions', icon: '🪜', link: '/tools/stair-calculator', color: '#795548' },
      { id: 'crown-molding', name: 'Crown Molding', description: 'Molding calculator', icon: '📐', link: '/tools/crown-molding-calculator', color: '#8D6E63' },
      { id: 'plywood-calculator', name: 'Plywood Calculator', description: 'Plywood sheets', icon: '🪵', link: '/tools/plywood-calculator', color: '#A1887F' },
      { id: 'retaining-wall', name: 'Retaining Wall', description: 'Wall materials', icon: '🧱', link: '/tools/retaining-wall-calculator', color: '#607D8B' },
      { id: 'sod-calculator', name: 'Sod Calculator', description: 'Sod estimation', icon: '🌱', link: '/tools/sod-calculator', color: '#4CAF50' },
      { id: 'ac-unit-sizer', name: 'AC Unit Sizer', description: 'AC sizing guide', icon: '❄️', link: '/tools/ac-unit-sizer', color: '#00BCD4' },
      { id: 'water-heater-sizer', name: 'Water Heater Sizer', description: 'Water heater sizing', icon: '🔥', link: '/tools/water-heater-sizer', color: '#FF5722' },
      { id: 'generator-sizer', name: 'Generator Sizer', description: 'Generator sizing', icon: '⚡', link: '/tools/generator-sizer', color: '#FFC107' },
      { id: 'solar-panel-calculator', name: 'Solar Panel Calculator', description: 'Solar needs', icon: '☀️', link: '/tools/solar-panel-calculator', color: '#FF9800' },
      { id: 'electricity-bill', name: 'Electricity Bill', description: 'Estimate power bills', icon: '💡', link: '/tools/electricity-bill', color: '#FFC107' },
      { id: 'electricity-cost', name: 'Electricity Cost', description: 'Power consumption', icon: '⚡', link: '/tools/electricity-cost', color: '#FF9800' },
    ]
  },

  // Gardening & Outdoor
  {
    id: 'gardening-outdoor',
    name: 'Gardening & Outdoor',
    description: 'Gardening and landscaping tools.',
    icon: '🌱',
    apps: [
      { id: 'plant-watering', name: 'Plant Watering', description: 'Watering schedules', icon: '💧', link: '/tools/plant-watering', color: '#2196F3' },
      { id: 'plant-hardiness-zone', name: 'Plant Hardiness Zone', description: 'Growing zones', icon: '🌍', link: '/tools/plant-hardiness-zone', color: '#4CAF50' },
      { id: 'seed-starting', name: 'Seed Starting', description: 'Seed planting guide', icon: '🌱', link: '/tools/seed-starting', color: '#8BC34A' },
      { id: 'compost-ratio', name: 'Compost Ratio', description: 'Composting guide', icon: '🍂', link: '/tools/compost-ratio', color: '#795548' },
      { id: 'sprinkler-calculator', name: 'Sprinkler Calculator', description: 'Irrigation needs', icon: '💦', link: '/tools/sprinkler-calculator', color: '#00BCD4' },
      { id: 'lawn-fertilizer', name: 'Lawn Fertilizer', description: 'Fertilizer calculator', icon: '🌿', link: '/tools/lawn-fertilizer', color: '#4CAF50' },
      { id: 'raised-bed', name: 'Raised Bed', description: 'Bed soil volume', icon: '🌻', link: '/tools/raised-bed-calculator', color: '#8D6E63' },
      { id: 'greenhouse-sizing', name: 'Greenhouse Sizing', description: 'Greenhouse planning', icon: '🏡', link: '/tools/greenhouse-sizing', color: '#4CAF50' },
      { id: 'chicken-coop', name: 'Chicken Coop', description: 'Coop sizing guide', icon: '🐔', link: '/tools/chicken-coop-calculator', color: '#FF9800' },
      { id: 'beehive-calculator', name: 'Beehive Calculator', description: 'Beekeeping guide', icon: '🐝', link: '/tools/beehive-calculator', color: '#FFC107' },
    ]
  },

  // Pool & Water
  {
    id: 'pool-water',
    name: 'Pool & Water',
    description: 'Pool and water feature tools.',
    icon: '🏊',
    apps: [
      { id: 'pool-volume', name: 'Pool Volume', description: 'Calculate pool volume', icon: '🏊', link: '/tools/pool-volume-calculator', color: '#2196F3' },
      { id: 'pool-chemical', name: 'Pool Chemical', description: 'Chemical balance', icon: '🧪', link: '/tools/pool-chemical', color: '#00BCD4' },
      { id: 'hot-tub-maintenance', name: 'Hot Tub Maintenance', description: 'Hot tub care', icon: '🛁', link: '/tools/hot-tub-maintenance', color: '#9C27B0' },
      { id: 'aquarium-calculator', name: 'Aquarium Calculator', description: 'Aquarium sizing', icon: '🐠', link: '/tools/aquarium-calculator', color: '#00BCD4' },
    ]
  },

  // Weather & Environment
  {
    id: 'weather-environment',
    name: 'Weather & Environment',
    description: 'Weather and environmental tools.',
    icon: '🌤️',
    apps: [
      { id: 'wind-chill', name: 'Wind Chill', description: 'Wind chill factor', icon: '🌬️', link: '/tools/wind-chill', color: '#00BCD4' },
      { id: 'heat-index', name: 'Heat Index', description: 'Feels like temp', icon: '🌡️', link: '/tools/heat-index', color: '#FF5722' },
      { id: 'uv-index', name: 'UV Index', description: 'UV exposure', icon: '☀️', link: '/tools/uv-index-calculator', color: '#FFC107' },
      { id: 'dew-point', name: 'Dew Point', description: 'Dew point calculator', icon: '💧', link: '/tools/dew-point-calculator', color: '#2196F3' },
      { id: 'air-quality-index', name: 'Air Quality Index', description: 'AQI calculator', icon: '🌫️', link: '/tools/air-quality-index', color: '#4CAF50' },
      { id: 'sun-angle', name: 'Sun Angle', description: 'Solar position', icon: '🌞', link: '/tools/sun-angle-calculator', color: '#FF9800' },
      { id: 'snow-day-predictor', name: 'Snow Day Predictor', description: 'Snow day chances', icon: '❄️', link: '/tools/snow-day-predictor', color: '#00BCD4' },
      { id: 'lightning-distance', name: 'Lightning Distance', description: 'Storm distance', icon: '⚡', link: '/tools/lightning-distance', color: '#FFC107' },
      { id: 'earthquake-magnitude', name: 'Earthquake Magnitude', description: 'Richter scale', icon: '🌍', link: '/tools/earthquake-magnitude', color: '#795548' },
      { id: 'moon-phase', name: 'Moon Phase', description: 'Lunar calendar', icon: '🌙', link: '/tools/moon-phase', color: '#3F51B5' },
      { id: 'carbon-footprint', name: 'Carbon Footprint', description: 'CO2 calculator', icon: '🌍', link: '/tools/carbon-footprint', color: '#4CAF50' },
    ]
  },

  // Automotive
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Vehicle maintenance and calculation tools.',
    icon: '🚗',
    apps: [
      { id: 'gas-mileage', name: 'Gas Mileage', description: 'MPG calculator', icon: '⛽', link: '/tools/gas-mileage-calculator', color: '#4CAF50' },
      { id: 'fuel-cost', name: 'Fuel Cost', description: 'Trip fuel cost', icon: '💰', link: '/tools/fuel-cost-calculator', color: '#FF9800' },
      { id: 'tire-age', name: 'Tire Age', description: 'Tire age checker', icon: '🛞', link: '/tools/tire-age-calculator', color: '#607D8B' },
      { id: 'oil-change-reminder', name: 'Oil Change Reminder', description: 'Oil change tracker', icon: '🛢️', link: '/tools/oil-change-reminder', color: '#795548' },
      { id: 'tire-pressure-guide', name: 'Tire Pressure Guide', description: 'Optimal PSI', icon: '🔧', link: '/tools/tire-pressure-guide', color: '#2196F3' },
    ]
  },

  // Pet Care
  {
    id: 'pet-care-extended',
    name: 'Pet Care',
    description: 'Pet health and care tools.',
    icon: '🐾',
    apps: [
      { id: 'pet-food-calculator', name: 'Pet Food Calculator', description: 'Feeding portions', icon: '🥣', link: '/tools/pet-food-calculator', color: '#FF9800' },
      { id: 'pet-age', name: 'Pet Age Calculator', description: 'Pet to human age', icon: '🐕', link: '/tools/pet-age', color: '#795548' },
      { id: 'pet-medication-tracker', name: 'Pet Medication', description: 'Pet medicine tracker', icon: '💊', link: '/tools/pet-medication-tracker', color: '#E91E63' },
      { id: 'dog-walking-timer', name: 'Dog Walking Timer', description: 'Walk tracking', icon: '🦮', link: '/tools/dog-walking-timer', color: '#4CAF50' },
      { id: 'bird-feeding-guide', name: 'Bird Feeding Guide', description: 'Bird food guide', icon: '🐦', link: '/tools/bird-feeding-guide', color: '#2196F3' },
    ]
  },

  // Crafts & Hobbies
  {
    id: 'crafts-hobbies',
    name: 'Crafts & Hobbies',
    description: 'Crafting and hobby tools.',
    icon: '🎨',
    apps: [
      { id: 'knitting-row-counter', name: 'Knitting Row Counter', description: 'Track rows', icon: '🧶', link: '/tools/knitting-row-counter', color: '#E91E63' },
      { id: 'sewing-pattern-sizer', name: 'Sewing Pattern Sizer', description: 'Pattern sizing', icon: '🪡', link: '/tools/sewing-pattern-sizer', color: '#9C27B0' },
      { id: 'soap-making', name: 'Soap Making', description: 'Soap recipe calc', icon: '🧼', link: '/tools/soap-making-calculator', color: '#00BCD4' },
      { id: 'candle-making', name: 'Candle Making', description: 'Candle calculator', icon: '🕯️', link: '/tools/candle-making', color: '#FF9800' },
      { id: 'resin-calculator', name: 'Resin Calculator', description: 'Resin mixing ratios', icon: '💎', link: '/tools/resin-calculator', color: '#673AB7' },
      { id: 'paper-craft-sizer', name: 'Paper Craft Sizer', description: 'Paper dimensions', icon: '📄', link: '/tools/paper-craft-sizer', color: '#2196F3' },
      { id: 'frame-sizer', name: 'Frame Sizer', description: 'Picture framing', icon: '🖼️', link: '/tools/frame-sizer', color: '#795548' },
    ]
  },

  // Music & Audio
  {
    id: 'music-audio',
    name: 'Music & Audio',
    description: 'Music theory and audio tools.',
    icon: '🎵',
    apps: [
      { id: 'bpm-tapper', name: 'BPM Tapper', description: 'Tap tempo finder', icon: '🥁', link: '/tools/bpm-tapper', color: '#F44336' },
      { id: 'metronome', name: 'Metronome', description: 'Digital metronome', icon: '🎼', link: '/tools/metronome', color: '#3F51B5' },
      { id: 'music-theory', name: 'Music Theory', description: 'Scale & chord finder', icon: '🎹', link: '/tools/music-theory', color: '#9C27B0' },
      { id: 'chord-progression', name: 'Chord Progression', description: 'Chord progressions', icon: '🎸', link: '/tools/chord-progression', color: '#E91E63' },
      { id: 'guitar-tuner', name: 'Guitar Tuner', description: 'Tune your guitar', icon: '🎸', link: '/tools/guitar-tuner', color: '#FF9800' },
      { id: 'drum-pattern', name: 'Drum Pattern', description: 'Drum beat maker', icon: '🥁', link: '/tools/drum-pattern', color: '#795548' },
      { id: 'white-noise', name: 'White Noise', description: 'Ambient sounds', icon: '🔊', link: '/tools/white-noise', color: '#607D8B' },
    ]
  },

  // Education & Learning
  {
    id: 'education-learning',
    name: 'Education & Learning',
    description: 'Study and learning tools.',
    icon: '📚',
    apps: [
      { id: 'flashcard', name: 'Flashcard', description: 'Study flashcards', icon: '📇', link: '/tools/flashcard', color: '#FF9800' },
      { id: 'citation-generator', name: 'Citation Generator', description: 'Generate citations', icon: '📝', link: '/tools/citation-generator', color: '#3F51B5' },
      { id: 'gpa-calculator', name: 'GPA Calculator', description: 'Calculate GPA', icon: '🎓', link: '/tools/gpa-calculator', color: '#4CAF50' },
      { id: 'grade-calculator', name: 'Grade Calculator', description: 'Calculate grades', icon: '📊', link: '/tools/grade-calculator', color: '#2196F3' },
      { id: 'periodic-table', name: 'Periodic Table', description: 'Element reference', icon: '⚗️', link: '/tools/periodic-table', color: '#9C27B0' },
      { id: 'study-timer', name: 'Study Timer', description: 'Focus timer', icon: '📖', link: '/tools/study-timer', color: '#FF5722' },
      { id: 'typing-speed', name: 'Typing Speed', description: 'Typing test', icon: '⌨️', link: '/tools/typing-speed', color: '#00BCD4' },
      { id: 'spelling-bee', name: 'Spelling Bee', description: 'Spelling practice', icon: '🐝', link: '/tools/spelling-bee-helper', color: '#FFC107' },
      { id: 'math-facts-practice', name: 'Math Facts Practice', description: 'Math drills', icon: '🔢', link: '/tools/math-facts-practice', color: '#4CAF50' },
      { id: 'handwriting-practice', name: 'Handwriting Practice', description: 'Improve writing', icon: '✍️', link: '/tools/handwriting-practice', color: '#795548' },
    ]
  },

  // Travel & Transportation
  {
    id: 'travel-transportation',
    name: 'Travel & Transportation',
    description: 'Travel planning and transportation tools.',
    icon: '✈️',
    apps: [
      { id: 'packing-list', name: 'Packing List', description: 'Travel packing', icon: '🧳', link: '/tools/packing-list', color: '#FF9800' },
      { id: 'travel-vaccine-guide', name: 'Travel Vaccine Guide', description: 'Vaccination info', icon: '💉', link: '/tools/travel-vaccine-guide', color: '#4CAF50' },
      { id: 'visa-requirements', name: 'Visa Requirements', description: 'Visa information', icon: '🛂', link: '/tools/visa-requirements', color: '#2196F3' },
      { id: 'luggage-weight', name: 'Luggage Weight', description: 'Baggage limits', icon: '⚖️', link: '/tools/luggage-weight', color: '#607D8B' },
      { id: 'road-trip-planner', name: 'Road Trip Planner', description: 'Plan road trips', icon: '🚗', link: '/tools/road-trip-planner', color: '#FF5722' },
      { id: 'cruise-planner', name: 'Cruise Planner', description: 'Cruise planning', icon: '🚢', link: '/tools/cruise-planner', color: '#00BCD4' },
    ]
  },

  // Entertainment & Games
  {
    id: 'entertainment-games',
    name: 'Entertainment & Games',
    description: 'Fun and entertainment tools.',
    icon: '🎮',
    apps: [
      { id: 'dice-roller', name: 'Dice Roller', description: 'Roll virtual dice', icon: '🎲', link: '/tools/dice-roller', color: '#F44336' },
      { id: 'coin-flipper', name: 'Coin Flipper', description: 'Flip a coin', icon: '🪙', link: '/tools/coin-flipper', color: '#FFC107' },
      { id: 'decision-maker', name: 'Decision Maker', description: 'Random picker', icon: '🎯', link: '/tools/decision-maker', color: '#9C27B0' },
      { id: 'lottery-odds', name: 'Lottery Odds', description: 'Calculate odds', icon: '🎰', link: '/tools/lottery-odds-calculator', color: '#4CAF50' },
      { id: 'dice-probability', name: 'Dice Probability', description: 'Dice math', icon: '🎲', link: '/tools/dice-probability', color: '#FF9800' },
      { id: 'photo-booth-props', name: 'Photo Booth Props', description: 'Party props ideas', icon: '📸', link: '/tools/photo-booth-props', color: '#E91E63' },
      { id: 'escape-room-timer', name: 'Escape Room Timer', description: 'Escape room clock', icon: '🔐', link: '/tools/escape-room-timer', color: '#3F51B5' },
      { id: 'scavenger-hunt', name: 'Scavenger Hunt', description: 'Hunt generator', icon: '🔍', link: '/tools/scavenger-hunt', color: '#4CAF50' },
      { id: 'trivia-scoreboard', name: 'Trivia Scoreboard', description: 'Game scoring', icon: '🏆', link: '/tools/trivia-scoreboard', color: '#FF9800' },
      { id: 'bingo-card-generator', name: 'Bingo Card Generator', description: 'Generate bingo cards', icon: '🎱', link: '/tools/bingo-card-generator', color: '#9C27B0' },
      { id: 'movie-night-picker', name: 'Movie Night Picker', description: 'Pick movies', icon: '🎬', link: '/tools/movie-night-picker', color: '#F44336' },
      { id: 'tabletop-rpg', name: 'Tabletop RPG', description: 'RPG tools', icon: '🧙', link: '/tools/tabletop-rpg', color: '#673AB7' },
      { id: 'gaming-session-log', name: 'Gaming Session Log', description: 'Track gaming', icon: '🎮', link: '/tools/gaming-session-log', color: '#2196F3' },
      { id: 'stream-deck-planner', name: 'Stream Deck Planner', description: 'Streaming setup', icon: '📺', link: '/tools/stream-deck-planner', color: '#9C27B0' },
    ]
  },

  // Writing & Creative
  {
    id: 'writing-creative',
    name: 'Writing & Creative',
    description: 'Creative writing and inspiration tools.',
    icon: '✍️',
    apps: [
      { id: 'character-name-generator', name: 'Character Name Generator', description: 'Generate names', icon: '🎭', link: '/tools/character-name-generator', color: '#9C27B0' },
      { id: 'writing-prompt-generator', name: 'Writing Prompt Generator', description: 'Story prompts', icon: '📝', link: '/tools/writing-prompt-generator', color: '#3F51B5' },
      { id: 'plot-twist-generator', name: 'Plot Twist Generator', description: 'Story twists', icon: '🌀', link: '/tools/plot-twist-generator', color: '#E91E63' },
      { id: 'word-of-the-day', name: 'Word of the Day', description: 'Daily vocabulary', icon: '📖', link: '/tools/word-of-the-day', color: '#FF9800' },
      { id: 'language-phrasebook', name: 'Language Phrasebook', description: 'Travel phrases', icon: '🗣️', link: '/tools/language-phrasebook', color: '#4CAF50' },
      { id: 'book-club-tracker', name: 'Book Club Tracker', description: 'Track reading', icon: '📚', link: '/tools/book-club-tracker', color: '#795548' },
      { id: 'podcast-tracker', name: 'Podcast Tracker', description: 'Track podcasts', icon: '🎙️', link: '/tools/podcast-tracker', color: '#9C27B0' },
    ]
  },

  // Party & Events
  {
    id: 'party-events',
    name: 'Party & Events',
    description: 'Event planning tools.',
    icon: '🎉',
    apps: [
      { id: 'party-planner', name: 'Party Planner', description: 'Plan parties', icon: '🎊', link: '/tools/party-planner', color: '#E91E63' },
      { id: 'camping-checklist', name: 'Camping Checklist', description: 'Camping gear list', icon: '⛺', link: '/tools/camping-checklist', color: '#4CAF50' },
      { id: 'chore-chart', name: 'Chore Chart', description: 'Task assignments', icon: '📋', link: '/tools/chore-chart', color: '#FF9800' },
    ]
  },

  // Beauty & Personal Care
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    description: 'Personal care and beauty tools.',
    icon: '💄',
    apps: [
      { id: 'skin-care-routine', name: 'Skin Care Routine', description: 'Skincare guide', icon: '🧴', link: '/tools/skin-care-routine', color: '#E91E63' },
      { id: 'hair-care-guide', name: 'Hair Care Guide', description: 'Hair care tips', icon: '💇', link: '/tools/hair-care-guide', color: '#9C27B0' },
      { id: 'nail-art-designer', name: 'Nail Art Designer', description: 'Nail design ideas', icon: '💅', link: '/tools/nail-art-designer', color: '#F44336' },
      { id: 'wardrobe-planner', name: 'Wardrobe Planner', description: 'Outfit planning', icon: '👗', link: '/tools/wardrobe-planner', color: '#3F51B5' },
      { id: 'ring-size-calculator', name: 'Ring Size Calculator', description: 'Find ring size', icon: '💍', link: '/tools/ring-size-calculator', color: '#FFC107' },
    ]
  },

  // Astrology & Spirituality
  {
    id: 'astrology-spirituality',
    name: 'Astrology & Spirituality',
    description: 'Astrology and spiritual tools.',
    icon: '🔮',
    apps: [
      { id: 'zodiac-compatibility', name: 'Zodiac Compatibility', description: 'Star sign matching', icon: '⭐', link: '/tools/zodiac-compatibility', color: '#673AB7' },
      { id: 'birthstone-finder', name: 'Birthstone Finder', description: 'Find birthstones', icon: '💎', link: '/tools/birthstone-finder', color: '#00BCD4' },
      { id: 'chinese-zodiac', name: 'Chinese Zodiac', description: 'Chinese astrology', icon: '🐉', link: '/tools/chinese-zodiac', color: '#F44336' },
      { id: 'life-path-number', name: 'Life Path Number', description: 'Numerology', icon: '🔢', link: '/tools/life-path-number', color: '#9C27B0' },
    ]
  },

  // Family & Kids
  {
    id: 'family-kids',
    name: 'Family & Kids',
    description: 'Family planning and parenting tools.',
    icon: '👨‍👩‍👧‍👦',
    apps: [
      { id: 'baby-name-generator', name: 'Baby Name Generator', description: 'Find baby names', icon: '👶', link: '/tools/baby-name-generator', color: '#E91E63' },
    ]
  },

  // Real Estate & Property
  {
    id: 'real-estate-property',
    name: 'Real Estate & Property',
    description: 'Property management and real estate tools.',
    icon: '🏢',
    apps: [
      { id: 'property-manager', name: 'Property Manager', description: 'Manage rental properties', icon: '🏠', link: '/tools/property-manager', color: '#4CAF50' },
      { id: 'rental-yield-calculator', name: 'Rental Yield Calculator', description: 'Calculate rental returns', icon: '📊', link: '/tools/rental-yield-calculator', color: '#2196F3' },
      { id: 'mortgage-comparison', name: 'Mortgage Comparison', description: 'Compare mortgage rates', icon: '🏦', link: '/tools/mortgage-comparison', color: '#FF9800' },
    ]
  },

  // Restaurant & Hospitality
  {
    id: 'restaurant-hospitality',
    name: 'Restaurant & Hospitality',
    description: 'Restaurant and hospitality management tools.',
    icon: '🍽️',
    apps: [
      { id: 'menu-builder', name: 'Menu Builder', description: 'Create restaurant menus', icon: '📋', link: '/tools/menu-builder', color: '#FF5722' },
      { id: 'table-reservation', name: 'Table Reservation', description: 'Manage reservations', icon: '🪑', link: '/tools/table-reservation', color: '#4CAF50' },
      { id: 'kitchen-order', name: 'Kitchen Order', description: 'Kitchen order system', icon: '👨‍🍳', link: '/tools/kitchen-order', color: '#FF9800' },
      { id: 'hotel-management', name: 'Hotel Management', description: 'Hotel booking system', icon: '🏨', link: '/tools/hotel-management', color: '#9C27B0' },
      { id: 'food-truck', name: 'Food Truck', description: 'Food truck management', icon: '🚚', link: '/tools/food-truck', color: '#E91E63' },
      { id: 'coffee-shop', name: 'Coffee Shop', description: 'Coffee shop operations', icon: '☕', link: '/tools/coffee-shop', color: '#795548' },
      { id: 'bakery-order', name: 'Bakery Order', description: 'Bakery order tracking', icon: '🥐', link: '/tools/bakery-order', color: '#FF9800' },
      { id: 'catering', name: 'Catering', description: 'Catering management', icon: '🍱', link: '/tools/catering', color: '#4CAF50' },
      { id: 'liquor-store', name: 'Liquor Store', description: 'Liquor inventory', icon: '🍷', link: '/tools/liquor-store', color: '#9C27B0' },
      { id: 'butcher-shop', name: 'Butcher Shop', description: 'Butcher shop orders', icon: '🥩', link: '/tools/butcher-shop', color: '#F44336' },
    ]
  },

  // Legal Services
  {
    id: 'legal-services',
    name: 'Legal Services',
    description: 'Law practice and legal management tools.',
    icon: '⚖️',
    apps: [
      { id: 'legal-case-manager', name: 'Legal Case Manager', description: 'Manage legal cases', icon: '📁', link: '/tools/legal-case-manager', color: '#3F51B5' },
      { id: 'legal-billing', name: 'Legal Billing', description: 'Track billable hours', icon: '💰', link: '/tools/legal-billing', color: '#4CAF50' },
    ]
  },

  // Construction & Trades
  {
    id: 'construction-trades',
    name: 'Construction & Trades',
    description: 'Contractor and construction tools.',
    icon: '🏗️',
    apps: [
      { id: 'construction-bid', name: 'Construction Bid', description: 'Create project bids', icon: '📝', link: '/tools/construction-bid', color: '#FF9800' },
      { id: 'project-timeline', name: 'Project Timeline', description: 'Construction schedules', icon: '📅', link: '/tools/project-timeline', color: '#2196F3' },
      { id: 'roofing-contractor', name: 'Roofing Contractor', description: 'Roofing job tracker', icon: '🏠', link: '/tools/roofing-contractor', color: '#795548' },
      { id: 'painting-contractor', name: 'Painting Contractor', description: 'Painting job manager', icon: '🎨', link: '/tools/painting-contractor', color: '#E91E63' },
      { id: 'handyman', name: 'Handyman', description: 'Handyman services', icon: '🔧', link: '/tools/handyman', color: '#607D8B' },
      { id: 'tree-service', name: 'Tree Service', description: 'Tree service jobs', icon: '🌳', link: '/tools/tree-service', color: '#4CAF50' },
      { id: 'septic-service', name: 'Septic Service', description: 'Septic system service', icon: '🚰', link: '/tools/septic-service', color: '#795548' },
      { id: 'carpet-cleaning', name: 'Carpet Cleaning', description: 'Carpet cleaning jobs', icon: '🧹', link: '/tools/carpet-cleaning', color: '#00BCD4' },
    ]
  },

  // Freelance & Consulting
  {
    id: 'freelance-consulting',
    name: 'Freelance & Consulting',
    description: 'Freelance and consulting business tools.',
    icon: '💼',
    apps: [
      { id: 'freelance-timer', name: 'Freelance Timer', description: 'Track billable time', icon: '⏱️', link: '/tools/freelance-timer', color: '#4CAF50' },
      { id: 'proposal-generator', name: 'Proposal Generator', description: 'Create proposals', icon: '📄', link: '/tools/proposal-generator', color: '#2196F3' },
      { id: 'client-portal', name: 'Client Portal', description: 'Client management', icon: '👥', link: '/tools/client-portal', color: '#9C27B0' },
      { id: 'web-design-studio', name: 'Web Design Studio', description: 'Web design projects', icon: '🖥️', link: '/tools/web-design-studio', color: '#FF5722' },
      { id: 'life-coaching', name: 'Life Coaching', description: 'Coaching sessions', icon: '🎯', link: '/tools/life-coaching', color: '#E91E63' },
    ]
  },

  // Healthcare Practice
  {
    id: 'healthcare-practice',
    name: 'Healthcare Practice',
    description: 'Medical and healthcare practice tools.',
    icon: '🏥',
    apps: [
      { id: 'medical-scheduler', name: 'Medical Scheduler', description: 'Appointment scheduling', icon: '📅', link: '/tools/medical-scheduler', color: '#2196F3' },
      { id: 'patient-records', name: 'Patient Records', description: 'Patient management', icon: '📋', link: '/tools/patient-records', color: '#4CAF50' },
      { id: 'prescription-tracker', name: 'Prescription Tracker', description: 'Track prescriptions', icon: '💊', link: '/tools/prescription-tracker', color: '#9C27B0' },
      { id: 'dental-chart', name: 'Dental Chart', description: 'Dental charting', icon: '🦷', link: '/tools/dental-chart', color: '#00BCD4' },
      { id: 'chiropractic', name: 'Chiropractic', description: 'Chiropractic practice', icon: '🦴', link: '/tools/chiropractic', color: '#FF9800' },
      { id: 'physical-therapy', name: 'Physical Therapy', description: 'PT sessions', icon: '🏃', link: '/tools/physical-therapy', color: '#4CAF50' },
      { id: 'massage-therapy', name: 'Massage Therapy', description: 'Massage bookings', icon: '💆', link: '/tools/massage-therapy', color: '#E91E63' },
      { id: 'optometry', name: 'Optometry', description: 'Eye care practice', icon: '👁️', link: '/tools/optometry', color: '#3F51B5' },
      { id: 'pharmacy', name: 'Pharmacy', description: 'Pharmacy management', icon: '💊', link: '/tools/pharmacy', color: '#F44336' },
      { id: 'veterinary-records', name: 'Veterinary Records', description: 'Vet patient records', icon: '🐾', link: '/tools/veterinary-records', color: '#795548' },
      { id: 'therapy-practice', name: 'Therapy Practice', description: 'Therapy sessions', icon: '🧠', link: '/tools/therapy-practice', color: '#9C27B0' },
      { id: 'nutritionist', name: 'Nutritionist', description: 'Nutrition practice', icon: '🥗', link: '/tools/nutritionist', color: '#4CAF50' },
    ]
  },

  // Beauty & Salon Business
  {
    id: 'beauty-salon-business',
    name: 'Beauty & Salon Business',
    description: 'Salon and beauty business tools.',
    icon: '💇',
    apps: [
      { id: 'salon-booking', name: 'Salon Booking', description: 'Appointment booking', icon: '📅', link: '/tools/salon-booking', color: '#E91E63' },
      { id: 'salon-client-records', name: 'Salon Client Records', description: 'Client management', icon: '👤', link: '/tools/salon-client-records', color: '#9C27B0' },
      { id: 'service-pricing', name: 'Service Pricing', description: 'Pricing calculator', icon: '💰', link: '/tools/service-pricing', color: '#4CAF50' },
      { id: 'mobile-grooming', name: 'Mobile Grooming', description: 'Mobile grooming service', icon: '🚐', link: '/tools/mobile-grooming', color: '#FF9800' },
    ]
  },

  // Education & Tutoring Business
  {
    id: 'education-tutoring-business',
    name: 'Education & Tutoring Business',
    description: 'Tutoring and education business tools.',
    icon: '🎓',
    apps: [
      { id: 'tutoring-scheduler', name: 'Tutoring Scheduler', description: 'Schedule tutoring', icon: '📅', link: '/tools/tutoring-scheduler', color: '#3F51B5' },
      { id: 'student-progress', name: 'Student Progress', description: 'Track student progress', icon: '📊', link: '/tools/student-progress', color: '#4CAF50' },
      { id: 'music-lessons', name: 'Music Lessons', description: 'Music lesson scheduling', icon: '🎵', link: '/tools/music-lessons', color: '#9C27B0' },
      { id: 'driving-school', name: 'Driving School', description: 'Driving lessons', icon: '🚗', link: '/tools/driving-school', color: '#FF5722' },
      { id: 'dance-studio', name: 'Dance Studio', description: 'Dance class scheduling', icon: '💃', link: '/tools/dance-studio', color: '#E91E63' },
      { id: 'martial-arts', name: 'Martial Arts', description: 'Martial arts studio', icon: '🥋', link: '/tools/martial-arts', color: '#F44336' },
      { id: 'art-class', name: 'Art Class', description: 'Art class management', icon: '🎨', link: '/tools/art-class', color: '#FF9800' },
      { id: 'pottery-studio', name: 'Pottery Studio', description: 'Pottery class booking', icon: '🏺', link: '/tools/pottery-studio', color: '#795548' },
    ]
  },

  // Photography & Media Business
  {
    id: 'photography-media-business',
    name: 'Photography & Media',
    description: 'Photography and media production tools.',
    icon: '📸',
    apps: [
      { id: 'photo-shoot-planner', name: 'Photo Shoot Planner', description: 'Plan photo sessions', icon: '📷', link: '/tools/photo-shoot-planner', color: '#3F51B5' },
      { id: 'photo-editing-tracker', name: 'Photo Editing Tracker', description: 'Track editing progress', icon: '🖼️', link: '/tools/photo-editing-tracker', color: '#9C27B0' },
      { id: 'audio-video', name: 'Audio Video', description: 'AV production', icon: '🎬', link: '/tools/audio-video', color: '#F44336' },
      { id: 'recording-studio', name: 'Recording Studio', description: 'Studio bookings', icon: '🎙️', link: '/tools/recording-studio', color: '#FF9800' },
      { id: 'theatre-company', name: 'Theatre Company', description: 'Theatre management', icon: '🎭', link: '/tools/theatre-company', color: '#9C27B0' },
      { id: 'music-venue', name: 'Music Venue', description: 'Venue management', icon: '🎤', link: '/tools/music-venue', color: '#E91E63' },
      { id: 'dj-booking', name: 'DJ Booking', description: 'DJ event booking', icon: '🎧', link: '/tools/dj-booking', color: '#673AB7' },
    ]
  },

  // Event Planning Business
  {
    id: 'event-planning-business',
    name: 'Event Planning Business',
    description: 'Event planning and management tools.',
    icon: '🎊',
    apps: [
      { id: 'event-vendor-manager', name: 'Event Vendor Manager', description: 'Manage vendors', icon: '👥', link: '/tools/event-vendor-manager', color: '#E91E63' },
      { id: 'event-timeline', name: 'Event Timeline', description: 'Event scheduling', icon: '📅', link: '/tools/event-timeline', color: '#4CAF50' },
      { id: 'guest-list-manager', name: 'Guest List Manager', description: 'Manage guest lists', icon: '📋', link: '/tools/guest-list-manager', color: '#2196F3' },
      { id: 'party-rental', name: 'Party Rental', description: 'Rental equipment', icon: '🎈', link: '/tools/party-rental', color: '#FF9800' },
    ]
  },

  // Home Services Business
  {
    id: 'home-services-business',
    name: 'Home Services Business',
    description: 'Home service contractor tools.',
    icon: '🔧',
    apps: [
      { id: 'plumbing-service', name: 'Plumbing Service', description: 'Plumbing job tracker', icon: '🔧', link: '/tools/plumbing-service', color: '#2196F3' },
      { id: 'electrical-service', name: 'Electrical Service', description: 'Electrical jobs', icon: '⚡', link: '/tools/electrical-service', color: '#FFC107' },
      { id: 'hvac-service', name: 'HVAC Service', description: 'HVAC maintenance', icon: '❄️', link: '/tools/hvac-service', color: '#00BCD4' },
      { id: 'pest-control', name: 'Pest Control', description: 'Pest control service', icon: '🐜', link: '/tools/pest-control', color: '#4CAF50' },
      { id: 'appliance-repair', name: 'Appliance Repair', description: 'Appliance repairs', icon: '🔌', link: '/tools/appliance-repair', color: '#607D8B' },
      { id: 'locksmith', name: 'Locksmith', description: 'Locksmith services', icon: '🔑', link: '/tools/locksmith', color: '#795548' },
      { id: 'window-cleaning', name: 'Window Cleaning', description: 'Window cleaning jobs', icon: '🪟', link: '/tools/window-cleaning', color: '#00BCD4' },
      { id: 'pool-service', name: 'Pool Service', description: 'Pool maintenance', icon: '🏊', link: '/tools/pool-service', color: '#2196F3' },
      { id: 'cleaning-service', name: 'Cleaning Service', description: 'Cleaning jobs', icon: '🧹', link: '/tools/cleaning-service', color: '#4CAF50' },
      { id: 'landscaping-estimate', name: 'Landscaping Estimate', description: 'Landscaping quotes', icon: '🌿', link: '/tools/landscaping-estimate', color: '#8BC34A' },
    ]
  },

  // Retail & Commerce
  {
    id: 'retail-commerce',
    name: 'Retail & Commerce',
    description: 'Retail and commerce business tools.',
    icon: '🛒',
    apps: [
      { id: 'consignment-shop', name: 'Consignment Shop', description: 'Consignment tracking', icon: '👗', link: '/tools/consignment-shop', color: '#E91E63' },
      { id: 'auction-house', name: 'Auction House', description: 'Auction management', icon: '🔨', link: '/tools/auction-house', color: '#FF9800' },
      { id: 'pawn-shop', name: 'Pawn Shop', description: 'Pawn shop inventory', icon: '💎', link: '/tools/pawn-shop', color: '#FFC107' },
      { id: 'retail-inventory', name: 'Retail Inventory', description: 'Inventory management', icon: '📦', link: '/tools/retail-inventory', color: '#4CAF50' },
      { id: 'shipping-tracker', name: 'Shipping Tracker', description: 'Track shipments', icon: '🚚', link: '/tools/shipping-tracker', color: '#2196F3' },
      { id: 'florist-order', name: 'Florist Order', description: 'Floral orders', icon: '💐', link: '/tools/florist-order', color: '#E91E63' },
      { id: 'print-shop', name: 'Print Shop', description: 'Print orders', icon: '🖨️', link: '/tools/print-shop', color: '#607D8B' },
      { id: 'furniture-store', name: 'Furniture Store', description: 'Furniture sales', icon: '🛋️', link: '/tools/furniture-store', color: '#795548' },
      { id: 'mattress-store', name: 'Mattress Store', description: 'Mattress sales', icon: '🛏️', link: '/tools/mattress-store', color: '#9C27B0' },
      { id: 'hardware-store', name: 'Hardware Store', description: 'Hardware inventory', icon: '🔨', link: '/tools/hardware-store', color: '#FF5722' },
      { id: 'pet-store', name: 'Pet Store', description: 'Pet store management', icon: '🐕', link: '/tools/pet-store', color: '#4CAF50' },
      { id: 'garden-center', name: 'Garden Center', description: 'Garden center sales', icon: '🌱', link: '/tools/garden-center', color: '#8BC34A' },
    ]
  },

  // Vehicle & Auto Services
  {
    id: 'vehicle-auto-services',
    name: 'Vehicle & Auto Services',
    description: 'Automotive service business tools.',
    icon: '🚗',
    apps: [
      { id: 'vehicle-inspection', name: 'Vehicle Inspection', description: 'Inspection checklist', icon: '🔍', link: '/tools/vehicle-inspection', color: '#2196F3' },
      { id: 'auto-work-order', name: 'Auto Work Order', description: 'Auto repair orders', icon: '📋', link: '/tools/auto-work-order', color: '#FF9800' },
      { id: 'parts-inventory', name: 'Parts Inventory', description: 'Auto parts tracking', icon: '🔧', link: '/tools/parts-inventory', color: '#607D8B' },
      { id: 'auto-detailing', name: 'Auto Detailing', description: 'Detailing services', icon: '✨', link: '/tools/auto-detailing', color: '#4CAF50' },
      { id: 'car-wash', name: 'Car Wash', description: 'Car wash business', icon: '🚿', link: '/tools/car-wash', color: '#00BCD4' },
      { id: 'towing-service', name: 'Towing Service', description: 'Towing dispatch', icon: '🚗', link: '/tools/towing-service', color: '#F44336' },
      { id: 'motorcycle-shop', name: 'Motorcycle Shop', description: 'Motorcycle sales', icon: '🏍️', link: '/tools/motorcycle-shop', color: '#FF5722' },
      { id: 'boat-dealer', name: 'Boat Dealer', description: 'Boat sales', icon: '🚤', link: '/tools/boat-dealer', color: '#2196F3' },
      { id: 'rv-dealer', name: 'RV Dealer', description: 'RV sales', icon: '🚐', link: '/tools/rv-dealer', color: '#4CAF50' },
    ]
  },

  // Pet Services
  {
    id: 'pet-services-business',
    name: 'Pet Services Business',
    description: 'Pet care business tools.',
    icon: '🐾',
    apps: [
      { id: 'pet-grooming', name: 'Pet Grooming', description: 'Pet grooming appointments', icon: '🐕', link: '/tools/pet-grooming', color: '#FF9800' },
    ]
  },

  // Fitness Business
  {
    id: 'fitness-business',
    name: 'Fitness Business',
    description: 'Gym and fitness business tools.',
    icon: '💪',
    apps: [
      { id: 'personal-trainer', name: 'Personal Trainer', description: 'Training sessions', icon: '🏋️', link: '/tools/personal-trainer', color: '#FF5722' },
      { id: 'fitness-instructor', name: 'Fitness Instructor', description: 'Class scheduling', icon: '🧘', link: '/tools/fitness-instructor', color: '#4CAF50' },
      { id: 'gym-membership', name: 'Gym Membership', description: 'Member management', icon: '💳', link: '/tools/gym-membership', color: '#2196F3' },
      { id: 'yoga-studio', name: 'Yoga Studio', description: 'Yoga class booking', icon: '🧘', link: '/tools/yoga-studio', color: '#9C27B0' },
    ]
  },

  // Beverage & Brewing Business
  {
    id: 'beverage-brewing-business',
    name: 'Beverage & Brewing',
    description: 'Brewery and beverage business tools.',
    icon: '🍺',
    apps: [
      { id: 'brewery', name: 'Brewery', description: 'Brewery management', icon: '🍺', link: '/tools/brewery', color: '#FF9800' },
      { id: 'winery', name: 'Winery', description: 'Winery operations', icon: '🍷', link: '/tools/winery', color: '#9C27B0' },
      { id: 'distillery', name: 'Distillery', description: 'Distillery production', icon: '🥃', link: '/tools/distillery', color: '#795548' },
    ]
  },

  // Specialty Shops
  {
    id: 'specialty-shops',
    name: 'Specialty Shops',
    description: 'Specialty retail business tools.',
    icon: '🏪',
    apps: [
      { id: 'comic-book-store', name: 'Comic Book Store', description: 'Comic inventory', icon: '📚', link: '/tools/comic-book-store', color: '#F44336' },
      { id: 'record-store', name: 'Record Store', description: 'Vinyl inventory', icon: '💿', link: '/tools/record-store', color: '#673AB7' },
      { id: 'antique-shop', name: 'Antique Shop', description: 'Antique inventory', icon: '🏺', link: '/tools/antique-shop', color: '#795548' },
      { id: 'art-gallery', name: 'Art Gallery', description: 'Gallery management', icon: '🖼️', link: '/tools/art-gallery', color: '#E91E63' },
      { id: 'bicycle-shop', name: 'Bicycle Shop', description: 'Bike sales & repair', icon: '🚲', link: '/tools/bicycle-shop', color: '#4CAF50' },
      { id: 'ski-shop', name: 'Ski Shop', description: 'Ski equipment', icon: '⛷️', link: '/tools/ski-shop', color: '#00BCD4' },
      { id: 'surf-shop', name: 'Surf Shop', description: 'Surf equipment', icon: '🏄', link: '/tools/surf-shop', color: '#2196F3' },
      { id: 'dive-shop', name: 'Dive Shop', description: 'Dive equipment', icon: '🤿', link: '/tools/dive-shop', color: '#00BCD4' },
      { id: 'gun-shop', name: 'Gun Shop', description: 'Firearms inventory', icon: '🎯', link: '/tools/gun-shop', color: '#607D8B' },
    ]
  },

  // Outdoor Recreation Business
  {
    id: 'outdoor-recreation-business',
    name: 'Outdoor Recreation',
    description: 'Outdoor recreation business tools.',
    icon: '🏕️',
    apps: [
      { id: 'kayak-rental', name: 'Kayak Rental', description: 'Kayak rentals', icon: '🛶', link: '/tools/kayak-rental', color: '#2196F3' },
      { id: 'boat-charter', name: 'Boat Charter', description: 'Boat charters', icon: '⛵', link: '/tools/boat-charter', color: '#00BCD4' },
      { id: 'marina-management', name: 'Marina Management', description: 'Marina operations', icon: '⚓', link: '/tools/marina-management', color: '#3F51B5' },
      { id: 'campground', name: 'Campground', description: 'Campground booking', icon: '⛺', link: '/tools/campground', color: '#4CAF50' },
      { id: 'golf-course', name: 'Golf Course', description: 'Golf course management', icon: '⛳', link: '/tools/golf-course', color: '#8BC34A' },
    ]
  },

  // Entertainment Venues
  {
    id: 'entertainment-venues',
    name: 'Entertainment Venues',
    description: 'Entertainment venue business tools.',
    icon: '🎢',
    apps: [
      { id: 'bowling-alley', name: 'Bowling Alley', description: 'Lane reservations', icon: '🎳', link: '/tools/bowling-alley', color: '#FF5722' },
      { id: 'climbing-gym', name: 'Climbing Gym', description: 'Climbing gym management', icon: '🧗', link: '/tools/climbing-gym', color: '#4CAF50' },
      { id: 'arcade', name: 'Arcade', description: 'Arcade management', icon: '🕹️', link: '/tools/arcade', color: '#9C27B0' },
      { id: 'trampoline-park', name: 'Trampoline Park', description: 'Park management', icon: '🤸', link: '/tools/trampoline-park', color: '#FF9800' },
      { id: 'laser-tag', name: 'Laser Tag', description: 'Laser tag arena', icon: '🔫', link: '/tools/laser-tag', color: '#F44336' },
      { id: 'mini-golf', name: 'Mini Golf', description: 'Mini golf course', icon: '⛳', link: '/tools/mini-golf', color: '#4CAF50' },
      { id: 'skating-rink', name: 'Skating Rink', description: 'Skating sessions', icon: '⛸️', link: '/tools/skating-rink', color: '#00BCD4' },
      { id: 'axe-throwing', name: 'Axe Throwing', description: 'Axe throwing venue', icon: '🪓', link: '/tools/axe-throwing', color: '#795548' },
      { id: 'shooting-range', name: 'Shooting Range', description: 'Range management', icon: '🎯', link: '/tools/shooting-range', color: '#607D8B' },
      { id: 'go-kart', name: 'Go Kart', description: 'Go kart track', icon: '🏎️', link: '/tools/go-kart', color: '#FF5722' },
      { id: 'paintball', name: 'Paintball', description: 'Paintball field', icon: '🎨', link: '/tools/paintball', color: '#4CAF50' },
      { id: 'escape-room-business', name: 'Escape Room Business', description: 'Escape room venue', icon: '🔐', link: '/tools/escape-room-business', color: '#9C27B0' },
    ]
  },

  // Specialty Services
  {
    id: 'specialty-services',
    name: 'Specialty Services',
    description: 'Specialty service business tools.',
    icon: '⭐',
    apps: [
      { id: 'tattoo-shop', name: 'Tattoo Shop', description: 'Tattoo appointments', icon: '💉', link: '/tools/tattoo-shop', color: '#607D8B' },
      { id: 'funeral-home', name: 'Funeral Home', description: 'Funeral services', icon: '🕯️', link: '/tools/funeral-home', color: '#795548' },
      { id: 'escorting-service', name: 'Escorting Service', description: 'Escort/security services', icon: '🛡️', link: '/tools/escorting-service', color: '#3F51B5' },
      { id: 'security-guard', name: 'Security Guard', description: 'Security scheduling', icon: '👮', link: '/tools/security-guard', color: '#607D8B' },
      { id: 'moving-company', name: 'Moving Company', description: 'Moving services', icon: '🚚', link: '/tools/moving-company', color: '#FF9800' },
      { id: 'storage-facility', name: 'Storage Facility', description: 'Storage units', icon: '📦', link: '/tools/storage-facility', color: '#795548' },
      { id: 'laundry-service', name: 'Laundry Service', description: 'Laundry business', icon: '🧺', link: '/tools/laundry-service', color: '#00BCD4' },
      { id: 'jewelry-repair', name: 'Jewelry Repair', description: 'Jewelry repair', icon: '💍', link: '/tools/jewelry-repair', color: '#FFC107' },
    ]
  },

  // Print & Production
  {
    id: 'print-production',
    name: 'Print & Production',
    description: 'Print and production business tools.',
    icon: '🖨️',
    apps: [
      { id: 'screen-printing', name: 'Screen Printing', description: 'Screen printing orders', icon: '👕', link: '/tools/screen-printing', color: '#FF5722' },
      { id: 'copy-shop', name: 'Copy Shop', description: 'Copy center orders', icon: '📄', link: '/tools/copy-shop', color: '#607D8B' },
      { id: 'trophy-shop', name: 'Trophy Shop', description: 'Awards & trophies', icon: '🏆', link: '/tools/trophy-shop', color: '#FFC107' },
      { id: 'embroidery-shop', name: 'Embroidery Shop', description: 'Embroidery orders', icon: '🧵', link: '/tools/embroidery-shop', color: '#E91E63' },
    ]
  },

  // Repair Services
  {
    id: 'repair-services',
    name: 'Repair Services',
    description: 'Repair and alteration business tools.',
    icon: '🔨',
    apps: [
      { id: 'shoe-repair', name: 'Shoe Repair', description: 'Shoe repair orders', icon: '👞', link: '/tools/shoe-repair', color: '#795548' },
      { id: 'upholstery', name: 'Upholstery', description: 'Upholstery orders', icon: '🛋️', link: '/tools/upholstery', color: '#9C27B0' },
      { id: 'alterations', name: 'Alterations', description: 'Clothing alterations', icon: '👗', link: '/tools/alterations', color: '#E91E63' },
      { id: 'phone-repair', name: 'Phone Repair', description: 'Phone repair orders', icon: '📱', link: '/tools/phone-repair', color: '#2196F3' },
    ]
  },

  // Professional Services
  {
    id: 'professional-services',
    name: 'Professional Services',
    description: 'Professional service business tools.',
    icon: '💼',
    apps: [
      { id: 'bookkeeping', name: 'Bookkeeping', description: 'Bookkeeping service', icon: '📚', link: '/tools/bookkeeping', color: '#4CAF50' },
      { id: 'tax-preparation', name: 'Tax Preparation', description: 'Tax prep service', icon: '📋', link: '/tools/tax-preparation', color: '#3F51B5' },
      { id: 'notary-service', name: 'Notary Service', description: 'Notary appointments', icon: '📜', link: '/tools/notary-service', color: '#795548' },
      { id: 'translation-service', name: 'Translation Service', description: 'Translation orders', icon: '🌍', link: '/tools/translation-service', color: '#00BCD4' },
      { id: 'courier-service', name: 'Courier Service', description: 'Delivery service', icon: '📦', link: '/tools/courier-service', color: '#FF9800' },
      { id: 'it-support', name: 'IT Support', description: 'IT service tickets', icon: '💻', link: '/tools/it-support', color: '#2196F3' },
      { id: 'insurance-quote', name: 'Insurance Quote', description: 'Insurance quotes', icon: '📋', link: '/tools/insurance-quote', color: '#4CAF50' },
    ]
  },

  // Community & Non-Profit
  {
    id: 'community-nonprofit',
    name: 'Community & Non-Profit',
    description: 'Community organization tools.',
    icon: '🤝',
    apps: [
      { id: 'church-management', name: 'Church Management', description: 'Church administration', icon: '⛪', link: '/tools/church-management', color: '#673AB7' },
      { id: 'non-profit', name: 'Non-Profit', description: 'Non-profit management', icon: '❤️', link: '/tools/non-profit', color: '#E91E63' },
      { id: 'hoa-management', name: 'HOA Management', description: 'HOA administration', icon: '🏘️', link: '/tools/hoa-management', color: '#4CAF50' },
      { id: 'daycare-management', name: 'Daycare Management', description: 'Daycare operations', icon: '👶', link: '/tools/daycare-management', color: '#FF9800' },
    ]
  },

  // Rental & Equipment
  {
    id: 'rental-equipment',
    name: 'Rental & Equipment',
    description: 'Rental business tools.',
    icon: '📦',
    apps: [
      { id: 'equipment-rental', name: 'Equipment Rental', description: 'Equipment rentals', icon: '🔧', link: '/tools/equipment-rental', color: '#FF9800' },
      { id: 'staffing-agency', name: 'Staffing Agency', description: 'Staffing services', icon: '👥', link: '/tools/staffing-agency', color: '#4CAF50' },
      { id: 'vending-machine', name: 'Vending Machine', description: 'Vending operations', icon: '🎰', link: '/tools/vending-machine', color: '#9C27B0' },
      { id: 'mailbox-store', name: 'Mailbox Store', description: 'Mailbox rentals', icon: '📫', link: '/tools/mailbox-store', color: '#2196F3' },
      { id: 'warehousing', name: 'Warehousing', description: 'Warehouse management', icon: '🏭', link: '/tools/warehousing', color: '#607D8B' },
    ]
  },

  // Agriculture & Farming
  {
    id: 'agriculture-farming',
    name: 'Agriculture & Farming',
    description: 'Farm and agriculture tools.',
    icon: '🌾',
    apps: [
      { id: 'farm-management', name: 'Farm Management', description: 'Farm operations', icon: '🚜', link: '/tools/farm-management', color: '#4CAF50' },
    ]
  },
];

// Helper function to get all apps as a flat array
export const getAllApps = (): App[] => {
  return categories.flatMap(category => category.apps);
};

// Helper function to get an app by ID
export const getAppById = (id: string): App | undefined => {
  return getAllApps().find(app => app.id === id);
};

// Helper function to get category by app ID
export const getCategoryByAppId = (appId: string): Category | undefined => {
  return categories.find(category => category.apps.some(app => app.id === appId));
};

// Total number of apps
export const TOTAL_APPS_COUNT = getAllApps().length;
