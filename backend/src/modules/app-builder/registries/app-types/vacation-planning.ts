/**
 * Vacation Planning App Type Definition
 *
 * Complete definition for vacation planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACATION_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'vacation-planning',
  name: 'Vacation Planning',
  category: 'hospitality',
  description: 'Vacation Planning platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "vacation planning",
      "vacation",
      "planning",
      "vacation software",
      "vacation app",
      "vacation platform",
      "vacation system",
      "vacation management",
      "hospitality vacation"
  ],

  synonyms: [
      "Vacation Planning platform",
      "Vacation Planning software",
      "Vacation Planning system",
      "vacation solution",
      "vacation service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "room-booking",
      "housekeeping",
      "guest-services",
      "channel-manager",
      "notifications"
  ],

  optionalFeatures: [
      "rate-management",
      "payments",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a vacation planning platform",
      "Create a vacation planning app",
      "I need a vacation planning management system",
      "Build a vacation planning solution",
      "Create a vacation planning booking system"
  ],
};
