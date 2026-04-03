/**
 * Audiologist App Type Definition
 *
 * Complete definition for audiologist applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDIOLOGIST_APP_TYPE: AppTypeDefinition = {
  id: 'audiologist',
  name: 'Audiologist',
  category: 'services',
  description: 'Audiologist platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "audiologist",
      "audiologist software",
      "audiologist app",
      "audiologist platform",
      "audiologist system",
      "audiologist management",
      "services audiologist"
  ],

  synonyms: [
      "Audiologist platform",
      "Audiologist software",
      "Audiologist system",
      "audiologist solution",
      "audiologist service"
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
      "Build a audiologist platform",
      "Create a audiologist app",
      "I need a audiologist management system",
      "Build a audiologist solution",
      "Create a audiologist booking system"
  ],
};
