/**
 * Heavy Equipment App Type Definition
 *
 * Complete definition for heavy equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEAVY_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'heavy-equipment',
  name: 'Heavy Equipment',
  category: 'services',
  description: 'Heavy Equipment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "heavy equipment",
      "heavy",
      "equipment",
      "heavy software",
      "heavy app",
      "heavy platform",
      "heavy system",
      "heavy management",
      "services heavy"
  ],

  synonyms: [
      "Heavy Equipment platform",
      "Heavy Equipment software",
      "Heavy Equipment system",
      "heavy solution",
      "heavy service"
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
      "Build a heavy equipment platform",
      "Create a heavy equipment app",
      "I need a heavy equipment management system",
      "Build a heavy equipment solution",
      "Create a heavy equipment booking system"
  ],
};
