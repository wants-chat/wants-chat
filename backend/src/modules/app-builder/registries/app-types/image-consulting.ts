/**
 * Image Consulting App Type Definition
 *
 * Complete definition for image consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IMAGE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'image-consulting',
  name: 'Image Consulting',
  category: 'professional-services',
  description: 'Image Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "image consulting",
      "image",
      "consulting",
      "image software",
      "image app",
      "image platform",
      "image system",
      "image management",
      "consulting image"
  ],

  synonyms: [
      "Image Consulting platform",
      "Image Consulting software",
      "Image Consulting system",
      "image solution",
      "image service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a image consulting platform",
      "Create a image consulting app",
      "I need a image consulting management system",
      "Build a image consulting solution",
      "Create a image consulting booking system"
  ],
};
