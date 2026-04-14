/**
 * Wants Test Data Seeding Script
 * Populates the database with realistic test data for development and testing
 */

const { AppAtOnceService } = require('../src/modules/appatonce/appatonce.service');
const bcrypt = require('bcryptjs');

// Mock user IDs for consistent seeding
const TEST_USER_IDS = [
  'test-user-1',
  'test-user-2', 
  'test-user-3'
];

class TestDataSeeder {
  constructor() {
    this.appAtOnce = new AppAtOnceService();
  }

  async seedUsers() {
    console.log('📝 Seeding test users...');
    
    const users = [
      {
        id: 'test-user-1',
        email: 'john.doe@example.com',
        username: 'john_doe',
        full_name: 'John Doe',
        password_hash: await bcrypt.hash('password123', 10),
        bio: 'Software developer passionate about health and productivity',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        preferences: {
          theme: 'dark',
          units: 'metric',
          notifications: { email: true, push: true }
        },
        email_verified_at: new Date(),
        is_active: true
      },
      {
        id: 'test-user-2',
        email: 'jane.smith@example.com',
        username: 'jane_smith',
        full_name: 'Jane Smith',
        password_hash: await bcrypt.hash('password123', 10),
        bio: 'Fitness enthusiast and travel blogger',
        location: 'New York, NY',
        timezone: 'America/New_York',
        preferences: {
          theme: 'light',
          units: 'imperial',
          notifications: { email: true, push: false }
        },
        email_verified_at: new Date(),
        is_active: true
      },
      {
        id: 'test-user-3',
        email: 'mike.wilson@example.com',
        username: 'mike_wilson',
        full_name: 'Mike Wilson',
        password_hash: await bcrypt.hash('password123', 10),
        bio: 'Digital nomad and meditation practitioner',
        location: 'Austin, TX',
        timezone: 'America/Chicago',
        preferences: {
          theme: 'dark',
          units: 'metric',
          notifications: { email: false, push: true }
        },
        email_verified_at: new Date(),
        is_active: true
      }
    ];

    for (const user of users) {
      await this.appAtOnce.insert('users', user);
      console.log(`  ✅ Created user: ${user.full_name} (${user.email})`);
    }
  }

  async seedHealthData() {
    console.log('🏥 Seeding health profiles and data...');
    
    // Health profiles
    const healthProfiles = [
      {
        user_id: 'test-user-1',
        height_cm: 175,
        weight_kg: 75,
        blood_type: 'O+',
        allergies: ['peanuts'],
        medical_conditions: [],
        fitness_level: 'intermediate',
        fitness_goals: ['lose_weight', 'build_muscle', 'improve_cardio']
      },
      {
        user_id: 'test-user-2',
        height_cm: 165,
        weight_kg: 60,
        blood_type: 'A+',
        allergies: [],
        medical_conditions: ['asthma'],
        fitness_level: 'advanced',
        fitness_goals: ['maintain_weight', 'improve_strength', 'marathon_training']
      },
      {
        user_id: 'test-user-3',
        height_cm: 180,
        weight_kg: 80,
        blood_type: 'B-',
        allergies: ['shellfish'],
        medical_conditions: [],
        fitness_level: 'beginner',
        fitness_goals: ['lose_weight', 'improve_flexibility', 'stress_reduction']
      }
    ];

    for (const profile of healthProfiles) {
      await this.appAtOnce.insert('health_profiles', profile);
    }

    // Fitness activities (last 30 days)
    console.log('  💪 Seeding fitness activities...');
    const activityTypes = ['running', 'cycling', 'swimming', 'strength_training', 'yoga', 'walking'];
    
    for (let i = 0; i < 100; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      
      await this.appAtOnce.insert('fitness_activities', {
        user_id: userId,
        activity_type: activityType,
        activity_name: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Session`,
        duration_minutes: Math.floor(Math.random() * 120) + 15,
        distance_km: activityType === 'running' || activityType === 'cycling' ? 
          Math.random() * 20 + 2 : null,
        calories_burned: Math.floor(Math.random() * 500) + 100,
        heart_rate_avg: Math.floor(Math.random() * 60) + 120,
        heart_rate_max: Math.floor(Math.random() * 40) + 160,
        notes: 'Felt great during this session!',
        activity_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    // Health metrics (weight, blood pressure, etc.)
    console.log('  📊 Seeding health metrics...');
    const metricTypes = ['weight', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'resting_heart_rate', 'body_fat_percentage'];
    
    for (let i = 0; i < 60; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      const daysAgo = Math.floor(Math.random() * 90);
      
      let value;
      let unit;
      
      switch (metricType) {
        case 'weight':
          value = Math.random() * 30 + 55;
          unit = 'kg';
          break;
        case 'blood_pressure_systolic':
          value = Math.random() * 40 + 100;
          unit = 'mmHg';
          break;
        case 'blood_pressure_diastolic':
          value = Math.random() * 20 + 60;
          unit = 'mmHg';
          break;
        case 'resting_heart_rate':
          value = Math.random() * 40 + 50;
          unit = 'bpm';
          break;
        case 'body_fat_percentage':
          value = Math.random() * 15 + 10;
          unit = '%';
          break;
      }
      
      await this.appAtOnce.insert('health_metrics', {
        user_id: userId,
        metric_type: metricType,
        value: parseFloat(value.toFixed(2)),
        unit,
        recorded_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }
  }

  async seedFinancialData() {
    console.log('💰 Seeding financial accounts and expenses...');
    
    // Financial accounts
    const accounts = [
      {
        user_id: 'test-user-1',
        account_name: 'Chase Checking',
        account_type: 'checking',
        current_balance: 5250.00,
        institution: 'Chase Bank',
        account_number_last4: '1234'
      },
      {
        user_id: 'test-user-1',
        account_name: 'Chase Savings',
        account_type: 'savings',
        current_balance: 12000.00,
        institution: 'Chase Bank',
        account_number_last4: '5678'
      },
      {
        user_id: 'test-user-2',
        account_name: 'Wells Fargo Checking',
        account_type: 'checking',
        current_balance: 3200.00,
        institution: 'Wells Fargo',
        account_number_last4: '9876'
      }
    ];

    const accountIds = [];
    for (const account of accounts) {
      const result = await this.appAtOnce.insert('financial_accounts', account);
      accountIds.push(result.id);
    }

    // Expenses (last 90 days)
    console.log('  💳 Seeding expenses...');
    const categories = ['food', 'transportation', 'entertainment', 'utilities', 'healthcare', 'shopping', 'travel'];
    const merchants = ['Amazon', 'Starbucks', 'Uber', 'Netflix', 'Target', 'Shell', 'Whole Foods', 'CVS'];
    const transactionTypes = ['expense', 'income'];
    
    for (let i = 0; i < 200; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const transactionType = Math.random() > 0.8 ? 'income' : 'expense';
      const daysAgo = Math.floor(Math.random() * 90);
      
      await this.appAtOnce.insert('expenses', {
        user_id: userId,
        account_id: accountIds[Math.floor(Math.random() * accountIds.length)],
        category,
        amount: parseFloat((Math.random() * 200 + 10).toFixed(2)),
        description: `${transactionType === 'income' ? 'Payment from' : 'Purchase at'} ${merchant}`,
        merchant,
        transaction_type: transactionType,
        payment_method: Math.random() > 0.5 ? 'credit_card' : 'debit_card',
        tags: [category, merchant.toLowerCase()],
        transaction_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    // Budgets
    console.log('  📋 Seeding budgets...');
    const budgets = [
      {
        user_id: 'test-user-1',
        name: 'Monthly Food Budget',
        category: 'food',
        amount: 800.00,
        period: 'monthly',
        start_date: new Date('2024-01-01'),
        alert_threshold: 0.8
      },
      {
        user_id: 'test-user-1',
        name: 'Transportation Budget',
        category: 'transportation',
        amount: 400.00,
        period: 'monthly',
        start_date: new Date('2024-01-01'),
        alert_threshold: 0.9
      }
    ];

    for (const budget of budgets) {
      await this.appAtOnce.insert('budgets', budget);
    }
  }

  async seedMeditationData() {
    console.log('🧘 Seeding meditation and mental health data...');
    
    // Meditation sessions (last 60 days)
    const sessionTypes = ['mindfulness', 'breathing', 'body_scan', 'loving_kindness', 'concentration'];
    
    for (let i = 0; i < 80; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
      const daysAgo = Math.floor(Math.random() * 60);
      
      await this.appAtOnce.insert('meditation_sessions', {
        user_id: userId,
        session_type: sessionType,
        duration_minutes: [5, 10, 15, 20, 30][Math.floor(Math.random() * 5)],
        mood_before: Math.floor(Math.random() * 5) + 1,
        mood_after: Math.floor(Math.random() * 3) + 3, // Generally better mood after
        notes: 'Great session, felt very relaxed afterwards',
        completed_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    // Mental health logs (daily entries for last 30 days)
    console.log('  💭 Seeding mental health logs...');
    const emotions = ['happy', 'sad', 'anxious', 'calm', 'excited', 'frustrated', 'content', 'stressed'];
    const triggers = ['work', 'family', 'health', 'money', 'relationships', 'weather'];
    const copingStrategies = ['meditation', 'exercise', 'talking_to_friend', 'journaling', 'breathing_exercises'];
    
    for (let i = 0; i < 90; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      
      await this.appAtOnce.insert('mental_health_logs', {
        user_id: userId,
        mood_score: Math.floor(Math.random() * 5) + 1,
        anxiety_level: Math.floor(Math.random() * 5) + 1,
        stress_level: Math.floor(Math.random() * 5) + 1,
        energy_level: Math.floor(Math.random() * 5) + 1,
        sleep_quality: Math.floor(Math.random() * 5) + 1,
        sleep_hours: Math.random() * 4 + 6, // 6-10 hours
        journal_entry: 'Today was a good day overall. Had some challenges at work but managed to handle them well.',
        gratitude_list: ['family', 'health', 'sunny weather'],
        emotions: emotions.slice(0, Math.floor(Math.random() * 3) + 1),
        triggers: Math.random() > 0.5 ? [triggers[Math.floor(Math.random() * triggers.length)]] : [],
        coping_strategies: copingStrategies.slice(0, Math.floor(Math.random() * 2) + 1),
        logged_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }
  }

  async seedTravelData() {
    console.log('✈️ Seeding travel plans...');
    
    const destinations = [
      'Paris, France',
      'Tokyo, Japan',
      'New York, USA',
      'Barcelona, Spain',
      'Bangkok, Thailand',
      'London, UK',
      'Sydney, Australia',
      'Rome, Italy'
    ];
    
    const tripTypes = ['leisure', 'business', 'adventure', 'cultural', 'romantic'];
    const statuses = ['planning', 'booked', 'in_progress', 'completed', 'cancelled'];
    
    for (let i = 0; i < 15; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const tripType = tripTypes[Math.floor(Math.random() * tripTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate random dates (some past, some future)
      const dayOffset = Math.floor(Math.random() * 365) - 180; // -180 to +185 days
      const startDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 14) + 2) * 24 * 60 * 60 * 1000);
      
      await this.appAtOnce.insert('travel_plans', {
        user_id: userId,
        trip_name: `${tripType.charAt(0).toUpperCase() + tripType.slice(1)} Trip to ${destination}`,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: Math.floor(Math.random() * 5000) + 1000,
        travelers_count: Math.floor(Math.random() * 4) + 1,
        trip_type: tripType,
        status,
        itinerary: [
          {
            day: 1,
            activities: ['Arrival and hotel check-in', 'Local restaurant dinner'],
            notes: 'Take it easy on first day'
          },
          {
            day: 2,
            activities: ['City tour', 'Museum visit', 'Shopping'],
            notes: 'Full day of sightseeing'
          }
        ],
        bookings: [
          {
            type: 'hotel',
            name: 'Grand Hotel',
            confirmation: 'ABC123',
            cost: 150
          },
          {
            type: 'flight',
            name: 'Delta Airlines',
            confirmation: 'DEF456',
            cost: 800
          }
        ],
        packing_list: ['clothes', 'passport', 'camera', 'medications'],
        notes: 'Looking forward to this trip!'
      });
    }
  }

  async seedNotifications() {
    console.log('🔔 Seeding notifications...');
    
    const notificationTypes = ['reminder', 'achievement', 'health_alert', 'budget_alert', 'travel_update'];
    const priorities = ['low', 'normal', 'high', 'urgent'];
    
    for (let i = 0; i < 30; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const daysAgo = Math.floor(Math.random() * 7);
      
      let title, message;
      switch (type) {
        case 'reminder':
          title = 'Meditation Reminder';
          message = 'Time for your daily meditation session';
          break;
        case 'achievement':
          title = 'Fitness Goal Achieved!';
          message = 'Congratulations! You hit your weekly exercise goal';
          break;
        case 'health_alert':
          title = 'Health Check Reminder';
          message = 'Remember to log your daily health metrics';
          break;
        case 'budget_alert':
          title = 'Budget Alert';
          message = 'You have used 80% of your food budget this month';
          break;
        case 'travel_update':
          title = 'Travel Plan Update';
          message = 'Your flight confirmation has been updated';
          break;
      }
      
      await this.appAtOnce.insert('notifications', {
        user_id: userId,
        type,
        title,
        message,
        priority,
        is_read: Math.random() > 0.3,
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    // Reminders
    console.log('  ⏰ Seeding reminders...');
    const reminderTypes = ['health', 'fitness', 'meditation', 'budget', 'travel'];
    
    for (let i = 0; i < 20; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const type = reminderTypes[Math.floor(Math.random() * reminderTypes.length)];
      const hoursFromNow = Math.floor(Math.random() * 72) + 1; // 1-72 hours from now
      
      await this.appAtOnce.insert('reminders', {
        user_id: userId,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Reminder`,
        description: `Don't forget to check your ${type} goals`,
        remind_at: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000),
        frequency: Math.random() > 0.5 ? 'daily' : null,
        is_active: true
      });
    }
  }

  async seedAIData() {
    console.log('🤖 Seeding AI generation data...');
    
    const serviceTypes = ['text_generation', 'image_generation', 'code_generation', 'chat', 'summarization'];
    const statuses = ['completed', 'failed', 'pending', 'processing'];
    
    for (let i = 0; i < 25; i++) {
      const userId = TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)];
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      
      let prompt, result;
      switch (serviceType) {
        case 'text_generation':
          prompt = 'Write a blog post about healthy eating habits';
          result = status === 'completed' ? { text: 'Healthy eating is essential for...' } : null;
          break;
        case 'image_generation':
          prompt = 'A beautiful sunset over mountains';
          result = status === 'completed' ? { image_url: 'https://example.com/generated-image.jpg' } : null;
          break;
        case 'code_generation':
          prompt = 'Create a React component for a todo list';
          result = status === 'completed' ? { code: 'function TodoList() { ... }' } : null;
          break;
        case 'chat':
          prompt = 'How can I improve my fitness routine?';
          result = status === 'completed' ? { response: 'Here are some tips to improve your fitness...' } : null;
          break;
        case 'summarization':
          prompt = 'Summarize this article about productivity';
          result = status === 'completed' ? { summary: 'The article discusses 5 key productivity tips...' } : null;
          break;
      }
      
      await this.appAtOnce.insert('ai_generations', {
        user_id: userId,
        service_type: serviceType,
        prompt,
        result,
        tokens_used: status === 'completed' ? Math.floor(Math.random() * 1000) + 100 : null,
        processing_time_ms: status === 'completed' ? Math.floor(Math.random() * 5000) + 500 : null,
        status,
        error_message: status === 'failed' ? 'Service temporarily unavailable' : null,
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        completed_at: status === 'completed' ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + 60000) : null
      });
    }
  }

  async seedAll() {
    try {
      console.log('🌱 Starting Wants test data seeding...\n');
      
      await this.seedUsers();
      await this.seedHealthData();
      await this.seedFinancialData();
      await this.seedMeditationData();
      await this.seedTravelData();
      await this.seedNotifications();
      await this.seedAIData();
      
      console.log('\n✅ Test data seeding completed successfully!');
      console.log('📊 Summary:');
      console.log('  - 3 test users created');
      console.log('  - Health, fitness, and nutrition data');
      console.log('  - Financial accounts, expenses, and budgets');
      console.log('  - Meditation sessions and mental health logs');
      console.log('  - Travel plans and itineraries');
      console.log('  - Notifications and reminders');
      console.log('  - AI generation history');
      console.log('\n🔑 Test Login Credentials:');
      console.log('  Email: john.doe@example.com | Password: password123');
      console.log('  Email: jane.smith@example.com | Password: password123');
      console.log('  Email: mike.wilson@example.com | Password: password123');
      
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      throw error;
    }
  }

  async clearAll() {
    console.log('🗑️ Clearing all test data...');
    
    const tables = [
      'user_activity',
      'ai_generations',
      'reminders',
      'notifications',
      'travel_plans',
      'mental_health_logs',
      'meditation_sessions',
      'budgets',
      'expenses',
      'financial_accounts',
      'nutrition_logs',
      'health_metrics',
      'fitness_activities',
      'health_profiles',
      'users'
    ];

    for (const table of tables) {
      try {
        await this.appAtOnce.delete(table, { user_id: { $in: TEST_USER_IDS } });
        console.log(`  ✅ Cleared ${table}`);
      } catch (error) {
        console.log(`  ⚠️ Could not clear ${table}: ${error.message}`);
      }
    }

    console.log('✅ Test data clearing completed');
  }
}

// Command line interface
async function main() {
  const seeder = new TestDataSeeder();
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      await seeder.seedAll();
      break;
    case 'clear':
      await seeder.clearAll();
      break;
    case 'reset':
      await seeder.clearAll();
      console.log('');
      await seeder.seedAll();
      break;
    default:
      console.log('Wants Test Data Seeder');
      console.log('');
      console.log('Usage: node seed-test-data.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  seed   - Add test data to database');
      console.log('  clear  - Remove all test data');
      console.log('  reset  - Clear and reseed all test data');
      console.log('');
      process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { TestDataSeeder };