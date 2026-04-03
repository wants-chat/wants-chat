const { AppAtOnceClient } = require('@appatonce/node-sdk');
const path = require('path');
const fs = require('fs');

// Load environment variables
if (fs.existsSync(path.join(__dirname, '..', '.env.local'))) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} else if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

// Sample food data based on the API specification
const foodData = [
  // Fruits
  {
    name: 'Banana',
    brand: null,
    category: 'fruits',
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 22.8,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.6,
    sugar_per_100g: 12.2,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Apple',
    brand: null,
    category: 'fruits',
    calories_per_100g: 52,
    protein_per_100g: 0.3,
    carbs_per_100g: 13.8,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.4,
    sugar_per_100g: 10.4,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Orange',
    brand: null,
    category: 'fruits',
    calories_per_100g: 47,
    protein_per_100g: 0.9,
    carbs_per_100g: 11.8,
    fat_per_100g: 0.1,
    fiber_per_100g: 2.4,
    sugar_per_100g: 9.4,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Strawberries',
    brand: null,
    category: 'fruits',
    calories_per_100g: 32,
    protein_per_100g: 0.7,
    carbs_per_100g: 7.7,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.0,
    sugar_per_100g: 4.9,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Avocado',
    brand: null,
    category: 'fruits',
    calories_per_100g: 160,
    protein_per_100g: 2.0,
    carbs_per_100g: 8.5,
    fat_per_100g: 14.7,
    fiber_per_100g: 6.7,
    sugar_per_100g: 0.7,
    is_custom: false,
    created_by: null,
  },

  // Vegetables
  {
    name: 'Broccoli',
    brand: null,
    category: 'vegetables',
    calories_per_100g: 34,
    protein_per_100g: 2.8,
    carbs_per_100g: 7.0,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.6,
    sugar_per_100g: 1.5,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Spinach',
    brand: null,
    category: 'vegetables',
    calories_per_100g: 23,
    protein_per_100g: 2.9,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.2,
    sugar_per_100g: 0.4,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Carrots',
    brand: null,
    category: 'vegetables',
    calories_per_100g: 41,
    protein_per_100g: 0.9,
    carbs_per_100g: 9.6,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.8,
    sugar_per_100g: 4.7,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Bell Peppers',
    brand: null,
    category: 'vegetables',
    calories_per_100g: 31,
    protein_per_100g: 1.0,
    carbs_per_100g: 7.3,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.5,
    sugar_per_100g: 4.2,
    is_custom: false,
    created_by: null,
  },

  // Proteins
  {
    name: 'Chicken Breast',
    brand: null,
    category: 'proteins',
    calories_per_100g: 165,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0.0,
    sugar_per_100g: 0.0,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Salmon',
    brand: null,
    category: 'proteins',
    calories_per_100g: 208,
    protein_per_100g: 25.4,
    carbs_per_100g: 0.0,
    fat_per_100g: 12.4,
    fiber_per_100g: 0.0,
    sugar_per_100g: 0.0,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Eggs',
    brand: null,
    category: 'proteins',
    calories_per_100g: 155,
    protein_per_100g: 13.0,
    carbs_per_100g: 1.1,
    fat_per_100g: 11.0,
    fiber_per_100g: 0.0,
    sugar_per_100g: 1.1,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Tofu',
    brand: null,
    category: 'proteins',
    calories_per_100g: 76,
    protein_per_100g: 8.1,
    carbs_per_100g: 1.9,
    fat_per_100g: 4.8,
    fiber_per_100g: 0.3,
    sugar_per_100g: 0.6,
    is_custom: false,
    created_by: null,
  },

  // Dairy
  {
    name: 'Greek Yogurt',
    brand: 'Fage',
    category: 'dairy',
    calories_per_100g: 130,
    protein_per_100g: 20.0,
    carbs_per_100g: 9.0,
    fat_per_100g: 0.0,
    fiber_per_100g: 0.0,
    sugar_per_100g: 7.0,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Whole Milk',
    brand: null,
    category: 'dairy',
    calories_per_100g: 61,
    protein_per_100g: 3.2,
    carbs_per_100g: 4.8,
    fat_per_100g: 3.3,
    fiber_per_100g: 0.0,
    sugar_per_100g: 5.1,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Cheddar Cheese',
    brand: null,
    category: 'dairy',
    calories_per_100g: 403,
    protein_per_100g: 25.0,
    carbs_per_100g: 1.3,
    fat_per_100g: 33.0,
    fiber_per_100g: 0.0,
    sugar_per_100g: 0.5,
    is_custom: false,
    created_by: null,
  },

  // Grains
  {
    name: 'Brown Rice',
    brand: null,
    category: 'grains',
    calories_per_100g: 111,
    protein_per_100g: 2.6,
    carbs_per_100g: 23.0,
    fat_per_100g: 0.9,
    fiber_per_100g: 1.8,
    sugar_per_100g: 0.4,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Quinoa',
    brand: null,
    category: 'grains',
    calories_per_100g: 120,
    protein_per_100g: 4.4,
    carbs_per_100g: 22.0,
    fat_per_100g: 1.9,
    fiber_per_100g: 2.8,
    sugar_per_100g: 0.9,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Oatmeal',
    brand: null,
    category: 'grains',
    calories_per_100g: 68,
    protein_per_100g: 2.4,
    carbs_per_100g: 12.0,
    fat_per_100g: 1.4,
    fiber_per_100g: 1.7,
    sugar_per_100g: 0.3,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Whole Wheat Bread',
    brand: null,
    category: 'grains',
    calories_per_100g: 247,
    protein_per_100g: 13.0,
    carbs_per_100g: 41.0,
    fat_per_100g: 4.2,
    fiber_per_100g: 6.0,
    sugar_per_100g: 5.7,
    is_custom: false,
    created_by: null,
  },

  // Beverages
  {
    name: 'Water',
    brand: null,
    category: 'beverages',
    calories_per_100g: 0,
    protein_per_100g: 0.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 0.0,
    fiber_per_100g: 0.0,
    sugar_per_100g: 0.0,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Green Tea',
    brand: null,
    category: 'beverages',
    calories_per_100g: 1,
    protein_per_100g: 0.2,
    carbs_per_100g: 0.0,
    fat_per_100g: 0.0,
    fiber_per_100g: 0.0,
    sugar_per_100g: 0.0,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Orange Juice',
    brand: null,
    category: 'beverages',
    calories_per_100g: 45,
    protein_per_100g: 0.7,
    carbs_per_100g: 10.4,
    fat_per_100g: 0.2,
    fiber_per_100g: 0.2,
    sugar_per_100g: 8.1,
    is_custom: false,
    created_by: null,
  },

  // Snacks
  {
    name: 'Almonds',
    brand: null,
    category: 'snacks',
    calories_per_100g: 579,
    protein_per_100g: 21.2,
    carbs_per_100g: 21.6,
    fat_per_100g: 49.9,
    fiber_per_100g: 12.5,
    sugar_per_100g: 4.4,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Dark Chocolate',
    brand: null,
    category: 'snacks',
    calories_per_100g: 546,
    protein_per_100g: 7.9,
    carbs_per_100g: 45.9,
    fat_per_100g: 31.3,
    fiber_per_100g: 10.9,
    sugar_per_100g: 24.0,
    is_custom: false,
    created_by: null,
  },
  {
    name: 'Greek Yogurt with Berries',
    brand: null,
    category: 'snacks',
    calories_per_100g: 89,
    protein_per_100g: 9.0,
    carbs_per_100g: 8.5,
    fat_per_100g: 3.0,
    fiber_per_100g: 1.2,
    sugar_per_100g: 7.5,
    is_custom: false,
    created_by: null,
  },
];

async function seedFoodData() {
  try {
    const apiKey = process.env.APPATONCE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Error: APPATONCE_API_KEY environment variable is required');
      process.exit(1);
    }

    console.log('Initializing AppAtOnce client...');
    const client = new AppAtOnceClient(apiKey);

    console.log('Starting food data seeding...');

    for (const food of foodData) {
      try {
        // Check if food already exists
        const existingFood = await client.table('calories_foods')
          .select('*')
          .where('name', '=', food.name)
          .where('is_custom', '=', false);

        if (existingFood.data && existingFood.data.length > 0) {
          console.log(`Food "${food.name}" already exists, skipping...`);
          continue;
        }

        // Insert new food
        const result = await client.table('calories_foods')
          .insert(food);

        if (result && result.id) {
          console.log(`✓ Added food: ${food.name} (${food.category})`);
        } else {
          console.log(`✗ Failed to add food "${food.name}"`);
        }
      } catch (error) {
        console.error(`✗ Failed to add food "${food.name}":`, error.message);
      }
    }

    console.log('Food data seeding completed!');
    console.log(`Total foods processed: ${foodData.length}`);

    // Get final count
    const totalFoods = await client.table('calories_foods')
      .select('*')
      .where('is_custom', '=', false);

    console.log(`Total foods in database: ${totalFoods.data ? totalFoods.data.length : 0}`);

  } catch (error) {
    console.error('Error seeding food data:', error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedFoodData()
    .then(() => {
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedFoodData, foodData };