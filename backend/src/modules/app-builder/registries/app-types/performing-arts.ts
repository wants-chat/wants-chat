/**
 * Performing Arts App Type Definition
 *
 * Complete definition for performing arts applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERFORMING_ARTS_APP_TYPE: AppTypeDefinition = {
  id: 'performing-arts',
  name: 'Performing Arts',
  category: 'services',
  description: 'Performing Arts platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "performing arts",
      "performing",
      "arts",
      "performing software",
      "performing app",
      "performing platform",
      "performing system",
      "performing management",
      "services performing"
  ],

  synonyms: [
      "Performing Arts platform",
      "Performing Arts software",
      "Performing Arts system",
      "performing solution",
      "performing service"
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
      "Build a performing arts platform",
      "Create a performing arts app",
      "I need a performing arts management system",
      "Build a performing arts solution",
      "Create a performing arts booking system"
  ],
};
