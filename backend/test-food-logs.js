const axios = require('axios');

const BASE_URL = 'http://192.168.0.115:3001/api/v1/calories';

// You'll need to replace these with actual values
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
const TEST_USER_ID = 'YOUR_USER_ID_HERE'; // Replace with actual user ID

const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testFoodLogsAPI() {
  console.log('🧪 Testing Food Logs API...\n');

  try {
    // Test 1: Get today's food logs
    console.log('1️⃣ Testing GET /food-logs/today');
    const todayResponse = await axios.get(`${BASE_URL}/food-logs/today`, { headers });
    console.log('✅ Today\'s food logs response:');
    console.log(JSON.stringify(todayResponse.data, null, 2));
    console.log(`📊 Total calories: ${todayResponse.data.summary.total_calories}`);
    console.log(`📊 Total logs: ${Object.values(todayResponse.data.meals).reduce((sum, meal) => sum + meal.logs.length, 0)}\n`);

    // Test 2: Get food logs by specific date (today)
    const today = new Date().toISOString().split('T')[0];
    console.log(`2️⃣ Testing GET /food-logs/date/${today}`);
    const dateResponse = await axios.get(`${BASE_URL}/food-logs/date/${today}`, { headers });
    console.log('✅ Date-specific food logs response:');
    console.log(JSON.stringify(dateResponse.data, null, 2));
    console.log(`📊 Total calories: ${dateResponse.data.summary.total_calories}`);
    console.log(`📊 Total logs: ${Object.values(dateResponse.data.meals).reduce((sum, meal) => sum + meal.logs.length, 0)}\n`);

    // Test 3: Debug endpoint to see raw data
    console.log(`3️⃣ Testing GET /debug/food-logs/${TEST_USER_ID}`);
    try {
      const debugResponse = await axios.get(`${BASE_URL}/debug/food-logs/${TEST_USER_ID}`, { headers });
      console.log('✅ Debug response:');
      console.log(JSON.stringify(debugResponse.data, null, 2));
    } catch (debugError) {
      console.log('❌ Debug endpoint failed:', debugError.response?.data || debugError.message);
    }

    // Test 4: Check each meal type
    console.log('\n4️⃣ Testing individual meal types:');
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    for (const mealType of mealTypes) {
      try {
        const mealResponse = await axios.get(`${BASE_URL}/food-logs/meal-type/${mealType}?date=${today}`, { headers });
        console.log(`✅ ${mealType.toUpperCase()}: ${mealResponse.data.logs.length} items, ${mealResponse.data.summary.total_calories} calories`);
      } catch (error) {
        console.log(`❌ ${mealType.toUpperCase()} failed:`, error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.log('❌ API Test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication failed! Please update the TEST_TOKEN in the script.');
      console.log('You can get the token from:');
      console.log('1. Browser dev tools (Network tab -> Authorization header)');
      console.log('2. Login response from your app');
    }
  }
}

async function logTestFood() {
  console.log('\n🍎 Adding test food log...\n');
  
  try {
    // First, search for a food to log
    const searchResponse = await axios.get(`${BASE_URL}/foods/search?q=apple`, { headers });
    
    if (searchResponse.data.foods.length === 0) {
      console.log('❌ No foods found to test with');
      return;
    }

    const testFood = searchResponse.data.foods[0];
    console.log(`📝 Found test food: ${testFood.name} (${testFood.id})`);

    // Log the food
    const logData = {
      food_id: testFood.id,
      quantity: 150,
      unit: 'g',
      meal_type: 'snacks',
      consumed_at: new Date().toISOString()
    };

    const logResponse = await axios.post(`${BASE_URL}/food-logs`, logData, { headers });
    console.log('✅ Food logged successfully:');
    console.log(JSON.stringify(logResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Failed to log test food:');
    console.log('Error:', error.response?.data || error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Food Logs API Tests\n');
  console.log('📋 Configuration:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Token: ${TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE' ? '❌ NOT SET' : '✅ SET'}`);
  console.log(`   User ID: ${TEST_USER_ID === 'YOUR_USER_ID_HERE' ? '❌ NOT SET' : '✅ SET'}\n`);
  
  if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  Please update TEST_TOKEN and TEST_USER_ID in the script before running.');
    return;
  }
  
  await testFoodLogsAPI();
  
  // Uncomment this if you want to add a test food log
  // await logTestFood();
}

runTests().catch(console.error);