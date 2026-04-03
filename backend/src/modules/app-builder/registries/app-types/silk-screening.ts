/**
 * Silk Screening App Type Definition
 *
 * Complete definition for silk screening applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SILK_SCREENING_APP_TYPE: AppTypeDefinition = {
  id: 'silk-screening',
  name: 'Silk Screening',
  category: 'services',
  description: 'Silk Screening platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "silk screening",
      "silk",
      "screening",
      "silk software",
      "silk app",
      "silk platform",
      "silk system",
      "silk management",
      "services silk"
  ],

  synonyms: [
      "Silk Screening platform",
      "Silk Screening software",
      "Silk Screening system",
      "silk solution",
      "silk service"
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
      "Build a silk screening platform",
      "Create a silk screening app",
      "I need a silk screening management system",
      "Build a silk screening solution",
      "Create a silk screening booking system"
  ],
};
