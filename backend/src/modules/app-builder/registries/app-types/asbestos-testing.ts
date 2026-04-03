/**
 * Asbestos Testing App Type Definition
 *
 * Complete definition for asbestos testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASBESTOS_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'asbestos-testing',
  name: 'Asbestos Testing',
  category: 'services',
  description: 'Asbestos Testing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "asbestos testing",
      "asbestos",
      "testing",
      "asbestos software",
      "asbestos app",
      "asbestos platform",
      "asbestos system",
      "asbestos management",
      "services asbestos"
  ],

  synonyms: [
      "Asbestos Testing platform",
      "Asbestos Testing software",
      "Asbestos Testing system",
      "asbestos solution",
      "asbestos service"
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
      "Build a asbestos testing platform",
      "Create a asbestos testing app",
      "I need a asbestos testing management system",
      "Build a asbestos testing solution",
      "Create a asbestos testing booking system"
  ],
};
