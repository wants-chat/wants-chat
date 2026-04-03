/**
 * Periodontics App Type Definition
 *
 * Complete definition for periodontics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERIODONTICS_APP_TYPE: AppTypeDefinition = {
  id: 'periodontics',
  name: 'Periodontics',
  category: 'services',
  description: 'Periodontics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "periodontics",
      "periodontics software",
      "periodontics app",
      "periodontics platform",
      "periodontics system",
      "periodontics management",
      "services periodontics"
  ],

  synonyms: [
      "Periodontics platform",
      "Periodontics software",
      "Periodontics system",
      "periodontics solution",
      "periodontics service"
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
      "Build a periodontics platform",
      "Create a periodontics app",
      "I need a periodontics management system",
      "Build a periodontics solution",
      "Create a periodontics booking system"
  ],
};
