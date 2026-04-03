/**
 * Answering Service App Type Definition
 *
 * Complete definition for answering service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANSWERING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'answering-service',
  name: 'Answering Service',
  category: 'services',
  description: 'Answering Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "answering service",
      "answering",
      "service",
      "answering software",
      "answering app",
      "answering platform",
      "answering system",
      "answering management",
      "services answering"
  ],

  synonyms: [
      "Answering Service platform",
      "Answering Service software",
      "Answering Service system",
      "answering solution",
      "answering service"
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
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a answering service platform",
      "Create a answering service app",
      "I need a answering service management system",
      "Build a answering service solution",
      "Create a answering service booking system"
  ],
};
