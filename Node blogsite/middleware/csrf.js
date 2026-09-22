const crypto = require('crypto');

const tokenCookie = 'csrf_token';

const issueCsrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(tokenCookie, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000
  });
  res.json({ success: true, token });
};

const requireCsrf = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  const cookieToken = req.cookies?.[tokenCookie];
  const headerToken = req.get('x-csrf-token');
  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length ||
      !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    return res.status(403).json({ success: false, message: 'CSRF validation failed' });
  }
  next();
};

module.exports = { issueCsrfToken, requireCsrf };
