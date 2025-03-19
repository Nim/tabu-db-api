// Route Debugger - Utility to print all registered Express routes
const createApp = require('../src/app'); // Import the app creation function
const app = createApp(); // Call the function to get the Express application instance
const listEndpoints = require('express-list-endpoints');

try {
  console.log('=== REGISTERED ROUTES ===');
  const routes = listEndpoints(app);
  
  // Group routes by base path for better readability
  const groupedRoutes = routes.reduce((acc, route) => {
    const basePath = route.path.split('/').slice(0, 3).join('/');
    if (!acc[basePath]) {
      acc[basePath] = [];
    }
    acc[basePath].push(route);
    return acc;
  }, {});
  
  // Print all routes grouped by base path
  Object.keys(groupedRoutes).sort().forEach(basePath => {
    console.log(`\n${basePath}`);
    console.log('-'.repeat(basePath.length));
    
    groupedRoutes[basePath].forEach(route => {
      console.log(`  ${route.path}`);
      console.log(`    Methods: ${route.methods.join(', ')}`);
      if (route.middleware && route.middleware.length) {
        console.log(`    Middleware: ${route.middleware.join(', ')}`);
      }
    });
  });
  
  console.log('\n=== ROUTE STATISTICS ===');
  console.log(`Total routes: ${routes.length}`);
  
  // Count methods
  const methodCounts = routes.reduce((acc, route) => {
    route.methods.forEach(method => {
      acc[method] = (acc[method] || 0) + 1;
    });
    return acc;
  }, {});
  
  console.log('Methods breakdown:');
  Object.keys(methodCounts).forEach(method => {
    console.log(`  ${method}: ${methodCounts[method]}`);
  });
  
} catch (error) {
  console.error('Error analyzing routes:', error);
  
  // Fallback to a simpler route listing if express-list-endpoints fails
  console.log('\nFallback route listing:');
  if (app._router && app._router.stack) {
    const extractRoutes = (layer) => {
      if (layer.route) {
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods)
          .filter(method => layer.route.methods[method])
          .map(method => method.toUpperCase());
        console.log(`${path} [${methods.join(', ')}]`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        console.log(`\nRouter: ${layer.regexp}`);
        layer.handle.stack.forEach(extractRoutes);
      }
    };
    
    app._router.stack.forEach(extractRoutes);
  } else {
    console.log('Unable to extract routes from the Express application.');
  }
}

console.log('\nTo use: Run this file with Node.js:');
console.log('  npm install express-list-endpoints --save-dev  # Install required dependency');
console.log('  node scripts/route-debugger.js                 # Run the debugger');

