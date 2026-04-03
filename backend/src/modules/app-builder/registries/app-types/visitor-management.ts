/**
 * Visitor Management App Type Definition
 *
 * Complete definition for visitor management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISITOR_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'visitor-management',
  name: 'Visitor Management',
  category: 'services',
  description: 'Visitor Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "visitor management",
      "visitor",
      "management",
      "visitor software",
      "visitor app",
      "visitor platform",
      "visitor system",
      "services visitor"
  ],

  synonyms: [
      "Visitor Management platform",
      "Visitor Management software",
      "Visitor Management system",
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
      "Build a visitor management platform",
      "Create a visitor management app",
      "I need a visitor management management system",
      "Build a visitor management solution",
      "Create a visitor management booking system"
  ],
};
