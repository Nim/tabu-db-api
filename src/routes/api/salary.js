const express = require('express');
const apiLimiter = require('../../middleware/rateLimiter');
const router = express.Router();
const cors = require('../../middleware/cors');
const errorHandler = require('../../middleware/errorHandler');
const { NotFoundError } = require('../../errors/customErrors');
const securityHeaders = require('../../middleware/securityHeaders');
const bigQueryConnectionPool = require('../../middleware/bigQueryConnectionPool');
const { validateSalary } = require('../../validators');

// Import required services
const salaryService = require('../../services/salaryService');

// Import required DTOs
const { responseSalaryData } = require('../../dto/salary');

// Apply middleware
router.use(cors);
router.use(apiLimiter);
router.use(securityHeaders);
router.use(bigQueryConnectionPool);

router.post('/check', validateSalary, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const result = await salaryService.getSalaryByUniqueId(unique_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;
