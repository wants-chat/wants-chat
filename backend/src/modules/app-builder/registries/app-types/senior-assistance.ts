/**
 * Senior Assistance App Type Definition
 *
 * Complete definition for senior assistance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_ASSISTANCE_APP_TYPE: AppTypeDefinition = {
  id: 'senior-assistance',
  name: 'Senior Assistance',
  category: 'services',
  description: 'Senior Assistance platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "senior assistance",
      "senior",
      "assistance",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "services senior"
  ],

  synonyms: [
      "Senior Assistance platform",
      "Senior Assistance software",
      "Senior Assistance system",
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
      "Build a senior assistance platform",
      "Create a senior assistance app",
      "I need a senior assistance management system",
      "Build a senior assistance solution",
      "Create a senior assistance booking system"
  ],
};
