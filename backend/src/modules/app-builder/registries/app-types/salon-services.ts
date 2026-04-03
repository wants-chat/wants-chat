/**
 * Salon Services App Type Definition
 *
 * Complete definition for salon services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALON_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'salon-services',
  name: 'Salon Services',
  category: 'beauty',
  description: 'Salon Services platform with comprehensive management features',
  icon: 'scissors',

  keywords: [
      "salon services",
      "salon",
      "services",
      "salon software",
      "salon app",
      "salon platform",
      "salon system",
      "salon management",
      "beauty salon"
  ],

  synonyms: [
      "Salon Services platform",
      "Salon Services software",
      "Salon Services system",
      "salon solution",
      "salon service"
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
      "scheduling",
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "team-management",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a salon services platform",
      "Create a salon services app",
      "I need a salon services management system",
      "Build a salon services solution",
      "Create a salon services booking system"
  ],
};
