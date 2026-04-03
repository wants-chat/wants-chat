/**
 * Supplier App Type Definition
 *
 * Complete definition for supplier applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUPPLIER_APP_TYPE: AppTypeDefinition = {
  id: 'supplier',
  name: 'Supplier',
  category: 'services',
  description: 'Supplier platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "supplier",
      "supplier software",
      "supplier app",
      "supplier platform",
      "supplier system",
      "supplier management",
      "services supplier"
  ],

  synonyms: [
      "Supplier platform",
      "Supplier software",
      "Supplier system",
      "supplier solution",
      "supplier service"
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
      "Build a supplier platform",
      "Create a supplier app",
      "I need a supplier management system",
      "Build a supplier solution",
      "Create a supplier booking system"
  ],
};
