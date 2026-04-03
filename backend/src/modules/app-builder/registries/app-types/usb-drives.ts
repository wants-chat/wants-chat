/**
 * Usb Drives App Type Definition
 *
 * Complete definition for usb drives applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USB_DRIVES_APP_TYPE: AppTypeDefinition = {
  id: 'usb-drives',
  name: 'Usb Drives',
  category: 'services',
  description: 'Usb Drives platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "usb drives",
      "usb",
      "drives",
      "usb software",
      "usb app",
      "usb platform",
      "usb system",
      "usb management",
      "services usb"
  ],

  synonyms: [
      "Usb Drives platform",
      "Usb Drives software",
      "Usb Drives system",
      "usb solution",
      "usb service"
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
      "Build a usb drives platform",
      "Create a usb drives app",
      "I need a usb drives management system",
      "Build a usb drives solution",
      "Create a usb drives booking system"
  ],
};
