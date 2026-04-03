/**
 * Sustainable Agriculture App Type Definition
 *
 * Complete definition for sustainable agriculture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSTAINABLE_AGRICULTURE_APP_TYPE: AppTypeDefinition = {
  id: 'sustainable-agriculture',
  name: 'Sustainable Agriculture',
  category: 'services',
  description: 'Sustainable Agriculture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sustainable agriculture",
      "sustainable",
      "agriculture",
      "sustainable software",
      "sustainable app",
      "sustainable platform",
      "sustainable system",
      "sustainable management",
      "services sustainable"
  ],

  synonyms: [
      "Sustainable Agriculture platform",
      "Sustainable Agriculture software",
      "Sustainable Agriculture system",
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
      "Build a sustainable agriculture platform",
      "Create a sustainable agriculture app",
      "I need a sustainable agriculture management system",
      "Build a sustainable agriculture solution",
      "Create a sustainable agriculture booking system"
  ],
};
