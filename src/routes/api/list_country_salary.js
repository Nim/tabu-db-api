const express = require('express');
const router = express.Router();
const { NotFoundError } = require('../../errors/customErrors');
const { validateListCountrySalary } = require('../../validators');
const { responseListCountrySalaryData } = require('../../dto/list_country_salary');
const { queryListCountrySalaryByUniqueId } = require('../../models/list_country_salary');


router.post('/check', validateListCountrySalary, async (req, res, next) => {
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

module.exports = router;

