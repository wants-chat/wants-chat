/**
 * Wheel Alignment App Type Definition
 *
 * Complete definition for wheel alignment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHEEL_ALIGNMENT_APP_TYPE: AppTypeDefinition = {
  id: 'wheel-alignment',
  name: 'Wheel Alignment',
  category: 'services',
  description: 'Wheel Alignment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wheel alignment",
      "wheel",
      "alignment",
      "wheel software",
      "wheel app",
      "wheel platform",
      "wheel system",
      "wheel management",
      "services wheel"
  ],

  synonyms: [
      "Wheel Alignment platform",
      "Wheel Alignment software",
      "Wheel Alignment system",
      "wheel solution",
      "wheel service"
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
      "Build a wheel alignment platform",
      "Create a wheel alignment app",
      "I need a wheel alignment management system",
      "Build a wheel alignment solution",
      "Create a wheel alignment booking system"
  ],
};
