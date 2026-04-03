/**
 * Mobile Dj App Type Definition
 *
 * Complete definition for mobile dj applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_DJ_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-dj',
  name: 'Mobile Dj',
  category: 'services',
  description: 'Mobile Dj platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mobile dj",
      "mobile",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "services mobile"
  ],

  synonyms: [
      "Mobile Dj platform",
      "Mobile Dj software",
      "Mobile Dj system",
      "mobile solution",
      "mobile service"
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
      "Build a mobile dj platform",
      "Create a mobile dj app",
      "I need a mobile dj management system",
      "Build a mobile dj solution",
      "Create a mobile dj booking system"
  ],
};
