const config = require('../config/config');
const {DatabaseError} = require('../errors/customErrors');
const bigQueryService = require('../services/bigQueryService').getInstance();

const schemaName = config.database.schema;

async function queryStudentTable() {
  const query = `SELECT * FROM \`${schemaName}.student\` LIMIT 10`;
  const options = {
    query: query,
  };

try {
const bigQueryService = BigQueryService.getInstance();
const [rows] = await bigQueryService.query(options);
return rows;
} catch (err) {
    console.error('ERROR:', err);
    throw new DatabaseError('Failed to query student table', err);
}
}

module.exports = {
  queryStudentTable,
};
