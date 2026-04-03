/**
 * Vascular Surgery App Type Definition
 *
 * Complete definition for vascular surgery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VASCULAR_SURGERY_APP_TYPE: AppTypeDefinition = {
  id: 'vascular-surgery',
  name: 'Vascular Surgery',
  category: 'services',
  description: 'Vascular Surgery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vascular surgery",
      "vascular",
      "surgery",
      "vascular software",
      "vascular app",
      "vascular platform",
      "vascular system",
      "vascular management",
      "services vascular"
  ],

  synonyms: [
      "Vascular Surgery platform",
      "Vascular Surgery software",
      "Vascular Surgery system",
      "vascular solution",
      "vascular service"
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
      "Build a vascular surgery platform",
      "Create a vascular surgery app",
      "I need a vascular surgery management system",
      "Build a vascular surgery solution",
      "Create a vascular surgery booking system"
  ],
};
