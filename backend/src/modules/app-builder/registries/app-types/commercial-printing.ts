/**
 * Commercial Printing App Type Definition
 *
 * Complete definition for commercial printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-printing',
  name: 'Commercial Printing',
  category: 'services',
  description: 'Commercial Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "commercial printing",
      "commercial",
      "printing",
      "commercial software",
      "commercial app",
      "commercial platform",
      "commercial system",
      "commercial management",
      "services commercial"
  ],

  synonyms: [
      "Commercial Printing platform",
      "Commercial Printing software",
      "Commercial Printing system",
      "commercial solution",
      "commercial service"
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
      "Build a commercial printing platform",
      "Create a commercial printing app",
      "I need a commercial printing management system",
      "Build a commercial printing solution",
      "Create a commercial printing booking system"
  ],
};
