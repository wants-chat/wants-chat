/**
 * Survey Company App Type Definition
 *
 * Complete definition for survey company applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURVEY_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'survey-company',
  name: 'Survey Company',
  category: 'services',
  description: 'Survey Company platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "survey company",
      "survey",
      "company",
      "survey software",
      "survey app",
      "survey platform",
      "survey system",
      "survey management",
      "services survey"
  ],

  synonyms: [
      "Survey Company platform",
      "Survey Company software",
      "Survey Company system",
      "survey solution",
      "survey service"
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
      "Build a survey company platform",
      "Create a survey company app",
      "I need a survey company management system",
      "Build a survey company solution",
      "Create a survey company booking system"
  ],
};
