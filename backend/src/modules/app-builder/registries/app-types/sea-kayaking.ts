/**
 * Sea Kayaking App Type Definition
 *
 * Complete definition for sea kayaking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEA_KAYAKING_APP_TYPE: AppTypeDefinition = {
  id: 'sea-kayaking',
  name: 'Sea Kayaking',
  category: 'services',
  description: 'Sea Kayaking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sea kayaking",
      "sea",
      "kayaking",
      "sea software",
      "sea app",
      "sea platform",
      "sea system",
      "sea management",
      "services sea"
  ],

  synonyms: [
      "Sea Kayaking platform",
      "Sea Kayaking software",
      "Sea Kayaking system",
      "sea solution",
      "sea service"
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
      "Build a sea kayaking platform",
      "Create a sea kayaking app",
      "I need a sea kayaking management system",
      "Build a sea kayaking solution",
      "Create a sea kayaking booking system"
  ],
};
