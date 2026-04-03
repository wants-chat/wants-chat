const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let authToken = '';
let sessionId = '';

async function login() {
  try {
    console.log(`${colors.blue}🔐 Logging in...${colors.reset}`);
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    authToken = response.data.access_token;
    console.log(`${colors.green}✅ Login successful${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Login failed: ${error.response?.data?.message || error.message}${colors.reset}`);
    console.log(`${colors.yellow}Please ensure you have a test user created with email: ${TEST_USER.email}${colors.reset}`);
    return false;
  }
}

async function testAPI(name, method, endpoint, data = null) {
  console.log(`\n${colors.blue}Testing: ${name}${colors.reset}`);
  
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`${colors.green}✅ Success${colors.reset}`);
    console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    
    return response.data;
  } catch (error) {
    console.log(`${colors.red}❌ Failed: ${error.response?.data?.message || error.message}${colors.reset}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
    return null;
  }
}

async function runTests() {
  console.log(`${colors.yellow}🧘 Starting Meditation API Tests${colors.reset}`);
  console.log('================================\n');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log(`${colors.red}Cannot proceed without authentication${colors.reset}`);
    return;
  }

  // Admin APIs
  console.log(`\n${colors.yellow}📋 ADMIN APIS${colors.reset}`);
  
  // 1. Seed categories
  await testAPI(
    '1. Seed Categories',
    'POST',
    '/admin/meditation/seed-categories'
  );

  // 2. Get categories
  await testAPI(
    '2. Get All Categories',
    'GET',
    '/admin/meditation/categories'
  );

  // 3. Create new category
  await testAPI(
    '3. Create Category',
    'POST',
    '/admin/meditation/categories',
    {
      slug: 'test-meditation',
      name: 'Test Meditation',
      description: 'Testing category creation',
      icon: '🧪',
      color: 'purple',
      display_order: 99
    }
  );

  // 4. Create program
  await testAPI(
    '4. Create Program',
    'POST',
    '/admin/meditation/programs',
    {
      name: '7-Day Mindfulness Journey',
      description: 'A week of mindfulness practice',
      instructor: 'Dr. Test',
      difficulty: 'beginner',
      duration_days: 7,
      sessions_count: 7,
      category: 'mindfulness',
      tags: ['beginner', 'weekly', 'mindfulness']
    }
  );

  // 5. Create ambient sound
  await testAPI(
    '5. Create Ambient Sound',
    'POST',
    '/admin/meditation/ambient-sounds',
    {
      name: 'Rain Sounds',
      file_url: 'https://example.com/sounds/rain.mp3',
      icon: '🌧️',
      category: 'nature',
      default_volume: 0.5
    }
  );

  // User APIs
  console.log(`\n${colors.yellow}👤 USER APIS${colors.reset}`);

  // 6. Get categories with details
  await testAPI(
    '6. Get Categories (Detailed)',
    'GET',
    '/meditation/categories/detailed'
  );

  // 7. Get featured meditations
  await testAPI(
    '7. Get Featured Meditations',
    'GET',
    '/meditation/featured'
  );

  // 8. Start meditation session
  const session = await testAPI(
    '8. Start Meditation Session',
    'POST',
    '/meditation/sessions',
    {
      session_type: 'stress-relief',
      duration_minutes: 15,
      mood_before: 5,
      notes: 'Feeling stressed from work'
    }
  );

  if (session && session.id) {
    sessionId = session.id;
  }

  // 9. Get session history
  await testAPI(
    '9. Get Session History',
    'GET',
    '/meditation/sessions?limit=5'
  );

  // 10. Complete session
  if (sessionId) {
    await testAPI(
      '10. Complete Meditation Session',
      'PUT',
      `/meditation/sessions/${sessionId}`,
      {
        mood_after: 8,
        actual_duration_minutes: 18,
        completion_rating: 5,
        distractions: ['phone notification'],
        insights: 'Felt much more relaxed after the session'
      }
    );
  }

  // 11. Get enhanced stats
  await testAPI(
    '11. Get Enhanced Stats',
    'GET',
    '/meditation/stats/enhanced?timeframe=30d'
  );

  // 12. Get meditation techniques
  await testAPI(
    '12. Get Meditation Techniques',
    'GET',
    '/meditation/techniques'
  );

  // 13. Get streak info
  await testAPI(
    '13. Get Current Streak',
    'GET',
    '/meditation/streak'
  );

  // 14. Set meditation goal
  await testAPI(
    '14. Set Meditation Goal',
    'POST',
    '/meditation/goals',
    {
      goal_type: 'daily_sessions',
      target_value: 1,
      target_unit: 'sessions',
      time_period: 'daily',
      description: 'Meditate at least once per day'
    }
  );

  // 15. Get goals
  await testAPI(
    '15. Get Meditation Goals',
    'GET',
    '/meditation/goals'
  );

  // 16. Get programs
  await testAPI(
    '16. Get Meditation Programs',
    'GET',
    '/meditation/programs'
  );

  // 17. Get ambient sounds
  await testAPI(
    '17. Get Ambient Sounds',
    'GET',
    '/meditation/ambient-sounds'
  );

  // 18. Get audio library
  await testAPI(
    '18. Get Audio Library',
    'GET',
    '/meditation/audio'
  );

  // 19. Get session types
  await testAPI(
    '19. Get Session Types',
    'GET',
    '/meditation/session-types'
  );

  // 20. Get environments
  await testAPI(
    '20. Get Meditation Environments',
    'GET',
    '/meditation/environments'
  );

  console.log(`\n${colors.green}================================`);
  console.log(`✅ All tests completed!${colors.reset}\n`);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
});