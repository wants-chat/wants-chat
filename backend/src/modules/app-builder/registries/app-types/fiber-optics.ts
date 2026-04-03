/**
 * Fiber Optics App Type Definition
 *
 * Complete definition for fiber optics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIBER_OPTICS_APP_TYPE: AppTypeDefinition = {
  id: 'fiber-optics',
  name: 'Fiber Optics',
  category: 'services',
  description: 'Fiber Optics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "fiber optics",
      "fiber",
      "optics",
      "fiber software",
      "fiber app",
      "fiber platform",
      "fiber system",
      "fiber management",
      "services fiber"
  ],

  synonyms: [
      "Fiber Optics platform",
      "Fiber Optics software",
      "Fiber Optics system",
      "fiber solution",
      "fiber service"
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
      "Build a fiber optics platform",
      "Create a fiber optics app",
      "I need a fiber optics management system",
      "Build a fiber optics solution",
      "Create a fiber optics booking system"
  ],
};
