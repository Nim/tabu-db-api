const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Import controllers - consolidated all imports
const { validateTableName, tableNameValidator } = require('../../middleware/validation');
const {
  getTableData,
  getTableDataPreview,
  getTableTimeSeries,
  getTableDataAsCsv,
  getAvailableTables,
  getTableSchema,
  getTableRowCount,
  getTables,
  getTableFields
} = require('../../controllers/tableController');

// Import and mount all routes from /routes/api directory first
const routesPath = path.join(__dirname, '..', 'api');
const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

routeFiles.forEach(file => {
  const moduleName = file.replace('.js', '');
  const routeModule = require(path.join(routesPath, file));
  router.use(`/${moduleName}`, routeModule);
  console.log(`Mounted API route: /${moduleName}`);
});

// Direct route for tables - this will override any route from above
router.get('/tables', getAvailableTables);

// Add a specific route for list_contract_type
router.get('/list_contract_type', (req, res, next) => {
  console.log('Direct list_contract_type route called');
  // Set tableName parameter manually
  req.params.tableName = 'list_contract_type';
  getTableData(req, res, next);
});

// Table-related routes - available in development environment
router.get('/:tableName/fields', tableNameValidator, getTableFields);
router.get('/:tableName/schema', tableNameValidator, getTableSchema);
router.get('/:tableName/count', tableNameValidator, getTableRowCount);
router.get('/:tableName/preview', tableNameValidator, getTableDataPreview);
router.get('/:tableName/timeseries', tableNameValidator, getTableTimeSeries);
router.get('/:tableName/csv', tableNameValidator, getTableDataAsCsv);
router.get('/:tableName', tableNameValidator, getTableData);

console.log('Development routes enabled - API routes and table routes');

module.exports = router;
