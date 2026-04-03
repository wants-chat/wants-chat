// Test script to verify expense creation works
const fetch = require('node-fetch');

async function testExpenseCreation() {
  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with your test user email
        password: 'password123' // Replace with your test user password
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken || loginData.access_token;
    
    console.log('Login successful, token received');

    // Now create an expense
    const expenseData = {
      amount: 25.99,
      currency: 'USD',
      description: 'Test expense from script',
      category: 'food',
      transaction_type: 'expense',
      transaction_date: new Date().toISOString(),
      payment_method: 'credit_card',
      is_recurring: false,
      tags: ['test'],
      merchant: 'Test Merchant'
    };

    console.log('Creating expense with data:', expenseData);

    const expenseResponse = await fetch('http://localhost:3001/api/v1/finance/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(expenseData)
    });

    if (!expenseResponse.ok) {
      console.error('Expense creation failed:', await expenseResponse.text());
      return;
    }

    const expense = await expenseResponse.json();
    console.log('✅ Expense created successfully:', expense);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
console.log('Testing expense creation endpoint...');
testExpenseCreation();