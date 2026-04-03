/**
 * Sustainable Design App Type Definition
 *
 * Complete definition for sustainable design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSTAINABLE_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'sustainable-design',
  name: 'Sustainable Design',
  category: 'services',
  description: 'Sustainable Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sustainable design",
      "sustainable",
      "design",
      "sustainable software",
      "sustainable app",
      "sustainable platform",
      "sustainable system",
      "sustainable management",
      "services sustainable"
  ],

  synonyms: [
      "Sustainable Design platform",
      "Sustainable Design software",
      "Sustainable Design system",
      "sustainable solution",
      "sustainable service"
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
      "Build a sustainable design platform",
      "Create a sustainable design app",
      "I need a sustainable design management system",
      "Build a sustainable design solution",
      "Create a sustainable design booking system"
  ],
};
