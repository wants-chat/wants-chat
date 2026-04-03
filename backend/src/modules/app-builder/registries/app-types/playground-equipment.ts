/**
 * Playground Equipment App Type Definition
 *
 * Complete definition for playground equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLAYGROUND_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'playground-equipment',
  name: 'Playground Equipment',
  category: 'services',
  description: 'Playground Equipment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "playground equipment",
      "playground",
      "equipment",
      "playground software",
      "playground app",
      "playground platform",
      "playground system",
      "playground management",
      "services playground"
  ],

  synonyms: [
      "Playground Equipment platform",
      "Playground Equipment software",
      "Playground Equipment system",
      "playground solution",
      "playground service"
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
      "Build a playground equipment platform",
      "Create a playground equipment app",
      "I need a playground equipment management system",
      "Build a playground equipment solution",
      "Create a playground equipment booking system"
  ],
};
