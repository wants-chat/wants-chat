/**
 * Nursing Home App Type Definition
 *
 * Complete definition for nursing home applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NURSING_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'nursing-home',
  name: 'Nursing Home',
  category: 'services',
  description: 'Nursing Home platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "nursing home",
      "nursing",
      "home",
      "nursing software",
      "nursing app",
      "nursing platform",
      "nursing system",
      "nursing management",
      "services nursing"
  ],

  synonyms: [
      "Nursing Home platform",
      "Nursing Home software",
      "Nursing Home system",
      "nursing solution",
      "nursing service"
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
      "Build a nursing home platform",
      "Create a nursing home app",
      "I need a nursing home management system",
      "Build a nursing home solution",
      "Create a nursing home booking system"
  ],
};
