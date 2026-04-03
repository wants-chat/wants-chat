/**
 * Wallet Repair App Type Definition
 *
 * Complete definition for wallet repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALLET_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'wallet-repair',
  name: 'Wallet Repair',
  category: 'services',
  description: 'Wallet Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wallet repair",
      "wallet",
      "repair",
      "wallet software",
      "wallet app",
      "wallet platform",
      "wallet system",
      "wallet management",
      "services wallet"
  ],

  synonyms: [
      "Wallet Repair platform",
      "Wallet Repair software",
      "Wallet Repair system",
      "wallet solution",
      "wallet service"
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
      "Build a wallet repair platform",
      "Create a wallet repair app",
      "I need a wallet repair management system",
      "Build a wallet repair solution",
      "Create a wallet repair booking system"
  ],
};
