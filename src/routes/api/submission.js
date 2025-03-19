const express = require('express');
const router = express.Router();
const { NotFoundError, ValidationError } = require('../../errors/customErrors');
const submissionService = require('../../services/submissionService');
const { responseSubmissionData } = require('../../dto/submission');
const { validateSubmission } = require('../../validators');


router.post('/check', validateSubmission, async (req, res, next) => {
  const { unique_id } = req.body;
  try {
    const result = await submissionService.getSubmissionByUniqueId(unique_id);
    
    if (!result.success) {
      const error = result.error === 'VALIDATION_ERROR'
        ? new ValidationError(result.response.message)
        : new NotFoundError(result.response.message);
      throw error;
    }

    // Success response - use DTO to format the response
    res.json(responseSubmissionData(
      result.success,
      result.response.message,
      result.response.exists,
      result.action,
      null,
      {
        position_group: result.response.position_group,
        position: result.response.position,
        seniority: result.response.seniority,
        tech: result.response.tech,
        contract_type: result.response.contract_type,
        country_salary: result.response.country_salary
      }
    ));
  } catch (err) {
    next(err);
  }
});

module.exports = router;

