/**
 * Precision Machining App Type Definition
 *
 * Complete definition for precision machining applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRECISION_MACHINING_APP_TYPE: AppTypeDefinition = {
  id: 'precision-machining',
  name: 'Precision Machining',
  category: 'services',
  description: 'Precision Machining platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "precision machining",
      "precision",
      "machining",
      "precision software",
      "precision app",
      "precision platform",
      "precision system",
      "precision management",
      "services precision"
  ],

  synonyms: [
      "Precision Machining platform",
      "Precision Machining software",
      "Precision Machining system",
      "precision solution",
      "precision service"
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
      "Build a precision machining platform",
      "Create a precision machining app",
      "I need a precision machining management system",
      "Build a precision machining solution",
      "Create a precision machining booking system"
  ],
};
