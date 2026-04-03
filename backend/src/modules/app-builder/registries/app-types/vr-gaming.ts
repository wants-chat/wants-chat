/**
 * Vr Gaming App Type Definition
 *
 * Complete definition for vr gaming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VR_GAMING_APP_TYPE: AppTypeDefinition = {
  id: 'vr-gaming',
  name: 'Vr Gaming',
  category: 'services',
  description: 'Vr Gaming platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vr gaming",
      "gaming",
      "vr software",
      "vr app",
      "vr platform",
      "vr system",
      "vr management",
      "services vr"
  ],

  synonyms: [
      "Vr Gaming platform",
      "Vr Gaming software",
      "Vr Gaming system",
      "vr solution",
      "vr service"
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
      "Build a vr gaming platform",
      "Create a vr gaming app",
      "I need a vr gaming management system",
      "Build a vr gaming solution",
      "Create a vr gaming booking system"
  ],
};
