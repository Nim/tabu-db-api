const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');


// Import and mount all routes from /routes/api directory
const routesPath = path.join(__dirname, '..', 'api');
const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

routeFiles.forEach(file => {
  const moduleName = file.replace('.js', '');
  const routeModule = require(path.join(routesPath, file));
  router.use(`/${moduleName}`, routeModule);
});

console.log('Production routes enabled - API routes mounted');

module.exports = router;
