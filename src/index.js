require('dotenv').config();
const config = require('./config/config');
const createApp = require('./app');

const app = createApp();

// Get an available port and start the server
config.getAvailablePort().then(port => {
  // Freeze the config now that we have determined the port
  config.freezeConfig();
  
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Configuration port: ${config.server.port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
