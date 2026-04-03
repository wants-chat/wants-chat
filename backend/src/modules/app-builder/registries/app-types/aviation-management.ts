/**
 * Aviation Management App Type Definition
 *
 * Complete definition for aviation management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-management',
  name: 'Aviation Management',
  category: 'services',
  description: 'Aviation Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aviation management",
      "aviation",
      "management",
      "aviation software",
      "aviation app",
      "aviation platform",
      "aviation system",
      "services aviation"
  ],

  synonyms: [
      "Aviation Management platform",
      "Aviation Management software",
      "Aviation Management system",
      "aviation solution",
      "aviation service"
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
      "Build a aviation management platform",
      "Create a aviation management app",
      "I need a aviation management management system",
      "Build a aviation management solution",
      "Create a aviation management booking system"
  ],
};
