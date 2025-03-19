const express = require('express');
const router = express.Router();
const { NotFoundError } = require('../../errors/customErrors');
const { queryListTechByUniqueId } = require('../../models/list_tech');
const { responseListTechData } = require('../../dto/list_tech');
const { validateListTech } = require('../../validators');


router.post('/check', validateListTech, async (req, res, next) => {
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

module.exports = router;

