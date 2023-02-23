const process = require('process');
const cp = require('child_process');
const path = require('path');
const { default: Ajv } = require('ajv');
const fs = require('fs');
const ajv = new Ajv();
const glob = require('glob');
const index = require('./index');

// shows how the runner will run a javascript action with env / stdout protocol
test('Test runs and validates', async () => {
  process.env['INPUT_MILLISECONDS'] = 100;
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);

  // Get a file matching ".spdx.json" and validate it against the SPDX 2.3 schema.
  var output = null;
  glob.sync("*.spdx.json").forEach(function(file) {
    output = JSON.parse(fs.readFileSync(file));
  });

  var spdxSchema = {};
  console.log(__dirname);
  spdxSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, './schemas/spdx2.3.json')));

  
  const validationResult = ajv.validate(spdxSchema, output);
  if (!validationResult) {
    console.log(ajv.errors);
  }
  expect(validationResult).toEqual(true);
})
