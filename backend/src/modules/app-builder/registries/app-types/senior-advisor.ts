/**
 * Senior Advisor App Type Definition
 *
 * Complete definition for senior advisor applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_ADVISOR_APP_TYPE: AppTypeDefinition = {
  id: 'senior-advisor',
  name: 'Senior Advisor',
  category: 'services',
  description: 'Senior Advisor platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "senior advisor",
      "senior",
      "advisor",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "services senior"
  ],

  synonyms: [
      "Senior Advisor platform",
      "Senior Advisor software",
      "Senior Advisor system",
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
      "Build a senior advisor platform",
      "Create a senior advisor app",
      "I need a senior advisor management system",
      "Build a senior advisor solution",
      "Create a senior advisor booking system"
  ],
};
