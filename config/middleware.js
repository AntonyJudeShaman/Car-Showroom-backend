const passport = require('passport');
const { error } = require('winston');

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      // console.error(err.message);
      return next();
    }
    if (!user) {
      console.error('Unauthorized');
      res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authMiddleware;
