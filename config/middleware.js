const passport = require('passport');
const logger = require('./winston');

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      // console.error(err.message);
      logger.error(`[authMiddleware] ${err.message}`);
      return next();
    }
    if (!user) {
      logger.error(`[authMiddleware] Unauthorized: ${req.url} ${req.method} `);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    logger.info(
      `[authMiddleware] User authenticated:  ${user.username}-${user.email} ${req.url} ${req.ip}`,
    );
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authMiddleware;
