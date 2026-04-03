/**
 * Senior Concierge App Type Definition
 *
 * Complete definition for senior concierge applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_CONCIERGE_APP_TYPE: AppTypeDefinition = {
  id: 'senior-concierge',
  name: 'Senior Concierge',
  category: 'services',
  description: 'Senior Concierge platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "senior concierge",
      "senior",
      "concierge",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "services senior"
  ],

  synonyms: [
      "Senior Concierge platform",
      "Senior Concierge software",
      "Senior Concierge system",
      "senior solution",
      "senior service"
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
      "Build a senior concierge platform",
      "Create a senior concierge app",
      "I need a senior concierge management system",
      "Build a senior concierge solution",
      "Create a senior concierge booking system"
  ],
};
