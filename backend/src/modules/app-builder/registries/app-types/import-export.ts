/**
 * Import Export App Type Definition
 *
 * Complete definition for import export applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IMPORT_EXPORT_APP_TYPE: AppTypeDefinition = {
  id: 'import-export',
  name: 'Import Export',
  category: 'services',
  description: 'Import Export platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "import export",
      "import",
      "export",
      "import software",
      "import app",
      "import platform",
      "import system",
      "import management",
      "services import"
  ],

  synonyms: [
      "Import Export platform",
      "Import Export software",
      "Import Export system",
      "import solution",
      "import service"
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
      "Build a import export platform",
      "Create a import export app",
      "I need a import export management system",
      "Build a import export solution",
      "Create a import export booking system"
  ],
};
