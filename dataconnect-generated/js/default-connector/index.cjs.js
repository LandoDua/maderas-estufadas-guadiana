const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'maderas-estufadas-del-guadiana',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

