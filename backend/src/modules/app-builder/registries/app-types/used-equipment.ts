/**
 * Used Equipment App Type Definition
 *
 * Complete definition for used equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USED_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'used-equipment',
  name: 'Used Equipment',
  category: 'services',
  description: 'Used Equipment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "used equipment",
      "used",
      "equipment",
      "used software",
      "used app",
      "used platform",
      "used system",
      "used management",
      "services used"
  ],

  synonyms: [
      "Used Equipment platform",
      "Used Equipment software",
      "Used Equipment system",
      "used solution",
      "used service"
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
      "Build a used equipment platform",
      "Create a used equipment app",
      "I need a used equipment management system",
      "Build a used equipment solution",
      "Create a used equipment booking system"
  ],
};
