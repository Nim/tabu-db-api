const {BigQuery} = require('@google-cloud/bigquery');

// Initialize BigQuery client with authentication
const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const shemaName = process.env.DB_SHEMA || 'app_demo';

async function queryBigQuery(tableName) {
  const query = tableName === 'user'
    ? `SELECT * EXCEPT (password_hash) FROM \`${shemaName}.${tableName}\` LIMIT 10`
    : `SELECT * FROM \`${shemaName}.${tableName}\` LIMIT 10`;
  const options = {
    query: query,
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (err) {
    console.error('ERROR:', err);
    throw err;
  }
}

async function listTables() {
  const [tables] = await bigquery.dataset('app_demo').getTables();
  return tables.map(table => table.id);
}

module.exports = {
  queryBigQuery,
  listTables,
};
