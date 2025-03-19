const config = require('../config/config');
const {DatabaseError} = require('../errors/customErrors');
const bigQueryService = require('../services/bigQueryService').getInstance();

const schemaName = config.database.schema;

async function queryBenefitHealthTable() {
  const query = `SELECT * FROM \`${schemaName}.benefit_health\` LIMIT 10`;
  const options = {
    query: query,
  };

try {
const bigQueryInstance = BigQueryService.getInstance();
const [rows] = await bigQueryInstance.query(options);
return rows;
} catch (err) {
console.error('ERROR:', err);
throw new DatabaseError('Failed to query benefit health table', err);
}
}

module.exports = {
  queryBenefitHealthTable,
};
