/**
 * Stretching App Type Definition
 *
 * Complete definition for stretching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STRETCHING_APP_TYPE: AppTypeDefinition = {
  id: 'stretching',
  name: 'Stretching',
  category: 'services',
  description: 'Stretching platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stretching",
      "stretching software",
      "stretching app",
      "stretching platform",
      "stretching system",
      "stretching management",
      "services stretching"
  ],

  synonyms: [
      "Stretching platform",
      "Stretching software",
      "Stretching system",
      "stretching solution",
      "stretching service"
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
      "Build a stretching platform",
      "Create a stretching app",
      "I need a stretching management system",
      "Build a stretching solution",
      "Create a stretching booking system"
  ],
};
