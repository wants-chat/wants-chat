/**
 * Lawn Service App Type Definition
 *
 * Complete definition for lawn service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAWN_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'lawn-service',
  name: 'Lawn Service',
  category: 'legal',
  description: 'Lawn Service platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "lawn service",
      "lawn",
      "service",
      "lawn software",
      "lawn app",
      "lawn platform",
      "lawn system",
      "lawn management",
      "legal lawn"
  ],

  synonyms: [
      "Lawn Service platform",
      "Lawn Service software",
      "Lawn Service system",
      "lawn solution",
      "lawn service"
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
          "name": "Managing Partner",
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
          "name": "Attorney",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Client",
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
      "case-management",
      "client-intake",
      "billing-timekeeping",
      "documents",
      "notifications"
  ],

  optionalFeatures: [
      "court-calendar",
      "document-assembly",
      "conflict-check",
      "payments",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a lawn service platform",
      "Create a lawn service app",
      "I need a lawn service management system",
      "Build a lawn service solution",
      "Create a lawn service booking system"
  ],
};
