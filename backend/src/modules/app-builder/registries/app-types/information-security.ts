/**
 * Information Security App Type Definition
 *
 * Complete definition for information security applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INFORMATION_SECURITY_APP_TYPE: AppTypeDefinition = {
  id: 'information-security',
  name: 'Information Security',
  category: 'services',
  description: 'Information Security platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "information security",
      "information",
      "security",
      "information software",
      "information app",
      "information platform",
      "information system",
      "information management",
      "services information"
  ],

  synonyms: [
      "Information Security platform",
      "Information Security software",
      "Information Security system",
      "information solution",
      "information service"
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
      "Build a information security platform",
      "Create a information security app",
      "I need a information security management system",
      "Build a information security solution",
      "Create a information security booking system"
  ],
};
