const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware');
const { NotFoundError } = require('./errors/customErrors');

function createApp() {
  const app = express();
  const env = process.env.NODE_ENV || 'development';

  app.use(cors());
  app.use(express.json());

  // Add test endpoint first
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Load configuration
  const config = require('./config/config');

  // Setup Swagger UI at root level only in non-production environments
  if (!config.server.isProduction) {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./config/swagger');
    
    app.use('/swagger', swaggerUi.serve);
    app.get('/swagger/json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    app.get('/swagger/', swaggerUi.setup(swaggerSpec, { explorer: true }));
    app.get('/swagger', (req, res) => {
      res.redirect(301, '/swagger/');
    });
        
    console.log('Swagger UI enabled - available at /swagger');
  } else {
    // In production, return 404 for all Swagger routes
    app.all(['/swagger', '/swagger/*'], (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API documentation not available in production',
        exists: false,
        action: req.method,
        type: 'ERROR',
        error: {
          status: 404,
          message: 'API documentation not available in production'
        }
      });
    });
  }

  const apiRoute = config.server.apiRoute;
    
  const envRouter = require(`./routes/environments/${env}`);
  app.use(apiRoute, envRouter);

  // Middleware to log request URL and parameters
  if (process.env.LOG_REQUESTS === 'true') {
    app.use((req, res, next) => {
      const currentDate = new Date().toISOString();
      console.log(`[${currentDate}] Request URL: ${req.url}`);
      console.log(`[${currentDate}] Request Parameters: ${JSON.stringify(req.params)}`);
      next();
    });
  }

  // 404 handler for routes that don't exist
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
  });

  // Error handler middleware (should be last)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
