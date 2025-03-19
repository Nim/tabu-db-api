const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../../config/swagger');

// Import and mount all routes from /routes/api directory first
const routesPath = path.join(__dirname, '..', 'api');
const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

routeFiles.forEach(file => {
  const moduleName = file.replace('.js', '');
  const routeModule = require(path.join(routesPath, file));
  router.use(`/${moduleName}`, routeModule);
});

// Swagger UI setup
router.use('/swagger', swaggerUi.serve);
router.get('/swagger/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
router.get('/swagger/', swaggerUi.setup(swaggerSpec, { explorer: true }));
router.get('/swagger', (req, res) => {
  res.redirect(301, '/swagger/');
});

// Table-related routes - available in test environment
const { tableNameValidator } = require('../../middleware/validation');
const {
  getTables,
  getTableData,
  getTableFields,
  getTableSchema,
  getTableRowCount,
  getTableTimeSeries,
  getTableDataAsCsv,
  getTableDataPreview,
} = require('../../controllers/tableController');

// Mount table routes at the base path
router.get('/tables', getTables);
router.get('/:tableName/fields', tableNameValidator, getTableFields);
router.get('/:tableName/schema', tableNameValidator, getTableSchema);
router.get('/:tableName/count', tableNameValidator, getTableRowCount);
router.get('/:tableName/preview', tableNameValidator, getTableDataPreview);
router.get('/:tableName/timeseries', tableNameValidator, getTableTimeSeries);
router.get('/:tableName/csv', tableNameValidator, getTableDataAsCsv);
router.get('/:tableName', tableNameValidator, getTableData);

console.log('Test routes enabled - including Swagger UI, API routes, and table routes');

module.exports = router;
