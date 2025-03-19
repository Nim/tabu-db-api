const config = require('../config/config');
const {BigQuery} = require('@google-cloud/bigquery');
const {DatabaseError, NotFoundError} = require('../errors/customErrors');

// Initialize BigQuery client with authentication
const bigquery = new BigQuery({
  keyFilename: config.database.credentialsPath,
});
const schemaName = config.database.schema;

console.log('Submission Model - Schema Name:', schemaName);

async function querySubmissionByUniqueId(unique_id) {
  console.log('querySubmissionByUniqueId - Starting query for unique_id:', unique_id);
  
  const query = `
    SELECT
    position_group,
    position,
    seniority,
    tech,
    contract_type,
    country_salary
    FROM
    \`${schemaName}.submission\`
    WHERE
    unique_id = @unique_id
    LIMIT 1
  `;
  const options = {
    query: query,
    params: {unique_id: unique_id},
  };

  console.log('Query to execute:', query);
  console.log('Query options:', JSON.stringify(options, null, 2));

  try {
    console.log('Executing BigQuery query...');
    const [rows] = await bigquery.query(options);
    console.log('Query results:', JSON.stringify(rows, null, 2));
    
    if (!rows || rows.length === 0) {
      console.log('No results found for unique_id:', unique_id);
      return null;
    }
    
    return rows[0];
  } catch (err) {
    console.error('ERROR details:', {
      message: err.message,
      stack: err.stack,
      details: err.details,
      unique_id: unique_id,
      schema: schemaName
    });
    throw new NotFoundError(
      `Failed to query submission with unique_id: ${unique_id}`,
      err
    );
  }
}

async function querySubmissionTable() {
  console.log('querySubmissionTable - Starting query');
  
  const query = `SELECT * FROM \`${schemaName}.submission\` LIMIT 10`;
  const options = {
    query: query,
  };

  console.log('Query to execute:', query);
  console.log('Query options:', JSON.stringify(options, null, 2));

  try {
    console.log('Executing BigQuery query...');
    const [rows] = await bigquery.query(options);
    console.log('Query results count:', rows.length);
    return rows;
  } catch (err) {
    console.error('ERROR details:', {
      message: err.message,
      stack: err.stack,
      details: err.details,
      schema: schemaName
    });
    throw new DatabaseError('Failed to query submission table', err);
  }
}

module.exports = {
  querySubmissionByUniqueId,
  querySubmissionTable,
};
