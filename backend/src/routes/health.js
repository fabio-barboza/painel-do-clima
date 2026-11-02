const express = require('express');

const HEALTH_STATUS_OK = 200;

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(HEALTH_STATUS_OK).json({
    status: 'OK',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
