/**
 * Van Conversion App Type Definition
 *
 * Complete definition for van conversion applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VAN_CONVERSION_APP_TYPE: AppTypeDefinition = {
  id: 'van-conversion',
  name: 'Van Conversion',
  category: 'services',
  description: 'Van Conversion platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "van conversion",
      "van",
      "conversion",
      "van software",
      "van app",
      "van platform",
      "van system",
      "van management",
      "services van"
  ],

  synonyms: [
      "Van Conversion platform",
      "Van Conversion software",
      "Van Conversion system",
      "van solution",
      "van service"
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
      "Build a van conversion platform",
      "Create a van conversion app",
      "I need a van conversion management system",
      "Build a van conversion solution",
      "Create a van conversion booking system"
  ],
};
