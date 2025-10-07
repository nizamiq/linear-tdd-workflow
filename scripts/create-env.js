#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createEnvFile() {
  console.log('🔧 Setting up environment configuration...\n');

  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Keeping existing .env file.');
      rl.close();
      return;
    }
  }

  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found!');
    rl.close();
    process.exit(1);
  }

  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const lines = envExample.split('\n');
  const envContent = [];

  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') {
      envContent.push(line);
      continue;
    }

    const [key, defaultValue] = line.split('=');
    if (key) {
      const isSecret = key.includes('KEY') || key.includes('TOKEN');
      const prompt = isSecret ? `Enter ${key} (sensitive): ` : `Enter ${key} [${defaultValue}]: `;

      const value = await question(prompt);
      const finalValue = value.trim() || defaultValue;
      envContent.push(`${key}=${finalValue}`);
    }
  }

  fs.writeFileSync(envPath, envContent.join('\n'));
  console.log('\n✅ .env file created successfully!');
  console.log('📝 You can edit .env file directly to update configuration.');

  rl.close();
}

createEnvFile().catch(console.error);
