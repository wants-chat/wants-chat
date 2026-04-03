/**
 * Script to add landingPage configurations to all app types that are missing them
 *
 * Run with: npx ts-node src/modules/app-builder/scripts/add-landing-pages.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const APP_TYPES_DIR = path.join(__dirname, '../registries/app-types');

// Domain-specific templates for generating landingPage configs
const DOMAIN_TEMPLATES: Record<string, {
  heroPattern: (name: string) => string;
  subtitlePattern: (name: string, description: string) => string;
  primaryCta: { text: string; route: string };
  secondaryCta: { text: string; route: string };
  features: Array<{ icon: string; title: string; descPattern: (name: string) => string }>;
  bottomCtaPattern: (name: string) => { title: string; subtitle: string; buttonText: string; buttonRoute: string };
  mainEntity: string;
  entityDisplayName: string;
}> = {
  // Healthcare & Medical
  healthcare: {
    heroPattern: (name) => `Quality ${formatName(name)}\nCare You Deserve`,
    subtitlePattern: (name, desc) => desc || `Professional ${formatName(name).toLowerCase()} services with compassionate care`,
    primaryCta: { text: 'Book Appointment', route: '/appointments' },
    secondaryCta: { text: 'Our Services', route: '/services' },
    features: [
      { icon: 'stethoscope', title: 'Expert Care', descPattern: (name) => `Experienced professionals providing quality ${formatName(name).toLowerCase()} services` },
      { icon: 'calendar', title: 'Easy Scheduling', descPattern: () => 'Book appointments online at your convenience' },
      { icon: 'shield', title: 'Patient-Centered', descPattern: () => 'Personalized care plans tailored to your needs' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Start Your Care Journey',
      subtitle: `Experience compassionate ${formatName(name).toLowerCase()} care with our expert team.`,
      buttonText: 'Schedule Visit',
      buttonRoute: '/appointments/new',
    }),
    mainEntity: 'appointments',
    entityDisplayName: 'Available Appointments',
  },

  // Business & Professional Services
  business: {
    heroPattern: (name) => `Professional\n${formatName(name)} Services`,
    subtitlePattern: (name, desc) => desc || `Expert ${formatName(name).toLowerCase()} solutions for your business needs`,
    primaryCta: { text: 'Get Started', route: '/contact' },
    secondaryCta: { text: 'Our Services', route: '/services' },
    features: [
      { icon: 'briefcase', title: 'Expert Team', descPattern: (name) => `Experienced professionals in ${formatName(name).toLowerCase()}` },
      { icon: 'trending-up', title: 'Results-Driven', descPattern: () => 'Proven track record of delivering excellent results' },
      { icon: 'users', title: 'Client-Focused', descPattern: () => 'Dedicated support and personalized solutions' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Ready to Get Started?',
      subtitle: `Partner with us for professional ${formatName(name).toLowerCase()} services.`,
      buttonText: 'Contact Us',
      buttonRoute: '/contact',
    }),
    mainEntity: 'services',
    entityDisplayName: 'Our Services',
  },

  // Retail & E-commerce
  retail: {
    heroPattern: (name) => `Discover Quality\n${formatName(name)}`,
    subtitlePattern: (name, desc) => desc || `Shop the best selection of ${formatName(name).toLowerCase()} products`,
    primaryCta: { text: 'Shop Now', route: '/products' },
    secondaryCta: { text: 'View Categories', route: '/categories' },
    features: [
      { icon: 'package', title: 'Quality Products', descPattern: (name) => `Carefully curated ${formatName(name).toLowerCase()} selection` },
      { icon: 'truck', title: 'Fast Delivery', descPattern: () => 'Quick and reliable shipping to your door' },
      { icon: 'credit-card', title: 'Secure Checkout', descPattern: () => 'Safe and easy payment options' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Start Shopping Today',
      subtitle: `Find the perfect ${formatName(name).toLowerCase()} products for you.`,
      buttonText: 'Browse Collection',
      buttonRoute: '/products',
    }),
    mainEntity: 'products',
    entityDisplayName: 'Featured Products',
  },

  // Food & Beverage
  food: {
    heroPattern: (name) => `Delicious\n${formatName(name)}`,
    subtitlePattern: (name, desc) => desc || `Experience the finest ${formatName(name).toLowerCase()} in town`,
    primaryCta: { text: 'Order Now', route: '/menu' },
    secondaryCta: { text: 'View Menu', route: '/menu' },
    features: [
      { icon: 'utensils', title: 'Quality Ingredients', descPattern: () => 'Fresh, locally sourced ingredients' },
      { icon: 'clock', title: 'Quick Service', descPattern: () => 'Fast preparation without compromising quality' },
      { icon: 'heart', title: 'Made with Love', descPattern: () => 'Crafted with passion and expertise' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Ready to Order?',
      subtitle: `Taste the difference with our ${formatName(name).toLowerCase()}.`,
      buttonText: 'Order Now',
      buttonRoute: '/order',
    }),
    mainEntity: 'menu',
    entityDisplayName: 'Our Menu',
  },

  // Hospitality & Lodging
  hospitality: {
    heroPattern: (name) => `Welcome to Your\nPerfect Stay`,
    subtitlePattern: (name, desc) => desc || `Experience exceptional hospitality and comfort`,
    primaryCta: { text: 'Book Now', route: '/rooms' },
    secondaryCta: { text: 'View Amenities', route: '/amenities' },
    features: [
      { icon: 'bed', title: 'Comfortable Rooms', descPattern: () => 'Well-appointed accommodations for every need' },
      { icon: 'star', title: 'Premium Service', descPattern: () => '24/7 guest services and concierge' },
      { icon: 'map-pin', title: 'Prime Location', descPattern: () => 'Conveniently located for your stay' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Book Your Stay',
      subtitle: 'Experience hospitality at its finest.',
      buttonText: 'Make Reservation',
      buttonRoute: '/book',
    }),
    mainEntity: 'rooms',
    entityDisplayName: 'Featured Rooms',
  },

  // Education & Training
  education: {
    heroPattern: (name) => `Learn & Grow\nWith Us`,
    subtitlePattern: (name, desc) => desc || `Quality ${formatName(name).toLowerCase()} programs for your success`,
    primaryCta: { text: 'Enroll Now', route: '/courses' },
    secondaryCta: { text: 'View Programs', route: '/programs' },
    features: [
      { icon: 'graduation-cap', title: 'Expert Instructors', descPattern: () => 'Learn from experienced professionals' },
      { icon: 'book-open', title: 'Comprehensive Curriculum', descPattern: () => 'Well-structured learning programs' },
      { icon: 'award', title: 'Recognized Certification', descPattern: () => 'Earn credentials that matter' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Start Your Learning Journey',
      subtitle: 'Invest in your future with quality education.',
      buttonText: 'Explore Courses',
      buttonRoute: '/courses',
    }),
    mainEntity: 'courses',
    entityDisplayName: 'Featured Courses',
  },

  // Real Estate & Property
  realestate: {
    heroPattern: (name) => `Find Your\nDream Property`,
    subtitlePattern: (name, desc) => desc || `Professional ${formatName(name).toLowerCase()} services for all your needs`,
    primaryCta: { text: 'Browse Listings', route: '/listings' },
    secondaryCta: { text: 'Our Services', route: '/services' },
    features: [
      { icon: 'home', title: 'Quality Listings', descPattern: () => 'Curated selection of properties' },
      { icon: 'search', title: 'Easy Search', descPattern: () => 'Find properties that match your criteria' },
      { icon: 'shield', title: 'Trusted Service', descPattern: () => 'Expert guidance throughout the process' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Start Your Property Search',
      subtitle: 'Let us help you find the perfect property.',
      buttonText: 'View Listings',
      buttonRoute: '/listings',
    }),
    mainEntity: 'listings',
    entityDisplayName: 'Featured Listings',
  },

  // Personal Services
  personal: {
    heroPattern: (name) => `Premium\n${formatName(name)} Services`,
    subtitlePattern: (name, desc) => desc || `Professional ${formatName(name).toLowerCase()} services tailored for you`,
    primaryCta: { text: 'Book Now', route: '/book' },
    secondaryCta: { text: 'Our Services', route: '/services' },
    features: [
      { icon: 'sparkles', title: 'Expert Service', descPattern: (name) => `Professional ${formatName(name).toLowerCase()} by experts` },
      { icon: 'calendar', title: 'Flexible Scheduling', descPattern: () => 'Book appointments at your convenience' },
      { icon: 'heart', title: 'Personalized Care', descPattern: () => 'Services tailored to your needs' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Book Your Appointment',
      subtitle: `Experience the best ${formatName(name).toLowerCase()} services.`,
      buttonText: 'Book Now',
      buttonRoute: '/book',
    }),
    mainEntity: 'services',
    entityDisplayName: 'Our Services',
  },

  // Transportation & Logistics
  transportation: {
    heroPattern: (name) => `Reliable\n${formatName(name)}`,
    subtitlePattern: (name, desc) => desc || `Professional ${formatName(name).toLowerCase()} solutions you can trust`,
    primaryCta: { text: 'Get Quote', route: '/quote' },
    secondaryCta: { text: 'Our Services', route: '/services' },
    features: [
      { icon: 'truck', title: 'Fast & Reliable', descPattern: () => 'On-time delivery every time' },
      { icon: 'shield', title: 'Safe & Secure', descPattern: () => 'Your cargo is in safe hands' },
      { icon: 'clock', title: '24/7 Service', descPattern: () => 'Available when you need us' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Get Started Today',
      subtitle: `Reliable ${formatName(name).toLowerCase()} services for your needs.`,
      buttonText: 'Request Quote',
      buttonRoute: '/quote',
    }),
    mainEntity: 'services',
    entityDisplayName: 'Our Services',
  },

  // Automotive
  automotive: {
    heroPattern: (name) => `Expert\n${formatName(name)}`,
    subtitlePattern: (name, desc) => desc || `Professional ${formatName(name).toLowerCase()} services for your vehicle`,
    primaryCta: { text: 'Book Service', route: '/appointments' },
    secondaryCta: { text: 'Our Services', route: '/services' },
    features: [
      { icon: 'car', title: 'Expert Technicians', descPattern: () => 'Certified professionals for your vehicle' },
      { icon: 'wrench', title: 'Quality Service', descPattern: () => 'Using the best parts and equipment' },
      { icon: 'clock', title: 'Quick Turnaround', descPattern: () => 'Get back on the road fast' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Schedule Your Service',
      subtitle: `Trust us with your ${formatName(name).toLowerCase()} needs.`,
      buttonText: 'Book Appointment',
      buttonRoute: '/appointments/new',
    }),
    mainEntity: 'appointments',
    entityDisplayName: 'Available Slots',
  },

  // Construction & Maintenance
  construction: {
    heroPattern: (name) => `Professional\n${formatName(name)}`,
    subtitlePattern: (name, desc) => desc || `Quality ${formatName(name).toLowerCase()} services you can rely on`,
    primaryCta: { text: 'Get Estimate', route: '/quote' },
    secondaryCta: { text: 'Our Work', route: '/portfolio' },
    features: [
      { icon: 'hard-hat', title: 'Skilled Team', descPattern: () => 'Experienced professionals on every job' },
      { icon: 'check-circle', title: 'Quality Work', descPattern: () => 'Excellent craftsmanship guaranteed' },
      { icon: 'shield', title: 'Licensed & Insured', descPattern: () => 'Your project is protected' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Start Your Project',
      subtitle: `Quality ${formatName(name).toLowerCase()} services for your needs.`,
      buttonText: 'Get Free Estimate',
      buttonRoute: '/quote',
    }),
    mainEntity: 'services',
    entityDisplayName: 'Our Services',
  },

  // Entertainment & Recreation
  entertainment: {
    heroPattern: (name) => `Experience\n${formatName(name)}`,
    subtitlePattern: (name, desc) => desc || `The best ${formatName(name).toLowerCase()} experience awaits`,
    primaryCta: { text: 'Book Now', route: '/book' },
    secondaryCta: { text: 'Learn More', route: '/about' },
    features: [
      { icon: 'smile', title: 'Fun Experience', descPattern: () => 'Entertainment for everyone' },
      { icon: 'calendar', title: 'Easy Booking', descPattern: () => 'Reserve your spot online' },
      { icon: 'users', title: 'Great for Groups', descPattern: () => 'Perfect for friends and family' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Book Your Experience',
      subtitle: `Don't miss out on the fun!`,
      buttonText: 'Reserve Now',
      buttonRoute: '/book',
    }),
    mainEntity: 'events',
    entityDisplayName: 'Upcoming Events',
  },

  // Default template
  default: {
    heroPattern: (name) => `Welcome to\n${formatName(name)}`,
    subtitlePattern: (name, desc) => desc || `Professional ${formatName(name).toLowerCase()} services for your needs`,
    primaryCta: { text: 'Get Started', route: '/contact' },
    secondaryCta: { text: 'Learn More', route: '/about' },
    features: [
      { icon: 'check-circle', title: 'Quality Service', descPattern: () => 'Excellence in everything we do' },
      { icon: 'users', title: 'Expert Team', descPattern: () => 'Dedicated professionals ready to help' },
      { icon: 'heart', title: 'Customer First', descPattern: () => 'Your satisfaction is our priority' },
    ],
    bottomCtaPattern: (name) => ({
      title: 'Ready to Get Started?',
      subtitle: 'Contact us today to learn more.',
      buttonText: 'Contact Us',
      buttonRoute: '/contact',
    }),
    mainEntity: 'services',
    entityDisplayName: 'Our Services',
  },
};

// Keywords to identify domain
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  healthcare: [
    'medical', 'clinic', 'health', 'hospital', 'doctor', 'therapy', 'care', 'dental', 'pharmacy',
    'wellness', 'fitness', 'nutrition', 'mental', 'psychiatric', 'rehabilitation', 'nursing',
    'pediatric', 'cardio', 'derma', 'ortho', 'surgery', 'radiology', 'oncology', 'neuro',
    'veterinary', 'vet', 'optometry', 'audiology', 'chiropractic', 'acupuncture', 'massage',
    'spa', 'hospice', 'assisted', 'senior', 'elder', 'geriatric', 'midwife', 'pregnancy',
    'fertility', 'urology', 'gastro', 'pulmo', 'endocrin', 'allergy', 'immuno', 'pain',
    'sleep', 'weight', 'addiction', 'substance', 'counseling', 'psycho', 'behavioral'
  ],
  business: [
    'consulting', 'agency', 'firm', 'services', 'management', 'solutions', 'professional',
    'accounting', 'legal', 'law', 'attorney', 'tax', 'financial', 'insurance', 'marketing',
    'advertising', 'pr', 'hr', 'recruitment', 'staffing', 'training', 'coaching', 'advisory',
    'software', 'it', 'tech', 'digital', 'cyber', 'data', 'analytics', 'research',
    'investment', 'venture', 'capital', 'brokerage', 'trading', 'banking'
  ],
  retail: [
    'store', 'shop', 'boutique', 'outlet', 'market', 'retail', 'ecommerce', 'online',
    'supply', 'supplies', 'equipment', 'goods', 'products', 'merchandise', 'wholesale',
    'distributor', 'dealer', 'seller', 'vendor'
  ],
  food: [
    'restaurant', 'cafe', 'coffee', 'bakery', 'catering', 'food', 'dining', 'kitchen',
    'bar', 'pub', 'brewery', 'winery', 'pizza', 'sushi', 'burger', 'taco', 'grill',
    'deli', 'bistro', 'eatery', 'juice', 'smoothie', 'ice cream', 'dessert', 'pastry'
  ],
  hospitality: [
    'hotel', 'resort', 'lodge', 'inn', 'motel', 'hostel', 'vacation', 'rental',
    'airbnb', 'accommodation', 'bed and breakfast', 'guest house', 'retreat'
  ],
  education: [
    'school', 'academy', 'college', 'university', 'institute', 'learning', 'education',
    'tutoring', 'training', 'bootcamp', 'course', 'class', 'lesson', 'teaching',
    'preschool', 'daycare', 'childcare', 'montessori'
  ],
  realestate: [
    'real estate', 'property', 'realty', 'realtor', 'housing', 'apartment', 'condo',
    'mortgage', 'land', 'development', 'construction', 'builder', 'contractor'
  ],
  personal: [
    'salon', 'barber', 'nail', 'beauty', 'grooming', 'spa', 'waxing', 'hair',
    'makeup', 'skincare', 'tattoo', 'piercing', 'cleaning', 'laundry', 'dry cleaning',
    'pet', 'dog', 'cat', 'animal', 'tailor', 'alteration'
  ],
  transportation: [
    'transport', 'logistics', 'shipping', 'delivery', 'courier', 'freight', 'moving',
    'trucking', 'taxi', 'rideshare', 'limo', 'bus', 'shuttle', 'charter', 'towing',
    'parking', 'storage', 'warehouse'
  ],
  automotive: [
    'auto', 'car', 'vehicle', 'motor', 'tire', 'mechanic', 'repair', 'body shop',
    'dealership', 'parts', 'oil change', 'transmission', 'brake', 'exhaust', 'detailing'
  ],
  construction: [
    'construction', 'building', 'roofing', 'plumbing', 'electrical', 'hvac', 'painting',
    'flooring', 'carpentry', 'masonry', 'concrete', 'landscaping', 'paving', 'fencing',
    'remodel', 'renovation', 'handyman', 'maintenance', 'repair'
  ],
  entertainment: [
    'entertainment', 'event', 'party', 'wedding', 'music', 'dj', 'band', 'theater',
    'cinema', 'movie', 'game', 'arcade', 'bowling', 'golf', 'sports', 'gym', 'yoga',
    'dance', 'art', 'gallery', 'museum', 'photography', 'video', 'studio'
  ],
};

function formatName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function detectDomain(appTypeId: string, description: string = ''): string {
  const combined = `${appTypeId} ${description}`.toLowerCase();

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return domain;
      }
    }
  }

  return 'default';
}

function generateLandingPage(appTypeId: string, description: string = ''): string {
  const domain = detectDomain(appTypeId, description);
  const template = DOMAIN_TEMPLATES[domain] || DOMAIN_TEMPLATES.default;
  const name = formatName(appTypeId);

  const landingPage = {
    heroTitle: template.heroPattern(name),
    heroSubtitle: template.subtitlePattern(name, description),
    primaryCta: template.primaryCta,
    secondaryCta: template.secondaryCta,
    features: template.features.map(f => ({
      icon: f.icon,
      title: f.title,
      description: f.descPattern(name),
    })),
    bottomCta: template.bottomCtaPattern(name),
    mainEntity: template.mainEntity,
    entityDisplayName: template.entityDisplayName,
  };

  return `landingPage: {
    heroTitle: '${landingPage.heroTitle.replace(/'/g, "\\'")}',
    heroSubtitle: '${landingPage.heroSubtitle.replace(/'/g, "\\'")}',
    primaryCta: {
      text: '${landingPage.primaryCta.text}',
      route: '${landingPage.primaryCta.route}',
    },
    secondaryCta: {
      text: '${landingPage.secondaryCta.text}',
      route: '${landingPage.secondaryCta.route}',
    },
    features: [
      {
        icon: '${landingPage.features[0].icon}',
        title: '${landingPage.features[0].title}',
        description: '${landingPage.features[0].description.replace(/'/g, "\\'")}',
      },
      {
        icon: '${landingPage.features[1].icon}',
        title: '${landingPage.features[1].title}',
        description: '${landingPage.features[1].description.replace(/'/g, "\\'")}',
      },
      {
        icon: '${landingPage.features[2].icon}',
        title: '${landingPage.features[2].title}',
        description: '${landingPage.features[2].description.replace(/'/g, "\\'")}',
      },
    ],
    bottomCta: {
      title: '${landingPage.bottomCta.title.replace(/'/g, "\\'")}',
      subtitle: '${landingPage.bottomCta.subtitle.replace(/'/g, "\\'")}',
      buttonText: '${landingPage.bottomCta.buttonText}',
      buttonRoute: '${landingPage.bottomCta.buttonRoute}',
    },
    mainEntity: '${landingPage.mainEntity}',
    entityDisplayName: '${landingPage.entityDisplayName}',
  }`;
}

function hasLandingPage(content: string): boolean {
  return /landingPage\s*:\s*\{/.test(content);
}

function extractAppTypeId(content: string): string | null {
  const match = content.match(/id:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function extractDescription(content: string): string {
  const match = content.match(/description:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : '';
}

function addLandingPageToFile(filePath: string): { success: boolean; appTypeId: string | null; error?: string } {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    if (hasLandingPage(content)) {
      return { success: true, appTypeId: extractAppTypeId(content) };
    }

    const appTypeId = extractAppTypeId(content);
    if (!appTypeId) {
      return { success: false, appTypeId: null, error: 'Could not extract appTypeId' };
    }

    const description = extractDescription(content);
    const landingPageCode = generateLandingPage(appTypeId, description);

    // Find the position to insert landingPage (after description or after icon)
    // Look for the pattern: description: '...', or icon: '...',
    const insertPatterns = [
      /(description:\s*['"][^'"]*['"],?\s*\n)/,
      /(icon:\s*['"][^'"]*['"],?\s*\n)/,
      /(name:\s*['"][^'"]*['"],?\s*\n)/,
    ];

    let inserted = false;
    for (const pattern of insertPatterns) {
      const match = content.match(pattern);
      if (match) {
        const insertPos = match.index! + match[0].length;
        content = content.slice(0, insertPos) + '  ' + landingPageCode + ',\n' + content.slice(insertPos);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      // Fallback: insert after the opening brace of the app type definition
      const openBracePattern = /export\s+const\s+\w+\s*:\s*AppTypeDefinition\s*=\s*\{/;
      const match = content.match(openBracePattern);
      if (match) {
        const insertPos = match.index! + match[0].length;
        content = content.slice(0, insertPos) + '\n  ' + landingPageCode + ',\n' + content.slice(insertPos);
        inserted = true;
      }
    }

    if (!inserted) {
      return { success: false, appTypeId, error: 'Could not find insertion point' };
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, appTypeId };
  } catch (error: any) {
    return { success: false, appTypeId: null, error: error.message };
  }
}

async function main() {
  console.log('Starting landingPage addition script...\n');

  const files = fs.readdirSync(APP_TYPES_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts');

  console.log(`Found ${files.length} app type files\n`);

  let added = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { file: string; error: string }[] = [];

  for (const file of files) {
    const filePath = path.join(APP_TYPES_DIR, file);
    const result = addLandingPageToFile(filePath);

    if (result.success) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (hasLandingPage(content)) {
        if (result.appTypeId) {
          added++;
          console.log(`✅ Added landingPage to: ${file} (${result.appTypeId})`);
        } else {
          skipped++;
        }
      }
    } else {
      failed++;
      errors.push({ file, error: result.error || 'Unknown error' });
      console.log(`❌ Failed: ${file} - ${result.error}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total files: ${files.length}`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (already had): ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    errors.forEach(e => console.log(`${e.file}: ${e.error}`));
  }
}

// Export for use in other scripts
export { generateLandingPage, detectDomain, hasLandingPage, addLandingPageToFile };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
