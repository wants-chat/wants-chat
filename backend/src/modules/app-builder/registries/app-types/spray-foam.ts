/**
 * Spray Foam App Type Definition
 *
 * Complete definition for spray foam applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPRAY_FOAM_APP_TYPE: AppTypeDefinition = {
  id: 'spray-foam',
  name: 'Spray Foam',
  category: 'services',
  description: 'Spray Foam platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "spray foam",
      "spray",
      "foam",
      "spray software",
      "spray app",
      "spray platform",
      "spray system",
      "spray management",
      "services spray"
  ],

  synonyms: [
      "Spray Foam platform",
      "Spray Foam software",
      "Spray Foam system",
      "spray solution",
      "spray service"
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
      "Build a spray foam platform",
      "Create a spray foam app",
      "I need a spray foam management system",
      "Build a spray foam solution",
      "Create a spray foam booking system"
  ],
};
