const wait = require('./wait');
const process = require('process');
const cp = require('child_process');
const path = require('path');
const { default: Ajv } = require('ajv');
const fs = require('fs');
const ajv = new Ajv();

test('throws invalid number', async () => {
  await expect(wait('foo')).rejects.toThrow('milliseconds not a number');
});

test('wait 500 ms', async () => {
  const start = new Date();
  await wait(500);
  const end = new Date();
  var delta = Math.abs(end - start);
  expect(delta).toBeGreaterThanOrEqual(500);
});

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs and validates', async () => {
  process.env['INPUT_MILLISECONDS'] = 100;
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
  
  var spdxSchema = {};
  console.log(__dirname);
  await fs.readFile(path.resolve(__dirname, './schemas/spdx2.3.json'), (err, data) => {
    if (err) {
      console.log(`Error reading file from disk: ${err}`);
    } else {
      spdxSchema = JSON.parse(data);
    }
  });
  const validate = ajv.compile(spdxSchema);
  expect(validate(result)).toEqual(true);
})
