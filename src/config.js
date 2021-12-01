const fs = require('fs');
const path = require('path');

const nodeRoot = path.dirname(require.main.filename);
const configPath = path.join(nodeRoot, '../config.json');

config = require('read-config-ng')(configPath);
module.exports = config;