/**
 * Ancestry Research App Type Definition
 *
 * Complete definition for ancestry research applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANCESTRY_RESEARCH_APP_TYPE: AppTypeDefinition = {
  id: 'ancestry-research',
  name: 'Ancestry Research',
  category: 'services',
  description: 'Ancestry Research platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ancestry research",
      "ancestry",
      "research",
      "ancestry software",
      "ancestry app",
      "ancestry platform",
      "ancestry system",
      "ancestry management",
      "services ancestry"
  ],

  synonyms: [
      "Ancestry Research platform",
      "Ancestry Research software",
      "Ancestry Research system",
      "ancestry solution",
      "ancestry service"
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
      "Build a ancestry research platform",
      "Create a ancestry research app",
      "I need a ancestry research management system",
      "Build a ancestry research solution",
      "Create a ancestry research booking system"
  ],
};
