/**
 * Customer Service App Type Definition
 *
 * Complete definition for customer service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CUSTOMER_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'customer-service',
  name: 'Customer Service',
  category: 'services',
  description: 'Customer Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "customer service",
      "customer",
      "service",
      "customer software",
      "customer app",
      "customer platform",
      "customer system",
      "customer management",
      "services customer"
  ],

  synonyms: [
      "Customer Service platform",
      "Customer Service software",
      "Customer Service system",
      "customer solution",
      "customer service"
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
      "Build a customer service platform",
      "Create a customer service app",
      "I need a customer service management system",
      "Build a customer service solution",
      "Create a customer service booking system"
  ],
};
