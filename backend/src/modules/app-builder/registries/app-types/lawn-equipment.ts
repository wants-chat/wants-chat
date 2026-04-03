/**
 * Lawn Equipment App Type Definition
 *
 * Complete definition for lawn equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAWN_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'lawn-equipment',
  name: 'Lawn Equipment',
  category: 'legal',
  description: 'Lawn Equipment platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "lawn equipment",
      "lawn",
      "equipment",
      "lawn software",
      "lawn app",
      "lawn platform",
      "lawn system",
      "lawn management",
      "legal lawn"
  ],

  synonyms: [
      "Lawn Equipment platform",
      "Lawn Equipment software",
      "Lawn Equipment system",
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
      "Build a lawn equipment platform",
      "Create a lawn equipment app",
      "I need a lawn equipment management system",
      "Build a lawn equipment solution",
      "Create a lawn equipment booking system"
  ],
};
