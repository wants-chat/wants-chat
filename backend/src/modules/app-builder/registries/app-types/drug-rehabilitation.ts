/**
 * Drug Rehabilitation App Type Definition
 *
 * Complete definition for drug rehabilitation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRUG_REHABILITATION_APP_TYPE: AppTypeDefinition = {
  id: 'drug-rehabilitation',
  name: 'Drug Rehabilitation',
  category: 'services',
  description: 'Drug Rehabilitation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "drug rehabilitation",
      "drug",
      "rehabilitation",
      "drug software",
      "drug app",
      "drug platform",
      "drug system",
      "drug management",
      "services drug"
  ],

  synonyms: [
      "Drug Rehabilitation platform",
      "Drug Rehabilitation software",
      "Drug Rehabilitation system",
      "drug solution",
      "drug service"
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
      "Build a drug rehabilitation platform",
      "Create a drug rehabilitation app",
      "I need a drug rehabilitation management system",
      "Build a drug rehabilitation solution",
      "Create a drug rehabilitation booking system"
  ],
};
