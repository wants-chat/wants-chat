/**
 * Ppe Supplier App Type Definition
 *
 * Complete definition for ppe supplier applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PPE_SUPPLIER_APP_TYPE: AppTypeDefinition = {
  id: 'ppe-supplier',
  name: 'Ppe Supplier',
  category: 'services',
  description: 'Ppe Supplier platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ppe supplier",
      "ppe",
      "supplier",
      "ppe software",
      "ppe app",
      "ppe platform",
      "ppe system",
      "ppe management",
      "services ppe"
  ],

  synonyms: [
      "Ppe Supplier platform",
      "Ppe Supplier software",
      "Ppe Supplier system",
      "ppe solution",
      "ppe service"
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
      "Build a ppe supplier platform",
      "Create a ppe supplier app",
      "I need a ppe supplier management system",
      "Build a ppe supplier solution",
      "Create a ppe supplier booking system"
  ],
};
