/**
 * Structural Steel App Type Definition
 *
 * Complete definition for structural steel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STRUCTURAL_STEEL_APP_TYPE: AppTypeDefinition = {
  id: 'structural-steel',
  name: 'Structural Steel',
  category: 'services',
  description: 'Structural Steel platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "structural steel",
      "structural",
      "steel",
      "structural software",
      "structural app",
      "structural platform",
      "structural system",
      "structural management",
      "services structural"
  ],

  synonyms: [
      "Structural Steel platform",
      "Structural Steel software",
      "Structural Steel system",
      "structural solution",
      "structural service"
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
      "Build a structural steel platform",
      "Create a structural steel app",
      "I need a structural steel management system",
      "Build a structural steel solution",
      "Create a structural steel booking system"
  ],
};
