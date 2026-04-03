/**
 * Instructional Design App Type Definition
 *
 * Complete definition for instructional design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSTRUCTIONAL_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'instructional-design',
  name: 'Instructional Design',
  category: 'services',
  description: 'Instructional Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "instructional design",
      "instructional",
      "design",
      "instructional software",
      "instructional app",
      "instructional platform",
      "instructional system",
      "instructional management",
      "services instructional"
  ],

  synonyms: [
      "Instructional Design platform",
      "Instructional Design software",
      "Instructional Design system",
      "instructional solution",
      "instructional service"
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
      "Build a instructional design platform",
      "Create a instructional design app",
      "I need a instructional design management system",
      "Build a instructional design solution",
      "Create a instructional design booking system"
  ],
};
