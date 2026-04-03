/**
 * Amber Jewelry App Type Definition
 *
 * Complete definition for amber jewelry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMBER_JEWELRY_APP_TYPE: AppTypeDefinition = {
  id: 'amber-jewelry',
  name: 'Amber Jewelry',
  category: 'services',
  description: 'Amber Jewelry platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "amber jewelry",
      "amber",
      "jewelry",
      "amber software",
      "amber app",
      "amber platform",
      "amber system",
      "amber management",
      "services amber"
  ],

  synonyms: [
      "Amber Jewelry platform",
      "Amber Jewelry software",
      "Amber Jewelry system",
      "amber solution",
      "amber service"
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
      "Build a amber jewelry platform",
      "Create a amber jewelry app",
      "I need a amber jewelry management system",
      "Build a amber jewelry solution",
      "Create a amber jewelry booking system"
  ],
};
