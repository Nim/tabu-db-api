const express = require('express');
const apiLimiter = require('../middleware/rateLimiter');
const router = express.Router();
const cors = require('../middleware/cors');
const errorHandler = require('../middleware/errorHandler');
const { NotFoundError } = require('../errors/customErrors');
const { cacheMiddleware } = require('../middleware/cache');
const config = require('../config/config');
const { queryUserTable, queryUserByEmail } = require('../models/user');
const { querySubmissionByUniqueId } = require('../models/submission');
const { queryAdditionalPositionByUniqueId } = require('../models/additional_position');
const { listTables, queryBigQuery } = require('../models/bigQuery');
const responseTables = require('../dto/tables');
const responseBigQuery = require('../dto/bigQuery');
const { responseUser, responseCheckUser } = require('../dto/user');
const { responseSubmissionData } = require('../dto/submission');
const { responseAdditionalPositionData } = require('../dto/additional_position');
const { querySalaryByUniqueId } = require('../models/salary');
const { responseSalaryData } = require('../dto/salary');
const { queryListTechByUniqueId } = require('../models/list_tech');
const { queryListCountrySalaryByUniqueId } = require('../models/list_country_salary');
const { responseListTechData } = require('../dto/list_tech');
const { responseListCountrySalaryData } = require('../dto/list_country_salary');
const { responseListContractTypeData } = require('../dto/list_contract_type');
const { queryListContractTypeByUniqueId } = require('../models/list_contract_type');
const { responseDataAmountData } = require('../dto/data_amount');
const { queryDataAmountByUniqueId } = require('../models/data_amount');
const securityHeaders = require('../middleware/securityHeaders');
const bigQueryConnectionPool = require('../middleware/bigQueryConnectionPool');
const {
  validateUser,
  validateUserCheck,
  validateAdditionalPosition,
  validateSalary,
  validateSubmission,
  validateListTech,
  validateListCountrySalary,
  validateListContractType,
  validateDataAmount,
  validate,
  param,
  query
} = require('../validators');
const CacheMonitor = require('../middleware/cacheMonitor');

router.use(cors);
router.use(apiLimiter);
router.use(securityHeaders);
router.use(bigQueryConnectionPool);

router.get('/tables', cacheMiddleware('tables', config.cache.durations.TABLES), async (req, res, next) => {
  try {
    const tables = await listTables();
    res.json(responseTables(true, 'tables', 'listTables', tables));
  } catch (err) {
    next(err);
  }
});

router.get('/user', cacheMiddleware('user', config.cache.durations.USER), async (req, res, next) => {
  try {
    const rows = await queryUserTable();
    res.json(responseUser(true, 'user', 'queryUserTable', rows));
  } catch (err) {
    next(err);
  }
});

router.post('/user/check', validateUserCheck, async (req, res, next) => {
  const { email, isGoogleLogin, name } = req.body;
  try {
    const row = await queryUserByEmail(email);
    if (row) {
      if (isGoogleLogin) {
        res.json(responseCheckUser(true, 'User email exists', true, 'queryUserByEmail', null, name, row.unique_id));
      } else {
        res.json(responseCheckUser(true, 'User email does not exist', false, 'queryUserByEmail'));
      }
    } else {
      res.json(responseCheckUser(true, 'User email does not exist', false, 'queryUserByEmail'));
    }
  } catch (err) {
    next(err);
  }
});

router.post('/submission/check', validateSubmission, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const row = await querySubmissionByUniqueId(unique_id);
    if (row) {
      res.json(responseSubmissionData(true, 'Submission data exists', true, 'querySubmissionByUniqueId', null, row));
    } else {
      throw new NotFoundError('Submission data not found for the provided unique_id');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/additional_position/check', validateAdditionalPosition, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const row = await queryAdditionalPositionByUniqueId(unique_id);
    if (row) {
      res.json(responseAdditionalPositionData(true, 'Additional position data exists', true, 'queryAdditionalPositionByUniqueId', null, row.additional_position_group, row.additional_position));
    } else {
      throw new NotFoundError('Additional position data not found for the provided unique_id');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/salary/check', validateSalary, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const row = await querySalaryByUniqueId(unique_id);
    if (row) {
      res.json(responseSalaryData(true, 'Salary data exists', true, 'querySalaryByUniqueId', null, row.salary_net, row.salary_gross));
    } else {
      throw new NotFoundError('Salary data not found for the provided unique_id');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/list_tech/check', validateListTech, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const rows = await queryListTechByUniqueId(unique_id);
    if (rows.length > 0) {
      res.json(responseListTechData(true, 'List tech data exists', true, 'queryListTechByUniqueId', null, rows));
    } else {
      throw new NotFoundError('List tech data not found for the provided unique_id');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/list_country_salary/check', validateListCountrySalary, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const rows = await queryListCountrySalaryByUniqueId(unique_id);
    if (rows.length > 0) {
      res.json(responseListCountrySalaryData(true, 'List country salary data exists', true, 'queryListCountrySalaryByUniqueId', null, rows));
    } else {
      throw new NotFoundError('List country salary data not found for the provided unique_id');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/list_contract_type/check', validateListContractType, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const rows = await queryListContractTypeByUniqueId(unique_id);
    if (rows.length > 0) {
      res.json(responseListContractTypeData(true, 'List Contract type data exists', true, 'queryListContractTypeByUniqueId', null, rows));
    } else {
      throw new NotFoundError('List Contract type data not found for the provided unique_id');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/data_amount/check', validateDataAmount, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const row = await queryDataAmountByUniqueId(unique_id);
    if (row) {
      res.json(responseDataAmountData(true, 'Data amount exists', true, 'queryDataAmountByUniqueId', null, row.amount));
    } else {
      throw new NotFoundError('Data amount not found for the provided unique_id');
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:tableName', validate([
  param('tableName').isString().notEmpty().withMessage('Table name must be provided'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be a positive integer between 1 and 1000'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
]), async (req, res, next) => {
  const { tableName } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : config.pagination.limit;
  const offset = req.query.offset ? parseInt(req.query.offset, 10) : config.pagination.offset;
  
  try {
    const result = await queryBigQuery(tableName, limit, offset);
    const response = {
      data: result.data,
      pagination: result.pagination
    };
    res.json(responseBigQuery(true, tableName, 'queryBigQuery', response));
  } catch (err) {
    next(err);
  }
});

router.get('/system/cache-stats', async (req, res, next) => {
  try {
    const stats = await CacheMonitor.getStats();
    res.json({
      success: true,
      response: {
        message: 'Cache statistics retrieved successfully',
        stats
      },
      action: 'getCacheStats',
      error: null
    });
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
