/**
 * Weekend Getaway App Type Definition
 *
 * Complete definition for weekend getaway applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEEKEND_GETAWAY_APP_TYPE: AppTypeDefinition = {
  id: 'weekend-getaway',
  name: 'Weekend Getaway',
  category: 'services',
  description: 'Weekend Getaway platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "weekend getaway",
      "weekend",
      "getaway",
      "weekend software",
      "weekend app",
      "weekend platform",
      "weekend system",
      "weekend management",
      "services weekend"
  ],

  synonyms: [
      "Weekend Getaway platform",
      "Weekend Getaway software",
      "Weekend Getaway system",
      "weekend solution",
      "weekend service"
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
      "Build a weekend getaway platform",
      "Create a weekend getaway app",
      "I need a weekend getaway management system",
      "Build a weekend getaway solution",
      "Create a weekend getaway booking system"
  ],
};
