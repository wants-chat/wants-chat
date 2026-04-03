/**
 * Vr Experience App Type Definition
 *
 * Complete definition for vr experience applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VR_EXPERIENCE_APP_TYPE: AppTypeDefinition = {
  id: 'vr-experience',
  name: 'Vr Experience',
  category: 'services',
  description: 'Vr Experience platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vr experience",
      "experience",
      "vr software",
      "vr app",
      "vr platform",
      "vr system",
      "vr management",
      "services vr"
  ],

  synonyms: [
      "Vr Experience platform",
      "Vr Experience software",
      "Vr Experience system",
      "vr solution",
      "vr service"
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
      "Build a vr experience platform",
      "Create a vr experience app",
      "I need a vr experience management system",
      "Build a vr experience solution",
      "Create a vr experience booking system"
  ],
};
