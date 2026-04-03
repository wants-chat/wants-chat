/**
 * Two Way Radio App Type Definition
 *
 * Complete definition for two way radio applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TWO_WAY_RADIO_APP_TYPE: AppTypeDefinition = {
  id: 'two-way-radio',
  name: 'Two Way Radio',
  category: 'services',
  description: 'Two Way Radio platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "two way radio",
      "two",
      "way",
      "radio",
      "two software",
      "two app",
      "two platform",
      "two system",
      "two management",
      "services two"
  ],

  synonyms: [
      "Two Way Radio platform",
      "Two Way Radio software",
      "Two Way Radio system",
      "two solution",
      "two service"
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
      "Build a two way radio platform",
      "Create a two way radio app",
      "I need a two way radio management system",
      "Build a two way radio solution",
      "Create a two way radio booking system"
  ],
};
