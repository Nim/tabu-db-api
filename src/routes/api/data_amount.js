const express = require('express');
const router = express.Router();
const { validateDataAmount, validateDataAmountWithFilters } = require('../../validators');
const dataAmountService = require('../../services/dataAmountService');

// Check endpoint for data amount by unique_id
router.post('/check', validateDataAmount, async (req, res, next) => {
  try {
    const { unique_id } = req.body;
    const result = await dataAmountService.getDataAmountByUniqueId(unique_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Filter endpoint for data amount with parameters
router.post('/filter', validateDataAmountWithFilters, async (req, res, next) => {
  try {
    const filters = {
      parameter_position_group: req.body.parameter_position_group,
      parameter_position: req.body.parameter_position,
      parameter_seniority: req.body.parameter_seniority,
      parameter_country_salary: req.body.parameter_country_salary,
      parameter_contract_type: req.body.parameter_contract_type,
      parameter_tech: req.body.parameter_tech
    };
    
    const result = await dataAmountService.getDataAmountWithFilters(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
