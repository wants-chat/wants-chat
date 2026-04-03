#!/usr/bin/env node

/**
 * Basic Text Generation Features
 * 
 * Demonstrates:
 * - Text generation
 * - Chat conversations (single and multi-turn)
 * 
 * Run: node ai/01-text-generation.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { AppAtOnceClient } = require('../../dist');

const API_KEY = process.env.APPATONCE_API_KEY;
if (!API_KEY) {
  console.error('❌ Please set APPATONCE_API_KEY in your .env file');
  process.exit(1);
}

const client = new AppAtOnceClient(API_KEY);

function printResult(title, result) {
  console.log(`\n✨ ${title}`);
  console.log('─'.repeat(50));
  if (typeof result === 'object') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
}

async function main() {
  console.log('📝 BASIC TEXT GENERATION FEATURES\n');

  try {
    // 1. Text Generation
    console.log('1. Simple text generation...');
    const generated = await client.ai.generateText('Write a motivational quote about learning');
    printResult('Generated Text', generated.result);

    // 2. Chat Conversation (Single Turn)
    console.log('\n2. Single-turn chat conversation...');
    const chatResponse = await client.ai.chat([
      { role: 'system', content: 'You are a helpful coding assistant.' },
      { role: 'user', content: 'What is the difference between let and const in JavaScript?' }
    ]);
    printResult('Chat Response', chatResponse.result);

    // 3. Multi-turn Conversation
    console.log('\n3. Multi-turn conversation...');
    const conversation = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is Node.js?' },
      { role: 'assistant', content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine that allows you to run JavaScript on the server side.' },
      { role: 'user', content: 'What are its main use cases?' }
    ];
    const followUp = await client.ai.chat(conversation);
    printResult('Follow-up Response', followUp.result);

    // 4. Streaming Example (if supported)
    console.log('\n4. Text generation with options...');
    const customGenerated = await client.ai.generateText(
      'Write a haiku about programming',
      {
        max_tokens: 50,
        temperature: 0.7
      }
    );
    printResult('Haiku', customGenerated.result);

    console.log('\n✅ Text generation examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();