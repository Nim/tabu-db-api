const express = require('express');
const router = express.Router();
const errorHandler = require('../../middleware/errorHandler');
const CacheMonitor = require('../../middleware/cacheMonitor');

router.get('/cache-stats', async (req, res, next) => {
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

