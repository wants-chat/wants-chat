/**
 * Blockchain Services App Type Definition
 *
 * Complete definition for blockchain services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BLOCKCHAIN_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'blockchain-services',
  name: 'Blockchain Services',
  category: 'services',
  description: 'Blockchain Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "blockchain services",
      "blockchain",
      "services",
      "blockchain software",
      "blockchain app",
      "blockchain platform",
      "blockchain system",
      "blockchain management",
      "services blockchain"
  ],

  synonyms: [
      "Blockchain Services platform",
      "Blockchain Services software",
      "Blockchain Services system",
      "blockchain solution",
      "blockchain service"
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
      "Build a blockchain services platform",
      "Create a blockchain services app",
      "I need a blockchain services management system",
      "Build a blockchain services solution",
      "Create a blockchain services booking system"
  ],
};
