/**
 * Rust Proofing App Type Definition
 *
 * Complete definition for rust proofing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RUST_PROOFING_APP_TYPE: AppTypeDefinition = {
  id: 'rust-proofing',
  name: 'Rust Proofing',
  category: 'construction',
  description: 'Rust Proofing platform with comprehensive management features',
  icon: 'house',

  keywords: [
      "rust proofing",
      "rust",
      "proofing",
      "rust software",
      "rust app",
      "rust platform",
      "rust system",
      "rust management",
      "trades rust"
  ],

  synonyms: [
      "Rust Proofing platform",
      "Rust Proofing software",
      "Rust Proofing system",
      "rust solution",
      "rust service"
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
      "project-bids",
      "scheduling",
      "invoicing",
      "clients",
      "notifications"
  ],

  optionalFeatures: [
      "documents",
      "payments",
      "reviews",
      "gallery",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'trades',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a rust proofing platform",
      "Create a rust proofing app",
      "I need a rust proofing management system",
      "Build a rust proofing solution",
      "Create a rust proofing booking system"
  ],
};
