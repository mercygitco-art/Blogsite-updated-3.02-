const crypto = require('crypto');

const writeLog = (level, event, fields = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields
  };
  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else console.log(output);
};

const requestLogger = (req, res, next) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => writeLog('info', 'http_request', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    status: res.statusCode,
    durationMs: Date.now() - startedAt
  }));
  next();
};

module.exports = { requestLogger, writeLog };
