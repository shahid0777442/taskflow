const express = require('express');
const path = require('path');
const client = require('prom-client');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

client.collectDefaultMetrics({ prefix: 'taskflow_' });

const httpRequests = new client.Counter({
  name: 'taskflow_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
const httpDuration = new client.Histogram({
  name: 'taskflow_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const app = express();
app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : 'unmatched';
    httpRequests.inc({ method: req.method, route, status: res.statusCode });
    end({ method: req.method, route });
  });
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app;
