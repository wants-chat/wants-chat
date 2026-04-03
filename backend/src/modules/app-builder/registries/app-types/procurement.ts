/**
 * Procurement App Type Definition
 *
 * Complete definition for procurement applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROCUREMENT_APP_TYPE: AppTypeDefinition = {
  id: 'procurement',
  name: 'Procurement',
  category: 'services',
  description: 'Procurement platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "procurement",
      "procurement software",
      "procurement app",
      "procurement platform",
      "procurement system",
      "procurement management",
      "services procurement"
  ],

  synonyms: [
      "Procurement platform",
      "Procurement software",
      "Procurement system",
      "procurement solution",
      "procurement service"
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
      "Build a procurement platform",
      "Create a procurement app",
      "I need a procurement management system",
      "Build a procurement solution",
      "Create a procurement booking system"
  ],
};
