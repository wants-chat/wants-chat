/**
 * Ski Equipment App Type Definition
 *
 * Complete definition for ski equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKI_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'ski-equipment',
  name: 'Ski Equipment',
  category: 'services',
  description: 'Ski Equipment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ski equipment",
      "ski",
      "equipment",
      "ski software",
      "ski app",
      "ski platform",
      "ski system",
      "ski management",
      "services ski"
  ],

  synonyms: [
      "Ski Equipment platform",
      "Ski Equipment software",
      "Ski Equipment system",
      "ski solution",
      "ski service"
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
      "Build a ski equipment platform",
      "Create a ski equipment app",
      "I need a ski equipment management system",
      "Build a ski equipment solution",
      "Create a ski equipment booking system"
  ],
};
