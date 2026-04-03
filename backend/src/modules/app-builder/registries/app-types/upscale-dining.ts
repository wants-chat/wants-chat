/**
 * Upscale Dining App Type Definition
 *
 * Complete definition for upscale dining applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UPSCALE_DINING_APP_TYPE: AppTypeDefinition = {
  id: 'upscale-dining',
  name: 'Upscale Dining',
  category: 'services',
  description: 'Upscale Dining platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "upscale dining",
      "upscale",
      "dining",
      "upscale software",
      "upscale app",
      "upscale platform",
      "upscale system",
      "upscale management",
      "services upscale"
  ],

  synonyms: [
      "Upscale Dining platform",
      "Upscale Dining software",
      "Upscale Dining system",
      "upscale solution",
      "upscale service"
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
      "Build a upscale dining platform",
      "Create a upscale dining app",
      "I need a upscale dining management system",
      "Build a upscale dining solution",
      "Create a upscale dining booking system"
  ],
};
