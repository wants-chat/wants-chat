/**
 * Industrial Equipment App Type Definition
 *
 * Complete definition for industrial equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDUSTRIAL_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'industrial-equipment',
  name: 'Industrial Equipment',
  category: 'services',
  description: 'Industrial Equipment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "industrial equipment",
      "industrial",
      "equipment",
      "industrial software",
      "industrial app",
      "industrial platform",
      "industrial system",
      "industrial management",
      "services industrial"
  ],

  synonyms: [
      "Industrial Equipment platform",
      "Industrial Equipment software",
      "Industrial Equipment system",
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
      "Build a industrial equipment platform",
      "Create a industrial equipment app",
      "I need a industrial equipment management system",
      "Build a industrial equipment solution",
      "Create a industrial equipment booking system"
  ],
};
