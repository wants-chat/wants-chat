/**
 * Pharmaceutical App Type Definition
 *
 * Complete definition for pharmaceutical applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHARMACEUTICAL_APP_TYPE: AppTypeDefinition = {
  id: 'pharmaceutical',
  name: 'Pharmaceutical',
  category: 'services',
  description: 'Pharmaceutical platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pharmaceutical",
      "pharmaceutical software",
      "pharmaceutical app",
      "pharmaceutical platform",
      "pharmaceutical system",
      "pharmaceutical management",
      "services pharmaceutical"
  ],

  synonyms: [
      "Pharmaceutical platform",
      "Pharmaceutical software",
      "Pharmaceutical system",
      "pharmaceutical solution",
      "pharmaceutical service"
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
      "Build a pharmaceutical platform",
      "Create a pharmaceutical app",
      "I need a pharmaceutical management system",
      "Build a pharmaceutical solution",
      "Create a pharmaceutical booking system"
  ],
};
