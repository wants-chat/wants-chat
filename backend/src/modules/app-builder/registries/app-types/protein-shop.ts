/**
 * Protein Shop App Type Definition
 *
 * Complete definition for protein shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROTEIN_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'protein-shop',
  name: 'Protein Shop',
  category: 'retail',
  description: 'Protein Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "protein shop",
      "protein",
      "shop",
      "protein software",
      "protein app",
      "protein platform",
      "protein system",
      "protein management",
      "retail protein"
  ],

  synonyms: [
      "Protein Shop platform",
      "Protein Shop software",
      "Protein Shop system",
      "protein solution",
      "protein service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a protein shop platform",
      "Create a protein shop app",
      "I need a protein shop management system",
      "Build a protein shop solution",
      "Create a protein shop booking system"
  ],
};
