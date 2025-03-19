const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../../middleware/cache');
const config = require('../../config/config');
const { validate, param, query } = require('../../validators');
const { listTables, queryBigQuery } = require('../../models/bigQuery');
const responseTables = require('../../dto/tables');
const responseBigQuery = require('../../dto/bigQuery');
const { NotFoundError } = require('../../errors/customErrors');

router.get('/', cacheMiddleware('tables', config.cache.durations.TABLES), async (req, res, next) => {
  try {
    const tables = await listTables();
    res.json(responseTables(true, 'tables', 'listTables', tables));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
