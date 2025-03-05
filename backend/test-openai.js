// Test script for OpenAI API key
require('dotenv').config({ path: './.ENV' });
const { OpenAI } = require('openai');

// Log partial API key for debugging (safely)
const apiKey = process.env.VITE_OPENAI_API_KEY;
console.log(`Using API key starting with: ${apiKey.substring(0, 12)}... (ending with ...${apiKey.slice(-4)})`);

// Create OpenAI instance with proper configuration for project API keys
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  // For project-scoped API keys (sk-proj-...)
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'OpenAI-Beta': 'project'
  }
});

async function testOpenAI() {
  try {
    console.log("Testing OpenAI connection...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello!" }
      ],
    });
    
    console.log("✅ SUCCESS! API key is working correctly");
    console.log("Response:", response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error("❌ ERROR testing OpenAI API:");
    console.error(error.message);
    if (error.response) {
      console.error("Response details:", error.response.data);
    }
    return false;
  }
}

testOpenAI(); 