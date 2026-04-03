/**
 * Presentation Design App Type Definition
 *
 * Complete definition for presentation design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRESENTATION_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'presentation-design',
  name: 'Presentation Design',
  category: 'services',
  description: 'Presentation Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "presentation design",
      "presentation",
      "design",
      "presentation software",
      "presentation app",
      "presentation platform",
      "presentation system",
      "presentation management",
      "services presentation"
  ],

  synonyms: [
      "Presentation Design platform",
      "Presentation Design software",
      "Presentation Design system",
      "presentation solution",
      "presentation service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a presentation design platform",
      "Create a presentation design app",
      "I need a presentation design management system",
      "Build a presentation design solution",
      "Create a presentation design booking system"
  ],
};
