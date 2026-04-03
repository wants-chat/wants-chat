/**
 * Horseback Riding App Type Definition
 *
 * Complete definition for horseback riding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HORSEBACK_RIDING_APP_TYPE: AppTypeDefinition = {
  id: 'horseback-riding',
  name: 'Horseback Riding',
  category: 'services',
  description: 'Horseback Riding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "horseback riding",
      "horseback",
      "riding",
      "horseback software",
      "horseback app",
      "horseback platform",
      "horseback system",
      "horseback management",
      "services horseback"
  ],

  synonyms: [
      "Horseback Riding platform",
      "Horseback Riding software",
      "Horseback Riding system",
      "horseback solution",
      "horseback service"
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
      "Build a horseback riding platform",
      "Create a horseback riding app",
      "I need a horseback riding management system",
      "Build a horseback riding solution",
      "Create a horseback riding booking system"
  ],
};
