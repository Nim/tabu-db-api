const express = require('express');
const router = express.Router();
const { NotFoundError } = require('../../errors/customErrors');
const { extractToken, authenticateToken } = require('../../middleware/auth');
const { queryListContractTypeByUniqueId } = require('../../models/list_contract_type');
const { responseListContractTypeData } = require('../../dto/list_contract_type');
const { validateListContractType, validate } = require('../../validators');

router.post('/check', extractToken, authenticateToken, validate(validateListContractType), async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const rows = await queryListContractTypeByUniqueId(unique_id);
    if (rows.length > 0) {
      res.json(responseListContractTypeData(true, 'List Contract type data exists', true, 'queryListContractTypeByUniqueId', null, rows));
    } else {
      throw new NotFoundError('List Contract type data not found for the provided unique_id');
    }
  } catch (err) {
    console.error(`[Development] Error processing request: ${err.message}`);
    next(err);
  }
});

module.exports = router;
