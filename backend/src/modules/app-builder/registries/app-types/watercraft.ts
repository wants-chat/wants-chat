/**
 * Watercraft App Type Definition
 *
 * Complete definition for watercraft applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATERCRAFT_APP_TYPE: AppTypeDefinition = {
  id: 'watercraft',
  name: 'Watercraft',
  category: 'services',
  description: 'Watercraft platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "watercraft",
      "watercraft software",
      "watercraft app",
      "watercraft platform",
      "watercraft system",
      "watercraft management",
      "services watercraft"
  ],

  synonyms: [
      "Watercraft platform",
      "Watercraft software",
      "Watercraft system",
      "watercraft solution",
      "watercraft service"
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
      "Build a watercraft platform",
      "Create a watercraft app",
      "I need a watercraft management system",
      "Build a watercraft solution",
      "Create a watercraft booking system"
  ],
};
