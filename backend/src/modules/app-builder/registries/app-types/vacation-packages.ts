/**
 * Vacation Packages App Type Definition
 *
 * Complete definition for vacation packages applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACATION_PACKAGES_APP_TYPE: AppTypeDefinition = {
  id: 'vacation-packages',
  name: 'Vacation Packages',
  category: 'hospitality',
  description: 'Vacation Packages platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "vacation packages",
      "vacation",
      "packages",
      "vacation software",
      "vacation app",
      "vacation platform",
      "vacation system",
      "vacation management",
      "hospitality vacation"
  ],

  synonyms: [
      "Vacation Packages platform",
      "Vacation Packages software",
      "Vacation Packages system",
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
      "Build a vacation packages platform",
      "Create a vacation packages app",
      "I need a vacation packages management system",
      "Build a vacation packages solution",
      "Create a vacation packages booking system"
  ],
};
