/**
 * Visitor Center App Type Definition
 *
 * Complete definition for visitor center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISITOR_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'visitor-center',
  name: 'Visitor Center',
  category: 'services',
  description: 'Visitor Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "visitor center",
      "visitor",
      "center",
      "visitor software",
      "visitor app",
      "visitor platform",
      "visitor system",
      "visitor management",
      "services visitor"
  ],

  synonyms: [
      "Visitor Center platform",
      "Visitor Center software",
      "Visitor Center system",
      "visitor solution",
      "visitor service"
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
      "Build a visitor center platform",
      "Create a visitor center app",
      "I need a visitor center management system",
      "Build a visitor center solution",
      "Create a visitor center booking system"
  ],
};
