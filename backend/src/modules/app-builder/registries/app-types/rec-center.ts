/**
 * Rec Center App Type Definition
 *
 * Complete definition for rec center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REC_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'rec-center',
  name: 'Rec Center',
  category: 'services',
  description: 'Rec Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "rec center",
      "rec",
      "center",
      "rec software",
      "rec app",
      "rec platform",
      "rec system",
      "rec management",
      "services rec"
  ],

  synonyms: [
      "Rec Center platform",
      "Rec Center software",
      "Rec Center system",
      "rec solution",
      "rec service"
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
      "Build a rec center platform",
      "Create a rec center app",
      "I need a rec center management system",
      "Build a rec center solution",
      "Create a rec center booking system"
  ],
};
