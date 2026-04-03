/**
 * Industrial Design App Type Definition
 *
 * Complete definition for industrial design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDUSTRIAL_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'industrial-design',
  name: 'Industrial Design',
  category: 'services',
  description: 'Industrial Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "industrial design",
      "industrial",
      "design",
      "industrial software",
      "industrial app",
      "industrial platform",
      "industrial system",
      "industrial management",
      "services industrial"
  ],

  synonyms: [
      "Industrial Design platform",
      "Industrial Design software",
      "Industrial Design system",
      "industrial solution",
      "industrial service"
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
      "Build a industrial design platform",
      "Create a industrial design app",
      "I need a industrial design management system",
      "Build a industrial design solution",
      "Create a industrial design booking system"
  ],
};
