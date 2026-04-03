import { Blueprint } from './blueprint.interface';

/**
 * Portfolio/Agency Blueprint
 *
 * Defines the structure for a portfolio or creative agency application:
 * - Projects/Work
 * - Services
 * - Team Members
 * - Testimonials
 * - Blog
 * - Contact
 */
export const portfolioBlueprint: Blueprint = {
  appType: 'portfolio',
  description: 'Portfolio/agency website with projects, services, team, and contact',

  coreEntities: ['project', 'service', 'team_member', 'testimonial', 'blog_post', 'inquiry', 'client'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: false,
  },

  pages: [
    // Home/Landing
    {
      path: '/',
      name: 'Home',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'We Create Digital Experiences',
            subtitle: 'Award-winning design and development agency',
            primaryCTA: 'View Our Work',
            primaryCTALink: '/work',
            secondaryCTA: 'Get in Touch',
            secondaryCTALink: '/contact',
          },
        },
        {
          id: 'services-preview',
          component: 'service-grid',
          entity: 'service',
          position: 'main',
          props: {
            title: 'What We Do',
            limit: 4,
          },
        },
        {
          id: 'featured-work',
          component: 'project-grid',
          entity: 'project',
          position: 'main',
          props: {
            title: 'Featured Work',
            limit: 6,
            featured: true,
          },
        },
        {
          id: 'clients',
          component: 'client-logos',
          entity: 'client',
          position: 'main',
          props: {
            title: 'Trusted By',
          },
        },
        {
          id: 'testimonials',
          component: 'testimonial-slider',
          entity: 'testimonial',
          position: 'main',
          props: {
            title: 'What Our Clients Say',
          },
        },
        {
          id: 'cta',
          component: 'cta-section',
          position: 'main',
          props: {
            title: 'Ready to Start Your Project?',
            subtitle: "Let's create something amazing together",
            buttonText: 'Start a Project',
            buttonLink: '/contact',
          },
        },
      ],
    },
    // Work/Portfolio
    {
      path: '/work',
      name: 'Work',
      layout: 'single-column',
      sections: [
        {
          id: 'work-header',
          component: 'page-header',
          position: 'main',
          props: {
            title: 'Our Work',
            subtitle: 'Explore our latest projects and case studies',
          },
        },
        {
          id: 'work-filters',
          component: 'work-filters',
          position: 'main',
        },
        {
          id: 'project-grid',
          component: 'project-grid',
          entity: 'project',
          position: 'main',
        },
      ],
    },
    // Project Detail
    {
      path: '/work/:slug',
      name: 'Project',
      layout: 'single-column',
      sections: [
        {
          id: 'project-hero',
          component: 'project-hero',
          entity: 'project',
          position: 'main',
        },
        {
          id: 'project-content',
          component: 'project-content',
          entity: 'project',
          position: 'main',
        },
        {
          id: 'project-gallery',
          component: 'project-gallery',
          entity: 'project',
          position: 'main',
        },
        {
          id: 'project-testimonial',
          component: 'project-testimonial',
          entity: 'testimonial',
          position: 'main',
        },
        {
          id: 'related-projects',
          component: 'project-grid',
          entity: 'project',
          position: 'main',
          props: {
            title: 'Related Projects',
            limit: 3,
          },
        },
      ],
    },
    // Services
    {
      path: '/services',
      name: 'Services',
      layout: 'single-column',
      sections: [
        {
          id: 'services-header',
          component: 'page-header',
          position: 'main',
          props: {
            title: 'Our Services',
            subtitle: 'Full-service digital solutions for your business',
          },
        },
        {
          id: 'service-list',
          component: 'service-list',
          entity: 'service',
          position: 'main',
        },
        {
          id: 'process',
          component: 'process-section',
          position: 'main',
          props: {
            title: 'Our Process',
          },
        },
      ],
    },
    // Service Detail
    {
      path: '/services/:slug',
      name: 'Service',
      layout: 'single-column',
      sections: [
        {
          id: 'service-header',
          component: 'service-header',
          entity: 'service',
          position: 'main',
        },
        {
          id: 'service-content',
          component: 'service-content',
          entity: 'service',
          position: 'main',
        },
        {
          id: 'service-features',
          component: 'service-features',
          entity: 'service',
          position: 'main',
        },
        {
          id: 'service-projects',
          component: 'project-grid',
          entity: 'project',
          position: 'main',
          props: {
            title: 'Related Projects',
            limit: 3,
          },
        },
        {
          id: 'service-cta',
          component: 'service-cta',
          position: 'main',
        },
      ],
    },
    // About
    {
      path: '/about',
      name: 'About',
      layout: 'single-column',
      sections: [
        {
          id: 'about-header',
          component: 'page-header',
          position: 'main',
          props: {
            title: 'About Us',
            subtitle: 'Our story, mission, and the team behind our success',
          },
        },
        {
          id: 'about-story',
          component: 'about-story',
          position: 'main',
        },
        {
          id: 'stats',
          component: 'stats-section',
          position: 'main',
        },
        {
          id: 'team',
          component: 'team-grid',
          entity: 'team_member',
          position: 'main',
          props: {
            title: 'Meet Our Team',
          },
        },
        {
          id: 'values',
          component: 'values-section',
          position: 'main',
          props: {
            title: 'Our Values',
          },
        },
      ],
    },
    // Team Member
    {
      path: '/team/:slug',
      name: 'Team Member',
      layout: 'single-column',
      sections: [
        {
          id: 'member-profile',
          component: 'team-member-profile',
          entity: 'team_member',
          position: 'main',
        },
        {
          id: 'member-projects',
          component: 'project-grid',
          entity: 'project',
          position: 'main',
          props: {
            title: 'Projects',
            limit: 4,
          },
        },
      ],
    },
    // Blog
    {
      path: '/blog',
      name: 'Blog',
      layout: 'two-column',
      sections: [
        {
          id: 'blog-sidebar',
          component: 'blog-sidebar',
          position: 'sidebar',
        },
        {
          id: 'blog-list',
          component: 'blog-list',
          entity: 'blog_post',
          position: 'main',
        },
      ],
    },
    // Blog Post
    {
      path: '/blog/:slug',
      name: 'Blog Post',
      layout: 'two-column',
      sections: [
        {
          id: 'blog-sidebar',
          component: 'blog-sidebar',
          position: 'sidebar',
        },
        {
          id: 'blog-content',
          component: 'blog-detail',
          entity: 'blog_post',
          position: 'main',
        },
        {
          id: 'blog-author',
          component: 'blog-author',
          entity: 'team_member',
          position: 'main',
        },
        {
          id: 'related-posts',
          component: 'blog-list',
          entity: 'blog_post',
          position: 'main',
          props: {
            title: 'Related Posts',
            limit: 3,
          },
        },
      ],
    },
    // Contact
    {
      path: '/contact',
      name: 'Contact',
      layout: 'single-column',
      sections: [
        {
          id: 'contact-header',
          component: 'page-header',
          position: 'main',
          props: {
            title: 'Get in Touch',
            subtitle: "We'd love to hear about your project",
          },
        },
        {
          id: 'contact-info',
          component: 'contact-info',
          position: 'main',
        },
        {
          id: 'contact-form',
          component: 'contact-form',
          entity: 'inquiry',
          position: 'main',
        },
        {
          id: 'map',
          component: 'map-section',
          position: 'main',
        },
      ],
    },
    // Admin Dashboard
    {
      path: '/admin',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
              { label: 'Projects', path: '/admin/projects', icon: 'Briefcase' },
              { label: 'Services', path: '/admin/services', icon: 'Layers' },
              { label: 'Team', path: '/admin/team', icon: 'Users' },
              { label: 'Blog', path: '/admin/blog', icon: 'FileText' },
              { label: 'Inquiries', path: '/admin/inquiries', icon: 'Mail' },
              { label: 'Testimonials', path: '/admin/testimonials', icon: 'MessageSquare' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['total_projects', 'total_inquiries', 'blog_posts', 'team_members'],
          },
        },
        {
          id: 'recent-inquiries',
          component: 'inquiry-list',
          entity: 'inquiry',
          position: 'main',
          props: {
            title: 'Recent Inquiries',
            limit: 5,
          },
        },
      ],
    },
    // Admin Projects
    {
      path: '/admin/projects',
      name: 'Projects',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'project-table',
          component: 'data-table',
          entity: 'project',
          position: 'main',
          props: {
            title: 'Projects',
            showCreate: true,
            columns: ['image', 'title', 'client', 'category', 'status', 'date'],
          },
        },
      ],
    },
    // Admin Inquiries
    {
      path: '/admin/inquiries',
      name: 'Inquiries',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'inquiry-table',
          component: 'data-table',
          entity: 'inquiry',
          position: 'main',
          props: {
            title: 'Inquiries',
            columns: ['name', 'email', 'subject', 'status', 'date'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Projects
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list' },
    { method: 'GET', path: '/projects/:slug', entity: 'project', operation: 'get' },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/projects/:id', entity: 'project', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/projects/:id', entity: 'project', operation: 'delete', requiresAuth: true },

    // Services
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/services/:slug', entity: 'service', operation: 'get' },
    { method: 'POST', path: '/services', entity: 'service', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/services/:id', entity: 'service', operation: 'update', requiresAuth: true },

    // Team
    { method: 'GET', path: '/team', entity: 'team_member', operation: 'list' },
    { method: 'GET', path: '/team/:slug', entity: 'team_member', operation: 'get' },
    { method: 'POST', path: '/team', entity: 'team_member', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/team/:id', entity: 'team_member', operation: 'update', requiresAuth: true },

    // Testimonials
    { method: 'GET', path: '/testimonials', entity: 'testimonial', operation: 'list' },
    { method: 'POST', path: '/testimonials', entity: 'testimonial', operation: 'create', requiresAuth: true },

    // Blog
    { method: 'GET', path: '/blog', entity: 'blog_post', operation: 'list' },
    { method: 'GET', path: '/blog/:slug', entity: 'blog_post', operation: 'get' },
    { method: 'POST', path: '/blog', entity: 'blog_post', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/blog/:id', entity: 'blog_post', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/blog/:id', entity: 'blog_post', operation: 'delete', requiresAuth: true },

    // Inquiries
    { method: 'GET', path: '/inquiries', entity: 'inquiry', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inquiries/:id', entity: 'inquiry', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/inquiries', entity: 'inquiry', operation: 'create' },
    { method: 'PATCH', path: '/inquiries/:id/status', entity: 'inquiry', operation: 'update', requiresAuth: true },

    // Clients
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list' },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'short_description', type: 'string' },
        { name: 'content', type: 'text' },
        { name: 'featured_image', type: 'image' },
        { name: 'gallery', type: 'json' },
        { name: 'video_url', type: 'url' },
        { name: 'category', type: 'string' },
        { name: 'tags', type: 'json' },
        { name: 'client_name', type: 'string' },
        { name: 'client_logo', type: 'image' },
        { name: 'project_url', type: 'url' },
        { name: 'completion_date', type: 'date' },
        { name: 'duration', type: 'string' },
        { name: 'technologies', type: 'json' },
        { name: 'challenge', type: 'text' },
        { name: 'solution', type: 'text' },
        { name: 'results', type: 'json' },
        { name: 'status', type: 'enum' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'order', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'service' },
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'testimonial' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'tagline', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'icon', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'features', type: 'json' },
        { name: 'deliverables', type: 'json' },
        { name: 'pricing', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'order', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
      ],
    },
    team_member: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'bio', type: 'text' },
        { name: 'short_bio', type: 'string' },
        { name: 'avatar_url', type: 'image' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'skills', type: 'json' },
        { name: 'social_links', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'order', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'blog_post' },
      ],
    },
    testimonial: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'author_name', type: 'string', required: true },
        { name: 'author_title', type: 'string' },
        { name: 'author_company', type: 'string' },
        { name: 'author_avatar', type: 'image' },
        { name: 'rating', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'order', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    blog_post: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'excerpt', type: 'string' },
        { name: 'content', type: 'text', required: true },
        { name: 'featured_image', type: 'image' },
        { name: 'category', type: 'string' },
        { name: 'tags', type: 'json' },
        { name: 'status', type: 'enum' },
        { name: 'published_at', type: 'datetime' },
        { name: 'reading_time', type: 'integer' },
        { name: 'views', type: 'integer' },
        { name: 'meta_title', type: 'string' },
        { name: 'meta_description', type: 'string' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'team_member' },
      ],
    },
    inquiry: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'company', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'message', type: 'text', required: true },
        { name: 'budget', type: 'string' },
        { name: 'timeline', type: 'string' },
        { name: 'services_interested', type: 'json' },
        { name: 'how_heard', type: 'string' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'replied_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'service' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'logo_url', type: 'image' },
        { name: 'website_url', type: 'url' },
        { name: 'industry', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'order', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'testimonial' },
      ],
    },
  },
};

export default portfolioBlueprint;
