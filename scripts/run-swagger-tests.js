const { execSync } = require('child_process');
const redis = require('../src/config/redis');

async function runTests() {
  try {
    // Run the tests
    execSync('NODE_ENV=production npx jest tests/swagger.test.js', { stdio: 'inherit' });
  } finally {
    // Ensure Redis connection is closed
    console.log('Cleaning up Redis connections...');
    await redis.closeAllClients();
    // Force exit after cleanup
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});

