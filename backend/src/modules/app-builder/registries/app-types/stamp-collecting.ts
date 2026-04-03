/**
 * Stamp Collecting App Type Definition
 *
 * Complete definition for stamp collecting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAMP_COLLECTING_APP_TYPE: AppTypeDefinition = {
  id: 'stamp-collecting',
  name: 'Stamp Collecting',
  category: 'services',
  description: 'Stamp Collecting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stamp collecting",
      "stamp",
      "collecting",
      "stamp software",
      "stamp app",
      "stamp platform",
      "stamp system",
      "stamp management",
      "services stamp"
  ],

  synonyms: [
      "Stamp Collecting platform",
      "Stamp Collecting software",
      "Stamp Collecting system",
      "stamp solution",
      "stamp service"
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
      "Build a stamp collecting platform",
      "Create a stamp collecting app",
      "I need a stamp collecting management system",
      "Build a stamp collecting solution",
      "Create a stamp collecting booking system"
  ],
};
