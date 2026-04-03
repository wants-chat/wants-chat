/**
 * Wreck Diving App Type Definition
 *
 * Complete definition for wreck diving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRECK_DIVING_APP_TYPE: AppTypeDefinition = {
  id: 'wreck-diving',
  name: 'Wreck Diving',
  category: 'services',
  description: 'Wreck Diving platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wreck diving",
      "wreck",
      "diving",
      "wreck software",
      "wreck app",
      "wreck platform",
      "wreck system",
      "wreck management",
      "services wreck"
  ],

  synonyms: [
      "Wreck Diving platform",
      "Wreck Diving software",
      "Wreck Diving system",
      "wreck solution",
      "wreck service"
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
      "Build a wreck diving platform",
      "Create a wreck diving app",
      "I need a wreck diving management system",
      "Build a wreck diving solution",
      "Create a wreck diving booking system"
  ],
};
