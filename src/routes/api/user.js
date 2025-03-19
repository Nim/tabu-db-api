const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../../middleware/cache');
const config = require('../../config/config');
const { queryUserTable, queryUserByEmail } = require('../../models/user');
const { responseUser, responseCheckUser } = require('../../dto/user');
const { validateUserCheck } = require('../../validators');


router.get('/', cacheMiddleware('user', config.cache.durations.USER), async (req, res, next) => {
  try {
    const rows = await queryUserTable();
    res.json(responseUser(true, 'user', 'queryUserTable', rows));
  } catch (err) {
    next(err);
  }
});


router.post('/check', validateUserCheck, async (req, res, next) => {
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

module.exports = router;

