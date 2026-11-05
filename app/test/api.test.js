const { test } = require('node:test');
const assert = require('node:assert');

process.env.JWT_SECRET = 'test-secret';
const app = require('../src/app');

test('TaskFlow API basic checks', async () => {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${base}/health`);
  assert.strictEqual(health.status, 200);
  assert.strictEqual((await health.json()).status, 'ok');

  const metrics = await fetch(`${base}/metrics`);
  assert.strictEqual(metrics.status, 200);
  assert.ok((await metrics.text()).includes('taskflow_'));

  const unauth = await fetch(`${base}/api/tasks`);
  assert.strictEqual(unauth.status, 401);

  server.close();
});
