const fs = require('fs');
const path = require('path');

// Get all route files
const routeFiles = fs.readdirSync(__dirname)
  .filter(file => 
    file !== 'index.js' && 
    file.endsWith('.js')
  );

// Combine all routes
const routes = routeFiles.reduce((acc, file) => {
  const routePath = path.join(__dirname, file);
  const route = require(routePath);
  return { ...acc, ...route };
}, {});

module.exports = routes;
