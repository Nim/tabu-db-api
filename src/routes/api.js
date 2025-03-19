const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { validateTableName } = require('../middleware/validation');
const {
  getTables,
  getTableData,
  getTableFields,
  getTableSchema,
  getTableRowCount,
  getTableTimeSeries,
  getTableDataAsCsv,
  getTableDataPreview,
} = require('../controllers/tableController');

const isProduction = process.env.NODE_ENV === 'production';


// Import all routes from /routes/api directory
const routesPath = path.join(__dirname, 'api');
const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

// Register all route modules with proper namespacing
routeFiles.forEach(file => {
  const moduleName = file.replace('.js', '');
  const routeModule = require(path.join(routesPath, file));
  router.use(`/${moduleName}`, routeModule);
});

// Error handling middleware for API routes
router.use((err, req, res, next) => {
  console.error('API Route Error:', err);
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: {
      status: statusCode,
      details: isProduction ? null : err.stack
    }
  });
});

// Table routes moved to environment-specific files (development.js and test.js)

module.exports = router;
