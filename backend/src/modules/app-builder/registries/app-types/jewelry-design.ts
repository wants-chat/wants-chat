/**
 * Jewelry Design App Type Definition
 *
 * Complete definition for jewelry design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JEWELRY_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'jewelry-design',
  name: 'Jewelry Design',
  category: 'services',
  description: 'Jewelry Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "jewelry design",
      "jewelry",
      "design",
      "jewelry software",
      "jewelry app",
      "jewelry platform",
      "jewelry system",
      "jewelry management",
      "services jewelry"
  ],

  synonyms: [
      "Jewelry Design platform",
      "Jewelry Design software",
      "Jewelry Design system",
      "jewelry solution",
      "jewelry service"
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
      "Build a jewelry design platform",
      "Create a jewelry design app",
      "I need a jewelry design management system",
      "Build a jewelry design solution",
      "Create a jewelry design booking system"
  ],
};
