/**
 * Insurance Agency App Type Definition
 *
 * Complete definition for insurance agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSURANCE_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'insurance-agency',
  name: 'Insurance Agency',
  category: 'services',
  description: 'Insurance Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "insurance agency",
      "insurance",
      "agency",
      "insurance software",
      "insurance app",
      "insurance platform",
      "insurance system",
      "insurance management",
      "services insurance"
  ],

  synonyms: [
      "Insurance Agency platform",
      "Insurance Agency software",
      "Insurance Agency system",
      "insurance solution",
      "insurance service"
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
      "Build a insurance agency platform",
      "Create a insurance agency app",
      "I need a insurance agency management system",
      "Build a insurance agency solution",
      "Create a insurance agency booking system"
  ],
};
