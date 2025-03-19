const { BigQuery } = require('@google-cloud/bigquery');

// Connection pool configuration
const MAX_POOL_SIZE = 10;
const MIN_POOL_SIZE = 2;
const ACQUIRE_TIMEOUT_MS = 30000; // 30 seconds

/**
 * BigQuery Connection Pool implementation
 */
class BigQueryConnectionPool {
  constructor() {
    this.connections = [];
    this.waitingQueue = [];
    this.maxSize = MAX_POOL_SIZE;
    this.minSize = MIN_POOL_SIZE;
    this.activeConnections = 0;
    
    // Initialize the pool with minimum connections
    this.initPool();
  }

  /**
   * Initialize the connection pool with minimum number of connections
   */
  initPool() {
    for (let i = 0; i < this.minSize; i++) {
      this.connections.push(this.createNewConnection());
    }
    console.log(`BigQuery connection pool initialized with ${this.minSize} connections`);
  }

  /**
   * Create a new BigQuery client connection
   * @returns {BigQuery} A new BigQuery client
   */
  createNewConnection() {
    return new BigQuery();
  }

  /**
   * Acquire a connection from the pool
   * @returns {Promise<BigQuery>} A BigQuery client from the pool
   */
  async acquire() {
    // If there are available connections, use one
    if (this.connections.length > 0) {
      this.activeConnections++;
      return Promise.resolve(this.connections.pop());
    }

    // If we can create new connections, do so
    if (this.activeConnections < this.maxSize) {
      this.activeConnections++;
      return Promise.resolve(this.createNewConnection());
    }

    // Otherwise, wait for a connection to be released
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Remove from waiting queue
        this.waitingQueue = this.waitingQueue.filter(callback => callback !== resolver);
        reject(new Error('Timed out waiting for connection'));
      }, ACQUIRE_TIMEOUT_MS);

      const resolver = (connection) => {
        clearTimeout(timeout);
        resolve(connection);
      };

      this.waitingQueue.push(resolver);
    });
  }

  /**
   * Release a connection back to the pool
   * @param {BigQuery} connection - The connection to release
   */
  release(connection) {
    // If there are clients waiting for connections, give it directly to them
    if (this.waitingQueue.length > 0) {
      const callback = this.waitingQueue.shift();
      callback(connection);
      return;
    }

    // Otherwise put it back in the pool
    this.connections.push(connection);
    this.activeConnections--;
  }

  /**
   * Execute a query using a connection from the pool
   * @param {string} query - The SQL query to execute
   * @returns {Promise<Array>} - The query results
   */
  async query(query) {
    const connection = await this.acquire();
    try {
      const [rows] = await connection.query(query);
      return rows;
    } finally {
      this.release(connection);
    }
  }

  /**
   * Shut down the connection pool
   */
  async shutdown() {
    console.log('Shutting down BigQuery connection pool');
    // Currently BigQuery doesn't have a specific close/end method
    // But we reset the pool
    this.connections = [];
    this.waitingQueue = [];
    this.activeConnections = 0;
  }
}

// Create a singleton instance of the connection pool
const pool = new BigQueryConnectionPool();

// Handle process termination to clean up resources
process.on('SIGINT', async () => {
  await pool.shutdown();
  process.exit(0);
});

/**
 * Middleware function to provide access to the BigQuery connection pool
 */
const bigQueryConnectionPool = (req, res, next) => {
  req.bigQueryPool = pool;
  next();
};

module.exports = bigQueryConnectionPool;
module.exports.pool = pool; // Export the pool for direct use in services
