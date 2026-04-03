/**
 * Alternative Fuel App Type Definition
 *
 * Complete definition for alternative fuel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALTERNATIVE_FUEL_APP_TYPE: AppTypeDefinition = {
  id: 'alternative-fuel',
  name: 'Alternative Fuel',
  category: 'services',
  description: 'Alternative Fuel platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "alternative fuel",
      "alternative",
      "fuel",
      "alternative software",
      "alternative app",
      "alternative platform",
      "alternative system",
      "alternative management",
      "services alternative"
  ],

  synonyms: [
      "Alternative Fuel platform",
      "Alternative Fuel software",
      "Alternative Fuel system",
      "alternative solution",
      "alternative service"
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
      "Build a alternative fuel platform",
      "Create a alternative fuel app",
      "I need a alternative fuel management system",
      "Build a alternative fuel solution",
      "Create a alternative fuel booking system"
  ],
};
