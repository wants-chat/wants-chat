/**
 * Welding Supplies App Type Definition
 *
 * Complete definition for welding supplies applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELDING_SUPPLIES_APP_TYPE: AppTypeDefinition = {
  id: 'welding-supplies',
  name: 'Welding Supplies',
  category: 'services',
  description: 'Welding Supplies platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "welding supplies",
      "welding",
      "supplies",
      "welding software",
      "welding app",
      "welding platform",
      "welding system",
      "welding management",
      "services welding"
  ],

  synonyms: [
      "Welding Supplies platform",
      "Welding Supplies software",
      "Welding Supplies system",
      "welding solution",
      "welding service"
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
      "Build a welding supplies platform",
      "Create a welding supplies app",
      "I need a welding supplies management system",
      "Build a welding supplies solution",
      "Create a welding supplies booking system"
  ],
};
